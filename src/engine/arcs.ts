/**
 * Arc system - multi-event storylines with progression
 *
 * Arcs are narrative threads that develop over multiple weeks based on
 * player state and actions. Each arc has entry conditions, stages with
 * events, and advancement conditions.
 */

import {
  GameState,
  Arc,
  ArcStage,
  GameEvent,
  EventTriggerConditions,
} from './types';
import { checkTriggerConditions } from './events';
import { RandomGenerator } from './random';

// =============================================================================
// Arc Checking
// =============================================================================

/**
 * Check if an arc's entry conditions are met
 */
export function canEnterArc(
  arc: Arc,
  state: GameState
): boolean {
  // Don't re-enter completed arcs
  if (state.completedArcIds.includes(arc.id)) {
    return false;
  }

  // Don't enter if already active
  if (state.activeArcs.some(a => a.id === arc.id)) {
    return false;
  }

  // Check entry conditions
  return checkTriggerConditions(arc.entryConditions, state);
}

/**
 * Check if an arc stage should advance
 */
export function shouldAdvanceArcStage(
  arc: Arc,
  state: GameState
): boolean {
  const currentStageIndex = arc.currentStage;

  if (currentStageIndex >= arc.stages.length) {
    return false; // Already at final stage
  }

  const currentStage = arc.stages[currentStageIndex];

  if (!currentStage.advanceConditions) {
    return false; // No conditions defined, stays in stage
  }

  return checkTriggerConditions(currentStage.advanceConditions, state);
}

// =============================================================================
// Arc Activation & Progression
// =============================================================================

/**
 * Activate an arc (set it as active with stage 0)
 */
export function activateArc(
  state: GameState,
  arcTemplate: Arc
): GameState {
  // Create a fresh copy of the arc at stage 0
  const activeArc: Arc = {
    ...arcTemplate,
    currentStage: 0,
  };

  return {
    ...state,
    activeArcs: [...state.activeArcs, activeArc],
  };
}

/**
 * Advance an arc to its next stage
 */
export function advanceArc(
  state: GameState,
  arcId: string
): GameState {
  const arcIndex = state.activeArcs.findIndex(a => a.id === arcId);
  if (arcIndex === -1) return state;

  const arc = state.activeArcs[arcIndex];
  const nextStage = arc.currentStage + 1;

  // Check if arc is complete
  if (nextStage >= arc.stages.length) {
    return completeArc(state, arcId);
  }

  // Update arc stage
  const updatedArcs = [...state.activeArcs];
  updatedArcs[arcIndex] = {
    ...arc,
    currentStage: nextStage,
  };

  return {
    ...state,
    activeArcs: updatedArcs,
  };
}

/**
 * Complete an arc (remove from active, add to completed)
 */
export function completeArc(
  state: GameState,
  arcId: string
): GameState {
  return {
    ...state,
    activeArcs: state.activeArcs.filter(a => a.id !== arcId),
    completedArcIds: [...state.completedArcIds, arcId],
  };
}

/**
 * Abort/fail an arc (remove without completing)
 */
export function abortArc(
  state: GameState,
  arcId: string
): GameState {
  return {
    ...state,
    activeArcs: state.activeArcs.filter(a => a.id !== arcId),
  };
}

// =============================================================================
// Arc Event Selection
// =============================================================================

/**
 * Get the current stage of an active arc
 */
export function getCurrentArcStage(arc: Arc): ArcStage | null {
  if (arc.currentStage >= arc.stages.length) {
    return null;
  }
  return arc.stages[arc.currentStage];
}

/**
 * Get arc events that should trigger based on current arc stages
 * Arc events take priority over random events
 */
export function getArcEvents(
  state: GameState,
  allEvents: GameEvent[]
): GameEvent[] {
  const arcEvents: GameEvent[] = [];

  for (const arc of state.activeArcs) {
    const stage = getCurrentArcStage(arc);
    if (!stage) continue;

    // Find events for this stage that haven't been triggered
    for (const eventId of stage.eventIds) {
      if (state.triggeredEventIds.includes(eventId)) continue;

      const event = allEvents.find(e => e.id === eventId);
      if (event) {
        // Check if event conditions are met
        if (checkTriggerConditions(event.triggerConditions, state)) {
          arcEvents.push(event);
        }
      }
    }
  }

  return arcEvents;
}

/**
 * Select an arc event to trigger (prioritizes by arc order and stage)
 */
export function selectArcEvent(
  arcEvents: GameEvent[],
  rng: RandomGenerator
): GameEvent | null {
  if (arcEvents.length === 0) return null;

  // If multiple arc events are eligible, pick one randomly
  // This allows for variation in how arcs unfold
  const index = rng.nextInt(0, arcEvents.length - 1);
  return arcEvents[index];
}

// =============================================================================
// Arc Processing
// =============================================================================

/**
 * Check all arc templates and activate any that meet entry conditions
 */
export function checkAndActivateArcs(
  state: GameState,
  arcTemplates: Arc[]
): GameState {
  let newState = state;

  for (const template of arcTemplates) {
    if (canEnterArc(template, newState)) {
      newState = activateArc(newState, template);
    }
  }

  return newState;
}

/**
 * Check all active arcs and advance any that meet advancement conditions
 */
export function checkAndAdvanceArcs(
  state: GameState
): GameState {
  let newState = state;

  for (const arc of state.activeArcs) {
    if (shouldAdvanceArcStage(arc, newState)) {
      newState = advanceArc(newState, arc.id);
    }
  }

  return newState;
}

/**
 * Get display info for active arcs
 */
export function getActiveArcInfo(state: GameState): Array<{
  id: string;
  name: string;
  currentStage: number;
  totalStages: number;
  stageName?: string;
}> {
  return state.activeArcs.map(arc => ({
    id: arc.id,
    name: arc.name,
    currentStage: arc.currentStage + 1, // 1-indexed for display
    totalStages: arc.stages.length,
  }));
}

// =============================================================================
// Arc State Helpers
// =============================================================================

/**
 * Check if a specific arc is active
 */
export function isArcActive(state: GameState, arcId: string): boolean {
  return state.activeArcs.some(a => a.id === arcId);
}

/**
 * Check if a specific arc is completed
 */
export function isArcCompleted(state: GameState, arcId: string): boolean {
  return state.completedArcIds.includes(arcId);
}

/**
 * Get the current stage number of an active arc (0-indexed)
 */
export function getArcStageNumber(state: GameState, arcId: string): number {
  const arc = state.activeArcs.find(a => a.id === arcId);
  return arc ? arc.currentStage : -1;
}
