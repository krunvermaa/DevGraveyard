import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { SharedGrave } from '../types';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  X, 
  Loader2, 
  Clock, 
  Users, 
  List, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Ghost 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NormalizedDispatch extends SharedGrave {
  direction: 'sent' | 'received';
  friendUsername: string;
  friendUid: string;
}

interface SharedGravesViewerProps {
  onSelectGrave: (graveId: string) => void;
  loadingGraveId?: string | null;
}

function formatDispatchDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  } catch {
    return dateStr;
  }
}

function getInitials(username: string): string {
  if (!username) return '??';
  const clean = username.replace(/^@/, '').trim();
  if (!clean) return '??';
  if (clean.length === 1) return clean.toUpperCase();
  return clean.substring(0, 2).toUpperCase();
}

export const SharedGravesViewer: React.FC<SharedGravesViewerProps> = ({ 
  onSelectGrave, 
  loadingGraveId 
}) => {
  const { user } = useAuth();
  const [dispatches, setDispatches] = useState<NormalizedDispatch[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & display state
  const [activeTab, setActiveTab] = useState<'all' | 'received' | 'sent'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grouped'>('list');
  const [collapsedUsers, setCollapsedUsers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const sharedRef = collection(db, 'users', user.uid, 'shared_graves');
    
    const unsubscribe = onSnapshot(
      sharedRef, 
      (snapshot) => {
        const items: NormalizedDispatch[] = snapshot.docs.map(doc => {
          const data = doc.data() as Omit<SharedGrave, 'id'>;
          
          // Gracefully handle existing records where direction might not be set
          const isSent = data.direction 
            ? data.direction === 'sent' 
            : data.fromUserId === user.uid;

          const direction: 'sent' | 'received' = isSent ? 'sent' : 'received';
          const friendUsername = isSent 
            ? (data.toUsername || 'Friend') 
            : (data.fromUsername || 'Friend');
          const friendUid = isSent 
            ? (data.toUserId || '') 
            : (data.fromUserId || '');

          return {
            id: doc.id,
            ...data,
            direction,
            friendUsername,
            friendUid,
          };
        });

        // Sort descending by createdAt
        items.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });

        setDispatches(items);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching shared graves:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Global counts for tabs and header stats counter
  const stats = useMemo(() => {
    const total = dispatches.length;
    const received = dispatches.filter(d => d.direction === 'received').length;
    const sent = dispatches.filter(d => d.direction === 'sent').length;
    return { total, received, sent };
  }, [dispatches]);

  // Filtered dispatches based on activeTab and searchQuery
  const filteredDispatches = useMemo(() => {
    return dispatches.filter(dispatch => {
      // Tab filter
      if (activeTab === 'received' && dispatch.direction !== 'received') return false;
      if (activeTab === 'sent' && dispatch.direction !== 'sent') return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchGrave = (dispatch.graveName || '').toLowerCase().includes(q);
        const matchFriend = (dispatch.friendUsername || '').toLowerCase().includes(q);
        return matchGrave || matchFriend;
      }
      return true;
    });
  }, [dispatches, activeTab, searchQuery]);

  // Grouped by friend
  const groupedByFriend = useMemo(() => {
    const groups: Record<string, NormalizedDispatch[]> = {};
    for (const item of filteredDispatches) {
      if (!groups[item.friendUsername]) {
        groups[item.friendUsername] = [];
      }
      groups[item.friendUsername].push(item);
    }
    return groups;
  }, [filteredDispatches]);

  const toggleUserCollapse = (username: string) => {
    setCollapsedUsers(prev => ({
      ...prev,
      [username]: !prev[username]
    }));
  };

  if (!user) {
    return (
      <div className="py-16 px-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-center flex flex-col items-center justify-center gap-3">
        <div className="text-3xl">🕯️</div>
        <h3 className="text-lg font-bold font-sans text-zinc-200">Communion Required</h3>
        <p className="text-xs font-mono text-zinc-500">You must be signed in to access your crypt dispatches.</p>
        <Link
          to="/login"
          className="mt-2 px-4 py-2 rounded-xl bg-[#c53030]/20 text-red-300 border border-[#c53030]/40 text-xs font-mono hover:bg-[#c53030]/30 transition-colors uppercase tracking-wider"
        >
          [ Enter the Crypt ]
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
        <Loader2 className="w-8 h-8 text-[#c53030] animate-spin" />
        <p className="text-xs font-mono text-zinc-500 tracking-wider uppercase">
          Summoning crypt dispatches...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Title and Stats Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-red-950/30 border border-red-900/50 flex items-center justify-center text-red-400 shadow-[0_0_20px_rgba(197,48,48,0.2)] shrink-0">
            <MessageSquare className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-sans text-zinc-100 tracking-tight flex items-center gap-2">
              <span>Crypt Dispatches</span>
            </h2>
            <p className="text-xs font-mono text-zinc-500">
              Exchanged tombstones & spectral records between cryptkeepers
            </p>
          </div>
        </div>

        {/* Stats Counter Badges */}
        <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-300 flex items-center gap-2 shadow-sm">
            <span className="text-zinc-500 uppercase tracking-wider text-[10px]">All</span>
            <span className="px-1.5 py-0.5 rounded-md bg-zinc-800 text-white font-bold text-xs">{stats.total}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-red-950/20 border border-red-900/40 text-red-300 flex items-center gap-2 shadow-sm">
            <ArrowDownLeft className="w-3.5 h-3.5 text-red-400" />
            <span className="text-red-400 uppercase tracking-wider text-[10px]">Received</span>
            <span className="px-1.5 py-0.5 rounded-md bg-red-900/40 text-red-200 font-bold text-xs">{stats.received}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-300 flex items-center gap-2 shadow-sm">
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-400 uppercase tracking-wider text-[10px]">Sent</span>
            <span className="px-1.5 py-0.5 rounded-md bg-zinc-800 text-white font-bold text-xs">{stats.sent}</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Filter Tabs, Search & View Toggle */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Tabs / Filter Toggle */}
        <div className="flex items-center gap-1 bg-zinc-950/70 p-1 rounded-xl border border-zinc-800/80 self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-[#c53030]/20 border border-[#c53030]/60 text-white font-bold shadow-[0_0_12px_rgba(197,48,48,0.25)]'
                : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
            }`}
          >
            <span>All Dispatches</span>
            <span className="px-1.5 py-0.2 rounded bg-black/50 text-[10px] text-zinc-300 font-mono">{stats.total}</span>
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'received'
                ? 'bg-[#c53030]/20 border border-[#c53030]/60 text-white font-bold shadow-[0_0_12px_rgba(197,48,48,0.25)]'
                : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-red-400" />
            <span>Received</span>
            <span className="px-1.5 py-0.2 rounded bg-black/50 text-[10px] text-red-300 font-mono">{stats.received}</span>
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sent'
                ? 'bg-[#c53030]/20 border border-[#c53030]/60 text-white font-bold shadow-[0_0_12px_rgba(197,48,48,0.25)]'
                : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
            <span>Sent</span>
            <span className="px-1.5 py-0.2 rounded bg-black/50 text-[10px] text-zinc-300 font-mono">{stats.sent}</span>
          </button>
        </div>

        {/* Search Input & View Mode Switcher */}
        <div className="flex items-center gap-2 flex-1 lg:max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by grave or @username..."
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-9 pr-8 py-2 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#c53030]/70 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white p-0.5 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Mode Toggle: Timeline vs By Friend */}
          <div className="flex items-center bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#c53030]/20 text-white border border-[#c53030]/50'
                  : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
              }`}
              title="Timeline List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grouped')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grouped'
                  ? 'bg-[#c53030]/20 text-white border border-[#c53030]/50'
                  : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
              }`}
              title="Grouped by Friend"
            >
              <Users className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {dispatches.length === 0 ? (
        /* Empty State: Absolutely no dispatches recorded */
        <div className="py-16 px-6 rounded-2xl bg-zinc-950/40 border border-zinc-800/80 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(0,0,0,0.6)]">
            🪦
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-xl font-bold font-sans text-zinc-100">The Crypt Is Silent</h3>
            <p className="text-xs font-mono text-zinc-500 leading-relaxed">
              No dispatches have traversed the veil yet. Visit any tombstone in the cemetery and select "Share with Friend" to dispatch a grave.
            </p>
          </div>
          <Link
            to="/"
            className="mt-2 px-5 py-2.5 rounded-xl bg-[#c53030]/20 text-red-300 border border-[#c53030]/40 text-xs font-mono hover:bg-[#c53030]/30 transition-colors uppercase tracking-widest shadow-[0_0_15px_rgba(197,48,48,0.2)]"
          >
            [ Explore Cemetery Graves ]
          </Link>
        </div>
      ) : filteredDispatches.length === 0 ? (
        /* Filtered Empty State */
        <div className="py-14 px-6 rounded-2xl bg-zinc-950/30 border border-zinc-800/60 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
            <Ghost className="w-6 h-6 text-zinc-600" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="text-base font-bold font-sans text-zinc-200">
              {searchQuery ? 'No Matching Dispatches' : `No ${activeTab === 'received' ? 'Received' : 'Sent'} Dispatches`}
            </h3>
            <p className="text-xs font-mono text-zinc-500 leading-relaxed">
              {searchQuery
                ? `No dispatches match "${searchQuery}". Check your spelling or try another keyword.`
                : activeTab === 'received'
                ? 'No fellow cryptkeepers have dispatched tombs to you yet.'
                : 'You have not dispatched any tombs to comrades yet.'}
            </p>
          </div>
          <button
            onClick={() => { setSearchQuery(''); setActiveTab('all'); }}
            className="mt-2 text-xs font-mono text-red-400 hover:text-red-300 underline underline-offset-4 cursor-pointer"
          >
            Clear filters & view all dispatches
          </button>
        </div>
      ) : viewMode === 'list' ? (
        /* Timeline List View */
        <div className="space-y-3">
          <AnimatePresence>
            {filteredDispatches.map(dispatch => {
              const isLoadingThis = loadingGraveId === dispatch.graveId;
              const isReceived = dispatch.direction === 'received';

              return (
                <motion.div
                  key={dispatch.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  onClick={() => onSelectGrave(dispatch.graveId)}
                  className={`group relative p-4 sm:p-5 rounded-2xl bg-zinc-950/70 border ${
                    isLoadingThis
                      ? 'border-[#c53030] shadow-[0_0_25px_rgba(197,48,48,0.25)] ring-1 ring-[#c53030]'
                      : 'border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/60'
                  } transition-all duration-200 cursor-pointer overflow-hidden backdrop-blur-sm`}
                >
                  {/* Subtle top glow highlight */}
                  <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#c53030]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex flex-col gap-3">
                    {/* Top Row: Avatar + Direction Badge & Timestamp */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 border ${
                          isReceived
                            ? 'bg-red-950/30 border-red-900/50 text-red-300'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                        }`}>
                          {getInitials(dispatch.friendUsername)}
                        </div>

                        {/* Direction badge with friend handle link */}
                        {isReceived ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-[#c53030]/10 text-red-300 border border-[#c53030]/30">
                            <ArrowDownLeft className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            <span>Received from</span>
                            <Link
                              to={`/user/${dispatch.friendUsername}`}
                              onClick={e => e.stopPropagation()}
                              className="font-bold underline decoration-red-900/60 hover:text-white transition-colors"
                            >
                              @{dispatch.friendUsername}
                            </Link>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-zinc-900 text-zinc-300 border border-zinc-700/60">
                            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span>Sent to</span>
                            <Link
                              to={`/user/${dispatch.friendUsername}`}
                              onClick={e => e.stopPropagation()}
                              className="font-bold underline decoration-zinc-700 hover:text-white transition-colors"
                            >
                              @{dispatch.friendUsername}
                            </Link>
                          </div>
                        )}
                      </div>

                      <div 
                        className="flex items-center gap-1 text-[11px] font-mono text-zinc-500" 
                        title={dispatch.createdAt ? new Date(dispatch.createdAt).toLocaleString() : ''}
                      >
                        <Clock className="w-3 h-3 text-zinc-600" />
                        <span>{formatDispatchDate(dispatch.createdAt)}</span>
                      </div>
                    </div>

                    {/* Middle Row: Project Grave Name */}
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform">🪦</span>
                        <h3 className="text-lg sm:text-xl font-bold font-sans text-zinc-100 group-hover:text-red-300 transition-colors truncate">
                          {dispatch.graveName}
                        </h3>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5 text-xs font-mono text-zinc-500 group-hover:text-red-400 transition-colors">
                        {isLoadingThis ? (
                          <span className="flex items-center gap-1.5 text-red-400 font-mono">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Summoning...</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <span>Inspect Grave</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        /* Grouped by Friend View */
        <div className="space-y-4">
          {Object.entries(groupedByFriend).map(([username, friendDispatches]: [string, NormalizedDispatch[]]) => {
            const isCollapsed = collapsedUsers[username] || false;
            const receivedCount = friendDispatches.filter(d => d.direction === 'received').length;
            const sentCount = friendDispatches.filter(d => d.direction === 'sent').length;

            return (
              <div 
                key={username} 
                className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl overflow-hidden backdrop-blur-sm"
              >
                {/* Group Accordion Header */}
                <button
                  onClick={() => toggleUserCollapse(username)}
                  className="w-full p-4 flex items-center justify-between hover:bg-zinc-900/50 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center font-mono font-bold text-sm text-zinc-300 shrink-0">
                      {getInitials(username)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/user/${username}`}
                          onClick={e => e.stopPropagation()}
                          className="font-bold text-base text-zinc-100 hover:text-red-300 transition-colors truncate"
                        >
                          @{username}
                        </Link>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mt-0.5">
                        <span>{friendDispatches.length} {friendDispatches.length === 1 ? 'dispatch' : 'dispatches'}</span>
                        <span>•</span>
                        {receivedCount > 0 && (
                          <span className="text-red-400">↓ {receivedCount} received</span>
                        )}
                        {receivedCount > 0 && sentCount > 0 && <span>•</span>}
                        {sentCount > 0 && (
                          <span className="text-zinc-400">↑ {sentCount} sent</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-zinc-500 group-hover:text-zinc-300 transition-colors p-1">
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                {/* Sub-items list */}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-1 border-t border-zinc-800/60 space-y-2.5 bg-black/20">
                        {friendDispatches.map(dispatch => {
                          const isLoadingThis = loadingGraveId === dispatch.graveId;
                          const isReceived = dispatch.direction === 'received';

                          return (
                            <div
                              key={dispatch.id}
                              onClick={() => onSelectGrave(dispatch.graveId)}
                              className={`p-3.5 rounded-xl border ${
                                isLoadingThis
                                  ? 'border-[#c53030] bg-[#c53030]/10'
                                  : 'border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900 transition-colors'
                              } flex items-center justify-between gap-3 cursor-pointer group/item`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="text-xl shrink-0 group-hover/item:scale-110 transition-transform">🪦</span>
                                <div className="min-w-0">
                                  <h4 className="font-bold text-sm sm:text-base text-zinc-200 group-hover/item:text-red-300 transition-colors truncate">
                                    {dispatch.graveName}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {isReceived ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-red-400">
                                        <ArrowDownLeft className="w-3 h-3" />
                                        <span>Received</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-400">
                                        <ArrowUpRight className="w-3 h-3" />
                                        <span>Sent</span>
                                      </span>
                                    )}
                                    <span className="text-[10px] text-zinc-600 font-mono">•</span>
                                    <span className="text-[10px] text-zinc-500 font-mono">
                                      {formatDispatchDate(dispatch.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="shrink-0 text-xs font-mono text-zinc-500 group-hover/item:text-red-400 transition-colors flex items-center gap-1">
                                {isLoadingThis ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
                                ) : (
                                  <span>View →</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};