/**
 * Tactical Booster Dock (Thumb Ergonomics Zone)
 * King/Supercell Caliber: 5 Boosters, Inventory Badges, Active Amber Neon Ring, 48px Touch Targets
 */

import React from 'react';
import { Target, Bomb, Sparkles, PlusCircle, Shuffle } from 'lucide-react';
import { useGameStore } from '../store/useGameStore.js';

export const BoosterBar = () => {
  const {
    boosters,
    activeBooster,
    superAimActive,
    activateBooster,
    gameStatus
  } = useGameStore();

  const isInteractive = gameStatus === 'READY' || gameStatus === 'AIMING';

  const boosterList = [
    {
      id: 'superAim',
      name: 'Super Aim',
      count: boosters.superAim ?? boosters.aimGuide ?? boosters.SUPER_AIM ?? 0,
      iconImg: '/assets/icons/target.png',
      altText: 'Super Aim',
      isActive: superAimActive || activeBooster === 'superAim' || activeBooster === 'aimGuide',
      disabled: !isInteractive || (boosters.superAim ?? boosters.aimGuide ?? 0) <= 0
    },
    {
      id: 'bomb',
      name: 'Bomb',
      count: boosters.bomb ?? boosters.BOMB ?? 0,
      iconImg: '/assets/icons/bomb.png',
      altText: 'Bomb',
      isActive: activeBooster === 'bomb',
      disabled: !isInteractive || (boosters.bomb || 0) <= 0
    },
    {
      id: 'rainbow',
      name: 'Rainbow',
      count: boosters.rainbow ?? boosters.RAINBOW ?? 0,
      iconImg: '/assets/icons/rainbow.png',
      altText: 'Rainbow',
      isActive: activeBooster === 'rainbow',
      disabled: !isInteractive || (boosters.rainbow || 0) <= 0
    },
    {
      id: 'extraShots',
      name: '+5 Shots',
      count: boosters.extraShots ?? boosters.EXTRA_SHOTS ?? 0,
      iconImg: '/assets/icons/plus.png',
      altText: '+5 Shots',
      isActive: false,
      disabled: !isInteractive || (boosters.extraShots || 0) <= 0
    },
    {
      id: 'shuffle',
      name: 'Shuffle',
      count: boosters.shuffle ?? boosters.SHUFFLE ?? 0,
      iconImg: '/assets/icons/shuffle.png',
      altText: 'Shuffle',
      isActive: false,
      disabled: !isInteractive || (boosters.shuffle || 0) <= 0
    }
  ];

  return (
    <div className="w-full max-w-[420px] mx-auto select-none pb-safe pt-1">
      <div className="h-[62px] px-2 py-1 bg-slate-900/95 border border-slate-800 rounded-2xl backdrop-blur-md shadow-2xl flex items-center justify-around gap-1.5">
        {boosterList.map((item) => {
          return (
            <button
              key={item.id}
              onClick={() => !item.disabled && activateBooster(item.id)}
              disabled={item.disabled}
              className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-100 min-w-[48px] min-h-[48px] ${
                item.isActive
                  ? 'bg-amber-400/20 border-2 border-amber-400 border-b-4 border-b-amber-600 ring-2 ring-amber-400/50 shadow-md shadow-black/40 active:translate-y-1 active:border-b-0'
                  : item.disabled
                  ? 'opacity-35 bg-slate-950/60 border border-slate-800/40 cursor-not-allowed'
                  : 'btn-arcade-slate hover:border-slate-600 border-b-4 border-b-slate-950 active:translate-y-1 active:border-b-0'
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

              {/* Standard Asset Image Icon */}
              <img
                src={item.iconImg}
                alt={item.altText}
                className="w-5 h-5 object-contain drop-shadow-sm"
              />

              {/* Label */}
              <span className="text-xs font-display font-bold text-slate-300 leading-tight mt-0.5 truncate max-w-[48px]">
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BoosterBar;
