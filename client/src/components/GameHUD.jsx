/**
 * Top In-Game HUD (Safe-Area Padded)
 * King/Supercell Caliber: Cohesive curved arcade header frame with 3-Star progress checkpoints,
 * elevated objective showcase with scale-bounce reaction, live score & combo ticker,
 * and tactile 3D arcade buttons.
 */

import React, { useMemo } from 'react';
import { Pause, Undo2, Star, Zap } from 'lucide-react';
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
      <span className="inline-flex items-center gap-1.5">
        <img src="/assets/icons/bubble.png" alt="Bubble" className="w-4 h-4 object-contain drop-shadow-sm inline-block" />
        <span>Clear Grid</span>
      </span>
    );
    const type = levelData.objective.type;
    if (type === 'rescue' || type === 'RESCUE_JELLIES') {
      const target = targetJellies || levelData.objective.target || 3;
      return (
        <span className="inline-flex items-center gap-1.5">
          <Star className="w-4 h-4 fill-amber-400 text-amber-300 drop-shadow-sm inline-block" />
          <span>{currentRescued} / {target} Rescued</span>
        </span>
      );
    }
    if (type === 'target_score' || type === 'TARGET_SCORE') {
      const target = levelData.objective.target || 5000;
      return (
        <span className="inline-flex items-center gap-1.5">
          <img src="/assets/icons/target.png" alt="Target" className="w-4 h-4 object-contain drop-shadow-sm inline-block" />
          <span>{score.toLocaleString()} / {target.toLocaleString()}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5">
        <img src="/assets/icons/bubble.png" alt="Bubble" className="w-4 h-4 object-contain drop-shadow-sm inline-block" />
        <span>Clear All Bubbles</span>
      </span>
    );
  }, [levelData, currentRescued, targetJellies, score]);

  const objectiveAnimKey = `${currentRescued}-${Math.floor(score / 500)}`;

  return (
    <header className="w-full flex-shrink-0 select-none pt-[max(env(safe-area-inset-top),0.5rem)] px-3 max-w-[440px] mx-auto z-20">
      <div className="w-full py-1.5 px-2.5 bg-slate-900/95 border border-slate-700/80 rounded-3xl backdrop-blur-md shadow-2xl flex items-center justify-between gap-2 relative overflow-visible">
        {/* Subtle Top Gloss Highlight */}
        <div className="absolute top-0 inset-x-4 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent pointer-events-none" />

        {/* Left: Tactical Level Indicator + 3-Star Micro-Track */}
        <div className="flex flex-col items-start gap-1 flex-shrink-0">
          <button
            onClick={onQuitToMap}
            className="flex items-center gap-1.5 p-1 -ml-0.5 rounded-xl hover:bg-slate-800/80 border-b-4 border-slate-950 active:translate-y-1 active:border-b-0 transition-all min-h-[38px]"
            title="Back to Saga Map"
            aria-label="Back to map"
          >
            <span className="w-7 h-7 rounded-xl bg-gradient-to-b from-sky-400 to-sky-600 border border-sky-300/40 border-b-2 border-b-sky-700 flex items-center justify-center font-display font-black text-xs text-slate-950 shadow-sm">
              {levelId}
            </span>
            <div className="flex flex-col text-left leading-none">
              <span className="font-display font-black text-xs text-white">
                LVL {levelId}
              </span>
              <span className="font-display text-[9px] text-amber-400 font-black tracking-tight mt-0.5">
                ‹ MAP
              </span>
            </div>
          </button>

          {/* Integrated 3-Star Progress Meter with 3 Physical Checkpoints */}
          <div className="relative w-20 sm:w-24 h-2 bg-slate-950 rounded-full border border-slate-800/90 shadow-inner flex items-center">
            <div
              className="h-full bg-gradient-to-r from-sky-400 via-amber-400 to-yellow-300 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
            {/* Star Checkpoint 1 (33%) */}
            <div className={`absolute left-[33%] -translate-x-1/2 w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
              earnedStars >= 1
                ? 'bg-amber-400 border-yellow-200 shadow-[0_0_6px_rgba(251,191,36,0.9)] scale-110'
                : 'bg-slate-900 border-slate-700'
            }`}>
              <Star className={`w-2 h-2 ${earnedStars >= 1 ? 'fill-slate-950 text-slate-950' : 'text-slate-600'}`} />
            </div>
            {/* Star Checkpoint 2 (66%) */}
            <div className={`absolute left-[66%] -translate-x-1/2 w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
              earnedStars >= 2
                ? 'bg-amber-400 border-yellow-200 shadow-[0_0_6px_rgba(251,191,36,0.9)] scale-110'
                : 'bg-slate-900 border-slate-700'
            }`}>
              <Star className={`w-2 h-2 ${earnedStars >= 2 ? 'fill-slate-950 text-slate-950' : 'text-slate-600'}`} />
            </div>
            {/* Star Checkpoint 3 (100%) */}
            <div className={`absolute right-0 translate-x-1/2 w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
              earnedStars >= 3
                ? 'bg-amber-400 border-yellow-200 shadow-[0_0_6px_rgba(251,191,36,0.9)] scale-110'
                : 'bg-slate-900 border-slate-700'
            }`}>
              <Star className={`w-2 h-2 ${earnedStars >= 3 ? 'fill-slate-950 text-slate-950' : 'text-slate-600'}`} />
            </div>
          </div>
        </div>

        {/* Center: Elevated Objective Counter Showcase & Live Score Ticker */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-[190px] px-1">
          {/* Objective Showcase Pill */}
          <div
            key={objectiveAnimKey}
            className="w-full text-center py-1 px-2.5 rounded-full bg-slate-950/90 border border-amber-400/40 text-xs font-display font-black text-amber-300 shadow-[0_2px_8px_rgba(0,0,0,0.6)] flex items-center justify-center gap-1 animate-scale-bounce"
          >
            {objectiveElement}
          </div>

          {/* Live Score & Active Combo Multiplier */}
          <div className="flex items-center gap-1.5 mt-1 font-display text-[10px]">
            <span className="text-slate-400 font-bold">
              Score: <span className="text-amber-300 font-black">{score.toLocaleString()}</span>
            </span>
            {activeCombo > 1 && (
              <span className="bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-black px-1.5 py-0.2 rounded-full flex items-center gap-0.5 animate-pulse">
                <Zap className="w-2.5 h-2.5 fill-cyan-400" />
                x{activeCombo}
              </span>
            )}
          </div>
        </div>

        {/* Right: Tactile 3D Action Controls (Undo & In-Game Menu) */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Undo Action Button with 3D tactile press */}
          <button
            onClick={() => undoShot()}
            disabled={!canUndo}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all min-h-[40px] min-w-[40px] ${
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
            className="h-10 px-2.5 btn-arcade-slate rounded-xl flex items-center justify-center gap-1 text-amber-300 hover:text-white transition-all border border-slate-700/60 border-b-4 border-b-slate-950 active:translate-y-1 active:border-b-0 min-h-[40px]"
            title="Game Menu"
            aria-label="Pause and open menu"
          >
            <Pause className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-[10px] font-display font-black tracking-tight uppercase">Pause</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default GameHUD;
