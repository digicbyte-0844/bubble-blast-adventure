import React from 'react';
import { ArrowLeftRight, Zap, Target } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

const COLOR_BG: Record<string, string> = {
  CYAN: 'bg-[#00F0FF] shadow-[#00F0FF]/50',
  MAGENTA: 'bg-[#FF00A0] shadow-[#FF00A0]/50',
  GOLD: 'bg-[#FFD700] shadow-[#FFD700]/50',
  EMERALD: 'bg-[#00FF88] shadow-[#00FF88]/50',
  CRIMSON: 'bg-[#FF3366] shadow-[#FF3366]/50',
  VIOLET: 'bg-[#9933FF] shadow-[#9933FF]/50',
  BOMB: 'bg-[#FF5500] shadow-[#FF5500]/50',
  RAINBOW: 'bg-white shadow-white/50'
};

export const LauncherDock: React.FC = () => {
  const { currentBubble, nextBubble, shotsRemaining, score, comboCount, swapBubbles, gameState } = useGameStore();

  return (
    <div className="w-full max-w-[380px] bg-cosmic-card/90 border border-cosmic-border p-3 rounded-2xl flex items-center justify-between shadow-xl mt-2">
      {/* Score & Combo */}
      <div className="flex flex-col">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Score</span>
        <span className="text-xl font-black text-white tracking-tight">{score.toLocaleString()}</span>
        {comboCount > 1 && (
          <span className="text-[11px] font-black text-cosmic-cyan flex items-center gap-1 animate-pulse">
            <Zap className="w-3 h-3 fill-cosmic-cyan" />
            COMBO x{comboCount}!
          </span>
        )}
      </div>

      {/* Bubble Swapper Hub */}
      <div className="flex items-center gap-3 bg-cosmic-dark/80 px-3 py-1.5 rounded-2xl border border-cosmic-border">
        {/* Next Bubble (Small) */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] text-slate-400 font-bold uppercase">Next</span>
          <div
            className={`w-7 h-7 rounded-full border border-white/40 shadow-sm transition-transform ${
              COLOR_BG[nextBubble] || 'bg-cosmic-cyan'
            }`}
          />
        </div>

        {/* Swap Button */}
        <button
          onClick={swapBubbles}
          disabled={gameState !== 'READY' && gameState !== 'AIMING'}
          title="Swap Bubbles"
          className="w-8 h-8 rounded-xl bg-cosmic-accent/30 border border-cosmic-accent flex items-center justify-center text-cosmic-cyan hover:bg-cosmic-accent/50 active:scale-95 transition-all disabled:opacity-40"
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>

        {/* Current Ready Bubble (Large) */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] text-cosmic-cyan font-bold uppercase">Ready</span>
          <div
            className={`w-9 h-9 rounded-full border-2 border-white shadow-lg transition-transform scale-105 ${
              COLOR_BG[currentBubble] || 'bg-cosmic-cyan'
            }`}
          />
        </div>
      </div>

      {/* Shots Remaining */}
      <div className="flex flex-col items-end">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
          <Target className="w-3 h-3" />
          Shots
        </span>
        <span
          className={`text-2xl font-black tracking-tight ${
            shotsRemaining <= 5 ? 'text-rose-500 animate-pulse' : 'text-cosmic-gold'
          }`}
        >
          {shotsRemaining}
        </span>
      </div>
    </div>
  );
};

export default LauncherDock;
