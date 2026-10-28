// Central Source of Truth for Dynamic Branding & Configuration
export const GAME_NAME: string = import.meta.env.VITE_GAME_NAME || "BUBBLE BLAST ADVENTURE";
export const API_URL: string = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default {
  GAME_NAME,
  API_URL
};
