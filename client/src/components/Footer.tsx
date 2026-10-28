/**
 * Global Responsive Footer & Contact Utility
 * King/Supercell Arcade Caliber
 * Zero dead links, dynamic copyright year, and clickable tel/mailto links
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Github, Map, LayoutDashboard, Award, Trophy, HelpCircle, Sparkles, Settings, Heart } from 'lucide-react';
import { GAME_NAME } from '../config/gameConfig';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#070A11] border-t border-slate-800/80 text-slate-400 select-none no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4 md:col-span-1">
            <Link
              to="/"
              aria-label="Home"
              className="inline-flex items-center gap-2 group min-h-[44px]"
            >
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-500 border border-amber-300 shadow-md shadow-black/40 flex items-center justify-center text-lg transform group-hover:scale-105 transition-all">
                🫧
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-amber-400 text-sm tracking-tight leading-none text-shadow-arcade">
                  {GAME_NAME}
                </span>
                <span className="text-[10px] font-body font-bold text-slate-500 tracking-wider uppercase mt-0.5">
                  Arcade Bubble Shooter
                </span>
              </div>
            </Link>
            <p className="text-xs font-sans text-slate-400 leading-relaxed">
              Mobile-first hexagonal physics puzzle platform. Aim, chain combos, pop clusters, and rescue trapped Mini-Jellies in 40+ handcrafted sectors.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Crafted with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
              <span>by</span>
              <span className="text-white font-bold">Prabhuteja Koda</span>
            </div>
          </div>

          {/* Col 2: Exploration & Game Modes */}
          <div className="space-y-3">
            <h4 className="text-xs font-display font-black text-slate-200 uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs font-sans font-semibold">
              <li>
                <Link to="/levels" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5 min-h-[40px]">
                  <Map className="w-3.5 h-3.5 text-sky-400" />
                  <span>Saga World Map</span>
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5 min-h-[40px]">
                  <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pilot Command HQ</span>
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5 min-h-[40px]">
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>Galactic Leaderboard</span>
                </Link>
              </li>
              <li>
                <Link to="/achievements" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5 min-h-[40px]">
                  <Trophy className="w-3.5 h-3.5 text-purple-400" />
                  <span>Starlight Badges</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Pilot Academy & Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-display font-black text-slate-200 uppercase tracking-wider">
              Pilot Academy & Tools
            </h4>
            <ul className="space-y-2 text-xs font-sans font-semibold">
              <li>
                <Link to="/help" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5 min-h-[40px]">
                  <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Flight Manual (How to Play)</span>
                </Link>
              </li>
              <li>
                <Link to="/editor" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5 min-h-[40px]">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sector Level Editor</span>
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5 min-h-[40px]">
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>System Audio & Settings</span>
                </Link>
              </li>
              <li>
                <Link to="/daily-challenge" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5 min-h-[40px]">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  <span>Daily Star Challenge</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Verified Developer Contact (tel: & mailto:) */}
          <div className="space-y-3">
            <h4 className="text-xs font-display font-black text-slate-200 uppercase tracking-wider">
              Developer & Support
            </h4>
            <div className="space-y-2.5 text-xs font-sans">
              <p className="text-slate-400">
                Direct inquiries, bug reports, and internship assessment validation:
              </p>
              
              {/* Clickable Email */}
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <a
                  href="mailto:prabhutejakoda@gmail.com"
                  className="text-slate-300 hover:text-amber-400 font-mono font-semibold transition-colors min-h-[44px] flex items-center"
                >
                  prabhutejakoda@gmail.com
                </a>
              </div>

              {/* Clickable Phone Number */}
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a
                  href="tel:+918008882026"
                  className="text-slate-300 hover:text-amber-400 font-mono font-semibold transition-colors min-h-[44px] flex items-center"
                >
                  +91 (800) 888-2026
                </a>
              </div>

              {/* Clickable GitHub Repo */}
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <a
                  href="https://github.com/digicbyte-0844/bubble-blast-adventure"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-amber-400 font-mono font-semibold transition-colors min-h-[44px] flex items-center"
                >
                  @digicbyte-0844 / GitHub
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Sub-Bar with Dynamic Copyright Year */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-sans text-slate-500">
          <p>
            &copy; {currentYear} {GAME_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] text-slate-500">Candidate ID: VLRINT20262804</span>
            <span className="text-slate-700">•</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Production Online
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
