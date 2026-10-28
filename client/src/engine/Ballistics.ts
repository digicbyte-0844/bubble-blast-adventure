// Ballistics, Clamping & Specular Wall Reflection Engine
import HexGridEngine from './HexGrid';

export interface TrajectorySegment {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface TrajectoryPrediction {
  segments: TrajectorySegment[];
  ghostCell: { col: number; row: number } | null;
  impactPos: { x: number; y: number } | null;
}

export class BallisticsEngine {
  public static readonly MIN_ANGLE_RAD = -2.932; // -168 degrees
  public static readonly MAX_ANGLE_RAD = -0.209; // -12 degrees
  public static readonly LAUNCH_SPEED = 1200;    // px/sec

  /**
   * Clamps aim angle strictly within upward arc [-168°, -12°]
   */
  public static clampAngle(angleRad: number): number {
    let normalized = angleRad;
    while (normalized > Math.PI) normalized -= 2 * Math.PI;
    while (normalized < -Math.PI) normalized += 2 * Math.PI;

    if (normalized > 0) {
      // If pointing down, snap to closest valid horizontal upward bound
      return normalized > Math.PI / 2 ? this.MIN_ANGLE_RAD : this.MAX_ANGLE_RAD;
    }

    return Math.max(this.MIN_ANGLE_RAD, Math.min(this.MAX_ANGLE_RAD, normalized));
  }

  /**
   * Raycasts trajectory with specular wall reflection up to maxBounces (1 default, 2 with Super Aim)
   */
  public static predictTrajectory(
    startX: number,
    startY: number,
    angleRad: number,
    arenaWidth: number,
    gridMatrix: (string | null)[][],
    hexEngine: HexGridEngine,
    maxBounces: number = 1
  ): TrajectoryPrediction {
    const segments: TrajectorySegment[] = [];
    let currX = startX;
    let currY = startY;
    let dirX = Math.cos(angleRad);
    let dirY = Math.sin(angleRad);
    const radius = hexEngine.bubbleRadius;
    const leftWall = radius;
    const rightWall = arenaWidth - radius;
    const ceilingY = radius + 10;

    let bouncesRemaining = maxBounces;
    let impactPos: { x: number; y: number } | null = null;
    let ghostCell: { col: number; row: number } | null = null;

    const stepSize = 4;
    const maxSteps = 400;
    let stepCount = 0;
    let segmentStartX = currX;
    let segmentStartY = currY;

    while (stepCount < maxSteps) {
      stepCount++;
      const nextX = currX + dirX * stepSize;
      const nextY = currY + dirY * stepSize;

      // Wall Collision & Reflection
      if (nextX <= leftWall) {
        segments.push({ startX: segmentStartX, startY: segmentStartY, endX: leftWall, endY: nextY });
        currX = leftWall;
        currY = nextY;
        dirX = -dirX; // Specular reflection
        segmentStartX = currX;
        segmentStartY = currY;
        if (bouncesRemaining <= 0) break;
        bouncesRemaining--;
        continue;
      } else if (nextX >= rightWall) {
        segments.push({ startX: segmentStartX, startY: segmentStartY, endX: rightWall, endY: nextY });
        currX = rightWall;
        currY = nextY;
        dirX = -dirX; // Specular reflection
        segmentStartX = currX;
        segmentStartY = currY;
        if (bouncesRemaining <= 0) break;
        bouncesRemaining--;
        continue;
      }

      // Ceiling Collision
      if (nextY <= ceilingY) {
        impactPos = { x: nextX, y: ceilingY };
        ghostCell = hexEngine.findOptimalSnapCell(nextX, ceilingY, gridMatrix, arenaWidth);
        segments.push({ startX: segmentStartX, startY: segmentStartY, endX: nextX, endY: ceilingY });
        break;
      }

      // Bubble Grid Collision Check (bounding circle d <= 2R)
      let hit = false;
      for (let r = 0; r < hexEngine.rows; r++) {
        const rowCols = (r % 2 === 0) ? hexEngine.cols : hexEngine.cols - 1;
        for (let c = 0; c < rowCols; c++) {
          if (gridMatrix[r] && gridMatrix[r][c] !== null) {
            const bPos = hexEngine.hexToPixel(c, r, arenaWidth);
            const distSq = (nextX - bPos.x) ** 2 + (nextY - bPos.y) ** 2;
            if (distSq <= (radius * 1.85) ** 2) {
              hit = true;
              impactPos = { x: nextX, y: nextY };
              ghostCell = hexEngine.findOptimalSnapCell(nextX, nextY, gridMatrix, arenaWidth);
              segments.push({ startX: segmentStartX, startY: segmentStartY, endX: nextX, endY: nextY });
              break;
            }
          }
        }
        if (hit) break;
      }

      if (hit) break;

      currX = nextX;
      currY = nextY;
    }

    if (segments.length === 0 || segments[segments.length - 1].endX !== currX) {
      segments.push({ startX: segmentStartX, startY: segmentStartY, endX: currX, endY: currY });
    }

    return { segments, ghostCell, impactPos };
  }
}

export default BallisticsEngine;
