/**
 * Pilot Login Page
 * King/Supercell arcade styling with JWT authentication and offline guest play fallback
 * Bubble Puzzle Engine Presentation Tier
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, User, ArrowRight, Sparkles, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { GAME_NAME } from '../config/gameConfig.js';
import { useUserStore } from '../store/useUserStore';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loginGuest } = useUserStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') ? decodeURIComponent(searchParams.get('redirect')) : '/levels';

  useEffect(() => {
    document.title = `Login — ${GAME_NAME}`;
  }, []);

  const validate = () => {
    const errs = {};
    if (!username.trim()) {
      errs.username = 'Pilot identifier is required.';
    }
    if (!password) {
      errs.password = 'Secret passphrase is required.';
    } else if (password.length < 6) {
      errs.password = 'Passphrase must be at least 6 characters.';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login(username.trim(), password);
      navigate(redirectTarget);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials or continue as Guest.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuest = async () => {
    setIsSubmitting(true);
    try {
      await loginGuest();
      navigate(redirectTarget);
    } catch (e) {
      navigate(redirectTarget);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white pt-20 pb-16 px-4 flex items-center justify-center select-none">
      <div className="w-full max-w-md clay-card p-6 md:p-8 border border-slate-700/60 shadow-2xl relative">
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg ring-4 ring-amber-400/20">
            🫧
          </div>
          <h1 className="text-2xl font-display font-black text-white text-shadow-arcade">
            Pilot Access
          </h1>
          <p className="text-xs text-slate-400 font-sans font-semibold mt-1">
            Sign in to <span className="text-amber-400 font-bold">{GAME_NAME}</span> to sync stars and ranks.
          </p>
        </div>

        {error && (
          <div className="clay-card bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs font-bold p-3.5 rounded-2xl mb-5 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="login-username"
              className="text-xs font-display font-black text-slate-300 block mb-1.5 uppercase tracking-wider"
            >
              Pilot Identifier / Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                id="login-username"
                name="username"
                type="text"
                required
                aria-invalid={Boolean(fieldErrors.username)}
                aria-describedby={fieldErrors.username ? 'username-error' : undefined}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (fieldErrors.username) setFieldErrors((prev) => ({ ...prev, username: '' }));
                }}
                placeholder="e.g. StarlightPilot"
                className={`w-full bg-slate-950/80 border rounded-xl pl-10 pr-3 py-3 text-[16px] text-white placeholder-slate-500 font-sans font-semibold focus:outline-none min-h-[48px] transition-all ${
                  fieldErrors.username ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700/80 focus:border-amber-400'
                }`}
              />
            </div>
            {fieldErrors.username && (
              <p id="username-error" className="text-xs text-rose-400 font-semibold mt-1">
                {fieldErrors.username}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="text-xs font-display font-black text-slate-300 block mb-1.5 uppercase tracking-wider"
            >
              Secret Passphrase
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
                }}
                placeholder="••••••••"
                className={`w-full bg-slate-950/80 border rounded-xl pl-10 pr-11 py-3 text-[16px] text-white placeholder-slate-500 font-sans font-semibold focus:outline-none min-h-[48px] transition-all ${
                  fieldErrors.password ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700/80 focus:border-amber-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 p-1 text-slate-400 hover:text-white transition-colors focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p id="password-error" className="text-xs text-rose-400 font-semibold mt-1">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-arcade-gold py-3.5 rounded-2xl text-xs font-display font-black flex items-center justify-center gap-2 min-h-[50px] disabled:opacity-50 mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>AUTHENTICATING...</span>
              </>
            ) : (
              <>
                <span>SIGN IN TO SECTOR HQ</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-[10px] uppercase font-display font-black text-slate-500 tracking-wider">or instant access</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Offline Guest Option */}
        <button
          type="button"
          onClick={handleGuest}
          disabled={isSubmitting}
          className="w-full btn-arcade-slate py-3 rounded-2xl text-xs font-display font-black flex items-center justify-center gap-2 min-h-[48px]"
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>PLAY AS GUEST / OFFLINE</span>
        </button>

        <p className="text-center text-xs text-slate-400 font-sans font-semibold mt-6">
          Need a pilot license?{' '}
          <Link to="/register" className="text-amber-400 font-bold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
