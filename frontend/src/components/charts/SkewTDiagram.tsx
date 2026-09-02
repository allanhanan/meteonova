'use client';
import React from 'react';
import { Plane, AlertTriangle } from 'lucide-react';

interface SkewTDiagramProps {
  location?: string;
  data?: {
    cape?: number;
    cin?: number;
    lifted_index?: number;
    flight_level?: string;
    turbulence_risk?: string;
  };
}

export const SkewTDiagram: React.FC<SkewTDiagramProps> = ({
  location = 'Delhi → Mumbai Corridor',
  data = {
    cape: 1850,
    cin: -45,
    lifted_index: -4.2,
    flight_level: 'FL350',
    turbulence_risk: 'Moderate Convective'
  }
}) => {
  return (
    <div className="mt-3 p-3.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold">
          <Plane className="w-4 h-4 text-cyan-400" />
          Aero-Met Sounding: {location}
        </div>
        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
          {data.flight_level || 'FL350'}
        </span>
      </div>

      {/* Thermodynamic Indices Grid */}
      <div className="grid grid-cols-3 gap-2 mb-3 bg-slate-950/60 p-2 rounded-lg text-center border border-slate-800">
        <div>
          <div className="text-[10px] text-slate-400">CAPE (J/kg)</div>
          <div className="text-sm font-bold text-amber-400">{data.cape}</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400">CIN (J/kg)</div>
          <div className="text-sm font-bold text-blue-400">{data.cin}</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400">Lifted Index</div>
          <div className="text-sm font-bold text-red-400">{data.lifted_index}</div>
        </div>
      </div>

      {/* Sounding Profile Canvas Representation */}
      <div className="relative h-28 w-full bg-slate-950 border border-slate-800 rounded-lg p-2 flex flex-col justify-between overflow-hidden">
        {/* Isobaric Pressure Lines */}
        <div className="absolute inset-0 opacity-20 flex flex-col justify-between pointer-events-none p-1">
          <div className="border-b border-dashed border-cyan-400 text-[8px] text-cyan-400">200 hPa</div>
          <div className="border-b border-dashed border-cyan-400 text-[8px] text-cyan-400">500 hPa</div>
          <div className="border-b border-dashed border-cyan-400 text-[8px] text-cyan-400">850 hPa</div>
          <div className="border-b border-dashed border-cyan-400 text-[8px] text-cyan-400">1000 hPa</div>
        </div>

        {/* Temperature vs Dewpoint Curve SVG */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
          {/* Temperature Curve (Red) */}
          <path
            d="M 30,95 Q 60,60 110,40 T 170,10"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2.5"
          />
          {/* Dewpoint Curve (Green) */}
          <path
            d="M 20,95 Q 40,65 80,45 T 130,10"
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeDasharray="3,3"
          />
          {/* CAPE Area Shading */}
          <path
            d="M 60,60 Q 90,45 110,40 L 80,45 Z"
            fill="rgba(239, 68, 68, 0.25)"
          />
        </svg>

        <div className="relative z-10 flex justify-between items-end text-[9px] text-slate-400">
          <span className="text-emerald-400 font-mono">■ Dewpoint Td</span>
          <span className="text-red-400 font-mono">■ Temp T</span>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-300">
        <span className="flex items-center gap-1 text-amber-300">
          <AlertTriangle className="w-3.5 h-3.5" />
          Turbulence Risk: {data.turbulence_risk}
        </span>
      </div>
    </div>
  );
};
