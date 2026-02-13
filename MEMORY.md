# StadtHirsch KI-Briefing-System - Memory

## Projekt-Übersicht
- **Name:** StadtHirsch KI-Briefing-System
- **URL:** https://stadthirsch-briefing-system.vercel.app
- **Tech Stack:** Next.js 14, Supabase, OpenRouter/Gemini, Vercel
- **Erstellt:** 13.02.2026
- **Status:** Produktiv

## Architektur

### Core Features
1. **Interaktives Briefing** - Dialogische KI-Konversation
2. **Case-Erkennung** - Automatische Klassifizierung (CI, Logo, Bildwelt, Piktogramme, Social)
3. **Strategie-Engine** - Mario Pricken Methodik (Clicking-Fragenkatalog)
4. **Word-Export** - Professionelle Briefing-Dokumente
5. **Website-Analyse** - Crawling & Competitor-Research

### Integrationen
- **KI:** OpenRouter (Kimi K2.5) + Gemini Fallback
- **Datenbank:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **Hosting:** Vercel
- **Search:** Brave Search API

## Wichtige Entscheidungen

### 1. Multi-LLM Strategie (13.02.2026)
- Primär: OpenRouter (Kimi K2.5)
- Fallback: Gemini 2.0 Flash
- Grund: Redundanz bei API-Ausfällen

### 2. UI-Design (13.02.2026)
- Apple-Style mit Glassmorphism
- Gradient-Buttons
- Runde Ecken (rounded-3xl)
- Responsive Design

### 3. Datenmodell
- Projekte (UUID, Kunde, Case-Type, Status)
- Conversations (Message, Role, Metadata)
- Insights (Kategorie, Content, Confidence)
- Documents (File-URLs, Versionen)

## Betrieb

### Cron-Jobs
- **System-Check:** Alle 30 Minuten
  - Prüft KI-Integration
  - Log-Analyse
  - Performance-Monitoring

### Monitoring
- Build-Status: Vercel Dashboard
- API-Health: OpenRouter + Gemini
- Datenbank: Supabase Metrics
- Errors: Vercel Logs

## Lessons Learned

### Was funktioniert gut
- OpenRouter direkte Integration (schneller als Gateway)
- Supabase für einfache CRUD-Operationen
- Apple-UI wird positiv angenommen

### Was optimiert werden sollte
- Chunk-Size bei langen Dokumenten
- Caching für wiederholte Anfragen
- Offline-Fallback für kritische Funktionen

## Nächste Features (Roadmap)

### Priorität 1 (Diese Woche)
- [ ] Spracheingabe (Whisper)
- [ ] Echtzeit-Chat-Updates (WebSocket)
- [ ] Dashboard für StadtHirsch-Team

### Priorität 2 (Nächste Woche)
- [ ] Multi-Language Support (DE/EN/FR)
- [ ] Template-System für wiederkehrende Kunden
- [ ] Analytics & Conversion-Tracking

### Priorität 3 (Dieser Monat)
- [ ] White-Label Option
- [ ] API für externe Integrationen
- [ ] Mobile App (React Native)

## Kontakt & Support
- **Verantwortlich:** StadtHirsch CEO-Agent
- **Repository:** https://github.com/StadtHirsch-design/stadthirsch-briefing-system
- **Dokumentation:** /docs (intern)

---
*Letzte Aktualisierung: 13.02.2026*
