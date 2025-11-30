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

  // ===== Creative Differences =====

  // Bandmate writes a song you hate
  {
    id: 'EV_HATE_THEIR_SONG',
    triggerConditions: {
      minBandmates: 1,
    },
    weight: 2,
    requiredAction: 'WRITE',
    textIntro: 'Your guitarist brings in a new song. It\'s... not good. But they\'re really proud of it.',
    choices: [
      {
        id: 'BE_HONEST',
        label: 'Be honest',
        outcomeText: 'You tell them it needs work. They\'re hurt, but they respect your honesty eventually.',
        statChanges: { cred: 2 },
        bandmateChanges: { loyalty: -3 },
      },
      {
        id: 'FAKE_ENTHUSIASM',
        label: 'Fake enthusiasm',
        outcomeText: 'You pretend to love it. Now you\'re stuck playing it at every show.',
        statChanges: { cred: -2 },
        bandmateChanges: { loyalty: 3 },
      },
      {
        id: 'WORKSHOP_IT',
        label: 'Suggest improvements',
        outcomeText: 'You work on it together. By the end, it\'s actually decent. Their idea, your polish.',
        statChanges: { skill: 2 },
        bandmateChanges: { loyalty: 2 },
      },
    ],
  },

  // Direction disagreement
  {
    id: 'EV_MUSICAL_DIRECTION',
    triggerConditions: {
      minBandmates: 2,
      minFans: 1000,
    },
    weight: 2,
    textIntro: 'The band can\'t agree on what direction to go next. Half want to experiment. Half want to stick with what works.',
    choices: [
      {
        id: 'EXPERIMENT',
        label: 'Push for evolution',
        outcomeText: 'You take creative risks. Some old fans leave. New ones arrive. Art should be uncomfortable.',
        statChanges: { cred: 5, fans: -50, coreFans: 30 },
        bandmateChanges: { loyalty: 2 },
      },
      {
        id: 'PLAY_SAFE',
        label: 'Stick with the formula',
        outcomeText: 'You give the fans what they want. The purists are happy. It feels a bit hollow.',
        statChanges: { cred: -3, fans: 50, stability: 3 },
      },
      {
        id: 'SPLIT_DIFFERENCE',
        label: 'One experimental, one safe',
        outcomeText: 'You\'ll record both types of songs. See what sticks. It\'s a compromise but it works.',
        statChanges: { cred: 1, skill: 1, stability: 2 },
        bandmateChanges: { loyalty: 1 },
      },
    ],
  },

  // Producer disagrees with band
  {
    id: 'EV_PRODUCER_FIGHT',
    triggerConditions: {
      minBandmates: 1,
      inStudio: true,
    },
    weight: 2,
    textIntro: 'The producer wants to change your sound. Your bandmates are split - half love it, half think he\'s ruining the record.',
    choices: [
      {
        id: 'TRUST_PRODUCER',
        label: 'Trust the producer',
        outcomeText: 'You defer to experience. The result is polished but doesn\'t quite sound like you.',
        statChanges: { skill: 1, cred: -2, hype: 3 },
        bandmateChanges: { loyalty: -2 },
      },
      {
        id: 'FIGHT_FOR_VISION',
        label: 'Fight for your vision',
        outcomeText: 'You push back hard. The producer respects you more. The record sounds exactly like you intended.',
        statChanges: { cred: 4, industryGoodwill: -2 },
        bandmateChanges: { loyalty: 3 },
      },
      {
        id: 'FIRE_PRODUCER',
        label: 'Fire the producer',
        outcomeText: 'Drastic but necessary. You lose the deposit but gain your integrity.',
        statChanges: { money: -1000, cred: 5, industryGoodwill: -5 },
        bandmateChanges: { loyalty: 2 },
      },
    ],
  },

  // ===== Band Relationships =====

  // Band members dating
  {
    id: 'EV_BANDMATES_DATING',
    triggerConditions: {
      minBandmates: 2,
    },
    weight: 1,
    textIntro: 'You notice your guitarist and bassist have been very... close lately. They\'re dating. This could get messy.',
    choices: [
      {
        id: 'STAY_OUT',
        label: 'Stay out of it',
        outcomeText: 'Not your business. It\'s cute, actually. For now.',
        statChanges: { stability: 2 },
        bandmateChanges: { loyalty: 1 },
      },
      {
        id: 'SET_BOUNDARIES',
        label: 'Set professional boundaries',
        outcomeText: 'You have a mature conversation about keeping band and romance separate. They appreciate it.',
        statChanges: { stability: 5 },
      },
      {
        id: 'WORRY_OPENLY',
        label: 'Express concern',
        outcomeText: 'You warn them about mixing business and pleasure. They think you\'re overreacting.',
        statChanges: { stability: -2 },
        bandmateChanges: { loyalty: -3 },
      },
    ],
    oneTime: true,
  },

  // Band members break up
  {
    id: 'EV_BANDMATES_BREAKUP',
    triggerConditions: {
      minBandmates: 2,
      hasFlag: 'bandmatesDating',
    },
    weight: 3,
    textIntro: 'The guitarist and bassist have broken up. Practice is unbearable. They can\'t even look at each other.',
    choices: [
      {
        id: 'MEDIATE',
        label: 'Mediate between them',
        outcomeText: 'You spend hours being a therapist instead of a musician. Eventually they agree to be professional.',
        statChanges: { stability: -5, burnout: 5 },
        bandmateChanges: { loyalty: 3 },
      },
      {
        id: 'PICK_A_SIDE',
        label: 'Pick a side',
        outcomeText: 'You back one of them. The other feels betrayed. This might not end well.',
        statChanges: { stability: -8 },
        bandmateChanges: { loyalty: -5 },
      },
      {
        id: 'GIVE_SPACE',
        label: 'Take a break from rehearsals',
        outcomeText: 'Everyone needs time. You cancel practice for a few weeks. Tensions cool slightly.',
        statChanges: { skill: -2, stability: 3 },
      },
    ],
    oneTime: true,
  },

  // Ego clash
  {
    id: 'EV_EGO_CLASH',
    triggerConditions: {
      minBandmates: 1,
      minHype: 30,
    },
    weight: 2,
    textIntro: 'A journalist wants to interview just you, not the band. Your bandmates are annoyed. "It\'s not a solo project."',
    choices: [
      {
        id: 'DO_INTERVIEW_SOLO',
        label: 'Do the interview anyway',
        outcomeText: 'You take the spotlight. The article is great for your profile, less great for band unity.',
        statChanges: { hype: 8, image: 5 },
        bandmateChanges: { loyalty: -8 },
      },
      {
        id: 'INSIST_ON_BAND',
        label: 'Insist they interview the band',
        outcomeText: 'You tell the journalist it\'s all of us or none. They agree. Your bandmates appreciate it.',
        statChanges: { hype: 5 },
        bandmateChanges: { loyalty: 5 },
      },
      {
        id: 'DECLINE_INTERVIEW',
        label: 'Decline entirely',
        outcomeText: 'You turn it down to avoid drama. The journalist moves on. Peace preserved.',
        statChanges: { cred: 2 },
        bandmateChanges: { loyalty: 2 },
      },
    ],
  },

  // Money dispute
  {
    id: 'EV_MONEY_DISPUTE',
    triggerConditions: {
      minBandmates: 1,
      minMoney: 2000,
    },
    weight: 2,
    textIntro: 'The gig money\'s come in and there\'s disagreement about splits. Your drummer thinks they deserve more.',
    choices: [
      {
        id: 'EQUAL_SPLIT',
        label: 'Equal splits, non-negotiable',
        outcomeText: 'You stand firm on equal shares. The drummer accepts it but there\'s resentment.',
        statChanges: { stability: -2 },
        bandmateChanges: { loyalty: -3 },
      },
      {
        id: 'NEGOTIATE',
        label: 'Hear their case',
        outcomeText: 'They do drive the van and load the most gear. You agree to a small bump.',
        statChanges: { money: -100 },
        bandmateChanges: { loyalty: 5 },
      },
      {
        id: 'SONGWRITING_SPLIT',
        label: 'Move to songwriting splits',
        outcomeText: 'You propose that songwriters get a bigger cut. Fair in theory, contentious in practice.',
        statChanges: { cred: 2 },
        bandmateChanges: { loyalty: -2 },
      },
    ],
  },

  // ===== Band Growth =====

  // Bandmate improves dramatically
  {
    id: 'EV_BANDMATE_IMPROVEMENT',
    triggerConditions: {
      minBandmates: 1,
      minWeek: 10,
    },
    weight: 2,
    textIntro: 'Your bassist has been practising like mad. They\'ve gone from adequate to genuinely impressive.',
    choices: [
      {
        id: 'CELEBRATE_GROWTH',
        label: 'Celebrate their growth',
        outcomeText: 'You praise them publicly. Their confidence soars. The band sounds better than ever.',
        statChanges: { skill: 3, stability: 3 },
        bandmateChanges: { loyalty: 5 },
      },
      {
        id: 'RAISE_YOUR_GAME',
        label: 'Feel inspired to improve',
        outcomeText: 'Their dedication motivates you. You both push each other to be better.',
        statChanges: { skill: 4 },
        bandmateChanges: { loyalty: 2 },
      },
      {
        id: 'FEEL_INSECURE',
        label: 'Feel threatened',
        outcomeText: 'Are they getting better than you? The thought nags at you.',
        statChanges: { stability: -5, burnout: 3 },
      },
    ],
  },

  // Bandmate personal crisis
  {
    id: 'EV_BANDMATE_CRISIS',
    triggerConditions: {
      minBandmates: 1,
    },
    weight: 1,
    textIntro: 'Your guitarist\'s parent is seriously ill. They\'re struggling to focus and considering leaving temporarily.',
    choices: [
      {
        id: 'FULL_SUPPORT',
        label: 'Give them full support',
        outcomeText: 'You tell them family comes first. Take whatever time they need. You\'ll manage.',
        statChanges: { stability: -3, hype: -3 },
        bandmateChanges: { loyalty: 10 },
      },
      {
        id: 'FIND_DEP',
        label: 'Arrange a dep player',
        outcomeText: 'You hire someone to cover shows. Professional but your guitarist feels replaced.',
        statChanges: { money: -300 },
        bandmateChanges: { loyalty: -2 },
      },
      {
        id: 'CANCEL_COMMITMENTS',
        label: 'Cancel upcoming shows',
        outcomeText: 'You prioritize your friend over the schedule. The promoters understand.',
        statChanges: { money: -200, industryGoodwill: 2 },
        bandmateChanges: { loyalty: 8 },
      },
    ],
    oneTime: true,
  },

  // Band joke becomes inside joke
  {
    id: 'EV_INSIDE_JOKE',
    triggerConditions: {
      minBandmates: 1,
      minStability: 40,
    },
    weight: 2,
    textIntro: 'Something stupid happens at practice. You\'re all crying with laughter. It becomes a running joke.',
    choices: [
      {
        id: 'CHERISH_MOMENT',
        label: 'Cherish the moment',
        outcomeText: 'These are the moments that make the struggle worth it. You\'re a family, not just a band.',
        statChanges: { stability: 5, burnout: -3 },
        bandmateChanges: { loyalty: 3 },
      },
      {
        id: 'SHARE_WITH_FANS',
        label: 'Share it with fans',
        outcomeText: 'You post the story online. Fans love seeing the human side of the band.',
        statChanges: { coreFans: 15, followers: 20 },
        bandmateChanges: { loyalty: 2 },
      },
    ],
  },

  // Band anniversary
  {
    id: 'EV_BAND_ANNIVERSARY',
    triggerConditions: {
      minBandmates: 1,
      minWeek: 52,
    },
    weight: 1,
    textIntro: 'It\'s been a year since the band formed. You\'ve survived this long. That\'s more than most.',
    choices: [
      {
        id: 'COMMEMORATE',
        label: 'Throw an anniversary show',
        outcomeText: 'You play a special gig marking the occasion. Fans who\'ve been there from the start show up.',
        statChanges: { coreFans: 30, stability: 5, money: 300 },
        bandmateChanges: { loyalty: 5 },
      },
      {
        id: 'REFLECT_PRIVATELY',
        label: 'Reflect privately',
        outcomeText: 'You share a quiet drink together. No fanfare, just gratitude.',
        statChanges: { stability: 8, burnout: -5 },
        bandmateChanges: { loyalty: 3 },
      },
      {
        id: 'LOOK_FORWARD',
        label: 'Focus on the future',
        outcomeText: 'No time for nostalgia. Year two starts now. Bigger goals ahead.',
        statChanges: { hype: 3 },
      },
    ],
    oneTime: true,
  },
];
