import { useState } from "react";
import { registerUser } from "../../api/auth";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    try {
      setError("");
      const res = await registerUser(name, email, password);
      console.log("Registered user:", res);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">Registration successful!</p>}
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
        className="w-full mb-2 p-2 border rounded"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full mb-2 p-2 border rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
      />
      <button
        onClick={handleRegister}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Register
      </button>
    </div>
  );
}
