import React, { useEffect, useMemo, useState } from "react";
import { useUpdateMedical } from "../components/UpdateMedical/functions/useUpdateMedical";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL, buildApiUrl } from "../config/api";

interface Doctor {
  id: number;
  name: string;
  image?: string;
}

interface DayAvailability {
  date: string;
  hasFreeSlot: boolean;
  slots: {
    slotStartHour: number;
    label: string;
    isBooked: boolean;
  }[];
}

interface PendingBooking {
  date: string;
  slotStartHour: number;
  slotLabel: string;
}

const CALENDAR_DAYS = 1;

const toDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getTodayString = () => toDateString(new Date());

const getSlotStart = (slotLabel: string, fallbackHour: number) => {
  const start = slotLabel.split(" - ")[0]?.trim();
  return start || `${String(fallbackHour).padStart(2, "0")}:00`;
};

const getSlotEnd = (slotLabel: string, fallbackHour: number) => {
  const end = slotLabel.split(" - ")[1]?.trim();
  return end || `${String(fallbackHour + 1).padStart(2, "0")}:00`;
};

const getPendingBookingKey = (pendingBooking: PendingBooking | null) => {
  if (!pendingBooking) return null;
  return `${pendingBooking.date}-${pendingBooking.slotStartHour}`;
};

const ContactVet: React.FC = () => {
  const { user } = useAuth();
  const { filteredPets, selectedPet, setSelectedPet } = useUpdateMedical();
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [startDate, setStartDate] = useState<string>(getTodayString());
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [bookingSlot, setBookingSlot] = useState<string | null>(null);
  const [pendingBooking, setPendingBooking] = useState<PendingBooking | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dayAnimationDirection, setDayAnimationDirection] = useState<"prev" | "next">("next");
  const [petWindowStart, setPetWindowStart] = useState(0);
  const [doctorWindowStart, setDoctorWindowStart] = useState(0);

  const getPetImageUrl = (path?: string) =>
    path ? `${API_BASE_URL}/uploads/${path}` : "/icons/document-icon.png";

  const getDoctorImageUrl = (path?: string) =>
    path ? `${API_BASE_URL}/uploads/${path}` : "/icons/document-icon.png";

  const selectedDoctor = useMemo(
    () => doctors.find(doctor => doctor.id === selectedDoctorId) || null,
    [doctors, selectedDoctorId]
  );

  const pendingBookingKey = useMemo(() => getPendingBookingKey(pendingBooking), [pendingBooking]);

  const selectionStage = !selectedPet ? "pet" : !selectedDoctor ? "doctor" : "ready";

  const visiblePets = useMemo(
    () => filteredPets.slice(petWindowStart, petWindowStart + 2),
    [filteredPets, petWindowStart]
  );

  const visibleDoctors = useMemo(
    () => doctors.slice(doctorWindowStart, doctorWindowStart + 2),
    [doctors, doctorWindowStart]
  );

  const displayedWeekStartDate = useMemo(() => new Date(`${startDate}T00:00:00`), [startDate]);

  const isAtOrBeforeToday = useMemo(() => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const shownDayStart = new Date(
      displayedWeekStartDate.getFullYear(),
      displayedWeekStartDate.getMonth(),
      displayedWeekStartDate.getDate()
    );
    return shownDayStart.getTime() <= todayStart.getTime();
  }, [displayedWeekStartDate]);

  useEffect(() => {
    setSelectedPet(null);
  }, [filteredPets, setSelectedPet]);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      setError(null);
      try {
        const res = await fetch(buildApiUrl("/users/doctors"));
        if (!res.ok) throw new Error("Failed to fetch doctors");
        const data: Doctor[] = await res.json();
        setDoctors(data);
      } catch (err) {
        console.error(err);
        setError("Could not load doctors.");
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    const maxStart = Math.max(0, filteredPets.length - 2);
    if (petWindowStart > maxStart) {
      setPetWindowStart(maxStart);
    }
  }, [filteredPets.length, petWindowStart]);

  useEffect(() => {
    const maxStart = Math.max(0, doctors.length - 2);
    if (doctorWindowStart > maxStart) {
      setDoctorWindowStart(maxStart);
    }
  }, [doctors.length, doctorWindowStart]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedDoctorId) {
        setAvailability([]);
        return;
      }

      setLoadingAvailability(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          startDate,
          days: String(CALENDAR_DAYS),
        });

        const res = await fetch(
          `${buildApiUrl(`/users/doctors/${selectedDoctorId}/availability`)}?${params.toString()}`
        );

        if (!res.ok) throw new Error("Failed to fetch availability");
        const data: { availability: DayAvailability[] } = await res.json();
        setAvailability(data.availability || []);
      } catch (err) {
        console.error(err);
        setError("Could not load doctor availability.");
      } finally {
        setLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [selectedDoctorId, startDate]);

  const handleBookClick = (date: string, slotStartHour: number, slotLabel: string) => {
    if (!selectedDoctorId || !selectedPet?.id) return;
    setError(null);
    setMessage(null);
    setPendingBooking({ date, slotStartHour, slotLabel });
  };

  const handlePreviousWeek = () => {
    if (isAtOrBeforeToday) return;
    setDayAnimationDirection("prev");
    const previous = new Date(displayedWeekStartDate);
    previous.setDate(previous.getDate() - CALENDAR_DAYS);
    setStartDate(toDateString(previous));
  };

  const handleNextWeek = () => {
    setDayAnimationDirection("next");
    const next = new Date(displayedWeekStartDate);
    next.setDate(next.getDate() + CALENDAR_DAYS);
    setStartDate(toDateString(next));
  };

  const handleConfirmBooking = async () => {
    if (!selectedDoctorId || !selectedPet?.id || !pendingBooking) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to book a slot.");
      return;
    }

    setError(null);
    setMessage(null);
    const { date, slotStartHour } = pendingBooking;
    const bookingKey = `${date}-${slotStartHour}`;
    setBookingSlot(bookingKey);

    try {
      const res = await fetch(buildApiUrl("/users/bookings"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId: selectedDoctorId,
          petId: selectedPet.id,
          date,
          slotStartHour,
        }),
      });

      if (!res.ok) {
        const errRes = await res.json().catch(() => ({}));
        throw new Error(errRes.error || "Failed to book slot");
      }

      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 1800);
      setPendingBooking(null);

      setAvailability(prev =>
        prev.map(day =>
          day.date !== date
            ? day
            : {
                ...day,
                slots: day.slots.map(slot =>
                  slot.slotStartHour === slotStartHour ? { ...slot, isBooked: true } : slot
                ),
                hasFreeSlot: day.slots.some(
                  slot => slot.slotStartHour !== slotStartHour && !slot.isBooked
                ),
              }
        )
      );
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to book slot.");
    } finally {
      setBookingSlot(null);
    }
  };

  return (
    <div className="md:ml-64 p-3 md:p-8 min-h-screen relative bg-background">
      <div className="w-full max-w-6xl mx-auto rounded-2xl border border-primary-dark/15 overflow-hidden shadow-lg">
        <div className="bg-[#2f3245] px-4 md:px-8 py-4 md:py-6 text-white">
          <h1 className="text-5xl md:text-6xl font-semibold mb-5 text-center tracking-tight">Contact a Vet</h1>

          {Array.isArray(filteredPets) && filteredPets.length === 0 && (
            <div className="p-6 bg-yellow-100 border border-yellow-300 rounded text-center text-lg text-primary-dark">
              You currently have no pets added. To book a consultation, use the "Medical Info" page to add a pet first.
            </div>
          )}

          {Array.isArray(filteredPets) && filteredPets.length > 0 && (
            <div className="space-y-6">
              {selectionStage === "pet" && (
                <section className="space-y-3 contact-enter">
                  <h2 className="text-3xl font-medium text-white text-center md:text-left">Select Pet</h2>
                  <div className="mx-auto md:mx-0 flex items-center justify-center md:justify-start gap-2">
                    <button
                      type="button"
                      aria-label="Previous pets"
                      className={`w-9 h-9 rounded-full border items-center justify-center flex ${
                        petWindowStart === 0
                          ? "border-white/20 bg-white/5 text-white/40 cursor-not-allowed"
                          : "border-white/35 bg-white/10 text-white hover:bg-white/20"
                      }`}
                      onClick={() => setPetWindowStart(prev => Math.max(0, prev - 1))}
                      disabled={petWindowStart === 0}
                    >
                      &#8249;
                    </button>
                    <div className="w-[300px] max-w-full flex gap-3 px-0 py-1">
                      {visiblePets.map((pet) => (
                        <button
                          key={pet.id}
                          className="w-[144px] min-w-[144px] shrink-0 px-3 py-3 rounded-2xl border border-black/10 text-primary-dark bg-[#f5f2ea] contact-card-enter"
                          onClick={() => {
                            setSelectedPet(pet);
                            setSelectedDoctorId(null);
                            setPetWindowStart(0);
                            setDoctorWindowStart(0);
                            setStartDate(getTodayString());
                            setAvailability([]);
                            setMessage(null);
                            setError(null);
                          }}
                        >
                          <div className="flex flex-col items-center text-center">
                            <img src={getPetImageUrl(pet.image)} alt={pet.name} className="w-24 h-24 object-cover rounded-xl" />
                            <p className="mt-2 text-3xl font-semibold uppercase leading-none">{pet.name}</p>
                            <p className="text-xl text-charcoal-blue leading-none mt-1">{pet.breed}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      aria-label="Next pets"
                      className={`w-9 h-9 rounded-full border items-center justify-center flex ${
                        petWindowStart >= Math.max(0, filteredPets.length - 2)
                          ? "border-white/20 bg-white/5 text-white/40 cursor-not-allowed"
                          : "border-white/35 bg-white/10 text-white hover:bg-white/20"
                      }`}
                      onClick={() => setPetWindowStart(prev => Math.min(Math.max(0, filteredPets.length - 2), prev + 1))}
                      disabled={petWindowStart >= Math.max(0, filteredPets.length - 2)}
                    >
                      &#8250;
                    </button>
                  </div>
                </section>
              )}

              {selectionStage === "doctor" && selectedPet && (
                <div className="grid md:grid-cols-[280px_minmax(0,1fr)] gap-5 md:gap-8 items-start contact-enter-delay">
                  <aside className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                    <p className="text-sm uppercase tracking-[0.2em] text-white/70 mb-2">Selected Pet</p>
                    <div className="flex items-center gap-3">
                      <img src={getPetImageUrl(selectedPet.image)} alt={selectedPet.name} className="w-20 h-20 object-cover rounded-xl" />
                      <div>
                        <p className="text-3xl font-semibold leading-none uppercase">{selectedPet.name}</p>
                        <p className="text-lg text-white/80 mt-1 leading-none">{selectedPet.breed}</p>
                      </div>
                    </div>
                  </aside>

                  <section className="space-y-3">
                    <h2 className="text-3xl font-medium text-white text-center md:text-left">Select Doctor</h2>
                    <div className="mx-auto md:mx-0 flex items-center justify-center md:justify-start gap-2">
                      <button
                        type="button"
                        aria-label="Previous doctors"
                        className={`w-9 h-9 rounded-full border items-center justify-center flex ${
                          doctorWindowStart === 0
                            ? "border-white/20 bg-white/5 text-white/40 cursor-not-allowed"
                            : "border-white/35 bg-white/10 text-white hover:bg-white/20"
                        }`}
                        onClick={() => setDoctorWindowStart(prev => Math.max(0, prev - 1))}
                        disabled={doctorWindowStart === 0}
                      >
                        &#8249;
                      </button>
                      <div className="w-[300px] max-w-full flex gap-3 px-0 py-1 justify-start">
                        {visibleDoctors.map((doctor) => (
                          <button
                            key={doctor.id}
                            className={`w-[144px] min-w-[144px] shrink-0 px-3 py-3 rounded-2xl border transition contact-card-enter ${
                              selectedDoctorId === doctor.id
                                ? "bg-[#b98ba4] border-[#b98ba4] text-white"
                                : "bg-[#f5f2ea] border-black/10 text-primary-dark"
                            }`}
                            onClick={() => {
                              setSelectedDoctorId(doctor.id);
                              setStartDate(getTodayString());
                              setMessage(null);
                              setError(null);
                            }}
                            disabled={loadingDoctors}
                          >
                            <div className="flex flex-col items-center text-center">
                              <img src={getDoctorImageUrl(doctor.image)} alt={doctor.name} className="w-24 h-24 object-cover rounded-xl" />
                              <p className="mt-2 text-3xl font-semibold leading-none">{doctor.name}</p>
                              <p className={`text-xl leading-none mt-1 ${selectedDoctorId === doctor.id ? "text-white/90" : "text-charcoal-blue"}`}>
                                Veterinarian
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        aria-label="Next doctors"
                        className={`w-9 h-9 rounded-full border items-center justify-center flex ${
                          doctorWindowStart >= Math.max(0, doctors.length - 2)
                            ? "border-white/20 bg-white/5 text-white/40 cursor-not-allowed"
                            : "border-white/35 bg-white/10 text-white hover:bg-white/20"
                        }`}
                        onClick={() => setDoctorWindowStart(prev => Math.min(Math.max(0, doctors.length - 2), prev + 1))}
                        disabled={doctorWindowStart >= Math.max(0, doctors.length - 2)}
                      >
                        &#8250;
                      </button>
                    </div>
                  </section>
                </div>
              )}

              {selectionStage === "ready" && selectedPet && selectedDoctor && (
                <p className="text-2xl md:text-3xl font-medium text-center text-white bg-white/10 border border-white/20 rounded-xl px-4 py-3 contact-sentence-enter">
                  Booking a consultation for {selectedPet.name} with {selectedDoctor.name}
                </p>
              )}

              {loadingDoctors && <p className="text-accent">Loading doctors...</p>}
              {error && <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              {message && <p className="text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{message}</p>}
            </div>
          )}
        </div>

        {selectedDoctor && availability.length > 0 && (
          <section className="bg-[#f6f3ea] px-4 md:px-8 py-4 md:py-5">
            <div className="flex items-center justify-between gap-3 mb-3">
              <button
                className={`inline-flex items-center gap-2 text-xl md:text-2xl ${
                  isAtOrBeforeToday ? "text-rosy-granite cursor-not-allowed" : "text-primary-dark"
                }`}
                onClick={handlePreviousWeek}
                disabled={isAtOrBeforeToday}
              >
                <span className="text-3xl leading-none">&#8249;</span>
                <span>Previous day</span>
              </button>

              <p className="text-3xl md:text-4xl text-primary-dark font-medium">
                {displayedWeekStartDate.toLocaleDateString()}
              </p>

              <button
                className="inline-flex items-center gap-2 text-xl md:text-2xl text-primary-dark"
                onClick={handleNextWeek}
              >
                <span>Next day</span>
                <span className="text-3xl leading-none">&#8250;</span>
              </button>
            </div>

            {loadingAvailability && <p className="text-charcoal-blue">Loading availability...</p>}

            {!loadingAvailability && availability.map(day => (
              <div
                key={day.date}
                className={`rounded-xl border border-primary-dark/12 bg-transparent p-2 ${
                  dayAnimationDirection === "next" ? "contact-day-slide-next" : "contact-day-slide-prev"
                }`}
              >
                <div className="grid grid-cols-3 items-center gap-3 px-2 pb-2 border-b border-primary-dark/20 mb-2">
                  <div className="text-2xl text-primary-dark">Start time</div>
                  <div className="text-2xl text-primary-dark">End time</div>
                  <div className="text-2xl text-primary-dark">Book</div>
                </div>

                <div className="space-y-1.5">
                  {day.slots.map(slot => {
                    const slotKey = `${day.date}-${slot.slotStartHour}`;
                    const isBooking = bookingSlot === slotKey;
                    const isPendingThisSlot = pendingBookingKey === slotKey;
                    const startLabel = getSlotStart(slot.label, slot.slotStartHour);
                    const endLabel = getSlotEnd(slot.label, slot.slotStartHour);

                    return (
                      <React.Fragment key={slotKey}>
                        <div
                          className={`grid grid-cols-3 items-center gap-3 px-2 py-1 rounded-md transition ${
                            isPendingThisSlot ? "bg-accent/35 shadow-[0_0_0_1px_rgba(68,69,84,0.18),0_0_14px_rgba(229,208,204,0.9)]" : ""
                          }`}
                        >
                          <div className="text-xl text-primary-dark">{startLabel}</div>
                          <div className="text-xl text-primary-dark">{endLabel}</div>
                          <button
                            className={`h-10 rounded-lg border text-xl font-medium transition ${
                              slot.isBooked
                                ? "bg-slate-200 text-slate-500 cursor-not-allowed border-slate-300"
                                : "bg-background border-primary-dark/18 text-primary-dark hover:bg-accent/55"
                            }`}
                            disabled={slot.isBooked || !selectedPet || isBooking || !user}
                            onClick={() => handleBookClick(day.date, slot.slotStartHour, slot.label)}
                          >
                            {isBooking ? "..." : slot.isBooked ? "Already booked" : "Book"}
                          </button>
                        </div>

                        {isPendingThisSlot && (
                          <div className="grid grid-cols-3 items-center gap-3 px-2 pb-2 contact-confirm-slide-in">
                            <div className="col-start-3 rounded-lg border border-primary-dark/20 bg-background/85 p-2 flex flex-col md:flex-row items-center justify-center gap-2">
                              <button
                                className="h-9 w-full md:w-auto px-3 rounded-md border border-primary-light/70 text-primary-dark hover:bg-lilac-ash/35"
                                onClick={() => setPendingBooking(null)}
                              >
                                Cancel
                              </button>
                              <button
                                className="h-9 w-full md:w-auto px-3 rounded-md bg-primary-dark text-white hover:opacity-90"
                                onClick={handleConfirmBooking}
                              >
                                Confirm
                              </button>
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        )}

        {Array.isArray(filteredPets) && filteredPets.length > 0 && doctors.length === 0 && !loadingDoctors && (
          <div className="m-4 p-4 border border-yellow-200 rounded-lg bg-yellow-50 text-yellow-800">
            No doctors are available right now.
          </div>
        )}
      </div>

      {showSuccessPopup && (
        <div className="fixed inset-0 z-[10060] flex items-center justify-center pointer-events-none p-4">
          <div className="rounded-xl bg-primary-light border border-primary-dark/20 text-primary-dark px-6 py-4 shadow-lg font-semibold">
            Booking successful!
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactVet;
