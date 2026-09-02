'use client';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Thermometer, Sprout } from 'lucide-react';
import { SkewTDiagram } from '../charts/SkewTDiagram';

interface FlyToParams {
  location_name?: string;
  lat?: number;
  lon?: number;
}

interface RenderLayerParams {
  layer_type?: string;
}

interface GenerateChartParams {
  chart_type?: string;
  title?: string;
  location?: string;
  data?: {
    years?: number[];
    temps?: number[];
    recommendation?: string;
    soil_moisture?: string;
    degree_days?: number;
    aqi?: number;
    status?: string;
    pm25?: number;
    pm10?: number;
    no2?: number;
    cape?: number;
    cin?: number;
    lifted_index?: number;
    flight_level?: string;
    turbulence_risk?: string;
  };
}

interface ToolCallCardProps {
  toolCall: {
    name: string;
    parameters: Record<string, unknown>;
  };
}

export const ToolCallCard: React.FC<ToolCallCardProps> = ({ toolCall }) => {
  const { name, parameters } = toolCall;

  if (name === 'flyTo') {
    const params = parameters as FlyToParams;
    return (
      <div className="mt-2 p-2 bg-blue-950/40 border border-blue-500/30 rounded-lg text-xs text-blue-300 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
        Flew camera to <strong className="text-white">{params.location_name || 'Location'}</strong> (Lat {params.lat}, Lon {params.lon})
      </div>
    );
  }

  if (name === 'renderMapLayer') {
    const params = parameters as RenderLayerParams;
    return (
      <div className="mt-2 p-2 bg-cyan-950/40 border border-cyan-500/30 rounded-lg text-xs text-cyan-300 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400" />
        Activated WebGL Layer: <strong className="text-white uppercase">{(params.layer_type || 'layer').replace('_', ' ')}</strong>
      </div>
    );
  }

  if (name === 'generateChart') {
    const params = parameters as GenerateChartParams;
    const { chart_type, title, location, data = {} } = params;

    if (chart_type === 'climate_trend') {
      const chartData = data.years?.map((y: number, idx: number) => ({
        year: y,
        temp: data.temps?.[idx]
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

    if (chart_type === 'skew_t') {
      return <SkewTDiagram location={location} data={data} />;
    }

    if (chart_type === 'aqi_breakdown') {
      return (
        <div className="mt-3 p-3 bg-purple-950/60 border border-purple-500/30 rounded-xl text-xs text-purple-200">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-purple-300">Air Quality Index — {location}</span>
            <span className="px-2 py-0.5 rounded bg-purple-500/30 text-purple-200 font-bold">{data.aqi || 342} AQI</span>
          </div>
          <p className="mt-1 text-slate-300">{data.status || 'Hazardous / Severe Air Quality'}</p>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center text-slate-400 bg-purple-950/40 p-2 rounded-lg">
            <div>PM2.5: <span className="text-white font-bold">{data.pm25 || 184}</span></div>
            <div>PM10: <span className="text-white font-bold">{data.pm10 || 312}</span></div>
            <div>NO2: <span className="text-white font-bold">{data.no2 || 62}</span></div>
          </div>
        </div>
      );
    }
  }

  return null;
};
