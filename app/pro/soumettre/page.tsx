"use client";

import { useState, useRef } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "../context/AuthContext";
import AuthGuard from "../components/AuthGuard";
import ProHeader from "../components/ProHeader";
import { useRouter } from "next/navigation";

const categories = [
  "Soirée", "Concert", "Festival", "Marche / Pride", "Atelier",
  "Conférence", "Sport", "Culture", "Expo", "Autre",
];

export default function SoumettreEvenementPage() {
  const { user, organizer } = useAuth();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    titre: "",
    description: "",
    categorie: "",
    date_debut: "",
    date_fin: "",
    heure_debut: "",
    heure_fin: "",
    lieu_nom: "",
    adresse: "",
    ville: organizer?.ville || "",
    pays: "France",
    prix: "",
    lien_billetterie: "",
    lien_site: "",
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

      const docRef = await addDoc(collection(db, "submissions"), {
        ...form,
        image_url,
        organizer_id: user.uid,
        nom_organisation: organizer.nom_organisation,
        contact_nom: organizer.contact_nom,
        contact_email: user.email,
        statut: "en_attente",
        created_at: serverTimestamp(),
      });

      // Email de confirmation
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "submission",
          to: user.email,
          nom_organisation: organizer.nom_organisation,
          contact_nom: organizer.contact_nom,
          titre: form.titre,
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

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0a0a0f]">
        <ProHeader />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-400 via-yellow-400 via-green-400 via-blue-500 to-violet-500" />

        <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-16">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">Soumettre un événement</h1>
            <p className="text-white/40 text-sm">Validé sous 24h par notre équipe.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Infos principales */}
            <div className="glass rounded-2xl p-6 flex flex-col gap-4">
              <h2 className="text-white/60 text-xs uppercase tracking-wider">Informations générales</h2>

              <div>
                <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Titre de l'événement *</label>
                <input type="text" name="titre" required value={form.titre} onChange={handleChange} placeholder="Ex: Soirée Bears, Pride de Lyon..." className={inputClass} />
              </div>

              <div>
                <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Description *</label>
                <textarea
                  name="description"
                  required
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Décrivez votre événement..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors text-sm resize-none"
                />
              </div>

              <div>
                <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Catégorie *</label>
                <select name="categorie" required value={form.categorie} onChange={handleChange} className={inputClass}>
                  <option value="" disabled>Choisir une catégorie</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Date & heure */}
            <div className="glass rounded-2xl p-6 flex flex-col gap-4">
              <h2 className="text-white/60 text-xs uppercase tracking-wider">Date & heure</h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Date de début *</label>
                  <input type="date" name="date_debut" required value={form.date_debut} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Heure de début</label>
                  <input type="time" name="heure_debut" value={form.heure_debut} onChange={handleChange} className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Date de fin</label>
                  <input type="date" name="date_fin" value={form.date_fin} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Heure de fin</label>
                  <input type="time" name="heure_fin" value={form.heure_fin} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </div>

            {/* Lieu */}
            <div className="glass rounded-2xl p-6 flex flex-col gap-4">
              <h2 className="text-white/60 text-xs uppercase tracking-wider">Lieu</h2>

              <div>
                <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Nom du lieu *</label>
                <input type="text" name="lieu_nom" required value={form.lieu_nom} onChange={handleChange} placeholder="Ex: Le Marais Club, Parc de la Tête d'Or..." className={inputClass} />
              </div>

              <div>
                <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Adresse</label>
                <input type="text" name="adresse" value={form.adresse} onChange={handleChange} placeholder="12 rue des Lilas" className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-3">
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

            {/* Détails */}
            <div className="glass rounded-2xl p-6 flex flex-col gap-4">
              <h2 className="text-white/60 text-xs uppercase tracking-wider">Détails & liens</h2>

              <div>
                <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Prix (laisser vide si gratuit)</label>
                <input type="text" name="prix" value={form.prix} onChange={handleChange} placeholder="Ex: 10€ / Entrée libre" className={inputClass} />
              </div>

              <div>
                <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Lien billetterie</label>
                <input type="url" name="lien_billetterie" value={form.lien_billetterie} onChange={handleChange} placeholder="https://..." className={inputClass} />
              </div>

              <div>
                <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Site web / Page Facebook</label>
                <input type="url" name="lien_site" value={form.lien_site} onChange={handleChange} placeholder="https://..." className={inputClass} />
              </div>

              <div>
                <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Instagram de l'événement</label>
                <input type="text" name="instagram" value={form.instagram} onChange={handleChange} placeholder="@votre_compte" className={inputClass} />
              </div>
            </div>

            {/* Image */}
            <div className="glass rounded-2xl p-6 flex flex-col gap-4">
              <h2 className="text-white/60 text-xs uppercase tracking-wider">Affiche / image</h2>

              <input
                type="file"
                accept="image/*"
                ref={fileRef}
                onChange={handleImage}
                className="hidden"
              />

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
                  <div className="text-3xl mb-2">🖼️</div>
                  <p className="text-white/40 text-sm">Cliquez pour ajouter une image</p>
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
              {loading ? "Envoi en cours..." : "Soumettre l'événement →"}
            </button>
          </form>
        </main>
      </div>
    </AuthGuard>
  );
}
