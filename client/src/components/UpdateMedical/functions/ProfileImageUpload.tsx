import type { Pet } from "../../../types";
import type { Dispatch, SetStateAction } from "react";

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
        await fetch(`http://localhost:5000/uploads/${pet.image}`, {
          method: "DELETE",
        });
      }

      // Upload new image
      const res = await fetch(`http://localhost:5000/pets/${pet.id}/profile-image`, {
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
        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition cursor-pointer text-center"
      >
        Change Profile Picture
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
