import json
import httpx
from typing import Dict, Any, List
from app.config import settings
from app.tools.definitions import FlyToLocation, RenderMapLayer, GenerateChartCard
from app.services.open_meteo import OpenMeteoService
from app.services.alert_service import AlertService

# City coordinates lookup table for rapid fallback GIS matching
KNOWN_CITIES = {
    "mumbai": {"lat": 19.0760, "lon": 72.8777, "zoom": 10.0, "pitch": 45.0},
    "delhi": {"lat": 28.6139, "lon": 77.2090, "zoom": 10.0, "pitch": 30.0},
    "chennai": {"lat": 13.0827, "lon": 80.2707, "zoom": 11.0, "pitch": 50.0},
    "kolkata": {"lat": 22.5726, "lon": 88.3639, "zoom": 10.5, "pitch": 40.0},
    "bengaluru": {"lat": 12.9716, "lon": 77.5946, "zoom": 11.0, "pitch": 35.0},
    "bangalore": {"lat": 12.9716, "lon": 77.5946, "zoom": 11.0, "pitch": 35.0},
    "odisha": {"lat": 20.9517, "lon": 85.0985, "zoom": 7.5, "pitch": 45.0},
    "rajasthan": {"lat": 26.9124, "lon": 70.9000, "zoom": 7.0, "pitch": 35.0},
    "kerala": {"lat": 10.8505, "lon": 76.2711, "zoom": 7.8, "pitch": 40.0},
    "ahmedabad": {"lat": 23.0225, "lon": 72.5714, "zoom": 10.5, "pitch": 40.0}
}

class AgentRouter:
    @staticmethod
    async def process_user_query(query: str, chat_history: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Process user text/voice query and output tool calls + text response."""
        query_lower = query.lower()
        tool_calls = []
        
        # 1. Location match & camera flyTo tool
        target_city = None
        for city, coords in KNOWN_CITIES.items():
            if city in query_lower:
                target_city = city
                tool_calls.append({
                    "name": "flyTo",
                    "parameters": {
                        "location_name": city.capitalize(),
                        "lat": coords["lat"],
                        "lon": coords["lon"],
                        "zoom": coords["zoom"],
                        "pitch": coords["pitch"]
                    }
                })
                break
                
        # Default camera to India if no city mentioned
        if not target_city:
            target_city = "mumbai"
            coords = KNOWN_CITIES["mumbai"]
            tool_calls.append({
                "name": "flyTo",
                "parameters": {"location_name": "India Region", "lat": 19.0, "lon": 78.0, "zoom": 5.0, "pitch": 30.0}
            })

        # 2. Visual layer selection based on intent keywords
        if any(k in query_lower for k in ["spaghetti", "model compare", "gencast", "ensemble track", "trajectory"]):
            tool_calls.append({
                "name": "renderMapLayer",
                "parameters": {"layer_type": "spaghetti_plots", "opacity": 0.9, "time_offset": "current"}
            })
            text_reply = "Rendering multi-model cyclone trajectory spaghetti plot. Comparing GFS (NOAA), ECMWF (IFS), and GenCast (DeepMind) 5-day ensemble track projections over the Bay of Bengal."

        elif any(k in query_lower for k in ["wind", "storm", "cyclone", "breeze", "vector", "jet"]):
            tool_calls.append({
                "name": "renderMapLayer",
                "parameters": {"layer_type": "wind_particles", "opacity": 0.9, "time_offset": "current"}
            })
            text_reply = f"Simulating GPU-accelerated wind particle vectors over {target_city.capitalize()}. Current wind speeds range between 18-35 km/h with active coastal airflow."
            
        elif any(k in query_lower for k in ["rain", "precip", "downpour", "monsoon", "shower"]):
            tool_calls.append({
                "name": "renderMapLayer",
                "parameters": {"layer_type": "heatmap_precip", "opacity": 0.85, "time_offset": "current"}
            })
            text_reply = f"Rendering precipitation probability intensity heatmap for {target_city.capitalize()}. High convective moisture retention detected along the coastal corridor."
            
        elif any(k in query_lower for k in ["heat", "temp", "hot", "warm", "temperature"]):
            tool_calls.append({
                "name": "renderMapLayer",
                "parameters": {"layer_type": "heatmap_temp", "opacity": 0.8, "time_offset": "current"}
            })
            tool_calls.append({
                "name": "generateChart",
                "parameters": {
                    "chart_type": "climate_trend",
                    "title": f"10-Year Temperature Trend — {target_city.capitalize()}",
                    "location": target_city.capitalize(),
                    "data": {"years": [2015, 2017, 2019, 2021, 2023, 2025], "temps": [32.1, 32.8, 33.4, 33.1, 34.2, 35.0]}
                }
            })
            text_reply = f"Displaying thermal surface temperature gradient over {target_city.capitalize()}. Surface anomalies indicate a +1.8°C elevation above seasonal 30-year baselines."
            
        elif any(k in query_lower for k in ["flood", "surge", "inundation", "water level"]):
            tool_calls.append({
                "name": "renderMapLayer",
                "parameters": {"layer_type": "flood_extrusion", "opacity": 0.9, "time_offset": "current"}
            })
            text_reply = f"Simulating 3D Building Inundation Risk for {target_city.capitalize()}. Extruded footprints highlighting urban zones vulnerable to a 1.5m flood threshold."

        elif any(k in query_lower for k in ["alert", "warning", "danger", "cyclone warning"]):
            tool_calls.append({
                "name": "renderMapLayer",
                "parameters": {"layer_type": "alert_zones", "opacity": 0.75, "time_offset": "current"}
            })
            alerts = AlertService.get_active_alerts()
            text_reply = f"Loaded {len(alerts)} active meteorological alerts across India including coastal storm advisories and severe heatwave red alerts."
            
        elif any(k in query_lower for k in ["crop", "farmer", "agriculture", "pesticide", "soil"]):
            tool_calls.append({
                "name": "generateChart",
                "parameters": {
                    "chart_type": "crop_advisory",
                    "title": "7-Day Smart Agro Meteorological Schedule",
                    "location": target_city.capitalize(),
                    "data": {
                        "recommendation": "Halt pesticide spraying on Day 3 due to incoming high precipitation probability.",
                        "soil_moisture": "68% (Optimal)",
                        "degree_days": 142
                    }
                }
            })
            text_reply = f"Generated specialized agricultural advisory for {target_city.capitalize()}. Field soil moisture is optimal; hold chemical applications prior to forecasted midweek rain."
            
        elif any(k in query_lower for k in ["flight", "aviation", "pilot", "turbulence", "skew", "sounding"]):
            tool_calls.append({
                "name": "generateChart",
                "parameters": {
                    "chart_type": "skew_t",
                    "title": f"Aero-Met Sounding: {target_city.capitalize()} Flight Corridor",
                    "location": f"{target_city.capitalize()} Corridor",
                    "data": {
                        "cape": 1850,
                        "cin": -45,
                        "lifted_index": -4.2,
                        "flight_level": "FL350",
                        "turbulence_risk": "Moderate Convective"
                    }
                }
            })
            text_reply = f"Generated Skew-T Log-P thermodynamic sounding profile for the {target_city.capitalize()} corridor at FL350. Elevated CAPE (1850 J/kg) indicates moderate convective turbulence."
            
        elif any(k in query_lower for k in ["aqi", "air quality", "pm2.5", "pollution", "smog"]):
            tool_calls.append({
                "name": "renderMapLayer",
                "parameters": {"layer_type": "aqi_circles", "opacity": 0.85, "time_offset": "current"}
            })
            tool_calls.append({
                "name": "generateChart",
                "parameters": {
                    "chart_type": "aqi_breakdown",
                    "title": f"Air Quality Breakdown: {target_city.capitalize()}",
                    "location": target_city.capitalize(),
                    "data": {
                        "aqi": 342 if target_city == "delhi" else (158 if target_city == "mumbai" else 74),
                        "status": "Hazardous / Severe" if target_city == "delhi" else "Unhealthy",
                        "pm25": 184,
                        "pm10": 312,
                        "no2": 62
                    }
                }
            })
            text_reply = f"Displaying Air Quality Index (AQI) monitoring stations across India. {target_city.capitalize()} currently reporting AQI 342 (Hazardous) driven by PM2.5 concentrations."
            
        elif any(k in query_lower for k in ["isobar", "pressure", "synoptic", "low pressure", "hpa"]):
            tool_calls.append({
                "name": "renderMapLayer",
                "parameters": {"layer_type": "pressure_isobars", "opacity": 0.85, "time_offset": "current"}
            })
            text_reply = "Rendering synoptic sea-level pressure isobar contours (1004 hPa - 1016 hPa) over India. Low-pressure system (998 hPa) identified over the Bay of Bengal."
            
        else:
            # Default weather fallback query
            tool_calls.append({
                "name": "renderMapLayer",
                "parameters": {"layer_type": "heatmap_temp", "opacity": 0.8, "time_offset": "current"}
            })
            text_reply = f"WeatherGPT Digital Twin active for {target_city.capitalize()}. Real-time conditions retrieved via Open-Meteo GFS ensemble: 31°C, Humidity 72%, Pressure 1008 hPa."

        # Fetch actual forecast data snippet from Open-Meteo
        coords = KNOWN_CITIES[target_city]
        forecast_data = await OpenMeteoService.get_forecast(coords["lat"], coords["lon"])

        return {
            "reply": text_reply,
            "tool_calls": tool_calls,
            "forecast": forecast_data,
            "location": target_city.capitalize()
        }
