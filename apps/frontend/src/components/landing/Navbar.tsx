import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Integrations", href: "#integrations" },
  { label: "Resources", href: "#resources" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#080f1e]/95 backdrop-blur-md shadow-lg shadow-black/30 border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <img
              src="/vector/isolated-monochrome-white.svg"
              alt="latafarraqo logo"
              className="h-8 w-8 group-hover:scale-110 transition-transform duration-200"
            />
            <div className="flex flex-col leading-none">
              <span className="text-white font-bold text-sm tracking-wider uppercase">
                latafarraqo
              </span>
              <span className="text-[#5DD7AD] text-[8px] tracking-[0.2em] uppercase">
                la tafarraqo
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-white/70 hover:text-white text-sm font-medium transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#5DD7AD] group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/signin"
              className="text-white/80 hover:text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200"
            >
              Login
            </Link>
            <Link
              to="/signin"
              className="bg-gradient-to-r from-[#5DD7AD] to-[#3ab88e] text-[#0a1628] text-sm font-bold px-5 py-2 rounded-lg hover:shadow-lg hover:shadow-[#5DD7AD]/25 hover:scale-105 transition-all duration-200"
            >
              Get Started Free
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white/80 hover:text-white p-2"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#080f1e]/98 backdrop-blur-lg border-t border-white/10 px-4 pt-4 pb-6 space-y-4">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block text-white/70 hover:text-white text-sm font-medium py-2 border-b border-white/5"
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 pt-2">
            <Link
              to="/signin"
              onClick={() => setMenuOpen(false)}
              className="text-center text-white/80 text-sm font-medium px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition-all"
            >
              Login
            </Link>
            <Link
              to="/signin"
              onClick={() => setMenuOpen(false)}
              className="text-center bg-gradient-to-r from-[#5DD7AD] to-[#3ab88e] text-[#0a1628] text-sm font-bold px-5 py-2.5 rounded-lg"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
