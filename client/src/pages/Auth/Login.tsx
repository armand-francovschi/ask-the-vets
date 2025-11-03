import { useState } from "react";
import { loginUser } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import type { User } from "../../types";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const { setUser } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            setError("");
            const res = await loginUser(email, password);
            console.log("Logged in:", res);

            // Save JWT and user info to localStorage
            localStorage.setItem("token", res.token);
            localStorage.setItem("user", JSON.stringify(res.user));

            // Update context so Navbar and other components re-render
            setUser(res.user as User);


            // Navigate to home or dashboard
            navigate("/");

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Login failed");
        }
    };

    return (
        <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded shadow">
            <h2 className="text-2xl font-bold mb-4 text-primary-dark">Login</h2>

            {error && <p className="text-red-500 mb-2">{error}</p>}

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full mb-3 p-2 border rounded"
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full mb-4 p-2 border rounded"
            />

            <button
                onClick={handleLogin}
                className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
            >
                Login
            </button>
        </div>
    );
}
