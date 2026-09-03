'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useAppStore } from '@/lib/store';
import { WindParticles } from './WindParticles';
import { ThermalFieldCanvas } from './ThermalFieldCanvas';
import { PrecipitationFieldCanvas } from './PrecipitationFieldCanvas';
import { FloodExtrusion } from './FloodExtrusion';
import { SpaghettiPlots } from './SpaghettiPlots';
import { IsobarLayer } from './IsobarLayer';
import { AQIMarkers } from './AQIMarkers';
import { PolygonDraw } from './PolygonDraw';
import { NewsReportCard, PlaceReport } from '../ui/NewsReportCard';

// ── Dynamic Map Style Specifications (pure raster — no glyphs needed) ─────────
export const MAP_STYLES: Record<string, maplibregl.StyleSpecification> = {
  dark: {
    version: 8,
    sources: {
      carto: {
        type: 'raster',
        tiles: [
          'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
          'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
          'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
          'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        ],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap &copy; CARTO',
      },
    },
    layers: [{ id: 'carto-dark-base', type: 'raster', source: 'carto', minzoom: 0, maxzoom: 20 }],
  },
  satellite: {
    version: 8,
    sources: {
      esri_sat: {
        type: 'raster',
        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256,
        attribution: '&copy; Esri World Imagery',
      },
    },
    layers: [{ id: 'esri-sat-base', type: 'raster', source: 'esri_sat', minzoom: 0, maxzoom: 20 }],
  },
  light: {
    version: 8,
    sources: {
      carto_light: {
        type: 'raster',
        tiles: [
          'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
          'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
          'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
          'https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        ],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap &copy; CARTO',
      },
    },
    layers: [{ id: 'carto-light-base', type: 'raster', source: 'carto_light', minzoom: 0, maxzoom: 20 }],
  },
  terrain: {
    version: 8,
    sources: {
      esri_topo: {
        type: 'raster',
        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256,
        attribution: '&copy; Esri Topo',
      },
    },
    layers: [{ id: 'esri-topo-base', type: 'raster', source: 'esri_topo', minzoom: 0, maxzoom: 20 }],
  },
  esri_dark: {
    version: 8,
    sources: {
      esri_dark_src: {
        type: 'raster',
        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256,
        attribution: '&copy; Esri',
      },
    },
    layers: [{ id: 'esri-dark-base', type: 'raster', source: 'esri_dark_src', minzoom: 0, maxzoom: 20 }],
  },
};

export const MapCanvas: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [hoverInfo, setHoverInfo] = useState<{ lng: number; lat: number; temp: number; x: number; y: number } | null>(null);
  const [activeMap, setActiveMap] = useState<maplibregl.Map | null>(null);
  const [newsReport, setNewsReport] = useState<PlaceReport | null>(null);

  const activeLayers = useAppStore((s) => s.mapState.activeLayers);
  const selectedMapStyle = useAppStore((s) => s.mapState.mapStyle);
  const mapCenter = useAppStore((s) => s.mapState.center);
  const mapZoom = useAppStore((s) => s.mapState.zoom);
  const mapPitch = useAppStore((s) => s.mapState.pitch);
  const mapBearing = useAppStore((s) => s.mapState.bearing);

  // Init map once
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const initialStyle = MAP_STYLES[selectedMapStyle] || MAP_STYLES['dark'];
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: initialStyle,
      center: [78.9629, 20.5937],
      zoom: 4.8,
      pitch: 0,
      bearing: 0,
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), 'top-left');
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left');

    map.on('load', () => {
      map.resize();
      setActiveMap(map);
    });

    // ── Interactive Hover Pointer Inspector ──────────────────────────────────
    map.on('mousemove', (e) => {
      const lng = Number(e.lngLat.lng.toFixed(2));
      const lat = Number(e.lngLat.lat.toFixed(2));

      const offset = useAppStore.getState().currentTimeOffset;
      const hourOfDay = (offset + 14) % 24;
      const diurnalFactor = Math.sin((hourOfDay / 24) * Math.PI * 2);

      let weight = 0.5;
      if (lng >= 68.0 && lng <= 76.0 && lat >= 22.0 && lat <= 30.0) {
        weight = 0.82 + diurnalFactor * 0.16;
      } else if (lng >= 76.0 && lng <= 88.0 && lat >= 12.0 && lat <= 28.0) {
        weight = 0.72 + diurnalFactor * 0.14;
      } else if (lat < 2.0 && lng >= 75.0) {
        weight = 0.10;
      } else if (lat >= 2.0 && lat < 12.0) {
        weight = 0.52 + diurnalFactor * 0.05;
      } else if (lat > 31.0) {
        weight = 0.20;
      } else {
        weight = 0.48;
      }

      weight = Math.max(0.0, Math.min(1.0, weight));
      const temp = Math.round(14 + weight * 34);
      setHoverInfo({ lng, lat, temp, x: e.point.x, y: e.point.y });
    });

    // ── Click Map Anywhere -> Show TV News Channel Report Card ───────────────
    map.on('click', (e) => {
      const lng = Number(e.lngLat.lng.toFixed(2));
      const lat = Number(e.lngLat.lat.toFixed(2));

      const offset = useAppStore.getState().currentTimeOffset;
      const hourOfDay = (offset + 14) % 24;
      const diurnalFactor = Math.sin((hourOfDay / 24) * Math.PI * 2);

      const activeLayers = useAppStore.getState().mapState.activeLayers;

      // ── 1. Dynamic Geolocation Lookup based on clicked Lat/Lon ──────────────
      let cityName = `${lat}°N, ${lng}°E Sector`;
      let regionDesc = 'Indian Subcontinent';

      if (lng >= 76.0 && lng <= 78.5 && lat >= 27.0 && lat <= 30.5) {
        cityName = 'Delhi NCR Metropolis';
        regionDesc = 'Capital Territory & Northern Plains';
      } else if (lng >= 70.0 && lng <= 76.0 && lat >= 24.0 && lat <= 30.0) {
        cityName = 'Jaipur, Rajasthan';
        regionDesc = 'Thar Desert Basin';
      } else if (lng >= 71.5 && lng <= 74.0 && lat >= 18.0 && lat <= 20.5) {
        cityName = 'Mumbai Coastal Metro';
        regionDesc = 'Konkan Coastal Zone';
      } else if (lng >= 75.0 && lng <= 78.5 && lat >= 11.5 && lat <= 15.0) {
        cityName = 'Bengaluru Urban Region';
        regionDesc = 'Deccan Plateau Corridor';
      } else if (lng >= 79.0 && lng <= 81.5 && lat >= 11.5 && lat <= 15.0) {
        cityName = 'Chennai Metropolitan Belt';
        regionDesc = 'Coromandel Coastal Region';
      } else if (lng >= 86.0 && lng <= 90.0 && lat >= 21.0 && lat <= 24.5) {
        cityName = 'Kolkata & Delta Area';
        regionDesc = 'Lower Gangetic Basin';
      } else if (lng >= 77.0 && lng <= 80.0 && lat >= 16.0 && lat <= 19.0) {
        cityName = 'Hyderabad Urban Sector';
        regionDesc = 'Telangana Plateau';
      } else if (lng >= 70.0 && lng <= 74.0 && lat >= 21.0 && lat <= 24.0) {
        cityName = 'Ahmedabad & Gujarat Region';
        regionDesc = 'Gujarat Western Plains';
      } else if (lng >= 90.0 && lng <= 96.0 && lat >= 24.0 && lat <= 28.5) {
        cityName = 'Guwahati & Northeast Valley';
        regionDesc = 'Brahmaputra Basin';
      } else if (lng >= 83.0 && lng <= 95.0 && lat >= 10.0 && lat <= 22.0) {
        cityName = `Bay of Bengal (${lat}°N, ${lng}°E)`;
        regionDesc = 'Tropical Marine Cyclone Basin';
      } else if (lng >= 60.0 && lng <= 71.5 && lat >= 10.0 && lat <= 22.0) {
        cityName = `Arabian Sea (${lat}°N, ${lng}°E)`;
        regionDesc = 'Western Marine Boundary';
      } else if (lat >= 30.5) {
        cityName = `Himalayan Ridge (${lat}°N, ${lng}°E)`;
        regionDesc = 'Northern High Altitude Alpine Zone';
      } else if (lat < 11.5) {
        cityName = `Peninsular South (${lat}°N, ${lng}°E)`;
        regionDesc = 'Equatorial Monsoon Corridor';
      } else {
        cityName = `Central India (${lat}°N, ${lng}°E)`;
        regionDesc = 'Deccan Synoptic Zone';
      }

      // ── 2. Dynamic Micro-Physics Calculation for Clicked Spot ──────────────
      let weight = 0.5;
      if (lng >= 68.0 && lng <= 76.0 && lat >= 22.0 && lat <= 30.0) {
        weight = 0.85 + diurnalFactor * 0.15;
      } else if (lat > 30.5) {
        weight = 0.15;
      } else if (lat < 12.0) {
        weight = 0.48;
      } else {
        weight = 0.52 + diurnalFactor * 0.12;
      }

      const temp = Math.round(12 + weight * 36);
      const humidity = Math.round(30 + (1 - weight) * 58 + Math.abs(Math.sin(lat + lng)) * 10);
      const windSpeed = Math.round(12 + Math.abs(Math.cos(lat * 0.4 + lng * 0.2)) * 34);
      const pressure = Math.round(1012 - (lat < 20 ? 8 : 2) - Math.abs(Math.sin(lng)) * 6);

      // AQI formula based on urban density & coordinates
      let aqi = 65;
      if (lat >= 25.0 && lat <= 30.0 && lng >= 75.0 && lng <= 82.0) {
        aqi = Math.round(240 + Math.abs(Math.sin(lat * 3 + lng * 2)) * 120);
      } else if (lat >= 18.0 && lat <= 23.0 && lng >= 72.0 && lng <= 88.0) {
        aqi = Math.round(130 + Math.abs(Math.sin(lat + lng)) * 80);
      } else {
        aqi = Math.round(45 + Math.abs(Math.sin(lat * 2)) * 45);
      }

      // ── 3. Categorize Category & Severity dynamically ─────────────────────
      let category: PlaceReport['category'] = 'thermal';
      let severity: PlaceReport['severity'] = 'Pleasant';
      let summary = `Live synoptic observation for ${cityName} (${regionDesc}). Atmospheric pressure steady at ${pressure} hPa with wind speeds of ${windSpeed} km/h.`;

      let aqiBreakdown: PlaceReport['aqiBreakdown'];
      let cycloneModels: PlaceReport['cycloneModels'];
      let floodDepthMeters: number | undefined;
      let submergedBuildings: number | undefined;
      let skewTData: PlaceReport['skewTData'];

      if (activeLayers.includes('aqi_circles') || (aqi > 250 && !activeLayers.includes('heatmap_temp'))) {
        category = 'aqi';
        severity = aqi > 300 ? 'Hazardous AQI' : 'Red Alert';
        summary = `Air quality alert for ${cityName}. Ambient PM2.5 levels elevated (${Math.round(aqi * 0.55)} µg/m³), exceeding WHO limits. Vulnerable groups advised to stay indoors.`;
        aqiBreakdown = {
          pm25: Math.round(aqi * 0.55),
          pm10: Math.round(aqi * 0.92),
          no2: Math.round(30 + (aqi / 10)),
          status: aqi > 300 ? 'Hazardous / Severe' : 'Poor / Unhealthy',
        };
      } else if (activeLayers.includes('spaghetti_plots') || (lng >= 83.0 && lng <= 95.0 && lat >= 10.0 && lat <= 22.0)) {
        category = 'cyclone';
        severity = 'Storm Warning';
        summary = `Tropical weather alert over ${cityName}. Multi-model ensemble tracking active low-pressure disturbance in the Bay of Bengal with central pressure ${pressure} hPa.`;
        cycloneModels = {
          gfsLandfall: `GFS Model: ${lat > 18 ? 'Odisha Coast (+36h)' : 'Andhra Coast (+42h)'}`,
          ecmwfLandfall: `ECMWF HRES: ${lat > 18 ? 'Dhamra Port (+40h)' : 'Kakinada (+48h)'}`,
          genCastLandfall: `GenCast AI: ${lat > 18 ? 'Bhadrak (+38h)' : 'Machilipatnam (+44h)'}`,
          centralPressure: `${pressure} hPa`,
        };
      } else if (activeLayers.includes('flood_extrusion') || (lng >= 72.8 && lng <= 73.0 && lat >= 18.9 && lat <= 19.1)) {
        category = 'flood';
        severity = 'Severe Flood';
        summary = `Hydrological flood inundation warning for ${cityName}. High tide surge level reaching +2.4 meters with localized urban runoff.`;
        floodDepthMeters = 2.4;
        submergedBuildings = Math.round(18 + Math.abs(Math.sin(lat * 10)) * 30);
      } else if (temp >= 40) {
        category = 'thermal';
        severity = 'Extreme Heat';
        summary = `Severe heatwave red alert for ${cityName} (${regionDesc}). Peak afternoon temperatures reaching ${temp}°C. Avoid direct sun exposure between 11 AM - 4 PM.`;
      } else if (temp >= 32) {
        category = 'thermal';
        severity = 'Monsoon Watch';
        summary = `Humid tropical weather conditions observed in ${cityName}. High moisture transport from nearby coastal waters.`;
      } else {
        category = 'thermal';
        severity = 'Pleasant';
        summary = `Mild and pleasant meteorological conditions recorded in ${cityName} (${regionDesc}). Clear skies with light breezes.`;
      }

      // Generate 24h hourly forecast trend tailored to clicked temp
      const hourly = [
        { time: '00:00', temp: Math.round(temp - 5) },
        { time: '04:00', temp: Math.round(temp - 7) },
        { time: '08:00', temp: Math.round(temp - 2) },
        { time: '12:00', temp: Math.round(temp + 2) },
        { time: '14:00', temp: Math.round(temp + 4) },
        { time: '18:00', temp: Math.round(temp + 1) },
        { time: '22:00', temp: Math.round(temp - 3) },
      ];

      setNewsReport({
        category,
        cityOrRegion: cityName,
        lat,
        lng,
        temp,
        condition: severity,
        severity,
        humidity,
        windSpeed,
        aqi,
        pressure,
        summary,
        hourly,
        aqiBreakdown,
        cycloneModels,
        floodDepthMeters,
        submergedBuildings,
        skewTData,
      });
    });

    const canvasEl = map.getCanvas();
    const handleMouseLeave = () => setHoverInfo(null);
    canvasEl.addEventListener('mouseleave', handleMouseLeave);

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) mapRef.current.resize();
    });
    if (mapContainer.current) resizeObserver.observe(mapContainer.current);

    mapRef.current = map;
    return () => {
      canvasEl.removeEventListener('mouseleave', handleMouseLeave);
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Fly camera on camera state change
  const prevCenterRef = useRef<string>('');
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const key = `${mapCenter[0]},${mapCenter[1]},${mapZoom}`;
    if (prevCenterRef.current === key) return;
    prevCenterRef.current = key;
    map.flyTo({
      center: mapCenter,
      zoom: mapZoom,
      pitch: mapPitch,
      bearing: mapBearing,
      essential: true,
      duration: 2000,
    });
  }, [mapCenter, mapZoom, mapPitch, mapBearing]);

  // ── Dynamic style switching — runs whenever user picks a new style ───────────
  // activeMap is React state (set after map.on('load')), so it's a valid dep.
  useEffect(() => {
    if (!activeMap) return;
    const styleSpec = MAP_STYLES[selectedMapStyle] || MAP_STYLES['dark'];
    activeMap.setStyle(styleSpec);
  }, [activeMap, selectedMapStyle]);

  const windActive = activeLayers.includes('wind_particles');
  const floodActive = activeLayers.includes('flood_extrusion');
  const cycloneActive = activeLayers.includes('spaghetti_plots');
  const isobarsActive = activeLayers.includes('pressure_isobars');
  const aqiActive = activeLayers.includes('aqi_circles');
  const drawActive = activeLayers.includes('draw_field');

  return (
    <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
      <div ref={mapContainer} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
      <ThermalFieldCanvas map={activeMap} />
      <PrecipitationFieldCanvas map={activeMap} />
      {windActive && <WindParticles />}
      {floodActive && <FloodExtrusion map={activeMap} />}
      {cycloneActive && <SpaghettiPlots map={activeMap} />}
      {isobarsActive && <IsobarLayer map={activeMap} />}
      {aqiActive && <AQIMarkers map={activeMap} />}
      {drawActive && <PolygonDraw map={activeMap} />}

      {/* TV Weather News Channel Flash Report Card Overlay */}
      <NewsReportCard report={newsReport} onClose={() => setNewsReport(null)} />

      {/* Sleek Minimal Pointer Tooltip */}
      {hoverInfo && (
        <div
          style={{
            position: 'absolute',
            left: hoverInfo.x + 14,
            top: hoverInfo.y - 12,
            pointerEvents: 'none',
            zIndex: 30,
            background: 'rgba(10, 10, 12, 0.88)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.20)',
            borderRadius: 6,
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
          }}
        >
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#8E8E93' }}>
            {hoverInfo.lat}°N, {hoverInfo.lng}°E
          </span>
          <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.2)' }} />
          <span style={{ fontSize: 13, fontWeight: 800, color: hoverInfo.temp >= 40 ? '#ff1744' : hoverInfo.temp >= 30 ? '#ffea00' : '#00d4ff', fontFamily: 'monospace' }}>
            {hoverInfo.temp}°C
          </span>
        </div>
      )}
    </div>
  );
};

export default MapCanvas;

