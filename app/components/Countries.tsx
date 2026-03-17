"use client";

import { useEffect, useRef } from "react";

const countries = [
  {
    flag: "🇫🇷",
    name: "France",
    status: "available",
    desc: "Toutes les régions",
    gradient: "from-blue-600 to-blue-400",
    count: "Paris, Lyon, Marseille, Bordeaux…",
  },
  {
    flag: "🇧🇪",
    name: "Belgique",
    status: "available",
    desc: "Disponible maintenant",
    gradient: "from-yellow-500 to-orange-400",
    count: "Bruxelles, Liège, Gand, Anvers…",
  },
  {
    flag: "🇪🇸",
    name: "Espagne",
    status: "soon",
    desc: "Bientôt disponible",
    gradient: "from-red-500 to-orange-400",
    count: "Madrid, Barcelone, Valencia…",
  },
  {
    flag: "🇩🇪",
    name: "Allemagne",
    status: "soon",
    desc: "Bientôt disponible",
    gradient: "from-zinc-500 to-zinc-400",
    count: "Berlin, Munich, Hambourg…",
  },
];

export default function Countries() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const els = entry.target.querySelectorAll(".animate-on-scroll");
            els.forEach((el, i) => {
              setTimeout(() => el.classList.add("visible"), i * 100);
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 sm:py-32 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-on-scroll">
          <div className="inline-block glass rounded-full px-4 py-1.5 text-xs text-white/50 mb-4 uppercase tracking-widest">
            Pays couverts
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">Présent en </span>
            <span className="rainbow-text">Europe</span>
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            Agenda LGBT grandit avec la communauté. Déjà actif dans 2 pays, l'expansion continue.
          </p>
        </div>

        {/* Country cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {countries.map((country, i) => (
            <div
              key={country.name}
              className={`animate-on-scroll relative glass rounded-2xl p-6 text-center overflow-hidden group transition-all duration-300 ${
                country.status === "available"
                  ? "hover:bg-white/[0.07] cursor-default"
                  : "opacity-60"
              }`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              {/* Status badge */}
              <div className="absolute top-3 right-3">
                {country.status === "available" ? (
                  <span className="flex items-center gap-1 text-[10px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Actif
                  </span>
                ) : (
                  <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
                    Bientôt
                  </span>
                )}
              </div>

              {/* Flag */}
              <div
                className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${country.gradient} flex items-center justify-center text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform ${
                  country.status === "soon" ? "grayscale" : ""
                }`}
              >
                {country.flag}
              </div>

              <h3 className="text-white font-bold text-xl mb-1">{country.name}</h3>
              <p className="text-white/50 text-sm mb-3">{country.desc}</p>
              <p className="text-white/25 text-xs leading-relaxed">{country.count}</p>

              {/* Available glow */}
              {country.status === "available" && (
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${country.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Expansion note */}
        <div className="mt-12 text-center animate-on-scroll">
          <p className="text-white/25 text-sm">
            🌍 L'objectif : couvrir toute l'Europe d'ici 2027
          </p>
        </div>
      </div>
    </section>
  );
}
