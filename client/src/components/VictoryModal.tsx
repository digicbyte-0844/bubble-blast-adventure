import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, ArrowRight, RotateCcw, Home, Award } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { Link } from 'react-router-dom';

interface VictoryModalProps {
  onNextLevel: () => void;
  onReplay: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ onNextLevel, onReplay }) => {
  const { score, levelId, levelData } = useGameStore();

  useEffect(() => {
    // Launch celebratory confetti burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-cosmic-card border-2 border-cosmic-accent p-6 rounded-3xl text-center shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="text-4xl mb-2 animate-bounce">🌟</div>
        <h2 className="text-2xl font-black text-white tracking-tight uppercase">Victory!</h2>
        <p className="text-xs text-cosmic-cyan font-bold tracking-wider uppercase mb-4">
          Sector {levelId} Cleared!
        </p>

        {/* 3 Stars Container */}
        <div className="flex justify-center items-center gap-2 mb-6">
          <Star className="w-10 h-10 fill-amber-400 text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] animate-pulse" />
          <Star className="w-12 h-12 fill-amber-400 text-amber-300 drop-shadow-[0_0_15px_rgba(251,191,36,0.9)] -translate-y-2 animate-pulse" />
          <Star className="w-10 h-10 fill-amber-400 text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] animate-pulse" />
        </div>

        {/* Score & Rewards Card */}
        <div className="bg-cosmic-dark/80 p-4 rounded-2xl border border-cosmic-border mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400 font-semibold">Final Score</span>
            <span className="text-lg font-black text-white">{score.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-semibold">Reward</span>
            <span className="text-sm font-black text-amber-300 flex items-center gap-1">
              🪙 +100 Coins
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onNextLevel}
            className="w-full py-3 bg-gradient-to-r from-cosmic-accent to-cosmic-cyan text-black font-black text-sm rounded-2xl shadow-lg hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Next Sector
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={onReplay}
              className="flex-1 py-2.5 bg-cosmic-dark border border-cosmic-border text-slate-300 font-bold text-xs rounded-xl hover:text-white hover:border-slate-500 transition-colors flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Replay
            </button>
            <Link
              to="/levels"
              className="flex-1 py-2.5 bg-cosmic-dark border border-cosmic-border text-slate-300 font-bold text-xs rounded-xl hover:text-white hover:border-slate-500 transition-colors flex items-center justify-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
              World Map
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VictoryModal;
