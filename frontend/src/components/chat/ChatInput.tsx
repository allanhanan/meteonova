'use client';
import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { VoiceButton } from '../ui/VoiceButton';

interface ChatInputProps {
  onSendMessage: (query: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleVoiceTranscript = (transcript: string) => {
    if (transcript.trim()) {
      onSendMessage(transcript.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 flex items-center gap-2">
      <VoiceButton onTranscript={handleVoiceTranscript} />

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask WeatherGPT e.g. 'Cyclone warning in Odisha'..."
        disabled={isLoading}
        className="flex-1 bg-slate-950/80 border border-slate-700/80 rounded-full px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
      />

      <button
        type="submit"
        disabled={!input.trim() || isLoading}
        className="p-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/20"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
};
