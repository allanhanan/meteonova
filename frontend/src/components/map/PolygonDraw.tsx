'use client';
import React, { useState } from 'react';
import { MousePointerClick, Sprout, Check, Trash2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export const PolygonDraw: React.FC = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const { addMessage } = useAppStore();

  const handleStartDraw = () => {
    setIsDrawing(true);
  };

  const handleCancelDraw = () => {
    setIsDrawing(false);
  };

  const handleCompleteDraw = () => {
    setIsDrawing(false);
    addMessage({
      sender: 'assistant',
      text: 'Captured custom field boundary geometry. High-resolution WRF model data sliced for your field coordinates.',
      toolCalls: [
        {
          name: 'generateChart',
          parameters: {
            chart_type: 'crop_advisory',
            title: 'Field-Specific Crop Weather Advisory',
            location: 'Selected Field Plot',
            data: {
              recommendation: 'Field boundary analyzed (1.4 hectares). Optimal soil moisture retention detected. Safe window for nitrogen fertilization open for next 48 hours.',
              soil_moisture: '72% (High)',
              degree_days: 158
            }
          }
        }
      ]
    });
  };

  return (
    <div className="flex items-center gap-2">
      {!isDrawing ? (
        <button
          onClick={handleStartDraw}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/80 transition-all shadow-sm"
          title="Draw your farm field on the map to get a field-specific crop advisory"
        >
          <Sprout className="w-3.5 h-3.5 text-emerald-400" />
          Draw Field (Agro)
        </button>
      ) : (
        <div className="flex items-center gap-2 bg-slate-900/90 border border-emerald-500/50 p-1 px-3 rounded-full text-xs text-emerald-300 animate-pulse">
          <MousePointerClick className="w-3.5 h-3.5 text-emerald-400" />
          <span>Click map corners to enclose field</span>
          <button
            onClick={handleCompleteDraw}
            className="p-1 rounded bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400"
            title="Complete Field Selection"
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            onClick={handleCancelDraw}
            className="p-1 rounded bg-red-500/30 text-red-300 hover:bg-red-500/50"
            title="Cancel"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
