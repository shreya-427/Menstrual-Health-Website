# Frontend Integration Guide

This document is for teammates connecting backend services to the frontend.
The frontend is complete. Two files act as integration seams — you only need to modify those files.

---

## 1. Security Teammate — Adding Encryption

**File to modify:** `src/services/storageService.js`

All health data (cycle dates, symptom scores, notes) is stored through this single module.
No UI component calls localForage directly. This means you can add encryption entirely
inside `storageService.js` without touching any page or component.

### Steps

1. Create `src/services/encryptionService.js` with three functions:
   ```js
   deriveKey(passphrase, salt)  // PBKDF2 → CryptoKey
   encrypt(plaintext, key)      // AES-GCM → ciphertext string
   decrypt(ciphertext, key)     // AES-GCM → plaintext string
   ```
   Use only `window.crypto.subtle` — no third-party libraries.

2. Add a passphrase prompt to `src/App.jsx`. On app load, if `UserPreferences.passphraseSet` is true,
   show a modal asking for the passphrase. Call `deriveKey(passphrase, salt)` and store the
   resulting `CryptoKey` in a React context:
   ```jsx
   // src/contexts/EncryptionContext.js
   export const EncryptionContext = createContext(null)
   // provide: { key: CryptoKey | null }
   ```

3. In `storageService.js`, import `encrypt` and `decrypt` from `encryptionService.js` and
   call them at the marked comments:
   ```js
   // ENCRYPT BEFORE WRITE  ← add:  entry.notes = await encrypt(entry.notes, key)
   // DECRYPT AFTER READ    ← add:  entry.notes = await decrypt(entry.notes, key)
   ```
   The comments appear in every `save*` and `get*` function.

4. Add passphrase management UI to `src/pages/SettingsPage.jsx` in the
   existing "Privacy & security" card (currently shows the placeholder notice).

### What to preserve
- All function signatures in `storageService.js` must stay identical.
- No UI component should import from `encryptionService.js` directly.
- The `UserPreferences` object in storage gains two new fields:
  ```js
  passphraseSet: boolean
  encryptionSalt: string  // base64-encoded Uint8Array
  ```
  Add these to the `DEFAULT_PREFERENCES` object in `storageService.js`.

---

## 2. AI Teammate — Connecting the Real Backend

**File to modify:** `src/services/aiService.js`

The entire chat UI (consent gate, message bubbles, error handling, disclaimers) is already built.
It depends only on the `askQuestion` export. You replace the mock body with a real fetch call.

### Steps

1. Set `VITE_BACKEND_URL` in `frontend/.env`:
   ```
   VITE_BACKEND_URL=https://your-backend.ibmcloud.com
   ```

2. In `src/services/aiService.js`, replace the mock implementation block (clearly marked
   `// ── Mock implementation`) with:
   ```js
   const res = await fetch(
     `${import.meta.env.VITE_BACKEND_URL}/api/ask`,
     {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ question: trimmed }),
     }
   )
   if (!res.ok) throw new Error(`HTTP ${res.status}`)
   return await res.json()
   ```

3. Your backend `POST /api/ask` must return this exact shape:
   ```json
   {
     "answer": "string",
     "sources": [
       { "title": "string", "url": "string" }
     ]
   }
   ```
   `sources` may be an empty array. On error, return a standard HTTP status (400, 429, 5xx).
   The frontend maps status codes to user-friendly messages automatically.

4. Replace `src/data/healthTopics.js` with your medically reviewed content, keeping the
   same object shape per topic:
   ```js
   {
     id, category, title, summary, content,
     sourceTitle, sourceUrl, sourceOrg
   }
   ```

### What to preserve
- The `askQuestion(question)` function signature must not change.
- The function must throw (not return an error object) on failure —
  `ChatPanel` wraps every call in `try/catch`.
- `MAX_QUESTION_LENGTH` (500 chars) is enforced before the fetch; keep it.

---

## 3. Data Schemas (for reference)

```js
// CycleEntry
{
  id: string,           // crypto.randomUUID()
  startDate: string,    // ISO date "2024-03-01"
  endDate: string|null,
  notes: string|null,   // ENCRYPT THIS FIELD
  createdAt: string,    // ISO datetime
  modifiedAt: string
}

// SymptomLog
{
  id: string,
  date: string,                   // ISO date
  flowIntensity: number(1–5)|null,
  crampSeverity: number(0–5)|null,
  mood: number(1–5)|null,
  energyLevel: number(1–5)|null,
  headache: boolean,
  bloating: boolean,
  additionalSymptoms: string[],
  notes: string|null,             // ENCRYPT THIS FIELD
  cycleEntryId: string|null,
  createdAt: string,
  modifiedAt: string
}

// UserPreferences
{
  aiConsentGranted: boolean,
  themePreference: 'light'|'dark'
  // Security teammate adds: passphraseSet, encryptionSalt
}
```

---

## 4. Running the Frontend

```powershell
cd frontend
# Windows — Node is not on PATH by default after install:
cmd /c "set PATH=C:\Program Files\nodejs;%PATH% && npm install"
cmd /c "set PATH=C:\Program Files\nodejs;%PATH% && npm run dev"
# Open http://localhost:5173
```

To load test data: open Settings → "Load demo data" (visible in dev mode only).

---

## 5. File Map

```
frontend/src/
├── services/
│   ├── storageService.js   ← Security seam (encryption goes here)
│   └── aiService.js        ← AI seam (replace mock with fetch)
├── data/
│   ├── healthTopics.js     ← Replace with real medical content
│   └── syntheticData.js    ← Dev only; never commit real data
├── logic/
│   └── predictionEngine.js ← Statistical algorithm (no changes needed)
└── pages/
    └── SettingsPage.jsx    ← Add PassphraseSetup UI in security card
```
