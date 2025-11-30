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

  // ===== Sign the deal follow-ups =====

  // Sign with indie label
  {
    id: 'EV_SIGN_INDIE_DEAL',
    triggerConditions: {
      hasLabelDeal: false,
      hasFlag: 'indieLabelInterested',
    },
    weight: 3,
    textIntro: 'The indie label sends over a contract. Simple terms: £2,000 advance, 50/50 split on profits, they handle distribution.',
    choices: [
      {
        id: 'SIGN_INDIE',
        label: 'Sign the deal',
        outcomeText: 'You sign on the dotted line. It\'s not life-changing money, but you\'ve got a real label behind you now.',
        statChanges: { money: 2000, industryGoodwill: 5, stability: 5 },
        flagsSet: ['hasLabelDeal', 'indieDeal'],
        flagsClear: ['indieLabelInterested'],
      },
      {
        id: 'NEGOTIATE_INDIE',
        label: 'Try to negotiate',
        outcomeText: 'You push for better terms. They come back with 60/40 in your favour but drop the advance to £1,500.',
        statChanges: { money: 1500, industryGoodwill: 3, cred: 2 },
        flagsSet: ['hasLabelDeal', 'indieDeal'],
        flagsClear: ['indieLabelInterested'],
      },
      {
        id: 'WALK_AWAY_INDIE',
        label: 'Walk away',
        outcomeText: 'You\'re not ready to give up control. They\'re disappointed but understand.',
        statChanges: { cred: 3 },
        flagsClear: ['indieLabelInterested'],
      },
    ],
    oneTime: true,
  },

  // Sign with mid-tier label
  {
    id: 'EV_SIGN_MID_DEAL',
    triggerConditions: {
      hasLabelDeal: false,
      hasFlag: 'midLabelInterested',
    },
    weight: 3,
    textIntro: 'The mid-size label sends a formal offer: £15,000 advance, 2-album deal, tour support, but they want 360 rights.',
    choices: [
      {
        id: 'SIGN_MID',
        label: 'Sign the deal',
        outcomeText: 'You sign. The advance hits your account. You\'re playing in a bigger league now.',
        statChanges: { money: 15000, industryGoodwill: 8, hype: 5 },
        flagsSet: ['hasLabelDeal', 'midTierDeal'],
        flagsClear: ['midLabelInterested'],
      },
      {
        id: 'NEGOTIATE_MID',
        label: 'Negotiate the 360 clause',
        outcomeText: 'Your lawyer fights the merch and touring cuts. They agree to label-only rights, but drop the advance to £10,000.',
        statChanges: { money: 10000, industryGoodwill: 5, cred: 3 },
        flagsSet: ['hasLabelDeal', 'midTierDeal'],
        flagsClear: ['midLabelInterested'],
      },
      {
        id: 'WALK_AWAY_MID',
        label: 'Pass on it',
        outcomeText: 'Something feels off. You trust your gut and walk away.',
        statChanges: { cred: 2 },
        flagsClear: ['midLabelInterested'],
      },
    ],
    oneTime: true,
  },

  // Sign with major label
  {
    id: 'EV_SIGN_MAJOR_DEAL',
    triggerConditions: {
      hasLabelDeal: false,
      hasFlag: 'majorLabelInterested',
    },
    weight: 3,
    textIntro: 'The major label offer arrives: £100,000 advance, 3-album deal, full marketing support. But the recoupment terms are brutal.',
    choices: [
      {
        id: 'SIGN_MAJOR',
        label: 'Sign with the major',
        outcomeText: 'You sign your life away. The money\'s real, the support\'s real, but so is the debt.',
        statChanges: { money: 100000, industryGoodwill: 15, hype: 15, cred: -5 },
        flagsSet: ['hasLabelDeal', 'majorDeal'],
        flagsClear: ['majorLabelInterested'],
      },
      {
        id: 'NEGOTIATE_MAJOR',
        label: 'Hire a top lawyer',
        outcomeText: 'You spend £5,000 on a music industry lawyer. They get you key-man clauses and better royalty rates.',
        statChanges: { money: 95000, industryGoodwill: 10, hype: 10, cred: 3 },
        flagsSet: ['hasLabelDeal', 'majorDeal'],
        flagsClear: ['majorLabelInterested'],
      },
      {
        id: 'WALK_MAJOR',
        label: 'Stay independent',
        outcomeText: 'You turn down a major label deal. Some call you crazy. Others call you a legend.',
        statChanges: { cred: 15, industryGoodwill: -10 },
        flagsClear: ['majorLabelInterested'],
      },
    ],
    oneTime: true,
  },

  // ===== More label relationship events =====

  // Label wants image change
  {
    id: 'EV_LABEL_IMAGE_CHANGE',
    triggerConditions: {
      hasLabelDeal: true,
      minWeek: 10,
    },
    weight: 2,
    textIntro: 'The label\'s marketing team wants to "refine your image." They\'re talking stylists, photographers, a whole rebrand.',
    choices: [
      {
        id: 'ACCEPT_REBRAND',
        label: 'Go along with it',
        outcomeText: 'You emerge looking like a proper pop star. Your old fans barely recognize you.',
        statChanges: { image: 15, cred: -8, followers: 100, coreFans: -30 },
      },
      {
        id: 'PARTIAL_REBRAND',
        label: 'Compromise on key points',
        outcomeText: 'You keep the essence but polish the edges. New photos that still feel like you.',
        statChanges: { image: 5, cred: -2, followers: 40 },
      },
      {
        id: 'REFUSE_REBRAND',
        label: 'Refuse completely',
        outcomeText: 'You tell them you are who you are. Things get tense at the label.',
        statChanges: { cred: 5, industryGoodwill: -5 },
      },
    ],
  },

  // Label shelves your album
  {
    id: 'EV_ALBUM_SHELVED',
    triggerConditions: {
      hasLabelDeal: true,
      hasFlag: 'majorDeal',
      maxHype: 25,
    },
    weight: 1,
    textIntro: 'Devastating news: the label is shelving your finished album. "The market isn\'t right." Your work sits in a vault.',
    choices: [
      {
        id: 'ACCEPT_SHELVING',
        label: 'Accept it',
        outcomeText: 'You swallow your pride. Maybe next time. The frustration eats at you.',
        statChanges: { stability: -15, burnout: 10, industryGoodwill: 2 },
      },
      {
        id: 'LEAK_IT',
        label: 'Leak it yourself',
        outcomeText: 'The album appears online "mysteriously." Fans love it. The label is furious.',
        statChanges: { cred: 10, hype: 10, industryGoodwill: -20, fans: 200 },
      },
      {
        id: 'BUY_IT_BACK',
        label: 'Try to buy back the masters',
        outcomeText: 'They want £50,000. It\'s extortion, but it\'s your music.',
        statChanges: { money: -50000, cred: 5 },
      },
    ],
    oneTime: true,
  },

  // Label celebrates success
  {
    id: 'EV_LABEL_SUCCESS',
    triggerConditions: {
      hasLabelDeal: true,
      minFans: 15000,
      minHype: 40,
    },
    weight: 2,
    textIntro: 'The label throws a party in your honour. "You\'re our priority act now." Champagne flows.',
    choices: [
      {
        id: 'ENJOY_PARTY',
        label: 'Enjoy the attention',
        outcomeText: 'You soak it up. Photos with execs, promises of bigger budgets. This is what you dreamed of.',
        statChanges: { addiction: 3, industryGoodwill: 5, stability: 5 },
      },
      {
        id: 'STAY_GROUNDED',
        label: 'Stay grounded',
        outcomeText: 'You smile and network but keep your head. Success is fleeting in this industry.',
        statChanges: { cred: 3, stability: 5, industryGoodwill: 3 },
      },
      {
        id: 'PUSH_FOR_MORE',
        label: 'Use the leverage',
        outcomeText: 'You corner an exec about renegotiating. They\'re impressed by your business sense.',
        statChanges: { money: 5000, industryGoodwill: 2 },
      },
    ],
  },

  // A&R person leaves
  {
    id: 'EV_AR_LEAVES',
    triggerConditions: {
      hasLabelDeal: true,
    },
    weight: 1,
    textIntro: 'Your A&R - the one who signed you, who believed in you - is leaving the label. You\'re losing your champion.',
    choices: [
      {
        id: 'KEEP_IN_TOUCH',
        label: 'Stay in touch with them',
        outcomeText: 'You exchange numbers. Industry relationships matter. They might sign you again someday.',
        statChanges: { industryGoodwill: 3 },
      },
      {
        id: 'SCHMOOZE_NEW',
        label: 'Schmooze the replacement',
        outcomeText: 'You take the new A&R out for drinks. Gotta start building that relationship from scratch.',
        statChanges: { money: -50, industryGoodwill: 2, stability: -2 },
      },
      {
        id: 'WORRY_ABOUT_FUTURE',
        label: 'Worry about your position',
        outcomeText: 'Without your champion, you\'re vulnerable. The new regime might not share their vision.',
        statChanges: { stability: -8, burnout: 3 },
      },
    ],
    oneTime: true,
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
