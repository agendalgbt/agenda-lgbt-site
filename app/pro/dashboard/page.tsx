"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "../context/AuthContext";
import AuthGuard from "../components/AuthGuard";
import ProHeader from "../components/ProHeader";

type Submission = {
  id: string;
  titre: string;
  categorie?: string;
  description?: string;
  date_debut?: string;
  heure_debut?: string;
  date_fin?: string;
  heure_fin?: string;
  lieu_nom?: string;
  adresse?: string;
  code_postal?: string;
  ville?: string;
  pays?: string;
  lien_billetterie?: string;
  instagram?: string;
  image_url?: string;
  publish_instagram?: boolean;
  instagram_publication_date?: string;
  raison_refus?: string;
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
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchSubmissions = async () => {
      try {
        const q = query(
          collection(db, "submissions"),
          where("organizer_id", "==", user.uid)
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Submission));
        list.sort((a, b) => (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0));
        setSubmissions(list);
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

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
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
                  const isExpanded = expandedId === sub.id;

                  return (
                    <div key={sub.id} className="glass rounded-2xl overflow-hidden border border-white/5">
                      {/* En-tête cliquable */}
                      <button
                        onClick={() => toggleExpand(sub.id)}
                        className="w-full px-5 py-4 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors text-left"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm truncate">{sub.titre}</p>
                          <p className="text-white/40 text-xs mt-0.5">
                            {sub.ville}
                            {sub.date_debut
                              ? ` · ${new Date(sub.date_debut).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`
                              : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`text-xs font-medium px-3 py-1 rounded-full border ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                          <span className="text-white/30 text-xs">{isExpanded ? "▲" : "▼"}</span>
                        </div>
                      </button>

                      {/* Détails dépliables */}
                      {isExpanded && (
                        <div className="border-t border-white/5 px-5 py-5 flex flex-col gap-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Colonne gauche */}
                            <div className="flex flex-col gap-3">
                              {sub.categorie && (
                                <div>
                                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Catégorie</p>
                                  <p className="text-white text-sm">{sub.categorie}</p>
                                </div>
                              )}
                              {sub.description && (
                                <div>
                                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Description</p>
                                  <p className="text-white/80 text-sm leading-relaxed">{sub.description}</p>
                                </div>
                              )}
                              {(sub.date_debut || sub.heure_debut) && (
                                <div>
                                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Date & heure</p>
                                  <p className="text-white/80 text-sm">
                                    {sub.date_debut && new Date(sub.date_debut).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                                    {sub.heure_debut && ` · ${sub.heure_debut}`}
                                    {sub.date_fin && ` → ${new Date(sub.date_fin).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`}
                                    {sub.heure_fin && ` ${sub.heure_fin}`}
                                  </p>
                                </div>
                              )}
                              {(sub.lieu_nom || sub.adresse || sub.ville) && (
                                <div>
                                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Lieu</p>
                                  <p className="text-white/80 text-sm">
                                    {[sub.lieu_nom, sub.adresse, sub.code_postal, sub.ville, sub.pays].filter(Boolean).join(", ")}
                                  </p>
                                </div>
                              )}
                              {sub.lien_billetterie && (
                                <div>
                                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Billetterie</p>
                                  <a href={sub.lien_billetterie} target="_blank" rel="noopener noreferrer" className="text-violet-400 text-sm hover:underline truncate block">
                                    {sub.lien_billetterie}
                                  </a>
                                </div>
                              )}
                              {sub.instagram && (
                                <div>
                                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Instagram</p>
                                  <p className="text-white/80 text-sm">{sub.instagram}</p>
                                </div>
                              )}
                              {sub.publish_instagram && (
                                <div className="flex items-center gap-2 text-pink-400 text-sm">
                                  <span>📸</span>
                                  <span>
                                    Publication Instagram @agenda_lgbt
                                    {sub.instagram_publication_date && ` · le ${sub.instagram_publication_date}`}
                                  </span>
                                </div>
                              )}
                              {sub.statut === "refusé" && sub.raison_refus && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Motif de refus</p>
                                  <p className="text-red-400 text-sm">{sub.raison_refus}</p>
                                </div>
                              )}
                            </div>

                            {/* Colonne droite — image */}
                            {sub.image_url && (
                              <div>
                                <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Visuel</p>
                                <img
                                  src={sub.image_url}
                                  alt={sub.titre}
                                  className="w-full rounded-xl object-cover max-h-52"
                                />
                              </div>
                            )}
                          </div>

                          {/* CTA si refusé */}
                          {sub.statut === "refusé" && (
                            <div className="pt-2">
                              <a
                                href="/pro/soumettre"
                                className="inline-block bg-gradient-to-r from-violet-500 to-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                              >
                                Soumettre à nouveau →
                              </a>
                            </div>
                          )}

                          {/* CTA sponsoring si validé */}
                          {sub.statut === "validé" && (
                            <div className="pt-2 border-t border-white/5">
                              <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Booster cet événement</p>
                              <div className="flex flex-wrap gap-2">
                                <a
                                  href={`/pro/sponsoring/evenement?eventName=${encodeURIComponent(sub.titre)}`}
                                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-violet-500/40 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 transition-colors"
                                >
                                  📱 Sponsoriser sur l'App
                                </a>
                                {sub.categorie === "Clubbing" && (
                                  <a
                                    href="/pro/sponsoring/instagram"
                                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-pink-500/40 bg-pink-500/10 text-pink-300 hover:bg-pink-500/20 transition-colors"
                                  >
                                    📸 Sponsoriser sur Instagram
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
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
