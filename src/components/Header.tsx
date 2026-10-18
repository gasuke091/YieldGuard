import React from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Activity, 
  Zap, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  HelpCircle,
  Radio,
  FileCheck2,
  DollarSign,
  Upload,
  Play,
  Pause
} from 'lucide-react';

interface HeaderProps {
  isAutonomous: boolean;
  setIsAutonomous: (val: boolean) => void;
  isInhibited: boolean;
  onEmergencyInhibit: () => void;
  onReleaseInhibit: () => void;
  totalScrapSavedUsd: number;
  activePresetTitle: string;
  onOpenCopilot: () => void;
  isStreaming: boolean;
  onToggleStreaming: () => void;
  onOpenIngestionModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isAutonomous,
  setIsAutonomous,
  isInhibited,
  onEmergencyInhibit,
  onReleaseInhibit,
  totalScrapSavedUsd,
  activePresetTitle,
  onOpenCopilot,
  isStreaming,
  onToggleStreaming,
  onOpenIngestionModal,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Fab Facility */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-emerald-500 p-0.5 shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>YieldGuard</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-900/90 text-cyan-100 border border-cyan-400/80 font-mono shadow-xs">
                    OSAT COPILOT
                  </span>
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-white font-bold border border-slate-500 shadow-sm hidden sm:inline-block">
                  Cleanroom Bay 4 (Class 100)
                </span>
              </div>
              <p className="text-xs text-slate-200 flex items-center space-x-2 mt-0.5">
                <span className="flex items-center gap-1 text-emerald-300 font-bold">
                  <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
                  SECS/GEM E5/E30 Online
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-200">Active Excursion: <strong className="text-white font-bold bg-slate-900 px-2.5 py-0.5 rounded border border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.3)] inline-block align-bottom">{activePresetTitle}</strong></span>
              </p>
            </div>
          </div>

          {/* Quick Stats & Controls */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Scrap Avoidance Counter */}
            <div className="hidden md:flex flex-col items-end px-3 py-1 bg-slate-900/80 border border-emerald-900/50 rounded-lg">
              <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-0.5">
                <DollarSign className="w-3 h-3" /> Scrap Prevented (YTD)
              </span>
              <span className="text-sm font-mono font-bold text-emerald-300">
                ${totalScrapSavedUsd.toLocaleString()}
              </span>
            </div>

            {/* Ingest Custom Data Modal Button */}
            <button
              type="button"
              onClick={onOpenIngestionModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700 hover:border-cyan-500 transition-all cursor-pointer"
              title="Upload custom machine telemetry CSV or C-SAM SAT scan image"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Ingest Data</span>
            </button>

            {/* Live 1Hz Telemetry Feed Stream Toggle */}
            <button
              type="button"
              onClick={onToggleStreaming}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer border ${
                isStreaming
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/80'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title="Toggle live 1Hz telemetry streaming from equipment sensors"
            >
              <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
              <span className="hidden sm:inline">{isStreaming ? 'Live Stream: 1Hz' : 'Stream: Paused'}</span>
              <span className="sm:hidden">{isStreaming ? '1Hz' : 'Pause'}</span>
            </button>

            {/* Autonomous Mode Toggle */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
              <button
                type="button"
                onClick={() => setIsAutonomous(true)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                  isAutonomous
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Zero-latency autonomous line inhibit on excursion detection"
              >
                <Zap className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lights-Out (Auto)</span>
                <span className="sm:hidden">Auto</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAutonomous(false)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                  !isAutonomous
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Requires Quality Engineer one-click confirmation to inhibit"
              >
                <Activity className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Supervised</span>
                <span className="sm:hidden">Manual</span>
              </button>
            </div>

            {/* MES Inhibit Status Button */}
            {isInhibited ? (
              <button
                type="button"
                onClick={onReleaseInhibit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-950 transition-all border border-rose-400/40 animate-pulse"
                title="Release SECS/GEM Inhibit after Engineer review"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>LINE INHIBITED (Click to Release)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onEmergencyInhibit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/80 text-rose-300 hover:text-rose-200 text-xs font-medium border border-rose-900/40 transition-all"
                title="Manually issue emergency SECS/GEM lot inhibit"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Emergency MES Inhibit</span>
                <span className="sm:hidden">Inhibit</span>
              </button>
            )}

            {/* AI Copilot Trigger */}
            <button
              type="button"
              onClick={onOpenCopilot}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-cyan-900/40 transition-all cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-200 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Ask Copilot</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
