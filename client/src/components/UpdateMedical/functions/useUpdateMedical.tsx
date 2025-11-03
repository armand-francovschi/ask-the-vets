import { useState, useEffect } from "react";
import type { Pet } from "../../../types";
import { useAuth } from "../../../context/AuthContext";

export function useUpdateMedical() {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [newPet, setNewPet] = useState<Pet>({ name: "", type: "", breed: "", age: 0 });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [previewFile, setPreviewFile] = useState<string | null>(null);

  /** Fetch all pets from backend */
  const fetchPets = async () => {
    try {
      const res = await fetch("http://localhost:5000/pets");
      if (!res.ok) throw new Error("Failed to fetch pets");
      const allPets: Pet[] = await res.json();
      setPets(allPets.map((p) => ({ ...p, medicalFiles: p.medicalFiles || [] })));
    } catch (err) {
      console.error("Error fetching pets:", err);
    }
  };

  /** Filter pets based on the current user’s pet IDs */
  useEffect(() => {
    if (user && pets.length > 0) {
      const userPetIds = user.pets || [];
      const filtered = pets.filter(
        (p) => p.id !== undefined && userPetIds.includes(p.id)
      );
      setFilteredPets(filtered);
      setSelectedPet((prev) => filtered.find((p) => p.id === prev?.id) || filtered[0] || null);
    } else {
      setFilteredPets([]);
      setSelectedPet(null);
    }
  }, [pets, user]);

  /** Fetch pets:
   * - once on mount
   * - and again when user logs in
   */
  useEffect(() => {
    if (user) {
      fetchPets();
    }
  }, [user]);

  /** Add new pet */
  const handleAddPet = async () => {
    if (!user) return;
    try {
      const payload = { ...newPet, userId: user.id };
      const res = await fetch("http://localhost:5000/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to add pet");

      await fetchPets();

      setNewPet({ name: "", type: "", breed: "", age: 0 });
      setIsAddModalOpen(false);
      setUploadSuccess(true);
    } catch (err) {
      console.error(err);
    }
  };

  /** Edit pet */
  const handleEditPet = async () => {
    if (!selectedPet || selectedPet.id === undefined) return;
    try {
      const res = await fetch(`http://localhost:5000/pets/${selectedPet.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPet),
      });
      if (!res.ok) throw new Error("Failed to update pet");
      await fetchPets();
      setSelectedPet(null);
      setNewPet({ name: "", type: "", breed: "", age: 0 });
      setIsEditModalOpen(false);
      setUploadSuccess(true);
    } catch (err) {
      console.error(err);
    }
  };

  /** Remove pet */
  const handleRemovePet = async (petId: number) => {
    try {
      const res = await fetch(`http://localhost:5000/pets/${petId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete pet");
      await fetchPets();
      setIsRemoveModalOpen(false);
      setUploadSuccess(true);
    } catch (err) {
      console.error(err);
    }
  };

  /** Modal helpers */
  const openEditModal = (pet: Pet) => {
    setSelectedPet(pet);
    setNewPet({ ...pet });
    setIsEditModalOpen(true);
  };

  const openRemoveModal = (pet: Pet) => {
    setSelectedPet(pet);
    setIsRemoveModalOpen(true);
  };

  return {
    pets,
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
  };
}
