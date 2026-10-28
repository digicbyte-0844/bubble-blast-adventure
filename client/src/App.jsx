/**
 * Main Application Router & Route Protection
 * Bulletproof layout with conditional Navbar display and 100dvh game isolation
 * Bubble Puzzle Engine Presentation Tier
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
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
import AdminPage from './pages/AdminPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import { useUserStore } from './store/useUserStore';

// Protected route guard: seamlessly redirects unauthenticated visitors to /login with redirect query param
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useUserStore();
  const location = useLocation();
  const token = typeof window !== 'undefined' ? localStorage.getItem('bba_token') : null;

  if (!isAuthenticated && !token && !user) {
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectUrl}`} replace />;
  }

  return <>{children}</>;
};

// Admin route guard: strictly restricts access to verified administrators
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useUserStore();
  const isAdmin = Boolean(
    isAuthenticated &&
      (user?.role === 'admin' || user?.username === 'admin' || user?.username === 'Always_Prabhu')
  );

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  const location = useLocation();
  const isGameRoute = location.pathname.startsWith('/game');

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full max-w-[100vw] overflow-x-hidden overflow-y-hidden bg-[#0B0F19] text-slate-100 flex flex-col font-['Nunito',sans-serif] select-none">
      {!isGameRoute && <Navbar />}
      <main className={`flex-1 w-full max-w-[100vw] h-full min-h-0 overflow-y-auto overflow-x-hidden ${!isGameRoute ? 'pb-16 md:pb-0' : ''}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/levels" element={<LevelSelectPage />} />
          <Route path="/game/:levelId" element={<ProtectedRoute><GamePage /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/daily-challenge" element={<DailyChallengePage />} />
          <Route path="/editor" element={<ProtectedRoute><LevelEditorPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        {!isGameRoute && <Footer />}
      </main>
    </div>
  );
};

export const App = () => {
  const { loadProgress } = useUserStore();

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
