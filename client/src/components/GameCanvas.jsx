/**
 * 60 FPS HTML5 Interactive Canvas Game Board
 * Bulletproof auto-adjusting responsive Canvas for mobile web and desktop.
 * Dynamically computes BUBBLE_RADIUS from canvasWidth / (11 * 2) to touch walls with zero clipping.
 * High-performance animation loop decoupled from React state churn for rock-solid 60 FPS.
 * Bubble Puzzle Engine Presentation Tier
 */

import React, { useRef, useEffect, useCallback } from 'react';
import {
  BUBBLE_COLORS,
  PRIMARY_COLOR_IDS,
  PHYSICS,
  SPECIAL_BUBBLES,
  GAME_STATES
} from '../game/constants.js';
import {
  gridToPixel,
  pixelToGrid,
  getHexNeighbors,
  cloneGrid,
  getColsInRow
} from '../game/hexGrid.js';
import {
  calculateTrajectory,
  clampAimAngle,
  stepProjectile
} from '../game/collision.js';
import {
  findConnectedMatch,
  resolveRainbowMatch,
  checkRescuedJellies
} from '../game/matchDetector.js';
import {
  findFloatingBubbles,
  createDroppingBubble,
  updateDroppingBubbles
} from '../game/floatingDetector.js';
import { soundEngine } from '../game/soundEngine.js';
import { useGameStore } from '../store/useGameStore.js';

export const GameCanvas = ({ width = 380, height = 580 }) => {
  const canvasRef = useRef(null);

  // Dynamic dimension calculations
  const canvasWidth = Math.max(280, Math.floor(width));
  const canvasHeight = Math.max(380, Math.floor(height));

  // Dynamic Bubble Radius Scaling:
  // Formula: const RADIUS = canvasWidth / (GRID_COLS * 2) where GRID_COLS is 11
  const BUBBLE_RADIUS = Math.floor(canvasWidth / (PHYSICS.GRID_COLS_EVEN * 2));
  const X_OFFSET = Math.max(0, Math.floor((canvasWidth - PHYSICS.GRID_COLS_EVEN * (BUBBLE_RADIUS * 2)) / 2));
  const Y_OFFSET = Math.max(8, Math.floor(BUBBLE_RADIUS * 0.45));
  const LAUNCHER_X = canvasWidth / 2;
  const LAUNCHER_Y = Math.max(BUBBLE_RADIUS * 8, canvasHeight - 48);
  const NEXT_BUBBLE_X = canvasWidth / 2 - Math.max(48, BUBBLE_RADIUS * 2.65);
  const NEXT_BUBBLE_Y = LAUNCHER_Y + 10;
  const DANGER_Y = Math.max(BUBBLE_RADIUS * 7, canvasHeight - 135);

  const {
    gridMatrix,
    gameStatus,
    aimAngle,
    currentBubble,
    nextBubble,
    activeBooster,
    superAimActive,
    hintData,
    shotsRemaining,
    bannerNotice,
    setAimAngle,
    setGameStatus,
    fireBubble,
    swapBubbles,
    replenishBubbles,
    recordTurnResolution,
    evaluateLevelEnd,
    setGridMatrix
  } = useGameStore();

  // State synchronization refs to keep the 60 FPS requestAnimationFrame loop smooth & decoupled
  const gridMatrixRef = useRef(gridMatrix);
  const gameStatusRef = useRef(gameStatus);
  const currentBubbleRef = useRef(currentBubble);
  const nextBubbleRef = useRef(nextBubble);
  const shotsRemainingRef = useRef(shotsRemaining);
  const superAimActiveRef = useRef(superAimActive);
  const activeBoosterRef = useRef(activeBooster);
  const hintDataRef = useRef(hintData);
  const aimAngleRef = useRef(aimAngle || -Math.PI / 2);
  const lastSwapTimeRef = useRef(0);

  useEffect(() => {
    gridMatrixRef.current = gridMatrix;
  }, [gridMatrix]);

  useEffect(() => {
    gameStatusRef.current = gameStatus;
  }, [gameStatus]);

  useEffect(() => {
    currentBubbleRef.current = currentBubble;
  }, [currentBubble]);

  useEffect(() => {
    nextBubbleRef.current = nextBubble;
  }, [nextBubble]);

  useEffect(() => {
    shotsRemainingRef.current = shotsRemaining;
  }, [shotsRemaining]);

  useEffect(() => {
    superAimActiveRef.current = superAimActive;
  }, [superAimActive]);

  useEffect(() => {
    activeBoosterRef.current = activeBooster;
  }, [activeBooster]);

  useEffect(() => {
    hintDataRef.current = hintData;
  }, [hintData]);

  useEffect(() => {
    if (aimAngle !== undefined && aimAngle !== null) {
      aimAngleRef.current = aimAngle;
    }
  }, [aimAngle]);

  // Floating text banner notification for booster events
  useEffect(() => {
    if (bannerNotice && bannerNotice.text) {
      spawnFloatingText(LAUNCHER_X, LAUNCHER_Y - 70, bannerNotice.text, bannerNotice.color || '#FACC15');
    }
  }, [bannerNotice, LAUNCHER_X, LAUNCHER_Y]);

  // Particle systems & animated entities
  const particlesRef = useRef([]);
  const shockwavesRef = useRef([]);
  const floatingBubblesRef = useRef([]);
  const fallingBubblesRef = floatingBubblesRef; // Direct alias for gameplay drop mechanics
  const floatingTextsRef = useRef([]);

  // Active flying projectile
  const activeProjectileRef = useRef(null);

  // Mouse / Touch Aim tracking state
  const isAimingRef = useRef(false);

  /**
   * Helper to map color ID to color definition
   */
  const getColorDef = useCallback((colorId) => {
    if (!colorId) return BUBBLE_COLORS.CYAN;
    const key = String(colorId).toUpperCase();
    return BUBBLE_COLORS[key] || Object.values(BUBBLE_COLORS).find(c => c.id === colorId) || BUBBLE_COLORS.CYAN;
  }, []);

  /**
   * Spawn energetic popping particles
   */
  const spawnPopParticles = (x, y, colorDef, count = 12) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = Math.random() * 5 + 2.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colorDef?.fill || '#00F0FF',
        alpha: 1.0,
        size: Math.random() * 4 + 2,
        life: 1.0,
        decay: Math.random() * 0.03 + 0.025
      });
    }
  };

  /**
   * Spawn expanding fiery explosion shockwave ring for Bomb Power-Up
   */
  const spawnBombShockwave = (x, y) => {
    shockwavesRef.current.push({
      x,
      y,
      radius: 8,
      maxRadius: BUBBLE_RADIUS * 4.6,
      alpha: 1.0,
      color: '#FF5500'
    });
  };

  /**
   * Spawn intense fiery blast particles for Bomb Power-Up
   */
  const spawnFieryExplosion = (x, y, count = 30) => {
    const fireColors = ['#FF4500', '#FF8C00', '#FACC15', '#FFFFFF', '#EF4444', '#F97316'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: fireColors[Math.floor(Math.random() * fireColors.length)],
        alpha: 1.0,
        size: Math.random() * 5 + 2.5,
        life: 1.0,
        decay: Math.random() * 0.035 + 0.02
      });
    }
  };

  /**
   * Spawn floating combo text
   */
  const spawnFloatingText = (x, y, text, color = '#FACC15') => {
    floatingTextsRef.current.push({
      x,
      y,
      vy: -1.5,
      text,
      color,
      alpha: 1.0
    });
  };

  /**
   * High-DPI Resolution handling on dimensions change
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(canvasWidth * dpr);
    canvas.height = Math.floor(canvasHeight * dpr);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }
    useGameStore.setState({
      dangerLineY: DANGER_Y,
      bubbleRadius: BUBBLE_RADIUS,
      xOffset: X_OFFSET,
      yOffset: Y_OFFSET
    });
  }, [canvasWidth, canvasHeight, DANGER_Y, BUBBLE_RADIUS, X_OFFSET, Y_OFFSET]);

  /**
   * Main 60 FPS Render & Physics Loop
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;

    const render = () => {
      // 1. Bulletproof 60 FPS loop guarantee: Request next animation frame immediately at start
      animationFrameId = requestAnimationFrame(render);

      try {
        const liveStore = useGameStore.getState();
        const activeGrid = gridMatrixRef.current || liveStore.gridMatrix || liveStore.board || [];
        const currentStatus = gameStatusRef.current || liveStore.gameStatus || liveStore.gameState || GAME_STATES.READY;
        const currentAngle = aimAngleRef.current ?? liveStore.aimAngle ?? -Math.PI / 2;
        const activeBooster = activeBoosterRef.current || liveStore.activeBooster;
        const isSuperAim = superAimActiveRef.current || liveStore.superAimActive || activeBooster === 'superAim' || activeBooster === 'aimGuide';
        const curBubble = currentBubbleRef.current || liveStore.currentBubble || 'cyan';
        const nxtBubble = nextBubbleRef.current || liveStore.nextBubble || 'yellow';
        const shotsLeft = shotsRemainingRef.current ?? liveStore.shotsRemaining ?? 0;
        const curHint = hintDataRef.current || liveStore.hintData;

        // Safety Watchdog: If gameStatus is stuck in SHOOTING or RESOLVING but no projectile is active and animations are quiet, auto-heal to READY
        if (!activeProjectileRef.current && (currentStatus === GAME_STATES.SHOOTING || currentStatus === GAME_STATES.RESOLVING)) {
          if (floatingBubblesRef.current.length === 0 && particlesRef.current.length === 0 && shockwavesRef.current.length === 0) {
            gameStatusRef.current = GAME_STATES.READY;
            setGameStatus(GAME_STATES.READY);
            replenishBubbles();
            currentBubbleRef.current = useGameStore.getState().currentBubble;
            nextBubbleRef.current = useGameStore.getState().nextBubble;
          }
        }

      // 1. Clear Arena & Render Cosmic Arcade Backdrop (prevents flat black void)
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Deep space subtle radial ambiance
      const arenaGrad = ctx.createRadialGradient(
        canvasWidth / 2, canvasHeight * 0.42, 20,
        canvasWidth / 2, canvasHeight * 0.5, canvasHeight * 0.78
      );
      arenaGrad.addColorStop(0, '#0F172A');
      arenaGrad.addColorStop(0.55, '#0B0F19');
      arenaGrad.addColorStop(1, '#060913');
      ctx.fillStyle = arenaGrad;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Glowing Arena Energy Side Rails
      ctx.save();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
      ctx.beginPath();
      ctx.moveTo(X_OFFSET + 1, Y_OFFSET);
      ctx.lineTo(X_OFFSET + 1, DANGER_Y + BUBBLE_RADIUS * 2);
      ctx.moveTo(canvasWidth - X_OFFSET - 1, Y_OFFSET);
      ctx.lineTo(canvasWidth - X_OFFSET - 1, DANGER_Y + BUBBLE_RADIUS * 2);
      ctx.stroke();
      ctx.restore();

      // Draw subtle grid guide ceiling line
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(X_OFFSET, Y_OFFSET);
      ctx.lineTo(canvasWidth - X_OFFSET, Y_OFFSET);
      ctx.stroke();

      // Danger Line: Multi-layer stylized horizontal energy beam
      let dangerSeverity = 0; // 0 = safe, 1 = within 2 rows, 2 = critical
      for (let r = 0; r < activeGrid.length; r++) {
        if (!activeGrid[r]) continue;
        for (let c = 0; c < activeGrid[r].length; c++) {
          if (activeGrid[r][c]) {
            const pos = gridToPixel(r, c, BUBBLE_RADIUS, X_OFFSET, Y_OFFSET);
            if (pos.y >= DANGER_Y - BUBBLE_RADIUS * 0.8) {
              dangerSeverity = 2;
            } else if (pos.y >= DANGER_Y - BUBBLE_RADIUS * 2.5 && dangerSeverity < 1) {
              dangerSeverity = 1;
            }
          }
        }
      }

      ctx.save();
      const isCritical = dangerSeverity === 2;
      const isWarning = dangerSeverity === 1;
      const pulseSpeed = isCritical ? 120 : 250;
      const beamPulse = Math.sin(Date.now() / pulseSpeed);

      // 1. Soft Outer Neon Aura
      ctx.shadowBlur = isCritical ? 18 : (isWarning ? 12 : 6);
      ctx.shadowColor = isCritical
        ? 'rgba(239, 68, 68, 0.95)'
        : (isWarning ? 'rgba(244, 63, 94, 0.75)' : 'rgba(244, 63, 94, 0.35)');

      // 2. Primary Sci-Fi Double Energy Beam with Pulse
      const beamGrad = ctx.createLinearGradient(X_OFFSET + 8, DANGER_Y, canvasWidth - X_OFFSET - 8, DANGER_Y);
      if (isCritical) {
        beamGrad.addColorStop(0, 'rgba(239, 68, 68, 0.2)');
        beamGrad.addColorStop(0.5, '#EF4444');
        beamGrad.addColorStop(1, 'rgba(239, 68, 68, 0.2)');
      } else if (isWarning) {
        beamGrad.addColorStop(0, 'rgba(244, 63, 94, 0.15)');
        beamGrad.addColorStop(0.5, '#F43F5E');
        beamGrad.addColorStop(1, 'rgba(244, 63, 94, 0.15)');
      } else {
        beamGrad.addColorStop(0, 'rgba(244, 63, 94, 0.05)');
        beamGrad.addColorStop(0.5, 'rgba(244, 63, 94, 0.45)');
        beamGrad.addColorStop(1, 'rgba(244, 63, 94, 0.05)');
      }

      // Upper Beam Line
      ctx.strokeStyle = beamGrad;
      ctx.lineWidth = isCritical ? 2.5 + beamPulse : 1.5;
      ctx.beginPath();
      ctx.moveTo(X_OFFSET + 10, DANGER_Y - 2);
      ctx.lineTo(canvasWidth - X_OFFSET - 10, DANGER_Y - 2);
      ctx.stroke();

      // Lower Laser Beam (Subtle Dashed Guide)
      ctx.save();
      ctx.setLineDash([6, 4]);
      ctx.lineDashOffset = (Date.now() / 40) % 10;
      ctx.lineWidth = 1;
      ctx.strokeStyle = isCritical ? 'rgba(239, 68, 68, 0.6)' : 'rgba(244, 63, 94, 0.35)';
      ctx.beginPath();
      ctx.moveTo(X_OFFSET + 10, DANGER_Y + 2);
      ctx.lineTo(canvasWidth - X_OFFSET - 10, DANGER_Y + 2);
      ctx.stroke();
      ctx.restore();

      // 3. Glowing Diamond Anchor Nodes on Left & Right Walls
      const drawAnchorDiamond = (dx, dy) => {
        ctx.beginPath();
        ctx.moveTo(dx, dy - 5);
        ctx.lineTo(dx + 5, dy);
        ctx.lineTo(dx, dy + 5);
        ctx.lineTo(dx - 5, dy);
        ctx.closePath();
        ctx.fillStyle = isCritical ? '#EF4444' : (isWarning ? '#F43F5E' : '#FDA4AF');
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();
      };
      drawAnchorDiamond(X_OFFSET + 10, DANGER_Y);
      drawAnchorDiamond(canvasWidth - X_OFFSET - 10, DANGER_Y);

      // Semi-transparent Danger Line Pill Badge on right wall
      const pillLabel = isCritical ? 'CRITICAL DANGER' : 'DANGER LINE';
      ctx.font = '900 8px "Fredoka", "Nunito", sans-serif';
      const labelW = ctx.measureText(pillLabel).width + 12;
      const pillX = canvasWidth - X_OFFSET - labelW - 14;
      const pillY = DANGER_Y - 7;
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, labelW, 14, 4);
      ctx.fillStyle = isCritical ? 'rgba(185, 28, 28, 0.85)' : 'rgba(15, 23, 42, 0.75)';
      ctx.strokeStyle = isCritical ? '#EF4444' : 'rgba(244, 63, 94, 0.5)';
      ctx.lineWidth = 1;
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isCritical ? '#FEE2E2' : '#FDA4AF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pillLabel, pillX + labelW / 2, pillY + 7);
      ctx.restore();

      // 2. Render Existing Grid Bubbles
      for (let r = 0; r < activeGrid.length; r++) {
        for (let c = 0; c < activeGrid[r].length; c++) {
          const bubble = activeGrid[r][c];
          if (bubble) {
            const pos = gridToPixel(r, c, BUBBLE_RADIUS, X_OFFSET, Y_OFFSET);
            drawBubble(ctx, pos.x, pos.y, BUBBLE_RADIUS, bubble.color, bubble.type);
          }
        }
      }

      // 3. Render Hint Target Ring (if requested)
      if (curHint && curHint.target) {
        ctx.save();
        ctx.strokeStyle = '#FACC15';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(curHint.target.x, curHint.target.y, BUBBLE_RADIUS + 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 4. Render Animated Glowing Pearl Orbs Trajectory Line (when ready or aiming)
      if (currentStatus === GAME_STATES.READY || currentStatus === GAME_STATES.AIMING) {
        const traj = calculateTrajectory(
          LAUNCHER_X,
          LAUNCHER_Y,
          currentAngle,
          activeGrid,
          canvasWidth,
          isSuperAim,
          BUBBLE_RADIUS,
          X_OFFSET,
          Y_OFFSET
        );

        const currentDef = getColorDef(curBubble);
        const pearlColor = isSuperAim ? '#00F0FF' : currentDef.fill;
        const pearlGlow = isSuperAim ? '#00F0FF' : (currentDef.glow || '#38BDF8');

        // Walk trajectory polyline and place flowing animated pearls
        if (traj.points && traj.points.length >= 2) {
          const pearlSpacing = isSuperAim ? 16 : 18;
          const phaseOffset = ((Date.now() / 25) % pearlSpacing);

          // Calculate cumulative segment lengths
          const segments = [];
          let totalLength = 0;
          for (let i = 0; i < traj.points.length - 1; i++) {
            const p1 = traj.points[i];
            const p2 = traj.points[i + 1];
            const segLen = Math.hypot(p2.x - p1.x, p2.y - p1.y);
            segments.push({ p1, p2, len: segLen, startDist: totalLength });
            totalLength += segLen;
          }

          ctx.save();
          // Draw subtle connecting laser core line
          ctx.beginPath();
          traj.points.forEach((pt, idx) => {
            if (idx === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          });
          ctx.strokeStyle = isSuperAim ? 'rgba(0, 240, 255, 0.4)' : 'rgba(255, 255, 255, 0.18)';
          ctx.lineWidth = isSuperAim ? 2 : 1;
          ctx.stroke();

          // Render Animated Glowing Pearl Orbs along the path
          for (let d = phaseOffset; d < totalLength; d += pearlSpacing) {
            // Find which segment distance d falls into
            const seg = segments.find(s => d >= s.startDist && d <= s.startDist + s.len);
            if (!seg || seg.len === 0) continue;

            const t = (d - seg.startDist) / seg.len;
            const px = seg.p1.x + (seg.p2.x - seg.p1.x) * t;
            const py = seg.p1.y + (seg.p2.y - seg.p1.y) * t;

            // Outer glowing pearl sphere
            ctx.shadowColor = pearlGlow;
            ctx.shadowBlur = isSuperAim ? 12 : 7;
            ctx.fillStyle = pearlColor;
            ctx.beginPath();
            ctx.arc(px, py, isSuperAim ? 4.5 : 3.5, 0, Math.PI * 2);
            ctx.fill();

            // Specular white pearl core
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(px - 0.8, py - 0.8, isSuperAim ? 2 : 1.4, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        // Collision Endpoint: Holographic Ghost Preview & Pulsing Reticle
        if (traj.landingTarget) {
          const lx = traj.landingTarget.x;
          const ly = traj.landingTarget.y;

          ctx.save();
          // 1. Translucent Ghost Bubble Preview
          ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 200) * 0.15;
          drawBubble(ctx, lx, ly, BUBBLE_RADIUS, curBubble);
          ctx.restore();

          // 2. Concentric Pulsing Holographic Target Reticle
          ctx.save();
          const reticlePulse = Math.sin(Date.now() / 150) * 2.5;
          const reticleR = BUBBLE_RADIUS + 3.5 + reticlePulse;

          ctx.beginPath();
          ctx.arc(lx, ly, reticleR, 0, Math.PI * 2);
          ctx.strokeStyle = isSuperAim ? '#00F0FF' : '#FACC15';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.shadowColor = isSuperAim ? '#00F0FF' : '#FACC15';
          ctx.shadowBlur = 10;
          ctx.stroke();

          // 4 Crosshair Tick Marks
          ctx.setLineDash([]);
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(lx - reticleR - 3, ly); ctx.lineTo(lx - reticleR + 3, ly);
          ctx.moveTo(lx + reticleR - 3, ly); ctx.lineTo(lx + reticleR + 3, ly);
          ctx.moveTo(lx, ly - reticleR - 3); ctx.lineTo(lx, ly - reticleR + 3);
          ctx.moveTo(lx, ly + reticleR - 3); ctx.lineTo(lx, ly + reticleR + 3);
          ctx.stroke();
          ctx.restore();
        }
      }

      // 5. Update & Render Active Flying Projectile
      if (activeProjectileRef.current) {
        const proj = activeProjectileRef.current;
        let collisionResult = { hasCollided: false, snapCell: null, collision: null };
        try {
          collisionResult = stepProjectile(proj, activeGrid, canvasWidth, X_OFFSET, Y_OFFSET);
        } catch (err) {
          console.error('stepProjectile physics error:', err);
          collisionResult = { hasCollided: true, snapCell: null, collision: null };
        }

        const isOutOfBounds = proj.y < -60 || proj.y > canvasHeight + 80 || proj.x < -60 || proj.x > canvasWidth + 60;

        if (!collisionResult.hasCollided && !isOutOfBounds) {
          drawBubble(ctx, proj.x, proj.y, BUBBLE_RADIUS, proj.color, proj.type);
        }

        if (collisionResult.hasCollided || isOutOfBounds) {
          const snapTarget = collisionResult.snapCell;
          const hitRow = collisionResult.collision?.hitRow;
          const hitCol = collisionResult.collision?.hitCol;
          const impactedBubble = (hitRow !== null && hitRow !== undefined && hitCol !== null && hitCol !== undefined) 
            ? activeGrid[hitRow]?.[hitCol] 
            : null;
          const isGridBombImpact = impactedBubble?.type === SPECIAL_BUBBLES.BOMB || impactedBubble?.color === 'bomb';

          const isBombShot = proj.isBomb || proj.special === 'bomb' || proj.type === SPECIAL_BUBBLES.BOMB || proj.color === 'bomb' || activeBoosterRef.current === 'bomb';
          const isRainbowShot = proj.isRainbow || proj.special === 'rainbow' || proj.type === SPECIAL_BUBBLES.RAINBOW || proj.color === 'rainbow' || activeBoosterRef.current === 'rainbow';
          const impactX = collisionResult.collision?.x ?? proj.x;
          const impactY = collisionResult.collision?.y ?? proj.y;

          activeProjectileRef.current = null; // Always safely release flying projectile

          // =========================================================================
          // 1. CRITICAL ENGINE FIX: IMMEDIATE BOMB DETONATION ON IMPACT
          // Detonates whenever:
          // A) Projectile is a Bomb (fired by player), OR
          // B) Projectile collides with an existing Bomb bubble on the grid!
          // =========================================================================
          if (isBombShot || (isGridBombImpact && collisionResult.hasCollided)) {
            // AudioContext bulletproof execution: error can never halt collision resolution
            try {
              soundEngine.bomb();
            } catch (e) {
              try { soundEngine.playBomb(); } catch (e2) {}
            }

            // Spawn dramatic explosion shockwave + 35 fiery particles
            spawnBombShockwave(impactX, impactY);
            spawnFieryExplosion(impactX, impactY, 35);

            const newGrid = cloneGrid(activeGrid);
            const bombPops = [];
            const blastDistSq = (BUBBLE_RADIUS * 4.8) ** 2;

            // 1. Explicitly include the directly impacted bubble
            if (hitRow !== null && hitRow !== undefined && hitCol !== null && hitCol !== undefined && newGrid[hitRow]?.[hitCol]) {
              const bPos = gridToPixel(hitRow, hitCol, BUBBLE_RADIUS, X_OFFSET, Y_OFFSET);
              bombPops.push({ row: hitRow, col: hitCol, bubble: newGrid[hitRow][hitCol], pos: bPos });
            }

            // 2. Scan every occupied cell in the grid within blast radius (or 2-hex distance)
            for (let r = 0; r < newGrid.length; r++) {
              if (!newGrid[r]) continue;
              for (let c = 0; c < newGrid[r].length; c++) {
                if (newGrid[r][c]) {
                  const bPos = gridToPixel(r, c, BUBBLE_RADIUS, X_OFFSET, Y_OFFSET);
                  const dSq = (bPos.x - impactX) ** 2 + (bPos.y - impactY) ** 2;
                  if (dSq <= blastDistSq) {
                    bombPops.push({ row: r, col: c, bubble: newGrid[r][c], pos: bPos });
                  }
                }
              }
            }

            // 3. Guarantee all 1st and 2nd hex neighbors around snapTarget or impact are included
            const centerHexRow = hitRow ?? snapTarget?.row;
            const centerHexCol = hitCol ?? snapTarget?.col;
            if (centerHexRow !== null && centerHexRow !== undefined && centerHexCol !== null && centerHexCol !== undefined) {
              const directN = getHexNeighbors(centerHexRow, centerHexCol);
              directN.forEach((n) => {
                if (newGrid[n.row]?.[n.col]) {
                  const bPos = gridToPixel(n.row, n.col, BUBBLE_RADIUS, X_OFFSET, Y_OFFSET);
                  bombPops.push({ row: n.row, col: n.col, bubble: newGrid[n.row][n.col], pos: bPos });
                }
                getHexNeighbors(n.row, n.col).forEach((n2) => {
                  if (newGrid[n2.row]?.[n2.col]) {
                    const bPos = gridToPixel(n2.row, n2.col, BUBBLE_RADIUS, X_OFFSET, Y_OFFSET);
                    bombPops.push({ row: n2.row, col: n2.col, bubble: newGrid[n2.row][n2.col], pos: bPos });
                  }
                });
              });
            }

            // 4. Fallback: If bombPops is still empty (e.g. hit ceiling), find closest bubble
            if (bombPops.length === 0) {
              let closestB = null;
              let minDist = Infinity;
              for (let r = 0; r < newGrid.length; r++) {
                if (!newGrid[r]) continue;
                for (let c = 0; c < newGrid[r].length; c++) {
                  if (newGrid[r][c]) {
                    const bPos = gridToPixel(r, c, BUBBLE_RADIUS, X_OFFSET, Y_OFFSET);
                    const d = (bPos.x - impactX) ** 2 + (bPos.y - impactY) ** 2;
                    if (d < minDist) {
                      minDist = d;
                      closestB = { row: r, col: c, bubble: newGrid[r][c], pos: bPos };
                    }
                  }
                }
              }
              if (closestB) bombPops.push(closestB);
            }

            // Deduplicate pops
            const uniquePopsMap = new Map();
            bombPops.forEach((p) => uniquePopsMap.set(`${p.row},${p.col}`, p));
            const uniquePops = Array.from(uniquePopsMap.values());

            // Remove all bubbles in blast radius immediately
            uniquePops.forEach((p) => {
              spawnPopParticles(p.pos.x, p.pos.y, getColorDef(p.bubble?.color), 16);
              newGrid[p.row][p.col] = null;
            });

            // Immediately check for floating disconnected bubbles underneath and drop them!
            const dropped = findFloatingBubbles(newGrid, BUBBLE_RADIUS, X_OFFSET, Y_OFFSET);
            if (dropped.length > 0) {
              dropped.forEach((d) => {
                const pos = gridToPixel(d.row, d.col, BUBBLE_RADIUS, X_OFFSET, Y_OFFSET);
                floatingBubblesRef.current.push(createDroppingBubble(d.bubble, pos.x, pos.y, BUBBLE_RADIUS));
                newGrid[d.row][d.col] = null;
              });
              try { soundEngine.playDrop(); } catch (e) {}
            }

            // Synchronously update Zustand state with nextBoard and reset launcher & booster
            const store = useGameStore.getState();
            const nextB = store.generateNextBubble ? store.generateNextBubble() : 'yellow';
            const curB = (store.nextBubble && store.nextBubble !== 'bomb' && store.nextBubble !== 'rainbow') ? store.nextBubble : 'cyan';

            useGameStore.setState({
              gridMatrix: newGrid,
              board: newGrid,
              activeBooster: null,
              gameStatus: GAME_STATES.READY,
              gameState: GAME_STATES.READY,
              currentBubble: curB,
              nextBubble: nextB
            });

            // Keep internal synchronous refs strictly aligned
            gridMatrixRef.current = newGrid;
            activeBoosterRef.current = null;
            gameStatusRef.current = GAME_STATES.READY;
            currentBubbleRef.current = curB;
            nextBubbleRef.current = nextB;

            recordTurnResolution(uniquePops.length, dropped.length, 0);
            spawnFloatingText(impactX, impactY - 25, `BOMB BLAST! +${uniquePops.length * 60}`, '#FF4500');
            evaluateLevelEnd(newGrid, DANGER_Y, BUBBLE_RADIUS);
            const postBombStatus = useGameStore.getState().gameStatus;
            if (postBombStatus === GAME_STATES.LEVEL_FAILED || postBombStatus === GAME_STATES.LEVEL_COMPLETE) {
              gameStatusRef.current = postBombStatus;
            }
          } else if (!snapTarget) {
            // Safety fallback: projectile went out of bounds or board had no open slot
            activeBoosterRef.current = null;
            gameStatusRef.current = GAME_STATES.READY;
            replenishBubbles();
            currentBubbleRef.current = useGameStore.getState().currentBubble;
            nextBubbleRef.current = useGameStore.getState().nextBubble;
            evaluateLevelEnd(null, DANGER_Y, BUBBLE_RADIUS);
            const postOobStatus = useGameStore.getState().gameStatus;
            if (postOobStatus === GAME_STATES.LEVEL_FAILED || postOobStatus === GAME_STATES.LEVEL_COMPLETE) {
              gameStatusRef.current = postOobStatus;
            }
          } else {
            const { row, col } = snapTarget;

            // Sound effect on docking
            soundEngine.playSnap();

            // Snapshot grid and insert new bubble into cell
            const newGrid = cloneGrid(activeGrid);
            newGrid[row][col] = {
              color: isRainbowShot ? 'rainbow' : proj.color,
              type: isRainbowShot ? SPECIAL_BUBBLES.RAINBOW : (proj.type || SPECIAL_BUBBLES.NORMAL)
            };

            gridMatrixRef.current = newGrid;
            setGridMatrix(newGrid);
            setGameStatus(GAME_STATES.RESOLVING);

            try {
              // Standard Match-3 or Rainbow Wildcard BFS Check
              let matchedCluster = [];

              if (isRainbowShot) {
                matchedCluster = resolveRainbowMatch(newGrid, row, col);
              } else {
                matchedCluster = findConnectedMatch(newGrid, row, col);
              }

              if (matchedCluster.length >= 3 || (isRainbowShot && matchedCluster.length >= 1)) {
                // Trigger Pop Audio with Combo Pitch
                soundEngine.playPop(1);

                // Spawn Particles & Clear Cluster
                matchedCluster.forEach((cell) => {
                  const b = newGrid[cell.row][cell.col];
                  const pos = gridToPixel(cell.row, cell.col, BUBBLE_RADIUS, X_OFFSET, Y_OFFSET);
                  spawnPopParticles(pos.x, pos.y, getColorDef(b?.color), 14);
                  newGrid[cell.row][cell.col] = null;
                });

                if (isRainbowShot) {
                  spawnFloatingText(LAUNCHER_X, LAUNCHER_Y - 80, `RAINBOW POP! +${matchedCluster.length * 60}`, '#EC4899');
                }

                // Check for rescued Starlight Jellies
                const rescued = checkRescuedJellies(newGrid, matchedCluster);
                const rescuedCount = rescued.length;
                if (rescuedCount > 0) {
                  soundEngine.playRescue();
                  rescued.forEach((r) => {
                    const pos = gridToPixel(r.row, r.col, BUBBLE_RADIUS, X_OFFSET, Y_OFFSET);
                    spawnPopParticles(pos.x, pos.y, { fill: '#38BDF8', glow: 'rgba(56, 189, 248, 0.8)' }, 16);
                    newGrid[r.row][r.col] = null;
                  });
                  spawnFloatingText(LAUNCHER_X, LAUNCHER_Y - 90, `+${rescuedCount * 100} JELLY RESCUED!`, '#38BDF8');
                }

                // Check for Floating Bubbles to Detach
                const floating = findFloatingBubbles(newGrid, BUBBLE_RADIUS, X_OFFSET, Y_OFFSET);
                if (floating.length > 0) {
                  soundEngine.playDrop();
                  floating.forEach((cell) => {
                    const pos = gridToPixel(cell.row, cell.col, BUBBLE_RADIUS, X_OFFSET, Y_OFFSET);
                    floatingBubblesRef.current.push(createDroppingBubble(cell.bubble, pos.x, pos.y, BUBBLE_RADIUS));
                    newGrid[cell.row][cell.col] = null;
                  });
                  spawnFloatingText(LAUNCHER_X, LAUNCHER_Y - 50, `+${floating.length * 20} AVALANCHE!`, '#10B981');
                }

                // Commit new grid and compute turn score
                gridMatrixRef.current = newGrid;
                setGridMatrix(newGrid);
                recordTurnResolution(matchedCluster.length, floating.length, rescuedCount);

                // REWARD A BOMB ON SUCCESSFUL MATCH-3+ SHOT
                useGameStore.getState().rewardBombOnSuccess();
                spawnFloatingText(LAUNCHER_X, LAUNCHER_Y - 110, '+1 BOMB EARNED!', '#F97316');

                if (matchedCluster.length >= 5 && !isRainbowShot) {
                  spawnFloatingText(LAUNCHER_X, LAUNCHER_Y - 80, 'GREAT POP! x2', '#FACC15');
                }
              } else {
                // Missed match - combo reset
                recordTurnResolution(0, 0, 0);
              }
            } catch (err) {
              console.error('Match resolution error:', err);
            }

            activeBoosterRef.current = null;
            gameStatusRef.current = GAME_STATES.READY;
            replenishBubbles();
            currentBubbleRef.current = useGameStore.getState().currentBubble;
            nextBubbleRef.current = useGameStore.getState().nextBubble;
            evaluateLevelEnd(newGrid, DANGER_Y, BUBBLE_RADIUS);
            const postMatchStatus = useGameStore.getState().gameStatus;
            if (postMatchStatus === GAME_STATES.LEVEL_FAILED || postMatchStatus === GAME_STATES.LEVEL_COMPLETE) {
              gameStatusRef.current = postMatchStatus;
            }
          }
        }
      }

      // 6. Update & Render Dropping Floating Bubbles
      if (floatingBubblesRef.current.length > 0) {
        floatingBubblesRef.current = updateDroppingBubbles(floatingBubblesRef.current, canvasHeight + 50);
        floatingBubblesRef.current.forEach((fb) => {
          ctx.save();
          ctx.translate(fb.x, fb.y);
          ctx.rotate(fb.rotation || 0);
          const bubbleData = fb.bubble || fb;
          drawBubble(ctx, 0, 0, BUBBLE_RADIUS, bubbleData.color, bubbleData.type);
          ctx.restore();
        });
      }

      // 7. Update & Render Shockwaves & Particles (Batched 60 FPS mobile optimization)
      if (shockwavesRef.current.length > 0) {
        ctx.save();
        shockwavesRef.current.forEach((sw) => {
          sw.radius += 5.5;
          sw.alpha -= 0.045;
          if (sw.alpha > 0) {
            ctx.beginPath();
            ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
            ctx.strokeStyle = sw.color;
            ctx.globalAlpha = Math.max(0, Math.min(1, sw.alpha));
            ctx.lineWidth = Math.max(1, 4 * sw.alpha);
            ctx.shadowColor = '#FF8C00';
            ctx.shadowBlur = 12;
            ctx.stroke();
          }
        });
        ctx.restore();
        shockwavesRef.current = shockwavesRef.current.filter((sw) => sw.alpha > 0);
      }

      if (particlesRef.current.length > 0) {
        ctx.save();
        particlesRef.current.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15; // Gravity
          p.alpha -= p.decay;

          if (p.alpha > 0) {
            ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
        });
        ctx.restore();
        particlesRef.current = particlesRef.current.filter((p) => p.alpha > 0);
      }

      // 8. Update & Render Floating Score Texts (Batched 60 FPS mobile optimization)
      if (floatingTextsRef.current.length > 0) {
        ctx.save();
        ctx.font = 'bold 14px Nunito, Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        floatingTextsRef.current.forEach((t) => {
          t.y += t.vy;
          t.alpha -= 0.02;

          if (t.alpha > 0) {
            ctx.globalAlpha = Math.max(0, Math.min(1, t.alpha));
            ctx.fillStyle = t.color;
            ctx.fillText(t.text, t.x, t.y);
          }
        });
        ctx.restore();
        floatingTextsRef.current = floatingTextsRef.current.filter((t) => t.alpha > 0);
      }

      // 9. Render Rotating Launcher Base, Core Ammo Badge & Orbiting Swap Ring
      drawLauncherAssembly(ctx, LAUNCHER_X, LAUNCHER_Y, currentAngle, curBubble, nxtBubble, shotsRemainingRef.current);
      } catch (err) {
        console.error('GameCanvas 60 FPS render loop caught error:', err);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    canvasWidth,
    canvasHeight,
    BUBBLE_RADIUS,
    X_OFFSET,
    Y_OFFSET,
    LAUNCHER_X,
    LAUNCHER_Y,
    NEXT_BUBBLE_X,
    NEXT_BUBBLE_Y,
    DANGER_Y,
    getColorDef,
    evaluateLevelEnd,
    recordTurnResolution,
    replenishBubbles,
    setGridMatrix,
    setGameStatus
  ]);

  /**
   * Draw bubble sphere with specular highlights
   */
  const drawBubble = (ctx, x, y, radius, colorId, type = SPECIAL_BUBBLES.NORMAL) => {
    ctx.save();

    // 1. Starlight Jelly Rescue Bubble
    if (type === SPECIAL_BUBBLES.STARLIGHT_JELLY_RESCUE) {
      const crystalGrad = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 2, x, y, radius);
      crystalGrad.addColorStop(0, '#FFFFFF');
      crystalGrad.addColorStop(0.3, '#E0F2FE');
      crystalGrad.addColorStop(0.7, '#38BDF8');
      crystalGrad.addColorStop(1, '#0284C7');

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = crystalGrad;
      ctx.shadowColor = 'rgba(56, 189, 248, 0.7)';
      ctx.shadowBlur = 10;
      ctx.fill();

      // Trapped Mini-Jelly face inside
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(x - 4, y - 2, 2, 0, Math.PI * 2);
      ctx.arc(x + 4, y - 2, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y + 1, 3, 0, Math.PI);
      ctx.stroke();

      // Specular crystal crescent
      ctx.beginPath();
      ctx.ellipse(x - radius * 0.35, y - radius * 0.35, radius * 0.45, radius * 0.25, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fill();

      ctx.restore();
      return;
    }

    // 2. Cosmic Bomb Bubble
    if (type === SPECIAL_BUBBLES.BOMB || colorId === 'bomb') {
      const bombGrad = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 2, x, y, radius);
      bombGrad.addColorStop(0, '#FFA500');
      bombGrad.addColorStop(0.5, '#FF4500');
      bombGrad.addColorStop(1, '#1A1A1A');

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = bombGrad;
      ctx.shadowColor = 'rgba(255, 69, 0, 0.8)';
      ctx.shadowBlur = 12;
      ctx.fill();

      // Vector bomb core & fuse spark
      ctx.beginPath();
      ctx.arc(x, y + 1, radius * 0.42, 0, Math.PI * 2);
      ctx.fillStyle = '#0F172A';
      ctx.fill();
      // Fuse
      ctx.beginPath();
      ctx.moveTo(x + 2, y - radius * 0.35);
      ctx.quadraticCurveTo(x + 5, y - radius * 0.6, x + 8, y - radius * 0.55);
      ctx.strokeStyle = '#FDE047';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Spark
      ctx.beginPath();
      ctx.arc(x + 8, y - radius * 0.55, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#FF4500';
      ctx.fill();

      ctx.restore();
      return;
    }

    // 3. Rainbow Bubble
    if (type === SPECIAL_BUBBLES.RAINBOW || colorId === 'rainbow') {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      const rainbowGrad = ctx.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
      rainbowGrad.addColorStop(0, '#FF3344');
      rainbowGrad.addColorStop(0.25, '#FACC15');
      rainbowGrad.addColorStop(0.5, '#10B981');
      rainbowGrad.addColorStop(0.75, '#06B6D4');
      rainbowGrad.addColorStop(1, '#EC4899');
      ctx.fillStyle = rainbowGrad;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = 10;
      ctx.fill();

      // Prismatic vector star emblem
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const outerAngle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const outerX = x + Math.cos(outerAngle) * (radius * 0.42);
        const outerY = y + Math.sin(outerAngle) * (radius * 0.42);
        if (i === 0) ctx.moveTo(outerX, outerY);
        else ctx.lineTo(outerX, outerY);
      }
      ctx.closePath();
      ctx.fill();

      ctx.restore();
      return;
    }

    // 4. Standard Glossy Cartoon Bubble (Hardware-accelerated gradient depth, shadowBlur 0 for smooth 60 FPS mobile)
    const colorDef = getColorDef(colorId);

    ctx.shadowBlur = 0;

    const radGrad = ctx.createRadialGradient(
      x - radius * 0.35,
      y - radius * 0.35,
      radius * 0.1,
      x,
      y,
      radius
    );
    radGrad.addColorStop(0, '#FFFFFF');
    radGrad.addColorStop(0.2, colorDef.secondary || colorDef.fill);
    radGrad.addColorStop(0.85, colorDef.fill);
    radGrad.addColorStop(1, colorDef.border || '#000000');

    ctx.beginPath();
    ctx.arc(x, y, radius - 0.5, 0, Math.PI * 2);
    ctx.fillStyle = radGrad;
    ctx.fill();

    // 1px subtle darker bevel rim
    ctx.lineWidth = 1;
    ctx.strokeStyle = colorDef.border || 'rgba(0,0,0,0.3)';
    ctx.stroke();

    // Specular highlight crescent
    ctx.beginPath();
    ctx.ellipse(
      x - radius * 0.32,
      y - radius * 0.35,
      radius * 0.38,
      radius * 0.22,
      -Math.PI / 4,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fill();

    ctx.restore();
  };

  /**
   * Draw Integrated Arcade Turret Cannon, Loaded Bubble Muzzle, Orbiting Swap Ring & Shots Left Badge
   */
  const drawLauncherAssembly = (ctx, x, y, angle, current, next, shotsLeft = 0) => {
    ctx.save();

    // 1. Sleek Metallic/Golden Arcade Base Pedestal
    ctx.beginPath();
    ctx.arc(x, y, BUBBLE_RADIUS * 1.85, 0, Math.PI * 2);
    const baseGrad = ctx.createRadialGradient(x, y - 6, 4, x, y, BUBBLE_RADIUS * 1.85);
    baseGrad.addColorStop(0, '#D97706'); // Warm gold core
    baseGrad.addColorStop(0.35, '#334155');
    baseGrad.addColorStop(0.8, '#1E293B');
    baseGrad.addColorStop(1, '#0B0F19');
    ctx.fillStyle = baseGrad;
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2.2;
    ctx.shadowColor = 'rgba(245, 158, 11, 0.45)';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.stroke();

    // Inner glowing cyan energy conduit ring
    ctx.beginPath();
    ctx.arc(x, y, BUBBLE_RADIUS * 1.45, 0, Math.PI * 2);
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 1.2;
    ctx.shadowColor = '#00F0FF';
    ctx.shadowBlur = 6;
    ctx.stroke();

    // Decorative metallic rivets on base
    for (let r = 0; r < 6; r++) {
      const rAng = (r * Math.PI) / 3;
      const rx = x + Math.cos(rAng) * (BUBBLE_RADIUS * 1.62);
      const ry = y + Math.sin(rAng) * (BUBBLE_RADIUS * 1.62);
      ctx.beginPath();
      ctx.arc(rx, ry, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = '#FEF08A';
      ctx.fill();
    }

    // 2. Rotating Turret Cannon Barrel
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2);

    const barrelWidth = BUBBLE_RADIUS * 1.2;
    const barrelLength = BUBBLE_RADIUS * 1.75;
    ctx.beginPath();
    ctx.rect(-barrelWidth / 2, -barrelLength - BUBBLE_RADIUS * 0.45, barrelWidth, barrelLength);
    const barrelGrad = ctx.createLinearGradient(-barrelWidth / 2, 0, barrelWidth / 2, 0);
    barrelGrad.addColorStop(0, '#1E293B');
    barrelGrad.addColorStop(0.25, '#475569');
    barrelGrad.addColorStop(0.5, '#94A3B8');
    barrelGrad.addColorStop(0.75, '#475569');
    barrelGrad.addColorStop(1, '#0F172A');
    ctx.fillStyle = barrelGrad;
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(245, 158, 11, 0.7)';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.stroke();

    // Barrel Muzzle Glowing Golden Rim
    ctx.beginPath();
    ctx.moveTo(-barrelWidth / 2 + 1, -barrelLength - BUBBLE_RADIUS * 0.45);
    ctx.lineTo(barrelWidth / 2 - 1, -barrelLength - BUBBLE_RADIUS * 0.45);
    ctx.strokeStyle = '#FEF08A';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.restore();

    // 3. Current Loaded Bubble Glowing in Chamber
    ctx.save();
    ctx.shadowColor = 'rgba(0, 240, 255, 0.6)';
    ctx.shadowBlur = 10;
    const resolvedLoadedColor = (current === 'bomb' && activeBoosterRef.current !== 'bomb') ? 'cyan' : (current || 'cyan');
    drawBubble(ctx, x, y, BUBBLE_RADIUS, resolvedLoadedColor);
    ctx.restore();

    // 4. Primary Barrel Core Badge: SHOTS LEFT Pill
    const badgeW = Math.max(68, BUBBLE_RADIUS * 2.5);
    const badgeH = 18;
    const badgeX = x - badgeW / 2;
    const badgeY = y + BUBBLE_RADIUS * 0.78;
    const isLowAmmo = shotsLeft <= 5;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 9);
    ctx.fillStyle = isLowAmmo ? '#7F1D1D' : '#0B0F19';
    ctx.strokeStyle = isLowAmmo ? '#EF4444' : '#F59E0B';
    ctx.lineWidth = 1.8;
    ctx.shadowColor = isLowAmmo ? 'rgba(239, 68, 68, 0.9)' : 'rgba(245, 158, 11, 0.7)';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.stroke();

    // Ammo Counter Text inside Badge
    ctx.fillStyle = isLowAmmo ? '#FCA5A5' : '#FEF08A';
    ctx.font = '900 10px "Fredoka", "Nunito", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${shotsLeft} SHOTS`, x, badgeY + badgeH / 2 + 0.5);
    ctx.restore();

    // 5. Integrated Orbiting Swap Ring (Next Bubble Satellite Pod)
    const swapRadius = BUBBLE_RADIUS * 1.05;
    ctx.save();
    ctx.beginPath();
    ctx.arc(NEXT_BUBBLE_X, NEXT_BUBBLE_Y, swapRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.stroke();

    // Rotating Cycle Arrows around satellite ring
    const cycleAngle = (Date.now() / 900) % (Math.PI * 2);
    ctx.save();
    ctx.translate(NEXT_BUBBLE_X, NEXT_BUBBLE_Y);
    ctx.rotate(cycleAngle);
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 1.8;

    // Arrow Arc 1
    ctx.beginPath();
    ctx.arc(0, 0, swapRadius + 3, 0.2, Math.PI * 0.7);
    ctx.stroke();
    const a1x = Math.cos(Math.PI * 0.7) * (swapRadius + 3);
    const a1y = Math.sin(Math.PI * 0.7) * (swapRadius + 3);
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.arc(a1x, a1y, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Arrow Arc 2
    ctx.beginPath();
    ctx.arc(0, 0, swapRadius + 3, Math.PI + 0.2, Math.PI * 1.7);
    ctx.stroke();
    const a2x = Math.cos(Math.PI * 1.7) * (swapRadius + 3);
    const a2y = Math.sin(Math.PI * 1.7) * (swapRadius + 3);
    ctx.beginPath();
    ctx.arc(a2x, a2y, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Draw Next Bubble inside Satellite Ring
    const resolvedNextColor = (next === 'bomb' || next === 'rainbow') ? 'yellow' : (next || 'yellow');
    drawBubble(ctx, NEXT_BUBBLE_X, NEXT_BUBBLE_Y, BUBBLE_RADIUS * 0.78, resolvedNextColor);

    // Mini Swap Pill Badge underneath
    const swapBadgeW = 34;
    const swapBadgeH = 12;
    const swapBadgeX = NEXT_BUBBLE_X - swapBadgeW / 2;
    const swapBadgeY = NEXT_BUBBLE_Y + swapRadius - 2;

    ctx.beginPath();
    ctx.roundRect(swapBadgeX, swapBadgeY, swapBadgeW, swapBadgeH, 6);
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1;
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38BDF8';
    ctx.font = '900 8px "Fredoka", "Nunito", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SWAP', NEXT_BUBBLE_X, swapBadgeY + swapBadgeH / 2);

    // Swap Flourish Flare (if recently swapped within 250ms)
    if (Date.now() - lastSwapTimeRef.current < 250) {
      const progress = (Date.now() - lastSwapTimeRef.current) / 250;
      ctx.beginPath();
      ctx.arc(NEXT_BUBBLE_X, NEXT_BUBBLE_Y, swapRadius * (1 + progress * 0.5), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(56, 189, 248, ${1 - progress})`;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    ctx.restore();
    ctx.restore();
  };

  /**
   * Pointer Angle Calculations with strict aspect-ratio mapping & Ergonomic Aim Exclusion Zone
   */
  const updateAimFromPointer = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;

    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;

    const pointerX = (clientX - rect.left) * scaleX;
    const pointerY = (clientY - rect.top) * scaleY;

    // Check if clicked the next bubble satellite ring specifically to trigger swap
    const distToNext = Math.hypot(pointerX - NEXT_BUBBLE_X, pointerY - NEXT_BUBBLE_Y);
    if (distToNext < BUBBLE_RADIUS * 1.5) {
      return 'SWAP_TRIGGERED';
    }

    let angle = Math.atan2(pointerY - LAUNCHER_Y, pointerX - LAUNCHER_X);
    if (pointerY >= LAUNCHER_Y) {
      const dx = pointerX - LAUNCHER_X;
      angle = Math.atan2(-Math.max(12, pointerY - LAUNCHER_Y), dx);
    }

    const clamped = clampAimAngle(angle);
    aimAngleRef.current = clamped;
    return 'AIM_UPDATED';
  };

  /**
   * Fires the loaded bubble at the current aim angle
   */
  const shootProjectile = () => {
    if (activeProjectileRef.current) return;
    if (gameStatusRef.current !== GAME_STATES.READY && gameStatusRef.current !== GAME_STATES.AIMING) return;

    const angle = aimAngleRef.current;
    setAimAngle(angle);
    const shot = fireBubble(angle);

    if (shot) {
      gameStatusRef.current = GAME_STATES.SHOOTING;
      const isBomb = shot.isBomb || shot.isBooster === 'bomb' || shot.color === 'bomb' || activeBoosterRef.current === 'bomb';
      const isRainbow = shot.isRainbow || shot.isBooster === 'rainbow' || shot.color === 'rainbow' || activeBoosterRef.current === 'rainbow';

      activeProjectileRef.current = {
        x: LAUNCHER_X,
        y: LAUNCHER_Y,
        vx: Math.cos(shot.angle) * PHYSICS.LAUNCH_SPEED,
        vy: Math.sin(shot.angle) * PHYSICS.LAUNCH_SPEED,
        color: isBomb ? 'bomb' : (isRainbow ? 'rainbow' : shot.color),
        type: isBomb ? SPECIAL_BUBBLES.BOMB : (isRainbow ? SPECIAL_BUBBLES.RAINBOW : SPECIAL_BUBBLES.NORMAL),
        special: isBomb ? 'bomb' : (isRainbow ? 'rainbow' : null),
        isBomb: isBomb,
        isRainbow: isRainbow,
        radius: BUBBLE_RADIUS
      };
    } else {
      gameStatusRef.current = GAME_STATES.READY;
      setGameStatus(GAME_STATES.READY);
    }
  };

  // --- UNIFIED POINTER CONTROLS (Touch, Mouse & Pen with Hardware Capture) ---
  const handlePointerDown = (e) => {
    if (e.button && e.button !== 0) return;
    if (gameStatusRef.current !== GAME_STATES.READY && gameStatusRef.current !== GAME_STATES.AIMING) return;
    if (e.cancelable) e.preventDefault();

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    const result = updateAimFromPointer(e.clientX, e.clientY);
    if (result === 'SWAP_TRIGGERED') {
      lastSwapTimeRef.current = Date.now();
      try { soundEngine.play('booster'); } catch {}
      swapBubbles();
      return;
    }
    isAimingRef.current = true;
    setGameStatus(GAME_STATES.AIMING);
  };

  const handlePointerMove = (e) => {
    if (!isAimingRef.current || (gameStatusRef.current !== GAME_STATES.READY && gameStatusRef.current !== GAME_STATES.AIMING)) return;
    if (e.cancelable) e.preventDefault();
    updateAimFromPointer(e.clientX, e.clientY);
  };

  const handlePointerUp = (e) => {
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}

    if (isAimingRef.current && (gameStatusRef.current === GAME_STATES.READY || gameStatusRef.current === GAME_STATES.AIMING)) {
      isAimingRef.current = false;
      shootProjectile();
    } else {
      isAimingRef.current = false;
    }
  };

  const handlePointerCancel = (e) => {
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}
    isAimingRef.current = false;
  };

  // Mobile Touch Fallback for legacy environments lacking PointerEvent
  const handleTouchStart = (e) => {
    if (typeof window !== 'undefined' && 'PointerEvent' in window) return; // Prevent duplicate events on modern touch devices
    if (gameStatusRef.current !== GAME_STATES.READY && gameStatusRef.current !== GAME_STATES.AIMING) return;
    if (e.cancelable) e.preventDefault();
    const touch = e.touches[0];
    const result = updateAimFromPointer(touch.clientX, touch.clientY);
    if (result === 'SWAP_TRIGGERED') {
      lastSwapTimeRef.current = Date.now();
      try { soundEngine.play('booster'); } catch {}
      swapBubbles();
      return;
    }
    isAimingRef.current = true;
    setGameStatus(GAME_STATES.AIMING);
  };

  const handleTouchMove = (e) => {
    if (typeof window !== 'undefined' && 'PointerEvent' in window) return;
    if (!isAimingRef.current || (gameStatusRef.current !== GAME_STATES.READY && gameStatusRef.current !== GAME_STATES.AIMING)) return;
    if (e.cancelable) e.preventDefault();
    const touch = e.touches[0];
    updateAimFromPointer(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    if (typeof window !== 'undefined' && 'PointerEvent' in window) return;
    if (isAimingRef.current && (gameStatusRef.current === GAME_STATES.READY || gameStatusRef.current === GAME_STATES.AIMING)) {
      isAimingRef.current = false;
      shootProjectile();
    } else {
      isAimingRef.current = false;
    }
  };

  // Global window listeners for drag release outside canvas & Keyboard shortcuts (Space = Shoot, S = Swap)
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isAimingRef.current) {
        isAimingRef.current = false;
        if (gameStatusRef.current === GAME_STATES.READY || gameStatusRef.current === GAME_STATES.AIMING) {
          shootProjectile();
        }
      }
    };

    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameStatusRef.current === GAME_STATES.READY || gameStatusRef.current === GAME_STATES.AIMING) {
          shootProjectile();
        }
      } else if (e.code === 'KeyS' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        lastSwapTimeRef.current = Date.now();
        try { soundEngine.play('booster'); } catch {}
        swapBubbles();
      }
    };

    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div
      className="relative select-none overflow-hidden rounded-3xl bg-[#0B0F19]/90 border border-slate-800/80 shadow-2xl touch-none flex items-center justify-center mx-auto"
      style={{
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`,
        maxWidth: '100%',
        maxHeight: '100%'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          display: 'block'
        }}
        className="cursor-crosshair touch-none select-none block"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  );
};

export default GameCanvas;
