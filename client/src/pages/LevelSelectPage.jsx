/**
 * Level Select Saga Roadmap Screen
 * King / Supercell / Rovio Caliber:
 * Winding Sinusoidal Saga Adventure Path across 4 Themed Biome Chapters,
 * Rich 3D Arcade Stage Cards (w-36 sm:w-44) with State-specific 3D Gradients,
 * Continuous SVG Golden/Stone Connecting Trail, Cleanly Positioned Bloopi Mascot,
 * Atmospheric Biome Nebulae, and Real 5-Point Golden Stars.
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Lock, Play, ChevronRight, Compass, Sparkles, Target, Trophy } from 'lucide-react';
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
    themeBg: 'from-emerald-950/80 via-teal-900/50 to-slate-950/80',
    border: 'border-emerald-500/50',
    glowColor: 'bg-emerald-500/15'
  },
  {
    id: 2,
    name: 'Crystal Caverns',
    subtitle: 'Deep Sapphire & Amethyst Geodes',
    range: [11, 20],
    accent: '#6366F1',
    badge: 'BIOME 2',
    themeBg: 'from-indigo-950/80 via-blue-900/50 to-slate-950/80',
    border: 'border-indigo-500/50',
    glowColor: 'bg-blue-500/15'
  },
  {
    id: 3,
    name: 'Magma Peaks',
    subtitle: 'Warm Amber & Molten Embers',
    range: [21, 30],
    accent: '#F97316',
    badge: 'BIOME 3',
    themeBg: 'from-orange-950/80 via-red-900/50 to-slate-950/80',
    border: 'border-orange-500/50',
    glowColor: 'bg-orange-500/15'
  },
  {
    id: 4,
    name: 'Starlight Nebula',
    subtitle: 'Cosmic Indigo & Prismatic Aurora',
    range: [31, 40],
    accent: '#EC4899',
    badge: 'BIOME 4',
    themeBg: 'from-fuchsia-950/80 via-purple-900/50 to-slate-950/80',
    border: 'border-pink-500/50',
    glowColor: 'bg-fuchsia-500/15'
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
  // Container width = 380, center = 190, amplitude = 48, stepY = 160, startY = 260, chapter gap = 180
  const MAP_WIDTH = 380;
  const CENTER_X = MAP_WIDTH / 2;
  const AMPLITUDE = 48;
  const STEP_Y = 160;
  const START_Y = 260;
  const BIOME_CHAPTER_GAP = 180;
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

  const totalMapHeight = START_Y + TOTAL_LEVELS * STEP_Y + 3 * BIOME_CHAPTER_GAP + 160;

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

  // Objective icon helper
  const getObjectiveIcon = (lvl) => {
    if (lvl % 3 === 0) return Sparkles;
    if (lvl % 5 === 0) return Trophy;
    return Target;
  };

  return (
    <div className="min-h-[calc(100dvh-56px)] bg-[#0B0F19] text-slate-100 flex flex-col items-center select-none pt-14 pb-44 relative overflow-x-hidden">
      {/* Background Star Ambient Dust & Atmospheric Glowing Nebulas */}
      <div className="fixed inset-0 opacity-25 bg-[radial-gradient(#94A3B8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="fixed top-1/4 -left-20 w-80 h-80 rounded-full bg-emerald-600/15 blur-3xl pointer-events-none" />
      <div className="fixed top-2/4 -right-20 w-80 h-80 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
      <div className="fixed top-3/4 -left-20 w-80 h-80 rounded-full bg-orange-600/15 blur-3xl pointer-events-none" />

      {/* Floating decorative cosmic bubbles */}
      <div className="fixed top-24 left-6 w-10 h-10 rounded-full bg-cyan-400/10 border border-cyan-400/20 blur-[1px] pointer-events-none animate-pulse" />
      <div className="fixed top-96 right-8 w-14 h-14 rounded-full bg-pink-400/10 border border-pink-400/20 blur-[1px] pointer-events-none animate-pulse" />
      <div className="fixed bottom-36 left-10 w-12 h-12 rounded-full bg-amber-400/10 border border-amber-400/20 blur-[1px] pointer-events-none animate-pulse" />

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

        {/* Cumulative Stars Counter with Authentic 5-Point Star */}
        <div className="flex items-center gap-1.5 bg-slate-950 border border-amber-400/40 px-3 py-1.5 rounded-full shadow-inner">
          <Star className="w-4 h-4 fill-amber-400 text-amber-300 drop-shadow-sm" />
          <span className="font-display font-black text-sm text-amber-300">{totalStars}</span>
          <span className="font-display font-bold text-xs text-slate-400">/ 120</span>
        </div>
      </div>

      {/* Main Saga Canvas Container */}
      <div
        className="relative w-full max-w-[380px] mx-auto pt-4"
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
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#F59E0B" floodOpacity="0.85" />
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
              opacity="0.85"
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

          // Generous vertical margin so the banner is NEVER touched by any node or floating badge
          const bannerTop = firstLevelInBiome === 1 ? 28 : node.y - 130;

          return (
            <div
              key={b.id}
              className="absolute left-1/2 -translate-x-1/2 z-0 w-64 max-w-[270px] pointer-events-none text-center"
              style={{ top: `${bannerTop}px` }}
            >
              <div
                className={`py-2 px-3 rounded-2xl bg-gradient-to-r ${b.themeBg} border ${b.border} backdrop-blur-md shadow-xl`}
              >
                <span className="font-display font-black text-[9px] uppercase tracking-wider text-slate-300 block">
                  {b.badge}
                </span>
                <h2 className="font-display font-black text-xs sm:text-sm text-white leading-tight">
                  {b.name}
                </h2>
                <span className="font-display font-bold text-[8px] text-slate-400 block mt-0.5">
                  Sectors {b.range[0]}–{b.range[1]} • {b.subtitle}
                </span>
              </div>
            </div>
          );
        })}

        {/* Render the 40 Level 3D Stage Cards */}
        {nodePositions.map((pos) => {
          const { levelId, x, y } = pos;
          const record = progressMap.get(levelId);
          const isUnlocked = levelId <= unlockedUpTo || (record && record.isUnlocked);
          const isCurrent = levelId === unlockedUpTo;
          const isCompleted = levelId < unlockedUpTo || (record && record.stars > 0);
          const starsEarned = record?.stars || (isCompleted ? 3 : 0);
          const ObjIcon = getObjectiveIcon(levelId);

          // Rich 3D Arcade Stage Card sizing (148px by 134px)
          const cardW = 148;
          const cardH = 134;

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
              {/* CURRENT LEVEL: VIBRANT GOLD/AMBER 3D STAGE CARD */}
              {isCurrent && (
                <div className="relative w-full h-full">
                  {/* Floating "PLAY NOW" Crown Badge with ample spacing above card */}
                  <div className="absolute -top-6 inset-x-0 z-20 flex items-center justify-center pointer-events-none">
                    <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-300 text-slate-950 font-display font-black text-[10px] uppercase tracking-wider shadow-xl border border-amber-100 animate-bounce">
                      PLAY NOW
                    </span>
                  </div>

                  {/* Bloopi Mascot Positioned Cleanly OUTSIDE to the Right (Zero Overlap with Number) */}
                  <div className="absolute -right-14 top-2 pointer-events-none animate-mascot-bob drop-shadow-2xl z-20">
                    <CharacterMascot emotion="cheering" size="xs" showSpeech={false} />
                  </div>

                  {/* 3D Gold Stage Card Button */}
                  <button
                    onClick={() => navigate(`/game/${levelId}`)}
                    className="w-full h-full rounded-2xl bg-gradient-to-b from-amber-400 via-orange-500 to-amber-600 border-2 border-amber-200 border-b-4 border-amber-800 shadow-[0_0_35px_rgba(245,158,11,0.55)] p-2.5 flex flex-col justify-between items-center active:translate-y-1 active:border-b-2 hover:scale-[1.02] transition-transform select-none cursor-pointer"
                    title={`Engage Sector ${levelId}`}
                    aria-label={`Play sector ${levelId}`}
                  >
                    {/* Top Ribbon */}
                    <div className="flex items-center justify-between w-full px-1">
                      <span className="font-display font-black text-[10px] text-amber-950 uppercase tracking-wider bg-amber-200/90 px-2 py-0.5 rounded-md">
                        STAGE {levelId < 10 ? `0${levelId}` : levelId}
                      </span>
                      <div className="w-5 h-5 rounded-full bg-amber-950/30 flex items-center justify-center">
                        <ObjIcon className="w-3 h-3 text-amber-100" />
                      </div>
                    </div>

                    {/* Center 3D Gold Number Medallion */}
                    <div className="w-13 h-13 rounded-full bg-gradient-to-b from-amber-200 via-amber-300 to-yellow-400 border border-white border-b-2 border-amber-700 shadow-md flex items-center justify-center my-0.5">
                      <span className="font-display font-black text-2xl text-slate-950 leading-none drop-shadow-sm">
                        {levelId}
                      </span>
                    </div>

                    {/* Bottom 3-Star Slot Bar */}
                    <div className="flex items-center justify-center gap-1.5 w-full pt-1 border-t border-amber-900/30">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className="w-3.5 h-3.5 fill-amber-200 text-amber-100 drop-shadow-sm"
                        />
                      ))}
                    </div>
                  </button>
                </div>
              )}

              {/* COMPLETED LEVEL: GLOSSY EMERALD/TEAL 3D STAGE CARD */}
              {isCompleted && !isCurrent && (
                <div className="w-full h-full">
                  <button
                    onClick={() => navigate(`/game/${levelId}`)}
                    className="w-full h-full rounded-2xl bg-gradient-to-b from-emerald-500 via-teal-600 to-teal-700 border-2 border-emerald-300/80 border-b-4 border-teal-950 shadow-lg p-2.5 flex flex-col justify-between items-center hover:scale-[1.02] active:translate-y-1 active:border-b-2 transition-transform select-none cursor-pointer"
                    title={`Replay Sector ${levelId} (${starsEarned} Stars)`}
                    aria-label={`Replay sector ${levelId}`}
                  >
                    {/* Top Ribbon */}
                    <div className="flex items-center justify-between w-full px-1">
                      <span className="font-display font-black text-[9px] text-teal-950 uppercase tracking-wider bg-emerald-200/90 px-1.5 py-0.5 rounded-md">
                        STAGE {levelId < 10 ? `0${levelId}` : levelId}
                      </span>
                      <div className="w-5 h-5 rounded-full bg-teal-950/40 flex items-center justify-center">
                        <ObjIcon className="w-3 h-3 text-emerald-200" />
                      </div>
                    </div>

                    {/* Center Emerald Number Medallion */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-b from-emerald-300 via-teal-400 to-teal-600 border border-emerald-200 border-b-2 border-teal-950 shadow-md flex items-center justify-center my-0.5">
                      <span className="font-display font-black text-xl text-white leading-none drop-shadow-md">
                        {levelId}
                      </span>
                    </div>

                    {/* Bottom 3-Star Slot Bar with Genuine 5-Point Stars */}
                    <div className="flex items-center justify-center gap-1.5 w-full pt-1 border-t border-teal-950/40">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= starsEarned
                              ? 'fill-amber-400 text-amber-300 drop-shadow-[0_1px_2px_rgba(251,191,36,0.8)]'
                              : 'fill-slate-900/60 text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  </button>
                </div>
              )}

              {/* LOCKED LEVEL: RICH ROYAL INDIGO/PURPLE CRYSTAL CARD */}
              {!isCurrent && !isCompleted && (
                <div
                  className="w-full h-full rounded-2xl bg-gradient-to-b from-indigo-900/90 via-slate-800 to-slate-900 border-2 border-indigo-400/30 border-b-4 border-slate-950 shadow-md p-2.5 flex flex-col justify-between items-center opacity-90 select-none"
                  title={`Sector ${levelId} Locked`}
                >
                  {/* Top Ribbon */}
                  <div className="flex items-center justify-between w-full px-1">
                    <span className="font-display font-black text-[9px] text-indigo-300 uppercase tracking-wider bg-indigo-950/80 px-1.5 py-0.5 rounded-md border border-indigo-500/20">
                      STAGE {levelId < 10 ? `0${levelId}` : levelId}
                    </span>
                    <div className="w-5 h-5 rounded-full bg-indigo-950/80 flex items-center justify-center">
                      <ObjIcon className="w-3 h-3 text-indigo-400/60" />
                    </div>
                  </div>

                  {/* Center Frosted Indigo Padlock Emblem */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-b from-slate-800 to-slate-950 border border-indigo-500/30 border-b-2 border-slate-950 shadow-inner flex flex-col items-center justify-center my-0.5">
                    <Lock className="w-4 h-4 text-indigo-300" />
                    <span className="text-[9px] font-display font-black text-indigo-200 mt-0.5 leading-none">
                      {levelId}
                    </span>
                  </div>

                  {/* Bottom 3-Star Slot Bar (Unearned) */}
                  <div className="flex items-center justify-center gap-1.5 w-full pt-1 border-t border-indigo-950/60">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className="w-3.5 h-3.5 fill-slate-900/80 text-slate-700"
                      />
                    ))}
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
