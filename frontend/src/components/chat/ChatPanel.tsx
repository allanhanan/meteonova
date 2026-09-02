'use client';
import React, { useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { Sparkles } from 'lucide-react';

interface ChatPanelProps {
  onSendMessage: (query: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ onSendMessage }) => {
  const { messages, isLoading } = useAppStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full glass-panel overflow-hidden border-l border-slate-800">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-semibold text-slate-100">WeatherGPT Command Center</h2>
            <p className="text-[10px] text-slate-400">Agentic GIS Orchestrator (Groq Llama-3)</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">Live</span>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-cyan-400 animate-pulse p-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Agentic GIS reasoning & tool execution in progress...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
    </div>
  );
};
