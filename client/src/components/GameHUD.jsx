/**
 * Top In-Game HUD (Height ~64px, Safe-Area Padded)
 * King/Supercell Caliber: Level Badge, Center Objective Pill, Live 3-Star Meter, Tactile Undo & Pause
 */

import React, { useMemo } from 'react';
import { Pause, Undo2, Star, Sparkles, AlertCircle } from 'lucide-react';
import { useGameStore } from '../store/useGameStore.js';
import { calculateStarProgress, calculateStars } from '../game/scoreManager.js';

export const GameHUD = ({ onPause, onRestart }) => {
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
  const objectiveText = useMemo(() => {
    if (!levelData?.objective) return 'Clear Grid';
    const type = levelData.objective.type;
    if (type === 'rescue' || type === 'RESCUE_JELLIES') {
      const target = targetJellies || levelData.objective.target || 3;
      return `🌟 ${currentRescued}/${target} Rescued`;
    }
    if (type === 'target_score' || type === 'TARGET_SCORE') {
      const target = levelData.objective.target || 5000;
      return `🎯 ${score.toLocaleString()}/${target.toLocaleString()}`;
    }
    return `🫧 Clear All Bubbles`;
  }, [levelData, currentRescued, targetJellies, score]);

  return (
    <header className="w-full h-16 flex-shrink-0 select-none pt-[max(env(safe-area-inset-top),0.5rem)] px-3 max-w-[440px] mx-auto z-20 flex items-center">
      <div className="w-full h-12 px-3 bg-slate-900/90 border border-slate-800 rounded-2xl backdrop-blur-md shadow-xl flex items-center justify-between gap-2">
        {/* Left: Compact Level Indicator Badge */}
        <div className="flex flex-col flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-b from-sky-400 to-sky-600 border border-sky-400/40 flex items-center justify-center font-display font-black text-xs text-slate-950 shadow-sm">
              {levelId}
            </span>
            <div className="flex flex-col">
              <span className="font-display font-black text-xs text-white leading-none">
                LVL {levelId}
              </span>
              <span className="font-body text-xs text-slate-400 font-semibold truncate max-w-[70px]">
                {levelData?.world || 'Reef'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Objective Pill + Live 3-Star Micro-Bar */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-[190px]">
          {/* Objective Pill */}
          <div className="w-full text-center py-0.5 px-2 rounded-full bg-slate-950/80 border border-slate-800 text-xs font-display font-black text-amber-300 truncate shadow-inner">
            {objectiveText}
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

        {/* Right: Tactile Utility Controls (Undo & Pause) */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Undo Action Button */}
          <button
            onClick={() => undoShot()}
            disabled={!canUndo}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
              canUndo
                ? 'btn-arcade-slate text-sky-400 hover:text-white'
                : 'bg-slate-950/40 border border-slate-800 text-slate-700 cursor-not-allowed opacity-50'
            }`}
            title="Undo Last Shot"
            aria-label="Undo shot"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          {/* Pause Action Button */}
          <button
            onClick={onPause}
            className="w-9 h-9 btn-arcade-slate rounded-xl flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-95"
            title="Pause Game"
            aria-label="Pause game"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default GameHUD;
