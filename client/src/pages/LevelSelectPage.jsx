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
    name: 'Emerald Lagoon',
    subtitle: 'Rich Forest Teal & Luminescent Waters',
    range: [1, 10],
    accent: '#10B981',
    badge: 'BIOME 1',
    themeBg: 'from-emerald-950/60 via-teal-900/30 to-transparent',
    border: 'border-emerald-500/40'
  },
  {
    id: 2,
    name: 'Crystal Caverns',
    subtitle: 'Deep Sapphire & Amethyst Geodes',
    range: [11, 20],
    accent: '#6366F1',
    badge: 'BIOME 2',
    themeBg: 'from-indigo-950/60 via-blue-900/30 to-transparent',
    border: 'border-indigo-500/40'
  },
  {
    id: 3,
    name: 'Magma Peaks',
    subtitle: 'Warm Amber & Molten Embers',
    range: [21, 30],
    accent: '#F97316',
    badge: 'BIOME 3',
    themeBg: 'from-orange-950/60 via-red-900/30 to-transparent',
    border: 'border-orange-500/40'
  },
  {
    id: 4,
    name: 'Starlight Nebula',
    subtitle: 'Cosmic Indigo & Prismatic Aurora',
    range: [31, 40],
    accent: '#EC4899',
    badge: 'BIOME 4',
    themeBg: 'from-fuchsia-950/60 via-purple-900/30 to-transparent',
    border: 'border-pink-500/40'
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
  // Container width = 380, center = 190, amplitude = 80, stepY = 110, startY = 140, chapter gap = 95
  const MAP_WIDTH = 380;
  const CENTER_X = MAP_WIDTH / 2;
  const AMPLITUDE = 80;
  const STEP_Y = 110;
  const START_Y = 140;
  const BIOME_CHAPTER_GAP = 95;
  const TOTAL_LEVELS = 40;

  const nodePositions = useMemo(() => {
    const pos = [];
    let curY = START_Y;
    for (let lvl = 1; lvl <= TOTAL_LEVELS; lvl++) {
      const idx = lvl - 1;
      if (lvl > 1) {
        curY += STEP_Y;
        if (lvl === 11 || lvl === 21 || lvl === 31) {
          curY += BIOME_CHAPTER_GAP;
        }
      }
      const x = CENTER_X + Math.sin(idx * 0.65) * AMPLITUDE;
      pos.push({ levelId: lvl, x, y: curY, idx });
    }
    return pos;
  }, []);

  const totalMapHeight = START_Y + TOTAL_LEVELS * STEP_Y + 3 * BIOME_CHAPTER_GAP + 120;

  // Generate SVG Path Beziers
  const { completedPathD, lockedPathD } = useMemo(() => {
    if (nodePositions.length < 2) return { completedPathD: '', lockedPathD: '' };

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

    const completedPts = nodePositions.slice(0, unlockedUpTo);
    const lockedPts = nodePositions.slice(unlockedUpTo - 1);

    return {
      completedPathD: buildBeziers(completedPts),
      lockedPathD: buildBeziers(lockedPts)
    };
  }, [nodePositions, unlockedUpTo]);

  return (
    <div className="min-h-[calc(100dvh-56px)] bg-[#0B0F19] text-slate-100 flex flex-col items-center select-none pt-16 pb-32 relative overflow-x-hidden">
      {/* Background Star Ambient Dust & Atmospheric Glowing Nebulas */}
      <div className="fixed inset-0 opacity-25 bg-[radial-gradient(#94A3B8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="fixed top-1/4 -left-20 w-80 h-80 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />
      <div className="fixed top-2/4 -right-20 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
      <div className="fixed top-3/4 -left-20 w-80 h-80 rounded-full bg-orange-600/10 blur-3xl pointer-events-none" />

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
        className="relative w-full max-w-[380px] mx-auto pt-6"
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
            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#F59E0B" floodOpacity="0.85" />
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

          {/* 2. Completed Golden Glowing Dual-Stroke Trail */}
          {completedPathD && (
            <>
              {/* Outer Golden Glow */}
              <path
                d={completedPathD}
                stroke="#B45309"
                strokeWidth="12"
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
              {/* Inner Bright Specular Core */}
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

          // Generous vertical margin so the banner is NEVER covered by any node or mascot
          const bannerTop = firstLevelInBiome === 1 ? 40 : node.y - 65;

          return (
            <div
              key={b.id}
              className="absolute left-1/2 -translate-x-1/2 z-0 w-64 max-w-[270px] pointer-events-none text-center"
              style={{ top: `${bannerTop}px` }}
            >
              <div
                className={`py-1.5 px-3 rounded-2xl bg-gradient-to-r ${b.themeBg} border ${b.border} backdrop-blur-md shadow-lg`}
              >
                <span className="font-display font-black text-[9px] uppercase tracking-wider text-slate-300 block">
                  {b.badge}
                </span>
                <h2 className="font-display font-black text-xs sm:text-sm text-white leading-tight">
                  {b.name}
                </h2>
                <span className="font-display font-bold text-[8px] text-slate-400 block mt-0.5">
                  Sectors {b.range[0]}–{b.range[1]}
                </span>
              </div>
            </div>
          );
        })}

        {/* Render the 40 Level 3D Medallion Nodes */}
        {nodePositions.map((pos) => {
          const { levelId, x, y } = pos;
          const record = progressMap.get(levelId);
          const isUnlocked = levelId <= unlockedUpTo || (record && record.isUnlocked);
          const isCurrent = levelId === unlockedUpTo;
          const isCompleted = levelId < unlockedUpTo || (record && record.stars > 0);
          const starsEarned = record?.stars || (isCompleted ? 3 : 0);

          // Sleek, compact circular 3D node sizing (56px by 56px) to avoid crowding or covering roadmap text
          const cardW = 56;
          const cardH = 56;

          return (
            <div
              key={levelId}
              ref={isCurrent ? heroRef : null}
              className="absolute z-10 transition-transform duration-200"
              style={{
                left: `${x - cardW / 2}px`,
                top: `${y - cardH / 2}px`,
                width: `${cardW}px`,
                height: `${cardH}px`
              }}
            >
              {/* CURRENT LEVEL: HERO 3D GOLD MEDALLION */}
              {isCurrent && (
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  {/* Outer Pulsing Sonar Ring */}
                  <div className="absolute -inset-2 rounded-full border-2 border-amber-400 animate-ping opacity-60 pointer-events-none" />

                  {/* Floating "PLAY" Crown Badge */}
                  <div className="absolute -top-5 z-20 flex items-center justify-center pointer-events-none">
                    <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-300 text-slate-950 font-display font-black text-[9px] uppercase tracking-wider shadow-lg border border-amber-100 animate-bounce">
                      PLAY
                    </span>
                  </div>

                  {/* Bloopi Mascot Sitting beside Hero Node */}
                  <div className="absolute -right-8 -top-3 pointer-events-none animate-mascot-bob drop-shadow-xl z-20">
                    <CharacterMascot emotion="cheering" size="xs" showSpeech={false} />
                  </div>

                  {/* Hero 3D Gold Circular Button */}
                  <button
                    onClick={() => navigate(`/game/${levelId}`)}
                    className="w-14 h-14 rounded-full bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 border-2 border-amber-100 border-b-4 border-b-amber-900 shadow-[0_0_24px_rgba(245,158,11,0.7)] flex items-center justify-center active:translate-y-1 active:border-b-0 transition-transform hover:scale-105 select-none"
                    title={`Engage Sector ${levelId}`}
                    aria-label={`Play sector ${levelId}`}
                  >
                    <span className="font-display font-black text-xl text-slate-950 leading-none drop-shadow-sm">
                      {levelId}
                    </span>
                  </button>
                </div>
              )}

              {/* COMPLETED LEVEL: GLOSSY 3D EMERALD MEDALLION */}
              {isCompleted && !isCurrent && (
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <button
                    onClick={() => navigate(`/game/${levelId}`)}
                    className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-b from-emerald-400 via-teal-500 to-teal-700 border border-emerald-200/50 border-b-4 border-b-teal-950 shadow-md flex items-center justify-center hover:scale-105 active:translate-y-1 active:border-b-0 transition-all select-none"
                    title={`Replay Sector ${levelId} (${starsEarned} Stars)`}
                    aria-label={`Replay sector ${levelId}`}
                  >
                    <span className="font-display font-black text-base text-white leading-none drop-shadow-md">
                      {levelId}
                    </span>
                  </button>

                  {/* 1–3 Glowing Golden Star Icons Ribbon */}
                  <div className="absolute -bottom-2 flex items-center justify-center gap-0.5 bg-slate-950/90 border border-amber-400/40 px-1.5 py-0.2 rounded-full shadow-inner z-10">
                    {[1, 2, 3].map((s) => (
                      <img
                        key={s}
                        src="/assets/icons/star.png"
                        alt="Star"
                        className={`w-2.5 h-2.5 object-contain transition-opacity ${
                          s <= starsEarned ? 'opacity-100 drop-shadow-[0_1px_2px_rgba(251,191,36,0.7)]' : 'opacity-20 grayscale'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* LOCKED / UPCOMING LEVEL: FROSTED INDIGO 3D MEDALLION */}
              {!isCurrent && !isCompleted && (
                <div
                  className="w-full h-full flex flex-col items-center justify-center opacity-70 select-none"
                  title={`Sector ${levelId} Locked`}
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border border-slate-700/60 border-b-4 border-b-slate-950 shadow-inner flex flex-col items-center justify-center cursor-not-allowed">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span className="text-[9px] font-display font-bold text-slate-400 mt-0.5 leading-none">
                      {levelId}
                    </span>
                  </div>
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
