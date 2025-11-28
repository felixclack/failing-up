'use client';

import { useState, useCallback, useMemo } from 'react';
import { GameState, ActionId, TurnResult, GameEvent, EventChoice, PendingNaming, Song } from '@/engine/types';
import { createGameState, CreateGameOptions } from '@/engine/state';
import { processTurnWithEvents } from '@/engine/turn';
import { getAvailableActions, generateSongTitle } from '@/engine/actions';
import { applyEventChoice } from '@/engine/events';
import { fireBandmate } from '@/engine/band';
import { generateAlbumTitle } from '@/engine/economy';
import { createRandom } from '@/engine/random';
import { ALL_EVENTS } from '@/data/events';

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

  // Actions
  startGame: (options: CreateGameOptions) => void;
  takeAction: (actionId: ActionId) => void;
  handleEventChoice: (choice: EventChoice) => void;
  dismissEventOutcome: () => void;
  restartGame: () => void;
  newGame: () => void;
  handleFireBandmate: (bandmateId: string) => void;
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

    // For RECORD action, show album naming first before executing
    if (actionId === 'RECORD') {
      // Check if player has songs to record
      if (gameState.songs.length === 0) {
        // No songs to record - just show a message
        return;
      }

      // Generate album title for suggestion
      const rng = createRandom(gameState.seed + gameState.week + 1000);
      const generatedTitle = generateAlbumTitle(rng);

      // Get song IDs for the album (use all unreleased songs)
      const albumedSongIds = new Set(gameState.albums.flatMap(a => a.songIds));
      const unreleasedSongIds = gameState.songs
        .filter(s => !albumedSongIds.has(s.id))
        .map(s => s.id);

      if (unreleasedSongIds.length === 0) {
        return; // No unreleased songs
      }

      setPendingNaming({
        type: 'album',
        songIds: unreleasedSongIds,
        generatedTitle,
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

  // Naming flow handlers
  const confirmNaming = useCallback((customName: string | null) => {
    if (!pendingNaming || !gameState) return;

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
    } else if (pendingNaming.type === 'album') {
      // Create the album with the custom name
      // For now, we'll just process the RECORD action with the album name
      // TODO: Implement full album recording with the name
      const rng = createRandom(gameState.seed + gameState.week);

      // Simple album creation - in a full implementation this would use createAlbum
      const newAlbum = {
        id: `album_${gameState.week}_${rng.nextInt(0, 9999)}`,
        title: finalName,
        songIds: pendingNaming.songIds,
        productionValue: 50 + Math.floor(gameState.player.skill / 2),
        promotionSpend: 0,
        reception: null,
        salesTier: null,
        labelId: gameState.labelDeals.find(d => d.status === 'active')?.id || null,
        weekReleased: gameState.week,
      };

      const newState = {
        ...gameState,
        albums: [...gameState.albums, newAlbum],
        player: {
          ...gameState.player,
          burnout: Math.min(100, gameState.player.burnout + 3),
          skill: Math.min(100, gameState.player.skill + 1),
        },
        week: gameState.week + 1,
        year: Math.floor(gameState.week / 52) + 1,
      };

      setGameState(newState);
      setLastTurnResult({
        newState,
        actionResult: `You recorded "${finalName}" - an album with ${pendingNaming.songIds.length} tracks.`,
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

  return {
    gameState,
    isStarted: gameState !== null,
    lastTurnResult,
    pendingEvent,
    eventOutcome,
    pendingNaming,
    startGame,
    takeAction,
    handleEventChoice,
    dismissEventOutcome,
    restartGame,
    newGame,
    handleFireBandmate,
    confirmNaming,
    cancelNaming,
    availableActions,
    currentWeekLog,
  };
}
