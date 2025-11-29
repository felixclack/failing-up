/**
 * Venue System - English pubs, clubs, and venues
 *
 * Bands start playing pub back rooms and work their way up
 * to headline shows and festival slots.
 */

import { Venue, VenueType } from '@/engine/types';
import { RandomGenerator } from '@/engine/random';

// =============================================================================
// English Pub Name Generation
// =============================================================================

// The [Adjective] [Noun] pattern
const PUB_ADJECTIVES = [
  'Rusty', 'Golden', 'Black', 'White', 'Red', 'Blue', 'Old', 'Royal',
  'Crooked', 'Blind', 'Three', 'Two', 'Jolly', 'Dirty', 'Broken',
  'Flying', 'Lazy', 'Hungry', 'Thirsty', 'Dancing', 'Laughing', 'Weeping',
];

const PUB_NOUNS = [
  'Anchor', 'Lion', 'Dog', 'Horse', 'Bull', 'Bear', 'Fox', 'Hound',
  'Swan', 'Crow', 'Raven', 'Eagle', 'Stag', 'Hart', 'Lamb', 'Pig',
  'Barrel', 'Tankard', 'Fiddle', 'Drum', 'Bell', 'Crown', 'Rose',
  'Oak', 'Elm', 'Willow', 'Thorn', 'Thistle', 'Shamrock',
];

// The [Person's] Arms / Head pattern
const PUB_PERSONS = [
  "Duke's", "Queen's", "King's", "Prince's", "Earl's", "Lord's",
  "Bishop's", "Knight's", "Sailor's", "Farmer's", "Butcher's",
  "Drover's", "Mason's", "Cooper's", "Carpenter's", "Blacksmith's",
];

// The [Location] pattern
const PUB_LOCATIONS = [
  'Railway', 'Station', 'Market', 'Bridge', 'Corner', 'Cross',
  'Green', 'Gate', 'Lane', 'Yard', 'Wharf', 'Dock',
];

// Standalone pub names
const PUB_STANDALONE = [
  'The Albion', 'The Britannia', 'The Victoria', 'The George',
  'The Churchill', 'The Wellington', 'The Nelson', 'The Crown',
  'The Globe', 'The Compass', 'The Anchor', 'Ye Olde Trip',
  'The Lamb & Flag', 'The Fox & Hounds', 'The Dog & Duck',
  'The Pig & Whistle', 'The Coach & Horses', 'The Rose & Crown',
];

// =============================================================================
// Club/Venue Name Generation
// =============================================================================

// Small clubs (intimate venues, 100-300 capacity)
const CLUB_NAMES = [
  'The Fleapit', "Sticky Mike's", 'The Cavern', 'Audio', 'Night & Day',
  'The Joiners', 'The Deaf Institute', 'The Brudenell', 'The Lexington',
  'The Water Rats', 'The Windmill', 'The Hope & Anchor', 'The Dublin Castle',
  'The Monarch', 'The Garage', 'The Boston Arms', 'The Scala',
  'The Forum', 'The Underworld', 'The Electric Ballroom',
  'Dingwalls', 'The Jazz Cafe', 'The Half Moon', 'The Bedford',
  'The Louisiana', 'The Birdcage', 'The Duchess', 'Fiber',
  'The Cookie', 'The Portland Arms', 'The Boileroom', 'The Fulford Arms',
];

// Made-up club names for variety
const CLUB_PREFIXES = ['The', 'Club', 'Bar', 'Studio', ''];
const CLUB_WORDS = [
  'Basement', 'Cellar', 'Vault', 'Bunker', 'Pit', 'Den', 'Lair',
  'Underground', 'Afterhours', 'Neon', 'Chrome', 'Velvet', 'Vinyl',
  'Static', 'Feedback', 'Distortion', 'Reverb', 'Echo', 'Fuzz',
];

// Small venue names (300-800 capacity)
const SMALL_VENUE_NAMES = [
  'Academy 2', 'The Rescue Rooms', 'The Junction', 'The Institute',
  'The Wedgewood Rooms', 'Patterns', 'Chalk', 'The Leadmill',
  'The Bodega', 'The Wardrobe', 'The Key Club', 'The Cluny',
  'Belgrave Music Hall', 'The Exchange', 'Band on the Wall',
  'The Hare & Hounds', 'The Rainbow', 'The Foundry',
];

// Large venue names (headline shows, 800-2000+)
const LARGE_VENUE_NAMES = [
  'Academy', 'O2 Academy', 'The Forum', 'Roundhouse', 'Brixton Academy',
  'Shepherd\'s Bush Empire', 'The Troxy', 'Alexandra Palace',
  'The Apollo', 'Victoria Hall', 'City Hall', 'Corn Exchange',
  'The Guildhall', 'Barrowland Ballroom', 'The Liquid Room',
];

// Festival names
const FESTIVAL_NAMES = [
  'Glastonbury', 'Reading', 'Leeds', 'Download', 'Latitude',
  'TRNSMT', 'Victorious', 'Truck Festival', 'Green Man',
  '2000 Trees', 'Bluedot', 'End of the Road', 'Tramlines',
  'Y Not Festival', 'Boardmasters', 'Standon Calling',
];

// =============================================================================
// City Names for Flavor
// =============================================================================

const UK_CITIES = [
  'London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool',
  'Bristol', 'Newcastle', 'Sheffield', 'Glasgow', 'Edinburgh',
  'Brighton', 'Nottingham', 'Cardiff', 'Southampton', 'Leicester',
  'Norwich', 'Oxford', 'Cambridge', 'York', 'Bath',
  'Exeter', 'Plymouth', 'Portsmouth', 'Reading', 'Milton Keynes',
  'Coventry', 'Hull', 'Bradford', 'Stoke', 'Wolverhampton',
];

// =============================================================================
// Venue Tier Configuration
// =============================================================================

export interface VenueTierConfig {
  type: VenueType;
  minFans: number;
  minSkill: number;
  minHype: number;
  capacityRange: [number, number];
  basePayRange: [number, number];
  prestigeRange: [number, number];
}

export const VENUE_TIERS: Record<VenueType, VenueTierConfig> = {
  pub: {
    type: 'pub',
    minFans: 0,
    minSkill: 0,
    minHype: 0,
    capacityRange: [30, 80],
    basePayRange: [50, 150],
    prestigeRange: [5, 20],
  },
  club: {
    type: 'club',
    minFans: 200,
    minSkill: 30,
    minHype: 15,
    capacityRange: [100, 300],
    basePayRange: [150, 400],
    prestigeRange: [20, 40],
  },
  small_venue: {
    type: 'small_venue',
    minFans: 1000,
    minSkill: 50,
    minHype: 30,
    capacityRange: [300, 800],
    basePayRange: [400, 1000],
    prestigeRange: [40, 60],
  },
  support_slot: {
    type: 'support_slot',
    minFans: 2000,
    minSkill: 60,
    minHype: 40,
    capacityRange: [500, 2000],
    basePayRange: [200, 500], // Less pay but more exposure
    prestigeRange: [50, 75],
  },
  headline: {
    type: 'headline',
    minFans: 5000,
    minSkill: 70,
    minHype: 50,
    capacityRange: [800, 2000],
    basePayRange: [1000, 3000],
    prestigeRange: [60, 85],
  },
  festival: {
    type: 'festival',
    minFans: 10000,
    minSkill: 75,
    minHype: 60,
    capacityRange: [2000, 20000],
    basePayRange: [2000, 10000],
    prestigeRange: [75, 100],
  },
};

// =============================================================================
// Venue Generation
// =============================================================================

/**
 * Generate a pub name
 */
export function generatePubName(rng: RandomGenerator): string {
  const pattern = rng.nextInt(0, 3);

  switch (pattern) {
    case 0: {
      // The [Adjective] [Noun]
      const adj = PUB_ADJECTIVES[rng.nextInt(0, PUB_ADJECTIVES.length - 1)];
      const noun = PUB_NOUNS[rng.nextInt(0, PUB_NOUNS.length - 1)];
      return `The ${adj} ${noun}`;
    }
    case 1: {
      // The [Person's] Arms/Head
      const person = PUB_PERSONS[rng.nextInt(0, PUB_PERSONS.length - 1)];
      const suffix = rng.next() < 0.7 ? 'Arms' : 'Head';
      return `The ${person} ${suffix}`;
    }
    case 2: {
      // The [Location]
      const loc = PUB_LOCATIONS[rng.nextInt(0, PUB_LOCATIONS.length - 1)];
      return `The ${loc}`;
    }
    default: {
      // Standalone
      return PUB_STANDALONE[rng.nextInt(0, PUB_STANDALONE.length - 1)];
    }
  }
}

/**
 * Generate a club name
 */
export function generateClubName(rng: RandomGenerator): string {
  // 60% chance of using a real club name
  if (rng.next() < 0.6) {
    return CLUB_NAMES[rng.nextInt(0, CLUB_NAMES.length - 1)];
  }

  // Generate a made-up name
  const prefix = CLUB_PREFIXES[rng.nextInt(0, CLUB_PREFIXES.length - 1)];
  const word = CLUB_WORDS[rng.nextInt(0, CLUB_WORDS.length - 1)];
  return prefix ? `${prefix} ${word}` : word;
}

/**
 * Generate a small venue name
 */
export function generateSmallVenueName(rng: RandomGenerator): string {
  return SMALL_VENUE_NAMES[rng.nextInt(0, SMALL_VENUE_NAMES.length - 1)];
}

/**
 * Generate a large/headline venue name
 */
export function generateLargeVenueName(rng: RandomGenerator): string {
  return LARGE_VENUE_NAMES[rng.nextInt(0, LARGE_VENUE_NAMES.length - 1)];
}

/**
 * Generate a festival name
 */
export function generateFestivalName(rng: RandomGenerator): string {
  return FESTIVAL_NAMES[rng.nextInt(0, FESTIVAL_NAMES.length - 1)];
}

/**
 * Get a random UK city
 */
export function getRandomCity(rng: RandomGenerator): string {
  return UK_CITIES[rng.nextInt(0, UK_CITIES.length - 1)];
}

/**
 * Generate a venue of a specific type
 */
export function generateVenue(type: VenueType, rng: RandomGenerator): Venue {
  const tier = VENUE_TIERS[type];

  let name: string;
  switch (type) {
    case 'pub':
      name = generatePubName(rng);
      break;
    case 'club':
      name = generateClubName(rng);
      break;
    case 'small_venue':
      name = generateSmallVenueName(rng);
      break;
    case 'support_slot':
    case 'headline':
      name = generateLargeVenueName(rng);
      break;
    case 'festival':
      name = generateFestivalName(rng);
      break;
    default:
      name = generateClubName(rng);
  }

  const capacity = rng.nextInt(tier.capacityRange[0], tier.capacityRange[1]);
  const basePay = rng.nextInt(tier.basePayRange[0], tier.basePayRange[1]);
  const prestige = rng.nextInt(tier.prestigeRange[0], tier.prestigeRange[1]);

  return {
    id: `venue_${type}_${rng.nextInt(0, 9999)}`,
    name,
    type,
    capacity,
    prestige,
    basePay,
    city: getRandomCity(rng),
  };
}

/**
 * Get the highest venue tier available based on band stats
 */
export function getAvailableVenueTier(
  fans: number,
  skill: number,
  hype: number
): VenueType {
  // Check tiers from highest to lowest
  const tiers: VenueType[] = ['festival', 'headline', 'support_slot', 'small_venue', 'club', 'pub'];

  for (const tier of tiers) {
    const config = VENUE_TIERS[tier];
    if (fans >= config.minFans && skill >= config.minSkill && hype >= config.minHype) {
      return tier;
    }
  }

  return 'pub';
}

/**
 * Get venue type display name
 */
export function getVenueTypeDisplay(type: VenueType): string {
  const displays: Record<VenueType, string> = {
    pub: 'Pub',
    club: 'Club',
    small_venue: 'Small Venue',
    support_slot: 'Support Slot',
    headline: 'Headline Show',
    festival: 'Festival',
  };
  return displays[type];
}
