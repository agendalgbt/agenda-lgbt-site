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
        <div
          className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-blue-500/15 blur-[100px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full bg-rose-500/10 blur-[100px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-green-500/10 blur-[90px] animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      {/* Rainbow line top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-400 via-yellow-400 via-green-400 via-blue-500 to-violet-500" />

      <div
        ref={heroRef}
        className="animate-on-scroll relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center"
      >
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
          <span className="text-white/80">&amp; Belgique</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
          L'application communautaire qui réunit toute l'actualité LGBT+ — soirées,
          marches des fiertés, expos, concerts — en un seul endroit.
        </p>

        {/* CTA Buttons */}
        <div
          id="download"
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* App Store */}
          <a
            href="https://apps.apple.com/us/app/agenda-lgbt/id6758344938"
            className="group flex items-center gap-3 bg-white text-black px-6 py-3.5 rounded-2xl font-semibold hover:bg-white/90 transition-all hover:scale-105 shadow-xl shadow-white/10 min-w-[200px]"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-7 h-7 flex-shrink-0"
              fill="currentColor"
            >
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <div className="text-left">
              <div className="text-xs text-black/60 leading-none mb-0.5">
                Télécharger sur
              </div>
              <div className="text-sm font-bold leading-none">App Store</div>
            </div>
          </a>

          {/* Google Play */}
          <a
            href="https://play.google.com/store/apps/details?id=com.pridepulse.agendalgbtapp&hl=fr"
            className="group flex items-center gap-3 bg-white text-black px-6 py-3.5 rounded-2xl font-semibold hover:bg-white/90 transition-all hover:scale-105 shadow-xl shadow-white/10 min-w-[200px]"
          >
            <svg viewBox="0 0 24 24" className="w-7 h-7 flex-shrink-0">
              <path
                d="M3.18 23.76c.37.2.8.22 1.21.03l12.37-7.13-2.73-2.74-10.85 9.84z"
                fill="#EA4335"
              />
              <path
                d="M22.49 10.18c-.64-.44-1.56-.44-2.2 0l-2.92 1.69-3.09-3.09 3.09-3.09 2.92 1.68c.64.44 1.56.44 2.2 0 .63-.43.63-1.13 0-1.57L10.12.11C9.73-.08 9.3-.05 8.93.15L3.18 3.47l9.1 9.09 10.21-5.88c.63-.44.63-1.13 0-1.5z"
                fill="#FBBC04"
              />
              <path
                d="M3.18.15C2.59.48 2.2 1.12 2.2 1.9v20.2c0 .78.4 1.42.98 1.66L13.56 12.5 3.18.15z"
                fill="#4285F4"
              />
              <path
                d="M3.18 23.76l10.38-11.26-10.38-11.35c-.59.33-.98.97-.98 1.75v20.2c0 .78.4 1.42.98 1.66z"
                fill="#34A853"
              />
            </svg>
            <div className="text-left">
              <div className="text-xs text-black/60 leading-none mb-0.5">
                Disponible sur
              </div>
              <div className="text-sm font-bold leading-none">Google Play</div>
            </div>
          </a>
        </div>

        {/* Stats */}
        <div className="mt-16 flex flex-wrap justify-center gap-8 sm:gap-16">
          {[
            { value: "2 pays", label: "couverts" },
            { value: "100%", label: "gratuit" },
            { value: "∞", label: "événements" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold rainbow-text">
                {stat.value}
              </div>
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
