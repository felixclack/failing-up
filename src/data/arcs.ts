/**
 * Arc definitions - multi-event storylines
 *
 * Each arc has entry conditions, stages with events, and advancement conditions.
 * Arcs create narrative through-lines that make runs feel connected.
 */

import { Arc, GameEvent } from '@/engine/types';

// =============================================================================
// Addiction Arc
// =============================================================================
// Trigger: Addiction crosses thresholds + repeated Party actions
// Stages: Functional partying → missed rehearsals → missed gigs → OD scare → rehab/death

export const ADDICTION_ARC: Arc = {
  id: 'ARC_ADDICTION',
  name: 'Spiral',
  entryConditions: {
    minAddiction: 40,
  },
  stages: [
    {
      stageId: 0,
      eventIds: ['ARC_ADDICTION_S0_FUNCTIONAL', 'ARC_ADDICTION_S0_WARNING'],
      advanceConditions: { minAddiction: 55 },
    },
    {
      stageId: 1,
      eventIds: ['ARC_ADDICTION_S1_MISSED_REHEARSAL', 'ARC_ADDICTION_S1_CONFRONTED'],
      advanceConditions: { minAddiction: 70 },
    },
    {
      stageId: 2,
      eventIds: ['ARC_ADDICTION_S2_MISSED_GIG', 'ARC_ADDICTION_S2_INTERVENTION'],
      advanceConditions: { minAddiction: 85 },
    },
    {
      stageId: 3,
      eventIds: ['ARC_ADDICTION_S3_OD_SCARE', 'ARC_ADDICTION_S3_FINAL_CHOICE'],
    },
  ],
  currentStage: 0,
};

export const addictionArcEvents: GameEvent[] = [
  // Stage 0: Functional partying
  {
    id: 'ARC_ADDICTION_S0_FUNCTIONAL',
    triggerConditions: { minAddiction: 40 },
    weight: 5,
    textIntro: 'The after-parties have become the main event. You\'re still making it to shows, but the highs are getting harder to come down from.',
    choices: [
      {
        id: 'ENJOY_IT',
        label: 'Enjoy the ride',
        outcomeText: 'You\'re a rock star. This is what it\'s supposed to be like, right?',
        statChanges: { addiction: 5, stability: -3 },
      },
      {
        id: 'CUT_BACK',
        label: 'Try to cut back',
        outcomeText: 'You skip a few parties. The cravings are there, but manageable. For now.',
        statChanges: { addiction: -5, burnout: 3 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'ARC_ADDICTION_S0_WARNING',
    triggerConditions: { minAddiction: 45 },
    weight: 4,
    textIntro: 'A friend from back home visits. They look at you with concern. "You doing okay? You seem... different."',
    choices: [
      {
        id: 'BRUSH_OFF',
        label: 'Brush them off',
        outcomeText: '"I\'m living the dream." They don\'t look convinced.',
        statChanges: { stability: -2 },
      },
      {
        id: 'OPEN_UP',
        label: 'Open up to them',
        outcomeText: 'You admit things have gotten intense. Having someone who knew the old you helps ground you.',
        statChanges: { stability: 5, addiction: -3 },
      },
    ],
    oneTime: true,
  },

  // Stage 1: Missing rehearsals
  {
    id: 'ARC_ADDICTION_S1_MISSED_REHEARSAL',
    triggerConditions: { minAddiction: 55 },
    weight: 5,
    textIntro: 'You wake up to 15 missed calls. Rehearsal was three hours ago. The band is furious.',
    choices: [
      {
        id: 'APOLOGIZE',
        label: 'Apologize profusely',
        outcomeText: 'You grovel. They forgive you this time, but trust is eroding.',
        statChanges: { stability: -5 },
      },
      {
        id: 'MAKE_EXCUSES',
        label: 'Make excuses',
        outcomeText: '"I was sick." Nobody believes you. The tension is thick.',
        statChanges: { stability: -8 },
      },
      {
        id: 'ADMIT_PROBLEM',
        label: 'Admit you have a problem',
        outcomeText: 'The words are hard to say. Your bandmates are supportive, but scared.',
        statChanges: { addiction: -5, stability: 3 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'ARC_ADDICTION_S1_CONFRONTED',
    triggerConditions: { minAddiction: 60 },
    weight: 4,
    textIntro: 'Your dealer shows up backstage uninvited. Your bandmates see the exchange.',
    choices: [
      {
        id: 'PLAY_IT_OFF',
        label: 'Play it off',
        outcomeText: '"Just a friend." The lie hangs in the air like smoke.',
        statChanges: { stability: -3, addiction: 3 },
      },
      {
        id: 'TELL_OFF_DEALER',
        label: 'Tell them to leave',
        outcomeText: 'You tell the dealer to get lost. It takes effort. Your hands are shaking.',
        statChanges: { addiction: -5, stability: 2 },
      },
    ],
    oneTime: true,
  },

  // Stage 2: Missing gigs
  {
    id: 'ARC_ADDICTION_S2_MISSED_GIG',
    triggerConditions: { minAddiction: 70 },
    weight: 5,
    textIntro: 'You missed the show. The venue is threatening to sue. The fans are posting angry videos online.',
    choices: [
      {
        id: 'DAMAGE_CONTROL',
        label: 'Do damage control',
        outcomeText: 'You post an apology about "exhaustion." People aren\'t buying it. The press smells blood.',
        statChanges: { hype: -15, cred: -5, industryGoodwill: -10 },
      },
      {
        id: 'GO_SILENT',
        label: 'Go silent',
        outcomeText: 'You ignore everyone. The story spirals out of control without you.',
        statChanges: { hype: -20, cred: -10, stability: -10 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'ARC_ADDICTION_S2_INTERVENTION',
    triggerConditions: { minAddiction: 75 },
    weight: 5,
    textIntro: 'Your bandmates, manager, and a counselor are waiting in your hotel room. It\'s an intervention.',
    choices: [
      {
        id: 'LISTEN',
        label: 'Listen to them',
        outcomeText: 'They read letters. They cry. You see how much damage you\'ve done. Something shifts.',
        statChanges: { addiction: -10, stability: 5 },
      },
      {
        id: 'STORM_OUT',
        label: 'Storm out',
        outcomeText: 'You scream that they don\'t understand and slam the door. The silence after is deafening.',
        statChanges: { addiction: 5, stability: -15 },
      },
      {
        id: 'BREAK_DOWN',
        label: 'Break down',
        outcomeText: 'You collapse. You admit everything. For the first time in months, you feel something real.',
        statChanges: { addiction: -15, stability: 10, burnout: -5 },
      },
    ],
    oneTime: true,
  },

  // Stage 3: OD scare / Final choice
  {
    id: 'ARC_ADDICTION_S3_OD_SCARE',
    triggerConditions: { minAddiction: 85 },
    weight: 6,
    textIntro: 'You wake up in a hospital. They had to use Narcan. The doctors say you were minutes away from death.',
    choices: [
      {
        id: 'WAKE_UP_CALL',
        label: 'This is the wake-up call',
        outcomeText: 'Lying in that hospital bed, staring at the ceiling, you make a choice. Rehab. Now.',
        statChanges: { addiction: -30, stability: -10, hype: -10 },
        flagsSet: ['enteredRehab'],
      },
      {
        id: 'DENY_IT',
        label: 'Deny it was that bad',
        outcomeText: 'It was just a bad batch. You sign yourself out AMA. The nurse looks at you with pity.',
        statChanges: { addiction: 5, health: -20, stability: -20 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'ARC_ADDICTION_S3_FINAL_CHOICE',
    triggerConditions: { minAddiction: 90 },
    weight: 6,
    textIntro: 'The next dose could be your last. Everyone knows it. You know it. This is the crossroads.',
    choices: [
      {
        id: 'CHOOSE_LIFE',
        label: 'Choose life',
        outcomeText: 'You check into rehab. The world goes on without you. But you\'re alive to see it.',
        statChanges: { addiction: -40, stability: 10, hype: -20 },
        flagsSet: ['enteredRehab', 'choseRecovery'],
      },
      {
        id: 'CANT_STOP',
        label: 'You can\'t stop',
        outcomeText: 'The needle goes in. The world goes fuzzy. Maybe this time will be different. Maybe not.',
        statChanges: { addiction: 10, health: -30, stability: -30 },
      },
    ],
    oneTime: true,
  },
];

// =============================================================================
// Label Deal Arc
// =============================================================================
// Trigger: Fans/Hype/IndustryGoodwill above thresholds
// Stages: Interest → showcase → contract terms → recording pressures → success OR dropped

export const LABEL_DEAL_ARC: Arc = {
  id: 'ARC_LABEL_DEAL',
  name: 'The Big Time',
  entryConditions: {
    minFans: 5000,
    minHype: 40,
    minIndustryGoodwill: 30,
    hasLabelDeal: false,
  },
  stages: [
    {
      stageId: 0,
      eventIds: ['ARC_LABEL_S0_INTEREST', 'ARC_LABEL_S0_MEETINGS'],
      advanceConditions: { minFans: 8000, minHype: 50 },
    },
    {
      stageId: 1,
      eventIds: ['ARC_LABEL_S1_SHOWCASE', 'ARC_LABEL_S1_BIDDING'],
      advanceConditions: { minFans: 12000 },
    },
    {
      stageId: 2,
      eventIds: ['ARC_LABEL_S2_CONTRACT', 'ARC_LABEL_S2_NEGOTIATION'],
      advanceConditions: { hasLabelDeal: true },
    },
    {
      stageId: 3,
      eventIds: ['ARC_LABEL_S3_PRESSURE', 'ARC_LABEL_S3_CREATIVE_CLASH'],
    },
  ],
  currentStage: 0,
};

export const labelDealArcEvents: GameEvent[] = [
  // Stage 0: Initial interest
  {
    id: 'ARC_LABEL_S0_INTEREST',
    triggerConditions: { minFans: 5000, minHype: 40 },
    weight: 4,
    textIntro: 'A&R reps have started showing up at your shows. They\'re watching, taking notes. Word is spreading.',
    choices: [
      {
        id: 'PLAY_COOL',
        label: 'Play it cool',
        outcomeText: 'You pretend not to notice. But inside, your heart is racing. This could be it.',
        statChanges: { cred: 2 },
      },
      {
        id: 'NETWORK',
        label: 'Work the room',
        outcomeText: 'You make connections, exchange numbers. The industry starts to know your name.',
        statChanges: { industryGoodwill: 5, cred: -1 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'ARC_LABEL_S0_MEETINGS',
    triggerConditions: { minFans: 6000, minIndustryGoodwill: 35 },
    weight: 4,
    textIntro: 'You\'re taking meetings now. Fancy offices, free drinks, big talk about "your future."',
    choices: [
      {
        id: 'STAY_GROUNDED',
        label: 'Stay grounded',
        outcomeText: 'You listen politely but don\'t commit to anything. Keep your options open.',
        statChanges: { stability: 2 },
      },
      {
        id: 'GET_EXCITED',
        label: 'Get excited',
        outcomeText: 'You let yourself dream. Maybe a little too openly. They like eager artists.',
        statChanges: { industryGoodwill: 3, cred: -2 },
      },
    ],
    oneTime: true,
  },

  // Stage 1: Showcase
  {
    id: 'ARC_LABEL_S1_SHOWCASE',
    triggerConditions: { minFans: 8000, minHype: 50 },
    weight: 5,
    textIntro: 'A major label wants you to do a showcase. Private venue, industry crowd. This is your audition.',
    choices: [
      {
        id: 'BRING_THE_FIRE',
        label: 'Bring the fire',
        outcomeText: 'You play like your life depends on it. Sweat, blood, everything. They\'re impressed.',
        statChanges: { skill: 2, industryGoodwill: 8, burnout: 5 },
      },
      {
        id: 'PLAY_IT_SAFE',
        label: 'Play it safe',
        outcomeText: 'You give a solid, professional performance. No mistakes, but no magic either.',
        statChanges: { industryGoodwill: 3 },
      },
      {
        id: 'BE_YOURSELF',
        label: 'Be your weird self',
        outcomeText: 'You do something unexpected. Half the room loves it, half hates it. You\'re memorable.',
        statChanges: { cred: 5, industryGoodwill: 2, hype: 5 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'ARC_LABEL_S1_BIDDING',
    triggerConditions: { minFans: 10000, minIndustryGoodwill: 45 },
    weight: 4,
    textIntro: 'Multiple labels are interested. Your phone won\'t stop ringing. The bidding war has begun.',
    choices: [
      {
        id: 'HOLD_OUT',
        label: 'Hold out for more',
        outcomeText: 'You wait. The offers get better. The stakes get higher.',
        statChanges: { industryGoodwill: -3, money: 500 },
      },
      {
        id: 'CHOOSE_CREATIVE',
        label: 'Prioritize creative control',
        outcomeText: 'You choose the label that promises the most artistic freedom. Money isn\'t everything.',
        statChanges: { cred: 5 },
      },
    ],
    oneTime: true,
  },

  // Stage 2: Contract
  {
    id: 'ARC_LABEL_S2_CONTRACT',
    triggerConditions: { minFans: 12000 },
    weight: 5,
    textIntro: 'The contract arrives. 50 pages of legalese. Your future in black and white.',
    choices: [
      {
        id: 'READ_CAREFULLY',
        label: 'Read every word',
        outcomeText: 'You spend hours with a lawyer. You catch some sketchy clauses. Smart move.',
        statChanges: { money: -300, stability: 3 },
      },
      {
        id: 'SIGN_QUICKLY',
        label: 'Sign and celebrate',
        outcomeText: 'You sign on the dotted line. Champagne flows. You don\'t read the fine print.',
        statChanges: { stability: -5, addiction: 3 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'ARC_LABEL_S2_NEGOTIATION',
    triggerConditions: { minFans: 12000, minIndustryGoodwill: 50 },
    weight: 4,
    textIntro: 'The label wants changes to your sound. More radio-friendly, they say. This is the negotiation.',
    choices: [
      {
        id: 'STAND_FIRM',
        label: 'Stand firm',
        outcomeText: 'You refuse to compromise your vision. They back down. For now.',
        statChanges: { cred: 5, industryGoodwill: -5 },
      },
      {
        id: 'FIND_MIDDLE',
        label: 'Find middle ground',
        outcomeText: 'You agree to some changes. Not all of them. It feels like growing up.',
        statChanges: { cred: -2, industryGoodwill: 3 },
      },
      {
        id: 'GIVE_IN',
        label: 'Give them what they want',
        outcomeText: 'You agree to everything. The check clears. You feel a little empty.',
        statChanges: { cred: -10, industryGoodwill: 8, money: 1000 },
      },
    ],
    oneTime: true,
  },

  // Stage 3: Recording pressure
  {
    id: 'ARC_LABEL_S3_PRESSURE',
    triggerConditions: { hasLabelDeal: true, minBurnout: 30 },
    weight: 4,
    textIntro: 'The label is pushing for the album. Deadlines, demands, expectations. The pressure is real.',
    choices: [
      {
        id: 'PUSH_THROUGH',
        label: 'Push through',
        outcomeText: 'You work around the clock. The album will be done on time. At what cost?',
        statChanges: { burnout: 15, skill: 3 },
      },
      {
        id: 'ASK_EXTENSION',
        label: 'Ask for an extension',
        outcomeText: 'You ask for more time. They\'re not happy, but they agree. The clock is still ticking.',
        statChanges: { industryGoodwill: -5, stability: 3 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'ARC_LABEL_S3_CREATIVE_CLASH',
    triggerConditions: { hasLabelDeal: true, minCred: 40 },
    weight: 4,
    textIntro: 'The label wants to bring in outside songwriters. They don\'t trust your material.',
    choices: [
      {
        id: 'REFUSE',
        label: 'Refuse completely',
        outcomeText: 'You stand your ground. This is YOUR band, YOUR music. They\'re not happy.',
        statChanges: { cred: 8, industryGoodwill: -10 },
      },
      {
        id: 'COLLABORATE',
        label: 'Collaborate on one song',
        outcomeText: 'You agree to try one co-write. It\'s... actually not bad. Different, but not bad.',
        statChanges: { cred: -3, skill: 2 },
      },
      {
        id: 'ACCEPT',
        label: 'Accept their writers',
        outcomeText: 'You let them bring in the hit-makers. The songs are catchy. They\'re not yours.',
        statChanges: { cred: -15, hype: 10, industryGoodwill: 5 },
      },
    ],
    oneTime: true,
  },
];

// =============================================================================
// Band Breakup Arc
// =============================================================================
// Trigger: Low average Loyalty/Reliability, repeated conflicts
// Stages: Tension → ultimatum → lineup change, side project, or full collapse

export const BAND_BREAKUP_ARC: Arc = {
  id: 'ARC_BAND_BREAKUP',
  name: 'Falling Apart',
  entryConditions: {
    minBandmates: 2,
    maxStability: 35,
  },
  stages: [
    {
      stageId: 0,
      eventIds: ['ARC_BREAKUP_S0_TENSION', 'ARC_BREAKUP_S0_SILENT'],
      advanceConditions: { maxStability: 25 },
    },
    {
      stageId: 1,
      eventIds: ['ARC_BREAKUP_S1_ULTIMATUM', 'ARC_BREAKUP_S1_SIDES'],
      advanceConditions: { maxStability: 15 },
    },
    {
      stageId: 2,
      eventIds: ['ARC_BREAKUP_S2_FINAL', 'ARC_BREAKUP_S2_LAST_SHOW'],
    },
  ],
  currentStage: 0,
};

export const bandBreakupArcEvents: GameEvent[] = [
  // Stage 0: Building tension
  {
    id: 'ARC_BREAKUP_S0_TENSION',
    triggerConditions: { minBandmates: 2, maxStability: 35 },
    weight: 4,
    textIntro: 'The van rides are silent now. Nobody talks after shows. The tension is suffocating.',
    choices: [
      {
        id: 'CALL_MEETING',
        label: 'Call a band meeting',
        outcomeText: 'You try to clear the air. Grievances come out. It\'s ugly, but at least it\'s honest.',
        statChanges: { stability: 5 },
      },
      {
        id: 'IGNORE_IT',
        label: 'Ignore it',
        outcomeText: 'You pretend everything is fine. It\'s not. Everyone knows it.',
        statChanges: { stability: -5 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'ARC_BREAKUP_S0_SILENT',
    triggerConditions: { minBandmates: 2, maxStability: 30 },
    weight: 4,
    textIntro: 'Your bassist and guitarist aren\'t speaking to each other. They communicate through you. It\'s exhausting.',
    choices: [
      {
        id: 'MEDIATE',
        label: 'Try to mediate',
        outcomeText: 'You sit them down. They say things they can\'t take back. But at least they\'re talking.',
        statChanges: { stability: 3, burnout: 5 },
      },
      {
        id: 'STAY_OUT',
        label: 'Stay out of it',
        outcomeText: 'Not your problem. Except it is. The band is a time bomb.',
        statChanges: { stability: -3 },
      },
    ],
    oneTime: true,
  },

  // Stage 1: Ultimatums
  {
    id: 'ARC_BREAKUP_S1_ULTIMATUM',
    triggerConditions: { minBandmates: 2, maxStability: 25 },
    weight: 5,
    textIntro: 'Your drummer corners you. "It\'s me or the guitarist. I can\'t do this anymore."',
    choices: [
      {
        id: 'CHOOSE_DRUMMER',
        label: 'Side with the drummer',
        outcomeText: 'You tell the guitarist to cool it or leave. The lines are drawn.',
        statChanges: { stability: -5 },
        flagsSet: ['sidedWithDrummer'],
      },
      {
        id: 'CHOOSE_GUITARIST',
        label: 'Side with the guitarist',
        outcomeText: 'You back the guitarist. The drummer looks betrayed.',
        statChanges: { stability: -5 },
        flagsSet: ['sidedWithGuitarist'],
      },
      {
        id: 'REFUSE_TO_CHOOSE',
        label: 'Refuse to choose',
        outcomeText: '"We\'re all in this together." They both storm off. You\'re alone with your principles.',
        statChanges: { stability: -10, cred: 3 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'ARC_BREAKUP_S1_SIDES',
    triggerConditions: { minBandmates: 3, maxStability: 20 },
    weight: 4,
    textIntro: 'The band has split into factions. Rehearsals feel like peace negotiations.',
    choices: [
      {
        id: 'FIRE_SOMEONE',
        label: 'Fire the troublemaker',
        outcomeText: 'You make the hard call. One member goes. The remaining ones breathe easier.',
        statChanges: { stability: 10 },
        flagsSet: ['firedToSaveBand'],
      },
      {
        id: 'HOLD_TOGETHER',
        label: 'Try to hold it together',
        outcomeText: 'You beg, plead, promise things will get better. Everyone is running on fumes.',
        statChanges: { burnout: 10, stability: -5 },
      },
    ],
    oneTime: true,
  },

  // Stage 2: Final collapse
  {
    id: 'ARC_BREAKUP_S2_FINAL',
    triggerConditions: { minBandmates: 2, maxStability: 15 },
    weight: 5,
    textIntro: 'It happens in the dressing room. Someone says something unforgivable. The band is over.',
    choices: [
      {
        id: 'ACCEPT_END',
        label: 'Accept it\'s over',
        outcomeText: 'You shake hands and walk away. Years of work, gone. But maybe it was time.',
        statChanges: { stability: -20, cred: 5 },
        flagsSet: ['bandBrokeUp'],
      },
      {
        id: 'BEG_THEM_BACK',
        label: 'Beg them to stay',
        outcomeText: 'You break down. You apologize for everything. They stay. For now. But it\'s different.',
        statChanges: { stability: 5, cred: -5 },
      },
      {
        id: 'GO_SOLO',
        label: 'Announce you\'re going solo',
        outcomeText: 'If they won\'t work with you, you\'ll work alone. The press has a field day.',
        statChanges: { hype: 10, stability: -15 },
        flagsSet: ['wentSolo'],
      },
    ],
    oneTime: true,
  },
  {
    id: 'ARC_BREAKUP_S2_LAST_SHOW',
    triggerConditions: { minBandmates: 2, maxStability: 10 },
    weight: 4,
    textIntro: 'This is the last show. Everyone knows it. The crowd can feel it. The energy is electric and tragic.',
    choices: [
      {
        id: 'PLAY_HEARTS_OUT',
        label: 'Play your hearts out',
        outcomeText: 'You give everything. The best show you\'ve ever played. A perfect ending.',
        statChanges: { cred: 10, skill: 3, hype: 10 },
        flagsSet: ['legendaryLastShow'],
      },
      {
        id: 'PHONE_IT_IN',
        label: 'Phone it in',
        outcomeText: 'You go through the motions. The fans deserve better. You don\'t care anymore.',
        statChanges: { cred: -5, burnout: -10 },
      },
    ],
    oneTime: true,
  },
];

// =============================================================================
// All Arc Templates
// =============================================================================

export const ALL_ARCS: Arc[] = [
  ADDICTION_ARC,
  LABEL_DEAL_ARC,
  BAND_BREAKUP_ARC,
];

// All arc-specific events combined
export const ALL_ARC_EVENTS: GameEvent[] = [
  ...addictionArcEvents,
  ...labelDealArcEvents,
  ...bandBreakupArcEvents,
];
