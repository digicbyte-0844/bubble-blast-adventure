/**
 * Custom 404 Error Page — Sector Lost in Space
 * Full immersive cosmic arcade design matching LandingPage/LevelSelectPage caliber
 * 100dvh · zero scroll · nebulae · floating crystal bubble · 3D metallic "404"
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Map, AlertTriangle } from 'lucide-react';
import CharacterMascot from '../components/CharacterMascot.jsx';
import { GAME_NAME } from '../config/gameConfig.js';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `404 — Sector Lost in Space · ${GAME_NAME}`;
  }, []);

  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#0B0F19] text-white flex flex-col items-center justify-center select-none relative">

      {/* ── Background Layer 1: Starfield dots ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#94A3B8 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.15
        }}
      />

      {/* ── Background Layer 2: Radial vignette / nebula glow ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 85% 65% at 50% 35%, rgba(56,189,248,0.07) 0%, rgba(139,92,246,0.05) 40%, rgba(11,15,25,0.98) 80%)'
        }}
      />

      {/* ── Nebula blobs ── */}
      <div className="fixed top-[-10%] left-[-8%] w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none animate-pulse" />
      <div className="fixed bottom-[-5%] right-[-5%] w-96 h-96 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
      <div className="fixed top-[40%] right-[-12%] w-64 h-64 rounded-full bg-rose-500/8 blur-3xl pointer-events-none animate-pulse" />

      {/* ── Floating decorative bubbles ── */}
      <div className="absolute top-[8%] left-[6%] w-10 h-10 rounded-full border border-cyan-400/20 animate-pulse pointer-events-none" />
      <div className="absolute top-[15%] right-[10%] w-6 h-6 rounded-full border border-amber-400/25 animate-pulse pointer-events-none" style={{ animationDelay: '0.8s' }} />
      <div className="absolute bottom-[12%] left-[12%] w-14 h-14 rounded-full border border-violet-400/15 animate-pulse pointer-events-none" style={{ animationDelay: '1.4s' }} />
      <div className="absolute bottom-[20%] right-[8%] w-8 h-8 rounded-full border border-sky-400/20 animate-pulse pointer-events-none" style={{ animationDelay: '0.4s' }} />

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm w-full">

        {/* Crystal Bubble wrapping the mascot */}
        <div
          className="w-36 h-36 rounded-full flex items-center justify-center mb-4 animate-pulse"
          style={{
            background: 'radial-gradient(ellipse at 35% 35%, rgba(56,189,248,0.25) 0%, rgba(99,102,241,0.12) 50%, rgba(11,15,25,0.3) 100%)',
            border: '2px solid rgba(56,189,248,0.35)',
            boxShadow: '0 0 40px rgba(56,189,248,0.25), inset 0 0 20px rgba(56,189,248,0.08)',
            animationDuration: '3s'
          }}
        >
          <CharacterMascot emotion="worried" size="lg" showSpeech={false} />
        </div>

        {/* "SECTOR LOST IN SPACE" badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-display font-black uppercase tracking-widest mb-3">
          <AlertTriangle className="w-3 h-3 text-rose-400" />
          <span>Sector Lost in Space</span>
        </div>

        {/* Large 3D metallic "404" */}
        <h1
          className="font-display font-black leading-none mb-1 select-none"
          style={{
            fontSize: 'clamp(5rem, 20vw, 7rem)',
            background: 'linear-gradient(180deg, #FDE68A 0%, #F59E0B 40%, #D97706 70%, #92400E 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 4px 12px rgba(245,158,11,0.5)) drop-shadow(0 2px 0px rgba(146,64,14,0.8))',
            textShadow: 'none'
          }}
        >
          404
        </h1>

        {/* Message */}
        <p className="text-slate-300 text-sm font-semibold leading-relaxed mb-7 max-w-[260px]">
          Oops! That bubble drifted outside the known galaxy.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3 w-full">
          {/* Primary Gold — RETURN TO BASE */}
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-display font-black text-sm uppercase tracking-wide text-slate-950 min-h-[52px] transition-all active:translate-y-1 active:border-b-0"
            style={{
              background: 'linear-gradient(180deg, #FDE68A 0%, #F59E0B 60%, #D97706 100%)',
              borderBottom: '4px solid #92400E',
              boxShadow: '0 4px 20px rgba(245,158,11,0.35)'
            }}
          >
            <Home className="w-4 h-4" />
            Return to Base
          </button>

          {/* Secondary Slate — OPEN SAGA MAP */}
          <button
            onClick={() => navigate('/levels')}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-display font-black text-sm uppercase tracking-wide text-slate-200 min-h-[52px] transition-all active:translate-y-1 active:border-b-0"
            style={{
              background: 'linear-gradient(180deg, rgba(51,65,85,0.95) 0%, rgba(30,41,59,0.95) 100%)',
              border: '1px solid rgba(100,116,139,0.4)',
              borderBottom: '4px solid rgba(15,23,42,0.9)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
            }}
          >
            <Map className="w-4 h-4 text-sky-400" />
            Open Saga Map
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
