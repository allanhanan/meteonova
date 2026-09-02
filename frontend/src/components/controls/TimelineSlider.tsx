'use client';
import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export const TimelineSlider: React.FC = () => {
  const { currentTimeOffset, setTimeOffset } = useAppStore();
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayToggle = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    setIsPlaying(true);
    let current = currentTimeOffset;
    const interval = setInterval(() => {
      current += 3;
      if (current > 48) {
        current = 0;
        setIsPlaying(false);
        clearInterval(interval);
      }
      setTimeOffset(current);
    }, 800);
  };

  return (
    <div className="glass-panel px-4 py-2 flex items-center gap-4 w-full max-w-2xl mx-auto">
      <button
        onClick={handlePlayToggle}
        className="p-2 rounded-full bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 border border-cyan-500/30 transition-all"
        title={isPlaying ? 'Pause Scrubber' : 'Play 48h Forecast Progression'}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>

      <button
        onClick={() => { setTimeOffset(0); setIsPlaying(false); }}
        className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
        title="Reset to Now"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>

      <div className="flex-1 flex flex-col gap-1">
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            Forecast Scrubber
          </span>
          <span className="text-cyan-300 font-semibold">
            {currentTimeOffset === 0 ? 'NOW (Live)' : `+${currentTimeOffset} Hours`}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="48"
          step="3"
          value={currentTimeOffset}
          onChange={(e) => setTimeOffset(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
      </div>
    </div>
  );
};
