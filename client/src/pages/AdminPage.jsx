/**
 * Mission Command & Admin Management Portal (<AdminPage />)
 * Allows developers & game administrators to inspect registered users,
 * view progression data, manage player accounts, and monitor live MongoDB Atlas metrics.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Database,
  Gamepad2,
  Trash2,
  Search,
  RefreshCw,
  Eye,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Coins,
  Heart,
  Crosshair,
  Bomb,
  Layers,
  ArrowLeft,
  X,
  FileCode,
  ShieldCheck
} from 'lucide-react';
import { API_URL } from '../config/gameConfig';

export const AdminPage = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'real' | 'test'
  const [selectedUser, setSelectedUser] = useState(null);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [inspectData, setInspectData] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/stats`);
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterType !== 'all') params.append('filter', filterType);
      params.append('limit', '100');

      const res = await fetch(`${API_URL}/admin/users?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        setTotalUsers(data.total);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, filterType]);

  const handleInspectUser = async (user) => {
    setSelectedUser(user);
    setInspectModalOpen(true);
    setInspectLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/users/${user._id || user.id}`);
      const data = await res.json();
      if (data.success) {
        setInspectData(data);
      } else {
        setInspectData({ user });
      }
    } catch (err) {
      console.error('Failed to fetch user details:', err);
      setInspectData({ user });
    } finally {
      setInspectLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to permanently delete player "${user.username}"?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/admin/users/${user._id || user.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: 'success', text: `Player ${user.username} deleted successfully` });
        fetchUsers();
        fetchStats();
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Failed to delete user' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  const handleCleanupTestUsers = async () => {
    if (!window.confirm('Purge all automated AstralTester test runner accounts from MongoDB Atlas?')) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/admin/cleanup-test-users`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: 'success', text: data.message });
        fetchUsers();
        fetchStats();
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Failed to purge test accounts' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Dashboard
            </Link>
            <span className="text-slate-600">•</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Master Admin Mode
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-white flex items-center gap-3">
            Registered Users & Database Control
          </h1>
          <p className="text-xs md:text-sm text-slate-400 font-body">
            View live player records, inspect progress state, and monitor cloud MongoDB Atlas synchronization.
          </p>
        </div>

        {/* Database Status Badge */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2.5 shadow-lg">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cloud Database</span>
              <span className="text-xs font-black text-emerald-400 font-display">MongoDB Atlas Live</span>
            </div>
          </div>

          <button
            onClick={() => {
              fetchStats();
              fetchUsers();
            }}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all text-slate-200 border border-slate-700 shadow-md"
            title="Refresh All Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Alert Notification */}
      {statusMessage && (
        <div
          className={`px-4 py-3 rounded-2xl border flex items-center justify-between text-xs font-bold ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {/* Card 1: Total Registered Users */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 font-display uppercase tracking-wider">Total Users</span>
            <div className="p-2 rounded-xl bg-amber-400/15 text-amber-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-display font-black text-white">
              {stats?.users?.total ?? users.length}
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">{stats?.users?.real ?? 1} Real</span>
              <span>•</span>
              <span className="text-slate-500">{stats?.users?.testAccounts ?? 0} Test</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Game Sessions */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 font-display uppercase tracking-wider">Game Rounds</span>
            <div className="p-2 rounded-xl bg-cyan-400/15 text-cyan-400">
              <Gamepad2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-display font-black text-cyan-300">
              {stats?.gameplay?.totalSessions ?? 0}
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-1">
              Verified anti-cheat sessions
            </div>
          </div>
        </div>

        {/* Card 3: Official Levels */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 font-display uppercase tracking-wider">Catalog Levels</span>
            <div className="p-2 rounded-xl bg-purple-400/15 text-purple-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-display font-black text-purple-300">
              {stats?.content?.officialLevels ?? 40}
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-1">
              Handcrafted Odd-R levels
            </div>
          </div>
        </div>

        {/* Card 4: Community Levels */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 font-display uppercase tracking-wider">Custom Levels</span>
            <div className="p-2 rounded-xl bg-emerald-400/15 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-display font-black text-emerald-300">
              {stats?.content?.communityCustomLevels ?? 0}
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-1">
              Built with Visual Editor
            </div>
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search username, email, name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'all'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Users ({stats?.users?.total ?? users.length})
          </button>
          <button
            onClick={() => setFilterType('real')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'real'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Real Players ({stats?.users?.real ?? 1})
          </button>
          <button
            onClick={() => setFilterType('test')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'test'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Test Runner Accounts ({stats?.users?.testAccounts ?? 0})
          </button>
        </div>

        {/* Purge Test Accounts Button */}
        {(stats?.users?.testAccounts || 0) > 0 && (
          <button
            onClick={handleCleanupTestUsers}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800 text-rose-300 text-xs font-bold active:scale-95 transition-all ml-auto"
            title="Clean up test runner accounts generated by unit test runs"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            Purge Test Accounts
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-display uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4 text-center">Level / Score</th>
                <th className="py-3 px-4 text-center">Wallet</th>
                <th className="py-3 px-4 text-center">Booster Pack</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-body">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-400" />
                    Fetching user records from MongoDB Atlas...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No users matching the filter criteria found.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isTestUser = u.username.startsWith('AstralTester_');
                  const regDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A';
                  const regTime = u.createdAt ? new Date(u.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                  const totalScore = (u.totalScore || 0).toLocaleString();
                  const coins = u.coins ?? 500;
                  const energy = u.energy ?? 5;
                  const inventory = u.inventory || u.boosterInventory || {};

                  return (
                    <tr
                      key={u._id || u.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Player Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-black text-xs ${
                            isTestUser ? 'bg-slate-800 text-slate-400' : 'bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 shadow-md'
                          }`}>
                            {isTestUser ? '🤖' : '⭐'}
                          </div>
                          <div>
                            <div className="font-display font-black text-slate-100 flex items-center gap-1.5">
                              <span>{u.name || u.username}</span>
                              {isTestUser ? (
                                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">Test Account</span>
                              ) : (
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold">Active Player</span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">@{u.username}</span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                        {u.email || 'None'}
                      </td>

                      {/* Registered Date */}
                      <td className="py-3.5 px-4 text-slate-400 text-xs">
                        <div>{regDate}</div>
                        <div className="text-[10px] text-slate-500">{regTime}</div>
                      </td>

                      {/* Level & Score */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="font-display font-black text-amber-400 text-xs">
                          Sector {u.currentLevel || u.levelIndex || 1}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {totalScore} pts
                        </div>
                      </td>

                      {/* Wallet */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-3">
                          <span className="inline-flex items-center gap-1 text-amber-300 font-bold">
                            <Coins className="w-3.5 h-3.5 text-amber-400" />
                            {coins}
                          </span>
                          <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                            {energy}/5
                          </span>
                        </div>
                      </td>

                      {/* Booster Inventory */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono">
                          <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-cyan-300" title="Super Aim">
                            🎯{inventory.SUPER_AIM ?? inventory.aimGuide ?? 0}
                          </span>
                          <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-amber-300" title="Bomb">
                            💣{inventory.BOMB ?? inventory.bomb ?? 0}
                          </span>
                          <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-pink-300" title="Rainbow">
                            🌈{inventory.RAINBOW ?? inventory.rainbow ?? 0}
                          </span>
                          <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-emerald-300" title="+5 Shots">
                            +5:{inventory.EXTRA_SHOTS ?? inventory.extraShots ?? 0}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleInspectUser(u)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 transition-colors"
                            title="Inspect Full User Document"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect User Full Data Modal */}
      {inspectModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileCode className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-display font-black text-white text-base">
                    Player Record: @{selectedUser.username}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    ID: {selectedUser._id || selectedUser.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setInspectModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 font-body">
              {inspectLoading ? (
                <div className="py-12 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
                  Loading full player document from MongoDB Atlas...
                </div>
              ) : (
                <>
                  {/* Summary Metric Chips */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Total Score</span>
                      <div className="text-base font-display font-black text-amber-400">
                        {(inspectData?.user?.totalScore || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Coins Balance</span>
                      <div className="text-base font-display font-black text-amber-300">
                        {inspectData?.user?.coins ?? 500}
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Current Sector</span>
                      <div className="text-base font-display font-black text-cyan-400">
                        Level {inspectData?.user?.currentLevel || inspectData?.user?.levelIndex || 1}
                      </div>
                    </div>
                  </div>

                  {/* Raw JSON Data Viewer */}
                  <div>
                    <span className="text-xs font-bold text-slate-400 mb-1.5 block">
                      MongoDB Document (Cleaned Payload):
                    </span>
                    <pre className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-64 leading-relaxed">
                      {JSON.stringify(inspectData?.user || selectedUser, null, 2)}
                    </pre>
                  </div>

                  {/* Recent Sessions */}
                  {inspectData?.recentSessions && inspectData.recentSessions.length > 0 && (
                    <div>
                      <span className="text-xs font-bold text-slate-400 mb-1.5 block">
                        Recent Game Sessions ({inspectData.recentSessions.length}):
                      </span>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {inspectData.recentSessions.map((s, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs font-mono"
                          >
                            <span className="text-slate-300">Sector {s.levelId}</span>
                            <span className="text-amber-400 font-bold">{s.score} pts</span>
                            <span className="text-slate-500">{new Date(s.createdAt).toLocaleTimeString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setInspectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-black text-xs transition-all shadow-md"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPage;
