import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { buildApiUrl } from "../config/api";
import VideoCall from "../components/ContactVet/VideoCall";

interface DoctorScheduleItem {
  id: number;
  doctorId: number;
  ownerId?: number;
  petId?: number;
  petName: string;
  ownerName: string;
  doctorName?: string;
  type: "video";
  scheduledAt: string;
  status: "scheduled" | "completed" | "cancelled";
  paidStatus: 0 | 1;
  petMedicalFiles?: string[];
  notes?: string;
}

const DoctorSchedule: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState<DoctorScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [activeCall, setActiveCall] = useState<DoctorScheduleItem | null>(null);
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string>("");
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const otherBookingsRef = useRef<HTMLDivElement | null>(null);
  const paymentHandledRef = useRef(false);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
    [items]
  );

  const closestUpcomingBookingId = useMemo(() => {
    const now = Date.now();
    const upcoming = sortedItems.find(item => {
      const scheduledTime = new Date(item.scheduledAt).getTime();
      return item.status === "scheduled" && scheduledTime >= now;
    });
    return upcoming?.id ?? sortedItems[0]?.id ?? null;
  }, [sortedItems]);

  const selectedBooking = useMemo(
    () => sortedItems.find(item => item.id === selectedBookingId) || null,
    [sortedItems, selectedBookingId]
  );

  const otherBookings = useMemo(
    () => sortedItems.filter(item => item.id !== selectedBookingId),
    [sortedItems, selectedBookingId]
  );

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to view your bookings.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(buildApiUrl("/users/me/schedule"), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Failed to load bookings");
        }

        const data: DoctorScheduleItem[] = await res.json();
        setItems(data);

        const sorted = [...data].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
        const now = Date.now();
        const upcoming = sorted.find(item => {
          const scheduledTime = new Date(item.scheduledAt).getTime();
          return item.status === "scheduled" && scheduledTime >= now;
        });
        setSelectedBookingId(upcoming?.id ?? sorted[0]?.id ?? null);
      } catch (err) {
        console.error(err);
        setError("Could not load your bookings right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  useEffect(() => {
    const sessionId = new URLSearchParams(location.search).get("session_id");
    if (!sessionId || !user || paymentHandledRef.current) return;

    const confirmPayment = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await fetch(buildApiUrl("/users/bookings/payment/confirm"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ sessionId }),
        });

        if (!res.ok) {
          throw new Error("Failed to confirm payment");
        }

        const data: { bookingId?: number } = await res.json();
        if (data.bookingId) {
          setItems(prev => prev.map(item => (item.id === data.bookingId ? { ...item, paidStatus: 1 } : item)));
          setSelectedBookingId(prev => prev ?? data.bookingId ?? null);
        }

        paymentHandledRef.current = true;
        navigate("/doctor/schedule", { replace: true });
      } catch (err) {
        console.error(err);
        setError("Payment was completed, but we could not update the booking automatically.");
      }
    };

    confirmPayment();
  }, [location.search, navigate, user]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const handleHangUp = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = window.setTimeout(() => {
      setActiveCall(null);
      closeTimerRef.current = null;
    }, 3000);
  };

  const scrollOtherBookings = (direction: "left" | "right") => {
    if (!otherBookingsRef.current) return;
    const distance = otherBookingsRef.current.clientWidth * 0.78;
    otherBookingsRef.current.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  const handlePayNow = async () => {
    if (!selectedBooking || selectedBooking.paidStatus === 1) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to continue to payment.");
      return;
    }

    setError(null);
    setIsStartingCheckout(true);

    try {
      const res = await fetch(buildApiUrl(`/users/bookings/${selectedBooking.id}/pay`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errRes = await res.json().catch(() => ({}));
        throw new Error(errRes.error || "Could not start payment checkout");
      }

      const data: { url?: string } = await res.json();
      if (!data.url) {
        throw new Error("Stripe checkout URL was not returned");
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Could not start payment checkout.");
    } finally {
      setIsStartingCheckout(false);
    }
  };

  if (!user) {
    return <div className="md:ml-64 p-8 min-h-screen">Please log in to access this page.</div>;
  }

  return (
    <div className="md:ml-64 p-8 min-h-screen bg-background">
      <div className="w-full md:w-[60vw] mx-auto">
        <h1 className="text-4xl font-bold text-primary-dark mb-2">My Bookings</h1>
        <p className="text-gray-600 mb-8">Your closest upcoming booking is shown first. Select any other booking below.</p>

        {loading && <p>Loading bookings...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && items.length === 0 && (
          <div className="bg-primary-light rounded-lg p-6 border">
            No bookings yet.
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2 gap-3">
              <h3 className="text-lg font-semibold text-primary-dark">Other bookings</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous bookings"
                  onClick={() => scrollOtherBookings("left")}
                  className="w-8 h-8 rounded-full border border-primary-dark/20 bg-background text-primary-dark hover:bg-accent transition"
                >
                  &#8249;
                </button>
                <button
                  type="button"
                  aria-label="Next bookings"
                  onClick={() => scrollOtherBookings("right")}
                  className="w-8 h-8 rounded-full border border-primary-dark/20 bg-background text-primary-dark hover:bg-accent transition"
                >
                  &#8250;
                </button>
              </div>
            </div>

            <div ref={otherBookingsRef} className="flex gap-3 overflow-x-auto no-scrollbar pb-2 scroll-smooth">
              {otherBookings.map(item => (
                <button
                  key={item.id}
                  className="min-w-[260px] max-w-[300px] text-left rounded-lg p-4 border transition flex-shrink-0 bg-white/60 border-primary-dark/15 hover:bg-primary-light/50"
                  onClick={() => setSelectedBookingId(item.id)}
                >
                  <h4 className="text-base font-semibold text-primary-dark truncate">
                    {item.petName} • {user.role === "doctor" ? item.ownerName : (item.doctorName || "Doctor")}
                  </h4>
                  <p className="mt-1 text-sm text-charcoal-blue">{new Date(item.scheduledAt).toLocaleString()}</p>
                  <p className="mt-1 text-xs text-charcoal-blue">
                    Paid status: {item.paidStatus === 1 ? "Paid" : "Not paid"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {selectedBooking && (
            <div className="bg-primary-light rounded-2xl p-6 md:p-7 border border-primary-dark/15 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4 md:gap-6">
                <div className="flex-1 min-w-[260px]">
                  <p className="text-sm uppercase tracking-wide text-charcoal-blue mb-1">
                    {selectedBooking.id === closestUpcomingBookingId ? "Closest upcoming booking" : "Selected booking"}
                  </p>
                  <h2 className="text-3xl font-semibold text-primary-dark leading-tight">
                    {selectedBooking.petName} • {user.role === "doctor" ? selectedBooking.ownerName : (selectedBooking.doctorName || "Doctor")}
                  </h2>
                  <p className="mt-2 text-charcoal-blue text-base">{new Date(selectedBooking.scheduledAt).toLocaleString()}</p>
                </div>
                <div
                  className={`rounded-lg border px-3 py-2 max-w-xs w-full sm:w-auto ${
                    selectedBooking.paidStatus === 1
                      ? "bg-green-50 border-green-200"
                      : "bg-amber-50 border-amber-200"
                  }`}
                >
                  <p className="text-xs uppercase tracking-wide text-charcoal-blue">Payment status</p>
                  <p
                    className={`text-sm font-semibold mt-1 ${
                      selectedBooking.paidStatus === 1 ? "text-green-800" : "text-amber-800"
                    }`}
                  >
                    {selectedBooking.paidStatus === 1 ? "Payment complete" : "Not paid yet"}
                  </p>
                  {selectedBooking.paidStatus !== 1 && selectedBooking.ownerId === user.id && (
                    <div className="mt-2 space-y-2">
                      <p className="text-xs text-primary-dark">Payment required before consult.</p>
                      <button
                        type="button"
                        onClick={handlePayNow}
                        disabled={isStartingCheckout}
                        className="inline-flex items-center justify-center rounded-md bg-primary-dark px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isStartingCheckout ? "Starting checkout..." : "Pay now"}
                      </button>
                    </div>
                  )}
                  {selectedBooking.paidStatus !== 1 && selectedBooking.ownerId !== user.id && (
                    <p className="mt-2 text-xs text-primary-dark">Not paid yet.</p>
                  )}
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-primary-dark/15 bg-background/65 p-4 md:p-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <p className="text-sm uppercase tracking-wide text-charcoal-blue">Documents for this pet</p>
                  <span className="text-xs text-charcoal-blue/80">
                    {selectedBooking.petMedicalFiles?.length || 0} file(s)
                  </span>
                </div>
                <div>
                  {selectedBooking.petMedicalFiles && selectedBooking.petMedicalFiles.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedBooking.petMedicalFiles.map((file, idx) => (
                        <li key={`${file}-${idx}`}>
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewFileName(file);
                              const isPdf = file.toLowerCase().endsWith(".pdf");
                              const encodedFile = encodeURIComponent(file);
                              setPreviewFileUrl(
                                isPdf
                                  ? buildApiUrl(`/uploads/preview/${encodedFile}`)
                                  : buildApiUrl(`/uploads/${encodedFile}`)
                              );
                            }}
                            className="inline-flex w-full items-center justify-between gap-3 rounded-md border border-primary-dark/20 bg-accent/55 px-3 py-2 text-sm text-primary-dark hover:bg-accent transition"
                            title={file}
                          >
                            <span className="truncate">{file}</span>
                            <span className="font-medium whitespace-nowrap">Preview</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-charcoal-blue">No medical documents uploaded for this pet yet.</p>
                  )}
                </div>
              </div>

              {selectedBooking.notes && (
                <p className="mt-3 text-sm text-charcoal-blue">{selectedBooking.notes}</p>
              )}

              <div className="mt-4">
                <button
                  className="px-4 py-2 rounded bg-primary-dark text-white hover:opacity-90 w-36"
                  onClick={() => setActiveCall(selectedBooking)}
                >
                  Join Call
                </button>
              </div>
            </div>
          )}

          {activeCall && (
            <div className="bg-primary-light/30 border rounded-xl p-3">
              <VideoCall
                key={activeCall.id}
                scheduleId={activeCall.id}
                petId={activeCall.petId}
                petName={activeCall.petName}
                doctorName={activeCall.doctorName || "Doctor"}
                embedded
                onHangUp={handleHangUp}
              />
            </div>
          )}

          {previewFileUrl && (
            <div
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
              onClick={() => setPreviewFileUrl(null)}
              role="dialog"
              aria-modal="true"
              aria-label="Medical document preview"
            >
              <div
                className="w-full max-w-5xl h-[85vh] bg-white rounded-xl shadow-xl border border-primary-dark/20 flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-4 py-3 border-b border-primary-dark/15 flex items-center justify-between gap-3">
                  <h3 className="text-base md:text-lg font-semibold text-primary-dark truncate" title={previewFileName}>
                    {previewFileName}
                  </h3>
                  <div className="flex items-center gap-2">
                    <a
                      href={previewFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded bg-accent text-primary-dark text-sm font-medium hover:opacity-90"
                    >
                      Open in new tab
                    </a>
                    <button
                      type="button"
                      onClick={() => setPreviewFileUrl(null)}
                      className="px-3 py-1.5 rounded bg-primary-dark text-white text-sm font-medium hover:opacity-90"
                    >
                      Close
                    </button>
                  </div>
                </div>

                <div className="flex-1 bg-background">
                  <iframe
                    src={previewFileUrl}
                    title={previewFileName || "Medical document"}
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
          )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorSchedule;
