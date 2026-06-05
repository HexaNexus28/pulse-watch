# DFD — PulseWatch (RSS → Trends → Notes)

## Niveau 0 (Vue globale)

User
↓
PulseWatch System
↓
Veille + Résumés + Notes

---

## Niveau 1 (Détail des flux)

User
├─ crée → Category
├─ ajoute → Feed
├─ lit → Trends
└─ écrit → Note

Category
└─ regroupe → Feed

Feed (RSS/HTTP Source)
├─ fournit → Raw Articles
└─ synchronisé par → FeedFetcher

FeedFetcher
└─ envoie → Cleaned Articles

TrendEngine
├─ reçoit → Cleaned Articles
├─ extrait → Keywords
├─ calcule → HeatScore
└─ renvoie → Trend

Trend
└─ consulté par → User

Note
└─ créée par → User

---

## Pipeline synthèse :

User → Category → Feed → FeedFetcher → TrendEngine → Trend → User → Note
