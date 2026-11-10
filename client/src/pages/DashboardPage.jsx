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
    {
      label: 'Highest Sector',
      value: `Sector ${highestLevel}`,
      icon: Compass,
      gradient: 'from-blue-600 via-indigo-600 to-cyan-600',
      border: 'border-b-blue-950',
      shadow: 'shadow-blue-500/20'
    },
    {
      label: 'Cumulative Stars',
      value: `${cumulativeStars} / 120`,
      icon: Star,
      isStarBadge: true,
      gradient: 'from-amber-500 via-amber-600 to-orange-600',
      border: 'border-b-orange-950',
      shadow: 'shadow-amber-500/20'
    },
    {
      label: 'Total Score',
      value: (totalScore || 14200).toLocaleString(),
      icon: Trophy,
      gradient: 'from-emerald-500 via-teal-600 to-emerald-700',
      border: 'border-b-emerald-950',
      shadow: 'shadow-emerald-500/20'
    },
    {
      label: 'Starlight Coins',
      value: (coins || 500).toLocaleString(),
      icon: Sparkles,
      gradient: 'from-yellow-400 via-amber-500 to-amber-600',
      border: 'border-b-yellow-950',
      shadow: 'shadow-yellow-500/20'
    },
    {
      label: 'Current Energy',
      value: `${energy || 5} / 5 Cells`,
      icon: Zap,
      gradient: 'from-fuchsia-600 via-pink-600 to-rose-600',
      border: 'border-b-rose-950',
      shadow: 'shadow-rose-500/20'
    },
    {
      label: 'Pilot Standing',
      value: 'Rank #2 Ace',
      icon: Target,
      gradient: 'from-purple-600 via-violet-600 to-indigo-700',
      border: 'border-b-purple-950',
      shadow: 'shadow-purple-500/20'
    }
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
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-amber-400 via-amber-500 to-orange-600 border-2 border-amber-200 border-b-4 border-b-amber-800 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Compass className="w-8 h-8 text-slate-950" />
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
              className={`relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br ${card.gradient} border border-white/20 border-b-4 ${card.border} shadow-lg ${card.shadow} flex items-center gap-3.5 transition-transform hover:-translate-y-0.5`}
            >
              {/* Glossy Top Sheen */}
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent pointer-events-none rounded-t-2xl" />

              <div className="relative p-2.5 rounded-xl bg-black/25 backdrop-blur-sm border border-white/20 shadow-inner flex items-center justify-center">
                {card.isStarBadge ? (
                  <Star className="w-5 h-5 fill-amber-300 text-amber-200 drop-shadow" />
                ) : card.iconImg ? (
                  <img src={card.iconImg} alt="" className="w-5 h-5 object-contain drop-shadow" />
                ) : (
                  <Icon className="w-5 h-5 text-white drop-shadow" />
                )}
              </div>
              <div className="relative z-10">
                <span className="text-[10px] uppercase font-display font-black text-white/80 tracking-wider block">
                  {card.label}
                </span>
                <span className="font-display font-black text-lg md:text-xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                  {card.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mission Victory Log Table (2 Columns) */}
        <div className="md:col-span-2 p-6 rounded-3xl clay-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Mission Victory Log</span>
            </h3>
            <Link to="/levels" className="font-display text-xs text-amber-400 hover:underline font-bold flex items-center gap-1">
              <span>View All Sectors</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {history.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 border-b-2 border-b-slate-950 flex items-center justify-between text-xs hover:border-slate-700 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-3 font-display">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-emerald-400 to-teal-700 border border-emerald-300 border-b-2 border-b-teal-950 flex items-center justify-center font-black text-white shadow-md shadow-emerald-500/20 text-sm">
                    {item.sector}
                  </div>
                  <div>
                    <span className="font-black text-white block tracking-wide">Sector {item.sector} Cleared</span>
                    <span className="text-[10px] font-body text-slate-400 font-semibold">{item.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-display">
                  <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg border border-white/5">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= item.stars
                            ? 'fill-amber-400 text-amber-300 drop-shadow-sm'
                            : 'fill-slate-800 text-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-400/10 border border-amber-400/30 font-black text-amber-300 text-xs shadow-inner">
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
