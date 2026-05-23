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
    <section className="rounded-2xl border border-primary-dark/15 bg-primary-light/30 shadow-sm px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-semibold text-primary-dark">Pet Overview</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous pets"
            onClick={() => scroll("left")}
            className="w-8 h-8 rounded-full border border-primary-dark/20 bg-background text-primary-dark hover:bg-accent transition"
          >
            &#8249;
          </button>
          <button
            type="button"
            aria-label="Next pets"
            onClick={() => scroll("right")}
            className="w-8 h-8 rounded-full border border-primary-dark/20 bg-background text-primary-dark hover:bg-accent transition"
          >
            &#8250;
          </button>
        </div>
      </div>

      <div ref={carouselRef} className="flex gap-3 overflow-x-auto scroll-smooth pb-1 no-scrollbar">
        {pets.map((pet) => (
          <PetCard key={pet.id} pet={pet} selected={selectedPet?.id === pet.id} onClick={() => onSelectPet(pet)} />
        ))}

        <button
          type="button"
          onClick={onAddPet}
          className="flex-none w-[150px] h-[110px] rounded-xl border border-dashed border-primary-dark/25 bg-accent text-primary-dark hover:bg-primary-light/45 transition flex items-center justify-center"
          aria-label="Add a New Pet"
        >
          <span className="text-3xl leading-none">+</span>
        </button>
      </div>
    </section>
  );
}
