/**
 * Additional events to expand content variety
 */

import { GameEvent } from '@/engine/types';

// =============================================================================
// Additional Gig Events
// =============================================================================

export const moreGigEvents: GameEvent[] = [
  {
    id: 'EV_POWER_OUTAGE',
    triggerConditions: {},
    weight: 2,
    requiredAction: 'PLAY_LOCAL_GIG',
    textIntro: 'The venue loses power mid-set. Total darkness. The crowd starts chanting your name.',
    choices: [
      {
        id: 'ACOUSTIC_BY_PHONE',
        label: 'Play acoustic by phone light',
        outcomeText: 'The crowd holds up their phones. You play an acoustic set in the glow. Magical.',
        statChanges: { cred: 8, fans: 25, hype: 5 },
      },
      {
        id: 'WAIT_IT_OUT',
        label: 'Wait for power',
        outcomeText: 'Twenty minutes later, power returns. The momentum\'s gone but you finish the set.',
        statChanges: { hype: -3 },
      },
    ],
  },
  {
    id: 'EV_CROWD_SURFING_FAIL',
    triggerConditions: { minFans: 500 },
    weight: 2,
    requiredAction: 'PLAY_LOCAL_GIG',
    textIntro: 'You attempt a crowd surf. The crowd isn\'t ready. You hit the floor hard.',
    choices: [
      {
        id: 'LAUGH_IT_OFF',
        label: 'Laugh it off',
        outcomeText: 'You bounce up, laughing. "That\'s gonna hurt tomorrow." The crowd cheers.',
        statChanges: { health: -3, image: 5, hype: 3 },
      },
      {
        id: 'PRETEND_NOTHING',
        label: 'Pretend nothing happened',
        outcomeText: 'You play through the pain, but you\'re limping. Everyone noticed.',
        statChanges: { health: -5, stability: -2 },
      },
    ],
  },
  {
    id: 'EV_VENUE_DOUBLE_BOOKED',
    triggerConditions: {},
    weight: 2,
    requiredAction: 'PLAY_LOCAL_GIG',
    textIntro: 'You show up to the venue and there\'s another band setting up. The owner forgot about you.',
    choices: [
      {
        id: 'SHARE_THE_BILL',
        label: 'Offer to share the bill',
        outcomeText: 'You split the night with them. New friends made, and their fans dig you.',
        statChanges: { fans: 20, industryGoodwill: 3, money: -30 },
      },
      {
        id: 'DEMAND_YOUR_SLOT',
        label: 'Demand your slot',
        outcomeText: 'You argue your case. The owner kicks out the other band. You\'ve made enemies.',
        statChanges: { cred: -3, industryGoodwill: -5 },
      },
      {
        id: 'FIND_ANOTHER_VENUE',
        label: 'Play a pop-up show nearby',
        outcomeText: 'You set up on the street corner. A crowd gathers. Raw and punk as hell.',
        statChanges: { cred: 5, hype: 5, money: -20 },
      },
    ],
  },
  {
    id: 'EV_ENCORE_DEMAND',
    triggerConditions: { minFans: 1000, minHype: 40 },
    weight: 3,
    requiredAction: 'PLAY_LOCAL_GIG',
    textIntro: 'The crowd won\'t stop chanting. They want an encore. You\'ve already played everything.',
    choices: [
      {
        id: 'PLAY_COVER',
        label: 'Play a classic cover',
        outcomeText: 'You rip into a crowd-pleaser cover. The place explodes.',
        statChanges: { fans: 15, hype: 8, cred: -2 },
      },
      {
        id: 'REPEAT_HIT',
        label: 'Play your best song again',
        outcomeText: 'They wanted it, you give it to them. The sing-along is deafening.',
        statChanges: { fans: 20, hype: 10 },
      },
      {
        id: 'TEASE_NEW_SONG',
        label: 'Debut something new',
        outcomeText: 'You play a song nobody\'s heard. Risky, but the reaction is incredible.',
        statChanges: { cred: 5, hype: 5, skill: 2 },
      },
    ],
  },
  {
    id: 'EV_FIGHT_BREAKS_OUT',
    triggerConditions: { minFans: 300 },
    weight: 2,
    requiredAction: 'PLAY_LOCAL_GIG',
    textIntro: 'A fight breaks out in the pit. Security is overwhelmed. Do you keep playing?',
    choices: [
      {
        id: 'STOP_AND_INTERVENE',
        label: 'Stop the music and speak up',
        outcomeText: '"Hey! We\'re here for music, not violence." The crowd cools off. Respect earned.',
        statChanges: { cred: 5, stability: 3 },
      },
      {
        id: 'PLAY_LOUDER',
        label: 'Play louder',
        outcomeText: 'You crank up and play through it. Some fans get hurt. Not your problem?',
        statChanges: { image: 3, cred: -3, stability: -2 },
      },
    ],
  },
];

// =============================================================================
// Additional Money & Career Events
// =============================================================================

export const moreMoneyEvents: GameEvent[] = [
  {
    id: 'EV_VAN_BREAKDOWN',
    triggerConditions: {},
    weight: 3,
    textIntro: 'The van won\'t start. Smoke\'s coming from under the hood. You\'ve got a show tonight.',
    choices: [
      {
        id: 'FIX_VAN',
        label: 'Get it fixed ($300)',
        outcomeText: 'The mechanic says it\'ll run... for now. Your wallet\'s lighter.',
        statChanges: { money: -300, stability: -2 },
      },
      {
        id: 'RENT_A_VAN',
        label: 'Rent a van for tonight',
        outcomeText: 'You get a rental and make the show. The van issue waits for another day.',
        statChanges: { money: -100 },
      },
      {
        id: 'CANCEL_THE_GIG',
        label: 'Cancel the gig',
        outcomeText: 'You call the venue. They\'re not happy. Word spreads that you\'re unreliable.',
        statChanges: { industryGoodwill: -8, hype: -5 },
      },
    ],
  },
  {
    id: 'EV_MERCH_OPPORTUNITY',
    triggerConditions: { minFans: 500 },
    weight: 3,
    textIntro: 'A friend offers to print t-shirts for you at cost. "You should have merch by now."',
    choices: [
      {
        id: 'ORDER_SHIRTS',
        label: 'Order 50 shirts ($150)',
        outcomeText: 'The shirts look great. Time to see if fans will buy them.',
        statChanges: { money: -150, image: 3 },
      },
      {
        id: 'GO_BIG',
        label: 'Order 200 shirts ($400)',
        outcomeText: 'Go big or go home. You\'ve got boxes of shirts. Better sell them.',
        statChanges: { money: -400, image: 5, hype: 3 },
      },
      {
        id: 'PASS_FOR_NOW',
        label: 'Maybe later',
        outcomeText: 'You tell them you\'ll think about it. Money\'s tight right now.',
        statChanges: {},
      },
    ],
  },
  {
    id: 'EV_STREAMING_NOTICE',
    triggerConditions: { minFans: 2000 },
    weight: 2,
    textIntro: 'Your songs are getting streams online. A small royalty check arrives unexpectedly.',
    choices: [
      {
        id: 'CELEBRATE',
        label: 'Celebrate this milestone',
        outcomeText: 'It\'s not much, but it\'s money from MUSIC. You treat the band to dinner.',
        statChanges: { money: 150, stability: 5, hype: 2 },
      },
      {
        id: 'INVEST_IN_RECORDING',
        label: 'Put it toward recording',
        outcomeText: 'Every dollar back into the music. This is how you build.',
        statChanges: { money: 50, skill: 2 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'EV_EQUIPMENT_UPGRADE',
    triggerConditions: { minMoney: 500 },
    weight: 2,
    textIntro: 'The music store has a sale. That amp you\'ve been eyeing is finally affordable.',
    choices: [
      {
        id: 'BUY_AMP',
        label: 'Buy the amp ($400)',
        outcomeText: 'The tone is incredible. Your sound just leveled up.',
        statChanges: { money: -400, skill: 3, image: 2 },
      },
      {
        id: 'SAVE_MONEY',
        label: 'Keep saving',
        outcomeText: 'You walk away. Financial responsibility. How very un-rock and roll.',
        statChanges: { stability: 2 },
      },
    ],
  },
  {
    id: 'EV_TAX_TROUBLE',
    triggerConditions: { minFans: 3000 },
    weight: 2,
    textIntro: 'You get a letter from the IRS. Turns out you were supposed to report gig income.',
    choices: [
      {
        id: 'PAY_UP',
        label: 'Pay what you owe ($200)',
        outcomeText: 'You square up with the taxman. Lesson learned about paperwork.',
        statChanges: { money: -200, stability: -3 },
      },
      {
        id: 'GET_ACCOUNTANT',
        label: 'Hire an accountant ($100)',
        outcomeText: 'You get professional help. They find some deductions. Worth it.',
        statChanges: { money: -100, stability: 3 },
      },
      {
        id: 'IGNORE_IT',
        label: 'Ignore it for now',
        outcomeText: 'You toss the letter. This will definitely come back to haunt you.',
        statChanges: { stability: -5 },
      },
    ],
    oneTime: true,
  },
];

// =============================================================================
// Additional Health & Addiction Events
// =============================================================================

export const moreHealthEvents: GameEvent[] = [
  {
    id: 'EV_VOICE_PROBLEMS',
    triggerConditions: { minBurnout: 40 },
    weight: 3,
    textIntro: 'Your voice is shot. Every note feels like sandpaper. You\'ve been pushing too hard.',
    choices: [
      {
        id: 'SEE_SPECIALIST',
        label: 'See a vocal coach ($150)',
        outcomeText: 'They teach you proper technique. Your voice starts to recover.',
        statChanges: { money: -150, health: 5, skill: 3 },
      },
      {
        id: 'REST_VOICE',
        label: 'Complete vocal rest',
        outcomeText: 'You don\'t speak for a week. Annoying, but necessary.',
        statChanges: { health: 3, burnout: -5, hype: -3 },
      },
      {
        id: 'KEEP_SCREAMING',
        label: 'Push through it',
        outcomeText: 'You play through the pain. Your voice cracks during the high notes.',
        statChanges: { health: -5, cred: -2 },
      },
    ],
  },
  {
    id: 'EV_HEARING_DAMAGE',
    triggerConditions: { minSkill: 30 },
    weight: 2,
    textIntro: 'Ringing in your ears that won\'t stop. Years of loud music are taking their toll.',
    choices: [
      {
        id: 'GET_EARPLUGS',
        label: 'Get proper ear protection',
        outcomeText: 'Custom earplugs aren\'t cheap but your hearing is worth it.',
        statChanges: { money: -100, health: 3, stability: 2 },
      },
      {
        id: 'IGNORE_RINGING',
        label: 'Ignore it',
        outcomeText: 'It\'s just part of being a musician, right? The ringing persists.',
        statChanges: { health: -3, stability: -2 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'EV_PANIC_ATTACK',
    triggerConditions: { maxStability: 30, minBurnout: 50 },
    weight: 3,
    requiredAction: 'PLAY_LOCAL_GIG',
    textIntro: 'Backstage before a show, your heart races. You can\'t breathe. Everything\'s closing in.',
    choices: [
      {
        id: 'PUSH_THROUGH_PANIC',
        label: 'Force yourself on stage',
        outcomeText: 'You get through it, but barely. The performance is shaky.',
        statChanges: { stability: -5, health: -3 },
      },
      {
        id: 'TAKE_FIVE',
        label: 'Take five minutes',
        outcomeText: 'You breathe. The band covers for you. You go on late but steady.',
        statChanges: { stability: 3 },
      },
      {
        id: 'LIQUID_COURAGE',
        label: 'Drink to calm nerves',
        outcomeText: 'A few shots and you\'re loose. Too loose? Hard to tell.',
        statChanges: { addiction: 3, stability: -2 },
      },
    ],
  },
  {
    id: 'EV_INSOMNIA',
    triggerConditions: { minBurnout: 30, minAddiction: 20 },
    weight: 3,
    textIntro: 'Another sleepless night. Your mind won\'t shut off. The ceiling\'s become familiar.',
    choices: [
      {
        id: 'WRITE_THROUGH_NIGHT',
        label: 'Write songs instead',
        outcomeText: '3 AM creativity hits different. You write something raw and honest.',
        statChanges: { skill: 2, burnout: 3 },
      },
      {
        id: 'SLEEPING_PILLS',
        label: 'Take something to sleep',
        outcomeText: 'The pills knock you out. You wake groggy but at least you slept.',
        statChanges: { addiction: 3, health: -2, burnout: -5 },
      },
      {
        id: 'JUST_LIE_THERE',
        label: 'Just lie there',
        outcomeText: 'You stare at the ceiling until dawn. Another exhausted day ahead.',
        statChanges: { burnout: 5, stability: -3 },
      },
    ],
  },
  {
    id: 'EV_RELAPSE_TEMPTATION',
    triggerConditions: { minAddiction: 50, maxAddiction: 70 },
    weight: 3,
    textIntro: 'You\'re at a party. Everyone\'s having fun. Your poison of choice is right there.',
    choices: [
      {
        id: 'GIVE_IN',
        label: 'Just this once',
        outcomeText: '"Just once" becomes "just tonight" becomes... you know how this goes.',
        statChanges: { addiction: 10, stability: -5 },
      },
      {
        id: 'LEAVE_PARTY',
        label: 'Leave the party',
        outcomeText: 'You walk out. It feels like defeat but it\'s actually victory.',
        statChanges: { addiction: -3, stability: 5, cred: -2 },
      },
      {
        id: 'FIND_SOBER_FRIEND',
        label: 'Find someone sober to talk to',
        outcomeText: 'A friend gets it. They keep you company till the craving passes.',
        statChanges: { addiction: -5, stability: 5 },
      },
    ],
  },
  {
    id: 'EV_SUBSTANCE_OFFERED',
    triggerConditions: { minFans: 1000 },
    weight: 2,
    requiredAction: 'PLAY_LOCAL_GIG',
    textIntro: 'Someone backstage offers you pills. "Everyone\'s doing it. It\'ll help you perform."',
    choices: [
      {
        id: 'TRY_IT',
        label: 'Try it',
        outcomeText: 'The buzz is real. You\'ve never felt this alive on stage. Dangerous.',
        statChanges: { addiction: 8, health: -3, hype: 5 },
      },
      {
        id: 'HARD_NO',
        label: 'Hard no',
        outcomeText: 'You decline firmly. They shrug. "Your loss."',
        statChanges: { cred: 2, stability: 2 },
      },
    ],
  },
];

// =============================================================================
// Additional Scene & Social Events
// =============================================================================

export const moreSceneEvents: GameEvent[] = [
  {
    id: 'EV_CELEBRITY_SPOTTED',
    triggerConditions: { minFans: 5000, minHype: 50 },
    weight: 2,
    requiredAction: 'PLAY_LOCAL_GIG',
    textIntro: 'A famous musician is in the crowd tonight. Word spreads backstage fast.',
    choices: [
      {
        id: 'PLAY_TO_THEM',
        label: 'Play to impress them',
        outcomeText: 'You pull out all the stops. They nod approvingly. A good sign.',
        statChanges: { industryGoodwill: 8, hype: 10 },
      },
      {
        id: 'IGNORE_PRETEND',
        label: 'Pretend you don\'t notice',
        outcomeText: 'You play like every show matters equally. Because it does. They respect that.',
        statChanges: { cred: 5, industryGoodwill: 5 },
      },
      {
        id: 'DEDICATE_SONG',
        label: 'Dedicate a song to them',
        outcomeText: 'Bold move. They laugh and raise their drink. You\'ve got their attention.',
        statChanges: { image: 5, hype: 8, cred: -2 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'EV_OPENING_SLOT_OFFER',
    triggerConditions: { minFans: 2000, minIndustryGoodwill: 30 },
    weight: 2,
    textIntro: 'A bigger band wants you to open for them on a weekend of shows.',
    choices: [
      {
        id: 'TAKE_SLOT',
        label: 'Take the opening slot',
        outcomeText: 'Three nights in front of new crowds. You win over a lot of new fans.',
        statChanges: { fans: 100, hype: 10, money: 200 },
      },
      {
        id: 'NEGOTIATE_BETTER',
        label: 'Negotiate for better billing',
        outcomeText: 'You push for co-headlining. They respect the hustle and agree.',
        statChanges: { fans: 75, hype: 8, cred: 3, money: 350 },
      },
      {
        id: 'DECLINE_OPENER',
        label: 'Too proud to open',
        outcomeText: 'You turn it down. Pride intact, opportunity missed.',
        statChanges: { cred: 2, industryGoodwill: -3 },
      },
    ],
  },
  {
    id: 'EV_RADIO_PLAY',
    triggerConditions: { minFans: 3000 },
    weight: 2,
    textIntro: 'A college radio station is playing your song. You hear yourself on the airwaves.',
    choices: [
      {
        id: 'CALL_TO_THANK',
        label: 'Call to thank them',
        outcomeText: 'The DJ loves you. They put you in regular rotation.',
        statChanges: { fans: 50, hype: 8, industryGoodwill: 3 },
      },
      {
        id: 'OFFER_INTERVIEW',
        label: 'Offer to do an on-air interview',
        outcomeText: 'You go on air and charm the listeners. Great exposure.',
        statChanges: { fans: 80, hype: 12 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'EV_FEUD_WITH_PRESS',
    triggerConditions: { minFans: 5000 },
    weight: 2,
    textIntro: 'A local music journalist writes a scathing review calling you "derivative and dull."',
    choices: [
      {
        id: 'RESPOND_PUBLICLY',
        label: 'Fire back publicly',
        outcomeText: 'You write a blistering response. The beef gets attention.',
        statChanges: { hype: 10, cred: -5, industryGoodwill: -3 },
      },
      {
        id: 'KILL_WITH_KINDNESS',
        label: 'Thank them for the coverage',
        outcomeText: '"All press is good press." The journalist is confused, then impressed.',
        statChanges: { cred: 3, industryGoodwill: 5 },
      },
      {
        id: 'IGNORE_PRESS',
        label: 'Don\'t engage',
        outcomeText: 'You move on. The review fades into yesterday\'s news.',
        statChanges: { stability: 2 },
      },
    ],
  },
  {
    id: 'EV_FAN_TATTOO',
    triggerConditions: { minFans: 3000, minCred: 40 },
    weight: 2,
    textIntro: 'A fan shows you they got a tattoo of your band logo. It\'s huge. And permanent.',
    choices: [
      {
        id: 'BE_FLATTERED',
        label: 'Be genuinely flattered',
        outcomeText: 'You take a photo together. They beam. This is surreal.',
        statChanges: { stability: 3, fans: 10 },
      },
      {
        id: 'FEEL_PRESSURE',
        label: 'Feel the weight of responsibility',
        outcomeText: 'People are getting your name permanently inked. Heavy.',
        statChanges: { stability: -3, cred: 2 },
      },
    ],
  },
  {
    id: 'EV_COLLABORATION_OFFER',
    triggerConditions: { minFans: 4000, minIndustryGoodwill: 40 },
    weight: 2,
    textIntro: 'Another artist wants to collaborate on a track. Different style than yours.',
    choices: [
      {
        id: 'ACCEPT_COLLAB',
        label: 'Accept the collaboration',
        outcomeText: 'The fusion of styles creates something unexpected. Critics are intrigued.',
        statChanges: { cred: 3, fans: 40, skill: 2 },
      },
      {
        id: 'DECLINE_COLLAB',
        label: 'Stay in your lane',
        outcomeText: 'You politely decline. Better to keep your sound pure.',
        statChanges: { cred: 2, industryGoodwill: -2 },
      },
    ],
  },
];

// =============================================================================
// Additional Band Drama Events
// =============================================================================

export const moreBandEvents: GameEvent[] = [
  {
    id: 'EV_BANDMATE_SOLO_PROJECT',
    triggerConditions: { minBandmates: 2, minFans: 3000 },
    weight: 2,
    textIntro: 'Your guitarist announces they\'ve been working on a solo project. "Just a side thing."',
    choices: [
      {
        id: 'SUPPORTIVE',
        label: 'Be supportive',
        outcomeText: 'You tell them to pursue it. The band\'s bigger than jealousy.',
        statChanges: { stability: 3 },
        bandmateChanges: { loyalty: 8 },
      },
      {
        id: 'CONCERNED',
        label: 'Express concern',
        outcomeText: 'You worry about divided attention. They assure you the band comes first.',
        statChanges: { stability: -2 },
        bandmateChanges: { loyalty: -3 },
      },
      {
        id: 'DEMAND_COMMITMENT',
        label: 'Demand full commitment',
        outcomeText: 'You lay down the law: it\'s the band or nothing. Tension rises.',
        statChanges: { stability: -5 },
        bandmateChanges: { loyalty: -10 },
      },
    ],
  },
  {
    id: 'EV_BANDMATE_RELATIONSHIP',
    triggerConditions: { minBandmates: 2 },
    weight: 2,
    textIntro: 'Two of your bandmates are secretly dating. It just became very not secret.',
    choices: [
      {
        id: 'NONE_OF_BUSINESS',
        label: 'None of your business',
        outcomeText: 'You shrug. "Just keep it professional on stage." They look relieved.',
        statChanges: { stability: 2 },
        bandmateChanges: { loyalty: 3 },
      },
      {
        id: 'WARN_THEM',
        label: 'Warn about band dynamics',
        outcomeText: 'You voice concerns about what happens if they break up. Awkward but fair.',
        statChanges: { stability: -2 },
        bandmateChanges: { loyalty: -2 },
      },
    ],
  },
  {
    id: 'EV_BANDMATE_MISSING_MONEY',
    triggerConditions: { minBandmates: 2, minMoney: 200 },
    weight: 2,
    textIntro: 'Money\'s missing from the band fund. Someone took it. Eyes dart around the room.',
    choices: [
      {
        id: 'INVESTIGATE',
        label: 'Investigate quietly',
        outcomeText: 'You do some digging. The truth comes out. It wasn\'t pretty.',
        statChanges: { money: -100, stability: -5 },
        bandmateChanges: { loyalty: -5 },
      },
      {
        id: 'LET_IT_GO',
        label: 'Let it slide this time',
        outcomeText: 'You don\'t press it. Maybe someone needed it. Trust is damaged anyway.',
        statChanges: { money: -100, stability: -3 },
      },
      {
        id: 'CONFRONT_EVERYONE',
        label: 'Confront the whole band',
        outcomeText: 'You call a meeting. The guilty party confesses. They pay it back, shamefaced.',
        statChanges: { stability: -3 },
        bandmateChanges: { loyalty: -3 },
      },
    ],
  },
];

// =============================================================================
// Additional Industry Events
// =============================================================================

export const moreIndustryEvents: GameEvent[] = [
  {
    id: 'EV_SYNC_LICENSE',
    triggerConditions: { minFans: 5000, minIndustryGoodwill: 40 },
    weight: 2,
    textIntro: 'A TV show wants to use your song. It\'s a procedural crime drama. Not cool, but money.',
    choices: [
      {
        id: 'TAKE_SYNC',
        label: 'Take the sync deal ($500)',
        outcomeText: 'Your song plays during a chase scene. Millions hear it. Not very punk.',
        statChanges: { money: 500, fans: 100, cred: -5, industryGoodwill: 5 },
      },
      {
        id: 'DECLINE_SYNC',
        label: 'Decline',
        outcomeText: 'You pass. The scene respects you for it. Your wallet doesn\'t.',
        statChanges: { cred: 5, industryGoodwill: -3 },
      },
    ],
  },
  {
    id: 'EV_MANAGEMENT_INTEREST',
    triggerConditions: { minFans: 8000, minHype: 45 },
    weight: 2,
    textIntro: 'A manager wants to represent you. "I can get you to the next level."',
    choices: [
      {
        id: 'SIGN_WITH_MANAGER',
        label: 'Sign with them',
        outcomeText: 'You\'ve got professional management now. Things start moving faster.',
        statChanges: { industryGoodwill: 10, money: -100 },
        flagsSet: ['hasManager'],
      },
      {
        id: 'STAY_INDEPENDENT',
        label: 'Stay independent',
        outcomeText: 'You\'re not ready to give up control. DIY forever.',
        statChanges: { cred: 3, stability: 2 },
      },
      {
        id: 'MEET_OTHER_MANAGERS',
        label: 'Meet with other options first',
        outcomeText: 'You tell them you\'ll shop around. Smart move.',
        statChanges: { industryGoodwill: 2 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'EV_BOOKING_AGENT',
    triggerConditions: { minFans: 6000, minIndustryGoodwill: 35 },
    weight: 2,
    textIntro: 'A booking agent offers to handle your shows. More gigs, less hassle.',
    choices: [
      {
        id: 'USE_AGENT',
        label: 'Use the booking agent',
        outcomeText: 'Gigs start rolling in. Better venues, better pay. This is progress.',
        statChanges: { industryGoodwill: 5, money: 100 },
      },
      {
        id: 'BOOK_YOURSELF',
        label: 'Keep booking yourself',
        outcomeText: 'You know your audience best. DIY booking continues.',
        statChanges: { cred: 2, burnout: 3 },
      },
    ],
  },
  {
    id: 'EV_MUSIC_VIDEO_OFFER',
    triggerConditions: { minFans: 4000 },
    weight: 2,
    textIntro: 'A film student wants to shoot a music video for free. "I need portfolio pieces."',
    choices: [
      {
        id: 'MAKE_VIDEO',
        label: 'Make the video',
        outcomeText: 'The video is rough but genuine. It gets some views.',
        statChanges: { hype: 8, fans: 30, image: 3 },
      },
      {
        id: 'WAIT_FOR_BUDGET',
        label: 'Wait until you can afford a real one',
        outcomeText: 'You hold off. Better to do it right... eventually.',
        statChanges: {},
      },
    ],
  },
  {
    id: 'EV_BLOG_FEATURE',
    triggerConditions: { minFans: 2500 },
    weight: 3,
    textIntro: 'A popular music blog wants to feature your band. "Ones to watch" kind of thing.',
    choices: [
      {
        id: 'DO_FEATURE',
        label: 'Participate fully',
        outcomeText: 'The feature drops. Your streams spike. New fans flood in.',
        statChanges: { fans: 80, hype: 12, cred: 2 },
      },
      {
        id: 'PLAY_HARD_TO_GET',
        label: 'Play hard to get',
        outcomeText: 'You make them chase you a bit. The anticipation builds.',
        statChanges: { fans: 40, hype: 8, cred: 5 },
      },
    ],
  },
];

// =============================================================================
// Export all additional events
// =============================================================================

export const ALL_ADDITIONAL_EVENTS: GameEvent[] = [
  ...moreGigEvents,
  ...moreMoneyEvents,
  ...moreHealthEvents,
  ...moreSceneEvents,
  ...moreBandEvents,
  ...moreIndustryEvents,
];
