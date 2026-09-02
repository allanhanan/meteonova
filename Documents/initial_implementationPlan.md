# MeteoNova — MVP Implementation Plan

## Goal

Create a fully scaffolded, runnable prototype of the MeteoNova (WeatherGPT) platform with:
- **Minimal data** — Open-Meteo (free, no key) as the primary data source. Alerts are **mock/fake** for demo purposes.
- **Maximum presentation impact** — All visualization archetypes implemented at least as functional demos with mock or live data.
- **Three-team parallel development** — Frontend, Backend, and Data teams can work independently after initial scaffold setup.
- **Groq** for ultra-fast LLM inference, **MapTiler** for base map tiles, **ElevenLabs** for voice TTS.

> [!IMPORTANT]
> This is an **MVP for hackathon presentation**, not a production system. Stubs and mock data are acceptable for features that cannot be live-integrated in the available time. The goal is to demonstrate the complete vision, not to ship production-quality code.

---

## Proposed Changes

### Project Structure

```
meteonova/
├── frontend/                    # Next.js application
│   ├── app/
│   │   ├── layout.tsx           # Root layout with fonts, metadata
│   │   ├── page.tsx             # Main dashboard page
│   │   └── globals.css          # Design system & tokens
│   ├── components/
│   │   ├── map/
│   │   │   ├── MapCanvas.tsx    # MapLibre GL JS core (dynamic import)
│   │   │   ├── WindLayer.tsx    # Wind particle visualization
│   │   │   ├── HeatmapLayer.tsx # Temperature/precipitation heatmap
│   │   │   ├── IsobarLayer.tsx  # Pressure contour overlay
│   │   │   ├── FloodLayer.tsx   # 3D building extrusions
│   │   │   ├── AQILayer.tsx     # Air quality markers
│   │   │   └── AlertLayer.tsx   # Warning zone polygons
│   │   ├── chat/
│   │   │   ├── ChatPanel.tsx    # Chat sidebar with message feed
│   │   │   ├── ChatInput.tsx    # Text + voice input bar
│   │   │   ├── MessageBubble.tsx # Individual message rendering
│   │   │   └── ToolCallCard.tsx # Rendered visualization cards in chat
│   │   ├── controls/
│   │   │   ├── TimelineSlider.tsx  # Forecast timeline scrubber
│   │   │   ├── LayerSelector.tsx   # Toggle map layers
│   │   │   └── LanguageSelector.tsx # Voice language picker
│   │   ├── charts/
│   │   │   ├── ClimateTrend.tsx    # NASA POWER historical chart
│   │   │   ├── SkewTDiagram.tsx    # Atmospheric sounding diagram
│   │   │   ├── AQIBreakdown.tsx    # AQI component bar chart
│   │   │   └── CropAdvisory.tsx    # 7-day farm advisory timeline
│   │   └── ui/
│   │       ├── GlassPanel.tsx      # Glassmorphism container
│   │       ├── LoadingSpinner.tsx   # Loading states
│   │       └── VoiceButton.tsx     # Mic button with animation
│   ├── lib/
│   │   ├── store.ts             # Zustand store (map state, chat, layers)
│   │   ├── websocket.ts         # WebSocket client for backend
│   │   ├── elevenlabs.ts        # ElevenLabs TTS client
│   │   └── types.ts             # Shared TypeScript types
│   ├── public/
│   │   └── mock/                # Mock GeoJSON and wind textures
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.js
│
├── backend/                     # FastAPI application
│   ├── app/
│   │   ├── main.py              # FastAPI app + WebSocket endpoint
│   │   ├── config.py            # Environment config (API keys, URLs)
│   │   ├── agents/
│   │   │   ├── router.py        # LangGraph router agent
│   │   │   ├── agro_agent.py    # Agriculture specialist
│   │   │   ├── disaster_agent.py # Disaster management
│   │   │   ├── aero_agent.py    # Aviation/marine (stub)
│   │   │   └── climate_agent.py # Climate analytics
│   │   ├── tools/
│   │   │   ├── definitions.py   # All tool JSON schemas
│   │   │   ├── map_tools.py     # flyTo, renderLayer, setTimeline
│   │   │   ├── weather_tools.py # fetchForecast, fetchCurrent
│   │   │   └── chart_tools.py   # generateChart, generateAdvisory
│   │   ├── services/
│   │   │   ├── open_meteo.py    # Open-Meteo API client
│   │   │   ├── elevenlabs.py    # ElevenLabs TTS proxy
│   │   │   ├── nasa_power.py    # NASA POWER API client
│   │   │   └── alert_service.py # Mock alert data service
│   │   ├── models/
│   │   │   ├── schemas.py       # Pydantic models for API data
│   │   │   └── tool_schemas.py  # Pydantic models for tool calls
│   │   └── stubs/
│   │       ├── wis2_mqtt.py     # WIS 2.0 MQTT stub
│   │       ├── mosdac.py        # MOSDAC satellite stub
│   │       ├── damini.py        # Lightning network stub
│   │       └── dwr_radar.py     # Doppler radar stub
│   ├── requirements.txt
│   └── Dockerfile
│
├── data/                        # Data processing utilities
│   ├── transformers/
│   │   ├── geojson_builder.py   # Grid → GeoJSON converter
│   │   ├── wind_texture.py      # u/v → PNG texture encoder
│   │   ├── contour_gen.py       # Pressure → isobar contours
│   │   └── alert_parser.py      # CAP XML → GeoJSON polygons
│   ├── mock/
│   │   ├── mock_forecast.json   # Realistic mock forecast data
│   │   ├── mock_wind.json       # Wind vector grid mock
│   │   ├── mock_alerts.json     # Sample CAP alerts
│   │   ├── mock_historical.json # NASA POWER style historical data
│   │   └── india_districts.geojson # India district boundaries
│   ├── scripts/
│   │   ├── seed_mock_data.py    # Generate and seed all mock data
│   │   └── fetch_districts.py   # Download India district GeoJSON
│   └── schemas/
│       └── schema.sql           # SQLite table definitions (lightweight, no PostGIS needed)
│
├── README.md
└── .env.example
```

---

### Frontend Team

#### [NEW] [package.json](file:///home/allan/project/meteonova/frontend/package.json)
Initialize Next.js 14+ with TypeScript. Key dependencies:
- `maplibre-gl` (v4.x) — Map rendering engine
- `@deck.gl/core`, `@deck.gl/layers`, `@deck.gl/mapbox` — Advanced WebGL layers
- `d3` (v7) — Contours, Skew-T, custom charts
- `recharts` — React-friendly chart components
- `zustand` — Lightweight state management
- `@mapbox/mapbox-gl-draw` — Polygon drawing tool (MapLibre compatible fork)
- `three` — 3D rendering (if time permits)

#### [NEW] [globals.css](file:///home/allan/project/meteonova/frontend/app/globals.css)
Design system with CSS custom properties:
- Dark mode as default (meteorological dashboards are always dark)
- Color palette: deep navy (`#0a0e27`), electric blue (`#00d4ff`), amber warnings (`#ff9f43`), danger red (`#ee5a24`)
- Glassmorphism: `backdrop-filter: blur(16px)` panels
- Typography: Inter (UI), JetBrains Mono (data values)
- Smooth transitions on all interactive elements
- Responsive breakpoints: mobile-first with map priority

#### [NEW] [MapCanvas.tsx](file:///home/allan/project/meteonova/frontend/components/map/MapCanvas.tsx)
Core map component:
- `useRef` for map container, `useEffect` for initialization
- Base style: **MapTiler dark vector tiles** (free tier API key)
- Expose `flyTo()`, `addLayer()`, `removeLayer()` methods via Zustand store actions
- Initial view: India centered (`[78.96, 20.59]`, zoom 5, pitch 0)
- Navigation controls, scale bar, attribution
- Dynamic import wrapper in `page.tsx` with `ssr: false`

#### [NEW] [ChatPanel.tsx](file:///home/allan/project/meteonova/frontend/components/chat/ChatPanel.tsx)
Chat sidebar:
- Scrollable message feed with auto-scroll on new messages
- Glassmorphism panel overlaying the right side of the map
- Collapsible on mobile (bottom sheet)
- Renders `MessageBubble` for text and `ToolCallCard` for visualization results
- WebSocket connection to backend for streaming responses

#### [NEW] [TimelineSlider.tsx](file:///home/allan/project/meteonova/frontend/components/controls/TimelineSlider.tsx)
Forecast scrubber:
- Horizontal slider at bottom of map canvas
- Shows hourly timestamps (formatted for Indian locale)
- Play/pause button with speed control (1x, 2x, 4x)
- `requestAnimationFrame` loop for smooth playback
- Emits `onTimeChange(timestamp)` callback to update all active layers

#### [NEW] [store.ts](file:///home/allan/project/meteonova/frontend/lib/store.ts)
Zustand store with slices:
- `mapSlice`: center, zoom, pitch, bearing, activeLayers[]
- `chatSlice`: messages[], isLoading, currentAgent
- `forecastSlice`: currentForecast, timelineData[], currentTimestep
- `uiSlice`: isChatOpen, isDarkMode, selectedLanguage, isVoiceActive

#### [NEW] [websocket.ts](file:///home/allan/project/meteonova/frontend/lib/websocket.ts)
WebSocket client:
- Auto-reconnect with exponential backoff
- Message types: `user_message`, `tool_call`, `narration`, `error`
- Parses incoming `tool_call` messages and dispatches Zustand actions (e.g., `flyTo`, `addLayer`)
- Sends user messages and voice transcriptions to backend

---

### Backend Team

#### [NEW] [main.py](file:///home/allan/project/meteonova/backend/app/main.py)
FastAPI application:
- CORS middleware (allow frontend origin)
- WebSocket endpoint at `/ws/chat`
- REST endpoints: `/api/health`, `/api/forecast/{lat}/{lon}`, `/api/alerts`, `/api/tts`
- Startup event: initialize LangGraph agent
- WebSocket handler: receive message → route to agent → stream tool-calls back

#### [NEW] [router.py](file:///home/allan/project/meteonova/backend/app/agents/router.py)
LangGraph StateGraph:
- **Nodes:** `classify_intent`, `route_to_agent`, `execute_tools`, `format_response`
- **Intent categories:** `weather_current`, `weather_forecast`, `disaster_alert`, `agriculture_advisory`, `aviation_briefing`, `climate_analysis`, `general_question`
- **Routing logic:** Based on classified intent, delegate to the appropriate domain agent
- **State:** Carries conversation history, active location, user preferences

#### [NEW] [definitions.py](file:///home/allan/project/meteonova/backend/app/tools/definitions.py)
Tool schemas (Pydantic models bound to LangChain `@tool` decorator):

```python
# Example tool schemas:
class FlyToLocation(BaseModel):
    lat: float
    lon: float
    zoom: int = 10
    pitch: int = 0
    bearing: int = 0

class RenderMapLayer(BaseModel):
    layer_type: Literal["wind_particles", "heatmap_temp", "heatmap_precip",
                         "pressure_isobars", "flood_extrusion", "aqi_circles",
                         "alert_zones", "satellite"]
    data_source: str
    time_range: Optional[str] = "current"
    opacity: float = 0.8

class GenerateChart(BaseModel):
    chart_type: Literal["climate_trend", "skew_t", "aqi_breakdown", "crop_advisory"]
    location: str
    time_range: Optional[str] = None
```

#### [NEW] [open_meteo.py](file:///home/allan/project/meteonova/backend/app/services/open_meteo.py)
Open-Meteo API client:
- `get_current(lat, lon)` — Current temperature, wind, humidity, pressure
- `get_hourly_forecast(lat, lon, days=7)` — Hourly forecast with all variables
- `get_wind_grid(bounds, resolution)` — Wind u/v components for a bounding box (for particle layer)
- `get_pressure_grid(bounds)` — Sea-level pressure grid (for isobars)
- `get_historical(lat, lon, start_date, end_date)` — Historical weather data
- `get_multi_model(lat, lon, models=["gfs", "ecmwf"])` — Multi-model comparison
- All responses normalized into Pydantic schemas

#### [NEW] [Stubs](file:///home/allan/project/meteonova/backend/app/stubs/)
Non-functional but architecturally complete (demonstrates future integration points):
- `wis2_mqtt.py`: MQTT client class with `connect()`, `subscribe(topic)`, `on_message()` — all log-only
- `mosdac.py`: `fetch_insat3dr_imagery(bounds, channel)` — returns mock PNG URL
- `damini.py`: WebSocket listener class — returns mock lightning GeoJSON
- `dwr_radar.py`: `fetch_reflectivity(radar_id)` — returns mock dBZ grid

#### [NEW] [alert_service.py](file:///home/allan/project/meteonova/backend/app/services/alert_service.py)
Mock alert service:
- Returns hardcoded but realistic weather alerts (cyclone warning for Odisha, heatwave for Rajasthan, heavy rain for Kerala, etc.)
- GeoJSON polygons for affected districts pre-defined
- Demonstrates the full alert UX without requiring live NDMA/CAP feeds

#### [NEW] [elevenlabs.py](file:///home/allan/project/meteonova/backend/app/services/elevenlabs.py)
ElevenLabs TTS proxy:
- Server-side API calls (keeps API key secure)
- `synthesize_speech(text, voice_id)` → returns audio stream
- Default voice: "Rachel" (English) or multilingual voice for Hindi

---

### Data Team

#### [NEW] [geojson_builder.py](file:///home/allan/project/meteonova/data/transformers/geojson_builder.py)
Converts gridded weather data into MapLibre-consumable GeoJSON:
- Input: arrays of `{lat, lon, value}` from Open-Meteo
- Output: GeoJSON FeatureCollection with Point features
- Supports: temperature, precipitation, pressure, wind speed scalar fields

#### [NEW] [wind_texture.py](file:///home/allan/project/meteonova/data/transformers/wind_texture.py)
Encodes wind u/v components into PNG textures:
- Input: Open-Meteo wind u10/v10 grid data
- Output: RGBA PNG where R=u_normalized, G=v_normalized, B=speed_normalized, A=255
- Used by the frontend wind particle layer shader

#### [NEW] [mock_forecast.json](file:///home/allan/project/meteonova/data/mock/mock_forecast.json)
Realistic mock data for offline development:
- 7-day hourly forecast for 5 Indian cities (Delhi, Mumbai, Chennai, Kolkata, Bengaluru)
- All variables: temp, humidity, wind_speed, wind_direction, precipitation, pressure
- Matches Open-Meteo response schema exactly

#### [NEW] [india_districts.geojson](file:///home/allan/project/meteonova/data/mock/india_districts.geojson)
India district boundary polygons:
- Downloaded from public datasets (Natural Earth or GADM)
- Used for alert zone rendering and disaster management overlays
- Simplified geometry for fast rendering (~2MB target)

#### [NEW] [schema.sql](file:///home/allan/project/meteonova/data/schemas/schema.sql)
Lightweight SQLite schema (no PostGIS needed for MVP):
```sql
CREATE TABLE IF NOT EXISTS forecast_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lat REAL,
    lon REAL,
    model TEXT,
    forecast_data TEXT,  -- JSON string
    fetched_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT
);

CREATE TABLE IF NOT EXISTS weather_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alert_id TEXT UNIQUE,
    severity TEXT,
    event_type TEXT,
    description TEXT,
    geojson TEXT,  -- GeoJSON polygon string
    effective_at TEXT,
    expires_at TEXT
);
```

---

## Decisions Made

> [!NOTE]
> **LLM Provider:** Using **Groq** with Llama-3 70B for ultra-fast tool-calling inference. Free tier API key required from [console.groq.com](https://console.groq.com).

> [!NOTE]
> **Base Map Tiles:** Using **MapTiler** dark vector tiles. Free tier API key required from [cloud.maptiler.com](https://cloud.maptiler.com).

> [!NOTE]
> **Voice:** Using **ElevenLabs** for TTS output (free tier, 10K chars/mo) and **browser-native Web Speech API** for STT input (zero-cost). API key required from [elevenlabs.io](https://elevenlabs.io).

> [!NOTE]
> **Alerts:** Using **hardcoded mock data** for weather alerts. Realistic but fake. No live NDMA/CAP feed integration needed for demo.

> [!NOTE]
> **Database:** Using **SQLite** (lightweight, zero-config) instead of PostGIS/Redis for MVP. No database server setup needed.

---

## Verification Plan

### Automated Tests
- `cd frontend && npm run build` — Verify Next.js compiles without errors
- `cd backend && python -m pytest tests/` — Unit tests for data transformers and API clients
- `cd frontend && npm run lint` — ESLint + TypeScript type checking

### Manual Verification
1. **Map renders** — MapLibre loads with India-centered dark basemap
2. **Chat works** — WebSocket connection established, messages sent/received
3. **Wind particles animate** — GPU-accelerated particle layer renders over map
4. **Heatmap renders** — Temperature gradient visible for India
5. **Timeline scrubs** — Slider changes displayed forecast timestep
6. **Voice input** — Microphone captures speech via Web Speech API, sends to backend
7. **Voice output** — ElevenLabs TTS reads narration aloud
8. **Tool-calls render** — LLM response triggers map flyTo and layer changes
9. **Mock alerts** — Fake weather warnings render as colored polygons on the map
