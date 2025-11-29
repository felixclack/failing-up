'use client';

import { GameState, ActionId } from '@/engine/types';
import { StatsDisplay } from './StatsDisplay';
import { ActionPanel } from './ActionPanel';
import { WeeklyLog } from './WeeklyLog';
import { BandDisplay } from './BandDisplay';
import { MobileHeader } from './MobileHeader';
import { MobileStats } from './MobileStats';
import { MobileActionPanel } from './MobileActionPanel';
import { CollapsibleSection } from './CollapsibleSection';

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
  const { player, bandName, week, year, weekLogs, bandmates } = gameState;
  const activeBandmates = bandmates.filter(b => b.status === 'active');

  return (
    <>
      {/* ===== MOBILE LAYOUT (default) ===== */}
      <div className="lg:hidden min-h-screen bg-black flex flex-col">
        {/* Sticky Header */}
        <MobileHeader
          player={player}
          week={week}
          year={year}
          bandName={bandName || 'FAILING UP'}
        />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-20">
          {/* Current Message */}
          {currentMessage && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
              <p className="text-gray-200 text-sm">{currentMessage}</p>
            </div>
          )}

          {/* Actions - PRIMARY CONTENT */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
            <div className="text-white font-bold mb-3 flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <span>What do you do this week?</span>
            </div>
            <MobileActionPanel
              availableActions={availableActions}
              onSelectAction={onSelectAction}
            />
          </div>

          {/* Collapsible Stats */}
          <CollapsibleSection title="📊 Stats" defaultOpen={false}>
            <MobileStats player={player} />
          </CollapsibleSection>

          {/* Collapsible Band */}
          <CollapsibleSection
            title="🎤 Band"
            badge={activeBandmates.length}
            defaultOpen={false}
          >
            <div className="p-3">
              {activeBandmates.length > 0 ? (
                <div className="space-y-2">
                  {activeBandmates.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between bg-gray-800 rounded p-2"
                    >
                      <div>
                        <span className="text-white text-sm">{member.name}</span>
                        <span className="text-gray-500 text-xs ml-2">({member.role})</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-400">Loyalty: {member.loyalty}</span>
                        {onFireBandmate && (
                          <button
                            onClick={() => onFireBandmate(member.id)}
                            className="text-red-400 hover:text-red-300 px-2 py-1"
                          >
                            Fire
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No active band members</p>
              )}
            </div>
          </CollapsibleSection>

          {/* Collapsible Log */}
          <CollapsibleSection
            title="📜 History"
            badge={weekLogs.length}
            defaultOpen={false}
          >
            <div className="p-3 max-h-60 overflow-y-auto">
              {weekLogs.length > 0 ? (
                <div className="space-y-2">
                  {weekLogs.slice().reverse().slice(0, 10).map((log, index) => (
                    <div key={index} className="border-b border-gray-700 pb-2 last:border-0">
                      <div className="text-gray-500 text-xs">Week {log.week}</div>
                      <div className="text-gray-300 text-sm">{log.actionResult}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No history yet</p>
              )}
            </div>
          </CollapsibleSection>
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden lg:block min-h-screen bg-black p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-red-500">{bandName || 'FAILING UP'}</h1>
          </div>

          {/* Main Layout */}
          <div className="grid grid-cols-12 gap-4">
            {/* Left Column - Stats & Band */}
            <div className="col-span-3">
              <StatsDisplay player={player} week={week} year={year} />
              <BandDisplay bandmates={bandmates} onFireBandmate={onFireBandmate} />
            </div>

            {/* Center Column - Actions */}
            <div className="col-span-5">
              <ActionPanel
                availableActions={availableActions}
                onSelectAction={onSelectAction}
              />
            </div>

            {/* Right Column - Log */}
            <div className="col-span-4">
              <WeeklyLog
                currentMessage={currentMessage}
                weekLogs={weekLogs}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
