'use client';
import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import { useAppStore } from '@/lib/store';

interface ThermalFieldCanvasProps {
  map: maplibregl.Map | null;
}

// ── Multi-Octave Organic Fluid Turbulence Noise ─────────────────────────────
function organicTurbulence(lng: number, lat: number, t: number): number {
  const sin1 = Math.sin(lng * 0.12 + t * 0.05 + Math.cos(lat * 0.10));
  const sin2 = Math.cos(lat * 0.14 - t * 0.04 + Math.sin(lng * 0.11));
  const sin3 = Math.sin((lng + lat) * 0.08 + t * 0.03);
  return (sin1 + sin2 + sin3) / 3.0;
}

// ── 2D Smooth Gaussian Spatial Anomaly Kernel ────────────────────────────────
function gaussianAnomaly(
  lng: number,
  lat: number,
  centerLng: number,
  centerLat: number,
  sigmaLng: number,
  sigmaLat: number,
  amplitude: number
): number {
  const dx = (lng - centerLng) / sigmaLng;
  const dy = (lat - centerLat) / sigmaLat;
  return amplitude * Math.exp(-(dx * dx + dy * dy));
}

// ── Thermal Color Ramp ───────────────────────────────────────────────────────
function getThermalColor(tempC: number): [number, number, number, number] {
  const norm = Math.max(0.0, Math.min(1.0, (tempC - 12) / 36));

  if (norm < 0.25) {
    const t = norm / 0.25;
    return [0, Math.round(51 * (1 - t) + 212 * t), Math.round(204 * (1 - t) + 255 * t), 0.88];
  } else if (norm < 0.50) {
    const t = (norm - 0.25) / 0.25;
    return [Math.round(255 * t), Math.round(212 * (1 - t) + 234 * t), Math.round(255 * (1 - t)), 0.90];
  } else if (norm < 0.78) {
    const t = (norm - 0.50) / 0.28;
    return [255, Math.round(234 * (1 - t) + 119 * t), 0, 0.93];
  } else {
    const t = (norm - 0.78) / 0.22;
    return [Math.round(255 * (1 - t) + 230 * t), Math.round(119 * (1 - t)), 0, 0.96];
  }
}

// ── Vector Datasets ──────────────────────────────────────────────────────────
const CYCLONE_TRACKS = [
  { model: 'GFS Ensemble', color: '#00f0ff', coords: [[89.0, 11.5], [88.2, 13.8], [87.2, 16.2], [86.1, 18.6], [85.5, 19.8]] },
  { model: 'ECMWF HRES', color: '#ff9500', coords: [[89.0, 11.5], [88.6, 14.2], [88.0, 16.8], [87.2, 19.1], [86.4, 20.2]] },
  { model: 'GenCast AI', color: '#d946ef', coords: [[89.0, 11.5], [88.4, 14.0], [87.6, 16.5], [86.6, 18.9], [85.9, 20.0]] },
];

const ISOBAR_LINES = [
  { pressure: '1000 hPa', coords: [[65.0, 20.0], [72.0, 19.0], [80.0, 18.0], [88.0, 16.0], [96.0, 13.0]] },
  { pressure: '1004 hPa', coords: [[65.0, 23.0], [74.0, 22.0], [82.0, 20.5], [89.0, 18.5], [96.0, 16.0]] },
  { pressure: '1008 hPa', coords: [[65.0, 26.0], [76.0, 25.0], [84.0, 23.0], [91.0, 21.0], [96.0, 19.0]] },
  { pressure: '1012 hPa', coords: [[65.0, 29.0], [77.0, 28.0], [86.0, 26.0], [92.0, 24.0], [96.0, 22.0]] },
  { pressure: '1016 hPa', coords: [[65.0, 32.0], [78.0, 31.0], [87.0, 29.0], [94.0, 27.0], [97.0, 25.0]] },
];

const AQI_STATIONS = [
  { city: 'Delhi', aqi: 342, color: '#a855f7', lng: 77.209, lat: 28.614 },
  { city: 'Mumbai', aqi: 158, color: '#ef4444', lng: 72.878, lat: 19.076 },
  { city: 'Chennai', aqi: 74, color: '#eab308', lng: 80.271, lat: 13.083 },
  { city: 'Kolkata', aqi: 182, color: '#ef4444', lng: 88.364, lat: 22.573 },
  { city: 'Bengaluru', aqi: 48, color: '#22c55e', lng: 77.595, lat: 12.972 },
  { city: 'Hyderabad', aqi: 135, color: '#f97316', lng: 78.486, lat: 17.385 },
  { city: 'Jaipur', aqi: 210, color: '#a855f7', lng: 75.787, lat: 26.912 },
  { city: 'Ahmedabad', aqi: 198, color: '#ef4444', lng: 72.571, lat: 23.023 },
  { city: 'Guwahati', aqi: 88, color: '#eab308', lng: 91.736, lat: 26.144 },
];

export const ThermalFieldCanvas: React.FC<ThermalFieldCanvasProps> = ({ map }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeLayers = useAppStore((s) => s.mapState.activeLayers);
  const currentTimeOffset = useAppStore((s) => s.currentTimeOffset);
  const isTempActive = activeLayers.includes('heatmap_temp');
  const isCycloneActive = activeLayers.includes('spaghetti_plots');
  const isIsobarsActive = activeLayers.includes('pressure_isobars');
  const isAQIActive = activeLayers.includes('aqi_circles');

  useEffect(() => {
    if (!map || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderField = () => {
      const width = map.getContainer().clientWidth;
      const height = map.getContainer().clientHeight;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      // ── 1. Render Thermal Field Raster (If Active) ─────────────────────────
      if (isTempActive) {
        const offscreen = document.createElement('canvas');
        const meshW = 180;
        const meshH = 120;
        offscreen.width = meshW;
        offscreen.height = meshH;
        const offCtx = offscreen.getContext('2d');

        if (offCtx) {
          const imgData = offCtx.createImageData(meshW, meshH);
          const data = imgData.data;

          const hourOfDay = (currentTimeOffset + 14) % 24;
          const diurnalFactor = Math.sin((hourOfDay / 24) * Math.PI * 2);
          const stormLng = 89.0 - currentTimeOffset * 0.14;
          const stormLat = 11.5 + currentTimeOffset * 0.18;
          const timeT = currentTimeOffset * 0.08;

          for (let y = 0; y < meshH; y++) {
            const screenY = (y / meshH) * height;
            for (let x = 0; x < meshW; x++) {
              const screenX = (x / meshW) * width;
              const lngLat = map.unproject([screenX, screenY]);
              const lng = lngLat.lng;
              const lat = lngLat.lat;

              let tempC = 34 - Math.abs(lat - 18) * 0.65;
              tempC += organicTurbulence(lng, lat, timeT) * 4.5;
              tempC += gaussianAnomaly(lng, lat, 72.5, 27.0, 5.5, 4.0, 9.5 + diurnalFactor * 4.0);
              tempC += gaussianAnomaly(lng, lat, 78.5, 20.0, 7.5, 5.0, 5.5 + diurnalFactor * 3.0);
              tempC += gaussianAnomaly(lng, lat, 84.0, 33.5, 12.0, 3.5, -14.0);
              tempC += gaussianAnomaly(lng, lat, stormLng, stormLat, 4.5, 4.5, 8.0);
              if (lat < 4) tempC -= (4 - lat) * 1.5 + Math.sin(lng * 0.15 + timeT) * 2.0;

              tempC = Math.max(12, Math.min(48, tempC));
              const [r, g, b, a] = getThermalColor(tempC);

              const idx = (y * meshW + x) * 4;
              data[idx] = r;
              data[idx + 1] = g;
              data[idx + 2] = b;
              data[idx + 3] = Math.round(a * 120);
            }
          }

          offCtx.putImageData(imgData, 0, 0);

          ctx.save();
          ctx.globalAlpha = 0.40;
          ctx.filter = 'blur(10px)';
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(offscreen, 0, 0, width, height);
          ctx.filter = 'none';
          ctx.restore();
        }
      }

      // ── 2. Render Lat/Lon Dotted Grid Lines ────────────────────────────────
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.font = '10px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';

      for (let lat = -10; lat <= 40; lat += 10) {
        const p1 = map.project([40, lat]);
        const p2 = map.project([110, lat]);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.fillText(`${lat >= 0 ? lat + '°N' : Math.abs(lat) + '°S'}`, Math.max(10, p1.x + 10), p1.y - 4);
      }

      for (let lng = 50; lng <= 105; lng += 10) {
        const p1 = map.project([lng, 40]);
        const p2 = map.project([lng, -15]);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.fillText(`${lng}°E`, p2.x + 4, Math.min(height - 15, p2.y - 10));
      }
      ctx.restore();

      // ── 3. Render Isobar Pressure Contours (If Active) ─────────────────────
      if (isIsobarsActive) {
        ctx.save();
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#00f0ff';

        ISOBAR_LINES.forEach((line) => {
          ctx.beginPath();
          line.coords.forEach(([lng, lat], i) => {
            const p = map.project([lng, lat]);
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          });
          ctx.stroke();

          const midP = map.project(line.coords[2] as [number, number]);
          ctx.fillText(line.pressure, midP.x + 10, midP.y - 4);
        });

        // Low Pressure Center Ring
        const lowP = map.project([87.5, 17.5]);
        ctx.strokeStyle = '#ff1744';
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(lowP.x, lowP.y, 16, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#ff1744';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('LOW 994 hPa', lowP.x + 22, lowP.y + 4);

        ctx.restore();
      }

      // ── 4. Render Cyclone Spaghetti Ensemble Tracks (If Active) ─────────────
      if (isCycloneActive) {
        ctx.save();
        ctx.lineWidth = 4;
        ctx.setLineDash([]);
        ctx.font = 'bold 11px monospace';

        CYCLONE_TRACKS.forEach((track) => {
          ctx.strokeStyle = track.color;
          ctx.beginPath();
          track.coords.forEach(([lng, lat], i) => {
            const p = map.project([lng, lat]);
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          });
          ctx.stroke();

          const lastP = map.project(track.coords[track.coords.length - 1] as [number, number]);
          ctx.fillStyle = track.color;
          ctx.fillText(track.model, lastP.x + 10, lastP.y + 4);
        });

        // Origin marker
        const originP = map.project([89.0, 11.5]);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(originP.x, originP.y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d946ef';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillText('🌀 Cyclone Origin (BOB-01)', originP.x + 12, originP.y + 4);

        ctx.restore();
      }

      // ── 5. Render AQI Stations (If Active) ─────────────────────────────────
      if (isAQIActive) {
        ctx.save();
        ctx.font = 'bold 11px monospace';

        AQI_STATIONS.forEach((st) => {
          const p = map.project([st.lng, st.lat]);
          ctx.beginPath();
          ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
          ctx.fillStyle = st.color;
          ctx.fill();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(`${st.aqi}`, p.x, p.y + 4);

          ctx.textAlign = 'left';
          ctx.fillText(`${st.city}`, p.x + 18, p.y + 4);
        });

        ctx.restore();
      }
    };

    renderField();
    map.on('render', renderField);
    map.on('move', renderField);
    map.on('zoom', renderField);

    return () => {
      map.off('render', renderField);
      map.off('move', renderField);
      map.off('zoom', renderField);
    };
  }, [map, isTempActive, isCycloneActive, isIsobarsActive, isAQIActive, currentTimeOffset]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    />
  );
};
