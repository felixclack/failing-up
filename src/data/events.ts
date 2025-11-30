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
import { ALL_RIVALRY_EVENTS } from './rivalryEvents';

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
    // Gigs now automatic - requiredAction removed
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
    // Gigs now automatic - requiredAction removed
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
    // Gigs now automatic - requiredAction removed
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
    triggerConditions: { hadGigThisWeek: true },
    weight: 3,
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
    triggerConditions: { hadGigThisWeek: true },
    weight: 3,
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
      hadGigThisWeek: true,
    },
    weight: 2,
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
  {
    id: 'EV_ENCORE_DEMAND',
    triggerConditions: { hadGigThisWeek: true, minHype: 25 },
    weight: 3,
    textIntro: 'The crowd won\'t stop chanting. They\'re stamping their feet, demanding more. You\'ve already played your whole set.',
    choices: [
      {
        id: 'PLAY_COVER',
        label: 'Play a classic cover',
        outcomeText: 'You launch into a crowd-pleasing cover. Everyone sings along. Perfect ending.',
        statChanges: { hype: 5, fans: 10, image: 2 },
      },
      {
        id: 'REPEAT_BEST',
        label: 'Repeat your best song',
        outcomeText: 'You play your biggest tune again. The crowd goes mental. No one minds hearing it twice.',
        statChanges: { hype: 3, fans: 5 },
      },
      {
        id: 'LEAVE_WANTING',
        label: 'Leave them wanting more',
        outcomeText: 'You wave and exit. The mystique builds. Sometimes less is more.',
        statChanges: { cred: 3, image: 3 },
      },
    ],
  },
  {
    id: 'EV_EQUIPMENT_THEFT',
    triggerConditions: { hadGigThisWeek: true },
    weight: 1,
    textIntro: 'After the gig, you discover someone\'s nicked your pedal board from backstage. Hundreds of pounds of gear, gone.',
    choices: [
      {
        id: 'BLAME_VENUE',
        label: 'Confront the venue',
        outcomeText: 'You kick off at the promoter. They\'re apologetic but claim no responsibility. You burn a bridge.',
        statChanges: { money: 150, industryGoodwill: -5, stability: -3 },
      },
      {
        id: 'SOCIAL_APPEAL',
        label: 'Appeal on social media',
        outcomeText: 'You post about the theft. Fans share it everywhere. A week later, someone spots your gear at a pawn shop.',
        statChanges: { followers: 50, hype: 2 },
      },
      {
        id: 'WRITE_IT_OFF',
        label: 'Accept the loss',
        outcomeText: 'It stings, but you move on. You\'ll replace it when you can afford to.',
        statChanges: { money: -200, stability: -2 },
      },
    ],
  },
  {
    id: 'EV_BACKSTAGE_DRAMA',
    triggerConditions: { hadGigThisWeek: true, minBandmates: 1 },
    weight: 2,
    textIntro: 'Backstage after the show, tensions boil over. Your bandmate is furious about being too low in the mix.',
    choices: [
      {
        id: 'APOLOGISE',
        label: 'Apologise and promise better',
        outcomeText: 'You smooth things over. They calm down, but there\'s still an edge.',
        statChanges: { stability: 2 },
        bandmateChanges: { loyalty: 3 },
      },
      {
        id: 'STAND_GROUND',
        label: 'Tell them to deal with it',
        outcomeText: 'You\'re the frontperson. You make the calls. They sulk but drop it.',
        statChanges: { cred: 2 },
        bandmateChanges: { loyalty: -5 },
      },
      {
        id: 'TURN_IT_AROUND',
        label: 'Blame the sound engineer',
        outcomeText: 'You deflect to the venue\'s dodgy mixing desk. United against a common enemy.',
        statChanges: { industryGoodwill: -2 },
        bandmateChanges: { loyalty: 2 },
      },
    ],
  },
  {
    id: 'EV_FANS_BACKSTAGE',
    triggerConditions: { hadGigThisWeek: true, minFans: 500 },
    weight: 2,
    textIntro: 'A group of fans have blagged their way backstage. They\'re starstruck and want photos, autographs, your time.',
    choices: [
      {
        id: 'GIVE_TIME',
        label: 'Spend time with them',
        outcomeText: 'You chat, take photos, sign stuff. They\'ll remember this forever. So will you.',
        statChanges: { coreFans: 20, image: 3, health: -2 },
      },
      {
        id: 'QUICK_HELLO',
        label: 'Quick hello and done',
        outcomeText: 'You\'re friendly but brief. They get their photo. Everyone\'s happy enough.',
        statChanges: { fans: 5, image: 1 },
      },
      {
        id: 'SEND_AWAY',
        label: 'Have security move them on',
        outcomeText: 'You need your space. They look gutted as they\'re escorted out.',
        statChanges: { cred: 2, image: -3, stability: 2 },
      },
    ],
  },
  {
    id: 'EV_VENUE_WANTS_MORE',
    triggerConditions: { hadGigThisWeek: true, minHype: 20 },
    weight: 2,
    textIntro: 'The venue promoter catches you after the show. "That was brilliant. Want a residency? Same night, every month."',
    choices: [
      {
        id: 'ACCEPT_RESIDENCY',
        label: 'Accept the residency',
        outcomeText: 'Guaranteed gigs and a growing local following. Smart move.',
        statChanges: { industryGoodwill: 5, stability: 5, coreFans: 15 },
        flagsSet: ['hasResidency'],
      },
      {
        id: 'NEGOTIATE_BETTER',
        label: 'Ask for better terms',
        outcomeText: 'You push for more money per show. They agree - you\'ve got leverage now.',
        statChanges: { industryGoodwill: 2, money: 100 },
      },
      {
        id: 'STAY_FREE',
        label: 'Keep your options open',
        outcomeText: 'You don\'t want to be tied down. The promoter understands, but looks disappointed.',
        statChanges: { cred: 2, industryGoodwill: -1 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'EV_FIGHT_BREAKS_OUT',
    triggerConditions: { hadGigThisWeek: true },
    weight: 1,
    textIntro: 'Mid-set, a fight erupts in the crowd. Fists flying, drinks everywhere. The bouncers are wading in.',
    choices: [
      {
        id: 'STOP_PLAYING',
        label: 'Stop and call it out',
        outcomeText: 'You halt the music and tell them to pack it in. The fighters look embarrassed. Order restored.',
        statChanges: { cred: 3, image: 2 },
      },
      {
        id: 'PLAY_LOUDER',
        label: 'Crank it up and play through',
        outcomeText: 'The show must go on. You blast through the chaos. Most of the crowd stays focused on you.',
        statChanges: { hype: 3, skill: 1 },
      },
      {
        id: 'DIVE_IN',
        label: 'Jump in and break it up',
        outcomeText: 'You leap off stage into the melee. Somehow you don\'t get punched. Legendary move.',
        statChanges: { image: 8, hype: 5, health: -5, cred: 5 },
      },
    ],
  },
  {
    id: 'EV_PROMOTER_STIFFS',
    triggerConditions: { hadGigThisWeek: true },
    weight: 2,
    textIntro: 'The promoter\'s doing a runner. They\'re claiming the door take was less than expected and they can\'t pay what they promised.',
    choices: [
      {
        id: 'THREATEN',
        label: 'Get in their face',
        outcomeText: 'You make it clear this isn\'t acceptable. They nervously hand over most of what\'s owed.',
        statChanges: { money: 80, industryGoodwill: -3, image: 2 },
      },
      {
        id: 'NEGOTIATE',
        label: 'Negotiate calmly',
        outcomeText: 'You work out a compromise. Half now, half next time. Better than nothing.',
        statChanges: { money: 40, industryGoodwill: 1 },
      },
      {
        id: 'WALK_AWAY',
        label: 'Walk away and blacklist them',
        outcomeText: 'You tell every band you know to avoid this venue. Word spreads fast.',
        statChanges: { cred: 3, industryGoodwill: 2 },
      },
    ],
  },
  {
    id: 'EV_PHOTOGRAPHER_OFFER',
    triggerConditions: { hadGigThisWeek: true, minFans: 200 },
    weight: 2,
    textIntro: 'A photographer approaches after the show. "Got some great shots tonight. Want to buy the set for your socials?"',
    choices: [
      {
        id: 'BUY_PHOTOS',
        label: 'Buy the photo set (£50)',
        outcomeText: 'Professional photos of you looking like actual rock stars. Worth every penny.',
        statChanges: { money: -50, image: 5, followers: 30 },
      },
      {
        id: 'NEGOTIATE_CREDIT',
        label: 'Offer exposure instead',
        outcomeText: 'They roll their eyes but agree to a few shots for credit. Photographers hate this.',
        statChanges: { image: 2, followers: 10 },
      },
      {
        id: 'DECLINE_POLITELY',
        label: 'Pass on it',
        outcomeText: 'You\'re skint. Phone photos will have to do.',
        statChanges: {},
      },
    ],
  },
];

// =============================================================================
// Tour Events
// =============================================================================

const tourEvents: GameEvent[] = [
  {
    id: 'EV_VAN_BREAKDOWN',
    triggerConditions: { onTour: true },
    weight: 3,
    textIntro: 'The van\'s made a horrible noise and died on the hard shoulder of the M1. You\'ve got a gig in four hours.',
    choices: [
      {
        id: 'CALL_RECOVERY',
        label: 'Call breakdown recovery',
        outcomeText: 'Three hours and £200 later, you\'re back on the road. You make the gig with minutes to spare.',
        statChanges: { money: -200, stability: -3, health: -2 },
      },
      {
        id: 'HITCHHIKE',
        label: 'Thumb a lift with the gear',
        outcomeText: 'A lorry driver takes pity on you. You arrive smelling of diesel but the show goes on.',
        statChanges: { cred: 3, image: -2, health: -3 },
      },
      {
        id: 'CANCEL_GIG',
        label: 'Cancel the gig',
        outcomeText: 'You can\'t make it. The promoter is furious. Word spreads that you\'re unreliable.',
        statChanges: { industryGoodwill: -8, hype: -5, stability: -5 },
      },
    ],
  },
  {
    id: 'EV_GREEN_ROOM_DRAMA',
    triggerConditions: { onTour: true, minBandmates: 1 },
    weight: 2,
    textIntro: 'The green room is tiny and freezing. Your bandmate is having a proper meltdown about the rider being wrong.',
    choices: [
      {
        id: 'CALM_THEM',
        label: 'Talk them down',
        outcomeText: 'You remind them why you\'re doing this. They take a breath. Crisis averted.',
        statChanges: { stability: 3 },
        bandmateChanges: { loyalty: 5 },
      },
      {
        id: 'JOIN_COMPLAINT',
        label: 'Join in complaining',
        outcomeText: 'You\'re both right - this is rubbish. You bond over shared misery.',
        statChanges: { industryGoodwill: -2 },
        bandmateChanges: { loyalty: 3 },
      },
      {
        id: 'TELL_OFF',
        label: 'Tell them to grow up',
        outcomeText: 'You\'re all tired. You snap at them. The silence afterwards is deafening.',
        statChanges: { stability: -2 },
        bandmateChanges: { loyalty: -8, reliability: -3 },
      },
    ],
  },
  {
    id: 'EV_TOUR_FATIGUE',
    triggerConditions: { onTour: true, minWeek: 3 },
    weight: 3,
    textIntro: 'Another Travelodge. Another service station meal. You can\'t remember what day it is or which city you\'re in.',
    choices: [
      {
        id: 'PUSH_THROUGH',
        label: 'Push through it',
        outcomeText: 'You dig deep. The tiredness becomes part of the performance. Raw and real.',
        statChanges: { health: -5, burnout: 8, cred: 3, skill: 2 },
      },
      {
        id: 'TAKE_BREAK',
        label: 'Take a proper break day',
        outcomeText: 'You spend a whole day doing nothing. Feels indulgent but necessary.',
        statChanges: { health: 5, burnout: -10, stability: 5 },
      },
      {
        id: 'PARTY_HARDER',
        label: 'Self-medicate through it',
        outcomeText: 'If you can\'t feel rested, at least you can feel something else.',
        statChanges: { health: -3, addiction: 8, burnout: -3, image: 3 },
      },
    ],
  },
  {
    id: 'EV_LOCAL_RADIO',
    triggerConditions: { onTour: true, minFans: 300 },
    weight: 2,
    textIntro: 'A local radio station wants you to come in for a morning show interview before tonight\'s gig.',
    choices: [
      {
        id: 'DO_INTERVIEW',
        label: 'Get up early and do it',
        outcomeText: 'You\'re groggy but charming. The DJ loves you. Listeners are intrigued.',
        statChanges: { health: -2, hype: 5, followers: 40, fans: 25 },
      },
      {
        id: 'PHONE_IN',
        label: 'Ask to do it by phone',
        outcomeText: 'They agree reluctantly. It\'s fine but lacks energy.',
        statChanges: { hype: 2, followers: 15 },
      },
      {
        id: 'SLEEP_IN',
        label: 'Prioritize rest',
        outcomeText: 'You need sleep more than promo. The station is annoyed but you\'ll play better tonight.',
        statChanges: { health: 3, industryGoodwill: -2 },
      },
    ],
  },
  {
    id: 'EV_TOUR_ROMANCE',
    triggerConditions: { onTour: true },
    weight: 1,
    textIntro: 'Someone catches your eye after the show. There\'s definite chemistry. They\'re hinting at coming back to the bus.',
    choices: [
      {
        id: 'INVITE_BACK',
        label: 'See where it goes',
        outcomeText: 'A night to remember. Or not remember, depending on your perspective.',
        statChanges: { stability: -3, health: -2, image: 3, hype: 2 },
      },
      {
        id: 'GET_NUMBER',
        label: 'Get their number for later',
        outcomeText: 'You swap details. Maybe something, maybe nothing. Nice to be wanted though.',
        statChanges: { stability: 2 },
      },
      {
        id: 'FOCUS_ON_MUSIC',
        label: 'Stay focused',
        outcomeText: 'You\'re here to work. You politely decline. Back to the van.',
        statChanges: { cred: 2, skill: 1 },
      },
    ],
  },
  {
    id: 'EV_SUPPORT_DRAMA',
    triggerConditions: { onTour: true },
    weight: 2,
    textIntro: 'The support band are being absolute nightmares. They went over their set time and used your backline without asking.',
    choices: [
      {
        id: 'CONFRONT',
        label: 'Have it out with them',
        outcomeText: 'You set them straight. They apologize, but there\'s tension for the rest of the tour.',
        statChanges: { cred: 3, stability: -2 },
      },
      {
        id: 'LET_SLIDE',
        label: 'Let it slide this time',
        outcomeText: 'You\'re the bigger band, you can be gracious. They know they owe you one.',
        statChanges: { industryGoodwill: 3, stability: 2 },
      },
      {
        id: 'SABOTAGE',
        label: 'Mess with their gear tomorrow',
        outcomeText: 'Petty? Yes. Satisfying? Also yes. They sound awful the next night.',
        statChanges: { cred: -2, image: 2, stability: 3 },
      },
    ],
  },
  {
    id: 'EV_HOMESICK',
    triggerConditions: { onTour: true, minWeek: 4 },
    weight: 2,
    textIntro: 'You miss home. Your own bed. Familiar faces. The tour feels endless.',
    choices: [
      {
        id: 'CALL_HOME',
        label: 'Have a long call with someone',
        outcomeText: 'Hearing a friendly voice helps. You feel reconnected to your real life.',
        statChanges: { stability: 8, burnout: -5 },
      },
      {
        id: 'BURY_IT',
        label: 'Bury the feeling',
        outcomeText: 'This is the life you chose. You focus on the music and push it down.',
        statChanges: { burnout: 5, skill: 2 },
      },
      {
        id: 'WRITE_ABOUT_IT',
        label: 'Write about the feeling',
        outcomeText: 'You channel the loneliness into lyrics. Some of your best work.',
        statChanges: { stability: 3, talent: 2 },
      },
    ],
  },
  {
    id: 'EV_VENUE_UPGRADE',
    triggerConditions: { onTour: true, minHype: 30 },
    weight: 1,
    textIntro: 'The promoter calls - the original venue is sold out. They want to move you to somewhere bigger.',
    choices: [
      {
        id: 'MOVE_UP',
        label: 'Take the bigger venue',
        outcomeText: 'You upgrade to a 500-cap room. The pressure\'s on but the buzz is real.',
        statChanges: { hype: 8, fans: 50, money: 200, stability: -3 },
      },
      {
        id: 'STAY_SMALL',
        label: 'Keep the intimate show',
        outcomeText: 'You stick with the original venue. The packed crowd creates an electric atmosphere.',
        statChanges: { cred: 5, coreFans: 20 },
      },
      {
        id: 'ADD_SECOND_SHOW',
        label: 'Do both - add a matinee',
        outcomeText: 'Two shows in one day. Exhausting but you reach twice the audience.',
        statChanges: { fans: 80, money: 150, health: -5, burnout: 5 },
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
    // Gigs now automatic - requiredAction removed
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
  ...tourEvents,
  ...sceneEvents,
  ...labelEvents,
  ...bandEvents,
  ...streamingEvents,
  ...genreEvents,
  ...ALL_ARC_EVENTS,
  ...ALL_ADDITIONAL_EVENTS,
  ...ALL_RIVALRY_EVENTS,
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
