/**
 * Pilot Registration Page
 * King/Supercell arcade styling with JWT account creation & guest play fallback
 * Bubble Puzzle Engine Presentation Tier
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, User, Mail, ArrowRight, Sparkles, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { GAME_NAME } from '../config/gameConfig.js';
import { useUserStore } from '../store/useUserStore';

export const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, loginGuest } = useUserStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawTarget = searchParams.get('redirect') ? decodeURIComponent(searchParams.get('redirect')) : '/levels';
  const redirectTarget = (!rawTarget || rawTarget.startsWith('/login')) ? '/levels' : rawTarget;

  useEffect(() => {
    document.title = `Register — ${GAME_NAME}`;
  }, []);

  const validate = () => {
    const errs = {};
    const trimmedUser = username.trim();
    if (!trimmedUser) {
      errs.username = 'Callsign / username is required.';
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(trimmedUser)) {
      errs.username = 'Username must be 3-20 alphanumeric characters or underscores.';
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errs.email = 'Please provide a valid email address.';
    }

    if (!password) {
      errs.password = 'Secret passphrase is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await register(username.trim(), email.trim(), password);
      const state = useUserStore.getState();
      if (state.isAuthenticated && state.token) {
        navigate(redirectTarget);
      } else {
        setError('Registration was unsuccessful. Please check your inputs or try another callsign.');
      }
    } catch (err) {
      setError(err?.message || 'Registration failed. Callsign or email may already be registered.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuest = async () => {
    setIsSubmitting(true);
    try {
      await loginGuest();
      navigate('/levels');
    } catch (e) {
      navigate('/levels');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white pt-20 pb-16 px-4 flex items-center justify-center select-none">
      <div className="w-full max-w-md clay-card p-6 md:p-8 border border-slate-700/60 shadow-2xl relative">
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg ring-4 ring-amber-400/20">
            🌟
          </div>
          <h1 className="text-2xl font-display font-black text-white text-shadow-arcade">
            Pilot Registration
          </h1>
          <p className="text-xs text-slate-400 font-sans font-semibold mt-1">
            Enlist your callsign in <span className="text-amber-400 font-bold">{GAME_NAME}</span> to sync progress.
          </p>
        </div>

        {error && (
          <div className="clay-card bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs font-bold p-3.5 rounded-2xl mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3.5" noValidate>
          <div>
            <label
              htmlFor="register-username"
              className="text-xs font-display font-black text-slate-300 block mb-1 uppercase tracking-wider"
            >
              Pilot Callsign / Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                id="register-username"
                name="username"
                type="text"
                required
                aria-invalid={Boolean(fieldErrors.username)}
                aria-describedby={fieldErrors.username ? 'reg-user-error' : undefined}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (fieldErrors.username) setFieldErrors((prev) => ({ ...prev, username: '' }));
                }}
                placeholder="Choose callsign (e.g. AstroAce)"
                className={`w-full bg-slate-950/80 border rounded-xl pl-10 pr-3 py-2.5 text-[16px] text-white placeholder-slate-500 font-sans font-semibold focus:outline-none min-h-[48px] transition-all ${
                  fieldErrors.username ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700/80 focus:border-amber-400'
                }`}
              />
            </div>
            {fieldErrors.username && (
              <p id="reg-user-error" className="text-xs text-rose-400 font-semibold mt-1">
                {fieldErrors.username}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="register-email"
              className="text-xs font-display font-black text-slate-300 block mb-1 uppercase tracking-wider"
            >
              Communications Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                id="register-email"
                name="email"
                type="email"
                required
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'reg-email-error' : undefined}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }));
                }}
                placeholder="pilot@starfleet.space"
                className={`w-full bg-slate-950/80 border rounded-xl pl-10 pr-3 py-2.5 text-[16px] text-white placeholder-slate-500 font-sans font-semibold focus:outline-none min-h-[48px] transition-all ${
                  fieldErrors.email ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700/80 focus:border-amber-400'
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p id="reg-email-error" className="text-xs text-rose-400 font-semibold mt-1">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="register-password"
              className="text-xs font-display font-black text-slate-300 block mb-1 uppercase tracking-wider"
            >
              Secret Passphrase
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                id="register-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'reg-pass-error' : undefined}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
                }}
                placeholder="Minimum 6 characters"
                className={`w-full bg-slate-950/80 border rounded-xl pl-10 pr-11 py-2.5 text-[16px] text-white placeholder-slate-500 font-sans font-semibold focus:outline-none min-h-[48px] transition-all ${
                  fieldErrors.password ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700/80 focus:border-amber-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-white transition-colors focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p id="reg-pass-error" className="text-xs text-rose-400 font-semibold mt-1">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="register-confirm-password"
              className="text-xs font-display font-black text-slate-300 block mb-1 uppercase tracking-wider"
            >
              Confirm Passphrase
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                id="register-confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                aria-invalid={Boolean(fieldErrors.confirmPassword)}
                aria-describedby={fieldErrors.confirmPassword ? 'reg-confirm-error' : undefined}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
                }}
                placeholder="Repeat password"
                className={`w-full bg-slate-950/80 border rounded-xl pl-10 pr-11 py-2.5 text-[16px] text-white placeholder-slate-500 font-sans font-semibold focus:outline-none min-h-[48px] transition-all ${
                  fieldErrors.confirmPassword ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700/80 focus:border-amber-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-white transition-colors focus:outline-none"
                aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p id="reg-confirm-error" className="text-xs text-rose-400 font-semibold mt-1">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-arcade-gold py-3.5 mt-2 rounded-2xl text-xs font-display font-black flex items-center justify-center gap-2 min-h-[50px] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>ENLISTING PILOT...</span>
              </>
            ) : (
              <>
                <span>REGISTER PILOT LICENSE</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[11px] text-slate-400 font-sans mt-3.5 leading-relaxed">
          By enlisting, you agree to the{' '}
          <Link to="/terms-and-conditions" className="text-amber-400 font-bold hover:underline">
            Terms of Service
          </Link>{' '}
          and acknowledge our{' '}
          <Link to="/privacy-policy" className="text-amber-400 font-bold hover:underline">
            Privacy Policy
          </Link>.
        </p>

        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-[10px] uppercase font-display font-black text-slate-500 tracking-wider">or play immediately</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        <button
          type="button"
          onClick={handleGuest}
          disabled={isSubmitting}
          className="w-full btn-arcade-slate py-3 rounded-2xl text-xs font-display font-black flex items-center justify-center gap-2 min-h-[48px]"
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>PLAY AS GUEST / OFFLINE</span>
        </button>

        <p className="text-center text-xs text-slate-400 font-sans font-semibold mt-5">
          Already registered?{' '}
          <Link to="/login" className="text-amber-400 font-bold hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
