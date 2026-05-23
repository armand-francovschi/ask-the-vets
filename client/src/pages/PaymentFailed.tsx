import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function PaymentFailed() {
  const location = useLocation();
  const navigate = useNavigate();

  const bookingId = useMemo(() => {
    const raw = new URLSearchParams(location.search).get("booking_id");
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }, [location.search]);

  return (
    <div className="md:ml-64 min-h-screen bg-background px-6 py-10 flex items-center justify-center">
      <div className="w-full max-w-2xl rounded-3xl border border-primary-dark/15 bg-primary-light shadow-lg p-8 md:p-10 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-charcoal-blue mb-3">Payment not completed</p>
        <h1 className="text-4xl md:text-5xl font-bold text-primary-dark leading-tight">
          Your payment did not go through.
        </h1>
        <p className="mt-4 text-charcoal-blue text-lg">
          No worries. You can retry payment from your bookings page.
        </p>
        {bookingId && (
          <p className="mt-2 text-sm text-charcoal-blue">Booking ID: {bookingId}</p>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => navigate("/doctor/schedule")}
            className="rounded-lg bg-primary-dark px-5 py-3 text-white font-semibold hover:opacity-90 transition"
          >
            Back to My Bookings
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-lg border border-primary-dark/20 bg-white px-5 py-3 text-primary-dark font-semibold hover:bg-accent transition"
          >
            Go home
          </button>
        </div>
      </div>
    </div>
  );
}
