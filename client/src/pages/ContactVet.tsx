import React, { useState } from "react";
import { useUpdateMedical } from "../components/UpdateMedical/functions/useUpdateMedical";
import { useNavigate } from "react-router-dom";

type ConsultationType = "FILE" | "CHAT" | "VIDEO";

const ContactVet: React.FC = () => {
  const navigate = useNavigate();
  const { filteredPets, selectedPet, setSelectedPet } = useUpdateMedical();
  const [expandedPetId, setExpandedPetId] = useState<number | null>(null);

  const getPetImageUrl = (path?: string) =>
    path ? `http://localhost:5000/uploads/${path}` : "/default-pet.png";

  const handlePetClick = (petId: number) => {
    const pet = filteredPets.find((p) => p.id === petId);
    if (pet) setSelectedPet(pet);
    setExpandedPetId(expandedPetId === petId ? null : petId);
  };

  const handleConsultationSelect = (type: ConsultationType) => {
    if (!selectedPet) return;
    switch (type) {
      case "FILE":
        navigate(`/contact-vet/medical-analysis?petId=${selectedPet.id}`);
        break;
      case "CHAT":
        navigate(`/contact-vet/chat?petId=${selectedPet.id}`);
        break;
      case "VIDEO":
        navigate(`/contact-vet/video?petId=${selectedPet.id}`);
        break;
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto min-h-screen relative">
      <h1 className="text-4xl md:text-5xl font-bold mb-10 text-center">Contact a Vet</h1>

      {/* No pets message */}
      {Array.isArray(filteredPets) && filteredPets.length === 0 && (
        <div className="p-6 bg-yellow-100 border border-yellow-300 rounded text-center text-lg">
          You currently have no pets added. To begin a consultation, please use the "Medical Info" button from the navbar to add a pet first.
        </div>
      )}

      {/* Pet selection grid */}
      {Array.isArray(filteredPets) && filteredPets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
          {filteredPets.map((pet) => (
            <div key={pet.id} className="flex flex-col items-center w-full relative">
              {/* Pet card */}
              <button
                className="flex items-center gap-6 p-6 border rounded-lg hover:bg-gray-100 transition-all duration-300 w-full"
                onClick={() => handlePetClick(pet.id!)}
              >
                <img
                  src={getPetImageUrl(pet.image)}
                  alt={pet.name}
                  className="w-36 h-36 object-cover rounded-full border-2"
                />
                <div className="flex flex-col">
                  <p className="text-2xl font-semibold">{pet.name}</p>
                  <p className="text-lg text-gray-600">{pet.breed}</p>
                </div>
              </button>

              {/* Consultation dropdown */}
              {expandedPetId === pet.id && (
                <div>
                  {/* Desktop: below pet card */}
                  <div className="hidden md:flex absolute top-full mt-4 flex-row gap-6 bg-gray-50 border rounded-lg overflow-hidden transition-all duration-500 ease-out"
                    style={{
                      minWidth: "max-content",
                      left: "50%",
                      transform: "translateX(-50%)",
                      zIndex: 50,
                    }}
                  >
                    {["FILE", "CHAT", "VIDEO"].map((type) => (
                      <ConsultationButton
                        key={type}
                        type={type as ConsultationType}
                        onClick={() => handleConsultationSelect(type as ConsultationType)}
                      />
                    ))}
                  </div>

                  {/* Mobile: centered modal-style */}
                  <div className="md:hidden fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-gray-50 border rounded-lg p-4 flex flex-col gap-4 w-11/12">
                      {["FILE", "CHAT", "VIDEO"].map((type) => (
                        <ConsultationButton
                          key={type}
                          type={type as ConsultationType}
                          onClick={() => handleConsultationSelect(type as ConsultationType)}
                        />
                      ))}
                      <button
                        className="mt-2 text-gray-500 hover:text-gray-700 text-center"
                        onClick={() => setExpandedPetId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Component for a single consultation button
interface ConsultationButtonProps {
  type: ConsultationType;
  onClick: () => void;
}
const ConsultationButton: React.FC<ConsultationButtonProps> = ({ type, onClick }) => {
  const labels: Record<ConsultationType, { title: string; description: string; icon: string }> = {
    FILE: { title: "Medical File", description: "Send a document for analysis", icon: "/icons/file-icon.png" },
    CHAT: { title: "Text Chat", description: "Chat online with a vet", icon: "/icons/chat-icon.png" },
    VIDEO: { title: "Video Call", description: "Talk live via audio/video", icon: "/icons/video-icon.png" },
  };

  const { title, description, icon } = labels[type];

  return (
    <button
      className="flex flex-col items-center gap-2 border rounded-lg p-4 flex-shrink-0 min-w-[140px] sm:min-w-[180px] md:min-w-[220px] hover:scale-105 hover:shadow-lg transition-all duration-300"
      onClick={onClick}
    >
      <p className="text-lg sm:text-xl md:text-2xl font-semibold text-center">{title}</p>
      <p className="text-xs sm:text-sm md:text-lg text-gray-600 text-center">{description}</p>
      <img src={icon} alt={title} className="w-10 sm:w-14 md:w-16 h-10 sm:h-14 md:h-16 object-contain mt-1" />
    </button>
  );
};

export default ContactVet;
