import React from 'react';
import { RotateCcw, Home, PlusCircle } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { Link } from 'react-router-dom';

interface GameOverModalProps {
  onRetry: () => void;
  onBackToMap?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ onRetry, onBackToMap }) => {
  const { score, levelId, activateBooster } = useGameStore();

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-cosmic-card border-2 border-rose-500/40 p-6 rounded-3xl text-center shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="text-4xl mb-2">💥</div>
        <h2 className="text-2xl font-black text-rose-500 tracking-tight uppercase">Defeat!</h2>
        <p className="text-xs text-slate-400 font-semibold mb-4">
          Shots depleted before sector objectives were fulfilled.
        </p>

        {/* Score Card */}
        <div className="bg-cosmic-dark/80 p-4 rounded-2xl border border-cosmic-border mb-6">
          <span className="text-xs text-slate-400 block mb-1">Score Achieved</span>
          <span className="text-2xl font-black text-white">{score.toLocaleString()}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onRetry}
            className="w-full py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black text-sm rounded-2xl shadow-lg hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            to="/levels"
            className="w-full py-2.5 bg-cosmic-dark border border-cosmic-border text-slate-300 font-bold text-xs rounded-xl hover:text-white hover:border-slate-500 transition-colors flex items-center justify-center gap-1"
          >
            <Home className="w-3.5 h-3.5" />
            Back to Map
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
