from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class Location(BaseModel):
    name: str
    lat: float
    lon: float

class CurrentWeather(BaseModel):
    temperature: float
    wind_speed: float
    wind_direction: float
    humidity: float
    pressure: float
    condition: str

class ForecastPoint(BaseModel):
    time: str
    temperature: float
    precipitation_probability: float
    wind_speed: float

class WeatherAlert(BaseModel):
    id: str
    title: str
    severity: str  # Moderate, Severe, Extreme
    area: str
    description: str
    geojson: Dict[str, Any]

class ChatMessage(BaseModel):
    sender: str  # user, assistant, system
    text: str
    tool_calls: Optional[List[Dict[str, Any]]] = None
    timestamp: Optional[str] = None
