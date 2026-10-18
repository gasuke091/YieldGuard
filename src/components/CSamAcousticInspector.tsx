import React, { useState, useEffect, useRef } from 'react';
import { 
  Waves, 
  Crosshair, 
  Eye, 
  Sliders, 
  Maximize2, 
  Zap, 
  Layers, 
  CheckCircle, 
  AlertTriangle,
  ZoomIn,
  RefreshCw
} from 'lucide-react';
import { ExcursionPreset, SubstrateUnit } from '../types/osat';

interface CSamAcousticInspectorProps {
  preset: ExcursionPreset;
  selectedUnit: SubstrateUnit | null;
  onRunAiDiagnostic: () => void;
  isAiAnalyzing: boolean;
  customImageUrl?: string | null;
}

export const CSamAcousticInspector: React.FC<CSamAcousticInspectorProps> = ({
  preset,
  selectedUnit,
  onRunAiDiagnostic,
  isAiAnalyzing,
  customImageUrl,
}) => {
  const [selectedLayer, setSelectedLayer] = useState<'die_attach' | 'die_surface' | 'mold_compound' | 'substrate_balls'>('die_attach');
  const [frequencyMhz, setFrequencyMhz] = useState<number>(100);
  const [gainDb, setGainDb] = useState<number>(34);
  const [gateWidthNs, setGateWidthNs] = useState<number>(120);
  const [viewMode, setViewMode] = useState<'c_scan' | 'b_scan' | 'a_scan'>('c_scan');
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isExcursionActive = preset.firstFailedIndex !== -1;
  const isTargetUnitDefective = selectedUnit ? selectedUnit.status === 'defect' : isExcursionActive;

  // Render the C-SAM acoustic image onto Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background: dark cleanroom chamber
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Draw silicon die boundary
    const dieX = 40;
    const dieY = 40;
    const dieW = width - 80;
    const dieH = height - 80;

    // Substrate / Leadframe background (low acoustic reflection = dark blue/cyan)
    const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width / 2);
    bgGrad.addColorStop(0, '#0c2340');
    bgGrad.addColorStop(0.7, '#071626');
    bgGrad.addColorStop(1, '#030a12');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(dieX - 15, dieY - 15, dieW + 30, dieH + 30);

    // Die outline & wirebond pad ring
    ctx.strokeStyle = '#1e3a5f';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(dieX - 15, dieY - 15, dieW + 30, dieH + 30);

    // Silicon Die Body
    ctx.fillStyle = '#0a192f';
    ctx.fillRect(dieX, dieY, dieW, dieH);

    if (customImageUrl) {
      const customImg = new Image();
      customImg.src = customImageUrl;
      if (customImg.complete) {
        ctx.drawImage(customImg, dieX, dieY, dieW, dieH);
      } else {
        customImg.onload = () => {
          ctx.drawImage(customImg, dieX, dieY, dieW, dieH);
        };
      }
    }

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(dieX, dieY, dieW, dieH);

    // Silicon circuitry pattern (fine acoustic grid lines)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1;
    for (let x = dieX; x < dieX + dieW; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, dieY);
      ctx.lineTo(x, dieY + dieH);
      ctx.stroke();
    }
    for (let y = dieY; y < dieY + dieH; y += 16) {
      ctx.beginPath();
      ctx.moveTo(dieX, y);
      ctx.lineTo(dieX + dieW, y);
      ctx.stroke();
    }

    // Render acoustic echoes based on selected layer and defect presence
    if (selectedLayer === 'die_attach') {
      if (isTargetUnitDefective) {
        // High acoustic reflection = Air Voids / Delamination (Red, Orange, Yellow)
        // 1. Large delamination patch at die center / corner
        const voidGrad1 = ctx.createRadialGradient(
          dieX + dieW * 0.42,
          dieY + dieH * 0.45,
          10,
          dieX + dieW * 0.42,
          dieY + dieH * 0.45,
          75
        );
        voidGrad1.addColorStop(0, 'rgba(239, 68, 68, 0.95)'); // Bright red center (100% reflection)
        voidGrad1.addColorStop(0.35, 'rgba(249, 115, 22, 0.85)'); // Orange
        voidGrad1.addColorStop(0.7, 'rgba(234, 179, 8, 0.6)'); // Yellow
        voidGrad1.addColorStop(1, 'rgba(56, 189, 248, 0)'); // Fades into acoustic coupling
        ctx.fillStyle = voidGrad1;
        ctx.beginPath();
        ctx.ellipse(dieX + dieW * 0.42, dieY + dieH * 0.45, 80, 60, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        // 2. Micro outgassing bubbles along edge
        const microBubbles = [
          { x: dieX + 45, y: dieY + 50, r: 18 },
          { x: dieX + 75, y: dieY + 40, r: 14 },
          { x: dieX + dieW - 60, y: dieY + dieH - 55, r: 24 },
          { x: dieX + dieW - 90, y: dieY + dieH - 45, r: 16 },
        ];
        microBubbles.forEach((b) => {
          const bGrad = ctx.createRadialGradient(b.x, b.y, 2, b.x, b.y, b.r);
          bGrad.addColorStop(0, '#f87171');
          bGrad.addColorStop(0.7, '#fbbf24');
          bGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = bGrad;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fill();
        });

        // Bounding box for largest void (AI defect annotation)
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(dieX + dieW * 0.15, dieY + dieH * 0.2, dieW * 0.65, dieH * 0.55);
        ctx.setLineDash([]);

        // Defect Tag Label
        ctx.fillStyle = '#be123c';
        ctx.fillRect(dieX + dieW * 0.15, dieY + dieH * 0.2 - 20, 180, 20);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('DELAMINATION VOID: 34.2%', dieX + dieW * 0.15 + 6, dieY + dieH * 0.2 - 6);
      } else {
        // Golden / Normal Die Attach: Uniform dark teal/blue acoustic transmission
        ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
        ctx.fillRect(dieX, dieY, dieW, dieH);
        ctx.fillStyle = '#34d399';
        ctx.font = '10px monospace';
        ctx.fillText('✓ Acoustic Transmission >98.6% (Zero Voids)', dieX + 12, dieY + 24);
      }
    } else if (selectedLayer === 'mold_compound') {
      if (isTargetUnitDefective && preset.id === 'excursion-mp-02') {
        // Clustered mold voids
        for (let i = 0; i < 24; i++) {
          const vx = dieX + (i * 27) % dieW;
          const vy = dieY + ((i * 37) % dieH);
          ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
          ctx.beginPath();
          ctx.arc(vx, vy, 5 + (i % 4) * 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#f87171';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('POT CAVITATION MICRO-VOIDS (EMC)', dieX + 10, dieY + 20);
      } else {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.1)';
        ctx.fillRect(dieX, dieY, dieW, dieH);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.fillText('Mold compound surface plane uniform', dieX + 12, dieY + 24);
      }
    } else if (selectedLayer === 'die_surface') {
      // Wire bond fingers & perimeter pads
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      const padCount = 20;
      for (let i = 0; i < padCount; i++) {
        // Top and bottom wire bond bondpads
        const px = dieX + 15 + i * ((dieW - 30) / padCount);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(px, dieY + 6, 8, 8);
        ctx.fillRect(px, dieY + dieH - 14, 8, 8);
      }
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '10px monospace';
      ctx.fillText('Die Active Passivation & Wire Bond Pads', dieX + 12, dieY + 30);
    } else {
      // Substrate solder balls (1152 BGA array)
      ctx.fillStyle = '#64748b';
      for (let r = 0; r < 12; r++) {
        for (let c = 0; c < 12; c++) {
          const bx = dieX + 25 + c * (dieW - 50) / 12;
          const by = dieY + 25 + r * (dieH - 50) / 12;
          ctx.beginPath();
          ctx.arc(bx, by, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText('Substrate Core & BGA Solder Ball Plane', dieX + 12, dieY + 24);
    }

    // Ultrasonic Scale Overlay / Reticle
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Crosshair center
    ctx.moveTo(width / 2 - 15, height / 2);
    ctx.lineTo(width / 2 + 15, height / 2);
    ctx.moveTo(width / 2, height / 2 - 15);
    ctx.lineTo(width / 2, height / 2 + 15);
    ctx.stroke();

    // Scale Bar (5.0 mm)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(dieX, height - 20);
    ctx.lineTo(dieX + 60, height - 20);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = '9px monospace';
    ctx.fillText('5.0 mm', dieX + 15, height - 25);
  }, [selectedLayer, frequencyMhz, gainDb, isTargetUnitDefective, preset]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      {/* Top KPI Bar for Tab 2 - High Contrast */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-slate-950 border border-slate-700/80 shadow-md">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-slate-800 text-white font-bold border border-slate-500 shadow-xs text-xs">
            Cleanroom Bay 4 (Class 100)
          </span>
          <span className="px-2.5 py-1 rounded bg-cyan-950 text-white font-bold border border-cyan-400 shadow-xs text-xs">
            Line: {preset.equipmentId.split(' ')[0]}
          </span>
          <span className="px-2.5 py-1 rounded bg-rose-950 text-white font-bold border border-rose-500 shadow-xs text-xs">
            Excursion: {preset.defectType}
          </span>
          <span className="px-2.5 py-1 rounded bg-indigo-900 text-white font-bold border border-indigo-400 shadow-xs text-xs">
            {selectedUnit ? `Target: Unit #${selectedUnit.index} (R${selectedUnit.row + 1}, C${selectedUnit.col + 1})` : `Active Lot: ${preset.lotId}`}
          </span>
        </div>

        {/* Twin Gemini Execution Button in Top Header */}
        <button
          type="button"
          onClick={onRunAiDiagnostic}
          disabled={isAiAnalyzing}
          className="relative group px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:shadow-[0_0_28px_rgba(147,51,234,0.7)] transition-all cursor-pointer border-2 border-white disabled:opacity-50 select-none"
        >
          {isAiAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Gemini 3.8 Analyzing...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-amber-300 animate-pulse" />
              <span className="tracking-wide">Run Multimodal Gemini Diagnostic</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/25 text-white font-mono uppercase">AI Call</span>
            </>
          )}
        </button>
      </div>

      {/* Title & Frequency Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Waves className="w-5 h-5 text-cyan-400" />
            <span>Scanning Acoustic Tomography (C-SAM / SAT)</span>
          </h3>
          <p className="text-xs text-slate-300">
            Immersion ultrasonic non-destructive testing for buried packaging defects
          </p>
        </div>

        {/* Transducer Frequency Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <span className="text-[10px] text-slate-400 uppercase px-2 font-mono font-semibold">Transducer:</span>
          {[50, 100, 230].map((freq) => (
            <button
              key={freq}
              type="button"
              onClick={() => setFrequencyMhz(freq)}
              className={`px-2.5 py-1 rounded font-mono font-bold transition-colors cursor-pointer ${
                frequencyMhz === freq
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {freq} MHz
            </button>
          ))}
        </div>
      </div>

      {/* Layer Depth Gating Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4">
        {[
          { id: 'mold_compound', label: '1. Mold Compound', desc: 'EMC Surface & Voids' },
          { id: 'die_surface', label: '2. Die Surface', desc: 'Active Passivation' },
          { id: 'die_attach', label: '3. Die-Attach Layer', desc: 'Epoxy Delamination' },
          { id: 'substrate_balls', label: '4. Substrate Plane', desc: 'BGA Solder Balls' },
        ].map((layer) => (
          <button
            key={layer.id}
            type="button"
            onClick={() => setSelectedLayer(layer.id as any)}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              selectedLayer === layer.id
                ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-md shadow-cyan-950'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <span className="text-xs font-semibold block text-slate-200">{layer.label}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{layer.desc}</span>
          </button>
        ))}
      </div>

      {/* Main C-SAM Display & Side Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Acoustic Canvas View (8 cols) */}
        <div className="lg:col-span-7 bg-slate-950 rounded-xl border border-slate-800 p-3 relative flex flex-col items-center">
          <canvas
            ref={canvasRef}
            width={440}
            height={360}
            className="w-full max-w-[440px] aspect-[11/9] rounded-lg shadow-inner cursor-crosshair bg-slate-950"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setHoverCoord({
                x: Math.round(e.clientX - rect.left),
                y: Math.round(e.clientY - rect.top),
              });
            }}
            onMouseLeave={() => setHoverCoord(null)}
          />

          {/* Coordinate Overlay */}
          <div className="w-full flex items-center justify-between text-[10px] text-slate-400 font-mono mt-2 px-1">
            <span>
              Cursor: {hoverCoord ? `X=${hoverCoord.x}µm, Y=${hoverCoord.y}µm` : 'Resting'}
            </span>
            <span className="text-cyan-400">
              Depth Gate: Z = {selectedLayer === 'die_attach' ? '320µm' : selectedLayer === 'die_surface' ? '180µm' : '50µm'} (±15ns)
            </span>
          </div>

          {/* Color bar scale */}
          <div className="w-full mt-2.5 flex items-center gap-2 text-[10px] font-mono text-slate-400">
            <span>Echo Amp:</span>
            <div className="flex-1 h-2 rounded bg-gradient-to-r from-slate-900 via-sky-600 via-amber-400 to-rose-600 border border-slate-800" />
            <span className="text-rose-400 font-bold">100% (Air Void)</span>
          </div>
        </div>

        {/* Acoustic A-Scan Waveform & AI Synthesis (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* A-Scan Oscilloscope Waveform */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                <span>A-Scan RF Echo Waveform</span>
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                isTargetUnitDefective ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300'
              }`}>
                {isTargetUnitDefective ? 'PHASE INVERSION' : 'NORMAL ATTENUATION'}
              </span>
            </div>

            {/* SVG Waveform Simulation */}
            <div className="h-28 w-full bg-slate-900/90 rounded border border-slate-800 p-2 relative flex items-center">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 80">
                {/* Center baseline */}
                <line x1="0" y1="40" x2="300" y2="40" stroke="rgba(148, 163, 184, 0.2)" strokeDasharray="2,2" />
                {/* Gate Window overlay */}
                <rect x="140" y="5" width="70" height="70" fill="rgba(6, 182, 212, 0.15)" stroke="#06b6d4" strokeWidth="0.8" strokeDasharray="3,3" />

                {isTargetUnitDefective ? (
                  // Phase inverted echo wave with large negative spike (sound hitting air gap)
                  <path
                    d="M 0 40 L 40 40 L 60 38 L 70 42 L 80 40 L 140 40 L 155 15 L 175 75 L 195 20 L 210 40 L 300 40"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="2.5"
                  />
                ) : (
                  // Normal bonded wave without phase flip
                  <path
                    d="M 0 40 L 40 40 L 60 38 L 70 42 L 80 40 L 140 40 L 160 55 L 175 30 L 190 48 L 205 40 L 300 40"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                  />
                )}
              </svg>

              <div className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-500">
                Time-of-Flight (ns)
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              {isTargetUnitDefective ? (
                <span className="text-rose-300 font-mono">
                  Phase reflection coefficient R = -0.99 at 172ns gate. Negative polarity confirms air-gap interface (Die-Attach Delamination).
                </span>
              ) : (
                <span className="text-emerald-300 font-mono">
                  Acoustic impedance matched. Normal positive reflection R = +0.12, no interfacial voiding.
                </span>
              )}
            </p>
          </div>

          {/* Real-time Defect Metrics Card */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Interfacial Void Area:</span>
              <span className={`font-mono font-bold text-sm ${
                isTargetUnitDefective ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {isTargetUnitDefective ? '34.2%' : '1.4%'}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  isTargetUnitDefective ? 'bg-rose-500 w-[34.2%]' : 'bg-emerald-500 w-[1.4%]'
                }`}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>JEDEC Spec Limit: &lt;15.0%</span>
              <span>AEC-Q100 Auto Limit: &lt;10.0%</span>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Largest Contiguous Void:</span>
              <span className="font-mono text-slate-200">
                {isTargetUnitDefective ? '1,420 µm² (Critical Reject)' : '42 µm² (Pass)'}
              </span>
            </div>
          </div>

          {/* AI Multimodal Analysis Action Button with Animated Gradient Glow */}
          <div className="relative group pt-1">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 rounded-2xl blur-md opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse"></div>
            <button
              type="button"
              onClick={onRunAiDiagnostic}
              disabled={isAiAnalyzing}
              className="relative w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2.5 shadow-xl transition-all cursor-pointer border border-cyan-200/80 disabled:opacity-50 select-none"
            >
              {isAiAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Gemini 3.8 Flash Synthesizing Telemetry + SAT...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300 animate-bounce" />
                  <span className="tracking-wide">Run Multimodal Gemini Diagnostic</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/20 text-white font-mono uppercase">Vertex AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
