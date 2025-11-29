/**
 * Manager System
 *
 * Managers book gigs for the band. Their quality affects:
 * - How often gigs happen
 * - What tier of venues you can access
 * - How much you get paid
 */

import {
  GameState,
  Manager,
  ManagerStatus,
  Gig,
  GigResult,
  GigOutcome,
  Venue,
  VenueType,
} from './types';
import { RandomGenerator } from './random';
import { getTotalFans } from './state';
import { calculateBandTalent, calculateBandReliability } from './band';
import {
  generateVenue,
  getAvailableVenueTier,
  VENUE_TIERS,
  getVenueTypeDisplay,
} from '@/data/venues';

// =============================================================================
// Constants
// =============================================================================

export const MANAGER_HIRE_COST = 100; // Cost to find/interview managers

// =============================================================================
// Manager Name Generation
// =============================================================================

const MANAGER_FIRST_NAMES = [
  'Tony', 'Pete', 'Dave', 'Mick', 'Steve', 'Gary', 'Paul', 'John',
  'Graham', 'Keith', 'Brian', 'Terry', 'Barry', 'Colin', 'Derek',
  'Neil', 'Alan', 'Ian', 'Roger', 'Phil', 'Martin', 'Simon',
  'Malcolm', 'Bernie', 'Jeff', 'Gordon', 'Clive', 'Trevor', 'Ray',
  // A few women managers
  'Sharon', 'Carol', 'Linda', 'Karen', 'Tina', 'Dawn', 'Jackie',
];

const MANAGER_LAST_NAMES = [
  'Smith', 'Jones', 'Wilson', 'Brown', 'Taylor', 'Davies', 'Evans',
  'Thomas', 'Roberts', 'Walker', 'Wright', 'Robinson', 'Thompson',
  'Hughes', 'Edwards', 'Green', 'Hall', 'Wood', 'Harris', 'Clarke',
  'Mills', 'King', 'Baker', 'Price', 'Stone', 'Fox', 'Sharp',
  'Gold', 'Silver', 'Grant', 'Collins', 'Bell', 'Young', 'Black',
];

function generateManagerName(rng: RandomGenerator): string {
  const first = MANAGER_FIRST_NAMES[rng.nextInt(0, MANAGER_FIRST_NAMES.length - 1)];
  const last = MANAGER_LAST_NAMES[rng.nextInt(0, MANAGER_LAST_NAMES.length - 1)];
  return `${first} ${last}`;
}

// =============================================================================
// Manager Generation
// =============================================================================

/**
 * Generate a manager candidate for hiring
 * Better managers become available as the band grows
 */
export function generateManagerCandidate(
  bandFans: number,
  bandHype: number,
  rng: RandomGenerator
): Manager {
  // Fame affects manager quality
  const fameBonus = Math.min(30, Math.floor(Math.log10(Math.max(100, bandFans)) * 8));
  const hypeBonus = Math.floor(bandHype / 10);

  // Base stat ranges improve with fame
  const baseMin = 20 + fameBonus;
  const baseMax = 50 + fameBonus + hypeBonus;

  // Generate stats
  const bookingSkill = Math.min(100, rng.nextInt(baseMin, baseMax));
  const connections = Math.min(100, rng.nextInt(baseMin - 5, baseMax - 5));
  const reliability = rng.nextInt(40, 85); // More consistent range
  const reputation = Math.min(100, rng.nextInt(baseMin - 10, baseMax));

  // Better managers charge more (10-25%)
  const avgSkill = (bookingSkill + connections) / 2;
  const baseCut = 0.10 + (avgSkill / 100) * 0.15;
  const cut = Math.round(baseCut * 100) / 100;

  return {
    id: `manager_${Date.now()}_${rng.nextInt(0, 9999)}`,
    name: generateManagerName(rng),
    bookingSkill,
    connections,
    reliability,
    cut,
    reputation,
    status: 'active',
    weekHired: 0, // Set when actually hired
  };
}

/**
 * Generate multiple manager candidates for selection
 */
export function generateManagerCandidates(
  count: number,
  bandFans: number,
  bandHype: number,
  rng: RandomGenerator
): Manager[] {
  const candidates: Manager[] = [];
  for (let i = 0; i < count; i++) {
    candidates.push(generateManagerCandidate(bandFans, bandHype, rng));
  }
  return candidates;
}

// =============================================================================
// Manager Actions
// =============================================================================

/**
 * Hire a manager
 */
export function hireManager(
  state: GameState,
  candidate: Manager
): GameState {
  // Fire existing manager first
  let newState = state;
  if (state.manager && state.manager.status === 'active') {
    newState = fireManager(state);
  }

  return {
    ...newState,
    manager: {
      ...candidate,
      status: 'active',
      weekHired: state.week,
    },
    player: {
      ...newState.player,
      money: newState.player.money - MANAGER_HIRE_COST,
      flags: {
        ...newState.player.flags,
        hasManager: true,
      },
    },
  };
}

/**
 * Fire the current manager
 */
export function fireManager(state: GameState): GameState {
  if (!state.manager) return state;

  return {
    ...state,
    manager: {
      ...state.manager,
      status: 'fired',
    },
    player: {
      ...state.player,
      flags: {
        ...state.player.flags,
        hasManager: false,
      },
    },
  };
}

// =============================================================================
// Gig Booking
// =============================================================================

/**
 * Check if the manager books a gig this week
 * Returns a gig if one is booked, null otherwise
 */
export function tryBookGig(
  state: GameState,
  rng: RandomGenerator
): Gig | null {
  const { manager, player } = state;

  // No manager = much lower chance of gig, worse venues
  const hasManager = manager && manager.status === 'active';
  const bookingSkill = hasManager ? manager.bookingSkill : 20;
  const connections = hasManager ? manager.connections : 10;

  // Base booking chance: 30-70% depending on skill
  const baseChance = 0.30 + (bookingSkill / 100) * 0.40;

  // Hype bonus (up to +15%)
  const hypeBonus = (player.hype / 100) * 0.15;

  // Final booking chance
  const bookingChance = Math.min(0.85, baseChance + hypeBonus);

  // Check if gig is booked
  if (rng.next() > bookingChance) {
    return null;
  }

  // Determine venue tier
  const totalFans = getTotalFans(player);
  const maxTier = getAvailableVenueTier(totalFans, player.skill, player.hype);

  // Manager connections can sometimes get better venues
  let effectiveTier = maxTier;
  if (hasManager && connections > 60 && rng.next() < 0.2) {
    // 20% chance to upgrade tier with good connections
    const tierOrder: VenueType[] = ['pub', 'club', 'small_venue', 'support_slot', 'headline', 'festival'];
    const currentIndex = tierOrder.indexOf(maxTier);
    if (currentIndex < tierOrder.length - 1) {
      effectiveTier = tierOrder[currentIndex + 1];
    }
  }

  // Generate the venue
  const venue = generateVenue(effectiveTier, rng);

  // Calculate expected turnout
  const venueConfig = VENUE_TIERS[effectiveTier];
  const fanBase = Math.min(venue.capacity, totalFans);
  const turnoutPercent = 0.3 + (player.hype / 100) * 0.5 + rng.nextFloat(-0.1, 0.1);
  const expectedTurnout = Math.floor(fanBase * turnoutPercent) + rng.nextInt(10, 30);

  // Negotiated pay (manager skill affects this)
  const negotiationBonus = hasManager ? 1 + (bookingSkill / 200) : 0.8;
  const guaranteedPay = Math.floor(venue.basePay * negotiationBonus);

  return {
    id: `gig_${state.week}_${rng.nextInt(0, 9999)}`,
    venue,
    week: state.week,
    isSupport: effectiveTier === 'support_slot',
    headlinerName: effectiveTier === 'support_slot' ? generateHeadlinerName(rng) : undefined,
    expectedTurnout: Math.min(expectedTurnout, venue.capacity),
    guaranteedPay,
  };
}

// =============================================================================
// Gig Execution & Results
// =============================================================================

/**
 * Calculate gig outcome after playing
 */
export function resolveGig(
  state: GameState,
  gig: Gig,
  rng: RandomGenerator
): GigResult {
  const { player, manager, bandmates } = state;
  const hasManager = manager && manager.status === 'active';

  // Calculate performance (0-100)
  const bandTalent = calculateBandTalent(state);
  const bandReliability = calculateBandReliability(state);

  // Base performance from skill + talent
  const basePerformance = (player.skill * 0.5) + (bandTalent * 0.3) + (bandReliability * 0.2);

  // Health/burnout penalties
  const healthPenalty = player.health < 50 ? (50 - player.health) / 5 : 0;
  const burnoutPenalty = player.burnout > 50 ? (player.burnout - 50) / 5 : 0;

  // Random variance
  const variance = rng.nextInt(-15, 15);

  const performance = Math.max(0, Math.min(100,
    basePerformance - healthPenalty - burnoutPenalty + variance
  ));

  // Determine outcome based on performance
  let outcome: GigOutcome;
  if (performance >= 90) outcome = 'legendary';
  else if (performance >= 75) outcome = 'great';
  else if (performance >= 60) outcome = 'good';
  else if (performance >= 45) outcome = 'decent';
  else if (performance >= 30) outcome = 'poor';
  else outcome = 'disaster';

  // Calculate actual turnout
  const turnoutMod = (performance / 100) + rng.nextFloat(-0.1, 0.1);
  const actualTurnout = Math.max(5, Math.floor(gig.expectedTurnout * turnoutMod));

  // Calculate earnings
  let grossEarnings = gig.guaranteedPay;
  // Door bonus for good shows
  if (actualTurnout > gig.expectedTurnout * 0.8) {
    grossEarnings += Math.floor(actualTurnout * 2); // ~£2 per head extra
  }

  // Manager takes their cut
  const managerCut = hasManager ? Math.floor(grossEarnings * manager.cut) : 0;
  const earnings = grossEarnings - managerCut;

  // Calculate stat changes
  const { fansGained, hypeChange, credChange, skillGain } = calculateGigStatChanges(
    outcome,
    gig,
    actualTurnout,
    performance,
    state
  );

  // Generate narrative
  const { headline, description } = generateGigNarrative(
    outcome,
    gig,
    actualTurnout,
    performance,
    rng
  );

  return {
    gig,
    outcome,
    actualTurnout,
    performance,
    earnings,
    managerCut,
    fansGained,
    hypeChange,
    credChange,
    skillGain,
    headline,
    description,
  };
}

/**
 * Calculate stat changes from gig performance
 */
function calculateGigStatChanges(
  outcome: GigOutcome,
  gig: Gig,
  actualTurnout: number,
  performance: number,
  state: GameState
): { fansGained: number; hypeChange: number; credChange: number; skillGain: number } {
  const venueConfig = VENUE_TIERS[gig.venue.type];

  // Base values by outcome
  const outcomeMultipliers: Record<GigOutcome, { fans: number; hype: number; cred: number }> = {
    legendary: { fans: 2.0, hype: 15, cred: 10 },
    great: { fans: 1.5, hype: 8, cred: 5 },
    good: { fans: 1.0, hype: 4, cred: 2 },
    decent: { fans: 0.6, hype: 1, cred: 0 },
    poor: { fans: 0.2, hype: -3, cred: -2 },
    disaster: { fans: 0, hype: -8, cred: -5 },
  };

  const mults = outcomeMultipliers[outcome];

  // Fans gained scales with turnout and venue prestige
  let baseFansGained = Math.floor(actualTurnout * 0.15 * mults.fans);

  // Support slots give exposure bonus
  if (gig.isSupport && outcome !== 'disaster' && outcome !== 'poor') {
    baseFansGained = Math.floor(baseFansGained * 1.5);
  }

  // Festival bonus for good performances
  if (gig.venue.type === 'festival' && performance >= 60) {
    baseFansGained = Math.floor(baseFansGained * 2);
  }

  // Skill always increases a bit from playing
  const skillGain = Math.max(1, Math.floor(performance / 30));

  return {
    fansGained: baseFansGained,
    hypeChange: mults.hype,
    credChange: mults.cred,
    skillGain,
  };
}

// =============================================================================
// Narrative Generation
// =============================================================================

/**
 * Generate a headliner band name for support slots
 */
function generateHeadlinerName(rng: RandomGenerator): string {
  const prefixes = ['The', 'Dark', 'Electric', 'Neon', 'Black', 'Silver', 'Cosmic'];
  const nouns = ['Wolves', 'Ravens', 'Thunder', 'Serpents', 'Phoenix', 'Storm', 'Void'];

  const prefix = prefixes[rng.nextInt(0, prefixes.length - 1)];
  const noun = nouns[rng.nextInt(0, nouns.length - 1)];
  return `${prefix} ${noun}`;
}

/**
 * Generate narrative text for gig results
 */
function generateGigNarrative(
  outcome: GigOutcome,
  gig: Gig,
  actualTurnout: number,
  performance: number,
  rng: RandomGenerator
): { headline: string; description: string } {
  const venueName = gig.venue.name;
  const city = gig.venue.city || 'town';

  const headlines: Record<GigOutcome, string[]> = {
    legendary: [
      `Magic at ${venueName}`,
      `${city} will remember this one`,
      `Career-defining night`,
    ],
    great: [
      `Brilliant show at ${venueName}`,
      `${city} crowd goes wild`,
      `One for the books`,
    ],
    good: [
      `Solid night at ${venueName}`,
      `Good show in ${city}`,
      `${venueName} crowd satisfied`,
    ],
    decent: [
      `Adequate performance at ${venueName}`,
      `${city} show: could be worse`,
      `Getting through in ${city}`,
    ],
    poor: [
      `Rough night at ${venueName}`,
      `${city} crowd unimpressed`,
      `Struggles at ${venueName}`,
    ],
    disaster: [
      `Disaster at ${venueName}`,
      `${city} show falls apart`,
      `One to forget at ${venueName}`,
    ],
  };

  const descriptions: Record<GigOutcome, string[]> = {
    legendary: [
      `${actualTurnout} souls witnessed something special tonight. The room was electric. People will talk about this show for years.`,
      `From the first note to the last, the crowd was in the palm of your hand. ${actualTurnout} people saw a band at the top of their game.`,
      `You played like your life depended on it. ${actualTurnout} strangers became believers tonight.`,
    ],
    great: [
      `The ${actualTurnout}-strong crowd ate it up. Chants for an encore, phones out recording, the whole bit.`,
      `${actualTurnout} people showed up and none of them left disappointed. This is what it's all about.`,
      `The sound was tight, the crowd was into it, and ${actualTurnout} people went home knowing your name.`,
    ],
    good: [
      `Played to ${actualTurnout} at ${venueName}. Good energy, solid setlist, no disasters. A proper gig.`,
      `${actualTurnout} showed up. Most of them were listening. Some were even nodding. Progress.`,
      `Professional show for ${actualTurnout} punters. Not headline news, but you're building something.`,
    ],
    decent: [
      `${actualTurnout} people in the room. Half of them were paying attention. The other half were at the bar.`,
      `Got through the set at ${venueName}. ${actualTurnout} witnessed... something. Not your best work.`,
      `A crowd of ${actualTurnout}, most of them politely clapping. Room for improvement.`,
    ],
    poor: [
      `Sparse crowd of ${actualTurnout}. Technical issues. Forgotten lyrics. ${venueName} has seen better nights.`,
      `${actualTurnout} people, and most of them left before the encore. ${venueName} might not book you again soon.`,
      `The sound was muddy, the vibe was off, and ${actualTurnout} people wondered why they bothered.`,
    ],
    disaster: [
      `Everything that could go wrong did. ${actualTurnout} people witnessed a band falling apart on stage. ${venueName} won't forget this.`,
      `Strings broke. Tempers flared. ${actualTurnout} people saw you at your worst. The walk of shame to the van was long.`,
      `${venueName} turned hostile. ${actualTurnout} hecklers and one very angry promoter. This one will haunt you.`,
    ],
  };

  const headlineOptions = headlines[outcome];
  const descriptionOptions = descriptions[outcome];

  return {
    headline: headlineOptions[rng.nextInt(0, headlineOptions.length - 1)],
    description: descriptionOptions[rng.nextInt(0, descriptionOptions.length - 1)],
  };
}

// =============================================================================
// Manager Display Helpers
// =============================================================================

/**
 * Get a description of manager quality
 */
export function getManagerQualityDescription(manager: Manager): string {
  const avg = (manager.bookingSkill + manager.connections + manager.reliability) / 3;

  if (avg >= 80) return 'Excellent';
  if (avg >= 65) return 'Good';
  if (avg >= 50) return 'Decent';
  if (avg >= 35) return 'Mediocre';
  return 'Dodgy';
}

/**
 * Format manager cut as percentage
 */
export function formatManagerCut(cut: number): string {
  return `${Math.round(cut * 100)}%`;
}
