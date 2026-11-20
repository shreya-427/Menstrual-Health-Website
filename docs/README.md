# Menstrual Health Website — Documentation

This is the technical documentation index for the menstrual health website. The site is a privacy-first, browser-based application built with React and Vite.

## Quick Navigation

| Document | Contents |
|---|---|
| [architecture.md](architecture.md) | File structure, routing, data flow, component map |
| [features.md](features.md) | All six pages and their features explained |
| [prediction-engine.md](prediction-engine.md) | Statistical cycle prediction algorithm in detail |
| [data-storage.md](data-storage.md) | Data schemas, storage service API, export and deletion |
| [integration-guide.md](integration-guide.md) | Security and AI backend integration instructions |
| [backend.md](backend.md) | Backend server, three-agent pipeline, API contract, dev tools |

---

## Project Purpose

A web-based menstrual health tracker that lets users log periods and symptoms, view statistical cycle predictions, read educational health content, and interact with an AI health assistant. All personal health data is stored locally in the user's browser — nothing is transmitted to a server automatically.

---

## Main Features

- **Dashboard** — current cycle day, estimated phase, predicted next period, summary statistics.
- **Calendar** — interactive monthly calendar with recorded period days, predicted period days, and symptom indicators.
- **Log** — period start/end date entry and daily symptom logging (flow, cramps, mood, energy, notes).
- **Insights** — cycle length history chart, symptom frequency chart, text summary of cycle patterns.
- **Education** — browsable health topic library and AI-powered chatbot (currently using a mock response; real IBM watsonx connection pending).
- **Settings** — theme switching, personal health profile, AI consent, data export, and data deletion.

---

## Technology Stack

### Frontend

| Technology | Version | Role |
|---|---|---|
| React | 18.3.1 | UI framework |
| Vite | 5.4.x | Build tool and dev server |
| React Router | 6.26.x | Client-side routing |
| Tailwind CSS | 3.4.x | Utility-first styling |
| localForage | 1.10.x | IndexedDB abstraction for local storage |
| date-fns | 3.6.x | Date arithmetic |
| Recharts | 2.12.x | Statistical charts on Insights page |
| react-markdown | 10.1.x | Renders health topic article content |

No backend framework, database, or server is used for health data. The only backend interaction is the AI chat feature.

### Backend

| Technology | Version | Role |
|---|---|---|
| Python | 3.10+ | Language |
| FastAPI | 0.110+ | HTTP framework |
| Uvicorn | 0.29+ | ASGI server |
| OpenAI SDK | 1.30+ | LLM client (Ollama-compatible) |
| Ollama | — | Local LLM runtime (llama3.2 model) |

The backend currently uses Ollama locally. It is not yet connected to IBM watsonx. See [backend.md](backend.md) for setup instructions.

---

## Installation and Running Locally

### Prerequisites

- Node.js LTS (v20 or later) — download from [nodejs.org](https://nodejs.org)
- Git

### Steps

```bash
# Clone the repository
git clone <repo-url>
cd Menstrual-Health-App/frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Opens at http://localhost:5173

# Production build
npm run build
```

**Windows note:** If `npm` is not recognized after installation, use the full path:
```powershell
cmd /c "set PATH=C:\Program Files\nodejs;%PATH% && npm run dev"
```

### Environment Variables

Copy `frontend/.env.example` to `frontend/.env`. The only variable is:

```
VITE_BACKEND_URL=http://localhost:8000
```

This is used by the AI chat service. It has no effect until the real backend is connected (see [integration-guide.md](integration-guide.md)).

---

## Known Limitations

| Limitation | Detail |
|---|---|
| **Encryption not wired up** | `encryptionService.js` and `PassphraseGate.jsx` are built but not yet connected to the app. All health data in IndexedDB is currently stored as plain text. See [integration-guide.md](integration-guide.md). |
| **`encryptionService.html` filename bug** | The encryption service file has the wrong extension (`.html` instead of `.js`). It must be renamed before it can be imported. |
| **AI chat is mocked** | The chatbot returns a canned placeholder response. The backend server and agents are built (using Ollama locally), but the frontend mock has not been swapped to the real connection yet. |
| **Educational content is placeholder** | The health topic articles were written as representative examples. They have not been formally reviewed by a medical professional. |
| **No server backup** | All data lives in the browser. Clearing browser storage or losing the device means permanent data loss. |
| **Prediction not clinically validated** | The statistical algorithm has not been validated against clinical data. It is a transparent mathematical model, not a medical prediction tool. |
