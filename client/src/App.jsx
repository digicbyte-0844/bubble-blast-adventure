/**
 * Main Application Router & Route Protection
 * Bubble Puzzle Engine Presentation Tier
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import LevelSelectPage from './pages/LevelSelectPage.jsx';
import GamePage from './pages/GamePage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import AchievementsPage from './pages/AchievementsPage.jsx';
import DailyChallengePage from './pages/DailyChallengePage.jsx';
import LevelEditorPage from './pages/LevelEditorPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import HelpPage from './pages/HelpPage.jsx';
import { useUserStore } from './store/useUserStore';

// Protected route guard: auto-initializes guest if unauthenticated so all features remain accessible
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, loginGuest } = useUserStore();
  const token = typeof window !== 'undefined' ? localStorage.getItem('bba_token') : null;

  useEffect(() => {
    if (!isAuthenticated && !token && !user) {
      loginGuest();
    }
  }, [isAuthenticated, token, user, loginGuest]);

  return <>{children}</>;
};

export const App = () => {
  const { loadProgress } = useUserStore();

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-cosmic-dark text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/levels" element={<LevelSelectPage />} />
            <Route path="/game/:levelId" element={<GamePage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/daily-challenge" element={<DailyChallengePage />} />
            <Route path="/editor" element={<ProtectedRoute><LevelEditorPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
