'use client';
import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useAppStore } from '@/lib/store';

interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionResultList {
  [index: number]: {
    [index: number]: SpeechRecognitionResultItem;
  };
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  error?: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  start: () => void;
}

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({ onTranscript }) => {
  const [isListening, setIsListening] = useState(false);
  const { setVoiceActive } = useAppStore();

  const toggleListening = () => {
    const win = window as unknown as Record<string, unknown>;
    const SpeechRecognitionClass = (win.SpeechRecognition || win.webkitSpeechRecognition) as {
      new (): SpeechRecognitionInstance;
    } | undefined;

    if (!SpeechRecognitionClass) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      setVoiceActive(false);
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN'; // Default to Indian English / Hindi capable

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceActive(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        onTranscript(transcript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setVoiceActive(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setVoiceActive(false);
    };

    recognition.start();
  };

  return (
    <button
      onClick={toggleListening}
      className={`p-3 rounded-full transition-all duration-300 flex items-center justify-center ${
        isListening
          ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50 scale-110'
          : 'bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 border border-cyan-500/30'
      }`}
      title={isListening ? 'Stop Listening' : 'Voice Input (Speak in English or Hindi)'}
    >
      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
    </button>
  );
};
