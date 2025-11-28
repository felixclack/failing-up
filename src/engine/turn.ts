/**
 * Main turn resolution system
 * Handles the weekly game loop: costs -> action -> events -> stat updates -> game over check
 */

import {
  GameState,
  ActionId,
  TurnResult,
  WeekLog,
  StatDeltas,
  GameOverReason,
  Song,
  GameEvent,
} from './types';
import { applyStatDeltas, weekToYear } from './state';
import { executeAction, ACTIONS } from './actions';
import { createRandom } from './random';
import {
  getEligibleEvents,
  selectRandomEvent,
  shouldEventTrigger,
} from './events';
import {
  getHypeDecay,
  getHealthLoss,
  getBurnoutGain,
} from './difficulty';
import {
  checkAndActivateArcs,
  checkAndAdvanceArcs,
  getArcEvents,
  selectArcEvent,
} from './arcs';
import { ALL_ARCS } from '@/data/arcs';

// =============================================================================
// Constants
// =============================================================================

// Hype decays by this much each week (before any gains)
export const HYPE_DECAY_RATE = 3;

// Fans can slowly decay if no activity (very slow)
export const FAN_DECAY_THRESHOLD_WEEKS = 8; // Start decay after this many inactive weeks
export const FAN_DECAY_RATE = 0.01; // 1% per week after threshold

// Health thresholds
export const CRITICAL_HEALTH = 20;
export const DEATH_HEALTH = 0;

// Addiction thresholds
export const HIGH_ADDICTION = 70;
export const CRITICAL_ADDICTION = 90;

// Money thresholds
export const DEEPLY_IN_DEBT = -1000;

// =============================================================================
// Weekly Costs
// =============================================================================

/**
 * Apply fixed weekly costs (living expenses)
 */
function applyWeeklyCosts(state: GameState): GameState {
  const costDeltas: StatDeltas = {
    money: -state.weeklyLivingCost,
  };

  return {
    ...state,
    player: applyStatDeltas(state.player, costDeltas),
  };
}

// =============================================================================
// Stat Updates (End of Week)
// =============================================================================

/**
 * Apply hype decay (modified by difficulty)
 */
function applyHypeDecay(state: GameState): GameState {
  const currentHype = state.player.hype;
  const decayAmount = getHypeDecay(HYPE_DECAY_RATE, state.difficultySettings);
  const newHype = Math.max(0, currentHype - decayAmount);

  if (newHype === currentHype) return state;

  return {
    ...state,
    player: {
      ...state.player,
      hype: newHype,
    },
  };
}

/**
 * Apply addiction effects on health/stability
 * High addiction causes gradual damage (modified by difficulty)
 */
function applyAddictionEffects(state: GameState): GameState {
  const { addiction, health, stability } = state.player;

  if (addiction < 30) return state;

  let baseHealthDrain = 0;
  let baseStabilityDrain = 0;

  if (addiction >= CRITICAL_ADDICTION) {
    baseHealthDrain = 3;
    baseStabilityDrain = 3;
  } else if (addiction >= HIGH_ADDICTION) {
    baseHealthDrain = 2;
    baseStabilityDrain = 2;
  } else if (addiction >= 50) {
    baseHealthDrain = 1;
    baseStabilityDrain = 1;
  }

  if (baseHealthDrain === 0 && baseStabilityDrain === 0) return state;

  // Apply difficulty multiplier to health loss
  const healthDrain = getHealthLoss(baseHealthDrain, state.difficultySettings);
  const stabilityDrain = getHealthLoss(baseStabilityDrain, state.difficultySettings);

  return {
    ...state,
    player: {
      ...state.player,
      health: Math.max(0, health - healthDrain),
      stability: Math.max(0, stability - stabilityDrain),
    },
  };
}

/**
 * Apply burnout effects
 * High burnout affects skill growth and stability (modified by difficulty)
 */
function applyBurnoutEffects(state: GameState): GameState {
  const { burnout, stability } = state.player;

  if (burnout < 50) return state;

  // High burnout drains stability (base values scaled by difficulty)
  const baseDrain = burnout >= 80 ? 2 : 1;
  const stabilityDrain = getBurnoutGain(baseDrain, state.difficultySettings);

  return {
    ...state,
    player: {
      ...state.player,
      stability: Math.max(0, stability - stabilityDrain),
    },
  };
}

/**
 * Apply all end-of-week stat updates
 */
function applyEndOfWeekUpdates(state: GameState): GameState {
  let newState = state;
  newState = applyHypeDecay(newState);
  newState = applyAddictionEffects(newState);
  newState = applyBurnoutEffects(newState);
  return newState;
}

// =============================================================================
// Game Over Checks
// =============================================================================

/**
 * Check if game is over and determine reason
 */
function checkGameOver(state: GameState): GameOverReason | null {
  const { player, week, maxWeeks, bandmates } = state;

  // Death from health
  if (player.health <= DEATH_HEALTH) {
    return 'death';
  }

  // Death from critical health + high addiction
  if (player.health <= CRITICAL_HEALTH && player.addiction >= CRITICAL_ADDICTION) {
    // High chance of death when both are critical
    const rng = createRandom(state.seed + week);
    if (rng.next() < 0.3) {
      return 'death';
    }
  }

  // Broke and blacklisted
  if (player.money <= DEEPLY_IN_DEBT && player.industryGoodwill <= 10) {
    return 'broke';
  }

  // Time limit
  if (week >= maxWeeks) {
    return 'time_limit';
  }

  // Band collapsed (no active members)
  const activeBandmates = bandmates.filter(b => b.status === 'active');
  if (activeBandmates.length === 0 && bandmates.length > 0) {
    return 'band_collapsed';
  }

  return null;
}

// =============================================================================
// Main Turn Resolution
// =============================================================================

/**
 * Process a single week/turn
 *
 * Order of operations:
 * 1. Apply weekly costs (living expenses)
 * 2. Execute chosen action
 * 3. Apply action results to state
 * 4. (Future: Resolve events)
 * 5. Apply end-of-week stat updates (decay, addiction effects, etc.)
 * 6. Advance week counter
 * 7. Check for game over
 */
export function processTurn(
  state: GameState,
  actionId: ActionId
): TurnResult {
  // Create RNG for this turn
  const rng = createRandom(state.seed + state.week);

  let newState = { ...state };

  // 1. Apply weekly costs
  newState = applyWeeklyCosts(newState);

  // 2. Execute chosen action
  const actionResult = executeAction(actionId, newState, rng);

  // 3. Apply action results
  if (actionResult.success) {
    newState = {
      ...newState,
      player: applyStatDeltas(newState.player, actionResult.statChanges),
    };

    // If action produced a song, add it
    if (actionResult.producedSongId) {
      const action = ACTIONS[actionId];
      // Reconstruct the song from the action result
      // In a real implementation, we'd pass the song object through
      // For now, we'll create a placeholder that will be replaced with proper song handling
      const newSong: Song = {
        id: actionResult.producedSongId,
        title: actionResult.message.match(/"([^"]+)"/)?.[1] || 'Untitled',
        quality: 50, // Will be properly set in full implementation
        style: 'rock' as any,
        hitPotential: 30,
        writtenByPlayer: true,
        weekWritten: newState.week,
      };
      newState = {
        ...newState,
        songs: [...newState.songs, newSong],
      };
    }
  }

  // 4. TODO: Resolve events (Milestone 2)

  // 5. Apply end-of-week stat updates
  newState = applyEndOfWeekUpdates(newState);

  // 6. Advance week counter
  newState = {
    ...newState,
    week: newState.week + 1,
    year: weekToYear(newState.week + 1),
  };

  // 7. Check for game over
  const gameOverReason = checkGameOver(newState);
  if (gameOverReason) {
    newState = {
      ...newState,
      isGameOver: true,
      gameOverReason,
    };
  }

  // Record in week log
  const weekLog: WeekLog = {
    week: state.week,
    action: actionId,
    actionResult: actionResult.message,
    events: [], // TODO: Milestone 2
    statChanges: actionResult.statChanges,
  };

  newState = {
    ...newState,
    weekLogs: [...newState.weekLogs, weekLog],
  };

  return {
    newState,
    actionResult: actionResult.message,
    triggeredEvents: [],
    isGameOver: newState.isGameOver,
    gameOverReason: newState.gameOverReason,
  };
}

/**
 * Process a turn with event triggering
 * Events are selected but not resolved - the UI handles choice selection
 */
export function processTurnWithEvents(
  state: GameState,
  actionId: ActionId,
  allEvents: GameEvent[]
): TurnResult {
  // Create RNG for this turn
  const rng = createRandom(state.seed + state.week);

  let newState = { ...state };

  // 1. Apply weekly costs
  newState = applyWeeklyCosts(newState);

  // 2. Execute chosen action
  const actionResult = executeAction(actionId, newState, rng);

  // 3. Apply action results
  if (actionResult.success) {
    newState = {
      ...newState,
      player: applyStatDeltas(newState.player, actionResult.statChanges),
    };

    // If action produced a song, add it
    // Use the full song object if available, otherwise reconstruct from ID
    if (actionResult.producedSong) {
      newState = {
        ...newState,
        songs: [...newState.songs, actionResult.producedSong],
      };
    } else if (actionResult.producedSongId) {
      // Fallback for backwards compatibility
      const newSong: Song = {
        id: actionResult.producedSongId,
        title: actionResult.message.match(/"([^"]+)"/)?.[1] || 'Untitled',
        quality: 50,
        style: 'rock' as any,
        hitPotential: 30,
        writtenByPlayer: true,
        weekWritten: newState.week,
      };
      newState = {
        ...newState,
        songs: [...newState.songs, newSong],
      };
    }
  }

  // 4. Check and activate new arcs
  newState = checkAndActivateArcs(newState, ALL_ARCS);

  // 5. Check for and select events (arc events have priority)
  const triggeredEvents: GameEvent[] = [];

  // First, check for arc events
  const arcEvents = getArcEvents(newState, allEvents);
  const arcEvent = selectArcEvent(arcEvents, rng);

  if (arcEvent) {
    // Arc event takes priority
    triggeredEvents.push(arcEvent);
  } else if (shouldEventTrigger(newState, rng)) {
    // No arc event, try random events
    const eligibleEvents = getEligibleEvents(allEvents, newState, actionId);
    const selectedEvent = selectRandomEvent(eligibleEvents, rng);

    if (selectedEvent) {
      triggeredEvents.push(selectedEvent);
    }
  }

  // 6. Check and advance arcs based on conditions
  newState = checkAndAdvanceArcs(newState);

  // 7. Apply end-of-week stat updates
  newState = applyEndOfWeekUpdates(newState);

  // 8. Advance week counter
  newState = {
    ...newState,
    week: newState.week + 1,
    year: weekToYear(newState.week + 1),
  };

  // 9. Check for game over
  const gameOverReason = checkGameOver(newState);
  if (gameOverReason) {
    newState = {
      ...newState,
      isGameOver: true,
      gameOverReason,
    };
  }

  // 10. Record in week log
  const weekLog: WeekLog = {
    week: state.week,
    action: actionId,
    actionResult: actionResult.message,
    events: [], // Will be updated when event is resolved
    statChanges: actionResult.statChanges,
  };

  newState = {
    ...newState,
    weekLogs: [...newState.weekLogs, weekLog],
  };

  return {
    newState,
    actionResult: actionResult.message,
    triggeredEvents,
    isGameOver: newState.isGameOver,
    gameOverReason: newState.gameOverReason,
  };
}

// =============================================================================
// State Queries
// =============================================================================

/**
 * Get a summary of current game state for display
 */
export function getStateSummary(state: GameState): {
  week: number;
  year: number;
  weekInYear: number;
  isGameOver: boolean;
  gameOverReason: GameOverReason | null;
} {
  return {
    week: state.week,
    year: state.year,
    weekInYear: ((state.week - 1) % 52) + 1,
    isGameOver: state.isGameOver,
    gameOverReason: state.gameOverReason,
  };
}
