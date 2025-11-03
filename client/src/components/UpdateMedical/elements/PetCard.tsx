import type { Pet } from "../../../types";

interface PetCardProps {
  pet: Pet;
  selected?: boolean;
  onClick: () => void;
}

export default function PetCard({ pet, selected = false, onClick }: PetCardProps) {
  return (
    <div
      onClick={onClick}
      className={`relative flex-none w-full sm:w-64 bg-primary-light rounded-2xl shadow-md p-4 flex flex-col gap-3 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
        selected ? "ring-4 ring-accent" : ""
      }`}
    >
      {/* Image */}
      <div className="w-full aspect-square overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
        {pet.image ? (
          <img
            src={pet.image.startsWith("http") ? pet.image : `http://localhost:5000/uploads/${pet.image}`}
            alt={pet.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <span className="text-gray-400 italic">No photo</span>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col flex-grow text-center sm:text-left">
        <h2 className="text-xl font-semibold text-primary-dark truncate">{pet.name}</h2>
        <p className="text-gray-700 text-sm"><strong>Type:</strong> {pet.type}</p>
        <p className="text-gray-700 text-sm"><strong>Breed:</strong> {pet.breed}</p>
        <p className="text-gray-700 text-sm"><strong>Age:</strong> {pet.age}</p>
      </div>
    </div>
  );
}
