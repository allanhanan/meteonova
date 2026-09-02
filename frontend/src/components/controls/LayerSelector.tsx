'use client';
import React from 'react';
import { useAppStore } from '@/lib/store';
import { Wind, Thermometer, CloudRain, ShieldAlert, Building2, GitBranch, Activity, Layers } from 'lucide-react';
import { PolygonDraw } from '../map/PolygonDraw';

export const LayerSelector: React.FC = () => {
  const { mapState, toggleLayer } = useAppStore();

  const layers = [
    { id: 'wind_particles', label: 'Wind Particles', icon: Wind, color: 'text-cyan-400' },
    { id: 'heatmap_temp', label: 'Thermal Heatmap', icon: Thermometer, color: 'text-orange-400' },
    { id: 'heatmap_precip', label: 'Precipitation', icon: CloudRain, color: 'text-blue-400' },
    { id: 'flood_extrusion', label: '3D Flood Risk', icon: Building2, color: 'text-purple-400' },
    { id: 'spaghetti_plots', label: 'Spaghetti Tracks', icon: GitBranch, color: 'text-pink-400' },
    { id: 'aqi_circles', label: 'AQI Stations', icon: Activity, color: 'text-emerald-400' },
    { id: 'pressure_isobars', label: 'Isobar Contours', icon: Layers, color: 'text-blue-300' },
    { id: 'alert_zones', label: 'Disaster Alerts', icon: ShieldAlert, color: 'text-red-400' }
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <PolygonDraw />
      {layers.map((layer) => {
        const Icon = layer.icon;
        const isActive = mapState.activeLayers.includes(layer.id);
        return (
          <button
            key={layer.id}
            onClick={() => toggleLayer(layer.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              isActive
                ? 'bg-slate-800 text-white border border-slate-600 shadow-md shadow-slate-900/50 scale-105'
                : 'bg-slate-950/60 text-slate-400 border border-slate-800/80 hover:text-slate-200'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${layer.color}`} />
            {layer.label}
          </button>
        );
      })}
    </div>
  );
};
