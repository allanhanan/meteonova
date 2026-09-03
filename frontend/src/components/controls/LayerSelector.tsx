'use client';
import React from 'react';
import { useAppStore } from '@/lib/store';
import { Wind, Thermometer, CloudRain, ShieldAlert, Building2, GitBranch, Activity, Layers, Sprout } from 'lucide-react';
import { MapStyleSelector } from './MapStyleSelector';

const LAYERS = [
  { id: 'wind_particles',   label: 'Wind',          icon: Wind,        pill: 'pill-teal'   },
  { id: 'heatmap_temp',     label: 'Temperature',   icon: Thermometer, pill: 'pill-orange'  },
  { id: 'heatmap_precip',   label: 'Precipitation', icon: CloudRain,   pill: 'pill-blue'    },
  { id: 'flood_extrusion',  label: '3D Flood',      icon: Building2,   pill: 'pill-indigo'  },
  { id: 'spaghetti_plots',  label: 'Cyclone',       icon: GitBranch,   pill: 'pill-purple'  },
  { id: 'aqi_circles',      label: 'AQI',           icon: Activity,    pill: 'pill-yellow'  },
  { id: 'pressure_isobars', label: 'Isobars',       icon: Layers,      pill: 'pill-blue'    },
  { id: 'alert_zones',      label: 'Alerts',        icon: ShieldAlert, pill: 'pill-red'     },
];

export const LayerSelector: React.FC = () => {
  const { mapState, toggleLayer } = useAppStore();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'nowrap' }}>
      <MapStyleSelector />

      {/* Draw field pill */}
      <button className="layer-pill pill-green">
        <Sprout style={{ width: 12, height: 12 }} />
        Draw Field
      </button>

      <div style={{ width: 1, height: 20, background: 'var(--glass-border)', margin: '0 2px', flexShrink: 0 }} />

      {LAYERS.map(({ id, label, icon: Icon, pill }) => {
        const active = mapState.activeLayers.includes(id);
        return (
          <button
            key={id}
            onClick={() => toggleLayer(id)}
            className={`layer-pill ${active ? pill : ''}`}
          >
            <Icon style={{ width: 12, height: 12, flexShrink: 0 }} />
            {label}
          </button>
        );
      })}
    </div>
  );
};
