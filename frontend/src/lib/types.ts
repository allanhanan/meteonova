export interface MapState {
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
  activeLayers: string[];
  mapStyle: 'dark' | 'satellite' | 'light' | 'terrain' | 'esri_dark';
}

export interface ToolCall {
  name: string;
  parameters: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  toolCalls?: ToolCall[];
  timestamp: string;
  chartData?: Record<string, unknown>;
}

export interface WeatherData {
  location: string;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  condition?: string;
  hourly?: Record<string, unknown>;
  daily?: Record<string, unknown>;
}
