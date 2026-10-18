/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  EXCURSION_PRESETS, 
  generateStripUnits, 
  INITIAL_TELEMETRY_SERIES, 
  INITIAL_8D_REPORT, 
  INITIAL_FMEA_RECORD,
  INITIAL_RUL_COMPONENTS 
} from './data/mockFabData';
import { 
  ExcursionPreset, 
  SubstrateUnit, 
  EightDReport, 
  FmeaRecord, 
  MesHoldItem,
  EquipmentRulComponent,
  MachineTelemetry 
} from './types/osat';
import { Header } from './components/Header';
import { SubstrateStripVisualizer } from './components/SubstrateStripVisualizer';
import { CSamAcousticInspector } from './components/CSamAcousticInspector';
import { TelemetrySpcChart } from './components/TelemetrySpcChart';
import { EightDReportViewer } from './components/EightDReportViewer';
import { FmeaRiskMatrix } from './components/FmeaRiskMatrix';
import { SecsGemTerminal } from './components/SecsGemTerminal';
import { RoiExecutiveDashboard } from './components/RoiExecutiveDashboard';
import { OperationalCopilotDrawer } from './components/OperationalCopilotDrawer';
import { EquipmentRulIndicator } from './components/EquipmentRulIndicator';
import { CustomDataIngestionModal } from './components/CustomDataIngestionModal';

import { 
  LayoutDashboard, 
  Waves, 
  FileText, 
  ShieldAlert, 
  Server, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Sparkles, 
  Zap, 
  Play, 
  RefreshCw,
  Cpu,
  ChevronRight,
  ShieldCheck,
  Radio,
  Upload
} from 'lucide-react';

export default function App() {
  const [presetsList, setPresetsList] = useState<ExcursionPreset[]>(EXCURSION_PRESETS);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(EXCURSION_PRESETS[0].id);
  const [telemetrySeries, setTelemetrySeries] = useState<MachineTelemetry[]>(INITIAL_TELEMETRY_SERIES);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [ingestionModalOpen, setIngestionModalOpen] = useState<boolean>(false);
  const [customAcousticImage, setCustomAcousticImage] = useState<string | null>(null);

  const [isAutonomous, setIsAutonomous] = useState<boolean>(true);
  const [isInhibited, setIsInhibited] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'monitor' | 'inspector' | 'eight_d' | 'fmea' | 'mes' | 'roi'>('monitor');
  const [selectedUnit, setSelectedUnit] = useState<SubstrateUnit | null>(null);
  const [copilotOpen, setCopilotOpen] = useState<boolean>(false);

  // Data states
  const [report8D, setReport8D] = useState<EightDReport>(INITIAL_8D_REPORT);
  const [fmeaRecord, setFmeaRecord] = useState<FmeaRecord>(INITIAL_FMEA_RECORD);
  const [mesRecords, setMesRecords] = useState<MesHoldItem[]>([
    {
      id: 'MES-HLD-8021',
      timestamp: new Date(Date.now() - 1000 * 60 * 24).toISOString(),
      lotId: 'LOT-2026-BGA-9420',
      equipmentId: 'LINE-DA-07 (Besi Datacon 8800)',
      recipeId: 'RCP-EPX-CONDUCT-v4.2',
      stripId: 'STRIP-2026-X89',
      unitIndex: 42,
      defectType: 'Die-Attach Delamination & Voiding',
      secsMessage: 'S2F41 [RCMD=LOT_INHIBIT, LOTID=LOT-2026-BGA-9420, ACTION=CARRIER_DIVERT]',
      status: 'INHIBITED',
      operator: 'YieldGuard Autonomous Daemon (340ms)',
      estimatedScrapPreventedUsd: 38400,
      reason: 'Acoustic C-SAM detected 34.2% delamination at die-to-paddle interface; nozzle thermal drift (+4.8°C)',
    },
    {
      id: 'MES-HLD-8019',
      timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
      lotId: 'LOT-2026-QFN-4112',
      equipmentId: 'LINE-MP-02 (TOWA Mold Press 120T)',
      recipeId: 'RCP-EMC-SUMITOMO-G770',
      stripId: 'STRIP-2026-M14',
      unitIndex: 18,
      defectType: 'Epoxy Mold Compound Micro-Voids',
      secsMessage: 'S2F41 [RCMD=TOOL_PAUSE, REASON=VACUUM_CHAMBER_PRESSURE_SPIKE]',
      status: 'RELEASED',
      operator: 'Quality Engineer (Eng Sign-off)',
      estimatedScrapPreventedUsd: 14500,
      reason: 'Cavitation in transfer pot #3, vacuum assist manifold seal replaced',
    },
  ]);

  const [rulComponents, setRulComponents] = useState<EquipmentRulComponent[]>(INITIAL_RUL_COMPONENTS);

  const handleDispatchPm = (componentId: string, partNumber: string) => {
    console.log(`PM Work Order Dispatched for ${componentId} (${partNumber})`);
  };

  const handleCompletePm = (componentId: string) => {
    // 1. Reset component health & RUL in state
    setRulComponents((prev) =>
      prev.map((c) => {
        if (c.componentId === componentId) {
          return {
            ...c,
            healthScorePercent: 100,
            rulHours: 250.0,
            rulStrips: 6000,
            wearRatePerHour: 0.12,
            maintenancePriority: 'HEALTHY' as const,
            historicalWearPoints: [
              { hour: -48, health: 100 },
              { hour: -36, health: 100 },
              { hour: -24, health: 100 },
              { hour: -12, health: 100 },
              { hour: -6, health: 100 },
              { hour: 0, health: 100 },
            ],
          };
        }
        return c;
      })
    );

    // 2. Add certification audit record to MES SECS/GEM ledger
    const pmRecord: MesHoldItem = {
      id: `MES-PM-${Math.floor(8000 + Math.random() * 999)}`,
      timestamp: new Date().toISOString(),
      lotId: activePreset.lotId,
      equipmentId: activePreset.equipmentId,
      recipeId: 'RCP-PM-CALIBRATE-v1.0',
      stripId: activePreset.stripId,
      unitIndex: 0,
      defectType: 'Preventive Maintenance Completed & Certified',
      secsMessage: `S6F11 [CEID=PM_COMPLETE, COMPONENT=${componentId}, RUL_RESTORED=250H, ACTION=TOOL_RELEASE_PRODUCTIVE]`,
      status: 'RELEASED',
      operator: 'Marcus Chen (Bay 4 Lead Tech)',
      estimatedScrapPreventedUsd: 0,
      reason: `OEM component replaced and RTD resistance calibrated to 100.0 Ω. 3-strip Cpk test passed at 1.86.`,
    };
    setMesRecords((prev) => [pmRecord, ...prev]);

    // 3. Release line inhibit if active
    setIsInhibited(false);
  };

  // Loading flags
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);
  const [isGenerating8D, setIsGenerating8D] = useState<boolean>(false);
  const [isRecalculatingFmea, setIsRecalculatingFmea] = useState<boolean>(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any | null>(null);

  // 1Hz Real-Time Live Telemetry Streaming simulation
  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      setTelemetrySeries((prev) => {
        const last = prev[prev.length - 1] || INITIAL_TELEMETRY_SERIES[0];
        const tempNoise = (Math.random() - 0.48) * 0.3;
        const vacNoise = (Math.random() - 0.48) * 0.12;
        const cpkNoise = (Math.random() - 0.5) * 0.02;
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const newPoint: MachineTelemetry = {
          timestamp: now,
          temperatureC: Number((last.temperatureC + tempNoise).toFixed(1)),
          tempUcl: last.tempUcl,
          tempLcl: last.tempLcl,
          vacuumPressureKpa: Number((last.vacuumPressureKpa + vacNoise).toFixed(1)),
          vacUcl: last.vacUcl,
          vacLcl: last.vacLcl,
          dispensePressurePsi: Number((last.dispensePressurePsi + (Math.random() - 0.5) * 0.15).toFixed(1)),
          bondForceGf: Number((last.bondForceGf + (Math.random() - 0.5) * 0.08).toFixed(1)),
          ultrasonicPowerMw: Number((last.ultrasonicPowerMw + (Math.random() - 0.5) * 0.2).toFixed(1)),
          cpk: Math.max(0.6, Math.min(2.0, Number((last.cpk + cpkNoise).toFixed(2)))),
        };
        return [...prev.slice(1), newPoint];
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [isStreaming]);

  const activePreset = presetsList.find((p) => p.id === selectedPresetId) || presetsList[0];
  const units = generateStripUnits(selectedPresetId, isInhibited);

  // Total scrap calculated
  const totalScrapSavedUsd = mesRecords.reduce((acc, curr) => acc + curr.estimatedScrapPreventedUsd, 0) + (isInhibited ? activePreset.preventableScrapUsd : 0);

  // Handle Preset Change
  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = presetsList.find((p) => p.id === presetId) || presetsList[0];
    if (preset.firstFailedIndex === -1) {
      setIsInhibited(false);
      setSelectedUnit(null);
    } else {
      setIsInhibited(true);
      // Default to the first failed unit
      const stripUnits = generateStripUnits(presetId, true);
      const target = stripUnits.find((u) => u.index === preset.firstFailedIndex) || stripUnits[0];
      setSelectedUnit(target);
    }
  };

  // Handle Custom Ingested Lot
  const handleApplyCustomLot = (newPreset: ExcursionPreset, customTelemetry?: MachineTelemetry[], customImage?: string) => {
    setPresetsList((prev) => [newPreset, ...prev]);
    setSelectedPresetId(newPreset.id);
    setIsInhibited(true);
    if (customImage) setCustomAcousticImage(customImage);
    if (customTelemetry && customTelemetry.length > 0) {
      setTelemetrySeries(customTelemetry);
    } else {
      setTelemetrySeries((prev) =>
        prev.map((pt, i) =>
          i >= 16
            ? {
                ...pt,
                temperatureC: newPreset.telemetry.temp,
                vacuumPressureKpa: newPreset.telemetry.vacuum,
                cpk: newPreset.telemetry.cpk,
              }
            : pt
        )
      );
    }
  };

  // MES Actions
  const handleEmergencyInhibit = async () => {
    setIsInhibited(true);
    try {
      const res = await fetch('/api/mes/execute-inhibit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lotId: activePreset.lotId,
          equipmentId: activePreset.equipmentId,
          stripId: activePreset.stripId,
          unitIndex: activePreset.firstFailedIndex,
          defectType: activePreset.defectType,
          estimatedScrapPreventedUsd: activePreset.preventableScrapUsd,
          reason: `Manual Quality Inhibit commanded for ${activePreset.defectType}`,
        }),
      });
      const data = await res.json();
      if (data.record) {
        setMesRecords((prev) => [data.record, ...prev]);
      }
    } catch {
      // Fallback local record
      const fallbackItem: MesHoldItem = {
        id: `MES-HLD-${Math.floor(8000 + Math.random() * 999)}`,
        timestamp: new Date().toISOString(),
        lotId: activePreset.lotId,
        equipmentId: activePreset.equipmentId,
        recipeId: 'RCP-ACTIVE-v1.0',
        stripId: activePreset.stripId,
        unitIndex: activePreset.firstFailedIndex,
        defectType: activePreset.defectType,
        secsMessage: 'S2F41 [RCMD=LOT_INHIBIT_MANUAL]',
        status: 'INHIBITED',
        operator: 'Quality Engineer (Manual Inhibit)',
        estimatedScrapPreventedUsd: activePreset.preventableScrapUsd,
        reason: 'Immediate line halt to prevent defect propagation',
      };
      setMesRecords((prev) => [fallbackItem, ...prev]);
    }
  };

  const handleReleaseInhibit = async (comment?: string) => {
    setIsInhibited(false);
    try {
      if (mesRecords.length > 0) {
        await fetch('/api/mes/release-inhibit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recordId: mesRecords[0].id,
            engineerName: 'Dr. Karman Fong (CQO)',
            comment: comment || 'Verified C-SAM 100MHz baseline. Tool calibration certified.',
          }),
        });
      }
    } catch {}

    setMesRecords((prev) =>
      prev.map((r, i) => (i === 0 ? { ...r, status: 'RELEASED' as const } : r))
    );
  };

  // Run Multimodal AI Diagnostic (SAT + Telemetry)
  const handleRunAiDiagnostic = async () => {
    setIsAiAnalyzing(true);
    try {
      const res = await fetch('/api/copilot/analyze-excursion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          excursionData: {
            defectType: activePreset.defectType,
            lotId: activePreset.lotId,
            stripId: activePreset.stripId,
            equipmentId: activePreset.equipmentId,
            telemetry: activePreset.telemetry,
            cSamCharacteristics: {
              transducerFreqMhz: 100,
              reflectionAmplitudePercent: 34.2,
              phaseInversion: true,
              largestVoidUm2: 1420,
            },
          },
        }),
      });
      const data = await res.json();
      setDiagnosticResult(data.data);
    } catch (err: any) {
      console.warn('Diagnostic error:', err);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // Regenerate 8D Report via Gemini
  const handleRegenerate8D = async () => {
    setIsGenerating8D(true);
    try {
      const res = await fetch('/api/copilot/generate-8d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          excursion: {
            defectType: activePreset.defectType,
            equipmentId: activePreset.equipmentId,
            stripId: activePreset.stripId,
            lotId: activePreset.lotId,
            firstFailedIndex: activePreset.firstFailedIndex,
            telemetry: activePreset.telemetry,
          },
        }),
      });
      const data = await res.json();
      if (data.report) {
        setReport8D(data.report);
      }
    } catch (err) {
      console.warn('8D generation error:', err);
    } finally {
      setIsGenerating8D(false);
    }
  };

  // Recalculate FMEA via Gemini
  const handleRecalculateFmea = async (step: string, mode: string) => {
    setIsRecalculatingFmea(true);
    try {
      const res = await fetch('/api/copilot/generate-fmea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          processStep: step,
          failureMode: mode,
          currentControls: 'YieldGuard Gemini Multimodal Ingestion + Closed-loop SECS/GEM Inhibit',
        }),
      });
      const data = await res.json();
      if (data.fmea) {
        setFmeaRecord(data.fmea);
      }
    } catch (err) {
      console.warn('FMEA error:', err);
    } finally {
      setIsRecalculatingFmea(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Header */}
      <Header
        isAutonomous={isAutonomous}
        setIsAutonomous={setIsAutonomous}
        isInhibited={isInhibited}
        onEmergencyInhibit={handleEmergencyInhibit}
        onReleaseInhibit={() => handleReleaseInhibit()}
        totalScrapSavedUsd={totalScrapSavedUsd}
        activePresetTitle={activePreset.title}
        onOpenCopilot={() => setCopilotOpen(true)}
        isStreaming={isStreaming}
        onToggleStreaming={() => setIsStreaming(!isStreaming)}
        onOpenIngestionModal={() => setIngestionModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6">
        {/* Preset Excursion Selector & Fab Overview Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase text-slate-400">Packaging Scenario:</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {activePreset.id.startsWith('custom-') ? 'Custom User Ingested Lot' : 'OSAT Fab Excursion Sandbox'}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white mt-0.5">
                {activePreset.title}
              </h2>
            </div>
          </div>

          {/* Interactive Scenario Switcher Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="text-xs font-mono font-extrabold text-cyan-300 uppercase tracking-wider">
                Select Scenario:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {presetsList.map((p) => {
                const isActive = p.id === selectedPresetId;
                let label = p.title;
                if (p.id === 'excursion-da-07') label = '1. Die-Attach Delam';
                else if (p.id === 'excursion-mp-02') label = '2. Mold Press Voids';
                else if (p.id === 'excursion-wb-04') label = '3. Wire Bond Lift';
                else if (p.id === 'excursion-golden') label = '4. Golden Benchmark';
                else label = `Custom: ${p.packageType}`;

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 select-none ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 text-white ring-4 ring-cyan-400/60 shadow-[0_0_22px_rgba(6,182,212,0.65)] scale-[1.04] border-2 border-white'
                        : 'bg-slate-800/90 border-2 border-slate-600 hover:border-cyan-400 text-slate-100 hover:text-white hover:bg-slate-700/90 shadow-md active:scale-95'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-cyan-200 animate-ping" />
                        <span className="tracking-wide">{label}</span>
                        <span className="text-[10px] bg-white/25 px-1.5 py-0.5 rounded font-mono font-black uppercase text-white shadow-xs">ACTIVE</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        <span>{label}</span>
                      </>
                    )}
                  </button>
                );
              })}

              {/* Quick Ingest Button in Preset Bar */}
              <button
                type="button"
                onClick={() => setIngestionModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-950 hover:bg-indigo-900 text-white border-2 border-indigo-400 hover:border-indigo-300 flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-300" />
                <span>+ Ingest Lot (CSV/Scan)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="border-b border-slate-800 flex items-center gap-1 sm:gap-2 overflow-x-auto text-xs scrollbar-none pb-px">
          {[
            { id: 'monitor', label: '1. Strip Map & Fab Floor', icon: LayoutDashboard },
            { id: 'inspector', label: '2. Multimodal C-SAM & Telemetry', icon: Waves },
            { id: 'eight_d', label: '3. Automated 8D Report', icon: FileText },
            { id: 'fmea', label: '4. Dynamic PFMEA Risk', icon: ShieldAlert },
            { id: 'mes', label: '5. Closed-Loop SECS/GEM Inhibit', icon: Server },
            { id: 'roi', label: '6. Executive ROI & Lights-Out', icon: DollarSign },
          ].map((tab) => {
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 rounded-t-lg font-medium transition-all whitespace-nowrap cursor-pointer border-b-2 ${
                  isTabActive
                    ? 'border-cyan-500 text-cyan-400 bg-slate-900/60 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${isTabActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Substrate Strip Monitor & Fab Floor */}
        {activeTab === 'monitor' && (
          <div className="space-y-6">
            <SubstrateStripVisualizer
              units={units}
              preset={activePreset}
              isInhibited={isInhibited}
              onSelectUnit={(u) => setSelectedUnit(u)}
              selectedUnit={selectedUnit}
              onTriggerInhibit={handleEmergencyInhibit}
            />

            {/* Quick Multi-Line Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-900/90 border border-rose-500/50 rounded-xl shadow-lg">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-rose-400 font-bold">Line DA-07 (Die Attach)</span>
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                </div>
                <div className="text-sm font-bold text-white mt-1">Besi Datacon 8800</div>
                <p className="text-xs text-rose-300 mt-1">Excursion Active: Nozzle Temp Drift (+4.8°C)</p>
                <div className="mt-3 text-[11px] font-mono text-slate-400 flex justify-between">
                  <span>Strip: STRIP-2026-X89</span>
                  <span className="text-rose-400 font-bold">{isInhibited ? 'INHIBITED' : 'RUNNING'}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-400">Line MP-02 (Mold Press)</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
                <div className="text-sm font-bold text-white mt-1">TOWA 120T Multi-Plunger</div>
                <p className="text-xs text-slate-400 mt-1">Normal: Vacuum -18.2 kPa, Temp 175°C</p>
                <div className="mt-3 text-[11px] font-mono text-slate-500 flex justify-between">
                  <span>Strip: STRIP-2026-M14</span>
                  <span className="text-emerald-400">OEE 94.2%</span>
                </div>
              </div>

              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-400">Line WB-04 (Wire Bonder)</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
                <div className="text-sm font-bold text-white mt-1">K&S Asterion (Cu/Au)</div>
                <p className="text-xs text-slate-400 mt-1">Bond Force 12.0 gf, Transducer 85 mW</p>
                <div className="mt-3 text-[11px] font-mono text-slate-500 flex justify-between">
                  <span>Strip: STRIP-2026-W05</span>
                  <span className="text-emerald-400">Cpk 1.84</span>
                </div>
              </div>

              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-400">Line FT-01 (Final Test)</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
                <div className="text-sm font-bold text-white mt-1">Advantest V93000</div>
                <p className="text-xs text-slate-400 mt-1">Zero Escapes Confirmed downline</p>
                <div className="mt-3 text-[11px] font-mono text-slate-500 flex justify-between">
                  <span>Handler: Cohu MATRiX</span>
                  <span className="text-emerald-400">Yield 99.8%</span>
                </div>
              </div>
            </div>

            {/* Remaining Useful Life (RUL) Equipment Health & Predictive Maintenance */}
            <EquipmentRulIndicator
              components={rulComponents}
              preset={activePreset}
              onDispatchPm={handleDispatchPm}
              onCompletePm={handleCompletePm}
            />
          </div>
        )}

        {/* Tab 2: Multimodal C-SAM & Process Telemetry */}
        {activeTab === 'inspector' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CSamAcousticInspector
                preset={activePreset}
                selectedUnit={selectedUnit}
                onRunAiDiagnostic={handleRunAiDiagnostic}
                isAiAnalyzing={isAiAnalyzing}
                customImageUrl={customAcousticImage}
              />

              <TelemetrySpcChart
                telemetrySeries={telemetrySeries}
                preset={activePreset}
                isInhibited={isInhibited}
              />
            </div>

            {/* Multimodal Diagnostic Results Drawer / Box */}
            {diagnosticResult && (
              <div className="p-5 bg-slate-900 border border-cyan-800/80 rounded-xl shadow-2xl relative overflow-hidden animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    <h4 className="text-sm font-bold text-white">
                      Gemini 3.8 Flash Multimodal Physics-of-Failure Synthesis
                    </h4>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-mono font-bold border border-cyan-800">
                    Confidence: {diagnosticResult.confidenceScore || 97.8}%
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 text-xs">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Physics of Failure:</span>
                    <p className="text-slate-200 mt-1 leading-relaxed">
                      {diagnosticResult.physicsOfFailure}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Root Cause Culprit:</span>
                    <p className="text-rose-300 mt-1 font-medium leading-relaxed">
                      {diagnosticResult.rootCauseHypothesis}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Scrap Cost Avoidance:</span>
                    <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
                      ${(diagnosticResult.preventableScrapCostUsd || activePreset.preventableScrapUsd).toLocaleString()}
                    </p>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Contained at Unit #{activePreset.firstFailedIndex}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                  <div className="text-xs text-slate-300">
                    <strong>Recommended Floor Action:</strong> {diagnosticResult.recommendedContainment}
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('eight_d')}
                    className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-950"
                  >
                    <span>Proceed to 8D Governance</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Automated 8D Problem Solving Report */}
        {activeTab === 'eight_d' && (
          <EightDReportViewer
            report={report8D}
            preset={activePreset}
            onRegenerateReport={handleRegenerate8D}
            isGenerating={isGenerating8D}
          />
        )}

        {/* Tab 4: Dynamic PFMEA Risk Matrix */}
        {activeTab === 'fmea' && (
          <FmeaRiskMatrix
            fmea={fmeaRecord}
            preset={activePreset}
            onRecalculateFmea={handleRecalculateFmea}
            isRecalculating={isRecalculatingFmea}
          />
        )}

        {/* Tab 5: Closed-Loop SECS/GEM Inhibit Execution */}
        {activeTab === 'mes' && (
          <SecsGemTerminal
            isInhibited={isInhibited}
            onEmergencyInhibit={handleEmergencyInhibit}
            onReleaseInhibit={handleReleaseInhibit}
            records={mesRecords}
            preset={activePreset}
            isAutonomous={isAutonomous}
          />
        )}

        {/* Tab 6: Executive ROI & Lights-Out */}
        {activeTab === 'roi' && (
          <RoiExecutiveDashboard totalScrapSavedUsd={totalScrapSavedUsd} />
        )}
      </main>

      {/* Floating Operational Copilot Drawer */}
      <OperationalCopilotDrawer
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        preset={activePreset}
        isInhibited={isInhibited}
      />

      {/* Custom User Data Ingestion Lab (CSV & C-SAM Scan) */}
      <CustomDataIngestionModal
        isOpen={ingestionModalOpen}
        onClose={() => setIngestionModalOpen(false)}
        onApplyCustomLot={handleApplyCustomLot}
      />

      {/* Sticky Bottom Operational Copilot Bar */}
      <div className="border-t border-slate-800 bg-slate-950/95 py-2 px-4 backdrop-blur-md sticky bottom-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>YieldGuard Lights-Out Daemon:</span>
            <span className="text-white font-mono hidden sm:inline">
              Zero-latency SECS/GEM interlock active on 4 assembly lines
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCopilotOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Ask Gemini Copilot</span>
            </button>
            <span className="text-slate-600">•</span>
            <span className="text-slate-500 font-mono text-[11px]">
              JEDEC J-STD-020E &amp; SEMI E5/E30 Compliant
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
