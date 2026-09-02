'use client';
import React, { useEffect } from 'react';
import * as maplibregl from 'maplibre-gl';

interface AQIMarkersProps {
  map: maplibregl.Map | null;
}

export const AQIMarkers: React.FC<AQIMarkersProps> = ({ map }) => {
  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;

    const sourceId = 'aqi-stations-src';
    const circleLayerId = 'aqi-stations-circles';

    const aqiFeatures = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [77.2090, 28.6139] },
          properties: { city: 'Delhi (Anand Vihar)', aqi: 342, status: 'Hazardous', color: '#a855f7' }
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [72.8777, 19.0760] },
          properties: { city: 'Mumbai (BKC)', aqi: 158, status: 'Unhealthy', color: '#ef4444' }
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [80.2707, 13.0827] },
          properties: { city: 'Chennai (Guindy)', aqi: 74, status: 'Moderate', color: '#eab308' }
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [88.3639, 22.5726] },
          properties: { city: 'Kolkata (Bidhannagar)', aqi: 182, status: 'Unhealthy', color: '#ef4444' }
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [77.5946, 12.9716] },
          properties: { city: 'Bengaluru (Silk Board)', aqi: 48, status: 'Good', color: '#22c55e' }
        }
      ]
    };

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: aqiFeatures as unknown as maplibregl.GeoJSONSourceSpecification['data']
      });
    }

    if (!map.getLayer(circleLayerId)) {
      map.addLayer({
        id: circleLayerId,
        type: 'circle',
        source: sourceId,
        paint: {
          'circle-radius': 14,
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.85,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });
    }

    return () => {
      if (map.getLayer(circleLayerId)) map.removeLayer(circleLayerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [map]);

  return null;
};
