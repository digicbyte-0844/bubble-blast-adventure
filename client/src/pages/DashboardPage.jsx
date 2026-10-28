/**
 * Player Dashboard Page
 * King/Supercell Caliber: Performance Metrics, Flight Logs, Daily Challenge Card, Quick Resume
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Trophy,
  Star,
  Play,
  Calendar,
  Sparkles,
  Zap,
  Target,
  Clock,
  Compass,
  ArrowRight,
  Award
} from 'lucide-react';
import { GAME_NAME } from '../config/gameConfig.js';
import { useUserStore } from '../store/useUserStore';
import ApiService from '../services/api.js';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, progress, coins, energy } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  // Calculate stats from progress
  const highestLevel = Math.max(1, ...(progress || []).filter(p => p.isUnlocked).map(p => p.levelId || 1));
  const cumulativeStars = (progress || []).reduce((acc, p) => acc + (p.stars || 0), 0);
  const totalScore = (progress || []).reduce((acc, p) => acc + (p.highScore || 0), 0);

  useEffect(() => {
    document.title = `Pilot HQ — ${GAME_NAME}`;

    const fetchHistory = async () => {
      try {
        const res = await ApiService.getProgress();
        if (res?.data?.history) {
          setHistory(res.data.history);
        } else {
          setHistory([
            { sector: highestLevel, score: totalScore || 14200, stars: 3, date: 'Today' },
            { sector: Math.max(1, highestLevel - 1), score: 11800, stars: 2, date: 'Yesterday' }
          ]);
        }
      } catch (e) {
        setHistory([
          { sector: highestLevel, score: totalScore || 14200, stars: 3, date: 'Today' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [highestLevel, totalScore]);

  const statCards = [
    { label: 'Highest Sector', value: `Sector ${highestLevel}`, icon: Compass, color: 'text-sky-400' },
    { label: 'Cumulative Stars', value: `${cumulativeStars} ★`, icon: Star, color: 'text-amber-400' },
    { label: 'Total Score', value: (totalScore || 14200).toLocaleString(), icon: Trophy, color: 'text-amber-300' },
    { label: 'Starlight Coins', value: (coins || 500).toLocaleString(), icon: Sparkles, color: 'text-yellow-400' },
    { label: 'Current Energy', value: `${energy || 5} / 5 ⚡`, icon: Zap, color: 'text-emerald-400' },
    { label: 'Pilot Standing', value: 'Rank #2 🏆', icon: Target, color: 'text-rose-400' }
  ];

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-32 bg-slate-900 rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 bg-slate-900 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-56px)] bg-[#0B0F19] text-slate-100 max-w-5xl mx-auto px-4 py-6 select-none pb-20">
      {/* Top Welcome Banner */}
      <div className="p-6 md:p-8 rounded-3xl clay-card flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-500 border border-amber-300 flex items-center justify-center text-3xl shadow-lg">
            🧑‍🚀
          </div>
          <div>
            <span className="text-[10px] font-display font-black uppercase text-amber-400 tracking-wider block">
              {GAME_NAME} Pilot HQ
            </span>
            <h1 className="font-display font-black text-2xl md:text-3xl text-white">
              Welcome, {user?.username || 'Star Pilot'}!
            </h1>
            <p className="font-body text-xs text-slate-400 font-semibold mt-0.5">
              Sector {highestLevel} is ready for dispatch.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate(`/game/${highestLevel}`)}
          className="w-full md:w-auto h-12 px-6 btn-arcade-gold rounded-2xl flex items-center justify-center gap-2 text-slate-950 font-display font-black text-sm tracking-wide uppercase active:translate-y-1"
        >
          <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
          <span>Launch Sector {highestLevel}</span>
        </button>
      </div>

      {/* Stats Overview Grid */}
      <h2 className="font-display font-black text-sm text-slate-400 uppercase tracking-wider mb-3">
        Pilot Performance Metrics
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl clay-card flex items-center gap-3.5 hover:border-slate-600 transition-colors"
            >
              <div className={`p-2.5 rounded-xl bg-slate-950 border border-slate-800 ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block font-body">
                  {card.label}
                </span>
                <span className="font-display font-black text-lg md:text-xl text-white">
                  {card.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Game History Table (2 Columns) */}
        <div className="md:col-span-2 p-6 rounded-3xl clay-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>Recent Flight Logs</span>
            </h3>
            <Link to="/levels" className="font-display text-xs text-amber-400 hover:underline font-bold flex items-center gap-1">
              <span>View All Sectors</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2">
            {history.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3 font-display">
                  <span className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-white">
                    {item.sector}
                  </span>
                  <div>
                    <span className="font-bold text-white block">Sector {item.sector} Cleared</span>
                    <span className="text-[10px] font-body text-slate-400">{item.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-display">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${
                          s <= item.stars ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-black text-amber-300 text-sm">
                    {item.score.toLocaleString()} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Launchpad Station (1 Column) */}
        <div className="p-6 rounded-3xl clay-card flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-amber-400" />
              <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">
                Daily Mission
              </h3>
            </div>
            <p className="font-body text-xs text-slate-300 leading-relaxed mb-4">
              Rotated puzzle available for 24 hours. Clear to earn 250 bonus coins and booster crates!
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => navigate('/daily-challenge')}
              className="w-full py-3 btn-arcade-gold rounded-2xl flex items-center justify-center gap-2 text-slate-950 font-display font-black text-xs uppercase"
            >
              <span>Play Daily Puzzle</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => navigate('/leaderboard')}
              className="w-full py-2.5 btn-arcade-slate rounded-2xl flex items-center justify-center gap-2 text-xs font-display font-bold text-slate-200"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Global Rankings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
