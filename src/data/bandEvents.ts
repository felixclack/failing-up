/**
 * Bandmate-related events - conflicts, departures, drama
 */

import { GameEvent } from '@/engine/types';

export const bandEvents: GameEvent[] = [
  // Band conflict - creative differences
  {
    id: 'EV_BAND_CREATIVE_CLASH',
    triggerConditions: {
      minBandmates: 2,
    },
    weight: 3,
    requiredAction: 'REHEARSE',
    textIntro: 'The rehearsal devolves into a shouting match. Your guitarist wants to go heavier. Your bassist wants to go poppier. They turn to you to settle it.',
    choices: [
      {
        id: 'SIDE_WITH_GUITARIST',
        label: 'Side with the guitarist',
        outcomeText: 'You back the heavier direction. The bassist storms out but comes back the next day. Things are tense.',
        statChanges: { cred: 2 },
        // Note: In full implementation, this would affect specific bandmate loyalty
      },
      {
        id: 'SIDE_WITH_BASSIST',
        label: 'Side with the bassist',
        outcomeText: 'You go with the more accessible sound. The guitarist sulks but the songs are catchier.',
        statChanges: { cred: -1, hype: 2 },
      },
      {
        id: 'FIND_COMPROMISE',
        label: 'Find a middle ground',
        outcomeText: 'You work out a mix of both styles. It actually sounds pretty unique. Everyone calms down.',
        statChanges: { stability: 2, skill: 1 },
      },
      {
        id: 'ASSERT_DOMINANCE',
        label: 'Remind them who\'s in charge',
        outcomeText: 'You shut down the argument. "My band, my rules." They comply, but you see resentment in their eyes.',
        statChanges: { stability: -3 },
      },
    ],
  },

  // Member threatens to quit
  {
    id: 'EV_MEMBER_ULTIMATUM',
    triggerConditions: {
      minBandmates: 1,
      maxStability: 40,
    },
    weight: 2,
    requiredAction: 'REHEARSE',
    textIntro: 'Your drummer corners you after practice. "I can\'t keep doing this. Either things change around here, or I\'m out."',
    choices: [
      {
        id: 'HEAR_THEM_OUT',
        label: 'Hear them out',
        outcomeText: 'You listen to their concerns. Some are valid. You promise to do better. The tension eases.',
        statChanges: { stability: 5 },
      },
      {
        id: 'CALL_BLUFF',
        label: 'Call their bluff',
        outcomeText: '"Good luck finding another gig." They blink first. But you\'ve made an enemy.',
        statChanges: { stability: -2, cred: 2 },
      },
      {
        id: 'LET_THEM_GO',
        label: 'Let them walk',
        outcomeText: 'Maybe it\'s for the best. They pack up their kit and leave. Now you need a new drummer.',
        statChanges: { stability: -5 },
        flagsSet: ['drummerQuit'],
      },
    ],
  },

  // Member substance issue
  {
    id: 'EV_MEMBER_DRUG_PROBLEM',
    triggerConditions: {
      minBandmates: 1,
      minAddiction: 30,
    },
    weight: 2,
    textIntro: 'Your bassist has been showing up late, missing cues, nodding off. You find a needle in the dressing room.',
    choices: [
      {
        id: 'CONFRONT_THEM',
        label: 'Confront them',
        outcomeText: 'They deny it at first, then break down. They agree to try to clean up. Time will tell.',
        statChanges: { stability: -3 },
      },
      {
        id: 'IGNORE_IT',
        label: 'Ignore it',
        outcomeText: 'Not your problem, right? The shows go on, but the quality slips. Everyone knows something\'s wrong.',
        statChanges: { cred: -3, stability: -2 },
      },
      {
        id: 'FIRE_THEM',
        label: 'Fire them immediately',
        outcomeText: 'You can\'t afford this liability. They\'re out. The band is shaken but relieved.',
        statChanges: { stability: -5, cred: 2 },
        flagsSet: ['firedAddictedMember'],
      },
      {
        id: 'JOIN_THEM',
        label: 'Join the party',
        outcomeText: 'When in Rome... The next few weeks are a blur. Your own habits are getting worse.',
        statChanges: { addiction: 10, stability: -8, cred: -2 },
      },
    ],
  },

  // Band member arrested
  {
    id: 'EV_MEMBER_ARRESTED',
    triggerConditions: {
      minBandmates: 1,
    },
    weight: 1,
    textIntro: 'You get a call at 3 AM. Your guitarist got arrested for possession. They need bail money.',
    choices: [
      {
        id: 'PAY_BAIL',
        label: 'Pay their bail ($500)',
        outcomeText: 'You bail them out. They\'re grateful but shaken. The charges might stick.',
        statChanges: { money: -500, stability: -3 },
      },
      {
        id: 'LET_THEM_SIT',
        label: 'Let them sit overnight',
        outcomeText: 'They can wait until morning. They\'re furious when they get out, but maybe they learned something.',
        statChanges: { stability: -5 },
      },
      {
        id: 'LAWYER_UP',
        label: 'Get them a good lawyer ($1000)',
        outcomeText: 'You pay for real legal help. The charges get reduced. They owe you big time.',
        statChanges: { money: -1000, industryGoodwill: 2 },
      },
    ],
  },

  // Positive: Band chemistry
  {
    id: 'EV_BAND_CHEMISTRY',
    triggerConditions: {
      minBandmates: 2,
      minStability: 50,
    },
    weight: 2,
    requiredAction: 'REHEARSE',
    textIntro: 'Something clicks during rehearsal. Everyone\'s locked in. The sound is tighter than ever.',
    choices: [
      {
        id: 'RIDE_THE_WAVE',
        label: 'Ride the wave',
        outcomeText: 'You jam for hours, writing new material that feels effortless. This is why you do it.',
        statChanges: { skill: 3, stability: 3 },
      },
      {
        id: 'RECORD_IT',
        label: 'Quick, record it!',
        outcomeText: 'You capture the magic on tape. Could be the start of something special.',
        statChanges: { skill: 2 },
        flagsSet: ['recordedGreatSession'],
      },
    ],
  },

  // Poaching attempt
  {
    id: 'EV_MEMBER_POACHED',
    triggerConditions: {
      minBandmates: 1,
      minHype: 40,
    },
    weight: 2,
    textIntro: 'A bigger band approaches your drummer. They want to offer them the gig. Your drummer comes to you, conflicted.',
    choices: [
      {
        id: 'OFFER_MORE',
        label: 'Match their offer',
        outcomeText: 'You promise a bigger cut of merch and more money. They stay, but expectations are higher now.',
        statChanges: { money: -200, stability: 2 },
      },
      {
        id: 'APPEAL_TO_LOYALTY',
        label: 'Appeal to loyalty',
        outcomeText: '"We built this together. You\'d really leave now?" They think about it... and stay.',
        statChanges: { stability: 3 },
      },
      {
        id: 'WISH_THEM_WELL',
        label: 'Let them go',
        outcomeText: 'You can\'t hold someone back from a better opportunity. They leave on good terms.',
        statChanges: { stability: -3, cred: 2 },
        flagsSet: ['drummerPoached'],
      },
    ],
  },

  // Member death (rare, serious)
  {
    id: 'EV_MEMBER_OVERDOSE',
    triggerConditions: {
      minBandmates: 1,
      minAddiction: 60,
    },
    weight: 1,
    textIntro: 'The phone rings. It\'s the hospital. Your bassist didn\'t make it. Overdose. The scene that was so fun just got very real.',
    choices: [
      {
        id: 'CARRY_ON',
        label: 'The show must go on',
        outcomeText: 'You play the next gig in their memory. It\'s the hardest show you\'ve ever done. Some call it brave. Others call it cold.',
        statChanges: { stability: -15, burnout: 10, cred: 5, hype: 5 },
        flagsSet: ['memberDied'],
      },
      {
        id: 'CANCEL_SHOWS',
        label: 'Cancel everything',
        outcomeText: 'You need time to grieve. The industry understands. Mostly.',
        statChanges: { stability: -10, hype: -10, industryGoodwill: 3 },
        flagsSet: ['memberDied'],
      },
      {
        id: 'GET_CLEAN',
        label: 'Use this as a wake-up call',
        outcomeText: 'This could have been you. You flush everything and commit to sobriety.',
        statChanges: { addiction: -20, stability: -10, burnout: -5 },
        flagsSet: ['memberDied', 'gotClean'],
      },
    ],
    oneTime: true,
  },

  // Band breakup threat
  {
    id: 'EV_BREAKUP_TALKS',
    triggerConditions: {
      minBandmates: 2,
      maxStability: 25,
    },
    weight: 2,
    textIntro: 'The band meeting turns ugly. "Maybe we should just call it," someone says. Everyone looks at each other.',
    choices: [
      {
        id: 'FIGHT_FOR_IT',
        label: 'Fight for the band',
        outcomeText: 'You remind everyone why you started. The passion\'s still there, buried under the drama. One more try.',
        statChanges: { stability: 10, burnout: 5 },
      },
      {
        id: 'TAKE_A_BREAK',
        label: 'Suggest a hiatus',
        outcomeText: 'Some space might help. You agree to take a month off. Everyone goes their separate ways for now.',
        statChanges: { stability: 5, hype: -15, burnout: -10 },
        flagsSet: ['onHiatus'],
      },
      {
        id: 'END_IT',
        label: 'It\'s over',
        outcomeText: 'You say the words no one wants to hear. The band is done. You\'re going solo.',
        statChanges: { stability: -20, cred: 5 },
        flagsSet: ['bandBrokeUp'],
      },
    ],
  },

  // New member proves their worth
  {
    id: 'EV_NEW_MEMBER_SHINES',
    triggerConditions: {
      minBandmates: 2,
      minHype: 30,
    },
    weight: 3,
    // Gigs now automatic - requiredAction removed
    textIntro: 'The new guitarist absolutely kills it at the show. The crowd goes wild for their solo. They might be the real deal.',
    choices: [
      {
        id: 'SHARE_SPOTLIGHT',
        label: 'Share the spotlight',
        outcomeText: 'You embrace them on stage. The chemistry is electric. Fans love the dynamic.',
        statChanges: { hype: 5, stability: 3 },
      },
      {
        id: 'FEEL_THREATENED',
        label: 'Feel threatened',
        outcomeText: 'You cut their solo short tomorrow night. They notice. Everyone notices.',
        statChanges: { stability: -5, cred: -2 },
      },
    ],
    oneTime: true,
  },

  // Band road trip bonding
  {
    id: 'EV_VAN_BREAKDOWN',
    triggerConditions: {
      minBandmates: 1,
    },
    weight: 2,
    textIntro: 'The van breaks down in the middle of nowhere. You\'re stuck for hours waiting for a tow.',
    choices: [
      {
        id: 'MAKE_BEST_OF_IT',
        label: 'Make the best of it',
        outcomeText: 'You break out acoustic guitars and play songs on the roadside. A passing car stops to listen. Actually kind of magical.',
        statChanges: { stability: 3, skill: 1 },
      },
      {
        id: 'BLAME_EACH_OTHER',
        label: 'Blame each other',
        outcomeText: '"I told you to check the oil!" The wait becomes a grudge match. Long drive after the tow.',
        statChanges: { stability: -3, burnout: 2 },
      },
      {
        id: 'CALL_FOR_HELP',
        label: 'Call a friend',
        outcomeText: 'Someone\'s got connections. A buddy comes through with a loaner. Crisis averted.',
        statChanges: { money: -100 },
      },
    ],
  },
];
