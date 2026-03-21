import React, { useEffect, useState, useCallback } from 'react';
import { Language } from '../types';
import { Eye, Monitor, Smartphone, Tablet, Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { GoogleGenAI } from "@google/genai";

interface PreviewProps {
  code: string;
  language: Language;
  isLoading: boolean;
}

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'undefined') {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export const Preview: React.FC<PreviewProps> = ({ code, language, isLoading: isExecuting }) => {
  const [srcDoc, setSrcDoc] = useState('');
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const updatePreview = useCallback(async (codeToRender: string) => {
    if (language.id === 'html') {
      setSrcDoc(codeToRender);
    } else if (language.id === 'react') {
      const reactDoc = `
        <!DOCTYPE html>
        <html>
        <head>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { margin: 0; padding: 20px; font-family: sans-serif; background: #fff; min-height: 100vh; }
            #root { height: 100%; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            \${codeToRender}
            const root = ReactDOM.createRoot(document.getElementById('root'));
            try {
              if (typeof App !== 'undefined') {
                root.render(<App />);
              } else if (typeof Counter !== 'undefined') {
                root.render(<Counter />);
              } else {
                const componentMatch = \\\`\${codeToRender}\\\`.match(/const (\\\\w+) =/);
                if (componentMatch && componentMatch[1]) {
                  const Component = eval(componentMatch[1]);
                  root.render(<Component />);
                }
              }
            } catch (e) {
              document.getElementById('root').innerHTML = '<div style="color: red">Error rendering component: ' + e.message + '</div>';
            }
          </script>
        </body>
        </html>
      `;
      setSrcDoc(reactDoc);
    } else if (language.id === 'dart') {
      setIsGeneratingPreview(true);
      try {
        const ai = getAI();
        if (!ai) {
           setSrcDoc('<html><body style="background: #09090b; color: #ef4444; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif;"><div>GEMINI_API_KEY is missing. Please check your environment variables.</div></body></html>');
           return;
        }
        const prompt = `
          Act as a high-fidelity Flutter/Dart Web renderer. 
          The user has provided the following Dart code. 
          Generate a modern, beautiful, and FULL-WIDTH HTML/CSS representation of what this code would render.
          
          Requirements:
          1. Use modern CSS (Flexbox/Grid) to create a responsive layout that fills the entire viewport.
          2. If the code uses Flutter widgets like Scaffold, AppBar, FloatingActionButton, etc., render them with authentic Material Design 3 styles.
          3. Ensure the background fills the whole screen (no narrow columns unless explicitly in the code).
          4. Use Google Fonts (like Roboto) to match the Flutter look.
          5. Include smooth transitions and hover effects for buttons.
          6. If the code is logic-only, create a dashboard-style UI showing the results.
          
          Dart Code:
          \`\`\`dart
          \${codeToRender}
          \`\`\`
          
          Return ONLY the full HTML code (including <style> and <body> tags). Do not include any markdown formatting or explanations.
        `;

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        } as any);

        let html = response.text || '';
        // Strip markdown code blocks if present
        const match = html.match(/```html\\n?([\\s\\S]*?)\\n?```/) || html.match(/```\\n?([\\s\\S]*?)\\n?```/);
        if (match) {
          html = match[1];
        }

        setSrcDoc(html.trim());
      } catch (error) {
        setSrcDoc('<html><body style="background: #09090b; color: #ef4444; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif;"><div>Failed to generate Dart preview. Please try again.</div></body></html>');
      } finally {
        setIsGeneratingPreview(false);
      }
    } else {
      setSrcDoc(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              height: 100vh; 
              margin: 0; 
              background: #09090b; 
              color: #71717a; 
              font-family: sans-serif;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div>
            <h2>No Preview Available</h2>
            <p>Preview is currently available for HTML, React (TSX), and Dart.</p>
            <p>Switch to the Console tab to see execution results.</p>
          </div>
        </body>
        </html>
      `);
    }
  }, [language]);

  useEffect(() => {
    const timer = setTimeout(() => {
      updatePreview(code);
    }, language.id === 'dart' ? 1000 : 300);

    return () => clearTimeout(timer);
  }, [code, language, updatePreview, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const isLoading = isExecuting || isGeneratingPreview;

  return (
    <div className="flex flex-col h-full bg-zinc-950 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3 bg-zinc-900/30 backdrop-blur-md border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <Eye size={14} className="text-indigo-400" />
            Live Preview
          </div>
          {language.id === 'dart' && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full text-[9px] font-bold border border-indigo-500/20 animate-pulse">
              <Sparkles size={10} />
              AI Render
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {language.id === 'dart' && (
            <button 
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-xl transition-all disabled:opacity-50"
              title="Regenerate Preview"
            >
              <RefreshCw size={14} className={cn(isGeneratingPreview && "animate-spin")} />
            </button>
          )}

          <div className="flex items-center gap-1 bg-zinc-950/50 p-1 rounded-xl border border-zinc-800">
            <button 
              onClick={() => setDevice('desktop')}
              className={cn("p-2 rounded-lg transition-all", device === 'desktop' ? "bg-zinc-800 text-zinc-100 shadow-lg" : "text-zinc-500 hover:text-zinc-300")}
            >
              <Monitor size={14} />
            </button>
            <button 
              onClick={() => setDevice('tablet')}
              className={cn("p-2 rounded-lg transition-all", device === 'tablet' ? "bg-zinc-800 text-zinc-100 shadow-lg" : "text-zinc-500 hover:text-zinc-300")}
            >
              <Tablet size={14} />
            </button>
            <button 
              onClick={() => setDevice('mobile')}
              className={cn("p-2 rounded-lg transition-all", device === 'mobile' ? "bg-zinc-800 text-zinc-100 shadow-lg" : "text-zinc-500 hover:text-zinc-300")}
            >
              <Smartphone size={14} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-4 md:p-8 flex items-center justify-center bg-zinc-900/10 overflow-hidden">
        <div 
          className={cn(
            "transition-all duration-500 relative group shrink-0",
            device === 'desktop' && "w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-zinc-800/50",
            device === 'tablet' && "w-[768px] max-w-full h-[1024px] max-h-full bg-zinc-900 rounded-[3rem] p-4 shadow-2xl border-[8px] border-zinc-800 flex flex-col",
            device === 'mobile' && "w-[375px] max-w-full h-[812px] max-h-full bg-zinc-900 rounded-[3.5rem] p-3 shadow-2xl border-[10px] border-zinc-800 flex flex-col"
          )}
          style={device !== 'desktop' ? { aspectRatio: device === 'tablet' ? '3/4' : '9/19.5' } : {}}
        >
          {/* Desktop Browser Chrome */}
          {device === 'desktop' && (
            <div className="h-8 bg-zinc-100 border-b border-zinc-200 flex items-center px-4 gap-1.5 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <div className="ml-4 flex-1 h-5 bg-white rounded-md border border-zinc-200 flex items-center px-2">
                <div className="w-2 h-2 rounded-full bg-zinc-200 mr-2" />
                <div className="h-2 w-32 bg-zinc-100 rounded" />
              </div>
            </div>
          )}

          {/* iPhone Dynamic Island */}
          {device === 'mobile' && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[28%] h-[3.5%] bg-black rounded-full z-50 flex items-center justify-between px-[4%]">
              <div className="w-[10%] aspect-square bg-zinc-800 rounded-full" />
              <div className="w-[30%] h-[15%] bg-zinc-800 rounded-full" />
            </div>
          )}

          {/* iPad Top Bar */}
          {device === 'tablet' && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-zinc-700 rounded-full z-50" />
          )}

          <div className={cn(
            "relative w-full h-full overflow-hidden bg-white flex-1",
            device === 'desktop' ? "" : "rounded-[2.5rem]",
            device === 'tablet' && "rounded-[2rem]"
          )}>
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-zinc-950/90 backdrop-blur-sm z-50">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-indigo-500 rounded-full blur opacity-20 animate-pulse"></div>
                    <Loader2 size={32} className="text-indigo-500 animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                      {isGeneratingPreview ? 'AI Rendering Engine' : 'Compiling Source'}
                    </p>
                    <p className="text-[10px] text-zinc-600 mt-1">
                      {isGeneratingPreview ? 'Generating high-fidelity UI...' : 'Updating viewport...'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <iframe
                title="preview"
                srcDoc={srcDoc}
                className="w-full h-full border-none bg-white"
                sandbox="allow-scripts allow-modals allow-forms"
              />
            )}
          </div>

          {/* iPhone Bottom Indicator */}
          {device === 'mobile' && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[35%] h-[0.5%] bg-zinc-300/20 rounded-full z-50" />
          )}
          
          {/* iPad Bottom Indicator */}
          {device === 'tablet' && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[20%] h-[0.4%] bg-zinc-300/20 rounded-full z-50" />
          )}
        </div>
      </div>
    </div>
  );
};
