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

DigestAgent (processus séparé, HTTP)
├─ reçoit → Cleaned Articles (5 à 40)
├─ regroupe → doublons écartés
├─ rouvre → sources citées (vérification)
└─ renvoie → Digest → Summary

Trend
└─ consulté par → User

Summary
└─ consulté par → User

Note
└─ créée par → User

---

## Pipeline synthèse

Analyse :
User → Category → Feed → FeedFetcher → TrendEngine → Trend → User

Digest :
User → Category → Feed → FeedFetcher → DigestAgent → Summary → User

Les deux pipelines partent des mêmes articles et ne se croisent pas : un digest
de catégorie ne dépend d'aucun Trend.
