'use client';

import { useState, useCallback, useMemo } from 'react';
import { GameState, ActionId, TurnResult } from '@/engine/types';
import { createGameState, CreateGameOptions } from '@/engine/state';
import { processTurn } from '@/engine/turn';
import { getAvailableActions, ACTIONS } from '@/engine/actions';

export interface UseGameReturn {
  // State
  gameState: GameState | null;
  isStarted: boolean;
  lastTurnResult: TurnResult | null;

  // Actions
  startGame: (options: CreateGameOptions) => void;
  takeAction: (actionId: ActionId) => void;
  restartGame: () => void;

  // Computed
  availableActions: ActionId[];
  currentWeekLog: string | null;
}

export function useGame(): UseGameReturn {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [lastTurnResult, setLastTurnResult] = useState<TurnResult | null>(null);
  const [lastOptions, setLastOptions] = useState<CreateGameOptions | null>(null);

  const startGame = useCallback((options: CreateGameOptions) => {
    const newState = createGameState(options);
    setGameState(newState);
    setLastTurnResult(null);
    setLastOptions(options);
  }, []);

  const takeAction = useCallback((actionId: ActionId) => {
    if (!gameState || gameState.isGameOver) return;

    const result = processTurn(gameState, actionId);
    setGameState(result.newState);
    setLastTurnResult(result);
  }, [gameState]);

  const restartGame = useCallback(() => {
    if (lastOptions) {
      // Create new game with new seed
      const newState = createGameState({
        ...lastOptions,
        seed: undefined, // Generate new seed
      });
      setGameState(newState);
      setLastTurnResult(null);
    }
  }, [lastOptions]);

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
    startGame,
    takeAction,
    restartGame,
    availableActions,
    currentWeekLog,
  };
}
