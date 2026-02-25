import React, { useEffect, useMemo, useState } from "react";
import { useUpdateMedical } from "../components/UpdateMedical/functions/useUpdateMedical";
import { useAuth } from "../context/AuthContext";

interface Doctor {
  id: number;
  name: string;
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

const CALENDAR_DAYS = 7;

const getTodayString = () => new Date().toISOString().slice(0, 10);

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
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getPetImageUrl = (path?: string) =>
    path ? `http://localhost:5000/uploads/${path}` : "/default-pet.png";

  const selectedDoctor = useMemo(
    () => doctors.find(doctor => doctor.id === selectedDoctorId) || null,
    [doctors, selectedDoctorId]
  );

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      setError(null);
      try {
        const res = await fetch("http://localhost:5000/users/doctors");
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
          `http://localhost:5000/users/doctors/${selectedDoctorId}/availability?${params.toString()}`
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

  const handleBook = async (date: string, slotStartHour: number) => {
    if (!selectedDoctorId || !selectedPet?.id) return;
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to book a slot.");
      return;
    }

    setError(null);
    setMessage(null);
    const bookingKey = `${date}-${slotStartHour}`;
    setBookingSlot(bookingKey);

    try {
      const res = await fetch("http://localhost:5000/users/bookings", {
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

      setMessage("Booking confirmed.");

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
    <div className="p-6 md:p-10 max-w-6xl mx-auto min-h-screen relative">
      <h1 className="text-4xl md:text-5xl font-bold mb-10 text-center">Contact a Vet</h1>

      {Array.isArray(filteredPets) && filteredPets.length === 0 && (
        <div className="p-6 bg-yellow-100 border border-yellow-300 rounded text-center text-lg">
          You currently have no pets added. To book a consultation, use the "Medical Info" page to add a pet first.
        </div>
      )}

      {Array.isArray(filteredPets) && filteredPets.length > 0 && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredPets.map((pet) => (
              <button
                key={pet.id}
                className={`flex items-center gap-4 p-4 border rounded-lg transition-all duration-200 w-full text-left ${
                  selectedPet?.id === pet.id ? "bg-primary-light border-primary-dark" : "hover:bg-gray-100"
                }`}
                onClick={() => setSelectedPet(pet)}
              >
                <img
                  src={getPetImageUrl(pet.image)}
                  alt={pet.name}
                  className="w-20 h-20 object-cover rounded-full border-2"
                />
                <div className="flex flex-col">
                  <p className="text-xl font-semibold">{pet.name}</p>
                  <p className="text-sm text-gray-600">{pet.breed}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="border rounded-lg p-6 bg-gray-50 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="doctor-select" className="block text-sm font-semibold mb-2">
                  Select Doctor
                </label>
                <select
                  id="doctor-select"
                  className="w-full border rounded p-2"
                  value={selectedDoctorId ?? ""}
                  onChange={e => {
                    const value = e.target.value ? Number(e.target.value) : null;
                    setSelectedDoctorId(value);
                    setMessage(null);
                    setError(null);
                  }}
                  disabled={loadingDoctors}
                >
                  <option value="">Choose a doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="start-date" className="block text-sm font-semibold mb-2">
                  Calendar Start Date
                </label>
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  min={getTodayString()}
                  onChange={e => setStartDate(e.target.value || getTodayString())}
                  className="w-full border rounded p-2"
                />
              </div>
            </div>

            {!selectedPet && <p className="text-yellow-700">Select a pet before booking a time slot.</p>}
            {loadingDoctors && <p>Loading doctors...</p>}
            {error && <p className="text-red-600">{error}</p>}
            {message && <p className="text-green-700">{message}</p>}

            {selectedDoctor && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">{selectedDoctor.name} - Weekly Calendar</h2>
                {loadingAvailability && <p>Loading availability...</p>}

                {!loadingAvailability && availability.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {availability.map(day => (
                      <div key={day.date} className="border rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-semibold">{new Date(`${day.date}T00:00:00`).toLocaleDateString()}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${day.hasFreeSlot ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {day.hasFreeSlot ? "Free slots" : "Fully booked"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {day.slots.map(slot => {
                            const slotKey = `${day.date}-${slot.slotStartHour}`;
                            const isBooking = bookingSlot === slotKey;
                            return (
                              <button
                                key={slotKey}
                                className={`text-xs sm:text-sm border rounded p-2 transition ${slot.isBooked ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "hover:bg-primary-light"}`}
                                disabled={slot.isBooked || !selectedPet || isBooking || !user}
                                onClick={() => handleBook(day.date, slot.slotStartHour)}
                              >
                                {isBooking ? "Booking..." : slot.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {Array.isArray(filteredPets) && filteredPets.length > 0 && doctors.length === 0 && !loadingDoctors && (
        <div className="mt-6 p-4 border rounded bg-yellow-50 text-yellow-800">
          No doctors are available right now.
        </div>
      )}
    </div>
  );
};

export default ContactVet;
