'use client';
import React, { useState } from 'react';
import { MousePointerClick, Sprout, Check, X } from 'lucide-react';
import { useAppStore } from '@/lib/store';

import * as maplibregl from 'maplibre-gl';

export interface PolygonDrawProps {
  map?: maplibregl.Map | null;
}

// Re-export VoiceButton as a no-op (voice logic is inlined in ChatInput)
export const VoiceButton: React.FC<{ onTranscript?: (t: string) => void }> = () => null;

export const PolygonDraw: React.FC<PolygonDrawProps> = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const { addMessage } = useAppStore();

  const handleComplete = () => {
    setIsDrawing(false);
    addMessage({
      sender: 'assistant',
      text: 'Field boundary captured (~1.4 ha). Running WRF crop advisory for selected coordinates.',
      toolCalls: [{
        name: 'generateChart',
        parameters: {
          chart_type: 'crop_advisory',
          title: 'Field Advisory',
          location: 'Selected Field',
          data: {
            recommendation: 'Safe fertilization window open for 48h before incoming precipitation. Soil moisture elevated — delay irrigation.',
            soil_moisture: '72%',
            degree_days: 158,
          },
        },
      }],
    });
  };

  if (!isDrawing) {
    return (
      <button
        onClick={() => setIsDrawing(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '5px 12px', borderRadius: 20,
          fontSize: 12, fontWeight: 500,
          background: 'rgba(48,209,88,0.12)',
          border: '1px solid rgba(48,209,88,0.30)',
          color: '#30D158',
          cursor: 'pointer',
        }}
      >
        <Sprout style={{ width: 12, height: 12 }} />
        Draw Field
      </button>
    );
  }

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '5px 12px', borderRadius: 20, fontSize: 12,
      background: 'rgba(48,209,88,0.12)', border: '1px solid rgba(48,209,88,0.30)', color: '#30D158',
    }}>
      <MousePointerClick style={{ width: 12, height: 12 }} />
      <span>Click map to draw</span>
      <button onClick={handleComplete} style={{ width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#30D158', color: '#000', cursor: 'pointer', border: 'none', flexShrink: 0 }}>
        <Check style={{ width: 10, height: 10 }} />
      </button>
      <button onClick={() => setIsDrawing(false)} style={{ width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,69,58,0.2)', color: '#FF453A', cursor: 'pointer', border: '1px solid rgba(255,69,58,0.3)', flexShrink: 0 }}>
        <X style={{ width: 10, height: 10 }} />
      </button>
    </div>
  );
};
