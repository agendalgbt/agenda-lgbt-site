"use client";

import { useState, useEffect } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/5 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <img
            src="/logo.png"
            alt="Agenda LGBT"
            className="w-8 h-8 rounded-xl object-contain bg-white group-hover:scale-110 transition-transform shadow-lg"
          />
          <span className="font-bold text-lg tracking-tight">
            <span className="rainbow-text">Agenda</span>
            <span className="text-white ml-1">LGBT</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: "Accueil", href: "#" },
            { label: "L'app", href: "#app" },
            { label: "Contact", href: "#contact" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-white/70 hover:text-white transition-colors text-sm font-medium relative group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-violet-500 to-blue-400 group-hover:w-full transition-all duration-300" />
            </a>
          ))}
          <a
            href="#download"
            className="bg-gradient-to-r from-violet-600 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-violet-500/20"
          >
            Télécharger
          </a>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white/80 hover:text-white p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <div className="w-5 flex flex-col gap-1">
            <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
            <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#111118]/95 backdrop-blur-md border-t border-white/5 px-4 py-4 flex flex-col gap-4">
          {[
            { label: "Accueil", href: "#" },
            { label: "L'app", href: "#app" },
            { label: "Contact", href: "#contact" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="text-white/70 hover:text-white text-sm font-medium py-2 border-b border-white/5"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#download"
            onClick={() => setMenuOpen(false)}
            className="bg-gradient-to-r from-violet-600 to-blue-500 text-white px-4 py-3 rounded-full text-sm font-semibold text-center"
          >
            Télécharger l'app
          </a>
        </div>
      )}
    </header>
  );
}
