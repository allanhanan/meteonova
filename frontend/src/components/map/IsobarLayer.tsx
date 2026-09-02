'use client';
import React, { useEffect } from 'react';
import * as maplibregl from 'maplibre-gl';

interface IsobarLayerProps {
  map: maplibregl.Map | null;
}

const ISOBAR_DATA = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: [[65.0, 20.0], [72.0, 19.0], [80.0, 18.0], [88.0, 16.0], [96.0, 13.0]] },
      properties: { pressure: '1000 hPa' },
    },
    {
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: [[65.0, 23.0], [74.0, 22.0], [82.0, 20.5], [89.0, 18.5], [96.0, 16.0]] },
      properties: { pressure: '1004 hPa' },
    },
    {
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: [[65.0, 26.0], [76.0, 25.0], [84.0, 23.0], [91.0, 21.0], [96.0, 19.0]] },
      properties: { pressure: '1008 hPa' },
    },
    {
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: [[65.0, 29.0], [77.0, 28.0], [86.0, 26.0], [92.0, 24.0], [96.0, 22.0]] },
      properties: { pressure: '1012 hPa' },
    },
    {
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: [[65.0, 32.0], [78.0, 31.0], [87.0, 29.0], [94.0, 27.0], [97.0, 25.0]] },
      properties: { pressure: '1016 hPa' },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [87.5, 17.5] },
      properties: { pressure: 'L (996 hPa)' },
    },
  ],
};

export const IsobarLayer: React.FC<IsobarLayerProps> = ({ map }) => {
  useEffect(() => {
    if (!map) return;

    const srcId = 'isobars-src';
    const lineId = 'isobars-lines';
    const labelId = 'isobars-labels';
    const lowId = 'isobars-low';

    if (!map.getSource(srcId)) {
      map.addSource(srcId, {
        type: 'geojson',
        data: ISOBAR_DATA as unknown as maplibregl.GeoJSONSourceSpecification['data'],
      });
    }

    if (!map.getLayer(lineId)) {
      map.addLayer({
        id: lineId,
        type: 'line',
        source: srcId,
        filter: ['==', '$type', 'LineString'],
        paint: {
          'line-color': '#00e5ff',
          'line-width': 3.0,
          'line-dasharray': [5, 3],
          'line-opacity': 0.95,
        },
      });
    }

    if (!map.getLayer(labelId)) {
      map.addLayer({
        id: labelId,
        type: 'symbol',
        source: srcId,
        filter: ['==', '$type', 'LineString'],
        layout: {
          'symbol-placement': 'line',
          'text-field': ['get', 'pressure'],
          'text-size': 11,
          'symbol-spacing': 180,
        },
        paint: {
          'text-color': '#00e5ff',
          'text-halo-color': '#000000',
          'text-halo-width': 2,
        },
      });
    }

    if (!map.getLayer(lowId)) {
      map.addLayer({
        id: lowId,
        type: 'symbol',
        source: srcId,
        filter: ['==', '$type', 'Point'],
        layout: {
          'text-field': ['get', 'pressure'],
          'text-size': 20,
        },
        paint: {
          'text-color': '#ef4444',
          'text-halo-color': '#000000',
          'text-halo-width': 2.5,
        },
      });
    }

    return () => {
      if (map.getLayer(lowId)) map.removeLayer(lowId);
      if (map.getLayer(labelId)) map.removeLayer(labelId);
      if (map.getLayer(lineId)) map.removeLayer(lineId);
      if (map.getSource(srcId)) map.removeSource(srcId);
    };
  }, [map]);

  return null;
};
