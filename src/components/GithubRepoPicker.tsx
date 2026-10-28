import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auth, githubProvider } from '../firebase';
import {
  linkWithPopup,
  signInWithPopup,
  GithubAuthProvider,
  getAdditionalUserInfo
} from 'firebase/auth';
import {
  GitBranch,
  Search,
  Loader2,
  RefreshCw,
  Check,
  Unlink,
  ChevronDown,
  ChevronUp,
  Star,
  AlertCircle
} from 'lucide-react';

export const STORAGE_KEY_GH_TOKEN = 'devgraveyard_gh_token';
export const STORAGE_KEY_GH_USERNAME = 'devgraveyard_gh_username';
export const STORAGE_KEY_GH_REPOS_CACHE = 'devgraveyard_gh_repos_cache';

export interface Repo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  updated_at: string;
}

interface GithubRepoPickerProps {
  onSelectRepo: (repoUrl: string, repoName: string, language: string | null) => void;
  selectedUrl?: string;
}

export const GithubRepoPicker: React.FC<GithubRepoPickerProps> = ({ onSelectRepo, selectedUrl }) => {
  const { user } = useAuth();

  // Initialize from localStorage for zero-flash initial render
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_GH_TOKEN);
    } catch {
      return null;
    }
  });

  const [username, setUsername] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_GH_USERNAME);
    } catch {
      return null;
    }
  });

  const [repos, setRepos] = useState<Repo[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_GH_REPOS_CACHE);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleDisconnect = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY_GH_TOKEN);
      localStorage.removeItem(STORAGE_KEY_GH_USERNAME);
      localStorage.removeItem(STORAGE_KEY_GH_REPOS_CACHE);
    } catch {}
    setToken(null);
    setUsername(null);
    setRepos([]);
    setError(null);
  }, []);

  const syncRepos = useCallback(async (tokenToUse: string, isInitial: boolean) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setIsSyncing(true);
    }
    setError(null);

    try {
      // 1. Validate token & fetch profile if username not saved
      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokenToUse}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (userRes.status === 401 || userRes.status === 403) {
        handleDisconnect();
        setError('GitHub session expired or invalid. Please reconnect to sync repositories.');
        return;
      }

      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData?.login) {
          setUsername(userData.login);
          try {
            localStorage.setItem(STORAGE_KEY_GH_USERNAME, userData.login);
          } catch {}
        }
      }

      // 2. Fetch user's latest repositories
      const reposRes = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
        headers: {
          Authorization: `Bearer ${tokenToUse}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (reposRes.ok) {
        const data: Repo[] = await reposRes.json();
        setRepos(data);
        try {
          localStorage.setItem(STORAGE_KEY_GH_REPOS_CACHE, JSON.stringify(data));
        } catch {}
        setError(null);
      } else if (reposRes.status === 401 || reposRes.status === 403) {
        handleDisconnect();
        setError('GitHub session expired. Please reconnect to sync repositories.');
      } else {
        setError('Failed to fetch latest repositories from GitHub.');
      }
    } catch (err: any) {
      console.error('Error syncing GitHub repositories:', err);
      if (repos.length === 0) {
        setError('Unable to reach GitHub. Please check your network connection.');
      }
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }, [handleDisconnect, repos.length]);

  // Automatically sync repositories on mount if token is stored
  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_KEY_GH_TOKEN);
    if (savedToken) {
      const hasCachedRepos = repos.length > 0;
      syncRepos(savedToken, !hasCachedRepos);
    }
  }, [syncRepos]);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      githubProvider.addScope('repo');

      let ghToken: string | undefined;
      let ghUsername: string | undefined;

      const currentUser = auth.currentUser || user;
      if (currentUser) {
        const isLinked = currentUser.providerData.some(p => p.providerId === 'github.com');
        let result;

        try {
          if (isLinked) {
            result = await signInWithPopup(auth, githubProvider);
          } else {
            result = await linkWithPopup(currentUser, githubProvider);
          }
          const credential = GithubAuthProvider.credentialFromResult(result);
          ghToken = credential?.accessToken;
          const info = getAdditionalUserInfo(result);
          if (info?.username) {
            ghUsername = info.username;
          }
        } catch (authError: any) {
          if (
            authError.code === 'auth/popup-closed-by-user' ||
            authError.code === 'auth/cancelled-popup-request'
          ) {
            setLoading(false);
            return;
          }

          // Attempt recovery from authError credentials if already linked
          const errorCred = GithubAuthProvider.credentialFromError(authError);
          if (errorCred?.accessToken) {
            ghToken = errorCred.accessToken;
          } else if (
            authError.code === 'auth/credential-already-in-use' ||
            authError.code === 'auth/provider-already-linked'
          ) {
            try {
              const directResult = await signInWithPopup(auth, githubProvider);
              const directCred = GithubAuthProvider.credentialFromResult(directResult);
              ghToken = directCred?.accessToken;
              const info = getAdditionalUserInfo(directResult);
              if (info?.username) {
                ghUsername = info.username;
              }
            } catch (innerError: any) {
              if (innerError.code === 'auth/popup-closed-by-user') {
                setLoading(false);
                return;
              }
              throw innerError;
            }
          } else {
            throw authError;
          }
        }
      } else {
        const result = await signInWithPopup(auth, githubProvider);
        const credential = GithubAuthProvider.credentialFromResult(result);
        ghToken = credential?.accessToken;
        const info = getAdditionalUserInfo(result);
        if (info?.username) {
          ghUsername = info.username;
        }
      }

      if (ghToken) {
        try {
          localStorage.setItem(STORAGE_KEY_GH_TOKEN, ghToken);
        } catch {}
        setToken(ghToken);
        if (ghUsername) {
          try {
            localStorage.setItem(STORAGE_KEY_GH_USERNAME, ghUsername);
          } catch {}
          setUsername(ghUsername);
        }
        await syncRepos(ghToken, true);
      } else {
        setError('Could not retrieve GitHub access token. Please verify popup permissions.');
      }
    } catch (err: any) {
      console.error('Failed to connect GitHub:', err);
      setError(err?.message || 'Failed to connect to GitHub.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRepos = repos.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedRepo = repos.find(r => r.html_url === selectedUrl);

  // View: Connected State (Token exists or repos present)
  if (token || repos.length > 0) {
    return (
      <div className="space-y-3 bg-zinc-950/70 p-3 sm:p-4 rounded-xl border border-zinc-800/80 backdrop-blur-sm mt-2 shadow-inner">
        {/* Connection Header & Sync Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-zinc-800/80">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-mono text-xs shadow-[0_0_12px_rgba(16,185,129,0.15)] max-w-full">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold tracking-wide truncate">
              ⚡ GitHub Connected {username ? `(@${username})` : ''}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => token && syncRepos(token, false)}
              disabled={isSyncing || loading || !token}
              title="Sync latest repositories from GitHub"
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-zinc-300 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-750 hover:border-zinc-600 rounded-lg transition-all disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <RefreshCw className={`w-3 h-3 text-zinc-400 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync / Refresh'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Collapse repository list' : 'Expand repository list'}
              className="flex items-center gap-1 px-2 py-1 text-xs font-mono text-zinc-400 hover:text-zinc-200 bg-zinc-900/50 hover:bg-zinc-800/70 border border-zinc-800 rounded-lg transition-all cursor-pointer"
            >
              <span>{isExpanded ? 'Hide' : `Show (${repos.length})`}</span>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <button
              type="button"
              onClick={handleDisconnect}
              title="Disconnect GitHub account"
              className="flex items-center gap-1 px-2 py-1 text-xs font-mono text-zinc-500 hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-900/40 rounded-lg transition-all cursor-pointer"
            >
              <Unlink className="w-3 h-3" />
              <span className="hidden sm:inline">Disconnect</span>
            </button>
          </div>
        </div>

        {/* Error notification if sync failed */}
        {error && (
          <div className="p-2.5 bg-red-950/30 border border-red-800/60 rounded-lg text-xs font-mono text-red-300 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 truncate">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span className="truncate">{error}</span>
            </div>
            <button
              type="button"
              onClick={handleConnect}
              className="text-[11px] uppercase font-bold text-white bg-[#c53030] hover:bg-[#b02727] px-2 py-0.5 rounded transition-colors cursor-pointer shrink-0"
            >
              Re-connect
            </button>
          </div>
        )}

        {/* Selected Repo Mini-Bar (Visible when collapsed) */}
        {!isExpanded && selectedRepo && (
          <div className="flex items-center justify-between p-2.5 bg-black/40 rounded-lg border border-zinc-800 font-mono text-xs">
            <div className="flex items-center gap-2 truncate min-w-0 pr-2">
              <Check className="w-3.5 h-3.5 text-[#c53030] shrink-0" />
              <span className="text-zinc-400 shrink-0">Selected:</span>
              <span className="text-white font-medium truncate">{selectedRepo.name}</span>
              {selectedRepo.language && (
                <span className="text-[10px] text-zinc-500 uppercase bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 shrink-0">
                  {selectedRepo.language}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="text-xs text-[#c53030] hover:text-red-400 hover:underline cursor-pointer shrink-0 ml-2 font-mono"
            >
              Change Repo
            </button>
          </div>
        )}

        {/* Expanded View: Search and Repositories */}
        {isExpanded && (
          <>
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-3.5 h-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder={
                  loading
                    ? 'Loading repositories...'
                    : `Search ${repos.length} repositories...`
                }
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-black/40 border border-zinc-800/90 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-[#c53030]/70 w-full transition-colors"
              />
            </div>

            {/* Repositories Scrollable Area */}
            {loading && repos.length === 0 ? (
              <div className="p-6 bg-black/30 rounded-lg border border-zinc-850 flex flex-col items-center justify-center gap-2 text-xs font-mono text-zinc-400">
                <Loader2 className="w-5 h-5 animate-spin text-[#c53030]" />
                <span>Loading latest repositories from GitHub...</span>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
                {filteredRepos.map(repo => {
                  const isSelected = selectedUrl === repo.html_url;
                  return (
                    <button
                      key={repo.id}
                      type="button"
                      onClick={() => {
                        onSelectRepo(repo.html_url, repo.name, repo.language);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all flex justify-between items-center group cursor-pointer ${
                        isSelected
                          ? 'border-[#c53030] bg-[#c53030]/15 shadow-[0_0_15px_rgba(197,48,48,0.25)] ring-1 ring-[#c53030]/40'
                          : 'border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-650 hover:bg-zinc-850/60'
                      }`}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono text-xs font-medium truncate ${
                              isSelected ? 'text-red-200' : 'text-zinc-200 group-hover:text-white'
                            }`}
                          >
                            {repo.name}
                          </span>
                          {isSelected && (
                            <span className="flex items-center gap-1 text-[10px] font-mono uppercase bg-[#c53030]/30 text-red-300 border border-red-500/40 px-1.5 py-0.2 rounded font-semibold shrink-0">
                              <Check className="w-2.5 h-2.5" /> Selected
                            </span>
                          )}
                        </div>
                        {repo.description && (
                          <span className="text-[11px] text-zinc-500 truncate mt-0.5">
                            {repo.description}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {repo.language && (
                          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 border border-zinc-700/60 px-1.5 py-0.5 rounded uppercase">
                            {repo.language}
                          </span>
                        )}
                        {repo.stargazers_count > 0 && (
                          <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 text-amber-500/70 fill-amber-500/20" />{' '}
                            {repo.stargazers_count}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}

                {filteredRepos.length === 0 && !loading && (
                  <div className="text-zinc-500 text-xs font-mono text-center py-5 bg-black/20 rounded-lg border border-dashed border-zinc-850">
                    {searchQuery ? 'No matching repositories found.' : 'No repositories found on this account.'}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // View: Disconnected State (Show Connect Button)
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={handleConnect}
        disabled={loading}
        className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-200 hover:text-white transition-all bg-zinc-900 border border-zinc-750 px-4 py-3 rounded-lg hover:border-[#c53030]/60 hover:bg-zinc-800 w-full justify-center font-semibold shadow-sm cursor-pointer disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin text-[#c53030]" /> : <GitBranch className="w-4 h-4" />}
        {loading ? 'Connecting to GitHub...' : 'Connect GitHub & Import Repo'}
      </button>
      {error && (
        <div className="mt-2 p-2.5 bg-red-950/25 border border-red-900/40 rounded-lg flex items-center gap-2 text-[#f87171] text-xs font-mono">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
