import React, { useState } from 'react';
import { 
  X, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  Cpu, 
  Sparkles, 
  Thermometer, 
  Gauge, 
  RotateCcw,
  Check,
  Package
} from 'lucide-react';
import { EquipmentRulComponent } from '../types/osat';

interface PmWorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  component: EquipmentRulComponent;
  onCompletePm: (componentId: string) => void;
}

export const PmWorkOrderModal: React.FC<PmWorkOrderModalProps> = ({
  isOpen,
  onClose,
  component,
  onCompletePm,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  if (!isOpen) return null;

  const ticketId = `PM-WO-2026-${component.componentId.substring(0, 3).toUpperCase()}-9042`;

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else if (currentStep === 4) {
      // Step 4: Finalize PM and restore RUL
      setIsCalibrating(true);
      setTimeout(() => {
        setIsCalibrating(false);
        setIsCompleted(true);
        onCompletePm(component.componentId);
      }, 1200);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Tool Safe Depower & Interlock',
      desc: 'SECS/GEM command transitions line to SCHEDULED_PM. Heater block cooled from 114.8°C to <40°C.',
      icon: Clock,
      detail: 'Carrier handler held at Strip #80 boundary. Nitrogen purge buffer activated.',
    },
    {
      num: 2,
      title: 'OEM Component Swap',
      desc: `Replace worn ${component.name} with certified spare part.`,
      icon: Package,
      detail: `Part: ${component.partNumber}. Fastened to 0.85 N·m torque specification.`,
    },
    {
      num: 3,
      title: 'Sensor Calibration & PID Tuning',
      desc: 'RTD resistance calibrated back to 100.0 Ω ±0.05 Ω baseline.',
      icon: Thermometer,
      detail: 'Thermal ramp verified at 2.0°C/sec without temperature overshoot or drift.',
    },
    {
      num: 4,
      title: 'Post-PM 3-Strip Qualification',
      desc: 'Process 3 test strips with inline 100MHz C-SAM acoustic scan.',
      icon: ShieldCheck,
      detail: 'Qualification target: Cpk >= 1.75, 0.00% delamination voids.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
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
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                {ticketId}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Cleanroom CMMS Work Order
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">
              Preventive Maintenance (PM) Lifecycle &amp; RUL Restoration
            </h3>
          </div>
        </div>

        {/* Work Order Info Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 text-xs font-mono">
          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Equipment</span>
            <span className="text-slate-200 font-bold truncate block">{component.equipmentId.split(' ')[0]}</span>
          </div>

          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">OEM Part No.</span>
            <span className="text-cyan-300 font-bold truncate block">{component.partNumber}</span>
          </div>

          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Assigned Tech</span>
            <span className="text-slate-200 font-bold block">Marcus Chen (Bay 4)</span>
          </div>

          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Target Downtime</span>
            <span className="text-emerald-400 font-bold block">25 Minutes</span>
          </div>
        </div>

        {/* Step-by-Step Maintenance Stepper */}
        {!isCompleted ? (
          <div className="space-y-4 my-5">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-1">
              <span>Maintenance Progression:</span>
              <span className="text-cyan-400 font-bold">Step {currentStep} of 4</span>
            </div>

            <div className="space-y-3">
              {steps.map((s) => {
                const isCurrent = currentStep === s.num;
                const isPast = currentStep > s.num;
                return (
                  <div
                    key={s.num}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-slate-950 border-cyan-500 ring-1 ring-cyan-500/30'
                        : isPast
                        ? 'bg-slate-950/60 border-emerald-900/50'
                        : 'bg-slate-950/30 border-slate-800/60 opacity-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold font-mono ${
                          isPast
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                            : isCurrent
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isPast ? <Check className="w-4 h-4" /> : s.num}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-xs font-bold ${isCurrent ? 'text-white' : isPast ? 'text-emerald-300' : 'text-slate-400'}`}>
                            {s.title}
                          </h4>
                          {isPast && (
                            <span className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Certified
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-[10px] font-mono text-cyan-400 animate-pulse">
                              In Progress...
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{s.desc}</p>
                        <p className="text-[10px] font-mono text-cyan-300/80 mt-1">{s.detail}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Completion & RUL Reset Celebration State */
          <div className="my-6 p-5 rounded-xl bg-emerald-950/40 border border-emerald-500/60 text-center space-y-3 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h4 className="text-base font-bold text-white">
              Preventive Maintenance Completed &amp; Certified!
            </h4>

            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              New OEM {component.name} successfully installed and calibrated. Post-PM 3-strip qualification run passed with <strong className="text-emerald-400 font-mono">Cpk = 1.86</strong> and <strong className="text-emerald-400 font-mono">0.00% voids</strong>.
            </p>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Component Health:</span>
                <span className="text-lg font-bold text-emerald-400">100% (New Tool)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">RUL Restored:</span>
                <span className="text-lg font-bold text-cyan-400">250.0 Hours</span>
              </div>
            </div>

            <p className="text-[10px] font-mono text-slate-400">
              SECS/GEM command issued: <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">S6F11 TOOL_STATE=PRODUCTIVE</code>
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <span className="text-xs text-slate-500 font-mono">
            SEMI E10 &amp; IATF-16949 Compliant PM Record
          </span>

          <div className="flex items-center gap-2">
            {!isCompleted ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={isCalibrating}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-950 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isCalibrating ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      <span>Calibrating &amp; Resetting RUL...</span>
                    </>
                  ) : currentStep === 4 ? (
                    <>
                      <span>Complete PM &amp; Restore RUL to 100%</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    </>
                  ) : (
                    <>
                      <span>Next: Step {currentStep + 1}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 cursor-pointer"
              >
                Close &amp; Return to Floor
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
