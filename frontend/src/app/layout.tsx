import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MeteoNova — WeatherGPT Digital Twin',
  description: 'Generative Geospatial Digital Twin for India Disaster Management — powered by Groq AI, Open-Meteo, and MapLibre GL.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
