import type { Pet } from "../../../types";
import type { Dispatch, SetStateAction } from "react";
import { buildApiUrl } from "../../../config/api";

interface FileUploadProps {
  pet: Pet;
  setPet: Dispatch<SetStateAction<Pet | null>>;
}


export default function FileUpload({ pet, setPet }: FileUploadProps) {
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    try {
      const res = await fetch(buildApiUrl(`/pets/${pet.id}/medical-file`), {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.filename) {
        // Update the pet in the global pets array

        // Update the selected pet
        setPet(prev => (prev ? { ...prev, medicalFiles: [...(prev.medicalFiles || []), data.filename] } : prev));
      }
    } catch (error) {
      console.error(error);
    } finally {
      e.target.value = "";
    }
  };

  return (
    <>
      <label
        htmlFor="file-upload"
        className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition cursor-pointer flex items-center justify-center gap-2"
      >
        <span aria-hidden="true" className="inline-flex text-white shrink-0">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <path d="M12 11v6" />
            <path d="M9 14h6" />
          </svg>
        </span>
        <span>Add more medical files</span>
      </label>
      <input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} />
    </>
  );
}
