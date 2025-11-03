import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaUserMd, FaPaw, FaComments, FaQuestionCircle } from "react-icons/fa";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // Updated link class for purple/yellow theme
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded transition ${
      isActive ? "bg-accent font-semibold text-primary-dark" : "hover:bg-accent/50 text-primary-dark"
    }`;

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex fixed top-0 left-0 h-full w-64 bg-primary-light shadow-lg p-6 flex-col gap-6">
        <h1 className="text-2xl font-bold text-primary-dark mb-8">Ask The Vets</h1>
        <nav className="flex flex-col gap-2">
          <NavLink to="/" className={linkClass}>
            <FaHome /> Home
          </NavLink>
          <NavLink to="/contact-vet" className={linkClass}>
            <FaUserMd /> Contact a Vet
          </NavLink>
          <NavLink to="/update-medical" className={linkClass}>
            <FaPaw />  Medical Info
          </NavLink>
          <NavLink to="/live-chat" className={linkClass}>
            <FaComments /> Live Chat
          </NavLink>
          <NavLink to="/forum" className={linkClass}>
            <FaQuestionCircle /> Forum & FAQs
          </NavLink>
        </nav>
      </div>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-primary-light shadow-lg p-4 flex justify-between items-center z-50">
        <h1 className="text-xl font-bold text-primary-dark">Ask The Vets</h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-primary-dark font-bold text-2xl"
        >
          ☰
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden fixed top-16 left-0 w-full bg-primary-light shadow-lg p-4 flex flex-col gap-2 z-40">
          <NavLink to="/" className={linkClass} onClick={() => setIsOpen(false)}>
            <FaHome /> Home
          </NavLink>
          <NavLink
            to="/contact-vet"
            className={linkClass}
            onClick={() => setIsOpen(false)}
          >
            <FaUserMd /> Contact a Vet
          </NavLink>
          <NavLink
            to="/update-medical"
            className={linkClass}
            onClick={() => setIsOpen(false)}
          >
            <FaPaw /> Medical Info
          </NavLink>
          <NavLink
            to="/live-chat"
            className={linkClass}
            onClick={() => setIsOpen(false)}
          >
            <FaComments /> Live Chat
          </NavLink>
          <NavLink
            to="/forum"
            className={linkClass}
            onClick={() => setIsOpen(false)}
          >
            <FaQuestionCircle /> Forum & FAQs
          </NavLink>
        </div>
      )}
    </>
  );
}
