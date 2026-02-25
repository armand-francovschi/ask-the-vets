import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

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
  notes?: string;
}

const DoctorSchedule: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<DoctorScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to view your schedule.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/users/me/schedule", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Failed to load doctor schedule");
        }

        const data: DoctorScheduleItem[] = await res.json();
        setItems(data);
      } catch (err) {
        console.error(err);
        setError("Could not load your schedule right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [user]);

  if (!user) {
    return <div className="md:ml-64 p-8 min-h-screen">Please log in to access this page.</div>;
  }

  return (
    <div className="md:ml-64 p-8 min-h-screen bg-background">
      <h1 className="text-4xl font-bold text-primary-dark mb-2">Check Schedule</h1>
      <p className="text-gray-600 mb-8">View your upcoming scheduled calls and join from here.</p>

      {loading && <p>Loading schedule...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <div className="bg-primary-light rounded-lg p-6 border">
          No upcoming scheduled calls.
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid gap-4 max-w-3xl">
          {items.map(item => (
            <div key={item.id} className="bg-primary-light rounded-lg p-5 border">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-xl font-semibold text-primary-dark">{item.petName} • {user.role === "doctor" ? item.ownerName : (item.doctorName || "Doctor")}</h2>
                <span className="px-3 py-1 rounded-full bg-accent text-primary-dark font-medium w-fit">
                  {item.type.toUpperCase()} CALL
                </span>
              </div>
              <p className="mt-3 text-gray-700">
                {new Date(item.scheduledAt).toLocaleString()}
              </p>
              {item.notes && <p className="mt-2 text-gray-600">{item.notes}</p>}
              <button
                className="mt-4 px-4 py-2 rounded bg-primary-dark text-white hover:opacity-90"
                onClick={() => {
                  const params = new URLSearchParams({ scheduleId: String(item.id) });
                  if (item.petId) params.set("petId", String(item.petId));
                  navigate(`/contact-vet/video?${params.toString()}`);
                }}
              >
                Video CALL
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorSchedule;
