/**
 * Festival events - seasonal opportunities for bigger exposure
 * Festival season runs roughly weeks 20-35 (May-August)
 */

import { GameEvent } from '@/engine/types';

// Helper to check if it's festival season (used in comments, actual check in triggerConditions)
// Weeks 20-35 roughly = May through August

export const festivalEvents: GameEvent[] = [
  // ===== Festival Offer Events =====

  // Small festival slot offer (early career)
  {
    id: 'EV_SMALL_FEST_OFFER',
    triggerConditions: {
      minFans: 500,
      minWeek: 20,  // Festival season starts
    },
    weight: 2,
    textIntro: 'A small local festival wants you on their new bands stage. It\'s muddy, it\'s chaotic, but thousands of people will walk past.',
    choices: [
      {
        id: 'ACCEPT_SMALL_FEST',
        label: 'Accept the slot',
        outcomeText: 'You play to a curious crowd. Some were walking to the bar, but they stopped to listen. New faces in the audience.',
        statChanges: { fans: 50, hype: 5, coreFans: 15, cred: 2 },
      },
      {
        id: 'NEGOTIATE_BETTER_SLOT',
        label: 'Ask for a better time slot',
        outcomeText: 'They move you from 11am to 3pm. Much better crowd. The sun\'s even out.',
        statChanges: { fans: 80, hype: 8, coreFans: 25 },
      },
      {
        id: 'DECLINE_FEST',
        label: 'Decline - not worth it',
        outcomeText: 'The travel costs would eat any fee. You focus on your own shows instead.',
        statChanges: { money: 100, cred: 1 },
      },
    ],
  },

  // Mid-tier festival slot
  {
    id: 'EV_MID_FEST_OFFER',
    triggerConditions: {
      minFans: 3000,
      minHype: 25,
      minWeek: 18,
    },
    weight: 2,
    textIntro: 'A well-known regional festival offers you a main stage slot. Early afternoon, but still - main stage.',
    choices: [
      {
        id: 'TAKE_MAIN_STAGE',
        label: 'Take the slot',
        outcomeText: 'Main stage. The sound is huge. You can see for miles. People are actually here to see you.',
        statChanges: { fans: 200, hype: 12, image: 5, coreFans: 50, money: 500 },
      },
      {
        id: 'ASK_FOR_LATER',
        label: 'Push for a later slot',
        outcomeText: 'They bump you to early evening. The crowd is warmed up and ready. You deliver.',
        statChanges: { fans: 350, hype: 18, image: 8, coreFans: 80, money: 500 },
      },
      {
        id: 'PASS_ON_FEST',
        label: 'Pass - clashes with tour dates',
        outcomeText: 'You\'ve got shows booked. Can\'t do both. They understand.',
        statChanges: { industryGoodwill: 2 },
      },
    ],
  },

  // Major festival slot
  {
    id: 'EV_MAJOR_FEST_OFFER',
    triggerConditions: {
      minFans: 15000,
      minHype: 40,
      minIndustryGoodwill: 30,
    },
    weight: 1,
    textIntro: 'Your manager calls, breathless. "You\'re being offered a slot at a major festival. Second stage, prime time. This is huge."',
    choices: [
      {
        id: 'ACCEPT_MAJOR',
        label: 'Accept immediately',
        outcomeText: 'The festival is incredible. Tens of thousands watch your set. You\'re trending. This changes everything.',
        statChanges: { fans: 1000, hype: 25, image: 15, coreFans: 200, followers: 500, money: 2000 },
      },
      {
        id: 'NEGOTIATE_MAJOR',
        label: 'Negotiate billing and fee',
        outcomeText: 'Your name goes higher on the poster. Better fee. Better dressing room. You\'ve earned this.',
        statChanges: { fans: 800, hype: 22, image: 12, coreFans: 180, followers: 400, money: 3500, cred: 3 },
      },
      {
        id: 'HOLD_OUT',
        label: 'Hold out for main stage',
        outcomeText: 'Risky move. They come back with a main stage slot the following year. Worth the wait.',
        statChanges: { cred: 8, industryGoodwill: 5 },
        flagsSet: ['festivalMainStagePromised'],
      },
    ],
    oneTime: true,
  },

  // ===== Festival Experience Events =====

  // Festival backstage
  {
    id: 'EV_FEST_BACKSTAGE',
    triggerConditions: {
      minFans: 2000,
      minWeek: 20,
    },
    weight: 2,
    textIntro: 'Festival backstage is surreal. You\'re sharing a green room with bands you grew up listening to.',
    choices: [
      {
        id: 'NETWORK_BACKSTAGE',
        label: 'Network with everyone',
        outcomeText: 'You swap numbers with a legendary guitarist. They might produce your next record.',
        statChanges: { industryGoodwill: 8, image: 3, skill: 2 },
      },
      {
        id: 'STAY_FOCUSED',
        label: 'Stay focused on your set',
        outcomeText: 'You keep your head down, prepare mentally, and deliver one of your best performances.',
        statChanges: { cred: 5, skill: 3 },
      },
      {
        id: 'PARTY_BACKSTAGE',
        label: 'Embrace the party',
        outcomeText: 'Free drinks, famous faces, substances offered freely. It\'s a blur. Amazing, but a blur.',
        statChanges: { image: 5, addiction: 5, stability: -5, health: -3 },
      },
    ],
  },

  // Weather disaster at festival
  {
    id: 'EV_FEST_WEATHER',
    triggerConditions: {
      minFans: 1000,
      minWeek: 22,
    },
    weight: 2,
    textIntro: 'It\'s absolutely chucking it down. The field is a swamp. People are abandoning the stages.',
    choices: [
      {
        id: 'PLAY_IN_RAIN',
        label: 'Play through the rain',
        outcomeText: 'The few who stayed become hardcore fans. They\'ll tell this story forever.',
        statChanges: { coreFans: 60, cred: 8, health: -5, image: 5 },
      },
      {
        id: 'MOVE_TO_TENT',
        label: 'Move to the packed tent stage',
        outcomeText: 'The tent is rammed with refugees from the rain. Intimate, sweaty, incredible.',
        statChanges: { coreFans: 40, hype: 5 },
      },
      {
        id: 'WAIT_IT_OUT',
        label: 'Delay until it passes',
        outcomeText: 'You wait an hour. The rain stops. The crowd returns. Professional choice.',
        statChanges: { stability: 3, industryGoodwill: 2 },
      },
    ],
  },

  // Clashing sets
  {
    id: 'EV_FEST_CLASH',
    triggerConditions: {
      minFans: 5000,
      minWeek: 20,
    },
    weight: 2,
    textIntro: 'You\'re on at the same time as a massive act on the main stage. Your crowd might be thin.',
    choices: [
      {
        id: 'EMBRACE_UNDERDOG',
        label: 'Embrace the underdog role',
        outcomeText: 'The people who chose you over the big name? They\'re YOUR people now.',
        statChanges: { coreFans: 50, cred: 5 },
      },
      {
        id: 'EXTEND_SET',
        label: 'Extend your set',
        outcomeText: 'You play longer to catch people after the headliner. Bold move that pays off.',
        statChanges: { fans: 80, hype: 5, health: -3 },
      },
      {
        id: 'MAKE_PEACE',
        label: 'Tell crowd to catch the other act too',
        outcomeText: 'You give them permission to leave. They respect your graciousness. Many stay anyway.',
        statChanges: { image: 3, cred: 3, coreFans: 20 },
      },
    ],
  },

  // Festival viral moment
  {
    id: 'EV_FEST_VIRAL',
    triggerConditions: {
      minFans: 2000,
      minHype: 20,
    },
    weight: 1,
    textIntro: 'Someone filmed your set and it\'s going viral. A clip of you jumping into the crowd has millions of views.',
    choices: [
      {
        id: 'RIDE_THE_WAVE',
        label: 'Ride the wave',
        outcomeText: 'You post more clips, engage with comments. The algorithm loves you right now.',
        statChanges: { followers: 500, hype: 15, casualListeners: 200, algoBoost: 10 },
      },
      {
        id: 'LINK_TO_MUSIC',
        label: 'Direct people to your music',
        outcomeText: 'You pin your best track in replies. Streams spike dramatically.',
        statChanges: { followers: 300, coreFans: 50, cataloguePower: 5 },
      },
      {
        id: 'STAY_MYSTERIOUS',
        label: 'Stay mysterious',
        outcomeText: 'You don\'t engage. The mystique builds. People want to know more about this band.',
        statChanges: { cred: 8, image: 5, followers: 150 },
      },
    ],
    oneTime: true,
  },

  // Festival friendship
  {
    id: 'EV_FEST_FRIENDSHIP',
    triggerConditions: {
      minFans: 1500,
    },
    weight: 2,
    textIntro: 'You click with another band on the same stage. Similar sound, similar size, similar dreams.',
    choices: [
      {
        id: 'PLAN_TOUR_TOGETHER',
        label: 'Plan a tour together',
        outcomeText: 'You swap manager details. A joint headline tour could double both your audiences.',
        statChanges: { industryGoodwill: 5, stability: 3 },
        flagsSet: ['tourPartnerFound'],
      },
      {
        id: 'COLLAB_TRACK',
        label: 'Plan a collaboration',
        outcomeText: 'You agree to write something together. Cross-pollinate fan bases.',
        statChanges: { hype: 5, followers: 30, skill: 1 },
      },
      {
        id: 'JUST_MATES',
        label: 'Just stay mates',
        outcomeText: 'You exchange numbers. Nice to have friends in this industry.',
        statChanges: { stability: 5 },
      },
    ],
  },

  // Festival gear nightmare
  {
    id: 'EV_FEST_GEAR_LOST',
    triggerConditions: {
      minWeek: 20,
    },
    weight: 1,
    textIntro: 'Your gear truck hasn\'t arrived. Set time is in 30 minutes. Pure panic.',
    choices: [
      {
        id: 'BORROW_GEAR',
        label: 'Borrow from other bands',
        outcomeText: 'The music community comes through. Mismatched gear, but you make it work.',
        statChanges: { cred: 5, industryGoodwill: 5, image: -2 },
      },
      {
        id: 'ACOUSTIC_SET',
        label: 'Do an acoustic set',
        outcomeText: 'You grab whatever\'s available and strip it back. Raw, intimate, memorable.',
        statChanges: { cred: 8, coreFans: 30, skill: 2 },
      },
      {
        id: 'DELAY_PLEAD',
        label: 'Plead for a delay',
        outcomeText: 'They give you 30 minutes. The truck arrives with 5 to spare. Heart-stopping.',
        statChanges: { stability: -8, health: -3 },
      },
    ],
  },

  // End of festival season reflection
  {
    id: 'EV_FEST_SEASON_END',
    triggerConditions: {
      minFans: 3000,
      minWeek: 35,
    },
    weight: 2,
    textIntro: 'Festival season\'s over. You\'ve played fields, tents, and stages across the country. Time to take stock.',
    choices: [
      {
        id: 'REST_RECOVER',
        label: 'Rest and recover',
        outcomeText: 'You take a proper break. The festival grind took its toll, but you survived.',
        statChanges: { health: 10, burnout: -15, stability: 8 },
      },
      {
        id: 'COMPILE_FOOTAGE',
        label: 'Compile festival footage',
        outcomeText: 'You create a highlight reel. Proof of how far you\'ve come this summer.',
        statChanges: { followers: 60, image: 5, hype: 3 },
      },
      {
        id: 'PLAN_NEXT_YEAR',
        label: 'Start planning next year',
        outcomeText: 'You\'re already thinking about bigger stages. The ambition never stops.',
        statChanges: { industryGoodwill: 3, stability: -3 },
      },
    ],
    oneTime: true,
  },
];
