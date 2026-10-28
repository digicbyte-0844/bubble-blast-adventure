// Central Source of Truth for Dynamic Branding & Configuration
export const GAME_NAME: string = import.meta.env.VITE_GAME_NAME || "BUBBLE BLAST ADVENTURE";

const isProductionDomain = typeof window !== 'undefined' && 
  window.location.hostname !== 'localhost' && 
  window.location.hostname !== '127.0.0.1';

const isRenderDomain = typeof window !== 'undefined' && 
  window.location.hostname.endsWith('.onrender.com');

export const API_URL: string = import.meta.env.VITE_API_URL || 
  (isRenderDomain
    ? "https://bubble-blast-adventure-api.onrender.com/api"
    : (isProductionDomain ? "/api" : "http://localhost:5000/api"));

export default {
  GAME_NAME,
  API_URL
};
