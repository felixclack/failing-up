/**
 * Game state creation and management
 * All functions are pure - they return new state objects without mutating
 */

import {
  GameState,
  Player,
  PlayerFlags,
  Bandmate,
  StatDeltas,
  BandmateRole,
  Difficulty,
  TalentLevel,
  MusicStyle,
} from './types';
import { createRandom, generateSeed, RandomGenerator } from './random';
import { getDifficultySettings, getWeeklyLivingCost } from './difficulty';
import { generateStartingRivals } from './rivals';

// =============================================================================
// Constants
// =============================================================================

export const DEFAULT_WEEKLY_LIVING_COST = 100;
export const MAX_WEEKS = 520; // 10 years
export const WEEKS_PER_YEAR = 52;

export const STAT_MIN = 0;
export const STAT_MAX = 100;

// =============================================================================
// Talent Level Definitions
// =============================================================================

export const TALENT_LEVELS: Record<TalentLevel, { value: number; name: string; description: string }> = {
  struggling: {
    value: 25,
    name: 'Struggling',
    description: 'Raw but unpolished. You\'ll need to work twice as hard.',
  },
  average: {
    value: 40,
    name: 'Average',
    description: 'Solid foundation. Room to grow with practice.',
  },
  gifted: {
    value: 60,
    name: 'Gifted',
    description: 'Natural ability. Songs come easier to you.',
  },
  prodigy: {
    value: 80,
    name: 'Prodigy',
    description: 'Born for this. But talent alone won\'t save you.',
  },
};

export function getTalentFromLevel(level: TalentLevel): number {
  return TALENT_LEVELS[level].value;
}

export function getAvailableTalentLevels(): Array<{
  id: TalentLevel;
  name: string;
  description: string;
  value: number;
}> {
  return [
    { id: 'struggling', ...TALENT_LEVELS.struggling },
    { id: 'average', ...TALENT_LEVELS.average },
    { id: 'gifted', ...TALENT_LEVELS.gifted },
    { id: 'prodigy', ...TALENT_LEVELS.prodigy },
  ];
}

// =============================================================================
// Music Style Definitions
// =============================================================================

export const MUSIC_STYLES: Record<MusicStyle, { name: string; description: string }> = {
  glam: {
    name: 'Glam Rock',
    description: 'Flashy, theatrical, image-focused.',
  },
  punk: {
    name: 'Punk',
    description: 'Raw, fast, anti-establishment.',
  },
  grunge: {
    name: 'Grunge',
    description: 'Heavy, angst-driven, authentic.',
  },
  alt: {
    name: 'Alternative',
    description: 'Experimental, eclectic, boundary-pushing.',
  },
  metal: {
    name: 'Metal',
    description: 'Heavy, technical, intense.',
  },
  indie: {
    name: 'Indie',
    description: 'DIY ethos, artistic credibility.',
  },
};

export function getAvailableStyles(): Array<{
  id: MusicStyle;
  name: string;
  description: string;
}> {
  return [
    { id: 'alt', ...MUSIC_STYLES.alt },
    { id: 'glam', ...MUSIC_STYLES.glam },
    { id: 'grunge', ...MUSIC_STYLES.grunge },
    { id: 'indie', ...MUSIC_STYLES.indie },
    { id: 'metal', ...MUSIC_STYLES.metal },
    { id: 'punk', ...MUSIC_STYLES.punk },
  ];
}

// Starting stat ranges for character creation
export const STARTING_STATS = {
  talent: { min: 20, max: 60 },
  skill: { min: 10, max: 30 },
  image: { min: 20, max: 50 },
  hype: { min: 5, max: 20 },
  money: { min: 200, max: 500 },
  health: { min: 80, max: 100 },
  stability: { min: 50, max: 80 },
  cred: { min: 5, max: 15 },
  addiction: { min: 0, max: 5 },
  industryGoodwill: { min: 0, max: 10 },
  burnout: { min: 0, max: 10 },
  // Streaming era audience stats
  coreFans: { min: 0, max: 50 },        // Start with handful of core fans
  casualListeners: { min: 0, max: 100 }, // Small streaming presence
  // Digital/social stats
  followers: { min: 50, max: 500 },     // Small social following
  algoBoost: { min: 0, max: 10 },       // Platforms don't know you yet
  cataloguePower: { min: 0, max: 0 },   // No catalogue to start
};

// =============================================================================
// State Creation
// =============================================================================

function createDefaultFlags(): PlayerFlags {
  return {
    hasLabelDeal: false,
    onTour: false,
    inStudio: false,
    hasManager: false,
    hasLawyer: false,
    addictionArcStarted: false,
    labelDealArcStarted: false,
    bandBreakupArcStarted: false,
  };
}

export interface CreatePlayerOptions {
  name: string;
  talent?: number;
  seed?: number;
}

/**
 * Create a new player with randomized starting stats
 * Difficulty settings affect starting money, health, and stability
 */
export function createPlayer(
  options: CreatePlayerOptions,
  rng: RandomGenerator,
  difficultySettings?: { startingMoney: number; startingHealth: number; startingStability: number }
): Player {
  const { name, talent } = options;

  // Use difficulty-adjusted values if provided, otherwise use random from range
  const money = difficultySettings
    ? difficultySettings.startingMoney + rng.nextInt(-50, 50)
    : rng.nextInt(STARTING_STATS.money.min, STARTING_STATS.money.max);

  const health = difficultySettings
    ? Math.min(100, difficultySettings.startingHealth + rng.nextInt(-5, 10))
    : rng.nextInt(STARTING_STATS.health.min, STARTING_STATS.health.max);

  const stability = difficultySettings
    ? Math.min(100, difficultySettings.startingStability + rng.nextInt(-5, 10))
    : rng.nextInt(STARTING_STATS.stability.min, STARTING_STATS.stability.max);

  return {
    name,
    talent: talent ?? rng.nextInt(STARTING_STATS.talent.min, STARTING_STATS.talent.max),
    skill: rng.nextInt(STARTING_STATS.skill.min, STARTING_STATS.skill.max),
    image: rng.nextInt(STARTING_STATS.image.min, STARTING_STATS.image.max),
    hype: rng.nextInt(STARTING_STATS.hype.min, STARTING_STATS.hype.max),
    money,
    health,
    stability,
    cred: rng.nextInt(STARTING_STATS.cred.min, STARTING_STATS.cred.max),
    // Audience stats (streaming era)
    coreFans: rng.nextInt(STARTING_STATS.coreFans.min, STARTING_STATS.coreFans.max),
    casualListeners: rng.nextInt(STARTING_STATS.casualListeners.min, STARTING_STATS.casualListeners.max),
    // Digital/social stats
    followers: rng.nextInt(STARTING_STATS.followers.min, STARTING_STATS.followers.max),
    algoBoost: rng.nextInt(STARTING_STATS.algoBoost.min, STARTING_STATS.algoBoost.max),
    cataloguePower: STARTING_STATS.cataloguePower.min, // Always start at 0
    // Hidden stats
    addiction: rng.nextInt(STARTING_STATS.addiction.min, STARTING_STATS.addiction.max),
    industryGoodwill: rng.nextInt(STARTING_STATS.industryGoodwill.min, STARTING_STATS.industryGoodwill.max),
    burnout: rng.nextInt(STARTING_STATS.burnout.min, STARTING_STATS.burnout.max),
    flags: createDefaultFlags(),
  };
}

/**
 * Get total fans (coreFans + casualListeners)
 */
export function getTotalFans(player: Player): number {
  return player.coreFans + player.casualListeners;
}

// =============================================================================
// Band Name Generation (Genre-Specific)
// =============================================================================

// Genre-specific word banks for band names
const GENRE_BAND_NAMES: Record<MusicStyle, {
  prefixes: string[];
  nouns: string[];
  formats: string[]; // patterns like "{prefix} {noun}", "The {noun}", etc.
}> = {
  glam: {
    prefixes: ['Pretty', 'Poison', 'Sweet', 'Lipstick', 'Velvet', 'Neon', 'Electric', 'Glitter', 'Cherry', 'Hot'],
    nouns: ['Crue', 'Poison', 'Roses', 'Dolls', 'Kitten', 'Vixen', 'Leopard', 'Stiletto', 'Babylon', 'Reckless', 'Danger', 'Excess', 'Vice', 'Trash', 'Addiction'],
    formats: ['{prefix} {noun}', 'The {noun}', '{noun}', '{prefix} {prefix}'],
  },
  punk: {
    prefixes: ['Dead', 'Angry', 'Sick', 'Raw', 'Rotten', 'Smashed', 'Broken', 'Filthy', 'Bloody', 'Nasty'],
    nouns: ['Kennedys', 'Pistols', 'Clash', 'Discharge', 'Germs', 'Misfits', 'Zeros', 'Rejects', 'Outcasts', 'Bastards', 'Youth', 'Rats', 'Punks', 'Chaos', 'Void'],
    formats: ['The {noun}', 'The {prefix} {noun}', '{prefix} {noun}', '{noun}'],
  },
  grunge: {
    prefixes: ['Stone', 'Mud', 'Pearl', 'Screaming', 'Skin', 'Dirt', 'Tar', 'Sludge', 'Fuzz', 'Black'],
    nouns: ['Garden', 'Temple', 'Chains', 'Honey', 'Jam', 'Trees', 'Yard', 'Pilots', 'Pumpkins', 'Hole', 'Flower', 'Drain', 'Pit', 'Mess', 'Heap'],
    formats: ['{prefix} {noun}', 'The {noun}', '{noun}', '{prefix} {prefix}'],
  },
  alt: {
    prefixes: ['Modest', 'Broken', 'Neutral', 'Arctic', 'Vampire', 'Arcade', 'Crystal', 'Silver', 'Paper', 'Glass'],
    nouns: ['Strokes', 'Killers', 'Smiths', 'Cure', 'Pixies', 'Blur', 'Pulp', 'Weekend', 'Machine', 'Hearts', 'Dreams', 'Bells', 'Echo', 'Youth', 'Wave'],
    formats: ['The {noun}', '{prefix} {noun}', 'The {prefix} {noun}', '{noun}'],
  },
  metal: {
    prefixes: ['Black', 'Iron', 'Death', 'Dark', 'Blood', 'Doom', 'Grave', 'Steel', 'Night', 'Storm'],
    nouns: ['Sabbath', 'Maiden', 'Priest', 'Throne', 'Slaughter', 'Destroyer', 'Prophecy', 'Carnage', 'Oblivion', 'Testament', 'Hammer', 'Anvil', 'Fortress', 'Legion', 'Reaper'],
    formats: ['{prefix} {noun}', '{noun}', 'The {prefix} {noun}', '{prefix} {prefix}'],
  },
  indie: {
    prefixes: ['Beach', 'Fleet', 'Tame', 'Wild', 'Bon', 'Local', 'Young', 'Strange', 'Pale', 'Bright'],
    nouns: ['Foxes', 'House', 'Impala', 'Natives', 'Neighbourhood', 'Bones', 'Eyes', 'Flowers', 'Waves', 'Coast', 'Mountain', 'Lake', 'Forest', 'Garden', 'Morning'],
    formats: ['The {noun}', '{prefix} {noun}', 'The {prefix} {noun}', '{noun}'],
  },
};

// Fallback generic names (used if no style specified)
const GENERIC_PREFIXES = [
  'The', 'Black', 'Red', 'Dead', 'Electric', 'Burning', 'Screaming', 'Midnight',
  'Savage', 'Neon', 'Dark', 'Violent', 'Iron', 'Steel', 'Atomic', 'Sonic',
];

const GENERIC_NOUNS = [
  'Roses', 'Skulls', 'Wolves', 'Snakes', 'Razors', 'Bullets', 'Flames', 'Shadows',
  'Daggers', 'Vipers', 'Ravens', 'Thunder', 'Lightning', 'Storm', 'Riot', 'Chaos',
  'Velvet', 'Ashes', 'Chains', 'Blades', 'Hearts', 'Demons', 'Angels', 'Rebels',
];

export function generateBandName(rng: RandomGenerator, style?: MusicStyle): string {
  if (style && GENRE_BAND_NAMES[style]) {
    const genreData = GENRE_BAND_NAMES[style];
    const format = genreData.formats[rng.nextInt(0, genreData.formats.length - 1)];
    const prefix1 = genreData.prefixes[rng.nextInt(0, genreData.prefixes.length - 1)];
    const prefix2 = genreData.prefixes[rng.nextInt(0, genreData.prefixes.length - 1)];
    const noun = genreData.nouns[rng.nextInt(0, genreData.nouns.length - 1)];

    return format
      .replace('{prefix}', prefix1)
      .replace('{prefix}', prefix2) // For double-prefix formats
      .replace('{noun}', noun)
      .trim();
  }

  // Fallback to generic generation
  const usePrefix = rng.next() < 0.7;
  const prefix = usePrefix ? GENERIC_PREFIXES[rng.nextInt(0, GENERIC_PREFIXES.length - 1)] : '';
  const noun = GENERIC_NOUNS[rng.nextInt(0, GENERIC_NOUNS.length - 1)];

  return prefix ? `${prefix} ${noun}` : noun;
}

// =============================================================================
// Bandmate Generation
// =============================================================================

// Bandmate name pools
const FIRST_NAMES = [
  'Johnny', 'Vinnie', 'Tommy', 'Richie', 'Eddie', 'Bobby', 'Danny', 'Mickey',
  'Spike', 'Slash', 'Axl', 'Duff', 'Izzy', 'Nikki', 'Vince', 'Mick',
  'Joey', 'Dee Dee', 'Marky', 'CJ', 'Sid', 'Steve', 'Paul', 'Gene',
];

const LAST_NAMES = [
  'Rotten', 'Vicious', 'Thunder', 'Steel', 'Blaze', 'Stone', 'Crash', 'Wild',
  'Savage', 'Mars', 'Sixx', 'Neil', 'Lee', 'Rose', 'Stradlin', 'McKagan',
  'Ramone', 'Strummer', 'Jones', 'Headon', 'Simmons', 'Stanley', 'Frehley',
];

/**
 * Generate a random bandmate
 */
export function createBandmate(role: BandmateRole, rng: RandomGenerator): Bandmate {
  const firstName = FIRST_NAMES[rng.nextInt(0, FIRST_NAMES.length - 1)];
  const lastName = LAST_NAMES[rng.nextInt(0, LAST_NAMES.length - 1)];

  return {
    id: `bandmate_${Date.now()}_${rng.nextInt(0, 9999)}`,
    name: `${firstName} ${lastName}`,
    role,
    talent: rng.nextInt(30, 70),
    reliability: rng.nextInt(30, 80),
    vice: rng.nextInt(20, 70),
    loyalty: rng.nextInt(40, 70),
    status: 'active',
  };
}

/**
 * Create a starting band with basic lineup
 */
export function createStartingBand(rng: RandomGenerator): Bandmate[] {
  const roles: BandmateRole[] = ['guitar', 'bass', 'drums'];
  return roles.map(role => createBandmate(role, rng));
}

export interface CreateGameOptions {
  playerName: string;
  bandName?: string;
  playerTalent?: number;
  talentLevel?: TalentLevel;
  preferredStyle?: MusicStyle;
  seed?: number;
  difficulty?: Difficulty;
}

/**
 * Create a new game state
 */
export function createGameState(options: CreateGameOptions): GameState {
  const seed = options.seed ?? generateSeed();
  const rng = createRandom(seed);
  const difficulty = options.difficulty ?? 'normal';
  const difficultySettings = getDifficultySettings(difficulty);
  const preferredStyle = options.preferredStyle ?? 'punk';

  // Determine talent: explicit value > talent level > random
  let talent: number | undefined = options.playerTalent;
  if (talent === undefined && options.talentLevel) {
    talent = getTalentFromLevel(options.talentLevel);
  }

  const player = createPlayer({
    name: options.playerName,
    talent,
  }, rng, difficultySettings);

  // Use provided band name or generate one
  const bandName = options.bandName || generateBandName(rng);

  const bandmates = createStartingBand(rng);

  // Generate starting rival bands
  const rivalBands = generateStartingRivals(rng);

  return {
    player,
    bandName,
    bandmates,
    songs: [],
    albums: [],
    labelDeals: [],

    // Manager and gig system
    manager: null,
    upcomingGig: null,
    lastGigResult: null,
    pendingSupportSlotOffer: null,

    // Rival bands and industry news
    rivalBands,
    newsItems: [],

    // Recording session
    recordingSession: null,

    // Tour session
    tourSession: null,

    week: 1,
    year: 1,

    activeArcs: [],
    completedArcIds: [],
    triggeredEventIds: [],

    weekLogs: [],

    isGameOver: false,
    gameOverReason: null,
    endingId: null,

    seed,
    weeklyLivingCost: getWeeklyLivingCost(DEFAULT_WEEKLY_LIVING_COST, difficultySettings),
    maxWeeks: MAX_WEEKS,

    difficulty,
    difficultySettings,

    preferredStyle,
  };
}

// =============================================================================
// State Updates
// =============================================================================

/**
 * Clamp a stat value to valid range
 */
export function clampStat(value: number, min = STAT_MIN, max = STAT_MAX): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Apply stat deltas to a player, returning new player object
 * Money is not clamped (can go negative)
 * Audience stats (coreFans, casualListeners) are not clamped (can grow indefinitely)
 * Legacy 'fans' delta is distributed to coreFans for backward compatibility
 */
export function applyStatDeltas(player: Player, deltas: StatDeltas): Player {
  // Handle legacy 'fans' delta by adding to coreFans
  const coreFansFromLegacy = deltas.fans ?? 0;

  return {
    ...player,
    talent: deltas.talent !== undefined
      ? clampStat(player.talent + deltas.talent)
      : player.talent,
    skill: deltas.skill !== undefined
      ? clampStat(player.skill + deltas.skill)
      : player.skill,
    image: deltas.image !== undefined
      ? clampStat(player.image + deltas.image)
      : player.image,
    hype: deltas.hype !== undefined
      ? clampStat(player.hype + deltas.hype)
      : player.hype,
    money: deltas.money !== undefined
      ? player.money + deltas.money  // No clamp - can go negative
      : player.money,
    health: deltas.health !== undefined
      ? clampStat(player.health + deltas.health)
      : player.health,
    stability: deltas.stability !== undefined
      ? clampStat(player.stability + deltas.stability)
      : player.stability,
    cred: deltas.cred !== undefined
      ? clampStat(player.cred + deltas.cred)
      : player.cred,
    // Audience stats (streaming era)
    coreFans: deltas.coreFans !== undefined || coreFansFromLegacy !== 0
      ? Math.max(0, player.coreFans + (deltas.coreFans ?? 0) + coreFansFromLegacy)
      : player.coreFans,
    casualListeners: deltas.casualListeners !== undefined
      ? Math.max(0, player.casualListeners + deltas.casualListeners)
      : player.casualListeners,
    // Digital/social stats
    followers: deltas.followers !== undefined
      ? Math.max(0, player.followers + deltas.followers)
      : player.followers,
    algoBoost: deltas.algoBoost !== undefined
      ? clampStat(player.algoBoost + deltas.algoBoost)
      : player.algoBoost,
    cataloguePower: deltas.cataloguePower !== undefined
      ? clampStat(player.cataloguePower + deltas.cataloguePower)
      : player.cataloguePower,
    // Hidden stats
    addiction: deltas.addiction !== undefined
      ? clampStat(player.addiction + deltas.addiction)
      : player.addiction,
    industryGoodwill: deltas.industryGoodwill !== undefined
      ? clampStat(player.industryGoodwill + deltas.industryGoodwill)
      : player.industryGoodwill,
    burnout: deltas.burnout !== undefined
      ? clampStat(player.burnout + deltas.burnout)
      : player.burnout,
  };
}

/**
 * Update player flags
 */
export function updatePlayerFlags(player: Player, flags: Partial<PlayerFlags>): Player {
  return {
    ...player,
    flags: {
      ...player.flags,
      ...flags,
    },
  };
}

/**
 * Calculate current year from week number
 */
export function weekToYear(week: number): number {
  return Math.floor((week - 1) / WEEKS_PER_YEAR) + 1;
}

/**
 * Get week within current year (1-52)
 */
export function weekInYear(week: number): number {
  return ((week - 1) % WEEKS_PER_YEAR) + 1;
}
