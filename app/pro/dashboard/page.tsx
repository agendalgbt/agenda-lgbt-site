"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "../context/AuthContext";
import AuthGuard from "../components/AuthGuard";
import ProHeader from "../components/ProHeader";

type Submission = {
  id: string;
  titre: string;
  date_debut: string;
  ville: string;
  statut: "en_attente" | "validé" | "refusé";
  created_at: any;
};

const statusConfig = {
  en_attente: { label: "En attente", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
  validé: { label: "Validé", color: "text-green-400", bg: "bg-green-400/10 border-green-400/20" },
  refusé: { label: "Refusé", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
};

export default function DashboardPage() {
  const { user, organizer } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchSubmissions = async () => {
      try {
        const q = query(
          collection(db, "submissions"),
          where("organizer_id", "==", user.uid),
          orderBy("created_at", "desc")
        );
        const snap = await getDocs(q);
        setSubmissions(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Submission)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [user]);

  const stats = {
    total: submissions.length,
    valides: submissions.filter((s) => s.statut === "validé").length,
    en_attente: submissions.filter((s) => s.statut === "en_attente").length,
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0a0a0f]">
        <ProHeader />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-400 via-yellow-400 via-green-400 via-blue-500 to-violet-500" />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-16">
          {/* Welcome */}
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-white mb-1">
              Bonjour, {organizer?.contact_nom?.split(" ")[0] || "organisateur"} 👋
            </h1>
            <p className="text-white/40 text-sm">{organizer?.nom_organisation}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { label: "Événements soumis", value: stats.total },
              { label: "Validés", value: stats.valides },
              { label: "En attente", value: stats.en_attente },
            ].map((s) => (
              <div key={s.label} className="glass rounded-2xl p-5 text-center">
                <div className="text-2xl font-bold rainbow-text">{s.value}</div>
                <div className="text-white/40 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* CTA soumettre */}
          <div className="glass rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-white font-semibold mb-1">Soumettre un nouvel événement</h2>
              <p className="text-white/40 text-sm">Validé sous 24h par notre équipe.</p>
            </div>
            <a
              href="/pro/soumettre"
              className="shrink-0 bg-gradient-to-r from-violet-500 to-blue-500 text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity text-sm"
            >
              + Nouvel événement
            </a>
          </div>

          {/* Liste des soumissions */}
          <div>
            <h2 className="text-white font-semibold mb-4">Mes soumissions</h2>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : submissions.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <div className="text-4xl mb-4">📅</div>
                <p className="text-white/40 text-sm">Aucun événement soumis pour le moment.</p>
                <a
                  href="/pro/soumettre"
                  className="inline-block mt-6 text-violet-400 hover:text-violet-300 text-sm transition-colors"
                >
                  Soumettre mon premier événement →
                </a>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {submissions.map((sub) => {
                  const status = statusConfig[sub.statut] || statusConfig.en_attente;
                  return (
                    <div
                      key={sub.id}
                      className="glass rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{sub.titre}</p>
                        <p className="text-white/40 text-xs mt-0.5">
                          {sub.ville} · {sub.date_debut ? new Date(sub.date_debut).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                        </p>
                      </div>
                      <span className={`shrink-0 text-xs font-medium px-3 py-1 rounded-full border ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
