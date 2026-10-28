// Mathematical Anti-Cheat Verification Pipeline
// Section 14 Server-Side Score Validation & Anti-Cheat

export class AntiCheatService {
  /**
   * Validates player game completion submission against physical bounds and score ceilings
   * @param {Object} session - Authoritative session descriptor
   * @param {Object} claim - Client submission payload
   * @param {Object} level - Level metadata including star thresholds and shot limits
   * @returns {Object} Verification outcome
   */
  static verifySession(session, claim, level) {
    const { allowedShots, startTime } = session;
    const { claimedScore } = claim;

    const errors = [];

    // 1. Timing Validation: Rejects submissions completed in under 3.0 seconds (impossible speedrun)
    const elapsedDurationMs = Number(claim.elapsedDurationMs || 0);
    const serverElapsedMs = startTime ? Date.now() - new Date(startTime).getTime() : elapsedDurationMs;
    const effectiveDuration = elapsedDurationMs > 0 ? elapsedDurationMs : serverElapsedMs;

    if (effectiveDuration < 3000) {
      errors.push({
        rule: 'IMPOSSIBLE_SPEEDRUN',
        message: `Submission completed in under 3.0 seconds (${effectiveDuration}ms). Rejected as impossible speedrun.`
      });
    }

    // 2. Shot Ceiling Checking: Verifies shotsUsed <= level.shots + boostersUsed * 5
    const shotsUsed = Number(claim.shotsFired || claim.shotsUsed || 0);
    const levelShots = Number(level?.maxShots || allowedShots || 30);
    const boostersUsed = Number(claim.boostersUsed || session.boostersEquipped?.length || 0);
    const maxAllowedShots = levelShots + (boostersUsed * 5);

    if (shotsUsed <= 0 || shotsUsed > maxAllowedShots) {
      errors.push({
        rule: 'SHOT_CEILING_EXCEEDED',
        message: `Shots used (${shotsUsed}) exceeds maximum allowed ceiling (${maxAllowedShots} = ${levelShots} + ${boostersUsed} * 5).`
      });
    }

    // 3. Theoretical Score Envelope:
    // Max Score = (Pops * 150) + (Combos * 500) + (Rescues * 300) + (Remaining Shots * 250) + 2500
    const pops = Number(claim.bubblesPopped ?? claim.pops ?? Math.max(0, shotsUsed * 3));
    const combos = Number(claim.comboRecord ?? claim.combos ?? 0);
    const rescues = Number(claim.rescuedJellies ?? claim.rescues ?? 0);
    const remainingShots = Number(claim.remainingShots ?? Math.max(0, maxAllowedShots - shotsUsed));

    const theoreticalMaxScore = (pops * 150) + (combos * 500) + (rescues * 300) + (remainingShots * 250) + 2500;

    if (Number(claimedScore) > theoreticalMaxScore) {
      errors.push({
        rule: 'THEORETICAL_SCORE_OVERFLOW',
        message: `Claimed score (${claimedScore}) exceeds theoretical envelope ceiling (${theoreticalMaxScore}).`
      });
    }

    if (errors.length > 0) {
      return {
        isValid: false,
        reasons: errors,
        theoreticalMaxScore,
        sanction: 'SCORE_REJECTED'
      };
    }

    // 4. Authoritative Star Calculation:
    // Server re-evaluates stars against database thresholds, ignoring user-supplied star values
    const thresholds = level?.starScoreThresholds || {
      oneStar: 8000,
      twoStar: 15000,
      threeStar: 22000
    };

    let authoritativeStars = 1;
    const finalScore = Number(claimedScore);
    if (finalScore >= thresholds.threeStar) {
      authoritativeStars = 3;
    } else if (finalScore >= thresholds.twoStar) {
      authoritativeStars = 2;
    } else if (finalScore >= thresholds.oneStar) {
      authoritativeStars = 1;
    } else {
      authoritativeStars = 1; // Base completion star
    }

    return {
      isValid: true,
      verifiedScore: finalScore,
      stars: authoritativeStars,
      theoreticalMaxScore,
      status: 'VERIFIED_CLEAN'
    };
  }
}

export default AntiCheatService;
