'use client';
import React from 'react';
import { ChatMessage } from '@/lib/types';

interface Props { message: ChatMessage; }

export const MessageBubble: React.FC<Props> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', marginBottom: 14, gap: 4 }}>

      <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {isUser ? 'You' : 'WeatherGPT'}
      </span>

      <div
        style={{
          maxWidth: '90%',
          padding: '10px 14px',
          borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
          fontSize: 13,
          lineHeight: 1.6,
          letterSpacing: '-0.005em',
          color: 'var(--text-primary)',
          ...(isUser
            ? { background: 'var(--blue)', boxShadow: '0 2px 8px rgba(10,132,255,0.25)' }
            : { background: 'var(--glass-3)', border: '1px solid var(--glass-border)' }
          ),
        }}
      >
        {message.text}
      </div>

      {message.toolCalls?.length ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 6, background: 'var(--blue-tint)', border: '1px solid var(--blue-ring)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--blue)' }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--blue)' }}>Spatial visualization active on map canvas</span>
        </div>
      ) : null}

      <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }} suppressHydrationWarning>
        {message.timestamp}
      </span>
    </div>
  );
};
