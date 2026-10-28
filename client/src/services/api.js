/**
 * Unified API Client with Offline Resilience & DevSecOps 401 Interceptors
 * Bubble Puzzle Engine Network Tier
 */

import { API_URL } from '../config/gameConfig.js';

const handleUnauthorized = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('bba_token');
    localStorage.removeItem('bba_user');
    window.dispatchEvent(new CustomEvent('bba_unauthorized'));
  }
};

const getAuthHeaders = (extraHeaders = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('bba_token') : null;
  const headers = { 'Content-Type': 'application/json', ...extraHeaders };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

// Queue game completion payload to localStorage when offline
export const queueOfflineCompletion = (payload) => {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('bba_offline_progress_queue') || '[]';
    const queue = JSON.parse(raw);
    queue.push({ ...payload, queuedAt: Date.now() });
    localStorage.setItem('bba_offline_progress_queue', JSON.stringify(queue));
    console.log('📦 Saved game completion payload to offline queue.');
  } catch (err) {
    console.warn('Unable to queue offline completion:', err);
  }
};

// Drain offline completion queue when network connection returns
export const syncOfflineProgressQueue = async () => {
  if (typeof window === 'undefined' || !navigator.onLine) return;
  try {
    const raw = localStorage.getItem('bba_offline_progress_queue');
    if (!raw) return;
    const queue = JSON.parse(raw);
    if (!Array.isArray(queue) || queue.length === 0) return;

    console.log(`🔄 Flushing ${queue.length} offline completion(s) to server...`);
    const remaining = [];
    for (const item of queue) {
      try {
        const headers = getAuthHeaders();
        if (item.sessionToken) headers['X-Session-Token'] = item.sessionToken;
        const res = await fetch(`${API_URL}/games/complete`, {
          method: 'POST',
          headers,
          body: JSON.stringify(item)
        });
        if (res.status === 401) {
          handleUnauthorized();
          remaining.push(item);
          break;
        }
        if (!res.ok && res.status >= 500) {
          remaining.push(item);
        }
      } catch (err) {
        remaining.push(item);
      }
    }
    if (remaining.length === 0) {
      localStorage.removeItem('bba_offline_progress_queue');
      console.log('✅ All offline completions synchronized successfully.');
    } else {
      localStorage.setItem('bba_offline_progress_queue', JSON.stringify(remaining));
    }
  } catch (e) {
    console.warn('Offline sync error:', e);
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncOfflineProgressQueue();
  });
}

export const ApiService = {
  // Auth
  async login(emailOrUsername, password) {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailOrUsername, username: emailOrUsername, password })
      });
      const data = await res.json();
      if (data?.token && typeof window !== 'undefined') {
        localStorage.setItem('bba_token', data.token);
      }
      return data;
    } catch (e) {
      return { success: false, message: e.message || 'Connection refused. Running in offline mode.' };
    }
  },

  async register(name, email, password) {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username: name, email, password })
      });
      const data = await res.json();
      if (data?.token && typeof window !== 'undefined') {
        localStorage.setItem('bba_token', data.token);
      }
      return data;
    } catch (e) {
      return { success: false, message: e.message || 'Connection refused. Running in offline mode.' };
    }
  },

  async guestLogin() {
    try {
      const res = await fetch(`${API_URL}/auth/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      const token = data?.token || data?.data?.token;
      if (token && typeof window !== 'undefined') {
        localStorage.setItem('bba_token', token);
      }
      return data;
    } catch (e) {
      return {
        success: true,
        offline: true,
        token: `guest_tok_${Date.now()}`,
        user: { id: 'offline_guest', username: 'StarlightExplorer', isGuest: true, role: 'user' }
      };
    }
  },

  async getProfile() {
    try {
      const res = await fetch(`${API_URL}/user/profile`, { headers: getAuthHeaders() });
      if (res.status === 401) {
        handleUnauthorized();
        return { success: false, error: 'UNAUTHORIZED' };
      }
      return await res.json();
    } catch (e) {
      return { success: false, offline: true };
    }
  },

  async getProgress() {
    try {
      const res = await fetch(`${API_URL}/user/progress`, { headers: getAuthHeaders() });
      if (res.status === 401) {
        handleUnauthorized();
        return { success: false, error: 'UNAUTHORIZED' };
      }
      return await res.json();
    } catch (e) {
      return { success: false, offline: true };
    }
  },

  // Levels
  async getLevels() {
    try {
      const res = await fetch(`${API_URL}/levels`, { headers: getAuthHeaders() });
      if (res.status === 401) {
        handleUnauthorized();
      }
      return await res.json();
    } catch (e) {
      return { success: false, offline: true };
    }
  },

  async getLevelById(id) {
    try {
      const res = await fetch(`${API_URL}/levels/${id}`, { headers: getAuthHeaders() });
      if (res.status === 401) {
        handleUnauthorized();
      }
      return await res.json();
    } catch (e) {
      return { success: false, offline: true };
    }
  },

  // Game Sessions & Anti-Cheat
  async startGameSession(levelId, boostersEquipped = []) {
    try {
      const res = await fetch(`${API_URL}/games/start`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ levelId, boostersEquipped })
      });
      if (res.status === 401) {
        handleUnauthorized();
      }
      return await res.json();
    } catch (e) {
      return {
        sessionId: `local_session_${Date.now()}`,
        sessionToken: `tok_local_${Date.now()}`,
        levelId,
        offline: true
      };
    }
  },

  async completeGameSession(payload) {
    try {
      const headers = getAuthHeaders();
      if (payload.sessionToken) {
        headers['X-Session-Token'] = payload.sessionToken;
      }
      const res = await fetch(`${API_URL}/games/complete`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      if (res.status === 401) {
        handleUnauthorized();
        queueOfflineCompletion(payload);
        return { success: false, error: 'UNAUTHORIZED' };
      }
      return await res.json();
    } catch (e) {
      queueOfflineCompletion(payload);
      return { success: false, offline: true };
    }
  },

  // Leaderboard & Social
  async getLeaderboard(type = 'global', limit = 50) {
    try {
      const res = await fetch(`${API_URL}/leaderboard?type=${type}&limit=${limit}`, { headers: getAuthHeaders() });
      return await res.json();
    } catch (e) {
      return { success: false, offline: true };
    }
  },

  async getLeaderboardMe() {
    try {
      const res = await fetch(`${API_URL}/leaderboard/me`, { headers: getAuthHeaders() });
      if (res.status === 401) {
        handleUnauthorized();
      }
      return await res.json();
    } catch (e) {
      return { success: false, offline: true };
    }
  },

  async getAchievements() {
    try {
      const res = await fetch(`${API_URL}/achievements`, { headers: getAuthHeaders() });
      return await res.json();
    } catch (e) {
      return { success: false, offline: true };
    }
  },

  async getMyAchievements() {
    try {
      const res = await fetch(`${API_URL}/achievements/me`, { headers: getAuthHeaders() });
      if (res.status === 401) {
        handleUnauthorized();
      }
      return await res.json();
    } catch (e) {
      return { success: false, offline: true };
    }
  },

  async getDailyChallenge() {
    try {
      const res = await fetch(`${API_URL}/daily-challenge`, { headers: getAuthHeaders() });
      return await res.json();
    } catch (e) {
      return { success: false, offline: true };
    }
  },

  async completeDailyChallenge() {
    try {
      const res = await fetch(`${API_URL}/daily-challenge/complete`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.status === 401) {
        handleUnauthorized();
      }
      return await res.json();
    } catch (e) {
      return { success: false, offline: true };
    }
  },

  async saveCustomLevel(levelData) {
    try {
      const res = await fetch(`${API_URL}/editor/save`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(levelData)
      });
      if (res.status === 401) {
        handleUnauthorized();
      }
      return await res.json();
    } catch (e) {
      return { success: false, offline: true };
    }
  },

  async getCustomLevels() {
    try {
      const res = await fetch(`${API_URL}/editor/levels`, { headers: getAuthHeaders() });
      return await res.json();
    } catch (e) {
      return { success: false, offline: true };
    }
  }
};

export default ApiService;
