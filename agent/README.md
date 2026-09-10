# Digest agent — ADK

Remplace `SummaryService.GenerateContentSummaryAsync`, qui n'était pas un résumé :
il découpait les articles, comptait les mots de plus de 4 lettres et recollait
6 phrases brutes. Aucune synthèse, aucune déduplication, aucune vérification.

## Le graphe

```
START ──► curator ──► writer ──► checker ──► gate
                        ▲                     │
                        └──── "retry" ────────┤
                                              └──► "ok" ──► packager
```

| Nœud | Type | Rôle | Tools |
|---|---|---|---|
| `curator` | LlmAgent | regroupe les doublons, jette le bruit, garde 3–5 sujets | `fetch_article` |
| `writer` | LlmAgent | rédige le digest en français, chaque fait rattaché à une source | — |
| `checker` | LlmAgent | rouvre les sources, liste les affirmations non étayées | `fetch_article` |
| `gate` | **FunctionNode** | décide de reboucler ou de publier | — (Python pur) |
| `packager` | LlmAgent | sérialise vers le contrat `Digest` | — (`output_schema`) |

## Les quatre décisions qui comptent

**1. `Workflow`, pas `SequentialAgent`/`LoopAgent`.**
Ces deux-là émettent un `DeprecationWarning` en ADK 2.8 (« will be removed in a
future version »). La plupart des tutoriels en ligne les enseignent encore.
`Workflow` est un moteur de graphe : les nœuds sont reliés par des `edges`, une
branche conditionnelle s'écrit comme un dictionnaire de routes.

**2. La décision de boucler est du Python, pas un tool.**
L'approche courante donne un tool `exit_loop` au checker et espère qu'il pense à
l'appeler. C'est le premier point de rupture des petits modèles. Ici `gate` lit
le verdict dans le state et pose `ctx.route`. Un modèle qui répond mal ne peut
pas bloquer le pipeline, et le plafond de tentatives est garanti.

**3. L'agent ne touche jamais la base.**
Le .NET reste propriétaire du schéma ([R-05]) : il envoie les articles, reçoit
un digest. Donner des tools SQL à l'agent l'aurait rendu plus impressionnant et
aurait dupliqué le modèle EF Core en Python — une dette à chaque migration.

**4. `/digest` maison plutôt que `adk api_server`.**
`adk api_server` expose l'API de session d'ADK : le .NET devrait créer une
session, poster un message, puis lire un flux d'événements. Ce service n'a
aucune conversation à tenir. Un POST, un `Digest`.

## Faire tourner

```bash
uv venv --python 3.13 .venv
uv pip install --python .venv/Scripts/python.exe -e .
cp .env.example digest_agent/.env      # puis renseigner le modèle et la clé

python scripts/build_payload.py payload.json   # 18 articles de flux réels
python run_local.py payload.json               # trace complète en console
```

`run_local.py` affiche chaque appel de tool et chaque sortie de nœud. C'est
l'équivalent console de `adk web`.

## Tests

```bash
python -m pytest tests -q
```

Ils ne couvrent que `tools.py` — le seul code déterministe. Un agent ne se teste
pas en comparant sa sortie à une chaîne attendue : le modèle n'est pas
déterministe. Ce qui doit l'être, c'est le comportement des tools face à une
source morte, une page vide, ou un article de 50 000 caractères.

## Déploiement (VPS IONOS, derrière la façade Nginx)

```bash
docker compose up -d --build
curl http://127.0.0.1:8087/health
```

Le conteneur écoute en **loopback `127.0.0.1:8087`** ; la façade Nginx route le
sous-domaine vers lui. Ports déjà pris sur la machine : 8000/8001 (Kong
Supabase), 8085/8086 (EduSocialNews).

La clé du modèle est injectée par `env_file` au **runtime** : elle n'entre
jamais dans l'image.
