"use client";

import Link from "next/link";
import ProHeader from "../../components/ProHeader";

export default function SponsoringSuccessInstagramPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <ProHeader />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-400 via-yellow-400 via-green-400 via-blue-500 to-violet-500" />

      <main className="max-w-lg mx-auto px-4 sm:px-6 pt-28 pb-16 text-center">
        <div className="glass rounded-2xl p-10">
          <div className="text-5xl mb-6">📸</div>
          <h1 className="text-2xl font-bold text-white mb-3">Réservation confirmée !</h1>
          <p className="text-white/50 text-sm mb-2">
            Votre publication Instagram est réservée. Notre équipe prendra contact avec vous pour finaliser les visuels.
          </p>
          <p className="text-white/30 text-xs mb-8">
            Une confirmation avec votre facture PDF vous a été envoyée par email.
          </p>
          <Link
            href="/pro/dashboard"
            className="inline-block bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity text-sm"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </main>
    </div>
  );
}
