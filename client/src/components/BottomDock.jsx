/**
 * Tier C: Bottom Menu / Tactical Booster Dock (<BottomDock />)
 * Contains the Bubble Launcher controls poking into the canvas area,
 * Ammo remaining counter, Swap trigger, and the 5 Booster Buttons with safe-area padding.
 */

import React from 'react';
import {
  Crosshair,
  Bomb,
  Sparkles,
  PlusCircle,
  Shuffle,
  ArrowLeftRight,
  Target,
  Zap
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore.js';
import { BUBBLE_COLORS, SPECIAL_BUBBLES, GAME_STATES } from '../game/constants.js';

const COLOR_MAP = {
  red: '#FF3344',
  blue: '#2563EB',
  green: '#10B981',
  yellow: '#FACC15',
  purple: '#9333EA',
  orange: '#F97316',
  pink: '#EC4899',
  cyan: '#06B6D4',
  bomb: '#EA580C',
  rainbow: '#FFFFFF'
};

export const BottomDock = () => {
  const {
    currentBubble,
    nextBubble,
    shotsRemaining,
    score,
    combo,
    boosters,
    activeBooster,
    gameStatus,
    activateBooster,
    swapBubbles
  } = useGameStore();

  const isInteractive = gameStatus === GAME_STATES.READY || gameStatus === GAME_STATES.AIMING;

  const boosterList = [
    {
      id: 'superAim',
      name: 'Super Aim',
      count: boosters.superAim ?? boosters.AIM_GUIDE ?? 2,
      icon: Crosshair,
      accent: 'text-cyan-400',
      isActive: activeBooster === 'superAim',
      disabled: !isInteractive || (boosters.superAim || 0) <= 0
    },
    {
      id: 'bomb',
      name: 'Bomb',
      count: boosters.bomb ?? boosters.BOMB ?? 2,
      icon: Bomb,
      accent: 'text-amber-400',
      isActive: activeBooster === 'bomb',
      disabled: !isInteractive || (boosters.bomb || 0) <= 0
    },
    {
      id: 'rainbow',
      name: 'Rainbow',
      count: boosters.rainbow ?? boosters.RAINBOW ?? 2,
      icon: Sparkles,
      accent: 'text-pink-400',
      isActive: activeBooster === 'rainbow',
      disabled: !isInteractive || (boosters.rainbow || 0) <= 0
    },
    {
      id: 'extraShots',
      name: '+5 Shots',
      count: boosters.extraShots ?? boosters.EXTRA_SHOTS ?? 3,
      icon: PlusCircle,
      accent: 'text-emerald-400',
      isActive: false,
      disabled: !isInteractive || (boosters.extraShots || 0) <= 0
    },
    {
      id: 'shuffle',
      name: 'Shuffle',
      count: boosters.shuffle ?? boosters.SHUFFLE ?? 2,
      icon: Shuffle,
      accent: 'text-sky-400',
      isActive: false,
      disabled: !isInteractive || (boosters.shuffle || 0) <= 0
    }
  ];

  const currentFill = COLOR_MAP[currentBubble] || '#06B6D4';
  const nextFill = COLOR_MAP[nextBubble] || '#EC4899';

  return (
    <footer className="w-full flex-shrink-0 select-none pb-[max(env(safe-area-inset-bottom),1rem)] pt-1 px-3 max-w-[440px] mx-auto z-20 flex flex-col items-center">
      
      {/* Upper Control Bar: Launcher Pod, Swap Tray & Ammo Counter (poking slightly into canvas) */}
      <div className="-mt-7 w-full flex items-center justify-between px-3 py-1.5 rounded-2xl bg-slate-900/95 border border-slate-800 backdrop-blur-md shadow-2xl mb-2">
        {/* Next Bubble Tray & Swap Button */}
        <button
          onClick={swapBubbles}
          disabled={!isInteractive}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 active:scale-95 transition-all disabled:opacity-50 min-h-[48px] min-w-[48px]"
          title="Swap Ready and Next Bubble"
        >
          <div className="relative flex items-center">
            {/* Small Next Bubble */}
            <div
              className="w-5 h-5 rounded-full border border-white/40 shadow-sm"
              style={{ backgroundColor: nextFill }}
            />
            {/* Swap Circular Icon */}
            <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400 ml-1.5" />
          </div>
          <span className="text-xs font-display font-black text-amber-300">SWAP</span>
        </button>

        {/* Center: Remaining Ammo Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-display font-black">
          <Target className="w-4 h-4 text-amber-400" />
          <span className={`${shotsRemaining <= 5 ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
            {shotsRemaining} Shots Left
          </span>
        </div>

        {/* Right: Score & Combo Multiplier */}
        <div className="text-right flex flex-col justify-center">
          <span className="text-xs font-display font-black text-amber-300">
            {score.toLocaleString()}
          </span>
          {combo > 1 ? (
            <span className="text-xs font-display font-bold text-cyan-400 flex items-center justify-end gap-0.5">
              <Zap className="w-3 h-3 fill-cyan-400" />
              x{combo} Combo
            </span>
          ) : (
            <span className="text-xs font-body font-semibold text-slate-400">Score</span>
          )}
        </div>
      </div>

      {/* Lower Row: 5 Tactile Booster Buttons */}
      <div className="w-full h-[62px] px-2 py-1 bg-slate-900/95 border border-slate-800 rounded-2xl backdrop-blur-md shadow-2xl flex items-center justify-between gap-1.5">
        {boosterList.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => !item.disabled && activateBooster(item.id)}
              disabled={item.disabled}
              className={`relative flex-1 flex flex-col items-center justify-center h-12 rounded-xl transition-all duration-100 min-w-[48px] min-h-[48px] ${
                item.isActive
                  ? 'bg-amber-400/20 border-2 border-amber-400 ring-2 ring-amber-400/50 shadow-md transform scale-105'
                  : item.disabled
                  ? 'opacity-35 bg-slate-950/60 border border-slate-800/40 cursor-not-allowed'
                  : 'btn-arcade-slate hover:border-slate-600 active:translate-y-0.5'
              }`}
              title={`${item.name} (${item.count} in bag)`}
              aria-label={item.name}
            >
              {/* Count Badge */}
              <span
                className={`absolute -top-1.5 -right-1 text-xs font-display font-black px-1.5 py-0.5 rounded-full border shadow-sm ${
                  item.count > 0
                    ? 'bg-amber-400 text-slate-950 border-amber-300'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                x{item.count}
              </span>

              {/* Icon */}
              <Icon className={`w-5 h-5 ${item.isActive ? 'text-amber-300' : item.accent}`} />

              {/* Label */}
              <span className="text-[10px] sm:text-xs font-display font-bold text-slate-300 leading-tight mt-0.5 truncate max-w-full text-center px-0.5">
                {item.name}
              </span>
            </button>
          );
        })}
      </div>

    </footer>
  );
};

export default BottomDock;
