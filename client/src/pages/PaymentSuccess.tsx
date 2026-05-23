import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { buildApiUrl } from "../config/api";

type PaymentState = "loading" | "success" | "error";

type BookingSummary = {
  id: number;
  petName: string;
  doctorName?: string;
  ownerName?: string;
  scheduledAt: string;
  paidStatus?: 0 | 1;
};

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState<PaymentState>("loading");
  const [message, setMessage] = useState("Confirming your payment...");
  const [booking, setBooking] = useState<BookingSummary | null>(null);
  const [confirmedBookingId, setConfirmedBookingId] = useState<number | null>(null);

  useEffect(() => {
    const confirmPayment = async () => {
      const sessionId = new URLSearchParams(location.search).get("session_id");

      if (!sessionId) {
        setState("error");
        setMessage("Missing payment session.");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(buildApiUrl("/users/bookings/payment/confirm"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ sessionId }),
        });

        if (!res.ok) {
          const errRes = await res.json().catch(() => ({}));
          throw new Error(errRes.error || "Payment confirmation failed");
        }

        const data: { bookingId?: number; paidStatus?: 0 | 1 } = await res.json();

        setState("success");
        setMessage("Thank you for choosing Ask The Vets!");
        setConfirmedBookingId(data.bookingId ?? null);
        const scheduleRes = await fetch(buildApiUrl("/users/me/schedule"), {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (scheduleRes.ok) {
          const scheduleItems: BookingSummary[] = await scheduleRes.json();
          setBooking(scheduleItems.find(item => item.id === data.bookingId) ?? null);
        }
      } catch (error) {
        console.error(error);
        setState("error");
        setMessage(error instanceof Error ? error.message : "Could not confirm your payment.");
      }
    };

    confirmPayment();
  }, [location.search]);

  return (
    <div className="md:ml-64 min-h-screen bg-background px-6 py-10 flex items-center justify-center">
      <div className="w-full max-w-2xl rounded-3xl border border-primary-dark/15 bg-primary-light shadow-lg p-8 md:p-10 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-charcoal-blue mb-3">
          {state === "loading" ? "Processing payment" : state === "success" ? "Payment complete" : "Payment issue"}
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-primary-dark leading-tight">{message}</h1>
        {state === "success" && (
          <div className="mt-4 space-y-3">
            <p className="text-charcoal-blue text-lg">
              {booking?.paidStatus === 1 ? "Your booking has been marked as paid." : "Your booking is still pending payment confirmation."}
            </p>
            {booking && confirmedBookingId !== null && (
              <div className="rounded-2xl border border-primary-dark/15 bg-white/70 px-4 py-3 text-left">
                <p className="text-xs uppercase tracking-wide text-charcoal-blue">
                  {booking.paidStatus === 1 ? "Paid booking" : "Booking"}
                </p>
                <p className="text-xl font-semibold text-primary-dark mt-1">{booking.petName}</p>
                <p className="text-sm text-charcoal-blue mt-1">
                  {new Date(booking.scheduledAt).toLocaleString()}
                </p>
                <p className="text-sm text-charcoal-blue mt-1">
                  With {booking.doctorName || booking.ownerName || "Ask The Vets"}
                </p>
                <p className="text-sm mt-2 font-semibold text-primary-dark">
                  {booking.paidStatus === 1 ? "Payment complete" : "Not paid yet"}
                </p>
              </div>
            )}
          </div>
        )}
        {state === "error" && (
          <p className="mt-4 text-red-700 text-lg">
            If you completed payment, you can return to your bookings and refresh the page.
          </p>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => navigate("/doctor/schedule")}
            className="rounded-lg bg-primary-dark px-5 py-3 text-white font-semibold hover:opacity-90 transition"
          >
            Go to My Bookings
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