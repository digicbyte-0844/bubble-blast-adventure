import React from 'react';
import { RotateCcw, Home, AlertTriangle } from 'lucide-react';
import { GAME_NAME } from '../config/gameConfig';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled rendering crash:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/levels';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-[100dvh] bg-[#0B0F19] text-white flex items-center justify-center p-4 select-none">
          <div className="w-full max-w-md clay-card p-6 md:p-8 rounded-3xl border border-rose-500/40 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="w-16 h-16 rounded-3xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h2 className="text-xl md:text-2xl font-display font-black text-white uppercase tracking-tight text-shadow-arcade mb-1">
              Cosmic Anomaly Detected
            </h2>

            <p className="text-xs text-slate-300 font-body mb-6">
              A temporary rendering glitch occurred in {GAME_NAME}. Your saved progress remains safe in local storage.
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={this.handleReload}
                className="w-full h-12 min-h-[48px] btn-arcade-gold rounded-2xl flex items-center justify-center gap-2 text-slate-950 font-display font-black text-sm tracking-wide uppercase active:translate-y-1 shadow-md"
              >
                <RotateCcw className="w-4 h-4 text-slate-950" />
                <span>Reload Application</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full h-12 min-h-[48px] btn-arcade-slate rounded-2xl flex items-center justify-center gap-2 text-slate-200 font-display font-bold text-xs"
              >
                <Home className="w-4 h-4" />
                <span>Return to Saga Map</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
