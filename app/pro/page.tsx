"use client";

import { useEffect, useState } from "react";

const features = [
  {
    emoji: "📅",
    title: "Soumettez vos événements",
    description: "Remplissez notre formulaire simple et rapide. Votre événement est examiné sous 24h.",
  },
  {
    emoji: "📧",
    title: "Notification immédiate",
    description: "Recevez un email dès que votre événement est validé ou si des modifications sont nécessaires.",
  },
  {
    emoji: "👥",
    title: "Touchez votre communauté",
    description: "Accédez à des milliers d'utilisateurs LGBT+ en France et en Belgique via notre application.",
  },
  {
    emoji: "🚀",
    title: "Boostez votre visibilité",
    description: "Options de mise en avant sponsorisée pour maximiser la portée de vos événements.",
  },
  {
    emoji: "📊",
    title: "Suivez vos soumissions",
    description: "Un dashboard dédié pour voir le statut de tous vos événements en temps réel.",
  },
  {
    emoji: "🆓",
    title: "Gratuit pour commencer",
    description: "La soumission d'événements est entièrement gratuite. Des options premium sont disponibles.",
  },
];

export default function ProLandingPage() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0f] overflow-hidden">
      {/* Rainbow line top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-400 via-yellow-400 via-green-400 via-blue-500 to-violet-500" />

      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-violet-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-pink-500/10 blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Header simple */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0f]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/pro" className="flex items-center gap-2">
            <img src="/logo.png" alt="Agenda LGBT" className="w-7 h-7 rounded-lg object-contain bg-white" />
            <span className="font-bold text-sm">
              <span className="rainbow-text">Agenda</span>
              <span className="text-white ml-1">LGBT</span>
              <span className="text-white/40 ml-2 font-normal">Pro</span>
            </span>
          </a>
          <div className="flex items-center gap-4">
            <a href="/pro/connexion" className="text-white/50 hover:text-white text-sm transition-colors">
              Connexion
            </a>
            <a
              href="/pro/inscription"
              className="bg-gradient-to-r from-violet-500 to-blue-500 text-white text-sm px-4 py-2 rounded-xl hover:opacity-90 transition-opacity font-medium"
            >
              Créer un compte
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-24 text-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(30px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}
      >
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs text-white/50 mb-6 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Espace organisateurs
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
          <span className="text-white">Faites connaître vos</span>
          <br />
          <span className="rainbow-text">événements LGBT+</span>
        </h1>

        <p className="text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
          Rejoignez des centaines d'organisateurs qui utilisent Agenda LGBT pour toucher leur communauté en France et en Belgique. Soumission gratuite, validation rapide.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/pro/inscription"
            className="w-full sm:w-auto bg-gradient-to-r from-violet-500 to-blue-500 text-white font-semibold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/25"
          >
            Créer mon espace pro
          </a>
          <a
            href="/pro/connexion"
            className="w-full sm:w-auto glass text-white/70 hover:text-white font-medium px-8 py-3.5 rounded-2xl transition-colors"
          >
            Déjà un compte →
          </a>
        </div>

        {/* Stats */}
        <div className="mt-16 flex flex-wrap justify-center gap-12">
          {[
            { value: "+500", label: "événements publiés" },
            { value: "2 pays", label: "France & Belgique" },
            { value: "100%", label: "gratuit" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold rainbow-text">{stat.value}</div>
              <div className="text-white/40 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-white mb-12">
          Tout ce dont vous avez <span className="rainbow-text">besoin</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="glass rounded-2xl p-6"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.5s ease ${i * 80 + 400}ms, transform 0.5s ease ${i * 80 + 400}ms`,
              }}
            >
              <span className="text-3xl mb-4 block">{f.emoji}</span>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="relative z-10 max-w-2xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Prêt à soumettre votre premier événement ?</h2>
        <p className="text-white/40 mb-8">Créez votre espace pro en 2 minutes, c'est gratuit.</p>
        <a
          href="/pro/inscription"
          className="inline-block bg-gradient-to-r from-violet-500 to-blue-500 text-white font-semibold px-10 py-4 rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/25"
        >
          Commencer gratuitement →
        </a>
      </section>

      {/* Footer mini */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-white/20 text-xs">
        © 2026 Pride Pulse — <a href="https://agendalgbt.com" className="hover:text-white/40 transition-colors">agendalgbt.com</a>
      </footer>
    </main>
  );
}
