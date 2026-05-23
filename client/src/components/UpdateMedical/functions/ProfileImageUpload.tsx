import type { Pet } from "../../../types";
import type { Dispatch, SetStateAction } from "react";
import { buildApiUrl } from "../../../config/api";

interface ProfileImageUploadProps {
  pet: Pet;
  setPet: Dispatch<SetStateAction<Pet | null>>;
}

export default function ProfileImageUpload({ pet, setPet }: ProfileImageUploadProps) {
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    try {
      // Delete old image if it exists
      if (pet.image) {
        await fetch(buildApiUrl(`/uploads/${pet.image}`), {
          method: "DELETE",
        });
      }

      // Upload new image
      const res = await fetch(buildApiUrl(`/pets/${pet.id}/profile-image`), {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.filename) {
        // Update pet locally
        setPet(prev => (prev ? { ...prev, image: data.filename } : prev));
      }
    } catch (err) {
      console.error(err);
    } finally {
      e.target.value = "";
    }
  };

  return (
    <>
      <label
        htmlFor="profile-upload"
        className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition cursor-pointer flex items-center justify-center gap-2"
      >
        <span aria-hidden="true" className="inline-flex text-white shrink-0">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 7h4l2-2h4l2 2h4v12H4z" />
            <circle cx="12" cy="13" r="3" />
          </svg>
        </span>
        <span>Change Profile Picture</span>
      </label>
      <input
        id="profile-upload"
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />
    </>
  );
}
