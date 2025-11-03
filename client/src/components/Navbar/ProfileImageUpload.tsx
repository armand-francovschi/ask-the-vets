import { useState} from "react";
import type { FC } from "react";
import { useAuth } from "../../context/AuthContext";

interface ProfileImageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileImageModal: FC<ProfileImageModalProps> = ({ isOpen, onClose }) => {
  const { user, setUser } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`http://localhost:5000/users/${user.id}/profile-image`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.filename) {
        setUser({ ...user, image: data.filename });
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 flex flex-col gap-4">
        <h2 className="text-xl font-bold text-primary-dark">Update Profile Picture</h2>
        {file && (
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            className="w-32 h-32 rounded-full object-cover mx-auto"
          />
        )}
        <input type="file" onChange={handleFileChange} className="border p-1 rounded" />
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className="px-4 py-2 bg-primary-dark text-white rounded hover:bg-primary"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileImageModal;
