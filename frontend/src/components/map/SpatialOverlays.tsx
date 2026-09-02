'use client';
import React, { useEffect, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import { useAppStore } from '@/lib/store';
import { SkewTDiagram } from '../charts/SkewTDiagram';
import { Activity, Wind, Flame, Building2, MapPin, X } from 'lucide-react';

interface OverlayItem {
  id: string;
  lng: number;
  lat: number;
  title: string;
  type: 'aqi' | 'skew_t' | 'cyclone' | 'heatwave' | 'flood';
  layerKey: string;
}

const OVERLAYS: OverlayItem[] = [
  { id: 'aqi-delhi', lng: 77.209, lat: 28.614, title: 'Delhi NCR · Air Quality', type: 'aqi', layerKey: 'aqi_circles' },
  { id: 'skewt-mumbai', lng: 72.878, lat: 19.076, title: 'Mumbai FL350 Sounding', type: 'skew_t', layerKey: 'aqi_circles' },
  { id: 'cyclone-bob', lng: 86.5, lat: 18.8, title: 'Cyclone BOB-01 Track', type: 'cyclone', layerKey: 'spaghetti_plots' },
  { id: 'heatwave-raj', lng: 71.5, lat: 26.5, title: 'Rajasthan Heatwave Red Alert', type: 'heatwave', layerKey: 'heatmap_temp' },
  { id: 'flood-mumbai', lng: 72.825, lat: 18.928, title: '3D Surge Flood Risk', type: 'flood', layerKey: 'flood_extrusion' },
];

export const SpatialOverlays: React.FC<{ map: maplibregl.Map | null }> = ({ map }) => {
  const { mapState } = useAppStore();
  const [positions, setPositions] = useState<Record<string, { x: number; y: number; visible: boolean }>>({});
  const [expandedId, setExpandedId] = useState<string | null>('aqi-delhi');

  const updatePositions = useCallback(() => {
    if (!map) return;
    const nextPos: Record<string, { x: number; y: number; visible: boolean }> = {};

    OVERLAYS.forEach((item) => {
      const point = map.project([item.lng, item.lat]);
      const bounds = map.getBounds();
      const inBounds = bounds.contains([item.lng, item.lat]);
      nextPos[item.id] = { x: point.x, y: point.y, visible: inBounds };
    });

    setPositions(nextPos);
  }, [map]);

  useEffect(() => {
    if (!map) return;

    const animId = requestAnimationFrame(updatePositions);
    map.on('move', updatePositions);
    map.on('zoom', updatePositions);
    map.on('pitch', updatePositions);
    map.on('rotate', updatePositions);

    return () => {
      cancelAnimationFrame(animId);
      map.off('move', updatePositions);
      map.off('zoom', updatePositions);
      map.off('pitch', updatePositions);
      map.off('rotate', updatePositions);
    };
  }, [map, updatePositions]);

  if (!map) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 15, overflow: 'hidden' }}>
      {OVERLAYS.map((item) => {
        const pos = positions[item.id];
        if (!pos || !pos.visible) return null;

        const isExpanded = expandedId === item.id;
        const layerActive = mapState.activeLayers.includes(item.layerKey);

        if (!layerActive) return null;

        return (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              transform: 'translate(-50%, -100%) translateY(-12px)',
              pointerEvents: 'auto',
              transition: 'transform 0.1s ease-out',
            }}
          >
            {/* Expanded spatial card */}
            {isExpanded ? (
              <div
                className="glass anim-scale-up"
                style={{
                  width: item.type === 'skew_t' ? 320 : 280,
                  borderRadius: 14,
                  padding: 12,
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--glass-border-str)',
                }}
              >
                {/* Card header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin style={{ width: 14, height: 14, color: 'var(--blue)' }} />
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)' }}>{item.title}</span>
                  </div>
                  <button
                    onClick={() => setExpandedId(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: 2 }}
                  >
                    <X style={{ width: 14, height: 14 }} />
                  </button>
                </div>

                {/* Content by overlay type */}
                {item.type === 'aqi' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 24, fontWeight: 800, color: '#a855f7', fontFamily: "'JetBrains Mono', monospace" }}>342</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#a855f7', background: 'rgba(168,85,247,0.15)', padding: '2px 8px', borderRadius: 6 }}>
                        Hazardous / Severe
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                      <div style={{ background: 'var(--glass-3)', padding: '6px 8px', borderRadius: 8, textAlign: 'center' }}>
                        <p style={{ fontSize: 9.5, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>PM2.5</p>
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>184</p>
                      </div>
                      <div style={{ background: 'var(--glass-3)', padding: '6px 8px', borderRadius: 8, textAlign: 'center' }}>
                        <p style={{ fontSize: 9.5, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>PM10</p>
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>312</p>
                      </div>
                      <div style={{ background: 'var(--glass-3)', padding: '6px 8px', borderRadius: 8, textAlign: 'center' }}>
                        <p style={{ fontSize: 9.5, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>NO₂</p>
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>62</p>
                      </div>
                    </div>
                  </div>
                )}

                {item.type === 'skew_t' && <SkewTDiagram />}

                {item.type === 'cyclone' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <Wind style={{ width: 14, height: 14, color: 'var(--blue)' }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Cat-3 Severe Cyclone</span>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.3 }}>
                      GFS & ECMWF ensemble consensus projects Odisha landfall near Paradip with max sustained winds of 145 km/h.
                    </p>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span style={{ fontSize: 10, background: 'rgba(0,229,255,0.15)', color: '#00e5ff', padding: '3px 6px', borderRadius: 4, fontWeight: 600 }}>GFS: 85.8°E</span>
                      <span style={{ fontSize: 10, background: 'rgba(249,115,22,0.15)', color: '#f97316', padding: '3px 6px', borderRadius: 4, fontWeight: 600 }}>ECMWF: 86.5°E</span>
                    </div>
                  </div>
                )}

                {item.type === 'heatwave' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <Flame style={{ width: 14, height: 14, color: 'var(--red)' }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)' }}>46.8°C Peak Thermal Anomaly</span>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                      Severe Heatwave condition across Jaisalmer & Barmer districts (+6.8°C above normal baseline).
                    </p>
                  </div>
                )}

                {item.type === 'flood' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <Building2 style={{ width: 14, height: 14, color: 'var(--orange)' }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--orange)' }}>1.8m Surge Inundation Risk</span>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                      South Mumbai coastal digital twin highlights 42 commercial structures in extreme storm surge inundation zone.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Minimized spatial pill badge on map */
              <button
                onClick={() => setExpandedId(item.id)}
                className="glass"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 10px',
                  borderRadius: 20,
                  cursor: 'pointer',
                  border: '1px solid var(--glass-border-md)',
                  boxShadow: 'var(--shadow-md)',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.type === 'aqi' && <Activity style={{ width: 12, height: 12, color: '#a855f7' }} />}
                {item.type === 'skew_t' && <Activity style={{ width: 12, height: 12, color: 'var(--blue)' }} />}
                {item.type === 'cyclone' && <Wind style={{ width: 12, height: 12, color: '#00e5ff' }} />}
                {item.type === 'heatwave' && <Flame style={{ width: 12, height: 12, color: 'var(--red)' }} />}
                {item.type === 'flood' && <Building2 style={{ width: 12, height: 12, color: 'var(--orange)' }} />}
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</span>
              </button>
            )}

            {/* Pin tail pointing down to coordinate */}
            <div
              style={{
                width: 2,
                height: 10,
                background: 'var(--blue)',
                margin: '0 auto',
                boxShadow: '0 0 6px var(--blue)',
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
