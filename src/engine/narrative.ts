/**
 * Narrative System
 *
 * Brings the world-weary, sarcastic, sometimes poetic voice of 90s DOS games
 * to the weekly grind of chasing rock stardom.
 */

import { GameState, Player, ActionId } from './types';
import { RandomGenerator } from './random';
import { getTotalFans } from './state';

// =============================================================================
// Types
// =============================================================================

export interface NarrativeContext {
  state: GameState;
  actionId: ActionId;
  rng: RandomGenerator;
  actionSuccess: boolean;
  moneyChange?: number;
  fansGained?: number;
  songTitle?: string;
}

export interface FlavorEvent {
  id: string;
  text: string;
  conditions?: {
    minWeek?: number;
    maxWeek?: number;
    minFans?: number;
    maxFans?: number;
    minMoney?: number;
    maxMoney?: number;
    minHealth?: number;
    maxHealth?: number;
    minHype?: number;
    maxHype?: number;
    minBurnout?: number;
    maxBurnout?: number;
    hasLabelDeal?: boolean;
    hasBandmates?: boolean;
    onTour?: boolean;
  };
}

// =============================================================================
// Action Message Pools
//
// Each action has multiple possible messages that paint scenes.
// The narrator is world-weary but not without hope. Sarcastic but not cruel.
// =============================================================================

const WRITE_MESSAGES = {
  success: [
    'The song came at 3 AM, the way they always do. You scratched it out on the back of a gas station receipt. It might be garbage. It might be gold. Hard to tell the difference at this hour.',
    'You wrote something today. Whether it\'s art or just three chords and a grudge against your ex, only time will tell.',
    'The melody\'s been haunting you for weeks. You finally pinned it down. "{title}" — not bad. Not bad at all.',
    'Four hours staring at a blank page. Then suddenly, it all poured out. "{title}" exists now. The world didn\'t ask for it, but it\'s getting it anyway.',
    'You wrote "{title}" in one sitting. Felt like channeling something bigger than yourself. Probably just the coffee, but still.',
    'Another song for the pile. "{title}" — born from boredom, caffeine, and the vague sense that you should be doing something with your life.',
    'The neighbors are going to complain again. But "{title}" needed to exist, and it needed to exist loudly.',
    'Some songs fight you. "{title}" came easy. Those are the ones you don\'t trust.',
  ],
  struggling: [
    'You spent the week wrestling with a song that refuses to be written. Some days the muse shows up drunk and mean.',
    'Writer\'s block is just your brain\'s way of saying it has nothing to say. You forced out "{title}" anyway. Spite is a valid creative fuel.',
    'The song\'s not done, but you\'re done with it. "{title}" will have to be good enough.',
  ],
};

const REHEARSE_MESSAGES = {
  good: [
    'Something clicked today. The band locked in on the bridge of the new one and for thirty seconds, you weren\'t four people anymore. You were one thing. One loud, beautiful thing.',
    'Rehearsal ran long. Nobody complained. When it\'s working, you don\'t watch the clock.',
    'The drummer finally nailed that fill. You\'ve only been asking for three weeks. Progress.',
    'You ran the set twice. First time was sloppy. Second time was dangerous. The good kind of dangerous.',
    'Four hours in a room that smells like old sweat and ambition. The songs are tighter. You\'re getting somewhere.',
    'Rehearsal went well. Everyone showed up sober, on time, and ready to work. Mark it on the calendar — might not happen again.',
  ],
  rough: [
    'Rehearsal was a mess. Wrong notes, wrong attitudes, wrong everything. But you showed up. That counts for something.',
    'Your bassist suggested a key change. Your guitarist suggested your bassist find another band. Just another Tuesday.',
    'The new song isn\'t working. Nobody wants to admit it. You\'ll figure it out. You always do. Eventually.',
    'Three hours of going in circles. But even bad rehearsals are rehearsals. The muscle memory builds.',
  ],
};

const PLAY_LOCAL_GIG_MESSAGES = {
  good: [
    'Tuesday night at a half-empty bar. Maybe thirty people, half of them just there for cheap drinks. But when you hit the chorus, something shifted. A few heads nodded. One guy in back actually put down his phone. You\'re building something here.',
    'The venue smelled like stale beer and broken dreams. Perfect. You played like your rent depended on it — because it does.',
    'Small crowd, but they were listening. Really listening. That\'s worth more than a packed room of people waiting for the DJ.',
    'The bartender watched your whole set. After, she said "You\'re going places." You hope she\'s right. You need her to be right.',
    'Played to a crowd of twelve. Gave them a show meant for twelve hundred. It\'s called practice.',
    'The sound guy actually knew what he was doing. Miracles happen, even in dive bars.',
    'Someone bought your demo after the show. Actual money, exchanged for your music. Never gets old.',
  ],
  rough: [
    'The crowd talked through most of your set. You\'ve learned to play louder than indifference.',
    'Open mic night energy at a paying gig. Not your best. But you showed up, plugged in, and made noise. That\'s the job.',
    'You played to the bartender and two drunk regulars. They clapped. It wasn\'t pity applause. Probably.',
    'The monitors cut out during your best song. You finished acoustic, practically screaming. Punk rock, you told yourself. Very punk rock.',
  ],
};

const RECORD_MESSAGES = [
  'Red light on. Deep breath. "{title}" exists outside your head now. It\'s real. It\'s permanent. It\'s terrifying.',
  'Studio time is expensive. Sleep is free. Guess which one you\'re getting less of. But "{title}" is done.',
  'The album\'s in the can. "{title}" — {trackCount} songs, countless hours, and whatever\'s left of your savings.',
  'You\'ve listened to these songs so many times they\'ve lost all meaning. That\'s how you know they\'re done.',
  'The engineer said it sounds "ready." You\'re not sure anything\'s ever really ready. But "{title}" is as close as it\'s going to get.',
];

const TOUR_MESSAGES = {
  start: [
    'The van\'s packed. The route\'s planned. Time to see if anyone out there is listening.',
    'Tour life: bad food, worse sleep, and the best nights of your life. You wouldn\'t trade it.',
    'Hit the road. Somewhere out there, people who\'ve never heard of you are about to have their minds changed.',
  ],
  ongoing: [
    'Another city, another stage, another chance to make believers out of strangers.',
    'You\'ve been in this van so long, it\'s starting to feel like home. That\'s either beautiful or sad. Probably both.',
    'Three shows in four days. Your voice is shot and your back is killing you. But the crowds keep getting bigger.',
    'Woke up and genuinely didn\'t know what city you were in. Tour\'s going well.',
    'The road stretches on. So do you.',
  ],
};

const PROMOTE_MESSAGES = {
  normal: [
    'You handed out flyers until your hands went numb. Guerrilla marketing. Very DIY. Very broke.',
    'Updated all your socials. Sent emails to bloggers. Begged a college radio station to give you a spin. The hustle never stops.',
    'You spent the week being your own hype man. Someone has to believe in you. Might as well be you.',
    'Promotion is the unglamorous part they don\'t put in the movies. But you did it anyway.',
    'Postered half the city. Your face is on every telephone pole and bulletin board. Fame, in its most literal form.',
    'Fed the algorithm. Liked, commented, shared. The modern version of working the room.',
    'Another post, another tiny bid for relevance. The internet is hungry. You fed it.',
    'Did some press, updated the socials. Let the people know you\'re still alive and making noise.',
  ],
  viral: [
    'Something caught. The numbers are climbing. Your phone won\'t stop buzzing. This is either the start of something or a very good day.',
    'You went viral. For a minute, the whole internet knew your name. Make it count.',
    'The post exploded. Shares, reposts, quotes. For one shining moment, the algorithm loved you.',
    'Something you posted blew up. Everyone\'s talking. This is your fifteen minutes — use them.',
  ],
};

const NETWORK_MESSAGES = [
  'Shook hands with people who might matter someday. Or might not. Industry parties are just job fairs with better lighting.',
  'You talked to a guy who knows a guy who books the venues you want to play. Progress is measured in handshakes.',
  'Bought drinks for people with business cards. The music industry runs on alcohol and optimism.',
  'Worked the room. Smiled until your face hurt. Somewhere in there, you might have made a connection that matters.',
  'Another night of pretending to like people who might be useful. Networking is just strategic friendship.',
];

const REST_MESSAGES = [
  'You did nothing today. Absolutely nothing. It was glorious.',
  'Slept for twelve hours. Your body was running a debt you didn\'t know you owed.',
  'A day off. No shows, no rehearsal, no hustle. Just you and the ceiling fan, getting reacquainted.',
  'Rest day. You almost forgot what those were. Your bones remembered.',
  'Took it easy. The grind will still be there tomorrow. It\'s patient like that.',
  'You sat in a park and watched normal people live normal lives. Weird. Peaceful. Unsettling.',
];

const PARTY_MESSAGES = {
  mild: [
    'A few drinks, some good conversations, home before 2 AM. Practically responsible by rock star standards.',
    'You went out. Had fun. Remembered most of it. A successful evening.',
    'Blew off some steam. The scene is good for that. Connections made over shots tend to be honest ones.',
  ],
  wild: [
    'The night is a blur of neon and bad decisions. You\'ll piece it together from the photos. Eventually.',
    'You closed down the bar and then some. Tomorrow\'s problem is tomorrow\'s. Tonight was tonight\'s.',
    'Somewhere around 4 AM, you found yourself on a roof, watching the city wake up. How you got there is anyone\'s guess.',
    'The party went late. Then early. Then late again. Time is a social construct, and you\'re not feeling very social.',
  ],
};

const SIDE_JOB_MESSAGES = [
  'Eight hours of honest work for dishonest pay. The dream is on hold. Rent isn\'t.',
  'You smiled at customers who didn\'t deserve it. The money\'s small, but it\'s money.',
  'Clocked in. Clocked out. Wondered what you\'re doing with your life. Normal Tuesday.',
  'The day job is a necessary evil. You tell yourself it\'s temporary. It\'s been temporary for a while now.',
  'Earned some cash the boring way. Your art doesn\'t pay the bills yet. Your shift did.',
  'Another week of pretending this isn\'t your real life. The music is your real life. This is just... waiting.',
];

const RELEASE_SINGLE_MESSAGES = [
  '"{title}" is out there now. Floating in the digital void. Waiting to be found. Or forgotten.',
  'Hit publish. Deep breath. "{title}" belongs to the world now. No taking it back.',
  'The single drops at midnight. You refresh the streaming numbers like it\'s a slot machine. It kind of is.',
  'Released "{title}" to the algorithms. May the robots be merciful.',
  '"{title}" is live. Now comes the waiting. The refreshing. The hoping.',
];

// =============================================================================
// Flavor Events
//
// Small narrative moments that don't need choices — just texture.
// These fire more frequently than regular events to keep things interesting.
// =============================================================================

export const FLAVOR_EVENTS: FlavorEvent[] = [
  // Early career observations
  {
    id: 'FLAVOR_EARLY_DOUBT',
    text: 'You passed a busker on the street today. She was good. Really good. For a second, you wondered if that\'s where this is all heading. Then you walked on. Nothing to do but keep going.',
    conditions: { maxWeek: 52, maxFans: 500 },
  },
  {
    id: 'FLAVOR_POSTER_MEMORY',
    text: 'Saw a poster for a band you opened for six months ago. They\'re playing the arena now. That could be you. Should be you. Will be you. Right?',
    conditions: { minWeek: 20, maxFans: 2000 },
  },
  {
    id: 'FLAVOR_OLD_DEMO',
    text: 'Found an old demo tape while cleaning. God, you were terrible. But you could hear it — the thing that made you think you could do this. Still there, underneath the bad production.',
    conditions: { minWeek: 30 },
  },
  {
    id: 'FLAVOR_FAN_LETTER',
    text: 'Got a message from a fan. Said your music got them through a hard time. You read it three times. This is why you do it. This right here.',
    conditions: { minFans: 200 },
  },
  {
    id: 'FLAVOR_VENUE_MEMORY',
    text: 'Drove past the first venue that ever paid you. Sixteen dollars and a drink ticket. Felt like a fortune at the time. Some things change. Some don\'t.',
    conditions: { minWeek: 40 },
  },

  // Money struggles
  {
    id: 'FLAVOR_BROKE_RAMEN',
    text: 'Ramen for dinner again. Fifth night this week. Rock and roll.',
    conditions: { maxMoney: 200 },
  },
  {
    id: 'FLAVOR_BROKE_GUITAR',
    text: 'Your guitar needs new strings. Your wallet says no. You\'ll make do. Necessity is the mother of tone, or something.',
    conditions: { maxMoney: 150 },
  },
  {
    id: 'FLAVOR_BROKE_LANDLORD',
    text: 'Landlord knocked today. You pretended not to be home. The music better start paying soon.',
    conditions: { maxMoney: 100 },
  },
  {
    id: 'FLAVOR_FIRST_REAL_MONEY',
    text: 'For the first time in a while, you looked at your bank account and didn\'t wince. Progress.',
    conditions: { minMoney: 2000 },
  },

  // Band dynamics
  {
    id: 'FLAVOR_BAND_VAN',
    text: 'The van smells like feet and ambition. Mostly feet. Nobody complains anymore. This is just life now.',
    conditions: { hasBandmates: true },
  },
  {
    id: 'FLAVOR_BAND_ARGUMENT',
    text: 'The band argued about setlist order for an hour. Passionate? Yes. Productive? Questionable. But at least everyone cares.',
    conditions: { hasBandmates: true },
  },
  {
    id: 'FLAVOR_BAND_MOMENT',
    text: 'After rehearsal, everyone hung around. No one wanted to leave. Moments like this, you remember why you started a band instead of going solo.',
    conditions: { hasBandmates: true },
  },
  {
    id: 'FLAVOR_ALONE',
    text: 'It\'s quiet. No bandmates, no crowd, no chaos. Just you and the music. Sometimes that\'s enough. Sometimes it\'s too much.',
    conditions: { hasBandmates: false },
  },

  // Scene observations
  {
    id: 'FLAVOR_SCENE_DRAMA',
    text: 'Scene drama this week. Two bands beefing over who headlined what when. You stayed out of it. The music speaks louder than gossip.',
    conditions: { minWeek: 15 },
  },
  {
    id: 'FLAVOR_SCENE_CLOSURE',
    text: 'Another venue closed. The city is running out of places to play. Every stage that survives matters a little more now.',
    conditions: { minWeek: 30 },
  },
  {
    id: 'FLAVOR_NEW_BAND',
    text: 'Saw a new band play last night. Kids, basically. But they had it. That thing. Made you feel old and inspired at the same time.',
    conditions: { minWeek: 50 },
  },

  // Health and wellbeing
  {
    id: 'FLAVOR_TIRED',
    text: 'Caught your reflection in a window. When did those dark circles move in? They look permanent now.',
    conditions: { maxHealth: 50 },
  },
  {
    id: 'FLAVOR_BURNOUT',
    text: 'The alarm went off and you just... stared at it. The fire\'s still there. It\'s just buried under a lot of ash right now.',
    conditions: { minBurnout: 60 },
  },
  {
    id: 'FLAVOR_FEELING_GOOD',
    text: 'Woke up feeling human today. Energy, optimism, the works. Better ride this wave while it lasts.',
    conditions: { minHealth: 80, maxBurnout: 30 },
  },

  // Success moments
  {
    id: 'FLAVOR_RECOGNIZED',
    text: 'Someone recognized you on the street. Asked if you were "that singer." You are. You really are.',
    conditions: { minFans: 1000 },
  },
  {
    id: 'FLAVOR_RADIO_PLAY',
    text: 'Heard your song on the radio. Pulled over just to listen. Still doesn\'t feel real.',
    conditions: { minFans: 5000 },
  },
  {
    id: 'FLAVOR_MERCH_SPOTTED',
    text: 'Saw someone wearing your band shirt. A stranger. In public. Didn\'t say anything. Just smiled like an idiot for the rest of the day.',
    conditions: { minFans: 2000 },
  },

  // Late career reflections
  {
    id: 'FLAVOR_YEARS_IN',
    text: 'Realized you\'ve been doing this for years now. The kids coming up don\'t know the world before you. That\'s either legacy or age. Maybe both.',
    conditions: { minWeek: 150 },
  },
  {
    id: 'FLAVOR_INDUSTRY_FRIEND',
    text: 'Ran into someone from the early days. They got out. Got a real job. They seemed happy. You seemed happy. Neither of you was sure about the other.',
    conditions: { minWeek: 100 },
  },

  // Tour life
  {
    id: 'FLAVOR_TOUR_SUNRISE',
    text: 'Watched the sun come up from a rest stop parking lot. Coffee in hand, the highway ahead, yesterday\'s show still ringing in your ears. This is the life you chose.',
    conditions: { onTour: true },
  },
  {
    id: 'FLAVOR_TOUR_LONELY',
    text: 'Hotel room. Another city that looks like every other city. You called home. No one picked up. The road is long and sometimes it\'s lonely.',
    conditions: { onTour: true },
  },
  {
    id: 'FLAVOR_TOUR_MAGIC',
    text: 'Played to a crowd that sang every word. In a city you\'d never been to. To people you\'d never met. How did they learn the songs? Magic. Pure magic.',
    conditions: { onTour: true, minFans: 3000 },
  },

  // Hype moments
  {
    id: 'FLAVOR_HYPE_BUZZ',
    text: 'People are talking. Your name keeps coming up. The buzz is real. Don\'t let it go to your head. Don\'t let it go to waste either.',
    conditions: { minHype: 50 },
  },
  {
    id: 'FLAVOR_HYPE_FADING',
    text: 'The phone\'s been quiet. The emails slower. The hype fades if you don\'t feed it. Time to make some noise.',
    conditions: { maxHype: 20, minFans: 1000 },
  },
];

// =============================================================================
// Weekly Narrative Summary Generator
// =============================================================================

const WEEK_OPENERS = {
  struggling: [
    'Another week in the trenches.',
    'The grind continues.',
    'Still here. Still fighting.',
    'One more week in the books.',
  ],
  stable: [
    'A decent week.',
    'Things are moving.',
    'Progress, inch by inch.',
    'The machine keeps turning.',
  ],
  rising: [
    'Something\'s happening.',
    'The momentum is building.',
    'People are starting to notice.',
    'The tide is turning.',
  ],
  successful: [
    'This is what you worked for.',
    'The hard work is paying off.',
    'Dreams are starting to look like plans.',
    'You can see the top from here.',
  ],
};

/**
 * Get the appropriate action message based on context
 */
export function getActionMessage(context: NarrativeContext): string {
  const { state, actionId, rng, actionSuccess, moneyChange, fansGained, songTitle } = context;
  const { player } = state;

  const pick = <T>(arr: T[]): T => arr[rng.nextInt(0, arr.length - 1)];

  switch (actionId) {
    case 'WRITE': {
      const messages = player.burnout > 60 || !actionSuccess
        ? WRITE_MESSAGES.struggling
        : WRITE_MESSAGES.success;
      return pick(messages).replace('{title}', songTitle || 'Untitled');
    }

    case 'REHEARSE': {
      const messages = player.stability < 40 ? REHEARSE_MESSAGES.rough : REHEARSE_MESSAGES.good;
      return pick(messages);
    }

    case 'PLAY_LOCAL_GIG': {
      const messages = player.hype > 30 || (fansGained && fansGained > 10)
        ? PLAY_LOCAL_GIG_MESSAGES.good
        : PLAY_LOCAL_GIG_MESSAGES.rough;
      return pick(messages);
    }

    case 'RECORD': {
      const msg = pick(RECORD_MESSAGES);
      return msg
        .replace('{title}', songTitle || 'the album')
        .replace('{trackCount}', String(state.songs.length || 'several'));
    }

    case 'TOUR': {
      if (state.week === 1 || !state.player.flags?.onTour) {
        return pick(TOUR_MESSAGES.start);
      }
      return pick(TOUR_MESSAGES.ongoing);
    }

    case 'PROMOTE': {
      // Check if they went viral (big follower gain)
      const messages = (fansGained && fansGained > 500)
        ? PROMOTE_MESSAGES.viral
        : PROMOTE_MESSAGES.normal;
      return pick(messages);
    }

    case 'NETWORK':
      return pick(NETWORK_MESSAGES);

    case 'REST':
      return pick(REST_MESSAGES);

    case 'PARTY': {
      const messages = player.addiction > 40 ? PARTY_MESSAGES.wild : PARTY_MESSAGES.mild;
      return pick(messages);
    }

    case 'SIDE_JOB':
      return pick(SIDE_JOB_MESSAGES);

    case 'RELEASE_SINGLE': {
      return pick(RELEASE_SINGLE_MESSAGES).replace('{title}', songTitle || 'the single');
    }

    default:
      return 'Another week passes.';
  }
}

/**
 * Select a flavor event based on current state
 */
export function selectFlavorEvent(state: GameState, rng: RandomGenerator): FlavorEvent | null {
  const { player, week, bandmates } = state;
  const totalFans = getTotalFans(player);
  const hasBandmates = bandmates.filter(b => b.status === 'active').length > 0;
  const hasLabelDeal = state.labelDeals.some(d => d.status === 'active');

  // Filter eligible events
  const eligible = FLAVOR_EVENTS.filter(event => {
    const c = event.conditions;
    if (!c) return true;

    if (c.minWeek !== undefined && week < c.minWeek) return false;
    if (c.maxWeek !== undefined && week > c.maxWeek) return false;
    if (c.minFans !== undefined && totalFans < c.minFans) return false;
    if (c.maxFans !== undefined && totalFans > c.maxFans) return false;
    if (c.minMoney !== undefined && player.money < c.minMoney) return false;
    if (c.maxMoney !== undefined && player.money > c.maxMoney) return false;
    if (c.minHealth !== undefined && player.health < c.minHealth) return false;
    if (c.maxHealth !== undefined && player.health > c.maxHealth) return false;
    if (c.minHype !== undefined && player.hype < c.minHype) return false;
    if (c.maxHype !== undefined && player.hype > c.maxHype) return false;
    if (c.minBurnout !== undefined && player.burnout < c.minBurnout) return false;
    if (c.maxBurnout !== undefined && player.burnout > c.maxBurnout) return false;
    if (c.hasLabelDeal !== undefined && c.hasLabelDeal !== hasLabelDeal) return false;
    if (c.hasBandmates !== undefined && c.hasBandmates !== hasBandmates) return false;
    if (c.onTour !== undefined && c.onTour !== !!player.flags?.onTour) return false;

    return true;
  });

  if (eligible.length === 0) return null;

  // ~30% chance to get a flavor event each week
  if (rng.next() > 0.30) return null;

  return eligible[rng.nextInt(0, eligible.length - 1)];
}

/**
 * Generate a week opener based on game state
 */
export function getWeekOpener(state: GameState, rng: RandomGenerator): string {
  const { player } = state;
  const totalFans = getTotalFans(player);

  let category: keyof typeof WEEK_OPENERS;

  if (totalFans >= 10000 && player.hype >= 40) {
    category = 'successful';
  } else if (player.hype >= 30 || totalFans >= 3000) {
    category = 'rising';
  } else if (player.money >= 500 && player.health >= 50) {
    category = 'stable';
  } else {
    category = 'struggling';
  }

  const openers = WEEK_OPENERS[category];
  return openers[rng.nextInt(0, openers.length - 1)];
}

/**
 * Generate end-of-week reflection
 */
export function getWeekReflection(state: GameState, rng: RandomGenerator): string | null {
  const { player, week } = state;

  // Only ~20% of weeks get a reflection
  if (rng.next() > 0.20) return null;

  const reflections: string[] = [];

  // Money-based reflections
  if (player.money < 50) {
    reflections.push(
      'The wallet\'s thin. But you didn\'t get into this for the money. At least, that\'s what you keep telling yourself.',
      'Broke again. The music better start paying soon.',
    );
  } else if (player.money > 5000) {
    reflections.push(
      'For once, money isn\'t the problem. Don\'t get used to it.',
      'The bank account looks healthy. The soul? Check back later.',
    );
  }

  // Health-based reflections
  if (player.health < 40) {
    reflections.push(
      'Your body is sending signals you\'re trying hard to ignore.',
      'You\'re running on fumes. Eventually, fumes run out.',
    );
  }

  // Burnout-based reflections
  if (player.burnout > 70) {
    reflections.push(
      'The fire\'s still there. It\'s just getting harder to find.',
      'Even the music sounds tired lately.',
    );
  }

  // Week milestones
  if (week === 52) {
    reflections.push('One year in. Still standing. That\'s something.');
  } else if (week === 104) {
    reflections.push('Two years. Some dreams die faster. Some take longer. Yours is still breathing.');
  } else if (week === 156) {
    reflections.push('Three years of this. At some point, it stopped being a phase and became your life.');
  }

  if (reflections.length === 0) return null;
  return reflections[rng.nextInt(0, reflections.length - 1)];
}

// =============================================================================
// Narrator Voice for Key Moments
// =============================================================================

export const NARRATOR = {
  gameStart: [
    'Another dreamer with a guitar and a death wish for a day job. Let\'s see how this goes.',
    'The music industry doesn\'t owe you anything. But you\'re going to take what you can anyway.',
    'Welcome to the grind. Pack light. It\'s going to be a long road.',
    'So you want to be a rock star. Everybody does. The difference is you\'re actually going to try.',
  ],

  gameOverDeath: [
    'The flame that burns twice as bright burns half as long. Yours burned bright. It burned out.',
    'In the end, the music wasn\'t enough. Or maybe it was too much. The line blurs.',
    'Another name added to the list of those who gave everything. Rest now.',
  ],

  gameOverBroke: [
    'Dreams don\'t pay rent. Turns out, neither did you.',
    'The money ran out before the music did. Story old as time.',
    'You shot for the stars and hit your overdraft limit. Game over.',
  ],

  gameOverBandCollapsed: [
    'A band is a marriage with more arguments and less legal protection. Yours just filed for divorce.',
    'You can make music alone. But it\'s not the same. Nothing is.',
    'They walked. You stayed. Or maybe you walked and they stayed. At some point, it stops mattering.',
  ],

  gameOverTimeLimit: [
    'Ten years. Some make it. Some don\'t. Some don\'t know which they are until much later.',
    'The decade ends. Time to tally the damage and the victories. Mostly damage. But some victories.',
    'Your twenties called. They want their dreams back. You spent them on guitar strings and van repairs.',
  ],

  milestoneFirstGig: 'First gig done. A thousand more to go. But this one? This one you\'ll remember.',
  milestoneFirstAlbum: 'An album. Actual songs, in an actual order, with your name on it. Real.',
  milestone1000Fans: 'A thousand people know your music. A thousand strangers who chose to listen. Don\'t waste it.',
  milestone10000Fans: 'Ten thousand fans. That\'s a small army. A cult following. The beginning of something bigger.',
  milestoneLabelDeal: 'Signed. The dream just got paperwork. Be careful what you wished for.',
};

export function getNarratorLine(key: keyof typeof NARRATOR, rng: RandomGenerator): string {
  const lines = NARRATOR[key];
  if (Array.isArray(lines)) {
    return lines[rng.nextInt(0, lines.length - 1)];
  }
  return lines;
}
