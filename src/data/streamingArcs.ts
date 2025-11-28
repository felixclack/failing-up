/**
 * Digital Era Arc definitions - streaming and social media storylines
 *
 * Modern music industry arcs that explore the creator economy,
 * viral fame, platform dependency, and the new challenges artists face.
 */

import { Arc, GameEvent } from '@/engine/types';

// =============================================================================
// Viral One-Hit Arc
// =============================================================================
// Trigger: Song goes viral (high algoBoost, viralFlag)
// Stages: Clip blows up → label/brand swarm → meme pressure → sustain or fade

export const VIRAL_ONE_HIT_ARC: Arc = {
  id: 'ARC_VIRAL_ONE_HIT',
  name: 'The Viral Moment',
  entryConditions: {
    minAlgoBoost: 70,
    minFollowers: 50000,
  },
  stages: [
    {
      stageId: 0,
      eventIds: ['ARC_VIRAL_S0_BLOWUP', 'ARC_VIRAL_S0_OVERWHELM'],
      advanceConditions: { minFollowers: 100000 },
    },
    {
      stageId: 1,
      eventIds: ['ARC_VIRAL_S1_SWARM', 'ARC_VIRAL_S1_MEME'],
      advanceConditions: { minFollowers: 200000 },
    },
    {
      stageId: 2,
      eventIds: ['ARC_VIRAL_S2_PRESSURE', 'ARC_VIRAL_S2_IDENTITY'],
      advanceConditions: { minAlgoBoost: 50 },
    },
    {
      stageId: 3,
      eventIds: ['ARC_VIRAL_S3_SUSTAIN', 'ARC_VIRAL_S3_FADE'],
    },
  ],
  currentStage: 0,
};

export const viralOneHitArcEvents: GameEvent[] = [
  // Stage 0: The blowup
  {
    id: 'ARC_VIRAL_S0_BLOWUP',
    triggerConditions: { minAlgoBoost: 70 },
    weight: 5,
    textIntro: 'You wake up to 200,000 new followers. A clip of you performing went viral overnight. Your phone won\'t stop buzzing.',
    choices: [
      {
        id: 'RIDE_WAVE',
        label: 'Ride the wave',
        outcomeText: 'You post constantly, reply to everyone, make follow-up content. The algorithm loves you right now.',
        statChanges: { followers: 50000, algoBoost: 10, burnout: 10 },
        flagsSet: ['viralMoment'],
      },
      {
        id: 'STAY_CALM',
        label: 'Stay calm and strategic',
        outcomeText: 'You post a polished follow-up video directing people to your music. Quality over quantity.',
        statChanges: { followers: 20000, coreFans: 500, stability: 3 },
        flagsSet: ['viralMoment'],
      },
    ],
    oneTime: true,
  },
  {
    id: 'ARC_VIRAL_S0_OVERWHELM',
    triggerConditions: { minAlgoBoost: 70, minFollowers: 50000 },
    weight: 4,
    textIntro: 'The comments are endless. Some love you. Some hate you. You\'re being dissected by strangers. It\'s surreal.',
    choices: [
      {
        id: 'READ_EVERYTHING',
        label: 'Read every comment',
        outcomeText: 'You get lost in the feedback loop. The validation is addictive. So is the criticism.',
        statChanges: { stability: -8, hype: 5 },
      },
      {
        id: 'TURN_OFF_NOTIFS',
        label: 'Turn off notifications',
        outcomeText: 'You step back. The internet will do its thing whether you watch or not. Healthier that way.',
        statChanges: { stability: 5, burnout: -3 },
      },
    ],
    oneTime: true,
  },

  // Stage 1: The swarm
  {
    id: 'ARC_VIRAL_S1_SWARM',
    triggerConditions: { hasFlag: 'viralMoment', minFollowers: 100000 },
    weight: 5,
    textIntro: 'Your inbox is full of label scouts, brand managers, and "opportunities." Everyone wants a piece of the viral act.',
    choices: [
      {
        id: 'TAKE_MEETINGS',
        label: 'Take every meeting',
        outcomeText: 'You talk to everyone. Labels, brands, managers. It\'s exhausting but you don\'t want to miss out.',
        statChanges: { industryGoodwill: 8, burnout: 10, money: 500 },
      },
      {
        id: 'BE_SELECTIVE',
        label: 'Be selective',
        outcomeText: 'You only talk to people who understand your music, not just your metrics. Some doors close.',
        statChanges: { industryGoodwill: 2, cred: 5, stability: 3 },
      },
      {
        id: 'GHOST_EVERYONE',
        label: 'Ghost everyone',
        outcomeText: 'You ignore all the industry vultures. The moment will pass. You\'re not ready for their world.',
        statChanges: { cred: 8, industryGoodwill: -10, stability: 5 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'ARC_VIRAL_S1_MEME',
    triggerConditions: { hasFlag: 'viralMoment', minFollowers: 80000 },
    weight: 4,
    textIntro: 'Your face is a meme now. Edits. Remixes. Jokes. You\'re famous, but not for the reasons you wanted.',
    choices: [
      {
        id: 'LEAN_INTO_IT',
        label: 'Lean into the meme',
        outcomeText: 'You make self-aware content. If you can\'t beat them, join them. The algorithm rewards it.',
        statChanges: { hype: 15, algoBoost: 10, cred: -8 },
        flagsSet: ['becameMeme'],
      },
      {
        id: 'REDIRECT',
        label: 'Redirect to your music',
        outcomeText: 'You use every meme mention to link to your actual songs. Some converts stick around.',
        statChanges: { coreFans: 300, cred: 3 },
      },
      {
        id: 'IGNORE_MEMES',
        label: 'Ignore it completely',
        outcomeText: 'You refuse to engage with meme culture. The serious music press notices and respects it.',
        statChanges: { cred: 5, algoBoost: -5 },
      },
    ],
    oneTime: true,
  },

  // Stage 2: The pressure
  {
    id: 'ARC_VIRAL_S2_PRESSURE',
    triggerConditions: { hasFlag: 'viralMoment', minFollowers: 150000 },
    weight: 5,
    textIntro: 'Everyone wants you to recreate the viral moment. Same sound, same vibe, same formula. "Give them what they want."',
    choices: [
      {
        id: 'RECREATE_HIT',
        label: 'Try to recreate the hit',
        outcomeText: 'You make something similar. It does okay. Not viral. You feel like a cover band of yourself.',
        statChanges: { hype: 5, cred: -10, stability: -5 },
        flagsSet: ['chasedViral'],
      },
      {
        id: 'MAKE_SOMETHING_NEW',
        label: 'Make something different',
        outcomeText: 'You release something true to yourself. Half the audience leaves. The ones who stay are real.',
        statChanges: { coreFans: 200, casualListeners: -5000, cred: 8, stability: 5 },
      },
      {
        id: 'TAKE_TIME',
        label: 'Take time to figure it out',
        outcomeText: 'You go quiet for a while. The algorithm forgets you. But you remember who you are.',
        statChanges: { algoBoost: -20, stability: 10, burnout: -10 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'ARC_VIRAL_S2_IDENTITY',
    triggerConditions: { hasFlag: 'viralMoment', minFollowers: 200000 },
    weight: 4,
    textIntro: 'You don\'t recognize yourself in the comments anymore. They\'ve built an image of you that isn\'t you.',
    choices: [
      {
        id: 'PLAY_THE_PART',
        label: 'Play the part they want',
        outcomeText: 'You become the character they created. It\'s easier than fighting it. Is this even you anymore?',
        statChanges: { hype: 10, stability: -15, cred: -5 },
        flagsSet: ['lostIdentity'],
      },
      {
        id: 'BREAK_THE_MASK',
        label: 'Break the mask publicly',
        outcomeText: 'You post something raw and real. "This isn\'t me." Some people hate it. Some people finally see you.',
        statChanges: { followers: -30000, coreFans: 500, stability: 10, cred: 10 },
      },
    ],
    oneTime: true,
  },

  // Stage 3: Sustain or fade
  {
    id: 'ARC_VIRAL_S3_SUSTAIN',
    triggerConditions: { hasFlag: 'viralMoment', minAlgoBoost: 50, minCoreFans: 1000 },
    weight: 5,
    textIntro: 'Months later, you\'re still here. The viral moment became a career. You built something real from the chaos.',
    choices: [
      {
        id: 'BUILD_FOUNDATION',
        label: 'Build a real foundation',
        outcomeText: 'You invest in your craft, your community, your mental health. The numbers don\'t matter like they used to.',
        statChanges: { stability: 15, skill: 5, coreFans: 500 },
        flagsSet: ['viralSurvivor', 'builtFoundation'],
      },
      {
        id: 'KEEP_PUSHING',
        label: 'Keep pushing for more',
        outcomeText: 'You chase the next viral moment. The algorithm is fickle. But maybe lightning strikes twice.',
        statChanges: { algoBoost: 10, burnout: 10, hype: 10 },
        flagsSet: ['viralSurvivor'],
      },
    ],
    oneTime: true,
  },
  {
    id: 'ARC_VIRAL_S3_FADE',
    triggerConditions: { hasFlag: 'viralMoment', maxAlgoBoost: 30 },
    weight: 5,
    textIntro: 'The algorithm moved on. Your followers are ghosts. The viral moment feels like a fever dream now.',
    choices: [
      {
        id: 'START_OVER',
        label: 'Start building again',
        outcomeText: 'You go back to basics. Small shows, real fans, actual music. It\'s humbling. It\'s honest.',
        statChanges: { coreFans: 100, stability: 10, cred: 5 },
        flagsSet: ['rebuilding'],
      },
      {
        id: 'CHASE_NOSTALGIA',
        label: 'Try to recapture the moment',
        outcomeText: 'You keep posting about "remember when." The algorithm punishes nostalgia. It hurts.',
        statChanges: { stability: -10, algoBoost: -10, burnout: 5 },
      },
      {
        id: 'ACCEPT_IT',
        label: 'Accept the new normal',
        outcomeText: 'You had a moment. Most people never get that. Time to figure out what comes next.',
        statChanges: { stability: 15, burnout: -5 },
        flagsSet: ['acceptedFade'],
      },
    ],
    oneTime: true,
  },
];

// =============================================================================
// Cancel/Backlash Arc
// =============================================================================
// Trigger: Something controversial surfaces
// Stages: Controversy breaks → response choice → fallout → recovery or exile

export const CANCEL_BACKLASH_ARC: Arc = {
  id: 'ARC_CANCEL',
  name: 'The Reckoning',
  entryConditions: {
    minFollowers: 30000,
    minHype: 40,
  },
  stages: [
    {
      stageId: 0,
      eventIds: ['ARC_CANCEL_S0_SURFACE', 'ARC_CANCEL_S0_SPIRAL'],
      advanceConditions: { maxStability: 40 },
    },
    {
      stageId: 1,
      eventIds: ['ARC_CANCEL_S1_RESPONSE', 'ARC_CANCEL_S1_ESCALATE'],
      advanceConditions: { maxStability: 30 },
    },
    {
      stageId: 2,
      eventIds: ['ARC_CANCEL_S2_FALLOUT', 'ARC_CANCEL_S2_ALLIES'],
    },
    {
      stageId: 3,
      eventIds: ['ARC_CANCEL_S3_RECOVERY', 'ARC_CANCEL_S3_EXILE'],
    },
  ],
  currentStage: 0,
};

export const cancelBacklashArcEvents: GameEvent[] = [
  // Stage 0: Something surfaces
  {
    id: 'ARC_CANCEL_S0_SURFACE',
    triggerConditions: { minFollowers: 30000, minHype: 40 },
    weight: 3, // Lower weight - this is a significant event
    textIntro: 'Someone dug up an old interview. Taken out of context, it looks bad. Really bad. The screenshots are spreading.',
    choices: [
      {
        id: 'QUICK_APOLOGY',
        label: 'Post a quick apology',
        outcomeText: 'You apologize immediately. Some accept it. Others say it\'s not enough. The discourse continues.',
        statChanges: { stability: -5, hype: -10 },
        flagsSet: ['controversySurfaced', 'apologizedQuickly'],
      },
      {
        id: 'EXPLAIN_CONTEXT',
        label: 'Try to explain the context',
        outcomeText: 'You write a thread explaining what you actually meant. Some listen. Most have already decided.',
        statChanges: { stability: -8, cred: -3 },
        flagsSet: ['controversySurfaced'],
      },
      {
        id: 'STAY_SILENT',
        label: 'Stay silent and wait',
        outcomeText: 'You don\'t respond. The silence is interpreted in the worst way. But you\'re not adding fuel.',
        statChanges: { stability: -3, hype: -15 },
        flagsSet: ['controversySurfaced', 'stayedSilent'],
      },
    ],
    oneTime: true,
  },
  {
    id: 'ARC_CANCEL_S0_SPIRAL',
    triggerConditions: { hasFlag: 'controversySurfaced' },
    weight: 4,
    textIntro: 'It\'s worse than you thought. People are digging through everything you\'ve ever posted. Finding more ammunition.',
    choices: [
      {
        id: 'DELETE_HISTORY',
        label: 'Delete old posts',
        outcomeText: 'You panic-delete years of content. Someone already archived everything. Now you look guilty.',
        statChanges: { stability: -10, cred: -10 },
        flagsSet: ['panicDeleted'],
      },
      {
        id: 'FACE_IT',
        label: 'Face it head-on',
        outcomeText: 'You acknowledge your past. Growth is messy. Not everyone believes you\'ve changed.',
        statChanges: { stability: -5, cred: 3 },
      },
    ],
    oneTime: true,
  },

  // Stage 1: The response
  {
    id: 'ARC_CANCEL_S1_RESPONSE',
    triggerConditions: { hasFlag: 'controversySurfaced', maxStability: 40 },
    weight: 5,
    textIntro: 'Your team wants you to post a Notes App apology. The template is ready. Is this the move?',
    choices: [
      {
        id: 'NOTES_APOLOGY',
        label: 'Post the Notes App apology',
        outcomeText: 'You post the screenshot. It reads like every other apology. Mocked as insincere by some.',
        statChanges: { stability: -3, cred: -5, industryGoodwill: 3 },
      },
      {
        id: 'VIDEO_APOLOGY',
        label: 'Record a video',
        outcomeText: 'You look into the camera and speak from the heart. Vulnerable. Real. Some people see it.',
        statChanges: { stability: 5, cred: 5, hype: -5 },
      },
      {
        id: 'DOUBLE_DOWN',
        label: 'Double down',
        outcomeText: 'You refuse to apologize for something taken out of context. Bold. Controversial. Polarizing.',
        statChanges: { cred: -10, hype: 10, coreFans: -200 },
        flagsSet: ['doubledDown'],
      },
    ],
    oneTime: true,
  },
  {
    id: 'ARC_CANCEL_S1_ESCALATE',
    triggerConditions: { hasFlag: 'doubledDown' }, // doubledDown implies controversySurfaced
    weight: 4,
    textIntro: 'Someone big amplified the controversy. Now mainstream media is picking it up. This is national news.',
    choices: [
      {
        id: 'GO_DARK',
        label: 'Go dark completely',
        outcomeText: 'You delete social media and disappear. The story loses its protagonist. It eventually fades.',
        statChanges: { followers: -50000, stability: 5, burnout: -10 },
        flagsSet: ['wentDark'],
      },
      {
        id: 'DO_INTERVIEW',
        label: 'Do a tell-all interview',
        outcomeText: 'You sit down with a journalist. Your side of the story, finally. It\'s either redemption or rope.',
        statChanges: { hype: 20, stability: -10 },
      },
    ],
    oneTime: true,
  },

  // Stage 2: The fallout
  {
    id: 'ARC_CANCEL_S2_FALLOUT',
    triggerConditions: { hasFlag: 'controversySurfaced', maxStability: 30 },
    weight: 5,
    textIntro: 'Shows are getting canceled. Brands are cutting ties. Your label is "reassessing the relationship."',
    choices: [
      {
        id: 'FIGHT_BACK',
        label: 'Fight the cancellations',
        outcomeText: 'You threaten legal action. Some venues back down. Others dig in. It\'s war.',
        statChanges: { money: -2000, industryGoodwill: -15, hype: 5 },
      },
      {
        id: 'ACCEPT_CONSEQUENCES',
        label: 'Accept the consequences',
        outcomeText: 'You don\'t fight. The financial hit is brutal. But you don\'t make it worse.',
        statChanges: { money: -3000, stability: 5, cred: 3 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'ARC_CANCEL_S2_ALLIES',
    triggerConditions: { hasFlag: 'controversySurfaced', minCred: 30 },
    weight: 4,
    textIntro: 'Some artists are defending you publicly. Others are distancing themselves. Lines are being drawn.',
    choices: [
      {
        id: 'THANK_DEFENDERS',
        label: 'Thank your defenders',
        outcomeText: 'You publicly thank those who stood by you. They get dragged too. But loyalty means something.',
        statChanges: { stability: 5 },
        flagsSet: ['hasAllies'],
      },
      {
        id: 'TELL_THEM_TO_STAY_OUT',
        label: 'Tell them to stay out of it',
        outcomeText: 'You don\'t want to drag others into your mess. Noble. Lonely.',
        statChanges: { stability: -3, cred: 5 },
      },
    ],
    oneTime: true,
  },

  // Stage 3: Recovery or exile
  {
    id: 'ARC_CANCEL_S3_RECOVERY',
    triggerConditions: { hasFlag: 'controversySurfaced', minStability: 20, minCoreFans: 500 },
    weight: 5,
    textIntro: 'Months later. The mob moved on to someone else. You\'re still here. Damaged, but alive.',
    choices: [
      {
        id: 'SLOW_REBUILD',
        label: 'Slowly rebuild',
        outcomeText: 'You come back quietly. Smaller shows. Genuine fans. A second chance you don\'t take for granted.',
        statChanges: { stability: 15, coreFans: 200, cred: 5 },
        flagsSet: ['cancelSurvivor', 'rebuilding'],
      },
      {
        id: 'REINVENT',
        label: 'Reinvent yourself completely',
        outcomeText: 'New sound, new look, new narrative. Some say it\'s running away. You call it evolution.',
        statChanges: { hype: 15, image: 10, cred: -5 },
        flagsSet: ['cancelSurvivor', 'reinvented'],
      },
    ],
    oneTime: true,
  },
  {
    id: 'ARC_CANCEL_S3_EXILE',
    triggerConditions: { hasFlag: 'controversySurfaced', maxStability: 15 },
    weight: 5,
    textIntro: 'It\'s been a year. Your career never recovered. The internet still brings you up as an example.',
    choices: [
      {
        id: 'LEAVE_INDUSTRY',
        label: 'Leave the music industry',
        outcomeText: 'You quit. Get a normal job. Maybe write anonymously someday. This chapter is over.',
        statChanges: { stability: 20, burnout: -20, hype: -30 },
        flagsSet: ['leftIndustry'],
      },
      {
        id: 'UNDERGROUND',
        label: 'Go underground',
        outcomeText: 'You make music under a different name. Small venues. No social media. Pure.',
        statChanges: { cred: 10, hype: -20, stability: 10 },
        flagsSet: ['wentUnderground'],
      },
      {
        id: 'KEEP_TRYING',
        label: 'Keep trying despite everything',
        outcomeText: 'You refuse to let them end your story. Every small victory is a statement. You\'re still here.',
        statChanges: { stability: -5, burnout: 10, coreFans: 50 },
        flagsSet: ['resilient'],
      },
    ],
    oneTime: true,
  },
];

// =============================================================================
// Creator Burnout Arc
// =============================================================================
// Trigger: High burnout + content creation focus
// Stages: Content treadmill → breakdown signs → crisis → recovery or collapse

export const CREATOR_BURNOUT_ARC: Arc = {
  id: 'ARC_CREATOR_BURNOUT',
  name: 'The Content Trap',
  entryConditions: {
    minBurnout: 50,
    minFollowers: 20000,
  },
  stages: [
    {
      stageId: 0,
      eventIds: ['ARC_BURNOUT_S0_GRIND', 'ARC_BURNOUT_S0_METRICS'],
      advanceConditions: { minBurnout: 65 },
    },
    {
      stageId: 1,
      eventIds: ['ARC_BURNOUT_S1_SIGNS', 'ARC_BURNOUT_S1_EMPTY'],
      advanceConditions: { minBurnout: 80 },
    },
    {
      stageId: 2,
      eventIds: ['ARC_BURNOUT_S2_CRISIS', 'ARC_BURNOUT_S2_INTERVENTION'],
    },
    {
      stageId: 3,
      eventIds: ['ARC_BURNOUT_S3_RECOVERY', 'ARC_BURNOUT_S3_COLLAPSE'],
    },
  ],
  currentStage: 0,
};

export const creatorBurnoutArcEvents: GameEvent[] = [
  // Stage 0: The content treadmill
  {
    id: 'ARC_BURNOUT_S0_GRIND',
    triggerConditions: { minBurnout: 50, minFollowers: 20000 },
    weight: 4,
    textIntro: 'Post daily or die. The algorithm punishes gaps. You haven\'t taken a day off in months. The content never stops.',
    choices: [
      {
        id: 'KEEP_GRINDING',
        label: 'Keep grinding',
        outcomeText: 'You push through the exhaustion. The numbers stay up. Your soul feels emptier each day.',
        statChanges: { burnout: 10, algoBoost: 5, stability: -5 },
        flagsSet: ['contentTreadmill'],
      },
      {
        id: 'BATCH_CREATE',
        label: 'Try batch creating',
        outcomeText: 'You spend one brutal day filming a week of content. It helps. A little.',
        statChanges: { burnout: 3, stability: 2 },
        flagsSet: ['contentTreadmill'],
      },
    ],
    oneTime: true,
  },
  {
    id: 'ARC_BURNOUT_S0_METRICS',
    triggerConditions: { minBurnout: 55, minFollowers: 30000 },
    weight: 4,
    textIntro: 'You check your stats every hour. Every minute sometimes. A bad post ruins your whole day. Your self-worth is a number.',
    choices: [
      {
        id: 'OBSESS_MORE',
        label: 'Optimize harder',
        outcomeText: 'You study the algorithm. Post times, hooks, trends. You become a machine. An efficient, empty machine.',
        statChanges: { algoBoost: 8, stability: -10, skill: -2 },
      },
      {
        id: 'SET_BOUNDARIES',
        label: 'Set checking boundaries',
        outcomeText: 'You limit yourself to checking once a day. The anxiety doesn\'t disappear, but it\'s manageable.',
        statChanges: { stability: 5, burnout: -3 },
      },
    ],
    oneTime: true,
  },

  // Stage 1: The warning signs
  {
    id: 'ARC_BURNOUT_S1_SIGNS',
    triggerConditions: { hasFlag: 'contentTreadmill', minBurnout: 65 },
    weight: 5,
    textIntro: 'You can\'t remember the last time you made music for fun. Everything is content. Everything is performance.',
    choices: [
      {
        id: 'IGNORE_SIGNS',
        label: 'Ignore the signs',
        outcomeText: 'You\'re fine. Everyone feels like this. This is just what success looks like now. Right?',
        statChanges: { burnout: 10, stability: -8 },
      },
      {
        id: 'ACKNOWLEDGE',
        label: 'Acknowledge something\'s wrong',
        outcomeText: 'You admit to yourself that this isn\'t sustainable. The first step. But you don\'t know the next one.',
        statChanges: { stability: 3 },
        flagsSet: ['acknowledgedBurnout'],
      },
    ],
    oneTime: true,
  },
  {
    id: 'ARC_BURNOUT_S1_EMPTY',
    triggerConditions: { hasFlag: 'contentTreadmill', minBurnout: 70 },
    weight: 4,
    textIntro: 'You sit down to write. Nothing comes. The well is dry. You\'ve been giving so much that there\'s nothing left.',
    choices: [
      {
        id: 'FORCE_IT',
        label: 'Force it anyway',
        outcomeText: 'You push out something generic. It performs fine. It means nothing. You feel like a fraud.',
        statChanges: { cred: -5, burnout: 8, hype: 3 },
      },
      {
        id: 'BE_HONEST',
        label: 'Post about the block',
        outcomeText: 'You share your struggle. The vulnerability resonates. Your audience is human too. Who knew?',
        statChanges: { coreFans: 100, stability: 5, burnout: -5 },
      },
    ],
    oneTime: true,
  },

  // Stage 2: The crisis
  {
    id: 'ARC_BURNOUT_S2_CRISIS',
    triggerConditions: { hasFlag: 'contentTreadmill', minBurnout: 80 },
    weight: 5,
    textIntro: 'You\'re crying in the bathroom before hitting record on another video. The smile you fake doesn\'t reach your eyes.',
    choices: [
      {
        id: 'PUSH_THROUGH',
        label: 'Push through one more time',
        outcomeText: 'You wipe your tears and perform happiness. The video does well. You feel nothing.',
        statChanges: { burnout: 15, stability: -15, health: -5 },
      },
      {
        id: 'CANCEL_TODAY',
        label: 'Cancel everything today',
        outcomeText: 'You turn off your phone and stare at the ceiling. The world doesn\'t end. The algorithm dips. You don\'t die.',
        statChanges: { algoBoost: -10, stability: 10, burnout: -5 },
        flagsSet: ['tookBreak'],
      },
    ],
    oneTime: true,
  },
  {
    id: 'ARC_BURNOUT_S2_INTERVENTION',
    triggerConditions: { hasFlag: 'contentTreadmill', minBurnout: 80, maxHealth: 50 },
    weight: 4,
    textIntro: 'Someone close to you sits you down. "You\'re not okay. Everyone can see it except you."',
    choices: [
      {
        id: 'LISTEN',
        label: 'Listen to them',
        outcomeText: 'You hear what they\'re saying. You\'ve been so focused on the screen you forgot there are real people who care.',
        statChanges: { stability: 10, burnout: -10 },
        flagsSet: ['hadIntervention'],
      },
      {
        id: 'DEFLECT',
        label: 'Deflect and minimize',
        outcomeText: '"I\'m fine, you don\'t understand the industry." They leave, hurt. You\'re alone with your metrics.',
        statChanges: { stability: -10 },
      },
    ],
    oneTime: true,
  },

  // Stage 3: Recovery or collapse
  {
    id: 'ARC_BURNOUT_S3_RECOVERY',
    triggerConditions: { hasFlag: 'tookBreak' },
    weight: 5,
    textIntro: 'You\'ve been offline for a month. The panic faded. You picked up your guitar yesterday and played for no reason.',
    choices: [
      {
        id: 'RETURN_DIFFERENTLY',
        label: 'Return with new boundaries',
        outcomeText: 'You come back, but different. Scheduled posts. Real breaks. Music first, content second.',
        statChanges: { burnout: -30, stability: 20, algoBoost: -15, coreFans: 200 },
        flagsSet: ['burnoutRecovery', 'healthyBoundaries'],
      },
      {
        id: 'STAY_OFFLINE',
        label: 'Stay mostly offline',
        outcomeText: 'You keep social media minimal. Release music when you have music. Let the algorithm go.',
        statChanges: { burnout: -40, stability: 25, followers: -30000, cred: 10 },
        flagsSet: ['burnoutRecovery', 'wentMinimal'],
      },
    ],
    oneTime: true,
  },
  {
    id: 'ARC_BURNOUT_S3_COLLAPSE',
    triggerConditions: { hasFlag: 'contentTreadmill', minBurnout: 90, maxStability: 20 },
    weight: 5,
    textIntro: 'You can\'t do it anymore. Not one more video. Not one more song. You\'re done. The machine finally broke.',
    choices: [
      {
        id: 'COMPLETE_BREAK',
        label: 'Take a complete break',
        outcomeText: 'You announce an indefinite hiatus. The responses are mostly supportive. You finally sleep.',
        statChanges: { burnout: -20, stability: 15, hype: -25, health: 10 },
        flagsSet: ['onHiatus'],
      },
      {
        id: 'CRASH_PUBLIC',
        label: 'Crash publicly',
        outcomeText: 'You have a breakdown on camera. The internet watches. Some mock. Some care. It\'s all content in the end.',
        statChanges: { stability: -20, hype: 20, burnout: -10 },
        flagsSet: ['publicBreakdown'],
      },
    ],
    oneTime: true,
  },
];

// =============================================================================
// DIY / Patron Arc
// =============================================================================
// Trigger: Building direct relationship with fans
// Stages: First patron → growing community → sustainability → independence

export const DIY_PATRON_ARC: Arc = {
  id: 'ARC_DIY_PATRON',
  name: 'The Direct Path',
  entryConditions: {
    minCoreFans: 500,
    hasLabelDeal: false,
  },
  stages: [
    {
      stageId: 0,
      eventIds: ['ARC_DIY_S0_FIRST', 'ARC_DIY_S0_PLATFORM'],
      advanceConditions: { minCoreFans: 1000 },
    },
    {
      stageId: 1,
      eventIds: ['ARC_DIY_S1_GROWING', 'ARC_DIY_S1_COMMUNITY'],
      advanceConditions: { minCoreFans: 2000 },
    },
    {
      stageId: 2,
      eventIds: ['ARC_DIY_S2_SUSTAINABLE', 'ARC_DIY_S2_TEMPTATION'],
    },
    {
      stageId: 3,
      eventIds: ['ARC_DIY_S3_INDEPENDENCE', 'ARC_DIY_S3_GROWTH'],
    },
  ],
  currentStage: 0,
};

export const diyPatronArcEvents: GameEvent[] = [
  // Stage 0: First steps
  {
    id: 'ARC_DIY_S0_FIRST',
    triggerConditions: { minCoreFans: 500, hasLabelDeal: false },
    weight: 4,
    textIntro: 'A fan messages you: "I\'d pay monthly to support what you do. Have you thought about a membership platform?"',
    choices: [
      {
        id: 'START_MEMBERSHIP',
        label: 'Start a membership',
        outcomeText: 'You set up a page. Five people join the first week. It\'s not much, but it\'s direct. It\'s yours.',
        statChanges: { money: 100, coreFans: 20 },
        flagsSet: ['hasMembership'],
      },
      {
        id: 'NOT_READY',
        label: 'Say you\'re not ready yet',
        outcomeText: 'You thank them but decline. The idea stays in your mind though. Direct support. No middlemen.',
        statChanges: { stability: 2 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'ARC_DIY_S0_PLATFORM',
    triggerConditions: { hasFlag: 'hasMembership' },
    weight: 4,
    textIntro: 'The membership platform takes 10%. You\'re wondering if you should build your own system.',
    choices: [
      {
        id: 'STAY_WITH_PLATFORM',
        label: 'Stay with the platform',
        outcomeText: 'The convenience is worth the cut. You focus on making music, not building tech.',
        statChanges: { stability: 3 },
      },
      {
        id: 'BUILD_OWN',
        label: 'Build your own system',
        outcomeText: 'You spend months building a direct-to-fan infrastructure. It\'s work, but it\'s yours.',
        statChanges: { money: -500, burnout: 10, cred: 5 },
        flagsSet: ['ownPlatform'],
      },
    ],
    oneTime: true,
  },

  // Stage 1: Growing community
  {
    id: 'ARC_DIY_S1_GROWING',
    triggerConditions: { hasFlag: 'hasMembership', minCoreFans: 1000 },
    weight: 5,
    textIntro: 'Your membership is growing. Hundred people paying monthly to support your music. No label needed.',
    choices: [
      {
        id: 'REWARD_LOYALTY',
        label: 'Reward their loyalty',
        outcomeText: 'You offer exclusive content, early access, personal notes. They feel seen. They bring friends.',
        statChanges: { coreFans: 200, money: 300, burnout: 5 },
      },
      {
        id: 'KEEP_IT_SIMPLE',
        label: 'Keep it simple',
        outcomeText: 'You don\'t overcomplicate it. Music plus occasional updates. Less work, sustainable.',
        statChanges: { coreFans: 50, money: 150, stability: 3 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'ARC_DIY_S1_COMMUNITY',
    triggerConditions: { hasFlag: 'hasMembership', minCoreFans: 1500 },
    weight: 4,
    textIntro: 'Your members are forming a community. They\'re talking to each other, not just to you. Something special is growing.',
    choices: [
      {
        id: 'NURTURE_COMMUNITY',
        label: 'Nurture the community',
        outcomeText: 'You create spaces for them to connect. The community becomes self-sustaining. Bigger than just you.',
        statChanges: { coreFans: 300, stability: 5 },
        flagsSet: ['strongCommunity'],
      },
      {
        id: 'STAY_DISTANT',
        label: 'Stay artist-focused',
        outcomeText: 'You keep the relationship artist-to-fan. Less community building, more music making.',
        statChanges: { skill: 3, cred: 2 },
      },
    ],
    oneTime: true,
  },

  // Stage 2: Sustainability
  {
    id: 'ARC_DIY_S2_SUSTAINABLE',
    triggerConditions: { hasFlag: 'hasMembership', minCoreFans: 2000 },
    weight: 5,
    textIntro: 'The math works. Your direct supporters cover your living costs. You can make music without compromise.',
    choices: [
      {
        id: 'STAY_SMALL',
        label: 'Stay at this size',
        outcomeText: 'This is enough. You don\'t need to be massive. You have your thousand true fans.',
        statChanges: { stability: 15, cred: 8, burnout: -10 },
        flagsSet: ['sustainableDIY'],
      },
      {
        id: 'GROW_BIGGER',
        label: 'Push for growth',
        outcomeText: 'You want more. Marketing campaigns, collaborations, expansion. The DIY ethos meets ambition.',
        statChanges: { followers: 10000, burnout: 10, money: 500 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'ARC_DIY_S2_TEMPTATION',
    triggerConditions: { hasFlag: 'hasMembership', minCoreFans: 2500, minIndustryGoodwill: 30 },
    weight: 4,
    textIntro: 'A label reaches out. "We love what you\'ve built. Imagine it with our resources behind it."',
    choices: [
      {
        id: 'HEAR_THEM_OUT',
        label: 'Hear them out',
        outcomeText: 'You take the meeting. The offer is tempting. But would you lose what made this special?',
        statChanges: { industryGoodwill: 5 },
        flagsSet: ['consideringLabel'],
      },
      {
        id: 'DECLINE_POLITELY',
        label: 'Decline politely',
        outcomeText: '"Thanks, but I\'ve built something different here." They\'ll be back. They always come back.',
        statChanges: { cred: 10, stability: 5 },
      },
      {
        id: 'TELL_THEM_OFF',
        label: 'Tell them exactly why you\'re DIY',
        outcomeText: 'You publicly explain why you chose independence. Your community cheers. The industry takes note.',
        statChanges: { cred: 15, industryGoodwill: -10, coreFans: 200 },
        flagsSet: ['diyManifesto'],
      },
    ],
    oneTime: true,
  },

  // Stage 3: Full independence
  {
    id: 'ARC_DIY_S3_INDEPENDENCE',
    triggerConditions: { hasFlag: 'sustainableDIY', minCoreFans: 3000 },
    weight: 5,
    textIntro: 'You\'ve done it. A sustainable career on your own terms. No labels, no algorithms, just you and your people.',
    choices: [
      {
        id: 'ENJOY_IT',
        label: 'Enjoy what you\'ve built',
        outcomeText: 'You make the music you want, when you want. Your fans fund it directly. This is freedom.',
        statChanges: { stability: 20, cred: 10, burnout: -15 },
        flagsSet: ['trulyIndependent'],
      },
      {
        id: 'HELP_OTHERS',
        label: 'Help other artists do the same',
        outcomeText: 'You share your playbook. Other artists follow your path. You become a movement, not just an artist.',
        statChanges: { cred: 15, industryGoodwill: 5, skill: 2 },
        flagsSet: ['trulyIndependent', 'diyMentor'],
      },
    ],
    oneTime: true,
  },
  {
    id: 'ARC_DIY_S3_GROWTH',
    triggerConditions: { hasFlag: 'consideringLabel', minCoreFans: 5000 }, // consideringLabel implies hasMembership
    weight: 4,
    textIntro: 'Your DIY operation has grown beyond what you can handle alone. Decisions need to be made.',
    choices: [
      {
        id: 'HIRE_TEAM',
        label: 'Hire a small team',
        outcomeText: 'You bring on people who share your values. DIY doesn\'t mean doing everything yourself.',
        statChanges: { money: -1000, burnout: -10, stability: 5 },
        flagsSet: ['diyTeam'],
      },
      {
        id: 'HYBRID_DEAL',
        label: 'Take a hybrid label deal',
        outcomeText: 'You negotiate a deal that keeps your community intact. Best of both worlds. Maybe.',
        statChanges: { money: 5000, industryGoodwill: 10, cred: -5 },
        flagsSet: ['hybridDeal'],
      },
      {
        id: 'SCALE_BACK',
        label: 'Scale back to sustainable',
        outcomeText: 'You don\'t need to grow forever. You cap membership and focus on depth over breadth.',
        statChanges: { stability: 15, burnout: -15, cred: 8 },
        flagsSet: ['cappedGrowth'],
      },
    ],
    oneTime: true,
  },
];

// =============================================================================
// Platform Dependency Arc
// =============================================================================
// Trigger: High algo reliance + algorithm changes
// Stages: Platform shift → scramble → adapt or diversify

export const PLATFORM_DEPENDENCY_ARC: Arc = {
  id: 'ARC_PLATFORM_DEPENDENCY',
  name: 'Platform Prisoner',
  entryConditions: {
    minAlgoBoost: 60,
    minFollowers: 50000,
  },
  stages: [
    {
      stageId: 0,
      eventIds: ['ARC_PLATFORM_S0_CHANGE', 'ARC_PLATFORM_S0_DECLINE'],
      advanceConditions: { maxAlgoBoost: 40 },
    },
    {
      stageId: 1,
      eventIds: ['ARC_PLATFORM_S1_SCRAMBLE', 'ARC_PLATFORM_S1_PIVOT'],
      advanceConditions: { maxAlgoBoost: 30 },
    },
    {
      stageId: 2,
      eventIds: ['ARC_PLATFORM_S2_DIVERSIFY', 'ARC_PLATFORM_S2_DOUBLE_DOWN'],
    },
  ],
  currentStage: 0,
};

export const platformDependencyArcEvents: GameEvent[] = [
  // Stage 0: The shift
  {
    id: 'ARC_PLATFORM_S0_CHANGE',
    triggerConditions: { minAlgoBoost: 60 },
    weight: 3,
    textIntro: 'The platform updated their algorithm. Your reach dropped 60% overnight. Same content, invisible now.',
    choices: [
      {
        id: 'ADAPT_QUICKLY',
        label: 'Adapt to new algorithm',
        outcomeText: 'You study the changes, adjust your content. Some reach comes back. The dance continues.',
        statChanges: { algoBoost: 15, burnout: 10, stability: -5 },
        flagsSet: ['algorithmVictim'],
      },
      {
        id: 'COMPLAIN_PUBLICLY',
        label: 'Complain publicly',
        outcomeText: 'You post about the unfairness. Other creators relate. The platform doesn\'t care.',
        statChanges: { algoBoost: -5, coreFans: 50, cred: 3 },
        flagsSet: ['algorithmVictim'],
      },
    ],
    oneTime: true,
  },
  {
    id: 'ARC_PLATFORM_S0_DECLINE',
    triggerConditions: { hasFlag: 'algorithmVictim', maxAlgoBoost: 50 },
    weight: 4,
    textIntro: 'Your engagement keeps falling. The platform is pushing different content now. You\'re yesterday\'s trend.',
    choices: [
      {
        id: 'CHASE_TRENDS',
        label: 'Chase the new trends',
        outcomeText: 'You pivot to whatever\'s working now. It feels desperate. Some of it works.',
        statChanges: { algoBoost: 10, cred: -10, stability: -5 },
      },
      {
        id: 'STAY_AUTHENTIC',
        label: 'Stay authentic',
        outcomeText: 'You keep making your content. The algorithm doesn\'t reward it. Your real fans do.',
        statChanges: { coreFans: 100, algoBoost: -10, cred: 5 },
      },
    ],
    oneTime: true,
  },

  // Stage 1: The scramble
  {
    id: 'ARC_PLATFORM_S1_SCRAMBLE',
    triggerConditions: { hasFlag: 'algorithmVictim', maxAlgoBoost: 40 },
    weight: 5,
    textIntro: 'Your income from the platform has cratered. Bills are due. The panic is real.',
    choices: [
      {
        id: 'DESPERATE_CONTENT',
        label: 'Make desperate content',
        outcomeText: 'You try everything. Clickbait, controversy, whatever works. Some of it does. You hate it.',
        statChanges: { algoBoost: 20, cred: -15, stability: -10, money: 500 },
      },
      {
        id: 'SEEK_OTHER_INCOME',
        label: 'Find other income sources',
        outcomeText: 'You diversify. Merch, live shows, teaching. The platform isn\'t everything.',
        statChanges: { money: 300, stability: 5, burnout: 5 },
        flagsSet: ['diversifiedIncome'],
      },
    ],
    oneTime: true,
  },
  {
    id: 'ARC_PLATFORM_S1_PIVOT',
    triggerConditions: { hasFlag: 'algorithmVictim', maxAlgoBoost: 35 },
    weight: 4,
    textIntro: 'A new platform is rising. Everyone\'s moving there. Start over from zero?',
    choices: [
      {
        id: 'JOIN_NEW_PLATFORM',
        label: 'Join the new platform',
        outcomeText: 'You start fresh. Early adopter advantage. Building from nothing again. Exhausting.',
        statChanges: { followers: -20000, algoBoost: 40, burnout: 10 },
        flagsSet: ['platformMigrated'],
      },
      {
        id: 'STAY_PUT',
        label: 'Stay where your audience is',
        outcomeText: 'You don\'t chase the shiny new thing. Your existing fans appreciate loyalty.',
        statChanges: { coreFans: 100, stability: 5 },
      },
      {
        id: 'DO_BOTH',
        label: 'Try to be everywhere',
        outcomeText: 'You post on everything. Stretched thin. None of it done well. The classic trap.',
        statChanges: { burnout: 20, followers: 5000, stability: -10 },
      },
    ],
    oneTime: true,
  },

  // Stage 2: Resolution
  {
    id: 'ARC_PLATFORM_S2_DIVERSIFY',
    triggerConditions: { hasFlag: 'diversifiedIncome' },
    weight: 5,
    textIntro: 'The platform matters less now. You have multiple income streams. The algorithm can\'t kill your career.',
    choices: [
      {
        id: 'KEEP_DIVERSIFIED',
        label: 'Keep building the portfolio',
        outcomeText: 'You continue building income independence. No single point of failure. Artist as small business.',
        statChanges: { stability: 15, money: 500, cred: 5 },
        flagsSet: ['platformIndependent'],
      },
      {
        id: 'FOCUS_ON_MUSIC',
        label: 'Focus purely on music',
        outcomeText: 'With financial stability, you can focus on the art again. What a concept.',
        statChanges: { skill: 5, stability: 10, burnout: -10 },
        flagsSet: ['platformIndependent'],
      },
    ],
    oneTime: true,
  },
  {
    id: 'ARC_PLATFORM_S2_DOUBLE_DOWN',
    triggerConditions: { hasFlag: 'platformMigrated' }, // platformMigrated implies algorithmVictim
    weight: 4,
    textIntro: 'The new platform is blowing up. You\'re early. This could be a fresh start.',
    choices: [
      {
        id: 'GO_ALL_IN',
        label: 'Go all in on the new platform',
        outcomeText: 'You bet everything on the new platform. History doesn\'t always repeat. Right?',
        statChanges: { algoBoost: 30, followers: 30000, stability: -10 },
        flagsSet: ['platformDependent'],
      },
      {
        id: 'LEARN_LESSON',
        label: 'Learn from past mistakes',
        outcomeText: 'You build on the new platform but don\'t depend on it. Fool me twice.',
        statChanges: { algoBoost: 15, stability: 10, cred: 5 },
        flagsSet: ['lessonsLearned'],
      },
    ],
    oneTime: true,
  },
];

// =============================================================================
// All Digital Era Arcs
// =============================================================================

export const ALL_STREAMING_ARCS: Arc[] = [
  VIRAL_ONE_HIT_ARC,
  CANCEL_BACKLASH_ARC,
  CREATOR_BURNOUT_ARC,
  DIY_PATRON_ARC,
  PLATFORM_DEPENDENCY_ARC,
];

// All streaming/digital era arc events combined
export const ALL_STREAMING_ARC_EVENTS: GameEvent[] = [
  ...viralOneHitArcEvents,
  ...cancelBacklashArcEvents,
  ...creatorBurnoutArcEvents,
  ...diyPatronArcEvents,
  ...platformDependencyArcEvents,
];
