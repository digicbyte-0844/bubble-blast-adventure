/**
 * Level Select Saga Roadmap Screen
 * King/Supercell Caliber: Winding Vertical Candy-Trail Path Through Themed Biomes
 * 3D Circular Badges, Pulsing Mascot Beacon on Current Level, Locked Padlocks, Floating Quick-Play Dock
 */

import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Lock, Play, Compass, Award, Sparkles, ChevronRight } from 'lucide-react';
import { GAME_NAME } from '../config/gameConfig.js';
import { getLevel } from '../game/levelGenerator.js';
import { useUserStore } from '../store/useUserStore';
import CharacterMascot from '../components/CharacterMascot.jsx';

// 4 Themed Biomes
const BIOMES = [
  { name: 'Celestial Reef', subtitle: 'Coral Shallows', range: [1, 10], color: 'from-sky-500/10 to-teal-500/10', border: 'border-sky-500/30', badge: '🌿 Biome 1' },
  { name: 'Crystal Caves', subtitle: 'Prismatic Depths', range: [11, 20], color: 'from-emerald-500/10 to-teal-500/10', border: 'border-emerald-500/30', badge: '💎 Biome 2' },
  { name: 'Starlight Sky', subtitle: 'Luminescent Orbit', range: [21, 30], color: 'from-blue-500/10 to-cyan-500/10', border: 'border-blue-500/30', badge: '🌌 Biome 3' },
  { name: 'Supernova Core', subtitle: 'Solar Apex', range: [31, 40], color: 'from-amber-500/10 to-rose-500/10', border: 'border-amber-500/30', badge: '☀️ Biome 4' }
];

export const LevelSelectPage = () => {
  const navigate = useNavigate();
  const { progress } = useUserStore();

  useEffect(() => {
    document.title = `Saga Map — ${GAME_NAME}`;
  }, []);

  // Compute highest unlocked level and progress map
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

  // Winding horizontal offsets (left, center, right, center pattern)
  const getOffsetClass = (index) => {
    const mod = index % 4;
    if (mod === 0) return 'translate-x-0';
    if (mod === 1) return '-translate-x-6 sm:-translate-x-10 md:-translate-x-14';
    if (mod === 2) return 'translate-x-0';
    return 'translate-x-6 sm:translate-x-10 md:translate-x-14';
  };

  return (
    <div className="min-h-[calc(100dvh-56px)] bg-[#0B0F19] text-slate-100 flex flex-col items-center select-none pb-24 relative overflow-x-hidden">
      {/* Background Star Ambient Dust */}
      <div className="fixed inset-0 opacity-15 bg-[radial-gradient(#94A3B8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Top Header Bar */}
      <div className="sticky top-[56px] z-30 w-full bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between max-w-lg mx-auto">
        <div>
          <h1 className="font-display font-black text-xl text-white">
            Saga Sector Roadmap
          </h1>
        </div>

        {/* Cumulative Stars Counter */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-amber-500/30 px-3 py-1.5 rounded-full shadow-inner">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="font-display font-black text-sm text-amber-300">{totalStars}</span>
          <span className="text-xs font-body text-slate-300">/ 120</span>
        </div>
      </div>

      {/* Winding Vertical Roadmap Container */}
      <div className="relative w-full max-w-md px-4 pt-6 flex flex-col items-center">
        {BIOMES.map((biome, bIdx) => {
          const levelsInBiome = [];
          for (let lvl = biome.range[0]; lvl <= biome.range[1]; lvl++) {
            levelsInBiome.push(lvl);
          }

          return (
            <div key={bIdx} className="w-full flex flex-col items-center my-4">
              {/* Biome Themed Banner Header */}
              <div className={`w-full max-w-xs py-2.5 px-4 rounded-2xl bg-gradient-to-r ${biome.color} border ${biome.border} backdrop-blur-md mb-8 text-center shadow-lg`}>
                <span className="text-xs font-display font-bold uppercase tracking-wider text-slate-300 block">
                  {biome.badge}
                </span>
                <h2 className="font-display font-black text-lg text-white">
                  {biome.name}
                </h2>
                <span className="text-xs font-body text-slate-300">
                  {biome.subtitle} • Sectors {biome.range[0]}–{biome.range[1]}
                </span>
              </div>

              {/* Vertical Path Nodes */}
              <div className="relative w-full flex flex-col items-center">
                {levelsInBiome.map((levelId, nodeIdx) => {
                  const record = progressMap.get(levelId);
                  const isUnlocked = levelId <= unlockedUpTo || (record && record.isUnlocked);
                  const isCurrent = levelId === unlockedUpTo;
                  const starsEarned = record?.stars || 0;
                  const offsetClass = getOffsetClass(levelId - 1);

                  return (
                    <div
                      key={levelId}
                      className={`relative flex flex-col items-center my-4 z-10 transition-transform ${offsetClass}`}
                    >
                      {/* Current Level Pulsing Beacon & Mascot Avatar */}
                      {isCurrent && (
                        <div className="absolute -top-12 flex flex-col items-center z-20 pointer-events-none animate-mascot-bob">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 border border-white flex items-center justify-center p-1 shadow-md">
                            <img src="/assets/icons/bubble.png" alt="Bubble" className="w-5 h-5 object-contain drop-shadow-sm" />
                          </div>
                          <span className="text-xs font-display font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-tight">
                            HERE!
                          </span>
                        </div>
                      )}

                      {/* 3D Circular Node Badge */}
                      <button
                        onClick={() => isUnlocked && navigate(`/game/${levelId}`)}
                        disabled={!isUnlocked}
                        className={`w-16 h-16 rounded-full flex flex-col items-center justify-center relative transition-all active:scale-90 min-h-[48px] min-w-[48px] ${
                          isCurrent
                            ? 'btn-arcade-gold animate-beacon ring-4 ring-amber-400/50 shadow-xl text-slate-950'
                            : isUnlocked
                            ? 'btn-arcade-cyan text-white shadow-lg'
                            : 'bg-slate-900 border-2 border-slate-800 text-slate-600 cursor-not-allowed opacity-60 shadow-inner'
                        }`}
                        title={isUnlocked ? `Play Sector ${levelId}` : `Sector ${levelId} Locked`}
                      >
                        {isUnlocked ? (
                          <span className="font-display font-black text-xl leading-none text-shadow-arcade">
                            {levelId}
                          </span>
                        ) : (
                          <Lock className="w-5 h-5 text-slate-600" />
                        )}
                      </button>

                      {/* 1 to 3 Gold Stars Underneath */}
                      {isUnlocked && (
                        <div className="flex items-center gap-1 mt-1.5 bg-slate-900/90 border border-slate-800 px-2 py-0.5 rounded-full shadow-sm">
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= starsEarned
                                  ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_1px_2px_rgba(245,158,11,0.5)]'
                                  : 'text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
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
            <div className="w-8 h-8 rounded-xl bg-slate-950/20 flex items-center justify-center">
              <Play className="w-5 h-5 fill-slate-950 text-slate-950" />
            </div>
            <div className="text-left leading-tight">
              <span className="block text-sm">Resume Sector {unlockedUpTo}</span>
              <span className="text-xs font-body font-black text-slate-950 uppercase tracking-tight">
                Highest Unlocked
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
