import type { Pet } from "../../../types";
import type { Dispatch, SetStateAction } from "react";

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
      const res = await fetch(`http://localhost:5000/pets/${pet.id}/medical-file`, {
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
        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition cursor-pointer text-center"
      >
        Add more medical files
      </label>
      <input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} />
    </>
  );
}
