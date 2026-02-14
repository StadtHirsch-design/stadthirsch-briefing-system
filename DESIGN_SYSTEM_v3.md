# StadtHirsch UI Redesign v3.0 - Design System

## Design Philosophie
**Linear + Notion + Apple = StadtHirsch**
- Ruhig, fokussiert, professionell
- Viel Whitespace
- Subtile Animationen
- Klare Typografie-Hierarchie
- Dark Mode First (für Agentur-Use-Case)

## Farbsystem

### Primary
- `--primary-50`: #EEF2FF
- `--primary-100`: #E0E7FF
- `--primary-500`: #6366F1 (Indigo)
- `--primary-600`: #4F46E5
- `--primary-700`: #4338CA
- `--primary-900`: #312E81

### Neutrals (Dark Mode)
- `--bg-primary`: #0F0F0F (Fast black)
- `--bg-secondary`: #141414 (Elevated)
- `--bg-tertiary`: #1A1A1A (Surface)
- `--bg-hover`: #262626
- `--border-subtle`: #262626
- `--border-default`: #333333
- `--text-primary`: #FFFFFF
- `--text-secondary`: #A3A3A3
- `--text-tertiary`: #737373

### Semantic
- `--success`: #22C55E
- `--warning`: #F59E0B
- `--error`: #EF4444

## Typografie

### Font
- Primary: Inter (system-ui fallback)
- Mono: JetBrains Mono

### Scale
- `text-xs`: 12px / 16px line / 0.01em
- `text-sm`: 14px / 20px line / 0em
- `text-base`: 16px / 24px line / 0em
- `text-lg`: 18px / 28px line / -0.01em
- `text-xl`: 20px / 30px line / -0.02em
- `text-2xl`: 24px / 32px line / -0.02em
- `text-3xl`: 30px / 38px line / -0.02em

## Spacing
- 4px basis
- Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80

## Komponenten

### Buttons
- Primary: Filled, rounded-lg, glow on hover
- Secondary: Subtle fill, border
- Ghost: Transparent, hover fill

### Cards
- Background: bg-secondary
- Border: 1px border-subtle
- Radius: 12px
- Shadow: subtle, colored on hover

### Inputs
- Background: bg-tertiary
- Border: 1px border-default
- Radius: 10px
- Focus: Primary ring

## Animationen
- Duration: 150ms (fast), 200ms (normal), 300ms (slow)
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
- Scale on press: 0.98
- Opacity transitions: 0 → 1

## Layout
- Mobile-first
- Max-width: content 720px
- Sidebar: 280px (collapsed 72px)
- Header: 64px
- Generous padding: 24-32px
