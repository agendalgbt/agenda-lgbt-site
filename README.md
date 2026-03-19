# Agenda LGBT — Site vitrine

Site vitrine de l'application mobile **Agenda LGBT**, qui répertorie tous les événements LGBT+ en France et en Belgique.

🌐 **Production** : [agendalgbt.com](https://agendalgbt.com)
🔗 **Page liens** : [link.agendalgbt.com](https://link.agendalgbt.com)

---

## Stack technique

- **Framework** : Next.js 14 (App Router)
- **Langage** : TypeScript
- **Style** : Tailwind CSS
- **Déploiement** : Vercel
- **Base de données** : Firebase Firestore (pour les liens dynamiques)
- **Repo** : GitHub (`agendalgbt/agenda-lgbt-site`)

---

## Structure du projet

```
agenda-lgbt-site/
├── app/
│   ├── layout.tsx              # Layout global, métadonnées SEO, font Inter
│   ├── page.tsx                # Page principale (agendalgbt.com)
│   ├── globals.css             # Styles globaux, animations, utilitaires
│   ├── components/
│   │   ├── Header.tsx          # Header fixe avec scroll effect + menu mobile
│   │   ├── Hero.tsx            # Section hero, CTA App Store & Google Play
│   │   ├── Features.tsx        # 6 cartes fonctionnalités avec icônes
│   │   ├── Screenshots.tsx     # 3 mockups de téléphone avec captures réelles
│   │   ├── Countries.tsx       # Pays couverts (FR, BE) et bientôt (ES, DE)
│   │   └── Footer.tsx          # Liens sociaux, email, mentions légales
│   └── link/
│       └── page.tsx            # Page link-in-bio (link.agendalgbt.com)
├── public/
│   ├── logo.png                # Logo Agenda LGBT
│   ├── badge-appstore.svg      # Badge App Store officiel (FR)
│   ├── badge-googleplay.svg    # Badge Google Play officiel (FR)
│   ├── screen1.png             # Screenshot app — écran accueil
│   ├── screen2.png             # Screenshot app — écran recherche
│   └── screen3.png             # Screenshot app — écran carte
├── middleware.ts               # Routing subdomain link.agendalgbt.com → /link
├── tailwind.config.ts          # Couleurs arc-en-ciel custom + animations
└── next.config.mjs             # Configuration Next.js
```

---

## Pages

### `agendalgbt.com` — Site vitrine
Page principale avec 6 sections :
1. **Header** — navigation fixe, menu hamburger mobile
2. **Hero** — accroche, boutons App Store & Google Play
3. **Features** — 6 fonctionnalités clés de l'app
4. **Screenshots** — captures d'écran de l'application
5. **Countries** — France 🇫🇷, Belgique 🇧🇪, bientôt Espagne 🇪🇸 & Allemagne 🇩🇪
6. **Footer** — Instagram, email, mentions légales

### `link.agendalgbt.com` — Page liens (remplace Linktree)
Page link-in-bio connectée à **Firebase Firestore**. Les liens sont gérés dynamiquement depuis le dashboard Streamlit (`dashboard-agendalgbt`).

Fonctionnalités :
- Liens fetchés depuis la collection Firestore `links`
- Fallback statique si Firestore inaccessible
- Effet bordure arc-en-ciel animée pour mettre un lien en avant (`highlight: true`)
- Triés par champ `order`

#### Structure d'un document Firestore (`links`) :
```json
{
  "label": "App Agenda LGBT 🏳️‍🌈",
  "description": "Télécharge l'application",
  "emoji": "📱",
  "href": "https://www.agendalgbt.com",
  "gradient": "from-violet-500 to-blue-500",
  "glow": "shadow-violet-500/30",
  "order": 1,
  "active": true,
  "highlight": false
}
```

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

Classes utilitaires :
- `.rainbow-text` — texte avec dégradé arc-en-ciel animé
- `.glass` — fond semi-transparent avec blur
- `.animate-on-scroll` — fade-in au scroll via IntersectionObserver

---

## Démarrage local

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Le site est accessible sur [http://localhost:3000](http://localhost:3000).

---

## Déploiement

Le déploiement est **automatique** via Vercel à chaque merge sur `main`.

Domaines configurés :
- `agendalgbt.com` → site principal
- `www.agendalgbt.com` → site principal
- `link.agendalgbt.com` → page liens (subdomain routé via `middleware.ts`)

---

## Workflow de développement

1. Créer une branche depuis `main`
2. Faire les modifications
3. Pousser et créer une PR
4. Merger sur `main` → Vercel redéploie automatiquement

---

## Liens utiles

- 📱 App Store : [Agenda LGBT sur l'App Store](https://apps.apple.com/us/app/agenda-lgbt/id6758344938)
- 🤖 Google Play : [Agenda LGBT sur Google Play](https://play.google.com/store/apps/details?id=com.pridepulse.agendalgbtapp&hl=fr)
- 📸 Instagram : [@agenda_lgbt](https://www.instagram.com/agenda_lgbt/)
- 📧 Contact : hello@agendalgbt.com
- 📄 Mentions légales : [Notion](https://foamy-hygienic-7f7.notion.site/INFORMATIONS-L-GALES-POLITIQUE-DE-CONFIDENTIALIT-3020bca09cae80f5a1b2faae1aef60f1)
