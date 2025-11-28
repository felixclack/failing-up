/**
 * Band management system - hiring, firing, dynamics, and performance
 */

import {
  GameState,
  Bandmate,
  BandmateRole,
  BandmateStatus,
} from './types';
import { RandomGenerator } from './random';
import { getTotalFans } from './state';

// =============================================================================
// Constants
// =============================================================================

// Cost to find and audition new bandmates
export const AUDITION_COST = 50;

// Loyalty thresholds
export const LOYALTY_QUIT_THRESHOLD = 15;
export const LOYALTY_ULTIMATUM_THRESHOLD = 30;

// Vice thresholds
export const VICE_TROUBLE_THRESHOLD = 60;
export const VICE_DISASTER_THRESHOLD = 80;

// Reliability thresholds
export const RELIABILITY_FLAKE_THRESHOLD = 30;

// =============================================================================
// Bandmate Generation
// =============================================================================

const FIRST_NAMES = [
  'Johnny', 'Vinnie', 'Tommy', 'Richie', 'Eddie', 'Bobby', 'Danny', 'Mickey',
  'Spike', 'Slash', 'Axl', 'Duff', 'Izzy', 'Nikki', 'Vince', 'Mick',
  'Joey', 'Dee Dee', 'Marky', 'CJ', 'Sid', 'Steve', 'Paul', 'Gene',
  'Billy', 'Ziggy', 'Lou', 'Iggy', 'Kurt', 'Dave', 'Flea', 'Chad',
];

const LAST_NAMES = [
  'Rotten', 'Vicious', 'Thunder', 'Steel', 'Blaze', 'Stone', 'Crash', 'Wild',
  'Savage', 'Mars', 'Sixx', 'Neil', 'Lee', 'Rose', 'Stradlin', 'McKagan',
  'Ramone', 'Strummer', 'Jones', 'Headon', 'Simmons', 'Stanley', 'Frehley',
  'Idol', 'Pop', 'Reed', 'Bowie', 'Cobain', 'Grohl', 'Novoselic',
];

/**
 * Generate a random bandmate name
 */
function generateBandmateName(rng: RandomGenerator, usedNames: string[]): string {
  let name: string;
  let attempts = 0;

  do {
    const firstName = FIRST_NAMES[rng.nextInt(0, FIRST_NAMES.length - 1)];
    const lastName = LAST_NAMES[rng.nextInt(0, LAST_NAMES.length - 1)];
    name = `${firstName} ${lastName}`;
    attempts++;
  } while (usedNames.includes(name) && attempts < 20);

  return name;
}

/**
 * Generate a new potential bandmate for auditions
 */
export function generateBandmateCandidate(
  role: BandmateRole,
  playerFans: number,
  rng: RandomGenerator,
  usedNames: string[] = []
): Bandmate {
  // Better candidates available when you're more famous
  const fameBonus = Math.min(20, Math.floor(Math.log10(Math.max(100, playerFans)) * 5));

  // Base ranges with fame bonus
  const talentMin = 25 + Math.floor(fameBonus / 2);
  const talentMax = 60 + fameBonus;
  const reliabilityMin = 30;
  const reliabilityMax = 80;

  return {
    id: `bandmate_${Date.now()}_${rng.nextInt(0, 9999)}`,
    name: generateBandmateName(rng, usedNames),
    role,
    talent: rng.nextInt(talentMin, talentMax),
    reliability: rng.nextInt(reliabilityMin, reliabilityMax),
    vice: rng.nextInt(15, 70),
    loyalty: rng.nextInt(40, 60), // New hires start with moderate loyalty
    status: 'active',
  };
}

/**
 * Generate multiple candidates for an audition
 */
export function generateAuditionCandidates(
  role: BandmateRole,
  count: number,
  playerFans: number,
  rng: RandomGenerator,
  existingBandmates: Bandmate[]
): Bandmate[] {
  const usedNames = existingBandmates.map(b => b.name);
  const candidates: Bandmate[] = [];

  for (let i = 0; i < count; i++) {
    const candidate = generateBandmateCandidate(role, playerFans, rng, [...usedNames, ...candidates.map(c => c.name)]);
    candidates.push(candidate);
  }

  return candidates;
}

// =============================================================================
// Band Management
// =============================================================================

/**
 * Fire a bandmate
 */
export function fireBandmate(state: GameState, bandmateId: string): GameState {
  const bandmateIndex = state.bandmates.findIndex(b => b.id === bandmateId);
  if (bandmateIndex === -1) return state;

  const bandmate = state.bandmates[bandmateIndex];
  if (bandmate.status !== 'active') return state;

  // Update bandmate status
  const updatedBandmates = [...state.bandmates];
  updatedBandmates[bandmateIndex] = {
    ...bandmate,
    status: 'fired',
  };

  // Firing affects other bandmates' loyalty
  const finalBandmates = updatedBandmates.map(b => {
    if (b.id === bandmateId || b.status !== 'active') return b;
    return {
      ...b,
      loyalty: Math.max(0, b.loyalty - 5), // Others get nervous
    };
  });

  return {
    ...state,
    bandmates: finalBandmates,
  };
}

/**
 * Hire a new bandmate
 */
export function hireBandmate(state: GameState, candidate: Bandmate): GameState {
  // Check if we already have someone in this role
  const existingInRole = state.bandmates.find(
    b => b.role === candidate.role && b.status === 'active'
  );

  let newBandmates = [...state.bandmates];

  // If replacing, mark old one as fired
  if (existingInRole) {
    newBandmates = newBandmates.map(b =>
      b.id === existingInRole.id ? { ...b, status: 'fired' as BandmateStatus } : b
    );
  }

  // Add new bandmate
  newBandmates.push({
    ...candidate,
    status: 'active',
  });

  // Deduct audition cost
  return {
    ...state,
    player: {
      ...state.player,
      money: state.player.money - AUDITION_COST,
    },
    bandmates: newBandmates,
  };
}

/**
 * A bandmate quits
 */
export function bandmateQuits(state: GameState, bandmateId: string): GameState {
  const bandmateIndex = state.bandmates.findIndex(b => b.id === bandmateId);
  if (bandmateIndex === -1) return state;

  const updatedBandmates = [...state.bandmates];
  updatedBandmates[bandmateIndex] = {
    ...updatedBandmates[bandmateIndex],
    status: 'quit',
  };

  return {
    ...state,
    bandmates: updatedBandmates,
  };
}

/**
 * A bandmate enters rehab
 */
export function bandmateToRehab(state: GameState, bandmateId: string): GameState {
  const bandmateIndex = state.bandmates.findIndex(b => b.id === bandmateId);
  if (bandmateIndex === -1) return state;

  const updatedBandmates = [...state.bandmates];
  updatedBandmates[bandmateIndex] = {
    ...updatedBandmates[bandmateIndex],
    status: 'rehab',
  };

  return {
    ...state,
    bandmates: updatedBandmates,
  };
}

/**
 * A bandmate dies
 */
export function bandmateDies(state: GameState, bandmateId: string): GameState {
  const bandmateIndex = state.bandmates.findIndex(b => b.id === bandmateId);
  if (bandmateIndex === -1) return state;

  const updatedBandmates = [...state.bandmates];
  updatedBandmates[bandmateIndex] = {
    ...updatedBandmates[bandmateIndex],
    status: 'dead',
  };

  // Death affects everyone's stability
  return {
    ...state,
    player: {
      ...state.player,
      stability: Math.max(0, state.player.stability - 15),
    },
    bandmates: updatedBandmates,
  };
}

// =============================================================================
// Band Performance Calculations
// =============================================================================

/**
 * Get active bandmates only
 */
export function getActiveBandmates(state: GameState): Bandmate[] {
  return state.bandmates.filter(b => b.status === 'active');
}

/**
 * Calculate average band talent
 */
export function calculateBandTalent(state: GameState): number {
  const active = getActiveBandmates(state);
  if (active.length === 0) return 0;

  return Math.floor(active.reduce((sum, b) => sum + b.talent, 0) / active.length);
}

/**
 * Calculate band reliability (affects show quality, missed gigs)
 */
export function calculateBandReliability(state: GameState): number {
  const active = getActiveBandmates(state);
  if (active.length === 0) return 100; // Solo is reliable

  return Math.floor(active.reduce((sum, b) => sum + b.reliability, 0) / active.length);
}

/**
 * Calculate band vice level (affects event triggers)
 */
export function calculateBandVice(state: GameState): number {
  const active = getActiveBandmates(state);
  if (active.length === 0) return 0;

  return Math.floor(active.reduce((sum, b) => sum + b.vice, 0) / active.length);
}

/**
 * Calculate average band loyalty
 */
export function calculateBandLoyalty(state: GameState): number {
  const active = getActiveBandmates(state);
  if (active.length === 0) return 100;

  return Math.floor(active.reduce((sum, b) => sum + b.loyalty, 0) / active.length);
}

/**
 * Calculate overall band performance score
 * Used for gig quality, recording quality, etc.
 */
export function calculateBandPerformance(state: GameState): number {
  const talent = calculateBandTalent(state);
  const reliability = calculateBandReliability(state);

  // Performance is weighted average of talent and reliability
  const bandScore = (talent * 0.7) + (reliability * 0.3);

  // Player skill also contributes
  const playerContribution = state.player.skill * 0.4;

  return Math.floor(bandScore * 0.6 + playerContribution);
}

/**
 * Check if band is at risk of quitting
 */
export function getBandmatesAtRisk(state: GameState): Bandmate[] {
  return getActiveBandmates(state).filter(b => b.loyalty <= LOYALTY_ULTIMATUM_THRESHOLD);
}

/**
 * Check if any bandmate might quit this turn
 */
export function checkForQuits(state: GameState, rng: RandomGenerator): Bandmate | null {
  const active = getActiveBandmates(state);

  for (const bandmate of active) {
    if (bandmate.loyalty <= LOYALTY_QUIT_THRESHOLD) {
      // High chance of quitting
      if (rng.next() < 0.3) {
        return bandmate;
      }
    } else if (bandmate.loyalty <= LOYALTY_ULTIMATUM_THRESHOLD) {
      // Lower chance
      if (rng.next() < 0.1) {
        return bandmate;
      }
    }
  }

  return null;
}

/**
 * Check for reliability issues (missed rehearsals, late to gigs)
 */
export function checkForReliabilityIssue(state: GameState, rng: RandomGenerator): Bandmate | null {
  const active = getActiveBandmates(state);

  for (const bandmate of active) {
    if (bandmate.reliability <= RELIABILITY_FLAKE_THRESHOLD) {
      if (rng.next() < 0.2) {
        return bandmate;
      }
    }
  }

  return null;
}

/**
 * Check for vice-related trouble
 */
export function checkForViceTrouble(state: GameState, rng: RandomGenerator): Bandmate | null {
  const active = getActiveBandmates(state);

  for (const bandmate of active) {
    if (bandmate.vice >= VICE_DISASTER_THRESHOLD) {
      if (rng.next() < 0.15) {
        return bandmate;
      }
    } else if (bandmate.vice >= VICE_TROUBLE_THRESHOLD) {
      if (rng.next() < 0.08) {
        return bandmate;
      }
    }
  }

  return null;
}

// =============================================================================
// Loyalty Updates
// =============================================================================

/**
 * Update loyalty based on band treatment and success
 */
export function updateBandLoyalty(
  state: GameState,
  delta: number,
  specificBandmateId?: string
): GameState {
  const updatedBandmates = state.bandmates.map(b => {
    if (b.status !== 'active') return b;
    if (specificBandmateId && b.id !== specificBandmateId) return b;

    return {
      ...b,
      loyalty: Math.max(0, Math.min(100, b.loyalty + delta)),
    };
  });

  return {
    ...state,
    bandmates: updatedBandmates,
  };
}

/**
 * Weekly loyalty decay/growth based on conditions
 */
export function applyWeeklyLoyaltyChanges(state: GameState): GameState {
  const { player } = state;

  let loyaltyDelta = 0;

  // Success breeds loyalty
  if (player.hype >= 60) loyaltyDelta += 1;
  if (getTotalFans(player) >= 10000) loyaltyDelta += 1;

  // Money troubles hurt loyalty
  if (player.money < 0) loyaltyDelta -= 2;

  // Player stability affects band morale
  if (player.stability < 30) loyaltyDelta -= 1;

  // High burnout spreads negativity
  if (player.burnout >= 70) loyaltyDelta -= 1;

  if (loyaltyDelta === 0) return state;

  return updateBandLoyalty(state, loyaltyDelta);
}

// =============================================================================
// Band Display Helpers
// =============================================================================

/**
 * Get role display name
 */
export function getRoleDisplayName(role: BandmateRole): string {
  const names: Record<BandmateRole, string> = {
    guitar: 'Guitarist',
    bass: 'Bassist',
    drums: 'Drummer',
    keys: 'Keyboardist',
    vocals: 'Vocalist',
  };
  return names[role];
}

/**
 * Get status display
 */
export function getStatusDisplay(status: BandmateStatus): string {
  const displays: Record<BandmateStatus, string> = {
    active: 'Active',
    fired: 'Fired',
    quit: 'Quit',
    rehab: 'In Rehab',
    dead: 'Deceased',
  };
  return displays[status];
}

/**
 * Check if band is complete (has all essential roles)
 */
export function isBandComplete(state: GameState): boolean {
  const active = getActiveBandmates(state);
  const roles = active.map(b => b.role);

  // Essential roles for a rock band
  const essentialRoles: BandmateRole[] = ['guitar', 'bass', 'drums'];
  return essentialRoles.every(role => roles.includes(role));
}

/**
 * Get missing essential roles
 */
export function getMissingRoles(state: GameState): BandmateRole[] {
  const active = getActiveBandmates(state);
  const roles = active.map(b => b.role);

  const essentialRoles: BandmateRole[] = ['guitar', 'bass', 'drums'];
  return essentialRoles.filter(role => !roles.includes(role));
}
