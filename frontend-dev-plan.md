# Menstrual Health Website — Frontend Development Plan

> **Status: AWAITING APPROVAL — do not begin Phase 1 until explicitly approved.**
>
> This is the **authoritative plan for the frontend developer's responsibilities.** The full team plan (`menstrual-health-app-plan.md`) is reference material only. Backend, encryption, IBM AI agent, and formal testing tasks described there are out of scope for this work and must not be implemented here.

---

## 1. Scope and Responsibilities

### In scope (this plan)

- React/Vite project setup and Tailwind configuration.
- Navigation shell, responsive layout, light/dark theme.
- All six pages: Dashboard, Calendar, Log, Insights, Education, Settings.
- Period and symptom logging with a storage service abstraction.
- Statistical cycle prediction engine (in-browser, no AI).
- Cycle statistics, charts (Recharts), and dashboard integration.
- Mock AI chat UI (real API connection deferred to teammate).
- Settings page structure with data export and deletion stubs.
- Integration seams for security teammate and AI teammate.

### Out of scope (other teammates)

| Feature | Responsible teammate |
|---|---|
| Python/FastAPI backend | Backend teammate |
| IBM watsonx and RAG integration | AI teammate |
| PBKDF2 passphrase encryption | Security teammate |
| Medical knowledge base content | AI/content teammate |
| Final privacy policy text | Security teammate |
| Comprehensive formal test suite | Shared |

---

## 2. Budget Constraint

**Budget target: 40 Bob coins.**
10 coins are reserved from the 50-coin plan allocation for unexpected issues.

Coin estimates in this plan are **estimates, not guarantees,** and cannot be automatically enforced. Actual usage depends on context window size, revision depth, and debugging turns.

Budget management rules:

- Before each phase: state what will be built and the estimated coin cost.
- After each phase: work stops completely. A summary is provided, and **explicit approval is required before the next phase begins.** Do not proceed speculatively.
- The coin balance cannot be read automatically. You must check your remaining balance in the Bob UI before approving each phase.
- If you observe that remaining balance is within 5 coins of the 40-coin target, say so before approving further work.
- Phases 1–3 are the hard priority MVP. Phases 4 and 5 are simplified or deferred if budget is tight.

---

## 3. Technology Stack (Frontend Only)

| Technology | Role |
|---|---|
| React 18 + Vite | UI framework and build tool |
| React Router v6 | Client-side routing |
| Tailwind CSS | Styling (utility-first; design tokens from reference) |
| localForage | IndexedDB abstraction (storage service layer) |
| date-fns | Date arithmetic for prediction engine |
| Recharts | Cycle length and symptom charts (Insights page) |

**Not used in this plan:** Web Crypto API, ibm-watsonx-ai SDK, FastAPI, ChromaDB, Vitest (full test suite deferred).

---

## 4. Repository Structure (Frontend Files Only)

The frontend developer creates and owns the `frontend/` directory. Other directories (`backend/`, `docs/knowledge-base/`) are created by other teammates.

```
Menstrual-Health-App/
├── .gitignore                          ← includes node_modules, dist, .env
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   ├── .env.example                    ← VITE_BACKEND_URL=http://localhost:8000
│   └── src/
│       ├── main.jsx                    ← React entry point
│       ├── App.jsx                     ← Router, ThemeProvider, layout shell
│       │
│       ├── pages/                      ← One file per route
│       │   ├── DashboardPage.jsx
│       │   ├── CalendarPage.jsx
│       │   ├── LogPage.jsx
│       │   ├── InsightsPage.jsx
│       │   ├── EducationPage.jsx
│       │   └── SettingsPage.jsx
│       │
│       ├── components/
│       │   ├── layout/
│       │   │   ├── NavBar.jsx          ← Desktop + mobile hamburger nav
│       │   │   └── PageWrapper.jsx     ← Shared padding and max-width
│       │   ├── dashboard/
│       │   │   ├── CyclePhaseCard.jsx  ← Phase name, cycle day, progress ring
│       │   │   ├── PredictionCard.jsx  ← Next period estimate + uncertainty label
│       │   │   ├── CycleTimeline.jsx   ← Horizontal visual bar
│       │   │   └── QuickStatRow.jsx    ← Avg length, avg duration, last period
│       │   ├── calendar/
│       │   │   ├── MonthCalendar.jsx   ← Grid calendar, month nav
│       │   │   ├── DayCell.jsx         ← Per-day indicators
│       │   │   ├── CalendarLegend.jsx  ← Key: recorded / predicted / symptom
│       │   │   └── DayDetailPanel.jsx  ← Selected day detail drawer/modal
│       │   ├── logging/
│       │   │   ├── CycleEntryForm.jsx  ← Start/end date, validation
│       │   │   ├── SymptomLogForm.jsx  ← Flow, cramps, mood, energy, notes
│       │   │   └── RecentEntriesList.jsx ← Last 5 entries; edit + delete
│       │   ├── insights/
│       │   │   ├── StatCard.jsx        ← Reusable stat display card
│       │   │   ├── CycleLengthChart.jsx ← Recharts bar/line chart
│       │   │   ├── SymptomFreqChart.jsx ← Recharts horizontal bar chart
│       │   │   └── TemplateSummary.jsx ← On-device text summary
│       │   └── education/
│       │       ├── TopicCard.jsx       ← Category/topic card
│       │       ├── TopicDetailView.jsx ← Full topic with source attribution
│       │       ├── ChatPanel.jsx       ← Full chat UI (mock or real)
│       │       ├── ChatMessage.jsx     ← Single message bubble
│       │       ├── ChatDisclaimer.jsx  ← Persistent privacy reminder
│       │       └── ConsentGate.jsx     ← Renders ChatPanel or disabled stub
│       │
│       ├── services/
│       │   ├── storageService.js       ← ★ INTEGRATION SEAM for security teammate
│       │   └── aiService.js            ← ★ INTEGRATION SEAM for AI teammate
│       │
│       └── logic/
│           └── predictionEngine.js     ← Pure statistical module; no network
```

**Total new files: ~35.** This is the complete file set; no placeholder or documentation files beyond what is listed.

---

## 5. Development Phases

### Dependencies

```
Phase 1 (foundation)
    └── Phase 2 (core tracking)  ← needs storage service + routing
            └── Phase 3 (prediction + dashboard)  ← needs cycle data
                    └── Phase 4 (insights, education, settings)
                            └── Phase 5 (integration prep)
```

Each phase produces a runnable build before the next begins.

---

### Phase 1 — Foundation
**Estimated cost: 5–8 coins**

**What gets built:**
- Vite + React project scaffolded in `frontend/`.
- Tailwind installed and configured with the brand color tokens (pink `#f8a4c8`, purple `#b983d4`, teal `#4ecdc4`, light bg `#fef6fb`, dark bg `#1a1025`).
- React Router with six routes, each rendering a labeled placeholder page.
- `NavBar.jsx`: horizontal desktop nav, hamburger mobile menu, active route highlight.
- `PageWrapper.jsx`: consistent max-width and padding shell.
- Light/dark theme toggle via `data-theme` attribute on `<html>`; preference saved to `localStorage`.
- `.env.example` with `VITE_BACKEND_URL` only.
- `.gitignore` updated with `node_modules`, `dist`, `.env`.

**Deliverable:** `npm run dev` serves all six routes with the reference design's color palette and theme switching. No real data yet.

**Files created:** `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `package.json`, `index.html`, `main.jsx`, `App.jsx`, `NavBar.jsx`, `PageWrapper.jsx`, all six page stubs, `.env.example`, `.gitignore`.

---

### Phase 2 — Core Tracking
**Estimated cost: 9–13 coins**

**What gets built:**
- `storageService.js`: all CRUD methods over localForage with the exact interface defined in Section 6 below. **All fields — including dates, severity scores, and notes — pass through this service.** No encryption is implemented here; the security teammate adds it inside this module later without any UI changes. Each save/get method includes a comment marking the exact encryption integration point.
- `CycleEntryForm.jsx`: period start date (required), end date (optional), input validation.
- `SymptomLogForm.jsx`: flow intensity slider (1–5), cramp severity, mood and energy selectors, headache/bloating toggles, optional notes textarea. A visible, non-dismissable notice reads: *"Security features are not yet active. All stored data is currently unencrypted. A teammate is implementing encryption."* Do not use a padlock icon or any UI that implies protection is in place.
- `RecentEntriesList.jsx`: renders the last 5 cycle entries with edit and delete buttons.
- `LogPage.jsx`: assembles the above with a date selector defaulting to today.
- `MonthCalendar.jsx` + `DayCell.jsx`: CSS Grid calendar, month navigation, solid-pink indicator for recorded period days, symptom-logged indicator. Predicted dates displayed as outlined/dashed (placeholder data for now).
- `CalendarLegend.jsx` and `DayDetailPanel.jsx`.
- `CalendarPage.jsx`: assembles calendar + legend + detail panel.

**Deliverable:** Users can log and delete periods and symptoms. Data persists in IndexedDB. Calendar shows logged days. All form inputs are validated.

**Files created:** `storageService.js`, `CycleEntryForm.jsx`, `SymptomLogForm.jsx`, `RecentEntriesList.jsx`, `LogPage.jsx` (full), `CalendarPage.jsx` (full), `MonthCalendar.jsx`, `DayCell.jsx`, `CalendarLegend.jsx`, `DayDetailPanel.jsx`.

---

### Phase 3 — Prediction Engine and Dashboard
**Estimated cost: 8–12 coins**

**What gets built:**
- `predictionEngine.js`: the full algorithm specified in Section 7 below — weighted mean, SD, IQR, `PredictionResult` output object, data quality flags.
- `CyclePhaseCard.jsx`: current cycle day, phase name, a simple CSS progress ring.
- `PredictionCard.jsx`: predicted next period date/range, uncertainty label, data quality message.
- `CycleTimeline.jsx`: horizontal bar visualizing position in the current cycle.
- `QuickStatRow.jsx`: three stats in a row — average cycle length, average period duration, last period date.
- `DashboardPage.jsx`: assembles all dashboard components; reactively recalculates when storage changes.
- Predicted dates wired into `MonthCalendar.jsx` (dashed/outlined indicators).

**Deliverable:** Dashboard is fully functional with real data. Prediction results update when new periods are logged. Ovulatory window disclaimer displays when phase is `ovulatory_estimated`.

**Files created/modified:** `predictionEngine.js` (new), `CyclePhaseCard.jsx`, `PredictionCard.jsx`, `CycleTimeline.jsx`, `QuickStatRow.jsx`, `DashboardPage.jsx` (full), `MonthCalendar.jsx` (updated).

---

### Phase 4 — Insights, Education, and Settings
**Estimated cost: 9–13 coins**

**What gets built:**

**Insights:**
- `StatCard.jsx` (reusable).
- `CycleLengthChart.jsx`: Recharts bar or line chart of last 12 cycle lengths.
- `SymptomFreqChart.jsx`: Recharts horizontal bar chart of symptom frequencies.
- `TemplateSummary.jsx`: on-device template string describing cycle pattern (regular/irregular, average length, most common symptom).
- `InsightsPage.jsx`: assembles above; includes a disabled "AI explanation — coming soon" stub button.

**Education:**
- `TopicCard.jsx` and `TopicDetailView.jsx`: renders static health topic data from a local JSON file (`src/data/healthTopics.js`). This file contains a small set of placeholder topics; the AI teammate will replace or expand it.
- `ChatPanel.jsx`: full chat UI — message list, input, send button, loading spinner, error display, source citation area below each assistant message.
- `ChatMessage.jsx`: user (right-aligned) and assistant (left-aligned) message bubbles.
- `ChatDisclaimer.jsx`: persistent non-dismissable banner: *"Do not enter personal identifying information. Your typed questions are processed by IBM AI services when enabled."*
- `ConsentGate.jsx`: checks `aiConsentGranted` from preferences; if false, renders a disabled stub with a link to Settings. If true, renders `ChatPanel`.
- `aiService.js`: mock implementation (returns a canned response after a 1-second delay). The real integration only requires replacing the `askQuestion` function body — the interface is fixed (see Section 6).
- `EducationPage.jsx`: assembles topic browser and chat.

**Settings:**
- `SettingsPage.jsx` with clearly labeled sections:
  - **Theme** — `ThemeToggle` (functional).
  - **Privacy & Security** — read-only explanation of current state: *"Note encryption is not yet active. A security feature is being implemented by a teammate."* Links to `docs/privacy-policy-draft.md` once it exists.
  - **AI Consent** — `ConsentModal` toggle, saves `aiConsentGranted` to preferences.
  - **Your Data** — Export all data button (downloads JSON); Delete all data button (two-step confirmation, calls `storageService.clearAllData()`).
- No fake encryption UI. Absent features are labeled absent.

**Deliverable:** All six pages are functional and match the reference design. Mock chatbot responds in the UI. Data export and deletion work.

**Files created:** `StatCard.jsx`, `CycleLengthChart.jsx`, `SymptomFreqChart.jsx`, `TemplateSummary.jsx`, `InsightsPage.jsx` (full), `TopicCard.jsx`, `TopicDetailView.jsx`, `ChatPanel.jsx`, `ChatMessage.jsx`, `ChatDisclaimer.jsx`, `ConsentGate.jsx`, `aiService.js`, `EducationPage.jsx` (full), `SettingsPage.jsx` (full), `src/data/healthTopics.js`.

---

### Phase 5 — Integration Preparation
**Estimated cost: 2–4 coins**

**What gets built:**
- A review pass confirming the two integration seams (storage service and AI service) match the contracts in Section 6.
- A short `frontend/INTEGRATION.md` documenting both interfaces for teammates (one page; not a full doc).
- Any critical bugs discovered in phases 1–4 that prevent the site from running.

**What is not done in Phase 5:** No new features, no test suite, no refactoring of working code.

**Deliverable:** `npm run build` succeeds with no errors. Both integration seams are documented. Teammates can begin connecting their work.

---

### Phase Budget Summary

| Phase | Description | Estimated coins |
|---|---|---|
| 1 | Foundation, routing, Tailwind, theme | 5–8 |
| 2 | Storage service, logging, calendar | 9–13 |
| 3 | Prediction engine, dashboard | 8–12 |
| 4 | Insights, education chat, settings | 9–13 |
| 5 | Integration prep and final checks | 2–4 |
| **Total** | | **33–50 (midpoint ~40)** |

The midpoint estimate lands exactly at budget. Phases 1–3 (the hard MVP) consume roughly 22–33 coins. If budget is tight after Phase 3, Phase 4 can be scoped down: skip Recharts and ship simpler stat displays; simplify the settings page; defer the topic browser and ship only the chat UI stub.

---

## 6. Integration Seams for Teammates

### 6.1 Storage Service Interface (`src/services/storageService.js`)

**All menstrual health data — including cycle dates, symptom severity scores, mood values, and notes — must pass through this service.** No component may call localForage directly. This is the single boundary the security teammate will modify to add encryption.

The security teammate can later encrypt any or all fields without changing any UI component, by:
1. Implementing `encryptionService.js` (PBKDF2 key derivation + AES-GCM).
2. Adding `encrypt()` / `decrypt()` calls inside each save and get method.
3. Accepting the session key via a React context set in `App.jsx`.

During frontend development, the service stores all fields as plain text. Synthetic test data is used exclusively until encryption is reviewed and enabled.

```javascript
// storageService.js public interface
// ─────────────────────────────────────────────────────────────────────────────
// ENCRYPTION INTEGRATION POINTS (security teammate):
//   Each save method has a comment: /* ENCRYPT BEFORE WRITE */
//   Each get method has a comment:  /* DECRYPT AFTER READ */
//   Add encrypt(field, key) / decrypt(field, key) calls at those points.
//   Accept the session key from EncryptionContext (set in App.jsx on login).
//   No UI component changes are needed.
// ─────────────────────────────────────────────────────────────────────────────

export async function saveCycleEntry(entry)      // entry: CycleEntry → void
export async function getCycleEntries()          // → CycleEntry[]
export async function updateCycleEntry(entry)    // entry: CycleEntry → void
export async function deleteCycleEntry(id)       // id: string → void

export async function saveSymptomLog(log)        // log: SymptomLog → void
export async function getSymptomLogs()           // → SymptomLog[]
export async function updateSymptomLog(log)      // log: SymptomLog → void
export async function deleteSymptomLog(id)       // id: string → void

export async function getPreferences()           // → UserPreferences
export async function savePreferences(prefs)     // prefs: Partial<UserPreferences> → void

export async function getAllData()               // → { cycleEntries, symptomLogs }
export async function clearAllData()             // → void (deletes all localForage keys)
```

**Data schemas:**

```javascript
// CycleEntry
{ id: string, startDate: string (ISO), endDate: string|null, notes: string|null,
  createdAt: string (ISO), modifiedAt: string (ISO) }

// SymptomLog
{ id: string, date: string (ISO), flowIntensity: number (1–5)|null,
  crampSeverity: number (0–5)|null, mood: number (0–5)|null,
  energyLevel: number (0–5)|null, headache: boolean, bloating: boolean,
  additionalSymptoms: string[], notes: string|null, cycleEntryId: string|null }

// UserPreferences
{ aiConsentGranted: boolean, themePreference: 'light'|'dark' }
```

### 6.2 AI Service Interface (`src/services/aiService.js`)

The chat UI depends only on this module's exported function. The AI teammate replaces the function body only — no component changes.

#### Request format

The frontend sends a single field:

```json
POST /api/ask
Content-Type: application/json

{
  "question": "string (max 500 characters, non-empty)"
}
```

No stored health records, cycle data, or user identity are included in this request. The user typed the question text directly.

#### Response format (success)

```json
HTTP 200
{
  "answer": "string",
  "sources": [
    { "title": "string", "url": "string" }
  ]
}
```

`sources` may be an empty array if the backend returns no citations. The UI always renders the sources list (showing nothing if empty).

#### Response format (error)

The backend returns a standard HTTP error status (400, 429, 500, etc.). The frontend does not inspect the body on error — it shows a generic user-facing message based on the status code:

| Status | User-facing message |
|---|---|
| 400 | "Your question could not be processed. Please rephrase and try again." |
| 429 | "Too many requests. Please wait a moment before asking another question." |
| 5xx | "The assistant is temporarily unavailable. Please try again later." |
| Network failure | "Could not reach the assistant. Check your connection and try again." |

Raw error messages and stack traces must never be shown to users.

#### Mock implementation (during development)

```javascript
// aiService.js — mock used during frontend development
// ─────────────────────────────────────────────────────────────────────────────
// TO CONNECT THE REAL BACKEND (AI teammate):
//   1. Set VITE_BACKEND_URL in frontend/.env
//   2. Replace the mock body of askQuestion() with the fetch() call below.
//   3. No component changes needed.
//
//   Real implementation:
//     const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ask`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ question })
//     });
//     if (!res.ok) throw new Error(`HTTP ${res.status}`);
//     return await res.json();
// ─────────────────────────────────────────────────────────────────────────────

export async function askQuestion(question) {
  // Mock: 1-second delay, then a canned educational response.
  await new Promise(r => setTimeout(r, 1000));
  return {
    answer: "This is a placeholder response. The AI assistant will answer general menstrual health questions here once connected.",
    sources: [
      { title: "NIH — Menstrual Cycle Overview", url: "https://www.nichd.nih.gov/health/topics/menstruation" }
    ]
  };
}
```

---

## 7. Prediction Engine Specification

`src/logic/predictionEngine.js` is a pure function module. It has no imports beyond `date-fns` and no network calls. It exports a single function: `runPrediction(cycleEntries)`.

### Inputs and prerequisites

The engine requires **at least two `CycleEntry` records with `startDate` values** before it can compute a cycle length. With zero or one entry, it returns `dataQuality: 'no_data'` or `'single_cycle'` and sets `predictedStartDate: null`. **No prediction is generated or displayed when no observed cycle length is available.** The UI must show a clear message instead (e.g., "Log at least 2 periods to see predictions").

### Algorithm

1. **Sort** entries by `startDate` ascending.
2. **Compute cycle lengths** — integer days between consecutive `startDate` values.
3. **Exclude invalid lengths** — lengths ≤ 0 are dropped with `console.warn`. This handles duplicate dates or data entry errors.
4. **Working set** — the most recent 6 valid cycle lengths (or all available if fewer than 6).
5. **Weighted mean** — linear weights: the most recent cycle gets weight N, the next N−1, down to 1, where N is the working set size. `predictedStartDate` = most recent `startDate` + weighted mean, rounded to the nearest whole day.
6. **Standard deviation** — unweighted population SD over the working set.
7. **Irregular flag** — `isIrregular = true` only when working set size ≥ 3 **and** SD > 8 days.
8. **Uncertainty range** (only when ≥ 3 observed cycle lengths exist):
   - Regular (SD ≤ 8): range = predicted date ± SD rounded to whole days. Labeled: *"Estimated range — not a validated prediction interval."*
   - Irregular (SD > 8): range = predicted date ± IQR of the working set. Labeled: *"Wide estimated range — cycles are irregular."*
   - 1–2 observed lengths: `rangeEarlyDate` and `rangeLateDate` are `null`. Label: *"Low confidence — based on fewer than 3 observed cycles."*
9. **Phase estimation** — only when `currentCycleDay` can be computed (a period start has been logged and the current date is on or after that start):
   - Days 1–`averagePeriodDuration`: `menstrual`
   - Days `averagePeriodDuration+1` through estimated mid-cycle − 2: `follicular`
   - A window of ±2 days around estimated mid-cycle (half of `weightedMeanCycleLength`): `ovulatory_estimated`
   - Remaining days through predicted start: `luteal`
   - If `weightedMeanCycleLength` is null: `unknown`

   **Ovulation timing is not predicted.** The `ovulatory_estimated` phase label is a broad educational approximation only — it is not presented as a reliable individualized prediction. The phase window is a rough mid-cycle region based on the user's average cycle length, included solely for educational context. It must never be used to infer fertile windows for contraception or pregnancy planning. The primary purpose of the prediction engine is to estimate the next period start date; ovulation information is secondary and highly approximate.

10. **Missing `endDate`** — excluded from `averagePeriodDuration` calculation only. Does not affect predicted start date.

### Output object

```javascript
{
  predictedStartDate: Date | null,       // null when < 2 entries
  rangeEarlyDate: Date | null,           // null when < 3 observed lengths
  rangeLateDate: Date | null,            // null when < 3 observed lengths
  weightedMeanCycleLength: number | null,
  stdDevCycleLength: number | null,
  averagePeriodDuration: number | null,
  currentPhase: 'menstrual' | 'follicular' | 'ovulatory_estimated' | 'luteal' | 'unknown',
  currentCycleDay: number | null,
  dataQuality: 'sufficient' | 'limited' | 'single_cycle' | 'no_data',
  isIrregular: boolean,
  cyclesUsed: number,
  disclaimer: string   // always a non-empty string; wording depends on dataQuality and isIrregular
}
```

### Uncertainty communication rules (enforced in UI, not the engine)

The engine populates `disclaimer` with appropriate text. The UI must display it prominently and never suppress it. Specific rules:

| Condition | What the UI must show |
|---|---|
| `dataQuality === 'no_data'` | "Log at least 2 periods to see predictions." No date displayed. |
| `dataQuality === 'single_cycle'` | "Log at least one more period to generate a prediction." No date displayed. |
| `dataQuality === 'limited'` | Predicted date shown with label: "Low confidence — fewer than 3 observed cycles." No range shown. |
| `isIrregular === true` | Wide range shown with label: "Cycles vary significantly — this estimate may be less reliable." |
| `currentPhase === 'ovulatory_estimated'` | Mandatory disclaimer shown (see below). |
| Any predicted date | Label: "This is an estimate based on your logged history, not a medical prediction." |

### Mandatory ovulatory window disclaimer (never hidden or dismissable)

Whenever `currentPhase === 'ovulatory_estimated'`:

> *"The estimated fertile window shown here is based on your average cycle length and is not a reliable method for contraception or pregnancy planning. Individual cycles vary significantly. Consult a healthcare provider for family planning guidance."*

### Essential algorithm checks (Phase 3)

These four checks must pass before the dashboard is considered complete. They are manual checks using the synthetic data loader, not a formal test suite:

1. Zero entries → `dataQuality: 'no_data'`, `predictedStartDate: null`, no date shown in UI.
2. One entry → `dataQuality: 'single_cycle'`, `predictedStartDate: null`, no date shown in UI.
3. Two entries, 28 days apart → `predictedStartDate` = entry 2 start + 28 days, `dataQuality: 'limited'`, no range shown.
4. Six entries with SD > 8 days → `isIrregular: true`, IQR-based range shown, irregular label visible in UI.

---

## 8. Synthetic Data for Development

All development and testing uses synthetic data only. Real health data must never be committed to the repository or used during development.

```javascript
// src/data/syntheticData.js — dev-only; never imported in production builds
// 12 months of cycle entries with realistic variation (cycle lengths 24–33 days)
// 3 months of daily symptom logs with varied fields
// Exposes: loadSyntheticData() — call from browser console or Settings button
```

A "Load demo data" button appears in the Settings page **only** when `import.meta.env.DEV === true`. It is absent from production builds. The button calls `loadSyntheticData()` and then reloads the page to reflect the new data.

Synthetic data is the only data used until the security teammate has implemented and reviewed encryption. The Settings page privacy notice must state plainly: *"This application is in development. Do not enter real personal health information until the security review is complete."*

---

## 9. Major Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Phase 4 (Insights + Education + Settings) exceeds budget | Medium | Medium | Simplify: drop Recharts charts; use `<table>` for stats; defer topic browser |
| Calendar complexity runs over | Medium | Medium | Ship a functional table-based calendar first; upgrade to CSS Grid if budget allows |
| Recharts adds significant debugging turns | Low | Low | Use only `BarChart` and `LineChart`; no custom axes initially |
| Repeated large file reads inflate token cost | Medium | Medium | Read files only when editing; use targeted `apply_diff` edits over full rewrites |
| Context window grows across long phases | High | Medium | Start each phase in a fresh context window referencing this plan |
| Teammate storage/AI interface changes mid-build | Low | High | Both interfaces are locked now; teammate changes require updating this plan first |

---

## 10. What Happens After This Plan Is Approved

1. **Phase 1** begins. Files listed in Phase 1 are created. `npm run dev` is confirmed working.
2. **Phase 1 complete → work stops.** A brief summary of what was built is provided. You check your Bob coin balance and explicitly approve Phase 2 before it begins.
3. This pattern repeats for every phase. No phase starts without explicit approval.
4. The coin balance cannot be read automatically. **You must check it in the Bob UI.** If your remaining balance is close to your budget target, say so and the scope of the next phase will be adjusted.
5. If the budget is exhausted before Phase 4 or 5, the delivered MVP (Phases 1–3) is a functional tracking and prediction site. Phases 4 and 5 can be completed in a later session.

> **This plan is awaiting explicit approval. Phase 1 will not begin until you say so.**
