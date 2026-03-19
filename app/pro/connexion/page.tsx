"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function ConnexionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      router.push("/pro/dashboard");
    } catch (err: any) {
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("Email ou mot de passe incorrect.");
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
      <div className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-600/10 blur-[120px] animate-pulse pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <a href="/pro" className="inline-flex items-center gap-2 mb-6">
            <img src="/logo.png" alt="Agenda LGBT" className="w-8 h-8 rounded-lg object-contain bg-white" />
            <span className="font-bold">
              <span className="rainbow-text">Agenda</span>
              <span className="text-white ml-1">LGBT Pro</span>
            </span>
          </a>
          <h1 className="text-2xl font-bold text-white mb-2">Connexion</h1>
          <p className="text-white/40 text-sm">Accédez à votre espace organisateur</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 flex flex-col gap-4">
          <div>
            <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Email</label>
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

          <div>
            <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Mot de passe</label>
            <input
              type="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
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
            {loading ? "Connexion..." : "Se connecter →"}
          </button>
        </form>

        <p className="text-center text-white/30 text-sm mt-6">
          Pas encore de compte ?{" "}
          <a href="/pro/inscription" className="text-violet-400 hover:text-violet-300 transition-colors">
            Créer un espace pro
          </a>
        </p>
      </div>
    </main>
  );
}
