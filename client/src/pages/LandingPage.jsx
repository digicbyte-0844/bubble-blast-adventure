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
  Gift,
  LogIn,
  UserPlus
} from 'lucide-react';
import { GAME_NAME } from '../config/gameConfig.js';
import CharacterMascot from '../components/CharacterMascot.jsx';
import { useUserStore } from '../store/useUserStore';
import { soundEngine } from '../game/soundEngine.js';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { progress, coins, user, isAuthenticated } = useUserStore();
  const isRegistered = Boolean(isAuthenticated && user && !user.isGuest);
  const [claimedReward, setClaimedReward] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [isJiggling, setIsJiggling] = useState(false);

  const MASCOT_TIPS = [
    'Aim, match & pop!',
    'Rescue my Mini-Jelly friends!',
    'Sever ceiling clusters for avalanches!',
    'Billiard bank-shots reflect off walls!',
    'Tap launcher ammo tray to swap!',
    'Cosmic Bomb clears a 2-hex ring!',
    'Ready to fly? Tap PLAY NOW!'
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

      {/* Subtle Starfield Dust & Floating Decorative Atmospheric Nebulae */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#94A3B8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute top-1/4 -left-16 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-16 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-16 left-1/4 w-60 h-60 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Decorative Floating 3D Bubbles in Arena Margins */}
      <div className="absolute top-16 -left-6 w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400/20 via-sky-500/10 to-transparent border border-cyan-400/30 shadow-[0_0_15px_rgba(56,189,248,0.2)] pointer-events-none animate-pulse" />
      <div className="absolute top-44 -right-8 w-24 h-24 rounded-full bg-gradient-to-br from-amber-400/20 via-orange-500/10 to-transparent border border-amber-400/30 shadow-[0_0_15px_rgba(251,191,36,0.2)] pointer-events-none" />
      <div className="absolute bottom-32 -left-8 w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-transparent border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.2)] pointer-events-none" />

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

      {/* 2. CENTER ZONE: Bobbing Bloopi Mascot & 3D Title in Glassmorphic Arcade Showcase Frame */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center w-full max-w-sm px-4 py-4 rounded-3xl bg-slate-900/45 border border-slate-700/50 backdrop-blur-md shadow-2xl shadow-slate-950/80">
        {/* Floating Animated Bloopi Mascot with Interactive Speech & Audio */}
        <div
          onClick={handleMascotClick}
          className={`mb-2 cursor-pointer transform transition-all select-none group flex flex-col items-center ${
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

        {/* 3D Multi-Layered Title */}
        <h1 className="font-display font-black text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-amber-400 to-orange-500 tracking-tight leading-tight uppercase drop-shadow-[0_4px_12px_rgba(245,158,11,0.5)]">
          {GAME_NAME}
        </h1>

        <p className="font-body font-semibold text-xs text-slate-300 max-w-xs mt-1">
          Rescue trapped Mini-Jellies in 40+ handcrafted honeycomb sectors.
        </p>
      </div>

      {/* 3. MAIN ACTION DECK: Tactile Giant "PLAY NOW" & "CONTINUE LEVEL" */}
      <div className="relative z-10 w-full max-w-xs sm:max-w-sm flex flex-col gap-2.5 mb-2">
        {/* Giant Tactile Play Button (Amber Gold Push-Down State) */}
        <button
          onClick={() => navigate(`/game/${highestUnlocked}`)}
          className="w-full h-14 btn-arcade-gold rounded-2xl flex items-center justify-center gap-2.5 text-slate-950 font-display font-black text-lg tracking-wide uppercase shadow-lg shadow-amber-500/20 border-b-4 border-amber-700 active:translate-y-1 active:border-b-0"
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

        {/* Quick Auth Deck: Sign In & Register (Mobile Friendly) */}
        {!isRegistered && (
          <div className="w-full flex items-center justify-between gap-2 mt-0.5">
            <button
              onClick={() => navigate('/login')}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-slate-600 text-slate-200 text-xs font-display font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-400" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => navigate('/register')}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-amber-400 text-xs font-display font-black flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md shadow-amber-400/20"
            >
              <UserPlus className="w-3.5 h-3.5 text-slate-950" />
              <span>Register</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. BOTTOM QUICK NAVIGATION SHELF (4 Tactile 3D Color-Coded Cards) */}
      <div className="relative z-10 w-full max-w-sm grid grid-cols-4 gap-2 pt-1 pb-safe">
        {/* Map: Emerald 3D Card */}
        <Link
          to="/levels"
          className="flex flex-col items-center justify-center py-2 px-1 rounded-2xl bg-gradient-to-b from-emerald-500/20 to-teal-950/70 border border-emerald-500/40 border-b-4 border-b-emerald-800 shadow-md shadow-emerald-950/40 text-emerald-300 transition-all hover:brightness-110 active:translate-y-0.5 active:border-b-2 min-h-[48px]"
        >
          <Map className="w-5 h-5 text-emerald-400 mb-0.5 drop-shadow" />
          <span className="font-display font-bold text-xs text-emerald-200">Map</span>
        </Link>

        {/* Ranks: Gold 3D Card */}
        <Link
          to="/leaderboard"
          className="flex flex-col items-center justify-center py-2 px-1 rounded-2xl bg-gradient-to-b from-amber-500/20 to-orange-950/70 border border-amber-500/40 border-b-4 border-b-amber-800 shadow-md shadow-amber-950/40 text-amber-300 transition-all hover:brightness-110 active:translate-y-0.5 active:border-b-2 min-h-[48px]"
        >
          <Award className="w-5 h-5 text-amber-400 mb-0.5 drop-shadow" />
          <span className="font-display font-bold text-xs text-amber-200">Ranks</span>
        </Link>

        {/* Badges: Amethyst 3D Card */}
        <Link
          to="/achievements"
          className="flex flex-col items-center justify-center py-2 px-1 rounded-2xl bg-gradient-to-b from-purple-500/20 to-indigo-950/70 border border-purple-500/40 border-b-4 border-b-purple-800 shadow-md shadow-purple-950/40 text-purple-300 transition-all hover:brightness-110 active:translate-y-0.5 active:border-b-2 min-h-[48px]"
        >
          <Trophy className="w-5 h-5 text-purple-400 mb-0.5 drop-shadow" />
          <span className="font-display font-bold text-xs text-purple-200">Badges</span>
        </Link>

        {/* Editor: Cyan 3D Card */}
        <Link
          to="/editor"
          className="flex flex-col items-center justify-center py-2 px-1 rounded-2xl bg-gradient-to-b from-sky-500/20 to-blue-950/70 border border-sky-500/40 border-b-4 border-b-sky-800 shadow-md shadow-sky-950/40 text-sky-300 transition-all hover:brightness-110 active:translate-y-0.5 active:border-b-2 min-h-[48px]"
        >
          <Sparkles className="w-5 h-5 text-sky-400 mb-0.5 drop-shadow" />
          <span className="font-display font-bold text-xs text-sky-200">Editor</span>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
