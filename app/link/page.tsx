"use client";

import { useEffect, useState } from "react";

const FIREBASE_PROJECT_ID = "agendalgbt-app";
const FIREBASE_API_KEY = "AIzaSyBX793d9b70uGXH3E9m_zUt-zK6B6w61gM";

interface LinkItem {
  label: string;
  description: string;
  emoji: string;
  href: string;
  gradient: string;
  glow: string;
  order: number;
  active: boolean;
}

const fallbackLinks: LinkItem[] = [
  {
    emoji: "📱",
    label: "App Agenda LGBT 🏳️‍🌈",
    description: "Télécharge l'application",
    href: "https://www.agendalgbt.com",
    gradient: "from-violet-500 to-blue-500",
    glow: "shadow-violet-500/30",
    order: 1,
    active: true,
  },
  {
    emoji: "🎉",
    label: "Organisateurs d'événement ?",
    description: "Soumets ton événement ici",
    href: "https://foamy-hygienic-7f7.notion.site/1f20bca09cae80cfb911c5d0a5f177b0",
    gradient: "from-pink-500 to-rose-400",
    glow: "shadow-pink-500/30",
    order: 2,
    active: true,
  },
  {
    emoji: "🔥",
    label: "Promouvoir votre événement",
    description: "Nos offres de sponsoring",
    href: "https://sponsor.agendalgbt.com/",
    gradient: "from-orange-400 to-yellow-400",
    glow: "shadow-orange-400/30",
    order: 3,
    active: true,
  },
  {
    emoji: "💬",
    label: "Nous contacter",
    description: "hello@agendalgbt.com",
    href: "mailto:hello@agendalgbt.com",
    gradient: "from-green-400 to-emerald-500",
    glow: "shadow-green-400/30",
    order: 4,
    active: true,
  },
];

function parseFirestoreDoc(doc: any): LinkItem {
  const f = doc.fields || {};
  return {
    label: f.label?.stringValue || "",
    description: f.description?.stringValue || "",
    emoji: f.emoji?.stringValue || "🔗",
    href: f.href?.stringValue || "#",
    gradient: f.gradient?.stringValue || "from-violet-500 to-blue-500",
    glow: f.glow?.stringValue || "shadow-violet-500/30",
    order: parseInt(f.order?.integerValue || "0"),
    active: f.active?.booleanValue ?? true,
  };
}

export default function LinkPage() {
  const [links, setLinks] = useState<LinkItem[]>(fallbackLinks);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const res = await fetch(
          `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/links?key=${FIREBASE_API_KEY}`
        );
        const data = await res.json();
        if (data.documents && data.documents.length > 0) {
          const parsed = data.documents
            .map(parseFirestoreDoc)
            .filter((l: LinkItem) => l.active)
            .sort((a: LinkItem, b: LinkItem) => a.order - b.order);
          setLinks(parsed);
        }
      } catch {
        // garde les fallbackLinks si Firestore inaccessible
      } finally {
        setTimeout(() => setVisible(true), 100);
      }
    };
    fetchLinks();
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-violet-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-pink-500/10 blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-blue-500/10 blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Rainbow line top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-400 via-yellow-400 via-green-400 via-blue-500 to-violet-500" />

      <div
        className="relative z-10 w-full max-w-sm flex flex-col items-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        {/* Logo + Name */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/logo.png"
            alt="Agenda LGBT"
            className="w-20 h-20 rounded-2xl object-contain bg-white shadow-2xl mb-4"
          />
          <h1 className="text-2xl font-bold">
            <span className="rainbow-text">Agenda</span>
            <span className="text-white ml-1">LGBT</span>
          </h1>
          <p className="text-white/40 text-sm mt-1 text-center">
            Tous les événements LGBT+ en France & Belgique
          </p>
        </div>

        {/* Links */}
        <div className="w-full flex flex-col gap-3">
          {links.map((link, i) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("mailto") ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="group relative w-full rounded-2xl overflow-hidden"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.5s ease ${i * 80 + 200}ms, transform 0.5s ease ${i * 80 + 200}ms`,
              }}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${link.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
              <div className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-white/20 transition-colors" />
              <div className="relative flex items-center gap-4 px-5 py-4">
                <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${link.gradient} flex items-center justify-center text-xl shadow-lg ${link.glow} flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  {link.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-sm leading-tight">{link.label}</div>
                  <div className="text-white/40 text-xs mt-0.5">{link.description}</div>
                </div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </a>
          ))}
        </div>

        {/* Instagram */}
        <a
          href="https://www.instagram.com/agenda_lgbt/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors text-sm"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
          @agenda_lgbt
        </a>

        <p className="mt-6 text-white/20 text-xs">© 2026 Agenda LGBT</p>
      </div>
    </main>
  );
}
