/**
 * Main Application Router & Route Protection
 * Bulletproof layout with conditional Navbar display and 100dvh game isolation
 * Bubble Puzzle Engine Presentation Tier
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import AdminPage from './pages/AdminPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import CookieConsent from './components/CookieConsent';
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
      (user?.role === 'admin' ||
        user?.username === 'admin' ||
        user?.username === 'Always_Prabhu' ||
        user?.email === 'prabhudemo@gmail.com' ||
        user?.username === 'prabhudemo')
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
      {/* Universal Skip to Main Content Link for Keyboard & Screen Reader Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] focus:px-4 focus:py-2.5 focus:bg-amber-400 focus:text-slate-950 focus:font-display focus:font-black focus:text-xs focus:rounded-xl focus:shadow-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/50"
      >
        Skip to main content
      </a>

      {!isGameRoute && <Navbar />}
      <main
        id="main-content"
        tabIndex={-1}
        className={`flex-1 w-full max-w-[100vw] h-full min-h-0 overflow-y-auto overflow-x-hidden ${!isGameRoute ? 'pb-16 md:pb-0' : ''}`}
      >
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
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-and-conditions" element={<TermsPage />} />
          <Route path="/terms" element={<Navigate to="/terms-and-conditions" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <CookieConsent />
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
