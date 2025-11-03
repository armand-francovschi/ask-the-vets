import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaUserMd, FaPaw, FaComments, FaQuestionCircle } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import ProfileImageModal from "./ProfileImageUpload";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false); // modal state
  const { user, logout } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded transition ${
      isActive
        ? "bg-accent font-semibold text-primary-dark"
        : "hover:bg-accent/50 text-primary-dark"
    }`;

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex fixed top-0 left-0 h-full w-64 bg-primary-light shadow-lg p-6 flex-col">
        <h1 className="text-2xl font-bold text-primary-dark mb-8">Ask The Vets</h1>

        {/* Links */}
        <nav className="flex flex-col gap-2 flex-1">
          <NavLink to="/" className={linkClass}><FaHome /> Home</NavLink>
          <NavLink to="/contact-vet" className={linkClass}><FaUserMd /> Contact a Vet</NavLink>
          <NavLink to="/update-medical" className={linkClass}><FaPaw /> Medical Info</NavLink>
          <NavLink to="/live-chat" className={linkClass}><FaComments /> Live Chat</NavLink>
          <NavLink to="/forum" className={linkClass}><FaQuestionCircle /> Forum & FAQs</NavLink>
        </nav>

        {/* User info / login buttons at bottom */}
        <div className="mt-auto flex flex-col items-center gap-2">
          {user ? (
            <div className="flex flex-col items-center gap-2">
              <img
                src={user.image ? `http://localhost:5000/uploads/${user.image}` : "https://via.placeholder.com/80"}
                className="w-16 h-16 rounded-full object-cover border-2 border-accent cursor-pointer"
                onClick={() => setModalOpen(true)} // open modal
              />
              <span className="px-4 py-1 bg-accent text-primary-dark rounded-full font-semibold">
                {user.name}
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 w-full"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>Login</NavLink>
              <NavLink to="/register" className={linkClass}>Register</NavLink>
            </>
          )}
        </div>
      </div>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-primary-light shadow-lg p-4 flex justify-between items-center z-50">
        <h1 className="text-xl font-bold text-primary-dark">Ask The Vets</h1>
        <button onClick={() => setIsOpen(!isOpen)} className="text-primary-dark font-bold text-2xl">
          ☰
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden fixed top-16 left-0 w-full h-[calc(100%-4rem)] bg-primary-light shadow-lg p-4 flex flex-col justify-between z-40">
          <div className="flex flex-col gap-2">
            <NavLink to="/" className={linkClass} onClick={() => setIsOpen(false)}><FaHome /> Home</NavLink>
            <NavLink to="/contact-vet" className={linkClass} onClick={() => setIsOpen(false)}><FaUserMd /> Contact a Vet</NavLink>
            <NavLink to="/update-medical" className={linkClass} onClick={() => setIsOpen(false)}><FaPaw /> Medical Info</NavLink>
            <NavLink to="/live-chat" className={linkClass} onClick={() => setIsOpen(false)}><FaComments /> Live Chat</NavLink>
            <NavLink to="/forum" className={linkClass} onClick={() => setIsOpen(false)}><FaQuestionCircle /> Forum & FAQs</NavLink>
          </div>

          {/* Mobile user info / login buttons at bottom */}
          {user ? (
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center gap-2">
                <img
                  src={user.image ? `http://localhost:5000/uploads/${user.image}` : "https://via.placeholder.com/40"}
                  className="w-10 h-10 rounded-full object-cover border-2 border-accent cursor-pointer"
                  onClick={() => setModalOpen(true)}
                />
                <span className="px-3 py-1 bg-accent text-primary-dark rounded-full font-semibold">{user.name}</span>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 mt-4">
              <NavLink to="/login" className={linkClass}>Login</NavLink>
              <NavLink to="/register" className={linkClass}>Register</NavLink>
            </div>
          )}
        </div>
      )}

      {/* Profile Image Modal */}
      <ProfileImageModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
