import { create } from 'zustand';
import { MapState, ChatMessage, WeatherData } from './types';

interface AppStore {
  // Map State
  mapState: MapState;
  setMapCamera: (center: [number, number], zoom: number, pitch?: number, bearing?: number) => void;
  toggleLayer: (layerName: string) => void;
  setLayers: (layers: string[]) => void;

  // Chat State
  messages: ChatMessage[];
  isLoading: boolean;
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setLoading: (loading: boolean) => void;

  // Weather Data State
  weatherData: WeatherData | null;
  setWeatherData: (data: WeatherData) => void;
  currentTimeOffset: number; // in hours, 0 to 48
  setTimeOffset: (offset: number) => void;

  // Voice State
  isVoiceActive: boolean;
  setVoiceActive: (active: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  mapState: {
    center: [78.9629, 20.5937], // Center of India
    zoom: 4.8,
    pitch: 35,
    bearing: 0,
    activeLayers: ['wind_particles', 'heatmap_temp']
  },
  setMapCamera: (center, zoom, pitch = 45, bearing = 0) =>
    set((state) => ({
      mapState: { ...state.mapState, center, zoom, pitch, bearing }
    })),
  toggleLayer: (layerName) =>
    set((state) => {
      const exists = state.mapState.activeLayers.includes(layerName);
      const activeLayers = exists
        ? state.mapState.activeLayers.filter((l) => l !== layerName)
        : [...state.mapState.activeLayers, layerName];
      return { mapState: { ...state.mapState, activeLayers } };
    }),
  setLayers: (activeLayers) =>
    set((state) => ({ mapState: { ...state.mapState, activeLayers } })),

  messages: [
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'Namaste! I am WeatherGPT — your Generative Geospatial Digital Twin. Ask me about weather forecasts, storm warnings, heatwave risks, or agricultural advisories.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ],
  isLoading: false,
  addMessage: (msg) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...msg,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    })),
  setLoading: (isLoading) => set({ isLoading }),

  weatherData: null,
  setWeatherData: (weatherData) => set({ weatherData }),
  currentTimeOffset: 0,
  setTimeOffset: (currentTimeOffset) => set({ currentTimeOffset }),

  isVoiceActive: false,
  setVoiceActive: (isVoiceActive) => set({ isVoiceActive })
}));
