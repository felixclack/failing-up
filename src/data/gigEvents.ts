/**
 * Gig Events - Special occurrences during and after gigs
 *
 * These events can trigger based on gig performance and provide
 * additional narrative drama beyond the basic gig outcomes.
 */

import { GameEvent, GigOutcome, VenueType } from '@/engine/types';

// =============================================================================
// Gig Event Narratives
// =============================================================================

// Additional narrative snippets that can be added to gig descriptions
export interface GigEventSnippet {
  id: string;
  text: string;
  // When this can trigger
  conditions: {
    outcomes?: GigOutcome[];
    venueTypes?: VenueType[];
    minPerformance?: number;
    maxPerformance?: number;
    minFans?: number;
    isSupport?: boolean;
  };
  // Stat effects
  effects?: {
    hype?: number;
    cred?: number;
    industryGoodwill?: number;
    fans?: number;
    stability?: number;
    money?: number;
    burnout?: number;
  };
  // Special flags this can set
  flagsSet?: string[];
  // Chance to trigger (0-1)
  chance: number;
}

export const GIG_EVENT_SNIPPETS: GigEventSnippet[] = [
  // ==========================================================================
  // POSITIVE EVENTS
  // ==========================================================================
  {
    id: 'ar_scout_noticed',
    text: 'Someone from a label was in the crowd. They left their card with the bartender.',
    conditions: {
      outcomes: ['great', 'legendary'],
      venueTypes: ['club', 'small_venue'],
      minFans: 500,
    },
    effects: { industryGoodwill: 5, hype: 3 },
    flagsSet: ['labelInterestTriggered'],
    chance: 0.15,
  },
  {
    id: 'local_press_coverage',
    text: 'A journalist from the local paper was there. Expect a write-up.',
    conditions: {
      outcomes: ['good', 'great', 'legendary'],
      minFans: 200,
    },
    effects: { hype: 5, cred: 2 },
    chance: 0.2,
  },
  {
    id: 'support_slot_offer',
    text: 'A bigger band\'s manager approached you about an opening slot.',
    conditions: {
      outcomes: ['great', 'legendary'],
      venueTypes: ['club', 'small_venue'],
      minFans: 1000,
    },
    effects: { industryGoodwill: 3 },
    flagsSet: ['supportSlotOffered'],
    chance: 0.12,
  },
  {
    id: 'local_legend_jams',
    text: 'A local music legend showed up and joined you for the encore.',
    conditions: {
      outcomes: ['good', 'great', 'legendary'],
      venueTypes: ['pub', 'club'],
    },
    effects: { cred: 5, hype: 3 },
    chance: 0.08,
  },
  {
    id: 'viral_video',
    text: 'Someone filmed your set. It\'s blowing up online.',
    conditions: {
      outcomes: ['great', 'legendary'],
      minPerformance: 75,
    },
    effects: { hype: 10, fans: 50 },
    chance: 0.1,
  },
  {
    id: 'merch_sold_out',
    text: 'You sold out of merch. People are actually wearing your shirts.',
    conditions: {
      outcomes: ['good', 'great', 'legendary'],
      minFans: 300,
    },
    effects: { money: 100 },
    chance: 0.15,
  },
  {
    id: 'return_booking',
    text: 'The venue wants you back. They\'re talking about making it a regular thing.',
    conditions: {
      outcomes: ['great', 'legendary'],
    },
    effects: { industryGoodwill: 3 },
    chance: 0.2,
  },
  {
    id: 'crowd_singalong',
    text: 'The crowd sang your lyrics back at you. They actually know the words.',
    conditions: {
      outcomes: ['good', 'great', 'legendary'],
      minFans: 500,
    },
    effects: { stability: 3, hype: 2 },
    chance: 0.25,
  },
  {
    id: 'support_wins_crowd',
    text: 'The headliner\'s fans are now your fans. You won them over.',
    conditions: {
      outcomes: ['great', 'legendary'],
      isSupport: true,
    },
    effects: { fans: 100, hype: 5 },
    chance: 0.3,
  },

  // ==========================================================================
  // NEGATIVE EVENTS
  // ==========================================================================
  {
    id: 'fight_breaks_out',
    text: 'A fight broke out in the crowd. Security got involved.',
    conditions: {
      venueTypes: ['pub', 'club'],
    },
    effects: { hype: 2, stability: -5 },
    chance: 0.06,
  },
  {
    id: 'promoter_short_pays',
    text: 'The promoter\'s cut was more than agreed. You got shorted.',
    conditions: {
      venueTypes: ['pub', 'club', 'small_venue'],
    },
    effects: { money: -50, industryGoodwill: -2 },
    chance: 0.1,
  },
  {
    id: 'gear_stolen',
    text: 'Something went missing from the van during the set.',
    conditions: {},
    effects: { money: -75, stability: -3 },
    chance: 0.05,
  },
  {
    id: 'sound_engineer_hostile',
    text: 'The sound guy seemed to have a personal vendetta against you.',
    conditions: {
      outcomes: ['decent', 'poor', 'disaster'],
    },
    effects: { cred: -1 },
    chance: 0.15,
  },
  {
    id: 'rival_hecklers',
    text: 'Some guys from another band were heckling. Scene drama.',
    conditions: {
      outcomes: ['decent', 'poor'],
      venueTypes: ['pub', 'club'],
    },
    effects: { stability: -3, hype: 1 },
    chance: 0.08,
  },
  {
    id: 'venue_blacklist_rumor',
    text: 'Word is the venue might not have you back. Political reasons.',
    conditions: {
      outcomes: ['poor', 'disaster'],
    },
    effects: { industryGoodwill: -5 },
    chance: 0.15,
  },
  {
    id: 'empty_room_depression',
    text: 'Playing to an empty room hits different. You question everything.',
    conditions: {
      outcomes: ['poor', 'disaster'],
      maxPerformance: 40,
    },
    effects: { stability: -5, burnout: 3 },
    chance: 0.2,
  },
  {
    id: 'support_upstaged',
    text: 'The headliner\'s crowd actively left during your set. Ouch.',
    conditions: {
      outcomes: ['poor', 'disaster'],
      isSupport: true,
    },
    effects: { stability: -5, cred: -3 },
    chance: 0.25,
  },

  // ==========================================================================
  // NEUTRAL / DRAMATIC
  // ==========================================================================
  {
    id: 'power_cut',
    text: 'The power cut out mid-song. You finished acoustic. Very punk.',
    conditions: {},
    effects: { cred: 2 },
    chance: 0.04,
  },
  {
    id: 'surprise_guest',
    text: 'An old friend showed up unannounced. Good to see a familiar face.',
    conditions: {},
    effects: { stability: 2 },
    chance: 0.1,
  },
  {
    id: 'broken_string_save',
    text: 'Broke a string mid-song. Handled it like a pro.',
    conditions: {
      outcomes: ['good', 'great', 'legendary'],
      minPerformance: 60,
    },
    effects: { cred: 1 },
    chance: 0.08,
  },
  {
    id: 'venue_atmosphere',
    text: 'There\'s something about this place. The walls have heard a lot of music.',
    conditions: {
      venueTypes: ['pub', 'club'],
    },
    effects: {},
    chance: 0.1,
  },
  {
    id: 'late_night_kebab',
    text: 'Post-gig kebab with the band. These are the moments.',
    conditions: {
      venueTypes: ['pub', 'club'],
    },
    effects: { stability: 1 },
    chance: 0.15,
  },
];

/**
 * Select a gig event snippet based on conditions
 */
export function selectGigEventSnippet(
  outcome: GigOutcome,
  venueType: VenueType,
  performance: number,
  fans: number,
  isSupport: boolean,
  rng: { next: () => number }
): GigEventSnippet | null {
  // Filter eligible snippets
  const eligible = GIG_EVENT_SNIPPETS.filter(snippet => {
    const c = snippet.conditions;

    // Check outcome requirement
    if (c.outcomes && !c.outcomes.includes(outcome)) return false;

    // Check venue type
    if (c.venueTypes && !c.venueTypes.includes(venueType)) return false;

    // Check performance
    if (c.minPerformance !== undefined && performance < c.minPerformance) return false;
    if (c.maxPerformance !== undefined && performance > c.maxPerformance) return false;

    // Check fans
    if (c.minFans !== undefined && fans < c.minFans) return false;

    // Check support
    if (c.isSupport !== undefined && c.isSupport !== isSupport) return false;

    return true;
  });

  if (eligible.length === 0) return null;

  // Roll for each eligible snippet
  for (const snippet of eligible) {
    if (rng.next() < snippet.chance) {
      return snippet;
    }
  }

  return null;
}

// =============================================================================
// Support Slot Event Narratives
// =============================================================================

export const SUPPORT_SLOT_NARRATIVES = {
  offered: [
    'Word travels fast. A bigger band wants you to open for them.',
    'Your manager got a call. Support slot available. Big opportunity.',
    'Remember that A&R guy? He\'s put your name forward for an opening slot.',
  ],
  accepted: [
    'You\'re on the bill. Time to prove you belong on bigger stages.',
    'Opening for {headliner}. Don\'t blow it.',
    'Support slot confirmed. This could be the break you need.',
  ],
  success: [
    '{headliner}\'s crowd loved you. Half of them are your fans now.',
    'You more than held your own. {headliner} even gave you a shoutout.',
    'The pressure was on and you delivered. Bigger things ahead.',
  ],
  failure: [
    '{headliner}\'s fans weren\'t feeling it. A learning experience.',
    'Playing to someone else\'s crowd is humbling. Back to the drawing board.',
    'Not every opportunity lands. The support slot didn\'t go as planned.',
  ],
};
