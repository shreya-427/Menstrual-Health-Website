# Integration Guide

This document tells the security teammate and the AI teammate exactly which files to modify, which functions to change, and what contracts must be preserved.

Do not modify any file not listed in this document unless you have a specific reason.

---

## Part 1 — Security Integration

### Overview

The security implementation adds passphrase-derived encryption to the storage layer. The goal is to encrypt sensitive fields (free-text notes, height, weight) before writing to IndexedDB, and decrypt them after reading. **No UI component changes are needed** — all encryption lives inside `storageService.js`.

### Prerequisites

- Familiarity with the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) (built into every modern browser — no library needed).
- Read [data-storage.md](data-storage.md) first to understand the storage schemas.

### Step 1 — Create `src/services/encryptionService.js`

This new file implements three functions:

```js
// Derive an AES-GCM key from a user passphrase using PBKDF2
async function deriveKey(passphrase, salt)
  // passphrase: string
  // salt: Uint8Array (stored in UserPreferences.encryptionSalt)
  // returns: CryptoKey

// Encrypt a string field
async function encrypt(plaintext, key)
  // plaintext: string
  // key: CryptoKey
  // returns: string (base64-encoded ciphertext + IV)

// Decrypt a string field
async function decrypt(ciphertext, key)
  // ciphertext: string (base64-encoded ciphertext + IV)
  // key: CryptoKey
  // returns: string
  // throws if key is wrong or ciphertext is corrupt
```

Use `window.crypto.subtle` exclusively. Recommended algorithm: AES-GCM with a random IV per encryption call (128-bit or 256-bit key, PBKDF2 iterations ≥ 300,000).

### Step 2 — Add passphrase storage to `UserPreferences`

Update `DEFAULT_PREFERENCES` in `src/services/storageService.js`:

```js
const DEFAULT_PREFERENCES = {
  aiConsentGranted:  false,
  themePreference:   'light',
  passphraseSet:     false,   // ADD THIS
  encryptionSalt:    null,    // ADD THIS — base64 Uint8Array
}
```

### Step 3 — Add a passphrase prompt to `src/App.jsx`

On app load, check `getPreferences().passphraseSet`. If `true`, show a passphrase prompt modal before rendering any page content. Call `deriveKey(passphrase, salt)` and store the resulting `CryptoKey` in a React context:

```js
// Create src/contexts/EncryptionContext.js
export const EncryptionContext = createContext(null)
// Provider value: { key: CryptoKey | null }
```

Wrap the router in `<EncryptionContext.Provider value={{ key }}>` in `App.jsx`. If the user dismisses the prompt without entering a passphrase, `key` is `null` — encrypted fields will be unreadable that session, displayed as a locked indicator.

### Step 4 — Add encryption at the marked points in `storageService.js`

Every save and get function already contains integration comments:

```js
// ENCRYPT BEFORE WRITE   ← add:  field = await encrypt(field, key)
// DECRYPT AFTER READ     ← add:  field = await decrypt(field, key)
```

Import `encrypt` and `decrypt` from `encryptionService.js`. Import the session key from `EncryptionContext`. Apply encryption to:

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

### Step 5 — Add passphrase management UI to `src/pages/SettingsPage.jsx`

Add a passphrase setup/change/clear UI inside the existing "Privacy & security" card. The card currently shows a placeholder notice — replace or supplement that notice with your controls.

The passphrase management component should:
- Allow setting a passphrase for the first time (generate a random salt, store in `UserPreferences`).
- Allow changing the passphrase (re-derive key with new passphrase, re-encrypt all notes).
- Allow clearing the passphrase (decrypt all notes, remove salt, set `passphraseSet: false`).
- Show a clear warning that a lost passphrase means encrypted notes are permanently unrecoverable.

### What the security teammate must not change

| File | Constraint |
|---|---|
| All `storageService.js` function signatures | Must remain identical — hooks and pages depend on them |
| All page and component files | Should not need changes |
| `predictionEngine.js` | Must not be touched |
| `aiService.js` | Must not be touched |

### Existing security limitations to document

When encryption is active, update the security notices in `LogPage.jsx` and `SettingsPage.jsx` to reflect the actual state. Currently they say:

> *"Security features are not yet active. All stored data is currently unencrypted."*

Replace this with an accurate description of what is and is not encrypted once encryption is implemented.

---

## Part 2 — AI Integration

### Overview

The AI chatbot UI is complete. Connecting the real IBM watsonx backend requires:
1. Building and deploying the Python/FastAPI backend.
2. Replacing a single mock function body in the frontend.

The chat UI, consent flow, error handling, source citation display, and disclaimer rendering all work already.

### The frontend AI service

**File:** `src/services/aiService.js`  
**Export:** `async function askQuestion(question)`

The function currently contains a mock implementation that returns a canned response after a 1-second delay. The entire real integration is a replacement of this body.

### Step 1 — Build and deploy the FastAPI backend

The backend does not yet exist. Create a Python/FastAPI application with one route:

**`POST /api/ask`**

Request body:
```json
{ "question": "string" }
```

Response (HTTP 200):
```json
{
  "answer": "string",
  "sources": [
    { "title": "string", "url": "string" }
  ]
}
```

`sources` may be an empty array. The backend must:
- Hold IBM API credentials in server-side environment variables — never in the frontend.
- Validate that `question` is non-empty and does not exceed 500 characters.
- Implement rate limiting (recommended: 10 requests per IP per minute).
- Not log the content of user questions.
- Return appropriate HTTP error status codes on failure (400 for validation, 429 for rate limit, 5xx for server errors).

The frontend maps error status codes to user-facing messages in `ChatPanel.jsx`:

| Status | Shown to user |
|---|---|
| 400 | "Your question could not be processed. Please rephrase and try again." |
| 429 | "Too many requests. Please wait a moment before asking another question." |
| 5xx | "The assistant is temporarily unavailable. Please try again later." |
| Network failure | "Could not reach the assistant. Check your connection and try again." |

### Step 2 — Set the backend URL

Create `frontend/.env` from `frontend/.env.example`:

```
VITE_BACKEND_URL=https://your-backend.ibmcloud.com
```

This value is embedded in the frontend build. It is a configuration value, not a secret.

### Step 3 — Replace the mock in `aiService.js`

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

### Step 4 — Replace the health topic content

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
  src/services/storageService.js          ← security: add encrypt/decrypt calls
  src/pages/SettingsPage.jsx              ← security: add passphrase UI
  src/services/aiService.js               ← AI: replace mock with fetch()
  src/data/healthTopics.js               ← AI/content: replace with reviewed topics
  frontend/.env                           ← AI: set VITE_BACKEND_URL

Files to create:
  src/services/encryptionService.js       ← security: PBKDF2 + AES-GCM
  src/contexts/EncryptionContext.js       ← security: session key context
  backend/                               ← AI: new Python FastAPI application

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
