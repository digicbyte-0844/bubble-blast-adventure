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
    gameStatus,
    recentBombReward
  } = useGameStore();

  const isInteractive = gameStatus === 'READY' || gameStatus === 'AIMING';
  const isBombRewarded = recentBombReward && Date.now() - recentBombReward < 2400;

  const aimCount = boosters?.superAim ?? boosters?.aimGuide ?? boosters?.SUPER_AIM ?? 5;
  const bombCount = boosters?.bomb ?? boosters?.BOMB ?? 5;
  const rainbowCount = boosters?.rainbow ?? boosters?.RAINBOW ?? 5;
  const extraShotsCount = boosters?.extraShots ?? boosters?.EXTRA_SHOTS ?? 5;
  const shuffleCount = boosters?.shuffle ?? boosters?.SHUFFLE ?? 5;

  const boosterList = [
    {
      id: 'superAim',
      name: 'Super Aim',
      count: aimCount,
      iconImg: '/assets/icons/target.png',
      altText: 'Super Aim',
      isActive: superAimActive || activeBooster === 'superAim' || activeBooster === 'aimGuide',
      disabled: !isInteractive || aimCount <= 0,
      gradient: 'from-sky-400 via-blue-500 to-indigo-700',
      border: 'border-b-indigo-950',
      shadow: 'shadow-blue-500/25'
    },
    {
      id: 'bomb',
      name: 'Bomb',
      count: bombCount,
      iconImg: '/assets/icons/bomb.png',
      altText: 'Bomb',
      isActive: activeBooster === 'bomb',
      disabled: !isInteractive || bombCount <= 0,
      gradient: 'from-amber-400 via-orange-500 to-red-600',
      border: 'border-b-red-950',
      shadow: 'shadow-orange-500/35'
    },
    {
      id: 'rainbow',
      name: 'Rainbow',
      count: rainbowCount,
      iconImg: '/assets/icons/rainbow.png',
      altText: 'Rainbow',
      isActive: activeBooster === 'rainbow',
      disabled: !isInteractive || rainbowCount <= 0,
      gradient: 'from-pink-500 via-purple-500 to-indigo-600',
      border: 'border-b-purple-950',
      shadow: 'shadow-purple-500/30'
    },
    {
      id: 'extraShots',
      name: '+5 Shots',
      count: extraShotsCount,
      iconImg: '/assets/icons/plus.png',
      altText: '+5 Shots',
      isActive: false,
      disabled: !isInteractive || extraShotsCount <= 0,
      gradient: 'from-emerald-400 via-teal-500 to-emerald-700',
      border: 'border-b-teal-950',
      shadow: 'shadow-emerald-500/25'
    },
    {
      id: 'shuffle',
      name: 'Shuffle',
      count: shuffleCount,
      iconImg: '/assets/icons/shuffle.png',
      altText: 'Shuffle',
      isActive: false,
      disabled: !isInteractive || shuffleCount <= 0,
      gradient: 'from-violet-400 via-purple-600 to-fuchsia-700',
      border: 'border-b-fuchsia-950',
      shadow: 'shadow-purple-500/25'
    }
  ];

  return (
    <div className="w-full max-w-[440px] mx-auto select-none pb-safe pt-1">
      <div className="h-[62px] px-2 py-1 bg-slate-900/95 border border-slate-800 rounded-2xl backdrop-blur-md shadow-2xl flex items-center justify-around gap-1.5">
        {boosterList.map((item) => {
          const isBombSlot = item.id === 'bomb';
          return (
            <button
              key={item.id}
              onClick={() => !item.disabled && activateBooster(item.id)}
              disabled={item.disabled}
              className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-150 min-w-[48px] min-h-[48px] border-b-4 ${
                item.isActive
                  ? `bg-gradient-to-b ${item.gradient} ${item.border} ring-2 ring-yellow-300 scale-105 shadow-lg active:translate-y-1 active:border-b-0`
                  : item.disabled
                  ? 'opacity-35 bg-slate-950/60 border border-slate-800/40 cursor-not-allowed border-b-slate-950'
                  : `bg-gradient-to-b ${item.gradient} ${item.border} ${item.shadow} shadow-md hover:scale-105 active:translate-y-1 active:border-b-0 active:scale-95`
              }`}
              title={`${item.name} (${item.count} in bag)`}
              aria-label={item.name}
            >
              {/* Floating +1 BOMB! Reward Badge Animation */}
              {isBombSlot && isBombRewarded && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 text-slate-950 font-display font-black text-[9px] shadow-xl animate-bounce whitespace-nowrap z-30 border border-yellow-200">
                  +1 BOMB!
                </span>
              )}

              {/* Count Badge */}
              <span
                className={`absolute -top-1.5 -right-1 text-xs font-display font-black px-1.5 py-0.5 rounded-full border shadow-sm ${
                  item.count > 0
                    ? 'bg-amber-300 text-slate-950 border-amber-200 shadow-md'
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
              <span className="text-xs font-display font-bold text-white leading-tight mt-0.5 truncate max-w-[48px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
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
