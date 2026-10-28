// Built-in Web Audio API Procedural Synthesizer
// 16 Procedural Sound Effects & Interactive 8-Bar Chiptune BGM
// Zero external MP3/WAV dependencies

export class AudioSynthesizer {
  private static instance: AudioSynthesizer;
  private ctx: AudioContext | null = null;
  public sfxVolume: number = 0.8;
  public musicVolume: number = 0.35;
  public sfxMuted: boolean = false;
  public musicMuted: boolean = false;

  private bgmInterval: any = null;
  private isBgmPlaying: boolean = false;
  private bgmStep: number = 0;

  private constructor() {
    // Lazy initialize on first user gesture
  }

  public static getInstance(): AudioSynthesizer {
    if (!this.instance) {
      this.instance = new AudioSynthesizer();
    }
    return this.instance;
  }

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // --- 16 PROCEDURAL SFX GENERATORS ---

  // 1. Shoot Launcher Bubble
  public playShoot(): void {
    if (this.sfxMuted) return;
    const ctx = this.initContext();
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

  // 2. Wall Ricochet Bounce
  public playBounce(): void {
    if (this.sfxMuted) return;
    const ctx = this.initContext();
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

  // 3. Hex Lattice Snap
  public playSnap(): void {
    if (this.sfxMuted) return;
    const ctx = this.initContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(280, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(this.sfxVolume * 0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  }

  // 4. Match-3 Pop with Chromatic Combo Pitch Escalation (Combo 1 to 8+)
  public playPop(combo: number = 0): void {
    if (this.sfxMuted) return;
    const ctx = this.initContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const baseFreq = 440; // A4
    const semitones = Math.min(combo * 2, 14);
    const pitch = baseFreq * Math.pow(1.059463, semitones);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(this.sfxVolume * 0.9, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  }

  // 5. Floating Bubble Drop
  public playDrop(): void {
    if (this.sfxMuted) return;
    const ctx = this.initContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(this.sfxVolume * 0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  }

  // 6. Bomb Detonation (Noise + Sub-bass rumble)
  public playBomb(): void {
    if (this.sfxMuted) return;
    const ctx = this.initContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(this.sfxVolume * 1.0, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  }

  // 7. Rainbow Swirl
  public playRainbow(): void {
    if (this.sfxMuted) return;
    const ctx = this.initContext();
    [400, 500, 600, 750].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
      gain.gain.setValueAtTime(this.sfxVolume * 0.5, ctx.currentTime + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.05);
      osc.stop(ctx.currentTime + idx * 0.05 + 0.1);
    });
  }

  // 8. Starlight Jelly Rescue Jingle
  public playJellyRescue(): void {
    if (this.sfxMuted) return;
    const ctx = this.initContext();
    [523, 659, 784, 1046].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.07);
      gain.gain.setValueAtTime(this.sfxVolume * 0.7, ctx.currentTime + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.07 + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.07);
      osc.stop(ctx.currentTime + i * 0.07 + 0.15);
    });
  }

  // 9. Extra Shots Chime
  public playExtraShots(): void {
    if (this.sfxMuted) return;
    const ctx = this.initContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(this.sfxVolume * 0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }

  // 10. Grid Shuffle Whoosh
  public playShuffle(): void {
    if (this.sfxMuted) return;
    const ctx = this.initContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(500, ctx.currentTime + 0.15);
    osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(this.sfxVolume * 0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }

  // 11. Victory Fanfare
  public playVictory(): void {
    if (this.sfxMuted) return;
    const ctx = this.initContext();
    const notes = [440, 554, 659, 880];
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.12);
      gain.gain.setValueAtTime(this.sfxVolume * 0.8, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.3);
    });
  }

  // 12. Defeat Thud
  public playDefeat(): void {
    if (this.sfxMuted) return;
    const ctx = this.initContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(this.sfxVolume * 0.7, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  }

  // 13. UI Button Click
  public playClick(): void {
    if (this.sfxMuted) return;
    const ctx = this.initContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(this.sfxVolume * 0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  }

  // 14. Bubble Swap
  public playSwap(): void {
    if (this.sfxMuted) return;
    const ctx = this.initContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(this.sfxVolume * 0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }

  // 15. Star Earned
  public playStar(): void {
    if (this.sfxMuted) return;
    const ctx = this.initContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1318, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(this.sfxVolume * 0.7, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  }

  // 16. Badge Unlock
  public playBadge(): void {
    if (this.sfxMuted) return;
    const ctx = this.initContext();
    [440, 660, 880, 1100].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.08);
      gain.gain.setValueAtTime(this.sfxVolume * 0.6, ctx.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.2);
    });
  }

  // --- INTERACTIVE 8-BAR CHIPTUNE BGM ---
  public startBGM(): void {
    if (this.isBgmPlaying) return;
    this.isBgmPlaying = true;
    const ctx = this.initContext();

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

    const noteDuration = 220; // ms per 16th note

    this.bgmInterval = setInterval(() => {
      if (this.musicMuted || !this.isBgmPlaying) return;

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

  public stopBGM(): void {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    this.isBgmPlaying = false;
  }
}

export default AudioSynthesizer;
