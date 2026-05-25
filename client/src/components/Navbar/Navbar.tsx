import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaUserMd, FaPaw, FaCalendarAlt } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import ProfileImageModal from "./ProfileImageUpload";
import { API_BASE_URL } from "../../config/api";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false); // profile modal
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/");
  };

  useEffect(() => {
    const closeOnEditableFocus = (event: FocusEvent) => {
      if (window.innerWidth >= 768) return;
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const isEditable =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      if (isEditable) {
        setIsOpen(false);
      }
    };

    document.addEventListener("focusin", closeOnEditableFocus);

    return () => {
      document.removeEventListener("focusin", closeOnEditableFocus);
    };
  }, []);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded transition ${
      isActive ? "bg-accent font-semibold text-primary-dark" : "hover:bg-accent/50 text-primary-dark"
    }`;

  const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition ${
      isActive ? "bg-accent font-semibold text-primary-dark" : "hover:bg-accent/50 text-primary-dark"
    }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${linkClass({ isActive })} w-full`;

  return (
    <>
      {/* Desktop top navbar */}
      <div className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-primary-light/95 backdrop-blur-md shadow-md px-5 lg:px-8 items-center gap-6 z-50 border-b border-primary-dark/15">
        <NavLink to="/" className="flex items-center min-w-[220px] rounded-lg hover:bg-accent/40 px-2 py-1 transition">
          <div className="w-10 h-10 rounded-full border-2 border-accent/70 bg-accent/25 shadow-sm" />
          <div className="ml-3 leading-tight">
            <p className="text-2xl font-bold text-primary-dark">Ask The Vets</p>
            <p className="text-sm text-primary-dark/75">Pet care platform</p>
          </div>
        </NavLink>

        <nav className="flex-1 flex items-center justify-center gap-1.5">
          <NavLink to="/contact-vet" className={desktopLinkClass}><span className="w-4 flex justify-center"><FaUserMd /></span><span>Contact a Vet</span></NavLink>
          <NavLink to="/update-medical" className={desktopLinkClass}><span className="w-4 flex justify-center"><FaPaw /></span><span>Medical Info</span></NavLink>
          {user && (
            <NavLink to="/doctor/schedule" className={desktopLinkClass}><span className="w-4 flex justify-center"><FaCalendarAlt /></span><span>My Bookings</span></NavLink>
          )}
        </nav>

        <div className="min-w-[220px] flex items-center justify-end gap-3">
          {user ? (
            <>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-3 rounded-full border border-primary-dark/25 bg-accent/70 px-3 py-1.5 text-primary-dark"
              >
                <img
                  src={user.image ? `${API_BASE_URL}/uploads/${user.image}` : "/icons/document-icon.png"}
                  alt="User profile"
                  className="h-10 w-10 rounded-full border border-primary-dark/35 object-cover bg-primary-light/55"
                />
                <span className="text-sm font-semibold">User Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-primary-dark text-white rounded-lg hover:opacity-90"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink to="/login" className="px-3 py-1.5 rounded-lg text-primary-dark hover:bg-accent/50 font-medium">Login</NavLink>
              <NavLink to="/register" className="px-3 py-1.5 rounded-lg text-primary-dark hover:bg-accent/50 font-medium">Register</NavLink>
            </div>
          )}
        </div>
      </div>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 w-full bg-primary-light shadow-lg p-4 flex justify-between items-center z-[9999]">
        <NavLink to="/" onClick={() => setIsOpen(false)} className="text-xl font-bold text-primary-dark">Ask The Vets</NavLink>
        <button onClick={() => setIsOpen(!isOpen)} className="text-primary-dark font-bold text-2xl">
          ☰
        </button>
      </div>
      <div className="md:hidden h-[72px]" />

      {/* Mobile menu */}
      <div
        className={`md:hidden bg-primary-light shadow-lg px-4 z-[10000] overflow-hidden transition-all duration-300 ease-out fixed left-0 right-0 top-[72px] ${
          isOpen ? "max-h-[520px] opacity-100 pb-4" : "max-h-0 opacity-0 pb-0"
        }`}
      >
        <div
          className={`w-full bg-primary-light rounded-lg border border-primary-dark/10 p-2 flex flex-col gap-3 transition-transform duration-300 ease-out ${
            isOpen ? "translate-y-0" : "-translate-y-2"
          }`}
        >
            {/* Links */}
            <div className="flex flex-col gap-2">
            <NavLink to="/contact-vet" className={mobileLinkClass} onClick={() => setIsOpen(false)}><FaUserMd /> Contact a Vet</NavLink>
            <NavLink to="/update-medical" className={mobileLinkClass} onClick={() => setIsOpen(false)}><FaPaw /> Medical Info</NavLink>
            {user && (
              <NavLink to="/doctor/schedule" className={mobileLinkClass} onClick={() => setIsOpen(false)}><FaCalendarAlt /> My Bookings</NavLink>
            )}
            </div>

            {/* User info / login buttons */}
            {user ? (
              <div className="flex flex-col gap-2 mt-1">
                <div className="flex items-center gap-2">
                  <img
                    src={user.image ? `${API_BASE_URL}/uploads/${user.image}` : "/icons/document-icon.png"}
                    className="w-10 h-10 rounded-full object-cover border-2 border-accent cursor-pointer"
                    onClick={() => setModalOpen(true)}
                  />
                  <span className="px-3 py-1 bg-accent text-primary-dark rounded-full font-semibold">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 w-full"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mt-1">
                <NavLink to="/login" className={mobileLinkClass}>Login</NavLink>
                <NavLink to="/register" className={mobileLinkClass}>Register</NavLink>
              </div>
            )}
        </div>
        </div>

      {/* Profile Image Modal */}
      <ProfileImageModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
