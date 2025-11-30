/**
 * Album release and music industry events
 */

import { GameEvent } from '@/engine/types';

export const albumEvents: GameEvent[] = [
  // ===== Album Release Events =====

  // First review comes in
  {
    id: 'EV_FIRST_REVIEW',
    triggerConditions: {
      releasedAlbumRecently: true,
      minReleasedAlbums: 1,
    },
    weight: 4,
    textIntro: 'The first review is in. You stare at your phone, heart pounding. Do you read it?',
    choices: [
      {
        id: 'READ_NOW',
        label: 'Read it immediately',
        outcomeText: 'Mixed feelings. They praise your sound but question the production. At least they noticed you.',
        statChanges: { hype: 3, stability: -3 },
      },
      {
        id: 'WAIT_FOR_MORE',
        label: 'Wait until more come in',
        outcomeText: 'You force yourself to wait. Eventually you see the consensus - generally positive with some caveats.',
        statChanges: { stability: 2, cred: 2 },
      },
      {
        id: 'NEVER_READ',
        label: 'Never read reviews',
        outcomeText: 'You delete the notification. You made the art. Their opinion doesn\'t change what you created.',
        statChanges: { cred: 3, stability: 5 },
      },
    ],
    oneTime: true,
  },

  // Good review
  {
    id: 'EV_GOOD_REVIEW',
    triggerConditions: {
      releasedAlbumRecently: true,
      minHype: 25,
    },
    weight: 2,
    textIntro: 'A major music publication gives your album 8/10. "A bold statement from a band on the rise." The write-up is glowing.',
    choices: [
      {
        id: 'SHARE_EVERYWHERE',
        label: 'Share it everywhere',
        outcomeText: 'You post the review across all socials. The quote looks great on your profile.',
        statChanges: { hype: 8, followers: 50, image: 3 },
      },
      {
        id: 'THANK_REVIEWER',
        label: 'Thank the reviewer publicly',
        outcomeText: 'You post a genuine thank you. The reviewer shares it. A nice moment of connection.',
        statChanges: { hype: 5, industryGoodwill: 3, cred: 2 },
      },
      {
        id: 'STAY_HUMBLE',
        label: 'Keep quiet and keep working',
        outcomeText: 'Nice reviews don\'t make the next album. You channel the energy into new material.',
        statChanges: { skill: 2, cred: 3 },
      },
    ],
  },

  // Brutal review
  {
    id: 'EV_BRUTAL_REVIEW',
    triggerConditions: {
      releasedAlbumRecently: true,
    },
    weight: 2,
    textIntro: 'A prominent critic tears your album apart. "Derivative, overproduced, and ultimately forgettable." It stings.',
    choices: [
      {
        id: 'CLAP_BACK',
        label: 'Respond publicly',
        outcomeText: 'You fire back on social media. Your fans love it. The drama gets you more attention.',
        statChanges: { hype: 5, cred: -3, coreFans: 10 },
      },
      {
        id: 'TAKE_NOTES',
        label: 'Consider their points',
        outcomeText: 'Buried in the vitriol, there are valid criticisms. Painful but useful.',
        statChanges: { skill: 3, stability: -5, cred: 2 },
      },
      {
        id: 'IGNORE_HATERS',
        label: 'Ignore it completely',
        outcomeText: 'One person\'s opinion. Your fans love it. That\'s what matters.',
        statChanges: { stability: 3 },
      },
    ],
  },

  // Playlist placement
  {
    id: 'EV_PLAYLIST_PLACEMENT',
    triggerConditions: {
      releasedAlbumRecently: true,
      minFollowers: 500,
    },
    weight: 3,
    textIntro: 'You get added to a popular streaming playlist. Suddenly your streams are climbing. The algorithm is smiling on you.',
    choices: [
      {
        id: 'PROMOTE_IT',
        label: 'Promote the playlist placement',
        outcomeText: 'You share the news. More listeners discover you through the playlist buzz.',
        statChanges: { followers: 100, casualListeners: 50, algoBoost: 5, hype: 3 },
      },
      {
        id: 'RELEASE_CONTENT',
        label: 'Release bonus content',
        outcomeText: 'You strike while the iron\'s hot with acoustic versions and behind-the-scenes footage.',
        statChanges: { followers: 80, coreFans: 20, cataloguePower: 3 },
      },
      {
        id: 'LET_IT_RIDE',
        label: 'Let the music speak',
        outcomeText: 'You don\'t oversell it. The streams come naturally.',
        statChanges: { followers: 60, cred: 2, algoBoost: 3 },
      },
    ],
  },

  // Radio play
  {
    id: 'EV_RADIO_PLAY',
    triggerConditions: {
      releasedAlbumRecently: true,
      minFans: 1000,
    },
    weight: 2,
    textIntro: 'You hear your song on the radio for the first time. Actually on the radio. It\'s surreal.',
    choices: [
      {
        id: 'TELL_EVERYONE',
        label: 'Tell everyone you know',
        outcomeText: 'You call your parents. You post online. This is a milestone worth celebrating.',
        statChanges: { stability: 8, hype: 5, followers: 30 },
      },
      {
        id: 'RECORD_IT',
        label: 'Record the moment',
        outcomeText: 'You grab your phone and capture the audio. Content for the socials.',
        statChanges: { followers: 20, image: 3, hype: 3 },
      },
      {
        id: 'SIT_IN_SILENCE',
        label: 'Just take it in',
        outcomeText: 'You listen until the song ends. Then you get back to work.',
        statChanges: { stability: 5, cred: 2 },
      },
    ],
    oneTime: true,
  },

  // Album sales milestone
  {
    id: 'EV_SALES_MILESTONE',
    triggerConditions: {
      releasedAlbumRecently: true,
      minFans: 5000,
    },
    weight: 1,
    textIntro: 'Your album hits a sales milestone. Not chart-topping numbers, but real people bought your music.',
    choices: [
      {
        id: 'CELEBRATE_FANS',
        label: 'Thank your fans',
        outcomeText: 'You post a heartfelt thank you. A hand-written note shared online. Your fans feel seen.',
        statChanges: { coreFans: 30, stability: 5, image: 2 },
      },
      {
        id: 'PLAN_MERCH',
        label: 'Create commemorative merch',
        outcomeText: 'Limited edition milestone t-shirts. They sell out quickly.',
        statChanges: { money: 300, fans: 20, image: 3 },
      },
      {
        id: 'REINVEST',
        label: 'Put it toward the next album',
        outcomeText: 'You earmark the profits for better production next time.',
        statChanges: { money: 500, skill: 1 },
      },
    ],
    oneTime: true,
  },

  // Chart entry
  {
    id: 'EV_CHART_ENTRY',
    triggerConditions: {
      releasedAlbumRecently: true,
      minFans: 10000,
      minHype: 40,
    },
    weight: 1,
    textIntro: 'You check the charts. You\'re actually on there. Not top 10, but you\'re on the actual charts.',
    choices: [
      {
        id: 'SCREENSHOT_EVERYTHING',
        label: 'Screenshot and celebrate',
        outcomeText: 'You document this moment forever. Your label sends champagne.',
        statChanges: { hype: 10, industryGoodwill: 5, stability: 5, addiction: 2 },
      },
      {
        id: 'PUSH_FOR_HIGHER',
        label: 'Push for a higher position',
        outcomeText: 'You do more promo, more appearances. The chart position rises slightly.',
        statChanges: { hype: 15, burnout: 5, health: -3 },
      },
      {
        id: 'KEEP_PERSPECTIVE',
        label: 'Keep perspective',
        outcomeText: 'Charts don\'t define art. You\'re proud, but you stay grounded.',
        statChanges: { cred: 5, stability: 8 },
      },
    ],
    oneTime: true,
  },

  // Sync licensing opportunity
  {
    id: 'EV_SYNC_OPPORTUNITY',
    triggerConditions: {
      releasedAlbumRecently: true,
      minIndustryGoodwill: 20,
    },
    weight: 2,
    textIntro: 'A TV show wants to license one of your tracks. It\'s not huge money, but millions would hear your song.',
    choices: [
      {
        id: 'TAKE_THE_DEAL',
        label: 'Take the deal',
        outcomeText: 'Your song plays in a dramatic scene. Suddenly people are searching for you.',
        statChanges: { money: 500, followers: 200, hype: 8, casualListeners: 100 },
      },
      {
        id: 'NEGOTIATE_MORE',
        label: 'Push for more money',
        outcomeText: 'You ask for better terms. They come back with 50% more. Smart move.',
        statChanges: { money: 750, followers: 150, hype: 5, cred: 2 },
      },
      {
        id: 'DECLINE',
        label: 'Decline - wrong fit',
        outcomeText: 'The show doesn\'t match your values. You pass. Principles over exposure.',
        statChanges: { cred: 5, industryGoodwill: -2 },
      },
    ],
  },

  // Album anniversary
  {
    id: 'EV_ALBUM_ANNIVERSARY',
    triggerConditions: {
      minReleasedAlbums: 1,
      minWeek: 52,
    },
    weight: 1,
    textIntro: 'It\'s been a year since your first album dropped. Fans are posting nostalgic tributes online.',
    choices: [
      {
        id: 'ANNIVERSARY_CONTENT',
        label: 'Release anniversary content',
        outcomeText: 'You share unreleased demos and recording photos. Fans eat it up.',
        statChanges: { coreFans: 25, followers: 50, cataloguePower: 5, hype: 3 },
      },
      {
        id: 'ANNIVERSARY_SHOW',
        label: 'Announce an anniversary show',
        outcomeText: 'You\'ll play the album front to back. Tickets sell fast.',
        statChanges: { money: 800, coreFans: 30, hype: 8 },
      },
      {
        id: 'LOOK_FORWARD',
        label: 'Focus on new material',
        outcomeText: 'You appreciate the love but tease what\'s coming next. The future is more exciting.',
        statChanges: { hype: 5, cred: 3 },
      },
    ],
    oneTime: true,
  },

  // Press junket exhaustion
  {
    id: 'EV_PRESS_JUNKET',
    triggerConditions: {
      releasedAlbumRecently: true,
      hasLabelDeal: true,
    },
    weight: 3,
    textIntro: 'The label has you doing 12 interviews in one day. Same questions, over and over. "What inspired the album?"',
    choices: [
      {
        id: 'POWER_THROUGH',
        label: 'Power through professionally',
        outcomeText: 'You give the same answers with fake enthusiasm. The promo cycle is relentless.',
        statChanges: { hype: 5, burnout: 8, industryGoodwill: 3, stability: -3 },
      },
      {
        id: 'GET_WEIRD',
        label: 'Start giving weird answers',
        outcomeText: 'You tell one interviewer the album was inspired by a dream about cheese. It goes viral.',
        statChanges: { hype: 10, image: 5, cred: -2, stability: 2 },
      },
      {
        id: 'SET_BOUNDARIES',
        label: 'Set some boundaries',
        outcomeText: 'You tell the label you need breaks. They\'re annoyed but accommodate.',
        statChanges: { hype: 2, industryGoodwill: -3, burnout: 2, stability: 3 },
      },
    ],
  },

  // Vinyl pressing
  {
    id: 'EV_VINYL_PRESSING',
    triggerConditions: {
      minReleasedAlbums: 1,
      minCoreFans: 200,
    },
    weight: 2,
    textIntro: 'Fans keep asking about vinyl. You could do a limited pressing, but it\'s a significant upfront cost.',
    choices: [
      {
        id: 'DO_VINYL',
        label: 'Do a vinyl pressing (£2,000)',
        outcomeText: 'You press 500 copies. They sell out in days. Fans treasure them.',
        statChanges: { money: 1500, coreFans: 40, cred: 5, image: 3 },
      },
      {
        id: 'CROWDFUND',
        label: 'Crowdfund it first',
        outcomeText: 'You gauge interest before committing. Pre-orders cover the costs with room to spare.',
        statChanges: { money: 2500, coreFans: 25, followers: 30 },
      },
      {
        id: 'NOT_YET',
        label: 'Not yet - maybe next album',
        outcomeText: 'You tell fans to hold tight. The demand will only grow.',
        statChanges: { cred: 2 },
      },
    ],
    oneTime: true,
  },
];
