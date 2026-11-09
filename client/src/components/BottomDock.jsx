/**
 * Tier C: Bottom Tactical Booster Dock (<BottomDock />)
 * King/Supercell Caliber: Ultra-compact floating 5-Booster Dock (h-16),
 * 3D arcade tactile pill buttons with border-b-4 press states, floating numeric inventory badges (-top-1 -right-1),
 * safe-area padded, zero wasted vertical padding to guarantee seamless touch-aiming.
 */

import React from 'react';
import { useGameStore } from '../store/useGameStore.js';
import { GAME_STATES } from '../game/constants.js';

export const BottomDock = () => {
  const {
    boosters,
    activeBooster,
    gameStatus,
    activateBooster,
    recentBombReward
  } = useGameStore();

  const isInteractive = gameStatus === GAME_STATES.READY || gameStatus === GAME_STATES.AIMING;
  const isBombRewarded = recentBombReward && Date.now() - recentBombReward < 2400;

  const boosterList = [
    {
      id: 'superAim',
      name: 'Super Aim',
      count: boosters.superAim ?? boosters.aimGuide ?? 5,
      iconImg: '/assets/icons/target.png',
      altText: 'Super Aim',
      isActive: activeBooster === 'superAim' || activeBooster === 'aimGuide',
      disabled: !isInteractive || (boosters.superAim ?? boosters.aimGuide ?? 0) <= 0,
      gradient: 'from-sky-400 via-blue-500 to-indigo-700',
      border: 'border-b-indigo-950',
      shadow: 'shadow-blue-500/25'
    },
    {
      id: 'bomb',
      name: 'Bomb',
      count: boosters.bomb ?? 5,
      iconImg: '/assets/icons/bomb.png',
      altText: 'Bomb',
      isActive: activeBooster === 'bomb',
      disabled: !isInteractive || (boosters.bomb || 0) <= 0,
      gradient: 'from-amber-400 via-orange-500 to-red-600',
      border: 'border-b-red-950',
      shadow: 'shadow-orange-500/35'
    },
    {
      id: 'rainbow',
      name: 'Rainbow',
      count: boosters.rainbow ?? 5,
      iconImg: '/assets/icons/rainbow.png',
      altText: 'Rainbow',
      isActive: activeBooster === 'rainbow',
      disabled: !isInteractive || (boosters.rainbow || 0) <= 0,
      gradient: 'from-pink-500 via-purple-500 to-indigo-600',
      border: 'border-b-purple-950',
      shadow: 'shadow-purple-500/30'
    },
    {
      id: 'extraShots',
      name: '+5 Shots',
      count: boosters.extraShots ?? 5,
      iconImg: '/assets/icons/plus.png',
      altText: '+5 Shots',
      isActive: false,
      disabled: !isInteractive || (boosters.extraShots || 0) <= 0,
      gradient: 'from-emerald-400 via-teal-500 to-emerald-700',
      border: 'border-b-teal-950',
      shadow: 'shadow-emerald-500/25'
    },
    {
      id: 'shuffle',
      name: 'Shuffle',
      count: boosters.shuffle ?? 5,
      iconImg: '/assets/icons/shuffle.png',
      altText: 'Shuffle',
      isActive: false,
      disabled: !isInteractive || (boosters.shuffle || 0) <= 0,
      gradient: 'from-violet-400 via-purple-600 to-fuchsia-700',
      border: 'border-b-fuchsia-950',
      shadow: 'shadow-purple-500/25'
    }
  ];

  return (
    <div className="w-full flex-shrink-0 select-none pb-[max(env(safe-area-inset-bottom),0.35rem)] pt-0.5 px-3 max-w-[440px] mx-auto z-20 flex justify-center">
      {/* 5-Slot Floating 3D Arcade Booster Dock */}
      <div className="w-full h-15 sm:h-16 px-2 py-1 bg-slate-900/95 border border-slate-800 rounded-2xl backdrop-blur-md shadow-2xl flex items-center justify-between gap-1.5">
        {boosterList.map((item) => {
          const isBombSlot = item.id === 'bomb';
          return (
            <button
              key={item.id}
              onClick={() => !item.disabled && activateBooster(item.id)}
              disabled={item.disabled}
              className={`relative flex-1 flex flex-col items-center justify-center h-12 rounded-xl transition-all duration-150 min-w-[44px] min-h-[44px] border-b-4 ${
                item.isActive
                  ? `bg-gradient-to-b ${item.gradient} ${item.border} ring-2 ring-yellow-300 scale-105 shadow-lg active:translate-y-1 active:border-b-0`
                  : item.disabled
                  ? 'opacity-35 bg-slate-950/60 border border-slate-800/40 cursor-not-allowed border-b-slate-950'
                  : `bg-gradient-to-b ${item.gradient} ${item.border} ${item.shadow} shadow-md hover:scale-105 active:translate-y-1 active:border-b-0 active:scale-95`
              }`}
              title={`${item.name} (${item.count} available)`}
              aria-label={item.name}
            >
              {/* Floating +1 BOMB! Reward Badge Animation */}
              {isBombSlot && isBombRewarded && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 text-slate-950 font-display font-black text-[9px] shadow-xl animate-bounce whitespace-nowrap z-30 border border-yellow-200">
                  +1 BOMB!
                </span>
              )}

              {/* Floating Inventory Numeric Count Badge */}
              <span
                className={`absolute -top-1.5 -right-1 text-[10px] font-display font-black px-1.5 py-0.2 rounded-full border shadow-sm ${
                  item.count > 0
                    ? 'bg-amber-300 text-slate-950 border-amber-200 shadow-md'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                x{item.count}
              </span>

              {/* Standard Crisp Asset Icon */}
              <img
                src={item.iconImg}
                alt={item.altText}
                className="w-5 h-5 object-contain drop-shadow filter"
              />

              {/* Name Label */}
              <span className="text-[9px] sm:text-[10px] font-display font-black text-white leading-tight mt-0.5 truncate max-w-full text-center px-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomDock;
