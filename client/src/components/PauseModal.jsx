/**
 * Pause Overlay Modal
 * King/Supercell Caliber: Resume CTA, Audio Sliders, Restart, and Map Exit
 */

import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, Music, Settings, X } from 'lucide-react';
import { useGameStore } from '../store/useGameStore.js';
import { useAudioStore } from '../store/useAudioStore';

export const PauseModal = ({ onResume, onRestart, onQuit }) => {
  const { levelId, score } = useGameStore();
  const { sfxMuted, musicMuted, toggleSfx, toggleMusic } = useAudioStore();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-sm clay-card p-6 rounded-3xl text-center shadow-2xl relative overflow-hidden transform animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg mx-auto mb-2 text-amber-400">
          ⏸️
        </div>

        <h2 className="font-display font-black text-2xl text-white uppercase tracking-tight text-shadow-arcade">
          GAME PAUSED
        </h2>
        <span className="font-body text-xs font-semibold text-slate-400 block mb-4">
          Sector {levelId} • Score: {score.toLocaleString()}
        </span>

        {/* Audio Quick Toggles */}
        <div className="flex items-center justify-center gap-3 p-3 bg-slate-950/90 rounded-2xl border border-slate-800 mb-5">
          <button
            onClick={toggleSfx}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-display font-bold transition-all ${
              sfxMuted
                ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400'
                : 'bg-sky-500/20 border border-sky-400/40 text-sky-300'
            }`}
          >
            {sfxMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>SFX {sfxMuted ? 'OFF' : 'ON'}</span>
          </button>

          <button
            onClick={toggleMusic}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-display font-bold transition-all ${
              musicMuted
                ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400'
                : 'bg-amber-500/20 border border-amber-400/40 text-amber-300'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Music {musicMuted ? 'OFF' : 'ON'}</span>
          </button>
        </div>

        {/* Action Buttons Deck */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="w-full h-12 btn-arcade-gold rounded-2xl flex items-center justify-center gap-2 text-slate-950 font-display font-black text-sm tracking-wide uppercase active:translate-y-1"
          >
            <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
            <span>Resume Sector</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 btn-arcade-slate rounded-2xl flex items-center justify-center gap-2 text-xs font-display font-bold text-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Level</span>
          </button>

          <button
            onClick={onQuit}
            className="w-full py-2.5 btn-arcade-slate rounded-2xl flex items-center justify-center gap-2 text-xs font-display font-bold text-slate-200"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Quit to World Map</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PauseModal;
