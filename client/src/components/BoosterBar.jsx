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
      id: 'aimGuide',
      name: 'Super Aim',
      count: boosters.aimGuide ?? boosters.SUPER_AIM ?? 0,
      icon: Target,
      accent: 'text-sky-400',
      isActive: superAimActive || activeBooster === 'aimGuide',
      disabled: !isInteractive || (boosters.aimGuide || 0) <= 0
    },
    {
      id: 'bomb',
      name: 'Bomb',
      count: boosters.bomb ?? boosters.BOMB ?? 0,
      icon: Bomb,
      accent: 'text-rose-400',
      isActive: activeBooster === 'bomb',
      disabled: !isInteractive || (boosters.bomb || 0) <= 0
    },
    {
      id: 'rainbow',
      name: 'Rainbow',
      count: boosters.rainbow ?? boosters.RAINBOW ?? 0,
      icon: Sparkles,
      accent: 'text-amber-300',
      isActive: activeBooster === 'rainbow',
      disabled: !isInteractive || (boosters.rainbow || 0) <= 0
    },
    {
      id: 'extraShots',
      name: '+5 Shots',
      count: boosters.extraShots ?? boosters.EXTRA_SHOTS ?? 0,
      icon: PlusCircle,
      accent: 'text-emerald-400',
      isActive: false,
      disabled: !isInteractive || (boosters.extraShots || 0) <= 0
    },
    {
      id: 'shuffle',
      name: 'Shuffle',
      count: boosters.shuffle ?? boosters.SHUFFLE ?? 0,
      icon: Shuffle,
      accent: 'text-purple-400',
      isActive: false,
      disabled: !isInteractive || (boosters.shuffle || 0) <= 0
    }
  ];

  return (
    <div className="w-full max-w-[420px] mx-auto select-none pb-safe pt-1">
      <div className="h-[60px] px-2 py-1 bg-slate-900/90 border border-slate-800 rounded-2xl backdrop-blur-md shadow-2xl flex items-center justify-around gap-1">
        {boosterList.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => !item.disabled && activateBooster(item.id)}
              disabled={item.disabled}
              className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-100 min-w-[48px] min-h-[48px] ${
                item.isActive
                  ? 'bg-amber-400/20 border-2 border-amber-400 ring-2 ring-amber-400/50 shadow-md shadow-black/40 transform scale-105'
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
