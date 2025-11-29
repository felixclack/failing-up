/**
 * Weekly action definitions and execution logic
 */

import {
  Action,
  ActionId,
  ActionResult,
  GameState,
  Song,
  MusicStyle,
  StatDeltas,
} from './types';
import { applyStatDeltas, clampStat, getTotalFans } from './state';
import { createRandom, RandomGenerator } from './random';
import { getGigPayout, getFanGain } from './difficulty';

// =============================================================================
// Action Definitions
// =============================================================================

export const ACTIONS: Record<ActionId, Action> = {
  REST: {
    id: 'REST',
    label: 'Rest / Lay Low',
    description: 'Take it easy this week. Recover health and stability, but lose some hype.',
    requirements: {},
    baseEffects: {
      health: 5,
      stability: 5,
      burnout: -3,
      hype: -3,
    },
    hasSpecialLogic: false,
  },

  WRITE: {
    id: 'WRITE',
    label: 'Write / Compose',
    description: 'Spend the week writing new material. Might produce a song.',
    requirements: {
      onTour: false,
    },
    baseEffects: {
      skill: 1,
      burnout: 2,
      hype: -2,
    },
    hasSpecialLogic: true, // Can produce a song
  },

  PLAY_LOCAL_GIG: {
    id: 'PLAY_LOCAL_GIG',
    label: 'Play Local Gig',
    description: 'Play a show at a local venue. Small money, builds local following.',
    requirements: {
      minHealth: 20,
    },
    baseEffects: {
      skill: 1,
      burnout: 1,
    },
    hasSpecialLogic: true, // Variable money/fans based on performance
  },

  REHEARSE: {
    id: 'REHEARSE',
    label: 'Rehearse',
    description: 'Practice with the band. Improves skill and tightness.',
    requirements: {
      onTour: false,
    },
    baseEffects: {
      skill: 2,
      burnout: 1,
      money: -25, // Rehearsal space costs
    },
    hasSpecialLogic: false,
  },

  TOUR: {
    id: 'TOUR',
    label: 'Tour',
    description: 'Go on the road. Big exposure but exhausting. Need released music first.',
    requirements: {
      hasLabelDeal: true,
      hasReleasedMusic: true, // Can't tour without something to promote
      minHealth: 40,
    },
    baseEffects: {
      fans: 100,
      hype: 10,
      health: -10,
      burnout: 10,
    },
    hasSpecialLogic: true,
  },

  RECORD: {
    id: 'RECORD',
    label: 'Record',
    description: 'Hit the studio to record an album. Need songs to record first.',
    requirements: {
      onTour: false,
      inStudio: false,
      hasUnreleasedSongs: true, // Need material to record
    },
    baseEffects: {
      skill: 1,
      burnout: 3,
    },
    hasSpecialLogic: true,
  },

  PROMOTE: {
    id: 'PROMOTE',
    label: 'Promote',
    description: 'Press interviews, social media, fan engagement. Small chance to go viral.',
    requirements: {},
    baseEffects: {
      hype: 4,
      followers: 40,
      burnout: 2,
    },
    hasSpecialLogic: true, // Cred can change, viral chance
  },

  NETWORK: {
    id: 'NETWORK',
    label: 'Network / Industry',
    description: 'Schmooze with industry types. Build connections.',
    requirements: {},
    baseEffects: {
      industryGoodwill: 3,
      burnout: 1,
    },
    hasSpecialLogic: true, // Can trigger label interest
  },

  PARTY: {
    id: 'PARTY',
    label: 'Party / Indulge',
    description: 'Live the rock star life. Short-term gains, long-term consequences.',
    requirements: {},
    baseEffects: {
      image: 3,
      hype: 5,
      addiction: 3,
      health: -3,
      stability: -3,
      burnout: 2,
    },
    hasSpecialLogic: false,
  },

  SIDE_JOB: {
    id: 'SIDE_JOB',
    label: 'Side Job',
    description: 'Work a day job to make ends meet. Pays bills but drains energy.',
    requirements: {
      onTour: false,
    },
    baseEffects: {
      money: 120,
      burnout: 4,
      hype: -3,
    },
    hasSpecialLogic: false,
  },

  // ==========================================================================
  // Streaming Era Actions
  // ==========================================================================

  RELEASE_SINGLE: {
    id: 'RELEASE_SINGLE',
    label: 'Release Single',
    description: 'Drop a single to streaming platforms. Need to write something first.',
    requirements: {
      onTour: false,
      hasUnreleasedSongs: true, // Need a song to release
    },
    baseEffects: {
      hype: 3,
      algoBoost: 2,
      burnout: 1,
    },
    hasSpecialLogic: true,
  },
};

// =============================================================================
// Action Validation
// =============================================================================

/**
 * Check if an action is available given current game state
 */
export function isActionAvailable(actionId: ActionId, state: GameState): boolean {
  const action = ACTIONS[actionId];
  if (!action) return false;

  const { requirements } = action;
  const { player, songs } = state;

  // Check flag requirements
  if (requirements.onTour !== undefined && player.flags.onTour !== requirements.onTour) {
    return false;
  }
  if (requirements.inStudio !== undefined && player.flags.inStudio !== requirements.inStudio) {
    return false;
  }
  if (requirements.hasLabelDeal !== undefined && player.flags.hasLabelDeal !== requirements.hasLabelDeal) {
    return false;
  }

  // Check stat requirements
  if (requirements.minMoney !== undefined && player.money < requirements.minMoney) {
    return false;
  }
  if (requirements.minHealth !== undefined && player.health < requirements.minHealth) {
    return false;
  }
  if (requirements.maxBurnout !== undefined && player.burnout > requirements.maxBurnout) {
    return false;
  }

  // Check song-related requirements
  if (requirements.hasUnreleasedSongs) {
    const unreleasedSongs = songs.filter(s => !s.isReleased);
    if (unreleasedSongs.length === 0) {
      return false;
    }
  }

  if (requirements.hasReleasedMusic) {
    const releasedSongs = songs.filter(s => s.isReleased);
    // Also check albums if we have them
    const releasedAlbums = state.albums?.filter(a => a.weekReleased !== null) ?? [];
    if (releasedSongs.length === 0 && releasedAlbums.length === 0) {
      return false;
    }
  }

  if (requirements.minSongs !== undefined && songs.length < requirements.minSongs) {
    return false;
  }

  return true;
}

/**
 * Get list of available actions for current state
 */
export function getAvailableActions(state: GameState): ActionId[] {
  return (Object.keys(ACTIONS) as ActionId[]).filter(id => isActionAvailable(id, state));
}

// =============================================================================
// Action Execution
// =============================================================================

// Song title word banks
const SONG_ADJECTIVES = [
  'Burning', 'Broken', 'Electric', 'Midnight', 'Neon', 'Savage', 'Wild', 'Dark',
  'Screaming', 'Falling', 'Rising', 'Lost', 'Wasted', 'Hungry', 'Dirty', 'Sweet',
];

const SONG_NOUNS = [
  'Heart', 'Soul', 'Eyes', 'Night', 'Dream', 'Fire', 'Thunder', 'Angel',
  'Devil', 'Road', 'City', 'Love', 'Pain', 'Rain', 'Blood', 'Star',
];

export function generateSongTitle(rng: RandomGenerator): string {
  const adj = SONG_ADJECTIVES[rng.nextInt(0, SONG_ADJECTIVES.length - 1)];
  const noun = SONG_NOUNS[rng.nextInt(0, SONG_NOUNS.length - 1)];
  return `${adj} ${noun}`;
}

const MUSIC_STYLES: MusicStyle[] = ['glam', 'punk', 'grunge', 'alt', 'metal', 'indie'];

/**
 * Get a song style, biased toward the player's preferred style
 * 60% chance of preferred style, 40% chance of random
 */
function getSongStyle(preferredStyle: MusicStyle, rng: RandomGenerator): MusicStyle {
  if (rng.next() < 0.6) {
    return preferredStyle;
  }
  return MUSIC_STYLES[rng.nextInt(0, MUSIC_STYLES.length - 1)];
}

/**
 * Execute the Write action - may produce a song
 * Song style is biased toward player's preferred style
 */
function executeWrite(state: GameState, rng: RandomGenerator): ActionResult {
  const { player, preferredStyle } = state;

  // Base chance to write a song: 40% + skill bonus
  const writeChance = 0.4 + (player.skill / 200);
  const roll = rng.next();

  if (roll < writeChance) {
    // Successfully wrote a song
    const baseQuality = Math.floor((player.talent + player.skill) / 2);
    const qualityVariance = rng.nextInt(-10, 15);
    const quality = clampStat(baseQuality + qualityVariance);

    // Hit potential based on quality and some randomness
    const hitPotential = clampStat(Math.floor(quality * 0.7 + rng.nextInt(0, 30)));

    const generatedTitle = generateSongTitle(rng);
    const song: Song = {
      id: `song_${state.week}_${rng.nextInt(0, 9999)}`,
      title: generatedTitle,
      quality,
      style: getSongStyle(preferredStyle, rng),
      hitPotential,
      writtenByPlayer: true,
      weekWritten: state.week,
      // Streaming fields - unreleased by default
      isReleased: false,
      isSingle: false,
      weekReleased: null,
      streamsTier: 'none',
      playlistScore: 0,
      viralFlag: false,
      viralWeeksRemaining: 0,
      totalStreams: 0,
    };

    return {
      success: true,
      message: `You wrote "${song.title}" - ${getQualityDescription(quality)} quality.`,
      statChanges: ACTIONS.WRITE.baseEffects,
      producedSongId: song.id,
      producedSong: song,
    };
  } else {
    // Didn't finish a song, but still practiced
    return {
      success: true,
      message: 'You worked on some ideas but nothing came together this week.',
      statChanges: ACTIONS.WRITE.baseEffects,
    };
  }
}

/**
 * Execute Play Local Gig - variable money/fans based on performance
 * Payouts and fan gains modified by difficulty
 */
function executePlayLocalGig(state: GameState, rng: RandomGenerator): ActionResult {
  const { player, bandmates, difficultySettings } = state;

  // Calculate performance quality
  const bandTalent = bandmates.length > 0
    ? bandmates.filter(b => b.status === 'active').reduce((sum, b) => sum + b.talent, 0) / bandmates.length
    : 50;

  const performanceBase = (player.skill + bandTalent) / 2;
  const performanceRoll = rng.nextInt(-15, 15);
  const performance = clampStat(performanceBase + performanceRoll);

  // Determine turnout based on hype and local fans
  const totalFans = getTotalFans(player);
  const turnoutBase = Math.min(player.hype + Math.floor(totalFans / 100), 100);
  const turnoutRoll = rng.nextInt(-10, 10);
  const turnout = clampStat(turnoutBase + turnoutRoll);

  // Calculate rewards (base values, then apply difficulty multiplier)
  const basePay = 50;
  const turnoutBonus = Math.floor(turnout * 1.5);
  const performanceBonus = performance > 60 ? Math.floor((performance - 60) * 2) : 0;
  const baseMoneyEarned = basePay + turnoutBonus + performanceBonus;
  const totalMoney = getGigPayout(baseMoneyEarned, difficultySettings);

  const baseFansGained = Math.floor((performance / 100) * (turnout / 100) * rng.nextInt(5, 20));
  const fansGained = getFanGain(baseFansGained, difficultySettings);
  const hypeGain = performance > 70 ? rng.nextInt(2, 5) : (performance < 40 ? rng.nextInt(-3, 0) : 0);

  // Build result message
  let message: string;
  if (performance >= 80) {
    message = `Killer show! The crowd went wild. Earned $${totalMoney}.`;
  } else if (performance >= 60) {
    message = `Solid gig. The audience seemed into it. Earned $${totalMoney}.`;
  } else if (performance >= 40) {
    message = `Rough night. A few technical issues but you got through it. Earned $${totalMoney}.`;
  } else {
    message = `Disaster. Half the crowd left early. Still got $${totalMoney} from the door.`;
  }

  return {
    success: true,
    message,
    statChanges: {
      ...ACTIONS.PLAY_LOCAL_GIG.baseEffects,
      money: totalMoney,
      fans: fansGained,
      hype: hypeGain,
    },
  };
}

/**
 * Execute any action and return the result
 */
export function executeAction(
  actionId: ActionId,
  state: GameState,
  rng: RandomGenerator
): ActionResult {
  const action = ACTIONS[actionId];

  if (!action) {
    return {
      success: false,
      message: `Unknown action: ${actionId}`,
      statChanges: {},
    };
  }

  if (!isActionAvailable(actionId, state)) {
    return {
      success: false,
      message: `Action not available: ${action.label}`,
      statChanges: {},
    };
  }

  // Handle actions with special logic
  switch (actionId) {
    case 'WRITE':
      return executeWrite(state, rng);

    case 'PLAY_LOCAL_GIG':
      return executePlayLocalGig(state, rng);

    case 'RELEASE_SINGLE':
      return executeReleaseSingle(state, rng);

    case 'PROMOTE':
      return executePromote(state, rng);

    // Actions without special logic just apply base effects
    default:
      return {
        success: true,
        message: getDefaultActionMessage(actionId),
        statChanges: action.baseEffects,
      };
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

function getQualityDescription(quality: number): string {
  if (quality >= 90) return 'exceptional';
  if (quality >= 75) return 'great';
  if (quality >= 60) return 'solid';
  if (quality >= 40) return 'decent';
  if (quality >= 25) return 'rough';
  return 'terrible';
}

function getDefaultActionMessage(actionId: ActionId): string {
  switch (actionId) {
    case 'REST':
      return 'You took it easy this week. Feeling more rested.';
    case 'REHEARSE':
      return 'Good practice session with the band. Getting tighter.';
    case 'PARTY':
      return 'What a night. Things got pretty wild...';
    case 'SIDE_JOB':
      return 'Another week at the day job. At least the bills are paid.';
    case 'NETWORK':
      return 'Made some industry connections. Could pay off later.';
    default:
      return 'Week complete.';
  }
}

/**
 * Execute PROMOTE action
 * Combines traditional press/media with social media content
 * Includes viral chance and variable engagement
 */
function executePromote(state: GameState, rng: RandomGenerator): ActionResult {
  const baseEffects = { ...ACTIONS.PROMOTE.baseEffects };

  // Small viral chance (4-10% based on algoBoost)
  const viralChance = 0.04 + (state.player.algoBoost / 800);
  const wentViral = rng.next() < viralChance;

  if (wentViral) {
    // Viral hit!
    const viralFollowers = rng.nextInt(1500, 6000);
    const viralCasualListeners = rng.nextInt(400, 1500);
    const coreFansGain = rng.nextInt(15, 40);

    return {
      success: true,
      message: 'Something you posted blew up! The algorithm blessed you this week.',
      statChanges: {
        ...baseEffects,
        followers: viralFollowers,
        casualListeners: viralCasualListeners,
        coreFans: coreFansGain,
        algoBoost: rng.nextInt(8, 18),
        hype: rng.nextInt(6, 12),
        burnout: 3,
      },
    };
  } else {
    // Normal promote week - mix of press and social
    const followers = rng.nextInt(25, 80);
    const coreFansGain = rng.nextInt(3, 12);
    const hype = rng.nextInt(2, 5);
    const algoBoost = rng.nextInt(0, 3);
    // Cred can go slightly up or down
    const credChange = rng.nextInt(-2, 3);

    return {
      success: true,
      message: 'Did some press and posted content. Steady progress.',
      statChanges: {
        ...baseEffects,
        followers,
        coreFans: coreFansGain,
        hype,
        algoBoost,
        cred: credChange,
      },
    };
  }
}

// =============================================================================
// Streaming Era Action Execution
// =============================================================================

/**
 * Execute RELEASE_SINGLE action
 */
function executeReleaseSingle(state: GameState, rng: RandomGenerator): ActionResult {
  // Find unreleased songs
  const unreleasedSongs = state.songs.filter(s => !s.isReleased);

  if (unreleasedSongs.length === 0) {
    return {
      success: false,
      message: 'No unreleased songs to drop as a single.',
      statChanges: {},
    };
  }

  // Pick the best unreleased song (by hit potential)
  const sortedSongs = [...unreleasedSongs].sort((a, b) => b.hitPotential - a.hitPotential);
  const song = sortedSongs[0];

  // Calculate release tier based on player's digital presence
  const baseScore = (song.quality + song.hitPotential) / 2;
  const digitalBoost = (state.player.algoBoost + state.player.followers / 10000) / 2;
  const totalScore = baseScore + digitalBoost + rng.nextInt(-10, 10);

  let tierName: string;
  if (totalScore >= 80) tierName = 'massive buzz';
  else if (totalScore >= 60) tierName = 'strong start';
  else if (totalScore >= 40) tierName = 'steady streams';
  else tierName = 'quiet release';

  // Stat gains scale with release quality
  const hypeGain = Math.floor(3 + totalScore / 20);
  const algoBoostGain = Math.floor(2 + totalScore / 30);
  const casualListenersGain = Math.floor(totalScore * 5);

  return {
    success: true,
    message: `Dropped "${song.title}" as a single - ${tierName}!`,
    statChanges: {
      ...ACTIONS.RELEASE_SINGLE.baseEffects,
      hype: hypeGain,
      algoBoost: algoBoostGain,
      casualListeners: casualListenersGain,
    },
    releasedSongId: song.id, // Signal to update song's release status
  };
}

