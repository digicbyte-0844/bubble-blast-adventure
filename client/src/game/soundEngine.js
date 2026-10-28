/**
 * Procedural Web Audio API Sound Synthesizer & Music Engine
 * 100% Zero External Audio Assets (No MP3/WAV dependencies)
 * Bubble Puzzle Engine Engine
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.sfxVolume = 0.8;
    this.musicVolume = 0.35;

    // Load persisted mute toggles from localStorage
    this.sfxMuted = typeof window !== 'undefined' && localStorage.getItem('bba_sfx_muted') === 'true';
    this.musicMuted = typeof window !== 'undefined' && localStorage.getItem('bba_music_muted') === 'true';

    this.bgmTimer = null;
    this.isMusicPlaying = false;
    this.bgmStep = 0;
  }

  /**
   * Initializes or resumes the Web Audio context on user gesture
   */
  getContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // --- 16 MANDATORY PROCEDURAL SOUND EFFECTS ---

  // 1. UI Button Click
  playClick() {
    if (this.sfxMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(this.sfxVolume * 0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  }

  // 2. Trajectory Aiming Tick
  playAim() {
    if (this.sfxMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.02);

    gain.gain.setValueAtTime(this.sfxVolume * 0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.02);
  }

  // 3. Projectile Launch Shot
  playLaunch() {
    if (this.sfxMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.14);

    gain.gain.setValueAtTime(this.sfxVolume * 0.7, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.14);
  }

  // 4. Wall Ricochet Bounce
  playBounce() {
    if (this.sfxMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(240, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(this.sfxVolume * 0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }

  // 5. Single Bubble Pop (With chromatic combo pitch escalation)
  playPop(combo = 0) {
    if (this.sfxMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const baseFreq = 440; // A4
    const semitones = Math.min(combo * 2, 14);
    const pitch = baseFreq * Math.pow(1.059463, semitones);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(this.sfxVolume * 0.85, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  }

  // 6. Multi-Bubble Cluster Pop Cascade
  playMultiPop(count = 3) {
    if (this.sfxMuted) return;
    const pops = Math.min(count, 8);
    for (let i = 0; i < pops; i++) {
      setTimeout(() => {
        this.playPop(i);
      }, i * 35);
    }
  }

  // 7. Floating Bubble Gravity Fall
  playFloatingFall() {
    if (this.sfxMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.28);

    gain.gain.setValueAtTime(this.sfxVolume * 0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.28);
  }

  // 8. Consecutive Combo Chime
  playCombo(multiplier = 2) {
    if (this.sfxMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const basePitch = 523 * (1 + (multiplier - 1) * 0.15); // C5 upwards
    [basePitch, basePitch * 1.25, basePitch * 1.5].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
      gain.gain.setValueAtTime(this.sfxVolume * 0.6, ctx.currentTime + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.06);
      osc.stop(ctx.currentTime + idx * 0.06 + 0.14);
    });
  }

  // 9. Booster Activation Energy
  playBooster() {
    if (this.sfxMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(950, ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(this.sfxVolume * 0.55, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  }

  // 10. Cosmic Bomb Detonation
  playBomb() {
    if (this.sfxMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(25, ctx.currentTime + 0.38);

    gain.gain.setValueAtTime(this.sfxVolume * 1.0, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.38);
  }

  // 11. Rainbow Prism Arpeggio
  playRainbow() {
    if (this.sfxMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    [440, 554, 659, 880, 1108].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
      gain.gain.setValueAtTime(this.sfxVolume * 0.6, ctx.currentTime + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.05);
      osc.stop(ctx.currentTime + idx * 0.05 + 0.12);
    });
  }

  // 12. Starlight Mini-Jelly Rescue Jingle
  playRescue() {
    if (this.sfxMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    [523, 659, 784, 1046, 1318].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.06);
      gain.gain.setValueAtTime(this.sfxVolume * 0.75, ctx.currentTime + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.06);
      osc.stop(ctx.currentTime + i * 0.06 + 0.18);
    });
  }

  // 13. Star Unlocked Chime
  playStar() {
    if (this.sfxMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1318, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(this.sfxVolume * 0.7, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }

  // 14. Level Win Fanfare
  playLevelWin() {
    if (this.sfxMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [440, 554, 659, 880, 1108];
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.12);
      gain.gain.setValueAtTime(this.sfxVolume * 0.8, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.35);
    });
  }

  // 15. Level Fail Thud
  playLevelFail() {
    if (this.sfxMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(75, ctx.currentTime + 0.45);

    gain.gain.setValueAtTime(this.sfxVolume * 0.75, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  }

  // 16. New High Score Fanfare
  playHighScore() {
    if (this.sfxMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    [440, 660, 880, 1100, 1320].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.08);
      gain.gain.setValueAtTime(this.sfxVolume * 0.7, ctx.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.25);
    });
  }

  // 17. Bubble Grid Snap
  playSnap() {
    if (this.sfxMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.045);

      gain.gain.setValueAtTime(this.sfxVolume * 0.45, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.045);
    } catch {
      // Audio node failure fallback
    }
  }

  // Aliases for gameplay compatibility
  playBombExplode() {
    return this.playBomb();
  }

  playDrop() {
    return this.playFloatingFall();
  }

  /**
   * Generic unified dispatcher by sound ID
   */
  play(soundName, ...args) {
    switch (soundName) {
      case 'click': return this.playClick();
      case 'aim': return this.playAim();
      case 'launch': return this.playLaunch();
      case 'bounce': return this.playBounce();
      case 'snap': return this.playSnap();
      case 'pop': return this.playPop(args[0]);
      case 'multiPop': return this.playMultiPop(args[0]);
      case 'floatingFall':
      case 'drop': return this.playDrop();
      case 'combo': return this.playCombo(args[0]);
      case 'booster': return this.playBooster();
      case 'bomb':
      case 'bombExplode': return this.playBombExplode();
      case 'rainbow': return this.playRainbow();
      case 'rescue': return this.playRescue();
      case 'star': return this.playStar();
      case 'levelWin': return this.playLevelWin();
      case 'levelFail': return this.playLevelFail();
      case 'highScore': return this.playHighScore();
      default: return this.playClick();
    }
  }

  // --- 8-BAR PROCEDURAL LOOPING BACKGROUND MELODY ---

  startMusic() {
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    const ctx = this.getContext();
    if (!ctx) return;

    // 8-Bar Cosmic Progression (Pentatonic Lead + Bassline)
    const melody = [
      440, 523, 659, 523, 440, 392, 440, 0,
      523, 659, 784, 659, 523, 440, 523, 0,
      659, 784, 880, 784, 659, 523, 659, 0,
      440, 392, 349, 392, 440, 523, 440, 0
    ];

    const bass = [
      220, 220, 261, 261, 196, 196, 220, 220,
      261, 261, 329, 329, 220, 220, 261, 261,
      329, 329, 392, 392, 261, 261, 329, 329,
      220, 220, 174, 174, 196, 196, 220, 220
    ];

    const noteDuration = 220; // ms per step

    this.bgmTimer = setInterval(() => {
      if (this.musicMuted || !this.isMusicPlaying) return;

      const leadNote = melody[this.bgmStep % melody.length];
      const bassNote = bass[this.bgmStep % bass.length];

      if (leadNote > 0) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(leadNote, ctx.currentTime);
        gain.gain.setValueAtTime(this.musicVolume * 0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      }

      if (this.bgmStep % 2 === 0 && bassNote > 0) {
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(bassNote / 2, ctx.currentTime);
        bassGain.gain.setValueAtTime(this.musicVolume * 0.45, ctx.currentTime);
        bassGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        bassOsc.connect(bassGain);
        bassGain.connect(ctx.destination);
        bassOsc.start();
        bassOsc.stop(ctx.currentTime + 0.35);
      }

      this.bgmStep++;
    }, noteDuration);
  }

  stopMusic() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    this.isMusicPlaying = false;
  }

  // --- PERSISTENCE & MUTE CONTROLS ---

  toggleSfx() {
    this.sfxMuted = !this.sfxMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('bba_sfx_muted', String(this.sfxMuted));
    }
    return this.sfxMuted;
  }

  toggleMusic() {
    this.musicMuted = !this.musicMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('bba_music_muted', String(this.musicMuted));
    }
    if (this.musicMuted) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return this.musicMuted;
  }

  setSfxMuted(muted) {
    this.sfxMuted = Boolean(muted);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bba_sfx_muted', String(this.sfxMuted));
    }
  }

  setMusicMuted(muted) {
    this.musicMuted = Boolean(muted);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bba_music_muted', String(this.musicMuted));
    }
    if (this.musicMuted) {
      this.stopMusic();
    }
  }

  isSfxMuted() {
    return this.sfxMuted;
  }

  isMusicMuted() {
    return this.musicMuted;
  }
}

// Global Singleton Instance wrapped in Safe Proxy to guarantee zero uncaught audio exceptions
const rawSoundEngine = new SoundEngine();

export const soundEngine = new Proxy(rawSoundEngine, {
  get(target, prop, receiver) {
    if (prop in target) {
      const val = Reflect.get(target, prop, receiver);
      return typeof val === 'function' ? val.bind(target) : val;
    }
    // Safe fallback for any undefined method call (e.g. playSomething)
    if (typeof prop === 'string' && prop.startsWith('play')) {
      return (...args) => {
        const soundKey = prop.slice(4).replace(/^./, (c) => c.toLowerCase());
        if (typeof target[prop] === 'function') {
          return target[prop](...args);
        }
        if (typeof target.play === 'function') {
          return target.play(soundKey, ...args);
        }
      };
    }
    return undefined;
  }
});

export default soundEngine;
