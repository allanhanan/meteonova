'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { MapState } from '@/lib/types';
import { Map, Moon, Sun, Globe, Mountain } from 'lucide-react';

const STYLES: { id: MapState['mapStyle']; label: string; icon: React.ElementType }[] = [
  { id: 'dark',      label: 'Dark Matter', icon: Moon },
  { id: 'satellite', label: 'Satellite',   icon: Globe },
  { id: 'light',     label: 'Light Clean', icon: Sun },
  { id: 'terrain',   label: 'Terrain',     icon: Mountain },
  { id: 'esri_dark', label: 'Esri Canvas', icon: Map },
];

export const MapStyleSelector: React.FC = () => {
  const { mapState, setMapStyle } = useAppStore();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeStyle = STYLES.find((s) => s.id === mapState.mapStyle) || STYLES[0];
  const Icon = activeStyle.icon;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(!open)}
        className="layer-pill pill-purple"
        style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
        title="Switch Map Basemap Style"
      >
        <Icon style={{ width: 13, height: 13 }} />
        <span>Style: {activeStyle.label}</span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            zIndex: 100,
            background: 'rgba(12, 14, 20, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 12,
            padding: '6px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6), 0 0 16px rgba(168, 85, 247, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            minWidth: 160,
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255, 255, 255, 0.45)', padding: '4px 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Select Basemap Style
          </div>
          {STYLES.map((s) => {
            const SIcon = s.icon;
            const isSelected = s.id === mapState.mapStyle;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setMapStyle(s.id);
                  setOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 10px',
                  borderRadius: 8,
                  border: 'none',
                  background: isSelected ? 'rgba(168, 85, 247, 0.25)' : 'transparent',
                  color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.75)',
                  fontSize: 12,
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <SIcon style={{ width: 14, height: 14, color: isSelected ? '#c084fc' : 'inherit' }} />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
