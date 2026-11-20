# Features

This document describes each page and feature of the website: what it does, which files implement it, and how information flows through the UI.

For the prediction algorithm, see [prediction-engine.md](prediction-engine.md).
For storage details, see [data-storage.md](data-storage.md).

---

## Dashboard (`/dashboard`)

**File:** `src/pages/DashboardPage.jsx`

### What it does

The dashboard is the home page. It shows:
- The user's current cycle day and estimated phase (with a progress ring).
- The predicted start date for the next period, with an uncertainty range.
- A horizontal timeline visualising the current position in the cycle.
- Three summary stats: average cycle length, average period duration, last period date.
- Quick navigation links to Calendar and Log.

If the user has entered fewer than two period start dates, the prediction components show informational messages instead of numbers.

### How it works

```
DashboardPage
  ├── useCycleData()          loads CycleEntry[] from storageService
  ├── usePrediction(entries)  runs predictionEngine → PredictionResult
  └── renders:
       ├── CyclePhaseCard     phase name + day + SVG ring
       ├── [OvulatoryDisclaimer]  shown only when phase === 'ovulatory_estimated'
       ├── PredictionCard     predicted date + range + data-quality label
       ├── CycleTimeline      segmented horizontal bar + current-day marker
       └── QuickStatRow       3 stat tiles
```

### Ovulatory window disclaimer

When `PredictionResult.currentPhase === 'ovulatory_estimated'`, `DashboardPage.jsx` renders a fixed yellow notice:

> *"The estimated fertile window shown here is based on your average cycle length and is not a reliable method for contraception or pregnancy planning."*

This notice is **not dismissable** and cannot be suppressed.

### Dashboard components

| Component | File | Key prop |
|---|---|---|
| `CyclePhaseCard` | `components/dashboard/CyclePhaseCard.jsx` | `result` (PredictionResult) |
| `PredictionCard` | `components/dashboard/PredictionCard.jsx` | `result` |
| `CycleTimeline` | `components/dashboard/CycleTimeline.jsx` | `result` |
| `QuickStatRow` | `components/dashboard/QuickStatRow.jsx` | `entries`, `result` |

---

## Calendar (`/calendar`)

**File:** `src/pages/CalendarPage.jsx`

### What it does

An interactive monthly calendar showing:
- **Recorded period days** — solid pink dot on each day in a logged period's date range.
- **Predicted period days** — outlined purple dot on days in the predicted window.
- **Symptom-logged days** — teal dot on days with a symptom log entry.
- **Today** — purple-tinted cell background.
- Month navigation (previous/next).
- A day detail panel when a day is tapped/clicked, showing logged period and symptom data for that day.

### How predicted dates are computed

`CalendarPage.jsx` calls `usePrediction(entries)` to get `PredictionResult`. It then uses `date-fns/eachDayOfInterval` to expand the predicted window into an array of `Date` objects:

```js
const windowStart = rangeEarlyDate ?? predictedStartDate
const windowEnd   = rangeLateDate
  ? new Date(rangeLateDate + avgDuration * 86400000)
  : new Date(predictedStartDate + avgDuration * 86400000)
predictedDates = eachDayOfInterval({ start: windowStart, end: windowEnd })
```

This array is passed to `MonthCalendar`, which checks each day against it to decide whether to show an outlined dot.

### Calendar components

| Component | File | Key responsibility |
|---|---|---|
| `MonthCalendar` | `components/calendar/MonthCalendar.jsx` | CSS Grid layout; builds period/symptom/predicted day sets for O(1) lookups |
| `DayCell` | `components/calendar/DayCell.jsx` | Single day button with indicator dots; uses both color and shape to avoid color-only meaning |
| `CalendarLegend` | `components/calendar/CalendarLegend.jsx` | Color + shape key rendered below the grid |
| `DayDetailPanel` | `components/calendar/DayDetailPanel.jsx` | Shows logged data for selected day; links to Log page |

---

## Log (`/log`)

**File:** `src/pages/LogPage.jsx`

### What it does

A two-tab form page:
- **Log period tab** — period start date (required), end date (optional), notes (optional). Supports editing and deleting existing entries via `RecentEntriesList`.
- **Log symptoms tab** — date selector + a daily symptom form (flow intensity 1–5, cramp severity 0–5, mood 1–5, energy 1–5, headache toggle, bloating toggle, optional notes).

All fields except period start date are optional. A green confirmation banner appears briefly after a successful save.

### How data flows

```
LogPage
  ├── useCycleData()    provides: entries, add, update, remove
  ├── useSymptomData()  provides: logs, add
  │
  ├── Period tab:
  │    CycleEntryForm → onSave → useCycleData.add() or .update()
  │    RecentEntriesList → onEdit sets editEntry state → onDelete → useCycleData.remove()
  │
  └── Symptoms tab:
       SymptomLogForm → onSave → useSymptomData.add()
```

Saving calls `storageService.saveCycleEntry()` or `storageService.saveSymptomLog()`, which writes to IndexedDB. The hook's in-memory state is updated immediately so the UI reflects the change without a page reload.

### Security notice

A yellow banner is always visible on the Log page:

> *"Security features are not yet active. All stored data is currently unencrypted. Use only synthetic test data until the security review is complete."*

This is intentional — it is not a bug. Remove it once the security teammate has implemented encryption and completed their review.

### Log components

| Component | File | Key behavior |
|---|---|---|
| `CycleEntryForm` | `components/logging/CycleEntryForm.jsx` | Validates start date (required, not future); end date must be ≥ start |
| `SymptomLogForm` | `components/logging/SymptomLogForm.jsx` | Range sliders for numeric fields; toggle buttons for mood/energy labels |
| `RecentEntriesList` | `components/logging/RecentEntriesList.jsx` | Shows last 5 entries newest-first; delete requires a two-step confirmation |

---

## Insights (`/insights`)

**File:** `src/pages/InsightsPage.jsx`

### What it does

Displays calculated statistics and charts from the user's stored cycle and symptom data:
- **Stat cards** — average cycle length, average period duration, number of cycles logged, variability (Regular/Irregular).
- **Cycle length chart** — Recharts bar chart of last 12 computed cycle lengths, with a dashed reference line at the weighted mean.
- **Symptom frequency chart** — Recharts horizontal bar chart showing how often each symptom was logged.
- **Cycle summary** — on-device template paragraph describing the user's cycle pattern (no AI).
- **AI explanation stub** — disabled button labeled "Coming soon". Not functional yet.

All calculations run in the browser. No data is transmitted.

### Data sources

```
InsightsPage
  ├── useCycleData() → entries
  ├── useSymptomData() → logs
  └── usePrediction(entries) → result
       ├── result.weightedMeanCycleLength → StatCard
       ├── result.stdDevCycleLength       → variability label
       ├── result.averagePeriodDuration   → StatCard
       └── result.isIrregular             → variability label
```

`CycleLengthChart` computes cycle lengths itself from `entries` (it does not use the prediction result) to show the raw per-cycle values on the chart.

`SymptomFreqChart` counts symptom occurrences directly from `logs`.

### Insights components

| Component | File | Input |
|---|---|---|
| `StatCard` | `components/insights/StatCard.jsx` | `label`, `value`, `unit`, `accent` colour |
| `CycleLengthChart` | `components/insights/CycleLengthChart.jsx` | `cycleEntries[]` |
| `SymptomFreqChart` | `components/insights/SymptomFreqChart.jsx` | `symptomLogs[]` |
| `TemplateSummary` | `components/insights/TemplateSummary.jsx` | `result`, `cycleCount` |

---

## Education (`/education`)

**File:** `src/pages/EducationPage.jsx`

### What it does

Two sections on one page:
1. **Health topic browser** — a grid of topic cards filtered by category. Clicking a card opens `TopicDetailView` showing the full article text and a source citation link.
2. **AI health assistant** — a full chat interface, gated behind user consent.

### Topic browser

Topics are defined as static data objects in `src/data/healthTopics.js`. Each object has:

```js
{ id, category, title, summary, content, sourceTitle, sourceUrl, sourceOrg }
```

The file currently contains six placeholder topics (cycle basics, phases, common symptoms, irregularities, PMS/PMDD, when to see a doctor). The AI/content teammate should replace this file with medically reviewed content in the same shape.

### AI chat interface

**Status: MOCKED.** The chat UI is fully built but the AI backend is not connected.

```
EducationPage
  └── ConsentGate (checks aiConsentGranted from storageService.getPreferences())
       ├── if consent = false → disabled stub with link to Settings
       └── if consent = true  → ChatPanel
            ├── ChatDisclaimer  (persistent, non-dismissable privacy notice)
            ├── Suggested questions (shown when conversation is empty)
            ├── Message list (ChatMessage components)
            └── Input form → aiService.askQuestion(text)
                              ↓
                         [MOCK: 1-second delay, returns canned response]
                         [REAL: POST /api/ask to FastAPI backend]
```

The `ChatDisclaimer` component displays this notice above the input at all times:

> *"Do not enter personal identifying information. Your typed questions are sent to IBM AI services when the assistant is enabled. Your stored health data is never transmitted automatically."*

Error states (network failure, rate limit, server error) are handled in `ChatPanel` and shown as user-friendly messages. Raw errors are never displayed.

### Education components

| Component | File | Status |
|---|---|---|
| `TopicCard` | `components/education/TopicCard.jsx` | Complete |
| `TopicDetailView` | `components/education/TopicDetailView.jsx` | Complete |
| `ConsentGate` | `components/education/ConsentGate.jsx` | Complete |
| `ChatPanel` | `components/education/ChatPanel.jsx` | Complete (mock backend) |
| `ChatMessage` | `components/education/ChatMessage.jsx` | Complete |
| `ChatDisclaimer` | `components/education/ChatDisclaimer.jsx` | Complete |

---

## Settings (`/settings`)

**File:** `src/pages/SettingsPage.jsx`

### What it does

The settings page has five sections:

| Section | Status | Description |
|---|---|---|
| Appearance | Complete | Theme is toggled via the NavBar button; this section just explains it |
| Personal health profile | Complete | Optional age, height, weight, activity level |
| Privacy & security | Partial | Passphrase setup/change/clear UI — encryption service is built but not yet wired into the app |
| AI health assistant | Complete | Consent toggle with modal |
| Your data | Complete | Export to JSON, delete all data (two-step) |
| Developer tools | Dev only | "Load demo data" button (hidden in production) |

### Personal health profile

**File:** `src/components/settings/HealthProfileSection.jsx`

An optional form with four fields:

- **Age** — integer, 10–120. Optional.
- **Height** — entered in cm or ft/in (toggle button). Optional.
- **Weight** — entered in kg or lb (toggle button). Optional.
- **Activity level** — five options with descriptions. Optional. Clicking an active selection deselects it.

**Unit conversion:** Height and weight are stored in metric (cm, kg) regardless of the display unit. The form converts on toggle. If the user enters 165 cm and toggles to ft/in, they see ≈5 ft 5 in. Toggling back restores 165 cm. Stored canonical values are always metric.

**Important:** Profile data is in a separate storage key from cycle and symptom data. Clearing the profile (`clearHealthProfile()`) does not affect any menstrual tracking records. The main "Delete all data" button in the Your Data section calls `clearAllData()`, which does clear the profile along with everything else.

### AI consent flow

1. User clicks the toggle (currently Off).
2. `ConsentModal` opens — explains that typed questions are sent to IBM, stored health records are not, and lists IBM data-retention implications.
3. User must click "I understand — enable" to confirm.
4. `savePreferences({ aiConsentGranted: true })` is called.
5. The Education page's `ConsentGate` now renders `ChatPanel` instead of the disabled stub.

Disabling consent works immediately (no modal). `savePreferences({ aiConsentGranted: false })` is called and the Education page reverts to the disabled stub on next load.

### Passphrase and encryption

**File:** `src/components/PassphraseGate.jsx`

`PassphraseGate` is a full-screen overlay that appears before the app renders. It has three modes:

| Mode | When shown | What it does |
|---|---|---|
| `'setup'` | First run — no passphrase set yet | User chooses and confirms a passphrase; calls `setupPassphrase()` |
| `'unlock'` | Returning user — passphrase previously set | User enters passphrase; calls `unlockWithPassphrase()` |
| `'change'` | Rendered inline in Settings | User enters current and new passphrase; calls `changePassphrase()` |

**Current status:** `PassphraseGate` and the underlying `encryptionService.js` are fully built, but `PassphraseGate` is not currently rendered by `App.jsx`. The app starts directly without prompting for a passphrase. See [integration-guide.md](integration-guide.md) for the remaining wiring steps.

The `'change'` mode is exposed as a named export `ChangePassphraseForm` from `PassphraseGate.jsx` and is intended to be embedded in the Privacy & security card in Settings once encryption is fully wired.

**Passphrase strength meter:** The setup form shows a five-segment strength bar that evaluates length (≥8 and ≥12 characters), presence of uppercase letters, digits, and special characters.

**Forgot passphrase:** In unlock mode, a "Forgot passphrase — wipe data" link triggers a two-step confirmation that calls `clearAllData()`. There is no password reset — a lost passphrase means encrypted data is permanently unrecoverable.

---

### Data export

Calls `getAllData()` (returns `{ cycleEntries, symptomLogs }`), serialises to JSON, and triggers a browser file download named `cycle-data-YYYY-MM-DD.json`. The profile is not currently included in the export — only cycle and symptom records.

### Data deletion

Two-step: first click shows a "Confirm delete" / "Cancel" pair. Confirming calls `clearAllData()`, which removes all four localForage keys: `cycleEntries`, `symptomLogs`, `userPreferences`, `healthProfile`.

**Limitation:** This clears data from IndexedDB but is not a forensic erasure. Residual data may remain in browser caches or on-disk sectors. Downloaded export files are not affected.
