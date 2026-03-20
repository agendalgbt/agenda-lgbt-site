# Agenda LGBT — Site vitrine + Plateforme Pro

Site vitrine et plateforme professionnelle de l'application mobile **Agenda LGBT**, qui répertorie tous les événements LGBT+ en France et en Belgique.

🌐 **Production** : [agendalgbt.com](https://agendalgbt.com)
🔗 **Page liens** : [link.agendalgbt.com](https://link.agendalgbt.com)
🏢 **Plateforme Pro** : [pro.agendalgbt.com](https://pro.agendalgbt.com)

---

## Stack technique

- **Framework** : Next.js 14 (App Router)
- **Langage** : TypeScript
- **Style** : Tailwind CSS
- **Déploiement** : Vercel
- **Base de données** : Firebase Firestore
- **Auth** : Firebase Authentication (comptes organisateurs)
- **Email** : Resend (emails transactionnels)
- **Paiement** : Stripe (checkout, webhooks, factures PDF avec TVA 20%)
- **Analytics** : Vercel Analytics
- **Repo** : GitHub (`agendalgbt/agenda-lgbt-site`)

---

## Structure du projet

```
agenda-lgbt-site/
├── app/
│   ├── layout.tsx              # Layout global, métadonnées SEO, font Inter
│   ├── page.tsx                # Page principale (agendalgbt.com)
│   ├── globals.css             # Styles globaux, animations, utilitaires
│   ├── components/             # Composants site vitrine
│   ├── link/page.tsx           # Page link-in-bio (link.agendalgbt.com)
│   ├── pro/
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Landing page pro
│   │   ├── inscription/page.tsx
│   │   ├── connexion/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── soumettre/page.tsx
│   │   ├── profil/page.tsx
│   │   ├── sponsoring/
│   │   │   ├── page.tsx                   # Landing sponsoring (iframe)
│   │   │   ├── evenement/page.tsx         # Sponsoring app (iframe)
│   │   │   ├── instagram/page.tsx         # Sponsoring Instagram (iframe)
│   │   │   ├── success/page.tsx
│   │   │   └── success-instagram/page.tsx
│   │   ├── context/AuthContext.tsx
│   │   └── components/
│   │       ├── AuthGuard.tsx
│   │       └── ProHeader.tsx
│   └── api/
│       ├── send-email/route.ts
│       ├── audience/route.ts              # Alias → stripe/audience
│       ├── create-checkout/route.ts       # Alias → stripe/create-checkout
│       ├── create-checkout-instagram/route.ts
│       └── stripe/
│           ├── audience/route.ts          # Calcul audience 30km (Haversine)
│           ├── create-checkout/route.ts   # Session Stripe app
│           ├── create-checkout-instagram/route.ts
│           ├── webhook/route.ts           # Webhook Stripe app
│           ├── webhook-instagram/route.ts
│           └── cron/route.ts             # Cron quotidien isSponsored
├── lib/
│   ├── firebase.ts             # Firebase client
│   └── firebase-admin.ts       # Firebase Admin SDK (lazy init via Proxy)
├── public/
│   ├── logo.png / badge-appstore.svg / badge-googleplay.svg / screen*.png
│   └── _sp/                   # Pages HTML statiques du module sponsoring
│       ├── index.html
│       ├── sponsor.html
│       ├── instagram.html
│       ├── success.html
│       └── success-instagram.html
├── middleware.ts               # Routing subdomains + exclusion _sp/
├── vercel.json                 # Cron job (05:00 UTC quotidien)
└── tailwind.config.ts
```

---

## Pages

### `agendalgbt.com` — Site vitrine
Page principale avec 6 sections : Header, Hero, Features, Screenshots, Countries, Footer.

### `link.agendalgbt.com` — Page liens
Link-in-bio connectée à Firestore (`links`). Liens gérés dynamiquement depuis le dashboard Streamlit, triés par `order`, avec effet arc-en-ciel pour les liens mis en avant (`highlight: true`).

### `pro.agendalgbt.com` — Plateforme Pro

**Pages publiques :**
- `/pro` — landing page
- `/pro/inscription` — création de compte
- `/pro/connexion` — authentification

**Pages protégées (Firebase Auth) :**
- `/pro/dashboard` — statistiques, liste des soumissions
- `/pro/soumettre` — formulaire de soumission d'événement
- `/pro/profil` — informations de l'organisation
- `/pro/sponsoring` — module de sponsorisation

**Fonctionnalités :**
- Formulaires adaptatifs par catégorie d'événement
- Upload d'image via Firebase Storage
- Emails automatiques via Resend (bienvenue, soumission, validation, refus)
- Validation/refus depuis le dashboard Streamlit

#### Collections Firestore :
- `organizers` — profils organisateurs
- `submissions` — événements soumis (`en_attente` / `validé` / `refusé`)
- `activities` — événements publiés dans l'app (champ `isSponsored`)
- `sponsorships` — transactions sponsorisation app
- `instagram_sponsorships` — transactions sponsorisation Instagram
- `instagram_booked_days` — dates réservées Instagram
- `links` — liens link-in-bio
- `users` — utilisateurs app mobile (lecture pour calcul audience)

---

## Module Sponsoring

Intégré dans la plateforme Pro via **iframe** : les pages HTML originales (`public/_sp/`) sont servies sous le ProHeader. Le header natif des HTML est masqué automatiquement via JavaScript quand la page est dans une iframe.

### Sponsorisation Application

Formulaire 3 étapes :
1. **Événement** — recherche dans Firestore `activities`
2. **Dates** — calendrier 30 jours avec tarification dynamique
3. **Paiement** — récap + infos facturation + Stripe

**Tarification :** `max(audience × 0,012€, 3€)` par jour, ×1,30 vendredi/samedi.
L'audience est calculée en comptant les utilisateurs dans un rayon de 30 km (formule Haversine sur `users`).

### Sponsorisation Instagram

Formulaire 4 étapes :
1. **Pack** — Visibilité Express (79€ HT) ou Sold Out (129€ HT)
2. **Événement** — infos + upload visuels
3. **Dates** — sélection des dates de publication (60 jours)
4. **Paiement** — récap + infos facturation + Stripe

**Packs :**
- *Visibilité Express* (79€ HT) : 2 Stories + lien billetterie + Agenda Hebdomadaire
- *Sold Out* (129€ HT) : 3 Stories + 1 Post Feed + Coup de Cœur + Agenda Hebdomadaire + lien bio 24h Jour J

### Webhooks Stripe
- `/api/stripe/webhook` — met à jour `isSponsored` dans `activities`, crée la transaction dans `sponsorships`, envoie emails
- `/api/stripe/webhook-instagram` — bloque les dates dans `instagram_booked_days`, crée la transaction, envoie emails

### Cron job
Tourne quotidiennement à 05:00 UTC. Parcourt les événements avec `sponsored_days` et met à jour `isSponsored` selon la date du jour.

---

## Variables d'environnement

| Variable | Usage |
|----------|-------|
| `RESEND_API_KEY` | Emails transactionnels |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase Admin SDK (JSON stringifié) |
| `STRIPE_SECRET_KEY` | API Stripe |
| `STRIPE_TAX_RATE_ID` | Taux de TVA Stripe (`txr_xxx`) |
| `STRIPE_WEBHOOK_SECRET` | Signature webhook app |
| `STRIPE_WEBHOOK_SECRET_INSTAGRAM` | Signature webhook Instagram |
| `NEXT_PUBLIC_BASE_URL` | `https://pro.agendalgbt.com` |

---

## Design

| Élément | Valeur |
|---------|--------|
| Fond | `#0a0a0f` |
| Rouge | `#E53E3E` |
| Orange | `#ED8936` |
| Jaune | `#ECC94B` |
| Vert | `#48BB78` |
| Bleu | `#4299E1` |
| Violet | `#9F7AEA` |

Classes utilitaires : `.rainbow-text`, `.glass`, `.animate-on-scroll`

---

## Démarrage local

```bash
npm install
npm run dev
```

---

## Déploiement

Automatique via Vercel à chaque push sur `main`.

Domaines :
- `agendalgbt.com` → site principal
- `link.agendalgbt.com` → page liens
- `pro.agendalgbt.com` → plateforme pro

---

## Liens utiles

- 📱 [App Store](https://apps.apple.com/us/app/agenda-lgbt/id6758344938)
- 🤖 [Google Play](https://play.google.com/store/apps/details?id=com.pridepulse.agendalgbtapp&hl=fr)
- 📸 Instagram : [@agenda_lgbt](https://www.instagram.com/agenda_lgbt/)
- 📧 Contact : hello@agendalgbt.com
- 📄 [Mentions légales](https://foamy-hygienic-7f7.notion.site/INFORMATIONS-L-GALES-POLITIQUE-DE-CONFIDENTIALIT-3020bca09cae80f5a1b2faae1aef60f1)
