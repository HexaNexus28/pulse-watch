# Guide de développement — PulseWatch

Installer, lancer, dépanner. Pour ce qu'est PulseWatch et à quoi ressemble son
modèle de données, voir [readme.md](readme.md).

---

## 1. Prérequis

| Outil | Version | Pour quoi |
| --- | --- | --- |
| .NET SDK | 9.0 | backend (`net9.0`) |
| Node.js | 18+ | frontend |
| Python | 3.11+ | agent de digest |
| SQL Server | LocalDB, conteneur ou instance | base de données |

Optionnel : Docker, pour lancer l'agent sans installer Python.

> **LocalDB est Windows uniquement.** Sur Linux ou macOS, remplacez
> `ConnectionStrings__DefaultConnection` par une instance SQL Server accessible
> (conteneur `mcr.microsoft.com/mssql/server`, ou serveur distant).

---

## 2. Les trois processus

PulseWatch tourne en trois morceaux. L'API refuse de démarrer si elle ne sait pas
où joindre l'agent, donc l'ordre le plus simple est : agent, API, frontend.

### 2.1 Agent de digest — port 8087

```bash
cd agent
cp .env.example digest_agent/.env      # renseigner DIGEST_MODEL et la clé du provider
docker compose up -d                   # OU, sans Docker :

python -m venv .venv && .venv/bin/pip install -e .
.venv/bin/uvicorn digest_agent.service:app --host 127.0.0.1 --port 8087
```

Vérification : `curl http://127.0.0.1:8087/health` → `{"status":"ok"}`.

Le `.env` va dans `digest_agent/`, pas à la racine de `agent/` : ADK charge le
`.env` du dossier de l'agent.

### 2.2 API — port 5000 (http) / 7171 (https)

```bash
cd backend/PulseWatch.API

export ConnectionStrings__DefaultConnection="Server=...;Database=PulseWatchDb;..."
export Jwt__Key="$(openssl rand -base64 48)"     # 32 caractères minimum
export DigestAgent__BaseUrl="http://127.0.0.1:8087"

dotnet run
```

Swagger est servi à la racine en développement.

**Les deux variables obligatoires.** `Jwt__Key` et `DigestAgent__BaseUrl` n'ont
pas de valeur de repli : leur absence lève une exception au démarrage. C'est
délibéré — une clé de repli en dur rendrait tous les jetons forgeables, et une
URL d'agent absente ne se verrait qu'au premier digest, des semaines plus tard.

### 2.3 Frontend — port 3000

```bash
cd frontend
npm install
cp .env.example .env      # en dev : VITE_API_URL=/api
npm run dev
```

`VITE_API_URL=/api` fait passer les appels par le proxy Vite (configuré vers
`http://localhost:5000` dans `vite.config.ts`), ce qui évite toute question de
CORS et de certificat en développement.

---

## 3. Base de données

Le schéma est appliqué par les migrations EF Core, exécutées au démarrage de
l'API (`Database.Migrate()` dans `Program.cs`).

```bash
cd backend/PulseWatch.API

# Ajouter une migration après avoir modifié une entité
Jwt__Key="dummy-key-de-conception-1234567890ab" \
DigestAgent__BaseUrl="http://127.0.0.1:8087" \
  dotnet ef migrations add NomDeLaMigration --project .

# Appliquer sans démarrer l'API
Jwt__Key="..." DigestAgent__BaseUrl="..." dotnet ef database update

# Produire le SQL sans toucher à une base (utile en revue)
Jwt__Key="..." DigestAgent__BaseUrl="..." dotnet ef migrations script --idempotent
```

Les commandes `dotnet ef` construisent l'hôte applicatif : elles ont donc besoin
des mêmes variables que l'API. N'importe quelle valeur factice suffit pour
`Jwt__Key`, tant qu'elle fait 32 caractères.

### Données de référence

`ApplicationDbContext.SeedData` livre 5 catégories et une vingtaine de flux. Leur
`CreatedAt` est une **date figée** (`SeedCreatedAt`), pas `DateTime.UtcNow` :
`HasData` fait partie du modèle, donc une valeur dynamique fait différer le
modèle à chaque construction. EF lève alors `PendingModelChangesWarning` et
`Migrate()` refuse de démarrer l'application. Toute nouvelle ligne de seed doit
suivre la même règle.

### Base créée avant l'usage des migrations

Une base construite par l'ancien `EnsureCreated()` n'a pas de table
`__EFMigrationsHistory`. `Migrate()` va donc rejouer la migration initiale sur des
tables déjà présentes, et échouer. Deux issues :

- repartir d'une base vide (développement) ;
- ou amorcer l'historique : insérer dans `__EFMigrationsHistory` les `MigrationId`
  déjà contenus dans le schéma, puis laisser `Migrate()` appliquer la suite.

---

## 4. Tests et vérifications

```bash
# Backend — compilation des 4 couches
cd backend && dotnet build PulseWatch.API/PulseWatch.API.sln

# Agent
cd agent && .venv/bin/python -m pytest tests/ -q

# Frontend
cd frontend && npx tsc --noEmit && npm run lint
```

---

## 5. Comment se fabrique un digest

```
POST /api/Summary/category/{id}/generate
   │
   ├─ SummaryService récupère les flux de la catégorie
   ├─ FeedService lit et parse chaque flux (échec d'un flux = ignoré, journalisé)
   ├─ CollectArticlesAsync borne la récolte à la fenêtre de l'agent
   ├─ DigestAgentClient POST /digest  ──►  agent : curator → writer → checker → packager
   ├─ RenderDigest met en forme le Digest reçu en Markdown
   └─ Summary enregistré (TrendId null, CategoryId renseigné)
```

### La fenêtre d'articles

`DigestRequest` (dans `agent/digest_agent/service.py`) déclare
`articles` avec `min_length=5` et `max_length=40`, et répond `422` hors de ces
bornes. Côté .NET, `SummaryService.MinArticlesForDigest` / `MaxArticlesForDigest`
tiennent la même fenêtre :

- **sous 5 articles** : l'agent n'est pas appelé, l'API répond `422` avec un
  message qui dit combien d'articles manquent ;
- **au-dessus de 40** : le plafond est réparti entre les flux de la catégorie,
  de sorte qu'aucun flux ne disparaisse entièrement de la récolte.

Ces deux bornes sont écrites des deux côtés de HTTP, faute de schéma partagé.
**Modifier `DigestRequest` impose de modifier `SummaryService`**, et
réciproquement.

### Ce que l'agent accepte de lire

`fetch_article` ne suit que `http` et `https`, et seulement vers des adresses
publiques : privé, loopback, lien-local, réservé et multicast sont refusés, à
chaque saut de redirection. Les URLs viennent des `<link>` de flux ajoutés par
les utilisateurs — sans ce filtre, un flux forgé ferait lire à l'agent les
services internes de la machine, dont le texte remonterait dans le digest.

Conséquence en développement : **un flux servi depuis `127.0.0.1` ne sera pas
relu par l'agent.** Le backend, lui, le lit sans problème (le filtre est côté
agent uniquement). Pour tester la chaîne complète en local, servez le flux depuis
une adresse publique, ou testez l'agent séparément.

---

## 6. Dépannage

| Symptôme | Cause | Correction |
| --- | --- | --- |
| L'API ne démarre pas, `JWT Key not configured` | `Jwt__Key` absente | l'exporter, 32 caractères minimum |
| `DigestAgent:BaseUrl n'est pas configure` | variable absente | l'exporter avant `dotnet run` |
| `PendingModelChangesWarning` au démarrage | valeur dynamique dans `HasData`, ou migration manquante | figer la valeur, puis `dotnet ef migrations add` |
| `Digest agent returned 422` | contrat 5–40 non respecté | vérifier que les bornes .NET et Python concordent |
| Génération en `422 Not enough article content` | la catégorie rend moins de 5 articles | ajouter des flux, ou attendre de nouveaux articles |
| `Format de flux RSS/Atom invalide` | `SyndicationFeed` est strict sur les dates RFC 822 | vérifier les `pubDate` du flux |
| `refused: ... non-public address` dans l'agent | garde-fou SSRF | attendu pour une URL interne (voir §5) |
| Frontend en 401 partout | jeton absent ou expiré | se reconnecter ; le client rafraîchit puis redirige vers `/login` |
| `LocalDB is not supported on this platform` | commande `dotnet ef` sur Linux/macOS | pointer la chaîne de connexion vers une vraie instance |

---

## 7. Conventions

- **Aucun secret dans le dépôt.** `appsettings.json` n'en contient pas, les
  `.env` sont ignorés. Ce qui manque fait échouer le démarrage, jamais un repli
  silencieux.
- **Le backend est seul propriétaire du schéma.** L'agent ne connaît ni la base
  ni les entités : il reçoit du texte et des URLs, il rend une structure.
- **Pas de repli silencieux sur une panne de l'agent.** Un faux digest rendu sans
  erreur masquerait la panne pendant des semaines ; l'erreur remonte.
- **Un flux injoignable ne fait pas échouer une génération** : il est journalisé
  et sauté, les autres sources sont conservées.
