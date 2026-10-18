import React, { useState } from 'react';
import { 
  FmeaRecord, 
  ExcursionPreset 
} from '../types/osat';
import { 
  ShieldAlert, 
  TrendingDown, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Calculator,
  RefreshCw,
  FileCheck
} from 'lucide-react';

interface FmeaRiskMatrixProps {
  fmea: FmeaRecord;
  preset: ExcursionPreset;
  onRecalculateFmea: (step: string, mode: string) => void;
  isRecalculating: boolean;
}

export const FmeaRiskMatrix: React.FC<FmeaRiskMatrixProps> = ({
  fmea,
  preset,
  onRecalculateFmea,
  isRecalculating,
}) => {
  const [customSeverity, setCustomSeverity] = useState<number>(fmea.initial.severity);
  const [customOccurrence, setCustomOccurrence] = useState<number>(fmea.initial.occurrence);
  const [customDetection, setCustomDetection] = useState<number>(fmea.initial.detection);

  const customInitialRpn = customSeverity * customOccurrence * customDetection;
  const customPostRpn = customSeverity * Math.max(1, customOccurrence - 4) * 1; // Detection improves to 1 with inline C-SAM!

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800/60">
              {fmea.complianceStandard}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Live FMEA Dynamic Risk Governance
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span>Process Failure Mode and Effects Analysis (PFMEA)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Real-time RPN reduction from closed-loop autonomous SECS/GEM line containment
          </p>
        </div>

        {/* AI Recalculate Button */}
        <button
          type="button"
          onClick={() => onRecalculateFmea(fmea.processStep, fmea.failureMode)}
          disabled={isRecalculating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-950 transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
          <span>{isRecalculating ? 'Recalculating FMEA...' : 'Gemini FMEA Audit'}</span>
        </button>
      </div>

      {/* RPN Comparison Showcase Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
        {/* Before YieldGuard */}
        <div className="p-4 rounded-lg bg-rose-950/40 border border-rose-900/60 text-center">
          <span className="text-[11px] font-mono text-rose-300 uppercase tracking-wider block font-semibold">
            Legacy Baseline PFMEA
          </span>
          <div className="text-3xl font-extrabold font-mono text-rose-400 my-1">
            RPN {fmea.initial.rpn}
          </div>
          <div className="text-[11px] font-mono text-rose-200/90 mb-2">
            S({fmea.initial.severity}) × O({fmea.initial.occurrence}) × D({fmea.initial.detection})
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-900 text-rose-200 border border-rose-700">
            Action Priority: HIGH (Mandatory Redesign)
          </span>
          <p className="text-[10px] text-slate-400 mt-2">
            Relies on end-of-strip manual visual inspection (D=7, high escape risk).
          </p>
        </div>

        {/* Impact Delta Center Arrow */}
        <div className="flex flex-col items-center justify-center p-3 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center text-emerald-400 mb-2 shadow-lg shadow-emerald-950">
            <TrendingDown className="w-6 h-6 animate-bounce" />
          </div>
          <span className="text-2xl font-black font-mono text-emerald-400">
            -{fmea.rpnReductionPercent}%
          </span>
          <span className="text-xs font-semibold text-slate-300">
            Risk Priority Number Collapse
          </span>
          <span className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
            Instant acoustic detection (D: 7 &rarr; 1) + closed-loop MES inhibit
          </span>
        </div>

        {/* With YieldGuard */}
        <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-900/60 text-center">
          <span className="text-[11px] font-mono text-emerald-300 uppercase tracking-wider block font-semibold">
            YieldGuard Autonomous Copilot
          </span>
          <div className="text-3xl font-extrabold font-mono text-emerald-400 my-1">
            RPN {fmea.revised.rpn}
          </div>
          <div className="text-[11px] font-mono text-emerald-200/90 mb-2">
            S({fmea.revised.severity}) × O({fmea.revised.occurrence}) × D({fmea.revised.detection})
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-900 text-emerald-200 border border-emerald-700">
            Action Priority: LOW (Risk Fully Contained)
          </span>
          <p className="text-[10px] text-slate-400 mt-2">
            Sub-second inline C-SAM ultrasonic gating + SECS/GEM S2F41 interlock.
          </p>
        </div>
      </div>

      {/* Structured FMEA Table Row */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
              <th className="p-3">Process Step</th>
              <th className="p-3">Potential Failure Mode</th>
              <th className="p-3">Failure Effect (Customer/Package)</th>
              <th className="p-3">Mechanistic Cause</th>
              <th className="p-3 text-center">Initial (S-O-D)</th>
              <th className="p-3">YieldGuard Mitigation Actions</th>
              <th className="p-3 text-center">Revised (S-O-D)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900/60">
            <tr>
              <td className="p-3 font-semibold text-white whitespace-nowrap">
                {fmea.processStep}
              </td>
              <td className="p-3 text-rose-300 font-medium">
                {fmea.failureMode}
              </td>
              <td className="p-3 text-slate-300 max-w-xs">
                {fmea.potentialEffect}
              </td>
              <td className="p-3 text-slate-400 max-w-xs">
                {fmea.potentialCause}
              </td>
              <td className="p-3 text-center font-mono">
                <span className="px-2 py-1 rounded bg-rose-950/80 text-rose-300 border border-rose-800 font-bold block">
                  {fmea.initial.severity} × {fmea.initial.occurrence} × {fmea.initial.detection} = {fmea.initial.rpn}
                </span>
                <span className="text-[9px] text-rose-400 block mt-1">High AP</span>
              </td>
              <td className="p-3 text-cyan-200 max-w-sm font-medium">
                {fmea.mitigationActions}
              </td>
              <td className="p-3 text-center font-mono">
                <span className="px-2 py-1 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-bold block">
                  {fmea.revised.severity} × {fmea.revised.occurrence} × {fmea.revised.detection} = {fmea.revised.rpn}
                </span>
                <span className="text-[9px] text-emerald-400 block mt-1">Low AP</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Interactive FMEA Scenario Simulator */}
      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-white flex items-center gap-2">
          <Calculator className="w-4 h-4 text-cyan-400" />
          <span>Interactive PFMEA Risk Sensitivity Simulator</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Severity (S: Impact on Field Reliability):</span>
              <span className="font-mono font-bold text-rose-400">{customSeverity} / 10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={customSeverity}
              onChange={(e) => setCustomSeverity(parseInt(e.target.value, 10))}
              className="w-full accent-rose-500"
            />
            <span className="text-[10px] text-slate-500 block">8 = Thermal throttling or die cracking in field</span>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Occurrence (O: Equipment Drift Frequency):</span>
              <span className="font-mono font-bold text-amber-400">{customOccurrence} / 10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={customOccurrence}
              onChange={(e) => setCustomOccurrence(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500"
            />
            <span className="text-[10px] text-slate-500 block">6 = Occasional drift due to dispense nozzle wear</span>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Detection (D: Inline Inspection Capability):</span>
              <span className="font-mono font-bold text-cyan-400">{customDetection} / 10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={customDetection}
              onChange={(e) => setCustomDetection(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-500"
            />
            <span className="text-[10px] text-slate-500 block">1 = Inline C-SAM (YieldGuard) vs 7 = Manual sampling</span>
          </div>
        </div>

        <div className="p-3 bg-slate-900 rounded-lg flex items-center justify-between text-xs">
          <span className="text-slate-300 font-mono">
            Simulated Baseline RPN: <strong className="text-rose-400">{customInitialRpn}</strong> &rarr; Post-YieldGuard RPN: <strong className="text-emerald-400">{customPostRpn}</strong>
          </span>
          <span className="text-emerald-400 font-mono font-bold">
            Risk Delta: -{Math.round(((customInitialRpn - customPostRpn) / customInitialRpn) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};
