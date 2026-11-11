/**
 * Game Over Defeat Modal
 * King/Supercell Caliber: Sympathetic Mascot Expression, Remaining Objective Tracker,
 * "+5 Extra Shots for 100 Coins" Revive Offer Card, Tactile Retry & Map Actions
 */

import React from 'react';
import { RotateCcw, Home, PlusCircle, Coins, AlertCircle, Bomb } from 'lucide-react';
import { useGameStore } from '../store/useGameStore.js';
import { useUserStore } from '../store/useUserStore';
import CharacterMascot from './CharacterMascot.jsx';
import { cloneGrid, gridToPixel } from '../game/hexGrid.js';
import { findFloatingBubbles } from '../game/floatingDetector.js';

export const GameOverModal = ({ onRetry, onBackToMap, onSelectLevel, onQuit }) => {
  const handleMapAction = onBackToMap || onSelectLevel || onQuit || (() => {
    if (typeof window !== 'undefined') window.location.href = '/levels';
  });

  const {
    score,
    levelId,
    levelData,
    boosters,
    activateBooster,
    bubblesPopped,
    rescuedCount,
    targetJellies,
    failureReason
  } = useGameStore();

  const { coins } = useUserStore();

  const targetJellyCount = targetJellies || levelData?.objective?.target || 3;
  const remainingJellies = Math.max(0, targetJellyCount - (rescuedCount || 0));

  const hasExtraShots = (boosters.extraShots || 0) > 0;
  const hasBombs = (boosters.bomb || 0) > 0;
  const canBuyShots = (coins || 0) >= 100;

  const handleUseExtraShots = () => {
    if (activateBooster('extraShots')) {
      useGameStore.setState({ failureReason: null });
      useGameStore.getState().setGameStatus('READY');
    }
  };

  const handleDeployBomb = () => {
    const store = useGameStore.getState();
    const currentGrid = cloneGrid(store.gridMatrix);
    // Clear lower encroaching bubbles within 3 rows of danger line
    const thresholdY = (store.dangerLineY || 450) - (store.bubbleRadius || 18) * 3;
    for (let r = 0; r < currentGrid.length; r++) {
      if (!currentGrid[r]) continue;
      for (let c = 0; c < currentGrid[r].length; c++) {
        if (currentGrid[r][c]) {
          const pos = gridToPixel(r, c, store.bubbleRadius || 18, store.xOffset || 0, store.yOffset || 0);
          if (pos.y + (store.bubbleRadius || 18) >= thresholdY) {
            currentGrid[r][c] = null;
          }
        }
      }
    }
    const dropped = findFloatingBubbles(currentGrid);
    dropped.forEach(d => { currentGrid[d.row][d.col] = null; });

    const updatedBoosters = {
      ...boosters,
      bomb: Math.max(0, (boosters.bomb || 1) - 1)
    };

    useGameStore.setState({
      gridMatrix: currentGrid,
      board: currentGrid,
      boosters: updatedBoosters,
      boosterInventory: updatedBoosters,
      activeBooster: 'bomb',
      currentBubble: 'bomb',
      gameStatus: 'READY',
      gameState: 'READY',
      failureReason: null,
      bannerNotice: { text: 'BOMB DEPLOYED! DANGER CLEARED!', color: '#F97316', id: Date.now() }
    });
  };

  const handleBuyAndContinue = () => {
    if (canBuyShots) {
      useUserStore.setState((state) => ({ coins: state.coins - 100 }));
      useGameStore.setState((state) => ({ shotsRemaining: state.shotsRemaining + 5, failureReason: null }));
      useGameStore.getState().setGameStatus('READY');
    }
  };

  const isDangerBreach = failureReason === 'Breached the Danger Line!';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-sm clay-card p-6 rounded-3xl text-center shadow-2xl relative overflow-hidden transform animate-in zoom-in-95 duration-200">
        {/* Ambient Defeat Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Sympathetic Mascot Expression */}
        <div className="flex justify-center mb-1">
          <CharacterMascot emotion="sad" size="md" speech={isDangerBreach ? "Watch the danger line! Clear it!" : "So close! We can do it!"} />
        </div>

        <h2 className="font-display font-black text-2xl text-rose-400 uppercase tracking-tight text-shadow-arcade mt-1">
          {isDangerBreach ? 'DANGER LINE BREACHED!' : 'OUT OF SHOTS!'}
        </h2>

        {/* Objective Progress Status */}
        <p className="font-body text-xs font-semibold text-slate-300 mt-1 mb-4">
          {isDangerBreach ? (
            <span className="text-rose-300 font-bold">
              Bubbles crossed the barrier line! Deploy a Cosmic Bomb or retry.
            </span>
          ) : levelData?.objective?.type === 'rescue' || levelData?.objective?.type === 'RESCUE_JELLIES' ? (
            <span className="text-amber-300 font-bold">
              Only {remainingJellies} {remainingJellies === 1 ? 'Jelly' : 'Jellies'} left to rescue!
            </span>
          ) : (
            <span>Don't give up! Aim for higher ceiling drops!</span>
          )}
        </p>

        {/* Quick Revive / Continue Offer Card */}
        <div className="bg-slate-950/90 p-3.5 rounded-2xl border border-slate-800 mb-4 flex flex-col gap-2 shadow-inner">
          <span className="text-[10px] font-display font-black text-amber-400 uppercase tracking-wider block">
            Emergency Revive & Boosters
          </span>

          {/* Option A: Deploy Bomb Booster */}
          {hasBombs ? (
            <button
              onClick={handleDeployBomb}
              className="w-full min-h-[48px] py-2.5 px-3 btn-arcade-gold rounded-xl flex items-center justify-center gap-2 text-slate-950 font-display font-black text-xs border-b-4 border-amber-700 active:translate-y-1 active:border-b-0 shadow-lg"
            >
              <img src="/assets/icons/bomb.png" alt="Bomb" className="w-4 h-4 object-contain" />
              <span>Deploy Cosmic Bomb ({boosters.bomb} in bag)</span>
            </button>
          ) : null}

          {/* Option B: Use Extra Shots */}
          {hasExtraShots ? (
            <button
              onClick={handleUseExtraShots}
              className="w-full min-h-[48px] py-2.5 px-3 btn-arcade-emerald rounded-xl flex items-center justify-center gap-2 text-slate-950 font-display font-black text-xs border-b-4 border-emerald-800 active:translate-y-1 active:border-b-0"
            >
              <img src="/assets/icons/plus.png" alt="Plus" className="w-4 h-4 object-contain" />
              <span>Use +5 Extra Shots ({boosters.extraShots} in bag)</span>
            </button>
          ) : !hasBombs ? (
            <button
              onClick={handleBuyAndContinue}
              disabled={!canBuyShots}
              className={`w-full min-h-[48px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-display font-black transition-all ${
                canBuyShots
                  ? 'btn-arcade-gold text-slate-950 border-b-4 border-amber-700 active:translate-y-1 active:border-b-0'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
              }`}
            >
              <img src="/assets/icons/coin.png" alt="Coins" className="w-4 h-4 object-contain" />
              <span>Get +5 Extra Shots for 100 Coins</span>
            </button>
          ) : null}
        </div>

        {/* Stats Preview Card */}
        <div className="bg-slate-950/60 px-4 py-2.5 rounded-xl border border-slate-800/80 mb-4 flex items-center justify-between text-xs font-display">
          <span className="text-slate-400 font-body font-semibold">Score Achieved</span>
          <span className="text-base font-black text-white">{score.toLocaleString()}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onRetry}
            className="w-full h-12 min-h-[48px] btn-arcade-crimson rounded-2xl flex items-center justify-center gap-2 text-white font-display font-black text-sm tracking-wide uppercase border-b-4 border-rose-900 active:translate-y-1 active:border-b-0"
          >
            <RotateCcw className="w-4 h-4 text-white" />
            <span>Retry Level</span>
          </button>

          <button
            onClick={handleMapAction}
            className="w-full min-h-[48px] py-2 btn-arcade-slate rounded-2xl flex items-center justify-center gap-1.5 text-xs font-display font-bold text-slate-300 border-b-4 border-slate-950 active:translate-y-1 active:border-b-0"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Back to Map</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
