/**
 * TypeScript Typings and Re-export for useGameStore
 * Bubble Puzzle Engine Engine
 */

import { useGameStore as store } from './useGameStore.js';

export type GameState =
  | 'LOADING'
  | 'READY'
  | 'AIMING'
  | 'SHOOTING'
  | 'RESOLVING'
  | 'COLLISION'
  | 'MATCH_CHECK'
  | 'POPPING'
  | 'FLOATING_CHECK'
  | 'EVALUATE'
  | 'LEVEL_COMPLETE'
  | 'LEVEL_FAILED'
  | 'PAUSED'
  | 'VICTORY'
  | 'GAME_OVER';

export interface ObjectiveData {
  type: string;
  target: number;
  targetColor?: string | null;
}

export interface LevelData {
  id: number;
  name: string;
  world: string;
  tier?: string;
  objective: ObjectiveData;
  maxShots: number;
  palette: string[];
  matrix: any[][];
  starScoreThresholds: {
    oneStar: number;
    twoStar: number;
    threeStar: number;
  };
}

export const useGameStore = store;
export default useGameStore;
