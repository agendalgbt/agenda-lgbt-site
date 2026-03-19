"use client";

import { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { useAuth } from "../context/AuthContext";
import AuthGuard from "../components/AuthGuard";
import ProHeader from "../components/ProHeader";

export default function ProfilPage() {
  const { user, organizer } = useAuth();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nom_organisation: "",
    contact_nom: "",
    telephone: "",
    instagram: "",
    ville: "",
  });

  useEffect(() => {
    if (organizer) {
      setForm({
        nom_organisation: organizer.nom_organisation || "",
        contact_nom: organizer.contact_nom || "",
        telephone: organizer.telephone || "",
        instagram: organizer.instagram || "",
        ville: organizer.ville || "",
      });
    }
  }, [organizer]);

  const [pwForm, setPwForm] = useState({
    current: "",
    next: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await updateDoc(doc(db, "organizers", user.uid), {
        nom_organisation: form.nom_organisation,
        contact_nom: form.contact_nom,
        telephone: form.telephone,
        instagram: form.instagram,
        ville: form.ville,
      });
      setSuccess("Profil mis à jour avec succès.");
    } catch {
      setError("Erreur lors de la mise à jour.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const credential = EmailAuthProvider.credential(user.email, pwForm.current);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, pwForm.next);
      setSuccess("Mot de passe mis à jour.");
      setPwForm({ current: "", next: "" });
    } catch (err: any) {
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Mot de passe actuel incorrect.");
      } else if (err.code === "auth/weak-password") {
        setError("Le nouveau mot de passe doit contenir au moins 6 caractères.");
      } else {
        setError("Erreur lors du changement de mot de passe.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0a0a0f]">
        <ProHeader />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-400 via-yellow-400 via-green-400 via-blue-500 to-violet-500" />

        <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-16">
          <h1 className="text-2xl font-bold text-white mb-8">Mon profil</h1>

          {/* Profil form */}
          <form onSubmit={handleSave} className="glass rounded-2xl p-6 flex flex-col gap-4 mb-6">
            <h2 className="text-white font-semibold text-sm uppercase tracking-wider mb-1">Informations</h2>

            <div>
              <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Nom de l'organisation</label>
              <input
                type="text"
                name="nom_organisation"
                required
                value={form.nom_organisation}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Votre nom</label>
              <input
                type="text"
                name="contact_nom"
                required
                value={form.contact_nom}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Ville</label>
                <input
                  type="text"
                  name="ville"
                  required
                  value={form.ville}
                  onChange={handleChange}
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

            <div className="border-t border-white/5 pt-2">
              <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Email</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white/30 text-sm cursor-not-allowed"
              />
            </div>

            {success && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-400 text-sm">
                {success}
              </div>
            )}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-violet-500 to-blue-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
            >
              {saving ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </form>

          {/* Password form */}
          <form onSubmit={handlePasswordChange} className="glass rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="text-white font-semibold text-sm uppercase tracking-wider mb-1">Changer le mot de passe</h2>

            <div>
              <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Mot de passe actuel</label>
              <input
                type="password"
                required
                value={pwForm.current}
                onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Nouveau mot de passe</label>
              <input
                type="password"
                required
                minLength={6}
                value={pwForm.next}
                onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
                placeholder="6 caractères minimum"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-white/10 hover:bg-white/15 text-white/80 font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 text-sm"
            >
              {saving ? "Mise à jour..." : "Changer le mot de passe"}
            </button>
          </form>
        </main>
      </div>
    </AuthGuard>
  );
}
