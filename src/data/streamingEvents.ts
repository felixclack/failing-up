/**
 * Streaming era events for Failing Up
 * Events related to social media, streaming platforms, and online presence
 */

import { GameEvent } from '@/engine/types';

// =============================================================================
// Social Media Drama Events
// =============================================================================

const socialMediaEvents: GameEvent[] = [
  {
    id: 'EV_VIRAL_CLIP',
    triggerConditions: {
      minFollowers: 1000,
    },
    weight: 3,
    requiredAction: 'PROMOTE',
    textIntro: 'One of your posts is blowing up! The algorithm gods have smiled upon you. Comments are flooding in.',
    choices: [
      {
        id: 'RIDE_THE_WAVE',
        label: 'Ride the wave hard',
        outcomeText: 'You drop everything and post follow-up content while the momentum lasts. Your follower count explodes.',
        statChanges: { followers: 500, algoBoost: 15, burnout: 5, casualListeners: 200 },
      },
      {
        id: 'PLAY_IT_COOL',
        label: 'Stay cool about it',
        outcomeText: 'You acknowledge the success but don\'t chase it desperately. Real fans appreciate the authenticity.',
        statChanges: { followers: 150, coreFans: 30, cred: 3 },
      },
      {
        id: 'IGNORE_IT',
        label: 'Ignore and focus on music',
        outcomeText: 'You\'re not interested in chasing algorithms. The moment passes, but your integrity is intact.',
        statChanges: { cred: 5, algoBoost: -5 },
      },
    ],
  },
  {
    id: 'EV_CANCELLED_ONLINE',
    triggerConditions: {
      minFollowers: 5000,
      minHype: 30,
    },
    weight: 2,
    textIntro: 'Someone dug up an old post of yours and it\'s being taken out of context. The pitchforks are out.',
    choices: [
      {
        id: 'APOLOGIZE',
        label: 'Issue an apology',
        outcomeText: 'You apologize and explain the context. Some accept it, others don\'t. The news cycle moves on.',
        statChanges: { followers: -200, stability: -3, cred: -2 },
      },
      {
        id: 'STAND_GROUND',
        label: 'Stand your ground',
        outcomeText: 'You refuse to apologize for something taken out of context. Your core fans respect it, others unfollow.',
        statChanges: { followers: -500, coreFans: 50, cred: 5, hype: 5 },
      },
      {
        id: 'GO_DARK',
        label: 'Deactivate and lay low',
        outcomeText: 'You disappear from social media for a bit. The drama dies down without fuel.',
        statChanges: { stability: -5, algoBoost: -10, burnout: -5 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'EV_STAN_ARMY',
    triggerConditions: {
      minFollowers: 10000,
      minCoreFans: 500,
    },
    weight: 2,
    textIntro: 'Your most dedicated fans have formed an unofficial fan account. They\'re organizing streams and defending you in comments.',
    choices: [
      {
        id: 'EMBRACE_THEM',
        label: 'Acknowledge and thank them',
        outcomeText: 'You give them a shoutout. They lose their minds. The stan army grows stronger.',
        statChanges: { coreFans: 100, followers: 300, hype: 5 },
      },
      {
        id: 'KEEP_DISTANCE',
        label: 'Keep professional distance',
        outcomeText: 'You appreciate them from afar. Better to keep some boundaries.',
        statChanges: { coreFans: 30, stability: 2 },
      },
      {
        id: 'ASK_THEM_TO_CHILL',
        label: 'Ask them to dial it back',
        outcomeText: 'Some of their behavior was getting aggressive. You ask them to be kinder. Most understand.',
        statChanges: { coreFans: -20, cred: 3, stability: 3 },
      },
    ],
  },
];

// =============================================================================
// Streaming Platform Events
// =============================================================================

const streamingPlatformEvents: GameEvent[] = [
  {
    id: 'EV_PLAYLIST_PITCH',
    triggerConditions: {
      minReleasedSongs: 1,
      minCataloguePower: 20,
    },
    weight: 3,
    textIntro: 'A playlist curator reaches out. They\'re considering featuring your latest single on a major playlist.',
    choices: [
      {
        id: 'BE_PROFESSIONAL',
        label: 'Be professional and gracious',
        outcomeText: 'You handle it like a pro. They add your track to the playlist. Streams start climbing.',
        statChanges: { algoBoost: 10, casualListeners: 300, industryGoodwill: 3 },
      },
      {
        id: 'PUSH_FOR_MORE',
        label: 'Push for better placement',
        outcomeText: 'You negotiate hard. They\'re annoyed but bump you up the list. Higher risk, higher reward.',
        statChanges: { algoBoost: 15, casualListeners: 500, industryGoodwill: -3 },
      },
      {
        id: 'PASS_ON_IT',
        label: 'Pass - their playlist isn\'t your vibe',
        outcomeText: 'You decline politely. Integrity over numbers. Your core fans notice.',
        statChanges: { cred: 5, coreFans: 20 },
      },
    ],
  },
  {
    id: 'EV_ALGORITHMIC_DIP',
    triggerConditions: {
      minReleasedSongs: 2,
      minAlgoBoost: 30,
    },
    weight: 3,
    textIntro: 'Your streaming numbers are dropping. The algorithm seems to have moved on to someone else.',
    choices: [
      {
        id: 'POST_MORE_CONTENT',
        label: 'Flood socials with content',
        outcomeText: 'You go into content overdrive. It\'s exhausting but the numbers stabilize.',
        statChanges: { algoBoost: 5, burnout: 8, followers: 100 },
      },
      {
        id: 'RELEASE_QUICK_SINGLE',
        label: 'Rush out new music',
        outcomeText: 'You drop something quick to stay relevant. It\'s not your best work but it keeps you in the game.',
        statChanges: { algoBoost: 8, cred: -3, hype: 5 },
      },
      {
        id: 'FOCUS_ON_LIVE',
        label: 'Focus on live shows instead',
        outcomeText: 'You decide streaming isn\'t everything. Real fans show up in person.',
        statChanges: { coreFans: 30, cred: 3, algoBoost: -5 },
      },
    ],
  },
  {
    id: 'EV_COVER_VIRAL',
    triggerConditions: {
      minSkill: 40,
      minFollowers: 500,
    },
    weight: 2,
    textIntro: 'Your cover of a popular song is getting serious traction. Way more than your original stuff.',
    choices: [
      {
        id: 'CAPITALIZE',
        label: 'Capitalize with more covers',
        outcomeText: 'You lean into covers. The numbers are great but... is this who you are now?',
        statChanges: { followers: 400, casualListeners: 500, cred: -5, algoBoost: 10 },
      },
      {
        id: 'PIVOT_TO_ORIGINALS',
        label: 'Use it to push originals',
        outcomeText: 'You use the momentum to point people toward your originals. Some stick around.',
        statChanges: { followers: 100, coreFans: 50, cred: 2 },
      },
      {
        id: 'DELETE_IT',
        label: 'Take it down',
        outcomeText: 'You don\'t want to be known for covers. You remove it. Purists respect the move.',
        statChanges: { cred: 8, followers: -100 },
      },
    ],
  },
];


// =============================================================================
// Digital Drama Events
// =============================================================================

const digitalDramaEvents: GameEvent[] = [
  {
    id: 'EV_FAKE_STREAMS',
    triggerConditions: {
      minReleasedSongs: 1,
      minMoney: 500,
    },
    weight: 2,
    textIntro: 'Someone\'s offering to boost your streams... artificially. "No one will know," they promise.',
    choices: [
      {
        id: 'DO_IT',
        label: 'Take the offer',
        outcomeText: 'Your numbers spike. For now, no one seems to notice. But you know.',
        statChanges: { money: -300, algoBoost: 20, casualListeners: 1000, cred: -10 },
        flagsSet: ['BOUGHT_FAKE_STREAMS'],
      },
      {
        id: 'REFUSE',
        label: 'Hard pass',
        outcomeText: 'You want real success or nothing. They shrug and move on.',
        statChanges: { cred: 3, stability: 2 },
      },
      {
        id: 'REPORT_THEM',
        label: 'Report them to the platform',
        outcomeText: 'You blow the whistle. The platform thanks you. Industry people notice.',
        statChanges: { industryGoodwill: 5, cred: 5 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'EV_FAKE_STREAMS_CAUGHT',
    triggerConditions: {
      hasFlag: 'BOUGHT_FAKE_STREAMS',
      minWeek: 10,
    },
    weight: 5,
    textIntro: 'The platform caught on. Your fake streams have been purged and everyone can see the sudden drop. The internet is talking.',
    choices: [
      {
        id: 'DENY_EVERYTHING',
        label: 'Deny everything',
        outcomeText: 'You claim it was a glitch. Some believe you, most don\'t.',
        statChanges: { cred: -15, followers: -500, industryGoodwill: -10 },
      },
      {
        id: 'COME_CLEAN',
        label: 'Come clean and apologize',
        outcomeText: 'You own up to it. It hurts, but some respect the honesty.',
        statChanges: { cred: -5, followers: -200, coreFans: 50 },
        flagsClear: ['BOUGHT_FAKE_STREAMS'],
      },
    ],
    oneTime: true,
  },
  {
    id: 'EV_INFLUENCER_COLLAB',
    triggerConditions: {
      minFollowers: 3000,
      minHype: 25,
    },
    weight: 2,
    textIntro: 'A popular influencer wants to collab. They\'re not a musician, but they have millions of followers.',
    choices: [
      {
        id: 'DO_THE_COLLAB',
        label: 'Do the collab',
        outcomeText: 'You appear on their content. Your followers spike, though some call you a sellout.',
        statChanges: { followers: 800, casualListeners: 400, cred: -3, hype: 8 },
      },
      {
        id: 'ONLY_IF_MUSICAL',
        label: 'Only if it\'s musical',
        outcomeText: 'You suggest making it about your music. They agree. It\'s actually cool.',
        statChanges: { followers: 400, coreFans: 80, cred: 2, hype: 5 },
      },
      {
        id: 'DECLINE_POLITELY',
        label: 'Decline politely',
        outcomeText: 'You\'re focused on your own path. Maybe another time.',
        statChanges: { cred: 2 },
      },
    ],
  },
  {
    id: 'EV_HATE_COMMENTS',
    triggerConditions: {
      minFollowers: 1000,
    },
    weight: 3,
    textIntro: 'The comment section is brutal today. Trolls are out in force, picking apart everything you do.',
    choices: [
      {
        id: 'ENGAGE',
        label: 'Engage with the haters',
        outcomeText: 'You clap back at some trolls. It\'s cathartic but feeds the fire.',
        statChanges: { stability: -3, hype: 5, followers: 50 },
      },
      {
        id: 'IGNORE',
        label: 'Don\'t read comments',
        outcomeText: 'You close the app and focus on creating. What they think doesn\'t matter.',
        statChanges: { stability: 2, burnout: -2 },
      },
      {
        id: 'MAKE_ART_FROM_IT',
        label: 'Turn it into content',
        outcomeText: 'You screenshot the worst ones and make fun of them. Your fans love it.',
        statChanges: { followers: 100, coreFans: 30, image: 3 },
      },
    ],
  },
];

// =============================================================================
// Platform Algorithm Events
// =============================================================================

const platformAlgorithmEvents: GameEvent[] = [
  {
    id: 'EV_ALGORITHM_UPDATE',
    triggerConditions: {
      minReleasedSongs: 1,
      minAlgoBoost: 20,
    },
    weight: 2,
    textIntro: 'The platform just pushed a major algorithm update. Everyone\'s numbers are shifting. Some artists are thriving, others are tanking.',
    choices: [
      {
        id: 'ADAPT_QUICKLY',
        label: 'Study and adapt',
        outcomeText: 'You analyze what\'s working now and pivot your content strategy. It\'s exhausting but effective.',
        statChanges: { algoBoost: 10, burnout: 5, followers: 100 },
      },
      {
        id: 'STAY_THE_COURSE',
        label: 'Keep doing what you do',
        outcomeText: 'You refuse to chase algorithms. Your numbers dip but your sanity is intact.',
        statChanges: { algoBoost: -10, cred: 5, stability: 3 },
      },
      {
        id: 'RAGE_QUIT',
        label: 'Post about it being unfair',
        outcomeText: 'You publicly complain about the changes. Some people agree, but the platform doesn\'t care.',
        statChanges: { algoBoost: -5, followers: -50, hype: 3 },
      },
    ],
  },
  {
    id: 'EV_PLATFORM_DEMONETIZATION',
    triggerConditions: {
      minReleasedSongs: 2,
      minFollowers: 5000,
    },
    weight: 1,
    textIntro: 'Your content got flagged and demonetized. Some automated system decided your music video was "not advertiser friendly."',
    choices: [
      {
        id: 'APPEAL',
        label: 'Appeal the decision',
        outcomeText: 'You file an appeal. After two weeks, they restore monetization. The system is broken.',
        statChanges: { burnout: 3, stability: -3 },
      },
      {
        id: 'REUPLOAD_EDITED',
        label: 'Reupload an edited version',
        outcomeText: 'You censor the "problematic" parts and reupload. It works but feels wrong.',
        statChanges: { cred: -5, algoBoost: 5 },
      },
      {
        id: 'DIVERSIFY_PLATFORMS',
        label: 'Focus on other platforms',
        outcomeText: 'You realize eggs shouldn\'t all be in one basket. You spread your presence.',
        statChanges: { followers: 200, burnout: 5, stability: 2 },
      },
    ],
  },
  {
    id: 'EV_PLATFORM_DECLINE',
    triggerConditions: {
      minFollowers: 10000,
      minWeek: 52,
    },
    weight: 1,
    textIntro: 'The platform where you built your audience is dying. Users are leaving. Your engagement is dropping despite good content.',
    choices: [
      {
        id: 'MIGRATE_AUDIENCE',
        label: 'Push followers to a new platform',
        outcomeText: 'You make the migration a priority. Some follow, many don\'t. Building from scratch again.',
        statChanges: { followers: -3000, coreFans: 100, burnout: 8 },
      },
      {
        id: 'RIDE_IT_OUT',
        label: 'Ride it out and see',
        outcomeText: 'You stay loyal to the platform. Maybe it\'ll recover. Maybe you\'re going down with the ship.',
        statChanges: { algoBoost: -15, cred: 3 },
      },
      {
        id: 'FOCUS_ON_MUSIC',
        label: 'Focus on music, not platforms',
        outcomeText: 'You stop obsessing over social metrics and focus on making better music.',
        statChanges: { skill: 3, cred: 5, followers: -1000 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'EV_NEW_PLATFORM_OPPORTUNITY',
    triggerConditions: {
      minFollowers: 1000,
    },
    weight: 2,
    textIntro: 'A new platform is blowing up. Early adopters are getting massive organic reach. Do you jump on?',
    choices: [
      {
        id: 'BE_EARLY_ADOPTER',
        label: 'Get in early',
        outcomeText: 'You join and start posting. The algorithm loves new creators. Your content spreads.',
        statChanges: { followers: 500, algoBoost: 15, burnout: 5 },
      },
      {
        id: 'WAIT_AND_SEE',
        label: 'Wait until it proves itself',
        outcomeText: 'You watch from the sidelines. By the time you join, the gold rush is over.',
        statChanges: { stability: 2 },
      },
      {
        id: 'REPURPOSE_OLD_CONTENT',
        label: 'Repurpose your best old content',
        outcomeText: 'You upload your greatest hits to the new platform. Old content finds new audiences.',
        statChanges: { followers: 300, casualListeners: 200, burnout: 2 },
      },
    ],
  },
  {
    id: 'EV_SHADOWBAN_SCARE',
    triggerConditions: {
      minFollowers: 3000,
      minAlgoBoost: 30,
    },
    weight: 2,
    textIntro: 'Your recent posts are getting almost no engagement. Fans are saying they\'re not seeing your content. Are you shadowbanned?',
    choices: [
      {
        id: 'PANIC_POST_MORE',
        label: 'Post more to compensate',
        outcomeText: 'You flood your feed with content. Some of it breaks through, most doesn\'t.',
        statChanges: { burnout: 8, followers: 50, stability: -5 },
      },
      {
        id: 'TAKE_A_BREAK',
        label: 'Take a break and reset',
        outcomeText: 'You go quiet for a week. When you return, engagement is normal. Who knows what happened.',
        statChanges: { burnout: -5, algoBoost: -5, stability: 3 },
      },
      {
        id: 'EMAIL_SUPPORT',
        label: 'Contact platform support',
        outcomeText: 'You send a support ticket. No response. The algorithm works in mysterious ways.',
        statChanges: { stability: -3 },
      },
    ],
  },
];

// =============================================================================
// Brand & Sponsorship Events
// =============================================================================

const brandSponsorshipEvents: GameEvent[] = [
  {
    id: 'EV_BRAND_DEAL_OFFER',
    triggerConditions: {
      minFollowers: 5000,
      minHype: 25,
    },
    weight: 2,
    textIntro: 'A brand reaches out about a sponsorship. They want you to promote their energy drink in your content.',
    choices: [
      {
        id: 'TAKE_THE_BAG',
        label: 'Take the money',
        outcomeText: 'You cash the check and post the sponsored content. Some fans roll their eyes, but money is money.',
        statChanges: { money: 500, cred: -5, followers: -100 },
      },
      {
        id: 'NEGOTIATE_CREATIVE',
        label: 'Negotiate creative control',
        outcomeText: 'You push back and get to make it actually funny. The brand loves it, fans respect it.',
        statChanges: { money: 400, cred: 2, followers: 50 },
      },
      {
        id: 'DECLINE',
        label: 'Turn it down',
        outcomeText: 'You\'re not a billboard. The offer goes to someone else.',
        statChanges: { cred: 5 },
      },
    ],
  },
  {
    id: 'EV_GEAR_ENDORSEMENT',
    triggerConditions: {
      minFollowers: 10000,
      minSkill: 50,
    },
    weight: 2,
    textIntro: 'A guitar company wants you to be an endorsed artist. Free gear and a small payment, but you have to use their stuff exclusively.',
    choices: [
      {
        id: 'SIGN_UP',
        label: 'Sign the endorsement',
        outcomeText: 'You\'re officially sponsored. The free gear is nice, and they ship you a limited edition model.',
        statChanges: { money: 300, industryGoodwill: 5, skill: 2 },
        flagsSet: ['HAS_GEAR_ENDORSEMENT'],
      },
      {
        id: 'ASK_FOR_MORE',
        label: 'Ask for better terms',
        outcomeText: 'You negotiate harder. They bump up the payment and throw in studio time.',
        statChanges: { money: 600, industryGoodwill: 3 },
        flagsSet: ['HAS_GEAR_ENDORSEMENT'],
      },
      {
        id: 'STAY_INDEPENDENT',
        label: 'Stay gear-independent',
        outcomeText: 'You like switching it up. The purists in your audience approve.',
        statChanges: { cred: 3 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'EV_SYNC_LICENSE',
    triggerConditions: {
      minReleasedSongs: 2,
      minCataloguePower: 25,
    },
    weight: 2,
    textIntro: 'A TV show wants to license one of your songs. The money is decent, but they want exclusive use for a year.',
    choices: [
      {
        id: 'TAKE_THE_SYNC',
        label: 'License it',
        outcomeText: 'Your song plays in the show. Millions hear it. Streams spike as people Shazam it.',
        statChanges: { money: 1000, casualListeners: 500, algoBoost: 10, hype: 8 },
      },
      {
        id: 'HOLD_OUT',
        label: 'Hold out for more',
        outcomeText: 'You push back. They go with someone else. Maybe next time.',
        statChanges: { cred: 2 },
      },
    ],
  },
  {
    id: 'EV_PODCAST_SPOT',
    triggerConditions: {
      minFollowers: 3000,
    },
    weight: 3,
    textIntro: 'A popular podcast about music wants you as a guest. Good exposure but takes a day of your time.',
    choices: [
      {
        id: 'DO_THE_PODCAST',
        label: 'Go on the show',
        outcomeText: 'You share your story. The host is cool, the conversation flows. New people discover you.',
        statChanges: { followers: 200, coreFans: 40, hype: 3, burnout: 2 },
      },
      {
        id: 'DECLINE_BUSY',
        label: 'Too busy right now',
        outcomeText: 'You pass on this one. There will be other opportunities.',
        statChanges: {},
      },
    ],
  },
  {
    id: 'EV_FASHION_BRAND_COLLAB',
    triggerConditions: {
      minFollowers: 20000,
      minImage: 50,
    },
    weight: 1,
    textIntro: 'A streetwear brand wants to do a capsule collection with your name on it. Merch without the hassle.',
    choices: [
      {
        id: 'DO_THE_COLLAB',
        label: 'Partner with them',
        outcomeText: 'The collab drops. It sells out. You get a cut and don\'t have to handle any fulfillment.',
        statChanges: { money: 2000, image: 10, followers: 500 },
      },
      {
        id: 'DIY_MERCH',
        label: 'Do your own merch instead',
        outcomeText: 'You decide to keep merch in-house. More work but higher margins.',
        statChanges: { cred: 5, burnout: 5 },
      },
      {
        id: 'NO_MERCH',
        label: 'Pass on merch entirely',
        outcomeText: 'You\'re not interested in being a clothing brand. Music is the focus.',
        statChanges: { cred: 3 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'EV_CRYPTO_SCAM',
    triggerConditions: {
      minFollowers: 10000,
    },
    weight: 1,
    textIntro: 'Someone offers you $10k to promote their new "artist token" cryptocurrency. It feels sketchy.',
    choices: [
      {
        id: 'TAKE_CRYPTO_MONEY',
        label: 'Take the money',
        outcomeText: 'You post about the token. It turns out to be a scam. Your fans are furious.',
        statChanges: { money: 10000, cred: -20, coreFans: -100, industryGoodwill: -10 },
        flagsSet: ['PROMOTED_CRYPTO_SCAM'],
      },
      {
        id: 'HARD_PASS',
        label: 'Absolutely not',
        outcomeText: 'You turn down the shady offer. Months later, the scam collapses. Good call.',
        statChanges: { cred: 5, stability: 3 },
      },
    ],
    oneTime: true,
  },
  {
    id: 'EV_DISTRO_OFFER',
    triggerConditions: {
      minFollowers: 1000,
      minReleasedSongs: 1,
    },
    weight: 2,
    textIntro: 'A distribution company reaches out. They want to help you get on more platforms and playlists.',
    choices: [
      {
        id: 'SIGN_DISTRO',
        label: 'Sign with them',
        outcomeText: 'You go with the distro. Your music is now everywhere. Streams start trickling in from unexpected places.',
        statChanges: { algoBoost: 8, casualListeners: 100, industryGoodwill: 3 },
      },
      {
        id: 'STAY_INDEPENDENT',
        label: 'Stay fully independent',
        outcomeText: 'You handle distribution yourself. More control, but more work.',
        statChanges: { cred: 3, burnout: 2 },
      },
    ],
  },
];

// =============================================================================
// Export All Streaming Events
// =============================================================================

export const streamingEvents: GameEvent[] = [
  ...socialMediaEvents,
  ...streamingPlatformEvents,
  ...digitalDramaEvents,
  ...platformAlgorithmEvents,
  ...brandSponsorshipEvents,
];
