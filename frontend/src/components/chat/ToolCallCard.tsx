'use client';
import React from 'react';
import { Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Thermometer, Sprout, Navigation2, MapPin, AlertTriangle, Plane } from 'lucide-react';

interface Props {
  toolCall: { name: string; parameters: Record<string, unknown> };
}

type FlyParams   = { location_name?: string; lat?: number; lon?: number };
type LayerParams = { layer_type?: string };
type ChartData   = { years?: number[]; temps?: number[]; recommendation?: string; soil_moisture?: string; degree_days?: number; aqi?: number; status?: string; pm25?: number; pm10?: number; no2?: number; cape?: number; cin?: number; lifted_index?: number; flight_level?: string; turbulence_risk?: string };
type ChartParams = { chart_type?: string; title?: string; location?: string; data?: ChartData };

const LAYER_LABELS: Record<string, string> = {
  wind_particles: 'Wind Field',      heatmap_temp: 'Temperature Map',
  heatmap_precip: 'Precipitation',   flood_extrusion: '3D Flood Layer',
  spaghetti_plots: 'Cyclone Tracks', aqi_circles: 'AQI Stations',
  pressure_isobars: 'Pressure Isobars', alert_zones: 'Alert Zones',
};

// Shared card wrapper
const Card: React.FC<{ accent: string; children: React.ReactNode }> = ({ accent, children }) => (
  <div style={{
    background: 'var(--glass-2)', border: '1px solid var(--glass-border)',
    borderLeft: `3px solid ${accent}`,
    borderRadius: 12, padding: '10px 12px', fontSize: 12,
    marginTop: 4,
  }}>{children}</div>
);

const StatBox: React.FC<{ label: string; value: string | number | undefined; color?: string }> = ({ label, value, color }) => (
  <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 8, padding: '8px 10px', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
    <p style={{ fontSize: 9.5, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</p>
    <p style={{ fontSize: 15, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: color ?? 'var(--text-primary)' }}>{value ?? '—'}</p>
  </div>
);

export const ToolCallCard: React.FC<Props> = ({ toolCall }) => {
  const { name, parameters } = toolCall;

  if (name === 'flyTo') {
    const p = parameters as FlyParams;
    return (
      <Card accent="var(--blue)">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Navigation2 style={{ width: 13, height: 13, color: 'var(--blue)', flexShrink: 0 }} />
          <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
            Flew to{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{p.location_name ?? 'location'}</strong>
            {p.lat && <span style={{ color: 'var(--text-tertiary)', fontFamily: 'monospace', fontSize: 10.5, marginLeft: 6 }}>{p.lat.toFixed(2)}°N {p.lon?.toFixed(2)}°E</span>}
          </span>
        </div>
      </Card>
    );
  }

  if (name === 'renderMapLayer') {
    const p = parameters as LayerParams;
    const label = LAYER_LABELS[p.layer_type ?? ''] ?? p.layer_type;
    return (
      <Card accent="var(--teal)">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MapPin style={{ width: 12, height: 12, color: 'var(--teal)', flexShrink: 0 }} />
          <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
            Layer activated: <strong style={{ color: 'var(--text-primary)' }}>{label}</strong>
          </span>
        </div>
      </Card>
    );
  }

  if (name === 'generateChart') {
    const p = parameters as ChartParams;
    const d = p.data ?? {};

    if (p.chart_type === 'climate_trend') {
      const chartData = d.years?.map((y, i) => ({ year: y, temp: d.temps?.[i] })) ?? [];
      return (
        <Card accent="var(--orange)">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Thermometer style={{ width: 13, height: 13, color: 'var(--orange)' }} />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>{p.title ?? 'Climate Trend'}</span>
          </div>
          <div style={{ height: 100 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="og" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--orange)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--orange)" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" stroke="var(--text-tertiary)" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-tertiary)" fontSize={9} tickLine={false} axisLine={false} width={24} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ background: 'var(--glass-2)', border: '1px solid var(--glass-border-md)', borderRadius: 8, fontSize: 11 }} labelStyle={{ color: 'var(--text-secondary)' }} itemStyle={{ color: 'var(--orange)' }} />
                <Area type="monotone" dataKey="temp" stroke="var(--orange)" strokeWidth={1.5} fill="url(#og)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      );
    }

    if (p.chart_type === 'crop_advisory') {
      return (
        <Card accent="var(--green)">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Sprout style={{ width: 13, height: 13, color: 'var(--green)' }} />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>Crop Advisory</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 10 }}>{d.recommendation}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <StatBox label="Soil Moisture" value={d.soil_moisture} color="var(--green)" />
            <StatBox label="Degree Days"   value={d.degree_days}  color="var(--yellow)" />
          </div>
        </Card>
      );
    }

    if (p.chart_type === 'aqi_breakdown') {
      const ac = (d.aqi ?? 0) > 300 ? 'var(--purple)' : (d.aqi ?? 0) > 200 ? 'var(--red)' : (d.aqi ?? 0) > 100 ? 'var(--orange)' : 'var(--green)';
      return (
        <Card accent={ac}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>Air Quality · {p.location}</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: ac, fontFamily: 'monospace' }}>{d.aqi}</span>
          </div>
          <p style={{ fontSize: 11, color: ac, fontWeight: 500, marginBottom: 8 }}>{d.status}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
            <StatBox label="PM2.5" value={d.pm25} color={ac} />
            <StatBox label="PM10"  value={d.pm10}  color={ac} />
            <StatBox label="NO₂"   value={d.no2}   color={ac} />
          </div>
        </Card>
      );
    }

    if (p.chart_type === 'skew_t') {
      return (
        <Card accent="var(--blue)">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plane style={{ width: 13, height: 13, color: 'var(--blue)' }} />
              <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>Aero-Met · {p.location}</span>
            </div>
            {d.flight_level && <span style={{ fontSize: 10.5, fontFamily: 'monospace', color: 'var(--yellow)', background: 'var(--yellow-tint)', border: '1px solid var(--yellow-ring)', padding: '1px 7px', borderRadius: 99 }}>{d.flight_level}</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 5, marginBottom: d.turbulence_risk ? 8 : 0 }}>
            <StatBox label="CAPE" value={d.cape} color="var(--yellow)" />
            <StatBox label="CIN"  value={d.cin}  color="var(--blue)"   />
            <StatBox label="LI"   value={d.lifted_index} color="var(--red)" />
          </div>
          {d.turbulence_risk && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', background: 'var(--yellow-tint)', border: '1px solid var(--yellow-ring)', borderRadius: 8, marginTop: 2 }}>
              <AlertTriangle style={{ width: 11, height: 11, color: 'var(--yellow)', flexShrink: 0 }} />
              <span style={{ fontSize: 11.5, color: 'var(--yellow)' }}>Turbulence: {d.turbulence_risk}</span>
            </div>
          )}
        </Card>
      );
    }
  }

  return null;
};
