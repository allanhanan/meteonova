'use client';
import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useAppStore } from '@/lib/store';

export const MapCanvas: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const { mapState } = useAppStore();

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; CartoDB &copy; OpenStreetMap'
          }
        },
        layers: [
          {
            id: 'osm-tiles-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      center: mapState.center,
      zoom: mapState.zoom,
      pitch: mapState.pitch,
      bearing: mapState.bearing
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-left');

    map.on('load', () => {
      map.addSource('alerts-src', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [[[85.8, 19.8], [86.5, 20.2], [87.1, 20.9], [86.2, 20.5], [85.8, 19.8]]]
              },
              properties: { name: 'Odisha Storm Alert', severity: 'Extreme' }
            },
            {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [[[71.5, 25.8], [73.2, 26.5], [73.0, 28.1], [71.2, 27.5], [71.5, 25.8]]]
              },
              properties: { name: 'Rajasthan Heatwave', severity: 'Severe' }
            }
          ]
        }
      });

      map.addLayer({
        id: 'alert-fill-layer',
        type: 'fill',
        source: 'alerts-src',
        paint: {
          'fill-color': ['match', ['get', 'severity'], 'Extreme', '#ef4444', 'Severe', '#f97316', '#eab308'],
          'fill-opacity': 0.35
        }
      });

      map.addLayer({
        id: 'alert-outline-layer',
        type: 'line',
        source: 'alerts-src',
        paint: {
          'line-color': '#ef4444',
          'line-width': 2,
          'line-dasharray': [2, 2]
        }
      });
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;
    mapInstance.current.flyTo({
      center: mapState.center,
      zoom: mapState.zoom,
      pitch: mapState.pitch,
      bearing: mapState.bearing,
      essential: true,
      duration: 2500
    });
  }, [mapState.center, mapState.zoom, mapState.pitch, mapState.bearing]);

  return <div ref={mapContainer} className="w-full h-full relative" />;
};

export default MapCanvas;
