import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { SharedGrave } from '../types';
import { Link } from 'react-router-dom';
import { MessageSquare, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SharedGravesViewerProps {
  onSelectGrave: (graveId: string) => void;
}

export const SharedGravesViewer: React.FC<SharedGravesViewerProps> = ({ onSelectGrave }) => {
  const { user } = useAuth();
  const [sharedGraves, setSharedGraves] = useState<SharedGrave[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    const sharedRef = collection(db, 'users', user.uid, 'shared_graves');
    const q = query(sharedRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const graves = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SharedGrave));
      setSharedGraves(graves);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading || sharedGraves.length === 0) return null;

  // Group by username
  const groupedGraves = sharedGraves.reduce((acc, grave) => {
    if (!acc[grave.fromUsername]) {
      acc[grave.fromUsername] = [];
    }
    acc[grave.fromUsername].push(grave);
    return acc;
  }, {} as Record<string, SharedGrave[]>);

  const toggleUser = (username: string) => {
    setExpandedUser(prev => prev === username ? null : username);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <MessageSquare className="w-5 h-5 text-zinc-400" />
        <h2 className="text-xl font-bold font-sans text-zinc-300">
          Chats & Shared Graves
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
      </div>
      
      <div className="space-y-3">
        {Object.entries(groupedGraves).map(([username, graves]: [string, SharedGrave[]]) => {
          const isExpanded = expandedUser === username;
          return (
            <div key={username} className="bg-surface/30 border border-zinc-800/50 rounded-xl overflow-hidden">
              <button 
                onClick={() => toggleUser(username)}
                className="w-full p-4 flex items-center justify-between hover:bg-black/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center font-mono text-zinc-400">
                    {username.substring(0,2).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-zinc-200">@{username}</h3>
                    <p className="text-xs text-zinc-500 font-mono">
                      {graves.length} shared {graves.length === 1 ? 'grave' : 'graves'}
                    </p>
                  </div>
                </div>
                {isExpanded ? <ChevronDown size={20} className="text-zinc-500" /> : <ChevronRight size={20} className="text-zinc-500" />}
              </button>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 border-t border-zinc-800/50 space-y-3 max-h-60 overflow-y-auto custom-scrollbar bg-black/20">
                      {graves.map(share => (
                        <div 
                          key={share.id} 
                          className="p-3 border border-[#c53030]/20 bg-zinc-900/50 rounded-lg flex items-center justify-between hover:bg-black/60 transition-colors cursor-pointer mt-3"
                          onClick={() => onSelectGrave(share.graveId)}
                        >
                          <div>
                            <h4 className="font-bold text-zinc-200 truncate">{share.graveName}</h4>
                            <p className="text-[10px] text-zinc-500 font-mono mt-1">
                              Shared on {new Date(share.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-xl opacity-80">🪦</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
