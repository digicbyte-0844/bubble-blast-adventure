/**
 * Mobile-First Top App Bar & Navigation Drawer
 * King/Supercell Caliber: Height 56px, Safe-area Inset, Tactile Micro-Interactions
 */

import React, { useState, useEffect } from 'react';
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
  ShieldCheck,
  User,
  UserPlus,
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

  // Lock background scroll when drawer is open & handle Escape key navigation
  useEffect(() => {
    if (drawerOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setDrawerOpen(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [drawerOpen]);

  const isRegistered = Boolean(isAuthenticated && user && !user.isGuest);
  const isAdmin = Boolean(
    isAuthenticated &&
      (user?.role === 'admin' || user?.username === 'admin' || user?.username === 'Always_Prabhu')
  );

  const authNavLinks = !isRegistered
    ? [
        { to: '/login', label: 'Sign In', icon: LogIn, color: 'text-amber-400' },
        { to: '/register', label: 'Register', icon: UserPlus, color: 'text-emerald-400' }
      ]
    : [
        { to: '/profile', label: 'Profile', icon: User, color: 'text-sky-400' }
      ];

  const baseNavLinks = [
    { to: '/levels', label: 'Map', icon: Map, color: 'text-sky-400' },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-amber-400' },
    { to: '/leaderboard', label: 'Ranks', icon: Award, color: 'text-amber-300' },
    { to: '/achievements', label: 'Badges', icon: Trophy, color: 'text-purple-400' },
    { to: '/editor', label: 'Editor', icon: Sparkles, color: 'text-emerald-400' },
    { to: '/help', label: 'Academy', icon: HelpCircle, color: 'text-cyan-400' },
    { to: '/settings', label: 'Settings', icon: Settings, color: 'text-slate-400' },
    ...authNavLinks
  ];

  // Admin link only shows for verified administrators, never for guests or normal users
  const navLinks = isAdmin
    ? [...baseNavLinks, { to: '/admin', label: 'Admin', icon: ShieldCheck, color: 'text-rose-400' }]
    : baseNavLinks;

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 h-[56px] pt-safe bg-[#0B0F19]/95 backdrop-blur-md border-b border-slate-800/80 px-2.5 sm:px-4 md:px-6 select-none flex items-center justify-between gap-2">
        {/* Left: Mascot Icon + Dynamic GAME_NAME */}
        <Link
          to="/"
          onClick={closeDrawer}
          aria-label="Go to Homepage"
          className="flex items-center gap-1.5 sm:gap-2 group flex-shrink-0 min-h-[44px]"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-500 border border-amber-300 shadow-md shadow-black/40 flex items-center justify-center text-base sm:text-lg transform group-hover:scale-105 active:scale-95 transition-all flex-shrink-0">
            🫧
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-display font-black text-xs sm:text-sm md:text-base text-amber-400 tracking-tight leading-none text-shadow-arcade truncate max-w-[110px] xs:max-w-[150px] sm:max-w-none">
              {GAME_NAME}
            </span>
            <span className="hidden sm:block text-[10px] sm:text-xs font-body font-bold text-slate-400 tracking-wider uppercase">
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
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Energy / Lives Pill */}
          <div
            className="flex items-center gap-1 bg-slate-900/90 border border-slate-800/80 px-2 py-1 rounded-full text-xs font-display font-black text-rose-400 shadow-inner"
            title="Lives & Energy"
          >
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 flex-shrink-0" />
            <span>{energy}</span>
            <span className="hidden sm:inline text-xs text-slate-400 font-body font-semibold">/5</span>
          </div>

          {/* Coin Balance Pill */}
          <div
            className="flex items-center gap-1 bg-slate-900/90 border border-slate-800/80 px-2 sm:px-2.5 py-1 rounded-full text-xs font-display font-black text-amber-300 shadow-inner"
            title="Coins"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30 flex-shrink-0" />
            <span>{coins.toLocaleString()}</span>
          </div>

          {/* Audio Synthesizer Toggles (Visible on md+ screens; also inside Drawer) */}
          <div className="hidden md:flex items-center gap-1 bg-slate-900/90 border border-slate-800/80 p-0.5 rounded-full">
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

          {/* Direct Sign In Button on Header */}
          {!isRegistered && (
            <Link
              to="/login"
              className="px-2 sm:px-2.5 py-1 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/40 text-amber-300 font-display font-black text-xs transition-all active:scale-95 flex items-center gap-1 shadow-sm"
              title="Sign In with Pilot Account"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xs:inline">Sign In</span>
            </Link>
          )}

          {/* Tactile Mobile & Desktop Menu Trigger Button */}
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            aria-expanded={drawerOpen}
            aria-label={drawerOpen ? 'Close navigation drawer' : 'Open navigation drawer'}
            className="flex-shrink-0 w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 border border-amber-400/40 hover:border-amber-400 flex items-center justify-center text-amber-400 transition-all active:scale-95 shadow-md"
            title="Open Menu"
          >
            {drawerOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5 text-amber-400" />}
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
              <div className="mb-3 p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 font-display font-black text-sm">
                    {user?.username ? user.username.charAt(0).toUpperCase() : 'P'}
                  </div>
                  <div>
                    <p className="font-display font-black text-xs text-white">
                      {user?.username || (isAuthenticated ? 'Pilot' : 'Guest Explorer')}
                    </p>
                    <p className="text-[10px] font-body text-slate-400">
                      {isRegistered ? 'Verified Pilot' : 'Guest Explorer Session'}
                    </p>
                  </div>
                </div>
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      logout();
                      closeDrawer();
                    }}
                    className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
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

              {/* Prominent Mobile Sign In & Register Callout */}
              {!isRegistered && (
                <div className="mb-4 p-3 rounded-2xl bg-gradient-to-b from-amber-500/15 via-slate-900 to-slate-900 border border-amber-400/40 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-display font-black text-amber-300 uppercase tracking-tight">
                      Guest Pilot Mode
                    </span>
                    <span className="text-[10px] text-slate-400 font-body">Save Stars & Coins</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      onClick={closeDrawer}
                      className="btn-arcade-slate py-2 rounded-xl text-center text-xs font-display font-black flex items-center justify-center gap-1.5"
                    >
                      <LogIn className="w-3.5 h-3.5 text-amber-400" />
                      <span>Sign In</span>
                    </Link>
                    <Link
                      to="/register"
                      onClick={closeDrawer}
                      className="btn-arcade-gold py-2 rounded-xl text-center text-xs font-display font-black flex items-center justify-center gap-1.5 text-slate-950"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-slate-950" />
                      <span>Register</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Quick Audio Controls in Drawer */}
              <div className="mb-4 p-2 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={toggleSfx}
                  className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-display font-bold transition-all ${
                    sfxMuted
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
                  }`}
                >
                  {sfxMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>SFX {sfxMuted ? 'OFF' : 'ON'}</span>
                </button>
                <button
                  onClick={toggleMusic}
                  className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-display font-bold transition-all ${
                    musicMuted
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                  }`}
                >
                  <Music className="w-4 h-4" />
                  <span>Music {musicMuted ? 'OFF' : 'ON'}</span>
                </button>
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
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={closeDrawer}
                  className="btn-arcade-slate py-2.5 rounded-2xl text-center text-xs font-display font-black flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  onClick={closeDrawer}
                  className="btn-arcade-gold py-2.5 rounded-2xl text-center text-xs font-display font-black flex items-center justify-center gap-1.5 text-slate-950"
                >
                  <UserPlus className="w-3.5 h-3.5 text-slate-950" />
                  <span>Register</span>
                </Link>
              </div>

              {isRegistered && (
                <Link
                  to="/profile"
                  onClick={closeDrawer}
                  className="w-full btn-arcade-slate py-2.5 rounded-2xl text-center text-xs font-display font-black flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span>My Profile & Stats</span>
                </Link>
              )}
              <div className="flex items-center justify-center gap-3 pt-2 text-[11px] font-body text-slate-400">
                <Link to="/privacy-policy" onClick={closeDrawer} className="hover:text-amber-400 transition-colors">
                  Privacy Policy
                </Link>
                <span>•</span>
                <Link to="/terms-and-conditions" onClick={closeDrawer} className="hover:text-amber-400 transition-colors">
                  Terms of Service
                </Link>
              </div>
              <p className="text-[10px] font-body text-slate-500 text-center">
                {GAME_NAME} • King/Supercell Mobile Engine
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-Only Bottom App Navigation Dock (Thumb-Friendly, iOS Safe-Area Padded) */}
      <nav
        aria-label="Mobile Navigation Dock"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0B0F19]/95 border-t border-slate-800/90 backdrop-blur-xl shadow-[0_-4px_24px_rgba(0,0,0,0.6)] px-2 pt-1.5 pb-[max(env(safe-area-inset-bottom),0.5rem)] flex items-center justify-around select-none"
      >
        {/* Tab 1: Map */}
        <Link
          to="/levels"
          onClick={closeDrawer}
          className={`flex-1 min-h-[48px] py-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all ${
            location.pathname === '/levels'
              ? 'text-amber-400 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${location.pathname === '/levels' ? 'bg-amber-400/15 ring-1 ring-amber-400/40 text-amber-400' : ''}`}>
            <Map className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-display font-bold tracking-tight">Map</span>
        </Link>

        {/* Tab 2: Dashboard */}
        <Link
          to="/dashboard"
          onClick={closeDrawer}
          className={`flex-1 min-h-[48px] py-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all ${
            location.pathname === '/dashboard'
              ? 'text-amber-400 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${location.pathname === '/dashboard' ? 'bg-amber-400/15 ring-1 ring-amber-400/40 text-amber-400' : ''}`}>
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-display font-bold tracking-tight">HQ</span>
        </Link>

        {/* Tab 3: Ranks */}
        <Link
          to="/leaderboard"
          onClick={closeDrawer}
          className={`flex-1 min-h-[48px] py-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all ${
            location.pathname === '/leaderboard'
              ? 'text-amber-400 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${location.pathname === '/leaderboard' ? 'bg-amber-400/15 ring-1 ring-amber-400/40 text-amber-400' : ''}`}>
            <Award className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-display font-bold tracking-tight">Ranks</span>
        </Link>

        {/* Tab 4: Badges */}
        <Link
          to="/achievements"
          onClick={closeDrawer}
          className={`flex-1 min-h-[48px] py-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all ${
            location.pathname === '/achievements'
              ? 'text-amber-400 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${location.pathname === '/achievements' ? 'bg-amber-400/15 ring-1 ring-amber-400/40 text-amber-400' : ''}`}>
            <Trophy className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-display font-bold tracking-tight">Badges</span>
        </Link>

        {/* Tab 5: Menu / More Drawer Trigger */}
        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          aria-expanded={drawerOpen}
          aria-label={drawerOpen ? 'Close all menus' : 'Open all menus'}
          className={`flex-1 min-h-[48px] py-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all ${
            drawerOpen
              ? 'text-amber-400 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${drawerOpen ? 'bg-amber-400/15 ring-1 ring-amber-400/40 text-amber-400' : ''}`}>
            {drawerOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
          </div>
          <span className="text-[10px] font-display font-bold tracking-tight">Menu</span>
        </button>
      </nav>
    </>
  );
};

export default Navbar;
