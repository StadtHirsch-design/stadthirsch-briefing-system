# StadtHirsch KI-Briefing-System

## Vision
Vollautomatisiertes strategisches Briefing-System für StadtHirsch Werbeagentur. Kunden durchlaufen ein interaktives, dialogisches Gespräch, das auf Basis von 7 etablierten Methodiken (5 Agentur-Guides + Pricken-Methodik) ein umfassendes strategisches Dokument generiert.

## Architektur

### Tech Stack
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes + Supabase
- **Datenbank:** Supabase (PostgreSQL)
- **KI:** OpenRouter (Kimi K2.5) via OpenClaw Gateway
- **Export:** docx.js (Word-Dokumente)
- **Deployment:** Vercel
- **Storage:** Cloudflare R2 (für generierte Dokumente)

### Kern-Module

#### 1. Conversational Engine
- Nicht-lineare Dialogführung
- Context-Awareness (was wurde besprochen?)
- Intelligente Rückfragen basierend auf Case-Erkennung
- Spracheingabe (Whisper) optional

#### 2. Case-Classifier
Erkennt automatisch, welcher der 5 Cases zutrifft:
- CI/CD Manual (Corporate Identity)
- Logo-Briefing (Neu/Redesign)
- Bildwelt-Entwicklung
- Piktogramm-Systeme
- Social Media Content

#### 3. Research-Module
- Website-Crawling (bestehende Analyse)
- Competitor-Recherche (Brave Search API)
- Werte-Extraktion via LLM
- Markt-Positionierung

#### 4. Strategy Engine (Pricken-Methodik)
- Zielformulierung/Single-Minded-Proposition
- Clicking-Fragenkatalog (200+ Fragen)
- Denkstrategien (40 Strategien)
- Ideen-Pingpong-Simulation

#### 5. Document Generator
- Word-Export mit StadtHirsch-CI
- Strukturierte Abschnitte:
  - Markenanalyse
  - Competitor Landscape
  - Touchpoint-Strategie
  - USP-Extraktion
  - Asset-Roadmap
  - Umsetzungsanleitung

## Datenbank-Schema (Supabase)

```sql
-- Kunden/Projekte
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  project_type TEXT CHECK (project_type IN ('ci', 'logo', 'bildwelt', 'piktogramme', 'social')),
  status TEXT DEFAULT 'briefing',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Gesprächshistorie
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  message TEXT NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Extrahierte Insights
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  category TEXT CHECK (category IN ('brand_values', 'target_audience', 'competitors', 'usp', 'touchpoints')),
  content TEXT NOT NULL,
  confidence FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Generierte Dokumente
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  file_url TEXT,
  file_name TEXT,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## API-Struktur

### `/api/chat`
- POST: Neue Nachricht senden
- GET: Gesprächshistorie laden

### `/api/research`
- POST: Website analysieren
- GET: Competitor-Daten abrufen

### `/api/strategy`
- POST: Zielformulierung generieren
- GET: Clicking-Fragen für Case

### `/api/export`
- POST: Word-Dokument generieren
- Response: Download-URL

## Umgebungsvariablen

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenClaw Gateway (lokal)
OPENCLAW_GATEWAY_URL=http://localhost:18789
OPENCLAW_GATEWAY_TOKEN=

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

# Brave Search
BRAVE_API_KEY=

# Optional: OpenRouter direkt
OPENROUTER_API_KEY=
```

## Getting Started

1. **Supabase Setup:**
   ```bash
   npx supabase login
   npx supabase link --project-ref <project-ref>
   npx supabase db push
   ```

2. **Vercel Deployment:**
   ```bash
   vercel --prod
   ```

3. **OpenClaw Gateway:**
   Muss lokal laufen für KI-Zugriff

## Methodik-Integration

### Phase 1: Intake (Adaptiert aus 5 Briefing-Dokumenten)
- Kontextfragen je nach Case
- Website-Analyse wenn vorhanden
- Zieldefinition

### Phase 2: Strategie (Pricken-Methodik)
- Single-Minded-Proposition entwickeln
- Clicking-Fragenkatalog anwenden
- Denkstrategien durchlaufen

### Phase 3: Research
- Competitor-Analyse
- Markt-Positionierung
- Touchpoint-Identifikation

### Phase 4: Synthese
- USP-Extraktion
- Asset-Roadmap
- Umsetzungsplan

## Roadmap

### MVP (Woche 1-2)
- [ ] Basis-Chat-Interface
- [ ] Case-Erkennung
- [ ] Einfache Word-Export

### Phase 2 (Woche 3-4)
- [ ] Website-Crawling
- [ ] Competitor-Research
- [ ] Clicking-Fragenkatalog-Integration

### Phase 3 (Woche 5-6)
- [ ] Spracheingabe (Whisper)
- [ ] Advanced Strategy Engine
- [ ] Vollautomatischer Export

### Phase 4 (Woche 7-8)
- [ ] Dashboard für StadtHirsch-Team
- [ ] Kunden-Login
- [ ] Versionsmanagement
