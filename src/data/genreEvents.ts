/**
 * Genre-specific events for Failing Up
 * Events that only trigger for players who chose a specific music style
 */

import { GameEvent } from '@/engine/types';

// =============================================================================
// Punk Events
// =============================================================================

const punkEvents: GameEvent[] = [
  {
    id: 'EV_PUNK_DIY_VENUE',
    triggerConditions: {
      preferredStyle: 'punk',
      minWeek: 10,
    },
    weight: 3,
    textIntro: 'A squat venue downtown is looking for bands to play an all-ages show. No money, but the scene will be there.',
    choices: [
      {
        id: 'PLAY_THE_SQUAT',
        label: 'Play the show',
        outcomeText: 'Fifty kids packed into a basement. No PA, no stage, just pure energy. This is what punk is about.',
        statChanges: { cred: 8, coreFans: 30, hype: 5 },
      },
      {
        id: 'NEED_TO_GET_PAID',
        label: 'Pass - need to get paid',
        outcomeText: 'You skip it. The show becomes legendary. Everyone asks where you were.',
        statChanges: { cred: -3 },
      },
    ],
  },
  {
    id: 'EV_PUNK_SELLOUT_ACCUSATION',
    triggerConditions: {
      preferredStyle: 'punk',
      minFans: 2000,
      minHype: 40,
    },
    weight: 3,
    textIntro: 'Someone at the show calls you a sellout. Says you\'ve gone soft. The crowd\'s watching to see how you respond.',
    choices: [
      {
        id: 'CONFRONT_THEM',
        label: 'Get in their face',
        outcomeText: 'You tell them to start their own band if they don\'t like it. The crowd cheers. Punk\'s about doing, not talking.',
        statChanges: { cred: 5, hype: 3, coreFans: 20 },
      },
      {
        id: 'IGNORE_HATER',
        label: 'Ignore them and play harder',
        outcomeText: 'Actions speak louder. You launch into your fastest song. They shut up.',
        statChanges: { cred: 3, skill: 1 },
      },
      {
        id: 'AGREE_WITH_THEM',
        label: 'Admit they might be right',
        outcomeText: 'Maybe you have gotten comfortable. Time to remember why you started.',
        statChanges: { cred: 8, stability: -3, hype: -2 },
      },
    ],
  },
  {
    id: 'EV_PUNK_ZINE_FEATURE',
    triggerConditions: {
      preferredStyle: 'punk',
      minFans: 500,
    },
    weight: 2,
    textIntro: 'A kid with a photocopied zine wants to interview you. Circulation: maybe 200 copies.',
    choices: [
      {
        id: 'DO_THE_ZINE',
        label: 'Do the interview',
        outcomeText: 'You talk for two hours about everything. When the zine comes out, it\'s got more heart than any magazine feature.',
        statChanges: { cred: 5, coreFans: 15 },
      },
      {
        id: 'TOO_SMALL',
        label: 'Too small-time',
        outcomeText: 'You pass. The zine goes on to become legendary. Oops.',
        statChanges: { cred: -2 },
      },
    ],
  },
  {
    id: 'EV_PUNK_BENEFIT_SHOW',
    triggerConditions: {
      preferredStyle: 'punk',
      minFans: 1000,
    },
    weight: 3,
    textIntro: 'A local activist group asks you to play a benefit show. The cause is good. The money goes to them, not you.',
    choices: [
      {
        id: 'PLAY_BENEFIT',
        label: 'Play for the cause',
        outcomeText: 'Punk\'s always been political. You play your heart out for something that matters.',
        statChanges: { cred: 10, coreFans: 40, stability: 3 },
      },
      {
        id: 'CANT_AFFORD_FREE',
        label: 'Can\'t afford to play free',
        outcomeText: 'You need to eat too. Some understand. Some don\'t.',
        statChanges: { cred: -5, money: 0 },
      },
    ],
  },
  {
    id: 'EV_PUNK_POLICE_SHUTDOWN',
    triggerConditions: {
      preferredStyle: 'punk',
    },
    weight: 2,
    // Gigs now automatic - requiredAction removed
    textIntro: 'Cops show up to shut down the show. Noise complaints. The crowd\'s getting restless.',
    choices: [
      {
        id: 'ONE_MORE_SONG',
        label: 'Play one more song fast',
        outcomeText: 'You blast through your fastest track before they can pull the plug. Legendary.',
        statChanges: { cred: 8, hype: 5, coreFans: 25 },
      },
      {
        id: 'COMPLY_QUIETLY',
        label: 'Pack up peacefully',
        outcomeText: 'Live to play another day. The venue owner thanks you for not making it worse.',
        statChanges: { industryGoodwill: 3, stability: 2 },
      },
      {
        id: 'ACOUSTIC_OUTSIDE',
        label: 'Continue acoustic in the parking lot',
        outcomeText: 'Can\'t stop the music. The real fans follow you outside and you finish the set unplugged.',
        statChanges: { cred: 12, coreFans: 35, hype: 3 },
      },
    ],
  },
  {
    id: 'EV_PUNK_RECORD_LABEL_OFFER',
    triggerConditions: {
      preferredStyle: 'punk',
      minFans: 3000,
      minCred: 40,
    },
    weight: 2,
    textIntro: 'A major label scout is at the show. They want to talk business. The scene is watching.',
    choices: [
      {
        id: 'HEAR_THEM_OUT',
        label: 'Take the meeting',
        outcomeText: 'You listen to their pitch. Nothing signed yet, but doors are opening. Some call it progress, others betrayal.',
        statChanges: { industryGoodwill: 10, cred: -8, money: 500 },
      },
      {
        id: 'STAY_DIY',
        label: 'Tell them to get lost',
        outcomeText: 'You don\'t need their money or their rules. The scene respects the hell out of you.',
        statChanges: { cred: 15, coreFans: 50 },
      },
    ],
  },
  {
    id: 'EV_PUNK_HOUSE_SHOW',
    triggerConditions: {
      preferredStyle: 'punk',
    },
    weight: 3,
    textIntro: 'Someone\'s throwing a house show. Cramped living room, BYOB, starts at midnight.',
    choices: [
      {
        id: 'PLAY_HOUSE_SHOW',
        label: 'Play the house show',
        outcomeText: 'Twenty people in a living room, sweating and screaming along. This is where it all starts.',
        statChanges: { coreFans: 20, cred: 5, burnout: 2 },
      },
      {
        id: 'NEED_REAL_VENUE',
        label: 'Hold out for a real venue',
        outcomeText: 'You\'re past the house show phase. Right? ...Right?',
        statChanges: { cred: -3 },
      },
    ],
  },
  {
    id: 'EV_PUNK_COVER_CONTROVERSY',
    triggerConditions: {
      preferredStyle: 'punk',
      minFans: 2000,
    },
    weight: 2,
    textIntro: 'You covered a pop song ironically. Some fans are losing their minds about it. Others think it\'s genius.',
    choices: [
      {
        id: 'DOUBLE_DOWN',
        label: 'Release it officially',
        outcomeText: 'You put it out. Half the scene hates you. Half loves you. Everyone\'s talking.',
        statChanges: { hype: 10, cred: -5, followers: 300, casualListeners: 200 },
      },
      {
        id: 'IT_WAS_A_JOKE',
        label: 'Bury it - it was just a joke',
        outcomeText: 'You pretend it never happened. The bootlegs still circulate.',
        statChanges: { stability: 2 },
      },
    ],
  },
];

// =============================================================================
// Metal Events
// =============================================================================

const metalEvents: GameEvent[] = [
  {
    id: 'EV_METAL_GUITAR_DUEL',
    triggerConditions: {
      preferredStyle: 'metal',
      minSkill: 40,
    },
    weight: 3,
    // Gigs now automatic - requiredAction removed
    textIntro: 'The opening band\'s guitarist challenges you to a shred-off after the show. The metalheads are forming a circle.',
    choices: [
      {
        id: 'ACCEPT_DUEL',
        label: 'Accept the challenge',
        outcomeText: 'Fingers flying, you trade solos until your hands cramp. The crowd goes absolutely nuts. A worthy opponent.',
        statChanges: { skill: 3, hype: 8, coreFans: 25, burnout: 3 },
      },
      {
        id: 'DECLINE_GRACEFULLY',
        label: 'Decline respectfully',
        outcomeText: 'You acknowledge their skill and bow out. Some call it wise, others call it weak.',
        statChanges: { cred: -2, stability: 2 },
      },
    ],
  },
  {
    id: 'EV_METAL_ALBUM_ART',
    triggerConditions: {
      preferredStyle: 'metal',
      minFans: 1000,
    },
    weight: 2,
    textIntro: 'A renowned metal artist offers to do your album cover. Demons, fire, the works. It won\'t be cheap.',
    choices: [
      {
        id: 'COMMISSION_ART',
        label: 'Commission the art ($500)',
        outcomeText: 'The artwork is brutal. Skulls, flames, and darkness. Your album looks like it sounds.',
        statChanges: { money: -500, image: 10, cred: 5 },
      },
      {
        id: 'DIY_ART',
        label: 'Do it yourself',
        outcomeText: 'Your photoshop skills are... developing. The cover is rough but authentic.',
        statChanges: { cred: 2 },
      },
    ],
  },
  {
    id: 'EV_METAL_FESTIVAL_SLOT',
    triggerConditions: {
      preferredStyle: 'metal',
      minFans: 3000,
      minHype: 35,
    },
    weight: 2,
    textIntro: 'A metal festival offers you a slot. Early afternoon, small stage, but it\'s exposure to thousands of metalheads.',
    choices: [
      {
        id: 'TAKE_FESTIVAL',
        label: 'Take the slot',
        outcomeText: 'Playing to a sea of black t-shirts at noon. Some are hungover, but by the end, they\'re all throwing horns.',
        statChanges: { coreFans: 100, hype: 10, burnout: 5 },
      },
      {
        id: 'HOLD_OUT',
        label: 'Hold out for a better slot',
        outcomeText: 'You pass this year. Maybe next time you\'ll get an evening slot. Maybe.',
        statChanges: { cred: 2 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'EV_METAL_MOSH_PIT_INJURY',
    triggerConditions: {
      preferredStyle: 'metal',
      minFans: 500,
    },
    weight: 2,
    // Gigs now automatic - requiredAction removed
    textIntro: 'The pit gets out of control. Someone goes down hard. The crowd parts, looking to you.',
    choices: [
      {
        id: 'STOP_THE_SHOW',
        label: 'Stop and check on them',
        outcomeText: 'You halt the set until they\'re okay. Real metal takes care of its own. Respect.',
        statChanges: { cred: 8, coreFans: 30 },
      },
      {
        id: 'KEEP_PLAYING',
        label: 'Trust the crowd to handle it',
        outcomeText: 'The pit knows what to do. They get the person up and the show continues. Metal is community.',
        statChanges: { hype: 5, skill: 1 },
      },
    ],
  },
  {
    id: 'EV_METAL_SUBGENRE_WAR',
    triggerConditions: {
      preferredStyle: 'metal',
      minFollowers: 2000,
    },
    weight: 2,
    textIntro: 'Online metalheads are arguing about whether you\'re "real metal" or not. The gatekeepers are out.',
    choices: [
      {
        id: 'DEFEND_YOUR_SOUND',
        label: 'Engage the gatekeepers',
        outcomeText: 'You post a detailed defense of your influences. Some respect it. Others dig in harder.',
        statChanges: { followers: -100, coreFans: 40, cred: 5 },
      },
      {
        id: 'IGNORE_POSERS',
        label: 'Let the music speak',
        outcomeText: 'Real metalheads know. You don\'t need to prove anything to keyboard warriors.',
        statChanges: { stability: 3 },
      },
      {
        id: 'TROLL_THEM_BACK',
        label: 'Troll them mercilessly',
        outcomeText: 'You post increasingly ridiculous takes until they can\'t tell if you\'re serious. Chaos ensues.',
        statChanges: { followers: 300, hype: 8, cred: -5 },
      },
    ],
  },
  {
    id: 'EV_METAL_ENDORSEMENT',
    triggerConditions: {
      preferredStyle: 'metal',
      minFans: 4000,
      minSkill: 50,
    },
    weight: 2,
    textIntro: 'A guitar company wants to give you a signature model. Your name on a guitar. The dream.',
    choices: [
      {
        id: 'TAKE_ENDORSEMENT',
        label: 'Sign the deal',
        outcomeText: 'Your signature model hits stores. Kids are playing guitars with your name on them. Surreal.',
        statChanges: { money: 1000, image: 12, industryGoodwill: 8 },
        flagsSet: ['HAS_GUITAR_ENDORSEMENT'],
      },
      {
        id: 'HOLD_FOR_BETTER',
        label: 'Hold out for a bigger brand',
        outcomeText: 'You want Gibson or nothing. They say they\'ll call back. Waiting.',
        statChanges: { cred: 3 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'EV_METAL_TUNING_DEBATE',
    triggerConditions: {
      preferredStyle: 'metal',
    },
    weight: 2,
    textIntro: 'Your bandmate wants to tune down even lower. Says it\'ll be heavier. Your guitars are already struggling.',
    choices: [
      {
        id: 'GO_LOWER',
        label: 'Drop it even lower',
        outcomeText: 'The strings are practically floppy, but the tone is absolutely crushing.',
        statChanges: { cred: 5, image: 3, skill: -2 },
      },
      {
        id: 'STAY_WHERE_WE_ARE',
        label: 'We\'re low enough',
        outcomeText: 'There\'s heavy, and there\'s mud. You find the balance.',
        statChanges: { skill: 2 },
      },
    ],
  },
  {
    id: 'EV_METAL_CORPSE_PAINT',
    triggerConditions: {
      preferredStyle: 'metal',
      minImage: 30,
    },
    weight: 2,
    textIntro: 'A photographer suggests you do a corpse paint photoshoot. Full black metal aesthetic.',
    choices: [
      {
        id: 'EMBRACE_THE_DARKNESS',
        label: 'Go full corpse paint',
        outcomeText: 'The photos are intense. You look like you crawled out of a Norwegian forest. Metal as hell.',
        statChanges: { image: 10, cred: 5, followers: 200 },
      },
      {
        id: 'NOT_OUR_STYLE',
        label: 'That\'s not really our thing',
        outcomeText: 'You stick to your aesthetic. Authenticity over trends.',
        statChanges: { cred: 3 },
      },
    ],
  },
  {
    id: 'EV_METAL_WALL_OF_DEATH',
    triggerConditions: {
      preferredStyle: 'metal',
      minFans: 2000,
    },
    weight: 3,
    // Gigs now automatic - requiredAction removed
    textIntro: 'The crowd is ready. They\'re chanting for a wall of death. This could be epic or disastrous.',
    choices: [
      {
        id: 'CALL_THE_WALL',
        label: 'Call for the wall of death',
        outcomeText: 'The room splits. Silence. Then you drop the heaviest riff and they collide. Pure controlled chaos.',
        statChanges: { hype: 12, coreFans: 50, cred: 5 },
      },
      {
        id: 'TOO_RISKY',
        label: 'The venue\'s too small',
        outcomeText: 'Someone could get hurt. The crowd understands. Safety first, metal second.',
        statChanges: { stability: 3, industryGoodwill: 2 },
      },
    ],
  },
];

// =============================================================================
// Grunge Events
// =============================================================================

const grungeEvents: GameEvent[] = [
  {
    id: 'EV_GRUNGE_FLANNEL_MEME',
    triggerConditions: {
      preferredStyle: 'grunge',
      minFollowers: 1000,
    },
    weight: 2,
    textIntro: 'Someone makes a meme about your flannel collection. It\'s going around.',
    choices: [
      {
        id: 'LEAN_INTO_IT',
        label: 'Lean into the joke',
        outcomeText: 'You repost it with "It\'s not a phase, mom." The internet loves self-awareness.',
        statChanges: { followers: 200, hype: 3, image: 2 },
      },
      {
        id: 'IGNORE_MEME',
        label: 'Ignore it',
        outcomeText: 'You don\'t engage. The meme dies in a day. Back to making music.',
        statChanges: {},
      },
    ],
  },
  {
    id: 'EV_GRUNGE_DEPRESSION_SONG',
    triggerConditions: {
      preferredStyle: 'grunge',
      maxStability: 40,
    },
    weight: 3,
    textIntro: 'The darkness is close today. But there\'s a song in it. Something raw and honest.',
    choices: [
      {
        id: 'WRITE_THE_PAIN',
        label: 'Channel it into music',
        outcomeText: 'You write something that hurts to listen to. It might be the most honest thing you\'ve ever made.',
        statChanges: { skill: 2, cred: 5, stability: -5, burnout: 3 },
      },
      {
        id: 'STEP_BACK',
        label: 'Take care of yourself first',
        outcomeText: 'The song can wait. You need to not fall apart.',
        statChanges: { stability: 5, health: 3 },
      },
    ],
  },
  {
    id: 'EV_GRUNGE_NOSTALGIA_TOUR',
    triggerConditions: {
      preferredStyle: 'grunge',
      minFans: 5000,
      minWeek: 52,
    },
    weight: 2,
    textIntro: 'A 90s nostalgia festival wants you. They\'re billing you as "keeping the spirit alive."',
    choices: [
      {
        id: 'PLAY_NOSTALGIA',
        label: 'Play the festival',
        outcomeText: 'Older fans who remember, younger fans discovering it. Grunge never really died.',
        statChanges: { money: 800, coreFans: 50, cred: -3 },
      },
      {
        id: 'NOT_A_MUSEUM',
        label: 'You\'re not a museum piece',
        outcomeText: 'You\'re making new music, not recreating the past. Respect.',
        statChanges: { cred: 8 },
      },
    ],
  },
  {
    id: 'EV_GRUNGE_SEATTLE_PILGRIMAGE',
    triggerConditions: {
      preferredStyle: 'grunge',
      minFans: 1000,
    },
    weight: 2,
    textIntro: 'A venue in Seattle offers you a show. The birthplace of grunge. This feels important.',
    choices: [
      {
        id: 'MAKE_THE_PILGRIMAGE',
        label: 'Play Seattle',
        outcomeText: 'Standing where legends stood. The weight of history in every note. You belong here.',
        statChanges: { cred: 10, coreFans: 35, burnout: 3, money: -200 },
      },
      {
        id: 'TOO_FAR',
        label: 'Can\'t afford the trip',
        outcomeText: 'Seattle will wait. It\'s been there for decades. It\'ll still be there.',
        statChanges: {},
      },
    ],
  },
  {
    id: 'EV_GRUNGE_ACOUSTIC_SET',
    triggerConditions: {
      preferredStyle: 'grunge',
      minSkill: 35,
    },
    weight: 3,
    textIntro: 'A venue asks if you\'ll do an unplugged set. Strip it all down. Just you and the songs.',
    choices: [
      {
        id: 'GO_UNPLUGGED',
        label: 'Do the acoustic set',
        outcomeText: 'No distortion to hide behind. Every crack in your voice exposed. It\'s terrifying and beautiful.',
        statChanges: { skill: 3, cred: 8, coreFans: 25 },
      },
      {
        id: 'NEED_THE_NOISE',
        label: 'These songs need volume',
        outcomeText: 'Some music needs to be loud. You politely decline.',
        statChanges: { cred: 2 },
      },
    ],
  },
  {
    id: 'EV_GRUNGE_THRIFT_STORE',
    triggerConditions: {
      preferredStyle: 'grunge',
    },
    weight: 2,
    textIntro: 'You find an amazing vintage guitar at a thrift store. Beat up, character for days. $150.',
    choices: [
      {
        id: 'BUY_THE_GUITAR',
        label: 'Buy it',
        outcomeText: 'It plays like a dream and looks like it\'s been through a war. Perfect.',
        statChanges: { money: -150, image: 5, cred: 3 },
      },
      {
        id: 'SAVE_THE_MONEY',
        label: 'Save your money',
        outcomeText: 'You need that money for rent. The guitar goes to someone else.',
        statChanges: { stability: 2 },
      },
    ],
  },
  {
    id: 'EV_GRUNGE_DOCUMENTARY',
    triggerConditions: {
      preferredStyle: 'grunge',
      minFans: 3000,
    },
    weight: 2,
    textIntro: 'A filmmaker making a grunge documentary wants to interview you about the scene today.',
    choices: [
      {
        id: 'DO_THE_INTERVIEW',
        label: 'Share your perspective',
        outcomeText: 'You talk about what grunge means now, not just what it meant then. The filmmaker seems moved.',
        statChanges: { cred: 8, followers: 150, coreFans: 20 },
      },
      {
        id: 'TOO_NOSTALGIC',
        label: 'Pass - too much nostalgia',
        outcomeText: 'You\'re living it, not memorializing it. They find someone else.',
        statChanges: { cred: 3 },
      },
    ],
  },
  {
    id: 'EV_GRUNGE_QUIET_LOUD',
    triggerConditions: {
      preferredStyle: 'grunge',
      minSkill: 30,
    },
    weight: 3,
    requiredAction: 'WRITE',
    textIntro: 'You\'re working on a song. The verse is soft and haunting. The chorus wants to explode.',
    choices: [
      {
        id: 'FULL_DYNAMICS',
        label: 'Go for the contrast',
        outcomeText: 'Whisper to scream. The song has dynamics that hit like a truck. This is the grunge formula.',
        statChanges: { skill: 3, cred: 5 },
      },
      {
        id: 'KEEP_IT_EVEN',
        label: 'Keep it consistent',
        outcomeText: 'Not every song needs the quiet-loud thing. This one stays simmering.',
        statChanges: { skill: 1 },
      },
    ],
  },
  {
    id: 'EV_GRUNGE_ANTIFASHION',
    triggerConditions: {
      preferredStyle: 'grunge',
      minImage: 40,
    },
    weight: 2,
    textIntro: 'A fashion brand wants you for a campaign. They love your "effortless anti-style."',
    choices: [
      {
        id: 'TAKE_THE_MONEY',
        label: 'Take the modeling gig',
        outcomeText: 'The irony isn\'t lost on you. Getting paid to look like you don\'t care. You cash the check anyway.',
        statChanges: { money: 600, image: 5, cred: -8 },
      },
      {
        id: 'THIS_AINT_FASHION',
        label: 'Decline - this is just how you dress',
        outcomeText: 'You\'re not a brand. You\'re just wearing what\'s comfortable. They don\'t get it.',
        statChanges: { cred: 10 },
      },
    ],
  },
];

// =============================================================================
// Indie Events
// =============================================================================

const indieEvents: GameEvent[] = [
  {
    id: 'EV_INDIE_PITCHFORK_REVIEW',
    triggerConditions: {
      preferredStyle: 'indie',
      minFans: 2000,
      minCred: 40,
    },
    weight: 2,
    textIntro: 'Pitchfork is reviewing your album. The indie world holds its breath.',
    choices: [
      {
        id: 'CHECK_OBSESSIVELY',
        label: 'Refresh the page constantly',
        outcomeText: 'They gave you a 7.4. "Shows promise but lacks cohesion." You\'ll be analyzing that sentence for weeks.',
        statChanges: { coreFans: 100, cred: 5, stability: -5, burnout: 3 },
      },
      {
        id: 'IGNORE_REVIEW',
        label: 'Don\'t read reviews',
        outcomeText: 'Whatever they said, it won\'t change the music you made. Healthier this way.',
        statChanges: { stability: 3, cred: 2 },
      },
    ],
  },
  {
    id: 'EV_INDIE_COFFEE_SHOP',
    triggerConditions: {
      preferredStyle: 'indie',
    },
    weight: 3,
    textIntro: 'A cool coffee shop wants you to play their opening. Exposed brick, oat milk, the whole vibe.',
    choices: [
      {
        id: 'PLAY_COFFEE_SHOP',
        label: 'Play the coffee shop',
        outcomeText: 'Intimate show to thirty people drinking pour-overs. Someone cried during the slow one. That\'s the dream, really.',
        statChanges: { coreFans: 15, cred: 3, money: 50 },
      },
      {
        id: 'TOO_QUIET',
        label: 'Need a real venue',
        outcomeText: 'You pass. The next band who plays there gets discovered by a blog.',
        statChanges: { cred: -2 },
      },
    ],
  },
  {
    id: 'EV_INDIE_VINYL_PRESSING',
    triggerConditions: {
      preferredStyle: 'indie',
      minFans: 1000,
      minMoney: 1000,
    },
    weight: 2,
    textIntro: 'A small pressing plant offers to do a limited vinyl run. 300 copies, colored wax.',
    choices: [
      {
        id: 'PRESS_VINYL',
        label: 'Press the vinyl ($800)',
        outcomeText: 'Holding your music on vinyl for the first time. The audiophiles will appreciate this.',
        statChanges: { money: -800, cred: 8, coreFans: 30 },
      },
      {
        id: 'DIGITAL_ONLY',
        label: 'Stay digital',
        outcomeText: 'Vinyl is cool but expensive. Maybe next album.',
        statChanges: {},
      },
    ],
  },
  {
    id: 'EV_INDIE_TINY_DESK',
    triggerConditions: {
      preferredStyle: 'indie',
      minFans: 4000,
      minCred: 50,
    },
    weight: 2,
    textIntro: 'NPR reaches out. They want you for a Tiny Desk Concert. This is huge.',
    choices: [
      {
        id: 'DO_TINY_DESK',
        label: 'Play Tiny Desk',
        outcomeText: 'Four songs behind a desk, stripped down and vulnerable. The video goes everywhere. This is a career moment.',
        statChanges: { coreFans: 200, followers: 800, cred: 15, hype: 10 },
      },
      {
        id: 'NOT_READY',
        label: 'Decline - not ready yet',
        outcomeText: 'You want it to be perfect. They understand. The door stays open.',
        statChanges: { stability: 3 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'EV_INDIE_RECORD_STORE_DAY',
    triggerConditions: {
      preferredStyle: 'indie',
      minFans: 800,
    },
    weight: 3,
    textIntro: 'Record Store Day is coming up. A local shop wants you to do an in-store performance.',
    choices: [
      {
        id: 'PLAY_IN_STORE',
        label: 'Play the record store',
        outcomeText: 'Surrounded by vinyl, playing to true music lovers. This is sacred ground.',
        statChanges: { coreFans: 25, cred: 5, money: 75 },
      },
      {
        id: 'SKIP_IT',
        label: 'Focus on bigger shows',
        outcomeText: 'The shop owner remembers. They don\'t stock your records after that.',
        statChanges: { cred: -5 },
      },
    ],
  },
  {
    id: 'EV_INDIE_BLOG_PREMIERE',
    triggerConditions: {
      preferredStyle: 'indie',
      minFans: 1500,
    },
    weight: 3,
    textIntro: 'An influential indie blog wants to premiere your new single. Exclusive for 24 hours.',
    choices: [
      {
        id: 'GIVE_EXCLUSIVE',
        label: 'Give them the exclusive',
        outcomeText: 'The premiere gets picked up everywhere. The blog\'s audience becomes your audience.',
        statChanges: { followers: 400, hype: 8, coreFans: 30 },
      },
      {
        id: 'SELF_RELEASE',
        label: 'Release it yourself',
        outcomeText: 'You maintain control. The numbers are smaller, but they\'re yours.',
        statChanges: { cred: 5 },
      },
    ],
  },
  {
    id: 'EV_INDIE_FESTIVAL_POSTER',
    triggerConditions: {
      preferredStyle: 'indie',
      minFans: 2500,
      minHype: 30,
    },
    weight: 2,
    textIntro: 'You\'re on a festival poster. Small font, bottom row, but you\'re on there.',
    choices: [
      {
        id: 'CELEBRATE_MILESTONE',
        label: 'Frame that poster',
        outcomeText: 'It\'s proof. You\'re real. Someone thought you belonged on that poster.',
        statChanges: { stability: 5, coreFans: 20, hype: 5 },
      },
      {
        id: 'WANT_BIGGER_FONT',
        label: 'Focus on climbing higher',
        outcomeText: 'Next year, bigger font. The grind continues.',
        statChanges: { burnout: 2 },
      },
    ],
  },
  {
    id: 'EV_INDIE_BAND_TEE',
    triggerConditions: {
      preferredStyle: 'indie',
      minFans: 500,
    },
    weight: 3,
    textIntro: 'An artist friend offers to design band merch. Cool, hand-drawn aesthetic.',
    choices: [
      {
        id: 'GET_MERCH_MADE',
        label: 'Print the shirts ($300)',
        outcomeText: 'Fifty shirts, each one art. They sell out in a week. You order more.',
        statChanges: { money: -300, image: 8, coreFans: 15 },
      },
      {
        id: 'NO_BUDGET',
        label: 'Can\'t afford it right now',
        outcomeText: 'The design goes in a folder. Maybe someday.',
        statChanges: {},
      },
    ],
  },
  {
    id: 'EV_INDIE_PLAYLIST_CURATOR',
    triggerConditions: {
      preferredStyle: 'indie',
      minFollowers: 1000,
    },
    weight: 3,
    textIntro: 'A playlist curator with 100k followers wants to feature your track. They want exclusive content in return.',
    choices: [
      {
        id: 'MAKE_THE_DEAL',
        label: 'Give them an acoustic version',
        outcomeText: 'The playlist placement is worth it. Streams spike. New listeners everywhere.',
        statChanges: { casualListeners: 300, algoBoost: 10, followers: 200 },
      },
      {
        id: 'NO_EXCLUSIVES',
        label: 'Decline the terms',
        outcomeText: 'Your music, your rules. They add someone else instead.',
        statChanges: { cred: 5 },
      },
    ],
  },
];

// =============================================================================
// Glam Events
// =============================================================================

const glamEvents: GameEvent[] = [
  {
    id: 'EV_GLAM_COSTUME_MALFUNCTION',
    triggerConditions: {
      preferredStyle: 'glam',
    },
    weight: 3,
    // Gigs now automatic - requiredAction removed
    textIntro: 'Your platform boots break mid-song. The heel just snapped off. Show must go on.',
    choices: [
      {
        id: 'KICK_THEM_OFF',
        label: 'Kick them off and go barefoot',
        outcomeText: 'You hurl the boots into the crowd and finish the set barefoot. Glam is about attitude, not shoes.',
        statChanges: { hype: 5, image: 3, cred: 2 },
      },
      {
        id: 'LIMP_THROUGH',
        label: 'Power through awkwardly',
        outcomeText: 'You finish the set looking like you\'re on a sinking ship. Not your finest moment.',
        statChanges: { image: -3, stability: -2 },
      },
    ],
  },
  {
    id: 'EV_GLAM_MAKEUP_ARTIST',
    triggerConditions: {
      preferredStyle: 'glam',
      minFans: 2000,
    },
    weight: 2,
    textIntro: 'A professional makeup artist offers to create a signature look for you. Full glam transformation.',
    choices: [
      {
        id: 'GO_FULL_GLAM',
        label: 'Go for it ($200)',
        outcomeText: 'Glitter, eyeliner, the works. You look like a star. You feel like a star.',
        statChanges: { money: -200, image: 15, hype: 5 },
      },
      {
        id: 'KEEP_IT_DIY',
        label: 'Keep doing your own makeup',
        outcomeText: 'Your look is messy but it\'s yours. That counts for something.',
        statChanges: { cred: 2 },
      },
    ],
  },
  {
    id: 'EV_GLAM_ROCK_REVIVAL',
    triggerConditions: {
      preferredStyle: 'glam',
      minHype: 30,
      minFans: 3000,
    },
    weight: 2,
    textIntro: 'A fashion magazine wants to feature you in their "Glam Rock Revival" piece. Photos, interview, the works.',
    choices: [
      {
        id: 'DO_THE_SHOOT',
        label: 'Do the photoshoot',
        outcomeText: 'Sequins, smoke machines, dramatic lighting. You look incredible. The feature brings new fans.',
        statChanges: { followers: 500, image: 10, casualListeners: 300 },
      },
      {
        id: 'MUSIC_NOT_FASHION',
        label: 'You\'re a musician, not a model',
        outcomeText: 'You decline. Some respect the focus on music. Others think you missed an opportunity.',
        statChanges: { cred: 5 },
      },
    ],
  },
  {
    id: 'EV_GLAM_WARDROBE_CRISIS',
    triggerConditions: {
      preferredStyle: 'glam',
    },
    weight: 3,
    textIntro: 'You\'ve worn the same stage outfit for months. It\'s getting tired. Time for a reinvention?',
    choices: [
      {
        id: 'NEW_LOOK',
        label: 'Invest in a new look ($400)',
        outcomeText: 'Rhinestones, silk, something nobody\'s seen before. When you step on stage, jaws drop.',
        statChanges: { money: -400, image: 15, hype: 8 },
      },
      {
        id: 'MAKE_IT_WORK',
        label: 'Add some patches and call it vintage',
        outcomeText: 'DIY glamour. The wear and tear becomes part of the mystique.',
        statChanges: { cred: 3 },
      },
    ],
  },
  {
    id: 'EV_GLAM_STAGE_DIVE',
    triggerConditions: {
      preferredStyle: 'glam',
      minFans: 1500,
    },
    weight: 2,
    // Gigs now automatic - requiredAction removed
    textIntro: 'The energy is electric. The crowd is reaching up. Do you take the leap?',
    choices: [
      {
        id: 'STAGE_DIVE',
        label: 'Stage dive into the crowd',
        outcomeText: 'They catch you. They always catch you. For a moment, you\'re surfing on pure love.',
        statChanges: { hype: 10, coreFans: 30, health: -5 },
      },
      {
        id: 'STAY_ON_STAGE',
        label: 'Keep the mystique from up here',
        outcomeText: 'Some distance is part of the show. You remain untouchable. Literally.',
        statChanges: { image: 3 },
      },
    ],
  },
  {
    id: 'EV_GLAM_DRAG_COLLAB',
    triggerConditions: {
      preferredStyle: 'glam',
      minFans: 2000,
      minImage: 40,
    },
    weight: 2,
    textIntro: 'A famous drag queen wants to collaborate. They\'ll do your look for a show. The queer community watches.',
    choices: [
      {
        id: 'DO_THE_COLLAB',
        label: 'Collaborate',
        outcomeText: 'The looks are legendary. The photos go viral. You gain a whole new audience.',
        statChanges: { followers: 600, image: 12, coreFans: 40, cred: 5 },
      },
      {
        id: 'TOO_RISKY',
        label: 'Decline - too risky for the brand',
        outcomeText: 'Playing it safe. Some appreciate the focus. Others think you missed something special.',
        statChanges: { cred: -5 },
      },
    ],
  },
  {
    id: 'EV_GLAM_MUSIC_VIDEO',
    triggerConditions: {
      preferredStyle: 'glam',
      minFans: 1000,
      minMoney: 500,
    },
    weight: 2,
    textIntro: 'A film student offers to shoot a music video. Low budget but they\'ve got vision.',
    choices: [
      {
        id: 'MAKE_THE_VIDEO',
        label: 'Make the video ($300)',
        outcomeText: 'Smoke machines, glitter cannons, dramatic lighting. It looks like a million bucks. It cost $300.',
        statChanges: { money: -300, followers: 400, hype: 10, image: 8 },
      },
      {
        id: 'WAIT_FOR_BUDGET',
        label: 'Wait until you can do it properly',
        outcomeText: 'Glam deserves real production values. You hold out.',
        statChanges: { cred: 2 },
      },
    ],
  },
  {
    id: 'EV_GLAM_BOWIE_COMPARISON',
    triggerConditions: {
      preferredStyle: 'glam',
      minFans: 3000,
    },
    weight: 2,
    textIntro: 'A reviewer compares you to Bowie. The pressure of that comparison lands heavy.',
    choices: [
      {
        id: 'EMBRACE_IT',
        label: 'Embrace the comparison',
        outcomeText: 'You lean into the legacy. Standing on the shoulders of giants.',
        statChanges: { hype: 8, image: 5, stability: -3 },
      },
      {
        id: 'FORGE_OWN_PATH',
        label: 'You\'re not the next anyone',
        outcomeText: 'You publicly reject the comparison. You\'re the first you. Respect.',
        statChanges: { cred: 10, coreFans: 25 },
      },
    ],
  },
  {
    id: 'EV_GLAM_PYROTECHNICS',
    triggerConditions: {
      preferredStyle: 'glam',
      minFans: 4000,
      minMoney: 1000,
    },
    weight: 2,
    textIntro: 'You want to add pyrotechnics to the show. Flames, sparks, the full spectacle.',
    choices: [
      {
        id: 'ADD_PYRO',
        label: 'Hire the pyro crew ($800)',
        outcomeText: 'The show is literally fire. Social media explodes. Worth every penny.',
        statChanges: { money: -800, hype: 15, followers: 500, image: 10 },
      },
      {
        id: 'TOO_DANGEROUS',
        label: 'Stick to the music',
        outcomeText: 'You\'ve seen the accident videos. The show is still great without the flames.',
        statChanges: { stability: 3 },
      },
    ],
  },
];

// =============================================================================
// Alt Rock Events
// =============================================================================

const altEvents: GameEvent[] = [
  {
    id: 'EV_ALT_COLLEGE_RADIO',
    triggerConditions: {
      preferredStyle: 'alt',
      minFans: 500,
    },
    weight: 3,
    textIntro: 'The college radio station wants you for a live session. Small audience, but these kids discover everything first.',
    choices: [
      {
        id: 'DO_COLLEGE_RADIO',
        label: 'Do the session',
        outcomeText: 'Acoustic versions in a cramped studio. The DJ actually knows your music. These are your people.',
        statChanges: { coreFans: 25, cred: 5, algoBoost: 3 },
      },
      {
        id: 'TOO_SMALL_TIME',
        label: 'Focus on bigger outlets',
        outcomeText: 'You pass on the college circuit. Someone else becomes their favorite new band.',
        statChanges: { cred: -2 },
      },
    ],
  },
  {
    id: 'EV_ALT_SOUND_EXPERIMENT',
    triggerConditions: {
      preferredStyle: 'alt',
      minSkill: 35,
    },
    weight: 2,
    textIntro: 'You\'ve got an idea for a weird sound. Backwards guitars, found sounds, something different.',
    choices: [
      {
        id: 'EXPERIMENT',
        label: 'Chase the weird idea',
        outcomeText: 'You spend a week making sounds that shouldn\'t work together. Some of it is garbage. Some of it is gold.',
        statChanges: { skill: 3, cred: 5, burnout: 3 },
      },
      {
        id: 'STAY_CONVENTIONAL',
        label: 'Stick to what works',
        outcomeText: 'You write another solid song. Safe, reliable, good.',
        statChanges: { skill: 1 },
      },
    ],
  },
  {
    id: 'EV_ALT_GENRE_DEBATE',
    triggerConditions: {
      preferredStyle: 'alt',
      minFollowers: 2000,
    },
    weight: 2,
    textIntro: 'Music nerds are arguing online about what genre you actually are. The debate is getting heated.',
    choices: [
      {
        id: 'JOIN_DEBATE',
        label: 'Weigh in on your own genre',
        outcomeText: '"We\'re just a band that makes music we like." Nobody is satisfied but everyone respects the answer.',
        statChanges: { followers: 100, cred: 3 },
      },
      {
        id: 'LET_THEM_FIGHT',
        label: 'Stay out of it',
        outcomeText: 'Let them argue. You\'ve got songs to write.',
        statChanges: { stability: 2 },
      },
    ],
  },
  {
    id: 'EV_ALT_FILM_SYNC',
    triggerConditions: {
      preferredStyle: 'alt',
      minFans: 2000,
    },
    weight: 2,
    textIntro: 'An indie filmmaker wants to use your song in their movie. No money, but exposure.',
    choices: [
      {
        id: 'LICENSE_IT',
        label: 'Let them use it',
        outcomeText: 'The film premieres at a festival. Your song plays over the climax. Credits roll. Goosebumps.',
        statChanges: { casualListeners: 200, cred: 8, followers: 150 },
      },
      {
        id: 'NEED_PAYMENT',
        label: 'Can\'t work for free',
        outcomeText: 'You need compensation. They find another song. The movie comes out. You wonder.',
        statChanges: { stability: 2 },
      },
    ],
  },
  {
    id: 'EV_ALT_OPENING_SLOT',
    triggerConditions: {
      preferredStyle: 'alt',
      minFans: 1500,
      minIndustryGoodwill: 25,
    },
    weight: 3,
    textIntro: 'A bigger alt band offers you an opening slot on their tour. Three weeks, fifteen cities.',
    choices: [
      {
        id: 'JOIN_TOUR',
        label: 'Take the tour',
        outcomeText: 'New cities every night. Playing to crowds who don\'t know you yet. By the end, they do.',
        statChanges: { coreFans: 150, casualListeners: 400, burnout: 10, money: -200, skill: 3 },
      },
      {
        id: 'CANT_COMMIT',
        label: 'Can\'t commit right now',
        outcomeText: 'Life gets in the way. They find someone else. The tour is a success.',
        statChanges: { stability: 3 },
      },
    ],
  },
  {
    id: 'EV_ALT_PRODUCER_INTEREST',
    triggerConditions: {
      preferredStyle: 'alt',
      minFans: 3000,
      minCred: 40,
    },
    weight: 2,
    textIntro: 'A respected indie producer reaches out. They want to work with you on the next album.',
    choices: [
      {
        id: 'WORK_WITH_PRODUCER',
        label: 'Collaborate with them',
        outcomeText: 'They push you out of your comfort zone. The new songs don\'t sound like you. They sound like the next you.',
        statChanges: { skill: 5, cred: 10, stability: -3 },
      },
      {
        id: 'SELF_PRODUCE',
        label: 'Keep producing yourself',
        outcomeText: 'Nobody knows your sound better than you. The album is pure.',
        statChanges: { cred: 5 },
      },
    ],
  },
  {
    id: 'EV_ALT_COVER_REQUEST',
    triggerConditions: {
      preferredStyle: 'alt',
      minFans: 1000,
    },
    weight: 3,
    textIntro: 'A fan account asks you to cover their favorite obscure song. The request gets likes.',
    choices: [
      {
        id: 'DO_THE_COVER',
        label: 'Record the cover',
        outcomeText: 'You put your spin on it. The original artist reposts it. The internet connects.',
        statChanges: { followers: 250, hype: 5, cred: 3 },
      },
      {
        id: 'ONLY_ORIGINALS',
        label: 'Focus on originals',
        outcomeText: 'You\'re not a cover band. The fans understand.',
        statChanges: { cred: 2 },
      },
    ],
  },
  {
    id: 'EV_ALT_PODCAST_APPEARANCE',
    triggerConditions: {
      preferredStyle: 'alt',
      minFans: 2000,
    },
    weight: 2,
    textIntro: 'A music podcast with a cult following wants you as a guest. Two hours of deep conversation.',
    choices: [
      {
        id: 'DO_THE_PODCAST',
        label: 'Appear on the podcast',
        outcomeText: 'You talk about influences, processes, everything. The listeners feel like they know you now.',
        statChanges: { coreFans: 40, followers: 150, cred: 5 },
      },
      {
        id: 'TOO_PERSONAL',
        label: 'Decline - too much exposure',
        outcomeText: 'You like some mystery. They respect that.',
        statChanges: { image: 2 },
      },
    ],
  },
  {
    id: 'EV_ALT_REMIX_OFFER',
    triggerConditions: {
      preferredStyle: 'alt',
      minFans: 2500,
    },
    weight: 2,
    textIntro: 'An electronic producer wants to remix your biggest song. It\'ll sound completely different.',
    choices: [
      {
        id: 'ALLOW_REMIX',
        label: 'Let them remix it',
        outcomeText: 'The remix is wild. Some fans hate it. Others discover you through it. Art evolves.',
        statChanges: { casualListeners: 300, followers: 200, cred: -2, algoBoost: 8 },
      },
      {
        id: 'PROTECT_THE_SONG',
        label: 'Keep the original intact',
        outcomeText: 'That song is sacred. It stays the way it is.',
        statChanges: { cred: 5 },
      },
    ],
  },
  {
    id: 'EV_ALT_CRITICS_DARLING',
    triggerConditions: {
      preferredStyle: 'alt',
      minCred: 50,
      minFans: 3500,
    },
    weight: 2,
    textIntro: 'You\'re becoming a "critics\' darling." Great reviews, but the crowds aren\'t keeping up.',
    choices: [
      {
        id: 'CHASE_ACCESSIBILITY',
        label: 'Write something more accessible',
        outcomeText: 'You compromise a little. The next single is catchier. The fans arrive. The critics shrug.',
        statChanges: { casualListeners: 400, cred: -8, hype: 10 },
      },
      {
        id: 'STAY_UNCOMPROMISING',
        label: 'Stay uncompromising',
        outcomeText: 'The right people will find you. Critical acclaim is its own reward.',
        statChanges: { cred: 10, coreFans: 30 },
      },
    ],
  },
];

// =============================================================================
// Export All Genre Events
// =============================================================================

export const genreEvents: GameEvent[] = [
  ...punkEvents,
  ...metalEvents,
  ...grungeEvents,
  ...indieEvents,
  ...glamEvents,
  ...altEvents,
];
