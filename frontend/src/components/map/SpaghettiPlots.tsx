'use client';
import React, { useEffect } from 'react';
import * as maplibregl from 'maplibre-gl';

interface SpaghettiPlotsProps {
  map: maplibregl.Map | null;
}

const TRACKS = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[88.5, 12.0], [87.8, 14.2], [87.0, 16.5], [86.2, 18.8], [85.8, 19.8]],
      },
      properties: { model: 'GFS Ensemble', color: '#00e5ff' },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[88.5, 12.0], [88.2, 14.5], [87.9, 17.0], [87.3, 19.2], [86.5, 20.2]],
      },
      properties: { model: 'ECMWF HRES', color: '#f97316' },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[88.5, 12.0], [88.0, 14.3], [87.4, 16.8], [86.7, 19.0], [86.0, 20.0]],
      },
      properties: { model: 'GenCast AI', color: '#d946ef' },
    },
    // Waypoints
    { type: 'Feature', geometry: { type: 'Point', coordinates: [88.5, 12.0] }, properties: { label: 'Cyclone Origin' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [85.8, 19.8] }, properties: { label: 'Landfall (Odisha)' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [86.5, 20.2] }, properties: { label: 'ECMWF Landfall' } },
  ],
};

export const SpaghettiPlots: React.FC<SpaghettiPlotsProps> = ({ map }) => {
  useEffect(() => {
    if (!map) return;

    const srcId = 'spaghetti-src';
    const lineId = 'spaghetti-lines';
    const dotId = 'spaghetti-dots';
    const labelId = 'spaghetti-labels';

    if (!map.getSource(srcId)) {
      map.addSource(srcId, {
        type: 'geojson',
        data: TRACKS as unknown as maplibregl.GeoJSONSourceSpecification['data'],
      });
    }

    if (!map.getLayer(lineId)) {
      map.addLayer({
        id: lineId,
        type: 'line',
        source: srcId,
        filter: ['==', '$type', 'LineString'],
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 4,
          'line-opacity': 0.95,
        },
      });
    }

    if (!map.getLayer(dotId)) {
      map.addLayer({
        id: dotId,
        type: 'circle',
        source: srcId,
        filter: ['==', '$type', 'Point'],
        paint: {
          'circle-radius': 7,
          'circle-color': '#ffffff',
          'circle-stroke-width': 3,
          'circle-stroke-color': '#d946ef',
        },
      });
    }

    if (!map.getLayer(labelId)) {
      map.addLayer({
        id: labelId,
        type: 'symbol',
        source: srcId,
        filter: ['==', '$type', 'Point'],
        layout: {
          'text-field': ['get', 'label'],
          'text-size': 11,
          'text-offset': [0, 1.8],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 2,
        },
      });
    }

    // Auto camera flyTo to Bay of Bengal cyclone track corridor
    map.flyTo({ center: [86.5, 17.5], zoom: 5.5, pitch: 30, bearing: 0, duration: 2000 });

    return () => {
      if (map.getLayer(labelId)) map.removeLayer(labelId);
      if (map.getLayer(dotId)) map.removeLayer(dotId);
      if (map.getLayer(lineId)) map.removeLayer(lineId);
      if (map.getSource(srcId)) map.removeSource(srcId);
    };
  }, [map]);

  return null;
};
