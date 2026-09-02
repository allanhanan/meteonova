import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MeteoNova (WeatherGPT) — Generative Geospatial Digital Twin",
  description: "Conversational AI for Weather Forecasting, Disaster Alerts, and Meteorological Intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
