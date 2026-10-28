/**
 * 60 FPS HTML5 Interactive Canvas Game Board
 * High-DPI responsive rendering, Odd-R hexagonal snapping, glossy cartoon bubble shading,
 * rotating cannon launcher, trajectory laser preview, particle physics, and desktop/mobile touch controls.
 * Bubble Puzzle Engine Engine
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

// Logical canvas coordinate resolution
const VIRTUAL_WIDTH = 380;
const VIRTUAL_HEIGHT = 580;
const BUBBLE_RADIUS = 17; // 11 * 34 = 374 px
const X_OFFSET = (VIRTUAL_WIDTH - 11 * (BUBBLE_RADIUS * 2)) / 2; // 3px
const Y_OFFSET = 10;
const LAUNCHER_X = VIRTUAL_WIDTH / 2; // 190
const LAUNCHER_Y = 525;
const NEXT_BUBBLE_X = 135;
const NEXT_BUBBLE_Y = 535;

export const GameCanvas = () => {
  const canvasRef = useRef(null);

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
      ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

      // Draw subtle grid guide ceiling line
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(X_OFFSET, Y_OFFSET);
      ctx.lineTo(VIRTUAL_WIDTH - X_OFFSET, Y_OFFSET);
      ctx.stroke();

      // Danger Line: 2 rows above the launcher (Y = 460)
      const DANGER_Y = 460;
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
      ctx.lineTo(VIRTUAL_WIDTH - X_OFFSET, DANGER_Y);
      ctx.stroke();

      if (hasDangerBubbles) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
        ctx.font = 'bold 9px "Fredoka", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('⚠️ DANGER LINE', VIRTUAL_WIDTH - X_OFFSET - 4, DANGER_Y - 4);
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
        const isSuperAim = superAimActive || activeBooster === 'aimGuide';
        const traj = calculateTrajectory(
          LAUNCHER_X,
          LAUNCHER_Y,
          aimAngle,
          gridMatrix,
          VIRTUAL_WIDTH,
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
        const collisionResult = stepProjectile(proj, gridMatrix, VIRTUAL_WIDTH, X_OFFSET, Y_OFFSET);

        drawBubble(ctx, proj.x, proj.y, BUBBLE_RADIUS, proj.color, proj.type);

        if (collisionResult.hasCollided && collisionResult.snapCell) {
          const { row, col } = collisionResult.snapCell;
          activeProjectileRef.current = null;
          handleSnapAndResolve(row, col, proj);
        }
      }

      // 6. Update & Render Falling Disconnected Bubbles (Gravity Drops)
      if (floatingBubblesRef.current.length > 0) {
        floatingBubblesRef.current = updateDroppingBubbles(floatingBubblesRef.current, VIRTUAL_HEIGHT);
        floatingBubblesRef.current.forEach((b) => {
          ctx.save();
          ctx.globalAlpha = Math.max(0, b.alpha);
          ctx.translate(b.x, b.y);
          ctx.rotate(b.rotation);
          drawBubble(ctx, 0, 0, b.radius || BUBBLE_RADIUS, b.color, b.type);
          ctx.restore();
        });
      }

      // 7. Update & Render Popping Particles
      if (particlesRef.current.length > 0) {
        particlesRef.current = particlesRef.current.filter((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15; // Gravity on debris
          p.life -= p.decay;

          ctx.save();
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          return p.life > 0.05;
        });
      }

      // 8. Update & Render Floating Score Badges
      if (floatingTextsRef.current.length > 0) {
        floatingTextsRef.current = floatingTextsRef.current.filter((ft) => {
          ft.y += ft.vy;
          ft.alpha -= 0.02;

          ctx.save();
          ctx.globalAlpha = Math.max(0, ft.alpha);
          ctx.fillStyle = ft.color;
          ctx.font = 'bold 14px Nunito, Fredoka, sans-serif';
          ctx.textAlign = 'center';
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 4;
          ctx.fillText(ft.text, ft.x, ft.y);
          ctx.restore();

          return ft.alpha > 0.05;
        });
      }

      // 9. Render Rotating Launcher & Ammo Cradle at the Bottom
      drawLauncher(ctx, LAUNCHER_X, LAUNCHER_Y, aimAngle, currentBubble, nextBubble);

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
    activeBooster,
    superAimActive,
    hintData
  ]);

  /**
   * Draws a glossy cartoon bubble with radial gradient, 3D specular highlight, and special effects
   */
  const drawBubble = (ctx, x, y, radius, colorId, type = SPECIAL_BUBBLES.NORMAL) => {
    ctx.save();

    // 1. Crystal Rescue Bubble (Trapped Starlight Jelly)
    if (type === SPECIAL_BUBBLES.STARLIGHT_JELLY_RESCUE) {
      // Iridescent crystal outer shell
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
      // Smiling mouth
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

      // Bomb icon emoji / skull mark
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

    // Outer glow
    ctx.shadowColor = colorDef.glow || 'rgba(0, 240, 255, 0.5)';
    ctx.shadowBlur = 8;

    // Radial sphere shading
    const grad = ctx.createRadialGradient(
      x - radius * 0.35,
      y - radius * 0.35,
      radius * 0.1,
      x,
      y,
      radius
    );
    grad.addColorStop(0, colorDef.secondary || '#FFFFFF');
    grad.addColorStop(0.65, colorDef.fill || '#00F0FF');
    grad.addColorStop(1, colorDef.border || '#0284C7');

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // 3D Specular Highlight Crescent (Cartoon Glass Sheen)
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.ellipse(
      x - radius * 0.35,
      y - radius * 0.35,
      radius * 0.42,
      radius * 0.22,
      -Math.PI / 4,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fill();

    // Secondary subtle bottom reflection
    ctx.beginPath();
    ctx.arc(x + radius * 0.2, y + radius * 0.3, radius * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fill();

    ctx.restore();
  };

  /**
   * Draws the mechanical rotating launcher cannon, swap tray, and remaining shots counter
   */
  const drawLauncher = (ctx, x, y, angle, current, next) => {
    ctx.save();

    // 1. Base Pedestal Ring (Tactile Metallic Obsidian)
    ctx.beginPath();
    ctx.arc(x, y, 32, 0, Math.PI * 2);
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(56, 189, 248, 0.4)';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.stroke();

    // Inner bevel ring
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 2. Rotating Cannon Barrel
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2); // Rotate towards aim angle

    ctx.beginPath();
    ctx.rect(-10, -42, 20, 28);
    const barrelGrad = ctx.createLinearGradient(-10, 0, 10, 0);
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
    ctx.arc(NEXT_BUBBLE_X, NEXT_BUBBLE_Y, 21, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 1.5;
    ctx.fill();
    ctx.stroke();

    drawBubble(ctx, NEXT_BUBBLE_X, NEXT_BUBBLE_Y, BUBBLE_RADIUS * 0.8, next);

    // Swap Hint Label
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 8px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('⇄ SWAP', NEXT_BUBBLE_X, NEXT_BUBBLE_Y + 23);

    // 5. Remaining Shots Counter Pill (Beneath Launcher)
    const pillY = y + 36;
    const isLowAmmo = shotsRemaining <= 5;
    const pillWidth = 105;
    const pillHeight = 18;
    const pillX = x - pillWidth / 2;

    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 9) : ctx.rect(pillX, pillY, pillWidth, pillHeight);
    ctx.fillStyle = isLowAmmo ? 'rgba(239, 68, 68, 0.2)' : 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = isLowAmmo ? '#EF4444' : '#334155';
    ctx.lineWidth = 1.5;
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isLowAmmo ? '#FCA5A5' : '#FCD34D';
    ctx.font = 'bold 10px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`🎯 ${shotsRemaining} Shots Left`, x, pillY + pillHeight / 2);

    ctx.restore();
  };

  /**
   * Snaps projectile into hex grid, triggers BFS match detection, ceiling drop physics, and turn scoring
   */
  const handleSnapAndResolve = (snapRow, snapCol, proj) => {
    setGameStatus(GAME_STATES.RESOLVING);

    // 1. Commit bubble to grid
    const newGrid = cloneGrid(gridMatrix);
    newGrid[snapRow][snapCol] = {
      color: proj.color,
      type: proj.type || SPECIAL_BUBBLES.NORMAL
    };

    soundEngine.play('bounce');

    // 2. Multi-Directional BFS Match Check
    const matchedCluster = findConnectedMatch(newGrid, snapRow, snapCol);

    if (matchedCluster.length >= 3) {
      // Check for freed Starlight Jellies
      const rescuedJellies = checkRescuedJellies(newGrid, matchedCluster);

      // Remove matched bubbles from grid and spawn particles
      matchedCluster.forEach((cell) => {
        const pos = gridToPixel(cell.row, cell.col, BUBBLE_RADIUS, X_OFFSET, Y_OFFSET);
        spawnPopParticles(pos.x, pos.y, getColorDef(cell.bubble.color));
        newGrid[cell.row][cell.col] = null;
      });

      // 3. Ceiling-Anchored BFS to detect disconnected floating islands
      const floatingIslands = findFloatingBubbles(newGrid, BUBBLE_RADIUS, X_OFFSET, Y_OFFSET);

      floatingIslands.forEach((f) => {
        newGrid[f.row][f.col] = null;
        floatingBubblesRef.current.push(createDroppingBubble(f.bubble, f.x, f.y, BUBBLE_RADIUS));
      });

      if (floatingIslands.length > 0) {
        soundEngine.play('floatingFall');
      }

      // Record Turn Scoring
      recordTurnResolution(matchedCluster.length, floatingIslands.length, rescuedJellies.length);

      const impactPos = gridToPixel(snapRow, snapCol, BUBBLE_RADIUS, X_OFFSET, Y_OFFSET);
      spawnFloatingText(impactPos.x, impactPos.y, `+${matchedCluster.length * 10}`);
    } else {
      // Missed shot breaks combo
      recordTurnResolution(0, 0, 0);
    }

    setGridMatrix(newGrid);

    // 4. Replenish ammo and evaluate game conditions
    setTimeout(() => {
      replenishBubbles();
      evaluateLevelEnd();
    }, 250);
  };

  /**
   * Translates pointer / touch coordinate to canvas angle
   */
  const updateAimFromPointer = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = VIRTUAL_WIDTH / rect.width;
    const scaleY = VIRTUAL_HEIGHT / rect.height;

    const pointerX = (clientX - rect.left) * scaleX;
    const pointerY = (clientY - rect.top) * scaleY;

    // Check if clicked the launcher base to swap bubbles
    const distToLauncher = Math.hypot(pointerX - LAUNCHER_X, pointerY - LAUNCHER_Y);
    const distToNext = Math.hypot(pointerX - NEXT_BUBBLE_X, pointerY - NEXT_BUBBLE_Y);
    if (distToLauncher < 36 || distToNext < 28) {
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
    <div className="relative w-full max-w-[380px] aspect-[380/580] mx-auto select-none overflow-hidden rounded-3xl bg-cosmic-dark/95 border-2 border-cosmic-border shadow-2xl touch-none">
      <canvas
        ref={canvasRef}
        width={VIRTUAL_WIDTH}
        height={VIRTUAL_HEIGHT}
        className="w-full h-full block cursor-crosshair"
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
