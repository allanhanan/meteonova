export interface MapState {
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
  activeLayers: string[];
}

export interface ToolCall {
  name: string;
  parameters: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  toolCalls?: ToolCall[];
  timestamp: string;
  chartData?: any;
}

export interface WeatherData {
  location: string;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  condition?: string;
  hourly?: any;
  daily?: any;
}
