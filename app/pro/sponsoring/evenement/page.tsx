"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import AuthGuard from "../../components/AuthGuard";
import ProHeader from "../../components/ProHeader";

const PRICE_HT_PER_DAY = 900; // centimes — 9 € HT / jour
const TVA_RATE = 0.2;
const MIN_DAYS = 3;

function getDatesOfMonth(year: number, month: number): string[] {
  const days: string[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    if (date >= new Date(new Date().setHours(0, 0, 0, 0))) {
      days.push(date.toISOString().split("T")[0]);
    }
  }
  return days;
}

export default function SponsoringEvenementPage() {
  const { organizer, user } = useAuth();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [eventName, setEventName] = useState("");
  const [eventId, setEventId] = useState("");
  const [billing, setBilling] = useState({ name: "", address: "", zip: "", city: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const amountHT = selectedDays.length * PRICE_HT_PER_DAY;
  const amountTVA = Math.round(amountHT * TVA_RATE);
  const amountTTC = amountHT + amountTVA;
  const fmt = (cents: number) => (cents / 100).toFixed(2).replace(".", ",");

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const dates = getDatesOfMonth(currentYear, currentMonth);
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const handleSubmit = async () => {
    if (!eventName.trim()) { setError("Veuillez saisir le nom de l'événement."); return; }
    if (!eventId.trim()) { setError("Veuillez saisir l'ID de l'événement."); return; }
    if (selectedDays.length < MIN_DAYS) { setError(`Sélectionnez au minimum ${MIN_DAYS} jours.`); return; }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: eventId.trim(),
          eventName: eventName.trim(),
          days: selectedDays,
          amount: amountTTC,
          amountHT,
          orgaEmail: organizer?.email || user?.email || "",
          billingName: billing.name,
          billingAddress: billing.address,
          billingZip: billing.zip,
          billingCity: billing.city,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError(data.error || "Une erreur est survenue.");
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0a0a0f]">
        <ProHeader />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-400 via-yellow-400 via-green-400 via-blue-500 to-violet-500" />

        <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-16">
          <div className="mb-8">
            <a href="/pro/sponsoring" className="text-white/40 hover:text-white/60 text-sm transition-colors">← Retour au sponsoring</a>
            <h1 className="text-2xl font-bold text-white mt-4 mb-1">Sponsorisation Événement</h1>
            <p className="text-white/40 text-sm">9 € HT / jour · minimum 3 jours</p>
          </div>

          <div className="flex flex-col gap-6">
            {/* Événement */}
            <div className="glass rounded-2xl p-6">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-4">Événement</p>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-white/60 text-xs uppercase tracking-wider mb-1.5 block">Nom de l'événement *</label>
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="Ex: Soirée Pride Club"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-violet-500/50"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-xs uppercase tracking-wider mb-1.5 block">ID de l'événement *</label>
                  <input
                    type="text"
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                    placeholder="ID Firestore de votre événement"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-violet-500/50"
                  />
                  <p className="text-white/30 text-xs mt-1.5">L'ID se trouve dans votre espace de gestion. Contactez-nous si vous ne le connaissez pas.</p>
                </div>
              </div>
            </div>

            {/* Calendrier */}
            <div className="glass rounded-2xl p-6">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-4">Jours à sponsoriser (min. {MIN_DAYS})</p>
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="text-white/40 hover:text-white transition-colors px-2 py-1">←</button>
                <p className="text-white font-medium capitalize text-sm">{monthName}</p>
                <button onClick={nextMonth} className="text-white/40 hover:text-white transition-colors px-2 py-1">→</button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                  <div key={i} className="text-center text-white/30 text-xs py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array(offset).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
                {dates.map((date) => {
                  const selected = selectedDays.includes(date);
                  const day = new Date(date).getDate();
                  return (
                    <button
                      key={date}
                      onClick={() => toggleDay(date)}
                      className={`aspect-square rounded-lg text-xs font-medium transition-all ${
                        selected
                          ? "bg-violet-500 text-white"
                          : "text-white/50 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              {selectedDays.length > 0 && (
                <p className="text-violet-400 text-xs mt-3 text-center">
                  {selectedDays.length} jour(s) sélectionné(s)
                </p>
              )}
            </div>

            {/* Facturation */}
            <div className="glass rounded-2xl p-6">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-4">Informations de facturation (optionnel)</p>
              <div className="flex flex-col gap-3">
                {[
                  { key: "name", label: "Nom / Société", placeholder: "Pride Events SARL" },
                  { key: "address", label: "Adresse", placeholder: "12 rue de la Fierté" },
                  { key: "zip", label: "Code postal", placeholder: "75001" },
                  { key: "city", label: "Ville", placeholder: "Paris" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="text-white/60 text-xs uppercase tracking-wider mb-1.5 block">{label}</label>
                    <input
                      type="text"
                      value={billing[key as keyof typeof billing]}
                      onChange={(e) => setBilling(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-violet-500/50"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Récap & paiement */}
            {selectedDays.length > 0 && (
              <div className="glass rounded-2xl p-6 border border-violet-500/20">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-4">Récapitulatif</p>
                <div className="flex flex-col gap-2 text-sm mb-6">
                  <div className="flex justify-between"><span className="text-white/60">{selectedDays.length} jour(s) × 9 € HT</span><span className="text-white">{fmt(amountHT)} €</span></div>
                  <div className="flex justify-between"><span className="text-white/60">TVA (20 %)</span><span className="text-white">{fmt(amountTVA)} €</span></div>
                  <div className="flex justify-between border-t border-white/10 pt-2 mt-1"><span className="text-white font-semibold">Total TTC</span><span className="text-white font-bold text-lg">{fmt(amountTTC)} €</span></div>
                </div>
                {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-violet-500 to-blue-500 text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
                >
                  {loading ? "Redirection vers le paiement..." : `Payer ${fmt(amountTTC)} € TTC →`}
                </button>
                <p className="text-white/30 text-xs text-center mt-3">Paiement sécurisé par Stripe · Facture PDF incluse</p>
              </div>
            )}

            {error && selectedDays.length === 0 && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
