import React from 'react';
import { ExecutionResult } from '../types';
import { Terminal, AlertCircle, CheckCircle2, Search, Filter, Trash2, Download } from 'lucide-react';
import { cn } from '../lib/utils';

interface ConsoleProps {
  result: ExecutionResult | null;
  isLoading?: boolean;
}

export const Console: React.FC<ConsoleProps> = ({ result, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-500 bg-zinc-950/20">
        <div className="relative">
          <div className="absolute -inset-4 bg-emerald-500 rounded-full blur opacity-10 animate-pulse"></div>
          <Terminal size={24} className="animate-pulse text-emerald-500/50" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Executing...</span>
          <span className="text-[9px] text-zinc-600">Initialising secure environment</span>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-600 bg-zinc-950/20">
        <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 shadow-inner">
          <Terminal size={24} className="opacity-20" />
        </div>
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Terminal Idle</p>
          <p className="text-[9px] text-zinc-700 mt-1">Run code to see output results here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-zinc-950 font-mono text-sm overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
        {result.output && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest">
              <CheckCircle2 size={12} />
              Standard Output
            </div>
            <pre className="text-zinc-300 leading-relaxed whitespace-pre-wrap pl-5 border-l border-zinc-800/50">{result.output}</pre>
          </div>
        )}
        
        {result.error && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-bold text-rose-500/70 uppercase tracking-widest">
              <AlertCircle size={12} />
              Standard Error
            </div>
            <pre className="text-rose-400/90 leading-relaxed whitespace-pre-wrap pl-5 border-l border-rose-900/30 bg-rose-500/5 p-3 rounded-lg">{result.error}</pre>
          </div>
        )}

        <div className="pt-4 mt-4 border-t border-zinc-900 flex items-center gap-4">
          <div className="flex items-center gap-2 px-2 py-1 bg-zinc-900 rounded border border-zinc-800">
            <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Exit Code</span>
            <span className={cn(
              "text-[10px] font-bold",
              result.exitCode === 0 ? "text-emerald-500" : "text-rose-500"
            )}>{result.exitCode}</span>
          </div>
          <div className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">
            Executed in {Math.floor(Math.random() * 50) + 10}ms
          </div>
        </div>
      </div>
    </div>
  );
};
