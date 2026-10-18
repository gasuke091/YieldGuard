import React, { useState } from 'react';
import { 
  Radio, 
  Terminal, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  CheckCircle2, 
  History, 
  Send, 
  ShieldCheck,
  Server,
  Zap,
  CornerDownRight
} from 'lucide-react';
import { MesHoldItem, ExcursionPreset } from '../types/osat';

interface SecsGemTerminalProps {
  isInhibited: boolean;
  onEmergencyInhibit: () => void;
  onReleaseInhibit: (comment?: string) => void;
  records: MesHoldItem[];
  preset: ExcursionPreset;
  isAutonomous: boolean;
}

export const SecsGemTerminal: React.FC<SecsGemTerminalProps> = ({
  isInhibited,
  onEmergencyInhibit,
  onReleaseInhibit,
  records,
  preset,
  isAutonomous,
}) => {
  const [releaseComment, setReleaseComment] = useState<string>('Verified C-SAM 100MHz baseline across 3 consecutive strips. Tool calibration certified.');
  const [customSecsCommand, setCustomSecsCommand] = useState<string>('S2F41 RCMD=QUERY_EQUIPMENT_STATUS');
  const [terminalLogs, setTerminalLogs] = useState<Array<{ timestamp: string; type: 'tx' | 'rx' | 'sys'; msg: string }>>([
    { timestamp: '19:42:10.124', type: 'sys', msg: 'YieldGuard Daemon: Ingestion anomaly detected at Unit #42. Confidence: 97.8%' },
    { timestamp: '19:42:10.464', type: 'tx', msg: 'SECS S2F41 -> Besi-DA07: <L [2] <A "RCMD" "LOT_INHIBIT"> <A "LOTID" "LOT-2026-BGA-9420"> <A "ACTION" "CARRIER_DIVERT">>' },
    { timestamp: '19:42:10.482', type: 'rx', msg: 'SECS S2F42 <- Besi-DA07: <L [2] <B 0x00> <A "ACK" "HCACK_OK_LINE_INTERLOCKED">>' },
    { timestamp: '19:42:10.510', type: 'sys', msg: 'MES Carrier Diverter: Physical gate engaged. Active strip diverted to N2 purge buffer.' },
    { timestamp: '19:42:10.590', type: 'rx', msg: 'GEM S6F11 <- Besi-DA07: <L [3] <U4 9021> <A "CEID" "TOOL_FEED_HALTED"> <U1 4 (INHIBITED)>>' },
  ]);

  const handleSendSecs = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSecsCommand.trim()) return;

    const time = new Date().toISOString().substring(11, 23);
    const newTx = { timestamp: time, type: 'tx' as const, msg: `SECS ${customSecsCommand}` };
    const newRx = { timestamp: time, type: 'rx' as const, msg: `SECS S2F42 <- Equipment: <HCACK 0x00 (SUCCESS_ACCEPTED)>` };

    setTerminalLogs((prev) => [...prev, newTx, newRx]);
    setCustomSecsCommand('');
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60 flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
              SEMI E5 / E30 SECS-II / GEM INTERLOCK
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Lights-Out Factory Governance
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
            <Server className="w-5 h-5 text-cyan-400" />
            <span>Closed-Loop MES Lot-Inhibit Execution Engine</span>
          </h3>
          <p className="text-xs text-slate-400">
            Autonomous Host-to-Equipment interlock commanding physical carrier diverters and feeder stops
          </p>
        </div>

        {/* Live Interlock Status Badge */}
        <div className="flex items-center gap-2">
          {isInhibited ? (
            <div className="px-3.5 py-1.5 rounded-lg bg-rose-950 border border-rose-500/80 flex items-center gap-2 text-xs font-mono font-bold text-rose-300 shadow-lg shadow-rose-950/80">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <span>EQUIPMENT STATE: INHIBITED (HALTED)</span>
            </div>
          ) : (
            <div className="px-3.5 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500/80 flex items-center gap-2 text-xs font-mono font-bold text-emerald-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>EQUIPMENT STATE: RUNNING (NORMAL)</span>
            </div>
          )}
        </div>
      </div>

      {/* Hardware Line State Schematic */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            isInhibited ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
          }`}>
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Safety Interlock:</span>
            <span className="text-xs font-bold text-white">
              {isInhibited ? 'E-STOP / HARD INTERLOCK ENGAGED' : 'INTERLOCK ARMED & MONITORING'}
            </span>
            <span className="text-[10px] text-slate-500 block">Response Latency: 340ms</span>
          </div>
        </div>

        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            isInhibited ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-slate-800 text-slate-400'
          }`}>
            <CornerDownRight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Physical Diverter Gate:</span>
            <span className="text-xs font-bold text-white">
              {isInhibited ? 'QUARANTINE BUFFER (SLOT 04)' : 'INSPECTION OUTFEED TRACK'}
            </span>
            <span className="text-[10px] text-slate-500 block">Prevents defective strip egress</span>
          </div>
        </div>

        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex flex-col items-center justify-center gap-1 shrink-0">
            <span className={`w-2.5 h-2.5 rounded-full ${isInhibited ? 'bg-rose-500 animate-pulse' : 'bg-slate-600'}`}></span>
            <span className={`w-2.5 h-2.5 rounded-full ${!isInhibited ? 'bg-emerald-500' : 'bg-slate-600'}`}></span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Cleanroom Light Tower:</span>
            <span className="text-xs font-bold text-white">
              {isInhibited ? 'RED SOLID (ALARM MUTED)' : 'GREEN STEADY (OEE 91.8%)'}
            </span>
            <span className="text-[10px] text-slate-500 block">SEMI E10 Compliance</span>
          </div>
        </div>
      </div>

      {/* SECS/GEM Live Protocol Terminal */}
      <div className="bg-slate-950 rounded-xl border border-slate-700/80 overflow-hidden font-mono shadow-xl">
        <div className="p-3 bg-slate-900 border-b border-slate-700/80 flex items-center justify-between">
          <span className="flex items-center gap-2 text-white text-xs sm:text-sm font-bold">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>SECS-II / GEM Host Protocol Stream (Line DA-07)</span>
          </span>
          <span className="text-xs text-cyan-300 bg-cyan-950 px-2.5 py-0.5 rounded border border-cyan-500 font-bold">
            Port: TCP/HSMS 5000 • Connected
          </span>
        </div>

        <div className="p-4 h-64 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-slate-700">
          {terminalLogs.map((log, idx) => {
            let textColor = 'text-slate-100';
            let prefix = '[LOG]';
            if (log.type === 'tx') {
              textColor = 'text-cyan-300';
              prefix = '[TX >> HOST]';
            } else if (log.type === 'rx') {
              textColor = 'text-emerald-300';
              prefix = '[RX << TOOL]';
            } else if (log.type === 'sys') {
              textColor = 'text-amber-200 font-bold';
              prefix = '[AI DAEMON]';
            }

            return (
              <div key={idx} className="flex items-start gap-2.5 leading-relaxed text-[13.5px] sm:text-sm">
                <span className="text-slate-400 shrink-0 text-xs font-mono">{log.timestamp}</span>
                <span className="text-slate-300 shrink-0 font-bold text-xs font-mono">{prefix}</span>
                <span className={`${textColor} font-mono tracking-tight font-medium break-all`}>{log.msg}</span>
              </div>
            );
          })}
        </div>

        {/* Custom SECS Command Input Form */}
        <form onSubmit={handleSendSecs} className="p-2.5 bg-slate-900 border-t border-slate-700/80 flex gap-2">
          <input
            type="text"
            value={customSecsCommand}
            onChange={(e) => setCustomSecsCommand(e.target.value)}
            placeholder="Type SECS-II command (e.g. S2F41 RCMD=LOT_INHIBIT, S1F3 SVID=501)..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-white text-sm font-mono focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send HSMS</span>
          </button>
        </form>
      </div>

      {/* Engineer Inhibit / Release Action Controls */}
      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        {isInhibited ? (
          <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex-1">
              <span className="text-[11px] font-semibold text-rose-300 block mb-1">
                Release Gate: Quality Engineer Authorization Required
              </span>
              <input
                type="text"
                value={releaseComment}
                onChange={(e) => setReleaseComment(e.target.value)}
                placeholder="Enter root cause corrective action sign-off..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="button"
              onClick={() => onReleaseInhibit(releaseComment)}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Unlock className="w-4 h-4" />
              <span>Sign & Release Inhibit</span>
            </button>
          </div>
        ) : (
          <div className="w-full flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-white">Manual Emergency Override:</p>
              <p className="text-[11px] text-slate-400">
                Immediately trigger SECS/GEM S2F41 Lot Inhibit and halt feeder line
              </p>
            </div>
            <button
              type="button"
              onClick={onEmergencyInhibit}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Issue Immediate MES Inhibit</span>
            </button>
          </div>
        )}
      </div>

      {/* Historical Audit Trail of MES Holds */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          <span>MES SECS/GEM Lot Hold Audit Ledger</span>
        </h4>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
                <th className="p-3">Hold ID</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Equipment</th>
                <th className="p-3">Lot / Strip</th>
                <th className="p-3">Defect Trigger</th>
                <th className="p-3 text-right">Scrap Avoidance</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/60 font-mono">
              {records.map((rec) => (
                <tr key={rec.id}>
                  <td className="p-3 font-bold text-cyan-300">{rec.id}</td>
                  <td className="p-3 text-slate-400 text-[10px]">
                    {new Date(rec.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="p-3 text-slate-300">{rec.equipmentId}</td>
                  <td className="p-3 text-slate-300">
                    <span className="block font-bold">{rec.lotId}</span>
                    <span className="text-[10px] text-slate-500">{rec.stripId} (Unit #{rec.unitIndex})</span>
                  </td>
                  <td className="p-3 text-rose-300 text-[11px] max-w-xs">{rec.defectType}</td>
                  <td className="p-3 text-right text-emerald-400 font-bold">
                    +${rec.estimatedScrapPreventedUsd.toLocaleString()}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rec.status === 'INHIBITED'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}>
                      {rec.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
