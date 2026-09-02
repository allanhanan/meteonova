import httpx
from typing import Dict, Any, Optional
from app.config import settings

class OpenMeteoService:
    @staticmethod
    async def get_forecast(lat: float, lon: float) -> Dict[str, Any]:
        """Fetch real-time weather and 7-day forecast from Open-Meteo API."""
        url = f"{settings.OPEN_METEO_BASE_URL}/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": ["temperature_2m", "relative_humidity_2m", "surface_pressure", "wind_speed_10m", "wind_direction_10m"],
            "hourly": ["temperature_2m", "precipitation_probability", "wind_speed_10m", "surface_pressure"],
            "daily": ["temperature_2m_max", "temperature_2m_min", "precipitation_sum"],
            "timezone": "auto"
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(url, params=params)
            if res.status_code == 200:
                return res.json()
            return {"error": f"Failed to fetch forecast, status {res.status_code}"}

    @staticmethod
    async def get_historical(lat: float, lon: float, start_date: str, end_date: str) -> Dict[str, Any]:
        """Fetch historical weather data for climate trends."""
        url = "https://archive-api.open-meteo.com/v1/archive"
        params = {
            "latitude": lat,
            "longitude": lon,
            "start_date": start_date,
            "end_date": end_date,
            "daily": ["temperature_2m_mean", "precipitation_sum"]
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(url, params=params)
            if res.status_code == 200:
                return res.json()
            return {"error": "Failed to fetch historical data"}
