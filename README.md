# MeteoNova (WeatherGPT) — Generative Geospatial Digital Twin

**MeteoNova** is an Agentic Geospatial AI Platform built for the Ministry of Earth Sciences (MoES) and India Meteorological Department (IMD) Smart India Hackathon problem statement.

Rather than acting as a simple text chatbot, MeteoNova acts as a **Spatial AI Agent** that commands an interactive **MapLibre GL JS** map, triggering WebGL visualizations (wind vector particles, 3D flood risk extrusions, thermal heatmaps, forecast scrubbers, and interactive charts).

---

## 🏗 System Architecture & Stack

- **LLM Engine:** Groq (Llama-3 70B ultra-fast inference for tool calling)
- **Base Map:** MapTiler Dark Vector Tiles + MapLibre GL JS + Deck.gl WebGL
- **Voice Stack:** ElevenLabs TTS (Multilingual audio narration) + Web Speech API (Browser native STT)
- **Primary Data Source:** Open-Meteo API (Free GFS/ECMWF forecasts & historical climate data)
- **Frontend:** Next.js 14+ (App Router, TypeScript, Glassmorphism CSS design system, Zustand)
- **Backend:** FastAPI Python (WebSocket streaming, Pydantic schemas, Multi-Agent Tool Router)
- **Data Engine:** SQLite + GeoJSON Builders + Realistic Mock Alert fixtures

---

## 🚀 Quickstart Guide

### 1. Backend Setup (FastAPI)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Run backend API & WebSocket server
python -m app.main
```
The FastAPI backend will start at `http://localhost:8000`.

### 2. Frontend Setup (Next.js)

```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🔑 Environment Variables (`.env`)

Create a `.env` file in the root or `backend/` directory:

```env
GROQ_API_KEY=your_groq_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
MAPTILER_API_KEY=your_maptiler_api_key_here
PORT=8000
```
