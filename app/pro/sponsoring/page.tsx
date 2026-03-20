"use client";

import { useState } from "react";
import AuthGuard from "../components/AuthGuard";
import ProHeader from "../components/ProHeader";
import Link from "next/link";

export default function SponsoringPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="min-h-screen" style={{ background: "#0a0a0f", color: "#f0ede8", fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
        <ProHeader />

        {/* Background blobs */}
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, background: "radial-gradient(ellipse 70% 50% at 20% 0%, rgba(232,96,154,0.13) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 100%, rgba(201,168,76,0.10) 0%, transparent 60%)" }} />

        <div className="relative" style={{ zIndex: 10 }}>
          {/* Hero */}
          <div style={{ textAlign: "center", padding: "72px 24px 56px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.18)", borderRadius: 999, padding: "6px 18px", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 28 }}>
              ✦ ESPACE ORGANISATEURS
            </div>
            <h1 style={{ fontSize: "clamp(36px, 5.5vw, 66px)", fontWeight: 300, lineHeight: 1.1, letterSpacing: "-0.01em", marginBottom: 18, color: "#f0ede8" }}>
              Boostez votre <em style={{ fontStyle: "italic", color: "#e8c96a" }}>événement</em>
            </h1>
            <p style={{ fontSize: 16, color: "#8a8799", maxWidth: 480, margin: "0 auto 56px", lineHeight: 1.7 }}>
              Choisissez votre canal de sponsorisation et touchez directement la communauté LGBTQIA+.
            </p>

            {/* Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 820, margin: "0 auto", padding: "0 24px" }}>

              {/* Card App */}
              <div style={{ background: "#12121a", border: "1px solid rgba(201,168,76,0.18)", borderRadius: 20, padding: "36px 32px", display: "flex", flexDirection: "column", position: "relative", cursor: "default", transition: "transform 0.2s, box-shadow 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 60px rgba(0,0,0,0.4)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.45)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.18)"; }}
              >
                <div style={{ fontSize: 42, marginBottom: 20 }}>📱</div>
                <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Application Agenda LGBT</div>
                <div style={{ fontSize: 14, color: "#8a8799", lineHeight: 1.6, marginBottom: 28 }}>Votre événement mis en avant dans l'app, géolocalisé directement auprès de votre audience cible.</div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, marginBottom: 32, flex: 1, padding: 0 }}>
                  {[
                    "Apparaît en tête des résultats ainsi que sur la page d'accueil de l'application",
                    "Ciblage géographique — utilisateurs dans un rayon de 30 km",
                    "Visible pendant toutes les dates sélectionnées",
                    "Tarif dynamique selon votre audience réelle",
                  ].map((f) => (
                    <li key={f} style={{ fontSize: 13, color: "#8a8799", display: "flex", alignItems: "flex-start", gap: 10, lineHeight: 1.4, textAlign: "left" }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#c9a84c", marginTop: 5, flexShrink: 0, display: "inline-block" }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setModalOpen(true)}
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 16px", fontSize: 13, color: "#8a8799", cursor: "pointer", marginBottom: 24, transition: "background 0.2s, color 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.color = "#f0ede8"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLElement).style.color = "#8a8799"; }}
                >
                  👁 À quoi ressemble la sponsorisation ?
                </button>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 13, color: "#8a8799" }}>
                    <strong style={{ fontSize: 20, fontWeight: 600, color: "#f0ede8", display: "block" }}>À partir de 3€</strong>
                    par jour
                  </div>
                  <Link href="/pro/sponsoring/evenement" style={{ background: "linear-gradient(135deg, #c9a84c, #e8c96a)", color: "#0a0a0f", borderRadius: 10, padding: "12px 20px", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                    Commencer →
                  </Link>
                </div>
              </div>

              {/* Card Instagram */}
              <Link href="/pro/sponsoring/instagram" style={{ background: "#12121a", border: "1px solid rgba(232,96,154,0.18)", borderRadius: 20, padding: "36px 32px", display: "flex", flexDirection: "column", position: "relative", textDecoration: "none", color: "inherit", transition: "transform 0.2s, box-shadow 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 60px rgba(0,0,0,0.4)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(232,96,154,0.45)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(232,96,154,0.18)"; }}
              >
                {/* Populaire badge */}
                <div style={{ position: "absolute", top: -14, right: 20, background: "linear-gradient(135deg, #e8609a, #c9a84c)", color: "#0a0a0f", fontSize: 11, fontWeight: 600, padding: "4px 14px", borderRadius: 999, whiteSpace: "nowrap" }}>⭐ Populaire</div>

                {/* Instagram SVG icon */}
                <div style={{ fontSize: 42, marginBottom: 20 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="42" height="42">
                    <defs>
                      <radialGradient id="ig-grad" r="150%" cx="30%" cy="107%">
                        <stop offset="0%" stopColor="#fdf497"/>
                        <stop offset="5%" stopColor="#fdf497"/>
                        <stop offset="45%" stopColor="#fd5949"/>
                        <stop offset="60%" stopColor="#d6249f"/>
                        <stop offset="90%" stopColor="#285AEB"/>
                      </radialGradient>
                    </defs>
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="url(#ig-grad)"/>
                    <circle cx="12" cy="12" r="4.5" fill="none" stroke="white" strokeWidth="1.8"/>
                    <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
                  </svg>
                </div>
                <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Instagram @agenda_lgbt</div>
                <div style={{ fontSize: 14, color: "#8a8799", lineHeight: 1.6, marginBottom: 28 }}>Stories et posts sponsorisés auprès de 21 900 abonnés engagés.</div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, marginBottom: 32, flex: 1, padding: 0 }}>
                  {[
                    "~2 500 vues réelles par Story",
                    "Audience 18–44 ans, Paris & IDF, CSP+",
                    "Lien billetterie direct dans les Stories",
                    "2 formules : Visibilité Express ou Sold Out",
                  ].map((f) => (
                    <li key={f} style={{ fontSize: 13, color: "#8a8799", display: "flex", alignItems: "flex-start", gap: 10, lineHeight: 1.4, textAlign: "left" }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#e8609a", marginTop: 5, flexShrink: 0, display: "inline-block" }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 13, color: "#8a8799" }}>
                    <strong style={{ fontSize: 20, fontWeight: 600, color: "#f0ede8", display: "block" }}>À partir de 79€</strong>
                    HT par campagne
                  </div>
                  <span style={{ background: "linear-gradient(135deg, #e8609a, #f090be)", color: "#0a0a0f", borderRadius: 10, padding: "12px 20px", fontSize: 14, fontWeight: 600 }}>
                    Découvrir →
                  </span>
                </div>
              </Link>

            </div>
          </div>
        </div>

        {/* Modal preview */}
        {modalOpen && (
          <div
            onClick={() => setModalOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{ background: "#12121a", border: "1px solid rgba(201,168,76,0.18)", borderRadius: 20, padding: 32, maxWidth: 480, width: "100%", position: "relative" }}
            >
              <button
                onClick={() => setModalOpen(false)}
                style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "#8a8799", fontSize: 18, cursor: "pointer" }}
              >✕</button>
              <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Aperçu de la sponsorisation</div>
              <div style={{ fontSize: 14, color: "#8a8799", lineHeight: 1.6, marginBottom: 20 }}>
                Votre événement apparaît en tête des résultats et sur la page d&apos;accueil de l&apos;application, avec un badge &quot;SPONSORISÉ&quot; visible.
              </div>
              <div style={{ background: "#1a1a26", borderRadius: 12, padding: 24, textAlign: "center", color: "#8a8799", fontSize: 13 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>📱</div>
                <p>Votre événement apparaît avec un badge <strong style={{ color: "#c9a84c" }}>SPONSORISÉ</strong> en haut de la liste et sur la page d&apos;accueil.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
