/**
 * Game Settings & Accessibility Page
 * King/Supercell arcade styling with procedural audio synthesizers & accessibility controls
 * Bubble Puzzle Engine Presentation Tier
 */

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, Eye, RotateCcw, Shield, Check, AlertTriangle, Sparkles } from 'lucide-react';
import { GAME_NAME } from '../config/gameConfig.js';
import { useAudioStore } from '../store/useAudioStore';

export const SettingsPage = () => {
  const { sfxMuted, musicMuted, toggleSfx, toggleMusic } = useAudioStore();

  const [reducedMotion, setReducedMotion] = useState(() => {
    return typeof window !== 'undefined' && localStorage.getItem('bba_reduced_motion') === 'true';
  });

  const [highContrast, setHighContrast] = useState(() => {
    return typeof window !== 'undefined' && localStorage.getItem('bba_high_contrast') === 'true';
  });

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    document.title = `Settings — ${GAME_NAME}`;
  }, []);

  const handleToggleReducedMotion = () => {
    const next = !reducedMotion;
    setReducedMotion(next);
    localStorage.setItem('bba_reduced_motion', String(next));
    if (next) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  };

  const handleToggleHighContrast = () => {
    const next = !highContrast;
    setHighContrast(next);
    localStorage.setItem('bba_high_contrast', String(next));
  };

  const handleResetProgress = () => {
    localStorage.removeItem('bba_boosters');
    localStorage.removeItem('bba_custom_levels');
    localStorage.removeItem('bba_offline_progress_queue');
    setShowResetConfirm(false);
    setResetSuccess(true);
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white pt-20 pb-16 px-4 select-none">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Main Settings Card */}
        <div className="clay-card p-6 md:p-8 border border-slate-700/60 shadow-2xl space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Pilot Preferences</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-black text-white text-shadow-arcade">
              {GAME_NAME} Settings
            </h1>
            <p className="text-xs text-slate-400 font-sans font-semibold mt-1">
              Customize Web Audio procedural synthesizers, visual accessibility, and local storage caches.
            </p>
          </div>

          {resetSuccess && (
            <div className="clay-card bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-black p-3.5 rounded-2xl text-center shadow-lg flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>✓ Game storage reset successfully! Reloading...</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Sound Effects Option */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                  {sfxMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-display font-black text-white">Procedural Sound Effects</h3>
                  <span className="text-[11px] text-slate-400 font-sans">16 Web Audio API real-time synthesizers</span>
                </div>
              </div>

              <button
                onClick={toggleSfx}
                className={`min-w-[96px] min-h-[44px] rounded-xl text-xs font-display font-black transition-all ${
                  !sfxMuted
                    ? 'btn-arcade-cyan text-slate-950'
                    : 'btn-arcade-slate text-slate-400'
                }`}
              >
                {!sfxMuted ? 'ENABLED' : 'MUTED'}
              </button>
            </div>

            {/* Background Music Option */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-display font-black text-white">8-Bar Chiptune Music</h3>
                  <span className="text-[11px] text-slate-400 font-sans">Zero-asset procedural melodic synth</span>
                </div>
              </div>

              <button
                onClick={toggleMusic}
                className={`min-w-[96px] min-h-[44px] rounded-xl text-xs font-display font-black transition-all ${
                  !musicMuted
                    ? 'btn-arcade-gold text-slate-950'
                    : 'btn-arcade-slate text-slate-400'
                }`}
              >
                {!musicMuted ? 'ENABLED' : 'MUTED'}
              </button>
            </div>

            {/* Reduced Motion Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-display font-black text-white">Reduced Motion Mode</h3>
                  <span className="text-[11px] text-slate-400 font-sans">Minimizes screen shakes & floating effects</span>
                </div>
              </div>

              <button
                onClick={handleToggleReducedMotion}
                className={`min-w-[96px] min-h-[44px] rounded-xl text-xs font-display font-black transition-all ${
                  reducedMotion
                    ? 'btn-arcade-gold text-slate-950'
                    : 'btn-arcade-slate text-slate-400'
                }`}
              >
                {reducedMotion ? 'ACTIVE' : 'OFF'}
              </button>
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-display font-black text-white">High-Contrast Bubbles</h3>
                  <span className="text-[11px] text-slate-400 font-sans">Accentuates bubble edges for accessibility</span>
                </div>
              </div>

              <button
                onClick={handleToggleHighContrast}
                className={`min-w-[96px] min-h-[44px] rounded-xl text-xs font-display font-black transition-all ${
                  highContrast
                    ? 'btn-arcade-emerald text-slate-950'
                    : 'btn-arcade-slate text-slate-400'
                }`}
              >
                {highContrast ? 'ACTIVE' : 'OFF'}
              </button>
            </div>

            {/* Danger Zone: Reset Progress */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                <div>
                  <h3 className="text-sm font-display font-black text-rose-400">Reset Local Storage Cache</h3>
                  <span className="text-[11px] text-slate-400 font-sans">Clears offline boosters and temporary sandbox sectors</span>
                </div>

                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="btn-arcade-crimson px-4 py-2.5 rounded-xl text-xs font-display font-black min-h-[44px]"
                >
                  RESET CACHE
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm clay-card border border-rose-500/60 p-6 rounded-3xl text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-2xl border border-rose-500/30">
              ⚠️
            </div>
            <div>
              <h3 className="text-lg font-display font-black text-white">Confirm Cache Reset?</h3>
              <p className="text-xs text-slate-300 font-sans leading-relaxed mt-1">
                This will reset your local offline inventory and temporary sandbox levels. This action cannot be reversed.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleResetProgress}
                className="btn-arcade-crimson flex-1 py-3 rounded-2xl text-xs font-display font-black min-h-[48px]"
              >
                YES, RESET ALL
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="btn-arcade-slate flex-1 py-3 rounded-2xl text-xs font-display font-black min-h-[48px]"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
