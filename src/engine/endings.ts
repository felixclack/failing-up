/**
 * Ending determination system
 *
 * Endings are selected based on final game state, including stats,
 * completed arcs, and key flags. Each ending has variations based
 * on specific conditions.
 */

import { GameState, GameOverReason } from './types';
import { getTotalFans } from './state';

// =============================================================================
// Ending Types
// =============================================================================

export type EndingId =
  | 'LEGEND'           // Massive success - rock god status
  | 'STAR'             // Big success - famous and wealthy
  | 'SURVIVOR'         // Made it work - sustainable career
  | 'CULT_HERO'        // Small but devoted following
  | 'BURNOUT'          // Crashed and burned
  | 'TRAGEDY'          // Death ending
  | 'OBSCURITY'        // Faded away, forgotten
  | 'SELLOUT'          // Commercial success, no respect
  | 'COMEBACK_KID'     // Recovered from rock bottom
  // Digital Era Endings
  | 'ALGORITHM_CASUALTY'  // Built career on platform that changed
  | 'CONTENT_PRISON'      // Trapped in content creation
  | 'DIY_PIONEER'         // Built own following independently
  | 'VIRAL_GHOST';        // Had viral moment, then faded

export interface EndingVariation {
  condition: (state: GameState) => boolean;
  title: string;
  subtitle: string;
  narrative: string;
}

export interface Ending {
  id: EndingId;
  baseTitle: string;
  baseSubtitle: string;
  baseNarrative: string;
  variations: EndingVariation[];
}

export interface EndingResult {
  id: EndingId;
  title: string;
  subtitle: string;
  narrative: string;
  callbacks: EndingCallback[];
}

export interface EndingCallback {
  text: string;
  type: 'arc' | 'event' | 'achievement' | 'stat';
}

// =============================================================================
// Ending Definitions
// =============================================================================

const ENDINGS: Ending[] = [
  // LEGEND - The ultimate success
  {
    id: 'LEGEND',
    baseTitle: 'Rock Legend',
    baseSubtitle: 'They\'ll remember your name forever',
    baseNarrative: 'You did it. You became everything you dreamed of and more. The world knows your name, your songs play on every station, and a generation of kids picks up guitars because of you.',
    variations: [
      {
        condition: (state) => state.completedArcIds.includes('ARC_ADDICTION') && state.player.addiction < 30,
        title: 'The Survivor Legend',
        subtitle: 'From the edge of destruction to the top of the world',
        narrative: 'You stared into the abyss and walked back. Now you stand on top of the world, living proof that rock bottom isn\'t the end. Your story inspires millions.',
      },
      {
        condition: (state) => state.player.cred >= 80,
        title: 'The Authentic Legend',
        subtitle: 'Success without compromise',
        narrative: 'You never sold out. Every note was real, every lyric true. And somehow, against all odds, the world loved you for it. They don\'t make them like you anymore.',
      },
    ],
  },

  // STAR - Major success
  {
    id: 'STAR',
    baseTitle: 'Rock Star',
    baseSubtitle: 'You made it',
    baseNarrative: 'You\'re a rock star. Not the biggest, maybe, but real. The records went gold, the tours sold out, and when you walk into a room, people know who you are.',
    variations: [
      {
        condition: (state) => state.player.flags.hasLabelDeal && state.labelDeals.some(d => d.status === 'active'),
        title: 'The Label Success',
        subtitle: 'The industry bet on you - and won',
        narrative: 'The label took a chance on you, and it paid off. Hit records, platinum plaques, all the trappings of success. You played the game and won.',
      },
      {
        condition: (state) => state.albums.filter(a => a.salesTier === 'platinum' || a.salesTier === 'diamond').length >= 2,
        title: 'The Hit Machine',
        subtitle: 'Album after album of gold',
        narrative: 'Your albums flew off the shelves. Platinum after platinum. You figured out how to make music that people loved, and you did it again and again.',
      },
    ],
  },

  // SURVIVOR - Sustainable career
  {
    id: 'SURVIVOR',
    baseTitle: 'The Lifer',
    baseSubtitle: 'Still standing after all these years',
    baseNarrative: 'You\'re not famous. You\'re not rich. But you\'re still making music, still paying the bills, still doing what you love. That\'s more than most can say.',
    variations: [
      {
        condition: (state) => state.player.stability >= 60 && state.player.health >= 60,
        title: 'The Healthy Lifer',
        subtitle: 'You kept your head and your health',
        narrative: 'You avoided the traps that took down so many others. No addiction, no burnout, no breakdown. You\'re living proof that rock and roll doesn\'t have to destroy you.',
      },
      {
        condition: (state) => state.bandmates.filter(b => b.status === 'active').length >= 3,
        title: 'The Band Lifer',
        subtitle: 'Together through thick and thin',
        narrative: 'The band stayed together. Through the fights, the failures, the near-misses. You\'re brothers and sisters in arms, and the music is still alive.',
      },
    ],
  },

  // CULT HERO - Small but devoted
  {
    id: 'CULT_HERO',
    baseTitle: 'Cult Hero',
    baseSubtitle: 'The ones who know, know',
    baseNarrative: 'You never topped the charts. But ask anyone who really knows music, and they know your name. The cognoscenti, the collectors, the true believers - you\'re their hero.',
    variations: [
      {
        condition: (state) => state.player.cred >= 70 && getTotalFans(state.player) < 50000,
        title: 'The Critic\'s Darling',
        subtitle: 'Beloved by those who matter',
        narrative: 'The critics love you. The other musicians love you. Every best-of list has your name on it. You just never figured out how to reach the masses.',
      },
      {
        condition: (state) => state.songs.length >= 30,
        title: 'The Prolific Underground',
        subtitle: 'A catalog that rewards the devoted',
        narrative: 'You wrote and wrote and wrote. Dozens of songs, each one a gem waiting to be discovered. Someday, they\'ll realize what they missed.',
      },
    ],
  },

  // BURNOUT - Crashed out
  {
    id: 'BURNOUT',
    baseTitle: 'Burned Out',
    baseSubtitle: 'The flame that burns twice as bright...',
    baseNarrative: 'You gave everything to the music. Too much. The fire that drove you consumed you. Now the songs are silent and the stage is dark.',
    variations: [
      {
        condition: (state) => state.player.burnout >= 80,
        title: 'Total Exhaustion',
        subtitle: 'Nothing left to give',
        narrative: 'You pushed and pushed until there was nothing left. Not a dramatic ending - just an empty tank and a body that won\'t cooperate anymore.',
      },
      {
        condition: (state) => state.completedArcIds.includes('ARC_BAND_BREAKUP'),
        title: 'The Bitter End',
        subtitle: 'It all fell apart',
        narrative: 'The band imploded. The relationships crumbled. Now you\'re alone with your memories, wondering if any of it was worth it.',
      },
    ],
  },

  // TRAGEDY - Death ending
  {
    id: 'TRAGEDY',
    baseTitle: 'Gone Too Soon',
    baseSubtitle: 'Another one lost to the life',
    baseNarrative: 'The music world mourns. Another talent taken too young, another cautionary tale whispered backstage. Your songs will live on, but you won\'t.',
    variations: [
      {
        condition: (state) => state.player.addiction >= 80,
        title: 'The 27 Club',
        subtitle: 'Joined the legends too soon',
        narrative: 'Addiction took you like it took so many before. They\'ll write songs about you, documentaries, books. Cold comfort for the ones you left behind.',
      },
      {
        condition: (state) => getTotalFans(state.player) >= 100000,
        title: 'A Legend Dies',
        subtitle: 'The world weeps',
        narrative: 'You were on top of the world. Then you were gone. Vigils in the streets, candles in the windows. They never got to say goodbye.',
      },
      {
        condition: (state) => state.completedArcIds.includes('ARC_ADDICTION'),
        title: 'The Long Goodbye',
        subtitle: 'Everyone saw it coming',
        narrative: 'They tried to help. The interventions, the rehab, the second chances. In the end, the demons won. At least the suffering is over.',
      },
    ],
  },

  // OBSCURITY - Forgotten
  {
    id: 'OBSCURITY',
    baseTitle: 'Faded Away',
    baseSubtitle: 'Whatever happened to...?',
    baseNarrative: 'The phone stopped ringing. The gigs dried up. One day you realized no one remembered your name. The dream died quietly, without fanfare.',
    variations: [
      {
        condition: (state) => state.player.industryGoodwill < 20,
        title: 'Blacklisted',
        subtitle: 'Doors closed everywhere',
        narrative: 'You burned too many bridges. Every door in the industry is closed. Not even a cruel ending - just silence.',
      },
      {
        condition: (state) => state.player.money < -500,
        title: 'Broke and Forgotten',
        subtitle: 'The bills came due',
        narrative: 'The debts piled up. The creditors called. In the end, you had to walk away - from the music, from the dream, from everything.',
      },
    ],
  },

  // SELLOUT - Commercial but no respect
  {
    id: 'SELLOUT',
    baseTitle: 'The Sellout',
    baseSubtitle: 'You got the money, they got your soul',
    baseNarrative: 'You made it. Sort of. The bank account\'s full, but the music stopped meaning anything a long time ago. Was it worth it?',
    variations: [
      {
        condition: (state) => state.player.money >= 50000 && state.player.cred < 30,
        title: 'The Commercial Machine',
        subtitle: 'Success without satisfaction',
        narrative: 'You wrote the jingles, did the commercials, played the corporate gigs. The checks cleared, but somewhere along the way, you lost the plot.',
      },
    ],
  },

  // COMEBACK KID - Recovered from disaster
  {
    id: 'COMEBACK_KID',
    baseTitle: 'The Comeback Kid',
    baseSubtitle: 'Everyone loves a redemption story',
    baseNarrative: 'You fell. Hard. But you got back up. The comeback story is the best story in rock and roll, and you\'re living proof.',
    variations: [
      {
        condition: (state) =>
          state.triggeredEventIds.includes('ARC_ADDICTION_S3_OD_SCARE') &&
          state.player.addiction < 30 &&
          getTotalFans(state.player) >= 10000,
        title: 'From Rock Bottom',
        subtitle: 'The ultimate second act',
        narrative: 'They wrote you off. Obituaries half-written. Then you came back, sober and stronger. Now your story inspires everyone who\'s ever fallen down.',
      },
    ],
  },

  // =============================================================================
  // Digital Era Endings
  // =============================================================================

  // ALGORITHM CASUALTY - Built career on platform that changed
  {
    id: 'ALGORITHM_CASUALTY',
    baseTitle: 'Algorithm Casualty',
    baseSubtitle: 'The platform giveth, the platform taketh away',
    baseNarrative: 'You built everything on one platform. Then they changed the rules. Your reach vanished overnight. Now you\'re a cautionary tale for every creator who puts all their eggs in one basket.',
    variations: [
      {
        condition: (state) =>
          state.completedArcIds.includes('ARC_PLATFORM_DEPENDENCY') &&
          state.player.followers >= 100000,
        title: 'The Former Influencer',
        subtitle: 'Remember when you had a million followers?',
        narrative: 'At your peak, brands begged to work with you. Then the algorithm changed. Same content, invisible results. The followers are still there - they just never see you anymore.',
      },
      {
        condition: (state) =>
          state.player.algoBoost < 20 &&
          state.player.followers >= 50000,
        title: 'Shadowbanned',
        subtitle: 'The platform forgot your name',
        narrative: 'No notification. No explanation. Just silence. You post to tens of thousands of followers and hear nothing back. The algorithm has moved on.',
      },
      {
        condition: (state) =>
          state.triggeredEventIds.includes('ARC_PLATFORM_S0_CHANGE'),
        title: 'Caught in the Shift',
        subtitle: 'Yesterday\'s format, yesterday\'s star',
        narrative: 'You mastered one type of content. Then the platform pivoted to something completely different. Your skills became obsolete overnight.',
      },
    ],
  },

  // CONTENT PRISON - Trapped in content creation
  {
    id: 'CONTENT_PRISON',
    baseTitle: 'Content Creator Prison',
    baseSubtitle: 'You can\'t stop, you won\'t stop',
    baseNarrative: 'You wanted to make music. Now you make content. Endless content. The algorithm demands constant feeding, and you\'ve become its servant. When did you last write a song?',
    variations: [
      {
        condition: (state) =>
          state.completedArcIds.includes('ARC_CREATOR_BURNOUT') &&
          state.player.burnout >= 70,
        title: 'The Burnout',
        subtitle: 'Can\'t stop even though you\'re empty',
        narrative: 'The numbers dip if you take even one day off. So you don\'t. You can\'t. The content machine has no off switch. You\'ve forgotten what rest feels like.',
      },
      {
        condition: (state) =>
          state.player.stability < 30 &&
          state.player.followers >= 50000,
        title: 'The Perform-Former',
        subtitle: 'The mask is stuck',
        narrative: 'You\'ve been performing happiness so long you forgot how to actually feel it. The camera persona took over. Who are you when you\'re not on?',
      },
      {
        condition: (state) =>
          state.player.burnout >= 80 &&
          state.player.coreFans < 500,
        title: 'Posting Into the Void',
        subtitle: 'A million followers, no real fans',
        narrative: 'All those followers and none of them would notice if you quit. The engagement is hollow. The community is fake. You\'re shouting into the void.',
      },
    ],
  },

  // DIY PIONEER - Built own following independently
  {
    id: 'DIY_PIONEER',
    baseTitle: 'DIY Pioneer',
    baseSubtitle: 'You did it your way',
    baseNarrative: 'No label, no manager, no middlemen. You built a direct relationship with your fans and proved the old system isn\'t the only path. You\'re not rich or famous, but you\'re free.',
    variations: [
      {
        condition: (state) =>
          state.completedArcIds.includes('ARC_DIY_PATRON') &&
          state.player.coreFans >= 3000,
        title: 'The Independent Model',
        subtitle: 'The thousand true fans, realized',
        narrative: 'You found your people and they found you. A few thousand true fans who pay directly for what you create. It\'s not stadium money, but it\'s honest money.',
      },
      {
        condition: (state) =>
          state.triggeredEventIds.includes('diyManifesto') &&
          state.player.cred >= 60,
        title: 'The Movement Starter',
        subtitle: 'Others followed your path',
        narrative: 'Your DIY success became a blueprint. Other artists followed your lead, building their own direct-to-fan empires. You didn\'t just make it - you showed the way.',
      },
      {
        condition: (state) =>
          !state.player.flags.hasLabelDeal &&
          state.player.money >= 20000 &&
          state.player.coreFans >= 2000,
        title: 'The Self-Made',
        subtitle: 'Every dollar earned yourself',
        narrative: 'You never signed away your rights. Every stream, every sale, every penny - it\'s yours. The accountants at the labels will never touch your money.',
      },
    ],
  },

  // VIRAL GHOST - Had viral moment, then faded
  {
    id: 'VIRAL_GHOST',
    baseTitle: 'Viral Ghost',
    baseSubtitle: 'You had your moment',
    baseNarrative: 'For one glorious moment, the entire internet knew your name. Then they moved on. You\'re left with the memory of fifteen minutes and the question of what might have been.',
    variations: [
      {
        condition: (state) =>
          state.completedArcIds.includes('ARC_VIRAL_ONE_HIT') &&
          state.player.algoBoost < 30,
        title: 'The One-Hit Wonder',
        subtitle: 'That one song was everywhere. Then nowhere.',
        narrative: 'Everyone knew the song. The clip, the meme, the sound. But they never clicked through to see who made it. You\'re famous and anonymous at the same time.',
      },
      {
        condition: (state) =>
          state.triggeredEventIds.includes('becameMeme') &&
          getTotalFans(state.player) < 20000,
        title: 'The Meme',
        subtitle: 'They know your face, not your music',
        narrative: 'Your face became a meme. Millions shared it. Zero bought your album. You\'re not a musician anymore - you\'re a reaction image.',
      },
      {
        condition: (state) =>
          state.player.followers >= 100000 &&
          state.player.coreFans < 500,
        title: 'The Hollow Following',
        subtitle: 'A million ghosts',
        narrative: 'Look at all those followers! None of them listen to your music. None of them buy tickets. They followed once and forgot. You\'re a number, not an artist.',
      },
      {
        condition: (state) =>
          state.triggeredEventIds.includes('chasedViral') &&
          state.player.cred < 30,
        title: 'The Algorithm Slave',
        subtitle: 'You became what they wanted',
        narrative: 'You stopped making your music and started chasing trends. Each video less authentic than the last. You found the formula - and lost yourself.',
      },
    ],
  },
];

// =============================================================================
// Ending Determination
// =============================================================================

/**
 * Calculate ending score based on various factors
 */
function calculateEndingScore(
  endingId: EndingId,
  state: GameState
): number {
  const { player, gameOverReason, completedArcIds } = state;
  const totalFans = getTotalFans(player);
  let score = 0;

  switch (endingId) {
    case 'LEGEND':
      if (totalFans >= 500000) score += 100;
      else if (totalFans >= 200000) score += 50;
      if (player.cred >= 70) score += 30;
      if (player.money >= 100000) score += 20;
      if (completedArcIds.includes('ARC_LABEL_DEAL')) score += 20;
      break;

    case 'STAR':
      if (totalFans >= 100000) score += 80;
      else if (totalFans >= 50000) score += 50;
      if (player.money >= 50000) score += 30;
      if (player.hype >= 60) score += 20;
      break;

    case 'SURVIVOR':
      if (totalFans >= 5000 && totalFans < 100000) score += 50;
      if (player.health >= 50) score += 30;
      if (player.stability >= 50) score += 30;
      if (player.money >= 0) score += 20;
      if (gameOverReason === 'time_limit') score += 40;
      break;

    case 'CULT_HERO':
      if (player.cred >= 60) score += 50;
      if (totalFans >= 1000 && totalFans < 50000) score += 40;
      if (state.songs.length >= 20) score += 20;
      break;

    case 'BURNOUT':
      if (player.burnout >= 70) score += 60;
      if (player.stability < 30) score += 40;
      if (completedArcIds.includes('ARC_BAND_BREAKUP')) score += 30;
      if (gameOverReason === 'band_collapsed') score += 50;
      break;

    case 'TRAGEDY':
      if (gameOverReason === 'death') score += 200; // Always wins for death
      break;

    case 'OBSCURITY':
      if (totalFans < 1000) score += 60;
      if (player.industryGoodwill < 20) score += 40;
      if (gameOverReason === 'broke') score += 50;
      if (player.hype < 20) score += 30;
      break;

    case 'SELLOUT':
      if (player.money >= 30000 && player.cred < 40) score += 70;
      if (player.industryGoodwill >= 60 && player.cred < 40) score += 40;
      break;

    case 'COMEBACK_KID':
      const hadAddictionArc = completedArcIds.includes('ARC_ADDICTION');
      const recovered = player.addiction < 40;
      const stillSuccessful = totalFans >= 10000;
      if (hadAddictionArc && recovered && stillSuccessful) score += 100;
      break;

    // Digital Era Endings
    case 'ALGORITHM_CASUALTY':
      if (completedArcIds.includes('ARC_PLATFORM_DEPENDENCY')) score += 60;
      if (player.algoBoost < 20 && player.followers >= 30000) score += 50;
      if (player.followers >= 50000 && player.coreFans < 500) score += 40;
      break;

    case 'CONTENT_PRISON':
      if (completedArcIds.includes('ARC_CREATOR_BURNOUT')) score += 70;
      if (player.burnout >= 70 && player.followers >= 30000) score += 50;
      if (player.stability < 30 && player.followers >= 30000) score += 40;
      break;

    case 'DIY_PIONEER':
      if (completedArcIds.includes('ARC_DIY_PATRON')) score += 80;
      if (!player.flags.hasLabelDeal && player.coreFans >= 2000) score += 50;
      if (player.coreFans >= 3000 && player.money >= 10000) score += 40;
      break;

    case 'VIRAL_GHOST':
      if (completedArcIds.includes('ARC_VIRAL_ONE_HIT')) score += 50;
      if (player.followers >= 50000 && player.algoBoost < 20) score += 50;
      if (player.followers >= 100000 && player.coreFans < 500) score += 60;
      break;
  }

  return score;
}

/**
 * Determine the best ending for the current game state
 */
export function determineEnding(state: GameState): EndingId {
  // Death always results in tragedy ending
  if (state.gameOverReason === 'death') {
    return 'TRAGEDY';
  }

  // Calculate scores for each ending
  const scores = ENDINGS.map(ending => ({
    id: ending.id,
    score: calculateEndingScore(ending.id, state),
  }));

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);

  // Return the highest scoring ending
  // Default to OBSCURITY if nothing scores well
  if (scores[0].score >= 30) {
    return scores[0].id;
  }

  return 'OBSCURITY';
}

/**
 * Get the full ending result with title, narrative, and callbacks
 */
export function getEndingResult(state: GameState): EndingResult {
  const endingId = state.endingId as EndingId || determineEnding(state);
  const ending = ENDINGS.find(e => e.id === endingId);

  if (!ending) {
    return {
      id: 'OBSCURITY',
      title: 'The End',
      subtitle: 'Your story concludes',
      narrative: 'And so it ends.',
      callbacks: [],
    };
  }

  // Check for variations
  let title = ending.baseTitle;
  let subtitle = ending.baseSubtitle;
  let narrative = ending.baseNarrative;

  for (const variation of ending.variations) {
    if (variation.condition(state)) {
      title = variation.title;
      subtitle = variation.subtitle;
      narrative = variation.narrative;
      break;
    }
  }

  // Generate callbacks based on game history
  const callbacks = generateCallbacks(state);

  return {
    id: endingId,
    title,
    subtitle,
    narrative,
    callbacks,
  };
}

// =============================================================================
// Callbacks - References to Past Events
// =============================================================================

/**
 * Generate callbacks that reference significant events in the player's history
 */
function generateCallbacks(state: GameState): EndingCallback[] {
  const callbacks: EndingCallback[] = [];
  const { player, completedArcIds, triggeredEventIds, bandmates, albums, labelDeals } = state;

  // Arc callbacks
  if (completedArcIds.includes('ARC_ADDICTION')) {
    if (player.addiction < 30) {
      callbacks.push({
        text: 'You faced your demons and won. The recovery wasn\'t easy, but you made it.',
        type: 'arc',
      });
    } else {
      callbacks.push({
        text: 'The addiction spiral left its mark. Some wounds never fully heal.',
        type: 'arc',
      });
    }
  }

  if (completedArcIds.includes('ARC_LABEL_DEAL')) {
    const activeDeal = labelDeals.find(d => d.status === 'active');
    if (activeDeal) {
      callbacks.push({
        text: `The deal with ${activeDeal.name} shaped your career in ways you never expected.`,
        type: 'arc',
      });
    }
  }

  if (completedArcIds.includes('ARC_BAND_BREAKUP')) {
    callbacks.push({
      text: 'The breakup hurt. Some of them still won\'t talk to you.',
      type: 'arc',
    });
  }

  // Digital Era Arc callbacks
  if (completedArcIds.includes('ARC_VIRAL_ONE_HIT')) {
    if (player.coreFans >= 1000) {
      callbacks.push({
        text: 'That viral moment was just the beginning. You turned 15 minutes of fame into something real.',
        type: 'arc',
      });
    } else {
      callbacks.push({
        text: 'You went viral once. The clip still pops up sometimes. A ghost of what could have been.',
        type: 'arc',
      });
    }
  }

  if (completedArcIds.includes('ARC_CANCEL')) {
    if (player.stability >= 50) {
      callbacks.push({
        text: 'The internet tried to end you. You\'re still here. Scarred, maybe, but standing.',
        type: 'arc',
      });
    } else {
      callbacks.push({
        text: 'The cancellation left marks. Not on your career - on your soul.',
        type: 'arc',
      });
    }
  }

  if (completedArcIds.includes('ARC_CREATOR_BURNOUT')) {
    if (player.burnout < 50) {
      callbacks.push({
        text: 'You learned to stop. To rest. To make music because you wanted to, not because the algorithm demanded it.',
        type: 'arc',
      });
    } else {
      callbacks.push({
        text: 'The content machine never stops. Neither did you. Look where that got you.',
        type: 'arc',
      });
    }
  }

  if (completedArcIds.includes('ARC_DIY_PATRON')) {
    callbacks.push({
      text: 'You built something direct. No middlemen, no gatekeepers. Just you and your people.',
      type: 'arc',
    });
  }

  if (completedArcIds.includes('ARC_PLATFORM_DEPENDENCY')) {
    callbacks.push({
      text: 'The algorithm taught you a lesson: build on rented land, lose it all when the landlord changes the rules.',
      type: 'arc',
    });
  }

  // Event callbacks
  if (triggeredEventIds.includes('EV_MEMBER_OVERDOSE')) {
    const deadMember = bandmates.find(b => b.status === 'dead');
    if (deadMember) {
      callbacks.push({
        text: `You never forgot ${deadMember.name}. Their empty chair haunts every rehearsal.`,
        type: 'event',
      });
    }
  }

  if (triggeredEventIds.includes('ARC_ADDICTION_S3_OD_SCARE')) {
    callbacks.push({
      text: 'That night in the hospital changed everything. You saw the other side and came back.',
      type: 'event',
    });
  }

  // Achievement callbacks
  const platinumAlbums = albums.filter(a => a.salesTier === 'platinum' || a.salesTier === 'diamond');
  if (platinumAlbums.length > 0) {
    callbacks.push({
      text: `${platinumAlbums.length} platinum album${platinumAlbums.length > 1 ? 's' : ''} - not bad for a kid with a dream.`,
      type: 'achievement',
    });
  }

  const totalFans = getTotalFans(player);
  if (totalFans >= 100000) {
    callbacks.push({
      text: `${totalFans.toLocaleString()} people know your name. That\'s a small city.`,
      type: 'achievement',
    });
  }

  // Stat-based callbacks
  if (player.stability >= 80) {
    callbacks.push({
      text: 'Through it all, you kept your head. That\'s rarer than platinum records.',
      type: 'stat',
    });
  }

  if (player.cred >= 80) {
    callbacks.push({
      text: 'You never compromised. The music always came first. They respect that.',
      type: 'stat',
    });
  }

  if (player.money >= 100000) {
    callbacks.push({
      text: 'You actually made money doing this. That puts you ahead of 99% of musicians.',
      type: 'stat',
    });
  }

  return callbacks;
}

// =============================================================================
// Ending Display Helpers
// =============================================================================

/**
 * Get a color class based on ending type
 */
export function getEndingColor(endingId: EndingId): string {
  switch (endingId) {
    case 'LEGEND':
      return 'text-yellow-400'; // Gold
    case 'STAR':
      return 'text-purple-400'; // Purple star
    case 'SURVIVOR':
      return 'text-green-400'; // Healthy green
    case 'CULT_HERO':
      return 'text-blue-400'; // Cool blue
    case 'BURNOUT':
      return 'text-orange-400'; // Flame
    case 'TRAGEDY':
      return 'text-red-500'; // Blood red
    case 'OBSCURITY':
      return 'text-gray-400'; // Faded
    case 'SELLOUT':
      return 'text-green-500'; // Money green
    case 'COMEBACK_KID':
      return 'text-cyan-400'; // Phoenix blue
    // Digital Era Endings
    case 'ALGORITHM_CASUALTY':
      return 'text-pink-400'; // Algo pink
    case 'CONTENT_PRISON':
      return 'text-red-400'; // Warning red
    case 'DIY_PIONEER':
      return 'text-emerald-400'; // Independent green
    case 'VIRAL_GHOST':
      return 'text-slate-400'; // Ghost gray
    default:
      return 'text-white';
  }
}

/**
 * Get an emoji/icon for the ending
 */
export function getEndingIcon(endingId: EndingId): string {
  switch (endingId) {
    case 'LEGEND':
      return '👑';
    case 'STAR':
      return '⭐';
    case 'SURVIVOR':
      return '🎸';
    case 'CULT_HERO':
      return '🎭';
    case 'BURNOUT':
      return '🔥';
    case 'TRAGEDY':
      return '🕯️';
    case 'OBSCURITY':
      return '👤';
    case 'SELLOUT':
      return '💰';
    case 'COMEBACK_KID':
      return '🦅';
    // Digital Era Endings
    case 'ALGORITHM_CASUALTY':
      return '📉';
    case 'CONTENT_PRISON':
      return '📱';
    case 'DIY_PIONEER':
      return '🛠️';
    case 'VIRAL_GHOST':
      return '👻';
    default:
      return '🎵';
  }
}
