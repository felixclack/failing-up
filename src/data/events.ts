/**
 * Event definitions for Failing Up
 * Events are grouped by category for organization
 */

import { GameEvent } from '@/engine/types';
import { labelEvents } from './labelEvents';
import { bandEvents } from './bandEvents';
import { ALL_ARC_EVENTS } from './arcs';
import { ALL_ADDITIONAL_EVENTS } from './moreEvents';
import { streamingEvents } from './streamingEvents';
import { genreEvents } from './genreEvents';

// =============================================================================
// Band Conflict Events
// =============================================================================

const bandConflictEvents: GameEvent[] = [
  {
    id: 'EV_BAND_FIGHT_01',
    triggerConditions: {
      minBandSize: 1,
      minBandVice: 30,
    },
    weight: 3,
    requiredAction: 'REHEARSE',
    textIntro: 'Tension boils over during rehearsal. Your guitarist and drummer are at each other\'s throats about the setlist.',
    choices: [
      {
        id: 'SIDE_WITH_GUITARIST',
        label: 'Back the guitarist',
        outcomeText: 'You take the guitarist\'s side. The drummer shoots you a look that could kill, but backs down. For now.',
        statChanges: { stability: -2 },
        bandmateChanges: { loyalty: -5 },
      },
      {
        id: 'SIDE_WITH_DRUMMER',
        label: 'Back the drummer',
        outcomeText: 'You side with the drummer. The guitarist mutters something about "artistic integrity" and storms off.',
        statChanges: { stability: -2 },
        bandmateChanges: { loyalty: -5 },
      },
      {
        id: 'TELL_THEM_TO_SORT_IT',
        label: 'Tell them to work it out',
        outcomeText: 'You refuse to get involved. They eventually calm down, but the tension lingers.',
        statChanges: { stability: -1 },
        bandmateChanges: { loyalty: -2 },
      },
    ],
  },
  {
    id: 'EV_BAND_MEMBER_LATE',
    triggerConditions: {
      minBandSize: 1,
    },
    weight: 4,
    requiredAction: 'REHEARSE',
    textIntro: 'Your bassist shows up two hours late to practice, reeking of last night\'s party.',
    choices: [
      {
        id: 'CHEW_THEM_OUT',
        label: 'Tear into them',
        outcomeText: 'You lay into them hard. They apologize, looking genuinely ashamed. Whether it sticks is another matter.',
        statChanges: { stability: -2 },
        bandmateChanges: { loyalty: -8, reliability: 3 },
      },
      {
        id: 'LET_IT_SLIDE',
        label: 'Let it go this time',
        outcomeText: 'You wave it off. "Just don\'t make it a habit." They nod, grateful for the pass.',
        statChanges: {},
        bandmateChanges: { loyalty: 2, reliability: -2 },
      },
      {
        id: 'MAKE_THEM_BUY_DRINKS',
        label: 'Make them buy the next round',
        outcomeText: 'You tell them they\'re buying drinks after practice. Everyone laughs, tension broken.',
        statChanges: { stability: 1 },
        bandmateChanges: { loyalty: 1 },
      },
    ],
  },
  {
    id: 'EV_CREATIVE_DIFFERENCES',
    triggerConditions: {
      minBandSize: 2,
      minCred: 20,
    },
    weight: 2,
    textIntro: 'The band\'s divided on musical direction. Half want to go heavier, half want to experiment with something new.',
    choices: [
      {
        id: 'GO_HEAVIER',
        label: 'Go heavier',
        outcomeText: 'You push for a heavier sound. Some of the band grumbles, but they fall in line.',
        statChanges: { cred: 2 },
        bandmateChanges: { loyalty: -3 },
      },
      {
        id: 'EXPERIMENT',
        label: 'Experiment with new sounds',
        outcomeText: 'You decide to try something different. It\'s a risk, but that\'s rock and roll.',
        statChanges: { cred: -1, image: 3 },
        bandmateChanges: { loyalty: -3 },
      },
      {
        id: 'FIND_MIDDLE_GROUND',
        label: 'Find a compromise',
        outcomeText: 'You work out a compromise. Nobody\'s thrilled, but nobody\'s walking out either.',
        statChanges: {},
        bandmateChanges: { loyalty: 1 },
      },
    ],
  },
];

// =============================================================================
// Money & Career Events
// =============================================================================

const moneyEvents: GameEvent[] = [
  {
    id: 'EV_GEAR_STOLEN',
    triggerConditions: {},
    weight: 2,
    textIntro: 'You wake up to bad news: someone broke into the van overnight. Your amp is gone.',
    choices: [
      {
        id: 'BUY_NEW_GEAR',
        label: 'Buy replacement gear ($200)',
        outcomeText: 'You shell out for a new amp. It hurts the wallet, but you can\'t play without gear.',
        statChanges: { money: -200, stability: -3 },
      },
      {
        id: 'BORROW_GEAR',
        label: 'Borrow from another band',
        outcomeText: 'You hit up some friends in another band. They loan you a backup. You owe them one.',
        statChanges: { stability: -2, industryGoodwill: -2 },
      },
      {
        id: 'PLAY_ACOUSTIC',
        label: 'Go acoustic for now',
        outcomeText: 'You decide to make do without. The stripped-down sound is... interesting.',
        statChanges: { image: -3, cred: 2 },
      },
    ],
  },
  {
    id: 'EV_RENT_DUE',
    triggerConditions: {
      maxMoney: 300,
    },
    weight: 4,
    textIntro: 'The landlord\'s at the door. Rent\'s overdue and they\'re not happy.',
    choices: [
      {
        id: 'PAY_RENT',
        label: 'Pay what you owe ($150)',
        outcomeText: 'You scrape together the rent. The landlord leaves satisfied, but you\'re barely scraping by.',
        statChanges: { money: -150, stability: -2 },
      },
      {
        id: 'ASK_FOR_EXTENSION',
        label: 'Beg for more time',
        outcomeText: 'You sweet-talk the landlord into giving you another week. The clock is ticking.',
        statChanges: { stability: -5 },
      },
      {
        id: 'SKIP_RENT',
        label: 'Pretend you\'re not home',
        outcomeText: 'You hide and don\'t answer. This is going to come back to bite you.',
        statChanges: { stability: -3, money: 50 },
      },
    ],
  },
  {
    id: 'EV_PROMOTER_OFFER',
    triggerConditions: {
      minFans: 500,
      minHype: 20,
    },
    weight: 3,
    requiredAction: 'PLAY_LOCAL_GIG',
    textIntro: 'A local promoter approaches you after a show. "I can get you better gigs, bigger crowds. For a cut, of course."',
    choices: [
      {
        id: 'TAKE_THE_DEAL',
        label: 'Take the deal',
        outcomeText: 'You shake hands. Time to see if this promoter can deliver.',
        statChanges: { industryGoodwill: 5, money: -50 },
      },
      {
        id: 'NEGOTIATE',
        label: 'Negotiate harder',
        outcomeText: 'You push back on the terms. The promoter respects the hustle and offers better conditions.',
        statChanges: { industryGoodwill: 3, cred: 2 },
      },
      {
        id: 'DECLINE',
        label: 'Turn them down',
        outcomeText: 'You\'re not ready to give up control. The promoter shrugs and moves on.',
        statChanges: { cred: 1, industryGoodwill: -2 },
      },
    ],
  },
  {
    id: 'EV_FAN_DONATION',
    triggerConditions: {
      minFans: 200,
    },
    weight: 2,
    requiredAction: 'PLAY_LOCAL_GIG',
    textIntro: 'A superfan approaches you after the show. "I believe in what you\'re doing. Here, take this." They hand you some cash.',
    choices: [
      {
        id: 'ACCEPT_GRACIOUSLY',
        label: 'Accept with thanks',
        outcomeText: 'You pocket the cash and thank them sincerely. Every bit helps.',
        statChanges: { money: 75, stability: 2 },
      },
      {
        id: 'DECLINE_POLITELY',
        label: 'Decline politely',
        outcomeText: 'You push the money back. "Keep it. Just keep coming to shows." They look moved.',
        statChanges: { cred: 3, fans: 10 },
      },
    ],
  },
];

// =============================================================================
// Health & Addiction Events
// =============================================================================

const healthEvents: GameEvent[] = [
  {
    id: 'EV_HANGOVER_FROM_HELL',
    triggerConditions: {
      minAddiction: 20,
    },
    weight: 3,
    requiredAction: 'PARTY',
    textIntro: 'You wake up feeling like death. Your head is pounding and you can\'t remember half of last night.',
    choices: [
      {
        id: 'PUSH_THROUGH',
        label: 'Push through it',
        outcomeText: 'You drag yourself through the day. It\'s brutal, but you manage.',
        statChanges: { health: -3, burnout: 3 },
      },
      {
        id: 'HAIR_OF_THE_DOG',
        label: 'Hair of the dog',
        outcomeText: 'A drink takes the edge off. You know this isn\'t sustainable, but it works for now.',
        statChanges: { health: -1, addiction: 3, stability: -2 },
      },
      {
        id: 'CALL_IN_SICK',
        label: 'Write off the day',
        outcomeText: 'You spend the day in bed recovering. Tomorrow will be better.',
        statChanges: { health: 2, hype: -2 },
      },
    ],
  },
  {
    id: 'EV_DEALER_APPEARS',
    triggerConditions: {
      minAddiction: 30,
    },
    weight: 2,
    textIntro: 'Someone you\'ve seen around offers you something stronger. "First one\'s free. You look like you could use it."',
    choices: [
      {
        id: 'ACCEPT',
        label: 'Take them up on it',
        outcomeText: 'You accept. The high is incredible. You try not to think about where this leads.',
        statChanges: { addiction: 8, stability: -5, health: -3 },
      },
      {
        id: 'DECLINE',
        label: 'Walk away',
        outcomeText: 'You shake your head and walk away. Part of you wonders what you\'re missing.',
        statChanges: { stability: 2, cred: 1 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'EV_MINOR_INJURY',
    triggerConditions: {},
    weight: 2,
    requiredAction: 'PLAY_LOCAL_GIG',
    textIntro: 'You twist your ankle jumping off the stage. The adrenaline masked it, but now it\'s swelling up.',
    choices: [
      {
        id: 'SEE_DOCTOR',
        label: 'Get it checked out ($100)',
        outcomeText: 'The doctor says it\'s a sprain. Rest and ice. The bill stings.',
        statChanges: { money: -100, health: 5 },
      },
      {
        id: 'WALK_IT_OFF',
        label: 'Walk it off',
        outcomeText: 'You ice it yourself and hope for the best. Rock stars don\'t go to doctors.',
        statChanges: { health: -2, cred: 1 },
      },
    ],
  },
  {
    id: 'EV_BURNOUT_WARNING',
    triggerConditions: {
      minBurnout: 60,
    },
    weight: 4,
    textIntro: 'You\'re exhausted. The thought of picking up a guitar makes you want to crawl back into bed.',
    choices: [
      {
        id: 'TAKE_A_BREAK',
        label: 'Take some time off',
        outcomeText: 'You cancel some plans and rest. It feels like defeat, but your body needed this.',
        statChanges: { burnout: -10, hype: -5, stability: 5 },
      },
      {
        id: 'PUSH_HARDER',
        label: 'Push through',
        outcomeText: 'You force yourself to keep going. The show must go on, right?',
        statChanges: { burnout: 5, health: -5, stability: -5 },
      },
      {
        id: 'PARTY_AWAY_PROBLEMS',
        label: 'Party to forget about it',
        outcomeText: 'You drown your exhaustion in a wild night out. Tomorrow\'s problem for tomorrow.',
        statChanges: { addiction: 4, burnout: -3, health: -3, stability: -3 },
      },
    ],
  },
];

// =============================================================================
// Gig & Performance Events
// =============================================================================

const gigEvents: GameEvent[] = [
  {
    id: 'EV_HECKLER',
    triggerConditions: {},
    weight: 3,
    requiredAction: 'PLAY_LOCAL_GIG',
    textIntro: 'Some drunk in the front row won\'t shut up. They\'re killing your vibe and the crowd\'s getting distracted.',
    choices: [
      {
        id: 'ROAST_THEM',
        label: 'Roast them from stage',
        outcomeText: 'You turn your wit on the heckler. The crowd roars with laughter. The drunk slinks away.',
        statChanges: { hype: 3, cred: 2, image: 2 },
      },
      {
        id: 'IGNORE_THEM',
        label: 'Ignore and play harder',
        outcomeText: 'You crank up the volume and drown them out. Pure rock and roll.',
        statChanges: { skill: 1 },
      },
      {
        id: 'CONFRONT_THEM',
        label: 'Jump into the crowd',
        outcomeText: 'You get in their face. Security steps in before it escalates. The crowd loved the drama.',
        statChanges: { image: 5, hype: 5, stability: -3, health: -2 },
      },
    ],
  },
  {
    id: 'EV_SOUND_ISSUES',
    triggerConditions: {},
    weight: 3,
    requiredAction: 'PLAY_LOCAL_GIG',
    textIntro: 'Halfway through the set, your guitar cuts out. Dead silence. The crowd waits.',
    choices: [
      {
        id: 'GO_ACOUSTIC',
        label: 'Go acoustic',
        outcomeText: 'You grab an acoustic guitar and play unplugged. The intimate moment wins over the crowd.',
        statChanges: { cred: 5, skill: 1, fans: 5 },
      },
      {
        id: 'STALL_AND_FIX',
        label: 'Stall while tech fixes it',
        outcomeText: 'You tell stories and joke with the crowd while the issue gets sorted. Crisis averted.',
        statChanges: { image: 2 },
      },
      {
        id: 'END_SET_EARLY',
        label: 'End the set early',
        outcomeText: 'You apologize and cut the show short. The crowd\'s disappointed.',
        statChanges: { hype: -5, cred: -3 },
      },
    ],
  },
  {
    id: 'EV_SCOUT_IN_CROWD',
    triggerConditions: {
      minFans: 1000,
      minHype: 30,
    },
    weight: 2,
    requiredAction: 'PLAY_LOCAL_GIG',
    textIntro: 'After the show, someone in a sharp suit approaches. "I\'m with a label. We should talk."',
    choices: [
      {
        id: 'PLAY_IT_COOL',
        label: 'Play it cool',
        outcomeText: 'You act like this happens all the time. They seem impressed by your confidence.',
        statChanges: { industryGoodwill: 5, image: 2 },
      },
      {
        id: 'SHOW_ENTHUSIASM',
        label: 'Show genuine excitement',
        outcomeText: 'You can\'t hide your excitement. They appreciate the authenticity.',
        statChanges: { industryGoodwill: 4, cred: 1, stability: 3 },
      },
      {
        id: 'BE_SUSPICIOUS',
        label: 'Be wary',
        outcomeText: 'You\'ve heard about industry sharks. You tell them to put it in writing.',
        statChanges: { industryGoodwill: 1, cred: 3 },
      },
    ],
    oneTime: true,
  },
];

// =============================================================================
// Scene & Social Events
// =============================================================================

const sceneEvents: GameEvent[] = [
  {
    id: 'EV_RIVAL_BAND',
    triggerConditions: {
      minFans: 300,
    },
    weight: 2,
    textIntro: 'Another local band is talking smack about you online. Calling you sellouts and posers.',
    choices: [
      {
        id: 'FIRE_BACK',
        label: 'Fire back publicly',
        outcomeText: 'You clap back hard. The beef becomes local scene drama. Fans are picking sides.',
        statChanges: { hype: 8, cred: -3, fans: 20 },
      },
      {
        id: 'TAKE_HIGH_ROAD',
        label: 'Take the high road',
        outcomeText: 'You don\'t respond. People respect that you\'re above petty drama.',
        statChanges: { cred: 3, stability: 2 },
      },
      {
        id: 'CHALLENGE_TO_BATTLE',
        label: 'Challenge them to a battle of the bands',
        outcomeText: 'You challenge them to prove it on stage. The local scene is buzzing.',
        statChanges: { hype: 10, image: 3 },
      },
    ],
  },
  {
    id: 'EV_INTERVIEW_REQUEST',
    triggerConditions: {
      minFans: 500,
    },
    weight: 2,
    textIntro: 'A local zine wants to interview you. It\'s not Rolling Stone, but it\'s something.',
    choices: [
      {
        id: 'DO_INTERVIEW',
        label: 'Do the interview',
        outcomeText: 'You give them good quotes. The piece comes out well, and people are reading it.',
        statChanges: { hype: 5, fans: 15, cred: 2 },
      },
      {
        id: 'DEMAND_COVER',
        label: 'Only if you get the cover',
        outcomeText: 'They laugh. "Maybe when you\'re bigger." You blew that opportunity.',
        statChanges: { industryGoodwill: -3 },
      },
    ],
  },
  {
    id: 'EV_GROUPIE_DRAMA',
    triggerConditions: {
      minFans: 200,
      minImage: 30,
    },
    weight: 2,
    requiredAction: 'PLAY_LOCAL_GIG',
    textIntro: 'A persistent fan won\'t leave you alone after the show. They\'re attractive, but something feels off.',
    choices: [
      {
        id: 'POLITELY_DECLINE',
        label: 'Politely extract yourself',
        outcomeText: 'You make excuses and slip away. Better safe than sorry.',
        statChanges: { stability: 1 },
      },
      {
        id: 'GO_WITH_IT',
        label: 'See where it goes',
        outcomeText: 'You decide to live dangerously. What could go wrong?',
        statChanges: { image: 2, stability: -3 },
      },
      {
        id: 'INTRODUCE_TO_BANDMATE',
        label: 'Introduce them to your drummer',
        outcomeText: 'You pawn them off on your bandmate. Problem solved... for you anyway.',
        statChanges: { stability: 1 },
        bandmateChanges: { loyalty: -2 },
      },
    ],
  },
];

// =============================================================================
// All Events Combined
// =============================================================================

export const ALL_EVENTS: GameEvent[] = [
  ...bandConflictEvents,
  ...moneyEvents,
  ...healthEvents,
  ...gigEvents,
  ...sceneEvents,
  ...labelEvents,
  ...bandEvents,
  ...streamingEvents,
  ...genreEvents,
  ...ALL_ARC_EVENTS,
  ...ALL_ADDITIONAL_EVENTS,
];

// Export categories for filtering if needed
export const EVENT_CATEGORIES = {
  bandConflict: bandConflictEvents,
  money: moneyEvents,
  health: healthEvents,
  gig: gigEvents,
  scene: sceneEvents,
  label: labelEvents,
  band: bandEvents,
  streaming: streamingEvents,
};
