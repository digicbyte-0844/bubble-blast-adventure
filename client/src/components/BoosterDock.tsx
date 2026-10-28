import React from 'react';
import { Crosshair, Bomb, Sparkles, PlusCircle, Shuffle } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { useUserStore } from '../store/useUserStore';

export const BoosterDock: React.FC = () => {
  const { activateBooster, superAimActive, activeBooster, gameState } = useGameStore();
  const { boosters, consumeBooster } = useUserStore();

  const handleUse = (type: 'SUPER_AIM' | 'BOMB' | 'RAINBOW' | 'EXTRA_SHOTS' | 'SHUFFLE') => {
    if (gameState !== 'READY' && gameState !== 'AIMING') return;
    const hasItem = (boosters[type] || 0) > 0;
    if (hasItem) {
      consumeBooster(type);
      activateBooster(type);
    }
  };

  const isAimActive = superAimActive;
  const isBombActive = activeBooster === 'BOMB';
  const isRainbowActive = activeBooster === 'RAINBOW';

  return (
    <div className="w-full max-w-[380px] bg-cosmic-card/70 border border-cosmic-border p-2 rounded-2xl flex items-center justify-between gap-1 shadow-md mt-2">
      {/* 1. Super Aim */}
      <button
        onClick={() => handleUse('SUPER_AIM')}
        disabled={isAimActive || (boosters.SUPER_AIM || 0) <= 0}
        className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center border transition-all ${
          isAimActive
            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-sm'
            : 'bg-cosmic-dark/60 border-cosmic-border text-slate-300 hover:border-cosmic-cyan hover:text-white disabled:opacity-30'
        }`}
      >
        <Crosshair className="w-4 h-4 text-emerald-400" />
        <span className="text-[9px] font-bold mt-0.5">Aim 2x</span>
        <span className="text-[8px] bg-cosmic-dark px-1 rounded text-slate-400">{boosters.SUPER_AIM || 0}</span>
      </button>

      {/* 2. Bomb */}
      <button
        onClick={() => handleUse('BOMB')}
        disabled={isBombActive || (boosters.BOMB || 0) <= 0}
        className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center border transition-all ${
          isBombActive
            ? 'bg-orange-500/20 border-orange-400 text-orange-400 shadow-sm'
            : 'bg-cosmic-dark/60 border-cosmic-border text-slate-300 hover:border-cosmic-cyan hover:text-white disabled:opacity-30'
        }`}
      >
        <Bomb className="w-4 h-4 text-orange-400" />
        <span className="text-[9px] font-bold mt-0.5">Bomb</span>
        <span className="text-[8px] bg-cosmic-dark px-1 rounded text-slate-400">{boosters.BOMB || 0}</span>
      </button>

      {/* 3. Rainbow */}
      <button
        onClick={() => handleUse('RAINBOW')}
        disabled={isRainbowActive || (boosters.RAINBOW || 0) <= 0}
        className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center border transition-all ${
          isRainbowActive
            ? 'bg-purple-500/20 border-purple-400 text-purple-400 shadow-sm'
            : 'bg-cosmic-dark/60 border-cosmic-border text-slate-300 hover:border-cosmic-cyan hover:text-white disabled:opacity-30'
        }`}
      >
        <Sparkles className="w-4 h-4 text-purple-400" />
        <span className="text-[9px] font-bold mt-0.5">Rainbow</span>
        <span className="text-[8px] bg-cosmic-dark px-1 rounded text-slate-400">{boosters.RAINBOW || 0}</span>
      </button>

      {/* 4. +5 Shots */}
      <button
        onClick={() => handleUse('EXTRA_SHOTS')}
        disabled={(boosters.EXTRA_SHOTS || 0) <= 0}
        className="flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center border bg-cosmic-dark/60 border-cosmic-border text-slate-300 hover:border-cosmic-cyan hover:text-white disabled:opacity-30 transition-all"
      >
        <PlusCircle className="w-4 h-4 text-cosmic-gold" />
        <span className="text-[9px] font-bold mt-0.5">+5 Shots</span>
        <span className="text-[8px] bg-cosmic-dark px-1 rounded text-slate-400">{boosters.EXTRA_SHOTS || 0}</span>
      </button>

      {/* 5. Shuffle */}
      <button
        onClick={() => handleUse('SHUFFLE')}
        disabled={(boosters.SHUFFLE || 0) <= 0}
        className="flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center border bg-cosmic-dark/60 border-cosmic-border text-slate-300 hover:border-cosmic-cyan hover:text-white disabled:opacity-30 transition-all"
      >
        <Shuffle className="w-4 h-4 text-cosmic-cyan" />
        <span className="text-[9px] font-bold mt-0.5">Shuffle</span>
        <span className="text-[8px] bg-cosmic-dark px-1 rounded text-slate-400">{boosters.SHUFFLE || 0}</span>
      </button>
    </div>
  );
};

export default BoosterDock;
