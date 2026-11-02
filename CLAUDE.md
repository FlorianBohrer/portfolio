# Projekt-Richtlinien

## Sicherheitsregeln (immer beachten)

Diese drei Fehler beim Programmieren grundsätzlich vermeiden:

### 1. Kein Rate Limiting → immer Rate Limiting einbauen
- Jeder öffentlich erreichbare Endpoint (API-Route, Serverless Function, Formular-Handler,
  Login, Kontaktformular, KI-/LLM-Aufrufe) bekommt ein Rate Limit, z. B. pro IP und/oder pro User.
- Besonders wichtig bei kostenpflichtigen Drittanbieter-APIs, Auth-Endpoints und E-Mail-Versand.
- Bei Überschreitung `429 Too Many Requests` zurückgeben.

### 2. Keine Eingabeprüfung → alle Eingaben serverseitig validieren
- Jede Eingabe von außen (Body, Query, Params, Header, Formulare, Uploads) gilt als unvertrauenswürdig.
- Serverseitig validieren (Typ, Länge, Format, erlaubte Werte), z. B. mit einem Schema
  (zod, class-validator o. Ä.). Clientseitige Prüfung ist nur UX, kein Schutz.
- Ausgaben escapen: kein `innerHTML` / `v-html` mit Nutzereingaben (XSS); stattdessen
  `textContent` bzw. normale Template-Bindings.
- Datenbankzugriffe nur parametrisiert (keine String-Konkatenation → SQL-Injection).

### 3. API-Keys im Frontend → Secrets gehören nur auf den Server
- Keine API-Keys, Tokens oder Passwörter in Frontend-Code, `index.html` oder `public/`.
- Achtung Vite: alles mit `VITE_`-Präfix in `import.meta.env` landet im ausgelieferten Bundle
  und ist öffentlich. Dort niemals Secrets ablegen.
- Aufrufe, die einen geheimen Key brauchen, über ein eigenes Backend / eine Serverless
  Function (Proxy) laufen lassen; der Key liegt dort als Umgebungsvariable bzw. GitHub Secret.
- `.env`-Dateien nie committen (stehen in `.gitignore`).

## Projektkontext
- Statisches Portfolio (Vite + Vanilla JS/Vue), Deployment über GitHub Pages
  (`.github/workflows/deploy.yml`). Es gibt aktuell kein Backend: Features, die Secrets
  oder Nutzereingaben verarbeiten, brauchen daher eine separate serverseitige Komponente.
