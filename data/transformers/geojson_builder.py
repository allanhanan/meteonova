import json
from typing import List, Dict, Any

class GeoJSONBuilder:
    @staticmethod
    def points_to_geojson(points: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Convert list of point dictionaries with lat, lon, value into a GeoJSON FeatureCollection."""
        features = []
        for p in points:
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [p["lon"], p["lat"]]
                },
                "properties": {
                    "value": p.get("value", 0),
                    "name": p.get("name", "")
                }
            })
        return {
            "type": "FeatureCollection",
            "features": features
        }
