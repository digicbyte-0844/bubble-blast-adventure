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
  const token = typeof window !== 'undefined' ? localStorage.getItem('bba_token') : null;
  const savedUserRaw = typeof window !== 'undefined' ? localStorage.getItem('bba_user') : null;
  let initialUser = null;
  try {
    if (savedUserRaw) initialUser = JSON.parse(savedUserRaw);
  } catch (e) {}

  const savedProgressRaw = typeof window !== 'undefined' ? localStorage.getItem('bba_player_progress') : null;
  const defaultProgress: ProgressRecord[] = savedProgressRaw
    ? JSON.parse(savedProgressRaw)
    : [{ levelId: 1, stars: 0, highScore: 0, isUnlocked: true }];

  return {
    user: initialUser,
    token,
    coins: initialUser?.coins ?? 500,
    energy: initialUser?.energy ?? 5,
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
          const userObj = res.user || res.data?.user;
          const tokenStr = res.token || res.data?.token;
          if (tokenStr) localStorage.setItem('bba_token', tokenStr);
          if (userObj) localStorage.setItem('bba_user', JSON.stringify(userObj));
          set({
            user: userObj,
            token: tokenStr,
            isAuthenticated: true,
            coins: userObj?.coins || 500
          });
        }
      } catch (err) {
        // Fallback offline guest
        const guestUser = { id: 'offline_guest', username: 'StarlightExplorer', isGuest: true, role: 'user' };
        set({ user: guestUser, isAuthenticated: true });
      }
    },

    login: async (username: string, pass?: string) => {
      const res = await ApiService.login(username, pass);
      if (res.success) {
        const userObj = res.user || res.data?.user;
        const tokenStr = res.token || res.data?.token;
        if (tokenStr) localStorage.setItem('bba_token', tokenStr);
        if (userObj) localStorage.setItem('bba_user', JSON.stringify(userObj));
        set({
          user: userObj,
          token: tokenStr,
          isAuthenticated: true,
          coins: userObj?.coins || 500
        });
      }
    },

    register: async (username: string, email: string, pass?: string) => {
      const res = await ApiService.register(username, email, pass);
      if (res.success) {
        const userObj = res.user || res.data?.user;
        const tokenStr = res.token || res.data?.token;
        if (tokenStr) localStorage.setItem('bba_token', tokenStr);
        if (userObj) localStorage.setItem('bba_user', JSON.stringify(userObj));
        set({
          user: userObj,
          token: tokenStr,
          isAuthenticated: true,
          coins: userObj?.coins || 500
        });
      }
    },

    logout: () => {
      localStorage.removeItem('bba_token');
      localStorage.removeItem('bba_user');
      set({ user: null, token: null, isAuthenticated: false });
    },

    loadProgress: async () => {
      try {
        const token = localStorage.getItem('bba_token');
        if (token && !get().user) {
          const profileRes = await ApiService.getProfile();
          if (profileRes.success && (profileRes.data || profileRes.user)) {
            const u = profileRes.data || profileRes.user;
            localStorage.setItem('bba_user', JSON.stringify(u));
            set({
              user: u,
              isAuthenticated: true,
              coins: u.coins ?? 500,
              energy: u.energy ?? 5
            });
          }
        }

        if (token) {
          const res = await ApiService.getProgress();
          if (res.success && res.data?.progress) {
            set({
              progress: res.data.progress,
              coins: res.data.coins ?? get().coins,
              energy: res.data.energy ?? get().energy
            });
            localStorage.setItem('bba_player_progress', JSON.stringify(res.data.progress));
          }
        } else {
          const saved = localStorage.getItem('bba_player_progress');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              set({ progress: parsed });
            } catch (e) {}
          }
        }
      } catch (e) {
        // Fallback to local storage
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

// DevSecOps 401 Unauthorized Session Revocation Listener
if (typeof window !== 'undefined') {
  window.addEventListener('bba_unauthorized', () => {
    console.warn('🔒 401 Unauthorized received — clearing session and resetting state.');
    useUserStore.getState().logout();
  });
}

export default useUserStore;
