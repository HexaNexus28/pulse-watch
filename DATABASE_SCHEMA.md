# 🗄️ Schéma de base de données — PulseWatch

Référence du modèle EF Core tel qu'il est réellement défini dans
`PulseWatch.Core/Entities` et `PulseWatch.Data/Context/ApplicationDbContext.cs`.
Six tables, pas une de plus.

---

## 📊 Vue d'ensemble

```mermaid
erDiagram
    User ||--o{ Category : owns
    User ||--o{ Feed : owns
    User ||--o{ Note : writes
    User ||--o{ Summary : owns
    Category ||--o{ Feed : contains
    Category ||--o{ Note : categorizes
    Category ||--o{ Trend : analyzes
    Category ||--o{ Summary : covers
    Trend ||--o{ Summary : may_source

    User {
        int Id PK
        string Username UK
        string Email UK
        string PasswordHash
        datetime CreatedAt
        bool IsActive
        string RefreshToken "nullable"
        datetime RefreshTokenExpiryTime "nullable"
    }

    Category {
        int Id PK
        string Name
        string Color "nullable"
        datetime CreatedAt
        int UserId FK "nullable, null = catégorie globale"
    }

    Feed {
        int Id PK
        string URL
        string Name
        datetime CreatedAt
        int CategoryId FK
        int UserId FK "nullable"
        bool IsActive
    }

    Note {
        int Id PK
        string Title
        string Content
        datetime CreatedAt
        int CategoryId FK
        int UserId FK
    }

    Trend {
        int Id PK
        datetime GeneratedAt
        double Score "nullable"
        json Data "Dictionary~string,double~ sérialisé"
        int CategoryId FK
    }

    Summary {
        int Id PK
        string Title
        string Content
        datetime GeneratedAt
        int TrendId FK "nullable"
        int CategoryId FK "nullable"
        int UserId FK "nullable"
    }
```

Il n'existe **ni table de sessions, ni table de jetons de rafraîchissement** : le
jeton de rafraîchissement est porté par deux colonnes de `User`
(`RefreshToken`, `RefreshTokenExpiryTime`).

---

## 📋 Tables

### 👤 User

Comptes et authentification.

| Colonne | Notes |
| --- | --- |
| `Username`, `Email` | index **unique** chacun |
| `PasswordHash` | requis |
| `RefreshToken` | nullable, remplacé à chaque rafraîchissement |

Un utilisateur possède ses catégories et ses résumés (`OnDelete: Restrict` — une
suppression d'utilisateur est refusée tant qu'il reste des lignes liées).

---

### 📁 Category

Organisation thématique. `Name` est requis, `Color` sert à l'interface.

`UserId` est **nullable** : `null` désigne une catégorie globale, livrée avec le
schéma. Les 5 catégories de référence (Tech News, Artificial Intelligence,
C# / .NET, JavaScript & Web, Cybersecurity) sont dans ce cas.

> Les catégories créées par un utilisateur ne portent pas encore son `UserId` :
> le cloisonnement multi-tenant reste à faire.

---

### 📡 Feed

Flux RSS/Atom. `URL` est requis, `IsActive` permet de suspendre un flux sans le
supprimer, `CategoryId` le rattache à une catégorie.

Le contenu des articles **n'est pas stocké** : il est relu à la demande par
`FeedService.FetchFeedContentAsync`, avec un cache mémoire de 10 minutes par
flux. Aucune table d'articles n'existe.

---

### 📝 Note

Notes de l'utilisateur, rattachées à une catégorie. `Title` et `Content` requis.

---

### 📈 Trend

Résultat de l'analyse d'une catégorie.

`Data` est un `Dictionary<string, double>` — mot-clé → score normalisé —
sérialisé en JSON par un value converter déclaré dans `ConfigureTrend`. Il n'y a
pas de colonne d'expiration : un trend est daté par `GeneratedAt`, rien ne le
périme automatiquement.

---

### 📋 Summary

Digest produit par l'agent, stocké en Markdown dans `Content`.

**Les trois clés étrangères sont nullables**, et c'est structurant :

| Colonne | Quand elle est renseignée |
| --- | --- |
| `CategoryId` | toujours, sur les deux chemins de génération |
| `TrendId` | seulement pour un résumé généré à partir d'un trend |
| `UserId` | l'auteur ; laissé libre pour une génération planifiée sans utilisateur |

Un digest de catégorie n'est rattaché à aucun trend. Les lignes antérieures à
l'ajout de `CategoryId` n'ont que leur trend — d'où la requête de
`GetSummariesByCategoryAsync`, qui accepte les deux rattachements.

Index : `IX_Summaries_CategoryId`, `IX_Summaries_TrendId`, `IX_Summaries_UserId`.

---

## 🔄 Flux de données

### 1. Lecture d'un flux

```
Feed.URL ──► HttpClient ──► SyndicationFeed.Load ──► FeedContentDto[]
                                                     (cache mémoire 10 min)
```

Rien n'est écrit en base : les articles restent en mémoire le temps du
traitement.

### 2. Analyse des tendances

```
articles ──► TrendEngineService (TF-IDF) ──► Dictionary<mot-clé, score>
                                             ──► Trend { Data, Score, GeneratedAt }
```

### 3. Digest

```
articles (5 à 40) ──► agent ADK ──► Digest { items[], dropped_count }
                                    ──► Markdown ──► Summary { CategoryId, TrendId? }
```

Les bornes 5–40 viennent du contrat de l'agent ; voir
[GUIDE.md](GUIDE.md#la-fenêtre-darticles).

---

## 🛠️ Contraintes et index

**Index déclarés**
- `User.Username` unique, `User.Email` unique
- clés étrangères indexées : `Summaries.CategoryId`, `Summaries.TrendId`,
  `Summaries.UserId`, `Feeds.CategoryId`, `Notes.CategoryId`, `Trends.CategoryId`

**Suppressions**
Toutes les relations sont en `DeleteBehavior.Restrict` : aucune suppression en
cascade. Supprimer une catégorie qui porte des flux, des notes, des trends ou des
résumés est refusé par la base.

**Migrations**
Appliquées au démarrage par `Database.Migrate()`. Les données de référence
utilisent une date figée (`SeedCreatedAt`) : voir
[GUIDE.md](GUIDE.md#données-de-référence).

---

## 📈 Ce qui manque encore

- **Cloisonnement multi-tenant** : catégories et flux créés par l'interface ne
  portent pas de `UserId`, donc tout le monde voit tout.
- **Persistance des articles** : aucune table ne les garde, ce qui interdit tout
  historique et impose de relire les flux à chaque analyse.
- **Péremption des trends** : rien ne les périme, la lecture doit trier par date.
