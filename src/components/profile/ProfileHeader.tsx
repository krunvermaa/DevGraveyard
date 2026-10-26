import React from 'react';
import { motion } from 'motion/react';
import { Settings, ExternalLink, Calendar, Plus, UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProfileHeaderProps {
  username: string;
  photoURL?: string;
  bio?: string;
  createdAt?: string;
  instagram?: string;
  whatsapp?: string;
  github?: string;
  isOwnProfile: boolean;
  isFollowing?: boolean;
  onFollowToggle?: () => void;
  followLoading?: boolean;
  onOpenAvatarModal?: () => void;
  onOpenSettingsModal?: () => void;
  isComrade?: boolean;
  onSendComradeRequest?: () => void;
  comradeRequestSent?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  username,
  photoURL,
  bio,
  createdAt,
  instagram,
  whatsapp,
  github,
  isOwnProfile,
  isFollowing,
  onFollowToggle,
  followLoading,
  onOpenAvatarModal,
  onOpenSettingsModal,
  isComrade,
  onSendComradeRequest,
  comradeRequestSent
}) => {
  // Format join date nicely
  const formattedDate = React.useMemo(() => {
    if (!createdAt) return 'Unknown Era';
    try {
      const d = new Date(createdAt);
      if (isNaN(d.getTime())) return 'Unknown Era';
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return 'Unknown Era';
    }
  }, [createdAt]);

  // Normalize social links
  const githubHref = React.useMemo(() => {
    if (!github) return null;
    return github.startsWith('http') ? github : `https://github.com/${github.replace('@', '')}`;
  }, [github]);

  const instagramHref = React.useMemo(() => {
    if (!instagram) return null;
    return instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram.replace('@', '')}`;
  }, [instagram]);

  const whatsappHref = React.useMemo(() => {
    if (!whatsapp) return null;
    if (whatsapp.startsWith('http')) return whatsapp;
    const cleanNumber = whatsapp.replace(/[^0-9]/g, '');
    return cleanNumber ? `https://wa.me/${cleanNumber}` : null;
  }, [whatsapp]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-2xl bg-zinc-950/90 border border-zinc-800/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl overflow-hidden"
    >
      {/* Gothic Ambient Glow & Scanline Accent */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-zinc-800 via-[#c53030] to-zinc-800" />
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#c53030]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-950/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
        {/* Pixel Avatar with Glowing Ambient Aura */}
        <div className="relative group shrink-0">
          {/* Ambient Glowing Halo */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-[#c53030] via-rose-600 to-amber-600 opacity-70 blur-md group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />

          {isOwnProfile ? (
            <button
              onClick={onOpenAvatarModal}
              title="Click to summon another pixel avatar"
              className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-zinc-950 border-2 border-zinc-700/80 shadow-[0_0_25px_rgba(0,0,0,0.9)] overflow-hidden flex items-center justify-center cursor-pointer transition-all duration-300 hover:border-red-500 hover:scale-105 focus:outline-none"
            >
              {photoURL ? (
                <img
                  src={photoURL}
                  alt={username}
                  className="w-full h-full object-cover p-1 bg-zinc-900"
                />
              ) : (
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                  <span className="text-4xl font-serif text-[#c53030] uppercase">
                    {username.charAt(0) || '🪦'}
                  </span>
                </div>
              )}
              {/* Overlay on hover for editing */}
              <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-[10px] font-mono uppercase tracking-widest text-red-300 font-bold">
                  Switch
                </span>
                <span className="text-[9px] font-mono text-zinc-400">Avatar</span>
              </div>
            </button>
          ) : (
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-zinc-950 border-2 border-zinc-700/80 shadow-[0_0_25px_rgba(0,0,0,0.9)] overflow-hidden flex items-center justify-center">
              {photoURL ? (
                <img
                  src={photoURL}
                  alt={username}
                  className="w-full h-full object-cover p-1 bg-zinc-900"
                />
              ) : (
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                  <span className="text-4xl font-serif text-[#c53030] uppercase">
                    {username.charAt(0) || '🪦'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Identity & Info */}
        <div className="flex-1 text-center md:text-left space-y-3 min-w-0">
          {/* Monospace Terminal Handle Badge */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            <span className="font-mono text-xs uppercase tracking-widest text-[#c53030] bg-[#c53030]/15 border border-[#c53030]/40 px-3 py-1 rounded-full font-bold">
              [ crypt://mortician ]
            </span>
            <div className="inline-flex items-center gap-1.5 text-zinc-400 font-mono text-xs bg-zinc-900/80 border border-zinc-800 px-3 py-1 rounded-full">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>Inscribed {formattedDate}</span>
            </div>
          </div>

          {/* Main Name / Username Handle */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-center md:justify-start gap-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-white tracking-tight drop-shadow-[0_2px_12px_rgba(255,255,255,0.2)]">
              @{username}
            </h1>
          </div>

          {/* Bio / Epitaph */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl px-4 py-2.5 max-w-2xl text-left">
            <p className="font-mono text-xs sm:text-sm text-zinc-300 leading-relaxed italic">
              {bio ? (
                `“${bio}”`
              ) : isOwnProfile ? (
                <span className="text-zinc-500">
                  “No memorial bio written yet. Click settings to inscribe your mortician creed.”
                </span>
              ) : (
                <span className="text-zinc-500">
                  “Resting in peace. Code never commits again.”
                </span>
              )}
            </p>
          </div>

          {/* Social Links with High Contrast Icons */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-1">
            {githubHref && (
              <a
                href={githubHref}
                target="_blank"
                rel="noopener noreferrer"
                title={`GitHub: ${github}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 hover:text-white transition-all text-xs font-mono group"
              >
                <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3 text-zinc-400 group-hover:text-zinc-200" />
              </a>
            )}

            {instagramHref && (
              <a
                href={instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                title={`Instagram: ${instagram}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-pink-500/50 text-zinc-100 hover:text-white transition-all text-xs font-mono group"
              >
                <svg className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>Instagram</span>
                <ExternalLink className="w-3 h-3 text-zinc-400 group-hover:text-zinc-200" />
              </a>
            )}

            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                title={`WhatsApp: ${whatsapp}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-emerald-500/50 text-zinc-100 hover:text-white transition-all text-xs font-mono group"
              >
                <svg className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span>WhatsApp</span>
                <ExternalLink className="w-3 h-3 text-zinc-400 group-hover:text-zinc-200" />
              </a>
            )}

            {!githubHref && !instagramHref && !whatsappHref && isOwnProfile && (
              <button
                onClick={onOpenSettingsModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 border border-dashed border-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-mono transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-red-400" />
                <span>Link Social Profiles</span>
              </button>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex md:flex-col items-center gap-2.5 shrink-0 w-full md:w-auto justify-center md:justify-start pt-2 md:pt-0">
          {isOwnProfile ? (
            <>
              <Link
                to="/submit"
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#c53030] hover:bg-[#a82525] text-white font-mono text-xs uppercase tracking-wider font-bold transition-all shadow-[0_0_20px_rgba(197,48,48,0.4)] hover:shadow-[0_0_25px_rgba(197,48,48,0.6)]"
              >
                <span>🪦 Dig Grave</span>
              </Link>
              <button
                onClick={onOpenSettingsModal}
                className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 hover:text-white transition-all text-xs font-mono"
                title="Cemetery Settings"
              >
                <Settings className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            </>
          ) : (
            <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full md:w-auto justify-center">
              {onFollowToggle && (
                <button
                  onClick={onFollowToggle}
                  disabled={followLoading}
                  className={`flex-1 sm:flex-initial min-w-[130px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all ${
                    isFollowing
                      ? 'bg-zinc-900 border border-red-500/50 text-red-300 hover:bg-red-950/40 hover:border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                      : 'bg-white text-zinc-950 hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.25)]'
                  }`}
                >
                  {followLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4 text-red-400" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 text-zinc-950" />
                      <span>Follow Yard</span>
                    </>
                  )}
                </button>
              )}

              {onSendComradeRequest && !isComrade && (
                <button
                  onClick={onSendComradeRequest}
                  disabled={comradeRequestSent}
                  className={`inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl font-mono text-xs transition-all border ${
                    comradeRequestSent
                      ? 'bg-zinc-900/50 border-zinc-800 text-zinc-500 cursor-not-allowed'
                      : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-200 hover:text-white'
                  }`}
                >
                  <span>{comradeRequestSent ? 'Request Sent' : '+ Comrade'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
