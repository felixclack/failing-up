'use client';

import { useGame } from '@/hooks/useGame';
import { StartScreen } from '@/components/game/StartScreen';
import { GameScreen } from '@/components/game/GameScreen';
import { EndingScreen } from '@/components/game/EndingScreen';
import { EventModal, EventOutcome } from '@/components/game/EventModal';
import { NamingModal } from '@/components/game/NamingModal';
import { StudioSelectionModal } from '@/components/game/StudioSelectionModal';
import { SongSelectionModal } from '@/components/game/SongSelectionModal';
import { TemptationModal, TemptationOutcome } from '@/components/game/TemptationModal';
import { GigOutcomeModal } from '@/components/game/GigOutcomeModal';
import { GigNotificationModal } from '@/components/game/GigNotificationModal';
import { ManagerHireModal } from '@/components/game/ManagerPanel';
import { TourSelectionModal } from '@/components/game/TourSelectionModal';
import { SupportSlotModal } from '@/components/game/SupportSlotModal';
import { ReleaseSelectionModal } from '@/components/game/ReleaseSelectionModal';
import { WriteAndRecordStudioModal } from '@/components/game/WriteAndRecordStudioModal';
import { getTotalFans } from '@/engine/state';

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
    pendingTemptation,
    temptationOutcome,
    handleTemptationChoice,
    dismissTemptationOutcome,
    pendingNaming,
    selectSongsForRecording,
    selectStudio,
    confirmNaming,
    cancelNaming,
    flavorText,
    weekReflection,
    pendingGigResult,
    showManagerHiring,
    managerCandidates,
    openManagerHiring,
    selectManager,
    cancelManagerHiring,
    handleFireManager,
    dismissGigResult,
    pendingGigDecision,
    acceptGig,
    declineGig,
    showTourSelection,
    selectTour,
    cancelTourSelection,
    showReleaseSelection,
    selectRelease,
    cancelReleaseSelection,
    pendingSupportSlotOffer,
    acceptSupportSlot,
    declineSupportSlot,
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
        onHireManager={openManagerHiring}
        onFireManager={handleFireManager}
      />

      {/* Gig Notification Modal - show when manager books a gig */}
      {pendingGigDecision && gameState.manager && (
        <GigNotificationModal
          gig={pendingGigDecision}
          managerName={gameState.manager.name}
          onAccept={acceptGig}
          onDecline={declineGig}
        />
      )}

      {/* Gig Outcome Modal - show when a gig resolves */}
      {pendingGigResult && (
        <GigOutcomeModal
          gigResult={pendingGigResult}
          onContinue={dismissGigResult}
        />
      )}

      {/* Manager Hiring Modal - show when looking for manager */}
      {showManagerHiring && (
        <ManagerHireModal
          candidates={managerCandidates}
          playerMoney={gameState.player.money}
          onSelectManager={selectManager}
          onCancel={cancelManagerHiring}
        />
      )}

      {/* Tour Selection Modal - show when player wants to go on tour */}
      {showTourSelection && (
        <TourSelectionModal
          playerMoney={gameState.player.money}
          playerFans={getTotalFans(gameState.player)}
          hasLabelDeal={gameState.player.flags.hasLabelDeal}
          onSelectTour={selectTour}
          onCancel={cancelTourSelection}
        />
      )}

      {/* Release Selection Modal - show when player wants to release recorded music */}
      {showReleaseSelection && (
        <ReleaseSelectionModal
          albums={gameState.albums}
          songs={gameState.songs}
          onConfirm={selectRelease}
          onCancel={cancelReleaseSelection}
        />
      )}

      {/* Support Slot Offer Modal - show when a bigger band offers a support slot */}
      {pendingSupportSlotOffer && (
        <SupportSlotModal
          offer={pendingSupportSlotOffer}
          currentWeek={gameState.week}
          onAccept={acceptSupportSlot}
          onDecline={declineSupportSlot}
        />
      )}

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

      {/* Song Selection Modal - show when player starts recording to pick songs */}
      {pendingNaming && pendingNaming.type === 'song-selection' && (
        <SongSelectionModal
          songs={gameState.songs.filter(s => !s.isReleased)}
          recordAction={pendingNaming.recordAction}
          onConfirm={selectSongsForRecording}
          onCancel={cancelNaming}
        />
      )}

      {/* Studio Selection Modal - show after song selection */}
      {pendingNaming && pendingNaming.type === 'studio-selection' && (
        <StudioSelectionModal
          pending={pendingNaming}
          playerMoney={gameState.player.money}
          onSelectStudio={selectStudio}
          onCancel={cancelNaming}
        />
      )}

      {/* Write-and-Record Studio Selection Modal */}
      {pendingNaming && pendingNaming.type === 'write-and-record-studio' && (
        <WriteAndRecordStudioModal
          playerMoney={gameState.player.money}
          onSelectStudio={selectStudio}
          onCancel={cancelNaming}
        />
      )}

      {/* Naming Modal - show when player writes a song or records an album */}
      {pendingNaming && pendingNaming.type !== 'studio-selection' && pendingNaming.type !== 'song-selection' && pendingNaming.type !== 'write-and-record-studio' && (
        <NamingModal
          pending={pendingNaming}
          onConfirm={confirmNaming}
          onCancel={cancelNaming}
        />
      )}

      {/* Temptation Modal - show when a temptation triggers */}
      {pendingTemptation && !temptationOutcome && (
        <TemptationModal
          temptation={pendingTemptation}
          onChoice={handleTemptationChoice}
        />
      )}

      {/* Temptation Outcome - show after player makes choice */}
      {pendingTemptation && temptationOutcome && (
        <TemptationOutcome
          temptation={pendingTemptation}
          choice={temptationOutcome}
          onContinue={dismissTemptationOutcome}
        />
      )}
    </>
  );
}
