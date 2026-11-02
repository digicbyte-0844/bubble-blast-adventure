/**
 * Level Select Saga Roadmap Screen
 * King / Supercell / Rovio Caliber:
 * Winding Sinusoidal Saga Adventure Path across 4 Themed Biome Chapters,
 * Continuous SVG Golden/Stone Connecting Trail, 3 Distinct Node States (Emerald Medal, Hero Sonar Node, Frosted Slate Lock),
 * and Auto-Scroll to Current Hero Level.
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Lock, Play, ChevronRight, Award, Compass, Sparkles } from 'lucide-react';
import { GAME_NAME } from '../config/gameConfig.js';
import { useUserStore } from '../store/useUserStore';
import CharacterMascot from '../components/CharacterMascot.jsx';

// 4 Themed Biome Chapters
const BIOMES = [
  {
    id: 1,
    name: 'Emerald Canopy',
    subtitle: 'Rich Forest Teal & Luminescent Grove',
    range: [1, 10],
    accent: '#10B981',
    badge: '🌿 Biome 1',
    themeBg: 'from-emerald-950/40 via-teal-900/20 to-transparent',
    border: 'border-emerald-500/30'
  },
  {
    id: 2,
    name: 'Crystal Cavern',
    subtitle: 'Deep Sapphire & Amethyst Glow',
    range: [11, 20],
    accent: '#6366F1',
    badge: '💎 Biome 2',
    themeBg: 'from-indigo-950/40 via-blue-900/20 to-transparent',
    border: 'border-indigo-500/30'
  },
  {
    id: 3,
    name: 'Volcanic Forge',
    subtitle: 'Warm Amber & Molten Embers',
    range: [21, 30],
    accent: '#F97316',
    badge: '🔥 Biome 3',
    themeBg: 'from-orange-950/40 via-red-900/20 to-transparent',
    border: 'border-orange-500/30'
  },
  {
    id: 4,
    name: 'Astral Nebula',
    subtitle: 'Cosmic Indigo & Prismatic Starlight',
    range: [31, 40],
    accent: '#EC4899',
    badge: '🌌 Biome 4',
    themeBg: 'from-fuchsia-950/40 via-purple-900/20 to-transparent',
    border: 'border-pink-500/30'
  }
];

export const LevelSelectPage = () => {
  const navigate = useNavigate();
  const { progress } = useUserStore();
  const heroRef = useRef(null);

  useEffect(() => {
    document.title = `Saga Map — ${GAME_NAME}`;
  }, []);

  // Compute progress map and highest unlocked level
  const progressMap = useMemo(() => {
    const map = new Map();
    (progress || []).forEach((p) => map.set(p.levelId, p));
    return map;
  }, [progress]);

  const unlockedUpTo = useMemo(() => {
    let maxUnlocked = 1;
    (progress || []).forEach((p) => {
      if (p.isUnlocked && p.levelId > maxUnlocked) maxUnlocked = p.levelId;
    });
    return Math.min(40, maxUnlocked);
  }, [progress]);

  // Total stars earned
  const totalStars = useMemo(() => {
    return (progress || []).reduce((acc, p) => acc + (p.stars || 0), 0);
  }, [progress]);

  // Auto-scroll to Current Level (Hero Node) on initial open
  useEffect(() => {
    const timer = setTimeout(() => {
      heroRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
    return () => clearTimeout(timer);
  }, [unlockedUpTo]);

  // Sinusoidal Math & Node Coordinate Calculation
  // Container width = 360, center = 180, amplitude = 85, stepY = 115
  const MAP_WIDTH = 360;
  const CENTER_X = MAP_WIDTH / 2;
  const AMPLITUDE = 85;
  const STEP_Y = 115;
  const START_Y = 100;
  const TOTAL_LEVELS = 40;

  const nodePositions = useMemo(() => {
    const pos = [];
    for (let lvl = 1; lvl <= TOTAL_LEVELS; lvl++) {
      const idx = lvl - 1;
      const x = CENTER_X + Math.sin(idx * 0.65) * AMPLITUDE;
      const y = START_Y + idx * STEP_Y;
      pos.push({ levelId: lvl, x, y, idx });
    }
    return pos;
  }, []);

  const totalMapHeight = START_Y + TOTAL_LEVELS * STEP_Y + 80;

  // Generate SVG Path Beziers
  const { completedPathD, lockedPathD } = useMemo(() => {
    if (nodePositions.length < 2) return { completedPathD: '', lockedPathD: '' };

    // Function to build cubic bezier string through a set of points
    const buildBeziers = (pts) => {
      if (pts.length < 2) return '';
      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const cpY1 = p1.y + (p2.y - p1.y) * 0.5;
        const cpY2 = p1.y + (p2.y - p1.y) * 0.5;
        d += ` C ${p1.x} ${cpY1}, ${p2.x} ${cpY2}, ${p2.x} ${p2.y}`;
      }
      return d;
    };

    // Slice points for completed trail (1 up to unlockedUpTo)
    const completedPts = nodePositions.slice(0, unlockedUpTo);
    // Slice points for locked trail (from unlockedUpTo up to 40)
    const lockedPts = nodePositions.slice(unlockedUpTo - 1);

    return {
      completedPathD: buildBeziers(completedPts),
      lockedPathD: buildBeziers(lockedPts)
    };
  }, [nodePositions, unlockedUpTo]);

  return (
    <div className="min-h-[calc(100dvh-56px)] bg-[#0B0F19] text-slate-100 flex flex-col items-center select-none pb-28 relative overflow-x-hidden">
      {/* Background Star Ambient Dust */}
      <div className="fixed inset-0 opacity-20 bg-[radial-gradient(#94A3B8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Sticky Header Bar */}
      <div className="sticky top-[56px] z-30 w-full bg-[#0B0F19]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between max-w-lg mx-auto shadow-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
            <Compass className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h1 className="font-display font-black text-lg text-white leading-tight">
              Saga Roadmap
            </h1>
            <span className="font-display text-[10px] text-slate-400 font-bold block">
              40 Sectors Across 4 Biomes
            </span>
          </div>
        </div>

        {/* Cumulative Stars Counter */}
        <div className="flex items-center gap-1.5 bg-slate-950 border border-amber-400/40 px-3 py-1.5 rounded-full shadow-inner">
          <img src="/assets/icons/star.png" alt="Star" className="w-4 h-4 object-contain drop-shadow-sm" />
          <span className="font-display font-black text-sm text-amber-300">{totalStars}</span>
          <span className="font-display font-bold text-xs text-slate-400">/ 120</span>
        </div>
      </div>

      {/* Main Saga Canvas Container */}
      <div
        className="relative w-full max-w-[360px] mx-auto pt-2"
        style={{ height: `${totalMapHeight}px` }}
      >
        {/* SVG Connecting Path Layer */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={MAP_WIDTH}
          height={totalMapHeight}
          viewBox={`0 0 ${MAP_WIDTH} ${totalMapHeight}`}
        >
          <defs>
            {/* Glowing Golden Trail Filter */}
            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#F59E0B" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* 1. Locked Muted Dashed Stone Path */}
          {lockedPathD && (
            <path
              d={lockedPathD}
              stroke="#334155"
              strokeWidth="6"
              strokeDasharray="8 8"
              strokeLinecap="round"
              fill="none"
              opacity="0.8"
            />
          )}

          {/* 2. Completed Golden Glowing Trail */}
          {completedPathD && (
            <>
              {/* Outer Golden Glow */}
              <path
                d={completedPathD}
                stroke="#B45309"
                strokeWidth="10"
                strokeLinecap="round"
                fill="none"
                filter="url(#goldGlow)"
              />
              {/* Mid Amber Ribbon */}
              <path
                d={completedPathD}
                stroke="#F59E0B"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
              {/* Inner Bright Core */}
              <path
                d={completedPathD}
                stroke="#FEF08A"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </>
          )}
        </svg>

        {/* Biome Chapter Landmark Banners along the Winding Path */}
        {BIOMES.map((b) => {
          const firstLevelInBiome = b.range[0];
          const node = nodePositions.find((n) => n.levelId === firstLevelInBiome);
          if (!node) return null;

          return (
            <div
              key={b.id}
              className="absolute left-1/2 -translate-x-1/2 z-0 w-64 pointer-events-none text-center"
              style={{ top: `${node.y - 72}px` }}
            >
              <div
                className={`py-1.5 px-3 rounded-2xl bg-gradient-to-r ${b.themeBg} border ${b.border} backdrop-blur-md shadow-lg`}
              >
                <span className="font-display font-black text-[9px] uppercase tracking-wider text-slate-300 block">
                  {b.badge}
                </span>
                <h2 className="font-display font-black text-sm text-white leading-tight">
                  {b.name}
                </h2>
                <span className="font-display font-bold text-[9px] text-slate-400 block mt-0.5">
                  Sectors {b.range[0]}–{b.range[1]}
                </span>
              </div>
            </div>
          );
        })}

        {/* Render the 40 Level Nodes */}
        {nodePositions.map((pos) => {
          const { levelId, x, y } = pos;
          const record = progressMap.get(levelId);
          const isUnlocked = levelId <= unlockedUpTo || (record && record.isUnlocked);
          const isCurrent = levelId === unlockedUpTo;
          const isCompleted = levelId < unlockedUpTo || (record && record.stars > 0);
          const starsEarned = record?.stars || (isCompleted ? 3 : 0);

          // Node dimensions
          const nodeSize = isCurrent ? 76 : 60;
          const nodeRadius = nodeSize / 2;

          return (
            <div
              key={levelId}
              ref={isCurrent ? heroRef : null}
              className="absolute flex flex-col items-center z-10 transition-transform duration-200"
              style={{
                left: `${x - nodeRadius}px`,
                top: `${y - nodeRadius}px`,
                width: `${nodeSize}px`,
                height: `${nodeSize}px`
              }}
            >
              {/* CURRENT LEVEL: HERO NODE */}
              {isCurrent && (
                <>
                  {/* Outer Pulsing Sonar Ring */}
                  <div className="absolute -inset-2.5 rounded-full border-2 border-amber-400 animate-ping opacity-70 pointer-events-none" />
                  <div className="absolute inset-0 rounded-full bg-amber-400/25 animate-pulse pointer-events-none" />

                  {/* Floating "PLAY" Crown Badge */}
                  <div className="absolute -top-3.5 z-20 flex items-center justify-center">
                    <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-display font-black text-[10px] uppercase tracking-wider shadow-lg border border-amber-200 animate-bounce">
                      PLAY
                    </span>
                  </div>

                  {/* Mascot Sitting beside the Hero Node */}
                  <div className="absolute -right-14 -top-5 pointer-events-none animate-mascot-bob drop-shadow-xl z-20">
                    <CharacterMascot emotion="cheering" size="sm" />
                  </div>

                  {/* Hero 3D Gold Button */}
                  <button
                    onClick={() => navigate(`/game/${levelId}`)}
                    className="w-full h-full rounded-full bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 border-2 border-amber-200 border-b-4 border-b-amber-700 shadow-[0_0_25px_rgba(251,191,36,0.7)] flex flex-col items-center justify-center text-slate-950 font-display font-black text-2xl active:translate-y-1 active:border-b-0 transition-transform hover:scale-105"
                    title={`Engage Sector ${levelId}`}
                    aria-label={`Play sector ${levelId}`}
                  >
                    <span className="leading-none text-shadow-arcade">
                      {levelId}
                    </span>
                  </button>
                </>
              )}

              {/* COMPLETED LEVEL: GLOSSY 3D EMERALD MEDAL */}
              {isCompleted && !isCurrent && (
                <div className="relative w-full h-full flex flex-col items-center">
                  <button
                    onClick={() => navigate(`/game/${levelId}`)}
                    className="w-full h-full rounded-full bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 border border-emerald-300/40 border-b-4 border-b-emerald-800 shadow-xl flex items-center justify-center text-white font-display font-black text-xl hover:scale-105 active:translate-y-1 active:border-b-0 transition-all"
                    title={`Replay Sector ${levelId} (${starsEarned} Stars)`}
                    aria-label={`Replay sector ${levelId}`}
                  >
                    <span className="leading-none text-shadow-arcade">
                      {levelId}
                    </span>
                  </button>

                  {/* 1–3 Glowing Golden Star Icons Ribbon */}
                  <div className="absolute -bottom-3 flex items-center gap-0.5 bg-slate-950/95 border border-amber-400/50 px-2 py-0.5 rounded-full shadow-lg z-10">
                    {[1, 2, 3].map((s) => (
                      <img
                        key={s}
                        src="/assets/icons/star.png"
                        alt="Star"
                        className={`w-3.5 h-3.5 object-contain transition-opacity ${
                          s <= starsEarned ? 'opacity-100 drop-shadow-[0_1px_3px_rgba(251,191,36,0.7)]' : 'opacity-25 grayscale'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* LOCKED LEVEL: RECESSED FROSTED-SLATE STONE NODE */}
              {!isUnlocked && (
                <div
                  className="w-full h-full rounded-full bg-slate-900/90 border-2 border-slate-700/50 border-b-4 border-b-slate-950 text-slate-500 flex flex-col items-center justify-center opacity-60 cursor-not-allowed shadow-inner"
                  title={`Sector ${levelId} Locked`}
                >
                  <Lock className="w-5 h-5 text-slate-400 mb-0.5" />
                  <span className="font-display font-black text-[11px] leading-none text-slate-500">
                    {levelId}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sticky Floating Quick-Play Bottom Dock */}
      <div className="fixed bottom-[68px] md:bottom-4 inset-x-0 z-30 max-w-sm mx-auto px-4 pointer-events-auto">
        <button
          onClick={() => navigate(`/game/${unlockedUpTo}`)}
          className="w-full h-14 btn-arcade-gold rounded-2xl flex items-center justify-between px-5 text-slate-950 font-display font-black text-base shadow-2xl border-b-4 border-amber-700 active:translate-y-1 active:border-b-0"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-950/20 flex items-center justify-center">
              <Play className="w-5 h-5 fill-slate-950 text-slate-950" />
            </div>
            <div className="text-left leading-tight">
              <span className="block text-sm">Resume Sector {unlockedUpTo}</span>
              <span className="text-[10px] font-display font-black text-slate-950 uppercase tracking-tight opacity-90">
                Highest Unlocked Mission
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-950" />
        </button>
      </div>
    </div>
  );
};

export default LevelSelectPage;
