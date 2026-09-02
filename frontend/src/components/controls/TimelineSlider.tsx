'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export const TimelineSlider: React.FC = () => {
  const { currentTimeOffset, setTimeOffset } = useAppStore();
  const [playing, setPlaying] = useState(false);
  const iv = useRef<NodeJS.Timeout | null>(null);

  const stop = () => { setPlaying(false); if (iv.current) clearInterval(iv.current); };
  const toggle = () => {
    if (playing) { stop(); return; }
    setPlaying(true);
    let t = currentTimeOffset;
    iv.current = setInterval(() => { t += 3; if (t > 48) { t = 0; stop(); } setTimeOffset(t); }, 700);
  };
  useEffect(() => () => { if (iv.current) clearInterval(iv.current); }, []);

  const pct = (currentTimeOffset / 48) * 100;
  const label = currentTimeOffset === 0 ? 'Now — Live' : `+${currentTimeOffset}h`;
  const ticks = [0, 12, 24, 36, 48];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px' }}>

      {/* Play / Pause */}
      <button
        onClick={toggle}
        style={{
          width: 32, height: 32, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: playing ? 'var(--blue)' : 'var(--glass-3)',
          border: `1px solid ${playing ? 'var(--blue-ring)' : 'var(--glass-border-md)'}`,
          color: playing ? '#fff' : 'var(--text-secondary)',
          cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
        }}
      >
        {playing ? <Pause style={{ width: 13, height: 13 }} /> : <Play style={{ width: 13, height: 13, marginLeft: 1 }} />}
      </button>

      {/* Reset */}
      <button
        onClick={() => { stop(); setTimeOffset(0); }}
        style={{
          width: 26, height: 26, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'transparent',
          border: '1px solid var(--glass-border)',
          color: 'var(--text-tertiary)',
          cursor: 'pointer', flexShrink: 0, transition: 'all 0.13s',
        }}
      >
        <RotateCcw style={{ width: 10, height: 10 }} />
      </button>

      <div style={{ width: 1, height: 20, background: 'var(--glass-border)', flexShrink: 0 }} />

      {/* Scrubber */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Clock style={{ width: 11, height: 11, color: 'var(--text-tertiary)' }} />
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>48-Hour Forecast</span>
          </div>
          <span style={{
            fontSize: 12, fontWeight: 700, letterSpacing: '-0.01em',
            color: currentTimeOffset === 0 ? 'var(--green)' : 'var(--text-primary)',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {label}
          </span>
        </div>

        <input
          type="range" min={0} max={48} step={3}
          value={currentTimeOffset}
          onChange={e => setTimeOffset(Number(e.target.value))}
          style={{
            background: `linear-gradient(to right, var(--blue) ${pct}%, rgba(255,255,255,0.12) ${pct}%)`,
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
          {ticks.map(t => (
            <span key={t} style={{
              fontSize: 9.5,
              fontFamily: "'JetBrains Mono', monospace",
              color: Math.abs(currentTimeOffset - t) < 4 ? 'var(--text-primary)' : 'var(--text-tertiary)',
              fontWeight: Math.abs(currentTimeOffset - t) < 4 ? 600 : 400,
              transition: 'color 0.13s',
            }}>
              {t === 0 ? 'Now' : `+${t}h`}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
