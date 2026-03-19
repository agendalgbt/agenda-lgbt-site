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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0f]/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/pro/dashboard" className="flex items-center gap-2">
          <img src="/logo.png" alt="Agenda LGBT" className="w-7 h-7 rounded-lg object-contain bg-white" />
          <span className="font-bold text-sm">
            <span className="rainbow-text">Agenda</span>
            <span className="text-white ml-1">LGBT</span>
            <span className="text-white/40 ml-2 font-normal">Pro</span>
          </span>
        </a>

        {/* Nav desktop */}
        {organizer && (
          <nav className="hidden sm:flex items-center gap-6 text-sm text-white/50">
            <a href="/pro/dashboard" className="hover:text-white transition-colors">Dashboard</a>
            <a href="/pro/soumettre" className="hover:text-white transition-colors">Soumettre</a>
            <a href="/pro/profil" className="hover:text-white transition-colors">Mon profil</a>
            <a href="/pro/sponsoring" className="hover:text-white transition-colors">Sponsoring</a>
          </nav>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          {organizer ? (
            <>
              <span className="hidden sm:block text-white/40 text-xs">{organizer.nom_organisation}</span>
              <button
                onClick={handleLogout}
                className="text-white/40 hover:text-white text-xs transition-colors"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <a href="/pro/connexion" className="text-sm text-white/60 hover:text-white transition-colors">
              Connexion
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
