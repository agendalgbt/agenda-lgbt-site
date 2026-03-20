"use client";

import AuthGuard from "../components/AuthGuard";
import ProHeader from "../components/ProHeader";
import Link from "next/link";

const offers = [
  {
    id: "evenement",
    icon: "🚀",
    title: "Sponsorisation Événement",
    subtitle: "Mise en avant dans l'application",
    description: "Votre événement apparaît en tête des résultats avec un badge « Sponsorisé » pendant les jours choisis.",
    features: [
      "Badge Sponsorisé visible par tous les utilisateurs",
      "Position prioritaire dans les résultats",
      "Minimum 3 jours · 9 € HT / jour",
      "Facturation avec TVA 20 %",
      "Facture PDF automatique",
    ],
    price: "à partir de 27 € HT",
    cta: "Sponsoriser un événement",
    href: "/pro/sponsoring/evenement",
    gradient: "from-violet-500/10 to-blue-500/10",
    border: "border-violet-500/30",
    ctaClass: "bg-gradient-to-r from-violet-500 to-blue-500",
  },
  {
    id: "instagram",
    icon: "📸",
    title: "Sponsorisation Instagram",
    subtitle: "Publication sur @agenda_lgbt",
    description: "Votre événement est mis en avant sur notre compte Instagram suivi par toute la communauté LGBT+.",
    features: [
      "Stories sur @agenda_lgbt",
      "Publication de post",
      "Choix des dates de publication",
      "Brief personnalisé",
      "Facturation avec TVA 20 %",
    ],
    price: "à partir de 29 € HT",
    cta: "Réserver une publication",
    href: "/pro/sponsoring/instagram",
    gradient: "from-pink-500/10 to-orange-500/10",
    border: "border-pink-500/30",
    ctaClass: "bg-gradient-to-r from-pink-500 to-orange-400",
  },
];

export default function SponsoringPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0a0a0f]">
        <ProHeader />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-400 via-yellow-400 via-green-400 via-blue-500 to-violet-500" />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-16">
          {/* Header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs text-white/50 mb-6 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Sponsoring
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Boostez votre <span className="rainbow-text">visibilité</span>
            </h1>
            <p className="text-white/40 max-w-xl mx-auto text-sm">
              Deux canaux pour toucher la communauté LGBT+ : l'application et Instagram.
            </p>
          </div>

          {/* Offres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className={`glass rounded-2xl p-7 border ${offer.border} bg-gradient-to-b ${offer.gradient} flex flex-col`}
              >
                <div className="text-3xl mb-4">{offer.icon}</div>
                <h2 className="text-white font-bold text-xl mb-1">{offer.title}</h2>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-4">{offer.subtitle}</p>
                <p className="text-white/60 text-sm mb-6 leading-relaxed">{offer.description}</p>

                <ul className="flex flex-col gap-2.5 mb-8 flex-1">
                  {offer.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white/60">
                      <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  <p className="text-white/40 text-xs mb-3">{offer.price}</p>
                  <Link
                    href={offer.href}
                    className={`block w-full text-center ${offer.ctaClass} text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity text-sm`}
                  >
                    {offer.cta} →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="glass rounded-2xl p-8 text-center">
            <h2 className="text-white font-bold text-lg mb-2">Une question ?</h2>
            <p className="text-white/40 text-sm mb-6">
              Notre équipe est disponible pour vous aider à choisir la formule adaptée.
            </p>
            <a
              href="mailto:hello@agendalgbt.com?subject=Question sponsoring"
              className="inline-block bg-white/10 text-white/80 font-semibold px-8 py-3 rounded-xl hover:bg-white/15 transition-colors text-sm"
            >
              Nous contacter
            </a>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
