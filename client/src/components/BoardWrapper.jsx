/**
 * Tier B: Middle Canvas Container (<BoardWrapper />)
 * Dynamically absorbs 100% of remaining vertical space between HUD and BottomDock
 * Uses useResizeObserver to measure EXACT pixel width & height and pass to <GameCanvas />
 */

import React, { useRef } from 'react';
import { useResizeObserver } from '../hooks/useResizeObserver.js';
import { GameCanvas } from './GameCanvas.jsx';
import { CharacterMascot } from './CharacterMascot.jsx';
import { useGameStore } from '../store/useGameStore.js';

export const BoardWrapper = () => {
  const containerRef = useRef(null);
  const { width, height } = useResizeObserver(containerRef);
  const { mascotEmotion } = useGameStore();

  // On larger screens (tablets/desktops), constrain maximum canvas width to keep optimal mobile bubble game ratio
  const maxGameWidth = 440;
  const effectiveWidth = Math.min(width || 380, maxGameWidth);
  const effectiveHeight = height || 540;

  return (
    <main
      ref={containerRef}
      className="flex-1 relative w-full h-full min-h-0 overflow-hidden flex items-center justify-center select-none touch-none px-2"
    >
      {/* Reactive Bloopi Mascot Overlay in top-right */}
      <div className="absolute top-2 right-4 z-10 pointer-events-none drop-shadow-md">
        <CharacterMascot emotion={mascotEmotion || 'idle'} size="sm" />
      </div>

      {/* Dynamic 60 FPS HTML5 Game Canvas */}
      <GameCanvas width={effectiveWidth} height={effectiveHeight} />
    </main>
  );
};

export default BoardWrapper;
