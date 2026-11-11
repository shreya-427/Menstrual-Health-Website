# Personal Health Profile Enhancement — Implementation Plan

> **Status: AWAITING APPROVAL — do not begin implementation until explicitly approved.**

---

## Top-Level Overview

Add an optional **Personal Health Profile** section to the existing Settings page.
Users can store age, height, weight, and physical activity level. All fields are optional.
The feature uses the existing `storageService.js` as its only storage interface, matches
the established `.card` / `.section-heading` / `.btn-*` visual pattern, and is ready for
future encryption without changes to any UI component.

**Scope:** 2 files modified, 1 new file created. The prediction engine, AI chat, calendar,
logging, and all other pages are untouched.

---

## Data Design

### New storage key

Add one new key to `storageService.js` alongside `CYCLE_ENTRIES`, `SYMPTOM_LOGS`, `PREFERENCES`:

```
HEALTH_PROFILE: 'healthProfile'
```

### HealthProfile schema

```js
{
  age:              number | null,   // years, integer 10–120
  heightCm:         number | null,   // canonical storage unit: centimetres (1 decimal)
  weightKg:         number | null,   // canonical storage unit: kilograms (1 decimal)
  activityLevel:    'sedentary' | 'light' | 'moderate' | 'very_active' | 'extremely_active' | null,
  updatedAt:        string           // ISO datetime
}
```

**Why centimetres and kilograms as canonical units:**
Height and weight are stored in metric regardless of the unit the user selected in the UI.
The UI layer converts for display. This means the security teammate encrypts one consistent
field shape, and future analysis code works from one unit without branch logic.

**Encryption compatibility:**
Each field is a primitive (number or string). When the security teammate adds encryption,
they add `/* ENCRYPT BEFORE WRITE */` and `/* DECRYPT AFTER READ */` comments at the
`saveHealthProfile` / `getHealthProfile` call sites, exactly as they will do for notes
in `saveCycleEntry`. No UI changes needed.

### Future relevance of profile fields (informational only)

These fields are stored for possible future use. They must NOT be used in the current
prediction engine without medical research and statistical validation:

- **Age** — Menstrual cycle patterns change across the reproductive lifespan. Age could
  refine phase-length priors but requires age-stratified population data for calibration.
- **BMI (from height + weight)** — Low or high BMI is associated with cycle irregularity
  (e.g., amenorrhoea in low-weight individuals). Including BMI in a model would require
  validation against a labelled dataset and ethical review.
- **Activity level** — Intense exercise is associated with cycle suppression (functional
  hypothalamic amenorrhoea). Activity level could flag irregular cycles for a different
  explanatory pathway but again requires validated thresholds.

None of these adjustments should be made without peer-reviewed statistical backing.
The fields are stored as structured data so they are available when that work happens.

---

## Files Changed

| File | Change type | What changes |
|---|---|---|
| `src/services/storageService.js` | Modified | Add `HEALTH_PROFILE` key, `getHealthProfile()`, `saveHealthProfile(profile)`, `clearHealthProfile()`. Update `clearAllData()` to also clear the profile key. Update the schema comment block. |
| `src/pages/SettingsPage.jsx` | Modified | Add profile state, load/save handlers, import new storage functions, render `HealthProfileSection` inline in a new `.card` between "Appearance" and "Privacy & security". |
| `src/components/settings/HealthProfileSection.jsx` | **New** | Self-contained form component. Receives profile state and an `onSave` callback as props. Handles all unit conversion, validation, and rendering internally. |

No other files are touched.

---

## Sub-Tasks

---

### Sub-Task 1: Extend storageService.js

**Intent:** Add the profile storage functions to the existing storage module so the UI
and the future security teammate have a clean, consistent interface.

**Expected Outcomes:**
- `getHealthProfile()` returns a `HealthProfile` object (or the default null-filled object).
- `saveHealthProfile(partial)` merges and persists changes; always writes `updatedAt`.
- `clearHealthProfile()` removes the key.
- `clearAllData()` also clears the profile.
- The `HEALTH_PROFILE` key constant and `HealthProfile` schema are documented in comments
  with `/* ENCRYPT BEFORE WRITE */` and `/* DECRYPT AFTER READ */` markers.

**Todo List:**
- [ ] Add `HEALTH_PROFILE: 'healthProfile'` to the `KEYS` object.
- [ ] Add the `HealthProfile` schema to the comment block at the top of the file.
- [ ] Implement `getHealthProfile()` — reads from localForage, merges with default
      (`{ age: null, heightCm: null, weightKg: null, activityLevel: null }`).
      Add `/* DECRYPT AFTER READ */` comment.
- [ ] Implement `saveHealthProfile(partial)` — merges with current profile, sets
      `updatedAt: new Date().toISOString()`. Add `/* ENCRYPT BEFORE WRITE */` comment.
- [ ] Implement `clearHealthProfile()` — removes the key.
- [ ] Update `clearAllData()` to include `localforage.removeItem(KEYS.HEALTH_PROFILE)`.
- [ ] Export all three new functions.

**Relevant Context:**
- Pattern to follow: `getPreferences()` / `savePreferences(partial)` in the same file.
- The `ENCRYPT BEFORE WRITE` / `DECRYPT AFTER READ` comment convention is already
  established in `saveCycleEntry`, `getCycleEntries`, etc.

**Status:** [ ] pending

---

### Sub-Task 2: HealthProfileSection component

**Intent:** Build the self-contained form as a new component. Keeping it separate from
`SettingsPage.jsx` limits the diff on that already-complex file and makes the form
independently testable.

**Expected Outcomes:**
- Renders age (number input), height (number input + ft/in ↔ cm toggle), weight (number
  input + lb ↔ kg toggle), and activity level (button group).
- All fields optional — blank is valid.
- Unit toggle converts the displayed value correctly; stored canonical value is preserved.
- Validation prevents age outside 10–120, negative height/weight, and non-numeric input.
- "Save" button calls `onSave(profile)` with the canonical metric values.
- "Clear all profile data" button calls `onClear()` after a single inline confirmation.
- Matches existing visual style: `.card`, `.section-heading`, `.btn-primary`, `.btn-ghost`,
  `brand-*` colours, light and dark themes.
- Does not import from any file other than React itself.

**Todo List:**
- [ ] Create `src/components/settings/HealthProfileSection.jsx`.
- [ ] Props: `{ profile, onSave, onClear }` where `profile` is a `HealthProfile` object.
- [ ] Internal state: `age`, `heightValue`, `heightUnit ('cm'|'ft_in')`, `heightFt`,
      `heightIn`, `weightValue`, `weightUnit ('kg'|'lb')`, `activityLevel`, `errors`,
      `clearConfirm`.
- [ ] On mount / when `profile` prop changes: populate fields from canonical values
      using the current `heightUnit` and `weightUnit` preferences (default cm/kg).
- [ ] Height unit toggle:
      - cm → ft/in: `totalIn = cm / 2.54`, `ft = Math.floor(totalIn / 12)`,
        `in = Math.round(totalIn % 12 * 10) / 10`
      - ft/in → cm: `cm = Math.round((ft * 12 + in) * 2.54 * 10) / 10`
      - Conversion happens on toggle click; displayed value updates; canonical value
        in submit payload is always cm.
- [ ] Weight unit toggle:
      - kg → lb: `Math.round(kg * 2.20462 * 10) / 10`
      - lb → kg: `Math.round(lb / 2.20462 * 10) / 10`
- [ ] Validation on submit (not on keystroke):
      - Age: if provided, integer, 10–120.
      - Height cm: if provided, 50–272 cm.
      - Height ft: 1–8, inches 0–11.
      - Weight kg: if provided, 20–500 kg.
      - Weight lb: if provided, 44–1100 lb.
      - Display one inline error per field; do not block save for empty fields.
- [ ] `handleSave`: build `{ age, heightCm, weightKg, activityLevel }` with nulls for
      empty fields; call `onSave(payload)`.
- [ ] Activity level: 5 buttons in a flex-wrap row, each showing label + one-line
      description. Active button uses `bg-brand-purple/20 border-brand-purple` style
      (matches `SymptomLogForm` toggle pattern).
- [ ] Security notice inline: one sentence below the section heading —
      *"Profile data is stored locally and is not encrypted in the current version."*

**Relevant Context:**
- Unit toggle pattern: similar to how `SymptomLogForm.jsx` uses toggle buttons for mood/
  energy level.
- Inline confirmation pattern: `RecentEntriesList.jsx` uses `confirmId` state; replicate
  for the clear button.
- `.card`, `.btn-primary`, `.btn-ghost`, `.section-heading` from `index.css`.
- Error display pattern: `CycleEntryForm.jsx` `role="alert"` paragraph.

**Status:** [ ] pending

---

### Sub-Task 3: Wire HealthProfileSection into SettingsPage

**Intent:** Mount the new component in the Settings page with minimal additions to the
existing file — load profile on mount, handle save/clear callbacks, pass state down.

**Expected Outcomes:**
- Profile section appears between "Appearance" and "Privacy & security" in the Settings
  page (second card from the top, below theme info).
- Saving the profile shows the existing `flash()` confirmation message.
- Clearing the profile shows `flash('Profile data cleared.')`.
- No other Settings page behaviour changes.
- The existing `clearAllData` path also clears the profile (already handled in Sub-Task 1).

**Todo List:**
- [ ] Add imports: `getHealthProfile`, `saveHealthProfile`, `clearHealthProfile` from
      `storageService.js`; `HealthProfileSection` from the new component file.
- [ ] Add `profile` state variable: `const [profile, setProfile] = useState(null)`.
- [ ] In the existing `useEffect`, also call `getHealthProfile().then(setProfile)`.
- [ ] Implement `handleSaveProfile(payload)`: calls `saveHealthProfile(payload)`,
      updates local state, calls `flash('Profile saved.')`.
- [ ] Implement `handleClearProfile()`: calls `clearHealthProfile()`, resets profile
      state to defaults, calls `flash('Profile data cleared.')`.
- [ ] Render `<HealthProfileSection profile={profile} onSave={handleSaveProfile} onClear={handleClearProfile} />`
      between the Appearance card and the Privacy & security card.
- [ ] Guard the render: if `profile === null` (still loading), render nothing for that
      card (prevents a flash of empty inputs on mount).

**Relevant Context:**
- `SettingsPage.jsx` already has `prefs` loaded in `useEffect` with `getPreferences()`.
  The profile load follows the same pattern.
- `flash()` is already defined and used for AI consent and data deletion confirmations.

**Status:** [ ] pending

---

### Sub-Task 4: Verify the enhancement

**Intent:** Confirm the feature works correctly and existing functionality is unaffected,
without a formal test suite.

**Expected Outcomes:**
- `npm run build` passes with no errors.
- Manual checks pass (see todo list).
- No regression on Dashboard, Calendar, Log, Insights, Education pages.

**Todo List:**
- [ ] Run `npm run build` — must pass clean.
- [ ] Start the dev server and open Settings.
- [ ] Manual check — save: enter values in all four fields, save, reload page, confirm
      values are restored.
- [ ] Manual check — unit toggle: enter 170 cm, toggle to ft/in, confirm ~5′ 7″ displays;
      toggle back to cm, confirm 170 cm is restored.
- [ ] Manual check — weight toggle: enter 65 kg, toggle to lb, confirm ~143.3 lb; toggle
      back, confirm 65 kg.
- [ ] Manual check — validation: enter age 5, confirm error; enter age 25, confirm saves.
- [ ] Manual check — clear: click "Clear all profile data", confirm confirmation step,
      confirm fields reset to empty.
- [ ] Manual check — clearAllData: use "Delete all data" button, confirm profile data
      is also cleared.
- [ ] Navigate to Dashboard, Calendar, Log, Insights, Education — confirm no errors.
- [ ] Toggle dark mode — confirm profile section renders correctly.

**Status:** [ ] pending

---

## Bobcoin Cost Estimate

### Estimate breakdown

| Work | Best case | Worst case |
|---|---|---|
| Sub-Task 1: storageService additions | 0.5 | 1 |
| Sub-Task 2: HealthProfileSection component | 2 | 4 |
| Sub-Task 3: SettingsPage wiring | 1 | 2 |
| Sub-Task 4: Build + verification | 0.5 | 1.5 |
| **Total** | **4** | **8.5** |

**Most likely range: 5–7 coins.**

### Why the range is wide

The conversion logic (ft/in ↔ cm, lb ↔ kg, initialising from canonical values when the
user toggles units mid-session) is the most likely source of additional turns if the first
attempt has a rounding or edge-case bug. The rest is straightforward form work that follows
existing patterns in the codebase.

### Can it be completed in one Build mode session?

Yes. All four sub-tasks are sequential and small. There is no new dependency to install.

### Simpler version that reduces cost

If budget is very tight (< 5 coins), the unit toggles can be deferred:
- Store height in cm only; render a single cm input with a note "(in cm)".
- Store weight in kg only; render a single kg input with a note "(in kg)".
- This removes the conversion logic entirely, saving roughly 1–2 coins.
- The stored schema stays identical so the toggle can be added later.

### Risks that could increase cost

- Unit conversion edge cases (e.g., rounding when toggling back and forth) may require
  an extra debugging turn.
- If the existing `SettingsPage.jsx` has any linting configuration that rejects the new
  import style, that would require one extra fix turn.
- Neither risk is likely; both are minor if they occur.

---

## What Is Not Changing

- `predictionEngine.js` — not touched.
- `App.jsx`, routing, navigation — not touched.
- All non-Settings pages — not touched.
- `aiService.js`, `ChatPanel.jsx` — not touched.
- `storageService.js` existing function signatures — not changed, only additions.
