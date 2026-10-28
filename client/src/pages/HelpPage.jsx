/**
 * How to Play & Pilot Flight Manual
 * King/Supercell arcade styling with illustrated mechanics, Odd-R geometry, & BFS avalanche tips
 * Bubble Puzzle Engine Presentation Tier
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Play, Sparkles, Target, Zap, Shield, ArrowRight, Compass } from 'lucide-react';
import { GAME_NAME } from '../config/gameConfig.js';
import CharacterMascot from '../components/CharacterMascot.jsx';

export const HelpPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `Flight Manual — ${GAME_NAME}`;
  }, []);

  const guides = [
    {
      step: '01',
      title: 'Aim & Billiard Bankshots',
      desc: 'Move your pointer or touch-drag on mobile to pivot the cannon launcher. Dotted laser guides calculate continuous wall reflections. Locked angles prevent wasteful downward shots.',
      badge: 'Ballistic Physics',
      color: 'from-amber-400 to-amber-500'
    },
    {
      step: '02',
      title: 'Connected Hex Match-3 (BFS)',
      desc: 'Connect 3 or more bubbles of the identical color. Parity-aware hexagonal neighbors nestle into the hollows of adjacent rows, triggering cluster pops and star points.',
      badge: 'Cluster Clearance',
      color: 'from-cyan-400 to-cyan-500'
    },
    {
      step: '03',
      title: 'Topological Gravity Drops',
      desc: 'Sever clusters from the ceiling! The engine runs a ceiling-anchored BFS starting from Row 0. Any bubbles disconnected from the ceiling plummet with g = 0.45 px/frame² physics for huge score multipliers!',
      badge: 'Mass Avalanche',
      color: 'from-emerald-400 to-emerald-500'
    },
    {
      step: '04',
      title: 'Rescue Starlight Jellies',
      desc: 'In rescue sectors, baby Mini-Jellies are imprisoned inside celestial crystal capsules. Pop neighboring bubbles or drop their cluster to free them and fulfill mission criteria.',
      badge: 'Primary Objective',
      color: 'from-rose-400 to-rose-500'
    },
    {
      step: '05',
      title: 'Tactical Booster Deployment',
      desc: 'Deploy 5 special boosters from the dock: Super Aim Guide (2 bounces + target circle), Cosmic Bomb (2-hex blast), Prism Rainbow (wildcard match), +5 Shots, and Grid Shuffle.',
      badge: 'Power Arsenal',
      color: 'from-pink-400 to-pink-500'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white pt-20 pb-16 px-4 select-none">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Banner */}
        <div className="clay-card p-6 md:p-8 border border-slate-700/60 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 text-xs font-black uppercase tracking-wider mb-2">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Pilot Academy</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-black text-white text-shadow-arcade">
              How to Play {GAME_NAME}
            </h1>
            <p className="text-xs text-slate-400 font-sans font-semibold mt-1">
              Master Odd-R hexagonal geometry, ballistic raycasting, and topological gravity drops!
            </p>
          </div>

          {/* Bloopi Mascot Tip */}
          <div className="flex-shrink-0">
            <CharacterMascot emotion="hint" size="md" speech="Sever ceiling clusters to trigger massive gravity drops!" />
          </div>
        </div>

        {/* Illustrated Guide Cards */}
        <div className="space-y-4">
          {guides.map((item, idx) => (
            <div
              key={idx}
              className="clay-card p-5 md:p-6 border border-slate-700/60 hover:border-slate-600 transition-all flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-xl"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-slate-950 font-display text-lg font-black shadow-lg flex-shrink-0`}>
                {item.step}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-base font-display font-black text-white">
                    {item.title}
                  </h3>
                  <span className="text-[10px] uppercase font-display font-black text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30">
                    {item.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-sans font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Support & Developer Communications */}
        <div className="clay-card p-6 md:p-7 border border-slate-700/60 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-display font-black text-amber-400 uppercase tracking-widest block mb-1">
              Direct Pilot Support
            </span>
            <h3 className="text-lg font-display font-black text-white">
              Need Assistance or Found a Bug?
            </h3>
            <p className="text-xs text-slate-300 font-sans mt-0.5">
              Contact Lead Engineer Prabhuteja Koda directly for flight log verification or technical support.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="mailto:prabhutejakoda@gmail.com"
              className="btn-arcade-slate px-4 py-2.5 rounded-xl text-xs font-display font-bold text-sky-300 hover:text-white flex items-center gap-2 min-h-[44px]"
            >
              <span>📧 prabhutejakoda@gmail.com</span>
            </a>
            <a
              href="tel:+918008882026"
              className="btn-arcade-slate px-4 py-2.5 rounded-xl text-xs font-display font-bold text-emerald-300 hover:text-white flex items-center gap-2 min-h-[44px]"
            >
              <span>📞 +91 (800) 888-2026</span>
            </a>
          </div>
        </div>

        {/* Bottom CTA to Launch Game */}
        <div className="clay-card p-8 border border-amber-500/30 text-center shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-md mx-auto space-y-4">
            <h3 className="text-xl md:text-2xl font-display font-black text-white text-shadow-arcade">
              Ready to Test Your Aim in the Cosmos?
            </h3>
            <p className="text-xs text-slate-300 font-sans">
              Jump directly into Sector 1 and start chaining combos with Bloopi the Starlight Jelly!
            </p>
            <div>
              <button
                onClick={() => navigate('/game/1')}
                className="btn-arcade-gold px-8 py-4 rounded-2xl text-sm font-display font-black inline-flex items-center gap-2 min-h-[52px]"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>LAUNCH SECTOR 1 NOW</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HelpPage;
