# 🚀 Roadmap PulseWatch

Roadmap froide, analytique, orientée production & montée en compétence.

---

# **Phase 0 — Setup (0.5 jour)**

- Initialiser le repo GitHub
- Créer la solution ASP.NET Core (4 couches : Core / Data / Business / API)
- Setup Vite + React + Tailwind
- Installer Docker + Docker Compose
- Choisir la base (PostgreSQL recommandé)

**Objectif :** squelette technique minimal mais propre.

---

# **Phase 1 — Core System (2–3 jours)**

- Implémentation des entités : User, Category, Feed, Trend, Note
- Migrations EF Core
- CRUD complet pour :
  - User
  - Category
  - Feed
  - Note
- Auth simplifiée via JWT

**Objectif :** API fonctionnelle avec structure propre.

---

# **Phase 2 — Feed Fetcher (1–2 jours)**

- Service de récupération RSS (HttpClient)
- Parsing + normalisation
- Stockage des articles bruts
- HostedService (cron-like) pour rafraîchissement automatique

**Objectif :** ingestion continue des flux.

---

# **Phase 3 — Trend Engine (2–3 jours)**

- Extraction de mots-clés (TF-IDF simple)
- Analyse de fréquences
- Score de tendance (heat index)
- Résumé automatique (Textrank simple)
- Génération périodique de Trend par Category

**Objectif :** intelligence minimale embarquée.

---

# **Phase 4 — UI React (2–4 jours)**

- Dashboard général
- Page Category (feeds + trends)
- Page Feed (articles)
- Page Notes
- Page Trends avec graph
- Auth + state management (Zustand)

**Objectif :** interface fonctionnelle et agréable.

---

# **Phase 5 — Electron Desktop (1 jour)**

- Emballage du front React dans Electron
- Intégration des appels API
- Build Linux/Windows

**Objectif :** version desktop installable.

---

# **Phase 6 — Déploiement Cloud (1 jour)**

- Dockerfile (API + Front)
- Docker Compose (API + DB + Front)
- Déploiement sur :
  - Fly.io
  - ou Railway
  - ou Render
- Gestion des variables d’environnement
- HTTPS

**Objectif :** PulseWatch accessible publiquement.

---

# **Phase 7 — Options avancées (libre)**

- Création auto de catégories par clustering
- Reco intelligente de feeds
- Résumés IA (LLM local ou API externe)
- Mode offline + sync cross-device
- Système de scoring utilisateur

**Objectif :** montée en puissance progressive vers un vrai produit.

---
