/**
 * Top In-Game HUD (Height ~64px, Safe-Area Padded)
 * King/Supercell Caliber: Level Badge, Center Objective Pill, Live 3-Star Meter, Tactile Undo & Pause
 */

import React, { useMemo } from 'react';
import { Pause, Undo2, Star, Sparkles, AlertCircle, Menu, ChevronLeft } from 'lucide-react';
import { useGameStore } from '../store/useGameStore.js';
import { calculateStarProgress, calculateStars } from '../game/scoreManager.js';

export const GameHUD = ({ onPause, onRestart, onQuitToMap }) => {
  const {
    levelId,
    levelData,
    score,
    shotsRemaining,
    combo,
    comboCount,
    rescuedCount,
    rescuedJellies,
    targetJellies,
    undoStack,
    undoShot,
    gameStatus
  } = useGameStore();

  const activeCombo = combo || comboCount || 0;
  const currentRescued = rescuedCount || rescuedJellies || 0;

  // Star calculation
  const starThresholds = useMemo(() => {
    return [
      levelData?.starScoreThresholds?.oneStar || 2000,
      levelData?.starScoreThresholds?.twoStar || 4000,
      levelData?.starScoreThresholds?.threeStar || 7000
    ];
  }, [levelData]);

  const earnedStars = calculateStars(score, starThresholds);
  const progressPercent = calculateStarProgress(score, starThresholds);

  const canUndo = undoStack && undoStack.length > 0 && (gameStatus === 'READY' || gameStatus === 'AIMING');

  // Objective representation
  const objectiveElement = useMemo(() => {
    if (!levelData?.objective) return (
      <span className="inline-flex items-center gap-1">
        <img src="/assets/icons/bubble.png" alt="Bubble" className="w-3.5 h-3.5 object-contain drop-shadow-sm inline-block" />
        <span>Clear Grid</span>
      </span>
    );
    const type = levelData.objective.type;
    if (type === 'rescue' || type === 'RESCUE_JELLIES') {
      const target = targetJellies || levelData.objective.target || 3;
      return (
        <span className="inline-flex items-center gap-1">
          <img src="/assets/icons/star.png" alt="Star" className="w-3.5 h-3.5 object-contain drop-shadow-sm inline-block" />
          <span>{currentRescued}/{target} Rescued</span>
        </span>
      );
    }
    if (type === 'target_score' || type === 'TARGET_SCORE') {
      const target = levelData.objective.target || 5000;
      return (
        <span className="inline-flex items-center gap-1">
          <img src="/assets/icons/target.png" alt="Target" className="w-3.5 h-3.5 object-contain drop-shadow-sm inline-block" />
          <span>{score.toLocaleString()}/{target.toLocaleString()}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1">
        <img src="/assets/icons/bubble.png" alt="Bubble" className="w-3.5 h-3.5 object-contain drop-shadow-sm inline-block" />
        <span>Clear All Bubbles</span>
      </span>
    );
  }, [levelData, currentRescued, targetJellies, score]);

  return (
    <header className="w-full h-16 flex-shrink-0 select-none pt-[max(env(safe-area-inset-top),0.5rem)] px-3 max-w-[440px] mx-auto z-20 flex items-center">
      <div className="w-full h-[52px] px-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl backdrop-blur-md shadow-xl flex items-center justify-between gap-2">
        {/* Left: Tactical Level Indicator / Back to Map Trigger */}
        <button
          onClick={onQuitToMap}
          className="flex items-center gap-1.5 p-1 -ml-0.5 rounded-xl hover:bg-slate-800/80 border-b-4 border-slate-950 active:translate-y-1 active:border-b-0 transition-all flex-shrink-0 min-h-[48px] min-w-[48px]"
          title="Back to Saga Map"
          aria-label="Back to map"
        >
          <span className="w-8 h-8 rounded-xl bg-gradient-to-b from-sky-400 to-sky-600 border border-sky-400/40 border-b-2 border-b-sky-700 flex items-center justify-center font-display font-black text-xs text-slate-950 shadow-sm">
            {levelId}
          </span>
          <div className="flex flex-col text-left">
            <span className="font-display font-black text-xs text-white leading-none">
              LVL {levelId}
            </span>
            <span className="font-body text-[10px] text-amber-400 font-bold tracking-tight">
              ‹ Map
            </span>
          </div>
        </button>

        {/* Center: Objective Pill + Live 3-Star Micro-Bar */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-[190px]">
          {/* Objective Pill */}
          <div className="w-full text-center py-0.5 px-2 rounded-full bg-slate-950/80 border border-slate-800 text-xs font-display font-black text-amber-300 truncate shadow-inner flex items-center justify-center">
            {objectiveElement}
          </div>

          {/* Live 3-Star Meter */}
          <div className="relative w-full h-2 bg-slate-950 rounded-full mt-1.5 overflow-hidden border border-slate-800/80">
            <div
              className="h-full bg-gradient-to-r from-sky-400 via-amber-400 to-yellow-300 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
            {/* 1-Star Marker */}
            <div className="absolute top-0 bottom-0 left-[28%] flex items-center justify-center pointer-events-none">
              <Star className={`w-2 h-2 ${earnedStars >= 1 ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
            </div>
            {/* 2-Star Marker */}
            <div className="absolute top-0 bottom-0 left-[58%] flex items-center justify-center pointer-events-none">
              <Star className={`w-2 h-2 ${earnedStars >= 2 ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
            </div>
            {/* 3-Star Marker */}
            <div className="absolute top-0 bottom-0 right-1.5 flex items-center justify-center pointer-events-none">
              <Star className={`w-2 h-2 ${earnedStars >= 3 ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
            </div>
          </div>
        </div>

        {/* Right: Tactile Utility Controls (Undo & In-Game Menu) */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Undo Action Button with 3D tactile press */}
          <button
            onClick={() => undoShot()}
            disabled={!canUndo}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all min-h-[48px] min-w-[44px] ${
              canUndo
                ? 'btn-arcade-slate text-sky-400 hover:text-white border-b-4 border-slate-950 active:translate-y-1 active:border-b-0'
                : 'bg-slate-950/40 border border-slate-800 text-slate-700 cursor-not-allowed opacity-50'
            }`}
            title="Undo Last Shot"
            aria-label="Undo shot"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          {/* Menu / Pause Action Button with 3D tactile press */}
          <button
            onClick={onPause}
            className="h-11 px-2.5 btn-arcade-slate rounded-xl flex items-center justify-center gap-1 text-amber-300 hover:text-white transition-all border border-slate-700/60 border-b-4 border-b-slate-950 active:translate-y-1 active:border-b-0 min-h-[48px] min-w-[48px]"
            title="Game Menu"
            aria-label="Pause and open menu"
          >
            <Menu className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-display font-black tracking-tight uppercase">Menu</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default GameHUD;
