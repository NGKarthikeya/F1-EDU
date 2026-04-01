# F1 Educational Platform — Agent Build Guide
### Project: Anti Gravity | Author: Karthikeya | Year: 2026

---

## STOP — READ THIS FIRST: VIBE CODING PRECAUTIONS

This project uses **AngularJS 1.x** (NOT modern Angular). This is the single most critical thing to know before any AI-assisted coding session.

### The 5 Vibe Coding Traps to Avoid

**Trap 1 — Angular vs AngularJS Hallucination**
The error: Prompting for "an AngularJS controller" and receiving TypeScript with `@Component` decorators — that is modern Angular v17+.
The result: App won't start. Framework mismatch.
The fix: Begin every AI session with: "I am using AngularJS 1.x (not modern Angular). Use `$scope` or `controllerAs` syntax and provide code in vanilla JavaScript."

**Trap 2 — One-Shotting Complex Features**
The error: Prompting "Build the entire scrollytelling regulations page with car animations."
The result: Context limit hit, code cut off, or "AI slop" — buggy undebuggable code.
The fix: Build feature-by-feature. Step 1: JSON structure. Step 2: Static layout. Step 3: Scroll animations. Never combine.

**Trap 3 — SVG Path Breakage**
The error: Asking AI to "animate the car front wing" without providing the actual SVG source code.
The result: AI generates a new SVG that doesn't match yours, or hallucinates element IDs.
The fix: Always paste your actual SVG into the chat. Say: "Using this specific SVG code, write a CSS animation for the element with id='front-wing'."

**Trap 4 — Performance Lag in Scrollytelling**
The error: AI defaults to `window.onscroll` event listeners because they are simpler to write.
The result: Janky animations on low-end devices. Your 32GB RAM machine will hide this problem from you.
The fix: Always prompt: "Use the Intersection Observer API for all scroll-triggered animations. Do not use window.onscroll."

**Trap 5 — Node.js Race Conditions with DB Writes**
The error: AI writes to SQLite without async error handling.
The result: Database corruption if two requests arrive simultaneously.
The fix: Always prompt: "Use async/await with try-catch for all database and file operations. Check the resource exists before writing."

### The Vibe & Verify Checklist
- Never "Prompt and Pray" — if code works but you don't understand it, ask: "Explain how this ng-repeat filter works under the hood."
- The Karpathy Move: Copy the entire error stack trace AND the entire file and paste both back to the AI.
- Commit to Git every time a vibe works. Roll back if the next prompt breaks things.
- Always specify: AngularJS 1.x, vanilla JS, Intersection Observer, async/await + try-catch.

---

## Project Overview

A visually stunning, animation-rich educational website covering the history of Formula 1. The site is deliberately backend-light — its strength is front-end visual storytelling powered by a local SQLite database.

### What the site teaches
- Evolution of F1 cars from the 1950s to present day via an interactive SVG timeline
- Racing regulations and flag rules via CSS scrollytelling
- Legendary drivers via a filterable Hall of Fame grid
- Historical race winners via a sortable, animated table

---

## Tech Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Frontend framework | AngularJS | 1.8.x | $scope syntax only, vanilla JS |
| Animations | CSS3 + SVG | Native | @keyframes, Intersection Observer |
| Backend server | Node.js | 18+ LTS | Native http + fs modules only |
| Database | SQLite | 3.x | Via better-sqlite3 npm package |
| Email log | subscribers.txt | Plain text | Append-only flat file |

### npm packages (one only)
```
better-sqlite3
```
No Express. No body-parser. No ORM. Nothing else.

---

## Project File Structure

```
f1-platform/
├── server.js
├── package.json
├── .gitignore
├── db/
│   ├── schema.sql
│   ├── seed.js
│   └── f1.db                  (gitignored — created by seed.js)
├── data/
│   ├── seed-data.json
│   └── subscribers.txt        (gitignored — created at runtime)
├── public/
│   ├── css/
│   │   ├── app.css
│   │   └── animations.css
│   ├── js/
│   │   ├── app.js
│   │   ├── services/
│   │   │   └── DataService.js
│   │   ├── controllers/
│   │   │   ├── HomeCtrl.js
│   │   │   ├── EvolutionCtrl.js
│   │   │   ├── RegulationsCtrl.js
│   │   │   ├── DriversCtrl.js
│   │   │   └── WinnersCtrl.js
│   │   └── filters/
│   │       └── eraFilter.js
│   ├── svg/
│   │   ├── car-1950s.svg
│   │   ├── car-1960s.svg
│   │   ├── car-1970s.svg
│   │   ├── car-1980s.svg
│   │   ├── car-1990s.svg
│   │   ├── car-2000s.svg
│   │   └── car-2010s.svg
│   └── assets/
│       └── drivers/
├── views/
│   ├── home.html
│   ├── evolution.html
│   ├── regulations.html
│   ├── drivers.html
│   └── winners.html
└── index.html
```

---

## SQLite Database Schema

### Why SQLite instead of flat JSON?
- JSON loads the entire file on every request — inefficient as data grows
- SQLite enables filtered queries without loading all records
- The post-race bot phase needs safe concurrent writes — SQLite handles this natively
- better-sqlite3 is synchronous, making it simple for first-year students to reason about

### schema.sql

```sql
CREATE TABLE IF NOT EXISTS cars (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  era          TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  engine_type  TEXT,
  displacement TEXT,
  horsepower   INTEGER,
  top_speed    INTEGER,
  downforce    TEXT,
  image_url    TEXT,
  year_start   INTEGER,
  year_end     INTEGER,
  highlight    TEXT
);

CREATE TABLE IF NOT EXISTS drivers (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  slug          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  nationality   TEXT,
  flag_code     TEXT,
  championships INTEGER DEFAULT 0,
  wins          INTEGER DEFAULT 0,
  poles         INTEGER DEFAULT 0,
  era           TEXT,
  teams         TEXT,
  image_url     TEXT,
  year_debut    INTEGER,
  year_last     INTEGER
);

CREATE TABLE IF NOT EXISTS race_winners (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  year        INTEGER NOT NULL,
  grand_prix  TEXT NOT NULL,
  circuit     TEXT,
  driver_id   INTEGER REFERENCES drivers(id),
  team        TEXT,
  laps        INTEGER,
  race_time   TEXT,
  fastest_lap TEXT
);

CREATE TABLE IF NOT EXISTS regulations (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  flag_color      TEXT NOT NULL UNIQUE,
  flag_name       TEXT NOT NULL,
  meaning         TEXT,
  animation_class TEXT,
  bg_color        TEXT,
  scroll_order    INTEGER
);
```

### db/seed.js

```js
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const db = new Database(path.join(__dirname, 'f1.db'));
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

const seed = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/seed-data.json'), 'utf8')
);

const insertCar = db.prepare(`
  INSERT OR IGNORE INTO cars
    (era, name, engine_type, horsepower, top_speed, image_url, year_start, year_end, highlight)
  VALUES
    (@era, @name, @engine_type, @horsepower, @top_speed, @image_url, @year_start, @year_end, @highlight)
`);

const insertDriver = db.prepare(`
  INSERT OR IGNORE INTO drivers
    (slug, name, nationality, championships, wins, era, image_url, year_debut)
  VALUES
    (@slug, @name, @nationality, @championships, @wins, @era, @image_url, @year_debut)
`);

const seedAll = db.transaction(() => {
  seed.cars.forEach(car => insertCar.run(car));
  seed.drivers.forEach(driver => insertDriver.run(driver));
});

seedAll();
console.log('Database seeded successfully.');
db.close();
```

---

## HTTP API Endpoints

| Method | Path | Returns | SQLite query |
|--------|------|---------|-------------|
| GET | `/` | index.html | none |
| GET | `/api/cars` | JSON array | SELECT * FROM cars ORDER BY year_start |
| GET | `/api/drivers` | JSON array | SELECT * FROM drivers ORDER BY championships DESC |
| GET | `/api/winners` | JSON array | SELECT * FROM race_winners ORDER BY year DESC |
| GET | `/api/regulations` | JSON array | SELECT * FROM regulations ORDER BY scroll_order |
| GET | `/public/*` | static file | none |
| POST | `/subscribe` | {success:true} | fs.appendFile to subscribers.txt |
| ANY | `/*` | 404 | none |

### server.js API handler pattern

```js
const Database = require('better-sqlite3');
const db = new Database('./db/f1.db');

function handleApi(res, query) {
  try {
    const data = db.prepare(query).all();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}
```

---

## Build Phases — Step by Step for Agents

### Phase 0 — Environment Setup

```bash
mkdir f1-platform && cd f1-platform
npm init -y
npm install better-sqlite3
mkdir -p db data public/css public/js/controllers public/js/services public/js/filters public/svg public/assets/drivers views
echo "node_modules/\ndb/f1.db\ndata/subscribers.txt" > .gitignore
git init && git add . && git commit -m "chore: project scaffold"
```

---

### Phase 1 — SQLite Schema and Seed Data

1. Create `db/schema.sql` using the schema above
2. Create `data/seed-data.json` with: 7 car eras, 20+ drivers, 50+ race winners, 4 flag regulations
3. Create `db/seed.js` using the seed script above
4. Run: `node db/seed.js`
5. Verify: `sqlite3 db/f1.db "SELECT name FROM drivers LIMIT 5;"`
6. Git commit: `feat: sqlite schema and seed data`

**Data minimums:**
- Cars: 7 records (1950s, 1960s, 1970s, 1980s, 1990s, 2000s, 2010s+)
- Drivers: 20 records including Schumacher, Hamilton, Senna, Fangio, Prost, Vettel, Lauda
- Race winners: 50+ records spanning 1950 to 2024
- Regulations: 4 records (yellow, blue, red, safety car)

---

### Phase 2 — Node.js HTTP Server

1. Create `server.js` with:
   - `http.createServer()` on port 3000
   - Route matcher using `req.url` and `req.method`
   - MIME type map for `.html .css .js .json .svg .png`
   - GET handlers for all four `/api/*` routes using the handler pattern above
   - POST handler for `/subscribe` reading request stream chunks
   - 404 catch-all
2. Run: `node server.js`
3. Test: `curl http://localhost:3000/api/drivers`
4. Git commit: `feat: node http server with sqlite api`

---

### Phase 3 — AngularJS App Shell

AGENT WARNING: AngularJS 1.x only. No TypeScript. No @Component decorators.

1. Create `index.html`:
   - AngularJS 1.8 CDN link
   - angular-route CDN link
   - `ng-app="f1App"` on `<html>`
   - `<div ng-view>` as content outlet
   - Nav bar with `ng-class` active state
2. Create `public/js/app.js`:
   - `angular.module('f1App', ['ngRoute'])`
   - `$routeProvider` for 5 routes
3. Create `DataService.js` using `$http.get('/api/...')`
4. Test all 5 routes load in browser
5. Git commit: `feat: angularjs app shell and routing`

---

### Phase 4 — Home Page Hero

1. Create `views/home.html`
2. Full-viewport dark hero section with speed-line SVG loop animation
3. Headline: staggered word reveal using `animation-delay` per word
4. Stat counters: count-up animation via `requestAnimationFrame` triggered by Intersection Observer
5. 7 era preview cards from `DataService.getCars()`
6. Git commit: `feat: home page hero`

---

### Phase 5 — Car Evolution Timeline

SVG TRAP: Create all 7 SVGs first. Assign explicit element IDs. THEN add animations.

1. Create 7 car SVGs in `public/svg/` — schematic wireframes only
2. Assign IDs to all animated elements: `id="front-wing"`, `id="engine-cover"`, etc.
3. Create `views/evolution.html` with horizontal dot timeline
4. `EvolutionCtrl`: `$scope.selectedEra`, click handler, `$interval` auto-advance every 3s
5. CSS: `opacity` + `translateX` transition on era swap
6. Data card: staggered field reveal with 80ms `animation-delay` per field
7. Git commit: `feat: car evolution svg timeline`

---

### Phase 6 — Regulations Scrollytelling

PERFORMANCE TRAP: MUST use Intersection Observer. NEVER use window.onscroll.

1. Create `views/regulations.html`: sticky left panel + scrolling right sections
2. Each flag section: `data-flag="yellow"` attribute
3. `RegulationsCtrl`: `IntersectionObserver` watching each section
4. On intersection: `$scope.activeFlag = flagColor` via `$scope.$apply()`
5. Yellow flag: background `#FFD700` + SVG oscillate `@keyframes`
6. Blue flag: SVG car overtake via `transform: translateX()`
7. Red flag: background pulse flash `@keyframes`
8. Git commit: `feat: regulations scrollytelling`

---

### Phase 7 — Hall of Fame Driver Grid

1. Create `views/drivers.html`
2. Load from `/api/drivers` via DataService
3. Filter buttons: All, Most Championships, 1950s–60s, 1970s–80s, 1990s–2000s, Modern
4. Custom `eraFilter` in `filters/eraFilter.js`
5. Template: `ng-repeat="driver in drivers | eraFilter:selectedEra"`
6. Card hover: scale + stats overlay via CSS transition
7. Card enter: `ngAnimate` CSS hooks
8. Git commit: `feat: driver hall of fame grid`

---

### Phase 8 — Race Winners Table

1. Create `views/winners.html`
2. Year dropdown + GP search using AngularJS `filter` pipe
3. `orderBy` on column headers with toggle asc/desc
4. Podium animation: top 3 rise up with `@keyframes riseUp`
5. Git commit: `feat: race winners table`

---

### Phase 9 — Newsletter Form

1. Name + email fields with `ng-model` + `ng-required`
2. `$http.post('/subscribe', data)` on submit
3. Server: read stream chunks, parse URLSearchParams, `fs.appendFile` to subscribers.txt
4. Success: checkered flag SVG animation replaces form
5. Git commit: `feat: newsletter form and post handler`

---

### Phase 10 — Polish

1. Fonts: Orbitron (display) + DM Sans (body) from Google Fonts
2. CSS variables: `--f1-red: #E8002D`, `--f1-dark: #0a0a0a`, `--f1-silver: #C0C0C0`, `--f1-gold: #D4AF37`
3. Loading screen: 5 start lights with staggered `animation-delay`, then go dark
4. Scroll progress bar: thin red line at page top fills on scroll
5. Responsive: 768px (2-col) and 480px (1-col) with pure CSS media queries
6. Final test: DevTools Network tab throttled to Slow 3G — all animations must remain smooth
7. Git commit: `feat: polish and responsive layout`

---

## Skills Required

### Frontend
- HTML5 — semantic structure, `data-*` attributes
- CSS3 Animations — `@keyframes`, `animation-delay`, `transform`, `cubic-bezier`
- SVG authoring — `<path>`, `<polygon>`, element IDs, viewBox
- Intersection Observer API — scroll-driven class toggling
- AngularJS 1.x — `$scope`, `ng-repeat`, `ng-model`, `ng-class`, custom filters, `$routeProvider`, `$http`, `$interval`, `ngAnimate`
- CSS Grid + Flexbox
- Responsive design — media queries

### Backend
- Node.js — `http.createServer()`, request/response cycle, MIME types
- Node.js fs module — `readFile`, `appendFile`
- SQLite — CREATE TABLE, INSERT, SELECT, WHERE, ORDER BY
- better-sqlite3 — prepared statements, transactions, synchronous driver
- REST API design — JSON responses, HTTP status codes
- Error handling — try-catch, preventing data corruption

### Tooling
- Git — commit after every working feature, rollback strategy
- npm — init, install, package.json
- Browser DevTools — Network, Console, throttling
- SQLite CLI — verification queries

### Vibe Coding (AI-Assisted Development)
- Prompt engineering — always specify AngularJS 1.x, Intersection Observer, async/await
- Incremental development — JSON first, layout second, animations third
- AI output verification — read and understand before running
- Debugging with AI — paste full error + full file; never just describe

---

## CSS Variables

```css
:root {
  --f1-red:       #E8002D;
  --f1-dark:      #0a0a0a;
  --f1-silver:    #C0C0C0;
  --f1-gold:      #D4AF37;
  --f1-white:     #F5F5F5;
  --f1-carbon:    #1a1a1a;
  --font-display: 'Orbitron', monospace;
  --font-body:    'DM Sans', sans-serif;
  --transition:   300ms ease-out;
  --radius:       8px;
}
```

---

## Anti-Patterns Reference

| Never do this | Do this instead |
|--------------|----------------|
| `window.onscroll = ...` | `new IntersectionObserver(...)` |
| TypeScript / @Component | Vanilla JS / $scope |
| One-shot complex pages | Feature by feature, one commit each |
| Animate SVG without pasting source | Paste full SVG, reference specific IDs |
| `fs.writeFile` without try-catch | async/await + try-catch on all I/O |
| Load all data from JSON every request | SQLite SELECT with WHERE filters |

---

## Running the Project

```bash
# First time only
npm install
node db/seed.js

# Every time
node server.js

# Open
http://localhost:3000
```

---

*Anti Gravity | Karthikeya | F1 Education Platform | 2026*
