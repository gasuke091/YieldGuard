import React, { useState } from 'react';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  Thermometer, 
  Gauge, 
  Zap,
  Sliders
} from 'lucide-react';
import { MachineTelemetry, ExcursionPreset } from '../types/osat';

interface TelemetrySpcChartProps {
  telemetrySeries: MachineTelemetry[];
  preset: ExcursionPreset;
  isInhibited: boolean;
}

export const TelemetrySpcChart: React.FC<TelemetrySpcChartProps> = ({
  telemetrySeries,
  preset,
  isInhibited,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'temp' | 'vacuum' | 'pressure' | 'cpk'>('temp');

  const latest = telemetrySeries[telemetrySeries.length - 1] || telemetrySeries[0];
  const isExcursion = preset.firstFailedIndex !== -1;

  // Compute SVG polyline points for the selected metric
  const svgWidth = 600;
  const svgHeight = 160;
  const padding = 25;

  let minVal = 100;
  let maxVal = 120;
  let ucl = 112.5;
  let lcl = 107.5;
  let target = 110.0;
  let unit = '°C';
  let metricName = 'Dispense Nozzle / Stage Temperature';

  if (selectedMetric === 'temp') {
    minVal = 105;
    maxVal = 118;
    ucl = 112.5;
    lcl = 107.5;
    target = 110.0;
    unit = '°C';
    metricName = 'Dispense Heater Block Temperature';
  } else if (selectedMetric === 'vacuum') {
    minVal = -22;
    maxVal = -8;
    ucl = -16.0;
    lcl = -20.0;
    target = -18.0;
    unit = 'kPa';
    metricName = 'Chamber Degas Vacuum Pressure';
  } else if (selectedMetric === 'pressure') {
    minVal = 25;
    maxVal = 45;
    ucl = 38.0;
    lcl = 32.0;
    target = 35.0;
    unit = 'psi';
    metricName = 'Pneumatic Dispenser Injection Pressure';
  } else if (selectedMetric === 'cpk') {
    minVal = 0.5;
    maxVal = 2.2;
    ucl = 2.0;
    lcl = 1.33;
    target = 1.67;
    unit = '';
    metricName = 'Real-Time Process Capability (Cpk)';
  }

  const getY = (val: number) => {
    const clamped = Math.max(minVal, Math.min(maxVal, val));
    return svgHeight - padding - ((clamped - minVal) / (maxVal - minVal)) * (svgHeight - padding * 2);
  };

  const getX = (idx: number, total: number) => {
    return padding + (idx / (total - 1)) * (svgWidth - padding * 2);
  };

  const points = telemetrySeries.map((d, i) => {
    let val = d.temperatureC;
    if (selectedMetric === 'vacuum') val = d.vacuumPressureKpa;
    if (selectedMetric === 'pressure') val = d.dispensePressurePsi;
    if (selectedMetric === 'cpk') val = d.cpk;
    return `${getX(i, telemetrySeries.length)},${getY(val)}`;
  }).join(' ');

  const uclY = getY(ucl);
  const lclY = getY(lcl);
  const targetY = getY(target);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
      {/* Header & Metric Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <span>Process Telemetry & Statistical Process Control (SPC)</span>
          </h3>
          <p className="text-xs text-slate-400">
            High-frequency SECS/GEM trace variables correlated with acoustic quality excursions
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setSelectedMetric('temp')}
            className={`px-2.5 py-1 rounded transition-colors ${
              selectedMetric === 'temp' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Temperature
          </button>
          <button
            type="button"
            onClick={() => setSelectedMetric('vacuum')}
            className={`px-2.5 py-1 rounded transition-colors ${
              selectedMetric === 'vacuum' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Vacuum
          </button>
          <button
            type="button"
            onClick={() => setSelectedMetric('pressure')}
            className={`px-2.5 py-1 rounded transition-colors ${
              selectedMetric === 'pressure' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pressure
          </button>
          <button
            type="button"
            onClick={() => setSelectedMetric('cpk')}
            className={`px-2.5 py-1 rounded transition-colors ${
              selectedMetric === 'cpk' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cpk Index
          </button>
        </div>
      </div>

      {/* SPC KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
          <span className="text-[11px] text-slate-400 block">Current {selectedMetric.toUpperCase()}</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold font-mono text-white">
              {selectedMetric === 'temp'
                ? `${latest.temperatureC}°C`
                : selectedMetric === 'vacuum'
                ? `${latest.vacuumPressureKpa} kPa`
                : selectedMetric === 'pressure'
                ? `${latest.dispensePressurePsi} psi`
                : latest.cpk}
            </span>
            {isExcursion && selectedMetric === 'temp' && (
              <span className="text-[11px] font-mono text-rose-400 font-bold flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +4.8°C DRIFT
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-500 block">Target: {target} {unit}</span>
        </div>

        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
          <span className="text-[11px] text-slate-400 block">Process Capability (Cpk)</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className={`text-xl font-bold font-mono ${latest.cpk < 1.33 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {latest.cpk}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {latest.cpk >= 1.67 ? '(6σ Capable)' : '(Out of Control)'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block">Automotive Spec: ≥1.67</span>
        </div>

        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
          <span className="text-[11px] text-slate-400 block">Statistical Control Limits</span>
          <div className="text-xs font-mono text-slate-200 mt-1">
            UCL: <span className="text-rose-400">{ucl}</span> | LCL: <span className="text-sky-400">{lcl}</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">3-Sigma Shewhart Envelope</span>
        </div>

        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
          <span className="text-[11px] text-slate-400 block">SPC Rule Status</span>
          <div className="mt-1">
            {isExcursion ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                <AlertCircle className="w-3 h-3 text-rose-400" /> WE Rule 2: 9 pts &gt; Center
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> In Statistical Control
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">Western Electric Pattern Monitor</span>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
          <span>{metricName} (Trend over last 12 minutes)</span>
          <span className="text-cyan-400">Sampling Rate: 10 Hz SECS Trace</span>
        </div>

        <svg className="w-full h-44 overflow-visible" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          {/* Background gridlines */}
          <line x1={padding} y1={uclY} x2={svgWidth - padding} y2={uclY} stroke="#f43f5e" strokeDasharray="3,3" strokeWidth="1" />
          <line x1={padding} y1={targetY} x2={svgWidth - padding} y2={targetY} stroke="#06b6d4" strokeDasharray="2,2" strokeWidth="0.8" />
          <line x1={padding} y1={lclY} x2={svgWidth - padding} y2={lclY} stroke="#38bdf8" strokeDasharray="3,3" strokeWidth="1" />

          {/* Labels on right */}
          <text x={svgWidth - padding + 5} y={uclY + 3} fill="#f43f5e" fontSize="9" fontFamily="monospace">UCL: {ucl}</text>
          <text x={svgWidth - padding + 5} y={targetY + 3} fill="#06b6d4" fontSize="9" fontFamily="monospace">Target: {target}</text>
          <text x={svgWidth - padding + 5} y={lclY + 3} fill="#38bdf8" fontSize="9" fontFamily="monospace">LCL: {lcl}</text>

          {/* Excursion Shaded Region (samples 16 to 20) */}
          {isExcursion && (
            <rect
              x={getX(15, telemetrySeries.length)}
              y={padding}
              width={getX(20, telemetrySeries.length) - getX(15, telemetrySeries.length)}
              height={svgHeight - padding * 2}
              fill="rgba(244, 63, 94, 0.12)"
              stroke="rgba(244, 63, 94, 0.4)"
              strokeDasharray="2,2"
            />
          )}

          {/* Main Telemetry Line */}
          <polyline
            fill="none"
            stroke={selectedMetric === 'temp' && isExcursion ? '#f43f5e' : '#818cf8'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />

          {/* Point Dots */}
          {telemetrySeries.map((d, i) => {
            let val = d.temperatureC;
            if (selectedMetric === 'vacuum') val = d.vacuumPressureKpa;
            if (selectedMetric === 'pressure') val = d.dispensePressurePsi;
            if (selectedMetric === 'cpk') val = d.cpk;

            const isPointExcursion = i >= 16 && i <= 19 && isExcursion;
            return (
              <circle
                key={i}
                cx={getX(i, telemetrySeries.length)}
                cy={getY(val)}
                r={isPointExcursion ? 4 : 2}
                fill={isPointExcursion ? '#ef4444' : '#c7d2fe'}
                stroke={isPointExcursion ? '#ffffff' : 'none'}
                strokeWidth={isPointExcursion ? 1.5 : 0}
              />
            );
          })}
        </svg>

        {isExcursion && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-rose-950/90 border border-rose-500/80 px-3 py-1 rounded-md text-[11px] font-mono text-rose-200 shadow-lg pointer-events-none">
            Excursion Window: Unit #42 Trigger Point (Thermal Ramp Exceeded Upper Control Limit)
          </div>
        )}
      </div>
    </div>
  );
};
