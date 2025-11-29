/**
 * Rivalry events - events involving rival bands and industry drama
 * These events simulate the competitive nature of the music industry
 */

import { GameEvent } from '@/engine/types';

// =============================================================================
// Plagiarism/Theft Events
// =============================================================================

export const theftEvents: GameEvent[] = [
  {
    id: 'EV_SONG_STOLEN',
    triggerConditions: {
      minReleasedSongs: 2,
      minHype: 25,
    },
    weight: 3,
    textIntro: 'A bigger band just released a track that sounds suspiciously like one of your songs. The melody, the hook — it\'s all there. Your fans are furious, sharing comparison videos online.',
    choices: [
      {
        id: 'CALL_OUT',
        label: 'Call them out publicly',
        outcomeText: 'You post the receipts. The internet takes sides. It\'s messy, but people are talking about you now.',
        statChanges: { hype: 15, cred: 5, industryGoodwill: -10 },
        flagsSet: ['calledOutThief'],
      },
      {
        id: 'LAWYER_UP',
        label: 'Get a lawyer',
        outcomeText: 'You contact a music attorney. These things take time, but you\'re building a case. The legal fees hurt.',
        statChanges: { money: -1500, industryGoodwill: 5, stability: -5 },
        flagsSet: ['lawyeredUp'],
      },
      {
        id: 'LET_IT_GO',
        label: 'Let it go',
        outcomeText: 'It stings, but you move on. Some fans respect the grace. Others think you\'re a pushover.',
        statChanges: { stability: 5, cred: -5 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'EV_LABEL_GAVE_SONG_AWAY',
    triggerConditions: {
      hasLabelDeal: true,
      minReleasedSongs: 3,
    },
    weight: 2,
    textIntro: 'You find out your label gave one of your unreleased demos to another artist on their roster. They\'re calling it a "co-write" you never agreed to. The song is doing well. You\'re getting nothing.',
    choices: [
      {
        id: 'CONFRONT_LABEL',
        label: 'Confront the label',
        outcomeText: 'A tense meeting follows. They offer a pittance in "goodwill." The relationship is strained.',
        statChanges: { money: 500, industryGoodwill: -15, cred: 5 },
      },
      {
        id: 'GO_PUBLIC',
        label: 'Go public with the story',
        outcomeText: 'You share your story. Other artists come forward with similar experiences. The label is furious.',
        statChanges: { hype: 10, cred: 10, industryGoodwill: -25 },
        flagsSet: ['labelExposed'],
      },
      {
        id: 'SWALLOW_IT',
        label: 'Swallow it for now',
        outcomeText: 'You say nothing. The bitter taste stays with you. But you\'re still on the roster.',
        statChanges: { stability: -10, burnout: 5 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'EV_RIFF_SIMILARITY',
    triggerConditions: {
      minReleasedSongs: 1,
      minHype: 30,
    },
    weight: 3,
    textIntro: 'A music blog posts a comparison video showing your riff alongside a track by a bigger band. The comments are split: some say you stole it, others say they stole from you.',
    choices: [
      {
        id: 'RELEASE_DATES',
        label: 'Post your recording dates',
        outcomeText: 'You prove you recorded first. Most people take your side. The other band stays quiet.',
        statChanges: { cred: 8, hype: 5 },
      },
      {
        id: 'SHRUG_IT_OFF',
        label: 'Shrug it off',
        outcomeText: '"Great artists think alike." You play it cool. The story dies down.',
        statChanges: { stability: 3 },
      },
      {
        id: 'MOCK_THEM',
        label: 'Mock the comparison',
        outcomeText: 'You make a joke video about it. Some people laugh. The other band\'s fans are not amused.',
        statChanges: { hype: 8, cred: -3 },
      },
    ],
    oneTime: true,
  },
];

// =============================================================================
// Beef/Feud Events
// =============================================================================

export const beefEvents: GameEvent[] = [
  {
    id: 'EV_RIVAL_TALKS_TRASH',
    triggerConditions: {
      minHype: 20,
      minCoreFans: 100,
    },
    weight: 4,
    textIntro: 'In a recent interview, another band at your level talked trash about your music. "Derivative," they called it. "All style, no substance." Your fans are waiting for your response.',
    choices: [
      {
        id: 'FIRE_BACK',
        label: 'Fire back publicly',
        outcomeText: 'You don\'t hold back. The beef is officially on. Music blogs are eating it up.',
        statChanges: { hype: 12, stability: -5 },
        flagsSet: ['beefStarted'],
      },
      {
        id: 'SUBTLE_SHADE',
        label: 'Throw subtle shade',
        outcomeText: 'You respond with a cryptic post. Those who know, know. Plausible deniability intact.',
        statChanges: { hype: 5, cred: 3 },
      },
      {
        id: 'TAKE_HIGH_ROAD',
        label: 'Take the high road',
        outcomeText: '"We\'re too focused on our own music to worry about what others think." Classy.',
        statChanges: { cred: 8, stability: 5 },
      },
      {
        id: 'WRITE_DISS_TRACK',
        label: 'Write a diss track',
        outcomeText: 'You spend the week channeling your anger into music. The result is scathing.',
        statChanges: { hype: 20, skill: 2, burnout: 5 },
        flagsSet: ['wroteDissTrack'],
      },
    ],
    oneTime: false,
  },
  {
    id: 'EV_CONFRONTATION_BACKSTAGE',
    triggerConditions: {
      minHype: 35,
      hasFlag: 'beefStarted',
    },
    weight: 5,
    textIntro: 'You run into your rival backstage at a festival. The tension is thick. They\'re walking toward you. Cameras are everywhere.',
    choices: [
      {
        id: 'SQUARE_UP',
        label: 'Square up',
        outcomeText: 'Words are exchanged. Someone\'s crew holds someone back. It\'s all over social media within minutes.',
        statChanges: { hype: 15, cred: -5, industryGoodwill: -10 },
      },
      {
        id: 'EXTEND_HAND',
        label: 'Extend a hand',
        outcomeText: 'You offer a handshake. They\'re surprised. The moment is awkward but... maybe this is growth?',
        statChanges: { stability: 5, cred: 5 },
        flagsClear: ['beefStarted'],
      },
      {
        id: 'WALK_AWAY',
        label: 'Walk away',
        outcomeText: 'You turn and leave. No satisfaction for them or the cameras. Cold.',
        statChanges: { cred: 3 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'EV_PEACE_OFFERING',
    triggerConditions: {
      hasFlag: 'beefStarted',
      minWeek: 10,
    },
    weight: 3,
    textIntro: 'Your rival\'s manager reaches out. They want to end the beef. Maybe even collaborate. "Think of the press," they say.',
    choices: [
      {
        id: 'ACCEPT_PEACE',
        label: 'Accept the olive branch',
        outcomeText: 'You meet for coffee. Turns out they\'re not so bad. The beef is over.',
        statChanges: { stability: 8, industryGoodwill: 5, cred: -3 },
        flagsClear: ['beefStarted'],
        flagsSet: ['madePeace'],
      },
      {
        id: 'COLLAB_FOR_PRESS',
        label: 'Collab for the headlines',
        outcomeText: 'You record a track together. It\'s calculated, but the stream numbers don\'t lie.',
        statChanges: { hype: 15, algoBoost: 10, cred: -5 },
        flagsClear: ['beefStarted'],
      },
      {
        id: 'REFUSE',
        label: 'Refuse',
        outcomeText: '"Tell them I said no." Some wounds don\'t heal. The beef continues.',
        statChanges: { cred: 5, stability: -3 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'EV_ONLINE_WAR',
    triggerConditions: {
      minFollowers: 500,
      minHype: 25,
    },
    weight: 4,
    textIntro: 'A rival band\'s fans are flooding your comments. It started as criticism, now it\'s harassment. Your fans are fighting back. It\'s a full-on online war.',
    choices: [
      {
        id: 'FAN_ARMY',
        label: 'Let your fans handle it',
        outcomeText: 'You stay silent while your stans go to war. It\'s ugly, but you keep your hands clean.',
        statChanges: { hype: 5, stability: -5 },
      },
      {
        id: 'CALL_PEACE',
        label: 'Call for peace',
        outcomeText: 'You post asking everyone to calm down. Some listen. The vitriol slowly dies down.',
        statChanges: { cred: 5, stability: 5 },
      },
      {
        id: 'GO_PRIVATE',
        label: 'Go private for a while',
        outcomeText: 'You lock your accounts and disappear. Let the storm pass.',
        statChanges: { hype: -5, stability: 10, burnout: -3 },
      },
    ],
    oneTime: false,
  },
];

// =============================================================================
// Industry Shaft Events
// =============================================================================

export const industryShaftEvents: GameEvent[] = [
  {
    id: 'EV_OPENING_SLOT_STOLEN',
    triggerConditions: {
      minHype: 30,
      minIndustryGoodwill: 20,
    },
    weight: 3,
    textIntro: 'You were promised the opening slot on a major tour. Then the label\'s other band got it instead. "Business decision," they say. You\'re out.',
    choices: [
      {
        id: 'ACCEPT_SCRAPS',
        label: 'Accept a smaller tour',
        outcomeText: 'They offer you a backup tour. Less prestigious, but it\'s something.',
        statChanges: { money: 500, industryGoodwill: 5, cred: -3 },
      },
      {
        id: 'DEMAND_COMPENSATION',
        label: 'Demand compensation',
        outcomeText: 'You fight for what was promised. They give you a small payout to go away.',
        statChanges: { money: 1000, industryGoodwill: -10 },
      },
      {
        id: 'BOOK_OWN_TOUR',
        label: 'Book your own tour',
        outcomeText: 'Fine. You\'ll do it yourself. It\'s harder, but it\'s yours.',
        statChanges: { money: -500, cred: 8, burnout: 5 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'EV_FESTIVAL_BILLING_DRAMA',
    triggerConditions: {
      minHype: 40,
      minCoreFans: 500,
    },
    weight: 3,
    textIntro: 'The festival lineup is out. You\'re billed below a band you\'ve been outselling for months. Their manager plays golf with the festival organizer.',
    choices: [
      {
        id: 'COMPLAIN',
        label: 'Complain to organizers',
        outcomeText: 'They bump you up slightly, citing a "printing error." Small victory.',
        statChanges: { hype: 3, industryGoodwill: -5 },
      },
      {
        id: 'PROVE_THEM_WRONG',
        label: 'Steal the show',
        outcomeText: 'You deliver a legendary performance. Blogs are calling it the set of the weekend.',
        statChanges: { hype: 15, skill: 2, cred: 8, burnout: 8 },
      },
      {
        id: 'SKIP_FESTIVAL',
        label: 'Pull out in protest',
        outcomeText: 'You make a statement and cancel. Some respect the principle. Others think you\'re difficult.',
        statChanges: { cred: 5, industryGoodwill: -15, hype: -5 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'EV_RADIO_BLACKLIST',
    triggerConditions: {
      minHype: 25,
      minReleasedSongs: 2,
    },
    weight: 2,
    textIntro: 'Word gets back to you: a major radio programmer has blacklisted your music. Apparently you (or your manager) said something that rubbed them wrong. No airplay for you.',
    choices: [
      {
        id: 'APOLOGIZE',
        label: 'Try to apologize',
        outcomeText: 'You reach out through back channels. Maybe they\'ll reconsider. Eventually.',
        statChanges: { industryGoodwill: 3, cred: -5, stability: -3 },
      },
      {
        id: 'WHO_NEEDS_RADIO',
        label: 'Who needs radio anyway?',
        outcomeText: 'It\'s the streaming era. You focus on playlists instead. Radio is dying anyway, right?',
        statChanges: { algoBoost: 5, cred: 3 },
      },
      {
        id: 'EXPOSE_THEM',
        label: 'Call out the gatekeeping',
        outcomeText: 'You tweet about industry gatekeeping. Other artists share their stories. It\'s a moment.',
        statChanges: { hype: 10, cred: 8, industryGoodwill: -20 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'EV_VENUE_DOUBLE_BOOK',
    triggerConditions: {
      minCoreFans: 200,
    },
    weight: 3,
    textIntro: 'The venue double-booked your show with a "higher priority" act. They\'re offering to move you to a Tuesday night. Or you can cancel.',
    choices: [
      {
        id: 'TAKE_TUESDAY',
        label: 'Take the Tuesday',
        outcomeText: 'Not ideal, but a show\'s a show. The turnout is smaller than expected.',
        statChanges: { money: 100, stability: -3 },
      },
      {
        id: 'FIND_NEW_VENUE',
        label: 'Find another venue',
        outcomeText: 'Scrambling, you book a smaller place. Your fans show up anyway. The intimacy is actually nice.',
        statChanges: { cred: 5, coreFans: 20, burnout: 5 },
      },
      {
        id: 'CANCEL_AND_RANT',
        label: 'Cancel and rant online',
        outcomeText: 'You cancel and blast the venue. They fire back. Your fans brigade their reviews.',
        statChanges: { hype: 5, industryGoodwill: -10, stability: -5 },
      },
    ],
    oneTime: false,
  },
  {
    id: 'EV_STREAMING_FRAUD',
    triggerConditions: {
      minReleasedSongs: 3,
      minFollowers: 1000,
    },
    weight: 2,
    textIntro: 'Your latest single suddenly loses half its streams overnight. The platform claims they detected "suspicious activity" on your account. You didn\'t do anything wrong.',
    choices: [
      {
        id: 'APPEAL',
        label: 'Appeal to the platform',
        outcomeText: 'You file an appeal with documentation. They restore some streams weeks later. The damage is done.',
        statChanges: { algoBoost: -10, stability: -5 },
      },
      {
        id: 'GO_PUBLIC_STREAMING',
        label: 'Go public with the issue',
        outcomeText: 'You share your story. Other artists pile on with similar experiences. The platform issues a vague apology.',
        statChanges: { hype: 8, cred: 5, algoBoost: -15 },
      },
      {
        id: 'MOVE_ON',
        label: 'Just move on',
        outcomeText: 'You take the L and focus on the next release. The algorithm is a fickle god.',
        statChanges: { stability: 3, burnout: 3 },
      },
    ],
    oneTime: true,
  },
];

// =============================================================================
// Opportunity Events (with rivals)
// =============================================================================

export const rivalOpportunityEvents: GameEvent[] = [
  {
    id: 'EV_RIVAL_COLLAB_OFFER',
    triggerConditions: {
      minHype: 35,
      minCred: 30,
    },
    weight: 3,
    textIntro: 'A band you\'ve always respected reaches out. They want to collaborate on a track. Their fans are different from yours — this could be big.',
    choices: [
      {
        id: 'ACCEPT_COLLAB',
        label: 'Accept the collaboration',
        outcomeText: 'The session is magic. Two visions becoming one. The result is something neither could make alone.',
        statChanges: { hype: 15, skill: 3, algoBoost: 8 },
        flagsSet: ['majorCollab'],
      },
      {
        id: 'NEGOTIATE_TERMS',
        label: 'Negotiate for better terms',
        outcomeText: 'You push for co-production credit and a bigger cut. They respect the hustle. Deal done.',
        statChanges: { hype: 12, money: 500, industryGoodwill: -3 },
        flagsSet: ['majorCollab'],
      },
      {
        id: 'DECLINE_POLITELY',
        label: 'Decline politely',
        outcomeText: 'You\'re not feeling it right now. They understand. Maybe another time.',
        statChanges: { stability: 3 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'EV_POACH_MEMBER',
    triggerConditions: {
      minHype: 40,
      minBandmates: 2,
    },
    weight: 2,
    textIntro: 'A member of a bigger band quietly reaches out. They want to join your band. It would be a huge get — but it would mean replacing someone.',
    choices: [
      {
        id: 'RECRUIT_THEM',
        label: 'Recruit them',
        outcomeText: 'You make the swap. The new member\'s talent is undeniable. But loyalty in the scene takes a hit.',
        statChanges: { skill: 5, cred: -8, hype: 10 },
        bandmateChanges: { loyalty: -15 },
      },
      {
        id: 'POLITELY_REFUSE',
        label: 'Politely refuse',
        outcomeText: 'You\'re loyal to your current lineup. They respect that. Word gets around.',
        statChanges: { cred: 5, stability: 5 },
        bandmateChanges: { loyalty: 10 },
      },
      {
        id: 'ADD_NOT_REPLACE',
        label: 'Add them without replacing anyone',
        outcomeText: 'Your sound gets bigger. The logistics get harder. But more is more, right?',
        statChanges: { hype: 8, burnout: 5, money: -200 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'EV_SHARED_TOUR',
    triggerConditions: {
      minCoreFans: 500,
      minHype: 30,
    },
    weight: 3,
    textIntro: 'A band with complementary vibes proposes a co-headlining tour. Split costs, combined fanbases. Could be the smart move.',
    choices: [
      {
        id: 'JOIN_TOUR',
        label: 'Join the tour',
        outcomeText: 'The tour is a grind but a blast. Your fanbases mix. New connections form.',
        statChanges: { coreFans: 100, money: 800, burnout: 10 },
      },
      {
        id: 'COUNTER_OFFER',
        label: 'Counter with better billing',
        outcomeText: 'You negotiate for top billing. They agree. Slightly awkward, but professional.',
        statChanges: { coreFans: 80, money: 1000, industryGoodwill: -3 },
      },
      {
        id: 'PREFER_SOLO_TOUR',
        label: 'Prefer to tour solo',
        outcomeText: 'You want to build your own thing. They understand. Maybe next time.',
        statChanges: { cred: 3 },
      },
    ],
    oneTime: true,
  },
];

// =============================================================================
// Export All Rivalry Events
// =============================================================================

export const ALL_RIVALRY_EVENTS: GameEvent[] = [
  ...theftEvents,
  ...beefEvents,
  ...industryShaftEvents,
  ...rivalOpportunityEvents,
];
