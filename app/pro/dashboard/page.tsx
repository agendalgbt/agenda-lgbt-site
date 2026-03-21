"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
// sponsorships fetched via /api/pro/sponsorships (Firebase Admin)
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

type Sponsorship = {
  id: string;
  eventName: string;
  submission_title?: string;
  days: string[];
  sponsored_until?: any;
  status: string;
  created_at: any;
};

type InstagramSponsorship = {
  id: string;
  eventName: string;
  submission_title?: string;
  packName: string;
  storyDates: string[];
  postDate?: string;
  status: string;
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
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [igSponsorships, setIgSponsorships] = useState<InstagramSponsorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchAll = async () => {
      try {
        // Soumissions — critique, doit fonctionner
        const subSnap = await getDocs(
          query(collection(db, "submissions"), where("organizer_id", "==", user.uid))
        );
        const list = subSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Submission));
        list.sort((a, b) => (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0));
        setSubmissions(list);
      } catch (err) {
        console.error("Erreur soumissions:", err);
      } finally {
        setLoading(false);
      }

      // Sponsorisations — via API server (Firebase Admin, pas de règles Firestore)
      try {
        const res = await fetch(`/api/pro/sponsorships?email=${encodeURIComponent(user.email || "")}`);
        const data = await res.json();
        if (data.sponsorships) setSponsorships(data.sponsorships as Sponsorship[]);
        if (data.igSponsorships) setIgSponsorships(data.igSponsorships as InstagramSponsorship[]);
      } catch (err) {
        console.error("Erreur sponsorships API:", err);
      }
    };

    fetchAll();
  }, [user]);

  const today = new Date().toISOString().split("T")[0];

  // Sponsorisations App actives (au moins un jour >= aujourd'hui)
  const activeSponsorships = sponsorships.filter((s) =>
    s.days?.some((d) => d >= today)
  );

  // Vérifie si un event a une sponsorisation App active (match par submissionTitle ou eventName)
  const hasAppSponsoring = (titre: string) =>
    activeSponsorships.some((s) =>
      (s.submission_title && s.submission_title.toLowerCase() === titre.toLowerCase()) ||
      s.eventName?.toLowerCase() === titre.toLowerCase()
    );

  // Vérifie si un event a une sponsorisation Instagram
  const hasIgSponsoring = (titre: string) =>
    igSponsorships.some((s) =>
      (s.submission_title && s.submission_title.toLowerCase() === titre.toLowerCase()) ||
      s.eventName?.toLowerCase() === titre.toLowerCase()
    );

  const stats = {
    total: submissions.length,
    valides: submissions.filter((s) => s.statut === "validé").length,
    en_attente: submissions.filter((s) => s.statut === "en_attente").length,
    sponsorisations: activeSponsorships.length + igSponsorships.length,
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
          <div className="grid grid-cols-4 gap-4 mb-10">
            {[
              { label: "Événements soumis", value: stats.total },
              { label: "Validés", value: stats.valides },
              { label: "En attente", value: stats.en_attente },
              { label: "Sponsorisations actives", value: stats.sponsorisations },
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

          {/* Soumissions + Sponsorisations côte à côte */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

            {/* Colonne gauche — Mes soumissions */}
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
                  const appSponsored = hasAppSponsoring(sub.titre);
                  const igSponsored = hasIgSponsoring(sub.titre);

                  return (
                    <div key={sub.id} className="glass rounded-2xl overflow-hidden border border-white/5">
                      {/* En-tête */}
                      <div className="w-full px-5 py-4 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                        <button
                          onClick={() => toggleExpand(sub.id)}
                          className="flex-1 min-w-0 text-left"
                        >
                          <p className="text-white font-medium text-sm truncate">{sub.titre}</p>
                          <p className="text-white/40 text-xs mt-0.5">
                            {sub.ville}
                            {sub.date_debut
                              ? ` · ${new Date(sub.date_debut).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`
                              : ""}
                          </p>
                        </button>
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Badges sponsoring actif */}
                          {appSponsored && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300">
                              ⚡ App
                            </span>
                          )}
                          {igSponsored && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border border-pink-500/40 bg-pink-500/10 text-pink-300">
                              ⚡ Instagram
                            </span>
                          )}

                          {/* Pills sponsoring si validé */}
                          {sub.statut === "validé" && (
                            <>
                              <a
                                href={`/pro/sponsoring/evenement?eventName=${encodeURIComponent(sub.titre)}&submissionTitle=${encodeURIComponent(sub.titre)}`}
                                className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border border-violet-500/40 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 transition-colors"
                              >
                                📱 App
                              </a>
                              {sub.categorie === "Clubbing" && (
                                <a
                                  href={`/pro/sponsoring/instagram?submissionTitle=${encodeURIComponent(sub.titre)}`}
                                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border border-pink-500/40 bg-pink-500/10 text-pink-300 hover:bg-pink-500/20 transition-colors"
                                >
                                  📸 Instagram
                                </a>
                              )}
                            </>
                          )}

                          <span className={`text-xs font-medium px-3 py-1 rounded-full border ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                          <button onClick={() => toggleExpand(sub.id)} className="text-white/30 text-xs px-1">
                            {isExpanded ? "▲" : "▼"}
                          </button>
                        </div>
                      </div>

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

                              {/* Détail sponsoring App actif */}
                              {appSponsored && (() => {
                                const sp = activeSponsorships.find(
                                  (s) => s.eventName?.toLowerCase() === sub.titre.toLowerCase()
                                );
                                const futureDays = sp?.days?.filter((d) => d >= today).sort() || [];
                                return futureDays.length > 0 ? (
                                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                                    <p className="text-amber-300 text-xs font-semibold mb-1">⚡ Sponsorisation App active</p>
                                    <p className="text-white/60 text-xs">
                                      Du {new Date(futureDays[0]).toLocaleDateString("fr-FR")} au {new Date(futureDays[futureDays.length - 1]).toLocaleDateString("fr-FR")} · {futureDays.length} jour{futureDays.length > 1 ? "s" : ""} restant{futureDays.length > 1 ? "s" : ""}
                                    </p>
                                  </div>
                                ) : null;
                              })()}

                              {/* Détail sponsoring Instagram */}
                              {igSponsored && (() => {
                                const ig = igSponsorships.find(
                                  (s) => s.eventName?.toLowerCase() === sub.titre.toLowerCase()
                                );
                                return ig ? (
                                  <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl px-4 py-3">
                                    <p className="text-pink-300 text-xs font-semibold mb-1">⚡ Sponsorisation Instagram — {ig.packName}</p>
                                    <p className="text-white/60 text-xs">
                                      {ig.storyDates?.length || 0} story{(ig.storyDates?.length || 0) > 1 ? "s" : ""}
                                      {ig.postDate ? ` · 1 post le ${new Date(ig.postDate).toLocaleDateString("fr-FR")}` : ""}
                                    </p>
                                  </div>
                                ) : null;
                              })()}
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
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            </div>

            {/* Colonne droite — Mes sponsorisations */}
            <div>
              <h2 className="text-white font-semibold mb-4">Mes sponsorisations</h2>
              {loading ? (
                <div className="flex justify-center py-16">
                  <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : sponsorships.length === 0 && igSponsorships.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center">
                  <div className="text-4xl mb-4">⚡</div>
                  <p className="text-white/40 text-sm">Aucune sponsorisation pour le moment.</p>
                  <a href="/pro/sponsoring" className="inline-block mt-6 text-violet-400 hover:text-violet-300 text-sm transition-colors">
                    Découvrir le sponsoring →
                  </a>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {sponsorships.map((sp) => {
                    const futureDays = sp.days?.filter((d) => d >= today).sort() || [];
                    const isActive = futureDays.length > 0;
                    const allDays = [...(sp.days || [])].sort();
                    return (
                      <div key={sp.id} className="glass rounded-2xl px-5 py-4 border border-white/5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-white font-medium text-sm truncate">📱 {sp.eventName}</p>
                            {allDays.length > 0 && (
                              <p className="text-white/40 text-xs mt-1">
                                Du {new Date(allDays[0]).toLocaleDateString("fr-FR")} au {new Date(allDays[allDays.length - 1]).toLocaleDateString("fr-FR")}
                                {" · "}{allDays.length} jour{allDays.length > 1 ? "s" : ""}
                              </p>
                            )}
                          </div>
                          <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${isActive ? "border-amber-500/40 bg-amber-500/10 text-amber-300" : "border-white/10 bg-white/5 text-white/40"}`}>
                            {isActive ? "Actif" : "Terminé"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {igSponsorships.map((ig) => {
                    const dates = [...(ig.storyDates || [])].sort();
                    const lastDate = ig.postDate || dates[dates.length - 1];
                    const isActive = lastDate ? lastDate >= today : false;
                    return (
                      <div key={ig.id} className="glass rounded-2xl px-5 py-4 border border-white/5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-white font-medium text-sm truncate">📸 {ig.eventName}</p>
                            <p className="text-white/40 text-xs mt-1">
                              {ig.packName}
                              {dates.length > 0 && ` · ${ig.storyDates?.length || 0} story${(ig.storyDates?.length || 0) > 1 ? "s" : ""}${ig.postDate ? " · 1 post" : ""}`}
                            </p>
                          </div>
                          <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${isActive ? "border-pink-500/40 bg-pink-500/10 text-pink-300" : "border-white/10 bg-white/5 text-white/40"}`}>
                            {isActive ? "Actif" : "Terminé"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
