import React, { useState } from 'react';
import { 
  SubstrateUnit, 
  ExcursionPreset 
} from '../types/osat';
import { 
  AlertOctagon, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  Info, 
  Layers, 
  Activity, 
  Flame, 
  DollarSign,
  Maximize2,
  X,
  Sparkles
} from 'lucide-react';

interface SubstrateStripVisualizerProps {
  units: SubstrateUnit[];
  preset: ExcursionPreset;
  isInhibited: boolean;
  onSelectUnit: (unit: SubstrateUnit) => void;
  selectedUnit: SubstrateUnit | null;
  onTriggerInhibit: () => void;
}

export const SubstrateStripVisualizer: React.FC<SubstrateStripVisualizerProps> = ({
  units,
  preset,
  isInhibited,
  onSelectUnit,
  selectedUnit,
  onTriggerInhibit,
}) => {
  const [filter, setFilter] = useState<'all' | 'defect' | 'inhibited' | 'pass'>('all');
  const [showModal, setShowModal] = useState<boolean>(false);

  const defectCount = units.filter((u) => u.status === 'defect').length;
  const inhibitedCount = units.filter((u) => u.status === 'inhibited').length;
  const passCount = units.filter((u) => u.status === 'pass').length;
  const marginalCount = units.filter((u) => u.status === 'marginal').length;

  const filteredUnits = units.filter((u) => {
    if (filter === 'all') return true;
    if (filter === 'defect') return u.status === 'defect';
    if (filter === 'inhibited') return u.status === 'inhibited';
    if (filter === 'pass') return u.status === 'pass' || u.status === 'marginal';
    return true;
  });

  const firstFailedUnit = units.find((u) => u.index === preset.firstFailedIndex);

  const handleUnitClick = (unit: SubstrateUnit) => {
    onSelectUnit(unit);
    setShowModal(true);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl relative overflow-hidden">
      {/* Background ambient cleanroom grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

      {/* Top Banner: Strip Identification & Propagation Alert */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded text-xs font-mono font-black bg-indigo-600 text-white border-2 border-indigo-300 shadow-sm">
              STRIP MATRIX: 4 x 25 (100 UNITS)
            </span>
            <span className="text-xs text-slate-100 font-mono">
              Strip: <strong className="text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-400 font-bold">{preset.stripId}</strong> • Lot: <strong className="text-white bg-cyan-950 px-2 py-0.5 rounded border border-cyan-400 font-bold">{preset.lotId}</strong>
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-white font-bold border border-slate-400 shadow-sm">
              {preset.packageType}
            </span>
          </div>

          <p className="text-sm text-slate-100 mt-2 flex flex-wrap items-center gap-2">
            <span>Machine: <strong className="text-white font-bold bg-slate-950 px-2.5 py-1 rounded border-2 border-cyan-400 shadow-sm">{preset.equipmentId}</strong></span>
            <span className="text-slate-400">•</span>
            <span>Excursion Type: <strong className="text-white font-bold bg-rose-950 px-2.5 py-1 rounded border-2 border-rose-500 shadow-sm">{preset.defectType}</strong></span>
          </p>
        </div>

        {/* Real-time Excursion Containment Status Pill */}
        <div className="flex items-center gap-3">
          {isInhibited ? (
            <div className="px-3.5 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-xs font-bold text-emerald-300">MES Inhibit Active (Contained)</p>
                <p className="text-[10px] text-emerald-400/80">
                  {inhibitedCount} downstream units saved • ${preset.preventableScrapUsd.toLocaleString()} scrap avoided
                </p>
              </div>
            </div>
          ) : (
            <div className="px-3.5 py-1.5 rounded-lg bg-rose-950/80 border border-rose-500/50 flex items-center gap-2 animate-pulse">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <div>
                <p className="text-xs font-bold text-rose-300">Uncontained Excursion In Progress</p>
                <p className="text-[10px] text-rose-400/80">
                  Defect propagating across strip • Click to halt line
                </p>
              </div>
              <button
                type="button"
                onClick={onTriggerInhibit}
                className="ml-2 px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow transition-all cursor-pointer"
              >
                Trigger Inhibit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Excursion Propagation Insight Box */}
      {preset.firstFailedIndex !== -1 && (
        <div className={`my-4 p-3 rounded-lg border text-xs flex items-start gap-3 transition-colors ${
          isInhibited 
            ? 'bg-slate-950/80 border-cyan-800/50 text-slate-300' 
            : 'bg-rose-950/40 border-rose-800/60 text-rose-200'
        }`}>
          <div className="p-1.5 rounded bg-slate-900 border border-slate-700 shrink-0">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">
                First Failed Unit Detection: <span className="text-rose-400 font-mono">Unit #{preset.firstFailedIndex}</span>
              </span>
              <span className="font-mono text-[11px] text-cyan-300">
                Acoustic Tomography Gate: 100MHz C-SAM
              </span>
            </div>
            <p className="text-slate-300 mt-0.5 leading-relaxed">
              {isInhibited ? (
                <>
                  <strong className="text-emerald-400">Closed-Loop Success:</strong> YieldGuard detected interfacial delamination at Unit #{preset.firstFailedIndex} and dispatched a SECS/GEM <code className="bg-slate-800 px-1 py-0.5 rounded text-cyan-300">S2F41 LOT_INHIBIT</code> in <strong>340ms</strong>. Equipment paused before defect could ruin the entire 100-unit strip, preventing <strong>${preset.preventableScrapUsd.toLocaleString()}</strong> in wasted silicon, gold wire, and mold compound.
                </>
              ) : (
                <>
                  <strong className="text-rose-400">Critical Excursion Warning:</strong> Thermal drift began at Unit #{preset.firstFailedIndex}. Without immediate closed-loop inhibit, molten dispense and mold voids will propagate downstream to all 100 units on this strip ($50,000 scrap risk).
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Legend & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs">
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              filter === 'all' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All (100)
          </button>
          <button
            type="button"
            onClick={() => setFilter('defect')}
            className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
              filter === 'defect' ? 'bg-rose-950 text-rose-300 border border-rose-800 font-medium' : 'text-rose-400 hover:text-rose-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
            Defect ({defectCount})
          </button>
          {inhibitedCount > 0 && (
            <button
              type="button"
              onClick={() => setFilter('inhibited')}
              className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                filter === 'inhibited' ? 'bg-purple-950 text-purple-300 border border-purple-800 font-medium' : 'text-purple-400 hover:text-purple-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-500 inline-block"></span>
              Inhibited/Saved ({inhibitedCount})
            </button>
          )}
          <button
            type="button"
            onClick={() => setFilter('pass')}
            className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
              filter === 'pass' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 font-medium' : 'text-emerald-400 hover:text-emerald-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            Passed ({passCount + marginalCount})
          </button>
        </div>

        {/* Legend Indicators */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-500/80 border border-emerald-400"></div>
            <span>Pass (C-SAM &lt;5%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-500/80 border border-amber-400"></div>
            <span>Marginal (5-15%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-rose-600 border border-rose-300 shadow shadow-rose-500/40 animate-pulse"></div>
            <span>Excursion Defect (&gt;30%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-purple-600/70 border border-purple-400"></div>
            <span>MES Inhibited / Saved</span>
          </div>
        </div>
      </div>

      {/* Substrate Strip Matrix (4 rows x 25 columns) */}
      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 shadow-inner overflow-x-auto">
        <div className="min-w-[880px]">
          <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(25, minmax(0, 1fr))' }}>
            {units.map((unit) => {
              const isSelected = selectedUnit?.index === unit.index;
              const isFirstFailed = unit.index === preset.firstFailedIndex;
              const isDimmed = filter !== 'all' && (
                (filter === 'defect' && unit.status !== 'defect') ||
                (filter === 'inhibited' && unit.status !== 'inhibited') ||
                (filter === 'pass' && unit.status !== 'pass' && unit.status !== 'marginal')
              );

              let bgClasses = 'bg-emerald-950/70 border-emerald-700/60 text-emerald-300 hover:border-emerald-400';
              if (unit.status === 'defect') {
                bgClasses = 'bg-rose-950 border-rose-500 text-rose-200 hover:border-rose-300 shadow-sm shadow-rose-900/50';
              } else if (unit.status === 'marginal') {
                bgClasses = 'bg-amber-950/80 border-amber-600 text-amber-200 hover:border-amber-400';
              } else if (unit.status === 'inhibited') {
                bgClasses = 'bg-purple-950/80 border-purple-600/80 text-purple-200 hover:border-purple-300';
              }

              return (
                <button
                  key={unit.index}
                  type="button"
                  onClick={() => handleUnitClick(unit)}
                  className={`relative aspect-square rounded-md border flex flex-col items-center justify-center text-[10px] font-mono transition-all duration-150 cursor-pointer ${bgClasses} ${
                    isSelected ? 'ring-2 ring-cyan-400 scale-105 z-10' : ''
                  } ${isDimmed ? 'opacity-20 pointer-events-none' : 'opacity-100'} ${
                    isFirstFailed ? 'ring-2 ring-yellow-400 animate-pulse' : ''
                  }`}
                  title={`Unit #${unit.index} (R${unit.row}C${unit.col}) - ${unit.status.toUpperCase()} - C-SAM: ${unit.acousticReflectionPercent.toFixed(1)}%`}
                >
                  {/* First Failed Unit Star Indicator */}
                  {isFirstFailed && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3 z-20">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-400 text-[8px] font-bold text-slate-950 items-center justify-center">
                        !
                      </span>
                    </span>
                  )}

                  <span className="font-semibold text-[9px]">{unit.index}</span>

                  {/* Micro Package Dot */}
                  <div
                    className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                      unit.status === 'defect'
                        ? 'bg-rose-400'
                        : unit.status === 'marginal'
                        ? 'bg-amber-400'
                        : unit.status === 'inhibited'
                        ? 'bg-purple-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-2 pt-2 border-t border-slate-900">
            <span>&larr; Leadframe Carrier Infeed (Slot 01)</span>
            <span>Strip Direction &rarr; Outfeed to C-SAM / Mold / Solder Ball Attach</span>
            <span>Slot 25 &rarr;</span>
          </div>
        </div>
      </div>

      {/* Package Detail Modal / Drawer */}
      {showModal && selectedUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-5 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <div className={`p-2 rounded-lg ${
                selectedUnit.status === 'defect' ? 'bg-rose-950 text-rose-400' : 'bg-slate-800 text-cyan-400'
              }`}>
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Unit #{selectedUnit.index} (Row {selectedUnit.row}, Col {selectedUnit.col})</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-mono uppercase ${
                    selectedUnit.status === 'defect'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : selectedUnit.status === 'inhibited'
                      ? 'bg-purple-950 text-purple-300 border border-purple-800'
                      : selectedUnit.status === 'marginal'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {selectedUnit.status}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Strip: {preset.stripId} • Package: {preset.packageType}
                </p>
              </div>
            </div>

            {/* Micro Inspection Metrics */}
            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">C-SAM Acoustic Reflection</span>
                <span className={`text-lg font-bold font-mono ${
                  selectedUnit.acousticReflectionPercent > 25 ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {selectedUnit.acousticReflectionPercent.toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Threshold: &lt;15.0%</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Bondline Thickness (BLT)</span>
                <span className="text-lg font-bold font-mono text-cyan-300">
                  {selectedUnit.bondlineThicknessUm.toFixed(1)} µm
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Target: 15.0 ± 3.0 µm</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Wire Bond Pull Force</span>
                <span className="text-lg font-bold font-mono text-indigo-300">
                  {selectedUnit.wireBondPullGf?.toFixed(1) || 'N/A'} gf
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Spec: &gt;8.0 gf (Mil-883)</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Thermal Conductance</span>
                <span className="text-lg font-bold font-mono text-emerald-300">
                  {selectedUnit.thermalConductivityWmK.toFixed(1)} W/m·K
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Die Attach Efficiency</span>
              </div>
            </div>

            {/* Defect Diagnostics Description */}
            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-xs">
              <span className="font-semibold text-slate-200 block mb-1">Acoustic Diagnostic Notes:</span>
              <p className="text-slate-400 leading-relaxed">
                {selectedUnit.defectType || 'Package layer interfaces exhibit uniform acoustic transmission with no anomalous phase inversion at 100MHz transducer frequency. Compliant with J-STD-020E.'}
              </p>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
