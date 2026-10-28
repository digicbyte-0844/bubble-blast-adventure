import { create } from 'zustand';
import AudioSynthesizer from '../engine/AudioSynthesizer';
import soundEngine from '../game/soundEngine.js';

interface AudioState {
  sfxVolume: number;
  musicVolume: number;
  sfxMuted: boolean;
  musicMuted: boolean;
  setSfxVolume: (vol: number) => void;
  setMusicVolume: (vol: number) => void;
  toggleSfx: () => void;
  toggleMusic: () => void;
}

const synth = AudioSynthesizer.getInstance();

export const useAudioStore = create<AudioState>((set, get) => {
  const savedSfxVol = Number(localStorage.getItem('bba_sfx_vol') || '0.8');
  const savedMusicVol = Number(localStorage.getItem('bba_music_vol') || '0.35');
  const savedSfxMute = (localStorage.getItem('bba_sfx_muted') || localStorage.getItem('bba_sfx_mute')) === 'true';
  const savedMusicMute = (localStorage.getItem('bba_music_muted') || localStorage.getItem('bba_music_mute')) === 'true';

  synth.sfxVolume = savedSfxVol;
  synth.musicVolume = savedMusicVol;
  synth.sfxMuted = savedSfxMute;
  synth.musicMuted = savedMusicMute;

  soundEngine.sfxVolume = savedSfxVol;
  soundEngine.musicVolume = savedMusicVol;
  soundEngine.setSfxMuted(savedSfxMute);
  soundEngine.setMusicMuted(savedMusicMute);

  return {
    sfxVolume: savedSfxVol,
    musicVolume: savedMusicVol,
    sfxMuted: savedSfxMute,
    musicMuted: savedMusicMute,

    setSfxVolume: (vol: number) => {
      synth.sfxVolume = vol;
      soundEngine.sfxVolume = vol;
      localStorage.setItem('bba_sfx_vol', String(vol));
      set({ sfxVolume: vol });
    },

    setMusicVolume: (vol: number) => {
      synth.musicVolume = vol;
      soundEngine.musicVolume = vol;
      localStorage.setItem('bba_music_vol', String(vol));
      set({ musicVolume: vol });
    },

    toggleSfx: () => {
      const next = !get().sfxMuted;
      synth.sfxMuted = next;
      soundEngine.setSfxMuted(next);
      localStorage.setItem('bba_sfx_mute', String(next));
      localStorage.setItem('bba_sfx_muted', String(next));
      set({ sfxMuted: next });
    },

    toggleMusic: () => {
      const next = !get().musicMuted;
      synth.musicMuted = next;
      soundEngine.setMusicMuted(next);
      localStorage.setItem('bba_music_mute', String(next));
      localStorage.setItem('bba_music_muted', String(next));
      if (next) {
        synth.stopBGM();
        soundEngine.stopMusic();
      } else {
        synth.startBGM();
        soundEngine.startMusic();
      }
      set({ musicMuted: next });
    }
  };
});

export default useAudioStore;
