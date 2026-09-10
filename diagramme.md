```mermaid
classDiagram
    class User {
        +int Id
        +string Username
        +string Email
        +string PasswordHash
        +AddCategory()
        +AddNote()
    }

    class Category {
        +int Id
        +string Name
        +int? UserId
        +DateTime CreatedAt
        +AddFeed()
        +GetTrends()
    }

    class Feed {
        +int Id
        +string URL
        +int CategoryId
        +DateTime CreatedAt
        +FetchItems()
    }

    class Note {
        +int Id
        +string Title
        +string Content
        +int CategoryId
        +int UserId
        +DateTime CreatedAt
        +Edit()
        +Delete()
    }

    class Trend {
        +int Id
        +int CategoryId
        +JSON Data
        +DateTime GeneratedAt
        +Calculate()
    }
    class Summary {
        +int Id
        +string Title
        +string Content
        +DateTime GeneratedAt
        +int? TrendId
        +int? CategoryId
        +int? UserId
    }

    User "1" --> "*" Category : owns
    User "1" --> "*" Summary : owns
    Trend "1" --> "*" Summary : may source
    Category "1" --> "*" Feed : contains
    Category "1" --> "*" Note : contains
    Category "1" --> "*" Trend : contains
    Category "1" --> "*" Summary : covers
```

# Category Model

## Description

Représente une catégorie créée par un utilisateur ou générée par le système.
Chaque catégorie regroupe :

- des sources d’information (Feeds)
- des notes personnelles
- des tendances (Trends)

## Champs

- **Id (int)** – Identifiant unique
- **Name (string)** – Nom de la catégorie (max 80 caractères)
- **CreatedAt (DateTime)** – Date de création
- **UserId (int?)** – Propriétaire optionnel

## Relations

- 1 Category → plusieurs Feeds
- 1 Category → plusieurs Notes
- 1 Category → plusieurs Trends

# Feed Model

## Description

Représente une URL suivie par l’utilisateur. Utilisé pour la veille automatique.
Chaque Feed appartient à une catégorie.

## Champs

- **Id (int)** – Identifiant unique
- **URL (string)** – Lien (max 300)
- **CreatedAt (DateTime)** – Date de création
- **CategoryId (int)** – Clé étrangère vers Category

## Relations

- 1 Feed → 1 Category

# Note Model

## Description

Contenu écrit par l'utilisateur : idées, résumés, réflexions.
Associée à une catégorie pour organisation.

## Champs

- **Id (int)** – Identifiant unique
- **Title (string)** – Titre (max 200)
- **Content (string)** – Texte (max 5000)
- **CreatedAt (DateTime)** – Date de création
- **CategoryId (int)** – Clé vers Category
- **UserId (int?)** – Auteur optionnel (notes publiques ou privées)

## Relations

- 1 Note → 1 Category
- 0..1 Note → 1 User

# Trend Model

## Description

Mot-clé ou sujet détecté comme tendance (analyse automatique).
Chaque trend peut générer plusieurs résumés (Summaries).

## Champs

- **Id (int)** – Identifiant unique
- **Keyword (string)** – Sujet détecté (max 150)
- **Description (string?)** – Contexte (max 500)
- **CreatedAt (DateTime)** – Date de création
- **CategoryId (int)** – Classification
- **UserId (int?)** – Créateur optionnel (ex : trend custom)

## Relations

- 1 Trend → 1 Category
- 0..1 Trend → 1 User
- 1 Trend → plusieurs Summaries

## 📘 Summary — Résumé Automatique des Tendances

L'entité **Summary** représente un digest produit par l'agent ADK à partir des
articles des flux d'une catégorie. Il est généré à la demande, et conservé pour
que l'utilisateur retrouve l'historique de sa veille.

### ✨ Champs

- **Id** _(int)_ — identifiant unique
- **Title** _(string)_ — titre généré, ex. « Actualités Cybersecurity : 10/09/2026 »
- **Content** _(string)_ — le digest, en Markdown
- **GeneratedAt** _(DateTime)_ — date de génération
- **CategoryId** _(int?)_ — catégorie couverte, renseignée sur les deux chemins
- **TrendId** _(int?)_ — trend d'origine, `null` pour un digest de catégorie
- **UserId** _(int?)_ — auteur ; libre pour une génération planifiée

### 🔗 Relations

- Un **User** peut posséder plusieurs **Summaries**
- Un **Summary** couvre une **Category**
- Un **Summary** peut s'appuyer sur un **Trend**, sans obligation

### 🎯 Utilité

- Fournir des résumés quotidiens ou hebdomadaires
- Conserver un historique des synthèses
- Améliorer l’expérience utilisateur en rendant la veille simple et digeste

---
