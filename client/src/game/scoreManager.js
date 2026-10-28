/**
 * Deterministic Scoring Engine & 3-Star Threshold Evaluation
 * Bubble Puzzle Engine Engine
 */

import { SCORING } from './constants.js';

/**
 * Returns the combo multiplier based on consecutive successful match streak
 *
 * @param {number} streak - Consecutive match count
 * @returns {number} Multiplier (1x, 2x, 3x ... up to 10x)
 */
export function getComboMultiplier(streak) {
  if (streak <= 1) return 1;
  return Math.min(SCORING.COMBO_MAX_MULTIPLIER, streak);
}

/**
 * Deterministic calculation for points earned during a single shot resolution
 *
 * @param {number} poppedCount - Number of bubbles popped in matching cluster
 * @param {number} floatingCount - Number of unsupported floating bubbles dropped
 * @param {number} rescuedCount - Number of Starlight Jellies freed
 * @param {number} streak - Current consecutive match streak
 * @returns {{
 *   popPoints: number,
 *   clusterBonus: number,
 *   floatingPoints: number,
 *   rescuePoints: number,
 *   multiplier: number,
 *   totalTurnScore: number
 * }}
 */
export function calculateTurnScore(poppedCount, floatingCount, rescuedCount = 0, streak = 1) {
  const multiplier = getComboMultiplier(streak);

  // 1. Base pop points (+10 per popped bubble)
  const popPoints = poppedCount * SCORING.BASE_POP;

  // 2. Cluster size bonus (+15 extra per bubble above 3)
  const extraBubbles = Math.max(0, poppedCount - 3);
  const clusterBonus = extraBubbles * SCORING.CLUSTER_BONUS;

  // 3. Floating drop points (+20 per dropped bubble multiplied by combo)
  const floatingPoints = floatingCount * SCORING.FLOATING_DROP * multiplier;

  // 4. Starlight Jelly rescue points (+100 per rescued jelly)
  const rescuePoints = rescuedCount * SCORING.RESCUE_BONUS;

  const totalTurnScore = popPoints + clusterBonus + floatingPoints + rescuePoints;

  return {
    popPoints,
    clusterBonus,
    floatingPoints,
    rescuePoints,
    multiplier,
    totalTurnScore
  };
}

/**
 * Calculates end-of-level victory bonus based on unused ammo budget
 *
 * @param {number} remainingShots - Unused shot budget
 * @returns {number} Bonus points
 */
export function calculateEndLevelBonus(remainingShots) {
  const shotBonus = Math.max(0, remainingShots) * SCORING.REMAINING_SHOT_BONUS;
  return shotBonus + SCORING.LEVEL_COMPLETE_BONUS;
}

/**
 * Authoritative 3-star threshold evaluation
 *
 * @param {number} score - Cumulative player score
 * @param {Array<number>} starThresholds - [1-star, 2-star, 3-star] point thresholds
 * @returns {number} 0, 1, 2, or 3 stars
 */
export function calculateStars(score, starThresholds = [1000, 2500, 4500]) {
  if (!starThresholds || starThresholds.length < 3) return score > 0 ? 1 : 0;

  if (score >= starThresholds[2]) return 3;
  if (score >= starThresholds[1]) return 2;
  if (score >= starThresholds[0]) return 1;
  return 0;
}

/**
 * Calculates progress percentage towards 3 stars (0% to 100%)
 */
export function calculateStarProgress(score, starThresholds = [1000, 2500, 4500]) {
  const maxThreshold = starThresholds[2] || 5000;
  return Math.min(100, Math.max(0, Math.round((score / maxThreshold) * 100)));
}

/**
 * Stateful Score Tracker class for managing in-game live score sessions
 */
export class ScoreManager {
  constructor(starThresholds = [1000, 2500, 4500]) {
    this.starThresholds = starThresholds;
    this.score = 0;
    this.comboStreak = 0;
    this.highestCombo = 0;
    this.totalPopped = 0;
    this.totalDropped = 0;
    this.totalRescued = 0;
  }

  recordMatch(poppedCount, floatingCount, rescuedCount = 0) {
    this.comboStreak++;
    if (this.comboStreak > this.highestCombo) {
      this.highestCombo = this.comboStreak;
    }

    this.totalPopped += poppedCount;
    this.totalDropped += floatingCount;
    this.totalRescued += rescuedCount;

    const turn = calculateTurnScore(poppedCount, floatingCount, rescuedCount, this.comboStreak);
    this.score += turn.totalTurnScore;
    return turn;
  }

  recordMiss() {
    this.comboStreak = 0;
  }

  finalizeVictory(remainingShots) {
    const bonus = calculateEndLevelBonus(remainingShots);
    this.score += bonus;
    const stars = calculateStars(this.score, this.starThresholds);
    return {
      finalScore: this.score,
      bonus,
      stars,
      highestCombo: this.highestCombo
    };
  }

  getStars() {
    return calculateStars(this.score, this.starThresholds);
  }

  getProgress() {
    return calculateStarProgress(this.score, this.starThresholds);
  }

  reset(newThresholds = null) {
    if (newThresholds) this.starThresholds = newThresholds;
    this.score = 0;
    this.comboStreak = 0;
    this.highestCombo = 0;
    this.totalPopped = 0;
    this.totalDropped = 0;
    this.totalRescued = 0;
  }
}

export default {
  getComboMultiplier,
  calculateTurnScore,
  calculateEndLevelBonus,
  calculateStars,
  calculateStarProgress,
  ScoreManager
};
