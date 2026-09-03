'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/lib/store';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { LayerSelector } from '@/components/controls/LayerSelector';
import { TimelineSlider } from '@/components/controls/TimelineSlider';
import { ToolCall } from '@/lib/types';

const MapCanvas = dynamic(() => import('@/components/map/MapCanvas'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '100%', background: '#0A0A0C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        <div className="thinking-dot" />
        <div className="thinking-dot" />
        <div className="thinking-dot" />
      </div>
      <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Loading map engine…</span>
    </div>
  ),
});

interface ToolCallPayload {
  name: string;
  parameters: { lat?: number; lon?: number; zoom?: number; pitch?: number; layer_type?: string; };
}

export default function Home() {
  const { addMessage, setLoading, setMapCamera, enableLayer } = useAppStore();

  const handleSendMessage = async (query: string) => {
    addMessage({ sender: 'user', text: query });
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (res.ok) {
        const data = await res.json();
        data.tool_calls?.forEach((tc: ToolCallPayload) => {
          if (tc.name === 'flyTo' && tc.parameters?.lat !== undefined)
            setMapCamera([tc.parameters.lon!, tc.parameters.lat], tc.parameters.zoom ?? 10, tc.parameters.pitch ?? 45);
          if (tc.name === 'renderMapLayer' && tc.parameters?.layer_type)
            enableLayer(tc.parameters.layer_type);
        });
        addMessage({ sender: 'assistant', text: data.reply ?? 'Analysis complete.', toolCalls: data.tool_calls as ToolCall[] });
        try {
          const t = await fetch('http://localhost:8000/api/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: data.reply }) });
          if (t.ok) new Audio(URL.createObjectURL(await t.blob())).play();
        } catch { /* TTS optional */ }
      } else {
        addMessage({ sender: 'assistant', text: `Retrieved intelligence for: "${query}"` });
      }
    } catch {
      addMessage({ sender: 'assistant', text: `Processed: "${query}"` });
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--page-bg)' }}>

      {/* ── Full-screen map ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <MapCanvas />
      </div>

      {/* ── Top bar — glass pill row ── */}
      <header
        className="glass"
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
          height: 52,
          display: 'flex', alignItems: 'center',
          borderTop: 'none', borderLeft: 'none', borderRight: 'none',
          borderRadius: 0,
          padding: '0 16px',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 20, paddingRight: 20, borderRight: '1px solid var(--glass-border)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="10" stroke="var(--blue)" strokeWidth="1.5" />
            <path d="M3.5 12 Q7.5 8 12 12 Q16.5 16 20.5 12" stroke="var(--blue)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <circle cx="12" cy="12" r="2.5" fill="var(--blue)" opacity="0.45" />
          </svg>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
            MeteoNova
          </span>
          <span className="badge badge-muted">Beta</span>
        </div>

        {/* Layer pill row — overflow visible so dropdowns can escape */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', minWidth: 0, overflow: 'visible', position: 'relative' }}>
          <LayerSelector />
        </div>

        {/* Status indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 20, paddingLeft: 20, borderLeft: '1px solid var(--glass-border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="live-dot" />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Live</span>
          </div>
          <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-0.01em' }}>
            Groq · Llama 3
          </span>
          <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-0.01em' }}>
            Open-Meteo
          </span>
        </div>
      </header>

      {/* ── Right sidebar — glass panel ── */}
      <aside
        className="glass"
        style={{
          position: 'absolute', top: 62, right: 12, bottom: 12, zIndex: 20,
          width: 370,
          borderRadius: 16,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <ChatPanel onSendMessage={handleSendMessage} />
      </aside>

      {/* ── Timeline scrubber — bottom-left glass pill ── */}
      <div
        className="glass"
        style={{
          position: 'absolute', bottom: 12, left: 12, right: 396, zIndex: 20,
          borderRadius: 14,
        }}
      >
        <TimelineSlider />
      </div>
    </div>
  );
}
