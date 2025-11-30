'use client';

import { useState, useEffect, useCallback } from 'react';
import { GameState, ActionId } from '@/engine/types';
import { CollapsibleSection } from './CollapsibleSection';
import { KeyStats, CompactStats } from './KeyStats';
import { WeekFeed } from './WeekFeed';
import { ActionModal } from './ActionModal';
import { ManagerPanel } from './ManagerPanel';
import { StreamingStatsPanel, CompactStreamingStats } from './StreamingStatsPanel';
import { SaveLoadModal } from './SaveLoadModal';
import { SaveSlot } from '@/hooks/useGame';

interface GameScreenProps {
  gameState: GameState;
  availableActions: ActionId[];
  currentMessage: string | null;
  flavorText?: string | null;
  weekReflection?: string | null;
  onSelectAction: (actionId: ActionId) => void;
  onFireBandmate?: (bandmateId: string) => void;
  onHireManager?: () => void;
  onFireManager?: () => void;
  // Save/Load
  saveSlots?: SaveSlot[];
  onSaveGame?: (slotId?: string) => boolean;
  onLoadGame?: (slotId?: string) => boolean;
  onDeleteSave?: (slotId: string) => void;
  onNewGame?: () => void;
}

// Story panel component - shows current narrative and recent history
function StoryPanel({
  currentMessage,
  flavorText,
  weekReflection,
  weekLogs,
}: {
  currentMessage: string | null;
  flavorText?: string | null;
  weekReflection?: string | null;
  weekLogs: GameState['weekLogs'];
}) {
  // Get recent logs, excluding the most recent if we have a currentMessage (to avoid duplication)
  const logsToShow = currentMessage && weekLogs.length > 0
    ? weekLogs.slice(0, -1)
    : weekLogs;
  const recentLogs = logsToShow.slice(-5).reverse();

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 h-full flex flex-col">
      <div className="text-lg font-bold text-white mb-3">The Story So Far</div>

      {/* Current week section */}
      {(currentMessage || flavorText || weekReflection) && (
        <div className="mb-4 pb-4 border-b border-gray-700">
          <div className="text-xs text-green-400 uppercase tracking-wide mb-2">This Week</div>

          {/* Main action narrative */}
          {currentMessage && (
            <p className="text-gray-100 leading-relaxed mb-2">{currentMessage}</p>
          )}

          {/* Flavor text - small narrative moment */}
          {flavorText && (
            <div className="border-l-2 border-amber-600/50 pl-3 mb-2">
              <p className="text-amber-200/80 text-sm italic leading-relaxed">{flavorText}</p>
            </div>
          )}

          {/* Week reflection - narrator voice */}
          {weekReflection && (
            <p className="text-gray-400 text-sm italic">{weekReflection}</p>
          )}
        </div>
      )}

      {/* Previous weeks / Journal */}
      <div className="flex-1 overflow-y-auto">
        {recentLogs.length > 0 ? (
          <div className="space-y-3">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Previous Weeks</div>
            {recentLogs.map((log, index) => {
              const weekInYear = ((log.week - 1) % 52) + 1;
              const year = Math.floor((log.week - 1) / 52) + 1;
              return (
                <div key={index} className="text-sm">
                  <span className="text-gray-500 text-xs">Y{year} W{weekInYear}: </span>
                  <span className="text-gray-400">{log.actionResult}</span>
                </div>
              );
            })}
          </div>
        ) : !currentMessage && (
          <p className="text-gray-500 italic">Your journey begins...</p>
        )}
      </div>
    </div>
  );
}

// Band roster (compact)
function BandRoster({
  bandmates,
  onFireBandmate,
}: {
  bandmates: GameState['bandmates'];
  onFireBandmate?: (id: string) => void;
}) {
  const active = bandmates.filter(b => b.status === 'active');

  if (active.length === 0) {
    return <p className="text-gray-500 text-sm">No band members</p>;
  }

  return (
    <div className="space-y-1">
      {active.map(member => (
        <div key={member.id} className="flex items-center justify-between text-sm">
          <span className="text-gray-300">
            {member.name} <span className="text-gray-500">({member.role})</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">L:{member.loyalty}</span>
            {onFireBandmate && (
              <button
                onClick={() => onFireBandmate(member.id)}
                className="text-red-400 hover:text-red-300 text-xs"
              >
                Fire
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function GameScreen({
  gameState,
  availableActions,
  currentMessage,
  flavorText,
  weekReflection,
  onSelectAction,
  onFireBandmate,
  onHireManager,
  onFireManager,
  saveSlots = [],
  onSaveGame,
  onLoadGame,
  onDeleteSave,
  onNewGame,
}: GameScreenProps) {
  const { player, bandName, week, year, weekLogs, bandmates, newsItems, manager, upcomingGig, songs, albums } = gameState;
  const activeBandmates = bandmates.filter(b => b.status === 'active');

  // Track if we're currently revealing the week's events
  const [isRevealing, setIsRevealing] = useState(false);
  const [lastRevealedWeek, setLastRevealedWeek] = useState(0);

  // Menu state
  const [showMenu, setShowMenu] = useState(false);
  const [saveLoadMode, setSaveLoadMode] = useState<'save' | 'load' | null>(null);

  // Start revealing when we have new content for a new week
  useEffect(() => {
    if (currentMessage && week !== lastRevealedWeek) {
      setIsRevealing(true);
    }
  }, [currentMessage, week, lastRevealedWeek]);

  // Handle when reveal animation completes
  const handleRevealComplete = useCallback(() => {
    setIsRevealing(false);
    setLastRevealedWeek(week);
  }, [week]);

  // Determine if actions should be shown
  const showActions = !isRevealing || !currentMessage;

  return (
    <>
      {/* ===== MOBILE LAYOUT ===== */}
      <div className="lg:hidden min-h-screen bg-black flex flex-col">
        {/* Compact header with key info */}
        <div className="sticky top-0 z-10 bg-gray-900 border-b border-gray-700 p-3">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-bold text-red-500">{bandName || 'FAILING UP'}</h1>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Y{year} W{((week - 1) % 52) + 1}</span>
              {/* Menu button */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                </button>
                {/* Dropdown menu */}
                {showMenu && (
                  <div className="absolute right-0 mt-1 w-36 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden z-20">
                    <button
                      onClick={() => { setSaveLoadMode('save'); setShowMenu(false); }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-700 transition-colors"
                    >
                      Save Game
                    </button>
                    <button
                      onClick={() => { setSaveLoadMode('load'); setShowMenu(false); }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-700 transition-colors"
                    >
                      Load Game
                    </button>
                    {onNewGame && (
                      <button
                        onClick={() => { onNewGame(); setShowMenu(false); }}
                        className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700 transition-colors border-t border-gray-700"
                      >
                        New Game
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <CompactStats player={player} />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-20">
          {/* Story Feed - Primary content using WeekFeed */}
          <WeekFeed
            currentWeek={week}
            currentMessage={currentMessage}
            flavorText={flavorText}
            weekReflection={weekReflection}
            weekLogs={weekLogs}
            newsItems={newsItems}
            isRevealing={isRevealing}
            onRevealComplete={handleRevealComplete}
            typewriterSpeed={20}
            maxHistoryItems={10}
          />

          {/* Revealing indicator for mobile */}
          {isRevealing && (
            <div className="text-center py-2">
              <span className="text-gray-500 text-sm animate-pulse">Week unfolding...</span>
            </div>
          )}

          {/* Stats */}
          <CollapsibleSection title="📊 Your Status" defaultOpen={false}>
            <div className="p-3">
              <KeyStats
                player={player}
                week={week}
                year={year}
                bandName={bandName}
              />
            </div>
          </CollapsibleSection>

          {/* Streaming & Charts */}
          {songs.filter(s => s.isReleased).length > 0 && (
            <CollapsibleSection title="📈 Streaming & Charts" defaultOpen={false}>
              <div className="p-3">
                <StreamingStatsPanel
                  player={player}
                  songs={songs}
                  albums={albums}
                  currentWeek={week}
                />
              </div>
            </CollapsibleSection>
          )}

          {/* Manager */}
          <CollapsibleSection
            title="💼 Manager"
            badge={manager ? 1 : 0}
            defaultOpen={false}
          >
            <div className="p-3">
              <ManagerPanel
                manager={manager}
                upcomingGig={upcomingGig}
                playerMoney={player.money}
                onHireManager={onHireManager || (() => {})}
                onFireManager={onFireManager || (() => {})}
              />
            </div>
          </CollapsibleSection>

          {/* Band */}
          <CollapsibleSection
            title="🎤 The Band"
            badge={activeBandmates.length}
            defaultOpen={false}
          >
            <div className="p-3">
              <BandRoster bandmates={bandmates} onFireBandmate={onFireBandmate} />
            </div>
          </CollapsibleSection>

          {/* History */}
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
          {/* Two-row layout like the original game */}

          {/* TOP ROW: Unified Story Feed (left) + Stats (right) */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Story Feed - Takes up 2/3 of the width */}
            <div className="col-span-2">
              <WeekFeed
                currentWeek={week}
                currentMessage={currentMessage}
                flavorText={flavorText}
                weekReflection={weekReflection}
                weekLogs={weekLogs}
                newsItems={newsItems}
                isRevealing={isRevealing}
                onRevealComplete={handleRevealComplete}
                typewriterSpeed={15}
                maxHistoryItems={15}
              />
            </div>

            {/* Stats & Band Panel */}
            <div className="space-y-4">
              {/* Game Menu (desktop) */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSaveLoadMode('save')}
                    className="flex-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm rounded transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setSaveLoadMode('load')}
                    className="flex-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm rounded transition-colors"
                  >
                    Load
                  </button>
                  {onNewGame && (
                    <button
                      onClick={onNewGame}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-red-900/50 text-gray-400 hover:text-red-400 text-sm rounded transition-colors"
                    >
                      New
                    </button>
                  )}
                </div>
              </div>

              {/* Key Stats */}
              <KeyStats
                player={player}
                week={week}
                year={year}
                bandName={bandName}
              />

              {/* Streaming & Charts - show when player has released music */}
              {songs.filter(s => s.isReleased).length > 0 && (
                <StreamingStatsPanel
                  player={player}
                  songs={songs}
                  albums={albums}
                  currentWeek={week}
                />
              )}

              {/* Manager Panel */}
              <ManagerPanel
                manager={manager}
                upcomingGig={upcomingGig}
                playerMoney={player.money}
                onHireManager={onHireManager || (() => {})}
                onFireManager={onFireManager || (() => {})}
              />

              {/* Band Roster */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <div className="text-sm font-bold text-white mb-2">The Band</div>
                <BandRoster bandmates={bandmates} onFireBandmate={onFireBandmate} />
              </div>
            </div>
          </div>

          {/* Revealing indicator */}
          {isRevealing && (
            <div className="mt-4 text-center">
              <span className="text-gray-500 text-sm animate-pulse">Week {week} unfolding...</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Selection Modal */}
      <ActionModal
        isOpen={showActions}
        availableActions={availableActions}
        gameState={gameState}
        onSelectAction={onSelectAction}
      />

      {/* Save/Load Modal */}
      {saveLoadMode && onSaveGame && onLoadGame && onDeleteSave && (
        <SaveLoadModal
          isOpen={true}
          mode={saveLoadMode}
          saveSlots={saveSlots}
          currentBandName={bandName}
          currentWeek={week}
          currentYear={year}
          onSave={onSaveGame}
          onLoad={onLoadGame}
          onDelete={onDeleteSave}
          onClose={() => setSaveLoadMode(null)}
        />
      )}

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowMenu(false)}
        />
      )}
    </>
  );
}
