import React from "react";
import { useLocation } from "react-router-dom";
import { useUpdateMedical } from "../UpdateMedical/functions/useUpdateMedical";

const VideoCall: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const petId = Number(queryParams.get("petId"));
  const scheduleId = queryParams.get("scheduleId");

  const { filteredPets } = useUpdateMedical();
  const pet = Number.isNaN(petId) ? undefined : filteredPets.find(p => p.id === petId);

  if (!pet && !scheduleId) return <div className="p-6 text-center">Call details not found.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-6">{pet ? `Video Call for ${pet.name}` : "Scheduled Video Call"}</h1>

      <div className="w-full md:w-3/4 aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-xl text-gray-600">Video call component goes here</p>
      </div>

      <p className="mt-4 text-gray-500 text-center">
        (This is a placeholder. Integrate WebRTC or a video call library to enable live calls.)
      </p>
    </div>
  );
};

export default VideoCall;
