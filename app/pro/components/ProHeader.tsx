"use client";

import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export default function ProHeader() {
  const { organizer } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/pro/connexion");
  };

  const navLinks = [
    { href: "/pro/dashboard", label: "Dashboard" },
    { href: "/pro/soumettre", label: "Soumettre" },
    { href: "/pro/profil", label: "Mon profil" },
    { href: "/pro/sponsoring", label: "Sponsoring" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0f]/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo — URL absolue pour éviter les problèmes de sous-domaine */}
        <a href="/pro/dashboard" className="flex items-center gap-2">
          <img
            src="https://agendalgbt.com/logo.png"
            alt="Agenda LGBT"
            className="w-7 h-7 rounded-lg object-contain bg-white"
          />
          <span className="font-bold text-sm">
            <span className="rainbow-text">Agenda</span>
            <span className="text-white ml-1">LGBT</span>
            <span className="text-white/40 ml-2 font-normal">Pro</span>
          </span>
        </a>

        {/* Nav desktop */}
        {organizer && (
          <nav className="hidden sm:flex items-center gap-6 text-sm text-white/50">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-white transition-colors">
                {l.label}
              </a>
            ))}
          </nav>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          {organizer ? (
            <>
              <span className="hidden sm:block text-white/40 text-xs">{organizer.nom_organisation}</span>
              <button
                onClick={handleLogout}
                className="hidden sm:block text-white/40 hover:text-white text-xs transition-colors"
              >
                Déconnexion
              </button>

              {/* Hamburger mobile */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="sm:hidden flex flex-col gap-1.5 p-1"
                aria-label="Menu"
              >
                <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
                <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
                <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
              </button>
            </>
          ) : (
            <a href="/pro/connexion" className="text-sm text-white/60 hover:text-white transition-colors">
              Connexion
            </a>
          )}
        </div>
      </div>

      {/* Menu mobile déroulant */}
      {organizer && menuOpen && (
        <div className="sm:hidden border-t border-white/5 bg-[#0a0a0f]/95 backdrop-blur-md px-4 py-4 flex flex-col gap-1">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="text-white/60 hover:text-white text-sm py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              {l.label}
            </a>
          ))}
          <div className="border-t border-white/5 mt-2 pt-3">
            <p className="text-white/30 text-xs px-3 mb-2">{organizer.nom_organisation}</p>
            <button
              onClick={handleLogout}
              className="w-full text-left text-red-400/70 hover:text-red-400 text-sm py-2.5 px-3 rounded-xl hover:bg-red-500/5 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
