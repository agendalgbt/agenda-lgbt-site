"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import AuthGuard from "../../components/AuthGuard";
import ProHeader from "../../components/ProHeader";

const FIREBASE_PROJECT = "agendalgbt-app";
const FIREBASE_API_KEY = "AIzaSyBX793d9b70uGXH3E9m_zUt-zK6B6w61gM";
const TVA = 0.20;

const PACK_PRICES: Record<string, number> = { express: 7900, soldout: 12900 };
const PACK_NAMES: Record<string, string> = { express: "Pack Visibilité Express", soldout: "Pack Sold Out" };
const PACK_LIMITS: Record<string, { stories: number; post: number }> = {
  express: { stories: 2, post: 0 },
  soldout: { stories: 3, post: 1 },
};

const fmt = (cents: number) => (cents / 100).toFixed(2).replace(".", ",");

function buildGrid(days: number, bookedStory: Set<string>, bookedPost: Set<string>, type: "stories" | "post") {
  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const key = d.toISOString().split("T")[0];
    return {
      key,
      date: d,
      booked: type === "stories" ? bookedStory.has(key) : bookedPost.has(key),
      dayName: d.toLocaleDateString("fr-FR", { weekday: "short" }).slice(0, 3),
      dayNum: d.getDate(),
      month: d.toLocaleDateString("fr-FR", { month: "short" }),
      showMonth: i === 0 || d.getDate() === 1,
    };
  });
}

export default function SponsoringInstagramPage() {
  const { organizer, user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [storyDays, setStoryDays] = useState<Set<string>>(new Set());
  const [postDay, setPostDay] = useState<string | null>(null);
  const [bookedStory, setBookedStory] = useState<Set<string>>(new Set());
  const [bookedPost, setBookedPost] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({ eventName: "", eventDate: "", instaHandle: "", customerEmail: "", brief: "", ticketLink: "", transferLink: "" });
  const [billing, setBilling] = useState({ name: "", address: "", zip: "", city: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const email = organizer?.email || user?.email || "";
    setForm(f => ({ ...f, customerEmail: email }));
  }, [organizer, user]);

  useEffect(() => {
    async function loadBooked() {
      try {
        const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/instagram_booked_days?key=${FIREBASE_API_KEY}&pageSize=200`;
        const resp = await fetch(url);
        const data = await resp.json();
        const bs = new Set<string>();
        const bp = new Set<string>();
        (data.documents || []).forEach((doc: any) => {
          const key = doc.name.split("/").pop();
          const fields = doc.fields || {};
          if (fields.story?.booleanValue === true) bs.add(key);
          if (fields.post?.booleanValue === true) bp.add(key);
        });
        setBookedStory(bs);
        setBookedPost(bp);
      } catch (e) { console.warn("Dates réservées non chargées:", e); }
    }
    loadBooked();
  }, []);

  function selectPack(pack: string) {
    setSelectedPack(pack);
    setStoryDays(new Set());
    setPostDay(null);
  }

  function goStep(n: number) {
    setErrorMsg("");
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function validateStep2() {
    if (!form.eventName.trim()) { setErrorMsg("Merci de renseigner le nom de votre événement."); return; }
    if (!form.eventDate) { setErrorMsg("Merci de renseigner la date de votre événement."); return; }
    if (!form.instaHandle.trim()) { setErrorMsg("Merci de renseigner votre compte Instagram."); return; }
    if (!form.customerEmail.trim() || !form.customerEmail.includes("@")) { setErrorMsg("Merci de renseigner un email valide."); return; }
    goStep(3);
  }

  function toggleStory(key: string) {
    if (!selectedPack) return;
    const limits = PACK_LIMITS[selectedPack];
    setStoryDays(prev => {
      const ns = new Set(prev);
      if (ns.has(key)) ns.delete(key);
      else if (ns.size < limits.stories) ns.add(key);
      return ns;
    });
  }

  function togglePost(key: string) {
    setPostDay(prev => prev === key ? null : key);
  }

  function isStep3Valid() {
    if (!selectedPack) return false;
    const limits = PACK_LIMITS[selectedPack];
    const storiesOk = storyDays.size === limits.stories;
    const postOk = limits.post === 0 || postDay !== null;
    return storiesOk && postOk;
  }

  async function proceedToStripe() {
    if (!billing.name || !billing.address || !billing.zip || !billing.city) {
      setErrorMsg("Veuillez remplir tous les champs de facturation.");
      return;
    }
    setLoading(true);
    const allDates = Array.from(storyDays).sort();
    if (postDay) allDates.push(postDay);
    const uniqueDates = allDates.filter((d, i, a) => a.indexOf(d) === i);
    try {
      const resp = await fetch("/api/stripe/create-checkout-instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pack: selectedPack,
          packName: PACK_NAMES[selectedPack!],
          eventName: form.eventName,
          eventDate: form.eventDate,
          instaHandle: form.instaHandle,
          ticketLink: form.ticketLink,
          brief: form.brief,
          customerEmail: form.customerEmail,
          transferLink: form.transferLink,
          storyDates: Array.from(storyDays).sort(),
          postDate: postDay || null,
          datesPublication: uniqueDates,
          amount: Math.round(PACK_PRICES[selectedPack!] * (1 + TVA)),
          amountHT: PACK_PRICES[selectedPack!],
          billingName: billing.name,
          billingAddress: billing.address,
          billingZip: billing.zip,
          billingCity: billing.city,
        }),
      });
      const data = await resp.json();
      if (data.url) window.location.href = data.url;
      else setErrorMsg(data.error || "Une erreur est survenue.");
    } catch { setErrorMsg("Une erreur est survenue. Veuillez réessayer."); }
    finally { setLoading(false); }
  }

  const steps = ["Votre pack", "Votre événement", "Choisir les dates", "Récap & paiement"];
  const today = new Date().toISOString().split("T")[0];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0a0a0f]">
        <ProHeader />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-400 via-yellow-400 via-green-400 via-blue-500 to-violet-500" />

        <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-16">
          <div className="mb-8">
            <a href="/pro/sponsoring" className="text-white/40 hover:text-white/60 text-sm transition-colors">← Retour</a>
            <h1 className="text-2xl font-bold text-white mt-4 mb-1">Sponsorisation Instagram</h1>
            <p className="text-white/40 text-sm">Publication sur @agenda_lgbt · TVA 20% incluse</p>
          </div>

          {/* Steps bar */}
          <div className="flex items-center justify-center gap-0 mb-8">
            {steps.map((label, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium mb-1 border transition-all ${
                    i + 1 < step ? "bg-gradient-to-br from-pink-500 to-amber-400 border-transparent text-black" :
                    i + 1 === step ? "bg-gradient-to-br from-pink-500 to-amber-400 border-transparent text-black" :
                    "border-white/20 text-white/30"
                  }`}>
                    {i + 1 < step ? "✓" : i + 1}
                  </div>
                  <span className={`text-[10px] text-center leading-tight ${i + 1 === step ? "text-white" : "text-white/30"}`}>{label}</span>
                </div>
                {i < steps.length - 1 && <div className="h-px flex-1 bg-white/10 mb-5 mx-0.5" />}
              </div>
            ))}
          </div>

          {/* STEP 1 — Choix du pack */}
          {step === 1 && (
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl text-white font-light mb-1">Choisissez votre pack</h2>
              <p className="text-white/40 text-sm mb-6">Deux formules pour booster vos ventes et remplir votre événement.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Pack Express */}
                <button
                  onClick={() => selectPack("express")}
                  className={`relative text-left p-6 rounded-xl border-2 transition-all ${selectedPack === "express" ? "border-pink-500 bg-pink-500/8" : "border-white/10 bg-white/3 hover:border-white/20"}`}
                >
                  {selectedPack === "express" && <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center text-white text-xs">✓</div>}
                  <div className="text-3xl mb-3">⚡</div>
                  <div className="text-white font-semibold text-base mb-1">Visibilité Express</div>
                  <div className="text-white/40 text-xs mb-4 leading-relaxed">Le boost idéal la semaine J–7 pour activer votre billetterie.</div>
                  <ul className="flex flex-col gap-1.5 mb-4">
                    <li className="text-white/50 text-xs flex gap-2"><span className="text-amber-400">✦</span>2 Stories séquencées (Teasing + Rappel J–1 ou Jour J)</li>
                    <li className="text-white/50 text-xs flex gap-2"><span className="text-amber-400">✦</span>Lien direct vers votre billetterie (Sticker Link)</li>
                    <li className="text-white/50 text-xs flex gap-2"><span className="text-amber-400">✦</span>Mention dans l&apos;Agenda Hebdomadaire (Slide dédiée avec l&apos;affiche de votre événement)</li>
                  </ul>
                  <div className="text-2xl font-semibold text-white">79€ <span className="text-sm font-light text-white/40">HT</span></div>
                </button>

                {/* Pack Sold Out */}
                <button
                  onClick={() => selectPack("soldout")}
                  className={`relative text-left p-6 rounded-xl border-2 transition-all ${selectedPack === "soldout" ? "border-pink-500 bg-pink-500/8" : "border-white/10 bg-white/3 hover:border-white/20"}`}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-amber-400 text-black text-xs font-semibold px-3 py-0.5 rounded-full whitespace-nowrap">⭐ Recommandé</div>
                  {selectedPack === "soldout" && <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center text-white text-xs">✓</div>}
                  <div className="text-3xl mb-3">🔥</div>
                  <div className="text-white font-semibold text-base mb-1">Sold Out</div>
                  <div className="text-white/40 text-xs mb-4 leading-relaxed">La stratégie complète pour ancrer votre événement et saturer les ventes.</div>
                  <ul className="flex flex-col gap-1.5 mb-4">
                    <li className="text-white/50 text-xs flex gap-2"><span className="text-amber-400">✦</span>1 Post Feed permanent — visuel affiche + copywriting persuasif</li>
                    <li className="text-white/50 text-xs flex gap-2"><span className="text-amber-400">✦</span>3 Stories réparties — annonce, rappel mid-week, dernier appel</li>
                    <li className="text-white/50 text-xs flex gap-2"><span className="text-amber-400">✦</span>Mise en avant &quot;Coup de Cœur&quot; dans l&apos;agenda (top position)</li>
                    <li className="text-white/50 text-xs flex gap-2"><span className="text-amber-400">✦</span>Mention dans l&apos;Agenda Hebdomadaire (Slide dédiée avec l&apos;affiche de votre événement)</li>
                    <li className="text-white/50 text-xs flex gap-2"><span className="text-amber-400">✦</span>Lien billetterie permanent en bio pendant 24h le Jour J</li>
                  </ul>
                  <div className="text-2xl font-semibold text-white">129€ <span className="text-sm font-light text-white/40">HT</span></div>
                </button>
              </div>
              <button
                disabled={!selectedPack}
                onClick={() => goStep(2)}
                className="w-full bg-gradient-to-r from-pink-500 to-amber-400 text-black font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-30 text-sm"
              >
                Continuer →
              </button>
            </div>
          )}

          {/* STEP 2 — Infos événement */}
          {step === 2 && (
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl text-white font-light mb-1">Votre événement</h2>
              <p className="text-white/40 text-sm mb-6">Renseignez les informations sur l'événement à promouvoir.</p>
              <div className="flex flex-col gap-4">
                {[
                  { key: "eventName", label: "Nom de l'événement *", placeholder: "Soirée Pride Club", type: "text" },
                  { key: "instaHandle", label: "Votre compte Instagram *", placeholder: "monclub (sans @)", type: "text" },
                  { key: "customerEmail", label: "Email de contact *", placeholder: "contact@monclub.fr", type: "email" },
                  { key: "ticketLink", label: "Lien billetterie", placeholder: "https://...", type: "text" },
                  { key: "transferLink", label: "Lien de transfert (visuels)", placeholder: "WeTransfer, Google Drive...", type: "text" },
                ].map(({ key, label, placeholder, type }) => (
                  <div key={key}>
                    <label className="text-white/50 text-xs uppercase tracking-wider mb-1.5 block">{label}</label>
                    <input
                      type={type}
                      value={form[key as keyof typeof form]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-pink-500/50"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-wider mb-1.5 block">Date de l'événement *</label>
                  <input
                    type="date"
                    value={form.eventDate}
                    min={today}
                    onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-pink-500/50"
                    style={{ colorScheme: "dark" }}
                  />
                </div>
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-wider mb-1.5 block">Description du post</label>
                  <textarea
                    value={form.brief}
                    onChange={e => setForm(f => ({ ...f, brief: e.target.value }))}
                    placeholder="Décrivez votre événement, le message à transmettre..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-pink-500/50 resize-none"
                  />
                </div>
              </div>
              {errorMsg && <p className="text-red-400 text-sm mt-4">{errorMsg}</p>}
              <div className="flex gap-3 mt-6">
                <button onClick={() => goStep(1)} className="border border-white/15 text-white/50 rounded-xl px-5 py-3 text-sm hover:text-white hover:border-white/30 transition-all shrink-0">← Retour</button>
                <button onClick={validateStep2} className="flex-1 bg-gradient-to-r from-pink-500 to-amber-400 text-black font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity text-sm">Continuer →</button>
              </div>
            </div>
          )}

          {/* STEP 3 — Calendrier */}
          {step === 3 && selectedPack && (
            <div className="flex flex-col gap-5">
              <div className="glass rounded-2xl p-5">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
                  {selectedPack === "express" ? "Choisissez 2 dates pour vos Stories (60 prochains jours)." : "Choisissez 3 dates pour vos Stories et 1 date pour votre Post Feed."}
                </p>
                <div className="flex gap-4 text-xs text-white/40 mt-2">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-pink-500/60 inline-block" /> Stories</span>
                  {PACK_LIMITS[selectedPack].post > 0 && <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400/60 inline-block" /> Post Feed</span>}
                </div>
              </div>

              {/* Grille Stories */}
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white text-sm">📱 Stories</span>
                  <span className="bg-pink-500/20 text-pink-400 text-xs px-2 py-0.5 rounded-full">{PACK_LIMITS[selectedPack].stories} date{PACK_LIMITS[selectedPack].stories > 1 ? "s" : ""} à choisir</span>
                </div>
                <p className="text-white/30 text-xs mb-3">
                  {selectedPack === "express" ? "Ex : J–7 pour le teasing, J–1 ou Jour J pour le rappel." : "Ex : annonce ouverture, rappel mid-week, dernier appel."}
                </p>
                <div className="grid grid-cols-7 gap-1">
                  {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => <div key={i} className="text-center text-white/20 text-xs py-0.5">{d}</div>)}
                  {buildGrid(60, bookedStory, bookedPost, "stories").map(({ key, booked, dayName, dayNum, month, showMonth, date }) => {
                    const selected = storyDays.has(key);
                    const full = !selected && storyDays.size >= PACK_LIMITS[selectedPack].stories;
                    const isEventDay = key === form.eventDate;
                    return (
                      <button
                        key={key}
                        disabled={booked || (full && !selected)}
                        onClick={() => toggleStory(key)}
                        className={`relative aspect-square rounded-md flex flex-col items-center justify-center text-[9px] transition-all ${
                          booked ? "opacity-25 cursor-not-allowed line-through" :
                          selected ? "bg-pink-500/30 border border-pink-500 text-pink-300" :
                          full ? "opacity-25 cursor-not-allowed" :
                          isEventDay ? "border border-pink-500/40 text-white" :
                          "border border-white/8 text-white/40 hover:border-pink-400/40 hover:text-white"
                        }`}
                      >
                        {isEventDay && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[6px] text-pink-400">★</span>}
                        <span className="uppercase">{dayName}</span>
                        <span className="text-xs font-medium">{dayNum}</span>
                        {showMonth && <span className="text-[7px] text-amber-400">{month}</span>}
                      </button>
                    );
                  })}
                </div>
                {storyDays.size > 0 && (
                  <p className={`text-xs mt-2 ${storyDays.size === PACK_LIMITS[selectedPack].stories ? "text-green-400" : "text-white/40"}`}>
                    {storyDays.size === PACK_LIMITS[selectedPack].stories ? `✓ ${storyDays.size} dates sélectionnées` : `${storyDays.size}/${PACK_LIMITS[selectedPack].stories} dates`}
                    {storyDays.size > 0 && ` — ${Array.from(storyDays).sort().map(d => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })).join(", ")}`}
                  </p>
                )}
              </div>

              {/* Grille Post (Sold Out uniquement) */}
              {PACK_LIMITS[selectedPack].post > 0 && (
                <div className="glass rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white text-sm">📸 Post Feed</span>
                    <span className="bg-amber-400/20 text-amber-400 text-xs px-2 py-0.5 rounded-full">1 date à choisir</span>
                  </div>
                  <p className="text-white/30 text-xs mb-3">Choisissez la date de publication du post permanent sur le feed.</p>
                  <div className="grid grid-cols-7 gap-1">
                    {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => <div key={i} className="text-center text-white/20 text-xs py-0.5">{d}</div>)}
                    {buildGrid(60, bookedStory, bookedPost, "post").map(({ key, booked, dayName, dayNum, month, showMonth, date }) => {
                      const selected = postDay === key;
                      const full = !selected && postDay !== null;
                      const isEventDay = key === form.eventDate;
                      return (
                        <button
                          key={key}
                          disabled={booked}
                          onClick={() => togglePost(key)}
                          className={`relative aspect-square rounded-md flex flex-col items-center justify-center text-[9px] transition-all ${
                            booked ? "opacity-25 cursor-not-allowed line-through" :
                            selected ? "bg-amber-400/30 border border-amber-400 text-amber-300" :
                            full ? "opacity-25 cursor-not-allowed" :
                            isEventDay ? "border border-amber-400/40 text-white" :
                            "border border-white/8 text-white/40 hover:border-amber-400/40 hover:text-white"
                          }`}
                        >
                          {isEventDay && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[6px] text-amber-400">★</span>}
                          <span className="uppercase">{dayName}</span>
                          <span className="text-xs font-medium">{dayNum}</span>
                          {showMonth && <span className="text-[7px] text-amber-400">{month}</span>}
                        </button>
                      );
                    })}
                  </div>
                  {postDay && (
                    <p className="text-green-400 text-xs mt-2">✓ Post prévu le {new Date(postDay).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</p>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => goStep(2)} className="border border-white/15 text-white/50 rounded-xl px-5 py-3 text-sm hover:text-white hover:border-white/30 transition-all shrink-0">← Retour</button>
                <button
                  disabled={!isStep3Valid()}
                  onClick={() => goStep(4)}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-amber-400 text-black font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-30 text-sm"
                >
                  Continuer →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 — Récap + facturation + paiement */}
          {step === 4 && selectedPack && (
            <div className="flex flex-col gap-5">
              {/* Recap */}
              <div className="glass rounded-2xl p-5">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-4">Récapitulatif</p>
                {[
                  { label: "Pack choisi", value: PACK_NAMES[selectedPack], highlight: true },
                  { label: "Événement", value: form.eventName },
                  { label: "Date de l'événement", value: form.eventDate ? new Date(form.eventDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—" },
                  { label: "Compte Instagram", value: form.instaHandle },
                  ...(form.brief ? [{ label: "Description du post", value: form.brief }] : []),
                  ...(form.transferLink ? [{ label: "🔗 Lien de transfert", value: form.transferLink }] : []),
                  { label: "📱 Dates Stories", value: Array.from(storyDays).sort().map(d => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })).join(", ") || "—" },
                  ...(postDay ? [{ label: "📸 Date Post Feed", value: new Date(postDay).toLocaleDateString("fr-FR", { day: "numeric", month: "long" }) }] : []),
                ].map(({ label, value, highlight }) => (
                  <div key={label} className="flex justify-between py-2 border-b border-white/5 text-sm">
                    <span className="text-white/50">{label}</span>
                    <span className={`text-right max-w-[55%] ${highlight ? "text-pink-400 font-semibold" : "text-white/80"}`}>{value}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 text-sm mt-1">
                  <span className="text-white/50">Total HT</span>
                  <span className="text-white">{fmt(PACK_PRICES[selectedPack])} €</span>
                </div>
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-white/50">TVA 20%</span>
                  <span className="text-white">{fmt(Math.round(PACK_PRICES[selectedPack] * TVA))} €</span>
                </div>
                <div className="flex justify-between py-3 border-t border-white/10 mt-1">
                  <span className="text-white font-semibold">Total TTC</span>
                  <span className="text-amber-300 font-bold text-xl">{fmt(Math.round(PACK_PRICES[selectedPack] * (1 + TVA)))} €</span>
                </div>
              </div>

              {/* Facturation */}
              <div className="glass rounded-2xl p-5">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-4">Informations de facturation *</p>
                <div className="flex flex-col gap-3">
                  {[
                    { key: "name", label: "Nom / Société *", placeholder: "Pride Events SARL" },
                    { key: "address", label: "Adresse *", placeholder: "12 rue de la Fierté" },
                    { key: "zip", label: "Code postal *", placeholder: "75001" },
                    { key: "city", label: "Ville *", placeholder: "Paris" },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="text-white/50 text-xs uppercase tracking-wider mb-1.5 block">{label}</label>
                      <input
                        type="text"
                        value={billing[key as keyof typeof billing]}
                        onChange={e => setBilling(b => ({ ...b, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-pink-500/50"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}

              <div className="flex gap-3">
                <button onClick={() => goStep(3)} className="border border-white/15 text-white/50 rounded-xl px-5 py-3 text-sm hover:text-white hover:border-white/30 transition-all shrink-0">← Retour</button>
                <button
                  onClick={proceedToStripe}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-amber-400 text-black font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
                >
                  {loading ? "⏳ Redirection…" : `💳 Payer ${fmt(Math.round(PACK_PRICES[selectedPack] * (1 + TVA)))} € TTC`}
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
