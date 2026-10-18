import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Sparkles, 
  Cpu, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { ExcursionPreset, MachineTelemetry } from '../types/osat';

interface CustomDataIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCustomLot: (customPreset: ExcursionPreset, customTelemetry?: MachineTelemetry[], customImage?: string) => void;
}

export const CustomDataIngestionModal: React.FC<CustomDataIngestionModalProps> = ({
  isOpen,
  onClose,
  onApplyCustomLot,
}) => {
  const [lotId, setLotId] = useState<string>('LOT-2026-CUSTOM-001');
  const [stripId, setStripId] = useState<string>('STRIP-2026-C01');
  const [equipmentId, setEquipmentId] = useState<string>('LINE-DA-09 (Besi Datacon 8800 EVO)');
  const [packageType, setPackageType] = useState<string>('FC-BGA 2048-Ball (45x45mm)');
  const [defectType, setDefectType] = useState<string>('Epoxy Bondline Thermal Outgassing');
  const [firstFailedIndex, setFirstFailedIndex] = useState<number>(37);
  const [preventableScrapUsd, setPreventableScrapUsd] = useState<number>(42000);

  // Telemetry variables
  const [tempC, setTempC] = useState<number>(116.4);
  const [vacuumKpa, setVacuumKpa] = useState<number>(-11.8);
  const [dispensePsi, setDispensePsi] = useState<number>(41.0);
  const [bondForceGf, setBondForceGf] = useState<number>(14.5);
  const [ultrasonicMw, setUltrasonicMw] = useState<number>(82.0);
  const [cpk, setCpk] = useState<number>(0.79);

  // Uploaded files
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle CSV Upload
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      // Simple parse of CSV
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length > 1) {
        const lastRow = lines[lines.length - 1].split(',');
        // Expected header: timestamp, temp, vacuum, pressure, bondForce, ultrasonic, cpk
        if (lastRow.length >= 7) {
          const parsedTemp = parseFloat(lastRow[1]) || tempC;
          const parsedVac = parseFloat(lastRow[2]) || vacuumKpa;
          const parsedPsi = parseFloat(lastRow[3]) || dispensePsi;
          const parsedCpk = parseFloat(lastRow[6]) || cpk;
          setTempC(parsedTemp);
          setVacuumKpa(parsedVac);
          setDispensePsi(parsedPsi);
          setCpk(parsedCpk);
          setStatusMsg(`Successfully parsed ${lines.length - 1} telemetry records from ${file.name}`);
        } else {
          setStatusMsg(`Loaded telemetry data from ${file.name}`);
        }
      }
    };
    reader.readAsText(file);
  };

  // Handle Image Upload for C-SAM
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setUploadedImageUrl(base64);
      setStatusMsg(`Loaded custom C-SAM ultrasonic scan from ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  // Download Sample Telemetry CSV
  const handleDownloadSampleCsv = () => {
    const csvHeader = 'timestamp,temperatureC,vacuumPressureKpa,dispensePressurePsi,bondForceGf,ultrasonicPowerMw,cpk\n';
    const csvRows = Array.from({ length: 24 }).map((_, i) => {
      const isExcursion = i >= 16;
      const t = `T-${(24 - i) * 30}s`;
      const temp = isExcursion ? (115.2 + Math.sin(i) * 0.8).toFixed(1) : (110.1 + (Math.random() - 0.5) * 0.8).toFixed(1);
      const vac = isExcursion ? (-12.0 + Math.sin(i) * 0.5).toFixed(1) : (-18.2 + (Math.random() - 0.5) * 0.4).toFixed(1);
      const psi = isExcursion ? '39.8' : '35.0';
      const force = isExcursion ? '14.2' : '12.0';
      const ultra = isExcursion ? '86.4' : '84.5';
      const c = isExcursion ? '0.78' : '1.74';
      return `${t},${temp},${vac},${psi},${force},${ultra},${c}`;
    }).join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yieldguard_telemetry_${lotId}.csv`;
    a.click();
  };

  const handleApply = () => {
    const customPreset: ExcursionPreset = {
      id: `custom-${Date.now()}`,
      title: `${packageType} (${defectType})`,
      equipmentId,
      packageType,
      defectType,
      lotId,
      stripId,
      firstFailedIndex,
      description: `Custom ingested operational data: Dispense temperature at ${tempC}°C, chamber vacuum at ${vacuumKpa} kPa, with Cpk of ${cpk}.`,
      physicsSnippet: `Real-time user telemetry correlated with interfacial delamination at Unit #${firstFailedIndex}.`,
      preventableScrapUsd,
      telemetry: {
        temp: tempC,
        vacuum: vacuumKpa,
        pressure: dispensePsi,
        bondForce: bondForceGf,
        ultrasonic: ultrasonicMw,
        cpk,
      },
    };

    onApplyCustomLot(customPreset, undefined, uploadedImageUrl || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Custom Data Ingestion &amp; Lot Creator</span>
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono border border-cyan-800">
                User Ingestion Lab
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Upload your own fab machine telemetry CSV or C-SAM SAT acoustic inspection scans
            </p>
          </div>
        </div>

        {/* Feedback Alert */}
        {statusMsg && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        <div className="space-y-5 my-5">
          {/* Section 1: Upload Files */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* CSV Telemetry Upload */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5 mb-1">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>1. Ingest Telemetry (CSV)</span>
                </span>
                <p className="text-[11px] text-slate-400">
                  Upload SECS/GEM trace variables (Temp, Vacuum, Pressure, Force, Cpk)
                </p>
              </div>

              <div className="mt-3 space-y-2">
                <label className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="truncate">{csvFileName || 'Choose CSV File...'}</span>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleCsvUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleDownloadSampleCsv}
                  className="w-full text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1 cursor-pointer font-mono"
                >
                  <Download className="w-3 h-3" />
                  <span>Download Sample Fab CSV Template</span>
                </button>
              </div>
            </div>

            {/* C-SAM Image Upload */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5 mb-1">
                  <ImageIcon className="w-4 h-4 text-indigo-400" />
                  <span>2. Ingest C-SAM SAT Scan</span>
                </span>
                <p className="text-[11px] text-slate-400">
                  Upload ultrasonic acoustic microscope scan (PNG, JPG, BMP)
                </p>
              </div>

              <div className="mt-3">
                <label className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="truncate">{imageFileName || 'Choose SAT Image...'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Custom Lot & Machine Parameters */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Lot &amp; Equipment Metadata</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 font-mono block mb-1">Lot Number</label>
                <input
                  type="text"
                  value={lotId}
                  onChange={(e) => setLotId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-mono block mb-1">Strip Identifier</label>
                <input
                  type="text"
                  value={stripId}
                  onChange={(e) => setStripId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-mono block mb-1">Tool / Equipment Cell</label>
                <input
                  type="text"
                  value={equipmentId}
                  onChange={(e) => setEquipmentId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-mono block mb-1">IC Package Type</label>
                <input
                  type="text"
                  value={packageType}
                  onChange={(e) => setPackageType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Live Sensor Parameter Values */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>Process Telemetry Excursion Parameters</span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Dispense Temp (°C):</span>
                  <span className="font-mono text-cyan-300 font-bold">{tempC}°C</span>
                </div>
                <input
                  type="range"
                  min="90"
                  max="140"
                  step="0.2"
                  value={tempC}
                  onChange={(e) => setTempC(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <span className="text-[9px] text-slate-500 font-mono">UCL: 112.5°C</span>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Vacuum (kPa):</span>
                  <span className="font-mono text-cyan-300 font-bold">{vacuumKpa} kPa</span>
                </div>
                <input
                  type="range"
                  min="-25"
                  max="-5"
                  step="0.2"
                  value={vacuumKpa}
                  onChange={(e) => setVacuumKpa(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <span className="text-[9px] text-slate-500 font-mono">Target: -18.0 kPa</span>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>First Failed Unit #:</span>
                  <span className="font-mono text-rose-400 font-bold">Unit #{firstFailedIndex}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="99"
                  value={firstFailedIndex}
                  onChange={(e) => setFirstFailedIndex(parseInt(e.target.value, 10))}
                  className="w-full accent-rose-500"
                />
                <span className="text-[9px] text-slate-500 font-mono">1 to 100 on Strip</span>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Process Cpk:</span>
                  <span className="font-mono text-amber-300 font-bold">{cpk}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.02"
                  value={cpk}
                  onChange={(e) => setCpk(parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <span className="text-[9px] text-slate-500 font-mono">Spec: &ge;1.67</span>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Scrap Avoidance ($):</span>
                  <span className="font-mono text-emerald-300 font-bold">${preventableScrapUsd.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="60000"
                  step="1000"
                  value={preventableScrapUsd}
                  onChange={(e) => setPreventableScrapUsd(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-500"
                />
                <span className="text-[9px] text-slate-500 font-mono">$10k-$50k typical</span>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-mono block mb-1">Defect Mechanism</label>
                <select
                  value={defectType}
                  onChange={(e) => setDefectType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-[11px]"
                >
                  <option value="Epoxy Bondline Thermal Outgassing">Epoxy Bondline Outgassing</option>
                  <option value="Die-to-Paddle Acoustic Delamination">Die-to-Paddle Delamination</option>
                  <option value="Epoxy Mold Compound Micro-Voids">EMC Mold Micro-Voids</option>
                  <option value="Wire Bond Lifted Ball Shear Failure">Wire Bond Lifted Ball</option>
                  <option value="Solder Joint SMT Voiding">Solder Joint Voiding</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>YieldGuard will trigger real-time Gemini analysis on this data</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-950 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Load Into YieldGuard Copilot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
