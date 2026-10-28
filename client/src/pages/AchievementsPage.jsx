/**
 * 12 Unlockable Achievements Showcase Page
 * King/Supercell Caliber: Progress Bars, Coin Rewards, Obsidian Glass Cards
 */

import React, { useEffect, useState } from 'react';
import { Award, Lock, CheckCircle2, Sparkles, Star, Trophy } from 'lucide-react';
import { GAME_NAME } from '../config/gameConfig.js';
import ApiService from '../services/api.js';

export const AchievementsPage = () => {
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    document.title = `Achievements — ${GAME_NAME}`;

    const fetchAchievements = async () => {
      try {
        const res = await ApiService.getAchievements();
        if (res?.achievements) {
          setAchievements(res.achievements);
        } else {
          setAchievements([
            { id: 'FIRST_POP', title: 'First Pop', description: 'Pop your first 3-bubble cluster', isUnlocked: true, progress: 1, maxProgress: 1, rewardCoins: 50, icon: '🫧' },
            { id: 'BUBBLE_BEGINNER', title: 'Bubble Beginner', description: 'Clear Sector 5 in the story campaign', isUnlocked: true, progress: 5, maxProgress: 5, rewardCoins: 100, icon: '🚀' },
            { id: 'PERFECT_AIM', title: 'Perfect Aim', description: 'Complete any sector with 5+ shots remaining', isUnlocked: true, progress: 1, maxProgress: 1, rewardCoins: 150, icon: '🎯' },
            { id: 'COMBO_MASTER', title: 'Combo Master', description: 'Achieve a x5 combo streak in one session', isUnlocked: true, progress: 5, maxProgress: 5, rewardCoins: 200, icon: '🔥' },
            { id: 'BUBBLE_HUNTER', title: 'Bubble Hunter', description: 'Pop 500 total bubbles across all sectors', isUnlocked: false, progress: 340, maxProgress: 500, rewardCoins: 250, icon: '⚡' },
            { id: 'RESCUE_HERO', title: 'Rescue Hero', description: 'Free 25 trapped Starlight Mini-Jellies', isUnlocked: false, progress: 18, maxProgress: 25, rewardCoins: 300, icon: '🌟' },
            { id: 'STAR_COLLECTOR', title: 'Star Collector', description: 'Collect 50 total golden stars', isUnlocked: false, progress: 38, maxProgress: 50, rewardCoins: 350, icon: '⭐' },
            { id: 'BOOSTER_EXPERT', title: 'Booster Expert', description: 'Deploy 10 tactical boosters during gameplay', isUnlocked: true, progress: 10, maxProgress: 10, rewardCoins: 200, icon: '💣' },
            { id: 'LEVEL_MASTER', title: 'Level Master', description: 'Clear all 40 handcrafted story sectors', isUnlocked: false, progress: 24, maxProgress: 40, rewardCoins: 500, icon: '👑' },
            { id: 'BUBBLE_LEGEND', title: 'Bubble Legend', description: 'Accumulate over 500,000 cumulative score points', isUnlocked: true, progress: 500000, maxProgress: 500000, rewardCoins: 600, icon: '🏆' },
            { id: 'BANK_SHOT_PRO', title: 'Bank Shot Pro', description: 'Score 15 pops directly from wall ricochet reflections', isUnlocked: false, progress: 9, maxProgress: 15, rewardCoins: 250, icon: '📐' },
            { id: 'DAILY_CHAMPION', title: 'Daily Champion', description: 'Maintain a 5-day Daily Challenge completion streak', isUnlocked: false, progress: 3, maxProgress: 5, rewardCoins: 400, icon: '📅' }
          ]);
        }
      } catch (e) {
        // Fallback
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  return (
    <div className="min-h-[calc(100dvh-56px)] bg-[#0B0F19] text-slate-100 max-w-5xl mx-auto px-4 py-6 select-none pb-20">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl clay-card mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-display font-black uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>Trophy Room</span>
          </div>
          <h1 className="font-display font-black text-2xl md:text-3xl text-white">
            Pilot Achievements
          </h1>
          <p className="font-body text-xs text-slate-400 font-semibold mt-0.5">
            Complete tactical challenges to unlock coin bounties and pilot honor badges.
          </p>
        </div>

        {/* Unlock Status Pill */}
        <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 px-5 py-3 rounded-2xl shadow-inner">
          <Trophy className="w-6 h-6 text-amber-400" />
          <div>
            <span className="text-[10px] font-display font-black uppercase text-slate-400 tracking-wider block">
              Unlocked Badges
            </span>
            <span className="font-display font-black text-xl text-white">
              {unlockedCount} <span className="text-xs text-slate-500 font-bold">/ {achievements.length}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Achievements 3-Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {achievements.map((item) => {
          const progressPercent = item.isUnlocked
            ? 100
            : Math.min(100, Math.round(((item.progress || 0) / (item.maxProgress || 1)) * 100));

          return (
            <div
              key={item.id}
              className={`p-4 rounded-3xl border transition-all flex flex-col justify-between ${
                item.isUnlocked
                  ? 'clay-card border-slate-700/60'
                  : 'bg-slate-950/60 border-slate-800/60 opacity-65'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="w-11 h-11 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl shadow-inner">
                    {item.icon}
                  </div>
                  {item.isUnlocked ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-display font-black text-[10px] uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Unlocked</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-500 font-display font-black text-[10px] uppercase flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Locked</span>
                    </span>
                  )}
                </div>

                <h3 className="font-display font-black text-sm text-white mb-1">
                  {item.title}
                </h3>
                <p className="font-body text-xs text-slate-400 leading-relaxed mb-3">
                  {item.description}
                </p>
              </div>

              <div>
                {/* Progress Bar */}
                <div className="flex items-center justify-between text-[10px] font-display font-bold text-slate-400 mb-1">
                  <span>Progress</span>
                  <span className={item.isUnlocked ? 'text-emerald-400 font-black' : 'text-slate-300'}>
                    {item.progress || 0} / {item.maxProgress} ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      item.isUnlocked
                        ? 'bg-gradient-to-r from-emerald-400 to-teal-400 shadow-sm'
                        : 'bg-gradient-to-r from-sky-400 to-amber-400'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Reward Coin Pill */}
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-display font-bold">
                  <span className="text-slate-500 uppercase text-[9px]">Bounty</span>
                  <span className="text-amber-400 flex items-center gap-1 font-black">
                    🪙 +{item.rewardCoins} Coins
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsPage;
