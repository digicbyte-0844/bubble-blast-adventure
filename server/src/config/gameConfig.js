/**
 * Central Server Configuration & Dynamic Game Identity
 * Single source of truth for backend branding
 */

import dotenv from 'dotenv';
dotenv.config();

export const GAME_NAME = process.env.GAME_NAME || 'BUBBLE BLAST ADVENTURE';
export const PORT = process.env.PORT || 5000;
export const JWT_SECRET = process.env.JWT_SECRET || 'super_secure_jwt_secret_key_minimum_64_characters_long';
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bubble_blast_adventure';

export default {
  GAME_NAME,
  PORT,
  JWT_SECRET,
  MONGODB_URI
};
