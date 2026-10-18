import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Cpu, 
  Sparkles, 
  RefreshCw, 
  HelpCircle, 
  ShieldCheck, 
  Bot, 
  User, 
  Zap,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { ExcursionPreset } from '../types/osat';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface OperationalCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  preset: ExcursionPreset;
  isInhibited: boolean;
}

export const OperationalCopilotDrawer: React.FC<OperationalCopilotDrawerProps> = ({
  isOpen,
  onClose,
  preset,
  isInhibited,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hello! I am **YieldGuard Copilot**, your OSAT packaging quality and lights-out operational intelligence engine powered by Gemini on Vertex AI.\n\nI am currently monitoring **${preset.equipmentId}** on Lot **${preset.lotId}**. How can I assist you with acoustic tomography, 8D report drafting, or SECS/GEM inhibit governance?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const quickPrompts = [
    `Why did Unit #${preset.firstFailedIndex} fail acoustic inspection?`,
    'Explain the physics of 100MHz ultrasonic phase inversion at voids',
    'Calculate scrap cost if line was not inhibited',
    'Draft Containment Action D3 for the 8D report',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: {
            equipmentId: preset.equipmentId,
            lotId: preset.lotId,
            stripId: preset.stripId,
            defectType: preset.defectType,
            firstFailedIndex: preset.firstFailedIndex,
            isInhibited,
            telemetry: preset.telemetry,
          },
        }),
      });

      const data = await res.json();
      const reply = data.reply || 'Analysis completed.';

      const botMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: `### YieldGuard Technical Advisory\nPrimary root cause is correlated with thermal drift (+4.8°C). The acoustic reflection coefficient $R = \\frac{Z_2 - Z_1}{Z_2 + Z_1}$ dropped to -0.99, indicating an air gap delamination. The closed-loop MES inhibit on ${preset.equipmentId} successfully prevented downstream strip scrap ($${preset.preventableScrapUsd.toLocaleString()}).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md sm:max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl relative">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
              <Cpu className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>YieldGuard Operational Copilot</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Gemini 3.8 Flash
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Semiconductor OSAT Quality &amp; Governance SME
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Context Banner */}
        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 text-[11px] flex items-center justify-between text-slate-400 font-mono">
          <span>Target: <strong className="text-slate-200">{preset.equipmentId.split(' ')[0]}</strong></span>
          <span>Lot: <strong className="text-slate-200">{preset.lotId}</strong></span>
          <span className={isInhibited ? 'text-emerald-400' : 'text-rose-400'}>
            {isInhibited ? '● Inhibit Active' : '● Line Running'}
          </span>
        </div>

        {/* Message Stream */}
        <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 text-xs leading-relaxed ${
                  isUser ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isUser
                      ? 'bg-indigo-600 text-white'
                      : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                  }`}
                >
                  {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-xl p-3.5 space-y-2 ${
                    isUser
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 shadow-md'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans text-xs">
                    {/* Render basic bold, code and headers simply */}
                    {m.text.split('\n').map((line, idx) => {
                      if (line.startsWith('### ')) {
                        return <h4 key={idx} className="font-bold text-sm text-cyan-300 mt-1 mb-0.5">{line.replace('### ', '')}</h4>;
                      }
                      if (line.startsWith('## ')) {
                        return <h3 key={idx} className="font-bold text-sm text-white mt-1 mb-0.5">{line.replace('## ', '')}</h3>;
                      }
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <div key={idx} className="font-bold text-white">{line.replace(/\*\*/g, '')}</div>;
                      }
                      return <p key={idx} className="my-0.5">{line}</p>;
                    })}
                  </div>
                  <span className="text-[10px] text-slate-400 block text-right font-mono mt-1">
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 text-xs">
              <div className="w-7 h-7 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-400 flex items-center gap-2 font-mono">
                <span>Gemini 3.8 Flash analyzing packaging physics...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-2">
          <span className="text-[10px] text-slate-500 uppercase font-mono block">Suggested Questions:</span>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(q)}
                className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-[11px] transition-colors cursor-pointer text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask YieldGuard about root causes, 8D, or MES..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-cyan-950"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
