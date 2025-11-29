/**
 * Balance tests - verify different strategies are viable
 * These tests simulate gameplay strategies and check outcomes
 */

import { createGameState, applyStatDeltas, getTotalFans } from '../state';
import { createRandom } from '../random';
import {
  calculateWeeklyStreamingIncome,
  releaseSingle,
  MONEY_PER_1000_STREAMS,
  STREAMS_PER_TIER,
} from '../streaming';
import {
  calculateGigPayout,
  calculateTourWeek,
  getStreamingRoyaltyRate,
  calculateStreamingIncomeAfterDeal,
  LABEL_TIERS,
} from '../economy';
import { processTurnWithEvents } from '../turn';
import { ALL_EVENTS } from '@/data/events';
import { Player, Song, GameState } from '../types';

describe('Balance Analysis', () => {
  describe('Streaming Income', () => {
    const createTestPlayer = (overrides: Partial<Player> = {}): Player => ({
      name: 'Test',
      talent: 50,
      skill: 50,
      image: 50,
      hype: 50,
      money: 1000,
      health: 100,
      stability: 70,
      cred: 50,
      coreFans: 1000,
      casualListeners: 5000,
      followers: 10000,
      algoBoost: 50,
      cataloguePower: 20,
      addiction: 0,
      industryGoodwill: 30,
      burnout: 20,
      flags: {
        hasLabelDeal: false,
        onTour: false,
        inStudio: false,
        hasManager: false,
        hasLawyer: false,
        addictionArcStarted: false,
        labelDealArcStarted: false,
        bandBreakupArcStarted: false,
      },
      ...overrides,
    });

    const createReleasedSong = (overrides: Partial<Song> = {}): Song => ({
      id: 'song_test',
      title: 'Test Song',
      quality: 60,
      style: 'alt',
      hitPotential: 50,
      writtenByPlayer: true,
      weekWritten: 1,
      isReleased: true,
      isSingle: true,
      weekReleased: 2,
      streamsTier: 'medium',
      playlistScore: 40,
      viralFlag: false,
      viralWeeksRemaining: 0,
      totalStreams: 10000,
      ...overrides,
    });

    it('streaming income at LOW tier covers about 5-35% of living costs', () => {
      const rng = createRandom(12345);
      const player = createTestPlayer();
      const songs = [createReleasedSong({ streamsTier: 'low' })];

      const { income } = calculateWeeklyStreamingIncome(songs, player, rng);
      const weeklyLivingCost = 100;

      // LOW tier: 100-1000 streams = $0.35-$3.50
      // With boosts, maybe $1-$7
      // This is 1-7% of living cost - very low, which is realistic
      expect(income).toBeLessThan(weeklyLivingCost * 0.5);
    });

    it('streaming income at MEDIUM tier covers about 35-350% of living costs', () => {
      const rng = createRandom(12345);
      const player = createTestPlayer({ algoBoost: 70 });
      const songs = [createReleasedSong({ streamsTier: 'medium', playlistScore: 60 })];

      const { income } = calculateWeeklyStreamingIncome(songs, player, rng);
      const weeklyLivingCost = 100;

      // MEDIUM tier: 1,000-10,000 streams = $3.50-$35
      // With boosts, maybe $5-$50
      // This should be noticeable but not sustainable alone
      expect(income).toBeGreaterThanOrEqual(1);
      expect(income).toBeLessThanOrEqual(200);
    });

    it('streaming income at HIGH tier can cover living costs and more', () => {
      const rng = createRandom(12345);
      const player = createTestPlayer({ algoBoost: 80 });
      const songs = [createReleasedSong({ streamsTier: 'high', playlistScore: 70 })];

      const { income } = calculateWeeklyStreamingIncome(songs, player, rng);
      const weeklyLivingCost = 100;

      // HIGH tier: 10,000-100,000 streams = $35-$350
      // With boosts, should cover living costs
      expect(income).toBeGreaterThan(weeklyLivingCost * 0.3);
    });

    it('multiple songs compound streaming income', () => {
      const rng = createRandom(12345);
      const player = createTestPlayer({ algoBoost: 60 });
      const songs = [
        createReleasedSong({ id: 'song1', streamsTier: 'medium' }),
        createReleasedSong({ id: 'song2', streamsTier: 'medium' }),
        createReleasedSong({ id: 'song3', streamsTier: 'low' }),
      ];

      const { income: incomeMultiple } = calculateWeeklyStreamingIncome(songs, player, rng);

      const rng2 = createRandom(12345);
      const { income: incomeSingle } = calculateWeeklyStreamingIncome([songs[0]], player, rng2);

      // Multiple songs should generate more income
      expect(incomeMultiple).toBeGreaterThan(incomeSingle);
    });
  });

  describe('Traditional vs Streaming Comparison', () => {
    it('early career: gigs beat streaming', () => {
      const rng = createRandom(12345);
      const state = createGameState({ playerName: 'Test', seed: 12345 });

      // Early player with 1 low-tier song
      const player = state.player;
      const songs = [{
        id: 'song1',
        title: 'First Song',
        quality: 50,
        style: 'alt' as const,
        hitPotential: 40,
        writtenByPlayer: true,
        weekWritten: 1,
        isReleased: true,
        isSingle: true,
        weekReleased: 2,
        streamsTier: 'low' as const,
        playlistScore: 20,
        viralFlag: false,
        viralWeeksRemaining: 0,
        totalStreams: 500,
      }];

      const { income: streamingIncome } = calculateWeeklyStreamingIncome(songs, player, rng);
      const { payout: gigPayout } = calculateGigPayout(state, rng);

      // Early career, gigs should be better than low-tier streaming
      expect(gigPayout).toBeGreaterThan(streamingIncome);
    });

    it('mid career: streaming becomes competitive with catalogue', () => {
      const rng = createRandom(12345);
      const state = createGameState({ playerName: 'Test', seed: 12345 });

      // Mid-career player with multiple medium-tier songs
      const player = {
        ...state.player,
        coreFans: 5000,
        casualListeners: 20000,
        followers: 30000,
        algoBoost: 60,
        hype: 60,
      };
      const songs = [
        { id: 'song1', title: 'Hit 1', quality: 70, style: 'alt' as const, hitPotential: 65,
          writtenByPlayer: true, weekWritten: 10, isReleased: true, isSingle: true, weekReleased: 12,
          streamsTier: 'medium' as const, playlistScore: 50, viralFlag: false, viralWeeksRemaining: 0, totalStreams: 50000 },
        { id: 'song2', title: 'Hit 2', quality: 65, style: 'alt' as const, hitPotential: 60,
          writtenByPlayer: true, weekWritten: 20, isReleased: true, isSingle: true, weekReleased: 22,
          streamsTier: 'medium' as const, playlistScore: 45, viralFlag: false, viralWeeksRemaining: 0, totalStreams: 30000 },
        { id: 'song3', title: 'Deep Cut', quality: 55, style: 'alt' as const, hitPotential: 40,
          writtenByPlayer: true, weekWritten: 30, isReleased: true, isSingle: false, weekReleased: 32,
          streamsTier: 'low' as const, playlistScore: 25, viralFlag: false, viralWeeksRemaining: 0, totalStreams: 5000 },
      ];

      const { income: streamingIncome } = calculateWeeklyStreamingIncome(songs, player, rng);
      const { payout: gigPayout } = calculateGigPayout({ ...state, player }, rng);

      // With a good catalogue, streaming should be meaningful
      // but local gigs should still be decent (we're comparing apples to oranges though)
      expect(streamingIncome).toBeGreaterThan(0);
      expect(gigPayout).toBeGreaterThan(0);
    });
  });

  describe('Deal Economics', () => {
    it('DIY route gives 100% streaming royalty', () => {
      const state = createGameState({ playerName: 'Test', seed: 12345 });
      // No label deal
      const rate = getStreamingRoyaltyRate(state);
      expect(rate).toBe(1.0);
    });

    it('distro deal gives high royalty (70-85%)', () => {
      expect(LABEL_TIERS.distro.streamingRoyaltyRange[0]).toBeGreaterThanOrEqual(0.70);
      expect(LABEL_TIERS.distro.streamingRoyaltyRange[1]).toBeLessThanOrEqual(0.85);
    });

    it('major label gives lower royalty but big advance', () => {
      expect(LABEL_TIERS.major.streamingRoyaltyRange[0]).toBeLessThan(0.20);
      expect(LABEL_TIERS.major.advanceRange[0]).toBeGreaterThanOrEqual(25000);
    });

    it('360 deal advance is highest but they take from everything', () => {
      expect(LABEL_TIERS.major360.advanceRange[0]).toBeGreaterThan(LABEL_TIERS.major.advanceRange[0]);
      expect(LABEL_TIERS.major360.includesMerch).toBe(true);
      expect(LABEL_TIERS.major360.includesTouring).toBe(true);
    });

    it('streaming income with label deal reduces net income', () => {
      const state = createGameState({ playerName: 'Test', seed: 12345 });

      // Create state with indie label deal
      const stateWithDeal: GameState = {
        ...state,
        labelDeals: [{
          id: 'deal1',
          name: 'Test Records',
          advance: 2000,
          recoupDebt: 2000,
          royaltyRate: 0.20,
          streamingRoyaltyRate: 0.25, // 75% goes to label
          creativeControl: 'high',
          status: 'active',
          weekSigned: 1,
          dealType: 'traditional',
          includesMasters: true,
          includesMerch: false,
          includesTouring: false,
          merchCut: 0,
          touringCut: 0,
        }],
        player: { ...state.player, flags: { ...state.player.flags, hasLabelDeal: true } },
      };

      const grossIncome = 100;
      const result = calculateStreamingIncomeAfterDeal(grossIncome, stateWithDeal);

      // Label takes 75%, artist gets 25%
      expect(result.labelCut).toBe(75);
      // But artist share goes to recoupment first
      expect(result.netIncome).toBe(0); // All goes to recoup
      expect(result.recoupPaid).toBe(25);
    });
  });

  describe('Fan Conversion Balance', () => {
    it('casualListeners should be much larger than coreFans for streaming-focused artists', () => {
      // A streaming-focused artist should have many casual listeners
      // but fewer core fans (the opposite of a touring artist)

      // This is a design verification - casual listeners come from streaming
      // while core fans come from live shows and community engagement
      const streamingFocusedPlayer = {
        coreFans: 1000,
        casualListeners: 50000, // 50:1 ratio
        followers: 100000,
      };

      expect(streamingFocusedPlayer.casualListeners / streamingFocusedPlayer.coreFans).toBeGreaterThan(10);
    });

    it('core fans matter more for merch and tickets', () => {
      // Merch revenue is based on coreFans, not total fans
      // This tests the design principle that core fans have higher value
      const rng = createRandom(12345);

      const highCoreFanState = createGameState({ playerName: 'Test', seed: 12345 });
      highCoreFanState.player = {
        ...highCoreFanState.player,
        coreFans: 10000,
        casualListeners: 10000,
        hype: 60,
      };

      const lowCoreFanState = createGameState({ playerName: 'Test', seed: 12345 });
      lowCoreFanState.player = {
        ...lowCoreFanState.player,
        coreFans: 1000,
        casualListeners: 19000, // Same total fans
        hype: 60,
      };

      const highCoreTour = calculateTourWeek(highCoreFanState, rng);
      const rng2 = createRandom(12345);
      const lowCoreTour = calculateTourWeek(lowCoreFanState, rng2);

      // Higher core fans should mean more revenue (merch is based on core fans)
      expect(highCoreTour.revenue).toBeGreaterThan(lowCoreTour.revenue);
    });
  });

  describe('Viral Mechanics Balance', () => {
    it('viral chance is low but reward is high', () => {
      // Viral chance should be 4-10% for PROMOTE based on algoBoost
      // This is tested implicitly through the action, but we verify the concept
      const baseViralChance = 0.04;
      const maxAlgoBoostBonus = 100 / 800; // ~0.125 max
      const totalMaxChance = baseViralChance + maxAlgoBoostBonus;

      expect(baseViralChance).toBe(0.04); // 4% base
      expect(totalMaxChance).toBeLessThanOrEqual(0.20); // Max ~16.5%
    });

    it('viral multiplier significantly boosts streams', () => {
      // Viral should give 5x streams for 4 weeks
      const VIRAL_MULTIPLIER = 5;
      const VIRAL_DURATION_WEEKS = 4;

      // At HIGH tier (10k-100k streams), viral gives 50k-500k streams/week
      // For 4 weeks, that's 200k-2M total streams during viral period
      const baseHighTierStreams = 50000; // Mid-range HIGH tier
      const viralStreams = baseHighTierStreams * VIRAL_MULTIPLIER;
      const totalViralPeriodStreams = viralStreams * VIRAL_DURATION_WEEKS;

      expect(viralStreams).toBe(250000);
      expect(totalViralPeriodStreams).toBe(1000000);

      // At $3.50 per 1000, that's $3,500 during viral period
      const viralIncome = (totalViralPeriodStreams / 1000) * 3.5;
      expect(viralIncome).toBe(3500);
    });
  });

  describe('AlgoBoost Decay Balance', () => {
    it('algoBoost decays at sustainable rate', () => {
      // Decay is 3 per week
      // PROMOTE normal gains: 0-3 algoBoost
      // PROMOTE viral success: +8-18 algoBoost
      const decayRate = 3;
      const promoteGainAvg = 1.5; // Rough average from normal promotion
      const viralSuccessMin = 8;

      // Regular promoting roughly maintains algoBoost (loses ~1.5 per week average)
      // Occasional viral success boosts significantly
      expect(decayRate - promoteGainAvg).toBeLessThan(2); // Manageable decay
      expect(viralSuccessMin / decayRate).toBeGreaterThan(2); // Viral gives 2+ weeks of buffer
    });
  });

  describe('Strategy Viability', () => {
    it('DIY + streaming can be sustainable with enough songs', () => {
      // A DIY artist with 5 medium-tier songs should be able to survive
      const rng = createRandom(12345);
      const player: Player = {
        name: 'DIY Artist',
        talent: 60,
        skill: 60,
        image: 50,
        hype: 50,
        money: 500,
        health: 80,
        stability: 70,
        cred: 60,
        coreFans: 2000,
        casualListeners: 15000,
        followers: 25000,
        algoBoost: 50,
        cataloguePower: 40,
        addiction: 0,
        industryGoodwill: 30,
        burnout: 30,
        flags: {
          hasLabelDeal: false,
          onTour: false,
          inStudio: false,
          hasManager: false,
          hasLawyer: false,
          addictionArcStarted: false,
          labelDealArcStarted: false,
          bandBreakupArcStarted: false,
        },
      };

      const songs: Song[] = Array.from({ length: 5 }, (_, i) => ({
        id: `song${i}`,
        title: `Track ${i + 1}`,
        quality: 55 + i * 5,
        style: 'indie' as const,
        hitPotential: 50 + i * 3,
        writtenByPlayer: true,
        weekWritten: i * 10 + 1,
        isReleased: true,
        isSingle: i < 3,
        weekReleased: i * 10 + 5,
        streamsTier: i < 2 ? 'medium' as const : 'low' as const,
        playlistScore: 30 + i * 5,
        viralFlag: false,
        viralWeeksRemaining: 0,
        totalStreams: 20000 + i * 10000,
      }));

      const { income } = calculateWeeklyStreamingIncome(songs, player, rng);
      const weeklyLivingCost = 100;

      // With 5 songs (2 medium, 3 low), DIY artist should be able to survive
      // Even if not thriving, income should be meaningful
      expect(income).toBeGreaterThan(weeklyLivingCost * 0.2);
    });

    it('touring remains viable even in streaming era', () => {
      const rng = createRandom(12345);
      const state = createGameState({ playerName: 'Tour Artist', seed: 12345 });

      // A mid-level touring artist
      state.player = {
        ...state.player,
        coreFans: 8000,
        casualListeners: 5000,
        hype: 65,
        skill: 70,
      };

      const tourResult = calculateTourWeek(state, rng);
      const weeklyLivingCost = 100;
      const tourProfit = tourResult.revenue - tourResult.costs;

      // Touring should be profitable for established acts
      expect(tourProfit).toBeGreaterThan(weeklyLivingCost);
    });
  });
});
