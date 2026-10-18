import React, { useState } from 'react';
import { 
  DollarSign, 
  Clock, 
  TrendingDown, 
  Zap, 
  Sliders, 
  CheckCircle2, 
  ArrowUpRight, 
  ShieldCheck, 
  BarChart3,
  Flame,
  Award
} from 'lucide-react';

interface RoiExecutiveDashboardProps {
  totalScrapSavedUsd: number;
}

export const RoiExecutiveDashboard: React.FC<RoiExecutiveDashboardProps> = ({
  totalScrapSavedUsd,
}) => {
  // Interactive ROI Calculator State
  const [excursionsPerMonth, setExcursionsPerMonth] = useState<number>(6);
  const [stripValueUsd, setStripValueUsd] = useState<number>(38400);
  const [qeCount, setQeCount] = useState<number>(8);
  const [qeHourlyRate, setQeHourlyRate] = useState<number>(75);

  // Computed Values
  const annualScrapSavings = excursionsPerMonth * stripValueUsd * 12;
  const monthlyAdminHoursSavedPerQe = 160 * 0.30; // 30% reduction
  const annualLaborSavings = qeCount * monthlyAdminHoursSavedPerQe * qeHourlyRate * 12;
  const totalAnnualRoi = annualScrapSavings + annualLaborSavings;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
              EXECUTIVE BUSINESS CASE
            </span>
            <span className="text-xs text-slate-400 font-mono">
              OSAT Lights-Out Quality Governance
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span>Key Industry Benefits & Measurable ROI</span>
          </h3>
          <p className="text-xs text-slate-400">
            Validated return metrics across high-volume assembly & test operations
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-950 via-slate-900 to-cyan-950 border border-emerald-500/50 flex items-center gap-3">
          <Award className="w-6 h-6 text-emerald-400" />
          <div>
            <span className="text-[10px] text-emerald-400 uppercase font-mono block font-bold">Projected Annual Fab ROI</span>
            <span className="text-xl font-bold font-mono text-emerald-300">
              ${(totalAnnualRoi / 1000000).toFixed(2)}M / yr
            </span>
          </div>
        </div>
      </div>

      {/* 4 Core Industry Pillars (Directly from User Brief) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1: Scrap Avoidance */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
          <div>
            <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center mb-3">
              <DollarSign className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Scrap Avoidance</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Prevents defect propagation across 50–100+ unit substrate strips by detecting excursions at the first failed unit.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Measurable ROI</span>
            <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
              $10,000–$50,000
            </div>
            <span className="text-[10px] text-emerald-500/90 font-medium">Saved per caught excursion</span>
          </div>
        </div>

        {/* Pillar 2: Engineering Efficiency */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-bl-full pointer-events-none" />
          <div>
            <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-400 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Engineering Efficiency</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Replaces manual data aggregation and paper drafting with instant, AI-generated 8D reports and updated FMEAs.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Measurable ROI</span>
            <div className="text-base font-bold font-mono text-cyan-400 mt-0.5">
              30% Reduction
            </div>
            <span className="text-[10px] text-cyan-400/90 font-medium">In QE administrative hours</span>
          </div>
        </div>

        {/* Pillar 3: Downtime Reduction (MTTR) */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full pointer-events-none" />
          <div>
            <div className="w-9 h-9 rounded-lg bg-indigo-950/80 border border-indigo-800 text-indigo-400 flex items-center justify-center mb-3">
              <TrendingDown className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Downtime Reduction (MTTR)</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Diagnoses technical root causes (e.g., epoxy outgassing, reflow thermal drift) in seconds rather than hours.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Measurable ROI</span>
            <div className="text-base font-bold font-mono text-indigo-400 mt-0.5">
              15–20% Reduction
            </div>
            <span className="text-[10px] text-indigo-400/90 font-medium">In MTTR across equipment cells</span>
          </div>
        </div>

        {/* Pillar 4: Lights-Out Readiness */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />
          <div>
            <div className="w-9 h-9 rounded-lg bg-amber-950/80 border border-amber-800 text-amber-400 flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Lights-Out Readiness</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Eliminates reliance on human operator intuition for line containment, enabling true autonomous quality control.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Measurable ROI</span>
            <div className="text-base font-bold font-mono text-amber-400 mt-0.5">
              Zero Human Latency
            </div>
            <span className="text-[10px] text-amber-400/90 font-medium">340ms autonomous MES containment</span>
          </div>
        </div>
      </div>

      {/* Latency Comparison: Human Lag vs Autonomous YieldGuard */}
      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Containment Latency Comparison (Defect Inception to Equipment Halt)</span>
        </h4>

        <div className="space-y-2 text-xs">
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Legacy Manual Workflow (Operator inspection &amp; lot quarantine ticket):</span>
              <span className="font-mono text-rose-400 font-bold">42.5 Minutes (High Defect Escape Risk)</span>
            </div>
            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
              <div className="h-full bg-rose-600 w-full" />
            </div>
            <span className="text-[10px] text-slate-500">During 42 minutes, 14 strips (1,400 units) process through defective thermal profile.</span>
          </div>

          <div className="pt-2">
            <div className="flex justify-between text-slate-300 mb-1">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                YieldGuard Autonomous Copilot (Multimodal Gemini + SECS/GEM Inhibit):
              </span>
              <span className="font-mono text-emerald-300 font-bold">0.34 Seconds (Zero-Latency Containment)</span>
            </div>
            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[1%]" />
            </div>
            <span className="text-[10px] text-emerald-400/90">Halted at Unit #42 on Strip #1. Zero downline propagation. 100% scrap avoidance.</span>
          </div>
        </div>
      </div>

      {/* Interactive Fab ROI Financial Simulator */}
      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
        <h4 className="text-xs font-bold text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <span>Interactive Fab Financial Return Simulator</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Excursions Caught / Month:</span>
              <span className="font-mono font-bold text-emerald-400">{excursionsPerMonth}</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={excursionsPerMonth}
              onChange={(e) => setExcursionsPerMonth(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500"
            />
            <span className="text-[10px] text-slate-500">Typical OSAT bay with 8-16 active lines</span>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Avg Value per Caught Excursion:</span>
              <span className="font-mono font-bold text-cyan-400">${stripValueUsd.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="10000"
              max="50000"
              step="2000"
              value={stripValueUsd}
              onChange={(e) => setStripValueUsd(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-500"
            />
            <span className="text-[10px] text-slate-500">Based on die loss, substrate, and mold scrap</span>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Quality Engineers on Staff:</span>
              <span className="font-mono font-bold text-indigo-400">{qeCount} QEs</span>
            </div>
            <input
              type="range"
              min="2"
              max="30"
              value={qeCount}
              onChange={(e) => setQeCount(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-500"
            />
            <span className="text-[10px] text-slate-500">30% administrative reduction (~48 hrs/QE/mo)</span>
          </div>
        </div>

        {/* Calculation Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Annual Material Scrap Avoidance:</span>
            <span className="text-lg font-bold font-mono text-emerald-400">
              ${(annualScrapSavings / 1000).toLocaleString()}k / year
            </span>
          </div>

          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Annual QE Hours Liberated:</span>
            <span className="text-lg font-bold font-mono text-cyan-400">
              {Math.round(qeCount * monthlyAdminHoursSavedPerQe * 12).toLocaleString()} Hours (${(annualLaborSavings / 1000).toFixed(0)}k)
            </span>
          </div>

          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Net Facility Value:</span>
            <span className="text-lg font-bold font-mono text-white">
              ${(totalAnnualRoi / 1000000).toFixed(2)}M / year
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
