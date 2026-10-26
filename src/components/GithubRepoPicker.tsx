import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auth, githubProvider } from '../firebase';
import { linkWithPopup, signInWithPopup, GithubAuthProvider, fetchSignInMethodsForEmail } from 'firebase/auth';
import { GitBranch, Search, Loader2 } from 'lucide-react';

interface Repo {
  id: number;
  name: string;
  html_url: string;
  language: string | null;
}

interface GithubRepoPickerProps {
  onSelectRepo: (repoUrl: string, repoName: string, language: string | null) => void;
}

export const GithubRepoPicker: React.FC<GithubRepoPickerProps> = ({ onSelectRepo }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      githubProvider.addScope('repo');
      
      let token: string | undefined;
      
      try {
        const isLinked = user.providerData.some(p => p.providerId === 'github.com');
        
        let result;
        if (isLinked) {
          // If already linked, we need to sign in again to get a fresh access token
          // Warning: this might sign them out of their current provider if they aren't linked properly, 
          // but since they are linked, it should just refresh the session.
          result = await signInWithPopup(auth, githubProvider);
        } else {
          result = await linkWithPopup(user, githubProvider);
        }
        
        const credential = GithubAuthProvider.credentialFromResult(result);
        token = credential?.accessToken;
      } catch (authError: any) {
        if (authError.code === 'auth/credential-already-in-use') {
           // The github account is linked to another firebase account.
           // Let's just sign in with it instead? No, that would lose their current account context.
           setError("This GitHub account is already linked to another user. Please log in with GitHub directly.");
        } else if (authError.code === 'auth/provider-already-linked') {
           // We shouldn't hit this due to our isLinked check, but just in case
           const result = await signInWithPopup(auth, githubProvider);
           const credential = GithubAuthProvider.credentialFromResult(result);
           token = credential?.accessToken;
        } else {
           throw authError;
        }
      }

      if (token) {
        await fetchRepos(token);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to connect to GitHub. " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  const fetchRepos = async (token: string) => {
    try {
      const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
        headers: {
          Authorization: `token ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRepos(data);
      } else {
        setError("Failed to fetch repositories.");
      }
    } catch (err) {
      setError("Failed to fetch repositories.");
    }
  };

  const filteredRepos = repos.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (repos.length > 0) {
    return (
      <div className="space-y-4 bg-black/40 p-4 rounded-xl border border-zinc-800 mt-2">
        <div className="flex items-center gap-2 mb-2">
          <Search className="text-zinc-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search repositories..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-sm font-mono text-white focus:ring-0 w-full outline-none"
          />
        </div>
        <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2 pr-2">
          {filteredRepos.map(repo => (
            <button
              key={repo.id}
              type="button"
              onClick={() => {
                onSelectRepo(repo.html_url, repo.name, repo.language);
                setRepos([]); // Close picker after selection
              }}
              className="w-full text-left p-3 rounded-lg border border-zinc-800 hover:border-[#c53030]/50 hover:bg-[#c53030]/10 transition-colors flex justify-between items-center group"
            >
              <div className="flex flex-col">
                <span className="font-mono text-sm text-zinc-200 group-hover:text-white">{repo.name}</span>
                {repo.language && <span className="text-[10px] text-zinc-500 uppercase">{repo.language}</span>}
              </div>
            </button>
          ))}
          {filteredRepos.length === 0 && (
             <div className="text-zinc-500 text-xs font-mono text-center py-4">No repositories found.</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <button 
        type="button" 
        onClick={handleConnect}
        disabled={loading}
        className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-white transition-colors bg-zinc-900/50 border border-zinc-800/50 px-4 py-3 rounded-lg hover:border-[#c53030]/50 hover:bg-[#c53030]/10 w-full justify-center"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitBranch className="w-4 h-4" />}
        {loading ? 'Connecting to GitHub...' : 'Connect GitHub & Import Repo'}
      </button>
      {error && <p className="text-[#c53030] text-[10px] mt-2 font-mono uppercase text-center">{error}</p>}
    </div>
  );
};
