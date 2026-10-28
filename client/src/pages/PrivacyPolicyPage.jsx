/**
 * Privacy Policy & Player Data Protection Page
 * Gaming Compliance: DPDP Act 2023 (India), GDPR (EU), COPPA Baselines
 * Tailored specifically for Bubble Blast Adventure game telemetry & local storage
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Eye, Database, Cookie, Mail, ArrowLeft, CheckCircle2, ChevronRight } from 'lucide-react';
import { GAME_NAME } from '../config/gameConfig.js';

export const PrivacyPolicyPage = () => {
  const navigate = useNavigate();
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    document.title = `Privacy Policy — ${GAME_NAME}`;

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
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Last Updated: October 2026</span>
          </div>
        </div>

        {/* Hero Header Card */}
        <div className="clay-card p-6 md:p-8 rounded-3xl border border-slate-700/60 shadow-2xl relative overflow-hidden">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 text-xs font-display font-black uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Player Privacy & Data Protection</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-white text-shadow-arcade">
            {GAME_NAME} Privacy Policy
          </h1>
          <p className="text-xs text-slate-300 font-sans font-medium mt-1 leading-relaxed max-w-2xl">
            This Privacy Policy describes how {GAME_NAME} ("we", "our", or "the Platform"), developed and operated by Prabhuteja Koda, collects, utilizes, and protects your gameplay telemetries, account records, and local device preferences.
          </p>
        </div>

        {/* Core Gaming Data Clauses */}
        <div className="space-y-4">
          
          {/* Clause 1: What We Collect */}
          <div className="clay-card p-5 md:p-6 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                1
              </div>
              <h2 className="font-display font-black text-base text-white">
                Information Collected During Gameplay
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              To operate fair competitive leaderboards and persist your adventure progress across sessions, we collect:
            </p>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-5 font-sans">
              <li><strong className="text-slate-100">Account Credentials:</strong> Optional pilot username, email address, and cryptographically hashed passwords (using bcrypt with 12 salt rounds).</li>
              <li><strong className="text-slate-100">Gameplay Telemetry:</strong> Level progress, star ratings (1 to 3 stars), high scores, bubbles popped, maximum combo streaks, and session durations.</li>
              <li><strong className="text-slate-100">Anti-Cheat Verification Tokens:</strong> Cryptographic nonces and session identifiers generated per game to mathematically verify that scores conform to physics invariants.</li>
              <li><strong className="text-slate-100">Technical Device Data:</strong> Screen viewport dimensions and device pixel ratio (DPR) to scale the canvas grid accurately without visual distortion.</li>
            </ul>
          </div>

          {/* Clause 2: Local Storage & Cookies */}
          <div className="clay-card p-5 md:p-6 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-400/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 font-bold text-xs">
                2
              </div>
              <h2 className="font-display font-black text-base text-white">
                Browser Local Storage & Cookie Usage
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              We do not use third-party behavioral advertising cookies, Google Ads tracking pixels, or cross-site fingerprinting scripts. We strictly utilize client-side <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300 font-mono">localStorage</code> for functional game performance:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
                <span className="text-cyan-400 font-bold block mb-0.5">bba_token</span>
                Stateless JWT Bearer token for authenticated gameplay sessions.
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
                <span className="text-cyan-400 font-bold block mb-0.5">bba_player_progress</span>
                Local cache of unlocked sectors and earned golden stars.
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
                <span className="text-cyan-400 font-bold block mb-0.5">bba_sfx_muted / bba_music_muted</span>
                Web Audio API procedural sound synthesizer mute preferences.
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
                <span className="text-cyan-400 font-bold block mb-0.5">bba_offline_progress_queue</span>
                Queued game completions waiting to synchronize when internet reconnects.
              </div>
            </div>
          </div>

          {/* Clause 3: Anti-Cheat & Fair Play */}
          <div className="clay-card p-5 md:p-6 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-400/15 border border-rose-400/30 flex items-center justify-center text-rose-400 font-bold text-xs">
                3
              </div>
              <h2 className="font-display font-black text-base text-white">
                Anti-Cheat Surveillance & Fair Play Invariants
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              To guarantee that galactic leaderboard standings remain pure and competitive, our backend server automatically evaluates submitted game payloads against physical simulation ceilings:
            </p>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-5 font-sans">
              <li>Submissions completed in under 3.0 seconds are flagged and rejected as impossible speedruns.</li>
              <li>Shots fired cannot exceed the maximum level budget plus equipped booster allowances.</li>
              <li>Claimed scores cannot exceed the theoretical maximum mathematical score envelope: <code className="text-amber-300 font-mono">(Pops &times; 150) + (Combos &times; 500) + (Rescues &times; 300) + (Remaining Shots &times; 250) + 2500</code>.</li>
            </ul>
          </div>

          {/* Clause 4: Player Rights under DPDP Act & GDPR */}
          <div className="clay-card p-5 md:p-6 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                4
              </div>
              <h2 className="font-display font-black text-base text-white">
                Your Rights & Data Erasure (DPDP Act &amp; GDPR)
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              In accordance with the Digital Personal Data Protection (DPDP) Act of India and international standards like the GDPR:
            </p>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-5 font-sans">
              <li><strong className="text-slate-100">Right to Access:</strong> You can view your complete game history, booster inventory, and score milestones in real-time on your <Link to="/dashboard" className="text-amber-400 hover:underline">Pilot HQ Dashboard</Link>.</li>
              <li><strong className="text-slate-100">Right to Erasure ("Right to be Forgotten"):</strong> You may request the immediate deletion of your player record and leaderboard projection by contacting the administrator or clicking "Reset All Data" in <Link to="/settings" className="text-amber-400 hover:underline">Settings</Link>.</li>
              <li><strong className="text-slate-100">Zero Commercial Brokering:</strong> We never sell, rent, or monetize player records with external data brokers or ad networks.</li>
            </ul>
          </div>

          {/* Clause 5: Developer Contact & Data Controller */}
          <div className="clay-card p-5 md:p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-400/15 border border-purple-400/30 flex items-center justify-center text-purple-400 font-bold text-xs">
                5
              </div>
              <h2 className="font-display font-black text-base text-white">
                Data Controller & Contact Information
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              If you have any questions regarding your player data, or wish to submit an erasure request:
            </p>
            <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800 text-xs font-sans space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Developer & Data Controller:</span>
                <span className="font-bold text-white">Prabhuteja Koda (ID: VLRINT20262804)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Official Inquiries:</span>
                <a href="mailto:prabhutejakoda@gmail.com" className="font-mono text-cyan-400 hover:underline min-h-[44px] flex items-center">
                  prabhutejakoda@gmail.com
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Direct Support Line:</span>
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
            to="/terms-and-conditions"
            className="w-full sm:w-auto btn-arcade-slate py-3 px-6 rounded-2xl text-xs font-display font-black flex items-center justify-center gap-1.5 min-h-[48px]"
          >
            <span>Review Terms &amp; Conditions</span>
            <ChevronRight className="w-4 h-4 text-amber-400" />
          </Link>
          <Link
            to="/levels"
            className="w-full sm:w-auto btn-arcade-gold py-3 px-8 rounded-2xl text-xs font-display font-black text-slate-950 flex items-center justify-center gap-1.5 min-h-[48px]"
          >
            <span>Return to Saga Map</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
