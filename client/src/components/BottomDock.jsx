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
    activateBooster
  } = useGameStore();

  const isInteractive = gameStatus === GAME_STATES.READY || gameStatus === GAME_STATES.AIMING;

  const boosterList = [
    {
      id: 'superAim',
      name: 'Super Aim',
      count: boosters.superAim ?? boosters.aimGuide ?? 5,
      iconImg: '/assets/icons/target.png',
      altText: 'Super Aim',
      isActive: activeBooster === 'superAim' || activeBooster === 'aimGuide',
      disabled: !isInteractive || (boosters.superAim ?? boosters.aimGuide ?? 0) <= 0
    },
    {
      id: 'bomb',
      name: 'Bomb',
      count: boosters.bomb ?? 5,
      iconImg: '/assets/icons/bomb.png',
      altText: 'Bomb',
      isActive: activeBooster === 'bomb',
      disabled: !isInteractive || (boosters.bomb || 0) <= 0
    },
    {
      id: 'rainbow',
      name: 'Rainbow',
      count: boosters.rainbow ?? 5,
      iconImg: '/assets/icons/rainbow.png',
      altText: 'Rainbow',
      isActive: activeBooster === 'rainbow',
      disabled: !isInteractive || (boosters.rainbow || 0) <= 0
    },
    {
      id: 'extraShots',
      name: '+5 Shots',
      count: boosters.extraShots ?? 5,
      iconImg: '/assets/icons/plus.png',
      altText: '+5 Shots',
      isActive: false,
      disabled: !isInteractive || (boosters.extraShots || 0) <= 0
    },
    {
      id: 'shuffle',
      name: 'Shuffle',
      count: boosters.shuffle ?? 5,
      iconImg: '/assets/icons/shuffle.png',
      altText: 'Shuffle',
      isActive: false,
      disabled: !isInteractive || (boosters.shuffle || 0) <= 0
    }
  ];

  return (
    <div className="w-full flex-shrink-0 select-none pb-[max(env(safe-area-inset-bottom),0.35rem)] pt-0.5 px-3 max-w-[420px] mx-auto z-20 flex justify-center">
      {/* Ultra-Compact 5-Slot Floating Booster Dock */}
      <div className="w-full h-14 sm:h-16 px-2 py-1 bg-slate-900/95 border border-slate-800 rounded-2xl backdrop-blur-md shadow-2xl flex items-center justify-between gap-1.5">
        {boosterList.map((item) => {
          return (
            <button
              key={item.id}
              onClick={() => !item.disabled && activateBooster(item.id)}
              disabled={item.disabled}
              className={`relative flex-1 flex flex-col items-center justify-center h-11 sm:h-12 rounded-xl transition-all duration-100 min-w-[44px] min-h-[44px] ${
                item.isActive
                  ? 'bg-amber-400/20 border-2 border-amber-400 border-b-4 border-b-amber-600 ring-2 ring-amber-400/50 shadow-md active:translate-y-1 active:border-b-0'
                  : item.disabled
                  ? 'opacity-35 bg-slate-950/60 border border-slate-800/40 cursor-not-allowed'
                  : 'btn-arcade-slate hover:border-slate-600 border-b-4 border-b-slate-950 active:translate-y-1 active:border-b-0'
              }`}
              title={`${item.name} (${item.count} available)`}
              aria-label={item.name}
            >
              {/* Floating Inventory Numeric Count Badge */}
              <span
                className={`absolute -top-1.5 -right-1 text-[10px] font-display font-black px-1.5 py-0.2 rounded-full border shadow-sm ${
                  item.count > 0
                    ? 'bg-amber-400 text-slate-950 border-amber-300'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                x{item.count}
              </span>

              {/* Standard Crisp Asset Icon */}
              <img
                src={item.iconImg}
                alt={item.altText}
                className="w-5 h-5 object-contain drop-shadow-sm"
              />

              {/* Name Label */}
              <span className="text-[9px] sm:text-[10px] font-display font-black text-slate-300 leading-tight mt-0.5 truncate max-w-full text-center px-0.5">
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
