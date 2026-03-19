"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function InscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    nom_organisation: "",
    contact_nom: "",
    telephone: "",
    instagram: "",
    ville: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);

      await setDoc(doc(db, "organizers", user.uid), {
        email: form.email,
        nom_organisation: form.nom_organisation,
        contact_nom: form.contact_nom,
        telephone: form.telephone,
        instagram: form.instagram,
        ville: form.ville,
        created_at: serverTimestamp(),
      });

      // Email de bienvenue
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "welcome",
          to: form.email,
          nom_organisation: form.nom_organisation,
          contact_nom: form.contact_nom,
        }),
      });

      router.push("/pro/dashboard");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("Cette adresse email est déjà utilisée.");
      } else if (err.code === "auth/weak-password") {
        setError("Le mot de passe doit contenir au moins 6 caractères.");
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-400 via-yellow-400 via-green-400 via-blue-500 to-violet-500" />
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-violet-600/10 blur-[120px] animate-pulse pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <a href="/pro" className="inline-flex items-center gap-2 mb-6">
            <img src="/logo.png" alt="Agenda LGBT" className="w-8 h-8 rounded-lg object-contain bg-white" />
            <span className="font-bold">
              <span className="rainbow-text">Agenda</span>
              <span className="text-white ml-1">LGBT Pro</span>
            </span>
          </a>
          <h1 className="text-2xl font-bold text-white mb-2">Créer votre espace pro</h1>
          <p className="text-white/40 text-sm">Gratuit — validation sous 24h</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 flex flex-col gap-4">
          <div>
            <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Nom de l'organisation *</label>
            <input
              type="text"
              name="nom_organisation"
              required
              value={form.nom_organisation}
              onChange={handleChange}
              placeholder="Ex: Flash Cocotte, Doctor Love..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Votre nom *</label>
            <input
              type="text"
              name="contact_nom"
              required
              value={form.contact_nom}
              onChange={handleChange}
              placeholder="Prénom Nom"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Ville *</label>
              <input
                type="text"
                name="ville"
                required
                value={form.ville}
                onChange={handleChange}
                placeholder="Paris"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors text-sm"
              />
            </div>
            <div>
              <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Téléphone</label>
              <input
                type="tel"
                name="telephone"
                value={form.telephone}
                onChange={handleChange}
                placeholder="+33 6..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Instagram</label>
            <input
              type="text"
              name="instagram"
              value={form.instagram}
              onChange={handleChange}
              placeholder="@votre_compte"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors text-sm"
            />
          </div>

          <div className="border-t border-white/5 pt-4">
            <div>
              <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Email *</label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="contact@monorga.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Mot de passe *</label>
            <input
              type="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="6 caractères minimum"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors text-sm"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-500 to-blue-500 text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
          >
            {loading ? "Création en cours..." : "Créer mon espace pro →"}
          </button>
        </form>

        <p className="text-center text-white/30 text-sm mt-6">
          Déjà un compte ?{" "}
          <a href="/pro/connexion" className="text-violet-400 hover:text-violet-300 transition-colors">
            Se connecter
          </a>
        </p>
      </div>
    </main>
  );
}
