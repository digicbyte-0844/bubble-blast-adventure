/**
 * Master 3-Tier Flexbox Architecture for Mobile WebGL/Canvas Game
 * Fills exact 100dvh, non-scrollable, safe-area padded, auto-adjusting layout
 */

import React from 'react';
import { GameHUD } from '../components/GameHUD.jsx';
import { BoardWrapper } from '../components/BoardWrapper.jsx';
import { BottomDock } from '../components/BottomDock.jsx';
import { LevelCompleteModal } from '../components/LevelCompleteModal.jsx';
import { GameOverModal } from '../components/GameOverModal.jsx';
import { PauseModal } from '../components/PauseModal.jsx';
import { useGameStore } from '../store/useGameStore.js';
import { GAME_STATES } from '../game/constants.js';

export const GameLayout = ({
  onPause,
  onResume,
  onRestart,
  onNextLevel,
  onQuitToMap,
  isPaused
}) => {
  const { gameStatus, gameState } = useGameStore();

  const isVictory = gameStatus === GAME_STATES.LEVEL_COMPLETE || gameState === 'VICTORY';
  const isGameOver = gameStatus === GAME_STATES.LEVEL_FAILED || gameState === 'GAME_OVER';

  return (
    <div className="w-full h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col justify-between bg-[#0B0F19] text-white select-none touch-none overscroll-none relative">
      <h1 className="sr-only">Active Mission Gameplay — Sector Arena</h1>

      {/* Tier A: Fixed Top HUD (Safe area padded) */}
      <GameHUD onPause={onPause} onRestart={onRestart} onQuitToMap={onQuitToMap} />

      {/* Tier B: Middle Canvas Container (Absorbs 100% of remaining vertical space) */}
      <BoardWrapper />

      {/* Tier C: Fixed Bottom Menu / Booster Dock (Safe area padded) */}
      <BottomDock />

      {/* Full-Screen Absolute Modal Overlays (Cover entire 100dvh, Z-Index 50) */}
      {isPaused && (
        <PauseModal
          onResume={onResume}
          onRestart={onRestart}
          onQuit={onQuitToMap}
          onBackToMap={onQuitToMap}
          onSelectLevel={onQuitToMap}
        />
      )}

      {isVictory && (
        <LevelCompleteModal
          onNextLevel={onNextLevel}
          onReplay={onRestart}
          onSelectLevel={onQuitToMap}
          onLevelSelect={onQuitToMap}
          onBackToMap={onQuitToMap}
          onQuit={onQuitToMap}
        />
      )}

      {isGameOver && (
        <GameOverModal
          onRetry={onRestart}
          onSelectLevel={onQuitToMap}
          onBackToMap={onQuitToMap}
          onQuit={onQuitToMap}
          onLevelSelect={onQuitToMap}
        />
      )}
    </div>
  );
};

export default GameLayout;
