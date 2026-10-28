/**
 * Lightweight Context-Aware Cookie & Local Storage Consent Banner
 * King/Supercell Arcade Caliber
 * Non-intrusive, mobile thumb-friendly, strictly preserves gaming viewport
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Cookie, Check, X, Shield } from 'lucide-react';

export const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem('bba_cookie_consent');
      if (!consent) {
        // Delay slightly for smooth entrance
        const timer = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleAccept = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bba_cookie_consent', 'accepted');
    }
    setVisible(false);
  };

  const handleDecline = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bba_cookie_consent', 'declined');
    }
    setVisible(false);
  };

  // Do not render during active gameplay to prevent obstructing the bubble launcher
  if (!visible || location.pathname.startsWith('/game')) return null;

  return (
    <aside
      aria-label="Cookie & Local Storage Consent"
      className="fixed bottom-20 md:bottom-6 right-3 left-3 md:left-auto md:max-w-md z-40 animate-in fade-in slide-in-from-bottom-4 duration-300 select-none"
    >
      <div className="clay-card p-4 rounded-3xl border border-amber-400/40 shadow-2xl bg-slate-950/95 backdrop-blur-xl flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-xl flex-shrink-0">
            🍪
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="font-display font-black text-xs text-amber-300 uppercase tracking-tight">
                Pilot Storage Notice
              </span>
              <Shield className="w-3 h-3 text-emerald-400" />
            </div>
            <p className="text-[11px] font-sans text-slate-300 leading-snug">
              We use secure browser local storage to save your sector progress, star ratings, and sound preferences. Zero third-party ad trackers.{' '}
              <Link to="/privacy-policy" className="text-amber-400 hover:underline font-bold">
                Learn more
              </Link>
            </p>
          </div>
          <button
            onClick={handleDecline}
            aria-label="Dismiss cookie notice"
            className="text-slate-500 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAccept}
            className="flex-1 btn-arcade-gold py-2 px-3 rounded-xl text-xs font-display font-black text-slate-950 flex items-center justify-center gap-1.5 min-h-[44px] active:scale-95 transition-all shadow-md"
          >
            <Check className="w-4 h-4 text-slate-950" />
            <span>Accept &amp; Save Progress</span>
          </button>
          <button
            onClick={handleDecline}
            className="btn-arcade-slate py-2 px-4 rounded-xl text-xs font-display font-bold text-slate-300 hover:text-white min-h-[44px] active:scale-95 transition-all"
          >
            <span>Decline</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default CookieConsent;
