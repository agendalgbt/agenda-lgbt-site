"use client";

import AuthGuard from "../components/AuthGuard";
import ProHeader from "../components/ProHeader";

const plans = [
  {
    name: "Starter",
    price: "29€",
    period: "/mois",
    description: "Idéal pour les petits organisateurs",
    features: [
      "1 événement mis en avant / mois",
      "Badge 'Sponsorisé' sur votre événement",
      "Visibilité accrue dans les résultats",
      "Support par email",
    ],
    cta: "Choisir Starter",
    gradient: "from-white/5 to-white/5",
    border: "border-white/10",
    popular: false,
  },
  {
    name: "Pro",
    price: "79€",
    period: "/mois",
    description: "Pour les organisateurs réguliers",
    features: [
      "5 événements mis en avant / mois",
      "Badge 'Pro' sur votre profil",
      "Priorité dans les résultats de recherche",
      "Notification push à vos abonnés",
      "Statistiques détaillées",
      "Support prioritaire",
    ],
    cta: "Choisir Pro",
    gradient: "from-violet-500/10 to-blue-500/10",
    border: "border-violet-500/30",
    popular: true,
  },
  {
    name: "Premium",
    price: "199€",
    period: "/mois",
    description: "Pour les grandes organisations",
    features: [
      "Événements en avant illimités",
      "Badge 'Premium' exclusif",
      "Top des résultats garanti",
      "Notifications push illimitées",
      "Page organisateur personnalisée",
      "Statistiques avancées & exports",
      "Account manager dédié",
    ],
    cta: "Nous contacter",
    gradient: "from-amber-500/10 to-orange-500/10",
    border: "border-amber-500/30",
    popular: false,
  },
];

export default function SponsoringPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0a0a0f]">
        <ProHeader />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-400 via-yellow-400 via-green-400 via-blue-500 to-violet-500" />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-16">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs text-white/50 mb-6 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Sponsoring
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Boostez votre <span className="rainbow-text">visibilité</span>
            </h1>
            <p className="text-white/40 max-w-xl mx-auto">
              Touchez plus de personnes avec nos options de mise en avant. Annulez à tout moment.
            </p>
          </div>

          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative glass rounded-2xl p-6 border ${plan.border} bg-gradient-to-b ${plan.gradient} flex flex-col`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-500 to-blue-500 text-white text-xs font-semibold px-4 py-1 rounded-full">
                    Populaire
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-white font-bold text-lg mb-1">{plan.name}</h3>
                  <p className="text-white/40 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-white/40 text-sm">{plan.period}</span>
                  </div>
                </div>

                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-white/60">
                      <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => window.open("mailto:hello@agendalgbt.com?subject=Sponsoring " + plan.name, "_blank")}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 ${
                    plan.popular
                      ? "bg-gradient-to-r from-violet-500 to-blue-500 text-white"
                      : "bg-white/10 text-white/80 hover:bg-white/15"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="glass rounded-2xl p-8 text-center">
            <h2 className="text-white font-bold text-xl mb-3">Des questions ?</h2>
            <p className="text-white/40 text-sm mb-6">
              Notre équipe est disponible pour vous aider à choisir la formule adaptée à vos besoins.
            </p>
            <a
              href="mailto:hello@agendalgbt.com?subject=Question sponsoring"
              className="inline-block bg-gradient-to-r from-violet-500 to-blue-500 text-white font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity text-sm"
            >
              Nous contacter
            </a>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
