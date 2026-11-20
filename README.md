# Menstrual Health App

A privacy-first web application for menstrual cycle tracking and health education. Users log periods and symptoms locally in their browser, receive statistical cycle predictions, browse health topics, and can interact with an AI health assistant. All personal health data is stored in the browser — nothing is transmitted to a server automatically.

Built for the IBM Challenge by a university student team.

---

## Features

- **Dashboard** — current cycle day, estimated phase, predicted next period, cycle timeline
- **Calendar** — monthly view with period history, symptom days, and predicted period window
- **Log** — period entry (start/end/notes) and daily symptom logging (flow, cramps, mood, energy, more)
- **Insights** — cycle length history chart, symptom frequency chart, pattern summary
- **Education** — browsable health topic library and AI-powered chat assistant (consent-gated)
- **Settings** — theme, personal health profile, AI consent, data export, data deletion

---

## Project Structure

```
Menstrual-Health-App/
├── frontend/        React/Vite web application
├── backend/         Python/FastAPI AI backend (Ollama + three-agent pipeline)
└── docs/            Technical documentation
```

---

## Quick Start

### Frontend

Requires Node.js LTS (v20+).

```powershell
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

Copy `frontend/.env.example` to `frontend/.env` before connecting the backend.

### Backend

Requires Python 3.10+ and [Ollama](https://ollama.com) with the `llama3.2` model.

```powershell
ollama pull llama3.2
ollama serve

cd backend
pip install -r requirements.txt
py -3.10 -m uvicorn server:app --port 8000 --reload
```

**Windows note:** If `npm` is not on your PATH after Node.js installation:
```powershell
cmd /c "set PATH=C:\Program Files\nodejs;%PATH% && npm run dev"
```

---

## Documentation

Full technical documentation is in the [`docs/`](docs/) folder:

| Document | Contents |
|---|---|
| [docs/README.md](docs/README.md) | Documentation index, tech stack, installation, known limitations |
| [docs/architecture.md](docs/architecture.md) | File structure, routing, data flow, component map |
| [docs/features.md](docs/features.md) | All six pages and their features in detail |
| [docs/prediction-engine.md](docs/prediction-engine.md) | Statistical cycle prediction algorithm |
| [docs/data-storage.md](docs/data-storage.md) | Data schemas, storage API, export, deletion |
| [docs/backend.md](docs/backend.md) | Backend server, agents, API contract, dev tools |
| [docs/integration-guide.md](docs/integration-guide.md) | Remaining integration work (encryption wiring, AI connection) |

For teammate integration: see [`frontend/INTEGRATION.md`](frontend/INTEGRATION.md).

---

## Status

| Component | Status |
|---|---|
| Frontend (all 6 pages) | ✅ Complete |
| Prediction engine | ✅ Complete |
| Local data storage | ✅ Complete |
| Encryption service + passphrase UI | ✅ Built — needs wiring into App.jsx |
| Backend (FastAPI + 3 agents) | ✅ Built — using Ollama locally |
| AI chat (frontend) | ✅ Built — currently using mock response |
| IBM watsonx connection | 🔲 Not yet connected |
| Medical content review | 🔲 Placeholder topics only |

> ⚠️ **Known issue:** `frontend/src/services/encryptionService.html` must be renamed to `encryptionService.js` before encryption can be activated. See [docs/integration-guide.md](docs/integration-guide.md).
