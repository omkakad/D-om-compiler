import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Send, X, Bot, User, Loader2, Code, MessageSquare, RotateCcw, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Language } from '../types';
import { getAICompletion } from '../services/aiCompletion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'code';
}

interface AISidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentCode: string;
  language: Language;
  onInsertCode: (code: string) => void;
}

export function AISidebar({ isOpen, onClose, currentCode, language, onInsertCode }: AISidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your onionCompiler AI assistant. How can I help you with your code today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [width, setWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const clientX = e.clientX;
      const newWidth = clientX - (window.innerWidth < 768 ? 0 : 56); 
      if (newWidth > 250 && newWidth < window.innerWidth * 0.8) {
        setWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Use the updated AI completion service with the user's prompt
      const response = await getAICompletion(
        currentCode,
        '',
        language,
        userMessage
      );

      if (response) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: response,
          type: response.includes('{') || response.includes('function') || response.includes('import') ? 'code' : 'text'
        }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I couldn't generate a response. Please try again." }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "An error occurred while connecting to the AI." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '-100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed md:relative inset-0 md:inset-auto h-full bg-zinc-950 border-r border-zinc-800 shadow-2xl z-[100] md:z-40 flex flex-row overflow-hidden"
          style={{ width: window.innerWidth < 768 ? '100%' : width }}
        >
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-900/30 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute -inset-1 bg-indigo-500 rounded-lg blur opacity-20"></div>
                  <div className="relative p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                    <Sparkles size={18} className="text-indigo-400" />
                  </div>
                </div>
                <div>
                  <h2 className="font-bold text-zinc-100 tracking-tight leading-none">onion AI</h2>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Assistant • Online</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setMessages([{ role: 'assistant', content: "Hello! I'm your onionCompiler AI assistant. How can I help you with your code today?" }])}
                  className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-xl transition-all"
                  title="Clear Chat"
                >
                  <RotateCcw size={16} />
                </button>
                <button 
                  onClick={onClose}
                  className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-zinc-800"
            >
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex gap-4",
                    msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
                    msg.role === 'user' ? "bg-zinc-800 text-zinc-400" : "bg-indigo-600 text-white shadow-indigo-500/20"
                  )}>
                    {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  <div className={cn(
                    "flex flex-col gap-2.5 max-w-[85%]",
                    msg.role === 'user' ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "px-5 py-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm",
                      msg.role === 'user' 
                        ? "bg-zinc-800 text-zinc-100 rounded-tr-none" 
                        : "bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none"
                    )}>
                      {msg.type === 'code' ? (
                        <div className="relative group">
                          <pre className="font-mono text-[11px] overflow-x-auto whitespace-pre-wrap bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">
                            {msg.content}
                          </pre>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                    {msg.type === 'code' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onInsertCode(msg.content)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-[10px] font-bold uppercase tracking-widest text-indigo-400 hover:bg-indigo-500/20 transition-all border border-indigo-500/20"
                        >
                          <Code size={12} />
                          Replace Editor
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(msg.content);
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:bg-zinc-700 transition-all border border-zinc-700/50"
                        >
                          <Copy size={12} />
                          Copy
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                    <Bot size={18} className="text-white" />
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 px-5 py-3.5 rounded-2xl rounded-tl-none shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-zinc-800 bg-zinc-950/50 backdrop-blur-md">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-0 group-focus-within:opacity-10 transition duration-500"></div>
                <div className="relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Ask AI to generate code..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 pr-14 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 transition-all resize-none min-h-[110px] shadow-inner"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className={cn(
                      "absolute bottom-4 right-4 p-2.5 rounded-xl transition-all shadow-lg",
                      !input.trim() || isLoading
                        ? "text-zinc-600 cursor-not-allowed"
                        : "bg-indigo-500 text-white hover:bg-indigo-400 shadow-indigo-500/20 active:scale-95"
                    )}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="h-px w-8 bg-zinc-800" />
                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                  Gemini 3 Flash Powered
                </p>
                <div className="h-px w-8 bg-zinc-800" />
              </div>
            </div>
          </div>

          {/* Resize Handle (Desktop Only) */}
          <div
            onMouseDown={startResizing}
            className={cn(
              "hidden md:block w-1 hover:w-1.5 bg-zinc-800 hover:bg-indigo-500 cursor-col-resize transition-all z-20",
              isResizing && "w-1.5 bg-indigo-500"
            )}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
