import type { Pet } from "../../../types";
import FileUpload from "../functions/FileUpload";
import ProfileImageUpload from "../functions/ProfileImageUpload";
import type { Dispatch, SetStateAction } from "react";

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
    <div className="w-full bg-primary-light rounded shadow p-6 grid grid-cols-1 md:grid-cols-6 gap-6 h-auto md:h-[500px] transition-all duration-300">
      <div className="col-span-1 flex items-center justify-center">
        {pet.image && (
          <img
            src={pet.image.startsWith("http") ? pet.image : `http://localhost:5000/uploads/${pet.image}`}
            alt={pet.name}
            className="w-40 h-40 md:w-full md:h-full object-cover rounded-lg shadow-md"
          />
        )}
      </div>

      <div className="col-span-3 flex flex-col justify-center gap-2 text-center md:text-left">
        <h2 className="text-3xl font-bold text-primary-dark">{pet.name}</h2>
        <p className="text-gray-700"><strong>Type:</strong> {pet.type}</p>
        <p className="text-gray-700"><strong>Breed:</strong> {pet.breed}</p>
        <p className="text-gray-700"><strong>Age:</strong> {pet.age}</p>
        {!pet.image && (
          <div className="flex justify-center mt-4 md:hidden">
            <img
              src={pet.image}
              alt={pet.name}
              className="w-32 h-32 object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      <div className="col-span-2 flex flex-col justify-between h-full">
        {/* Medical Files */}
        <div className="flex-1 mb-4">
          <h3 className="text-xl font-semibold mb-3 text-primary-dark">Medical Files</h3>

          {pet.medicalFiles?.length ? (
            <div className="max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {pet.medicalFiles.map((file, idx) => (
                  <div
                    key={idx}
                    onClick={() =>
                      setPreviewFile(`http://localhost:5000/uploads/${file}`)
                    }
                    className="flex flex-col items-center justify-center p-3 bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer hover:scale-105"
                  >
                    <img
                      src="/icons/document-icon.png"
                      alt="Document"
                      className="w-12 h-12 mb-2 opacity-80"
                    />
                    <p className="text-xs text-gray-600 text-center truncate w-full">{file}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No medical files uploaded yet.</p>
          )}
        </div>



        <div className="flex flex-col gap-2 mt-4">
          <ProfileImageUpload pet={pet} setPet={setPet} />
          <FileUpload pet={pet} setPet={setPet} />

          <button
            className="w-full md:w-auto px-4 py-2 bg-accent text-primary-dark rounded hover:bg-accent-dark transition"
            onClick={onEdit}
          >
            Edit age/details
          </button>
          <button
            className="w-full md:w-auto px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            onClick={onRemove}
          >
            Remove pet
          </button>
        </div>
      </div>
    </div>
  );
}
