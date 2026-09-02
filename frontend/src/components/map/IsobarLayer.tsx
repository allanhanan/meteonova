'use client';
import React, { useEffect } from 'react';
import * as maplibregl from 'maplibre-gl';

interface IsobarLayerProps {
  map: maplibregl.Map | null;
}

export const IsobarLayer: React.FC<IsobarLayerProps> = ({ map }) => {
  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;

    const sourceId = 'isobars-src';
    const lineLayerId = 'isobars-lines';

    const isobarFeatures = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [[68.0, 22.0], [74.0, 21.0], [80.0, 20.0], [86.0, 18.0], [92.0, 15.0]]
          },
          properties: { pressure: '1004 hPa' }
        },
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [[68.0, 25.0], [75.0, 24.0], [82.0, 23.0], [88.0, 21.0], [93.0, 18.0]]
          },
          properties: { pressure: '1008 hPa' }
        },
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [[68.0, 28.0], [76.0, 27.0], [84.0, 26.0], [90.0, 24.0], [95.0, 22.0]]
          },
          properties: { pressure: '1012 hPa' }
        },
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [[68.0, 31.0], [77.0, 30.0], [85.0, 29.0], [92.0, 27.0], [96.0, 25.0]]
          },
          properties: { pressure: '1016 hPa' }
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [87.5, 17.5] },
          properties: { pressure: 'L (998 hPa)', type: 'low' }
        }
      ]
    };

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: isobarFeatures as unknown as maplibregl.GeoJSONSourceSpecification['data']
      });
    }

    if (!map.getLayer(lineLayerId)) {
      map.addLayer({
        id: lineLayerId,
        type: 'line',
        source: sourceId,
        filter: ['==', '$type', 'LineString'],
        paint: {
          'line-color': '#00f2ff',
          'line-width': 1.5,
          'line-dasharray': [4, 2],
          'line-opacity': 0.8
        }
      });
    }

    return () => {
      if (map.getLayer(lineLayerId)) map.removeLayer(lineLayerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [map]);

  return null;
};
