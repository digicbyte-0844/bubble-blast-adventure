/**
 * Visual Hexagonal Level Editor & Sandbox
 * King/Supercell caliber arcade styling with Odd-R honeycomb grid painting
 * Bubble Puzzle Engine Presentation Tier
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Play, Download, Trash2, Sparkles, Sliders, Shield, Palette, CheckCircle2 } from 'lucide-react';
import { GAME_NAME } from '../config/gameConfig.js';
import { BUBBLE_COLORS, OBJECTIVES, SPECIAL_BUBBLES } from '../game/constants.js';
import { useGameStore } from '../store/useGameStore.js';
import ApiService from '../services/api.js';

const PALETTE_BRUSHES = [
  { id: 'cyan', label: 'Cyan Bubble', color: '#06B6D4', border: '#0891B2', icon: '💎' },
  { id: 'pink', label: 'Pink Bubble', color: '#EC4899', border: '#DB2777', icon: '🌸' },
  { id: 'orange', label: 'Orange Bubble', color: '#F97316', border: '#EA580C', icon: '🍊' },
  { id: 'green', label: 'Green Bubble', color: '#10B981', border: '#059669', icon: '🍀' },
  { id: 'red', label: 'Ruby Bubble', color: '#EF4444', border: '#DC2626', icon: '❤️' },
  { id: 'purple', label: 'Amethyst', color: '#A855F7', border: '#9333EA', icon: '🔮' },
  { id: 'yellow', label: 'Amber Sun', color: '#FACC15', border: '#EAB308', icon: '⭐' },
  { id: 'blue', label: 'Sapphire', color: '#3B82F6', border: '#2563EB', icon: '🌊' },
  { id: 'bomb', label: 'Cosmic Bomb', color: '#EA580C', border: '#C2410C', icon: '💣' },
  { id: 'rainbow', label: 'Prism Wildcard', color: '#F472B6', border: '#EC4899', icon: '🌈' },
  { id: 'rescue', label: 'Trapped Jelly', color: '#38BDF8', border: '#0284C7', icon: '🌟' },
  { id: null, label: 'Eraser (Clear)', color: '#1E293B', border: '#334155', icon: '✖' }
];

export const LevelEditorPage = () => {
  const navigate = useNavigate();
  const [levelName, setLevelName] = useState('Cosmic Sandbox Sector');
  const [objectiveType, setObjectiveType] = useState('clear_all');
  const [maxShots, setMaxShots] = useState(25);
  const [selectedBrush, setSelectedBrush] = useState('cyan');
  const [saveStatus, setSaveStatus] = useState('');

  // 14 rows Odd-R matrix
  const [matrix, setMatrix] = useState(() => {
    const grid = [];
    for (let r = 0; r < 14; r++) {
      const cols = r % 2 === 0 ? 11 : 10;
      const row = [];
      for (let c = 0; c < cols; c++) {
        row.push(r < 5 ? (c % 2 === 0 ? 'cyan' : 'pink') : null);
      }
      grid.push(row);
    }
    return grid;
  });

  useEffect(() => {
    document.title = `Level Forge — ${GAME_NAME}`;
  }, []);

  const handleCellClick = (r, c) => {
    const newGrid = matrix.map((row) => [...row]);
    newGrid[r][c] = selectedBrush;
    setMatrix(newGrid);
  };

  const handleClear = () => {
    const emptyGrid = matrix.map((row) => row.map(() => null));
    setMatrix(emptyGrid);
  };

  const handleTestPlay = () => {
    const customLevel = {
      id: 999,
      name: levelName || 'Custom Sandbox Sector',
      world: 'Cosmic Forge',
      tier: 'Custom Created',
      objective: {
        type: objectiveType,
        target: objectiveType === 'rescue' ? 3 : 0
      },
      maxShots: Number(maxShots) || 25,
      palette: ['cyan', 'pink', 'orange', 'green'],
      matrix: matrix.map((row) =>
        row.map((cell) => {
          if (!cell) return null;
          if (cell === 'bomb') return { color: 'orange', type: SPECIAL_BUBBLES.BOMB };
          if (cell === 'rainbow') return { color: 'pink', type: SPECIAL_BUBBLES.RAINBOW };
          if (cell === 'rescue') return { color: 'cyan', type: SPECIAL_BUBBLES.STARLIGHT_JELLY_RESCUE };
          return { color: cell, type: SPECIAL_BUBBLES.NORMAL };
        })
      ),
      starScoreThresholds: { oneStar: 2000, twoStar: 4000, threeStar: 7000 }
    };

    useGameStore.setState({
      levelId: 999,
      levelData: customLevel,
      gridMatrix: customLevel.matrix,
      gameStatus: 'READY',
      gameState: 'READY',
      shotsRemaining: customLevel.maxShots,
      score: 0,
      combo: 0,
      currentBubble: 'cyan',
      nextBubble: 'pink'
    });

    navigate('/game/999');
  };

  const handleExportJSON = () => {
    const levelExport = {
      name: levelName,
      objective: { type: objectiveType, target: 0 },
      maxShots,
      matrix
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(levelExport, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${levelName.toLowerCase().replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleSaveLevel = async () => {
    setSaveStatus('Saving custom sector...');
    try {
      await ApiService.saveCustomLevel({
        name: levelName,
        objective: { type: objectiveType, target: 0 },
        maxShots,
        matrix
      });
      setSaveStatus('✓ Level saved to MongoDB Atlas!');
    } catch (e) {
      // Local storage fallback
      const saved = JSON.parse(localStorage.getItem('bba_custom_levels') || '[]');
      saved.push({ name: levelName, matrix, maxShots, objectiveType, createdAt: Date.now() });
      localStorage.setItem('bba_custom_levels', JSON.stringify(saved));
      setSaveStatus('✓ Sector saved locally in browser storage!');
    }
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const activeBrushObj = PALETTE_BRUSHES.find((b) => b.id === selectedBrush) || PALETTE_BRUSHES[0];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white pt-20 pb-16 px-4 select-none">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="clay-card p-6 flex flex-col md:flex-row items-center justify-between gap-5 border border-slate-700/60 shadow-2xl">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Tactical Level Forge</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-black text-white text-shadow-arcade">
              {GAME_NAME} Level Architect
            </h1>
            <p className="text-xs text-slate-400 font-sans font-semibold mt-1">
              Design Odd-R honeycomb layouts, configure win conditions, test-play, or export to JSON.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button
              onClick={handleTestPlay}
              className="btn-arcade-gold px-5 py-3 rounded-2xl flex items-center gap-2 text-xs font-black min-h-[48px]"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>TEST-PLAY</span>
            </button>
            <button
              onClick={handleSaveLevel}
              className="btn-arcade-slate px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-black min-h-[48px]"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>SAVE</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="btn-arcade-slate p-3 rounded-2xl flex items-center justify-center min-w-[48px] min-h-[48px]"
              title="Download Sector JSON"
            >
              <Download className="w-4 h-4 text-cyan-400" />
            </button>
            <button
              onClick={handleClear}
              className="btn-arcade-crimson p-3 rounded-2xl flex items-center justify-center min-w-[48px] min-h-[48px]"
              title="Clear Entire Grid"
            >
              <Trash2 className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {saveStatus && (
          <div className="clay-card bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-black p-3.5 rounded-2xl text-center shadow-lg animate-pulse flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{saveStatus}</span>
          </div>
        )}

        {/* Main Grid: Controls & Honeycomb */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Settings & Palette */}
          <div className="space-y-5">
            {/* Sector Settings Card */}
            <div className="clay-card p-5 space-y-4 border border-slate-700/60">
              <h3 className="text-xs font-display font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Sector Parameters</span>
              </h3>

              <div>
                <label className="text-[11px] font-sans font-bold text-slate-300 block mb-1">Sector Name</label>
                <input
                  type="text"
                  value={levelName}
                  onChange={(e) => setLevelName(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-400 transition-all min-h-[42px]"
                />
              </div>

              <div>
                <label className="text-[11px] font-sans font-bold text-slate-300 block mb-1">Objective Goal</label>
                <select
                  value={objectiveType}
                  onChange={(e) => setObjectiveType(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-400 transition-all min-h-[42px]"
                >
                  <option value="clear_all">🎯 Clear All Bubbles</option>
                  <option value="rescue">🌟 Rescue Trapped Jellies</option>
                  <option value="target_score">🏆 Target Score Race</option>
                  <option value="limited_shots">⚡ Ammo Survival Mode</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-sans font-bold text-slate-300 mb-1">
                  <span>Ammo Limit</span>
                  <span className="text-amber-400 font-display font-black">{maxShots} Shots</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={maxShots}
                  onChange={(e) => setMaxShots(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>
            </div>

            {/* Brush Palette Card */}
            <div className="clay-card p-5 border border-slate-700/60">
              <h3 className="text-xs font-display font-black uppercase text-amber-400 tracking-wider mb-3 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-amber-400" />
                <span>Bubble Palette Brushes</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {PALETTE_BRUSHES.map((b) => {
                  const isSelected = selectedBrush === b.id;
                  return (
                    <button
                      key={String(b.id)}
                      onClick={() => setSelectedBrush(b.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all min-h-[44px] ${
                        isSelected
                          ? 'border-amber-400 bg-amber-400/20 shadow-md ring-2 ring-amber-400/60 text-white font-black'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-sm flex-shrink-0"
                        style={{
                          backgroundColor: b.color,
                          boxShadow: isSelected ? `0 0 10px ${b.color}` : 'none'
                        }}
                      >
                        {b.icon}
                      </div>
                      <span className="truncate text-[11px] font-sans">{b.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Honeycomb Canvas Area */}
          <div className="lg:col-span-3 clay-card p-6 flex flex-col items-center justify-center overflow-x-auto border border-slate-700/60 shadow-2xl">
            <div className="mb-4 text-center">
              <span className="text-xs font-display font-black text-amber-400 uppercase tracking-wider block">
                14-Row Odd-R Honeycomb Canvas (11 / 10 Parity)
              </span>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Click any slot to apply the active brush: <b className="text-white uppercase">{activeBrushObj.label}</b>
              </p>
            </div>

            {/* Honeycomb Matrix Board */}
            <div className="flex flex-col items-center gap-1.5 bg-slate-950/90 p-6 rounded-3xl border border-slate-800/80 shadow-inner">
              {matrix.map((row, r) => {
                const isOdd = r % 2 === 1;
                return (
                  <div
                    key={r}
                    className={`flex items-center gap-1.5 ${isOdd ? 'pl-6' : ''}`}
                  >
                    {row.map((cell, c) => {
                      const brushMeta = PALETTE_BRUSHES.find((b) => b.id === cell);
                      const cellColor = brushMeta ? brushMeta.color : '#1E293B';
                      const cellIcon = brushMeta ? brushMeta.icon : '';

                      return (
                        <button
                          key={`${r}-${c}`}
                          onClick={() => handleCellClick(r, c)}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/20 hover:scale-125 active:scale-95 transition-transform flex items-center justify-center text-[11px] shadow-md relative group"
                          style={{
                            backgroundColor: cellColor,
                            boxShadow: cell ? `inset 0 2px 4px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.5)` : 'none'
                          }}
                          title={`Row ${r}, Col ${c}: ${cell || 'Empty'}`}
                        >
                          {cell === 'bomb' ? '💣' : cell === 'rainbow' ? '🌈' : cell === 'rescue' ? '🌟' : ''}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <p className="text-[10px] text-slate-500 font-semibold mt-4 text-center">
              💡 Top ceiling row (Row 0) acts as anchor. Clusters disconnected from Row 0 during gameplay fall as gravity avalanches!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LevelEditorPage;
