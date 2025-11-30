/**
 * Event system - random events that trigger based on game state
 */

import {
  GameState,
  GameEvent,
  EventChoice,
  EventTriggerConditions,
  StatDeltas,
  ActionId,
} from './types';
import { RandomGenerator } from './random';
import { getEventChance } from './difficulty';
import { getTotalFans } from './state';

// =============================================================================
// Event Eligibility
// =============================================================================

/**
 * Check if an event's trigger conditions are met
 */
export function checkTriggerConditions(
  conditions: EventTriggerConditions,
  state: GameState,
  currentAction?: ActionId
): boolean {
  const { player, bandmates } = state;

  // Stat range checks
  const totalFans = getTotalFans(player);
  if (conditions.minFans !== undefined && totalFans < conditions.minFans) return false;
  if (conditions.maxFans !== undefined && totalFans > conditions.maxFans) return false;
  if (conditions.minHealth !== undefined && player.health < conditions.minHealth) return false;
  if (conditions.maxHealth !== undefined && player.health > conditions.maxHealth) return false;
  if (conditions.minAddiction !== undefined && player.addiction < conditions.minAddiction) return false;
  if (conditions.maxAddiction !== undefined && player.addiction > conditions.maxAddiction) return false;
  if (conditions.minStability !== undefined && player.stability < conditions.minStability) return false;
  if (conditions.maxStability !== undefined && player.stability > conditions.maxStability) return false;
  if (conditions.minCred !== undefined && player.cred < conditions.minCred) return false;
  if (conditions.maxCred !== undefined && player.cred > conditions.maxCred) return false;
  if (conditions.minIndustryGoodwill !== undefined && player.industryGoodwill < conditions.minIndustryGoodwill) return false;
  if (conditions.minBurnout !== undefined && player.burnout < conditions.minBurnout) return false;
  if (conditions.minMoney !== undefined && player.money < conditions.minMoney) return false;
  if (conditions.maxMoney !== undefined && player.money > conditions.maxMoney) return false;
  if (conditions.minHype !== undefined && player.hype < conditions.minHype) return false;
  if (conditions.maxHype !== undefined && player.hype > conditions.maxHype) return false;
  if (conditions.minImage !== undefined && player.image < conditions.minImage) return false;
  if (conditions.maxImage !== undefined && player.image > conditions.maxImage) return false;
  if (conditions.minSkill !== undefined && player.skill < conditions.minSkill) return false;

  // Streaming era checks
  if (conditions.minFollowers !== undefined && player.followers < conditions.minFollowers) return false;
  if (conditions.maxFollowers !== undefined && player.followers > conditions.maxFollowers) return false;
  if (conditions.minCoreFans !== undefined && player.coreFans < conditions.minCoreFans) return false;
  if (conditions.minAlgoBoost !== undefined && player.algoBoost < conditions.minAlgoBoost) return false;
  if (conditions.maxAlgoBoost !== undefined && player.algoBoost > conditions.maxAlgoBoost) return false;
  if (conditions.minCataloguePower !== undefined && player.cataloguePower < conditions.minCataloguePower) return false;
  if (conditions.minReleasedSongs !== undefined) {
    const releasedCount = state.songs.filter(s => s.isReleased).length;
    if (releasedCount < conditions.minReleasedSongs) return false;
  }

  // Time checks
  if (conditions.minWeek !== undefined && state.week < conditions.minWeek) return false;

  // Flag checks
  if (conditions.onTour !== undefined && player.flags.onTour !== conditions.onTour) return false;
  if (conditions.inStudio !== undefined && player.flags.inStudio !== conditions.inStudio) return false;
  if (conditions.hasLabelDeal !== undefined && player.flags.hasLabelDeal !== conditions.hasLabelDeal) return false;

  // Band checks
  const activeBandmates = bandmates.filter(b => b.status === 'active');
  if (conditions.minBandSize !== undefined && activeBandmates.length < conditions.minBandSize) return false;
  if (conditions.minBandmates !== undefined && activeBandmates.length < conditions.minBandmates) return false;

  if (conditions.minBandVice !== undefined) {
    const avgVice = activeBandmates.length > 0
      ? activeBandmates.reduce((sum, b) => sum + b.vice, 0) / activeBandmates.length
      : 0;
    if (avgVice < conditions.minBandVice) return false;
  }

  // Custom flag check (for event-specific flags stored in triggeredEventIds or custom flags)
  if (conditions.hasFlag !== undefined) {
    // Check if the flag exists in triggeredEventIds or custom flags
    const hasCustomFlag = state.triggeredEventIds.some(id => id === conditions.hasFlag);
    if (!hasCustomFlag) return false;
  }

  // Genre/style check
  if (conditions.preferredStyle !== undefined && state.preferredStyle !== conditions.preferredStyle) {
    return false;
  }

  // Gig check - only trigger if a gig happened this week
  if (conditions.hadGigThisWeek !== undefined) {
    const hadGig = state.lastGigResult !== null &&
                   state.lastGigResult.gig.week === state.week - 1; // Gig was resolved last turn
    if (conditions.hadGigThisWeek !== hadGig) return false;
  }

  // Album checks
  const releasedAlbums = state.albums.filter(a => a.weekReleased !== null);
  if (conditions.minReleasedAlbums !== undefined && releasedAlbums.length < conditions.minReleasedAlbums) {
    return false;
  }
  if (conditions.releasedAlbumRecently !== undefined) {
    // Check if an album was released in the last 4 weeks
    const recentAlbum = releasedAlbums.some(a =>
      a.weekReleased !== null && state.week - a.weekReleased <= 4
    );
    if (conditions.releasedAlbumRecently !== recentAlbum) return false;
  }

  return true;
}

/**
 * Check if an event is eligible to trigger
 */
export function isEventEligible(
  event: GameEvent,
  state: GameState,
  currentAction?: ActionId
): boolean {
  // Check if one-time event already triggered
  if (event.oneTime && state.triggeredEventIds.includes(event.id)) {
    return false;
  }

  // Check if action requirement is met
  if (event.requiredAction && event.requiredAction !== currentAction) {
    return false;
  }

  // Check trigger conditions
  return checkTriggerConditions(event.triggerConditions, state, currentAction);
}

/**
 * Get all eligible events for current state
 */
export function getEligibleEvents(
  events: GameEvent[],
  state: GameState,
  currentAction?: ActionId
): GameEvent[] {
  return events.filter(event => isEventEligible(event, state, currentAction));
}

// =============================================================================
// Event Selection
// =============================================================================

/**
 * Select a random event using weighted selection
 */
export function selectRandomEvent(
  eligibleEvents: GameEvent[],
  rng: RandomGenerator
): GameEvent | null {
  if (eligibleEvents.length === 0) return null;

  // Calculate total weight
  const totalWeight = eligibleEvents.reduce((sum, event) => sum + event.weight, 0);

  // Roll for selection
  const roll = rng.nextFloat(0, totalWeight);

  // Find selected event
  let cumulative = 0;
  for (const event of eligibleEvents) {
    cumulative += event.weight;
    if (roll < cumulative) {
      return event;
    }
  }

  // Fallback (shouldn't happen)
  return eligibleEvents[eligibleEvents.length - 1];
}

/**
 * Determine if an event should trigger this turn
 * Base chance modified by various factors and difficulty
 */
export function shouldEventTrigger(
  state: GameState,
  rng: RandomGenerator,
  baseChance: number = 0.4
): boolean {
  // Apply difficulty multiplier to base chance
  let chance = getEventChance(baseChance, state.difficultySettings);

  // Higher addiction increases event chance
  if (state.player.addiction >= 50) {
    chance += 0.1;
  }
  if (state.player.addiction >= 70) {
    chance += 0.1;
  }

  // Low stability increases event chance
  if (state.player.stability <= 30) {
    chance += 0.1;
  }

  // High burnout increases event chance
  if (state.player.burnout >= 60) {
    chance += 0.1;
  }

  // Cap at 90% (slightly higher cap with difficulty multiplier)
  chance = Math.min(0.9, chance);

  return rng.next() < chance;
}

// =============================================================================
// Event Resolution
// =============================================================================

/**
 * Apply an event choice's effects to game state
 */
export function applyEventChoice(
  state: GameState,
  event: GameEvent,
  choice: EventChoice
): GameState {
  let newState = { ...state };

  // Apply stat changes
  if (choice.statChanges) {
    const player = { ...newState.player };

    if (choice.statChanges.talent !== undefined) {
      player.talent = Math.max(0, Math.min(100, player.talent + choice.statChanges.talent));
    }
    if (choice.statChanges.skill !== undefined) {
      player.skill = Math.max(0, Math.min(100, player.skill + choice.statChanges.skill));
    }
    if (choice.statChanges.image !== undefined) {
      player.image = Math.max(0, Math.min(100, player.image + choice.statChanges.image));
    }
    if (choice.statChanges.fans !== undefined) {
      // Legacy 'fans' delta is applied to coreFans for backward compatibility
      player.coreFans = Math.max(0, player.coreFans + choice.statChanges.fans);
    }
    if (choice.statChanges.coreFans !== undefined) {
      player.coreFans = Math.max(0, player.coreFans + choice.statChanges.coreFans);
    }
    if (choice.statChanges.casualListeners !== undefined) {
      player.casualListeners = Math.max(0, player.casualListeners + choice.statChanges.casualListeners);
    }
    if (choice.statChanges.followers !== undefined) {
      player.followers = Math.max(0, player.followers + choice.statChanges.followers);
    }
    if (choice.statChanges.algoBoost !== undefined) {
      player.algoBoost = Math.max(0, Math.min(100, player.algoBoost + choice.statChanges.algoBoost));
    }
    if (choice.statChanges.cataloguePower !== undefined) {
      player.cataloguePower = Math.max(0, Math.min(100, player.cataloguePower + choice.statChanges.cataloguePower));
    }
    if (choice.statChanges.hype !== undefined) {
      player.hype = Math.max(0, Math.min(100, player.hype + choice.statChanges.hype));
    }
    if (choice.statChanges.money !== undefined) {
      player.money = player.money + choice.statChanges.money;
    }
    if (choice.statChanges.health !== undefined) {
      player.health = Math.max(0, Math.min(100, player.health + choice.statChanges.health));
    }
    if (choice.statChanges.stability !== undefined) {
      player.stability = Math.max(0, Math.min(100, player.stability + choice.statChanges.stability));
    }
    if (choice.statChanges.cred !== undefined) {
      player.cred = Math.max(0, Math.min(100, player.cred + choice.statChanges.cred));
    }
    if (choice.statChanges.addiction !== undefined) {
      player.addiction = Math.max(0, Math.min(100, player.addiction + choice.statChanges.addiction));
    }
    if (choice.statChanges.industryGoodwill !== undefined) {
      player.industryGoodwill = Math.max(0, Math.min(100, player.industryGoodwill + choice.statChanges.industryGoodwill));
    }
    if (choice.statChanges.burnout !== undefined) {
      player.burnout = Math.max(0, Math.min(100, player.burnout + choice.statChanges.burnout));
    }

    newState.player = player;
  }

  // Apply bandmate changes
  if (choice.bandmateChanges && newState.bandmates.length > 0) {
    const bandmates = newState.bandmates.map(b => {
      if (b.status !== 'active') return b;

      let updated = { ...b };
      if (choice.bandmateChanges!.loyalty !== undefined) {
        updated.loyalty = Math.max(0, Math.min(100, b.loyalty + choice.bandmateChanges!.loyalty));
      }
      if (choice.bandmateChanges!.reliability !== undefined) {
        updated.reliability = Math.max(0, Math.min(100, b.reliability + choice.bandmateChanges!.reliability));
      }
      return updated;
    });
    newState.bandmates = bandmates;
  }

  // Apply flag changes
  if (choice.flagsSet || choice.flagsClear) {
    const flags = { ...newState.player.flags };
    let triggeredIds = [...newState.triggeredEventIds];

    if (choice.flagsSet) {
      for (const flag of choice.flagsSet) {
        if (flag in flags) {
          // Predefined flag
          (flags as any)[flag] = true;
        } else {
          // Custom flag - store in triggeredEventIds for hasFlag checks
          if (!triggeredIds.includes(flag)) {
            triggeredIds.push(flag);
          }
        }
      }
    }

    if (choice.flagsClear) {
      for (const flag of choice.flagsClear) {
        if (flag in flags) {
          // Predefined flag
          (flags as any)[flag] = false;
        } else {
          // Custom flag - remove from triggeredEventIds
          triggeredIds = triggeredIds.filter(id => id !== flag);
        }
      }
    }

    newState.player = { ...newState.player, flags };
    newState.triggeredEventIds = triggeredIds;
  }

  // Mark one-time event as triggered
  if (event.oneTime) {
    newState.triggeredEventIds = [...newState.triggeredEventIds, event.id];
  }

  return newState;
}

// =============================================================================
// Event Data Types for External Use
// =============================================================================

export interface PendingEvent {
  event: GameEvent;
  resolved: boolean;
  chosenChoice?: EventChoice;
}

export interface EventResolution {
  eventId: string;
  choiceId: string;
  outcomeText: string;
}
