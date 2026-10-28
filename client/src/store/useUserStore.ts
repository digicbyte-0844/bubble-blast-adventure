import { create } from 'zustand';
import ApiService from '../services/api';

interface ProgressRecord {
  levelId: number;
  stars: number;
  highScore: number;
  isUnlocked: boolean;
}

interface UserState {
  user: any | null;
  token: string | null;
  coins: number;
  energy: number;
  progress: ProgressRecord[];
  boosters: Record<string, number>;
  isAuthenticated: boolean;
  loginGuest: () => Promise<void>;
  login: (username: string, pass?: string) => Promise<void>;
  register: (username: string, email: string, pass?: string) => Promise<void>;
  logout: () => void;
  loadProgress: () => Promise<void>;
  updateLevelSuccess: (levelId: number, score: number, stars: number) => void;
  consumeBooster: (boosterType: string) => boolean;
}

export const useUserStore = create<UserState>((set, get) => {
  const token = localStorage.getItem('bba_token');
  const savedProgressRaw = localStorage.getItem('bba_player_progress');
  const defaultProgress: ProgressRecord[] = savedProgressRaw
    ? JSON.parse(savedProgressRaw)
    : [{ levelId: 1, stars: 0, highScore: 0, isUnlocked: true }];

  return {
    user: null,
    token,
    coins: 500,
    energy: 5,
    progress: defaultProgress,
    boosters: {
      SUPER_AIM: 3,
      BOMB: 3,
      RAINBOW: 2,
      EXTRA_SHOTS: 4,
      SHUFFLE: 3
    },
    isAuthenticated: !!token,

    loginGuest: async () => {
      try {
        const res = await ApiService.guestLogin();
        if (res.success) {
          localStorage.setItem('bba_token', res.data.token);
          set({
            user: res.data.user,
            token: res.data.token,
            isAuthenticated: true,
            coins: res.data.user.coins || 500
          });
        }
      } catch (err) {
        // Fallback offline guest
        const guestUser = { id: 'offline_guest', username: 'StarlightExplorer', isGuest: true };
        set({ user: guestUser, isAuthenticated: true });
      }
    },

    login: async (username: string, pass?: string) => {
      const res = await ApiService.login(username, pass);
      if (res.success) {
        localStorage.setItem('bba_token', res.data.token);
        set({
          user: res.data.user,
          token: res.data.token,
          isAuthenticated: true,
          coins: res.data.user.coins || 500
        });
      }
    },

    register: async (username: string, email: string, pass?: string) => {
      const res = await ApiService.register(username, email, pass);
      if (res.success) {
        localStorage.setItem('bba_token', res.data.token);
        set({
          user: res.data.user,
          token: res.data.token,
          isAuthenticated: true,
          coins: res.data.user.coins || 500
        });
      }
    },

    logout: () => {
      localStorage.removeItem('bba_token');
      set({ user: null, token: null, isAuthenticated: false });
    },

    loadProgress: async () => {
      try {
        const res = await ApiService.getProgress();
        if (res.success && res.data.progress) {
          set({ progress: res.data.progress, coins: res.data.coins, energy: res.data.energy });
          localStorage.setItem('bba_player_progress', JSON.stringify(res.data.progress));
        }
      } catch (e) {
        // Use local storage
      }
    },

    updateLevelSuccess: (levelId: number, score: number, stars: number) => {
      const current = [...get().progress];
      const idx = current.findIndex((p) => p.levelId === levelId);
      if (idx >= 0) {
        if (score > current[idx].highScore) current[idx].highScore = score;
        if (stars > current[idx].stars) current[idx].stars = stars;
      } else {
        current.push({ levelId, stars, highScore: score, isUnlocked: true });
      }

      // Unlock next level
      const nextId = levelId + 1;
      if (!current.some((p) => p.levelId === nextId) && nextId <= 40) {
        current.push({ levelId: nextId, stars: 0, highScore: 0, isUnlocked: true });
      }

      localStorage.setItem('bba_player_progress', JSON.stringify(current));
      set({ progress: current, coins: get().coins + 100 });
    },

    consumeBooster: (boosterType: string) => {
      const b = { ...get().boosters };
      if ((b[boosterType] || 0) > 0) {
        b[boosterType] -= 1;
        set({ boosters: b });
        return true;
      }
      return false;
    }
  };
});

export default useUserStore;
