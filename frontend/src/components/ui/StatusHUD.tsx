'use client';
import React from 'react';
import { Cpu, Signal } from 'lucide-react';

export const StatusHUD: React.FC = () => (
  <div className="flex items-center gap-3">
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div className="dot-pulse" />
      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-0)' }}>Live</span>
    </div>
    <span style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: 'monospace' }}>
      <Cpu style={{ width: 10, height: 10, display: 'inline', marginRight: 4 }} />
      Groq · Llama-3
    </span>
    <span style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: 'monospace' }}>
      <Signal style={{ width: 10, height: 10, display: 'inline', marginRight: 4 }} />
      Open-Meteo
    </span>
  </div>
);

export const VoiceButton: React.FC<{ onTranscript?: (t: string) => void }> = () => null;
