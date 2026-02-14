# StadtHirsch UI v4.0 – Modern Redesign

## Design-Philosophie
**"Dark Mode Excellence"** – Inspiriert von Linear, Notion, Vercel, Raycast

### Kernprinzipien
1. **Dark First** – Alle modernen Tools haben Dark Mode
2. **Glassmorphism** – Subtile Transparenz, Tiefe
3. **Motion Design** – Jede Interaktion hat Feedback
4. **Typography als UX** – Klar lesbar, hierarchisch
5. **Edge-to-Edge** – Keine unnötigen Container-Rahmen

---

## Farbsystem (Dark Mode)

### Backgrounds
- `--bg-base`: #000000 (Pure Black)
- `--bg-elevated`: #0A0A0A (Near Black)  
- `--bg-surface`: #141414 (Elevated)
- `--bg-hover`: #1A1A1A (Hover State)
- `--bg-active`: #222222 (Active State)

### Borders
- `--border-subtle`: rgba(255,255,255,0.06)
- `--border-default`: rgba(255,255,255,0.1)
- `--border-strong`: rgba(255,255,255,0.15)

### Text
- `--text-primary`: rgba(255,255,255,0.95)
- `--text-secondary`: rgba(255,255,255,0.6)
- `--text-tertiary`: rgba(255,255,255,0.4)
- `--text-disabled`: rgba(255,255,255,0.25)

### Accent (Purple-Blue Gradient)
- `--accent-500`: #8B5CF6 (Violet)
- `--accent-600`: #7C3AED
- `--accent-gradient`: linear-gradient(135deg, #8B5CF6, #3B82F6)

### Semantic
- `--success`: #10B981 (Green)
- `--warning`: #F59E0B (Amber)
- `--error`: #EF4444 (Red)
- `--info`: #3B82F6 (Blue)

---

## Layout-Architektur

### Grid
- **Sidebar**: 260px fixed
- **Main**: Fluid (100% - 260px)
- **Max-Content**: 800px (readable line length)
- **Spacing**: 4px base (4, 8, 12, 16, 24, 32, 48)

### Typography
- **Font**: Inter (system-ui fallback)
- **Scale**:
  - xs: 11px / 16px line
  - sm: 12px / 18px line
  - base: 14px / 22px line
  - lg: 16px / 24px line
  - xl: 20px / 30px line
  - 2xl: 24px / 34px line

---

## Komponenten

### Buttons
```
Primary:
- Background: gradient(135deg, #8B5CF6, #7C3AED)
- Border: none
- Radius: 8px
- Shadow: 0 0 20px rgba(139, 92, 246, 0.3)
- Hover: brightness(1.1), shadow intensify
- Active: scale(0.98)

Secondary:
- Background: transparent
- Border: 1px solid rgba(255,255,255,0.1)
- Hover: bg white/5

Ghost:
- Background: transparent
- Hover: bg white/5
```

### Cards
```
- Background: #141414
- Border: 1px solid rgba(255,255,255,0.06)
- Border-Radius: 12px
- Shadow: 0 0 0 1px rgba(0,0,0,0.5)
- Hover: border-color lighten, subtle lift
```

### Inputs
```
- Background: #0A0A0A
- Border: 1px solid rgba(255,255,255,0.08)
- Border-Radius: 10px
- Focus: border-color #8B5CF6, ring #8B5CF6/20
- Placeholder: text-tertiary
```

### Sidebar
```
- Background: #0A0A0A
- Border-right: 1px solid rgba(255,255,255,0.06)
- Width: 260px
- Glass effect on scroll
```

---

## Animationen

### Easing
- `--ease-smooth`: cubic-bezier(0.4, 0, 0.2, 1)
- `--ease-bounce`: cubic-bezier(0.34, 1.56, 0.64, 1)
- `--ease-spring`: cubic-bezier(0.175, 0.885, 0.32, 1.275)

### Durations
- `--fast`: 150ms
- `--normal`: 200ms
- `--smooth`: 300ms
- `--slow`: 500ms

### Micro-interactions
- Hover: opacity 0 → 1, translateY -2px
- Active: scale 0.97
- Focus: ring 0 0 0 3px rgba(139, 92, 246, 0.3)

---

## Chat-Interface Spezifikation

### Message Bubbles
- **User**: Rechts, Gradient background, rounded-xl
- **Assistant**: Links, Surface background, rounded-xl
- **Avatar**: 32px, rounded-full, gradient border on active
- **Timestamp**: 11px, text-tertiary
- **Spacing**: 16px zwischen Messages

### Input Area
- **Container**: Surface + border, rounded-2xl
- **Textarea**: Transparent, auto-resize
- **Send Button**: Floating, gradient, glow effect
- **Typing Indicator**: Animated dots, subtle pulse

### Scrollbar
- **Track**: transparent
- **Thumb**: rgba(255,255,255,0.1), rounded
- **Width**: 6px
- **Hover**: rgba(255,255,255,0.2)

---

## Mobile Adaptation
- Sidebar becomes bottom nav (icons only)
- Full-width messages
- Simplified header
- Floating action button

## Implementation Notes
- NO CSS variables (failed before)
- NO complex Tailwind configs
- Direct inline styles or standard Tailwind
- Build-in dark mode (no toggle needed)
- Mobile-first responsive
