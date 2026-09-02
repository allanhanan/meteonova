'use client';
import React from 'react';
import { Plane, AlertTriangle } from 'lucide-react';

interface SkewTDiagramProps {
  location?: string;
  data?: { cape?: number; cin?: number; lifted_index?: number; flight_level?: string; turbulence_risk?: string };
}

export const SkewTDiagram: React.FC<SkewTDiagramProps> = ({
  location = 'Delhi–Mumbai Corridor',
  data = { cape: 1850, cin: -45, lifted_index: -4.2, flight_level: 'FL350', turbulence_risk: 'Moderate Convective' },
}) => (
  <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderLeft: '3px solid var(--accent)', borderRadius: 8, padding: '10px 12px', fontSize: 12 }}>
    <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
      <div className="flex items-center gap-1.5">
        <Plane style={{ width: 13, height: 13, color: 'var(--accent)' }} />
        <span style={{ fontWeight: 600, color: 'var(--text-0)' }}>Aero-Met Sounding</span>
        <span style={{ color: 'var(--text-2)', fontSize: 11 }}>· {location}</span>
      </div>
      <span style={{ fontSize: 10.5, fontFamily: 'monospace', color: 'var(--amber)', background: 'var(--amber-bg)', border: '1px solid var(--amber-border)', padding: '1px 7px', borderRadius: 4 }}>
        {data.flight_level}
      </span>
    </div>

    {/* Indices */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5, marginBottom: 8 }}>
      {[['CAPE', data.cape, 'J/kg', 'var(--amber)'], ['CIN', data.cin, 'J/kg', 'var(--accent)'], ['LI', data.lifted_index, '', 'var(--red)']].map(([l, v, u, c]) => (
        <div key={String(l)} style={{ background: 'var(--surface-3)', borderRadius: 5, padding: '7px 8px', border: '1px solid var(--border-1)', textAlign: 'center' }}>
          <p style={{ fontSize: 9.5, color: 'var(--text-2)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{l}</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: String(c), fontFamily: 'monospace' }}>{v}<span style={{ fontSize: 9, marginLeft: 2, color: 'var(--text-2)' }}>{u}</span></p>
        </div>
      ))}
    </div>

    {/* Sounding SVG */}
    <div style={{ position: 'relative', height: 96, background: 'var(--surface-3)', borderRadius: 6, border: '1px solid var(--border-1)', overflow: 'hidden', marginBottom: 6 }}>
      {/* Pressure lines */}
      {[20, 50, 76].map((pct, i) => (
        <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: `${pct}%`, borderTop: '1px dashed rgba(99,120,170,0.2)', display: 'flex', alignItems: 'center', paddingLeft: 4 }}>
          <span style={{ fontSize: 8, color: 'var(--text-3)', fontFamily: 'monospace' }}>{['200', '500', '850'][i]} hPa</span>
        </div>
      ))}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 200 96" preserveAspectRatio="none">
        {/* CAPE shading */}
        <path d="M 60,55 Q 90,42 110,38 L 80,44 Z" fill="rgba(248,113,113,0.15)" />
        {/* Temp curve */}
        <path d="M 30,90 Q 65,58 110,38 T 175,10" fill="none" stroke="var(--red)" strokeWidth="2" opacity="0.85" />
        {/* Dewpoint curve */}
        <path d="M 20,90 Q 42,62 80,44 T 130,12" fill="none" stroke="var(--green)" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.75" />
      </svg>
    </div>

    <div className="flex items-center justify-between" style={{ fontSize: 10, color: 'var(--text-2)' }}>
      <span style={{ color: 'var(--green)' }}>─ ─ Td Dewpoint</span>
      <span style={{ color: 'var(--red)' }}>─── T Temperature</span>
    </div>

    {data.turbulence_risk && (
      <div className="flex items-center gap-1.5" style={{ marginTop: 6, padding: '5px 8px', background: 'var(--amber-bg)', border: '1px solid var(--amber-border)', borderRadius: 5 }}>
        <AlertTriangle style={{ width: 11, height: 11, color: 'var(--amber)' }} />
        <span style={{ fontSize: 11, color: 'var(--amber)' }}>Turbulence risk: {data.turbulence_risk}</span>
      </div>
    )}
  </div>
);
