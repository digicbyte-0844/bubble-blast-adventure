/**
 * Bloopi the Starlight Jelly Hero — Original SVG Mascot
 * Features reactive animation states, facial expressions, and dynamic speech bubble
 * Bubble Puzzle Engine Presentation Tier
 */

import React, { useMemo } from 'react';

export const CharacterMascot = ({
  emotion = 'idle',
  size = 'md',
  speech = null,
  className = ''
}) => {
  // Dimensions map
  const sizeMap = {
    sm: { width: 50, height: 50, box: 'w-12 h-12' },
    md: { width: 80, height: 80, box: 'w-20 h-20' },
    lg: { width: 120, height: 120, box: 'w-28 h-28' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Emotion-driven speech tip fallback
  const speechText = useMemo(() => {
    if (speech) return speech;
    switch (emotion) {
      case 'aiming':
        return 'Line up the reflection bank-shot!';
      case 'cheering':
      case 'celebrate':
        return 'Cosmic Blast! Spectacular combo!';
      case 'worried':
      case 'sad':
        return 'Watch your ammo! Aim for ceiling drops!';
      case 'hint':
        return 'Target that cluster for maximum pops!';
      default:
        return 'Tap launcher to swap colors!';
    }
  }, [emotion, speech]);

  return (
    <div className={`relative flex items-center gap-2 select-none ${className}`}>
      {/* Dynamic Speech Bubble */}
      {speechText && (
        <div className="hidden sm:flex items-center px-3 py-1.5 rounded-2xl bg-cosmic-card/90 border border-cosmic-cyan/40 shadow-lg text-[11px] font-bold text-slate-200 backdrop-blur-md animate-fade-in max-w-[170px]">
          <span>{speechText}</span>
        </div>
      )}

      {/* Bloopi SVG Container */}
      <div
        className={`relative flex items-center justify-center ${currentSize.box} filter drop-shadow-[0_8px_16px_rgba(0,240,255,0.35)]`}
      >
        <svg
          viewBox="0 0 100 100"
          width={currentSize.width}
          height={currentSize.height}
          className={`transition-transform duration-300 ${
            emotion === 'cheering' || emotion === 'celebrate'
              ? 'animate-bounce'
              : emotion === 'worried' || emotion === 'sad'
              ? 'translate-y-1'
              : 'animate-pulse'
          }`}
        >
          <defs>
            {/* Bioluminescent Starlight Jelly Gradient */}
            <radialGradient id="bloopiBody" cx="45%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#80F8FF" />
              <stop offset="45%" stopColor="#00E5FF" />
              <stop offset="85%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0369A1" />
            </radialGradient>

            {/* Glowing Celestial Crown Aura */}
            <linearGradient id="bloopiAura" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EC4899" />
              <stop offset="50%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>

            {/* Specular Highlight Gradient */}
            <linearGradient id="specularGlint" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Bioluminescent Outer Glow */}
          <circle cx="50" cy="50" r="44" fill="url(#bloopiAura)" opacity="0.25" />

          {/* Jelly Body Main Dome */}
          <path
            d="M 22 56 C 20 30, 32 16, 50 16 C 68 16, 80 30, 78 56 C 78 72, 70 82, 63 80 C 56 78, 54 84, 50 84 C 46 84, 44 78, 37 80 C 30 82, 22 72, 22 56 Z"
            fill="url(#bloopiBody)"
            stroke="#00F0FF"
            strokeWidth="2.5"
          />

          {/* Specular Dome Highlight */}
          <ellipse cx="44" cy="28" rx="14" ry="7" fill="url(#specularGlint)" transform="rotate(-15, 44, 28)" />

          {/* Cute Celestial Antenna with Pulsing Pearl */}
          <path d="M 50 16 Q 50 8, 54 6" stroke="#00F0FF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle
            cx="55"
            cy="6"
            r="4.5"
            fill={emotion === 'cheering' ? '#FACC15' : '#FF007F'}
            stroke="#FFFFFF"
            strokeWidth="1.5"
            className="animate-ping"
            style={{ animationDuration: '2s' }}
          />
          <circle
            cx="55"
            cy="6"
            r="4"
            fill={emotion === 'cheering' ? '#FACC15' : '#FF007F'}
            stroke="#FFFFFF"
            strokeWidth="1.2"
          />

          {/* EYES & EXPRESSIONS */}
          {emotion === 'cheering' || emotion === 'celebrate' ? (
            /* Starry Happy Cheering Eyes */
            <g fill="#FDE047">
              <path d="M 36 42 L 38 46 L 42 46 L 39 49 L 40 53 L 36 50 L 32 53 L 33 49 L 30 46 L 34 46 Z" />
              <path d="M 64 42 L 66 46 L 70 46 L 67 49 L 68 53 L 64 50 L 60 53 L 61 49 L 58 46 L 62 46 Z" />
            </g>
          ) : emotion === 'worried' || emotion === 'sad' ? (
            /* Worried / Sad Droopy Eyes */
            <g>
              <ellipse cx="37" cy="46" rx="5" ry="6" fill="#0F172A" />
              <ellipse cx="63" cy="46" rx="5" ry="6" fill="#0F172A" />
              <circle cx="36" cy="44" r="2" fill="#FFFFFF" />
              <circle cx="62" cy="44" r="2" fill="#FFFFFF" />
              {/* Cute Tear */}
              <circle cx="68" cy="54" r="2.5" fill="#38BDF8" />
            </g>
          ) : emotion === 'aiming' ? (
            /* Focused Aiming Eyes (Glancing Upward) */
            <g>
              <ellipse cx="37" cy="43" rx="5" ry="6" fill="#0F172A" />
              <ellipse cx="63" cy="43" rx="5" ry="6" fill="#0F172A" />
              <circle cx="37" cy="40" r="2.5" fill="#00F0FF" />
              <circle cx="63" cy="40" r="2.5" fill="#00F0FF" />
              <circle cx="38" cy="39" r="1" fill="#FFFFFF" />
              <circle cx="64" cy="39" r="1" fill="#FFFFFF" />
            </g>
          ) : (
            /* Standard Adorable Idle Eyes */
            <g>
              <ellipse cx="37" cy="45" rx="5.5" ry="7" fill="#0F172A" />
              <ellipse cx="63" cy="45" rx="5.5" ry="7" fill="#0F172A" />
              <circle cx="35" cy="42" r="2.5" fill="#FFFFFF" />
              <circle cx="61" cy="42" r="2.5" fill="#FFFFFF" />
              <circle cx="38" cy="47" r="1.2" fill="#38BDF8" />
              <circle cx="64" cy="47" r="1.2" fill="#38BDF8" />
            </g>
          )}

          {/* Rosy Cosmic Cheeks */}
          <circle cx="28" cy="52" r="4.5" fill="#FF00A0" opacity="0.45" />
          <circle cx="72" cy="52" r="4.5" fill="#FF00A0" opacity="0.45" />

          {/* MOUTH */}
          {emotion === 'cheering' || emotion === 'celebrate' ? (
            /* Big Joyous Open Smile */
            <path d="M 42 53 Q 50 63, 58 53 Z" fill="#FF007F" stroke="#0F172A" strokeWidth="1.5" />
          ) : emotion === 'worried' || emotion === 'sad' ? (
            /* Sad Downward Curve */
            <path d="M 44 58 Q 50 53, 56 58" stroke="#0F172A" strokeWidth="2" fill="none" strokeLinecap="round" />
          ) : emotion === 'aiming' ? (
            /* Focused Small Mouth */
            <ellipse cx="50" cy="54" rx="2.5" ry="2" fill="#0F172A" />
          ) : (
            /* Cute Happy Smile */
            <path d="M 44 52 Q 50 59, 56 52" stroke="#0F172A" strokeWidth="2" fill="none" strokeLinecap="round" />
          )}

          {/* Translucent Floating Tentacles */}
          <path d="M 28 72 Q 26 86, 32 88" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
          <path d="M 40 76 Q 42 90, 44 91" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
          <path d="M 58 76 Q 56 90, 58 91" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
          <path d="M 70 72 Q 74 86, 68 88" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
        </svg>
      </div>
    </div>
  );
};

export default CharacterMascot;
