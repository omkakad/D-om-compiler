import React, { useState, useRef, useEffect } from 'react';
import { Language, LANGUAGES } from '../types';
import { ChevronDown, Code2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface LanguageSelectorProps {
  selected: Language;
  onSelect: (lang: Language) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2.5 px-3 py-1.5 bg-zinc-900/40 border rounded-xl transition-all duration-300 group min-w-[110px] justify-between",
          isOpen 
            ? "border-indigo-500/50 ring-4 ring-indigo-500/5 bg-zinc-900" 
            : "border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900"
        )}
      >
        <div className="p-1 bg-zinc-800/50 rounded-lg group-hover:bg-zinc-700 transition-colors">
          <Code2 size={12} className="text-indigo-400" />
        </div>
        <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-widest">
          {selected.name}
        </span>
        <ChevronDown 
          size={12} 
          className={cn(
            "text-zinc-600 transition-transform duration-300",
            isOpen && "rotate-180 text-zinc-400"
          )} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="absolute top-full right-0 mt-2 w-56 bg-zinc-950 border border-zinc-800/50 rounded-2xl shadow-2xl z-[100] overflow-hidden py-2 backdrop-blur-2xl"
          >
            <div className="px-4 py-2 mb-1">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">
                Environment
              </span>
            </div>
            <div className="max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 px-2 space-y-0.5">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => {
                    onSelect(lang);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-200 group",
                    selected.id === lang.id
                      ? "bg-indigo-500/10 text-indigo-400"
                      : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
                  )}
                >
                  <span>{lang.name}</span>
                  {selected.id === lang.id && (
                    <Check size={12} className="text-indigo-400" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
