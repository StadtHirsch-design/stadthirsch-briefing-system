# StadtHirsch KI-Briefing-System

## Schnellstart

### 1. Supabase Setup

```bash
# Supabase CLI installieren (falls nicht vorhanden)
npm install -g supabase

# Login
supabase login

# Projekt verlinken
supabase link --project-ref <dein-project-ref>

# Migrationen ausführen
supabase db push
```

### 2. Umgebungsvariablen

`.env.local` erstellen:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# OpenClaw Gateway (lokal)
OPENCLAW_GATEWAY_URL=http://localhost:18789
OPENCLAW_GATEWAY_TOKEN=<token-aus-gateway-config>

# Brave Search
BRAVE_API_KEY=<brave-api-key>
```

### 3. Development

```bash
npm install
npm run dev
```

### 4. Vercel Deployment

```bash
# Vercel CLI installieren
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## Architektur

- **Frontend:** Next.js 14, Tailwind CSS
- **Backend:** Next.js API Routes
- **Datenbank:** Supabase (PostgreSQL)
- **KI:** OpenClaw Gateway → OpenRouter (Kimi K2.5)
- **Export:** docx.js für Word-Dokumente

## Methodik

Das System integriert zwei etablierte Methoden:

1. **StadtHirsch Agentur-Prozesse** (5 Briefing-Dokumente)
   - CI/CD Manual
   - Logo-Briefing
   - Bildwelt-Entwicklung
   - Piktogramm-Systeme
   - Social Media Content

2. **Mario Pricken - Kribbeln im Kopf**
   - Clicking-Fragenkatalog (40 Denkstrategien)
   - Zielformulierung/Single-Minded-Proposition
   - 4-Phasen-Ideenmanagement
   - Chancendenken statt Ideenkiller

## Features

- Interaktives, nicht-lineares Briefing-Gespräch
- Automatische Case-Erkennung (CI, Logo, Bildwelt, etc.)
- Website-Crawling und Analyse
- Competitor-Recherche (Brave Search)
- Strategie-Generierung mit Pricken-Methodik
- Word-Export mit strukturiertem Briefing
- Qualitäts-Checklisten pro Case

## API-Endpunkte

- `POST /api/project` - Neues Projekt erstellen
- `POST /api/chat` - Chat-Nachricht senden
- `GET/POST /api/research` - Website-Analyse & Competitor-Recherche
- `GET/POST /api/strategy` - Strategie-Tools & Zielformulierung
- `POST /api/export` - Word-Dokument generieren

## Lizenz

Internes Tool für StadtHirsch Werbeagentur Luzern.
