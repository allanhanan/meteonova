from pydantic import BaseModel, Field
from typing import Literal, Optional, List, Dict, Any

class FlyToLocation(BaseModel):
    """Fly the map camera to a specific lat/lon location with zoom and tilt."""
    location_name: str = Field(description="Name of the city or region")
    lat: float = Field(description="Latitude coordinate")
    lon: float = Field(description="Longitude coordinate")
    zoom: float = Field(default=8.0, description="Map zoom level (2 to 18)")
    pitch: float = Field(default=45.0, description="Camera tilt angle in degrees")
    bearing: float = Field(default=0.0, description="Map bearing angle")

class RenderMapLayer(BaseModel):
    """Render a dynamic WebGL visualization layer on the map."""
    layer_type: Literal[
        "wind_particles",
        "heatmap_temp",
        "heatmap_precip",
        "pressure_isobars",
        "flood_extrusion",
        "alert_zones",
        "aqi_circles"
    ] = Field(description="The type of layer archetype to activate")
    data_source: str = Field(default="open_meteo", description="Data provider or dataset name")
    opacity: float = Field(default=0.8, description="Opacity of the map layer (0.0 to 1.0)")
    time_offset: str = Field(default="current", description="Time offset string e.g. 'current', '+24h', '+48h'")

class GenerateChartCard(BaseModel):
    """Inject an interactive chart card directly into the chat response."""
    chart_type: Literal["climate_trend", "crop_advisory", "aqi_breakdown", "skew_t"] = Field(description="Type of chart component")
    title: str = Field(description="Title of the chart card")
    location: str = Field(description="Location context for the chart")
    data: Dict[str, Any] = Field(default_factory=dict, description="Payload data for rendering the chart")
