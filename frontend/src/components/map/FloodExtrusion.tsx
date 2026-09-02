'use client';
import React, { useEffect } from 'react';
import * as maplibregl from 'maplibre-gl';

interface FloodExtrusionProps {
  map: maplibregl.Map | null;
}

export const FloodExtrusion: React.FC<FloodExtrusionProps> = ({ map }) => {
  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;

    const sourceId = 'flood-buildings-src';
    const fillLayerId = 'flood-buildings-layer';

    // Sample 3D building polygons for coastal flood simulation (e.g. Mumbai Coastal / Nariman Point area)
    const buildingFeatures = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[[72.818, 18.922], [72.822, 18.922], [72.822, 18.926], [72.818, 18.926], [72.818, 18.922]]]
          },
          properties: { height: 45, base_height: 0, risk: 'High', flood_level: 2.1 }
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[[72.824, 18.923], [72.828, 18.923], [72.828, 18.927], [72.824, 18.927], [72.824, 18.923]]]
          },
          properties: { height: 75, base_height: 0, risk: 'Extreme', flood_level: 2.8 }
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[[72.820, 18.928], [72.825, 18.928], [72.825, 18.932], [72.820, 18.932], [72.820, 18.928]]]
          },
          properties: { height: 60, base_height: 0, risk: 'Moderate', flood_level: 1.2 }
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[[72.829, 18.929], [72.833, 18.929], [72.833, 18.933], [72.829, 18.933], [72.829, 18.929]]]
          },
          properties: { height: 90, base_height: 0, risk: 'Extreme', flood_level: 3.2 }
        }
      ]
    };

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: buildingFeatures as unknown as maplibregl.GeoJSONSourceSpecification['data']
      });
    }

    if (!map.getLayer(fillLayerId)) {
      map.addLayer({
        id: fillLayerId,
        type: 'fill-extrusion',
        source: sourceId,
        paint: {
          'fill-extrusion-color': [
            'match',
            ['get', 'risk'],
            'Extreme', '#ef4444',
            'High', '#f97316',
            'Moderate', '#eab308',
            '#3b82f6'
          ],
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'base_height'],
          'fill-extrusion-opacity': 0.85
        }
      });
    }

    return () => {
      if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [map]);

  return null;
};
