import React, { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loginWithGithub, loginWithGoogle, isFirebaseConfigured, GithubAuthProvider } from '../firebase';
import { getAdditionalUserInfo } from 'firebase/auth';
import { Loader2, AlertCircle, KeyRound, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

const GithubIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const GoogleIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z" />
  </svg>
);

export const Login: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState<'github' | 'google' | false>(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/home" replace />;
  }

  const handleLogin = async (provider: 'github' | 'google') => {
    setIsLoggingIn(provider);
    setError(null);
    try {
      if (provider === 'github') {
        const result = await loginWithGithub();
        try {
          const credential = GithubAuthProvider.credentialFromResult(result);
          if (credential?.accessToken) {
            localStorage.setItem('devgraveyard_gh_token', credential.accessToken);
            const info = getAdditionalUserInfo(result);
            if (info?.username) {
              localStorage.setItem('devgraveyard_gh_username', info.username);
            }
          }
        } catch (tokenErr) {
          console.warn('Could not cache github token from login:', tokenErr);
        }
      } else {
        await loginWithGoogle();
      }
      navigate('/home');
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        // User voluntarily dismissed the authentication window
        return;
      }
      console.error('[Auth Error]', err);
      let message = err?.message || `Failed to login with ${provider === 'github' ? 'GitHub' : 'Google'}`;
      if (err?.code === 'auth/unauthorized-domain') {
        message = 'Unauthorized Domain: Add this domain (e.g. localhost or your Vercel URL) in Firebase Console -> Authentication -> Settings -> Authorized Domains.';
      } else if (err?.code === 'auth/popup-blocked') {
        message = 'Popup was blocked by your browser. Please allow popups for this site and try again.';
      } else if (err?.code === 'auth/account-exists-with-different-credential') {
        message = 'An account already exists with this email using a different sign-in provider.';
      } else if (err?.code === 'auth/network-request-failed') {
        message = 'Network request failed. Please check your connection and Firebase configuration.';
      }
      setError(message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center animate-fade-in relative z-10 px-4 py-8">
      <div className="max-w-md w-full space-y-6 p-7 sm:p-8 border border-zinc-800 bg-surface/60 backdrop-blur-md rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
        
        {/* Subtle top crimson glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#c53030] to-transparent opacity-70"></div>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#c53030]/10 border border-[#c53030]/30 flex items-center justify-center text-[#c53030] shadow-[0_0_20px_rgba(197,48,48,0.2)] mb-3">
            <KeyRound className="w-5 h-5 animate-pulse" />
          </div>

          <span className="font-mono text-[10px] uppercase tracking-widest text-[#c53030] block">
            Sanctuary Gateway
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
            Enter the Graveyard
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-serif italic max-w-xs mx-auto">
            "Where dead code finds peace and developers find wisdom."
          </p>
        </div>

        {!isFirebaseConfigured && (
          <div className="p-3 bg-amber-950/40 border border-amber-600/40 rounded-lg text-amber-300 text-xs text-center font-mono flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Setup needed: Add Firebase project credentials to <code className="text-amber-100 bg-black/40 px-1 py-0.5 rounded">.env.local</code></span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-xs text-center font-mono">
            {error}
          </div>
        )}

        <div className="space-y-3 pt-1">
          <Button
            onClick={() => handleLogin('github')}
            disabled={isLoggingIn !== false} 
            variant="secondary"
            className="w-full h-12 flex items-center justify-center space-x-3 text-xs sm:text-sm tracking-widest font-mono text-zinc-100 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 hover:border-[#c53030]/60 font-semibold transition-all shadow-lg rounded-xl cursor-pointer"
          >
            {isLoggingIn === 'github' ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#c53030]" />
            ) : (
              <GithubIcon />
            )}
            <span>{isLoggingIn === 'github' ? 'Authenticating...' : 'Continue with GitHub'}</span>
          </Button>

          <Button
            onClick={() => handleLogin('google')}
            disabled={isLoggingIn !== false} 
            variant="secondary"
            className="w-full h-12 flex items-center justify-center space-x-3 text-xs sm:text-sm tracking-widest font-mono text-zinc-100 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 hover:border-[#c53030]/60 font-semibold transition-all shadow-lg rounded-xl cursor-pointer"
          >
            {isLoggingIn === 'google' ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#c53030]" />
            ) : (
              <GoogleIcon />
            )}
            <span>{isLoggingIn === 'google' ? 'Authenticating...' : 'Continue with Google'}</span>
          </Button>
        </div>

        {/* Privacy & Trust Guarantee */}
        <div className="pt-2 border-t border-zinc-900 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span>Public profile only. We never access private code.</span>
          </div>
          <div className="flex items-center justify-center gap-4 text-[11px] font-mono text-zinc-500 pt-1">
            <Link to="/cemetery" className="hover:text-zinc-300 inline-flex items-center gap-1 transition-colors">
              <span>Browse Cemetery First</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-[#c53030] transition-colors">
              Privacy Codex
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
