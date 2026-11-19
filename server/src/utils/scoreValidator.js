/**
 * Server-Side Authoritative Score Validation & Anti-Cheat Engine
 * Bubble Puzzle Engine Backend
 */

/**
 * Calculates theoretical envelope score ceiling
 * Max Score = (Pops * 150) + (Combos * 500) + (Rescues * 300) + (Remaining Shots * 250) + 2500
 */
export function calculateTheoreticalMaxScore(bubblesPopped = 0, bestCombo = 0, rescuedCount = 0, remainingShots = 0) {
  const popCeiling = Math.max(0, bubblesPopped) * 150;
  const comboCeiling = Math.max(0, bestCombo) * 500;
  const rescueCeiling = Math.max(0, rescuedCount) * 300;
  const remainingShotsCeiling = Math.max(0, remainingShots) * 250;
  const baseCompletionEnvelope = 2500;

  return popCeiling + comboCeiling + rescueCeiling + remainingShotsCeiling + baseCompletionEnvelope;
}

/**
 * Validates a game completion submission against anti-cheat invariants
 *
 * @param {object} session - Active GameSession document
 * @param {object} level - Level configuration document
 * @param {object} submission - Client payload { shotsUsed, bubblesPopped, score, bestCombo, rescuedCount, completed }
 * @returns {{
 *   isValid: boolean,
 *   reasons: Array<{ rule: string, message: string }>,
 *   theoreticalMaxScore: number,
 *   verifiedStars: number
 * }}
 */
export function validateGameScore(session, level, submission) {
  const reasons = [];

  // 1. Session Nonce & Replay Protection
  if (!session) {
    return {
      isValid: false,
      reasons: [{ rule: 'INVALID_SESSION', message: 'Game session does not exist or expired.' }],
      theoreticalMaxScore: 0,
      verifiedStars: 0
    };
  }

  if (session.status !== 'ACTIVE') {
    return {
      isValid: false,
      reasons: [{ rule: 'SESSION_REPLAY_ATTACK', message: `Session already closed with status: ${session.status}` }],
      theoreticalMaxScore: 0,
      verifiedStars: 0
    };
  }

  // 2. Minimum Elapsed Time Validation (>= 3.0 seconds speedrun barrier)
  const startTime = new Date(session.startedAt || session.startTime || Date.now()).getTime();
  const now = Date.now();
  const elapsedSeconds = (now - startTime) / 1000;

  if (submission.completed && elapsedSeconds < 3.0) {
    reasons.push({
      rule: 'IMPOSSIBLE_SPEEDRUN',
      message: `Completed in ${elapsedSeconds.toFixed(2)}s. Minimum physiological threshold is 3.0s.`
    });
  }

  // 3. Shot Budget Verification
  const allowedShots = level.maxShots || level.shots || level.shotBudget || 30;
  const boostersUsed = submission.boostersUsed || session.boostersUsed || 0;
  const maxPermittedShots = allowedShots + boostersUsed * 5;

  if (submission.shotsUsed > maxPermittedShots) {
    reasons.push({
      rule: 'SHOT_BUDGET_OVERFLOW',
      message: `Claimed shotsUsed (${submission.shotsUsed}) exceeds permitted limit (${maxPermittedShots}).`
    });
  }

  // 4. Theoretical Score Envelope Calculation
  const remainingShots = Math.max(0, maxPermittedShots - submission.shotsUsed);
  const theoreticalMax = calculateTheoreticalMaxScore(
    submission.bubblesPopped,
    submission.bestCombo,
    submission.rescuedCount,
    remainingShots
  );

  if (submission.score > theoreticalMax) {
    reasons.push({
      rule: 'THEORETICAL_SCORE_OVERFLOW',
      message: `Claimed score (${submission.score}) exceeds theoretical envelope ceiling (${theoreticalMax}).`
    });
  }

  // 5. Authoritative Star Calculation from Calibrated Thresholds
  const totalBubbles = level.bubbleCount || (level.matrix ? level.matrix.reduce((sum, r) => sum + (r ? r.filter(Boolean).length : 0), 0) : 30);
  const maxShots = level.maxShots || 30;
  const baseClear = totalBubbles * 10 + 1000;
  const dynOne = Math.max(500, Math.round((baseClear * 0.5) / 50) * 50);
  const dynTwo = Math.max(dynOne + 500, Math.round((baseClear * 0.85) / 50) * 50);
  const dynThree = Math.max(dynTwo + 1000, Math.round((totalBubbles * 40 + maxShots * 0.45 * 150 + 2000) / 50) * 50);

  const rawThresholds = level.starThresholds || level.starScoreThresholds;
  const thresholds = rawThresholds ? {
    oneStar: Math.min(rawThresholds.oneStar || dynOne, dynOne),
    twoStar: Math.min(rawThresholds.twoStar || dynTwo, dynTwo),
    threeStar: Math.min(rawThresholds.threeStar || dynThree, dynThree)
  } : {
    oneStar: dynOne,
    twoStar: dynTwo,
    threeStar: dynThree
  };

  let verifiedStars = 0;
  if (submission.score >= thresholds.threeStar) {
    verifiedStars = 3;
  } else if (submission.score >= thresholds.twoStar) {
    verifiedStars = 2;
  } else if (submission.score >= thresholds.oneStar || submission.completed) {
    verifiedStars = 1;
  }

  return {
    isValid: reasons.length === 0,
    reasons,
    theoreticalMaxScore: theoreticalMax,
    verifiedStars,
    elapsedSeconds
  };
}

export default {
  calculateTheoreticalMaxScore,
  validateGameScore
};
