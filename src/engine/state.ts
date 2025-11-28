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
    { id: 'glam', ...MUSIC_STYLES.glam },
    { id: 'punk', ...MUSIC_STYLES.punk },
    { id: 'grunge', ...MUSIC_STYLES.grunge },
    { id: 'alt', ...MUSIC_STYLES.alt },
    { id: 'metal', ...MUSIC_STYLES.metal },
    { id: 'indie', ...MUSIC_STYLES.indie },
  ];
}

// Starting stat ranges for character creation
export const STARTING_STATS = {
  talent: { min: 20, max: 60 },
  skill: { min: 10, max: 30 },
  image: { min: 20, max: 50 },
  fans: { min: 0, max: 100 },
  hype: { min: 5, max: 20 },
  money: { min: 200, max: 500 },
  health: { min: 80, max: 100 },
  stability: { min: 50, max: 80 },
  cred: { min: 5, max: 15 },
  addiction: { min: 0, max: 5 },
  industryGoodwill: { min: 0, max: 10 },
  burnout: { min: 0, max: 10 },
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
    fans: rng.nextInt(STARTING_STATS.fans.min, STARTING_STATS.fans.max),
    hype: rng.nextInt(STARTING_STATS.hype.min, STARTING_STATS.hype.max),
    money,
    health,
    stability,
    cred: rng.nextInt(STARTING_STATS.cred.min, STARTING_STATS.cred.max),
    addiction: rng.nextInt(STARTING_STATS.addiction.min, STARTING_STATS.addiction.max),
    industryGoodwill: rng.nextInt(STARTING_STATS.industryGoodwill.min, STARTING_STATS.industryGoodwill.max),
    burnout: rng.nextInt(STARTING_STATS.burnout.min, STARTING_STATS.burnout.max),
    flags: createDefaultFlags(),
  };
}

// =============================================================================
// Band Name Generation
// =============================================================================

const BAND_PREFIXES = [
  'The', 'Black', 'Red', 'Dead', 'Electric', 'Burning', 'Screaming', 'Midnight',
  'Savage', 'Neon', 'Dark', 'Violent', 'Iron', 'Steel', 'Atomic', 'Sonic',
];

const BAND_NOUNS = [
  'Roses', 'Skulls', 'Wolves', 'Snakes', 'Razors', 'Bullets', 'Flames', 'Shadows',
  'Daggers', 'Vipers', 'Ravens', 'Thunder', 'Lightning', 'Storm', 'Riot', 'Chaos',
  'Velvet', 'Ashes', 'Chains', 'Blades', 'Hearts', 'Demons', 'Angels', 'Rebels',
];

const BAND_SUFFIXES = [
  '', '', '', '', // Higher chance of no suffix
  'Underground', 'Society', 'Collective', 'Machine', 'Army', 'Syndicate',
];

export function generateBandName(rng: RandomGenerator): string {
  const usePrefix = rng.next() < 0.7; // 70% chance of prefix
  const useSuffix = rng.next() < 0.2; // 20% chance of suffix

  const prefix = usePrefix ? BAND_PREFIXES[rng.nextInt(0, BAND_PREFIXES.length - 1)] : '';
  const noun = BAND_NOUNS[rng.nextInt(0, BAND_NOUNS.length - 1)];
  const suffix = useSuffix ? BAND_SUFFIXES[rng.nextInt(0, BAND_SUFFIXES.length - 1)] : '';

  const parts = [prefix, noun, suffix].filter(p => p);
  return parts.join(' ');
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

  return {
    player,
    bandName,
    bandmates,
    songs: [],
    albums: [],
    labelDeals: [],

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
 * Fans are not clamped (can grow indefinitely)
 */
export function applyStatDeltas(player: Player, deltas: StatDeltas): Player {
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
    fans: deltas.fans !== undefined
      ? Math.max(0, player.fans + deltas.fans)
      : player.fans,
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
