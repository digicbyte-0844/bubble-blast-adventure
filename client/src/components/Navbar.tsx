/**
 * Mobile-First Top App Bar & Navigation Drawer
 * King/Supercell Caliber: Height 56px, Safe-area Inset, Tactile Micro-Interactions
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Volume2,
  VolumeX,
  Music,
  Heart,
  Coins,
  Map,
  Trophy,
  Award,
  Sparkles,
  Settings,
  HelpCircle,
  LayoutDashboard,
  User,
  LogIn,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAudioStore } from '../store/useAudioStore';
import { useUserStore } from '../store/useUserStore';
import { GAME_NAME } from '../config/gameConfig';

export const Navbar: React.FC = () => {
  const { sfxMuted, musicMuted, toggleSfx, toggleMusic } = useAudioStore();
  const { coins, energy, user, isAuthenticated, logout, loginGuest } = useUserStore();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navLinks = [
    { to: '/levels', label: 'Map', icon: Map, color: 'text-sky-400' },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-amber-400' },
    { to: '/leaderboard', label: 'Ranks', icon: Award, color: 'text-amber-300' },
    { to: '/achievements', label: 'Badges', icon: Trophy, color: 'text-purple-400' },
    { to: '/editor', label: 'Editor', icon: Sparkles, color: 'text-emerald-400' },
    { to: '/help', label: 'Academy', icon: HelpCircle, color: 'text-cyan-400' },
    { to: '/settings', label: 'Settings', icon: Settings, color: 'text-slate-400' }
  ];

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 h-[56px] pt-safe bg-[#0B0F19]/95 backdrop-blur-md border-b border-slate-800/80 px-3 md:px-6 select-none flex items-center justify-between">
        {/* Left: Mascot Icon + Dynamic GAME_NAME */}
        <Link
          to="/"
          onClick={closeDrawer}
          className="flex items-center gap-2 group flex-shrink-0 min-h-[48px] items-center"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-500 border border-amber-300 shadow-md shadow-black/40 flex items-center justify-center text-lg transform group-hover:scale-105 active:scale-95 transition-all">
            🫧
          </div>
          <div className="flex flex-col">
            <h1 className="font-display font-black text-sm md:text-base text-amber-400 tracking-tight leading-none text-shadow-arcade flex items-center gap-1">
              <span>{GAME_NAME}</span>
            </h1>
            <span className="text-xs font-body font-bold text-slate-400 tracking-wider uppercase">
              Arcade Puzzle
            </span>
          </div>
        </Link>

        {/* Desktop Quick Nav Strip */}
        <nav className="hidden xl:flex items-center gap-1 bg-slate-900/80 border border-slate-800 p-1 rounded-2xl text-xs font-display font-bold">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Currency / Stat Pills + Audio Controls + Drawer Trigger */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Energy / Lives Pill */}
          <div
            className="flex items-center gap-1 bg-slate-900/90 border border-slate-800/80 px-2 py-1 rounded-full text-xs font-display font-black text-rose-400 shadow-inner"
            title="Lives & Energy"
          >
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>{energy}</span>
            <span className="text-xs text-slate-400 font-body font-semibold">/5</span>
          </div>

          {/* Coin Balance Pill */}
          <div
            className="flex items-center gap-1 bg-slate-900/90 border border-slate-800/80 px-2.5 py-1 rounded-full text-xs font-display font-black text-amber-300 shadow-inner"
            title="Coins"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
            <span>{coins.toLocaleString()}</span>
          </div>

          {/* Audio Synthesizer Toggles */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800/80 p-0.5 rounded-full">
            <button
              onClick={toggleSfx}
              title={sfxMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                sfxMuted ? 'text-slate-600' : 'text-sky-400 hover:bg-sky-400/10'
              }`}
            >
              {sfxMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={toggleMusic}
              title={musicMuted ? 'Unmute Background Music' : 'Mute Background Music'}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                musicMuted ? 'text-slate-600' : 'text-amber-400 hover:bg-amber-400/10'
              }`}
            >
              <Music className="w-4 h-4" />
            </button>
          </div>

          {/* Hamburger Drawer Trigger (Min 48px Touch Target) */}
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="w-10 h-10 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/60 flex items-center justify-center text-slate-200 transition-all active:scale-95 ml-0.5"
            aria-label="Toggle navigation drawer"
          >
            {drawerOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Slide-out Arcade Drawer Modal */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop Blur */}
          <div
            onClick={closeDrawer}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Sheet */}
          <div className="relative ml-auto w-full max-w-xs h-full bg-[#0B0F19] border-l border-slate-800/80 p-5 flex flex-col justify-between shadow-2xl z-10 pt-safe pb-safe overflow-y-auto">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-400 flex items-center justify-center text-sm">
                    🫧
                  </div>
                  <span className="font-display font-black text-amber-400 text-sm">
                    {GAME_NAME}
                  </span>
                </div>
                <button
                  onClick={closeDrawer}
                  className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Identity Pill */}
              <div className="mb-4 p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 font-display font-black text-sm">
                    {user?.username ? user.username.charAt(0).toUpperCase() : 'P'}
                  </div>
                  <div>
                    <p className="font-display font-black text-xs text-white">
                      {user?.username || (isAuthenticated ? 'Pilot' : 'Guest Explorer')}
                    </p>
                    <p className="text-[10px] font-body text-slate-400">
                      {isAuthenticated ? 'License Active' : 'Offline Session'}
                    </p>
                  </div>
                </div>
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      logout();
                      closeDrawer();
                    }}
                    className="p-2 text-slate-400 hover:text-rose-400"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      loginGuest();
                      closeDrawer();
                    }}
                    className="text-[10px] font-display font-black bg-amber-400 text-slate-950 px-2 py-1 rounded-lg"
                  >
                    Guest
                  </button>
                )}
              </div>

              {/* Navigation Links Grid */}
              <div className="space-y-1.5 font-display font-bold text-sm">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={closeDrawer}
                      className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                        isActive
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : 'text-slate-300 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-slate-950' : item.color}`} />
                        <span>{item.label}</span>
                      </div>
                      <span className="text-xs opacity-60">→</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Bottom Auth Buttons */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2">
              {!isAuthenticated ? (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={closeDrawer}
                    className="btn-arcade-slate py-2.5 rounded-2xl text-center text-xs font-display font-black"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeDrawer}
                    className="btn-arcade-gold py-2.5 rounded-2xl text-center text-xs font-display font-black"
                  >
                    Register
                  </Link>
                </div>
              ) : (
                <Link
                  to="/profile"
                  onClick={closeDrawer}
                  className="w-full btn-arcade-slate py-2.5 rounded-2xl text-center text-xs font-display font-black flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span>My Profile & Stats</span>
                </Link>
              )}
              <p className="text-[10px] font-body text-slate-500 text-center">
                {GAME_NAME} • King/Supercell Mobile Engine
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
