import React, { useState } from 'react';
import { 
  EightDReport, 
  ExcursionPreset 
} from '../types/osat';
import { 
  FileText, 
  CheckCircle2, 
  Users, 
  HelpCircle, 
  ShieldCheck, 
  Search, 
  Wrench, 
  ClipboardCheck, 
  Lock, 
  Award, 
  Copy, 
  Download, 
  RefreshCw, 
  ChevronDown, 
  ChevronRight,
  GitBranch,
  Sparkles
} from 'lucide-react';

interface EightDReportViewerProps {
  report: EightDReport;
  preset: ExcursionPreset;
  onRegenerateReport: () => void;
  isGenerating: boolean;
}

export const EightDReportViewer: React.FC<EightDReportViewerProps> = ({
  report,
  preset,
  onRegenerateReport,
  isGenerating,
}) => {
  const [activeStep, setActiveStep] = useState<number | 'all'>('all');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeFishbone, setActiveFishbone] = useState<string>('Machine');

  const copyToClipboard = () => {
    const text = `# 8D PROBLEM SOLVING REPORT: ${report.reportId}
**Excursion:** ${preset.defectType}
**Equipment:** ${preset.equipmentId}
**Strip ID:** ${preset.stripId} | **Lot ID:** ${preset.lotId}

## D0: Emergency Response & Plan
${report.d0_plan}

## D1: Team
${report.d1_team.map((m) => `- ${m.name} (${m.role}, ${m.dept})`).join('\n')}

## D2: Problem Description (5W2H)
- What: ${report.d2_problemDescription.what}
- Where: ${report.d2_problemDescription.where}
- When: ${report.d2_problemDescription.when}
- Extent: ${report.d2_problemDescription.howMuch}
- Is Not: ${report.d2_problemDescription.isNot}

## D3: Interim Containment Action (ICA)
${report.d3_containment.action}
Validation: ${report.d3_containment.validation}

## D4: Root Cause Analysis
### 5-Whys:
${report.d4_rootCause.fiveWhys.map((w, i) => `${i + 1}. ${w}`).join('\n')}

### Escape Root Cause:
${report.d4_rootCause.escapeRootCause}

## D5: Permanent Corrective Actions (PCA)
${report.d5_correctiveActions.map((pca) => `- [${pca.status}] ${pca.action} (Owner: ${pca.owner}, Due: ${pca.targetDate})`).join('\n')}

## D6: Verification & Validation
- Validation Plan: ${report.d6_verification.validationPlan}
- Target: ${report.d6_verification.resultsTarget}

## D7: Prevent Recurrence
- Control Plan: ${report.d7_prevention.controlPlanUpdate}
- FMEA Update: ${report.d7_prevention.fmeaUpdate}
- SOP: ${report.d7_prevention.sopRevisions}

## D8: Closure & Team Recognition
${report.d8_closure}
`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const steps = [
    { id: 0, title: 'D0: Emergency Response', icon: ShieldCheck, summary: report.d0_plan },
    { id: 1, title: 'D1: Cross-Functional Team', icon: Users, summary: `${report.d1_team.length} specialists assigned` },
    { id: 2, title: 'D2: Problem Description (5W2H)', icon: Search, summary: report.d2_problemDescription.what },
    { id: 3, title: 'D3: Interim Containment (MES Inhibit)', icon: Lock, summary: report.d3_containment.action },
    { id: 4, title: 'D4: Root Cause & 5-Whys', icon: GitBranch, summary: 'Mechanistic & Fishbone breakdown' },
    { id: 5, title: 'D5: Permanent Corrective Actions', icon: Wrench, summary: `${report.d5_correctiveActions.length} engineering countermeasures` },
    { id: 6, title: 'D6: Verification & Cpk Validation', icon: ClipboardCheck, summary: report.d6_verification.resultsTarget },
    { id: 7, title: 'D7: Prevent Recurrence & FMEA', icon: CheckCircle2, summary: report.d7_prevention.fmeaUpdate },
    { id: 8, title: 'D8: Team Closure & Sign-Off', icon: Award, summary: report.d8_closure },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
              {report.reportId}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              AIAG / VDA & IATF-16949 Compliant
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span>Autonomous 8D Problem-Solving Report</span>
          </h3>
          <p className="text-xs text-slate-400">
            Automated quality governance documentation synthesized in seconds via Gemini 3.8 Flash
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied to Clipboard!' : 'Copy 8D'}</span>
          </button>

          <button
            type="button"
            onClick={onRegenerateReport}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-950 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Drafting with Gemini...' : 'Re-Draft 8D'}</span>
          </button>
        </div>
      </div>

      {/* 8D Quick Step Selector */}
      <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
        {steps.map((s) => {
          const isSelected = activeStep === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveStep(activeStep === s.id ? 'all' : s.id)}
              className={`p-2 rounded-lg border text-center transition-all ${
                isSelected
                  ? 'bg-cyan-950 border-cyan-500 text-white shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <s.icon className={`w-3.5 h-3.5 mx-auto mb-1 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span className="text-[10px] font-mono font-bold block">D{s.id}</span>
            </button>
          );
        })}
      </div>

      {/* Structured Sections */}
      <div className="space-y-4">
        {/* D0: Emergency Response */}
        {(activeStep === 'all' || activeStep === 0) && (
          <div className="p-4.5 bg-slate-950/90 rounded-xl border-2 border-cyan-500/60 hover:border-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.18)] transition-all">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>D0 — Emergency Response & Initial Containment</span>
              </h4>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-200 border border-cyan-400/80 font-mono text-[10px] font-bold">
                DISCIPLINE D0
              </span>
            </div>
            <p className="text-xs text-slate-200 mt-2 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              {report.d0_plan}
            </p>
          </div>
        )}

        {/* D1: Team */}
        {(activeStep === 'all' || activeStep === 1) && (
          <div className="p-4.5 bg-slate-950/90 rounded-xl border-2 border-indigo-500/60 hover:border-indigo-400 shadow-[0_0_18px_rgba(99,102,241,0.18)] transition-all">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>D1 — Cross-Functional Problem Solving Team</span>
              </h4>
              <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-200 border border-indigo-400/80 font-mono text-[10px] font-bold">
                DISCIPLINE D1
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {report.d1_team.map((member, i) => (
                <div key={i} className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 hover:border-indigo-500/50 transition-colors">
                  <div className="text-xs font-bold text-white">{member.name}</div>
                  <div className="text-[11px] text-cyan-300 font-medium">{member.role}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{member.dept}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* D2: Problem Description */}
        {(activeStep === 'all' || activeStep === 2) && (
          <div className="p-4.5 bg-slate-950/90 rounded-xl border-2 border-blue-500/60 hover:border-blue-400 shadow-[0_0_18px_rgba(59,130,246,0.18)] transition-all">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-400" />
                <span>D2 — Problem Description (5W2H & Is / Is Not Analysis)</span>
              </h4>
              <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-200 border border-blue-400/80 font-mono text-[10px] font-bold">
                DISCIPLINE D2
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="space-y-2 p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">What is the defect?</span>
                  <span className="text-white font-medium">{report.d2_problemDescription.what}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Where did it occur?</span>
                  <span className="text-slate-200">{report.d2_problemDescription.where}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">When was it detected?</span>
                  <span className="text-cyan-300 font-mono">{report.d2_problemDescription.when}</span>
                </div>
              </div>

              <div className="space-y-2 p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Extent / How Much?</span>
                  <span className="text-white font-medium">{report.d2_problemDescription.howMuch}</span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-300 uppercase font-mono block">Is Not (Boundary Isolation)</span>
                  <span className="text-slate-200">{report.d2_problemDescription.isNot}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* D3: Interim Containment */}
        {(activeStep === 'all' || activeStep === 3) && (
          <div className="p-4.5 bg-slate-950/90 rounded-xl border-2 border-emerald-500/70 hover:border-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.22)] transition-all">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>D3 — Interim Containment Actions (ICA)</span>
              </h4>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-200 border border-emerald-400/80 font-mono text-[10px] font-bold">
                DISCIPLINE D3
              </span>
            </div>
            <div className="mt-2.5 p-3.5 bg-emerald-950/40 border border-emerald-800/80 rounded-lg text-xs space-y-2">
              <p className="text-emerald-100">
                <strong className="text-emerald-300">Execution:</strong> {report.d3_containment.action}
              </p>
              <p className="text-slate-200">
                <strong className="text-slate-100">Verification of Zero Escapes:</strong> {report.d3_containment.validation}
              </p>
              <div className="text-[11px] font-mono text-cyan-300 font-semibold">
                Quarantined Units in Buffer: <strong className="text-white bg-slate-900 px-2 py-0.5 rounded border border-cyan-500">{report.d3_containment.quarantinedCount} units</strong>
              </div>
            </div>
          </div>
        )}

        {/* D4: Root Cause (5-Whys + Ishikawa Fishbone) */}
        {(activeStep === 'all' || activeStep === 4) && (
          <div className="p-4.5 bg-slate-950/90 rounded-xl border-2 border-purple-500/60 hover:border-purple-400 shadow-[0_0_18px_rgba(168,85,247,0.18)] space-y-4 transition-all">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-purple-400" />
                <span>D4 — Root Cause Analysis (5-Whys & Ishikawa 6M Diagram)</span>
              </h4>
              <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-200 border border-purple-400/80 font-mono text-[10px] font-bold">
                DISCIPLINE D4
              </span>
            </div>

            {/* 5-Whys Step Tree */}
            <div className="space-y-1.5 p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-xs">
              <span className="text-[11px] font-bold text-white block mb-1">5-Whys Hierarchical Drilldown:</span>
              {report.d4_rootCause.fiveWhys.map((why, idx) => (
                <div key={idx} className="flex items-start gap-2.5 py-1.5 border-b border-slate-800/60 last:border-0">
                  <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono text-[10px] font-bold shrink-0 border border-cyan-800/80">
                    Why #{idx + 1}
                  </span>
                  <span className={idx === 4 ? 'font-bold text-rose-300' : 'text-slate-200'}>
                    {why}
                  </span>
                </div>
              ))}
            </div>

            {/* Ishikawa 6M Interactive Fishbone */}
            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-white">Ishikawa 6M Cause-and-Effect Matrix:</span>
                <div className="flex flex-wrap gap-1">
                  {Object.keys(report.d4_rootCause.fishboneCategories).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveFishbone(cat)}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                        activeFishbone === cat
                          ? 'bg-indigo-600 text-white font-bold shadow-xs'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-800 text-xs">
                <span className="text-[10px] font-mono uppercase text-indigo-300 font-bold block mb-1">
                  Contributing Factors in [{activeFishbone}]:
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-200">
                  {((report.d4_rootCause.fishboneCategories as any)[activeFishbone] || []).map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Escape Root Cause */}
            <div className="p-3 bg-rose-950/40 rounded-lg border border-rose-800/80 text-xs">
              <span className="font-bold text-rose-300 block mb-0.5">Escape Point (Why wasn't it caught earlier?):</span>
              <p className="text-slate-200">{report.d4_rootCause.escapeRootCause}</p>
            </div>
          </div>
        )}

        {/* D5: Permanent Corrective Actions */}
        {(activeStep === 'all' || activeStep === 5) && (
          <div className="p-4.5 bg-slate-950/90 rounded-xl border-2 border-amber-500/60 hover:border-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.18)] transition-all">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                <span>D5 — Permanent Corrective Actions (PCA)</span>
              </h4>
              <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-200 border border-amber-400/80 font-mono text-[10px] font-bold">
                DISCIPLINE D5
              </span>
            </div>
            <div className="space-y-2">
              {report.d5_correctiveActions.map((pca, i) => (
                <div key={i} className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex-1">
                    <p className="text-white font-medium">{pca.action}</p>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Owner: <strong className="text-white font-bold">{pca.owner}</strong> • Due: <span className="font-mono text-cyan-300 font-bold">{pca.targetDate}</span>
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold shrink-0 self-start sm:self-center ${
                    pca.status === 'Completed'
                      ? 'bg-emerald-950 text-emerald-200 border border-emerald-600'
                      : 'bg-amber-950 text-amber-200 border border-amber-600'
                  }`}>
                    {pca.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* D6: Verification & Validation */}
        {(activeStep === 'all' || activeStep === 6) && (
          <div className="p-4.5 bg-slate-950/90 rounded-xl border-2 border-teal-500/60 hover:border-teal-400 shadow-[0_0_18px_rgba(20,184,166,0.18)] text-xs space-y-2 transition-all">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-teal-400" />
                <span>D6 — Verification & Validation Run</span>
              </h4>
              <span className="px-2 py-0.5 rounded bg-teal-950 text-teal-200 border border-teal-400/80 font-mono text-[10px] font-bold">
                DISCIPLINE D6
              </span>
            </div>
            <p className="text-slate-200">
              <strong className="text-white">Validation Plan:</strong> {report.d6_verification.validationPlan}
            </p>
            <p className="text-emerald-300 font-mono font-semibold">
              <strong>Acceptance Gate:</strong> {report.d6_verification.resultsTarget}
            </p>
          </div>
        )}

        {/* D7: Prevent Recurrence & FMEA */}
        {(activeStep === 'all' || activeStep === 7) && (
          <div className="p-4.5 bg-slate-950/90 rounded-xl border-2 border-sky-500/60 hover:border-sky-400 shadow-[0_0_18px_rgba(14,165,233,0.18)] text-xs space-y-2 transition-all">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
                <span>D7 — Prevent Recurrence (Control Plan & FMEA Revision)</span>
              </h4>
              <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-200 border border-sky-400/80 font-mono text-[10px] font-bold">
                DISCIPLINE D7
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-2">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-cyan-300 uppercase font-mono font-bold block">Control Plan Update:</span>
                <p className="text-slate-200 mt-1">{report.d7_prevention.controlPlanUpdate}</p>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-cyan-300 uppercase font-mono font-bold block">FMEA Revision:</span>
                <p className="text-slate-200 mt-1">{report.d7_prevention.fmeaUpdate}</p>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-cyan-300 uppercase font-mono font-bold block">SOP & Work Instructions:</span>
                <p className="text-slate-200 mt-1">{report.d7_prevention.sopRevisions}</p>
              </div>
            </div>
          </div>
        )}

        {/* D8: Closure */}
        {(activeStep === 'all' || activeStep === 8) && (
          <div className="p-4.5 bg-slate-950/90 rounded-xl border-2 border-violet-500/60 hover:border-violet-400 shadow-[0_0_18px_rgba(139,92,246,0.18)] text-xs transition-all">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-violet-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <Award className="w-4 h-4 text-violet-400" />
                <span>D8 — Formal Team Closure & Sign-off</span>
              </h4>
              <span className="px-2 py-0.5 rounded bg-violet-950 text-violet-200 border border-violet-400/80 font-mono text-[10px] font-bold">
                DISCIPLINE D8
              </span>
            </div>
            <p className="text-slate-200 mt-2 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              {report.d8_closure}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
