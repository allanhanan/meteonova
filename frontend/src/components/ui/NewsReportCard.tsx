'use client';
import React from 'react';
import { Volume2, X, Wind, Droplets, Activity, ChevronRight, AlertTriangle, ShieldAlert, Thermometer, Layers } from 'lucide-react';

export type ReportCategory = 'thermal' | 'aqi' | 'cyclone' | 'flood' | 'skew_t' | 'crop';

export interface PlaceReport {
  category: ReportCategory;
  cityOrRegion: string;
  lat: number;
  lng: number;
  temp: number;
  condition: string;
  severity: 'Extreme Heat' | 'Red Alert' | 'Storm Warning' | 'Monsoon Watch' | 'Hazardous AQI' | 'Severe Flood' | 'Convective Risk';
  humidity: number;
  windSpeed: number;
  aqi: number;
  pressure: number;
  summary: string;
  hourly: { time: string; temp: number }[];
  // Category-specific metrics
  aqiBreakdown?: { pm25: number; pm10: number; no2: number; status: string };
  cycloneModels?: { gfsLandfall: string; ecmwfLandfall: string; genCastLandfall: string; centralPressure: string };
  floodDepthMeters?: number;
  submergedBuildings?: number;
  skewTData?: { cape: number; cin: number; flightLevel: string; turbulence: string };
  cropAdvisory?: { soilMoisture: string; recommendation: string };
}

interface NewsReportCardProps {
  report: PlaceReport | null;
  onClose: () => void;
}

export const NewsReportCard: React.FC<NewsReportCardProps> = ({ report, onClose }) => {
  if (!report) return null;

  const isCritical =
    report.severity === 'Extreme Heat' ||
    report.severity === 'Red Alert' ||
    report.severity === 'Hazardous AQI' ||
    report.severity === 'Severe Flood' ||
    report.severity === 'Storm Warning';

  const headerBg = isCritical
    ? 'linear-gradient(135deg, rgba(255, 23, 68, 0.92), rgba(213, 0, 0, 0.95))'
    : 'linear-gradient(135deg, rgba(0, 122, 255, 0.92), rgba(10, 132, 255, 0.95))';

  const categoryLabel = {
    thermal: 'THERMAL & HEATWAVE BULLETIN',
    aqi: 'AIR QUALITY SPECIAL REPORT',
    cyclone: 'CYCLONE TROPICAL TRACK BULLETIN',
    flood: 'FLOOD INUNDATION DISASTER REPORT',
    skew_t: 'AERO-MET SOUNDING ADVISORY',
    crop: 'AGRO CROP & SOIL BULLETIN',
  }[report.category];

  return (
    <div
      style={{
        position: 'absolute',
        top: 65,
        left: 16,
        width: 380,
        zIndex: 50,
        borderRadius: 16,
        overflow: 'hidden',
        background: 'rgba(12, 14, 20, 0.94)',
        backdropFilter: 'blur(22px)',
        border: '1px solid rgba(255, 255, 255, 0.16)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 212, 255, 0.15)',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
        color: '#ffffff',
        animation: 'slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* ── 1. TV News Banner Header ────────────────────────────────────────── */}
      <div
        style={{
          background: headerBg,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 8px',
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.25)',
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', animation: 'pulse 1.2s infinite' }} />
            LIVE NEWS REPORT
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, opacity: 0.9 }}>{categoryLabel}</span>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'rgba(0, 0, 0, 0.25)',
            border: 'none',
            color: '#ffffff',
            width: 26,
            height: 26,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X style={{ width: 14, height: 14 }} />
        </button>
      </div>

      {/* ── 2. Headline & Primary Metrics ──────────────────────────────────── */}
      <div style={{ padding: '16px 20px 14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#ffffff' }}>
              {report.cityOrRegion}
            </h2>
            <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255, 255, 255, 0.55)', marginTop: 2 }}>
              {report.lat}°N, {report.lng}°E
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                fontFamily: 'monospace',
                color: isCritical ? '#ff1744' : '#00d4ff',
                lineHeight: 1,
              }}
            >
              {report.temp}°C
            </div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: isCritical ? '#ff1744' : '#ffea00',
                marginTop: 4,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {report.severity}
            </div>
          </div>
        </div>

        {/* ── 3. TV News Anchor Executive Summary ──────────────────────────── */}
        <div
          style={{
            marginTop: 14,
            padding: '10px 12px',
            borderRadius: 10,
            background: 'rgba(255, 255, 255, 0.05)',
            borderLeft: `3px solid ${isCritical ? '#ff1744' : '#00d4ff'}`,
            fontSize: 12,
            lineHeight: 1.5,
            color: 'rgba(255, 255, 255, 0.88)',
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', marginBottom: 4 }}>
            BROADCAST ADVISORY
          </div>
          {report.summary}
        </div>

        {/* ── 4. Category Specific Custom Data Panel ────────────────────────── */}
        {report.category === 'aqi' && report.aqiBreakdown && (
          <div style={{ marginTop: 14, background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#a855f7', textTransform: 'uppercase', marginBottom: 6 }}>
              POLLUTANT BREAKDOWN (PM2.5 / PM10)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, textAlign: 'center' }}>
              <div><div style={{ fontSize: 9, color: '#aaa' }}>PM2.5</div><div style={{ fontSize: 13, fontWeight: 800, color: '#ff1744' }}>{report.aqiBreakdown.pm25} µg/m³</div></div>
              <div><div style={{ fontSize: 9, color: '#aaa' }}>PM10</div><div style={{ fontSize: 13, fontWeight: 800, color: '#ff9100' }}>{report.aqiBreakdown.pm10} µg/m³</div></div>
              <div><div style={{ fontSize: 9, color: '#aaa' }}>NO₂</div><div style={{ fontSize: 13, fontWeight: 800, color: '#ffea00' }}>{report.aqiBreakdown.no2} ppb</div></div>
            </div>
          </div>
        )}

        {report.category === 'cyclone' && report.cycloneModels && (
          <div style={{ marginTop: 14, background: 'rgba(217, 70, 239, 0.12)', border: '1px solid rgba(217, 70, 239, 0.3)', borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#d946ef', textTransform: 'uppercase', marginBottom: 6 }}>
              MULTI-MODEL ENSEMBLE LANDFALL PREDICTIONS
            </div>
            <div style={{ fontSize: 11, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div><span style={{ color: '#00f0ff', fontWeight: 700 }}>GFS Ensemble:</span> {report.cycloneModels.gfsLandfall}</div>
              <div><span style={{ color: '#ff9500', fontWeight: 700 }}>ECMWF HRES:</span> {report.cycloneModels.ecmwfLandfall}</div>
              <div><span style={{ color: '#d946ef', fontWeight: 700 }}>GenCast AI:</span> {report.cycloneModels.genCastLandfall}</div>
            </div>
          </div>
        )}

        {report.category === 'flood' && (
          <div style={{ marginTop: 14, background: 'rgba(255, 59, 48, 0.12)', border: '1px solid rgba(255, 59, 48, 0.3)', borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#ff3b30', textTransform: 'uppercase', marginBottom: 6 }}>
              HYDROLOGICAL 3D INUNDATION DEPTH
            </div>
            <div style={{ display: 'flex', justify: 'space-between', fontSize: 12 }}>
              <div>Inundation Rise: <strong style={{ color: '#ff3b30' }}>{report.floodDepthMeters || 2.4} meters</strong></div>
              <div>Submerged Assets: <strong style={{ color: '#ffea00' }}>{report.submergedBuildings || 42} buildings</strong></div>
            </div>
          </div>
        )}

        {report.category === 'skew_t' && report.skewTData && (
          <div style={{ marginTop: 14, background: 'rgba(0, 212, 255, 0.12)', border: '1px solid rgba(0, 212, 255, 0.3)', borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#00d4ff', textTransform: 'uppercase', marginBottom: 6 }}>
              THERMODYNAMIC ATMOSPHERIC STABILITY (SKEW-T)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, fontSize: 11 }}>
              <div>CAPE Energy: <strong style={{ color: '#ff1744' }}>{report.skewTData.cape} J/kg</strong></div>
              <div>CIN Inhibition: <strong>{report.skewTData.cin} J/kg</strong></div>
              <div>Flight Altitude: <strong>{report.skewTData.flightLevel}</strong></div>
              <div>Turbulence Risk: <strong style={{ color: '#ff9100' }}>{report.skewTData.turbulence}</strong></div>
            </div>
          </div>
        )}

        {/* ── 5. Standard Weather Metrics Grid ───────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            marginTop: 14,
          }}
        >
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: 10, padding: 8, textAlign: 'center' }}>
            <Droplets style={{ width: 14, height: 14, color: '#00d4ff', margin: '0 auto 4px auto' }} />
            <div style={{ fontSize: 9, color: 'rgba(255, 255, 255, 0.5)' }}>HUMIDITY</div>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace' }}>{report.humidity}%</div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: 10, padding: 8, textAlign: 'center' }}>
            <Wind style={{ width: 14, height: 14, color: '#ffea00', margin: '0 auto 4px auto' }} />
            <div style={{ fontSize: 9, color: 'rgba(255, 255, 255, 0.5)' }}>WIND</div>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace' }}>{report.windSpeed} km/h</div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: 10, padding: 8, textAlign: 'center' }}>
            <Activity style={{ width: 14, height: 14, color: '#a855f7', margin: '0 auto 4px auto' }} />
            <div style={{ fontSize: 9, color: 'rgba(255, 255, 255, 0.5)' }}>AIR QUALITY</div>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: report.aqi > 200 ? '#ff1744' : '#22c55e' }}>
              AQI {report.aqi}
            </div>
          </div>
        </div>

        {/* ── 6. 24-Hour Temperature Trend ────────────────────────────────────── */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', marginBottom: 8 }}>
            24-HOUR FORECAST TREND
          </div>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
            {report.hourly.map((item, idx) => (
              <div
                key={idx}
                style={{
                  flex: '0 0 52px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: 8,
                  padding: '6px 4px',
                  textAlign: 'center',
                  border: idx === 0 ? '1px solid rgba(0, 212, 255, 0.5)' : 'none',
                }}
              >
                <div style={{ fontSize: 9, color: 'rgba(255, 255, 255, 0.5)' }}>{item.time}</div>
                <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace', color: item.temp >= 40 ? '#ff1744' : '#ffea00', marginTop: 2 }}>
                  {item.temp}°
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 7. Footer Action Bar ────────────────────────────────────────────── */}
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.35)',
          padding: '10px 16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          style={{
            background: 'rgba(255, 255, 255, 0.10)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 20,
            padding: '6px 12px',
            fontSize: 11,
            fontWeight: 600,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
          }}
        >
          <Volume2 style={{ width: 12, height: 12, color: '#00d4ff' }} />
          Audio Advisory
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'rgba(255, 255, 255, 0.5)', fontFamily: 'monospace' }}>
          <span>IMD REALTIME</span>
          <ChevronRight style={{ width: 12, height: 12 }} />
        </div>
      </div>
    </div>
  );
};
