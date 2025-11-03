import { useRef } from "react";
import type { Pet } from "../../../types";
import PetCard from "./PetCard";

interface PetCarouselProps {
  pets: Pet[];
  selectedPet: Pet | null;
  onSelectPet: (pet: Pet) => void;
  onAddPet: () => void;
}

export default function PetCarousel({ pets, selectedPet, onSelectPet, onAddPet }: PetCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const scrollAmount = 300;
    carouselRef.current.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <button onClick={() => scroll("left")} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-primary text-white p-2 rounded-full hover:bg-primary-dark transition">◀</button>
      <div ref={carouselRef} className="flex gap-4 overflow-x-auto scroll-smooth pb-4">
        {pets.map(pet => (
          <PetCard key={pet.id} pet={pet} selected={selectedPet?.id === pet.id} onClick={() => onSelectPet(pet)} />
        ))}
        <button onClick={onAddPet} className="flex-none w-64 h-40 flex items-center justify-center gap-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition">
          <span className="text-3xl">+</span> Add a New Pet
        </button>
      </div>
      <button onClick={() => scroll("right")} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-primary text-white p-2 rounded-full hover:bg-primary-dark transition">▶</button>
    </div>
  );
}
