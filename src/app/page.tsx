'use client';

import { useGame } from '@/hooks/useGame';
import { StartScreen } from '@/components/game/StartScreen';
import { GameScreen } from '@/components/game/GameScreen';
import { EndingScreen } from '@/components/game/EndingScreen';
import { EventModal, EventOutcome } from '@/components/game/EventModal';

export default function Home() {
  const {
    gameState,
    isStarted,
    startGame,
    takeAction,
    restartGame,
    handleFireBandmate,
    availableActions,
    currentWeekLog,
    pendingEvent,
    eventOutcome,
    handleEventChoice,
    dismissEventOutcome,
  } = useGame();

  // Not started - show start screen
  if (!isStarted || !gameState) {
    return (
      <StartScreen
        onStart={(playerName, difficulty) => startGame({ playerName, difficulty })}
      />
    );
  }

  // Game over - show ending
  if (gameState.isGameOver) {
    return (
      <EndingScreen
        gameState={gameState}
        onRestart={restartGame}
      />
    );
  }

  // Playing - show game screen (with optional event overlay)
  return (
    <>
      <GameScreen
        gameState={gameState}
        availableActions={availableActions}
        currentMessage={currentWeekLog}
        onSelectAction={takeAction}
        onFireBandmate={handleFireBandmate}
      />

      {/* Event Modal - show when event triggered but not yet resolved */}
      {pendingEvent && !eventOutcome && (
        <EventModal
          event={pendingEvent}
          onChoice={handleEventChoice}
        />
      )}

      {/* Event Outcome - show after player makes choice */}
      {pendingEvent && eventOutcome && (
        <EventOutcome
          event={pendingEvent}
          choice={eventOutcome}
          onContinue={dismissEventOutcome}
        />
      )}
    </>
  );
}
