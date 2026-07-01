# Portfolio-Website — Florian Bohrer · Plan & Spec

> Planungsdokument **vor** dem Bau. Es hält fest, was belastbar bekannt ist, wie die Seite
> positioniert/aufgebaut/gestaltet wird — und was ich noch von dir brauche.
> Grundregel: **keine erfundenen Inhalte.** Alles Persönliche, das ich nicht sicher weiß,
> ist als `‹von dir›` markiert.

---

## 1. Ziel

Eine hochmoderne, schnelle, deploybare Ein-Seiten-Portfolio-Website, mit der du dich
bewerben kannst. Showcase deiner Stärke: **Frontend/Interaction-Development mit echtem
Produkt-Craft** — plus Range in 3D/WebGL, Daten/ML und Design.

## 2. Profil — was ich belastbar über dich weiß

Aus deinen Projekten, deiner Dev-Umgebung und unseren Sessions:

- **Name:** Florian Bohrer · **Sprache:** Deutsch (Antworten & Seite auf Deutsch)
- **Hochschule:** Umwelt-Campus Birkenfeld (Hochschule Trier) — Logins `s17c27@umwelt-campus.de`,
  Bezug zu `asta@umwelt-campus.de` (AStA). → starker Nachhaltigkeits-/Tech-Bezug. *(Studiengang ‹von dir›)*
- **Design-Haltung:** premium, automotive, high-craft (Porsche/Taycan-Cluster-Vibe) — ein echtes Differenzierungsmerkmal.
- **Skills (durch Projekte & Umgebung belegt):**
  - *Frontend:* Vue 3, JavaScript/TypeScript, Vite, HTML/CSS (fortgeschritten, design-getrieben), Tailwind, Angular
  - *Creative/3D:* Three.js/WebGL, Adobe Creative Cloud, Cinema 4D / Redshift, Design-Systeme (OKLCH-Tokens)
  - *Daten/ML:* Python, Jupyter, pandas, Audio-/Sound-Klassifikation, Datenvisualisierung
  - *Weiteres:* C#/.NET, Java/JavaFX, Git, Docker/Kubernetes (Grundlagen), Node

### Projekte (echt, deine) — Auswahl für die Seite

| Projekt | Was | Stack | Rolle als Case |
|---|---|---|---|
| **alpitronic Hypercharger HMI** ⭐ | Premium-Ladesäulen-Interface, Instrument-Cluster, Design-System | Vue 3, Vite, CSS/SVG | Flagship |
| **Focus OS** | „Precision Timer", design-system-getriebene Web-App | HTML/CSS/JS, Tokens | Produkt-Craft |
| **3D Web-Projekt** | WebGL/3D mit Modellen | Three.js, Vite, Tailwind | Range/Creative-Tech |
| **soundClassifier** | ML-Audio-Klassifikation | Python, Jupyter | Daten/ML |
| **DataVis** | Datenvisualisierung | Python | Daten |
| *dolomiten-ueberraschung* | persönliches Vue-Projekt | Vue 3 | optional (Persönlichkeit) |

## 3. Positionierung (Vorschlag — gern anpassen)

**„Creative Frontend & Interaction Developer"** mit Fokus auf **Premium-UI-Craft** und
**E-Mobilität / nachhaltige Tech** (Umwelt-Campus + Ladesäulen-HMI). Kernbotschaft:
*„Ich baue Interfaces, die sich anfühlen wie Premium-Produkte."*

→ Falls du eher als **Junior Software-Entwickler**, **UI/UX**, oder **Werkstudent (konkretes Feld)**
auftreten willst, sag's — das justiert Wording & Reihenfolge.

## 4. Seitenstruktur (Ein-Seiter mit Anker-Navigation)

1. **Hero** — Name, Rolle, ein-Satz-Nutzenversprechen, Verfügbarkeits-Badge `‹Art der Stelle›`, CTAs (Projekte / Kontakt)
2. **Über mich** — kurzer, ehrlicher Bio-Text (Tech + Nachhaltigkeit + Craft) `‹Details ergänzen›`
3. **Skills / Stack** — kategorisiert (Frontend · Creative/3D · Daten/ML · Tools)
4. **Ausgewählte Arbeiten** — Case-Cards (Alpitronic HMI als Flagship), mit Stack-Tags
5. **Werdegang** — Ausbildung (Umwelt-Campus) + `‹Praktika/Werkstudent — von dir›`
6. **Kontakt** — E-Mail, Links (GitHub/LinkedIn), Lebenslauf-Download, Standort
7. **Footer** — minimal

## 5. Design-Richtung (via Hallmark · bewusst anders als das grüne HMI)

- **Genre:** editorial-atmospheric, dark, premium.
- **Theme:** warmes Near-Black-Paper · Bone-Ink · **EIN warmer Akzent (Amber/Gold ~75°)** —
  bewusst kontrastierend zum kühlen Emerald des HMI (Differenzierung: warm vs. kühl).
- **Typo:** *Bricolage Grotesque* (Display, distinct) · *Inter* (Body) · getrackte Labels.
- **Layout:** große Typo, viel Negativraum, asymmetrisches Raster, Hairline-Linien, nummerierte Sektionen.
- **Motion:** Scroll-Reveals (IntersectionObserver), magnetische Buttons / Tilt-Cards, Skill-Marquee
  — `prefers-reduced-motion` respektiert.
- **Material:** feines warmes Grain, präzise Tiefe.

## 6. Technik

- **Vite + Vanilla JS** (framework-frei → maximal portabel & schnell). `npm run dev` für Preview,
  `npm run build` → statisches `dist/` für **GitHub Pages / Netlify / Vercel**.
- Eine `index.html`, `src/style.css` (OKLCH-Token-System), `src/main.js` (Interaktionen).
- Responsive (Desktop → Mobile), a11y (Fokus-Ringe, semantisches HTML), SEO-Meta + Open-Graph.

## 7. Was ich noch von dir brauche (dann ist sie „bewerbungsfertig")

Pflicht für eine echte Bewerbung — ich baue Platzhalter ein, du füllst:

- [ ] **Studiengang** + Zeitraum (+ ggf. Abschluss/Note) an der Umwelt-Campus
- [ ] **Berufserfahrung / Praktika / Werkstudentenjobs** (Firma, Rolle, Zeitraum) — habe ich nicht
- [ ] **Standort** (Birkenfeld/Trier/…?)
- [ ] **Kontakt:** öffentliche E-Mail, GitHub-URL, LinkedIn/Xing, ggf. Telefon
- [ ] **Lebenslauf-PDF** (für den Download-Button)
- [ ] **Foto** (optional, falls gewünscht)
- [ ] **Sprachen + Niveau** (Deutsch nativ; Englisch ‹Niveau›?)
- [ ] **Ziel-Rolle / Art der Stelle** (Werkstudent · Praktikum · Junior · …)
- [ ] **Kurzbeschreibungen** für soundClassifier, DataVis, 3D-Projekt, Focus OS (1–2 Sätze + Ergebnis)

## 8. Vorgehen

1. ✅ Diese `PLAN.md`.
2. Vite-Projekt aufsetzen + Design-System + alle Sektionen bauen.
3. Im Browser verifizieren (Desktop + Mobile), Screenshots.
4. Dir genau sagen, welche ~8 Felder du füllst → fertig zum Deployen.
