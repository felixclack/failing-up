/**
 * Label deal and industry events
 */

import { GameEvent } from '@/engine/types';

export const labelEvents: GameEvent[] = [
  // Indie label interest
  {
    id: 'EV_INDIE_LABEL_INTEREST',
    triggerConditions: {
      minFans: 500,
      minIndustryGoodwill: 10,
      hasLabelDeal: false,
    },
    weight: 2,
    textIntro: 'A small indie label reaches out. "We love what you\'re doing. Let\'s talk about putting out a record together."',
    choices: [
      {
        id: 'HEAR_THEM_OUT',
        label: 'Hear them out',
        outcomeText: 'You meet for coffee. They seem genuine - more about the music than the money. They offer modest terms but promise creative freedom.',
        statChanges: { industryGoodwill: 3 },
        flagsSet: ['indieLabelInterested'],
      },
      {
        id: 'PLAY_HARD_TO_GET',
        label: 'Play hard to get',
        outcomeText: 'You tell them you\'re weighing your options. They respect it but seem a little put off.',
        statChanges: { industryGoodwill: -1, cred: 2 },
      },
      {
        id: 'NOT_INTERESTED',
        label: 'Not interested in labels',
        outcomeText: 'You politely decline. DIY or die, right?',
        statChanges: { cred: 3, industryGoodwill: -3 },
      },
    ],
    oneTime: true,
  },

  // Mid-tier label interest
  {
    id: 'EV_MID_LABEL_INTEREST',
    triggerConditions: {
      minFans: 5000,
      minIndustryGoodwill: 30,
      hasLabelDeal: false,
    },
    weight: 2,
    textIntro: 'A mid-size label wants to meet. Their roster includes some bands you respect. This could be a real opportunity.',
    choices: [
      {
        id: 'TAKE_MEETING',
        label: 'Take the meeting',
        outcomeText: 'The meeting goes well. They talk numbers - real money, real distribution. But they also talk about "marketability."',
        statChanges: { industryGoodwill: 5 },
        flagsSet: ['midLabelInterested'],
      },
      {
        id: 'BRING_LAWYER',
        label: 'Bring a lawyer',
        outcomeText: 'Smart move. The lawyer catches some sketchy clauses. They revise the offer - less money, better terms.',
        statChanges: { money: -200, industryGoodwill: 2 },
        flagsSet: ['midLabelInterested'],
      },
      {
        id: 'DECLINE_POLITELY',
        label: 'Decline for now',
        outcomeText: 'You\'re not ready for this level yet. They say the door\'s always open.',
        statChanges: { cred: 2 },
      },
    ],
    oneTime: true,
  },

  // Major label interest
  {
    id: 'EV_MAJOR_LABEL_INTEREST',
    triggerConditions: {
      minFans: 25000,
      minIndustryGoodwill: 50,
      hasLabelDeal: false,
    },
    weight: 1,
    textIntro: 'A major label executive shows up backstage. "We\'ve been watching you. The company thinks you could be huge."',
    choices: [
      {
        id: 'PLAY_IT_COOL',
        label: 'Play it cool',
        outcomeText: 'You act like this happens every day. They like your confidence. A formal offer is coming.',
        statChanges: { industryGoodwill: 8, image: 5 },
        flagsSet: ['majorLabelInterested'],
      },
      {
        id: 'ASK_TOUGH_QUESTIONS',
        label: 'Ask the tough questions',
        outcomeText: 'You ask about creative control, recoupment, tour support. They appreciate that you know the game.',
        statChanges: { industryGoodwill: 5, cred: 3 },
        flagsSet: ['majorLabelInterested'],
      },
      {
        id: 'TELL_THEM_OFF',
        label: 'Tell them to get lost',
        outcomeText: 'You launch into a rant about corporate rock. They leave. Your fans love it. The industry... less so.',
        statChanges: { cred: 10, industryGoodwill: -15, hype: 5 },
      },
    ],
    oneTime: true,
  },

  // Already signed - label pressure
  {
    id: 'EV_LABEL_PRESSURE_SINGLE',
    triggerConditions: {
      hasLabelDeal: true,
      minBurnout: 30,
    },
    weight: 3,
    textIntro: 'The label calls. "We need a single. Something radio-friendly. The album\'s not testing well with focus groups."',
    choices: [
      {
        id: 'WRITE_COMMERCIAL',
        label: 'Give them what they want',
        outcomeText: 'You write something catchy and accessible. It feels hollow, but the label\'s happy.',
        statChanges: { cred: -5, industryGoodwill: 5, stability: -3 },
      },
      {
        id: 'PUSH_BACK',
        label: 'Push back',
        outcomeText: 'You argue for artistic integrity. Things get tense, but they back down... for now.',
        statChanges: { cred: 3, industryGoodwill: -5, stability: -2 },
      },
      {
        id: 'COMPROMISE',
        label: 'Find a middle ground',
        outcomeText: 'You rework an existing song to be more accessible without selling out completely.',
        statChanges: { cred: -2, industryGoodwill: 2 },
      },
    ],
  },

  // Label threatens to drop
  {
    id: 'EV_LABEL_DROP_THREAT',
    triggerConditions: {
      hasLabelDeal: true,
      maxHype: 20,
      maxFans: 10000,
    },
    weight: 2,
    textIntro: 'The label exec sounds cold on the phone. "Sales are disappointing. We\'re reconsidering our investment."',
    choices: [
      {
        id: 'BEG',
        label: 'Promise to do better',
        outcomeText: 'You plead your case. They give you one more shot - but the pressure is on.',
        statChanges: { stability: -10, burnout: 5 },
      },
      {
        id: 'CALL_BLUFF',
        label: 'Call their bluff',
        outcomeText: 'You remind them of your contract. They can\'t drop you without paying out. Tension rises.',
        statChanges: { cred: 3, industryGoodwill: -8 },
      },
      {
        id: 'ASK_FOR_RELEASE',
        label: 'Ask for a release',
        outcomeText: 'Maybe it\'s time to move on. They agree to let you go. You\'re free, but back to square one.',
        statChanges: { stability: 5 },
        flagsClear: ['hasLabelDeal'],
      },
    ],
  },

  // Recoupment milestone
  {
    id: 'EV_RECOUPED',
    triggerConditions: {
      hasLabelDeal: true,
      minFans: 20000,
    },
    weight: 1,
    textIntro: 'The quarterly statement arrives. You read it twice to make sure. You\'ve recouped. Real royalty checks are coming.',
    choices: [
      {
        id: 'CELEBRATE',
        label: 'Celebrate',
        outcomeText: 'You throw a party. You made it - you\'re actually making money from your music.',
        statChanges: { stability: 10, addiction: 3, money: 500 },
      },
      {
        id: 'STAY_HUMBLE',
        label: 'Stay humble',
        outcomeText: 'You don\'t let it go to your head. There\'s still work to do.',
        statChanges: { stability: 5, cred: 2, money: 500 },
      },
    ],
    oneTime: true,
  },
];
