"use client";

import { useEffect, useRef } from "react";

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (el) {
      setTimeout(() => el.classList.add("visible"), 100);
    }
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-violet-600/15 blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-blue-500/15 blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full bg-rose-500/10 blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-green-500/10 blur-[90px] animate-pulse" style={{ animationDelay: "1.5s" }} />
      </div>

      {/* Rainbow line top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-400 via-yellow-400 via-green-400 via-blue-500 to-violet-500" />

      <div ref={heroRef} className="animate-on-scroll relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 text-sm text-white/60">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Application disponible gratuitement
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
          <span className="rainbow-text">Tous les événements</span>
          <br />
          <span className="text-white">LGBT en France</span>
          <br />
          <span className="text-white/80">&amp; Belgique test</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
          L'application communautaire qui rythme tes nuits et tes journées. Retrouve les meilleures soirées LGBT+, mais aussi les bars, saunas, et expos, réunis en un seul endroit.

        </p>

        {/* CTA Buttons */}
        <div id="download" className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://apps.apple.com/us/app/agenda-lgbt/id6758344938"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity hover:scale-105 transform"
          >
            <img
              src="/badge-appstore.svg"
              alt="Télécharger sur l'App Store"
              className="h-14"
            />
          </a>

          <a
            href="https://play.google.com/store/apps/details?id=com.pridepulse.agendalgbtapp&hl=fr"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity hover:scale-105 transform"
          >
            <img
              src="/badge-googleplay.svg"
              alt="Disponible sur Google Play"
              className="h-14"
            />
          </a>
        </div>

        {/* Stats */}
        <div className="mt-16 flex flex-wrap justify-center gap-8 sm:gap-16">
          {[
            { value: "2 pays", label: "couverts" },
            { value: "100%", label: "gratuit" },
            { value: "+500", label: "événements" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold rainbow-text">{stat.value}</div>
              <div className="text-white/40 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
    </section>
  );
}
