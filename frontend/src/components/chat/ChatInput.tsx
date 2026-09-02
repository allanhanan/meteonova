'use client';
import React, { useState } from 'react';
import { ArrowUp, Mic, MicOff } from 'lucide-react';
import { useAppStore } from '@/lib/store';

interface Props { onSendMessage: (q: string) => void; isLoading: boolean; }

interface SR { continuous: boolean; interimResults: boolean; lang: string; onstart: () => void; onresult: (e: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void; onerror: () => void; onend: () => void; start: () => void; }

export const ChatInput: React.FC<Props> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const { setVoiceActive } = useAppStore();

  const submit = () => {
    const t = input.trim();
    if (!t || isLoading) return;
    onSendMessage(t); setInput('');
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  const resize = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const toggleVoice = () => {
    const w = window as unknown as Record<string, unknown>;
    const SRC = (w.SpeechRecognition || w.webkitSpeechRecognition) as (new () => SR) | undefined;
    if (!SRC) return;
    if (listening) { setListening(false); setVoiceActive(false); return; }
    const sr = new SRC();
    sr.continuous = false; sr.interimResults = false; sr.lang = 'en-IN';
    sr.onstart = () => { setListening(true); setVoiceActive(true); };
    sr.onresult = (e) => { onSendMessage(e.results[0][0].transcript); };
    sr.onerror = () => { setListening(false); setVoiceActive(false); };
    sr.onend = () => { setListening(false); setVoiceActive(false); };
    sr.start();
  };

  const hasInput = input.trim().length > 0;

  return (
    <div className="chat-input-wrap">
      <textarea
        value={input}
        onChange={e => { setInput(e.target.value); resize(e.target); }}
        onKeyDown={onKey}
        placeholder="Ask about weather, storms, forecasts…"
        disabled={isLoading}
        rows={1}
        className="chat-textarea"
        style={{ marginBottom: 8 }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        {/* Voice toggle */}
        <button
          type="button"
          onClick={toggleVoice}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', borderRadius: 99,
            fontSize: 11.5, fontWeight: 500,
            background: listening ? 'var(--red-tint)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${listening ? 'var(--red-ring)' : 'var(--glass-border)'}`,
            color: listening ? 'var(--red)' : 'var(--text-secondary)',
            cursor: 'pointer', transition: 'all 0.13s',
          }}
        >
          {listening ? <><MicOff style={{ width: 11, height: 11 }} /> Stop</> : <><Mic style={{ width: 11, height: 11 }} /> Voice</>}
        </button>

        {/* Hint */}
        {!hasInput && (
          <span style={{ fontSize: 10.5, color: 'var(--text-tertiary)', flex: 1, textAlign: 'center' }}>
            Enter to send · Shift+Enter for newline
          </span>
        )}

        {/* Send */}
        <button
          type="button"
          onClick={submit}
          disabled={!hasInput || isLoading}
          style={{
            width: 30, height: 30, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: hasInput && !isLoading ? 'var(--blue)' : 'rgba(255,255,255,0.06)',
            border: 'none', color: hasInput && !isLoading ? '#fff' : 'var(--text-tertiary)',
            cursor: hasInput && !isLoading ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s', flexShrink: 0,
          }}
        >
          <ArrowUp style={{ width: 15, height: 15, strokeWidth: 2.5 }} />
        </button>
      </div>
    </div>
  );
};
