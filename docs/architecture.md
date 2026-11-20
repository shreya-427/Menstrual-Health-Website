# Architecture

## Repository Layout

```
Menstrual-Health-App/
├── docs/                         ← documentation (this folder)
├── frontend/                     ← React/Vite web application
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   ├── .env.example
│   ├── INTEGRATION.md            ← quick-reference for teammates
│   └── src/
│       ├── main.jsx              ← React entry point
│       ├── App.jsx               ← Router, layout shell, theme wiring
│       ├── index.css             ← Tailwind directives + shared utility classes
│       ├── pages/                ← One component per route
│       ├── components/           ← Reusable UI components, grouped by page
│       ├── hooks/                ← Custom React hooks
│       ├── logic/                ← Pure JavaScript modules (no React)
│       ├── services/             ← Data access and external API abstraction
│       └── data/                 ← Static data files
├── backend/                      ← Python/FastAPI AI backend
│   ├── server.py                 ← HTTP bridge (rate limiting, CORS, retries)
│   ├── requirements.txt
│   └── agents/
│       ├── supervisor_agent.py   ← routes questions to correct sub-agent
│       ├── health_agent.py       ← menstrual health knowledge base (~900 lines)
│       ├── policy_agent.py       ← privacy/data-policy questions
│       ├── main.py               ← test harness + interactive CLI
│       ├── conversation_tests.py ← 9 multi-turn conversation test scenarios
│       └── timing_test.py        ← latency measurement tool
└── .gitignore
```

See [backend.md](backend.md) for full backend documentation.

---

## Source Directory Detail

### `src/pages/`

One file per route. Pages are thin orchestrators — they load data via hooks, compose components, and handle top-level user interactions (tab switching, navigation, confirmation dialogs). They do not contain significant business logic.

| File | Route | Description |
|---|---|---|
| `DashboardPage.jsx` | `/dashboard` | Composes prediction result into dashboard cards |
| `CalendarPage.jsx` | `/calendar` | Loads cycle + symptom data, computes predicted dates, renders calendar |
| `LogPage.jsx` | `/log` | Period and symptom logging with tab UI |
| `InsightsPage.jsx` | `/insights` | Cycle statistics, two Recharts charts, text summary |
| `EducationPage.jsx` | `/education` | Topic browser and AI chat with consent gate |
| `SettingsPage.jsx` | `/settings` | Theme, health profile, AI consent, export, delete |

### `src/components/`

Components are grouped into subdirectories matching their primary page. A few (layout, insights/StatCard) are reused across pages.

| Directory | Components |
|---|---|
| `layout/` | `NavBar`, `PageWrapper` — shared across all pages |
| `dashboard/` | `CyclePhaseCard`, `PredictionCard`, `CycleTimeline`, `QuickStatRow` |
| `calendar/` | `MonthCalendar`, `DayCell`, `CalendarLegend`, `DayDetailPanel` |
| `logging/` | `CycleEntryForm`, `SymptomLogForm`, `RecentEntriesList` |
| `insights/` | `StatCard`, `CycleLengthChart`, `SymptomFreqChart`, `TemplateSummary` |
| `education/` | `TopicCard`, `TopicDetailView`, `ChatPanel`, `ChatMessage`, `ChatDisclaimer`, `ConsentGate` |
| `settings/` | `HealthProfileSection` |
| *(root)* | `PassphraseGate` — full-screen passphrase overlay (setup / unlock / change modes) |

### `src/hooks/`

Custom React hooks bridge the storage service and the UI. They load data on mount and expose mutation functions that keep React state and IndexedDB in sync.

| Hook | Returns | Used by |
|---|---|---|
| `useCycleData` | `{ entries, loading, add, update, remove }` | Dashboard, Calendar, Log, Insights |
| `useSymptomData` | `{ logs, loading, add, update, remove }` | Calendar, Log, Insights |
| `usePrediction` | `PredictionResult` | Dashboard, Calendar |
| `useTheme` | `[theme, toggleTheme]` | App.jsx |

### `src/logic/`

Contains `predictionEngine.js` — a pure JavaScript module. It has no React dependencies, no side effects, and no network calls. It accepts an array of `CycleEntry` objects and returns a `PredictionResult` object. See [prediction-engine.md](prediction-engine.md) for full documentation.

### `src/services/`

| File | Responsibility |
|---|---|
| `storageService.js` | All IndexedDB reads and writes via localForage. The only file that calls `localforage`. UI components never access storage directly. |
| `aiService.js` | Abstraction over the AI backend. Currently returns mock responses. The real backend connection is a one-function swap. |
| `encryptionService.js` | WebCrypto-based AES-GCM encryption. Implements passphrase setup, unlock, change, encrypt, and decrypt. See [integration-guide.md](integration-guide.md) for the full API. **Note:** the file is currently named `encryptionService.html` — it must be renamed to `encryptionService.js` before it can be imported. |

### `src/data/`

| File | Contents |
|---|---|
| `healthTopics.js` | Static array of placeholder health topic objects used by the Education page |
| `syntheticData.js` | Development-only helper that populates localForage with 12 months of fake cycle data. Excluded from production builds. |

---

## Routing

`App.jsx` defines all routes using React Router v6:

```
/              → redirects to /dashboard
/dashboard     → DashboardPage
/calendar      → CalendarPage
/log           → LogPage
/insights      → InsightsPage
/education     → EducationPage
/settings      → SettingsPage
```

The `NavBar` renders links to all six routes. The active route is highlighted using React Router's `NavLink` `isActive` prop.

---

## Data Flow Overview

The following diagram shows how data moves from storage through to the UI for the most common path (cycle data to dashboard):

```
IndexedDB (browser)
      │
      │  localforage.getItem / setItem
      ▼
storageService.js
  getCycleEntries()
  saveCycleEntry()
      │
      │  async calls
      ▼
useCycleData hook          useSymptomData hook
  entries[]                  logs[]
      │                         │
      └──────────┬──────────────┘
                 │
                 ▼
         usePrediction hook
           predictionEngine.js
           runPrediction(entries)
                 │
                 ▼
           PredictionResult
                 │
      ┌──────────┼──────────────┐
      ▼          ▼              ▼
CyclePhaseCard  PredictionCard  CycleTimeline
(Dashboard)     (Dashboard)     (Dashboard)
                         │
                         ▼
                  MonthCalendar
                  (Calendar page —
                   predicted dates
                   shown as outlined dots)
```

---

## Theme System

Theme is managed by `src/hooks/useTheme.js`:

- On load, reads `localStorage.getItem('theme')` (defaults to `'light'`).
- Sets or removes the `dark` class on `document.documentElement`.
- Tailwind's `darkMode: 'class'` configuration picks this up.
- `App.jsx` passes `theme` and `toggleTheme` to `NavBar`, which renders the ☀️/🌙 toggle button.
- Theme preference is stored in `localStorage`, not in `storageService` / IndexedDB — it is not health data.

---

## Styling System

Tailwind CSS is the primary styling tool. Brand color tokens are defined in `tailwind.config.js`:

| Token | Hex | Used for |
|---|---|---|
| `brand-pink` | `#f8a4c8` | Primary accent, period indicators, buttons |
| `brand-pink-dark` | `#e87ab0` | Hover state for pink elements |
| `brand-purple` | `#b983d4` | Secondary accent, AI features, prediction indicators |
| `brand-teal` | `#4ecdc4` | Success states, symptom indicators |
| `brand-light` | `#fef6fb` | Page background (light mode) |
| `brand-dark` | `#1a1025` | Page background (dark mode) |
| `brand-card-dark` | `#251535` | Card background (dark mode) |
| `brand-muted` | `#6b7280` | Secondary text |

`src/index.css` defines three shared component classes used throughout the application:

- `.card` — white rounded panel with subtle border and shadow
- `.btn-primary` — filled pink action button
- `.btn-ghost` — text-only purple button

---

## Key Architectural Decisions

**All storage goes through `storageService.js`.**
UI components never call `localforage` directly. This single boundary allows encryption to be added inside the service module without touching any UI code.

**The prediction engine is a pure function.**
`predictionEngine.js` has no React dependencies, no storage calls, and no network calls. It accepts data and returns results. This makes it independently testable and easy to reason about.

**AI service is an isolated module.**
`aiService.js` exports a single function `askQuestion(question)`. During development it returns a mock response. Connecting the real backend requires replacing the function body — not changing any component.

**No direct server calls for health data.**
The browser never transmits stored health records to any server. The only outbound network call is `aiService.js → POST /api/ask`, which carries only the user's typed question.

**Encryption lives in `encryptionService.js`.**
`PassphraseGate.jsx` handles the full-screen passphrase UI (first-run setup, returning-user unlock, change passphrase). It imports from `encryptionService.js`, which uses only `window.crypto.subtle` — no third-party libraries. The derived `CryptoKey` lives in memory only; it is never persisted.
