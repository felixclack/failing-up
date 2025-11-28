'use client';

import { useState, useCallback, useMemo } from 'react';
import { GameState, ActionId, TurnResult, GameEvent, EventChoice } from '@/engine/types';
import { createGameState, CreateGameOptions } from '@/engine/state';
import { processTurn, processTurnWithEvents } from '@/engine/turn';
import { getAvailableActions } from '@/engine/actions';
import { applyEventChoice } from '@/engine/events';
import { fireBandmate } from '@/engine/band';
import { ALL_EVENTS } from '@/data/events';

export interface UseGameReturn {
  // State
  gameState: GameState | null;
  isStarted: boolean;
  lastTurnResult: TurnResult | null;

  // Event state
  pendingEvent: GameEvent | null;
  eventOutcome: EventChoice | null;

  // Actions
  startGame: (options: CreateGameOptions) => void;
  takeAction: (actionId: ActionId) => void;
  handleEventChoice: (choice: EventChoice) => void;
  dismissEventOutcome: () => void;
  restartGame: () => void;
  handleFireBandmate: (bandmateId: string) => void;

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

  const startGame = useCallback((options: CreateGameOptions) => {
    const newState = createGameState(options);
    setGameState(newState);
    setLastTurnResult(null);
    setLastOptions(options);
    setPendingEvent(null);
    setEventOutcome(null);
  }, []);

  const takeAction = useCallback((actionId: ActionId) => {
    if (!gameState || gameState.isGameOver) return;
    if (pendingEvent) return; // Can't act while event pending

    const result = processTurnWithEvents(gameState, actionId, ALL_EVENTS);

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
  }, [gameState, pendingEvent]);

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
    }
  }, [lastOptions]);

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
    startGame,
    takeAction,
    handleEventChoice,
    dismissEventOutcome,
    restartGame,
    handleFireBandmate,
    availableActions,
    currentWeekLog,
  };
}
