import {
  generateLabelOffer,
  signLabelDeal,
  calculateWeeklyRoyalties,
  calculateAlbumQuality,
  calculateAlbumReception,
  determineSalesTier,
  createAlbum,
  calculateTourWeek,
  calculateGigPayout,
  getStreamingRoyaltyRate,
  calculateStreamingIncomeAfterDeal,
  applyStreamingRecoupment,
  getActive360Deal,
  LABEL_TIERS,
  SALES_TIER_DATA,
} from '../economy';
import { createDefaultPlatformStats } from '../streaming';
import { createGameState } from '../state';
import { createRandom } from '../random';
import { LabelDeal, Song, Album } from '../types';

// Helper to create test song with all required fields
function createTestSong(overrides: Partial<Song> = {}): Song {
  return {
    id: '1',
    title: 'Test Song',
    quality: 60,
    style: 'rock' as any,
    hitPotential: 50,
    writtenByPlayer: true,
    weekWritten: 1,
    isReleased: false,
    isSingle: false,
    weekReleased: null,
    streamsTier: 'none',
    playlistScore: 0,
    viralFlag: false,
    viralWeeksRemaining: 0,
    totalStreams: 0,
    platformStats: createDefaultPlatformStats(),
    chartHistory: [],
    peakChartPosition: null,
    ...overrides,
  };
}

// Helper to create a complete modern LabelDeal for testing
function createTestDeal(overrides: Partial<LabelDeal> = {}): LabelDeal {
  return {
    id: 'test_deal',
    name: 'Test Records',
    advance: 5000,
    recoupDebt: 5000,
    royaltyRate: 0.15,
    streamingRoyaltyRate: 0.20,
    creativeControl: 'medium',
    status: 'active',
    weekSigned: 1,
    dealType: 'traditional',
    includesMasters: true,
    includesMerch: false,
    includesTouring: false,
    merchCut: 0,
    touringCut: 0,
    ...overrides,
  };
}

describe('economy', () => {
  describe('generateLabelOffer', () => {
    it('returns null when player does not qualify', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.coreFans = 100; // Below indie threshold
      state.player.industryGoodwill = 5;

      const rng = createRandom(1);
      const offer = generateLabelOffer(state, rng);

      expect(offer).toBeNull();
    });

    it('generates indie deal when player qualifies', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.coreFans = 1000;
      state.player.industryGoodwill = 15;

      const rng = createRandom(1);
      const offer = generateLabelOffer(state, rng);

      expect(offer).not.toBeNull();
      expect(offer!.advance).toBeGreaterThanOrEqual(LABEL_TIERS.indie.advanceRange[0]);
      expect(offer!.advance).toBeLessThanOrEqual(LABEL_TIERS.indie.advanceRange[1]);
      expect(offer!.creativeControl).toBe('high');
    });

    it('generates mid-tier deal when player qualifies', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.coreFans = 10000;
      state.player.industryGoodwill = 40;

      const rng = createRandom(1);
      const offer = generateLabelOffer(state, rng);

      expect(offer).not.toBeNull();
      expect(offer!.advance).toBeGreaterThanOrEqual(LABEL_TIERS.mid.advanceRange[0]);
      expect(offer!.creativeControl).toBe('medium');
    });

    it('generates major deal when player qualifies', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.coreFans = 50000;
      state.player.industryGoodwill = 60;

      const rng = createRandom(1);
      const offer = generateLabelOffer(state, rng);

      expect(offer).not.toBeNull();
      expect(offer!.advance).toBeGreaterThanOrEqual(LABEL_TIERS.major.advanceRange[0]);
      expect(offer!.creativeControl).toBe('low');
    });
  });

  describe('signLabelDeal', () => {
    it('adds advance to player money', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      const initialMoney = state.player.money;

      const deal = createTestDeal({ advance: 5000 });
      const newState = signLabelDeal(state, deal);

      expect(newState.player.money).toBe(initialMoney + 5000);
    });

    it('sets hasLabelDeal flag', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      expect(state.player.flags.hasLabelDeal).toBe(false);

      const deal = createTestDeal();
      const newState = signLabelDeal(state, deal);

      expect(newState.player.flags.hasLabelDeal).toBe(true);
    });

    it('adds deal to labelDeals array', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });

      const deal = createTestDeal();
      const newState = signLabelDeal(state, deal);

      expect(newState.labelDeals).toHaveLength(1);
      expect(newState.labelDeals[0].id).toBe('test_deal');
    });
  });

  describe('calculateWeeklyRoyalties', () => {
    it('returns 0 when not recouped', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.labelDeals = [createTestDeal({ id: 'deal1', recoupDebt: 3000 })];

      const royalties = calculateWeeklyRoyalties(state);

      expect(royalties).toBe(0);
    });

    it('returns royalties when recouped with album', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.labelDeals = [createTestDeal({ id: 'deal1', recoupDebt: 0 })];
      state.albums = [{
        id: 'album1',
        title: 'Test Album',
        songIds: [],
        productionValue: 50,
        promotionSpend: 0,
        reception: 70,
        salesTier: 'gold',
        labelId: 'deal1',
        weekReleased: 10,
        chartHistory: [],
        peakChartPosition: null,
      }];

      const royalties = calculateWeeklyRoyalties(state);

      expect(royalties).toBeGreaterThan(0);
    });
  });

  describe('calculateAlbumQuality', () => {
    it('returns 0 for empty songs array', () => {
      expect(calculateAlbumQuality([], 50)).toBe(0);
    });

    it('calculates quality from song average plus production', () => {
      const songs: Song[] = [
        createTestSong({ id: '1', title: 'Song 1', quality: 60, hitPotential: 50, weekWritten: 1 }),
        createTestSong({ id: '2', title: 'Song 2', quality: 80, hitPotential: 60, weekWritten: 2 }),
      ];

      // Average quality = 70, production 50 = +10 bonus
      const quality = calculateAlbumQuality(songs, 50);

      expect(quality).toBe(80); // 70 + 10
    });

    it('caps quality at 100', () => {
      const songs: Song[] = [
        createTestSong({ id: '1', title: 'Song 1', quality: 95, hitPotential: 90, weekWritten: 1 }),
      ];

      const quality = calculateAlbumQuality(songs, 100);

      expect(quality).toBe(100);
    });
  });

  describe('calculateAlbumReception', () => {
    it('returns higher reception for higher quality', () => {
      const rng1 = createRandom(1);
      const rng2 = createRandom(1);

      const lowQualityReception = calculateAlbumReception(30, 50, 50, rng1);
      const highQualityReception = calculateAlbumReception(90, 50, 50, rng2);

      expect(highQualityReception).toBeGreaterThan(lowQualityReception);
    });

    it('factors in hype and cred', () => {
      const rng1 = createRandom(1);
      const rng2 = createRandom(1);

      const lowHypeReception = calculateAlbumReception(50, 10, 10, rng1);
      const highHypeReception = calculateAlbumReception(50, 90, 90, rng2);

      expect(highHypeReception).toBeGreaterThan(lowHypeReception);
    });
  });

  describe('determineSalesTier', () => {
    it('returns flop for low reception and fans', () => {
      const rng = createRandom(1);
      const tier = determineSalesTier(20, 100, 0, false, rng);

      expect(tier).toBe('flop');
    });

    it('returns higher tier for more fans and better reception', () => {
      const rng = createRandom(1);
      const tier = determineSalesTier(80, 100000, 5000, true, rng);

      expect(['gold', 'platinum', 'silver']).toContain(tier);
    });

    it('label deal increases sales', () => {
      const rng1 = createRandom(42);
      const rng2 = createRandom(42);

      const withoutLabel = determineSalesTier(60, 10000, 0, false, rng1);
      const withLabel = determineSalesTier(60, 10000, 0, true, rng2);

      // With same seed and conditions, label should help
      const tierOrder = ['flop', 'cult', 'silver', 'gold', 'platinum', 'diamond'];
      const withoutIndex = tierOrder.indexOf(withoutLabel);
      const withIndex = tierOrder.indexOf(withLabel);

      expect(withIndex).toBeGreaterThanOrEqual(withoutIndex);
    });
  });

  describe('createAlbum', () => {
    it('creates album with calculated values', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.songs = [
        createTestSong({ id: 's1', title: 'Song 1', quality: 70, hitPotential: 60, weekWritten: 1 }),
        createTestSong({ id: 's2', title: 'Song 2', quality: 65, hitPotential: 55, weekWritten: 2 }),
      ];
      state.player.hype = 50;
      state.player.cred = 40;
      state.player.coreFans = 5000;

      const rng = createRandom(1);
      const { album, fanGain, credChange } = createAlbum(
        state,
        'Test Album',
        ['s1', 's2'],
        60,
        null,
        rng
      );

      expect(album.title).toBe('Test Album');
      expect(album.songIds).toEqual(['s1', 's2']);
      expect(album.productionValue).toBe(60);
      expect(album.reception).toBeGreaterThan(0);
      expect(album.salesTier).toBeDefined();
      expect(fanGain).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateTourWeek', () => {
    it('returns revenue and costs', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.coreFans = 10000;
      state.player.hype = 50;
      state.player.skill = 60;

      const rng = createRandom(1);
      const { revenue, costs, fansGained, hypeGain } = calculateTourWeek(state, rng);

      expect(revenue).toBeGreaterThan(0);
      expect(costs).toBeGreaterThan(0);
      expect(fansGained).toBeGreaterThanOrEqual(0);
      expect(hypeGain).toBeGreaterThan(0);
    });

    it('scales revenue with fans', () => {
      const state1 = createGameState({ playerName: 'Test', seed: 1 });
      state1.player.coreFans = 1000;
      state1.player.hype = 50;

      const state2 = createGameState({ playerName: 'Test', seed: 1 });
      state2.player.coreFans = 100000;
      state2.player.hype = 50;

      const result1 = calculateTourWeek(state1, createRandom(1));
      const result2 = calculateTourWeek(state2, createRandom(1));

      expect(result2.revenue).toBeGreaterThan(result1.revenue);
    });
  });

  describe('calculateGigPayout', () => {
    it('returns payout based on hype and fans', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.coreFans = 500;
      state.player.hype = 60;
      state.player.skill = 50;

      const rng = createRandom(1);
      const { payout, fansGained } = calculateGigPayout(state, rng);

      expect(payout).toBeGreaterThan(50); // More than base
      expect(fansGained).toBeGreaterThanOrEqual(0);
    });

    it('scales with local fan base (capped at 500)', () => {
      const state1 = createGameState({ playerName: 'Test', seed: 1 });
      state1.player.coreFans = 100;
      state1.player.hype = 80;

      const state2 = createGameState({ playerName: 'Test', seed: 1 });
      state2.player.coreFans = 1000; // More fans, but local capped at 500
      state2.player.hype = 80;

      const result1 = calculateGigPayout(state1, createRandom(1));
      const result2 = calculateGigPayout(state2, createRandom(1));

      // Bigger fanbase should mean better turnout
      expect(result2.payout).toBeGreaterThan(result1.payout);
    });
  });

  // ==========================================================================
  // Modern Deal Economics Tests
  // ==========================================================================

  describe('generateLabelOffer - modern deal types', () => {
    it('generates distro deal for players with followers but low fan count', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.coreFans = 300;
      state.player.followers = 2000;
      state.player.industryGoodwill = 10;

      const rng = createRandom(1);
      const offer = generateLabelOffer(state, rng);

      expect(offer).not.toBeNull();
      expect(offer!.dealType).toBe('distro');
      expect(offer!.includesMasters).toBe(false);
      expect(offer!.streamingRoyaltyRate).toBeGreaterThanOrEqual(0.70);
    });

    it('generates 360 deal for high-tier players', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.coreFans = 60000;
      state.player.followers = 60000;
      state.player.industryGoodwill = 70;

      const rng = createRandom(1);
      const offer = generateLabelOffer(state, rng);

      expect(offer).not.toBeNull();
      expect(offer!.dealType).toBe('360');
      expect(offer!.includesMerch).toBe(true);
      expect(offer!.includesTouring).toBe(true);
      expect(offer!.merchCut).toBeGreaterThan(0);
      expect(offer!.touringCut).toBeGreaterThan(0);
    });

    it('includes streaming royalty rate in all deals', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.coreFans = 10000;
      state.player.industryGoodwill = 40;

      const rng = createRandom(1);
      const offer = generateLabelOffer(state, rng);

      expect(offer).not.toBeNull();
      expect(offer!.streamingRoyaltyRate).toBeGreaterThan(0);
      expect(offer!.streamingRoyaltyRate).toBeLessThanOrEqual(1);
    });
  });

  describe('getStreamingRoyaltyRate', () => {
    it('returns 1.0 for DIY artists without deal', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.labelDeals = [];

      const rate = getStreamingRoyaltyRate(state);

      expect(rate).toBe(1.0);
    });

    it('returns deal streaming royalty rate when signed', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.labelDeals = [createTestDeal({ streamingRoyaltyRate: 0.25 })];

      const rate = getStreamingRoyaltyRate(state);

      expect(rate).toBe(0.25);
    });
  });

  describe('calculateStreamingIncomeAfterDeal', () => {
    it('returns full income for DIY artists', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.labelDeals = [];

      const result = calculateStreamingIncomeAfterDeal(1000, state);

      expect(result.grossIncome).toBe(1000);
      expect(result.netIncome).toBe(1000);
      expect(result.labelCut).toBe(0);
      expect(result.recoupPaid).toBe(0);
    });

    it('applies label cut based on streaming royalty rate', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.labelDeals = [createTestDeal({
        streamingRoyaltyRate: 0.20, // Artist gets 20%
        recoupDebt: 0, // Already recouped
      })];

      const result = calculateStreamingIncomeAfterDeal(1000, state);

      expect(result.grossIncome).toBe(1000);
      expect(result.labelCut).toBe(800); // Label takes 80%
      expect(result.netIncome).toBe(200); // Artist gets 20%
    });

    it('applies recoupment from artist share', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.labelDeals = [createTestDeal({
        streamingRoyaltyRate: 0.50, // Artist gets 50%
        recoupDebt: 300, // Still recouping
      })];

      const result = calculateStreamingIncomeAfterDeal(1000, state);

      expect(result.grossIncome).toBe(1000);
      expect(result.labelCut).toBe(500); // Label takes 50%
      expect(result.recoupPaid).toBe(300); // Full artist share goes to recoup
      expect(result.netIncome).toBe(200); // 500 - 300 recoup = 200
    });

    it('caps recoupment at artist share', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.labelDeals = [createTestDeal({
        streamingRoyaltyRate: 0.20, // Artist gets 20%
        recoupDebt: 5000, // Large debt
      })];

      const result = calculateStreamingIncomeAfterDeal(1000, state);

      // Artist share is only 200, so recoup is capped at 200
      expect(result.recoupPaid).toBe(200);
      expect(result.netIncome).toBe(0);
    });
  });

  describe('applyStreamingRecoupment', () => {
    it('reduces deal recoup debt', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.labelDeals = [createTestDeal({ recoupDebt: 1000 })];

      const newState = applyStreamingRecoupment(state, 300);

      expect(newState.labelDeals[0].recoupDebt).toBe(700);
    });

    it('does not reduce below zero', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.labelDeals = [createTestDeal({ recoupDebt: 100 })];

      const newState = applyStreamingRecoupment(state, 500);

      expect(newState.labelDeals[0].recoupDebt).toBe(0);
    });

    it('does nothing without active deal', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.labelDeals = [];

      const newState = applyStreamingRecoupment(state, 500);

      expect(newState).toEqual(state);
    });
  });

  describe('getActive360Deal', () => {
    it('returns null when no 360 deal exists', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.labelDeals = [createTestDeal({ dealType: 'traditional' })];

      const deal = getActive360Deal(state);

      expect(deal).toBeNull();
    });

    it('returns 360 deal when active', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.labelDeals = [createTestDeal({
        dealType: '360',
        includesMerch: true,
        includesTouring: true,
        merchCut: 0.25,
        touringCut: 0.15,
      })];

      const deal = getActive360Deal(state);

      expect(deal).not.toBeNull();
      expect(deal!.dealType).toBe('360');
    });

    it('ignores dropped 360 deals', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.labelDeals = [createTestDeal({
        dealType: '360',
        status: 'dropped',
      })];

      const deal = getActive360Deal(state);

      expect(deal).toBeNull();
    });
  });

  describe('calculateTourWeek - 360 deal cuts', () => {
    it('applies touring cut from 360 deal', () => {
      const stateNoLabel = createGameState({ playerName: 'Test', seed: 1 });
      stateNoLabel.player.coreFans = 10000;
      stateNoLabel.player.hype = 50;

      const stateWith360 = createGameState({ playerName: 'Test', seed: 1 });
      stateWith360.player.coreFans = 10000;
      stateWith360.player.hype = 50;
      stateWith360.labelDeals = [createTestDeal({
        dealType: '360',
        includesTouring: true,
        touringCut: 0.15,
        includesMerch: true,
        merchCut: 0.25,
      })];

      const resultNoLabel = calculateTourWeek(stateNoLabel, createRandom(1));
      const resultWith360 = calculateTourWeek(stateWith360, createRandom(1));

      // Revenue should be lower with 360 deal due to cuts
      expect(resultWith360.revenue).toBeLessThan(resultNoLabel.revenue);
      expect(resultWith360.labelCut).toBeGreaterThan(0);
    });
  });
});
