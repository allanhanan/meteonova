from typing import List, Dict, Any

class AlertService:
    @staticmethod
    def get_active_alerts() -> List[Dict[str, Any]]:
        """Return realistic mock alerts for demonstration and presentation."""
        return [
            {
                "id": "ALT-ODISHA-001",
                "title": "Severe Tropical Storm Warning - Odisha Coast",
                "severity": "Extreme",
                "area": "Coastal Odisha (Puri, Jagatsinghpur)",
                "description": "Wind speeds expected up to 90 km/h with heavy surge inundation potential. Coastal evacuations recommended.",
                "geojson": {
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [85.8, 19.8], [86.5, 20.2], [87.1, 20.9], [86.2, 20.5], [85.8, 19.8]
                        ]]
                    },
                    "properties": {"color": "#ef4444", "severity": "Extreme"}
                }
            },
            {
                "id": "ALT-RAJ-002",
                "title": "Severe Heatwave Red Alert - Western Rajasthan",
                "severity": "Severe",
                "area": "Jodhpur, Barmer, Bikaner",
                "description": "Maximum temperatures forecasted between 45°C - 48°C. Avoid outdoor activity between 11 AM - 4 PM.",
                "geojson": {
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [71.5, 25.8], [73.2, 26.5], [73.0, 28.1], [71.2, 27.5], [71.5, 25.8]
                        ]]
                    },
                    "properties": {"color": "#f97316", "severity": "Severe"}
                }
            },
            {
                "id": "ALT-KERALA-003",
                "title": "Heavy Monsoon Downpour & Flash Flood Watch",
                "severity": "Moderate",
                "area": "Wayanad & Idukki Districts",
                "description": "Localized heavy rainfall exceeding 120mm in 24 hours. Risk of landslide in hilly terrain.",
                "geojson": {
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [76.0, 11.4], [76.5, 11.9], [77.1, 10.5], [76.5, 10.2], [76.0, 11.4]
                        ]]
                    },
                    "properties": {"color": "#eab308", "severity": "Moderate"}
                }
            }
        ]
