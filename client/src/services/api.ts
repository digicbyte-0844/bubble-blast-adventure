/**
 * Unified API Client with Offline Resilience (TypeScript)
 * Bubble Puzzle Engine Network Tier
 */

import { API_URL } from '../config/gameConfig';

const getAuthHeaders = (): Record<string, string> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('bba_token') : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const ApiService = {
  // Auth
  async login(emailOrUsername: string, password?: string) {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailOrUsername, username: emailOrUsername, password: password || 'Guest123!' })
      });
      const data = await res.json();
      if (data?.token && typeof window !== 'undefined') {
        localStorage.setItem('bba_token', data.token);
      }
      return data;
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  },

  async register(name: string, email: string, password?: string) {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username: name, email, password: password || 'Guest123!' })
      });
      const data = await res.json();
      if (data?.token && typeof window !== 'undefined') {
        localStorage.setItem('bba_token', data.token);
      }
      return data;
    } catch (e: any) {
      return { success: false, message: e.message };
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
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  },

  async getProfile() {
    try {
      const res = await fetch(`${API_URL}/user/profile`, { headers: getAuthHeaders() });
      return await res.json();
    } catch (e) {
      return { success: false, offline: true };
    }
  },

  async getProgress() {
    try {
      const res = await fetch(`${API_URL}/user/progress`, { headers: getAuthHeaders() });
      return await res.json();
    } catch (e) {
      return { success: false, offline: true };
    }
  },

  // Levels
  async getLevels() {
    try {
      const res = await fetch(`${API_URL}/levels`, { headers: getAuthHeaders() });
      return await res.json();
    } catch (e) {
      return { success: false, offline: true };
    }
  },

  async getLevelById(id: number) {
    try {
      const res = await fetch(`${API_URL}/levels/${id}`, { headers: getAuthHeaders() });
      return await res.json();
    } catch (e) {
      return { success: false, offline: true };
    }
  },

  // Game Sessions & Anti-Cheat
  async startGameSession(levelId: number, boostersEquipped: string[] = []) {
    try {
      const res = await fetch(`${API_URL}/games/start`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ levelId, boostersEquipped })
      });
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

  async completeGameSession(payload: any) {
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
      return await res.json();
    } catch (e) {
      return { success: false, offline: true };
    }
  },

  // Leaderboard & Social
  async getLeaderboard(type: string = 'global', limit: number = 50) {
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
      return await res.json();
    } catch (e) {
      return { success: false, offline: true };
    }
  },

  async saveCustomLevel(levelData: any) {
    try {
      const res = await fetch(`${API_URL}/editor/save`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(levelData)
      });
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
