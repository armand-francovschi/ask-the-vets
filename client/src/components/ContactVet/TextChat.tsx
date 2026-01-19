import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useUpdateMedical } from "../UpdateMedical/functions/useUpdateMedical";

const TextChat: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const petId = Number(queryParams.get("petId"));

  const { filteredPets } = useUpdateMedical();
  const pet = filteredPets.find(p => p.id === petId);

  const [messages, setMessages] = useState<{ from: "user" | "vet"; text: string }[]>([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input) return;
    setMessages([...messages, { from: "user", text: input }]);
    setInput("");

    // Simulate vet response
    setTimeout(() => {
      setMessages(prev => [...prev, { from: "vet", text: "Thank you for your message. We will check your pet's file." }]);
    }, 1000);
  };

  if (!pet) return <div className="p-6 text-center">Pet not found.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto min-h-screen flex flex-col">
      <h1 className="text-4xl font-bold mb-6">Chat about {pet.name}</h1>

      <div className="flex-1 border rounded-lg p-4 flex flex-col gap-3 overflow-y-auto mb-4 h-[400px]">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg max-w-xs ${msg.from === "user" ? "bg-blue-100 self-end" : "bg-gray-200 self-start"}`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 border rounded-lg p-2"
          placeholder="Type your message..."
        />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default TextChat;
