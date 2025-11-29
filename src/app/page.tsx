'use client';

import { useGame } from '@/hooks/useGame';
import { StartScreen } from '@/components/game/StartScreen';
import { GameScreen } from '@/components/game/GameScreen';
import { EndingScreen } from '@/components/game/EndingScreen';
import { EventModal, EventOutcome } from '@/components/game/EventModal';
import { NamingModal } from '@/components/game/NamingModal';
import { StudioSelectionModal } from '@/components/game/StudioSelectionModal';

export default function Home() {
  const {
    gameState,
    isStarted,
    startGame,
    takeAction,
    restartGame,
    newGame,
    handleFireBandmate,
    availableActions,
    currentWeekLog,
    pendingEvent,
    eventOutcome,
    handleEventChoice,
    dismissEventOutcome,
    pendingNaming,
    selectStudio,
    confirmNaming,
    cancelNaming,
    flavorText,
    weekReflection,
  } = useGame();

  // Not started - show start screen
  if (!isStarted || !gameState) {
    return (
      <StartScreen
        onStart={(playerName, bandName, difficulty, talentLevel, preferredStyle) =>
          startGame({ playerName, bandName, difficulty, talentLevel, preferredStyle })
        }
      />
    );
  }

  // Game over - show ending
  if (gameState.isGameOver) {
    return (
      <EndingScreen
        gameState={gameState}
        onPlayAgain={restartGame}
        onNewGame={newGame}
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
        flavorText={flavorText}
        weekReflection={weekReflection}
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

      {/* Studio Selection Modal - show when player starts recording */}
      {pendingNaming && pendingNaming.type === 'studio-selection' && (
        <StudioSelectionModal
          pending={pendingNaming}
          playerMoney={gameState.player.money}
          onSelectStudio={selectStudio}
          onCancel={cancelNaming}
        />
      )}

      {/* Naming Modal - show when player writes a song or records an album */}
      {pendingNaming && pendingNaming.type !== 'studio-selection' && (
        <NamingModal
          pending={pendingNaming}
          onConfirm={confirmNaming}
          onCancel={cancelNaming}
        />
      )}
    </>
  );
}
