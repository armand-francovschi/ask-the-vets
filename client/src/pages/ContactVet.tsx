import { useState } from "react";

export default function ContactVet() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ name, email, message });
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-4">
      <h1 className="text-3xl font-bold text-green-800 mb-6">Contact a Vet</h1>

      {submitted ? (
        <div className="bg-green-100 p-6 rounded shadow text-green-900">
          <h2 className="text-xl font-semibold mb-2">Thank you!</h2>
          <p>Your message has been sent. We will get back to you shortly.</p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 w-full max-w-md bg-white p-6 rounded shadow"
        >
          <label className="flex flex-col">
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </label>

          <label className="flex flex-col">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </label>

          <label className="flex flex-col">
            Message
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
            />
          </label>

          <button
            type="submit"
            className="py-3 px-6 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"
          >
            Send Message
          </button>
        </form>
      )}
    </div>
  );
}
