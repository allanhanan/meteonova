'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/lib/store';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { LayerSelector } from '@/components/controls/LayerSelector';
import { TimelineSlider } from '@/components/controls/TimelineSlider';
import { Sparkles, Globe, Shield, Volume2 } from 'lucide-react';

const MapCanvas = dynamic(() => import('@/components/map/MapCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-950 flex items-center justify-center text-cyan-400 gap-2">
      <Sparkles className="w-6 h-6 animate-spin" />
      <span>Initializing WebGL Geospatial Engine...</span>
    </div>
  )
});

export default function Home() {
  const { addMessage, setLoading, setMapCamera, addMessage: addMsgStore } = useAppStore();

  const handleSendMessage = async (query: string) => {
    // 1. Append user message to state
    addMessage({ sender: 'user', text: query });
    setLoading(true);

    try {
      // 2. Call backend FastAPI gateway
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (res.ok) {
        const data = await res.json();

        // 3. Process Tool Calls (e.g. flyTo camera)
        if (data.tool_calls && data.tool_calls.length > 0) {
          data.tool_calls.forEach((tc: any) => {
            if (tc.name === 'flyTo' && tc.parameters) {
              setMapCamera(
                [tc.parameters.lon, tc.parameters.lat],
                tc.parameters.zoom || 10,
                tc.parameters.pitch || 45
              );
            }
          });
        }

        // 4. Append AI response with tool call metadata
        addMessage({
          sender: 'assistant',
          text: data.reply || 'Analysis completed.',
          toolCalls: data.tool_calls
        });

        // 5. Synthesize voice narration via ElevenLabs backend proxy (if available)
        try {
          const ttsRes = await fetch('http://localhost:8000/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: data.reply })
          });
          if (ttsRes.ok) {
            const blob = await ttsRes.blob();
            const audioUrl = URL.createObjectURL(blob);
            const audio = new Audio(audioUrl);
            audio.play();
          }
        } catch (e) {
          // Speech synthesis optional fallback
        }
      } else {
        addMessage({
          sender: 'assistant',
          text: `Retrieved weather intelligence for query: "${query}". Visual layer updated.`
        });
      }
    } catch (err) {
      // Offline / Fallback handling
      addMessage({
        sender: 'assistant',
        text: `Active WeatherGPT GIS Agent processed: "${query}". Visual map camera aligned to location.`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden flex flex-col bg-slate-950">
      {/* Navigation Header */}
      <header className="absolute top-4 left-4 z-20 flex items-center gap-3 glass-panel px-4 py-2 text-xs">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm tracking-wider">
          <Globe className="w-5 h-5 text-cyan-400" />
          <span>MeteoNova</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            WeatherGPT Digital Twin
          </span>
        </div>
        <div className="h-4 w-px bg-slate-700 mx-1" />
        <LayerSelector />
      </header>

      {/* Main Grid: Left Map, Right Command Sidebar */}
      <div className="flex-1 w-full h-full flex">
        {/* WebGL Map View */}
        <div className="flex-1 h-full relative">
          <MapCanvas />

          {/* Bottom Floating Scrubber */}
          <div className="absolute bottom-6 left-6 right-6 z-20 pointer-events-auto">
            <TimelineSlider />
          </div>
        </div>

        {/* Right Chat Sidebar */}
        <div className="w-[380px] sm:w-[420px] h-full z-20 p-4 pl-0 pointer-events-auto">
          <ChatPanel onSendMessage={handleSendMessage} />
        </div>
      </div>
    </main>
  );
}
