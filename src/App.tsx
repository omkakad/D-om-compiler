import React, { useState, useCallback, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, RotateCcw, Share2, Github, Cpu, Layers, Copy, Check, Terminal, Eye, Loader2, MessageSquare, Sparkles, FolderTree, Settings, HelpCircle, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LANGUAGES, Language, ExecutionResult } from './types';
import { LanguageSelector } from './components/LanguageSelector';
import { Console } from './components/Console';
import { Preview } from './components/Preview';
import { executeCode } from './services/gemini';
import { cn } from './lib/utils';
import { configureMonaco } from './services/monacoConfig';
import { getAICompletion } from './services/aiCompletion';
import { AISidebar } from './components/AISidebar';

// Initialize Monaco configuration
configureMonaco();

export default function App() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'undefined' || apiKey.length < 10) {
    return (
      <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 font-sans items-center justify-center p-6 text-center">
        <div className="max-w-md w-full space-y-8 p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 shadow-2xl backdrop-blur-xl">
          <div className="flex justify-center">
            <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20">
              <Settings size={48} className="text-rose-500 animate-spin-slow" />
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-2xl font-black text-white tracking-tight">Configuration Required</h1>
            <p className="text-zinc-400 text-sm leading-relaxed">
              To use the AI Assistant and code execution, you need to provide a <span className="text-indigo-400 font-mono">VITE_GEMINI_API_KEY</span>.
            </p>
          </div>

          <div className="p-4 bg-zinc-950/50 border border-zinc-800 rounded-xl text-left space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">How to fix:</h2>
            <ol className="text-xs text-zinc-400 space-y-2 list-decimal list-inside">
              <li>Add <code className="text-indigo-300">VITE_GEMINI_API_KEY=your_key</code> to your <code className="text-zinc-300">.env</code> file.</li>
              <li>On Netlify, add it in <span className="text-zinc-300 italic">Site Settings &gt; Environment Variables</span>.</li>
              <li>Restart your development server or trigger a new deploy.</li>
            </ol>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} />
            RELOAD APPLICATION
          </button>
        </div>
      </div>
    );
  }

  const [language, setLanguage] = useState<Language>(LANGUAGES[0]);
  const [code, setCode] = useState<string>(LANGUAGES[0].defaultCode);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [previewWidth, setPreviewWidth] = useState(450);
  const [consoleHeight, setConsoleHeight] = useState(280);
  const [lastRunCode, setLastRunCode] = useState<string>(LANGUAGES[0].defaultCode);
  const [isResizing, setIsResizing] = useState(false);
  const [isResizingConsole, setIsResizingConsole] = useState(false);
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'editor' | 'explorer' | 'settings'>('editor');
  const [activeView, setActiveView] = useState<'editor' | 'preview'>('editor');
  const editorRef = useRef<any>(null);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const startResizingConsole = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingConsole(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
    setIsResizingConsole(false);
  }, []);

  const resize = useCallback((e: MouseEvent | TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (isResizing) {
      const newWidth = window.innerWidth - clientX;
      const minWidth = 200;
      const maxWidth = window.innerWidth * 0.85;
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setPreviewWidth(newWidth);
      }
    } else if (isResizingConsole) {
      const newHeight = window.innerHeight - clientY - 28;
      const minHeight = 40;
      const maxHeight = window.innerHeight - 100;

      if (newHeight >= minHeight && newHeight <= maxHeight) {
        setConsoleHeight(newHeight);
      }
    }
  }, [isResizing, isResizingConsole]);

  useEffect(() => {
    if (isResizing || isResizingConsole) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
      window.addEventListener('touchmove', resize, { passive: false });
      window.addEventListener('touchend', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
      window.removeEventListener('touchmove', resize);
      window.removeEventListener('touchend', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
      window.removeEventListener('touchmove', resize);
      window.removeEventListener('touchend', stopResizing);
    };
  }, [isResizing, isResizingConsole, resize, stopResizing]);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setCode(lang.defaultCode);
    setResult(null);
  };

  const handleRun = async () => {
    if (!code.trim() || isLoading) return;

    setIsLoading(true);
    setResult(null);
    setLastRunCode(code);

    try {
      const res = await executeCode(code, language);
      setResult(res);
    } catch (error) {
      setResult({
        output: '',
        error: 'An unexpected error occurred during execution.',
        exitCode: 1
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCode(language.defaultCode);
    setResult(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleAIAction = () => {
    setIsAISidebarOpen(!isAISidebarOpen);
  };

  const handleInsertCode = (newCode: string) => {
    setCode(newCode);
    if (editorRef.current) {
      editorRef.current.setValue(newCode);
    }
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  return (
    <div className={cn(
      "flex flex-col h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30 overflow-hidden",
      (isResizing || isResizingConsole) && "select-none"
    )}>
      {/* Global Resize Overlay */}
      {(isResizing || isResizingConsole) && (
        <div
          className={cn(
            "fixed inset-0 z-[9999] select-none touch-none",
            isResizing ? "cursor-col-resize" : "cursor-row-resize"
          )}
        />
      )}

      {/* Header */}
      <header className="h-14 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 z-50 shrink-0">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-4 group cursor-pointer shrink-0">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-rose-400 via-fuchsia-500 to-indigo-600 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <img
                src="https://picsum.photos/seed/onion-logo/80/80"
                alt="onionCompiler Logo"
                className="relative w-8 h-8 md:w-10 md:h-10 rounded-xl object-cover shadow-lg shadow-indigo-500/10 border border-zinc-800/50"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-lg md:text-xl font-black text-white tracking-tighter leading-none select-none hidden xs:inline-block">
              onionCompiler
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          <LanguageSelector selected={language} onSelect={handleLanguageChange} />

          <div className="hidden sm:flex items-center gap-1 bg-zinc-900/40 border border-zinc-800/50 p-1 rounded-xl">
            <button
              onClick={handleCopy}
              className="p-2 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-all"
              title="Copy Code"
            >
              {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            </button>
            <button
              onClick={handleReset}
              className="p-2 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-all"
              title="Reset Code"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          <button
            onClick={handleAIAction}
            className={cn(
              "flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-xl text-[10px] md:text-[11px] font-bold transition-all duration-300 uppercase tracking-widest border",
              isAISidebarOpen
                ? "bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/20"
                : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-indigo-500/50 hover:text-indigo-400"
            )}
          >
            <Sparkles size={14} className={cn(isAISidebarOpen ? "text-white" : "text-indigo-400")} />
            <span className="hidden xs:inline">AI Assistant</span>
          </button>

          <button
            onClick={handleRun}
            disabled={isLoading}
            className={cn(
              "flex items-center gap-2 px-3 md:px-6 py-1.5 rounded-xl text-[10px] md:text-[11px] font-black transition-all duration-300 uppercase tracking-[0.15em]",
              isLoading
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20 active:scale-95"
            )}
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
            <span className="hidden xs:inline">RUN CODE</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Mobile View Toggle */}
        <div className="md:hidden flex border-b border-zinc-800/50 bg-zinc-950 shrink-0">
          <button
            onClick={() => setActiveView('editor')}
            className={cn(
              "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all",
              activeView === 'editor' ? "text-indigo-400 bg-indigo-500/10 border-b-2 border-indigo-500" : "text-zinc-500"
            )}
          >
            Editor
          </button>
          <button
            onClick={() => setActiveView('preview')}
            className={cn(
              "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all",
              activeView === 'preview' ? "text-indigo-400 bg-indigo-500/10 border-b-2 border-indigo-500" : "text-zinc-500"
            )}
          >
            Preview
          </button>
        </div>

        {/* Left Sidebar - Navigation/Info */}
        <div className="hidden md:flex h-full w-14 border-r border-zinc-800/50 bg-zinc-950 flex-col items-center py-6 gap-6 z-50 shrink-0">
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => setActiveTab('editor')}
              className={cn(
                "p-2.5 transition-all rounded-xl relative group flex items-center justify-center",
                activeTab === 'editor' ? "bg-indigo-500/10" : "hover:bg-zinc-900"
              )}
              title="Editor"
            >
              <img
                src="https://picsum.photos/seed/onion-logo/40/40"
                alt="Logo"
                className={cn(
                  "w-6 h-6 rounded-lg object-cover transition-all",
                  activeTab !== 'editor' && "grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100"
                )}
                referrerPolicy="no-referrer"
              />
              {activeTab === 'editor' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-indigo-500 rounded-full" />}
            </button>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => setIsConsoleOpen(!isConsoleOpen)}
              className={cn(
                "p-2.5 transition-all rounded-xl relative group",
                isConsoleOpen ? "text-indigo-400 bg-indigo-500/10" : "text-zinc-600 hover:text-zinc-400 hover:bg-zinc-900"
              )}
              title="Terminal"
            >
              <Terminal size={20} />
              {isConsoleOpen && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-indigo-500 rounded-full" />}
            </button>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => setIsAISidebarOpen(!isAISidebarOpen)}
              className={cn(
                "p-2.5 transition-all rounded-xl relative group",
                isAISidebarOpen ? "text-indigo-400 bg-indigo-500/10" : "text-zinc-600 hover:text-zinc-400 hover:bg-zinc-900"
              )}
              title="AI Assistant"
            >
              <MessageSquare size={20} />
              {isAISidebarOpen && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-indigo-500 rounded-full" />}
            </button>
          </div>
        </div>

        {/* AI Sidebar */}
        <AISidebar
          isOpen={isAISidebarOpen}
          onClose={() => setIsAISidebarOpen(false)}
          currentCode={code}
          language={language}
          onInsertCode={handleInsertCode}
        />

        {/* Editor & Console Container */}
        <div className={cn(
          "flex-1 flex flex-col min-w-0 border-b md:border-b-0 md:border-r border-zinc-800/50 bg-zinc-950",
          activeView !== 'editor' && "hidden md:flex"
        )}>
          <div className="flex-1 relative flex flex-col min-h-[200px]">
            {/* Editor Tabs Mockup */}
            <div className="h-9 bg-zinc-950 border-b border-zinc-800/50 flex items-center px-4 gap-2">
              <div className="h-full px-4 flex items-center gap-2 bg-zinc-900/50 border-x border-zinc-800/50 text-[10px] font-bold uppercase tracking-widest text-indigo-400 border-t-2 border-t-indigo-500">
                <Layers size={12} />
                main.{language.id === 'react' ? 'tsx' : language.id}
              </div>
            </div>

            <div className="flex-1 relative">
              <Editor
                height="100%"
                language={language.monaco}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || '')}
                onMount={handleEditorDidMount}
                options={{
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                  roundedSelection: true,
                  automaticLayout: true,
                  padding: { top: 20 },
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  smoothScrolling: true,
                  contextmenu: true,
                  renderLineHighlight: 'all',
                  lineHeight: 1.6,
                  scrollbar: {
                    vertical: 'visible',
                    horizontal: 'visible',
                    useShadows: false,
                    verticalScrollbarSize: 8,
                    horizontalScrollbarSize: 8,
                  }
                }}
              />
            </div>
          </div>

          {isConsoleOpen && (
            <div
              className="flex flex-col border-t border-zinc-800/50 bg-zinc-950 relative shrink-0"
              style={{ height: consoleHeight }}
            >
              {/* Console Resize Handle */}
              <div
                onMouseDown={startResizingConsole}
                onTouchStart={(e) => {
                  e.preventDefault();
                  setIsResizingConsole(true);
                }}
                className={cn(
                  "absolute top-0 left-0 right-0 h-6 -translate-y-1/2 cursor-row-resize z-50 touch-none",
                  "group/handle flex items-center justify-center"
                )}
              >
                <div className={cn(
                  "absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 transition-all",
                  "bg-zinc-800 group-hover/handle:bg-indigo-500/50 group-hover/handle:h-1",
                  isResizingConsole && "bg-indigo-500 h-1"
                )} />
                {/* Mobile Drag Indicator */}
                <div className="md:hidden w-12 h-1 bg-zinc-700 rounded-full relative z-10 opacity-50 group-hover/handle:opacity-100" />
              </div>

              <div className="flex items-center justify-between px-6 py-2.5 bg-zinc-950 border-b border-zinc-800/50 shrink-0">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                  <Terminal size={14} className="text-emerald-500/70" />
                  Debug Console
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-600">
                  <span className="flex items-center gap-1.5">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                    Connected
                  </span>
                  <span className="flex items-center gap-1.5">
                    <RotateCcw size={12} className="cursor-pointer hover:text-zinc-400" onClick={() => setResult(null)} />
                    Clear
                  </span>
                  <button
                    onClick={() => setIsConsoleOpen(false)}
                    className="p-1 hover:bg-zinc-900 rounded-md transition-colors text-zinc-500 hover:text-rose-400"
                    title="Close Terminal"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <Console result={result} isLoading={isLoading} />
              </div>
            </div>
          )}
        </div>

        {/* Resize Handle (Desktop Only) */}
        <div
          onMouseDown={startResizing}
          className={cn(
            "hidden md:block w-1.5 hover:w-2 -mx-0.75 cursor-col-resize transition-all z-20 group/vhandle",
            isResizing && "w-2"
          )}
        >
          <div className={cn(
            "w-px h-full mx-auto transition-all",
            "bg-zinc-800 group-hover/vhandle:bg-indigo-500 group-hover/vhandle:w-1",
            isResizing && "bg-indigo-500 w-1"
          )} />
        </div>

        {/* Right Sidebar - Preview */}
        <div
          className={cn(
            "flex flex-col bg-zinc-950 relative shrink-0 overflow-hidden",
            activeView !== 'preview' && "hidden md:flex"
          )}
          style={{ width: window.innerWidth < 768 ? '100%' : previewWidth }}
        >
          <Preview code={lastRunCode} language={language} isLoading={isLoading} />
        </div>
      </main>

      {/* Footer */}
      <footer className="h-7 px-6 bg-zinc-950 border-t border-zinc-800/50 flex items-center justify-between text-[9px] text-zinc-600 font-bold uppercase tracking-[0.15em] shrink-0">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2 text-emerald-500/70">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            System Ready
          </span>
          <span className="flex items-center gap-1.5">
            <Cpu size={12} />
            Gemini 3 Flash
          </span>
          <span className="flex items-center gap-1.5">
            <Terminal size={12} />
            UTF-8
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span>Lines: {code.split('\n').length}</span>
          <span>Chars: {code.length}</span>
          <span className="text-indigo-400/70">Stable Build</span>
        </div>
      </footer>
    </div>
  );
}
