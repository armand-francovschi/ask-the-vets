import { useState, useEffect } from "react";
import type { Pet, User } from "../../../types";

export function useUpdateMedical() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [pets, setPets] = useState<Pet[]>([]);
    const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

    const [newPet, setNewPet] = useState<Pet>({ name: "", type: "", breed: "", age: 0 });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [previewFile, setPreviewFile] = useState<string | null>(null);

    /** Fetch all users */
    const fetchUsers = async () => {
        try {
            const res = await fetch("http://localhost:5000/users");
            const data: User[] = await res.json();
            setUsers(data);
        } catch (err) {
            console.error(err);
        }
    };

    /** Fetch all pets and filter by selected user */
    const fetchPets = async () => {
        try {
            const res = await fetch("http://localhost:5000/pets");
            const allPets: Pet[] = await res.json();
            setPets(allPets.map(p => ({ ...p, medicalFiles: p.medicalFiles || [] })));

            if (selectedUser) {
                const userPetIds = selectedUser.pets || [];
                const filtered = allPets.filter(p => p.id !== undefined && userPetIds.includes(p.id));
                setSelectedPet(filtered[0] || null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchUsers();
        fetchPets();
    }, []);

    /** Filter pets by selected user's pet IDs */
    const filteredPets = selectedUser
        ? pets.filter(pet => pet.id !== undefined && selectedUser.pets.includes(pet.id))
        : pets;

    /** Handle user selection */
    const handleUserChange = (userId: number) => {
        const user = users.find(u => u.id === userId) || null;
        setSelectedUser(user);
        setSelectedPet(null);
    };

    /** Initialize editing */
    const openEditModal = (pet: Pet) => {
        setSelectedPet(pet);
        setNewPet({ ...pet });
        setIsEditModalOpen(true);
    };

    /** Initialize remove modal */
    const openRemoveModal = (pet: Pet) => {
        setSelectedPet(pet);
        setIsRemoveModalOpen(true);
    };

    /** Add new pet */
    const handleAddPet = async () => {
        if (!selectedUser) return;
        try {
            const payload = { ...newPet, userId: selectedUser.id };
            const res = await fetch("http://localhost:5000/pets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data: Pet = await res.json();

            await fetchUsers(); // refresh user pet IDs
            await fetchPets();  // refresh pet list

            setNewPet({ name: "", type: "", breed: "", age: 0 });
            setIsAddModalOpen(false);
            setUploadSuccess(true);
        } catch (err) {
            console.error(err);
        }
    };

/** Edit existing pet */
const handleEditPet = async () => {
  if (!selectedPet || selectedPet.id === undefined) return;

  console.log("2 - before fetch");

  try {
    const res = await fetch(`http://localhost:5000/pets/${selectedPet.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPet),
    });

    if (!res.ok) throw new Error(`Failed to update pet: ${res.statusText}`);

    let updatedPet: Pet;
    try {
      updatedPet = await res.json();
    } catch {
      // fallback if backend does not return JSON
      updatedPet = { ...selectedPet, ...newPet };
      console.warn("No JSON response from backend, using local update");
    }

    console.log("3 - after fetch", updatedPet);

    setPets(prev => prev.map(p => (p.id === updatedPet.id ? updatedPet : p)));
    setSelectedPet(updatedPet);
    setNewPet({ name: "", type: "", breed: "", age: 0 });
    setIsEditModalOpen(false);

    if (selectedUser) {
      setUsers(prev =>
        prev.map(u =>
          u.id === selectedUser.id
            ? {
                ...u,
                pets: u.pets
                  .map(pId => (pId === selectedPet.id ? updatedPet.id! : pId))
                  .filter((id): id is number => id !== undefined),
              }
            : u
        )
      );
    }

    setUploadSuccess(true);
  } catch (err) {
    console.error("Edit pet error:", err);
  }
};





    /** Remove a pet */
    const handleRemovePet = async (petId: number) => {
        if (!selectedUser) return;
        try {
            const res = await fetch(`http://localhost:5000/pets/${petId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete pet");

            await fetchUsers();
            await fetchPets();

            setIsRemoveModalOpen(false);
            setUploadSuccess(true);
        } catch (err) {
            console.error(err);
        }
    };

    return {
        users,
        selectedUser,
        pets,
        selectedPet,
        newPet,
        isAddModalOpen,
        isEditModalOpen,
        isRemoveModalOpen,
        uploadSuccess,
        previewFile,
        filteredPets,
        setSelectedPet,
        setPets,
        setNewPet,
        setIsAddModalOpen,
        setIsEditModalOpen,
        setIsRemoveModalOpen,
        setUploadSuccess,
        setPreviewFile,
        handleUserChange,
        handleAddPet,
        handleEditPet,
        handleRemovePet,
        openEditModal,
        openRemoveModal,
    };
}
