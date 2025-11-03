import type { Pet } from "../../../types";
import type { Dispatch, SetStateAction } from "react";
import FileUpload from "../functions/FileUpload";
import ProfileImageUpload from "../functions/ProfileImageUpload";

interface SelectedPetInfoProps {
  pet: Pet;
  setPet: Dispatch<SetStateAction<Pet | null>>;
  onEdit: () => void;
  onRemove: () => void;
  setPreviewFile: (url: string | null) => void;
}

export default function SelectedPetInfo({
  pet,
  setPet,
  onEdit,
  onRemove,
  setPreviewFile,
}: SelectedPetInfoProps) {
  return (
    <div className="w-full bg-primary-light rounded shadow p-6 grid grid-cols-6 gap-6 h-[500px]">
      
      {/* Pet Image */}
      <div className="col-span-2 flex items-center justify-center">
       {pet.image && (
  <img
    src={`http://localhost:5000/uploads/${pet.image}`} // <- use backend URL
    alt={pet.name}
    className="w-full h-full object-cover rounded"
  />
)}

      </div>

      {/* Pet Details */}
      <div className="col-span-2 flex flex-col justify-center gap-2">
        <h2 className="text-3xl font-bold text-primary-dark">{pet.name}</h2>
        <p className="text-gray-700"><strong>Type:</strong> {pet.type}</p>
        <p className="text-gray-700"><strong>Breed:</strong> {pet.breed}</p>
        <p className="text-gray-700"><strong>Age:</strong> {pet.age}</p>
      </div>

      {/* Medical Files + Actions */}
      <div className="col-span-2 flex flex-col justify-between h-full">
        
        {/* Medical Files */}
        <div className="flex-1 overflow-auto mb-4">
          <h3 className="text-xl font-semibold mb-2 text-primary-dark">Medical Files</h3>
          {pet.medicalFiles?.length ? (
            <ul className="flex flex-col gap-2">
              {pet.medicalFiles.map((file, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-2 text-gray-700 hover:text-primary cursor-pointer"
                  onClick={() =>
                    setPreviewFile(`http://localhost:5000/uploads/${file}`)
                  }
                >
                  <span className="underline">{file}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No medical files uploaded yet.</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            <ProfileImageUpload pet={pet} setPet={setPet} /> {/* upload profile image */}
            <FileUpload pet={pet} setPet={setPet} /> {/* upload medical files */}
          </div>

          <button
            className="px-4 py-2 bg-accent text-primary-dark rounded hover:bg-accent-dark transition"
            onClick={onEdit}
          >
            Edit age/details of pet
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            onClick={onRemove}
          >
            Remove pet
          </button>
        </div>

      </div>
    </div>
  );
}
