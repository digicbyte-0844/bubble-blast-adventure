/**
 * Custom 404 Error Page (Sector Not Found)
 * King/Supercell Arcade Caliber
 * Zero white screen, matching typography & colors, primary Return to Homepage CTA
 */

import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Map, Compass, AlertTriangle, ArrowLeft } from 'lucide-react';
import CharacterMascot from '../components/CharacterMascot.jsx';
import { GAME_NAME } from '../config/gameConfig.js';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `404: Sector Not Found — ${GAME_NAME}`;
  }, []);

  return (
    <div className="min-h-[calc(100dvh-56px)] bg-[#0B0F19] text-white flex items-center justify-center p-4 select-none relative overflow-hidden">
      {/* Background Starlight & Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(30,41,59,0.5),rgba(11,15,25,0.98))] pointer-events-none" />
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#94A3B8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md clay-card p-6 md:p-8 rounded-3xl text-center shadow-2xl border border-slate-800">
        
        {/* Mascot Lost / Confused */}
        <div className="flex justify-center mb-2">
          <CharacterMascot
            emotion="confused"
            size="lg"
            speech="Uh oh! This sector drifted into a black hole!"
          />
        </div>

        {/* 404 Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-display font-black uppercase tracking-wider mb-2">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          <span>Error 404: Coordinate Lost</span>
        </div>

        <h1 className="font-display font-black text-3xl sm:text-4xl text-amber-400 uppercase tracking-tight text-shadow-arcade">
          SECTOR NOT FOUND
        </h1>

        <p className="font-body text-xs sm:text-sm font-semibold text-slate-300 mt-2 mb-6 leading-relaxed max-w-xs mx-auto">
          The star sector you are looking for does not exist, has been de-orbited, or moved to another coordinate.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Link
            to="/"
            aria-label="Home"
            className="w-full btn-arcade-gold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 text-slate-950 font-display font-black text-sm tracking-wide uppercase shadow-lg shadow-amber-500/20 active:translate-y-0.5 min-h-[48px]"
          >
            <Home className="w-4 h-4 fill-slate-950 text-slate-950" />
            <span>Return to Homepage</span>
          </Link>

          <div className="grid grid-cols-2 gap-2.5">
            <Link
              to="/levels"
              className="btn-arcade-slate py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-display font-bold text-slate-200 min-h-[48px]"
            >
              <Map className="w-4 h-4 text-sky-400" />
              <span>Saga Map</span>
            </Link>

            <button
              onClick={() => navigate(-1)}
              className="btn-arcade-slate py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-display font-bold text-slate-200 min-h-[48px]"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span>Go Back</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NotFoundPage;
