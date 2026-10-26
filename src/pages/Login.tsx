import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loginWithGithub, loginWithGoogle, isFirebaseConfigured } from '../firebase';
import { Loader2, AlertCircle } from 'lucide-react';
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
        await loginWithGithub();
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
    <div className="min-h-[80vh] flex flex-col items-center justify-center animate-fade-in relative z-10 px-4">
      <div className="max-w-md w-full space-y-8 p-8 border border-zinc-800 bg-surface/50 backdrop-blur-sm rounded-xl shadow-2xl relative overflow-hidden">
        
        {/* Subtle top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-code-red/40 blur-sm"></div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter text-[#c53030] font-sans">
            Authentication
          </h1>
          <p className="text-sm text-zinc-400 font-mono">
            Identify yourself to enter the graveyard.
          </p>
        </div>

        {!isFirebaseConfigured && (
          <div className="p-3 bg-amber-950/40 border border-amber-600/40 rounded-lg text-amber-300 text-xs text-center font-mono flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Setup needed: Add Firebase project credentials to <code className="text-amber-100 bg-black/40 px-1 py-0.5 rounded">.env.local</code></span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-md text-red-400 text-sm text-center font-mono">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Button
            onClick={() => handleLogin('google')}
            disabled={isLoggingIn !== false} 
            variant="secondary"
            className="w-full h-12 flex items-center justify-center space-x-3 text-sm tracking-widest font-mono border border-zinc-700 hover:text-white hover:bg-zinc-800 hover:border-[#c53030]/50 transition-all shadow-lg"
          >
            {isLoggingIn === 'google' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            <span>{isLoggingIn === 'google' ? 'Authenticating...' : 'Continue with Google'}</span>
          </Button>

          <Button
            onClick={() => handleLogin('github')}
            disabled={isLoggingIn !== false} 
            variant="secondary"
            className="w-full h-12 flex items-center justify-center space-x-3 text-sm tracking-widest font-mono border border-zinc-700 hover:text-white hover:bg-zinc-800 hover:border-[#c53030]/50 transition-all shadow-lg"
          >
            {isLoggingIn === 'github' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <GithubIcon />
            )}
            <span>{isLoggingIn === 'github' ? 'Authenticating...' : 'Continue with GitHub'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
