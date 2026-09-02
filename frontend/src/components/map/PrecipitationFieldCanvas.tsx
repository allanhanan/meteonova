'use client';
import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import { useAppStore } from '@/lib/store';

interface PrecipitationFieldCanvasProps {
  map: maplibregl.Map | null;
}

// ── Multi-Octave Rain Noise ──────────────────────────────────────────────────
function rainTurbulence(lng: number, lat: number, t: number): number {
  const sin1 = Math.sin(lng * 0.18 + t * 0.08 + Math.cos(lat * 0.15));
  const sin2 = Math.cos(lat * 0.20 - t * 0.06 + Math.sin(lng * 0.16));
  const sin3 = Math.sin((lng * 0.1 + lat * 0.1) + t * 0.04);
  return (sin1 + sin2 + sin3) / 3.0; // Smooth -1.0 to +1.0
}

// ── 2D Smooth Gaussian Spatial Kernel ────────────────────────────────────────
function gaussianRainKernel(
  lng: number,
  lat: number,
  centerLng: number,
  centerLat: number,
  sigmaLng: number,
  sigmaLat: number,
  intensity: number
): number {
  const dx = (lng - centerLng) / sigmaLng;
  const dy = (lat - centerLat) / sigmaLat;
  return intensity * Math.exp(-(dx * dx + dy * dy));
}

// ── Precipitation Color Spectrum (Radar Scale mm/hr) ────────────────────────
// Light Rain (Cyan #00e5ff) -> Moderate Rain (Blue #0055ff) -> Heavy Monsoon (Purple #7000ff) -> Torrential Downpour (Magenta #ff00aa)
function getRainColor(rateMmHr: number): [number, number, number, number] {
  if (rateMmHr < 1.0) return [0, 0, 0, 0];

  // Map 1mm/h to 120mm/h -> 0.0 to 1.0
  const norm = Math.max(0.0, Math.min(1.0, (rateMmHr - 1.0) / 119.0));

  if (norm < 0.25) {
    const t = norm / 0.25;
    return [0, Math.round(229 * (1 - t) + 85 * t), Math.round(255 * (1 - t) + 255 * t), 0.78];
  } else if (norm < 0.55) {
    const t = (norm - 0.25) / 0.30;
    return [Math.round(0 * (1 - t) + 112 * t), Math.round(85 * (1 - t) + 0 * t), 255, 0.85];
  } else if (norm < 0.82) {
    const t = (norm - 0.55) / 0.27;
    return [Math.round(112 * (1 - t) + 255 * t), 0, Math.round(255 * (1 - t) + 170 * t), 0.90];
  } else {
    const t = (norm - 0.82) / 0.18;
    return [255, 0, Math.round(170 * (1 - t) + 80 * t), 0.95];
  }
}

export const PrecipitationFieldCanvas: React.FC<PrecipitationFieldCanvasProps> = ({ map }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeLayers = useAppStore((s) => s.mapState.activeLayers);
  const currentTimeOffset = useAppStore((s) => s.currentTimeOffset);
  const isActive = activeLayers.includes('heatmap_precip');

  useEffect(() => {
    if (!map || !canvasRef.current || !isActive) return;

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

      // High-resolution 200x140 rain radar mesh
      const offscreen = document.createElement('canvas');
      const meshW = 200;
      const meshH = 140;
      offscreen.width = meshW;
      offscreen.height = meshH;
      const offCtx = offscreen.getContext('2d');
      if (!offCtx) return;

      const imgData = offCtx.createImageData(meshW, meshH);
      const data = imgData.data;

      // Moving cyclone rainband coordinates
      const stormLng = 89.0 - currentTimeOffset * 0.14;
      const stormLat = 11.5 + currentTimeOffset * 0.18;
      const timeT = currentTimeOffset * 0.1;

      for (let y = 0; y < meshH; y++) {
        const screenY = (y / meshH) * height;

        for (let x = 0; x < meshW; x++) {
          const screenX = (x / meshW) * width;
          const lngLat = map.unproject([screenX, screenY]);
          const lng = lngLat.lng;
          const lat = lngLat.lat;

          let rainRate = 0.0;

          // 1. Monsoon Heavy Rain Belt over Western Ghats & Kerala
          const keralaRain = gaussianRainKernel(lng, lat, 75.8, 10.5, 2.5, 4.0, 65.0);
          rainRate += keralaRain;

          // 2. Assam & Meghalaya Orographic Rainfall
          const assamRain = gaussianRainKernel(lng, lat, 92.0, 26.0, 3.5, 2.0, 85.0);
          rainRate += assamRain;

          // 3. Cyclone BOB-01 Intense Eyewall Spiral Rainband
          const stormDist = Math.sqrt(Math.pow(lng - stormLng, 2) + Math.pow(lat - stormLat, 2));
          if (stormDist < 6.5) {
            const eyewallRain = (1.0 - stormDist / 6.5) * 110.0;
            const spiralBand = Math.max(0, Math.sin(stormDist * 2.0 - timeT * 3.0)) * 40.0;
            rainRate += eyewallRain + spiralBand;
          }

          // 4. Organic rain cell turbulence
          const turbulence = Math.max(0, rainTurbulence(lng, lat, timeT)) * 25.0;
          if (rainRate > 5.0) rainRate += turbulence;

          // Clamp max rainfall rate (120 mm/hr)
          rainRate = Math.min(120, rainRate);

          const [r, g, b, a] = getRainColor(rainRate);
          const idx = (y * meshW + x) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = Math.round(a * 220);
        }
      }

      offCtx.putImageData(imgData, 0, 0);

      // Render smooth continuous precipitation radar scaled to map viewport
      ctx.save();
      ctx.globalAlpha = 0.88;
      ctx.filter = 'blur(8px)';
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(offscreen, 0, 0, width, height);
      ctx.filter = 'none';
      ctx.restore();
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
  }, [map, isActive, currentTimeOffset]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 2,
      }}
    />
  );
};
