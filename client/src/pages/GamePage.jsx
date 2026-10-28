/**
 * Core Game Page
 * Integrates GameHUD, CharacterMascot (Bloopi), GameCanvas, BoosterBar, and Phase 2 Modals
 * Bubble Puzzle Engine Presentation Tier
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GameCanvas } from '../components/GameCanvas.jsx';
import { GameHUD } from '../components/GameHUD.jsx';
import { CharacterMascot } from '../components/CharacterMascot.jsx';
import { BoosterBar } from '../components/BoosterBar.jsx';
import { LevelCompleteModal } from '../components/LevelCompleteModal.jsx';
import { GameOverModal } from '../components/GameOverModal.jsx';
import { PauseModal } from '../components/PauseModal.jsx';
import { useGameStore } from '../store/useGameStore.js';
import { GAME_STATES } from '../game/constants.js';
import { GAME_NAME } from '../config/gameConfig.js';

export const GamePage = () => {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const currentId = Number(levelId) || 1;

  const {
    gameStatus,
    gameState,
    initLevel,
    setGameStatus,
    mascotEmotion
  } = useGameStore();

  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    document.title = `Sector ${currentId} — ${GAME_NAME}`;
    initLevel(currentId);
    setIsPaused(false);
  }, [currentId, initLevel]);

  const handleNextLevel = () => {
    navigate(`/game/${currentId + 1}`);
  };

  const handleReplay = () => {
    setIsPaused(false);
    initLevel(currentId);
  };

  const handlePause = () => {
    if (gameStatus === GAME_STATES.LEVEL_COMPLETE || gameStatus === GAME_STATES.LEVEL_FAILED) return;
    setIsPaused(true);
    setGameStatus(GAME_STATES.PAUSED);
  };

  const handleResume = () => {
    setIsPaused(false);
    setGameStatus(GAME_STATES.READY);
  };

  const handleQuitToMap = () => {
    navigate('/levels');
  };

  const isVictory = gameStatus === GAME_STATES.LEVEL_COMPLETE || gameState === 'VICTORY';
  const isGameOver = gameStatus === GAME_STATES.LEVEL_FAILED || gameState === 'GAME_OVER';

  return (
    <div className="h-[calc(100dvh-56px)] max-h-[calc(100dvh-56px)] flex flex-col items-center justify-between py-1 px-2 max-w-[420px] mx-auto select-none overflow-hidden touch-none">
      {/* Tier A: Top HUD (Height ~64px) */}
      <GameHUD onPause={handlePause} onRestart={handleReplay} />

      {/* Tier B: Center Gameplay Arena with Framed Canvas & Reactive Bloopi */}
      <div className="relative w-full max-w-[380px] my-auto flex flex-col items-center flex-1 justify-center">
        {/* Bloopi Mascot Top-Right Reactive Overlay */}
        <div className="absolute -top-3 right-1 z-10 pointer-events-none">
          <CharacterMascot emotion={mascotEmotion || 'idle'} size="sm" />
        </div>

        {/* 60 FPS HTML5 Canvas Viewport */}
        <GameCanvas />
      </div>

      {/* Tier C: Bottom Tactical Booster Dock (Pinned to Bottom, pb-safe) */}
      <BoosterBar />

      {/* Phase 2 Modals */}
      {isVictory && (
        <LevelCompleteModal
          onNextLevel={handleNextLevel}
          onReplay={handleReplay}
          onLevelSelect={handleQuitToMap}
        />
      )}

      {isGameOver && (
        <GameOverModal
          onRetry={handleReplay}
          onBackToMap={handleQuitToMap}
        />
      )}

      {isPaused && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleReplay}
          onQuit={handleQuitToMap}
        />
      )}
    </div>
  );
};

export default GamePage;
