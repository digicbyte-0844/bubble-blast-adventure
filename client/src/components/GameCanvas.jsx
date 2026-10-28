/**
 * 60 FPS HTML5 Interactive Canvas Game Board
 * Bulletproof auto-adjusting responsive Canvas for mobile web and desktop.
 * Dynamically computes BUBBLE_RADIUS from canvasWidth / (11 * 2) to touch walls with zero clipping.
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

  // Dynamic Bubble Radius Scaling (Requirement 3):
  // Formula: const RADIUS = canvasWidth / (GRID_COLS * 2) where GRID_COLS is 11
  const BUBBLE_RADIUS = Math.floor(canvasWidth / (PHYSICS.GRID_COLS_EVEN * 2));
  const X_OFFSET = Math.max(0, Math.floor((canvasWidth - PHYSICS.GRID_COLS_EVEN * (BUBBLE_RADIUS * 2)) / 2));
  const Y_OFFSET = Math.max(8, Math.floor(BUBBLE_RADIUS * 0.45));
  const LAUNCHER_X = canvasWidth / 2;
  const LAUNCHER_Y = canvasHeight - BUBBLE_RADIUS * 2.2;
  const NEXT_BUBBLE_X = canvasWidth / 2 - BUBBLE_RADIUS * 3.5;
  const NEXT_BUBBLE_Y = LAUNCHER_Y + BUBBLE_RADIUS * 0.35;
  const DANGER_Y = LAUNCHER_Y - BUBBLE_RADIUS * 4.2;

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
    setAimAngle,
    setGameStatus,
    fireBubble,
    swapBubbles,
    replenishBubbles,
    recordTurnResolution,
    evaluateLevelEnd,
    setGridMatrix
  } = useGameStore();

  // Particle systems
  const particlesRef = useRef([]);
  const floatingBubblesRef = useRef([]);
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
      const speed = Math.random() * 5 + 2;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colorDef.fill || '#00F0FF',
        alpha: 1.0,
        size: Math.random() * 4 + 2,
        life: 1.0,
        decay: Math.random() * 0.03 + 0.02
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
  }, [canvasWidth, canvasHeight]);

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
      // 1. Clear Arena
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Draw subtle grid guide ceiling line
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(X_OFFSET, Y_OFFSET);
      ctx.lineTo(canvasWidth - X_OFFSET, Y_OFFSET);
      ctx.stroke();

      // Danger Line: 2-3 rows above launcher
      let hasDangerBubbles = false;
      for (let r = 10; r < gridMatrix.length; r++) {
        if (gridMatrix[r]?.some((b) => b !== null)) {
          hasDangerBubbles = true;
          break;
        }
      }

      ctx.save();
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = hasDangerBubbles ? 2 : 1;
      ctx.strokeStyle = hasDangerBubbles ? 'rgba(239, 68, 68, 0.85)' : 'rgba(239, 68, 68, 0.25)';
      ctx.beginPath();
      ctx.moveTo(X_OFFSET, DANGER_Y);
      ctx.lineTo(canvasWidth - X_OFFSET, DANGER_Y);
      ctx.stroke();

      if (hasDangerBubbles) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
        ctx.font = 'bold 10px "Fredoka", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('⚠️ DANGER LINE', canvasWidth - X_OFFSET - 4, DANGER_Y - 4);
      }
      ctx.restore();

      // 2. Render Existing Grid Bubbles
      for (let r = 0; r < gridMatrix.length; r++) {
        for (let c = 0; c < gridMatrix[r].length; c++) {
          const bubble = gridMatrix[r][c];
          if (bubble) {
            const pos = gridToPixel(r, c, BUBBLE_RADIUS, X_OFFSET, Y_OFFSET);
            drawBubble(ctx, pos.x, pos.y, BUBBLE_RADIUS, bubble.color, bubble.type);
          }
        }
      }

      // 3. Render Hint Target Ring (if requested)
      if (hintData && hintData.target) {
        ctx.save();
        ctx.strokeStyle = '#FACC15';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(hintData.target.x, hintData.target.y, BUBBLE_RADIUS + 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 4. Render Trajectory Guide Laser (when ready or aiming)
      if (gameStatus === GAME_STATES.READY || gameStatus === GAME_STATES.AIMING) {
        const isSuperAim = superAimActive || activeBooster === 'superAim';
        const traj = calculateTrajectory(
          LAUNCHER_X,
          LAUNCHER_Y,
          aimAngle,
          gridMatrix,
          canvasWidth,
          isSuperAim,
          BUBBLE_RADIUS,
          X_OFFSET,
          Y_OFFSET
        );

        ctx.save();
        ctx.setLineDash([5, 6]);
        ctx.lineWidth = isSuperAim ? 3 : 2;
        ctx.strokeStyle = isSuperAim ? '#00F0FF' : 'rgba(255, 255, 255, 0.6)';
        ctx.shadowColor = isSuperAim ? '#00F0FF' : 'rgba(255, 255, 255, 0.4)';
        ctx.shadowBlur = isSuperAim ? 12 : 4;

        ctx.beginPath();
        traj.points.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();

        // If Super Aim or collision detected, draw target landing preview circle
        if (traj.landingTarget) {
          ctx.beginPath();
          ctx.arc(traj.landingTarget.x, traj.landingTarget.y, BUBBLE_RADIUS, 0, Math.PI * 2);
          ctx.strokeStyle = isSuperAim ? '#FACC15' : 'rgba(255, 255, 255, 0.5)';
          ctx.stroke();
        }
        ctx.restore();
      }

      // 5. Update & Render Active Flying Projectile
      if (activeProjectileRef.current) {
        const proj = activeProjectileRef.current;
        const collisionResult = stepProjectile(proj, gridMatrix, canvasWidth, X_OFFSET, Y_OFFSET);

        drawBubble(ctx, proj.x, proj.y, BUBBLE_RADIUS, proj.color, proj.type);

        if (collisionResult.hasCollided && collisionResult.snapCell) {
          const { row, col } = collisionResult.snapCell;
          activeProjectileRef.current = null;

          soundEngine.playSnap();

          // Snapshot grid and insert new bubble into cell
          const newGrid = cloneGrid(gridMatrix);
          newGrid[row][col] = {
            color: proj.color,
            type: proj.type || SPECIAL_BUBBLES.NORMAL
          };

          setGridMatrix(newGrid);
          setGameStatus(GAME_STATES.RESOLVING);

          // Handle special bomb booster blast
          if (proj.type === SPECIAL_BUBBLES.BOMB || proj.color === 'bomb') {
            soundEngine.playBombExplode();
            const bombPops = [];
            const directNeighbors = getHexNeighbors(row, col);
            bombPops.push({ row, col });

            directNeighbors.forEach(n => {
              bombPops.push(n);
              getHexNeighbors(n.row, n.col).forEach(n2 => bombPops.push(n2));
            });

            // Unique cells
            const uniquePops = Array.from(new Set(bombPops.map(p => `${p.row},${p.col}`)))
              .map(str => {
                const [r, c] = str.split(',').map(Number);
                return { row: r, col: c };
              })
              .filter(p => newGrid[p.row] && newGrid[p.row][p.col]);

            uniquePops.forEach(p => {
              const b = newGrid[p.row][p.col];
              if (b) {
                const pos = gridToPixel(p.row, p.col, BUBBLE_RADIUS, X_OFFSET, Y_OFFSET);
                spawnPopParticles(pos.x, pos.y, getColorDef(b.color), 10);
                newGrid[p.row][p.col] = null;
              }
            });

            setGridMatrix(newGrid);
            recordTurnResolution(uniquePops.length, 0, 0);

            // Floating drop check
            const dropped = findFloatingBubbles(newGrid);
            if (dropped.length > 0) {
              dropped.forEach(d => {
                const pos = gridToPixel(d.row, d.col, BUBBLE_RADIUS, X_OFFSET, Y_OFFSET);
                floatingBubblesRef.current.push(createDroppingBubble(d.row, d.col, pos.x, pos.y, d.bubble));
                newGrid[d.row][d.col] = null;
              });
              setGridMatrix(newGrid);
              soundEngine.playDrop();
            }

            replenishBubbles();
            evaluateLevelEnd();
            return;
          }

          // Standard Match-3 BFS Check
          const matchedCluster = findConnectedMatch(newGrid, row, col);

          if (matchedCluster.length >= 3) {
            // Trigger Pop Audio with Combo Pitch
            soundEngine.playPop(1);

            // Spawn Particles & Clear Cluster
            matchedCluster.forEach((cell) => {
              const b = newGrid[cell.row][cell.col];
              const pos = gridToPixel(cell.row, cell.col, BUBBLE_RADIUS, X_OFFSET, Y_OFFSET);
              spawnPopParticles(pos.x, pos.y, getColorDef(b?.color), 12);
              newGrid[cell.row][cell.col] = null;
            });

            // Check for rescued Starlight Jellies
            const rescuedCount = checkRescuedJellies(newGrid);

            // Check for Floating Bubbles to Detach
            const floating = findFloatingBubbles(newGrid);
            if (floating.length > 0) {
              soundEngine.playDrop();
              floating.forEach((cell) => {
                const pos = gridToPixel(cell.row, cell.col, BUBBLE_RADIUS, X_OFFSET, Y_OFFSET);
                floatingBubblesRef.current.push(createDroppingBubble(cell.row, cell.col, pos.x, pos.y, cell.bubble));
                newGrid[cell.row][cell.col] = null;
              });
              spawnFloatingText(LAUNCHER_X, LAUNCHER_Y - 50, `+${floating.length * 20} AVALANCHE!`, '#10B981');
            }

            // Commit new grid and compute turn score
            setGridMatrix(newGrid);
            recordTurnResolution(matchedCluster.length, floating.length, rescuedCount);

            if (matchedCluster.length >= 5) {
              spawnFloatingText(LAUNCHER_X, LAUNCHER_Y - 80, 'GREAT POP! x2', '#FACC15');
            }
          } else {
            // Missed match - combo reset
            recordTurnResolution(0, 0, 0);
          }

          replenishBubbles();
          evaluateLevelEnd();
        }
      }

      // 6. Update & Render Dropping Floating Bubbles
      if (floatingBubblesRef.current.length > 0) {
        floatingBubblesRef.current = updateDroppingBubbles(floatingBubblesRef.current, canvasHeight + 50);
        floatingBubblesRef.current.forEach((fb) => {
          ctx.save();
          ctx.translate(fb.x, fb.y);
          ctx.rotate(fb.rotation || 0);
          drawBubble(ctx, 0, 0, BUBBLE_RADIUS, fb.bubble.color, fb.bubble.type);
          ctx.restore();
        });
      }

      // 7. Update & Render Particles
      if (particlesRef.current.length > 0) {
        particlesRef.current.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15; // Gravity
          p.alpha -= p.decay;

          if (p.alpha > 0) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        });
        particlesRef.current = particlesRef.current.filter((p) => p.alpha > 0);
      }

      // 8. Update & Render Floating Score Texts
      if (floatingTextsRef.current.length > 0) {
        floatingTextsRef.current.forEach((t) => {
          t.y += t.vy;
          t.alpha -= 0.02;

          if (t.alpha > 0) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, t.alpha);
            ctx.fillStyle = t.color;
            ctx.font = 'bold 14px Nunito, Fredoka, sans-serif';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 4;
            ctx.fillText(t.text, t.x, t.y);
            ctx.restore();
          }
        });
        floatingTextsRef.current = floatingTextsRef.current.filter((t) => t.alpha > 0);
      }

      // 9. Render Rotating Launcher Base & Loaded Ammo
      drawLauncherAssembly(ctx, LAUNCHER_X, LAUNCHER_Y, aimAngle, currentBubble, nextBubble);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    gridMatrix,
    gameStatus,
    aimAngle,
    currentBubble,
    nextBubble,
    superAimActive,
    activeBooster,
    hintData,
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

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💣', x, y);

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

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🌈', x, y);

      ctx.restore();
      return;
    }

    // 4. Standard Glossy Cartoon Bubble
    const colorDef = getColorDef(colorId);

    ctx.shadowColor = colorDef.glow || 'rgba(0, 240, 255, 0.5)';
    ctx.shadowBlur = 8;

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
   * Draw Launcher Pedestal, Cannon Barrel, and Ammo Indicators
   */
  const drawLauncherAssembly = (ctx, x, y, angle, current, next) => {
    ctx.save();

    // 1. Base Pedestal Ring
    ctx.beginPath();
    ctx.arc(x, y, BUBBLE_RADIUS * 1.8, 0, Math.PI * 2);
    const baseGrad = ctx.createRadialGradient(x, y, 5, x, y, BUBBLE_RADIUS * 1.8);
    baseGrad.addColorStop(0, '#334155');
    baseGrad.addColorStop(0.7, '#1E293B');
    baseGrad.addColorStop(1, '#0F172A');
    ctx.fillStyle = baseGrad;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    // Inner bevel ring
    ctx.beginPath();
    ctx.arc(x, y, BUBBLE_RADIUS * 1.4, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 2. Rotating Cannon Barrel
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2);

    const barrelWidth = BUBBLE_RADIUS * 1.1;
    const barrelLength = BUBBLE_RADIUS * 1.6;
    ctx.beginPath();
    ctx.rect(-barrelWidth / 2, -barrelLength - BUBBLE_RADIUS * 0.6, barrelWidth, barrelLength);
    const barrelGrad = ctx.createLinearGradient(-barrelWidth / 2, 0, barrelWidth / 2, 0);
    barrelGrad.addColorStop(0, '#1E293B');
    barrelGrad.addColorStop(0.5, '#475569');
    barrelGrad.addColorStop(1, '#0F172A');
    ctx.fillStyle = barrelGrad;
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1.5;
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // 3. Current Loaded Bubble in Chamber
    drawBubble(ctx, x, y, BUBBLE_RADIUS, current);

    // 4. Next Bubble Ammo Tray (Tap to Swap)
    ctx.beginPath();
    ctx.arc(NEXT_BUBBLE_X, NEXT_BUBBLE_Y, BUBBLE_RADIUS * 1.15, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 1.5;
    ctx.fill();
    ctx.stroke();

    drawBubble(ctx, NEXT_BUBBLE_X, NEXT_BUBBLE_Y, BUBBLE_RADIUS * 0.8, next);

    // Swap Hint Label
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 9px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('⇄ SWAP', NEXT_BUBBLE_X, NEXT_BUBBLE_Y + BUBBLE_RADIUS * 1.25);

    ctx.restore();
  };

  /**
   * Pointer Angle Calculations with strict aspect-ratio mapping
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

    // Check if clicked the launcher base or next bubble tray
    const distToLauncher = Math.hypot(pointerX - LAUNCHER_X, pointerY - LAUNCHER_Y);
    const distToNext = Math.hypot(pointerX - NEXT_BUBBLE_X, pointerY - NEXT_BUBBLE_Y);
    if (distToLauncher < BUBBLE_RADIUS * 2 || distToNext < BUBBLE_RADIUS * 1.6) {
      return 'SWAP_TRIGGERED';
    }

    const angle = Math.atan2(pointerY - LAUNCHER_Y, pointerX - LAUNCHER_X);
    const clamped = clampAimAngle(angle);
    setAimAngle(clamped);
    return 'AIM_UPDATED';
  };

  // --- DESKTOP MOUSE CONTROLS ---
  const handleMouseMove = (e) => {
    if (gameStatus !== GAME_STATES.READY && gameStatus !== GAME_STATES.AIMING) return;
    updateAimFromPointer(e.clientX, e.clientY);
  };

  const handleMouseDown = (e) => {
    if (gameStatus !== GAME_STATES.READY && gameStatus !== GAME_STATES.AIMING) return;
    const result = updateAimFromPointer(e.clientX, e.clientY);
    if (result === 'SWAP_TRIGGERED') {
      swapBubbles();
      return;
    }
    isAimingRef.current = true;
    setGameStatus(GAME_STATES.AIMING);
  };

  const handleMouseUp = () => {
    if (isAimingRef.current && (gameStatus === GAME_STATES.READY || gameStatus === GAME_STATES.AIMING)) {
      isAimingRef.current = false;
      const shot = fireBubble();
      if (shot) {
        activeProjectileRef.current = {
          x: LAUNCHER_X,
          y: LAUNCHER_Y,
          vx: Math.cos(shot.angle) * PHYSICS.LAUNCH_SPEED,
          vy: Math.sin(shot.angle) * PHYSICS.LAUNCH_SPEED,
          color: shot.color,
          type: shot.isBooster || SPECIAL_BUBBLES.NORMAL,
          radius: BUBBLE_RADIUS
        };
      }
    }
  };

  // --- MOBILE TOUCH CONTROLS (drag-to-aim with touch-action: none) ---
  const handleTouchStart = (e) => {
    if (gameStatus !== GAME_STATES.READY && gameStatus !== GAME_STATES.AIMING) return;
    const touch = e.touches[0];
    const result = updateAimFromPointer(touch.clientX, touch.clientY);
    if (result === 'SWAP_TRIGGERED') {
      swapBubbles();
      return;
    }
    isAimingRef.current = true;
    setGameStatus(GAME_STATES.AIMING);
  };

  const handleTouchMove = (e) => {
    if (!isAimingRef.current) return;
    const touch = e.touches[0];
    updateAimFromPointer(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  // --- KEYBOARD CONTROLS (Spacebar to Shoot) ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleMouseUp();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  );
};

export default GameCanvas;
