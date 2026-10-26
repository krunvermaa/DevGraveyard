import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, doc, query, orderBy, limit, onSnapshot, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Trash2 } from 'lucide-react';

interface Confession {
  id: string;
  text: string;
  color: string;
  rotation: number;
  createdAt: number;
  
}

const COLORS = [
  '#3f3f46', // zinc-700
  '#52525b', // zinc-600
  '#44403c', // stone-700
  '#57534e', // stone-600
  '#334155', // slate-700
  '#475569', // slate-600
];

const PROFANITY_REGEX = /fuck|shit|bitch|asshole|cunt|dick|pussy|whore|slut/i;

const BatsAnimation = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{
            x: -100,
            y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : 500,
            scale: Math.random() * 0.5 + 0.5,
            opacity: 0,
          }}
          animate={{
            x: typeof window !== 'undefined' ? window.innerWidth + 100 : 1000,
            y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : 500,
            opacity: [0, 0.6, 0.6, 0],
          }}
          transition={{
            duration: Math.random() * 8 + 6,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: "easeInOut",
          }}
        >
          <span className="text-4xl grayscale opacity-30 drop-shadow-md inline-block" style={{ transform: 'scaleX(-1)' }}>🦇</span>
        </motion.div>
      ))}
    </div>
  );
};

export const Confessions: React.FC = () => {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [myConfessionIds, setMyConfessionIds] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedIds = localStorage.getItem('my_confession_ids');
    if (savedIds) {
      setMyConfessionIds(JSON.parse(savedIds));
    }

    const q = query(
      collection(db, 'confessions'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          text: d.text,
          color: d.color || COLORS[0],
          rotation: d.rotation || 0,
          createdAt: d.createdAt?.toMillis() || Date.now()
        } as Confession;
      });
      setConfessions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'confessions', id));
      const newIds = myConfessionIds.filter(i => i !== id);
      setMyConfessionIds(newIds);
      localStorage.setItem('my_confession_ids', JSON.stringify(newIds));
    } catch (err) {
      console.error("Failed to delete confession", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    if (text.length > 140) {
      setError("Maximum 140 characters allowed.");
      return;
    }

    if (PROFANITY_REGEX.test(text)) {
      setError("Please keep it clean.");
      return;
    }

    // Rate limit check: 2 per hour
    const now = Date.now();
    const historyStr = localStorage.getItem('confession_history');
    let history: number[] = historyStr ? JSON.parse(historyStr) : [];
    
    // filter out older than 1 hour
    history = history.filter(t => now - t < 60 * 60 * 1000);
    
    if (history.length >= 2) {
      setError("You can only confess twice per hour.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      // Random rotation between -6 and 6 degrees for more realism
      const rotation = Math.random() * 12 - 6;

      const docRef = await addDoc(collection(db, 'confessions'), {
        text: text.trim(),
        color,
        rotation,
        createdAt: serverTimestamp()
      });

      history.push(now);
      localStorage.setItem('confession_history', JSON.stringify(history));
      
      const newIds = [...myConfessionIds, docRef.id];
      setMyConfessionIds(newIds);
      localStorage.setItem('my_confession_ids', JSON.stringify(newIds));

      setText('');
    } catch (err) {
      console.error(err);
      setError("Failed to submit confession.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full p-4 relative overflow-hidden flex flex-col items-center">
      {/* Dark Haunted Wall Background */}
      <div className="fixed inset-0 z-[-2] bg-[#0a0a0c]" />
      <div 
        className="fixed inset-0 z-[-1]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.15\'/%3E%3C/svg%3E")',
        }}
      />
      
      {/* Large Wall Cracks Overlay */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none opacity-20 z-[-1]" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M15,0 L20,15 L10,30 L18,50 L12,75 L25,100" fill="none" stroke="#000" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M85,0 L78,25 L88,45 L75,65 L82,100" fill="none" stroke="#000" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M35,20 L48,28 L42,45 L55,55 L48,78 L38,85" fill="none" stroke="#000" strokeWidth="0.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M0,40 L15,48 L8,65 L22,70" fill="none" stroke="#000" strokeWidth="0.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M100,30 L85,40 L92,55 L78,65" fill="none" stroke="#000" strokeWidth="0.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* Fog effects */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
      <BatsAnimation />

      <div className="w-full max-w-2xl mx-auto mb-16 mt-8 relative z-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold font-serif text-white mb-4 tracking-widest uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] border-b border-white/10 pb-6 inline-block">
          Confessions
        </h1>
        <p className="text-zinc-400 text-sm font-mono uppercase tracking-widest max-w-md mx-auto leading-relaxed">
          Anonymous developer secrets. Max 140 characters. 2 posts per hour.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-left bg-zinc-950/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#c53030]/50 to-transparent" />
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setError(null);
              }}
              maxLength={140}
              placeholder="I pushed to production on Friday at 5 PM..."
              className="w-full h-28 bg-black/60 border border-zinc-800 rounded-2xl p-5 text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-[#c53030]/50 transition-colors resize-none font-mono text-base shadow-inner"
            />
            <span className={`absolute bottom-4 right-4 text-xs font-mono font-bold ${text.length > 130 ? 'text-[#c53030]' : 'text-zinc-600'}`}>
              {text.length}/140
            </span>
          </div>

          {error && (
            <p className="text-[#c53030] text-xs font-mono text-center bg-[#c53030]/10 py-2.5 rounded-xl border border-[#c53030]/20">{error}</p>
          )}

          <button
            type="submit"
            disabled={!text.trim() || submitting}
            className="w-full py-4 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-2xl font-mono uppercase tracking-widest hover:bg-zinc-800 hover:text-white hover:border-[#c53030]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-bold shadow-lg"
          >
            {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
            Bury Confession
          </button>
        </form>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 pb-20 relative z-10">
        {loading ? (
          <div className="flex justify-center pt-20">
            <Loader2 className="w-10 h-10 text-zinc-500 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 lg:gap-12">
            <AnimatePresence>
              {confessions.map((confession, index) => {
                const isMine = myConfessionIds.includes(confession.id);
                
                // Pseudo-random offsets based on index for disorganized look
                const offsetX = Math.sin(index * 1.5) * 40;
                const offsetY = Math.cos(index * 2.3) * 40;
                
                // Enhance rotation for a more chaotic feel, bounded between -15 and 15
                const extraRot = Math.sin(index) * 10;
                const finalRotation = Math.max(-15, Math.min(15, confession.rotation + extraRot));

                return (
                  <motion.div
                    key={confession.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8, x: offsetX, y: offsetY + 20 }}
                    animate={{ opacity: 1, scale: 1, x: offsetX, y: offsetY }}
                    exit={{ 
                      opacity: 0, 
                      scale: 1.1, 
                      rotate: finalRotation + (index % 2 === 0 ? 25 : -25),
                      skewX: index % 2 === 0 ? 15 : -15,
                      skewY: index % 2 === 0 ? -10 : 10,
                      y: offsetY + 200,
                      x: offsetX + (index % 2 === 0 ? 40 : -40),
                      filter: "blur(8px)",
                      transition: { duration: 0.6, ease: [0.32, 0, 0.67, 0] }
                    }}
                    style={{
                      rotate: `${finalRotation}deg`,
                    }}
                    className="p-4 sm:p-6 w-48 sm:w-64 flex flex-col justify-center items-center relative transform transition-all duration-500 hover:scale-[1.1] hover:!rotate-0 hover:z-30 group min-h-[160px]"
                  >
                    <div 
                      className="animate-ghost-flicker flex flex-col justify-center items-center w-full h-full"
                      style={{ animationDelay: `${(index % 7) * 0.7}s` }}
                    >
                      {isMine && (
                        <button 
                          onClick={() => handleDelete(confession.id)}
                          className="absolute top-0 right-0 p-2 bg-black/80 rounded-full text-zinc-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 z-10 shadow-xl border border-zinc-800 backdrop-blur-sm"
                          title="Delete your confession"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      
                      <p className="font-['Averia_Serif_Libre'] text-base sm:text-lg leading-relaxed whitespace-pre-wrap break-words text-center text-zinc-300 opacity-80 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] mix-blend-lighten z-10 relative">
                        {confession.text}
                      </p>
                      
                      {/* Date */}
                      <div className="mt-4 text-[9px] sm:text-[10px] text-zinc-500/60 font-mono tracking-widest uppercase drop-shadow-md z-10 relative">
                        {new Date(confession.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
