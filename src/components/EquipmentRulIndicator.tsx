import React, { useState } from 'react';
import { 
  Hourglass, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench, 
  Cpu, 
  Sparkles, 
  Sliders, 
  Clock, 
  TrendingDown, 
  Layers, 
  RefreshCw,
  Send,
  Zap,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { EquipmentRulComponent, ExcursionPreset } from '../types/osat';
import { PmWorkOrderModal } from './PmWorkOrderModal';

interface EquipmentRulIndicatorProps {
  components: EquipmentRulComponent[];
  preset: ExcursionPreset;
  onDispatchPm: (componentId: string, partNumber: string) => void;
  onCompletePm: (componentId: string) => void;
}

export const EquipmentRulIndicator: React.FC<EquipmentRulIndicatorProps> = ({
  components,
  preset,
  onDispatchPm,
  onCompletePm,
}) => {
  const [selectedCompId, setSelectedCompId] = useState<string>(components[0].componentId);
  const [stressMultiplier, setStressMultiplier] = useState<number>(1.0);
  const [isAiPredicting, setIsAiPredicting] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);
  const [pmDispatchedMap, setPmDispatchedMap] = useState<Record<string, boolean>>({});
  const [isPmModalOpen, setIsPmModalOpen] = useState<boolean>(false);

  const activeComp = components.find((c) => c.componentId === selectedCompId) || components[0];

  // Adjust RUL based on stress multiplier
  const adjustedRulHours = Number((activeComp.rulHours / stressMultiplier).toFixed(1));
  const adjustedRulStrips = Math.round(activeComp.rulStrips / stressMultiplier);

  // SVG degradation chart parameters
  const chartW = 560;
  const chartH = 150;
  const pad = 30;

  // Project future failure point
  const totalTrajectoryHours = 48 + adjustedRulHours;
  const getX = (hour: number) => {
    // Range: -48h to +adjustedRulHours
    return pad + ((hour + 48) / totalTrajectoryHours) * (chartW - pad * 2);
  };
  const getY = (health: number) => {
    // 100% to 0%
    return pad + ((100 - health) / 100) * (chartH - pad * 2);
  };

  // Historical path
  const historicalPoints = activeComp.historicalWearPoints
    .map((p) => `${getX(p.hour)},${getY(p.health)}`)
    .join(' ');

  // Current point
  const currentX = getX(0);
  const currentY = getY(activeComp.healthScorePercent);

  // Projected failure point (Health = 0 at +adjustedRulHours)
  const failureX = getX(adjustedRulHours);
  const failureY = getY(0);

  const handleAiPredictRul = async () => {
    setIsAiPredicting(true);
    try {
      const res = await fetch('/api/copilot/predict-rul', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          componentId: activeComp.componentId,
          equipmentId: activeComp.equipmentId,
          telemetry: preset.telemetry,
          stressFactor: stressMultiplier,
        }),
      });
      const data = await res.json();
      if (data.rul) {
        setAiAnalysis(data.rul);
      }
    } catch (err) {
      console.warn('RUL error:', err);
    } finally {
      setIsAiPredicting(false);
    }
  };

  const handleDispatchTicket = () => {
    onDispatchPm(activeComp.componentId, activeComp.partNumber);
    setPmDispatchedMap((prev) => ({ ...prev, [activeComp.componentId]: true }));
    setIsPmModalOpen(true);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60 flex items-center gap-1.5">
              <Hourglass className="w-3 h-3 text-cyan-400 animate-pulse" />
              PREDICTIVE MAINTENANCE (PdM)
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Telemetry Physics-of-Failure Degradation Model
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>Equipment Component Remaining Useful Life (RUL)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Real-time prognosis of tooling, vacuum manifolds, and heating blocks to preempt line excursions
          </p>
        </div>

        {/* AI Prognosis Button */}
        <button
          type="button"
          onClick={handleAiPredictRul}
          disabled={isAiPredicting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-cyan-950 transition-colors cursor-pointer disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isAiPredicting ? 'animate-spin' : ''}`} />
          <span>{isAiPredicting ? 'Gemini Computing RUL...' : 'Gemini AI Prognosis'}</span>
        </button>
      </div>

      {/* Component Selector Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {components.map((c) => {
          const isSelected = c.componentId === selectedCompId;
          const isCritical = c.maintenancePriority === 'CRITICAL';
          const isWarning = c.maintenancePriority === 'WARNING';

          return (
            <button
              key={c.componentId}
              type="button"
              onClick={() => {
                setSelectedCompId(c.componentId);
                setAiAnalysis(null);
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-950 border-cyan-500 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/40'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                <span className="text-slate-400">{c.category}</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  isCritical
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : isWarning
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}>
                  {c.maintenancePriority}
                </span>
              </div>

              <div className="text-xs font-bold text-white truncate">{c.name}</div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">{c.equipmentId}</div>

              {/* Mini Health Bar */}
              <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">RUL:</span>
                <span className={`font-bold ${isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {c.rulHours}h ({c.rulStrips} strips)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                <div
                  className={`h-full ${
                    isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${c.healthScorePercent}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Main RUL Prognosis Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Degradation Curve SVG (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-white font-bold flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-400" />
              <span>Degradation Kinetics &amp; Failure Horizon</span>
            </span>
            <span className="text-slate-400">
              Wear Rate: <strong className="text-rose-400 font-bold">{activeComp.wearRatePerHour * stressMultiplier}% / hour</strong>
            </span>
          </div>

          {/* SVG Plot */}
          <div className="relative bg-slate-900/90 rounded-lg border border-slate-800 p-2">
            <svg className="w-full h-40 overflow-visible" viewBox={`0 0 ${chartW} ${chartH}`}>
              {/* Threshold limits */}
              {/* 100% Health line */}
              <line x1={pad} y1={pad} x2={chartW - pad} y2={pad} stroke="rgba(148, 163, 184, 0.15)" strokeDasharray="3,3" />
              <text x={pad + 5} y={pad - 5} fill="#64748b" fontSize="8" fontFamily="monospace">100% (New Tooling)</text>

              {/* 20% Critical Warning Line */}
              <line x1={pad} y1={getY(20)} x2={chartW - pad} y2={getY(20)} stroke="#f43f5e" strokeDasharray="2,2" strokeWidth="0.8" />
              <text x={chartW - pad - 110} y={getY(20) - 4} fill="#f43f5e" fontSize="8" fontFamily="monospace">Critical Inhibit Gate (20%)</text>

              {/* 0% Failure line */}
              <line x1={pad} y1={getY(0)} x2={chartW - pad} y2={getY(0)} stroke="#ef4444" strokeWidth="1" />
              <text x={pad + 5} y={getY(0) + 12} fill="#ef4444" fontSize="8" fontFamily="monospace">0% (Unrecoverable Breakdown)</text>

              {/* T=0 Present Line */}
              <line x1={currentX} y1={pad} x2={currentX} y2={getY(0)} stroke="#06b6d4" strokeDasharray="3,3" strokeWidth="1" />
              <text x={currentX - 20} y={getY(0) + 12} fill="#06b6d4" fontSize="8" fontFamily="monospace">T=0 (Now)</text>

              {/* Historical Wear Polyline */}
              <polyline
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                points={historicalPoints}
              />

              {/* Projected Degradation Trajectory (Dashed) */}
              <line
                x1={currentX}
                y1={currentY}
                x2={failureX}
                y2={failureY}
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeDasharray="4,4"
              />

              {/* Current Status Point */}
              <circle cx={currentX} cy={currentY} r={5} fill="#06b6d4" stroke="#ffffff" strokeWidth="2" />

              {/* Projected Failure Point */}
              <circle cx={failureX} cy={failureY} r={5} fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
              <text x={failureX - 45} y={failureY - 8} fill="#ef4444" fontSize="9" fontFamily="monospace" fontWeight="bold">
                +{adjustedRulHours}h RUL Limit
              </text>
            </svg>
          </div>

          {/* Interactive Stress Sensitivity Slider */}
          <div className="pt-2 border-t border-slate-800 text-xs">
            <div className="flex items-center justify-between text-slate-300 mb-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Operating Stress / Throughput Multiplier:</span>
              </span>
              <span className="font-mono font-bold text-cyan-300">{stressMultiplier}x Nominal Load</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={stressMultiplier}
              onChange={(e) => setStressMultiplier(parseFloat(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
              <span>0.5x (Gentle / Reduced Thermal Ramp)</span>
              <span>1.0x (Standard Recipe)</span>
              <span>2.0x (High-Volume Overclocking)</span>
            </div>
          </div>
        </div>

        {/* Right: Detailed Component RUL KPI & Dispatch (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main RUL Number Card */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">Calculated RUL</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                activeComp.maintenancePriority === 'CRITICAL'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                {activeComp.maintenancePriority}
              </span>
            </div>

            <div className="flex items-baseline gap-2 my-1">
              <span className={`text-3xl font-extrabold font-mono ${
                activeComp.maintenancePriority === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'
              }`}>
                {adjustedRulHours} Hours
              </span>
              <span className="text-xs font-mono text-slate-400">
                (~{adjustedRulStrips} substrate strips)
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mt-1">
              Estimated unrecoverable failure at: <strong className="text-slate-200 font-mono">
                {new Date(Date.now() + adjustedRulHours * 3600 * 1000).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </strong>
            </p>

            <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Physics-of-Failure Mechanism:</span>
                <p className="text-slate-300 mt-0.5 leading-relaxed">
                  {activeComp.failureMechanism}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Telemetry Signature Correlated:</span>
                <ul className="list-disc list-inside text-slate-400 text-[11px] space-y-0.5 mt-0.5">
                  {activeComp.telemetryCorrelations.map((sig, i) => (
                    <li key={i}>{sig}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Cleanroom PM Work Order Dispatch Card */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">OEM Replacement Part:</span>
              <span className="text-cyan-300 font-mono font-bold">{activeComp.partNumber}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">Estimated Tool PM Downtime:</span>
              <span className="text-slate-200 font-mono">25 Minutes (Standard Changeover)</span>
            </div>

            {pmDispatchedMap[activeComp.componentId] ? (
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>PM Ticket #WO-9042 Active</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">Bay 4 Assigned</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPmModalOpen(true)}
                  className="w-full py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-cyan-950"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Execute PM Calibration &amp; Restore RUL (Step-by-Step)</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleDispatchTicket}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all border border-slate-700 hover:border-cyan-500 cursor-pointer shadow-md"
              >
                <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                <span>Schedule Preventive Maintenance (PM Ticket)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI RUL Prognosis Assessment (When Clicked) */}
      {aiAnalysis && (
        <div className="p-4 rounded-xl bg-slate-950 border border-cyan-800/80 space-y-2 animate-in fade-in text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Gemini 3.8 Flash Equipment Health Assessment</span>
            </span>
            <span className="font-mono text-cyan-300">
              Confidence: 98.4%
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {aiAnalysis.failureMechanism}
          </p>
          <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-cyan-200">
            <strong>Optimal Maintenance Timing:</strong> {aiAnalysis.recommendedAction}
          </div>
        </div>
      )}

      {/* PM Work Order Execution Modal */}
      <PmWorkOrderModal
        isOpen={isPmModalOpen}
        onClose={() => setIsPmModalOpen(false)}
        component={activeComp}
        onCompletePm={(id) => {
          onCompletePm(id);
          setPmDispatchedMap((prev) => ({ ...prev, [id]: false }));
        }}
      />
    </div>
  );
};
