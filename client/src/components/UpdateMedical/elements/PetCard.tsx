import type { Pet } from "../../../types";
import { API_BASE_URL } from "../../../config/api";

interface PetCardProps {
  pet: Pet;
  selected?: boolean;
  onClick: () => void;
}

export default function PetCard({ pet, selected = false, onClick }: PetCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex-none w-[220px] h-[110px] bg-accent rounded-xl border p-3 flex items-center gap-3 text-left transition-all duration-200 hover:shadow-md ${
        selected ? "border-primary-dark shadow-[0_0_0_2px_rgba(68,69,84,0.2)]" : "border-primary-dark/15"
      }`}
    >
      <div className="w-20 h-20 overflow-hidden rounded-lg bg-background/70 flex items-center justify-center shrink-0">
        {pet.image ? (
          <img
            src={pet.image.startsWith("http") ? pet.image : `${API_BASE_URL}/uploads/${pet.image}`}
            alt={pet.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xs text-rosy-granite italic">No photo</span>
        )}
      </div>

      <div className="flex flex-col justify-center min-w-0">
        <h2 className="text-lg font-semibold text-primary-dark truncate">{pet.name}</h2>
      </div>
    </button>
  );
}
