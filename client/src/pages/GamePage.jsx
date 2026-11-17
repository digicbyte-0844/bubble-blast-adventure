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

  // Validate level ID:
  // - Catalog levels: 1 to 40
  // - Level Editor custom preview: 999 (valid only when custom levelData exists in state)
  const parsedId = parseInt(levelId, 10);
  const isCustomPreview = parsedId === 999 && useGameStore.getState().levelData?.id === 999;
  const isStrictInteger = Number.isInteger(parsedId) && String(parsedId) === String(levelId)?.trim();
  const isValidLevel = isStrictInteger && ((parsedId >= 1 && parsedId <= 40) || isCustomPreview);

  const currentId = isValidLevel ? parsedId : 1;

  useEffect(() => {
    if (!isValidLevel) {
      // Gracefully redirect invalid/out-of-range level IDs (e.g., /game/999 without editor state, /game/abc)
      navigate('/levels', { replace: true });
    }
  }, [isValidLevel, navigate]);

  const {
    gameStatus,
    initLevel,
    setGameStatus
  } = useGameStore();

  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isValidLevel) return;
    document.title = `Sector ${currentId} — ${GAME_NAME}`;

    // If custom level editor preview, don't overwrite levelData with procedural level
    if (currentId === 999 && useGameStore.getState().levelData?.id === 999) {
      setIsPaused(false);
      return;
    }

    initLevel(currentId);
    setIsPaused(false);
  }, [currentId, isValidLevel, initLevel]);

  const handleNextLevel = () => {
    if (currentId >= 40) {
      navigate('/levels');
    } else {
      navigate(`/game/${currentId + 1}`);
    }
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
    setIsPaused(false);
    setGameStatus(GAME_STATES.READY);
    navigate('/levels');
  };

  if (!isValidLevel) {
    return null;
  }

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
