'use client';
import React, { useEffect } from 'react';
import * as maplibregl from 'maplibre-gl';

interface AQIMarkersProps {
  map: maplibregl.Map | null;
}

const AQI_DATA = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'Point', coordinates: [77.209, 28.614] }, properties: { city: 'Delhi', aqi: 342, color: '#a855f7' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [72.878, 19.076] }, properties: { city: 'Mumbai', aqi: 158, color: '#ef4444' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [80.271, 13.083] }, properties: { city: 'Chennai', aqi: 74, color: '#eab308' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [88.364, 22.573] }, properties: { city: 'Kolkata', aqi: 182, color: '#ef4444' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [77.595, 12.972] }, properties: { city: 'Bengaluru', aqi: 48, color: '#22c55e' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [73.857, 18.520] }, properties: { city: 'Pune', aqi: 112, color: '#f97316' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [72.571, 23.023] }, properties: { city: 'Ahmedabad', aqi: 198, color: '#ef4444' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [78.486, 17.385] }, properties: { city: 'Hyderabad', aqi: 135, color: '#f97316' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [75.787, 26.912] }, properties: { city: 'Jaipur', aqi: 210, color: '#a855f7' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [80.946, 26.846] }, properties: { city: 'Lucknow', aqi: 285, color: '#a855f7' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [85.137, 25.594] }, properties: { city: 'Patna', aqi: 310, color: '#a855f7' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [91.736, 26.144] }, properties: { city: 'Guwahati', aqi: 88, color: '#eab308' } },
  ],
};

export const AQIMarkers: React.FC<AQIMarkersProps> = ({ map }) => {
  useEffect(() => {
    if (!map) return;

    const srcId = 'aqi-src';
    const circleId = 'aqi-circles';
    const labelId = 'aqi-labels';

    if (!map.getSource(srcId)) {
      map.addSource(srcId, {
        type: 'geojson',
        data: AQI_DATA as unknown as maplibregl.GeoJSONSourceSpecification['data'],
      });
    }

    if (!map.getLayer(circleId)) {
      map.addLayer({
        id: circleId,
        type: 'circle',
        source: srcId,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 16, 8, 24],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.95,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
        },
      });
    }

    if (!map.getLayer(labelId)) {
      map.addLayer({
        id: labelId,
        type: 'symbol',
        source: srcId,
        layout: {
          'text-field': ['concat', ['get', 'city'], '\nAQI ', ['to-string', ['get', 'aqi']]],
          'text-size': 12,
          'text-offset': [0, 2.2],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 2.5,
        },
      });
    }

    // Auto camera flyTo to India overview
    map.flyTo({ center: [78.96, 20.59], zoom: 4.8, pitch: 0, bearing: 0, duration: 2000 });

    return () => {
      if (map.getLayer(labelId)) map.removeLayer(labelId);
      if (map.getLayer(circleId)) map.removeLayer(circleId);
      if (map.getSource(srcId)) map.removeSource(srcId);
    };
  }, [map]);

  return null;
};
