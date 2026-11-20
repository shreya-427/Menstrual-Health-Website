# Integration Guide

This document tells the security teammate and the AI teammate exactly which files to modify, which functions to change, and what contracts must be preserved.

Do not modify any file not listed in this document unless you have a specific reason.

---

## Part 1 — Security Integration

### Overview

The encryption layer is **already implemented**. The following files exist and are complete:

| File | Status |
|---|---|
| `src/services/encryptionService.html` | ✅ Complete — but has wrong file extension (see below) |
| `src/components/PassphraseGate.jsx` | ✅ Complete — full-screen passphrase UI |

> ⚠️ **File extension bug:** `src/services/encryptionService.html` must be **renamed to `encryptionService.js`** before anything will work. `PassphraseGate.jsx` imports it as `'../services/encryptionService.js'` — this import will fail until the file is renamed. No code changes are needed; only the filename.

### What still needs to be done

The encryption service and passphrase UI are built, but they are **not yet wired into the app**. The following connections remain:

1. **Connect `PassphraseGate` to `App.jsx`** — the gate is not currently rendered.
2. **Add the session key to `EncryptionContext`** — so `storageService.js` can access it.
3. **Call encrypt/decrypt in `storageService.js`** — at the marked integration points.
4. **Add passphrase management UI to `SettingsPage.jsx`** — for change/clear passphrase.

---

### `encryptionService.js` API Reference

**File:** `src/services/encryptionService.html` → rename to `encryptionService.js`

#### `setupPassphrase(passphrase)`

Called the first time a user creates a passphrase. Derives a key via PBKDF2, stores the random salt in IndexedDB, encrypts a sentinel value to verify future unlock attempts, and returns the `CryptoKey` for immediate use.

```js
const key = await setupPassphrase('my-passphrase')
// → CryptoKey (AES-GCM, 256-bit, non-extractable)
```

#### `unlockWithPassphrase(passphrase)`

For returning users. Reads the stored salt, derives the key, and verifies it by decrypting the sentinel. Returns the `CryptoKey` on success.

```js
const key = await unlockWithPassphrase('my-passphrase')
// → CryptoKey
// throws Error('wrong_passphrase') if passphrase is incorrect
// throws Error('not_set_up') if no passphrase has been set up yet
```

#### `isPassphraseSet()`

Returns `true` if a passphrase salt exists in IndexedDB (i.e., the user has previously set up encryption).

```js
const hasPassphrase = await isPassphraseSet()
// → boolean
```

#### `changePassphrase(currentKey, newPassphrase, reEncryptFn)`

Re-derives a new key from `newPassphrase`, calls `reEncryptFn(oldKey, newKey)` so the caller can re-encrypt all stored data, then updates the stored salt and sentinel.

```js
const newKey = await changePassphrase(currentKey, 'new-passphrase', async (old, next) => {
  // re-encrypt all stored notes fields with old key → new key
})
// → CryptoKey (the new key)
```

#### `encrypt(plaintext, key)`

Encrypts a string (or any JSON-serialisable value) with AES-GCM. Generates a fresh random 12-byte IV per call.

```js
const cipherObj = await encrypt('my notes text', key)
// → { iv: 'base64...', data: 'base64...' }
```

#### `decrypt(cipherObj, key)`

Decrypts a `{ iv, data }` object back to the original string.

```js
const plaintext = await decrypt(cipherObj, key)
// → 'my notes text'
// throws on wrong key or corrupt data
```

---

### Cryptographic parameters

| Parameter | Value |
|---|---|
| Key derivation | PBKDF2 with SHA-256 |
| Iterations | 310,000 (OWASP 2023 recommendation) |
| Salt | 16 bytes, random, stored in IndexedDB under `__enc_salt__` |
| Key length | 256-bit AES-GCM |
| IV | 12 bytes, random per encryption call |
| Key extractability | Non-extractable (`extractable: false`) |
| Passphrase verification | Sentinel value (`'menstrual-health-app-ok'`) encrypted on setup and decrypted on unlock |

---

### Step 1 — Rename the file

```powershell
Rename-Item frontend\src\services\encryptionService.html encryptionService.js
```

---

### Step 2 — Create `src/contexts/EncryptionContext.js`

```js
import { createContext } from 'react'
export const EncryptionContext = createContext(null)
// Provider value: { key: CryptoKey | null }
```

---

### Step 3 — Wire `PassphraseGate` into `App.jsx`

On app load, check `isPassphraseSet()`. If true, render `PassphraseGate` in `'unlock'` mode. If false (first run), render it in `'setup'` mode. Once the user provides the passphrase, call the appropriate function and store the resulting `CryptoKey` in `EncryptionContext`.

```jsx
import PassphraseGate from './components/PassphraseGate'
import { isPassphraseSet } from './services/encryptionService'
import { EncryptionContext } from './contexts/EncryptionContext'

// In App:
// 1. On mount, check isPassphraseSet() → set mode to 'setup' or 'unlock'
// 2. Show PassphraseGate until key is provided
// 3. Store key in EncryptionContext.Provider value
// 4. Render the router only after key is available
```

The `onWipe` prop of `PassphraseGate` (unlock mode) should call `clearAllData()` from `storageService.js`.

---

### Step 4 — Add encryption calls in `storageService.js`

Each save and get function already has integration comments:

```js
// ENCRYPT BEFORE WRITE   ← add:  field = await encrypt(field, key)
// DECRYPT AFTER READ     ← add:  field = await decrypt(field, key)
```

Import `encrypt` and `decrypt` from `encryptionService.js`. Read the session key from `EncryptionContext`. Apply to these fields:

| Function | Field to encrypt/decrypt |
|---|---|
| `saveCycleEntry` | `entry.notes` |
| `updateCycleEntry` | `updated.notes` |
| `getCycleEntries` | `entry.notes` on each item |
| `saveSymptomLog` | `log.notes` |
| `updateSymptomLog` | `updated.notes` |
| `getSymptomLogs` | `log.notes` on each item |
| `saveHealthProfile` | `partial.heightCm`, `partial.weightKg` |
| `getHealthProfile` | `profile.heightCm`, `profile.weightKg` |

---

### Step 5 — Add passphrase management UI to `SettingsPage.jsx`

The existing "Privacy & security" card shows a placeholder notice. Replace it with real controls:

- **If no passphrase is set:** show a "Set up encryption" button that opens `PassphraseGate` in `'setup'` mode (can be rendered inline or as a modal).
- **If a passphrase is set:** show the `ChangePassphraseForm` exported from `PassphraseGate.jsx`.
- Always show a warning: *"A lost passphrase cannot be recovered. Encrypted notes will be permanently unreadable."*

The `ChangePassphraseForm` calls `onDone({ currentPassphrase, newPassphrase })`. The Settings page handler should call `changePassphrase(currentKey, newPassphrase, reEncryptFn)` from `encryptionService.js`.

---

### Step 6 — Update the security notices

Once encryption is active, update the yellow banners in `LogPage.jsx` and `SettingsPage.jsx`. They currently say:

> *"Security features are not yet active. All stored data is currently unencrypted."*

Replace with an accurate description of what is encrypted (notes, height, weight) and what is not (dates, scores, booleans).

---

### What the security teammate must not change

| File | Constraint |
|---|---|
| All `storageService.js` function signatures | Must remain identical — hooks and pages depend on them |
| All page and component files (except `SettingsPage.jsx` for the passphrase UI) | Should not need changes |
| `predictionEngine.js` | Must not be touched |
| `aiService.js` | Must not be touched |

---

## Part 2 — AI Integration

### Overview

The AI backend is **already built and working**. The following exist and are complete:

| File | Status |
|---|---|
| `backend/server.py` | ✅ Complete — FastAPI server with rate limiting, CORS, retry logic |
| `backend/agents/supervisor_agent.py` | ✅ Complete — multi-turn routing with follow-up detection |
| `backend/agents/health_agent.py` | ✅ Complete — ~900-line menstrual health knowledge base |
| `backend/agents/policy_agent.py` | ✅ Complete — privacy/data-policy question handler |

See [backend.md](backend.md) for full backend documentation.

### What still needs to be done

The backend works against **Ollama** (a local LLM runtime). To connect it to IBM watsonx:
1. Swap the LLM client base URL and credentials in `server.py` and the agent files.
2. Set `VITE_BACKEND_URL` in `frontend/.env` to point to the deployed backend.
3. Replace the mock in `src/services/aiService.js` with a real fetch call.

---

### The frontend AI service

**File:** `src/services/aiService.js`
**Export:** `async function askQuestion(question)`

The function currently contains a mock implementation that returns a canned response after a 1-second delay. The entire real integration is a replacement of this body.

### Step 1 — Set the backend URL

Create `frontend/.env` from `frontend/.env.example`:

```
VITE_BACKEND_URL=http://localhost:8000
```

This value is embedded in the frontend build. It is a configuration value, not a secret.

### Step 2 — Replace the mock in `aiService.js`

In `src/services/aiService.js`, find the mock block (clearly labeled `// ── Mock implementation`) and replace it with:

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

**That is the entire frontend change.** No component files need to be modified.

### Step 3 — Replace the health topic content

**File:** `src/data/healthTopics.js`

This file exports `HEALTH_TOPICS` (an array) and `CATEGORIES` (a derived array of unique category strings). Replace the placeholder topics with medically reviewed content. Each topic must have this shape:

```js
{
  id:          string,    // unique identifier, kebab-case
  category:    string,    // groups topics in the filter buttons
  title:       string,
  summary:     string,    // 1–2 sentence overview shown on the card
  content:     string,    // full article text; paragraphs separated by \n\n
  sourceTitle: string,    // name of the source document or webpage
  sourceUrl:   string,    // direct URL (verify it works)
  sourceOrg:   string,    // issuing organization
}
```

### How consent is checked

Before `askQuestion` is called, `ConsentGate.jsx` checks whether `aiConsentGranted` is `true` in `UserPreferences`. If it is `false`, the chat UI is not shown — only a disabled stub with a link to Settings. The consent is managed in `SettingsPage.jsx`.

`aiService.js` itself does not check consent — that is the responsibility of `ConsentGate`. Do not add a consent check inside `askQuestion`.

### What the AI teammate must not change

| File | Constraint |
|---|---|
| `askQuestion` function signature | Must remain `async function askQuestion(question)` |
| `ChatPanel.jsx` | Should not need changes |
| `ConsentGate.jsx` | Should not need changes |
| `storageService.js` | Must not be touched |
| `predictionEngine.js` | Must not be touched |

---

## Quick Reference — File Map

```
Files to modify:
  src/services/encryptionService.html     ← RENAME TO encryptionService.js (no code changes needed)
  src/App.jsx                             ← security: wire PassphraseGate on startup
  src/services/storageService.js          ← security: add encrypt/decrypt calls
  src/pages/SettingsPage.jsx              ← security: add passphrase management UI
  src/services/aiService.js               ← AI: replace mock with fetch()
  src/data/healthTopics.js               ← AI/content: replace with reviewed topics
  frontend/.env                           ← AI: set VITE_BACKEND_URL

Files to create:
  src/contexts/EncryptionContext.js       ← security: session key context

Files already built (no changes needed unless connecting to IBM watsonx):
  src/components/PassphraseGate.jsx       ← full-screen passphrase UI
  backend/server.py                       ← FastAPI HTTP bridge
  backend/agents/supervisor_agent.py      ← routing agent
  backend/agents/health_agent.py          ← health knowledge base
  backend/agents/policy_agent.py          ← policy knowledge base

Files to leave unchanged:
  src/logic/predictionEngine.js
  src/components/** (all)
  src/hooks/**
  src/pages/DashboardPage.jsx
  src/pages/CalendarPage.jsx
  src/pages/LogPage.jsx
  src/pages/InsightsPage.jsx
  src/pages/EducationPage.jsx
  src/components/education/ChatPanel.jsx
  src/components/education/ConsentGate.jsx
```
