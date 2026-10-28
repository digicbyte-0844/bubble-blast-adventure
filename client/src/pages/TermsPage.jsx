/**
 * Terms & Conditions / Pilot Service Agreement Page
 * Gaming Compliance: Intellectual Property, Fair Play, Anti-Cheat, and Virtual Currency
 * Tailored specifically for Bubble Blast Adventure game platform
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, ShieldAlert, Coins, Sparkles, FileText, ArrowLeft, ChevronRight } from 'lucide-react';
import { GAME_NAME } from '../config/gameConfig.js';

export const TermsPage = () => {
  const navigate = useNavigate();
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    document.title = `Terms & Conditions — ${GAME_NAME}`;

    const handleScroll = () => {
      const el = document.getElementById('main-content') || document.documentElement;
      const scrollTop = el.scrollTop || window.scrollY || 0;
      const scrollHeight = (el.scrollHeight || document.documentElement.scrollHeight) - (el.clientHeight || window.innerHeight);
      if (scrollHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100)));
      }
    };

    const mainEl = document.getElementById('main-content');
    if (mainEl) mainEl.addEventListener('scroll', handleScroll);
    window.addEventListener('scroll', handleScroll);

    return () => {
      if (mainEl) mainEl.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 pt-20 pb-20 px-4 select-none relative">
      {/* 3px Reading Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-slate-900/80 z-50 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-amber-400 via-sky-400 to-emerald-400 transition-all duration-100 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-display font-bold text-slate-400 hover:text-white transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Back</span>
          </button>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono font-bold text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Last Updated: October 2026</span>
          </div>
        </div>

        {/* Hero Header Card */}
        <div className="clay-card p-6 md:p-8 rounded-3xl border border-slate-700/60 shadow-2xl relative overflow-hidden">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-display font-black uppercase tracking-wider mb-2">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span>Pilot Agreement & Rules of Engagement</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-white text-shadow-arcade">
            {GAME_NAME} Terms &amp; Conditions
          </h1>
          <p className="text-xs text-slate-300 font-sans font-medium mt-1 leading-relaxed max-w-2xl">
            By launching sectors, aiming trajectories, registering a callsign, or accessing {GAME_NAME}, you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service.
          </p>
        </div>

        {/* Core Terms Clauses */}
        <div className="space-y-4">
          
          {/* Clause 1: Pilot License & Acceptable Use */}
          <div className="clay-card p-5 md:p-6 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                1
              </div>
              <h2 className="font-display font-black text-base text-white">
                Pilot License &amp; Fair Play Rules
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              We grant you a personal, non-exclusive, revocable license to play {GAME_NAME} for non-commercial entertainment purposes. In exchange, you strictly agree:
            </p>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-5 font-sans">
              <li><strong className="text-slate-100">No Memory Editing or Speed-Hacks:</strong> You will not use cheat engines, memory modifiers, or automated aim-bots. Submissions taking under 3.0 seconds are automatically rejected.</li>
              <li><strong className="text-slate-100">No API Payload Manipulation:</strong> You will not attempt to forge score submissions, inject unauthorized session nonces, or manipulate HTTP requests sent to <code className="text-amber-300 font-mono">/api/games/complete</code>.</li>
              <li><strong className="text-slate-100">Zero Harassment:</strong> Pilot callsigns must not contain profane, derogatory, or defamatory language.</li>
            </ul>
          </div>

          {/* Clause 2: Virtual Currency & In-Game Goods */}
          <div className="clay-card p-5 md:p-6 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-400/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 font-bold text-xs">
                2
              </div>
              <h2 className="font-display font-black text-base text-white">
                Virtual Goods, Energy &amp; Starlight Coins
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {GAME_NAME} includes virtual gameplay currencies (Starlight Coins, Lives/Energy, and Boosters like Cosmic Bombs and Super Aim Guides):
            </p>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-5 font-sans">
              <li>Virtual items have zero real-world fiat currency value and cannot be redeemed, sold, or exchanged for real money.</li>
              <li>All virtual items are awarded through gameplay performance, daily streak rewards, or milestone unlocks.</li>
              <li>We reserve the right to rebalance booster costs, shot budgets, or star thresholds to preserve mathematical gameplay equilibrium.</li>
            </ul>
          </div>

          {/* Clause 3: Intellectual Property */}
          <div className="clay-card p-5 md:p-6 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-400/15 border border-purple-400/30 flex items-center justify-center text-purple-400 font-bold text-xs">
                3
              </div>
              <h2 className="font-display font-black text-base text-white">
                Intellectual Property &amp; Original Mascot
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              All visual designs, hexagonal ballistics math, procedural Web Audio API synthesizers, sound design formulas, and the original character mascot <strong className="text-amber-400">Bloopi the Starlight Jelly</strong> are the exclusive intellectual property of Prabhuteja Koda. You may not decompile, reverse-engineer, or redistribute the source code without explicit permission.
            </p>
          </div>

          {/* Clause 4: Service Availability & Disclaimer */}
          <div className="clay-card p-5 md:p-6 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-400/15 border border-rose-400/30 flex items-center justify-center text-rose-400 font-bold text-xs">
                4
              </div>
              <h2 className="font-display font-black text-base text-white">
                Service Disclaimer &amp; Offline Availability
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              The game is provided on an "as-is" and "as-available" basis. While our edge deployment architecture targets continuous 99.9% availability backed by Cloud MongoDB Atlas, we provide offline client resilience to ensure uninterrupted play during network outages. We do not warrant that gameplay will be entirely free from momentary browser rendering latency on legacy devices.
            </p>
          </div>

          {/* Clause 5: Governing Law & Contact */}
          <div className="clay-card p-5 md:p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                5
              </div>
              <h2 className="font-display font-black text-base text-white">
                Governing Law &amp; Dispute Resolution
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes arising in connection with this web application shall be subject to the exclusive jurisdiction of the competent courts of Visakhapatnam (Vizag), Andhra Pradesh, India.
            </p>
            <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800 text-xs font-sans space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Project Architect:</span>
                <span className="font-bold text-white">Prabhuteja Koda (Intern ID: VLRINT20262804)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Electronic Mail:</span>
                <a href="mailto:prabhutejakoda@gmail.com" className="font-mono text-cyan-400 hover:underline min-h-[44px] flex items-center">
                  prabhutejakoda@gmail.com
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Phone Hotline:</span>
                <a href="tel:+919177160897" className="font-mono text-emerald-400 hover:underline min-h-[44px] flex items-center">
                  +91 9177160897
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Jurisdiction & Location:</span>
                <span className="text-white">Visakhapatnam (Vizag), Andhra Pradesh, India</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            to="/privacy-policy"
            className="w-full sm:w-auto btn-arcade-slate py-3 px-6 rounded-2xl text-xs font-display font-black flex items-center justify-center gap-1.5 min-h-[48px]"
          >
            <span>Review Privacy Policy</span>
            <ChevronRight className="w-4 h-4 text-amber-400" />
          </Link>
          <Link
            to="/levels"
            className="w-full sm:w-auto btn-arcade-gold py-3 px-8 rounded-2xl text-xs font-display font-black text-slate-950 flex items-center justify-center gap-1.5 min-h-[48px]"
          >
            <span>Launch Game</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default TermsPage;
