import { useEffect, useState } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import { verifyEmailToken } from "../../api/auth";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const statusParam = searchParams.get("status");
    const messageParam = searchParams.get("message");

    if (statusParam === "success") {
      setStatus("success");
      setMessage(messageParam || "Email verified successfully. You can now log in.");
      return;
    }

    if (statusParam === "error") {
      setStatus("error");
      setMessage(messageParam || "Verification failed. The token may be invalid or expired.");
      return;
    }

    const token = searchParams.get("token") || "";

    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }

    const runVerification = async () => {
      try {
        const res = await verifyEmailToken(token);
        setStatus("success");
        setMessage(res.message || "Email verified successfully. You can now log in.");
      } catch (err: any) {
        setStatus("error");
        setMessage(err?.message || "Verification failed. The token may be invalid or expired.");
      }
    };

    void runVerification();
  }, [searchParams]);

  return (
    <div className="md:ml-64 min-h-screen bg-background px-4 py-8 md:py-14 flex items-center justify-center">
      <div className="w-full max-w-xl rounded-3xl overflow-hidden border border-primary-dark/10 bg-white shadow-xl p-8 text-center">
        <h1 className="text-3xl font-bold text-primary mb-4">Email Verification</h1>
        {status === "loading" && <p className="text-charcoal-blue">{message}</p>}
        {status === "success" && <p className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-green-700">{message}</p>}
        {status === "error" && <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700">{message}</p>}

        <div className="mt-6">
          <NavLink
            to="/login"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold tracking-wide text-white hover:bg-charcoal-blue"
          >
            Go To Login
          </NavLink>
        </div>
      </div>
    </div>
  );
}
