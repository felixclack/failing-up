/**
 * Rival band system - NPC bands that exist in the game world
 * Creates a living music industry with bands at different fame levels
 */

import {
  RivalBand,
  RivalBandStatus,
  FameTier,
  MusicStyle,
  GameState,
  Player,
} from './types';
import { RandomGenerator } from './random';
import { getTotalFans } from './state';

// =============================================================================
// Constants
// =============================================================================

// Fame tier thresholds (total fans)
export const FAME_TIER_THRESHOLDS: Record<FameTier, { min: number; max: number }> = {
  local: { min: 0, max: 500 },
  regional: { min: 500, max: 5000 },
  national: { min: 5000, max: 50000 },
  star: { min: 50000, max: 500000 },
  legend: { min: 500000, max: Infinity },
};

// Number of rivals per tier
const RIVALS_PER_TIER = 4;

// =============================================================================
// Name Generation
// =============================================================================

const RIVAL_PREFIXES = [
  'The', 'Black', 'Red', 'Dead', 'White', 'Blue', 'Silver', 'Golden',
  'Dark', 'Bright', 'Wild', 'Lost', 'Last', 'First', 'New', 'Old',
  'Young', 'Ancient', 'Modern', 'Future', 'Cosmic', 'Electric', 'Neon',
  'Velvet', 'Iron', 'Steel', 'Burning', 'Frozen', 'Crystal', 'Crimson',
];

const RIVAL_NOUNS = [
  'Roses', 'Wolves', 'Ravens', 'Skulls', 'Hearts', 'Stars', 'Moons',
  'Suns', 'Nights', 'Days', 'Dreams', 'Nightmares', 'Angels', 'Demons',
  'Saints', 'Sinners', 'Lovers', 'Killers', 'Thieves', 'Kings', 'Queens',
  'Shadows', 'Flames', 'Thunder', 'Lightning', 'Storm', 'Riot', 'Chaos',
  'Daggers', 'Vipers', 'Serpents', 'Dragons', 'Phoenix', 'Ghosts', 'Spirits',
  'Rebels', 'Outlaws', 'Strangers', 'Wanderers', 'Drifters', 'Exiles',
];

const RIVAL_SUFFIXES = [
  'Underground', 'Society', 'Collective', 'Machine', 'Army', 'Syndicate',
  'Conspiracy', 'Movement', 'Revival', 'Experience', 'Project', 'Effect',
];

const SINGLE_WORDS = [
  'Venom', 'Poison', 'Abyss', 'Void', 'Eclipse', 'Havoc', 'Mayhem',
  'Carnage', 'Oblivion', 'Paradox', 'Enigma', 'Vertigo', 'Nemesis',
  'Zenith', 'Nadir', 'Apex', 'Terminus', 'Genesis', 'Exodus', 'Revolver',
];

const FRONTMAN_NAMES = [
  'Johnny', 'Eddie', 'Joey', 'Tommy', 'Billy', 'Bobby', 'Danny', 'Frankie',
  'Vinnie', 'Mickey', 'Jackie', 'Stevie', 'Sammy', 'Richie', 'Petey',
];

const FRONTMAN_LAST = [
  'Stone', 'Steel', 'Blaze', 'Thunder', 'Lightning', 'Storm', 'Savage',
  'Rotten', 'Vicious', 'Wild', 'Mars', 'Sixx', 'Crash', 'Slash', 'Bones',
];

/**
 * Generate a rival band name
 */
export function generateRivalName(rng: RandomGenerator, existingNames: string[]): string {
  let name: string;
  let attempts = 0;
  const maxAttempts = 50;

  do {
    const pattern = rng.nextInt(0, 5);

    switch (pattern) {
      case 0: // "The [Noun]"
        name = `The ${RIVAL_NOUNS[rng.nextInt(0, RIVAL_NOUNS.length - 1)]}`;
        break;
      case 1: // "[Prefix] [Noun]"
        name = `${RIVAL_PREFIXES[rng.nextInt(0, RIVAL_PREFIXES.length - 1)]} ${RIVAL_NOUNS[rng.nextInt(0, RIVAL_NOUNS.length - 1)]}`;
        break;
      case 2: // "[Noun] [Suffix]"
        name = `${RIVAL_NOUNS[rng.nextInt(0, RIVAL_NOUNS.length - 1)]} ${RIVAL_SUFFIXES[rng.nextInt(0, RIVAL_SUFFIXES.length - 1)]}`;
        break;
      case 3: // Single word
        name = SINGLE_WORDS[rng.nextInt(0, SINGLE_WORDS.length - 1)];
        break;
      case 4: // "[Name] and the [Noun]"
        name = `${FRONTMAN_NAMES[rng.nextInt(0, FRONTMAN_NAMES.length - 1)]} and the ${RIVAL_NOUNS[rng.nextInt(0, RIVAL_NOUNS.length - 1)]}`;
        break;
      default: // "[Name] [Last]"
        name = `${FRONTMAN_NAMES[rng.nextInt(0, FRONTMAN_NAMES.length - 1)]} ${FRONTMAN_LAST[rng.nextInt(0, FRONTMAN_LAST.length - 1)]}`;
    }

    attempts++;
  } while (existingNames.includes(name) && attempts < maxAttempts);

  return name;
}

// =============================================================================
// Fame Tier Functions
// =============================================================================

/**
 * Determine player's current fame tier based on total fans
 */
export function getPlayerFameTier(player: Player): FameTier {
  const totalFans = getTotalFans(player);

  if (totalFans >= FAME_TIER_THRESHOLDS.legend.min) return 'legend';
  if (totalFans >= FAME_TIER_THRESHOLDS.star.min) return 'star';
  if (totalFans >= FAME_TIER_THRESHOLDS.national.min) return 'national';
  if (totalFans >= FAME_TIER_THRESHOLDS.regional.min) return 'regional';
  return 'local';
}

/**
 * Get the tier above the current tier (or same if at legend)
 */
export function getHigherTier(tier: FameTier): FameTier {
  const tiers: FameTier[] = ['local', 'regional', 'national', 'star', 'legend'];
  const index = tiers.indexOf(tier);
  return tiers[Math.min(index + 1, tiers.length - 1)];
}

/**
 * Get the tier below the current tier (or same if at local)
 */
export function getLowerTier(tier: FameTier): FameTier {
  const tiers: FameTier[] = ['local', 'regional', 'national', 'star', 'legend'];
  const index = tiers.indexOf(tier);
  return tiers[Math.max(index - 1, 0)];
}

// =============================================================================
// Rival Band Generation
// =============================================================================

/**
 * Generate a new rival band at a specific fame tier
 */
export function generateRivalBand(
  fameTier: FameTier,
  week: number,
  rng: RandomGenerator,
  existingNames: string[]
): RivalBand {
  const styles: MusicStyle[] = ['glam', 'punk', 'grunge', 'alt', 'metal', 'indie'];

  // Base stats vary by tier
  const tierMultipliers: Record<FameTier, number> = {
    local: 0.3,
    regional: 0.5,
    national: 0.7,
    star: 0.85,
    legend: 1.0,
  };

  const multiplier = tierMultipliers[fameTier];

  return {
    id: `rival_${fameTier}_${Date.now()}_${rng.nextInt(0, 9999)}`,
    name: generateRivalName(rng, existingNames),
    style: styles[rng.nextInt(0, styles.length - 1)],
    fameTier,
    reputation: Math.floor(30 + (50 * multiplier) + rng.nextInt(-10, 10)),
    hype: Math.floor(20 + (60 * multiplier) + rng.nextInt(-15, 15)),
    weekFormed: week - rng.nextInt(10, 200), // Pretend they've been around
    status: 'active',
    hits: Math.floor(multiplier * rng.nextInt(1, 10)),
    scandals: rng.nextInt(0, Math.floor(3 * multiplier)),
    relationship: rng.nextInt(-20, 20), // Start mostly neutral
    isRival: false, // Will be set when player reaches their tier
    hasBeef: false,
    stolenFromPlayer: false,
  };
}

/**
 * Generate starting rivals for all tiers
 */
export function generateStartingRivals(rng: RandomGenerator): RivalBand[] {
  const tiers: FameTier[] = ['local', 'regional', 'national', 'star', 'legend'];
  const rivals: RivalBand[] = [];
  const existingNames: string[] = [];

  for (const tier of tiers) {
    for (let i = 0; i < RIVALS_PER_TIER; i++) {
      const rival = generateRivalBand(tier, 1, rng, existingNames);
      existingNames.push(rival.name);
      rivals.push(rival);
    }
  }

  return rivals;
}

// =============================================================================
// Rival Updates
// =============================================================================

/**
 * Update rival bands each week
 * - Adjust hype (decay or increase)
 * - Occasionally change status
 * - Mark rivals at player's tier
 */
export function updateRivalBands(state: GameState, rng: RandomGenerator): RivalBand[] {
  const playerTier = getPlayerFameTier(state.player);
  const updatedRivals = state.rivalBands.map(rival => {
    let updated = { ...rival };

    // Skip inactive bands (but small chance of comeback)
    if (rival.status !== 'active') {
      if (rng.next() < 0.01) { // 1% weekly comeback chance
        updated.status = 'active';
        updated.hype = 30 + rng.nextInt(0, 20);
      }
      return updated;
    }

    // Hype fluctuation
    const hypeChange = rng.nextInt(-5, 8);
    updated.hype = Math.max(0, Math.min(100, rival.hype + hypeChange));

    // Reputation slowly changes
    if (rng.next() < 0.1) {
      updated.reputation = Math.max(0, Math.min(100, rival.reputation + rng.nextInt(-3, 5)));
    }

    // Small chance of status change
    if (rng.next() < 0.02) { // 2% weekly
      const statusRoll = rng.next();
      if (statusRoll < 0.5) {
        updated.status = 'hiatus';
      } else if (statusRoll < 0.8) {
        updated.status = 'broken_up';
      } else {
        updated.status = 'retired';
      }
    }

    // Small chance of tier change for active bands
    if (rng.next() < 0.03 && updated.status === 'active') {
      if (updated.hype > 70 && rng.next() < 0.3) {
        // Rising band
        updated.fameTier = getHigherTier(updated.fameTier);
        updated.hits += 1;
      } else if (updated.hype < 30 && rng.next() < 0.3) {
        // Falling band
        updated.fameTier = getLowerTier(updated.fameTier);
      }
    }

    // Mark as rival if at player's tier
    updated.isRival = updated.fameTier === playerTier && updated.status === 'active';

    // Decay beef over time
    if (updated.hasBeef && rng.next() < 0.05) {
      updated.hasBeef = false;
      updated.relationship = Math.min(updated.relationship + 20, 50); // Partial reconciliation
    }

    return updated;
  });

  return updatedRivals;
}

/**
 * Get all active rivals at player's current fame tier
 */
export function getActiveRivals(state: GameState): RivalBand[] {
  const playerTier = getPlayerFameTier(state.player);
  return state.rivalBands.filter(
    rival => rival.fameTier === playerTier && rival.status === 'active'
  );
}

/**
 * Get bands that have beef with the player
 */
export function getRivalsWithBeef(state: GameState): RivalBand[] {
  return state.rivalBands.filter(rival => rival.hasBeef && rival.status === 'active');
}

/**
 * Get bands at higher tiers (potential plagiarists)
 */
export function getBiggerBands(state: GameState): RivalBand[] {
  const playerTier = getPlayerFameTier(state.player);
  const tiers: FameTier[] = ['local', 'regional', 'national', 'star', 'legend'];
  const playerTierIndex = tiers.indexOf(playerTier);

  return state.rivalBands.filter(
    rival =>
      rival.status === 'active' &&
      tiers.indexOf(rival.fameTier) > playerTierIndex
  );
}

/**
 * Start beef with a rival
 */
export function startBeefWithRival(
  state: GameState,
  rivalId: string,
  relationshipPenalty: number = 30
): GameState {
  const updatedRivals = state.rivalBands.map(rival => {
    if (rival.id === rivalId) {
      return {
        ...rival,
        hasBeef: true,
        relationship: Math.max(-100, rival.relationship - relationshipPenalty),
      };
    }
    return rival;
  });

  return {
    ...state,
    rivalBands: updatedRivals,
  };
}

/**
 * Mark a rival as having stolen from player
 */
export function markRivalAsThief(state: GameState, rivalId: string): GameState {
  const updatedRivals = state.rivalBands.map(rival => {
    if (rival.id === rivalId) {
      return {
        ...rival,
        stolenFromPlayer: true,
        hasBeef: true,
        relationship: Math.max(-100, rival.relationship - 50),
      };
    }
    return rival;
  });

  return {
    ...state,
    rivalBands: updatedRivals,
  };
}

/**
 * Get a random rival for events
 */
export function getRandomRival(
  rivals: RivalBand[],
  rng: RandomGenerator
): RivalBand | null {
  if (rivals.length === 0) return null;
  return rivals[rng.nextInt(0, rivals.length - 1)];
}

/**
 * Ensure there are enough rivals at each tier
 * Called when player advances to a new tier
 */
export function ensureRivalsAtTier(
  state: GameState,
  tier: FameTier,
  rng: RandomGenerator
): RivalBand[] {
  const existingNames = state.rivalBands.map(r => r.name);
  const rivalsAtTier = state.rivalBands.filter(
    r => r.fameTier === tier && r.status === 'active'
  );

  const newRivals: RivalBand[] = [];
  const needed = RIVALS_PER_TIER - rivalsAtTier.length;

  for (let i = 0; i < needed; i++) {
    const newRival = generateRivalBand(tier, state.week, rng, [
      ...existingNames,
      ...newRivals.map(r => r.name),
    ]);
    newRivals.push(newRival);
  }

  return newRivals;
}
