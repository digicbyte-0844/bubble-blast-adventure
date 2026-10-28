/**
 * Pilot Profile Page
 * King/Supercell arcade styling with astronaut avatar, lifetime credentials, & tactical shortcuts
 * Bubble Puzzle Engine Presentation Tier
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Shield, Award, Trophy, Star, Sparkles, Map, Compass, Copy, Check } from 'lucide-react';
import { GAME_NAME } from '../config/gameConfig.js';
import { useUserStore } from '../store/useUserStore';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, currentLevel, totalScore, stars, bubblesPopped, logout } = useUserStore();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = `Pilot Profile — ${GAME_NAME}`;
  }, []);

  const handleCopyPilotId = () => {
    const pilotId = user?.id || user?._id || `PLT-${(user?.username || 'GUEST').slice(0, 4).toUpperCase()}-2026`;
    navigator.clipboard.writeText(pilotId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white pt-20 pb-16 px-4 select-none">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Pilot ID Card */}
        <div className="clay-card p-6 md:p-8 border border-slate-700/60 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-5xl shadow-xl ring-4 ring-amber-400/30 flex-shrink-0">
              🧑‍🚀
            </div>
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30 text-[10px] font-display font-black uppercase tracking-wider mb-2">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Certified Starfleet Pilot</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-display font-black text-white text-shadow-arcade">
                {user?.username || 'CosmicPilot'}
              </h1>
              <p className="text-xs text-slate-400 font-sans font-semibold mt-0.5">
                Active Member • {GAME_NAME} Space Academy
              </p>
              <div className="flex items-center gap-2 mt-2.5 justify-center sm:justify-start">
                <span className="font-mono text-[11px] bg-slate-900/90 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-xl">
                  ID: {user?.id || user?._id || `PLT-${(user?.username || 'GUEST').slice(0, 4).toUpperCase()}-2026`}
                </span>
                <button
                  type="button"
                  onClick={handleCopyPilotId}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-display font-black inline-flex items-center gap-1 transition-all active:scale-95 min-h-[32px]"
                  aria-label="Copy Pilot ID to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">COPIED!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-amber-400" />
                      <span>COPY ID</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn-arcade-crimson px-5 py-3 rounded-2xl text-xs font-display font-black flex items-center gap-2 min-h-[48px]"
            >
              <LogOut className="w-4 h-4" />
              <span>SIGN OUT</span>
            </button>
          </div>
        </div>

        {/* Guest Account Conversion Card */}
        {user?.isGuest && (
          <div className="clay-card p-5 rounded-2xl bg-amber-500/10 border border-amber-400/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-black text-sm text-amber-300">
                Playing in Guest Mode
              </h3>
              <p className="text-xs text-slate-300 font-body">
                Register or sign in to permanently save your high scores, badges, and progress across devices.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => navigate('/login')}
                className="flex-1 sm:flex-initial btn-arcade-slate py-2.5 px-4 rounded-xl text-xs font-display font-black min-h-[44px]"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="flex-1 sm:flex-initial btn-arcade-gold py-2.5 px-4 rounded-xl text-xs font-display font-black text-slate-950 min-h-[44px]"
              >
                Register
              </button>
            </div>
          </div>
        )}

        {/* Lifetime Credentials */}
        <div>
          <h2 className="text-xs font-display font-black uppercase text-amber-400 tracking-wider mb-3 px-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Lifetime Flight Credentials</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="clay-card p-4 text-center border border-slate-700/60">
              <span className="text-[10px] uppercase font-sans font-bold text-slate-400 block mb-1">Max Sector</span>
              <span className="text-xl font-display font-black text-white">Sector {currentLevel || 1}</span>
            </div>
            <div className="clay-card p-4 text-center border border-slate-700/60">
              <span className="text-[10px] uppercase font-sans font-bold text-slate-400 block mb-1">Golden Stars</span>
              <span className="text-xl font-display font-black text-amber-400 flex items-center justify-center gap-1">
                ⭐ {stars || 3}
              </span>
            </div>
            <div className="clay-card p-4 text-center border border-slate-700/60">
              <span className="text-[10px] uppercase font-sans font-bold text-slate-400 block mb-1">Career Score</span>
              <span className="text-xl font-display font-black text-cyan-400">{(totalScore || 14200).toLocaleString()}</span>
            </div>
            <div className="clay-card p-4 text-center border border-slate-700/60">
              <span className="text-[10px] uppercase font-sans font-bold text-slate-400 block mb-1">Bubbles Cleared</span>
              <span className="text-xl font-display font-black text-emerald-400">{(bubblesPopped || 340).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => navigate('/levels')}
            className="clay-card p-5 border border-slate-700/60 hover:border-amber-400/50 cursor-pointer transition-all flex items-center gap-4 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Map className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-sm font-display font-black text-white group-hover:text-amber-300 transition-colors">
                Resume World Map
              </h3>
              <span className="text-xs text-slate-400 font-sans font-medium">Jump directly to your latest unlocked sector.</span>
            </div>
          </div>

          <div
            onClick={() => navigate('/achievements')}
            className="clay-card p-5 border border-slate-700/60 hover:border-cyan-400/50 cursor-pointer transition-all flex items-center gap-4 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-sm font-display font-black text-white group-hover:text-cyan-300 transition-colors">
                View 12 Badges
              </h3>
              <span className="text-xs text-slate-400 font-sans font-medium">Track and claim coin rewards for mission milestones.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
