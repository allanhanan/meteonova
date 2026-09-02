'use client';
import React from 'react';
import { ChatMessage } from '@/lib/types';
import { ToolCallCard } from './ToolCallCard';
import { Bot, User } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
          isUser ? 'bg-blue-600 text-white' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      <div className={`max-w-[85%] ${isUser ? 'text-right' : 'text-left'}`}>
        <div
          className={`inline-block p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
            isUser
              ? 'bg-blue-600/80 text-white rounded-tr-none'
              : 'bg-slate-900/80 text-slate-100 border border-slate-700/60 rounded-tl-none'
          }`}
        >
          {message.text}
        </div>

        {/* Render associated tool calls as interactive cards */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-1 space-y-1">
            {message.toolCalls.map((tc, idx) => (
              <ToolCallCard key={idx} toolCall={tc} />
            ))}
          </div>
        )}

        <div className="text-[10px] text-slate-500 mt-1 px-1" suppressHydrationWarning>{message.timestamp}</div>
      </div>
    </div>
  );
};
