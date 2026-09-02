'use client';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CloudRain, Thermometer, ShieldAlert, Sprout } from 'lucide-react';

interface ToolCallCardProps {
  toolCall: {
    name: string;
    parameters: any;
  };
}

export const ToolCallCard: React.FC<ToolCallCardProps> = ({ toolCall }) => {
  const { name, parameters } = toolCall;

  if (name === 'flyTo') {
    return (
      <div className="mt-2 p-2 bg-blue-950/40 border border-blue-500/30 rounded-lg text-xs text-blue-300 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
        Flew camera to <strong className="text-white">{parameters.location_name}</strong> (Lat {parameters.lat}, Lon {parameters.lon})
      </div>
    );
  }

  if (name === 'renderMapLayer') {
    return (
      <div className="mt-2 p-2 bg-cyan-950/40 border border-cyan-500/30 rounded-lg text-xs text-cyan-300 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400" />
        Activated WebGL Layer: <strong className="text-white uppercase">{parameters.layer_type.replace('_', ' ')}</strong>
      </div>
    );
  }

  if (name === 'generateChart') {
    const { chart_type, title, location, data } = parameters;

    if (chart_type === 'climate_trend') {
      const chartData = data.years?.map((y: number, idx: number) => ({
        year: y,
        temp: data.temps[idx]
      })) || [];

      return (
        <div className="mt-3 p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-xs">
          <div className="flex items-center gap-2 mb-2 text-amber-400 font-semibold">
            <Thermometer className="w-4 h-4" />
            {title || `Climate Trend — ${location}`}
          </div>
          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    if (chart_type === 'crop_advisory') {
      return (
        <div className="mt-3 p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-xs text-emerald-200">
          <div className="flex items-center gap-2 mb-1 text-emerald-400 font-semibold text-sm">
            <Sprout className="w-4 h-4" />
            Smart Agro-Meteorological Advisory
          </div>
          <p className="mt-1 text-slate-300">{data.recommendation}</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-slate-400">
            <div>Soil Moisture: <span className="text-white">{data.soil_moisture}</span></div>
            <div>Growing Degree Days: <span className="text-white">{data.degree_days}</span></div>
          </div>
        </div>
      );
    }
  }

  return null;
};
