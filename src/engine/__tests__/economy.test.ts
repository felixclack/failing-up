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
  LABEL_TIERS,
  SALES_TIER_DATA,
} from '../economy';
import { createGameState } from '../state';
import { createRandom } from '../random';
import { LabelDeal, Song, Album } from '../types';

describe('economy', () => {
  describe('generateLabelOffer', () => {
    it('returns null when player does not qualify', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.fans = 100; // Below indie threshold
      state.player.industryGoodwill = 5;

      const rng = createRandom(1);
      const offer = generateLabelOffer(state, rng);

      expect(offer).toBeNull();
    });

    it('generates indie deal when player qualifies', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.fans = 1000;
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
      state.player.fans = 10000;
      state.player.industryGoodwill = 40;

      const rng = createRandom(1);
      const offer = generateLabelOffer(state, rng);

      expect(offer).not.toBeNull();
      expect(offer!.advance).toBeGreaterThanOrEqual(LABEL_TIERS.mid.advanceRange[0]);
      expect(offer!.creativeControl).toBe('medium');
    });

    it('generates major deal when player qualifies', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.fans = 50000;
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

      const deal: LabelDeal = {
        id: 'test_deal',
        name: 'Test Records',
        advance: 5000,
        recoupDebt: 5000,
        royaltyRate: 0.15,
        creativeControl: 'medium',
        status: 'active',
        weekSigned: 1,
      };

      const newState = signLabelDeal(state, deal);

      expect(newState.player.money).toBe(initialMoney + 5000);
    });

    it('sets hasLabelDeal flag', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      expect(state.player.flags.hasLabelDeal).toBe(false);

      const deal: LabelDeal = {
        id: 'test_deal',
        name: 'Test Records',
        advance: 5000,
        recoupDebt: 5000,
        royaltyRate: 0.15,
        creativeControl: 'medium',
        status: 'active',
        weekSigned: 1,
      };

      const newState = signLabelDeal(state, deal);

      expect(newState.player.flags.hasLabelDeal).toBe(true);
    });

    it('adds deal to labelDeals array', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });

      const deal: LabelDeal = {
        id: 'test_deal',
        name: 'Test Records',
        advance: 5000,
        recoupDebt: 5000,
        royaltyRate: 0.15,
        creativeControl: 'medium',
        status: 'active',
        weekSigned: 1,
      };

      const newState = signLabelDeal(state, deal);

      expect(newState.labelDeals).toHaveLength(1);
      expect(newState.labelDeals[0].id).toBe('test_deal');
    });
  });

  describe('calculateWeeklyRoyalties', () => {
    it('returns 0 when not recouped', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.labelDeals = [{
        id: 'deal1',
        name: 'Test',
        advance: 5000,
        recoupDebt: 3000, // Still in debt
        royaltyRate: 0.15,
        creativeControl: 'medium',
        status: 'active',
        weekSigned: 1,
      }];

      const royalties = calculateWeeklyRoyalties(state);

      expect(royalties).toBe(0);
    });

    it('returns royalties when recouped with album', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.labelDeals = [{
        id: 'deal1',
        name: 'Test',
        advance: 5000,
        recoupDebt: 0, // Recouped
        royaltyRate: 0.15,
        creativeControl: 'medium',
        status: 'active',
        weekSigned: 1,
      }];
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
        { id: '1', title: 'Song 1', quality: 60, style: 'rock' as any, hitPotential: 50, writtenByPlayer: true, weekWritten: 1 },
        { id: '2', title: 'Song 2', quality: 80, style: 'rock' as any, hitPotential: 60, writtenByPlayer: true, weekWritten: 2 },
      ];

      // Average quality = 70, production 50 = +10 bonus
      const quality = calculateAlbumQuality(songs, 50);

      expect(quality).toBe(80); // 70 + 10
    });

    it('caps quality at 100', () => {
      const songs: Song[] = [
        { id: '1', title: 'Song 1', quality: 95, style: 'rock' as any, hitPotential: 90, writtenByPlayer: true, weekWritten: 1 },
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
        { id: 's1', title: 'Song 1', quality: 70, style: 'rock' as any, hitPotential: 60, writtenByPlayer: true, weekWritten: 1 },
        { id: 's2', title: 'Song 2', quality: 65, style: 'rock' as any, hitPotential: 55, writtenByPlayer: true, weekWritten: 2 },
      ];
      state.player.hype = 50;
      state.player.cred = 40;
      state.player.fans = 5000;

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
      state.player.fans = 10000;
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
      state1.player.fans = 1000;
      state1.player.hype = 50;

      const state2 = createGameState({ playerName: 'Test', seed: 1 });
      state2.player.fans = 100000;
      state2.player.hype = 50;

      const result1 = calculateTourWeek(state1, createRandom(1));
      const result2 = calculateTourWeek(state2, createRandom(1));

      expect(result2.revenue).toBeGreaterThan(result1.revenue);
    });
  });

  describe('calculateGigPayout', () => {
    it('returns payout based on hype and fans', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.fans = 500;
      state.player.hype = 60;
      state.player.skill = 50;

      const rng = createRandom(1);
      const { payout, fansGained } = calculateGigPayout(state, rng);

      expect(payout).toBeGreaterThan(50); // More than base
      expect(fansGained).toBeGreaterThanOrEqual(0);
    });

    it('scales with local fan base (capped at 500)', () => {
      const state1 = createGameState({ playerName: 'Test', seed: 1 });
      state1.player.fans = 100;
      state1.player.hype = 80;

      const state2 = createGameState({ playerName: 'Test', seed: 1 });
      state2.player.fans = 1000; // More fans, but local capped at 500
      state2.player.hype = 80;

      const result1 = calculateGigPayout(state1, createRandom(1));
      const result2 = calculateGigPayout(state2, createRandom(1));

      // Bigger fanbase should mean better turnout
      expect(result2.payout).toBeGreaterThan(result1.payout);
    });
  });
});
