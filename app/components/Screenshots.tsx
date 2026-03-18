"use client";

import { useEffect, useRef } from "react";

const screens = [
  { src: "/screen1.png", title: "Accueil", label: "Soirées & bars près de toi" },
  { src: "/screen2.png", title: "Événements", label: "Tous les événements LGBT+" },
  { src: "/screen3.png", title: "Carte", label: "Explore ta ville" },
];

export default function Screenshots() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const els = entry.target.querySelectorAll(".animate-on-scroll");
            els.forEach((el, i) => {
              setTimeout(() => el.classList.add("visible"), i * 150);
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
    <section ref={sectionRef} className="py-24 sm:py-32 px-4 sm:px-6 overflow-hidden">
      <div className="absolute left-0 right-0 h-full pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-600/5 blur-[150px]" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16 animate-on-scroll">
          <div className="inline-block glass rounded-full px-4 py-1.5 text-xs text-white/50 mb-4 uppercase tracking-widest">
            L'application
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="rainbow-text">Belle</span>
            <span className="text-white">, simple</span>
            <span className="text-white"> & intuitive</span>
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            Une expérience pensée pour la communauté, disponible sur iOS et Android.
          </p>
        </div>

        {/* Screenshots */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-center gap-4 lg:gap-8">
          {screens.map((screen, idx) => (
            <div
              key={screen.title}
              className={`animate-on-scroll flex flex-col items-center transition-all duration-500 ${
                idx === 1 ? "sm:scale-110 z-10" : "sm:scale-95 opacity-80"
              }`}
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              <img
                src={screen.src}
                alt={screen.label}
                className="w-[280px] sm:w-[240px] lg:w-[290px] drop-shadow-2xl"
              />
              <p className="text-white/40 text-xs mt-4 text-center">{screen.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
