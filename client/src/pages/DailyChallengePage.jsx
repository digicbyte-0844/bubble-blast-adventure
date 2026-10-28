/**
 * Daily Challenge Mission Page
 * King/Supercell Caliber: Streak Flames, 24-hr Countdown, Bounty Cards, Tactile Play CTA
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Flame, Gift, Play, Clock, Sparkles, Trophy } from 'lucide-react';
import { GAME_NAME } from '../config/gameConfig.js';

export const DailyChallengePage = () => {
  const navigate = useNavigate();
  const [streak, setStreak] = useState(4);
  const [timeLeft, setTimeLeft] = useState('14h 22m 10s');

  useEffect(() => {
    document.title = `Daily Challenge — ${GAME_NAME}`;

    const timer = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diffMs = endOfDay.getTime() - now.getTime();

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${mins}m ${secs}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const todayDateStr = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="min-h-[calc(100dvh-56px)] bg-[#0B0F19] text-slate-100 max-w-4xl mx-auto px-4 py-6 select-none pb-20">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl clay-card mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-display font-black uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>24-Hour Orbital Mission</span>
          </div>
          <h1 className="font-display font-black text-2xl md:text-3xl text-white">
            Daily Nebula Challenge
          </h1>
          <p className="font-body text-xs text-slate-400 font-semibold mt-0.5">
            {todayDateStr} • Universal Rotation
          </p>
        </div>

        {/* Streak Flame Badge */}
        <div className="flex items-center gap-3 bg-slate-950 border border-amber-500/30 px-5 py-3 rounded-2xl shadow-inner">
          <Flame className="w-7 h-7 text-amber-400 fill-amber-400 animate-pulse" />
          <div>
            <span className="text-[10px] font-display font-black uppercase text-slate-400 tracking-wider block">
              Active Streak
            </span>
            <span className="font-display font-black text-xl text-amber-300">
              {streak} Days 🔥
            </span>
          </div>
        </div>
      </div>

      {/* Main Mission Card */}
      <div className="clay-card p-6 md:p-8 rounded-3xl mb-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-display font-bold text-slate-300">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Rotates in: {timeLeft}</span>
            </div>

            <h2 className="font-display font-black text-2xl text-white">
              Sector Special: Starlight Core #2062
            </h2>

            <p className="font-body text-xs text-slate-300 max-w-lg leading-relaxed">
              Clear 38 densely packed honeycomb bubbles within a tight 22-shot ammo budget. Wall reflection bank-shots are essential to bypass the center rock barricade.
            </p>

            <div className="flex flex-wrap gap-2 pt-1 text-xs font-display">
              <span className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-sky-400 font-bold">
                🎯 Target: Clear All
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 font-bold">
                ⚡ Ammo: 22 Shots
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-bold">
                🪙 Reward: 250 Coins + Bomb
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/game/1')}
            className="w-full md:w-auto h-14 px-8 btn-arcade-gold rounded-2xl flex items-center justify-center gap-2 text-slate-950 font-display font-black text-base uppercase active:translate-y-1 shadow-lg shadow-amber-500/25 flex-shrink-0"
          >
            <Play className="w-5 h-5 fill-slate-950 text-slate-950" />
            <span>Engage Mission</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyChallengePage;
