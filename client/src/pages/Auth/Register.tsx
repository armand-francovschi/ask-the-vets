import { useState } from "react";
import { NavLink } from "react-router-dom";
import { registerUser } from "../../api/auth";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("Registration successful! Check your email to verify your account.");
  const [verificationUrl, setVerificationUrl] = useState("");

  const handleRegister = async () => {
    try {
      setError("");
      setSuccess(false);
      setVerificationUrl("");
      const res = await registerUser(name, email, password);
      setSuccessMessage(res.message || "Registration successful! Check your email to verify your account.");
      setVerificationUrl(res.verificationUrl || "");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    }
  };

  return (
    <div className="md:ml-64 min-h-screen bg-background px-4 py-8 md:py-14 flex items-center justify-center">
      <div className="w-full max-w-5xl rounded-3xl overflow-hidden border border-primary-dark/10 bg-white shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] min-h-[620px]">
          <aside className="bg-gradient-to-br from-charcoal-blue via-rosy-granite to-lilac-ash text-white px-8 py-12 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute -left-20 -bottom-24 h-64 w-64 rounded-full bg-accent" />
              <div className="absolute right-8 top-16 h-14 w-14 rotate-45 rounded bg-white/40" />
              <div className="absolute right-16 bottom-24 h-10 w-10 rounded bg-white/30" />
            </div>

            <div className="relative z-10">
              <p className="text-xs uppercase tracking-[0.18em] text-white/80">Ask The Vets</p>
              <h2 className="mt-4 text-4xl font-bold leading-tight">Welcome Back!</h2>
              <p className="mt-4 text-white/90 text-base leading-relaxed">
                Keep managing your pet health journey in one place.
              </p>

              <NavLink
                to="/login"
                className="mt-8 inline-flex items-center justify-center rounded-full border border-white/70 px-10 py-3 text-sm font-semibold tracking-wide hover:bg-white hover:text-primary-dark transition"
              >
                SIGN IN
              </NavLink>
            </div>
          </aside>

          <section className="px-6 py-10 sm:px-12 sm:py-12 flex flex-col items-center justify-center">
            <div className="w-full max-w-md text-center">
              <h1 className="text-4xl font-bold text-primary mb-5">Create Account</h1>

              <p className="text-sm text-charcoal-blue/80 mb-5">Use your email for registration:</p>

              {error && <p className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</p>}
              {success && <p className="mb-3 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">{successMessage}</p>}
              {verificationUrl && (
                <p className="mb-3 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-sm text-blue-800 break-all">
                  Dev verification link: <a href={verificationUrl} className="underline">{verificationUrl}</a>
                </p>
              )}

              <div className="space-y-3 text-left">
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-md border border-primary-dark/10 bg-slate-50 px-4 py-3 text-primary-dark placeholder:text-charcoal-blue/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-md border border-primary-dark/10 bg-slate-50 px-4 py-3 text-primary-dark placeholder:text-charcoal-blue/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-md border border-primary-dark/10 bg-slate-50 px-4 py-3 text-primary-dark placeholder:text-charcoal-blue/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <button
                onClick={handleRegister}
                className="mt-7 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold tracking-wide text-white hover:bg-charcoal-blue"
              >
                SIGN UP
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
