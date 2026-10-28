/**
 * Level Complete Victory Modal
 * King/Supercell Caliber: Golden Celebration Header, Confetti Particles,
 * Sequential 3-Star Reveal with Sound Cues, Tactile Gold & Slate Buttons
 */

import React, { useEffect, useState } from 'react';
import { Star, RotateCcw, ArrowRight, Map, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../store/useGameStore.js';
import { calculateStars } from '../game/scoreManager.js';
import { soundEngine } from '../game/soundEngine.js';

export const LevelCompleteModal = ({
  onNextLevel,
  onReplay,
  onLevelSelect,
  onSelectLevel,
  onBackToMap,
  onQuit
}) => {
  const handleMapAction = onLevelSelect || onSelectLevel || onBackToMap || onQuit || (() => {
    if (typeof window !== 'undefined') window.location.href = '/levels';
  });

  const {
    levelId,
    score,
    shotsRemaining,
    bubblesPopped,
    bestCombo,
    rescuedCount,
    levelData
  } = useGameStore();

  const [revealedStars, setRevealedStars] = useState(0);

  const starThresholds = [
    levelData?.starScoreThresholds?.oneStar || 2000,
    levelData?.starScoreThresholds?.twoStar || 4000,
    levelData?.starScoreThresholds?.threeStar || 7000
  ];
  const totalStars = calculateStars(score, starThresholds);

  useEffect(() => {
    // Fireworks / Confetti blast
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#FBBF24', '#F59E0B', '#38BDF8', '#34D399', '#FB7185']
      });
    } catch (e) {}

    // Staggered star reveal animation with audio
    const timers = [];
    for (let i = 1; i <= Math.max(1, totalStars); i++) {
      timers.push(
        setTimeout(() => {
          setRevealedStars(i);
          soundEngine.play('star');
        }, i * 350)
      );
    }

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [totalStars]);

  const shotBonus = Math.max(0, shotsRemaining) * 150;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-sm clay-card p-6 rounded-3xl text-center shadow-2xl relative overflow-hidden transform animate-in zoom-in-95 duration-200">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Golden Celebration Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-display font-black uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sector Victory!</span>
        </div>

        <h2 className="font-display font-black text-3xl text-amber-400 uppercase tracking-tight text-shadow-glow leading-none">
          LEVEL COMPLETE!
        </h2>
        <span className="font-body text-xs font-bold text-slate-400 block mt-1 mb-3">
          Sector {levelId} • {levelData?.world || 'Celestial Reef'}
        </span>

        {/* 3 Sequential Big Stars */}
        <div className="flex items-center justify-center gap-3 my-4">
          {[1, 2, 3].map((starIdx) => {
            const isEarned = starIdx <= totalStars;
            const isVisible = starIdx <= revealedStars;
            return (
              <div
                key={starIdx}
                className={`relative flex items-center justify-center transition-all duration-300 ${
                  isVisible
                    ? 'scale-110 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]'
                    : 'scale-90 opacity-25'
                }`}
              >
                <Star
                  className={`w-12 h-12 transition-all ${
                    isEarned && isVisible
                      ? 'text-amber-400 fill-amber-400 animate-beacon'
                      : 'text-slate-700 fill-slate-800'
                  }`}
                  style={{ animationDuration: '1.2s' }}
                />
              </div>
            );
          })}
        </div>

        {/* Stats Breakdown Card */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 mb-5 flex flex-col gap-2 shadow-inner font-display">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-bold font-body">Score Achieved</span>
            <span className="text-xl font-black text-amber-300">{score.toLocaleString()}</span>
          </div>

          <div className="h-px bg-slate-800/80" />

          <div className="flex items-center justify-between text-xs font-body font-semibold">
            <span className="text-slate-400">Shots Saved ({shotsRemaining} remaining)</span>
            <span className="text-emerald-400 font-bold font-display">+{shotBonus.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between text-xs font-body font-semibold">
            <span className="text-slate-400">Bubbles Popped</span>
            <span className="text-sky-400 font-bold font-display">{bubblesPopped}</span>
          </div>

          <div className="flex items-center justify-between text-xs font-body font-semibold">
            <span className="text-slate-400">Best Combo Streak</span>
            <span className="text-amber-400 font-bold font-display">🔥 x{bestCombo || 1}</span>
          </div>

          {rescuedCount > 0 && (
            <div className="flex items-center justify-between text-xs font-body font-semibold">
              <span className="text-slate-400">Mini-Jellies Rescued</span>
              <span className="text-rose-400 font-bold font-display">🌟 {rescuedCount}</span>
            </div>
          )}
        </div>

        {/* Chunky Tactile Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onNextLevel}
            className="w-full h-12 btn-arcade-gold rounded-2xl flex items-center justify-center gap-2 text-slate-950 font-display font-black text-sm tracking-wide uppercase active:translate-y-1"
          >
            <span>Next Level</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onReplay}
              className="py-2.5 btn-arcade-slate rounded-2xl flex items-center justify-center gap-1.5 text-xs font-display font-bold text-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay</span>
            </button>
            <button
              onClick={handleMapAction}
              className="py-2.5 btn-arcade-slate rounded-2xl flex items-center justify-center gap-1.5 text-xs font-display font-bold text-slate-200"
            >
              <Map className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelCompleteModal;
