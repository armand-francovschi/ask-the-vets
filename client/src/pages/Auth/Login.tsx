import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { resendVerificationEmail } from "../../api/auth";

type LoginLocationState = {
    authPrompt?: string;
};

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [resendMessage, setResendMessage] = useState("");
    const [verificationUrl, setVerificationUrl] = useState("");
    const [isResending, setIsResending] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const authPrompt = (location.state as LoginLocationState | null)?.authPrompt;

    const handleLogin = async () => {
        try {
            setError("");
            setResendMessage("");
            setVerificationUrl("");
            await login(email, password);

            // Navigate to home
            navigate("/");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Login failed");
        }
    };

    const handleResendVerification = async () => {
        if (!email.trim()) {
            setError("Enter your email first, then resend verification.");
            return;
        }

        try {
            setIsResending(true);
            setResendMessage("");
            setVerificationUrl("");
            const res = await resendVerificationEmail(email.trim());
            setResendMessage(res.message || "Verification email sent. Please check your inbox.");
            setVerificationUrl(res.verificationUrl || "");
        } catch (err: any) {
            setError(err.message || "Failed to resend verification email");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="md:ml-64 min-h-screen bg-background px-4 py-8 md:py-14 flex items-center justify-center">
            <div className="w-full max-w-5xl rounded-3xl overflow-hidden border border-primary-dark/10 bg-white shadow-xl">
                <div className="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] min-h-[620px]">
                    <aside className="bg-gradient-to-br from-charcoal-blue via-rosy-granite to-lilac-ash text-white px-8 py-12 flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 pointer-events-none">
                            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-accent" />
                            <div className="absolute left-8 top-16 h-14 w-14 rotate-45 rounded bg-white/40" />
                            <div className="absolute left-16 bottom-24 h-10 w-10 rounded bg-white/30" />
                        </div>

                        <div className="relative z-10">
                            <p className="text-xs uppercase tracking-[0.18em] text-white/80">Ask The Vets</p>
                            <h2 className="mt-4 text-4xl font-bold leading-tight">Hello, Friend!</h2>
                            <p className="mt-4 text-white/90 text-base leading-relaxed">
                                Enter your details and start tracking your pet care updates.
                            </p>

                            <NavLink
                                to="/register"
                                className="mt-8 inline-flex items-center justify-center rounded-full border border-white/70 px-10 py-3 text-sm font-semibold tracking-wide hover:bg-white hover:text-primary-dark transition"
                            >
                                SIGN UP
                            </NavLink>
                        </div>
                    </aside>

                    <section className="px-6 py-10 sm:px-12 sm:py-12 flex flex-col items-center justify-center">
                        <div className="w-full max-w-md text-center">
                            {authPrompt && (
                                <p className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                                    {authPrompt}
                                </p>
                            )}

                            <h1 className="text-4xl font-bold text-primary mb-5">Sign In</h1>

                            <p className="text-sm text-charcoal-blue/80 mb-5">Use your account credentials:</p>

                            {error && <p className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</p>}
                            {resendMessage && <p className="mb-3 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">{resendMessage}</p>}
                            {verificationUrl && (
                                <p className="mb-3 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-sm text-blue-800 break-all">
                                    Dev verification link: <a href={verificationUrl} className="underline">{verificationUrl}</a>
                                </p>
                            )}

                            <div className="space-y-3 text-left">
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
                onClick={handleLogin}
                                className="mt-7 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold tracking-wide text-white hover:bg-charcoal-blue"
                            >
                                SIGN IN
                            </button>

                            {error.toLowerCase().includes("verify your email") && (
                                <button
                                    type="button"
                                    onClick={handleResendVerification}
                                    disabled={isResending}
                                    className="mt-3 w-full rounded-full border border-primary-dark/20 bg-white px-6 py-3 text-sm font-semibold tracking-wide text-primary-dark hover:bg-accent/30 disabled:opacity-70"
                                >
                                    {isResending ? "RESENDING..." : "RESEND VERIFICATION EMAIL"}
                                </button>
                            )}
                        </div>
                    </section>
        </div>
            </div>
        </div>
    );
}
