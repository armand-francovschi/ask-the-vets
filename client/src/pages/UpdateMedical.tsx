import { useUpdateMedical } from "../components/UpdateMedical/functions/useUpdateMedical";
import PetCarousel from "../components/UpdateMedical/elements/PetCarousel";
import SelectedPetInfo from "../components/UpdateMedical/elements/SelectedPetInfo";
import PetModal from "../components/UpdateMedical/elements/PetModal";
import RemovePetModal from "../components/UpdateMedical/elements/RemovePetModal";
import MedicalFilePreview from "../components/UpdateMedical/functions/MedicalFilePreview";
import { useAuth } from "../context/AuthContext";
import UploadSuccessNotification from "../components/UpdateMedical/functions/UploadSuccessNotification";

export default function UpdateMedical() {

  const { user } = useAuth(); // user is null/undefined if not logged in

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
    <div className="md:ml-64 min-h-screen bg-background p-3 md:p-6">
      <div className="max-w-7xl mx-auto rounded-2xl border border-primary-dark/15 bg-accent shadow-md p-4 md:p-5 space-y-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-dark">Medical Info</h1>
          <p className="text-charcoal-blue">Review and manage your pet health records.</p>
        </div>


    
      {!user ? (
        <div className="p-4 bg-yellow-100 border border-yellow-300 rounded">
          Please log in to manage your pets.
        </div>
      ) : (
        <>
          <PetCarousel
            pets={filteredPets}
            selectedPet={selectedPet}
            onSelectPet={setSelectedPet}
            onAddPet={() => setIsAddModalOpen(true)}
          />

          {selectedPet && (
            <SelectedPetInfo
              pet={selectedPet}
              setPet={setSelectedPet}
              onEdit={() => openEditModal(selectedPet)}
              onRemove={() => openRemoveModal(selectedPet)}
              setPreviewFile={setPreviewFile}
            />
          )}

          {!selectedPet && filteredPets.length > 0 && (
            <div className="rounded-2xl border border-dashed border-primary-dark/25 bg-primary-light/25 p-8 text-center text-charcoal-blue">
              Select a pet from Pet Overview to view details, files, and account actions.
            </div>
          )}

          {uploadSuccess && <UploadSuccessNotification onClose={() => setUploadSuccess(false)} />}
          {previewFile && <MedicalFilePreview fileUrl={previewFile} onClose={() => setPreviewFile(null)} />}

          {isAddModalOpen && (
            <PetModal
              title="Add a New Pet"
              pet={newPet}
              setPet={setNewPet}
              onClose={() => setIsAddModalOpen(false)}
              onSubmit={handleAddPet}
            />
          )}

          {isEditModalOpen && selectedPet && (
            <PetModal
              title="Edit Pet Details"
              pet={newPet}
              setPet={setNewPet}
              onClose={() => setIsEditModalOpen(false)}
              onSubmit={handleEditPet}
            />
          )}

          {isRemoveModalOpen && selectedPet && (
            <RemovePetModal
              pet={selectedPet}
              onClose={() => setIsRemoveModalOpen(false)}
              onConfirm={() => handleRemovePet(selectedPet.id!)}
            />
          )}
        </>
      )}
      </div>
    </div>
  );
}
