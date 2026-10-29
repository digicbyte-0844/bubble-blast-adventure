import React, { useRef, useEffect } from 'react';
import HexGridEngine from '../engine/HexGrid';
import BallisticsEngine from '../engine/Ballistics';
import GraphEngine, { DroppingBubble } from '../engine/GraphAlgorithms';
import AudioSynthesizer from '../engine/AudioSynthesizer';
import { useGameStore } from '../store/useGameStore';
import { useUserStore } from '../store/useUserStore';
import ApiService from '../services/api';

const COLOR_MAP: Record<string, { fill: string; stroke: string; glow: string }> = {
  CYAN: { fill: '#00F0FF', stroke: '#80F8FF', glow: 'rgba(0, 240, 255, 0.6)' },
  MAGENTA: { fill: '#FF00A0', stroke: '#FF80D0', glow: 'rgba(255, 0, 160, 0.6)' },
  GOLD: { fill: '#FFD700', stroke: '#FFEAA0', glow: 'rgba(255, 215, 0, 0.6)' },
  EMERALD: { fill: '#00FF88', stroke: '#80FFAA', glow: 'rgba(0, 255, 136, 0.6)' },
  CRIMSON: { fill: '#FF3366', stroke: '#FFA0B5', glow: 'rgba(255, 51, 102, 0.6)' },
  VIOLET: { fill: '#9933FF', stroke: '#CC99FF', glow: 'rgba(153, 51, 255, 0.6)' },
  BOMB: { fill: '#1F1B2C', stroke: '#FF5500', glow: 'rgba(255, 85, 0, 0.8)' },
  RAINBOW: { fill: '#FFFFFF', stroke: '#00FFFF', glow: 'rgba(255, 255, 255, 0.8)' },
  JELLY: { fill: '#FF69B4', stroke: '#FFF0F5', glow: 'rgba(255, 105, 180, 0.8)' },
  ROCK: { fill: '#6B7280', stroke: '#9CA3AF', glow: 'rgba(107, 114, 128, 0.5)' }
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
}

export const CanvasView: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const {
    levelId,
    gridMatrix,
    gameState,
    aimAngle,
    currentBubble,
    superAimActive,
    sessionToken,
    shotsRemaining,
    score,
    setGameState,
    setAimAngle,
    fireBubble,
    replenishBubbles,
    updateGridCell,
    addScore,
    incrementRescuedJellies,
    checkLevelObjectives
  } = useGameStore();

  const { updateLevelSuccess } = useUserStore();

  const synth = AudioSynthesizer.getInstance();
  const hexEngineRef = useRef(new HexGridEngine(19));
  const particlesRef = useRef<Particle[]>([]);
  const droppingBubblesRef = useRef<DroppingBubble[]>([]);

  // Projectile state
  const projectileRef = useRef<{
    active: boolean;
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    isBooster: string | null;
  }>({
    active: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    color: 'CYAN',
    isBooster: null
  });

  // Track combo in turn
  const turnComboRef = useRef<number>(0);
  const totalPopsRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    totalPopsRef.current = 0;
    startTimeRef.current = Date.now();
  }, [levelId]);

  // Setup loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const hexEngine = hexEngineRef.current;

      // 1. Clear Backdrop Canvas
      ctx.fillStyle = '#0B0819';
      ctx.fillRect(0, 0, width, height);

      // Starfield background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      for (let i = 0; i < 40; i++) {
        const sx = ((i * 97) % width);
        const sy = ((i * 131) % height);
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Ceiling visual bar
      ctx.fillStyle = '#28214E';
      ctx.fillRect(0, 0, width, 8);
      ctx.fillStyle = '#7952FF';
      ctx.fillRect(0, 6, width, 2);

      // 2. Render Hexagonal Grid
      for (let r = 0; r < hexEngine.rows; r++) {
        const rowCols = (r % 2 === 0) ? hexEngine.cols : hexEngine.cols - 1;
        for (let c = 0; c < rowCols; c++) {
          const colorKey = gridMatrix[r]?.[c];
          if (colorKey) {
            const pos = hexEngine.hexToPixel(c, r, width);
            drawBubble(ctx, pos.x, pos.y, hexEngine.bubbleRadius, colorKey);
          }
        }
      }

      // 3. Aim Guide & Trajectory Preview
      const launcherX = width / 2;
      const launcherY = height - 55;

      if ((gameState === 'READY' || gameState === 'AIMING') && !projectileRef.current.active) {
        const prediction = BallisticsEngine.predictTrajectory(
          launcherX,
          launcherY,
          aimAngle,
          width,
          gridMatrix,
          hexEngine,
          superAimActive ? 2 : 1
        );

        // Draw dotted laser line
        ctx.save();
        ctx.setLineDash([5, 6]);
        ctx.strokeStyle = superAimActive ? '#00FF88' : 'rgba(0, 240, 255, 0.7)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        prediction.segments.forEach((seg, i) => {
          if (i === 0) ctx.moveTo(seg.startX, seg.startY);
          ctx.lineTo(seg.endX, seg.endY);
        });
        ctx.stroke();
        ctx.restore();

        // Draw holographic Ghost Bubble at landing site
        if (prediction.ghostCell) {
          const ghostPos = hexEngine.hexToPixel(prediction.ghostCell.col, prediction.ghostCell.row, width);
          ctx.save();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.setLineDash([3, 3]);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(ghostPos.x, ghostPos.y, hexEngine.bubbleRadius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
          ctx.fill();
          ctx.restore();
        }
      }

      // 4. Update & Render Flying Projectile
      if (projectileRef.current.active) {
        const p = projectileRef.current;
        p.x += p.vx * (1 / 60);
        p.y += p.vy * (1 / 60);

        // Lateral Wall Bounce
        const radius = hexEngine.bubbleRadius;
        if (p.x <= radius) {
          p.x = radius;
          p.vx = -p.vx;
          synth.playBounce();
        } else if (p.x >= width - radius) {
          p.x = width - radius;
          p.vx = -p.vx;
          synth.playBounce();
        }

        // Ceiling or Bubble Grid Collision
        let collided = false;
        if (p.y <= radius + 10) {
          collided = true;
        } else {
          for (let r = 0; r < hexEngine.rows; r++) {
            const rowCols = (r % 2 === 0) ? hexEngine.cols : hexEngine.cols - 1;
            for (let c = 0; c < rowCols; c++) {
              if (gridMatrix[r]?.[c]) {
                const bPos = hexEngine.hexToPixel(c, r, width);
                const distSq = (p.x - bPos.x) ** 2 + (p.y - bPos.y) ** 2;
                if (distSq <= (radius * 1.85) ** 2) {
                  collided = true;
                  break;
                }
              }
            }
            if (collided) break;
          }
        }

        if (collided) {
          setGameState('COLLISION_SNAP');
          handleBubbleImpact(p.x, p.y, p.color, p.isBooster);
          projectileRef.current.active = false;
        } else {
          drawBubble(ctx, p.x, p.y, radius, p.color);
        }
      }

      // 5. Update & Render Dropping Disconnected Bubbles
      for (let i = droppingBubblesRef.current.length - 1; i >= 0; i--) {
        const b = droppingBubblesRef.current[i];
        b.vy += 0.45; // Gravity acceleration g = 0.45 px/frame^2
        b.x += b.vx;
        b.y += b.vy;
        b.rotation += b.torque;

        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rotation);
        drawBubble(ctx, 0, 0, hexEngine.bubbleRadius, b.color);
        ctx.restore();

        if (b.y > height + 40) {
          droppingBubblesRef.current.splice(i, 1);
        }
      }

      // 6. Update & Render Pop Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const pt = particlesRef.current[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha -= 0.03;

        ctx.save();
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (pt.alpha <= 0) {
          particlesRef.current.splice(i, 1);
        }
      }

      // 7. Render Launcher Base & Cannon
      ctx.save();
      ctx.translate(launcherX, launcherY);
      ctx.rotate(aimAngle + Math.PI / 2);

      // Launcher Cannon Barrel
      const barrelGrad = ctx.createLinearGradient(-12, -35, 12, -35);
      barrelGrad.addColorStop(0, '#28214E');
      barrelGrad.addColorStop(0.5, '#7952FF');
      barrelGrad.addColorStop(1, '#28214E');
      ctx.fillStyle = barrelGrad;
      ctx.fillRect(-12, -35, 24, 35);
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-12, -35, 24, 35);

      ctx.restore();

      // Launcher Platform Pedestal
      ctx.beginPath();
      ctx.arc(launcherX, launcherY, 26, 0, Math.PI * 2);
      ctx.fillStyle = '#16122E';
      ctx.fill();
      ctx.strokeStyle = '#7952FF';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Current Bubble ready in launcher nozzle
      if (!projectileRef.current.active) {
        drawBubble(ctx, launcherX, launcherY, hexEngine.bubbleRadius, currentBubble);
      }

      // Mascot Bloopi perched on launcher deck
      drawMascotBloopi(ctx, launcherX - 70, launcherY - 15);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [gridMatrix, gameState, aimAngle, currentBubble, superAimActive]);

  // Handle Bubble Impact & Graph Evaluation
  const handleBubbleImpact = (x: number, y: number, color: string, booster: string | null) => {
    const width = canvasRef.current?.width || 380;
    const hexEngine = hexEngineRef.current;
    const snap = hexEngine.findOptimalSnapCell(x, y, gridMatrix, width);
    if (!snap) return;

    synth.playSnap();
    updateGridCell(snap.col, snap.row, color);

    // Deep copy current matrix including new bubble
    const tempMatrix = gridMatrix.map((r) => [...r]);
    tempMatrix[snap.row][snap.col] = color;

    // Handle Bomb AOE (2-hex radius blast)
    if (booster === 'BOMB' || color === 'BOMB') {
      synth.playBomb();
      const neighbors = hexEngine.getNeighbors(snap.col, snap.row);
      const allNeighbors = [{ col: snap.col, row: snap.row }, ...neighbors];
      allNeighbors.forEach((cell) => {
        const cVal = tempMatrix[cell.row]?.[cell.col];
        if (cVal) {
          totalPopsRef.current += 1;
          const pos = hexEngine.hexToPixel(cell.col, cell.row, width);
          spawnParticles(pos.x, pos.y, '#FF5500');
          tempMatrix[cell.row][cell.col] = null;
          updateGridCell(cell.col, cell.row, null);
        }
      });
      addScore(800, turnComboRef.current + 1);
    } else {
      // Standard BFS Match-3 Evaluation
      const cluster = GraphEngine.findMatchCluster(snap.col, snap.row, tempMatrix, hexEngine);

      if (cluster.length >= 3) {
        totalPopsRef.current += cluster.length;
        turnComboRef.current += 1;
        synth.playPop(turnComboRef.current);

        let jelliesFound = 0;
        cluster.forEach((cell) => {
          const cVal = tempMatrix[cell.row]?.[cell.col];
          if (cVal === 'JELLY') jelliesFound++;
          const pos = hexEngine.hexToPixel(cell.col, cell.row, width);
          spawnParticles(pos.x, pos.y, COLOR_MAP[cVal || 'CYAN']?.fill || '#00F0FF');
          tempMatrix[cell.row][cell.col] = null;
          updateGridCell(cell.col, cell.row, null);
        });

        if (jelliesFound > 0) {
          incrementRescuedJellies(jelliesFound);
        }

        addScore(cluster.length * 100, turnComboRef.current);
      } else {
        turnComboRef.current = 0; // Reset combo on non-match
      }
    }

    // Topological Orphan Ceiling Reachability Drop Evaluation
    const orphans = GraphEngine.findFloatingOrphans(tempMatrix, hexEngine);
    if (orphans.length > 0) {
      totalPopsRef.current += orphans.length;
      synth.playDrop();
      orphans.forEach((cell) => {
        const cVal = tempMatrix[cell.row]?.[cell.col];
        if (cVal) {
          const pos = hexEngine.hexToPixel(cell.col, cell.row, width);
          droppingBubblesRef.current.push({
            col: cell.col,
            row: cell.row,
            color: cVal,
            x: pos.x,
            y: pos.y,
            vx: (Math.random() - 0.5) * 4,
            vy: -Math.random() * 2,
            rotation: 0,
            torque: (Math.random() - 0.5) * 0.1
          });
          tempMatrix[cell.row][cell.col] = null;
          updateGridCell(cell.col, cell.row, null);
        }
      });
      addScore(orphans.length * 250, turnComboRef.current);
    }

    // Advance turn & Check Win/Loss
    setGameState('NEXT_SHOT');
    replenishBubbles();
    checkLevelObjectives();

    // Submit authoritative session completion if won
    setTimeout(() => {
      const state = useGameStore.getState();
      if (state.gameState === 'VICTORY' || state.gameState === 'LEVEL_COMPLETE') {
        updateLevelSuccess(levelId, state.score, 3);
        if (sessionToken) {
          ApiService.completeGameSession({
            sessionToken,
            claimedScore: state.score,
            shotsFired: (state.levelData?.maxShots || 30) - shotsRemaining,
            remainingShots: shotsRemaining,
            elapsedDurationMs: Date.now() - startTimeRef.current,
            starsEarned: 3,
            bubblesPopped: totalPopsRef.current,
            comboRecord: state.comboCount,
            rescuedJellies: state.rescuedJellies,
            objectiveCompleted: true
          }).catch(() => {});
        }
      }
    }, 200);
  };

  const spawnParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 * i) / 16;
      const speed = 2 + Math.random() * 4;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        alpha: 1.0,
        size: 3 + Math.random() * 3
      });
    }
  };

  // Pointer & Touch aiming gestures
  const updateAim = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const launcherX = canvas.width / 2;
    const launcherY = canvas.height - 55;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const touchX = (clientX - rect.left) * scaleX;
    const touchY = (clientY - rect.top) * scaleY;

    const rawAngle = Math.atan2(touchY - launcherY, touchX - launcherX);
    const clamped = BallisticsEngine.clampAngle(rawAngle);
    setAimAngle(clamped);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (gameState !== 'READY') return;
    setGameState('AIMING');
    updateAim(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (gameState === 'READY' || gameState === 'AIMING') {
      if (gameState === 'READY') setGameState('AIMING');
      updateAim(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = () => {
    const shot = fireBubble();
    if (shot) {
      const width = canvasRef.current?.width || 380;
      const height = canvasRef.current?.height || 580;
      const launcherX = width / 2;
      const launcherY = height - 55;

      const speed = BallisticsEngine.LAUNCH_SPEED;
      projectileRef.current = {
        active: true,
        x: launcherX,
        y: launcherY,
        vx: Math.cos(shot.angle) * speed,
        vy: Math.sin(shot.angle) * speed,
        color: shot.color,
        isBooster: shot.isBooster
      };
    }
  };

  return (
    <div className="relative flex justify-center items-center select-none touch-none">
      <canvas
        ref={canvasRef}
        width={380}
        height={580}
        className="rounded-3xl border-2 border-cosmic-border shadow-2xl bg-cosmic-dark cursor-crosshair max-w-full"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
    </div>
  );
};

// Canvas drawing helper for luminescent bubbles
function drawBubble(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, colorKey: string) {
  const conf = COLOR_MAP[colorKey] || COLOR_MAP.CYAN;

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);

  // Radial gradient for glossy 3D sphere look
  const grad = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(0.3, conf.fill);
  grad.addColorStop(1, conf.stroke);

  ctx.fillStyle = grad;
  ctx.shadowColor = conf.glow;
  ctx.shadowBlur = 8;
  ctx.fill();

  // Glass specular highlight
  ctx.beginPath();
  ctx.ellipse(x - r * 0.3, y - r * 0.35, r * 0.35, r * 0.2, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.shadowBlur = 0;
  ctx.fill();

  // Special Icon overlays (crisp vector rendering without OS emoji dependency)
  if (colorKey === 'BOMB') {
    ctx.beginPath();
    ctx.arc(x, y + 1, r * 0.42, 0, Math.PI * 2);
    ctx.fillStyle = '#0F172A';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 2, y - r * 0.35);
    ctx.quadraticCurveTo(x + 5, y - r * 0.6, x + 8, y - r * 0.55);
    ctx.strokeStyle = '#FDE047';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + 8, y - r * 0.55, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#FF4500';
    ctx.fill();
  } else if (colorKey === 'RAINBOW' || colorKey === 'JELLY') {
    ctx.fillStyle = colorKey === 'RAINBOW' ? '#FFFFFF' : '#FEF08A';
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const outerAngle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const outerX = x + Math.cos(outerAngle) * (r * 0.42);
      const outerY = y + Math.sin(outerAngle) * (r * 0.42);
      if (i === 0) ctx.moveTo(outerX, outerY);
      else ctx.lineTo(outerX, outerY);
    }
    ctx.closePath();
    ctx.fill();
  } else if (colorKey === 'ROCK') {
    ctx.fillStyle = '#94A3B8';
    ctx.beginPath();
    ctx.moveTo(x - r * 0.4, y - r * 0.2);
    ctx.lineTo(x, y - r * 0.5);
    ctx.lineTo(x + r * 0.45, y - r * 0.1);
    ctx.lineTo(x + r * 0.35, y + r * 0.4);
    ctx.lineTo(x - r * 0.3, y + r * 0.45);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

// Procedural mascot Bloopi the Starlight Jelly
function drawMascotBloopi(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);

  // Jelly Body Glow
  ctx.fillStyle = '#FF00A0';
  ctx.shadowColor = 'rgba(255, 0, 160, 0.8)';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(0, 0, 16, Math.PI, 0, false);
  ctx.bezierCurveTo(18, 10, 8, 16, 0, 14);
  ctx.bezierCurveTo(-8, 16, -18, 10, -16, 0);
  ctx.fill();

  // Kawaii Eyes
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(-5, -2, 3, 0, Math.PI * 2);
  ctx.arc(5, -2, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0B0819';
  ctx.beginPath();
  ctx.arc(-4, -2, 1.5, 0, Math.PI * 2);
  ctx.arc(6, -2, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Little Starlight Antenna
  ctx.strokeStyle = '#00F0FF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -14);
  ctx.lineTo(0, -22);
  ctx.stroke();

  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(0, -22, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export default CanvasView;
