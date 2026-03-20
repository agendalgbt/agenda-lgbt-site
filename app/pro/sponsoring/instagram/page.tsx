"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "../../context/AuthContext";
import AuthGuard from "../../components/AuthGuard";
import ProHeader from "../../components/ProHeader";

const PACKS = [
  {
    id: "stories_3j",
    name: "Stories 3 jours",
    description: "3 stories sur @agenda_lgbt sur des jours consécutifs ou espacés.",
    amountHT: 4500,
    hasStories: 3,
    hasPost: false,
    icon: "📱",
  },
  {
    id: "post",
    name: "Post unique",
    description: "1 post publié sur @agenda_lgbt pour promouvoir votre événement.",
    amountHT: 2900,
    hasStories: 0,
    hasPost: true,
    icon: "🖼️",
  },
  {
    id: "complet",
    name: "Pack complet",
    description: "3 stories + 1 post sur @agenda_lgbt. La visibilité maximale.",
    amountHT: 6500,
    hasStories: 3,
    hasPost: true,
    icon: "⭐",
    popular: true,
  },
];

const TVA_RATE = 0.2;
const fmt = (cents: number) => (cents / 100).toFixed(2).replace(".", ",");

function getUpcomingDates(n = 30): string[] {
  const dates: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 1; i <= n; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

export default function SponsoringInstagramPage() {
  const { organizer, user } = useAuth();
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [bookedDays, setBookedDays] = useState<{ [date: string]: { story?: boolean; post?: boolean } }>({});
  const [storyDates, setStoryDates] = useState<string[]>([]);
  const [postDate, setPostDate] = useState("");
  const [form, setForm] = useState({ eventName: "", eventDate: "", instaHandle: "", brief: "", ticketLink: "", transferLink: "" });
  const [billing, setBilling] = useState({ name: "", address: "", zip: "", city: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pack = PACKS.find((p) => p.id === selectedPack);
  const amountHT = pack?.amountHT || 0;
  const amountTVA = Math.round(amountHT * TVA_RATE);
  const amountTTC = amountHT + amountTVA;

  useEffect(() => {
    const fetchBooked = async () => {
      const snap = await getDocs(collection(db, "instagram_booked_days"));
      const booked: typeof bookedDays = {};
      snap.forEach((d) => { booked[d.id] = d.data(); });
      setBookedDays(booked);
    };
    fetchBooked();
  }, []);

  const upcomingDates = getUpcomingDates(60);

  const toggleStoryDate = (date: string) => {
    if (!pack) return;
    if (storyDates.includes(date)) {
      setStoryDates((prev) => prev.filter((d) => d !== date));
    } else if (storyDates.length < pack.hasStories) {
      setStoryDates((prev) => [...prev, date]);
    }
  };

  const isStoryBooked = (date: string) => bookedDays[date]?.story;
  const isPostBooked = (date: string) => bookedDays[date]?.post;

  const handleSubmit = async () => {
    if (!pack) { setError("Sélectionnez un pack."); return; }
    if (!form.eventName || !form.eventDate || !form.instaHandle) { setError("Remplissez les champs obligatoires."); return; }
    if (pack.hasStories > 0 && storyDates.length < pack.hasStories) { setError(`Sélectionnez ${pack.hasStories} date(s) de story.`); return; }
    if (pack.hasPost && !postDate) { setError("Sélectionnez une date de post."); return; }
    setError("");
    setLoading(true);

    const datesPublication = [...storyDates, ...(postDate ? [postDate] : [])];
    const uniqueDates = datesPublication.filter((d, i, arr) => arr.indexOf(d) === i);

    try {
      const res = await fetch("/api/stripe/create-checkout-instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pack: pack.id,
          packName: pack.name,
          eventName: form.eventName,
          eventDate: form.eventDate,
          instaHandle: form.instaHandle,
          ticketLink: form.ticketLink,
          brief: form.brief,
          transferLink: form.transferLink,
          customerEmail: organizer?.email || user?.email || "",
          storyDates,
          postDate: postDate || null,
          datesPublication: uniqueDates,
          amount: amountTTC,
          amountHT,
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

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0a0a0f]">
        <ProHeader />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-400 via-yellow-400 via-green-400 via-blue-500 to-violet-500" />

        <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-16">
          <div className="mb-8">
            <a href="/pro/sponsoring" className="text-white/40 hover:text-white/60 text-sm transition-colors">← Retour au sponsoring</a>
            <h1 className="text-2xl font-bold text-white mt-4 mb-1">Sponsorisation Instagram</h1>
            <p className="text-white/40 text-sm">Publication sur @agenda_lgbt · TVA 20 % incluse</p>
          </div>

          <div className="flex flex-col gap-6">
            {/* Choix du pack */}
            <div className="glass rounded-2xl p-6">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-4">Choisissez un pack</p>
              <div className="flex flex-col gap-3">
                {PACKS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedPack(p.id); setStoryDates([]); setPostDate(""); }}
                    className={`relative w-full text-left rounded-xl p-4 border transition-all ${
                      selectedPack === p.id
                        ? "border-pink-500/50 bg-pink-500/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    {p.popular && (
                      <span className="absolute top-3 right-3 bg-gradient-to-r from-pink-500 to-orange-400 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                        Populaire
                      </span>
                    )}
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{p.icon}</span>
                      <div>
                        <p className="text-white font-semibold text-sm">{p.name}</p>
                        <p className="text-white/40 text-xs">{p.description}</p>
                      </div>
                      <div className="ml-auto text-right shrink-0">
                        <p className="text-white font-bold text-sm">{fmt(p.amountHT)} € HT</p>
                        <p className="text-white/30 text-xs">{fmt(p.amountHT + Math.round(p.amountHT * TVA_RATE))} € TTC</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedPack && (
              <>
                {/* Infos événement */}
                <div className="glass rounded-2xl p-6">
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-4">Votre événement</p>
                  <div className="flex flex-col gap-4">
                    {[
                      { key: "eventName", label: "Nom de l'événement *", placeholder: "Soirée Pride Club" },
                      { key: "instaHandle", label: "Votre compte Instagram *", placeholder: "monclub (sans @)" },
                      { key: "ticketLink", label: "Lien billetterie", placeholder: "https://..." },
                      { key: "transferLink", label: "Lien de transfert / wetransfer", placeholder: "Pour envoyer vos visuels" },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <label className="text-white/60 text-xs uppercase tracking-wider mb-1.5 block">{label}</label>
                        <input
                          type="text"
                          value={form[key as keyof typeof form]}
                          onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-pink-500/50"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="text-white/60 text-xs uppercase tracking-wider mb-1.5 block">Date de l'événement *</label>
                      <input
                        type="date"
                        value={form.eventDate}
                        onChange={(e) => setForm((prev) => ({ ...prev, eventDate: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-pink-500/50"
                        style={{ colorScheme: "dark" }}
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-xs uppercase tracking-wider mb-1.5 block">Brief / Texte souhaité</label>
                      <textarea
                        value={form.brief}
                        onChange={(e) => setForm((prev) => ({ ...prev, brief: e.target.value }))}
                        placeholder="Décrivez votre événement, le message à transmettre..."
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-pink-500/50 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Dates stories */}
                {pack && pack.hasStories > 0 && (
                  <div className="glass rounded-2xl p-6">
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Dates de stories ({storyDates.length}/{pack.hasStories})</p>
                    <p className="text-white/30 text-xs mb-4">Choisissez {pack.hasStories} date(s). Les dates grisées sont déjà réservées.</p>
                    <div className="flex flex-wrap gap-2">
                      {upcomingDates.map((date) => {
                        const booked = isStoryBooked(date);
                        const selected = storyDates.includes(date);
                        const label = new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
                        return (
                          <button
                            key={date}
                            disabled={booked || (!selected && storyDates.length >= pack.hasStories)}
                            onClick={() => toggleStoryDate(date)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              booked ? "bg-white/5 text-white/20 cursor-not-allowed line-through"
                              : selected ? "bg-pink-500 text-white"
                              : storyDates.length >= pack.hasStories ? "bg-white/5 text-white/30 cursor-not-allowed"
                              : "bg-white/10 text-white/60 hover:bg-white/20"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Date post */}
                {pack && pack.hasPost && (
                  <div className="glass rounded-2xl p-6">
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Date de publication du post</p>
                    <p className="text-white/30 text-xs mb-4">Les dates grisées sont déjà réservées.</p>
                    <div className="flex flex-wrap gap-2">
                      {upcomingDates.map((date) => {
                        const booked = isPostBooked(date);
                        const selected = postDate === date;
                        const label = new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
                        return (
                          <button
                            key={date}
                            disabled={!!booked}
                            onClick={() => setPostDate(selected ? "" : date)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              booked ? "bg-white/5 text-white/20 cursor-not-allowed line-through"
                              : selected ? "bg-orange-400 text-white"
                              : "bg-white/10 text-white/60 hover:bg-white/20"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Facturation */}
                <div className="glass rounded-2xl p-6">
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-4">Facturation (optionnel)</p>
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
                          onChange={(e) => setBilling((prev) => ({ ...prev, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-pink-500/50"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Paiement */}
                <div className="glass rounded-2xl p-6 border border-pink-500/20">
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-4">Récapitulatif</p>
                  <div className="flex flex-col gap-2 text-sm mb-6">
                    <div className="flex justify-between"><span className="text-white/60">{pack?.name}</span><span className="text-white">{fmt(amountHT)} € HT</span></div>
                    <div className="flex justify-between"><span className="text-white/60">TVA (20 %)</span><span className="text-white">{fmt(amountTVA)} €</span></div>
                    <div className="flex justify-between border-t border-white/10 pt-2 mt-1"><span className="text-white font-semibold">Total TTC</span><span className="text-white font-bold text-lg">{fmt(amountTTC)} €</span></div>
                  </div>
                  {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
                  >
                    {loading ? "Redirection vers le paiement..." : `Payer ${fmt(amountTTC)} € TTC →`}
                  </button>
                  <p className="text-white/30 text-xs text-center mt-3">Paiement sécurisé par Stripe · Facture PDF incluse</p>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
