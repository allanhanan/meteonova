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
