import { useUpdateMedical } from "../components/UpdateMedical/functions/useUpdateMedical";
import PetCarousel from "../components/UpdateMedical/elements/PetCarousel";
import SelectedPetInfo from "../components/UpdateMedical/elements/SelectedPetInfo";
import PetModal from "../components/UpdateMedical/elements/PetModal";
import RemovePetModal from "../components/UpdateMedical/elements/RemovePetModal";
import MedicalFilePreview from "../components/UpdateMedical/functions/MedicalFilePreview";
import UploadSuccessNotification from "../components/UpdateMedical/functions/UploadSuccessNotification";

export default function UpdateMedical() {
  const {
    filteredPets,
    selectedPet,
    newPet,
    isAddModalOpen,
    isEditModalOpen,
    isRemoveModalOpen,
    uploadSuccess,
    previewFile,
    setSelectedPet,
    setNewPet,
    setIsAddModalOpen,
    setIsEditModalOpen,
    setIsRemoveModalOpen,
    setUploadSuccess,
    setPreviewFile,
    handleAddPet,
    handleEditPet,
    handleRemovePet,
    openEditModal,
    openRemoveModal,
  } = useUpdateMedical();

  return (
    <div className="md:ml-64 min-h-screen bg-background p-8 flex flex-col gap-8">
      <h1 className="text-3xl font-bold text-primary-dark mb-4">
        Update Your Pet(s) Medical Info
      </h1>

      {/* Pet Carousel */}
      <PetCarousel
        pets={filteredPets}
        selectedPet={selectedPet}
        onSelectPet={setSelectedPet}
        onAddPet={() => setIsAddModalOpen(true)}
      />

      {/* Selected Pet Info */}
      {selectedPet && (
        <SelectedPetInfo
          pet={selectedPet}
          setPet={setSelectedPet}
          onEdit={() => openEditModal(selectedPet)}
          onRemove={() => openRemoveModal(selectedPet)}
          setPreviewFile={setPreviewFile}
        />
      )}

      {/* Notifications */}
      {uploadSuccess && (
        <UploadSuccessNotification onClose={() => setUploadSuccess(false)} />
      )}
      {previewFile && (
        <MedicalFilePreview
          fileUrl={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}

      {/* Add Pet Modal */}
      {isAddModalOpen && (
        <PetModal
          title="Add a New Pet"
          pet={newPet}
          setPet={setNewPet}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddPet}
        />
      )}

      {/* Edit Pet Modal */}
      {isEditModalOpen && selectedPet && (
        <PetModal
          title="Edit Pet Details"
          pet={newPet}
          setPet={setNewPet}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditPet}
        />
      )}

      {/* Remove Pet Modal */}
      {isRemoveModalOpen && selectedPet && (
        <RemovePetModal
          pet={selectedPet}
          onClose={() => setIsRemoveModalOpen(false)}
          onConfirm={() => handleRemovePet(selectedPet.id!)}
        />
      )}
    </div>
  );
}
