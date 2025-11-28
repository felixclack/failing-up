'use client';

import { GameState, ActionId } from '@/engine/types';
import { StatsDisplay } from './StatsDisplay';
import { ActionPanel } from './ActionPanel';
import { WeeklyLog } from './WeeklyLog';
import { BandDisplay } from './BandDisplay';

interface GameScreenProps {
  gameState: GameState;
  availableActions: ActionId[];
  currentMessage: string | null;
  onSelectAction: (actionId: ActionId) => void;
  onFireBandmate?: (bandmateId: string) => void;
}

export function GameScreen({
  gameState,
  availableActions,
  currentMessage,
  onSelectAction,
  onFireBandmate,
}: GameScreenProps) {
  const { player, week, year, weekLogs, bandmates } = gameState;

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-red-500">FAILING UP</h1>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column - Stats & Band */}
          <div className="lg:col-span-3">
            <StatsDisplay player={player} week={week} year={year} />
            <BandDisplay bandmates={bandmates} onFireBandmate={onFireBandmate} />
          </div>

          {/* Center Column - Actions */}
          <div className="lg:col-span-5">
            <ActionPanel
              availableActions={availableActions}
              onSelectAction={onSelectAction}
            />
          </div>

          {/* Right Column - Log */}
          <div className="lg:col-span-4">
            <WeeklyLog
              currentMessage={currentMessage}
              weekLogs={weekLogs}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
