'use client';
import React, { useEffect } from 'react';
import * as maplibregl from 'maplibre-gl';

interface SpaghettiPlotsProps {
  map: maplibregl.Map | null;
}

export const SpaghettiPlots: React.FC<SpaghettiPlotsProps> = ({ map }) => {
  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;

    const sourceId = 'spaghetti-tracks-src';
    const layerId = 'spaghetti-tracks-layer';

    const trackFeatures = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [88.5, 12.0], [87.8, 14.2], [87.0, 16.5], [86.2, 18.8], [85.8, 19.8]
            ]
          },
          properties: { model: 'GFS (NOAA)', color: '#00f2ff', width: 3 }
        },
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [88.5, 12.0], [88.2, 14.5], [87.9, 17.0], [87.3, 19.2], [86.5, 20.2]
            ]
          },
          properties: { model: 'ECMWF (IFS)', color: '#f97316', width: 3 }
        },
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [88.5, 12.0], [88.0, 14.3], [87.4, 16.8], [86.7, 19.0], [86.0, 20.0]
            ]
          },
          properties: { model: 'GenCast (DeepMind)', color: '#e056fd', width: 4 }
        }
      ]
    };

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: trackFeatures as unknown as maplibregl.GeoJSONSourceSpecification['data']
      });
    }

    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['get', 'width'],
          'line-opacity': 0.85
        }
      });
    }

    return () => {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [map]);

  return null;
};
