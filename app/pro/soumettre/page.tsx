"use client";

import { useState, useRef } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "../context/AuthContext";
import AuthGuard from "../components/AuthGuard";
import ProHeader from "../components/ProHeader";
import { useRouter } from "next/navigation";

type Platform = "clubbing" | "other" | null;

type InstaStatus =
  | { ok: true; message: string }
  | { ok: false; warning: string }
  | null;

function getInstaPublicationStatus(eventDateStr: string): InstaStatus {
  if (!eventDateStr) return null;

  const eventDate = new Date(eventDateStr);
  const now = new Date();
  const todayMidnight = new Date(now);
  todayMidnight.setHours(0, 0, 0, 0);

  // Trouver le mardi de la semaine de l'événement (mardi <= date event)
  const eventDay = eventDate.getDay(); // 0=dim, 1=lun, 2=mar...
  const daysSinceTuesday = (eventDay - 2 + 7) % 7;
  const targetTuesday = new Date(eventDate);
  targetTuesday.setDate(eventDate.getDate() - daysSinceTuesday);
  targetTuesday.setHours(0, 0, 0, 0);

  const isTargetToday = targetTuesday.getTime() === todayMidnight.getTime();
  const isTargetFuture = targetTuesday > todayMidnight;
  const currentHour = now.getHours();

  const formattedTarget = targetTuesday.toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long",
  });

  if (isTargetFuture) {
    return {
      ok: true,
      message: `📸 Si validé, votre événement sera publié sur Instagram le ${formattedTarget}.`,
    };
  } else if (isTargetToday && currentHour < 10) {
    return {
      ok: true,
      message: `📸 Si validé, votre événement sera publié sur Instagram ce soir à 18h.`,
    };
  } else {
    return {
      ok: false,
      warning: `⚠️ Il est trop tard pour publier cet événement sur Instagram, mais il sera bien visible sur l'application.`,
    };
  }
}

const otherCategories = [
  "Bar", "Restaurant", "Drag", "Cruising", "Sauna", "Culture/Spectacle",
];

// Catégories "lieu" : formulaire simplifié sans dates
const isVenueCategory = (cat: string) =>
  ["Bar", "Restaurant", "Cruising", "Sauna"].includes(cat);

export default function SoumettreEvenementPage() {
  const { user, organizer } = useAuth();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [platform, setPlatform] = useState<Platform>(null);
  const [selectedOtherCategory, setSelectedOtherCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    titre: "",
    description: "",
    date_debut: "",
    date_fin: "",
    heure_debut: "",
    heure_fin: "",
    lieu_nom: "",
    adresse: "",
    code_postal: "",
    ville: organizer?.ville || "",
    pays: "France",
    lien_billetterie: "",
    instagram: organizer?.instagram || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !organizer) return;
    setLoading(true);
    setError("");

    try {
      let image_url = "";
      if (imageFile) {
        const storageRef = ref(storage, `submissions/${user.uid}/${Date.now()}_${imageFile.name}`);
        const snap = await uploadBytes(storageRef, imageFile);
        image_url = await getDownloadURL(snap.ref);
      }

      const categorie = platform === "clubbing" ? "Clubbing" : selectedOtherCategory;
      const publish_instagram = platform === "clubbing";
      const isVenue = platform === "other" && isVenueCategory(selectedOtherCategory);

      // Pour les catégories "lieu", le titre = nom du lieu
      const submitData = {
        ...form,
        // Pour lieu : on copie le titre dans lieu_nom si lieu_nom est vide
        lieu_nom: isVenue ? form.titre : form.lieu_nom,
        categorie,
        publish_instagram,
        image_url,
        organizer_id: user.uid,
        nom_organisation: organizer.nom_organisation,
        contact_nom: organizer.contact_nom,
        contact_email: user.email,
        statut: "en_attente",
        created_at: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "submissions"), submitData);

      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "submission",
          to: user.email,
          nom_organisation: organizer.nom_organisation,
          contact_nom: organizer.contact_nom,
          titre: isVenue ? form.titre : form.titre,
          submission_id: docRef.id,
        }),
      });

      router.push("/pro/dashboard");
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors text-sm";

  // Étape 1 — choix de la catégorie principale
  if (!platform) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-[#0a0a0f]">
          <ProHeader />
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-400 via-yellow-400 via-green-400 via-blue-500 to-violet-500" />

          <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-16">
            <div className="mb-10">
              <h1 className="text-2xl font-bold text-white mb-2">Soumettre un événement</h1>
              <p className="text-white/40 text-sm">Quelle est la catégorie de votre événement ?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Clubbing */}
              <button
                onClick={() => setPlatform("clubbing")}
                className="glass rounded-2xl p-6 text-left hover:border-violet-500/40 border border-white/10 transition-all group"
              >
                <div className="text-4xl mb-4">🎉</div>
                <h2 className="text-white font-bold text-lg mb-2">Clubbing</h2>
                <p className="text-white/40 text-sm leading-relaxed mb-4">
                  Soirée, nuit, événement en club.
                </p>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <span className="text-green-400">✓</span> Publié sur l'application
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <span className="text-pink-400">✓</span> Publié sur <span className="text-white">@agenda_lgbt</span>
                  </div>
                </div>
              </button>

              {/* Autre catégorie */}
              <button
                onClick={() => setPlatform("other")}
                className="glass rounded-2xl p-6 text-left hover:border-violet-500/40 border border-white/10 transition-all group"
              >
                <div className="text-4xl mb-4">🏳️‍🌈</div>
                <h2 className="text-white font-bold text-lg mb-2">Autre catégorie</h2>
                <p className="text-white/40 text-sm leading-relaxed mb-4">
                  Bar, restaurant, drag, cruising, sauna, culture…
                </p>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <span className="text-green-400">✓</span> Publié sur l'application
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/30">
                    <span className="text-white/20">✗</span> Non publié sur Instagram
                  </div>
                </div>
              </button>
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  // Étape 1b — choix sous-catégorie si "other"
  if (platform === "other" && !selectedOtherCategory) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-[#0a0a0f]">
          <ProHeader />
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-400 via-yellow-400 via-green-400 via-blue-500 to-violet-500" />

          <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-16">
            <div className="mb-8">
              <button
                onClick={() => setPlatform(null)}
                className="text-white/40 hover:text-white text-sm transition-colors mb-6 flex items-center gap-1"
              >
                ← Retour
              </button>
              <h1 className="text-2xl font-bold text-white mb-2">Choisissez une catégorie</h1>
              <p className="text-white/40 text-sm">Votre événement sera publié uniquement sur l'application.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {otherCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedOtherCategory(cat)}
                  className="glass rounded-2xl p-5 text-center hover:border-violet-500/40 border border-white/10 transition-all"
                >
                  <p className="text-white font-medium">{cat}</p>
                </button>
              ))}
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  // Étape 2 — formulaire
  const categorie = platform === "clubbing" ? "Clubbing" : selectedOtherCategory;
  const isVenue = platform === "other" && isVenueCategory(selectedOtherCategory);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0a0a0f]">
        <ProHeader />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-400 via-yellow-400 via-green-400 via-blue-500 to-violet-500" />

        <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-16">
          <div className="mb-8">
            <button
              onClick={() => platform === "other" ? setSelectedOtherCategory("") : setPlatform(null)}
              className="text-white/40 hover:text-white text-sm transition-colors mb-4 flex items-center gap-1"
            >
              ← Retour
            </button>
            <h1 className="text-2xl font-bold text-white mb-1">Soumettre un événement</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400">
                {categorie}
              </span>
              {platform === "clubbing" && (
                <span className="text-xs px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400">
                  + Instagram @agenda_lgbt
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Infos principales */}
            <div className="glass rounded-2xl p-6 flex flex-col gap-4">
              <h2 className="text-white/60 text-xs uppercase tracking-wider">Informations générales</h2>

              <div>
                <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Catégorie</label>
                <input
                  type="text"
                  value={categorie}
                  disabled
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white/40 text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">
                  {isVenue ? "Nom du lieu *" : "Titre de l'événement *"}
                </label>
                <input
                  type="text"
                  name="titre"
                  required
                  value={form.titre}
                  onChange={handleChange}
                  placeholder={isVenue ? "Ex: Le Marais Bar, Le Dépôt..." : "Ex: Soirée Bears, Pride de Lyon..."}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Description *</label>
                <textarea
                  name="description"
                  required
                  value={form.description}
                  onChange={handleChange}
                  placeholder={isVenue ? "Décrivez le lieu..." : "Décrivez votre événement..."}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors text-sm resize-none"
                />
              </div>
            </div>

            {/* Date & heure — uniquement pour événements (pas pour lieu) */}
            {!isVenue && (
              <div className="glass rounded-2xl p-6 flex flex-col gap-4">
                <h2 className="text-white/60 text-xs uppercase tracking-wider">Date & heure</h2>

                {/* Message Instagram dynamique — clubbing uniquement */}
                {platform === "clubbing" && form.date_debut && (() => {
                  const status = getInstaPublicationStatus(form.date_debut);
                  if (!status) return null;
                  return status.ok ? (
                    <div className="flex items-start gap-3 bg-pink-500/10 border border-pink-500/20 rounded-xl px-4 py-3">
                      <span className="text-pink-400 text-sm leading-relaxed">{status.message}</span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                      <span className="text-amber-400 text-sm leading-relaxed">{status.warning}</span>
                    </div>
                  );
                })()}

                {/* Début */}
                <div>
                  <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Début *</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      name="date_debut"
                      required
                      value={form.date_debut}
                      onChange={handleChange}
                      style={{ colorScheme: "dark" }}
                      className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-violet-500/50 transition-colors text-sm"
                    />
                    <input
                      type="time"
                      name="heure_debut"
                      value={form.heure_debut}
                      onChange={handleChange}
                      style={{ colorScheme: "dark" }}
                      className="w-28 shrink-0 bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-violet-500/50 transition-colors text-sm"
                    />
                  </div>
                </div>

                {/* Fin */}
                <div>
                  <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Fin <span className="normal-case text-white/30">(optionnel)</span></label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      name="date_fin"
                      value={form.date_fin}
                      onChange={handleChange}
                      style={{ colorScheme: "dark" }}
                      className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-violet-500/50 transition-colors text-sm"
                    />
                    <input
                      type="time"
                      name="heure_fin"
                      value={form.heure_fin}
                      onChange={handleChange}
                      style={{ colorScheme: "dark" }}
                      className="w-28 shrink-0 bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-violet-500/50 transition-colors text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Lieu */}
            <div className="glass rounded-2xl p-6 flex flex-col gap-4">
              <h2 className="text-white/60 text-xs uppercase tracking-wider">Lieu</h2>

              {/* Nom du lieu uniquement pour les événements (pas pour "lieu" car déjà en titre) */}
              {!isVenue && (
                <div>
                  <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Nom du lieu *</label>
                  <input type="text" name="lieu_nom" required value={form.lieu_nom} onChange={handleChange} placeholder="Ex: Le Marais Club, Parc de la Tête d'Or..." className={inputClass} />
                </div>
              )}

              <div>
                <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Adresse</label>
                <input type="text" name="adresse" value={form.adresse} onChange={handleChange} placeholder="12 rue des Lilas" className={inputClass} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Code postal</label>
                  <input type="text" name="code_postal" value={form.code_postal} onChange={handleChange} placeholder="75003" className={inputClass} />
                </div>
                <div>
                  <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Ville *</label>
                  <input type="text" name="ville" required value={form.ville} onChange={handleChange} placeholder="Paris" className={inputClass} />
                </div>
                <div>
                  <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Pays *</label>
                  <select name="pays" required value={form.pays} onChange={handleChange} className={inputClass}>
                    <option value="France">France</option>
                    <option value="Belgique">Belgique</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Liens — lien billetterie uniquement pour événements */}
            <div className="glass rounded-2xl p-6 flex flex-col gap-4">
              <h2 className="text-white/60 text-xs uppercase tracking-wider">Liens</h2>

              {!isVenue && (
                <div>
                  <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Lien billetterie</label>
                  <input type="url" name="lien_billetterie" value={form.lien_billetterie} onChange={handleChange} placeholder="https://..." className={inputClass} />
                </div>
              )}

              <div>
                <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Instagram</label>
                <input type="text" name="instagram" value={form.instagram} onChange={handleChange} placeholder="@votre_compte" className={inputClass} />
              </div>
            </div>

            {/* Image */}
            <div className="glass rounded-2xl p-6 flex flex-col gap-4">
              <h2 className="text-white/60 text-xs uppercase tracking-wider">
                {isVenue ? "Photo" : "Affiche / image"}
              </h2>

              <input type="file" accept="image/*" ref={fileRef} onChange={handleImage} className="hidden" />

              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Aperçu" className="w-full rounded-xl object-cover max-h-64" />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute top-2 right-2 bg-black/60 text-white/80 text-xs px-3 py-1 rounded-lg hover:bg-black/80 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="border border-dashed border-white/20 rounded-xl p-8 text-center hover:border-white/40 transition-colors"
                >
                  <div className="text-3xl mb-2">{isVenue ? "📷" : "🖼️"}</div>
                  <p className="text-white/40 text-sm">
                    {isVenue ? "Cliquez pour ajouter une photo" : "Cliquez pour ajouter une image"}
                  </p>
                  <p className="text-white/20 text-xs mt-1">JPG, PNG · Max 5 Mo</p>
                </button>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-500 to-blue-500 text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
            >
              {loading ? "Envoi en cours..." : "Soumettre →"}
            </button>
          </form>
        </main>
      </div>
    </AuthGuard>
  );
}
