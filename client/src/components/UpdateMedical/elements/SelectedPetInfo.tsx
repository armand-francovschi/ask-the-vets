import type { Pet } from "../../../types";
import FileUpload from "../functions/FileUpload";
import ProfileImageUpload from "../functions/ProfileImageUpload";
import type { Dispatch, SetStateAction } from "react";
import { API_BASE_URL } from "../../../config/api";

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
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 rounded-2xl border border-primary-dark/20 bg-primary-light/35 shadow-sm p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)] gap-6 md:items-stretch justify-items-center">
          <div className="w-full max-w-[260px] h-[260px] rounded-sm overflow-hidden bg-accent border-[3px] border-rosy-granite/60 p-1 shadow-md flex items-center justify-center">
            {pet.image ? (
              <img
                src={pet.image.startsWith("http") ? pet.image : `${API_BASE_URL}/uploads/${pet.image}`}
                alt={pet.name}
                className="w-full h-full object-cover border border-primary-dark/15"
              />
            ) : (
              <img src="/icons/document-icon.png" alt="No profile" className="w-16 h-16 opacity-60" />
            )}
          </div>

          <div className="w-full min-h-[260px] text-center flex flex-col justify-center items-center gap-3">
            <div className="space-y-2">
              <h2 className="text-4xl md:text-5xl text-primary-dark font-semibold tracking-wide">
                {pet.name}'s Health Journey
              </h2>
              <p className="text-lg text-charcoal-blue uppercase tracking-[0.08em]">
                Profile Summary • Updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="mx-auto max-w-xl rounded-xl border border-primary-dark/15 bg-accent/60 px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-center">
              <p className="text-xl text-primary-dark"><strong>Pet Type:</strong> {pet.type}</p>
              <p className="text-xl text-primary-dark"><strong>Breed:</strong> {pet.breed}</p>
              <p className="text-xl text-primary-dark sm:col-span-2"><strong>Current Age:</strong> {pet.age} years</p>
            </div>
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-primary-dark/15 bg-primary-light/25 shadow-sm p-4">
          <h3 className="text-2xl font-semibold text-primary-dark mb-3">Health History</h3>

          {pet.medicalFiles?.length ? (
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {pet.medicalFiles.map((file, idx) => (
                <button
                  key={`${file}-${idx}`}
                  type="button"
                  onClick={() => setPreviewFile(`${API_BASE_URL}/uploads/${file}`)}
                  className="w-full rounded-lg border border-primary-dark/15 bg-accent px-3 py-2 flex items-center gap-2 text-left hover:bg-primary-light/45 transition"
                >
                  <img src="/icons/document-icon.png" alt="Document" className="w-6 h-6 opacity-75" />
                  <span className="text-sm text-charcoal-blue truncate">{file}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-charcoal-blue">No medical files uploaded yet.</p>
          )}
        </div>

        <div className="rounded-2xl border border-primary-dark/15 bg-primary-light/25 shadow-sm p-4">
          <h3 className="text-2xl font-semibold text-primary-dark mb-3">Account Management</h3>
          <div className="space-y-2">
            <ProfileImageUpload pet={pet} setPet={setPet} />
            <FileUpload pet={pet} setPet={setPet} />

            <button
              className="w-full px-4 py-2 bg-accent-dark text-white rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2"
              onClick={onEdit}
            >
              <span aria-hidden="true" className="inline-flex text-white shrink-0">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="m16.5 3.5 4 4L8 20l-4 1 1-4Z" />
                </svg>
              </span>
              <span>Edit age/details</span>
            </button>
            <button
              className="w-full px-4 py-2 bg-primary-dark text-white rounded-lg hover:bg-charcoal-blue transition flex items-center justify-center gap-2"
              onClick={onRemove}
            >
              <span aria-hidden="true" className="inline-flex text-white shrink-0">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                </svg>
              </span>
              <span>Remove pet</span>
            </button>
          </div>
        </div>
      </aside>
    </section>
  );
}
