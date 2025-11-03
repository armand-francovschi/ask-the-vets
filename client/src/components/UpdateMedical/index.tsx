import { useState, useEffect } from "react";
import type { Pet } from "../../types";
import type { User } from "../../types";
import PetCarousel from "./elements/PetCarousel";
import PetModal from "./elements/PetModal";
import RemovePetModal from "./elements/RemovePetModal";
import FileUpload from "./functions/FileUpload";

export default function UpdateMedical() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [pets, setPets] = useState<Pet[]>([]);
    const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
    const [newPet, setNewPet] = useState<Pet>({ name: "", type: "", breed: "", age: 0 });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);


const handleConfirmRemove = (petId?: number) => {
  if (!petId || !selectedUser) return;

  fetch(`http://localhost:5000/pets/${petId}`, { method: "DELETE" })
    .then(res => res.json())
    .then(() => {
      setPets(prev => prev.filter(p => p.id !== petId));
      setSelectedPet(null);
      setIsRemoveModalOpen(false);

      // Remove from user's pet list
    setUsers(prev =>
  prev.map(u =>
    u.id === selectedUser.id
      ? { ...u, pets: u.pets.filter(p => p !== petId) } // p is a number
      : u
  )
);

    })
    .catch(console.error);
};

    useEffect(() => {
        Promise.all([
            fetch("http://localhost:5000/users").then(res => res.json()),
            fetch("http://localhost:5000/pets").then(res => res.json())
        ])
            .then(([usersData, petsData]: [User[], Pet[]]) => {
                const petsWithFiles = petsData.map((p: Pet) => ({
                    ...p,
                    medicalFiles: p.medicalFiles || [],
                }));
                setUsers(usersData);
                setPets(petsWithFiles);
            })
            .catch(console.error);
    }, []);

const filteredPets = selectedUser
    ? pets.filter(pet => selectedUser.pets.includes(pet.id!))
    : pets;


    return (
        <div className="md:ml-64 min-h-screen bg-background p-8 flex flex-col gap-8">
            <h1 className="text-3xl font-bold text-primary-dark mb-4">Update Your Pet(s) Medical Info</h1>

            <div className="flex items-center gap-3 mb-4">
                <label className="text-lg font-semibold text-primary-dark">Select User:</label>
                <select
                    className="border rounded p-2"
                    value={selectedUser?.id || ""}
                    onChange={(e) => {
                        const userId = Number(e.target.value);
                        const user = users.find(u => u.id === userId) || null;
                        setSelectedUser(user);
                        setSelectedPet(null);
                    }}
                >
                    <option value="">-- Choose a User --</option>
                    {users.map(user => (
                        <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                    ))}
                </select>
            </div>

            <PetCarousel
                pets={filteredPets}
                selectedPet={selectedPet}
                onSelectPet={setSelectedPet}
                onAddPet={() => setIsAddModalOpen(true)}
            />

            {selectedPet && (
                <>
                    <div className="w-full grid grid-cols-6 gap-6 h-[500px] bg-primary-light rounded shadow p-6">
                        <div className="col-span-1 flex items-center justify-center">
                            {selectedPet.image && <img src={selectedPet.image} alt={selectedPet.name} className="w-full h-full object-cover rounded" />}
                        </div>
                        <div className="col-span-3 flex flex-col justify-center gap-2">
                            <h2 className="text-3xl font-bold text-primary-dark">{selectedPet.name}</h2>
                            <p className="text-gray-700"><strong>Type:</strong> {selectedPet.type}</p>
                            <p className="text-gray-700"><strong>Breed:</strong> {selectedPet.breed}</p>
                            <p className="text-gray-700"><strong>Age:</strong> {selectedPet.age}</p>
                        </div>
                        <div className="col-span-2 flex flex-col justify-between h-full">
                            <FileUpload
                                pet={selectedPet}
                                setPet={setSelectedPet}
                            />
                            <div className="flex flex-col gap-2">
                                <button
                                    className="px-4 py-2 bg-accent text-primary-dark rounded hover:bg-accent-dark transition"
                                    onClick={() => { setNewPet(selectedPet); setIsEditModalOpen(true); }}
                                >Edit age/details of pet</button>
                                <button
                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                    onClick={() => setIsRemoveModalOpen(true)}
                                >Remove pet</button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {isAddModalOpen && <PetModal pet={newPet} setPet={setNewPet} onClose={() => setIsAddModalOpen(false)} onSubmit={() => { }} title="Add a New Pet" />}
            {isEditModalOpen && selectedPet && <PetModal pet={newPet} setPet={setNewPet} onClose={() => setIsEditModalOpen(false)} onSubmit={() => { }} title="Edit Pet Details" />}
            {isRemoveModalOpen && selectedPet && (
                <RemovePetModal
                    pet={selectedPet}
                    onClose={() => setIsRemoveModalOpen(false)}
                    {...({ onConfirm: handleConfirmRemove } as any)}
                />
            )}
        </div>
    );
}
