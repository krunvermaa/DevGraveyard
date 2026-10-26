import React, { useRef, useState, useEffect } from 'react';
import { Grave } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check } from "lucide-react";
import { Download, Share2, X, Loader2, Image as ImageIcon } from 'lucide-react';

interface ShareCardModalProps {
  grave: Grave;
  respects: number;
  eulogiesCount: number;
  graveOwnerUsername: string | null;
  onClose: () => void;
}

const THEMES = {
  'minimal-noir': {
    name: 'Minimal Noir',
    bg: '#050505',
    cardBg: 'bg-zinc-950',
    border: 'border-zinc-800/60',
    shadow: 'shadow-[0_0_50px_rgba(0,0,0,0.5)]',
    glow: 'from-zinc-500/10 to-transparent',
    accentText: 'text-zinc-300',
    accentBg: 'bg-zinc-800/50',
    accentBorder: 'border-zinc-700/50',
    textMain: 'text-white',
    textSub: 'text-zinc-400',
  },
  'neon-cyberpunk': {
    name: 'Cyberpunk',
    bg: '#0a0a0a',
    cardBg: 'bg-black',
    border: 'border-[#00ffcc]/40',
    shadow: 'shadow-[0_0_50px_rgba(0,255,204,0.15)]',
    glow: 'from-[#ff00ff]/20 via-[#00ffcc]/5 to-transparent',
    accentText: 'text-[#00ffcc]',
    accentBg: 'bg-[#ff00ff]/10',
    accentBorder: 'border-[#ff00ff]/30',
    textMain: 'text-white',
    textSub: 'text-zinc-300',
  },
  'moonlit': {
    name: 'Moonlit',
    bg: '#060a14',
    cardBg: 'bg-[#0b1221]',
    border: 'border-blue-500/30',
    shadow: 'shadow-[0_0_50px_rgba(59,130,246,0.15)]',
    glow: 'from-blue-500/10 to-transparent',
    accentText: 'text-blue-300',
    accentBg: 'bg-blue-900/30',
    accentBorder: 'border-blue-500/30',
    textMain: 'text-blue-50',
    textSub: 'text-blue-200/70',
  }
};

export const ShareCardModal: React.FC<ShareCardModalProps> = ({ grave, respects, eulogiesCount, graveOwnerUsername, onClose }) => {
  const [theme, setTheme] = useState<keyof typeof THEMES>('minimal-noir');
  const [format, setFormat] = useState<'instagram' | 'twitter'>('instagram'); // instagram: 1080x1080, twitter: 1200x630
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const qrUrl = `${window.location.origin}/#/grave/${grave.id}`;

  const currentTheme = THEMES[theme];
  const isInsta = format === 'instagram';
  const width = isInsta ? 1080 : 1200;
  const height = isInsta ? 1080 : 630;

  const generatePreview = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 1, // scale 1 is enough for preview, we scale up for download
        backgroundColor: currentTheme.bg,
        logging: false,
        useCORS: true,
      });
      setPreviewUrl(canvas.toDataURL('image/jpeg', 0.8));
    } catch (err) {
      console.error("Failed to generate preview:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    // Small delay to ensure DOM is ready and fonts are loaded before generating preview
    const timeout = setTimeout(() => {
      generatePreview();
    }, 300);
    return () => clearTimeout(timeout);
  }, [theme, format]);

  const generateHighResBlob = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // High res for export
        backgroundColor: currentTheme.bg,
        logging: false,
        useCORS: true,
      });
      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png');
      });
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const handleCopySnippet = async () => {
    const snippet = `🪦 RIP ${grave.project_name}\n\n` +
      `💀 Cause of Death: ${grave.cause_of_death}\n` +
      `⏳ Lived For: ${grave.lived_for || 'Unknown'}\n` +
      `🛠️ Tech Stack: ${grave.tech_stack || 'Unknown'}\n\n` +
      `"${grave.lesson_learned}"\n\n` +
      `Laid to rest by @${graveOwnerUsername || 'Unknown Developer'}\n` +
      `Pay your respects: ${qrUrl}`;
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(snippet);
        setCopiedSnippet(true);
        setTimeout(() => setCopiedSnippet(false), 2000);
      } else {
        // Fallback for older browsers or restricted iframes
        const textArea = document.createElement("textarea");
        textArea.value = snippet;
        // Move outside of screen to make it invisible
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          setCopiedSnippet(true);
          setTimeout(() => setCopiedSnippet(false), 2000);
        } catch (err) {
          console.error('Fallback: Oops, unable to copy', err);
        }
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    const blob = await generateHighResBlob();
    setIsGenerating(false);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RIP-${grave.project_name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleNativeShare = async () => {
    try {
      setIsGenerating(true);
      const blob = await generateHighResBlob();
      setIsGenerating(false);
      if (!blob) return;
      const file = new File([blob], `RIP-${grave.project_name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`, { type: 'image/png' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `RIP ${grave.project_name}`,
          text: `A resting place for ${grave.project_name}. Check out my developer graveyard.`
        });
      } else if (navigator.share) {
         // Fallback to sharing just text if files aren't supported
         await navigator.share({
            title: `RIP ${grave.project_name}`,
            text: `A resting place for ${grave.project_name}. Check out my developer graveyard.`,
            url: qrUrl,
         });
      } else {
         alert("Native share is not supported by your browser. Please use the download button.");
      }
    } catch (err: any) {
      console.log('Error sharing', err);
      if (err.name !== 'AbortError') {
         alert("Share failed. Your browser might block sharing after a delay. Try downloading instead.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]"
      >
        {/* Left Side: Preview Area */}
        <div className="flex-1 bg-zinc-900/50 p-6 flex flex-col items-center justify-center min-h-[300px] border-b md:border-b-0 md:border-r border-zinc-800 relative overflow-hidden">
           {isGenerating && !previewUrl && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 z-10">
               <Loader2 className="w-8 h-8 text-zinc-400 animate-spin mb-4" />
               <span className="text-sm font-mono text-zinc-500 uppercase tracking-widest">Rendering Tombstone...</span>
             </div>
           )}
           
           <div className="w-full max-w-md aspect-square flex items-center justify-center relative">
             {previewUrl ? (
               <img 
                 src={previewUrl} 
                 alt="Share Card Preview" 
                 className={`w-full h-auto max-h-[50vh] object-contain shadow-2xl rounded-lg border border-zinc-800 transition-opacity duration-300 ${isGenerating ? 'opacity-50' : 'opacity-100'}`} 
               />
             ) : (
                <div className="w-full aspect-square bg-zinc-900 animate-pulse rounded-lg border border-zinc-800" />
             )}
           </div>
        </div>

        {/* Right Side: Controls */}
        <div className="w-full md:w-80 p-6 flex flex-col gap-6 bg-zinc-950 overflow-y-auto custom-scrollbar">
           <div className="flex items-center justify-between">
             <h3 className="text-lg font-bold font-sans text-white">Export Card</h3>
             <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors">
               <X className="w-5 h-5" />
             </button>
           </div>

           <div className="space-y-3">
             <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Format</label>
             <div className="grid grid-cols-2 gap-2">
               <button 
                 onClick={() => setFormat('instagram')}
                 className={`py-2 px-3 rounded-lg border text-xs font-mono transition-all ${format === 'instagram' ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'}`}
               >
                 Instagram (1:1)
               </button>
               <button 
                 onClick={() => setFormat('twitter')}
                 className={`py-2 px-3 rounded-lg border text-xs font-mono transition-all ${format === 'twitter' ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'}`}
               >
                 Social (1.91:1)
               </button>
             </div>
           </div>

           <div className="space-y-3">
             <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Theme</label>
             <div className="flex flex-col gap-2">
               {Object.entries(THEMES).map(([key, t]) => (
                 <button 
                   key={key}
                   onClick={() => setTheme(key as keyof typeof THEMES)}
                   className={`w-full py-2.5 px-4 rounded-lg border flex items-center justify-between transition-all ${theme === key ? 'border-white bg-zinc-900' : 'border-zinc-800 bg-black hover:border-zinc-600'}`}
                 >
                   <span className="text-sm font-sans text-white">{t.name}</span>
                   <div className="flex gap-1">
                     <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.bg }} />
                     <div className={`w-3 h-3 rounded-full ${t.accentBg}`} />
                   </div>
                 </button>
               ))}
             </div>
           </div>

           <div className="mt-auto pt-6 space-y-3">
             <button 
               onClick={handleDownload}
               disabled={isGenerating}
               className="w-full flex items-center justify-center gap-2 bg-white text-black py-3 rounded-lg font-mono text-sm hover:bg-zinc-200 transition-colors disabled:opacity-50"
             >
               {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
               Download Image
             </button>
             <button 
               onClick={handleNativeShare}
               disabled={isGenerating}
               className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white border border-zinc-800 py-3 rounded-lg font-mono text-sm hover:bg-zinc-800 hover:border-zinc-700 transition-colors disabled:opacity-50"
             >
               <Share2 className="w-4 h-4" />
               Share via OS
             </button>
             <button 
               onClick={handleCopySnippet}
               disabled={isGenerating}
               className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white border border-zinc-800 py-3 rounded-lg font-mono text-sm hover:bg-zinc-800 hover:border-zinc-700 transition-colors disabled:opacity-50"
             >
               {copiedSnippet ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
               {copiedSnippet ? "Copied Epitaph!" : "Copy Epitaph Snippet"}
             </button>
           </div>
        </div>
      </motion.div>

      {/* Hidden Render Node */}
      <div 
        className="fixed left-[-9999px] top-[-9999px] z-[-1] pointer-events-none"
        style={{ width: `${width}px`, height: `${height}px`, backgroundColor: currentTheme.bg }}
      >
        <div ref={cardRef} className="w-full h-full relative flex flex-col items-center justify-center p-12" style={{ backgroundColor: currentTheme.bg }}>
           {/* Background Effects */}
           <div className={`absolute inset-0 ${currentTheme.glow}  opacity-60`} />
           
           <div className={`relative w-full h-full ${currentTheme.cardBg} border ${currentTheme.border} ${currentTheme.shadow} rounded-3xl p-10 flex ${isInsta ? 'flex-col items-center text-center' : 'flex-row items-center justify-between text-left'} gap-8 overflow-hidden `}>
              
              {/* Noise overlay removed to prevent html2canvas errors */}

              <div className={`relative z-10 flex flex-col ${isInsta ? 'items-center' : 'items-start'} flex-1 w-full h-full justify-center gap-4`}>
                 <div className={`inline-flex px-4 py-1.5 rounded-full border ${currentTheme.accentBorder} ${currentTheme.accentBg} ${currentTheme.accentText} text-sm font-mono uppercase tracking-[0.2em]`}>
                   {grave.cause_of_death}
                 </div>
                 
                 <div className="space-y-2 mt-2 w-full">
                   <h2 className={`${isInsta ? 'text-5xl' : 'text-6xl'} font-bold ${currentTheme.textMain} font-sans tracking-tight leading-tight  overflow-hidden text-ellipsis max-h-[140px]`}>
                     {grave.project_name}
                   </h2>
                   {graveOwnerUsername && (
                     <p className={`text-lg font-mono ${currentTheme.accentText} opacity-80 uppercase tracking-widest`}>
                       Laid to rest by @{graveOwnerUsername}
                     </p>
                   )}
                 </div>

                 <p className={`text-xl ${currentTheme.textMain} font-serif italic leading-relaxed opacity-90 max-w-2xl overflow-hidden text-ellipsis max-h-[96px] my-2`}>
                   "{grave.lesson_learned}"
                 </p>

                 <div className={`flex flex-col w-full gap-4 mt-auto`}>
                   <div className={`flex flex-wrap ${isInsta ? 'justify-center' : 'justify-start'} gap-4`}>
                     <div className="flex flex-col gap-1 border border-zinc-800/50 bg-black/20 px-3 py-1.5 rounded-lg">
                       <span className={`text-xs ${currentTheme.textSub} font-mono uppercase tracking-widest`}>Lived For</span>
                       <span className={`text-lg ${currentTheme.textMain} font-mono`}>{grave.lived_for || "Unknown"}</span>
                     </div>
                     <div className="flex flex-col gap-1 border border-zinc-800/50 bg-black/20 px-3 py-1.5 rounded-lg max-w-[200px] overflow-hidden">
                       <span className={`text-xs ${currentTheme.textSub} font-mono uppercase tracking-widest`}>Tech Stack</span>
                       <span className={`text-lg ${currentTheme.accentText} font-mono font-medium truncate`}>{grave.tech_stack || "Unknown"}</span>
                     </div>
                   </div>
                   
                   <div className={`flex ${isInsta ? 'justify-center' : 'justify-start'} gap-4 mt-2`}>
                     <div className={`flex items-center gap-3 bg-[#c53030]/10 border border-[#c53030]/30 px-3 py-1.5 rounded-lg shadow-inner`}>
                       <span className={`text-lg text-[#c53030]`}>🌹</span>
                       <div className="flex flex-col">
                         <span className={`text-[9px] text-[#c53030] font-mono uppercase tracking-widest font-bold`}>RIPs</span>
                         <span className={`text-xl ${currentTheme.textMain} font-mono leading-none`}>{respects}</span>
                       </div>
                     </div>
                     <div className={`flex items-center gap-3 bg-zinc-800/30 border border-zinc-700/50 px-3 py-1.5 rounded-lg shadow-inner`}>
                       <span className={`text-lg text-zinc-400`}>📜</span>
                       <div className="flex flex-col">
                         <span className={`text-[9px] ${currentTheme.textSub} font-mono uppercase tracking-widest font-bold`}>Eulogies</span>
                         <span className={`text-xl ${currentTheme.textMain} font-mono leading-none`}>{eulogiesCount}</span>
                       </div>
                     </div>
                   </div>
                 </div>
              </div>

              <div className={`relative z-10 flex flex-col items-center gap-3 ${isInsta ? 'mt-4 border-t border-zinc-800/50 pt-6 w-full' : 'pl-6 border-l border-zinc-800/50 shrink-0 h-full justify-center'}`}>
                 <div className="p-3 bg-white rounded-xl shadow-xl">
                   <QRCodeSVG value={qrUrl} size={isInsta ? 140 : 180} level="H" includeMargin={true} fgColor="#000000" bgColor="#ffffff" />
                 </div>
                 <div className={`font-mono text-[10px] ${currentTheme.textSub} uppercase tracking-widest flex flex-col items-center text-center gap-1 mt-2`}>
                   <span className="text-xl" role="img" aria-label="grave">🪦</span> 
                   <span>Dev Graveyard</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
