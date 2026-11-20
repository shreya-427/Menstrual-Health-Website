# Local Data Storage

**Primary file:** `src/services/storageService.js`

All local data is stored in the browser's **IndexedDB** via the `localForage` library. No health data is transmitted to any server.

---

## ⚠ Security Status

> **All data is currently stored without encryption.**
>
> Anyone with access to the user's browser profile (on the same machine) can read the stored health records using browser developer tools. The security teammate has not yet implemented encryption. Until they do:
> - Users should not enter real personal health information.
> - The Log page and Settings page display a yellow development notice warning users of this limitation.
>
> See [integration-guide.md](integration-guide.md) for where and how encryption should be added.

---

## The `storageService.js` Module

`src/services/storageService.js` is the **only file that calls `localforage`** in the application. Every UI component, hook, and page reads and writes data exclusively through this module.

This design gives the security teammate a single, well-defined boundary for adding encryption — they modify only this file, and no UI code changes are needed.

### Storage keys

All data is stored under six keys in the same localForage instance:

| Constant | Key string | Contents |
|---|---|---|
| `KEYS.CYCLE_ENTRIES` | `'cycleEntries'` | Array of CycleEntry objects |
| `KEYS.SYMPTOM_LOGS` | `'symptomLogs'` | Array of SymptomLog objects |
| `KEYS.PREFERENCES` | `'userPreferences'` | Single UserPreferences object |
| `KEYS.HEALTH_PROFILE` | `'healthProfile'` | Single HealthProfile object |
| *(encryption)* | `'__enc_salt__'` | Base64 PBKDF2 salt — written by `encryptionService.js`, not `storageService.js` |
| *(encryption)* | `'__enc_sentinel__'` | Encrypted sentinel object — used to verify the passphrase on unlock |

The two encryption keys are managed exclusively by `src/services/encryptionService.js`. They are not exposed through `storageService.js` and are not included in data exports or bulk deletion. `clearAllData()` removes only the four health data keys.

---

## Data Schemas

### CycleEntry

Represents one logged menstrual period.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | `crypto.randomUUID()` — generated at save time |
| `startDate` | `string` | ISO date, e.g. `"2024-03-01"`. Required. |
| `endDate` | `string \| null` | ISO date. Optional. |
| `notes` | `string \| null` | Free text. Optional. **Currently unencrypted. Will be encrypted by security teammate.** |
| `createdAt` | `string` | ISO datetime, set at creation |
| `modifiedAt` | `string` | ISO datetime, updated on every save |

### SymptomLog

Represents one day's symptom record.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | UUID |
| `date` | `string` | ISO date — the day the symptoms relate to |
| `flowIntensity` | `number(1–5) \| null` | 1 = light, 5 = heavy |
| `crampSeverity` | `number(0–5) \| null` | 0 = none, 5 = severe |
| `mood` | `number(1–5) \| null` | 1 = very low, 5 = great |
| `energyLevel` | `number(1–5) \| null` | 1 = exhausted, 5 = very energetic |
| `headache` | `boolean` | |
| `bloating` | `boolean` | |
| `additionalSymptoms` | `string[]` | Currently always `[]` (UI does not yet support free-form entries) |
| `notes` | `string \| null` | Free text. **Currently unencrypted.** |
| `cycleEntryId` | `string \| null` | Not currently populated by the UI |
| `createdAt` | `string` | ISO datetime |
| `modifiedAt` | `string` | ISO datetime |

### UserPreferences

A single object (not an array).

| Field | Type | Default | Notes |
|---|---|---|---|
| `aiConsentGranted` | `boolean` | `false` | Whether the user has consented to AI chat |
| `themePreference` | `'light' \| 'dark'` | `'light'` | Stored here but the theme hook uses `localStorage` directly; these may diverge |

> **Note on theme storage:** `useTheme.js` reads from `localStorage` for faster first-load. `UserPreferences.themePreference` is not currently read on startup — the theme hook's `localStorage` value takes precedence. This is a minor inconsistency that may be reconciled when encryption is wired up.

> **Note on passphrase state:** Passphrase setup state is tracked via the presence of `__enc_salt__` in IndexedDB (checked by `isPassphraseSet()` from `encryptionService.js`), not via a field in `UserPreferences`. The `passphraseSet` and `encryptionSalt` fields described in `frontend/INTEGRATION.md` have not been added to `DEFAULT_PREFERENCES` yet — they should be added when encryption is wired into `storageService.js`.

### HealthProfile

A single object (not an array). All fields are optional.

| Field | Type | Default | Notes |
|---|---|---|---|
| `age` | `number \| null` | `null` | Integer years (10–120) |
| `heightCm` | `number \| null` | `null` | Canonical unit: centimetres. **Currently unencrypted.** |
| `weightKg` | `number \| null` | `null` | Canonical unit: kilograms. **Currently unencrypted.** |
| `activityLevel` | `string \| null` | `null` | One of: `'sedentary'`, `'light'`, `'moderate'`, `'very_active'`, `'extremely_active'` |
| `updatedAt` | `string` | set at save | ISO datetime |

Height and weight are always stored in metric (cm, kg) regardless of which unit the user chose in the UI. The `HealthProfileSection` component converts for display on the fly.

---

## `storageService.js` API Reference

### Cycle entries

```js
getCycleEntries()           → Promise<CycleEntry[]>
saveCycleEntry(entry)       → Promise<CycleEntry>   // entry: { startDate, endDate?, notes? }
updateCycleEntry(updated)   → Promise<void>          // updated: { id, ...fields to change }
deleteCycleEntry(id)        → Promise<void>
```

`saveCycleEntry` generates an `id`, `createdAt`, and `modifiedAt` automatically.
`updateCycleEntry` updates `modifiedAt` on every call.

### Symptom logs

```js
getSymptomLogs()            → Promise<SymptomLog[]>
saveSymptomLog(log)         → Promise<SymptomLog>
updateSymptomLog(updated)   → Promise<void>
deleteSymptomLog(id)        → Promise<void>
```

### Preferences

```js
getPreferences()            → Promise<UserPreferences>
savePreferences(partial)    → Promise<void>    // partial: { aiConsentGranted? | themePreference? }
```

`getPreferences` merges the stored object with `DEFAULT_PREFERENCES`, so missing fields always have a value.

### Health profile

```js
getHealthProfile()          → Promise<HealthProfile>
saveHealthProfile(partial)  → Promise<void>    // partial: any subset of HealthProfile fields
clearHealthProfile()        → Promise<void>    // removes the healthProfile key entirely
```

`saveHealthProfile` always sets `updatedAt` to the current time.

### Bulk operations

```js
getAllData()                 → Promise<{ cycleEntries, symptomLogs }>
clearAllData()              → Promise<void>    // removes ALL four storage keys
```

`getAllData` is used by the data export function. It returns cycle and symptom data only (not preferences or health profile).

`clearAllData` removes all four keys: `cycleEntries`, `symptomLogs`, `userPreferences`, `healthProfile`.

---

## Encryption Integration Points

Each save function contains this comment marking where encryption should be added:

```js
// ENCRYPT BEFORE WRITE
```

Each get function contains:

```js
// DECRYPT AFTER READ
```

The fields that should be encrypted are:
- `CycleEntry.notes`
- `SymptomLog.notes`
- `HealthProfile.heightCm`
- `HealthProfile.weightKg`

The structured numeric fields (dates, severity scores, mood values) are stored as plain text.

**Current status:** The encryption service (`encryptionService.js`) and passphrase UI (`PassphraseGate.jsx`) are built, but the calls at these integration points have not yet been added. See [integration-guide.md](integration-guide.md) for the remaining wiring steps.

> ⚠️ `encryptionService.js` is currently saved as `encryptionService.html` — it must be renamed before it can be imported.

---

## Height and Weight Unit Conversion

Unit conversion is handled entirely in `src/components/settings/HealthProfileSection.jsx`. The conversion functions are:

**Height cm → ft/in:**
```js
totalInches = cm / 2.54
ft      = Math.floor(totalInches / 12)
inches  = Math.round((totalInches % 12) * 10) / 10
```

**Height ft/in → cm:**
```js
cm = Math.round((ft * 12 + inches) * 2.54 * 10) / 10
```

**Weight kg → lb:**
```js
lb = Math.round(kg * 2.20462 * 10) / 10
```

**Weight lb → kg:**
```js
kg = Math.round(lb / 2.20462 * 10) / 10
```

Conversions are performed on the display values only. The canonical metric values in storage are never affected by toggling the unit display.

---

## Data Export

**Triggered by:** "Export" button in Settings → Your data.
**File:** `src/pages/SettingsPage.jsx` → `handleExport()`

The export:
1. Calls `getAllData()` → `{ cycleEntries, symptomLogs }`.
2. Wraps in a JSON object with `exportedAt` and a security note.
3. Creates a `Blob` and triggers a browser file download named `cycle-data-YYYY-MM-DD.json`.

**What is not in the export:** `UserPreferences` and `HealthProfile` are not included. Only menstrual cycle and symptom records are exported.

**Limitation:** Exported files are not encrypted. They contain plain-text health data and should be stored securely by the user.

---

## Data Deletion

**Triggered by:** "Delete all" button in Settings → Your data (requires confirmation).
**File:** `src/pages/SettingsPage.jsx` → `handleDeleteConfirmed()`

The deletion:
1. Calls `clearAllData()` which removes all four localForage keys.
2. Resets `prefs` and `profile` state to defaults.
3. Shows a confirmation flash message.

**Limitations:**
- Deletion removes data from IndexedDB. It is **not a forensic erasure**. Residual data may persist in browser caches, memory, or on-disk sectors.
- Exported files remain on the user's device and are not affected.
- Browser-level storage clearing or device loss can cause unrecoverable data loss at any time.

---

## Synthetic Test Data

**File:** `src/data/syntheticData.js`

This file is imported dynamically and is **excluded from production builds**. It is only available when `import.meta.env.DEV === true`.

The `loadSyntheticData()` function:
1. Calls `clearAllData()` to remove any existing records.
2. Inserts 12 months of fake cycle entries with cycle lengths 24–33 days.
3. Inserts ~45 symptom log entries at two-day intervals for the most recent 90 days.

It is accessible via the "Load demo data" button in Settings (dev builds only), or by calling `loadSyntheticData()` in the browser console.
