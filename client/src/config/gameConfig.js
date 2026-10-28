// Central Source of Truth for Dynamic Branding & Configuration
export const GAME_NAME = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GAME_NAME)
  || (typeof process !== 'undefined' && process.env && process.env.VITE_GAME_NAME)
  || "BUBBLE BLAST ADVENTURE";

export const API_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  || (typeof process !== 'undefined' && process.env && process.env.VITE_API_URL)
  || "http://localhost:5000/api";

export default {
  GAME_NAME,
  API_URL
};
