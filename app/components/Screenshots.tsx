"use client";

import { useEffect, useRef } from "react";

const screens = [
  {
    title: "Découverte",
    color: "from-violet-600 to-blue-500",
    items: [
      { type: "header", text: "Près de toi 📍" },
      { type: "card", emoji: "🏳️‍🌈", text: "Pride de Paris", sub: "Sam. 28 juin · Paris" },
      { type: "card", emoji: "🎵", text: "Soirée Électro Queer", sub: "Ven. 14 mars · Lyon" },
      { type: "card", emoji: "🎨", text: "Expo : Artistes LGBT", sub: "Mar. au dim. · Bordeaux" },
      { type: "tag-row", tags: ["Toutes catégories", "Soirées", "Pride"] },
    ],
  },
  {
    title: "Carte",
    color: "from-blue-500 to-green-400",
    items: [
      { type: "header", text: "Carte des événements 🗺️" },
      { type: "map" },
      { type: "bottom-sheet", text: "14 événements ce weekend" },
    ],
  },
  {
    title: "Détail",
    color: "from-green-400 to-yellow-400",
    items: [
      { type: "event-hero", emoji: "🏳️‍🌈", text: "Pride de Paris 2026" },
      { type: "meta", items: ["📅 Samedi 28 juin 2026", "📍 Place de la République", "🆓 Gratuit"] },
      { type: "desc", text: "La plus grande marche des fiertés de France. Rejoins des milliers de personnes dans les rues de Paris pour célébrer la diversité et l'égalité." },
      { type: "btn", text: "Je participe ✓" },
    ],
  },
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
      {/* Background */}
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

        {/* Phone mockups */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-4 lg:gap-8">
          {screens.map((screen, idx) => (
            <div
              key={screen.title}
              className="animate-on-scroll"
              style={{
                transitionDelay: `${idx * 150}ms`,
                transform: idx === 1 ? "scale(1.05)" : "scale(0.95)",
              }}
            >
              <PhoneMockup screen={screen} highlighted={idx === 1} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PhoneMockup({
  screen,
  highlighted,
}: {
  screen: (typeof screens)[0];
  highlighted: boolean;
}) {
  return (
    <div
      className={`relative w-[200px] sm:w-[210px] lg:w-[230px] ${
        highlighted ? "z-10" : "z-0 opacity-80"
      }`}
    >
      {/* Phone frame */}
      <div
        className={`relative rounded-[36px] p-[2px] ${
          highlighted
            ? `bg-gradient-to-b ${screen.color} shadow-2xl`
            : "bg-white/10"
        }`}
      >
        {/* Phone body */}
        <div className="bg-[#111118] rounded-[34px] overflow-hidden">
          {/* Status bar */}
          <div className="flex items-center justify-between px-5 pt-3 pb-1">
            <span className="text-white/40 text-[10px]">9:41</span>
            <div className="w-16 h-4 bg-black rounded-full absolute top-2 left-1/2 -translate-x-1/2" />
            <div className="flex gap-1 items-center">
              <div className="flex gap-0.5">
                {[3, 4, 5].map((h) => (
                  <div
                    key={h}
                    className="w-0.5 bg-white/40 rounded-sm"
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-2.5 h-2.5 text-white/40"
              >
                <path d="M1.371 8.143c5.858-5.857 15.356-5.857 21.213 0a.75.75 0 0 1-1.06 1.06c-5.272-5.27-13.82-5.27-19.092 0a.75.75 0 0 1-1.06-1.06Z" />
                <path d="M5.179 11.952c3.686-3.687 9.666-3.687 13.353 0a.75.75 0 0 1-1.061 1.06c-3.1-3.1-8.13-3.1-11.231 0a.75.75 0 0 1-1.06-1.06Z" />
                <path d="M8.989 15.76c1.515-1.515 3.972-1.515 5.487 0a.75.75 0 0 1-1.06 1.061 2.501 2.501 0 0 0-3.367 0 .75.75 0 0 1-1.06-1.06Z" />
                <path d="M12 19.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
              </svg>
              <div className="w-4 h-2 border border-white/40 rounded-sm relative">
                <div className="absolute inset-[1px] right-[2px] bg-white/40 rounded-sm" />
              </div>
            </div>
          </div>

          {/* Screen content */}
          <div className="px-3 pt-1 pb-4 min-h-[340px] flex flex-col gap-2">
            {screen.items.map((item, i) => (
              <ScreenItem key={i} item={item} gradient={screen.color} />
            ))}
          </div>

          {/* Home indicator */}
          <div className="flex justify-center pb-2">
            <div className="w-20 h-1 bg-white/20 rounded-full" />
          </div>
        </div>
      </div>

      {/* Label */}
      <p className="text-center text-white/40 text-xs mt-3">{screen.title}</p>
    </div>
  );
}

function ScreenItem({
  item,
  gradient,
}: {
  item: { type: string; [key: string]: unknown };
  gradient: string;
}) {
  switch (item.type) {
    case "header":
      return (
        <div className="text-white font-semibold text-[11px] px-1 pt-1">
          {item.text as string}
        </div>
      );

    case "card":
      return (
        <div className="glass rounded-xl p-2 flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-base flex-shrink-0`}
          >
            {item.emoji as string}
          </div>
          <div>
            <div className="text-white text-[10px] font-medium leading-tight">
              {item.text as string}
            </div>
            <div className="text-white/40 text-[9px] leading-tight">
              {item.sub as string}
            </div>
          </div>
        </div>
      );

    case "tag-row":
      return (
        <div className="flex gap-1 flex-wrap">
          {(item.tags as string[]).map((tag, i) => (
            <span
              key={i}
              className={`text-[8px] px-2 py-0.5 rounded-full ${
                i === 0
                  ? `bg-gradient-to-r ${gradient} text-white`
                  : "glass text-white/50"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      );

    case "map":
      return (
        <div
          className={`rounded-xl h-36 bg-gradient-to-br ${gradient} opacity-20 relative overflow-hidden`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🗺️</span>
          </div>
          {/* Fake pins */}
          {["top-4 left-6", "top-10 right-8", "bottom-8 left-12", "top-16 left-1/2"].map(
            (pos, i) => (
              <div
                key={i}
                className={`absolute ${pos} w-3 h-3 rounded-full bg-gradient-to-br ${gradient} opacity-100 border border-white/40`}
              />
            )
          )}
        </div>
      );

    case "bottom-sheet":
      return (
        <div className={`glass rounded-xl p-2.5 bg-gradient-to-r ${gradient} bg-opacity-10`}>
          <div className="text-white text-[10px] font-semibold">{item.text as string}</div>
        </div>
      );

    case "event-hero":
      return (
        <div
          className={`rounded-xl h-20 bg-gradient-to-br ${gradient} flex items-center justify-center`}
        >
          <div className="text-center">
            <div className="text-2xl">{item.emoji as string}</div>
            <div className="text-white text-[9px] font-bold mt-0.5">
              {item.text as string}
            </div>
          </div>
        </div>
      );

    case "meta":
      return (
        <div className="flex flex-col gap-0.5">
          {(item.items as string[]).map((meta, i) => (
            <div key={i} className="text-white/60 text-[9px]">
              {meta}
            </div>
          ))}
        </div>
      );

    case "desc":
      return (
        <div className="text-white/40 text-[9px] leading-relaxed">
          {item.text as string}
        </div>
      );

    case "btn":
      return (
        <div
          className={`bg-gradient-to-r ${gradient} rounded-xl py-2 text-center text-white text-[10px] font-semibold mt-auto`}
        >
          {item.text as string}
        </div>
      );

    default:
      return null;
  }
}
