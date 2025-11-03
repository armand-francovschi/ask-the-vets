import { useState } from "react";
import type { Pet } from "../../../types";

interface UpdatePetModalProps {
  pet: Pet;
  onClose: () => void;
  onSubmit: (updatedPet: Pet) => void;
  title: string;
}

export default function UpdatePetModal({ pet, onClose, onSubmit, title }: UpdatePetModalProps) {
  const [localPet, setLocalPet] = useState<Pet>({ ...pet });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.name === "age" ? Number(e.target.value) : e.target.value;
    setLocalPet({ ...localPet, [e.target.name]: value });
  };

  const handleSubmit = () => {
    onSubmit(localPet);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-primary-dark mb-4">{title}</h2>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            name="name"
            placeholder="Pet Name"
            value={localPet.name}
            onChange={handleChange}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-light"
          />
          <select
            name="type"
            value={localPet.type}
            onChange={handleChange}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-light"
          >
            <option value="">Select Type</option>
            <option value="Cat">Cat</option>
            <option value="Dog">Dog</option>
            <option value="Bird">Bird</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="text"
            name="breed"
            placeholder="Breed"
            value={localPet.breed}
            onChange={handleChange}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-light"
          />
          <input
            type="number"
            name="age"
            placeholder="Age"
            value={localPet.age || ""}
            onChange={handleChange}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary-light"
          />
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-accent text-primary-dark font-semibold hover:bg-accent-dark transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-primary text-white font-semibold hover:bg-primary-dark transition"
          >
            {title.includes("Add") ? "Add Pet" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
