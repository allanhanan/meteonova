import { create } from 'zustand';
import { MapState, ChatMessage, WeatherData } from './types';

interface AppStore {
  // Map State
  mapState: MapState;
  setMapCamera: (center: [number, number], zoom: number, pitch?: number, bearing?: number) => void;
  toggleLayer: (layerName: string) => void;
  enableLayer: (layerName: string) => void;
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
    activeLayers: [
      'wind_particles',
      'heatmap_temp',
      'heatmap_precip',
      'alert_zones',
      'spaghetti_plots',
      'aqi_circles',
      'pressure_isobars',
      'flood_extrusion',
    ],
  },
  setMapCamera: (center, zoom, pitch = 45, bearing = 0) =>
    set((state) => ({
      mapState: { ...state.mapState, center, zoom, pitch, bearing },
    })),
  toggleLayer: (layerName) =>
    set((state) => {
      const exists = state.mapState.activeLayers.includes(layerName);
      const activeLayers = exists
        ? state.mapState.activeLayers.filter((l) => l !== layerName)
        : [...state.mapState.activeLayers, layerName];
      return { mapState: { ...state.mapState, activeLayers } };
    }),
  enableLayer: (layerName) =>
    set((state) => ({
      mapState: {
        ...state.mapState,
        activeLayers: state.mapState.activeLayers.includes(layerName)
          ? state.mapState.activeLayers
          : [...state.mapState.activeLayers, layerName],
      },
    })),
  setLayers: (activeLayers) =>
    set((state) => ({ mapState: { ...state.mapState, activeLayers } })),

  messages: [
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'Namaste! I am WeatherGPT — your Generative Geospatial Digital Twin. Real-time multi-model ensemble tracks, AQI monitoring, 3D flood risk extrusions, and synoptic isobar maps are active on your spatial canvas.',
      timestamp: 'Just now',
    },
    {
      id: 'welcome-2',
      sender: 'assistant',
      text: 'Active multi-model cyclone trajectory spaghetti plot (GFS vs ECMWF vs GenCast) and real-time air quality index monitoring across Indian metros.',
      toolCalls: [
        {
          name: 'renderMapLayer',
          parameters: { layer_type: 'spaghetti_plots' },
        },
        {
          name: 'generateChart',
          parameters: {
            chart_type: 'aqi_breakdown',
            title: 'Air Quality Index — Delhi NCR',
            location: 'Delhi',
            data: {
              aqi: 342,
              status: 'Hazardous / Severe',
              pm25: 184,
              pm10: 312,
              no2: 62,
            },
          },
        },
        {
          name: 'generateChart',
          parameters: {
            chart_type: 'skew_t',
            title: 'Aero-Met Sounding — Mumbai Flight Corridor',
            location: 'Mumbai Corridor',
            data: {
              cape: 1850,
              cin: -45,
              lifted_index: -4.2,
              flight_level: 'FL350',
              turbulence_risk: 'Moderate Convective',
            },
          },
        },
      ],
      timestamp: 'Just now',
    },
  ],
  isLoading: false,
  addMessage: (msg) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...msg,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    })),
  setLoading: (isLoading) => set({ isLoading }),

  weatherData: null,
  setWeatherData: (weatherData) => set({ weatherData }),
  currentTimeOffset: 0,
  setTimeOffset: (currentTimeOffset) => set({ currentTimeOffset }),

  isVoiceActive: false,
  setVoiceActive: (isVoiceActive) => set({ isVoiceActive }),
}));
