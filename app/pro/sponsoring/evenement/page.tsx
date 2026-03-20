"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import AuthGuard from "../../components/AuthGuard";
import ProHeader from "../../components/ProHeader";

const FIREBASE_PROJECT = "agendalgbt-app";
const FIREBASE_API_KEY = "AIzaSyBX793d9b70uGXH3E9m_zUt-zK6B6w61gM";
const TARIF_PAR_USER = 0.012;
const TVA = 0.20;
const WEEKEND_MULTIPLIER = 1.30;
const TARIF_MINIMUM = 3.00;

type Event = {
  id: string;
  name: string;
  address: string;
  category: string;
  cover: string;
  dateStart: Date | null;
  lat: number | null;
  lng: number | null;
};

function isWeekend(dateStr: string) {
  const d = new Date(dateStr);
  return d.getDay() === 5 || d.getDay() === 6;
}

function getPricePerDay(audience: number, weekend: boolean) {
  const base = Math.max(audience * TARIF_PAR_USER, TARIF_MINIMUM);
  return Math.round(base * (weekend ? WEEKEND_MULTIPLIER : 1) * 100) / 100;
}

function calcTotal(selectedDays: Set<string>, audienceCount: number) {
  const priceNormal = getPricePerDay(audienceCount, false);
  const priceWeekend = getPricePerDay(audienceCount, true);
  let total = 0;
  const normalDays: string[] = [];
  const weekendDays: string[] = [];
  Array.from(selectedDays).forEach((d) => {
    if (isWeekend(d)) { weekendDays.push(d); total += priceWeekend; }
    else { normalDays.push(d); total += priceNormal; }
  });
  return { total: Math.round(total * 100) / 100, priceNormal, priceWeekend, normalDays, weekendDays };
}

export default function SponsoringEvenementPage() {
  const { organizer, user } = useAuth();
  const [step, setStep] = useState(1);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const [audienceCount, setAudienceCount] = useState(0);
  const [audienceLoading, setAudienceLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [billing, setBilling] = useState({ name: "", address: "", zip: "", city: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Prefill email
  useEffect(() => {
    const email = organizer?.email || user?.email || "";
    setBilling(b => ({ ...b, email }));
  }, [organizer, user]);

  // Load events from Firestore
  useEffect(() => {
    async function loadEvents() {
      try {
        const events: Event[] = [];
        const now = new Date();
        let pageToken = "";
        do {
          const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/activities?key=${FIREBASE_API_KEY}&pageSize=300${pageToken ? "&pageToken=" + pageToken : ""}`;
          const resp = await fetch(url);
          const data = await resp.json();
          if (!data.documents) break;
          for (const doc of data.documents) {
            const fields = doc.fields || {};
            if (fields.type?.stringValue !== "event") continue;
            const dateStart = fields.date_start?.timestampValue ? new Date(fields.date_start.timestampValue) : null;
            if (dateStart && dateStart < now) continue;
            events.push({
              id: doc.name.split("/").pop()!,
              name: fields.name?.stringValue || "—",
              address: fields.address?.stringValue || "",
              category: fields.category?.stringValue || "",
              cover: fields.cover_image?.stringValue || "",
              dateStart,
              lat: fields.location?.geoPointValue?.latitude || null,
              lng: fields.location?.geoPointValue?.longitude || null,
            });
          }
          pageToken = data.nextPageToken || "";
        } while (pageToken);
        events.sort((a, b) => (a.dateStart?.getTime() || 0) - (b.dateStart?.getTime() || 0));
        setAllEvents(events);
      } catch (e) {
        console.error("Erreur chargement événements:", e);
      } finally {
        setEventsLoading(false);
      }
    }
    loadEvents();
  }, []);

  const filteredEvents = search.trim()
    ? allEvents.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.address.toLowerCase().includes(search.toLowerCase()) ||
        e.category.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 6)
    : [];

  async function loadAudience(lat: number | null, lng: number | null) {
    if (!lat || !lng) return;
    setAudienceLoading(true);
    try {
      const resp = await fetch(`/api/stripe/audience?lat=${lat}&lng=${lng}`);
      const data = await resp.json();
      setAudienceCount(data.count || 0);
    } catch { setAudienceCount(0); }
    finally { setAudienceLoading(false); }
  }

  function goStep(n: number) {
    if (n === 2) {
      setSelectedDays(new Set());
      loadAudience(selectedEvent?.lat ?? null, selectedEvent?.lng ?? null);
    }
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleDay(key: string) {
    const eventDateKey = selectedEvent?.dateStart?.toISOString().split("T")[0] ?? null;
    setErrorMsg("");

    if (eventDateKey && key > eventDateKey) {
      setErrorMsg("⚠️ Vous ne pouvez pas sélectionner un jour après votre événement.");
      return;
    }

    if (!eventDateKey) {
      const ns = new Set<string>();
      ns.add(key);
      setSelectedDays(ns);
      return;
    }

    // Auto-select range from clicked day to event day
    const ns = new Set<string>();
    const d = new Date(key);
    const end = new Date(eventDateKey);
    while (d <= end) {
      ns.add(d.toISOString().split("T")[0]);
      d.setDate(d.getDate() + 1);
    }

    if (ns.size < 3) {
      setErrorMsg("⚠️ Sélectionnez un jour de début au moins 3 jours avant votre événement.");
      return;
    }
    setSelectedDays(ns);
  }

  const { total, priceNormal, priceWeekend, normalDays, weekendDays } = calcTotal(selectedDays, audienceCount);
  const tva = Math.round(total * TVA * 100) / 100;
  const ttc = Math.round((total + tva) * 100) / 100;
  const fmt = (n: number) => n.toFixed(2).replace(".", ",");

  // Build 30-day grid
  const today = new Date();
  const days30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
  const eventDateKey = selectedEvent?.dateStart?.toISOString().split("T")[0] ?? null;

  async function proceedToStripe() {
    if (!billing.name || !billing.address || !billing.zip || !billing.city) {
      setErrorMsg("Veuillez remplir tous les champs de facturation.");
      return;
    }
    setLoading(true);
    try {
      const sortedDays = Array.from(selectedDays).sort();
      const resp = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEvent!.id,
          eventName: selectedEvent!.name,
          days: sortedDays,
          amountHT: Math.round(total * 100),
          amount: Math.round(ttc * 100),
          billingName: billing.name,
          billingAddress: billing.address,
          billingZip: billing.zip,
          billingCity: billing.city,
          orgaEmail: billing.email,
        }),
      });
      const data = await resp.json();
      if (data.url) window.location.href = data.url;
      else setErrorMsg(data.error || "Une erreur est survenue.");
    } catch { setErrorMsg("Une erreur est survenue. Veuillez réessayer."); }
    finally { setLoading(false); }
  }

  const steps = ["Votre événement", "Choisir les jours", "Récap & paiement"];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0a0a0f]">
        <ProHeader />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-400 via-yellow-400 via-green-400 via-blue-500 to-violet-500" />

        <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-16">
          <div className="mb-8">
            <a href="/pro/sponsoring" className="text-white/40 hover:text-white/60 text-sm transition-colors">← Retour</a>
            <h1 className="text-2xl font-bold text-white mt-4 mb-1">Sponsoriser mon événement</h1>
            <p className="text-white/40 text-sm">Touchez une audience ciblée et engagée dans la zone géographique de votre événement.</p>
          </div>

          {/* Steps bar */}
          <div className="flex items-center justify-center gap-0 mb-8 max-w-lg mx-auto">
            {steps.map((label, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium mb-1 border transition-all ${
                    i + 1 < step ? "bg-gradient-to-br from-pink-500 to-amber-400 border-transparent text-black" :
                    i + 1 === step ? "bg-gradient-to-br from-pink-500 to-amber-400 border-transparent text-black" :
                    "border-white/20 text-white/30"
                  }`}>
                    {i + 1 < step ? "✓" : i + 1}
                  </div>
                  <span className={`text-xs text-center ${i + 1 === step ? "text-white" : "text-white/30"}`}>{label}</span>
                </div>
                {i < steps.length - 1 && <div className="h-px flex-1 bg-white/10 mb-5 mx-1" />}
              </div>
            ))}
          </div>

          {/* STEP 1 — Recherche événement */}
          {step === 1 && (
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl text-white font-light mb-1">Votre événement</h2>
              <p className="text-white/40 text-sm mb-6">Recherchez votre événement publié sur l'application.</p>
              <div className="relative mb-3">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">🔍</span>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Tapez le nom de votre événement..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-amber-400/50"
                />
              </div>
              <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
                {eventsLoading ? (
                  <div className="flex items-center gap-2 text-white/40 text-sm py-4"><div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" /> Chargement des événements...</div>
                ) : search.trim() === "" ? (
                  <div className="text-center py-8 text-white/30 text-sm">Tapez le nom de votre événement pour le retrouver.</div>
                ) : filteredEvents.length === 0 ? (
                  <div className="text-center py-8 text-white/30 text-sm">Aucun événement trouvé. Vérifiez que votre événement est publié sur l'application.</div>
                ) : filteredEvents.map(e => (
                  <button
                    key={e.id}
                    onClick={() => setSelectedEvent(e)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      selectedEvent?.id === e.id
                        ? "border-amber-400/60 bg-amber-400/8"
                        : "border-white/8 bg-white/5 hover:border-amber-400/30"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center shrink-0 text-xl">
                      {e.cover ? <img src={e.cover} alt="" className="w-full h-full object-cover" /> : "🎪"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{e.name}</p>
                      <p className="text-white/40 text-xs flex gap-3 mt-0.5">
                        <span>🏷️ {e.category}</span>
                        <span>📍 {e.address.split(",").slice(-1)[0]?.trim() || e.address}</span>
                        {e.dateStart && <span>📅 {e.dateStart.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>}
                      </p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-xs transition-all ${
                      selectedEvent?.id === e.id ? "bg-amber-400 border-amber-400 text-black" : "border-white/20"
                    }`}>
                      {selectedEvent?.id === e.id && "✓"}
                    </div>
                  </button>
                ))}
              </div>
              <button
                disabled={!selectedEvent}
                onClick={() => goStep(2)}
                className="mt-6 w-full bg-gradient-to-r from-pink-500 to-amber-400 text-black font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-30 text-sm"
              >
                Continuer →
              </button>
            </div>
          )}

          {/* STEP 2 — Calendrier + audience */}
          {step === 2 && selectedEvent && (
            <div className="flex flex-col gap-5">
              {/* Recap événement */}
              <div className="glass rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center shrink-0 text-lg">
                  {selectedEvent.cover ? <img src={selectedEvent.cover} alt="" className="w-full h-full object-cover" /> : "🎪"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{selectedEvent.name}</p>
                  <p className="text-white/40 text-xs truncate">{selectedEvent.address}</p>
                </div>
                <button onClick={() => goStep(1)} className="text-white/40 hover:text-white text-xs border border-white/15 rounded-lg px-3 py-1.5">Changer</button>
              </div>

              {/* Audience */}
              <div className="glass rounded-2xl p-5 flex items-center gap-4 border border-amber-400/20">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-amber-400/20 flex items-center justify-center text-2xl shrink-0">👥</div>
                <div>
                  <div className="text-3xl font-bold text-amber-300">
                    {audienceLoading ? "…" : audienceCount.toLocaleString("fr-FR")}
                  </div>
                  <div className="text-white/40 text-xs">utilisateurs potentiellement touchés (rayon 30 km)</div>
                </div>
              </div>

              {/* Tarifs */}
              {audienceCount > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/50">Tarif normal : <strong className="text-white">{getPricePerDay(audienceCount, false).toFixed(2)}€/j</strong></span>
                  <span className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/50">Vendredi & Samedi : <strong className="text-white">{getPricePerDay(audienceCount, true).toFixed(2)}€/j</strong></span>
                  <span className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/50">Audience : <strong className="text-white">{audienceCount} utilisateurs</strong></span>
                </div>
              )}

              {/* Calendrier 30 jours */}
              <div className="glass rounded-2xl p-5">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Choisissez vos jours</p>
                <p className="text-white/30 text-xs mb-4">Cliquez sur un jour pour sélectionner automatiquement jusqu'au jour de votre événement ★. Minimum 3 jours.</p>
                <div className="grid grid-cols-7 gap-1.5">
                  {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(d => (
                    <div key={d} className="text-center text-white/20 text-xs py-1">{d}</div>
                  ))}
                  {/* empty offset for first week */}
                  {Array((() => { const day = today.getDay(); return day === 0 ? 6 : day - 1; })()).fill(null).map((_, i) => <div key={`e${i}`} />)}
                  {days30.map((d) => {
                    const key = d.toISOString().split("T")[0];
                    const weekend = isWeekend(key);
                    const selected = selectedDays.has(key);
                    const isEventDay = key === eventDateKey;
                    const isAfter = eventDateKey ? key > eventDateKey : false;
                    const dayName = d.toLocaleDateString("fr-FR", { weekday: "short" }).slice(0, 3);
                    const showMonth = d.getDate() === 1 || d.getTime() === today.getTime();
                    return (
                      <button
                        key={key}
                        disabled={isAfter}
                        onClick={() => toggleDay(key)}
                        title={d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }) + (isEventDay ? " — Jour de votre événement" : "")}
                        className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-center transition-all text-xs ${
                          isAfter ? "opacity-20 cursor-not-allowed" :
                          selected && isEventDay ? "bg-amber-400/25 border border-amber-400 text-amber-300" :
                          selected ? "bg-amber-400/15 border border-amber-400/70 text-amber-300" :
                          isEventDay ? "border border-pink-500/40 text-white" :
                          "border border-white/8 bg-white/3 text-white/50 hover:border-amber-400/40 hover:text-white"
                        }`}
                      >
                        {weekend && !selected && (
                          <span className="absolute top-0.5 left-1/2 -translate-x-1/2 bg-pink-500 text-white text-[6px] px-1 rounded-full leading-tight">+30%</span>
                        )}
                        {isEventDay && (
                          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 bg-pink-500 text-white text-[6px] px-1 rounded-full leading-tight">★</span>
                        )}
                        <span className={`text-[9px] uppercase tracking-wider ${weekend && !selected ? "mt-2" : ""}`}>{dayName}</span>
                        <span className="text-sm font-medium">{d.getDate()}</span>
                        {showMonth && <span className="text-[8px] text-amber-400 uppercase">{d.toLocaleDateString("fr-FR", { month: "short" })}</span>}
                      </button>
                    );
                  })}
                </div>
                {errorMsg && <p className="text-red-400 text-xs mt-3">{errorMsg}</p>}
                {selectedDays.size >= 3 && !errorMsg && (
                  <p className="text-green-400 text-xs mt-3">✅ {selectedDays.size} jour{selectedDays.size > 1 ? "s" : ""} sélectionné{selectedDays.size > 1 ? "s" : ""}</p>
                )}
                {selectedDays.size > 0 && selectedDays.size < 3 && (
                  <p className="text-white/40 text-xs mt-3">Minimum 3 jours requis ({selectedDays.size}/3).</p>
                )}
              </div>

              {/* Pricing live */}
              {selectedDays.size >= 3 && (
                <div className="glass rounded-2xl overflow-hidden">
                  {normalDays.length > 0 && (
                    <div className="flex justify-between px-5 py-3 text-sm border-b border-white/5">
                      <span className="text-white/50">{normalDays.length} jour{normalDays.length > 1 ? "s" : ""} (lun–jeu)</span>
                      <span className="text-white">{(normalDays.length * priceNormal).toFixed(2)} €</span>
                    </div>
                  )}
                  {weekendDays.length > 0 && (
                    <div className="flex justify-between px-5 py-3 text-sm border-b border-white/5">
                      <span className="text-white/50">{weekendDays.length} vendredi/samedi</span>
                      <span className="text-white">{(weekendDays.length * priceWeekend).toFixed(2)} €</span>
                    </div>
                  )}
                  <div className="flex justify-between px-5 py-3 text-sm border-b border-white/5">
                    <span className="text-white/50">Total HT</span>
                    <span className="text-white">{fmt(total)} €</span>
                  </div>
                  <div className="flex justify-between px-5 py-3 text-sm border-b border-white/5">
                    <span className="text-white/50">TVA 20%</span>
                    <span className="text-white">{fmt(tva)} €</span>
                  </div>
                  <div className="flex justify-between px-5 py-4 bg-amber-400/5">
                    <span className="text-white font-semibold">Total TTC</span>
                    <span className="text-amber-300 font-bold text-xl">{fmt(ttc)} €</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => goStep(1)} className="border border-white/15 text-white/50 rounded-xl px-5 py-3 text-sm hover:text-white hover:border-white/30 transition-all shrink-0">← Retour</button>
                <button
                  disabled={selectedDays.size < 3}
                  onClick={() => goStep(3)}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-amber-400 text-black font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-30 text-sm"
                >
                  Continuer →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — Récap + facturation + paiement */}
          {step === 3 && selectedEvent && (
            <div className="flex flex-col gap-5">
              {/* Recap */}
              <div className="glass rounded-2xl p-5">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-4">Récapitulatif</p>
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center shrink-0 text-lg">
                    {selectedEvent.cover ? <img src={selectedEvent.cover} alt="" className="w-full h-full object-cover" /> : "🎪"}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{selectedEvent.name}</p>
                    <p className="text-white/40 text-xs">{Array.from(selectedDays).sort().length} jours · du {new Date(Array.from(selectedDays).sort()[0]).toLocaleDateString("fr-FR")} au {new Date(Array.from(selectedDays).sort().slice(-1)[0]).toLocaleDateString("fr-FR")}</p>
                  </div>
                </div>
                {normalDays.length > 0 && (
                  <div className="flex justify-between text-sm py-1.5">
                    <span className="text-white/50">{normalDays.length} jour{normalDays.length > 1 ? "s" : ""} (tarif normal · {priceNormal.toFixed(2)}€/j)</span>
                    <span className="text-white">{(normalDays.length * priceNormal).toFixed(2)} €</span>
                  </div>
                )}
                {weekendDays.length > 0 && (
                  <div className="flex justify-between text-sm py-1.5">
                    <span className="text-white/50">{weekendDays.length} vendredi/samedi ({priceWeekend.toFixed(2)}€/j)</span>
                    <span className="text-white">{(weekendDays.length * priceWeekend).toFixed(2)} €</span>
                  </div>
                )}
                <div className="flex justify-between text-sm py-1.5 border-t border-white/5 mt-1">
                  <span className="text-white/50">Total HT</span>
                  <span className="text-white">{fmt(total)} €</span>
                </div>
                <div className="flex justify-between text-sm py-1.5">
                  <span className="text-white/50">TVA 20%</span>
                  <span className="text-white">{fmt(tva)} €</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-t border-white/10 mt-1">
                  <span className="text-white font-semibold">Total TTC</span>
                  <span className="text-amber-300 font-bold text-lg">{fmt(ttc)} €</span>
                </div>
              </div>

              {/* Facturation (obligatoire) */}
              <div className="glass rounded-2xl p-5">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-4">Informations de facturation *</p>
                <div className="flex flex-col gap-3">
                  {[
                    { key: "name", label: "Nom / Société *", placeholder: "Pride Events SARL" },
                    { key: "address", label: "Adresse *", placeholder: "12 rue de la Fierté" },
                    { key: "zip", label: "Code postal *", placeholder: "75001" },
                    { key: "city", label: "Ville *", placeholder: "Paris" },
                    { key: "email", label: "Email *", placeholder: "contact@monclub.fr" },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="text-white/50 text-xs uppercase tracking-wider mb-1.5 block">{label}</label>
                      <input
                        type={key === "email" ? "email" : "text"}
                        value={billing[key as keyof typeof billing]}
                        onChange={e => setBilling(b => ({ ...b, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-amber-400/50"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}

              <div className="flex gap-3">
                <button onClick={() => goStep(2)} className="border border-white/15 text-white/50 rounded-xl px-5 py-3 text-sm hover:text-white hover:border-white/30 transition-all shrink-0">← Retour</button>
                <button
                  onClick={proceedToStripe}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-amber-400 text-black font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
                >
                  {loading ? "⏳ Redirection…" : `💳 Payer ${fmt(ttc)} € TTC`}
                </button>
              </div>
              <p className="text-white/20 text-xs text-center">🔒 Paiement sécurisé par Stripe · Vos données bancaires ne transitent jamais par nos serveurs</p>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
