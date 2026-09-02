'use client';
import React, { useEffect } from 'react';
import * as maplibregl from 'maplibre-gl';

interface FloodExtrusionProps {
  map: maplibregl.Map | null;
}

const BUILDINGS = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [[[72.818, 18.922], [72.822, 18.922], [72.822, 18.926], [72.818, 18.926], [72.818, 18.922]]] },
      properties: { height: 45, base_height: 0, risk: 'High', color: '#f97316' },
    },
    {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [[[72.824, 18.923], [72.828, 18.923], [72.828, 18.927], [72.824, 18.927], [72.824, 18.923]]] },
      properties: { height: 75, base_height: 0, risk: 'Extreme', color: '#ef4444' },
    },
    {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [[[72.820, 18.928], [72.825, 18.928], [72.825, 18.932], [72.820, 18.932], [72.820, 18.928]]] },
      properties: { height: 60, base_height: 0, risk: 'Moderate', color: '#eab308' },
    },
    {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [[[72.829, 18.929], [72.833, 18.929], [72.833, 18.933], [72.829, 18.933], [72.829, 18.929]]] },
      properties: { height: 90, base_height: 0, risk: 'Extreme', color: '#ef4444' },
    },
    {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [[[72.835, 18.930], [72.840, 18.930], [72.840, 18.934], [72.835, 18.934], [72.835, 18.930]]] },
      properties: { height: 55, base_height: 0, risk: 'High', color: '#8b5cf6' },
    },
  ],
};

export const FloodExtrusion: React.FC<FloodExtrusionProps> = ({ map }) => {
  useEffect(() => {
    if (!map) return;

    const srcId = 'flood-src';
    const layerId = 'flood-extrusion';

    if (!map.getSource(srcId)) {
      map.addSource(srcId, {
        type: 'geojson',
        data: BUILDINGS as unknown as maplibregl.GeoJSONSourceSpecification['data'],
      });
    }

    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: 'fill-extrusion',
        source: srcId,
        paint: {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'base_height'],
          'fill-extrusion-opacity': 0.85,
        },
      });
    }

    // Fly to Mumbai coastal zone to show the extrusions
    map.flyTo({ center: [72.826, 18.928], zoom: 14, pitch: 60, bearing: -20, duration: 2000 });

    return () => {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(srcId)) map.removeSource(srcId);
    };
  }, [map]);

  return null;
};
