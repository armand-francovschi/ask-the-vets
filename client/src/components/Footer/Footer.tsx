import { NavLink } from "react-router-dom";

const linkClass = "text-primary-dark/80 hover:text-primary-dark underline-offset-4 hover:underline";

export default function Footer() {
  return (
    <footer className="md:pt-16 border-t border-primary-dark/15 bg-primary-light/70 mt-8">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div>
            <p className="text-xl font-bold text-primary-dark">Ask The Vets</p>
            <p className="mt-2 text-sm text-primary-dark/80">
              Trusted guidance for pet parents, from appointment booking to medical records.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-dark/80">Legal</p>
            <div className="mt-2 flex flex-col gap-2 text-sm">
              <NavLink to="/privacy-policy" className={linkClass}>Privacy Policy</NavLink>
              <NavLink to="/terms-of-service" className={linkClass}>Terms of Service</NavLink>
              <NavLink to="/cookie-policy" className={linkClass}>Cookie Policy</NavLink>
              <NavLink to="/about" className={linkClass}>About</NavLink>
              <NavLink to="/contact-us" className={linkClass}>Contact Us</NavLink>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-dark/80">Support</p>
            <div className="mt-2 flex flex-col gap-2 text-sm text-primary-dark/80">
              <p>Email: support@askthevets.test</p>
              <p>Hours: Mon-Fri, 09:00-18:00</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-primary-dark/15 text-xs text-primary-dark/70">
          <p>© {new Date().getFullYear()} Ask The Vets. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
