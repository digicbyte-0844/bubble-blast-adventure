/**
 * Mobile-First Home / Landing Page
 * King/Supercell Caliber: 100dvh Zero-Scroll Contained Hero Viewport
 * Atmospheric Obsidian Background, Bobbing Bloopi Mascot, Tactile Gold Push Button, 4-Shelf Dock
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Play,
  Sparkles,
  Trophy,
  Award,
  Map,
  Flame,
  Star,
  ChevronRight,
  Zap,
  Gift
} from 'lucide-react';
import { GAME_NAME } from '../config/gameConfig.js';
import CharacterMascot from '../components/CharacterMascot.jsx';
import { useUserStore } from '../store/useUserStore';
import { soundEngine } from '../game/soundEngine.js';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { progress, coins } = useUserStore();
  const [claimedReward, setClaimedReward] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [isJiggling, setIsJiggling] = useState(false);

  const MASCOT_TIPS = [
    'Aim, match & pop! 🫧',
    'Rescue my Mini-Jelly friends! ✨',
    'Sever ceiling clusters for avalanches! 💥',
    'Billiard bank-shots reflect off walls! 🎯',
    'Tap launcher ammo tray to swap! ⇄',
    'Cosmic Bomb clears a 2-hex ring! 💣',
    'Ready to fly? Tap PLAY NOW! 🚀'
  ];

  const handleMascotClick = () => {
    soundEngine.playPop(tipIndex % 5);
    setTipIndex((prev) => (prev + 1) % MASCOT_TIPS.length);
    setIsJiggling(true);
    setTimeout(() => setIsJiggling(false), 500);
  };

  // Highest unlocked level calculation
  const highestUnlocked = Math.max(
    1,
    ...progress.filter((p) => p.isUnlocked).map((p) => p.levelId || 1)
  );

  const highestProgress = progress.find((p) => p.levelId === highestUnlocked) || {
    levelId: 1,
    stars: 0
  };

  useEffect(() => {
    document.title = `${GAME_NAME} — Arcade Mobile Puzzle`;
  }, []);

  const handleClaimStreak = () => {
    if (!claimedReward) {
      setClaimedReward(true);
    }
  };

  return (
    <div className="relative w-full h-[calc(100dvh-56px)] max-h-[calc(100dvh-56px)] overflow-hidden bg-[#0B0F19] text-slate-100 flex flex-col justify-between items-center px-4 py-3 select-none">
      {/* Deep Obsidian Atmospheric Background with Subtle Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_20%,rgba(30,41,59,0.5),rgba(11,15,25,0.98))] pointer-events-none" />

      {/* Subtle Starfield Dust */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#94A3B8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* 1. TOP ZONE: Daily Streak & Reward Pill Banner */}
      <div className="relative z-10 w-full max-w-sm flex justify-center pt-1">
        <button
          onClick={handleClaimStreak}
          className={`w-full py-2 px-3.5 rounded-full border flex items-center justify-between text-xs transition-all active:scale-95 shadow-md ${
            claimedReward
              ? 'bg-slate-900/90 border-slate-700/60 text-slate-400'
              : 'bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-slate-900/80 border-amber-500/40 text-amber-300 animate-pulse'
          }`}
        >
          <div className="flex items-center gap-1.5 font-display font-bold">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Day 4 Streak</span>
            <span className="text-slate-400">•</span>
            <span className="font-body text-xs text-slate-300">
              {claimedReward ? 'Claimed! +50 Coins' : 'Claim 50 Coins & 1 Bomb'}
            </span>
          </div>
          <Gift className={`w-4 h-4 ${claimedReward ? 'text-slate-400' : 'text-amber-400'}`} />
        </button>
      </div>

      {/* 2. CENTER ZONE: Bobbing Bloopi Mascot & 3D Title */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center">
        {/* Floating Animated Bloopi Mascot with Interactive Speech & Audio */}
        <div
          onClick={handleMascotClick}
          className={`mb-3 cursor-pointer transform transition-all select-none group flex flex-col items-center ${
            isJiggling ? 'scale-110 animate-bounce' : 'animate-mascot-bob hover:scale-105 active:scale-95'
          }`}
          title="Tap Bloopi for pro tips!"
        >
          <CharacterMascot
            emotion={isJiggling ? 'celebrate' : 'cheering'}
            size="lg"
            speech={MASCOT_TIPS[tipIndex]}
            onClick={handleMascotClick}
          />
          <span className="text-[10px] font-display font-black text-cyan-400/90 mt-1 flex items-center gap-1 group-hover:text-amber-400 transition-colors">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Tap Bloopi for pro tips!
          </span>
        </div>

        <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-amber-400 tracking-tight leading-tight uppercase text-shadow-arcade">
          {GAME_NAME}
        </h1>

        <p className="font-body font-semibold text-xs text-slate-400 max-w-xs mt-1">
          Rescue trapped Mini-Jellies in 40+ handcrafted honeycomb sectors.
        </p>
      </div>

      {/* 3. MAIN ACTION DECK: Tactile Giant "PLAY NOW" & "CONTINUE LEVEL" */}
      <div className="relative z-10 w-full max-w-xs sm:max-w-sm flex flex-col gap-2.5 mb-2">
        {/* Giant Tactile Play Button (Amber Gold Push-Down State) */}
        <button
          onClick={() => navigate(`/game/${highestUnlocked}`)}
          className="w-full h-14 btn-arcade-gold rounded-2xl flex items-center justify-center gap-2.5 text-slate-950 font-display font-black text-lg tracking-wide uppercase shadow-lg shadow-amber-500/20 active:translate-y-1"
        >
          <Play className="w-6 h-6 fill-slate-950 text-slate-950" />
          <span>PLAY NOW</span>
        </button>

        {/* Continue Level Secondary Card */}
        <button
          onClick={() => navigate('/levels')}
          className="w-full py-2.5 px-4 btn-arcade-slate rounded-2xl flex items-center justify-between text-xs"
        >
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center font-display font-black text-xs">
              {highestUnlocked}
            </span>
            <div className="text-left font-display">
              <span className="font-bold text-white block leading-none">
                Continue Sector {highestUnlocked}
              </span>
              <div className="flex items-center gap-0.5 mt-0.5">
                {[1, 2, 3].map((s) => (
                  <Star
                    key={s}
                    className={`w-2.5 h-2.5 ${
                      s <= (highestProgress.stars || 0)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* 4. BOTTOM QUICK NAVIGATION SHELF (4 Tactile Icons) */}
      <div className="relative z-10 w-full max-w-sm grid grid-cols-4 gap-2 pt-1 pb-safe">
        <Link
          to="/levels"
          className="flex flex-col items-center justify-center py-2 px-1 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all active:scale-95 shadow-sm min-h-[48px]"
        >
          <Map className="w-5 h-5 text-sky-400 mb-0.5" />
          <span className="font-display font-bold text-xs text-slate-300">Map</span>
        </Link>

        <Link
          to="/leaderboard"
          className="flex flex-col items-center justify-center py-2 px-1 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all active:scale-95 shadow-sm min-h-[48px]"
        >
          <Award className="w-5 h-5 text-amber-400 mb-0.5" />
          <span className="font-display font-bold text-xs text-slate-300">Ranks</span>
        </Link>

        <Link
          to="/achievements"
          className="flex flex-col items-center justify-center py-2 px-1 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all active:scale-95 shadow-sm min-h-[48px]"
        >
          <Trophy className="w-5 h-5 text-emerald-400 mb-0.5" />
          <span className="font-display font-bold text-xs text-slate-300">Badges</span>
        </Link>

        <Link
          to="/editor"
          className="flex flex-col items-center justify-center py-2 px-1 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all active:scale-95 shadow-sm min-h-[48px]"
        >
          <Sparkles className="w-5 h-5 text-amber-400 mb-0.5" />
          <span className="font-display font-bold text-xs text-slate-300">Editor</span>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
