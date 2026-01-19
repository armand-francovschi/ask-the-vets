import React, { useState, useEffect } from "react";
import { useUpdateMedical } from "../UpdateMedical/functions/useUpdateMedical";

interface MedicalFile {
  filename: string;
  reviewed: boolean;
  feedback: string | null;
  comments: string[];
}

const API_BASE = "http://localhost:5000";

const MedicalAnalysis: React.FC = () => {
  const { selectedPet } = useUpdateMedical();
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<MedicalFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Load files when selectedPet changes
  useEffect(() => {
    if (!selectedPet) return;

    const fetchFiles = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/analysis/files/${selectedPet.id}`);
        if (!res.ok) throw new Error("Failed to fetch files");

        const data: MedicalFile[] = await res.json();
        setFiles(data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchFiles();
  }, [selectedPet]);

  // Upload a new file
  const handleUpload = async () => {
    if (!file || !selectedPet) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/api/analysis/upload/${selectedPet.id}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const uploaded: MedicalFile = await res.json();

      // Add new file to list
      setFiles(prev => [...prev, uploaded]);
      setFile(null);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // Submit a comment
  const handleCommentSubmit = async (filename: string) => {
    const comment = commentInputs[filename];
    if (!selectedPet || !comment) return;

    try {
      const res = await fetch(`${API_BASE}/api/analysis/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ petId: selectedPet.id, filename, comment }),
      });

      if (!res.ok) throw new Error("Failed to submit comment");

      // Update local state
      setFiles(prev =>
        prev.map(f =>
          f.filename === filename ? { ...f, comments: [...f.comments, comment] } : f
        )
      );
      setCommentInputs(prev => ({ ...prev, [filename]: "" }));
    } catch (err) {
      console.error(err);
    }
  };

  // Delete a file
  const handleDelete = async (filename: string) => {
    if (!selectedPet) return;
    const confirmed = window.confirm(`Are you sure you want to delete "${filename}"?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE}/api/analysis/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ petId: selectedPet.id, filename }),
      });

      if (!res.ok) throw new Error("Failed to delete file");

      setFiles(prev => prev.filter(f => f.filename !== filename));
    } catch (err) {
      console.error(err);
    }
  };

  if (!selectedPet)
    return (
      <p className="p-4 text-yellow-800">
        Please select a pet first to upload a medical file.
      </p>
    );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Medical Analysis for {selectedPet.name}</h1>

      {/* Upload section */}
      <div className="mb-6 flex gap-2 items-center">
        <input
          type="file"
          onChange={e => setFile(e.target.files?.[0] ?? null)}
          className="border p-1"
        />
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {/* Files list */}
      <div className="flex flex-col gap-4">
        {files.length === 0 && <p>No files uploaded yet.</p>}

        {files.map(f => (
          <div
            key={f.filename}
            className="border p-4 rounded flex flex-col gap-2 bg-gray-50 relative"
          >
            {/* Delete button */}
            <button
              onClick={() => handleDelete(f.filename)}
              className="absolute top-2 right-2 text-red-600 font-bold hover:text-red-800"
              title="Delete file"
            >
              X
            </button>

            {/* Download button */}
            <a
              href={`${API_BASE}/uploads/${f.filename}`}
              className="text-blue-600 underline font-semibold"
              download
            >
              {f.filename}
            </a>

            {/* Review status and medic feedback */}
            <p>
              Status:{" "}
              <span className={f.reviewed ? "text-green-600" : "text-gray-600"}>
                {f.reviewed ? "Reviewed" : "Pending"}
              </span>
            </p>
            {f.feedback && (
              <p className="text-gray-800">
                Medic Feedback: <span className="italic">{f.feedback}</span>
              </p>
            )}

            {/* User comments */}
            <div className="flex flex-col gap-1">
              {f.comments.length > 0 && (
                <div>
                  <p className="font-semibold">Comments:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {f.comments.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Add new comment */}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={commentInputs[f.filename] || ""}
                  onChange={e =>
                    setCommentInputs(prev => ({ ...prev, [f.filename]: e.target.value }))
                  }
                  placeholder="Add a comment"
                  className="border p-1 flex-1"
                />
                <button
                  onClick={() => handleCommentSubmit(f.filename)}
                  className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicalAnalysis;
