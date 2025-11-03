import { useState } from "react";
import type { Pet } from "../../../types";

interface RemovePetModalProps {
  pet: Pet;
  onClose: () => void;
  onConfirm: (petId?: number) => void;
}

export default function RemovePetModal({ pet, onClose, onConfirm }: RemovePetModalProps) {
  const [confirmName, setConfirmName] = useState("");

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-primary-dark mb-4">Confirm Remove Pet</h2>
        <p className="mb-4">
          To confirm, type <strong>{pet.name}</strong> below:
        </p>
        <input
          type="text"
          value={confirmName}
          onChange={(e) => setConfirmName(e.target.value)}
          className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-primary-light mb-4"
          placeholder="Enter pet name"
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={() => { setConfirmName(""); onClose(); }}
            className="px-4 py-2 rounded bg-accent text-primary-dark font-semibold hover:bg-accent-dark transition"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(pet.id); setConfirmName(""); }}
            disabled={confirmName !== pet.name}
            className="px-4 py-2 rounded bg-red-500 text-white font-semibold hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
