/**
 * Core Game Page
 * Integrates GameLayout (3-Tier Master Mobile WebGL/Canvas Architecture)
 * Bubble Puzzle Engine Presentation Tier
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GameLayout } from '../layouts/GameLayout.jsx';
import { useGameStore } from '../store/useGameStore.js';
import { GAME_STATES } from '../game/constants.js';
import { GAME_NAME } from '../config/gameConfig.js';

export const GamePage = () => {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const currentId = Number(levelId) || 1;

  const {
    gameStatus,
    initLevel,
    setGameStatus
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

  return (
    <GameLayout
      onPause={handlePause}
      onResume={handleResume}
      onRestart={handleReplay}
      onNextLevel={handleNextLevel}
      onQuitToMap={handleQuitToMap}
      isPaused={isPaused}
    />
  );
};

export default GamePage;
