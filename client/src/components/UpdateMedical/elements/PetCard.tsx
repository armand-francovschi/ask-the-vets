import type { Pet } from "../../../types";

interface PetCardProps {
  pet: Pet;
  selected?: boolean;
  onClick: () => void;
}

export default function PetCard({ pet, selected = false, onClick }: PetCardProps) {
  const imageUrl = pet.image ? `http://localhost:5000/uploads/${pet.image}` : undefined;

  return (
    <div
      onClick={onClick}
      className={`flex-none w-64 bg-primary-light rounded shadow p-4 flex flex-col gap-2 cursor-pointer hover:shadow-lg transition ${
        selected ? "ring-4 ring-accent" : ""
      }`}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={pet.name} className="w-full h-40 object-cover rounded mb-2" />
      ) : (
        <div className="w-full h-40 bg-gray-200 rounded mb-2 flex items-center justify-center text-gray-500">
          No Image
        </div>
      )}

      <h2 className="font-semibold text-primary-dark text-lg">{pet.name}</h2>
      <p className="text-gray-700">Type: {pet.type}</p>
      <p className="text-gray-700">Breed: {pet.breed}</p>
      <p className="text-gray-700">Age: {pet.age}</p>
    </div>
  );
}
