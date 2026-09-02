'use client';
import React, { useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { Zap, MapPin } from 'lucide-react';

interface ChatPanelProps { onSendMessage: (q: string) => void; }

const SUGGESTED = [
  { label: 'Cyclone track',       sub: 'Bay of Bengal · Odisha landfall',   q: 'Show cyclone trajectory in Odisha' },
  { label: '3D flood risk',       sub: 'Mumbai coastal · storm surge',      q: 'Show 3D flood risk for Mumbai' },
  { label: 'Heatwave advisory',   sub: 'Rajasthan · 48h forecast',          q: 'Heatwave advisory for Rajasthan' },
  { label: 'Air quality index',   sub: 'Delhi · PM2.5 live data',           q: 'AQI breakdown for Delhi today' },
];

export const ChatPanel: React.FC<ChatPanelProps> = ({ onSendMessage }) => {
  const { messages, isLoading } = useAppStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const showSuggested = messages.length <= 1;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Header */}
      <div style={{
        padding: '14px 16px 12px',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'var(--blue-tint)',
            border: '1px solid var(--blue-ring)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap style={{ width: 16, height: 16, color: 'var(--blue)' }} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>WeatherGPT</p>
            <p style={{ fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.2, marginTop: 1 }}>Agentic GIS · Groq Llama 3</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div className="live-dot" />
          <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--green)' }}>Online</span>
        </div>
      </div>

      {/* Scrollable messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column' }}>

        {/* Suggested */}
        {showSuggested && (
          <div className="anim-fade-up" style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Try asking
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {SUGGESTED.map(s => (
                <button
                  key={s.label}
                  onClick={() => onSendMessage(s.q)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 12,
                    background: 'var(--glass-3)',
                    border: '1px solid var(--glass-border)',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'background 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={e => { const b = e.currentTarget; b.style.background = 'rgba(255,255,255,0.07)'; b.style.borderColor = 'var(--glass-border-md)'; }}
                  onMouseLeave={e => { const b = e.currentTarget; b.style.background = 'var(--glass-3)'; b.style.borderColor = 'var(--glass-border)'; }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--blue-tint)', border: '1px solid var(--blue-ring)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin style={{ width: 12, height: 12, color: 'var(--blue)' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.25, letterSpacing: '-0.01em' }}>{s.label}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.25 }}>{s.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}

        {/* Thinking state */}
        {isLoading && (
          <div className="anim-fade-up" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--blue-tint)', border: '1px solid var(--blue-ring)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Zap style={{ width: 12, height: 12, color: 'var(--blue)' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div className="thinking-dot" />
              <div className="thinking-dot" />
              <div className="thinking-dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '10px 12px 12px', borderTop: '1px solid var(--glass-border)', flexShrink: 0 }}>
        <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};
