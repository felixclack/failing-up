'use client';

import { useState, useCallback, useMemo } from 'react';
import { GameState, ActionId, TurnResult, GameEvent, EventChoice, PendingNaming, Song, RecordingSession, StudioQuality, StudioOption } from '@/engine/types';
import { createGameState, CreateGameOptions } from '@/engine/state';
import { processTurnWithEvents } from '@/engine/turn';
import { getAvailableActions, generateSongTitle } from '@/engine/actions';
import { applyEventChoice } from '@/engine/events';
import { fireBandmate } from '@/engine/band';
import { generateAlbumTitle } from '@/engine/economy';
import { createRandom } from '@/engine/random';
import { ALL_EVENTS } from '@/data/events';

// Studio options with cost and quality tradeoffs
export const STUDIO_OPTIONS: StudioOption[] = [
  {
    id: 'bedroom',
    label: 'DIY / Bedroom',
    description: 'Record at home with basic gear. Cheap but lo-fi.',
    costPerWeek: 0,
    qualityBonus: 0,
  },
  {
    id: 'basic',
    label: 'Basic Studio',
    description: 'Local rehearsal space with decent equipment.',
    costPerWeek: 75,
    qualityBonus: 15,
  },
  {
    id: 'professional',
    label: 'Professional Studio',
    description: 'Real studio with an engineer. Industry standard.',
    costPerWeek: 200,
    qualityBonus: 30,
  },
  {
    id: 'premium',
    label: 'Premium Studio',
    description: 'Top-tier facility with a name producer. The big leagues.',
    costPerWeek: 500,
    qualityBonus: 50,
  },
];

export interface UseGameReturn {
  // State
  gameState: GameState | null;
  isStarted: boolean;
  lastTurnResult: TurnResult | null;

  // Event state
  pendingEvent: GameEvent | null;
  eventOutcome: EventChoice | null;

  // Naming state
  pendingNaming: PendingNaming | null;

  // Narrative state
  flavorText: string | null;
  weekReflection: string | null;

  // Actions
  startGame: (options: CreateGameOptions) => void;
  takeAction: (actionId: ActionId) => void;
  handleEventChoice: (choice: EventChoice) => void;
  dismissEventOutcome: () => void;
  restartGame: () => void;
  newGame: () => void;
  handleFireBandmate: (bandmateId: string) => void;
  selectStudio: (studioQuality: StudioQuality) => void;
  confirmNaming: (customName: string | null) => void;
  cancelNaming: () => void;

  // Computed
  availableActions: ActionId[];
  currentWeekLog: string | null;
}

export function useGame(): UseGameReturn {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [lastTurnResult, setLastTurnResult] = useState<TurnResult | null>(null);
  const [lastOptions, setLastOptions] = useState<CreateGameOptions | null>(null);

  // Event handling state
  const [pendingEvent, setPendingEvent] = useState<GameEvent | null>(null);
  const [eventOutcome, setEventOutcome] = useState<EventChoice | null>(null);
  const [pendingEventState, setPendingEventState] = useState<GameState | null>(null);

  // Naming flow state
  const [pendingNaming, setPendingNaming] = useState<PendingNaming | null>(null);
  const [pendingNamingTurnResult, setPendingNamingTurnResult] = useState<TurnResult | null>(null);

  const startGame = useCallback((options: CreateGameOptions) => {
    const newState = createGameState(options);
    setGameState(newState);
    setLastTurnResult(null);
    setLastOptions(options);
    setPendingEvent(null);
    setEventOutcome(null);
    setPendingNaming(null);
    setPendingNamingTurnResult(null);
  }, []);

  const takeAction = useCallback((actionId: ActionId) => {
    if (!gameState || gameState.isGameOver) return;
    if (pendingEvent) return; // Can't act while event pending
    if (pendingNaming) return; // Can't act while naming pending

    // Handle all RECORD actions - show studio selection first
    if (actionId === 'RECORD_SINGLE' || actionId === 'RECORD_EP' || actionId === 'RECORD_ALBUM') {
      const unreleasedSongs = gameState.songs.filter(s => !s.isReleased);
      const songCount = actionId === 'RECORD_SINGLE' ? 1
        : actionId === 'RECORD_EP' ? 4 : 8;
      if (unreleasedSongs.length < songCount) return;

      const songIds = unreleasedSongs.slice(0, songCount).map(s => s.id);

      // Show studio selection modal first
      setPendingNaming({
        type: 'studio-selection',
        songIds,
        recordAction: actionId,
      });
      return;
    }

    // Handle STUDIO_WORK - continue recording session
    if (actionId === 'STUDIO_WORK') {
      if (!gameState.recordingSession) return;

      const session = gameState.recordingSession;
      const studioOption = STUDIO_OPTIONS.find(s => s.id === session.studioQuality) || STUDIO_OPTIONS[0];
      const newWeeksRemaining = session.weeksRemaining - 1;
      const newProductionProgress = Math.min(100, session.productionProgress + (100 / session.weeksTotal));

      // Check if recording is complete
      if (newWeeksRemaining <= 0) {
        // Recording complete - create the album
        const rng = createRandom(gameState.seed + gameState.week);
        const newAlbum = {
          id: `album_${gameState.week}_${rng.nextInt(0, 9999)}`,
          title: session.title,
          songIds: session.songIds,
          productionValue: Math.floor(newProductionProgress) + Math.floor(gameState.player.skill / 4) + studioOption.qualityBonus,
          promotionSpend: 0,
          reception: null,
          salesTier: null,
          labelId: gameState.labelDeals.find(d => d.status === 'active')?.id || null,
          weekReleased: gameState.week,
        };

        const newState: GameState = {
          ...gameState,
          albums: [...gameState.albums, newAlbum],
          recordingSession: null,
          player: {
            ...gameState.player,
            burnout: Math.min(100, gameState.player.burnout + 2),
            skill: Math.min(100, gameState.player.skill + 1),
            money: gameState.player.money - session.costPerWeek,
            flags: { ...gameState.player.flags, inStudio: false },
          },
          week: gameState.week + 1,
          year: Math.floor(gameState.week / 52) + 1,
        };

        const label = session.type === 'ep' ? 'EP' : 'album';
        setGameState(newState);
        setLastTurnResult({
          newState,
          actionResult: `You finished recording "${session.title}" - a ${label} with ${session.songIds.length} tracks. Time to let the world hear it.`,
          triggeredEvents: [],
          isGameOver: false,
          gameOverReason: null,
        });
        return;
      }

      // Recording continues
      const newState: GameState = {
        ...gameState,
        recordingSession: {
          ...session,
          weeksRemaining: newWeeksRemaining,
          productionProgress: newProductionProgress,
        },
        player: {
          ...gameState.player,
          burnout: Math.min(100, gameState.player.burnout + 2),
          skill: Math.min(100, gameState.player.skill + 1),
          money: gameState.player.money - session.costPerWeek,
        },
        week: gameState.week + 1,
        year: Math.floor(gameState.week / 52) + 1,
      };

      setGameState(newState);
      setLastTurnResult({
        newState,
        actionResult: `Another week in the studio working on "${session.title}". ${newWeeksRemaining} week${newWeeksRemaining > 1 ? 's' : ''} to go. Production at ${Math.floor(newProductionProgress)}%.`,
        triggeredEvents: [],
        isGameOver: false,
        gameOverReason: null,
      });
      return;
    }

    const result = processTurnWithEvents(gameState, actionId, ALL_EVENTS);

    // Check if a song was produced - if so, show naming modal
    if (result.newState.songs.length > gameState.songs.length) {
      // A new song was added - find it and show naming modal
      const newSong = result.newState.songs[result.newState.songs.length - 1];

      setPendingNaming({
        type: 'song',
        song: newSong,
        generatedTitle: newSong.title,
      });
      setPendingNamingTurnResult(result);
      return;
    }

    // If there's a triggered event, show it before finalizing
    if (result.triggeredEvents.length > 0) {
      setPendingEvent(result.triggeredEvents[0]);
      setPendingEventState(result.newState);
      setLastTurnResult(result);
    } else {
      // No event, just update state
      setGameState(result.newState);
      setLastTurnResult(result);
    }
  }, [gameState, pendingEvent, pendingNaming]);

  const handleEventChoice = useCallback((choice: EventChoice) => {
    if (!pendingEvent || !pendingEventState) return;

    // Apply event choice to state
    const newState = applyEventChoice(pendingEventState, pendingEvent, choice);

    // Show outcome
    setEventOutcome(choice);
    setPendingEventState(newState);
  }, [pendingEvent, pendingEventState]);

  const dismissEventOutcome = useCallback(() => {
    if (!pendingEventState) return;

    // Finalize state with event applied
    setGameState(pendingEventState);

    // Update week log with event info
    if (lastTurnResult && pendingEvent && eventOutcome) {
      const updatedLog = {
        ...lastTurnResult,
        newState: pendingEventState,
      };
      setLastTurnResult(updatedLog);
    }

    // Clear event state
    setPendingEvent(null);
    setEventOutcome(null);
    setPendingEventState(null);
  }, [pendingEventState, lastTurnResult, pendingEvent, eventOutcome]);

  // Studio selection handler
  const selectStudio = useCallback((studioQuality: StudioQuality) => {
    if (!pendingNaming || pendingNaming.type !== 'studio-selection' || !gameState) return;

    const rng = createRandom(gameState.seed + gameState.week + 1000);
    const generatedTitle = generateAlbumTitle(rng);

    if (pendingNaming.recordAction === 'RECORD_SINGLE') {
      setPendingNaming({
        type: 'single',
        songIds: pendingNaming.songIds,
        generatedTitle,
        recordAction: 'RECORD_SINGLE',
        studioQuality,
      });
    } else {
      setPendingNaming({
        type: 'album',
        songIds: pendingNaming.songIds,
        generatedTitle,
        recordAction: pendingNaming.recordAction,
        studioQuality,
      });
    }
  }, [pendingNaming, gameState]);

  // Naming flow handlers
  const confirmNaming = useCallback((customName: string | null) => {
    if (!pendingNaming || !gameState) return;
    // Studio selection is handled separately
    if (pendingNaming.type === 'studio-selection') return;

    const finalName = customName || pendingNaming.generatedTitle;

    if (pendingNaming.type === 'song') {
      // Update the song with the custom name and finalize the turn
      if (!pendingNamingTurnResult) return;

      const updatedSongs = pendingNamingTurnResult.newState.songs.map(song =>
        song.id === pendingNaming.song.id
          ? { ...song, title: finalName }
          : song
      );

      const updatedState = {
        ...pendingNamingTurnResult.newState,
        songs: updatedSongs,
      };

      // Update the message to reflect the custom name
      const updatedResult = {
        ...pendingNamingTurnResult,
        newState: updatedState,
        actionResult: pendingNamingTurnResult.actionResult.replace(
          `"${pendingNaming.generatedTitle}"`,
          `"${finalName}"`
        ),
      };

      // Check for events after naming
      if (updatedResult.triggeredEvents.length > 0) {
        setPendingEvent(updatedResult.triggeredEvents[0]);
        setPendingEventState(updatedState);
        setLastTurnResult(updatedResult);
      } else {
        setGameState(updatedState);
        setLastTurnResult(updatedResult);
      }
    } else if (pendingNaming.type === 'single') {
      // Singles are recorded immediately (1 week)
      const rng = createRandom(gameState.seed + gameState.week);
      const studioOption = STUDIO_OPTIONS.find(s => s.id === pendingNaming.studioQuality) || STUDIO_OPTIONS[0];

      const newAlbum = {
        id: `album_${gameState.week}_${rng.nextInt(0, 9999)}`,
        title: finalName,
        songIds: pendingNaming.songIds,
        productionValue: 50 + Math.floor(gameState.player.skill / 2) + studioOption.qualityBonus,
        promotionSpend: 0,
        reception: null,
        salesTier: null,
        labelId: gameState.labelDeals.find(d => d.status === 'active')?.id || null,
        weekReleased: gameState.week,
      };

      const studioCost = studioOption.costPerWeek;
      const newState: GameState = {
        ...gameState,
        albums: [...gameState.albums, newAlbum],
        player: {
          ...gameState.player,
          burnout: Math.min(100, gameState.player.burnout + 1),
          skill: Math.min(100, gameState.player.skill + 1),
          money: gameState.player.money - studioCost,
        },
        week: gameState.week + 1,
        year: Math.floor(gameState.week / 52) + 1,
      };

      const studioLabel = studioOption.id === 'bedroom' ? 'in your bedroom' : `at ${studioOption.label}`;
      setGameState(newState);
      setLastTurnResult({
        newState,
        actionResult: `You recorded "${finalName}" ${studioLabel}. One track, done in a week.`,
        triggeredEvents: [],
        isGameOver: false,
        gameOverReason: null,
      });
    } else if (pendingNaming.type === 'album') {
      // EPs and Albums start multi-week recording sessions
      const studioOption = STUDIO_OPTIONS.find(s => s.id === pendingNaming.studioQuality) || STUDIO_OPTIONS[0];
      const weeksTotal = pendingNaming.recordAction === 'RECORD_EP' ? 2 : 4;
      const typeLabel = pendingNaming.recordAction === 'RECORD_EP' ? 'EP' : 'album';

      const session: RecordingSession = {
        type: pendingNaming.recordAction === 'RECORD_EP' ? 'ep' : 'album',
        title: finalName,
        songIds: pendingNaming.songIds,
        weeksRemaining: weeksTotal,
        weeksTotal,
        productionProgress: 0,
        studioQuality: studioOption.id,
        costPerWeek: studioOption.costPerWeek,
      };

      const newState: GameState = {
        ...gameState,
        recordingSession: session,
        player: {
          ...gameState.player,
          flags: { ...gameState.player.flags, inStudio: true },
        },
      };

      const studioLabel = studioOption.id === 'bedroom' ? 'your bedroom setup' : studioOption.label;
      setGameState(newState);
      setLastTurnResult({
        newState,
        actionResult: `You've booked ${weeksTotal} weeks to record "${finalName}" at ${studioLabel}. Time to make some noise.`,
        triggeredEvents: [],
        isGameOver: false,
        gameOverReason: null,
      });
    }

    // Clear naming state
    setPendingNaming(null);
    setPendingNamingTurnResult(null);
  }, [pendingNaming, pendingNamingTurnResult, gameState]);

  const cancelNaming = useCallback(() => {
    // Cancel and don't proceed with the action
    setPendingNaming(null);
    setPendingNamingTurnResult(null);
  }, []);

  const restartGame = useCallback(() => {
    if (lastOptions) {
      const newState = createGameState({
        ...lastOptions,
        seed: undefined,
      });
      setGameState(newState);
      setLastTurnResult(null);
      setPendingEvent(null);
      setEventOutcome(null);
      setPendingEventState(null);
      setPendingNaming(null);
      setPendingNamingTurnResult(null);
    }
  }, [lastOptions]);

  const newGame = useCallback(() => {
    setGameState(null);
    setLastTurnResult(null);
    setLastOptions(null);
    setPendingEvent(null);
    setEventOutcome(null);
    setPendingEventState(null);
    setPendingNaming(null);
    setPendingNamingTurnResult(null);
  }, []);

  const handleFireBandmate = useCallback((bandmateId: string) => {
    if (!gameState || gameState.isGameOver) return;
    if (pendingEvent) return; // Can't fire while event pending

    const newState = fireBandmate(gameState, bandmateId);
    setGameState(newState);
  }, [gameState, pendingEvent]);

  const availableActions = useMemo(() => {
    if (!gameState) return [];
    return getAvailableActions(gameState);
  }, [gameState]);

  const currentWeekLog = useMemo(() => {
    if (!lastTurnResult) return null;
    return lastTurnResult.actionResult;
  }, [lastTurnResult]);

  const flavorText = useMemo(() => {
    if (!lastTurnResult) return null;
    return lastTurnResult.flavorText || null;
  }, [lastTurnResult]);

  const weekReflection = useMemo(() => {
    if (!lastTurnResult) return null;
    return lastTurnResult.weekReflection || null;
  }, [lastTurnResult]);

  return {
    gameState,
    isStarted: gameState !== null,
    lastTurnResult,
    pendingEvent,
    eventOutcome,
    pendingNaming,
    flavorText,
    weekReflection,
    startGame,
    takeAction,
    handleEventChoice,
    dismissEventOutcome,
    restartGame,
    newGame,
    handleFireBandmate,
    selectStudio,
    confirmNaming,
    cancelNaming,
    availableActions,
    currentWeekLog,
  };
}
