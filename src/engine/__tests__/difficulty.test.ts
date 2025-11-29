/**
 * Tests for difficulty system
 */

import {
  DIFFICULTY_SETTINGS,
  getDifficultySettings,
  getAvailableDifficulties,
  getWeeklyLivingCost,
  getGigPayout,
  getFanGain,
  getHypeDecay,
  getHealthLoss,
  getAddictionGain,
  getBurnoutGain,
  getEventChance,
} from '../difficulty';
import { createGameState } from '../state';
import { Difficulty } from '../types';

describe('difficulty', () => {
  describe('DIFFICULTY_SETTINGS', () => {
    it('has all four difficulty levels', () => {
      expect(DIFFICULTY_SETTINGS.easy).toBeDefined();
      expect(DIFFICULTY_SETTINGS.normal).toBeDefined();
      expect(DIFFICULTY_SETTINGS.hard).toBeDefined();
      expect(DIFFICULTY_SETTINGS.brutal).toBeDefined();
    });

    it('has correct names for each difficulty', () => {
      expect(DIFFICULTY_SETTINGS.easy.name).toBe('Garage Band');
      expect(DIFFICULTY_SETTINGS.normal.name).toBe('Indie Grind');
      expect(DIFFICULTY_SETTINGS.hard.name).toBe('Major Label Pressure');
      expect(DIFFICULTY_SETTINGS.brutal.name).toBe('27 Club');
    });

    it('has progressively harder settings from easy to brutal', () => {
      // Living costs should increase
      expect(DIFFICULTY_SETTINGS.easy.livingCostMultiplier).toBeLessThan(DIFFICULTY_SETTINGS.normal.livingCostMultiplier);
      expect(DIFFICULTY_SETTINGS.normal.livingCostMultiplier).toBeLessThan(DIFFICULTY_SETTINGS.hard.livingCostMultiplier);
      expect(DIFFICULTY_SETTINGS.hard.livingCostMultiplier).toBeLessThan(DIFFICULTY_SETTINGS.brutal.livingCostMultiplier);

      // Gig pay should decrease
      expect(DIFFICULTY_SETTINGS.easy.gigPayMultiplier).toBeGreaterThan(DIFFICULTY_SETTINGS.normal.gigPayMultiplier);
      expect(DIFFICULTY_SETTINGS.normal.gigPayMultiplier).toBeGreaterThan(DIFFICULTY_SETTINGS.hard.gigPayMultiplier);
      expect(DIFFICULTY_SETTINGS.hard.gigPayMultiplier).toBeGreaterThan(DIFFICULTY_SETTINGS.brutal.gigPayMultiplier);

      // Health loss should increase
      expect(DIFFICULTY_SETTINGS.easy.healthLossMultiplier).toBeLessThan(DIFFICULTY_SETTINGS.normal.healthLossMultiplier);
      expect(DIFFICULTY_SETTINGS.normal.healthLossMultiplier).toBeLessThan(DIFFICULTY_SETTINGS.hard.healthLossMultiplier);
      expect(DIFFICULTY_SETTINGS.hard.healthLossMultiplier).toBeLessThan(DIFFICULTY_SETTINGS.brutal.healthLossMultiplier);

      // Starting money should decrease (easy is same as normal now, but others decrease)
      expect(DIFFICULTY_SETTINGS.easy.startingMoney).toBeGreaterThanOrEqual(DIFFICULTY_SETTINGS.normal.startingMoney);
      expect(DIFFICULTY_SETTINGS.normal.startingMoney).toBeGreaterThan(DIFFICULTY_SETTINGS.hard.startingMoney);
      expect(DIFFICULTY_SETTINGS.hard.startingMoney).toBeGreaterThan(DIFFICULTY_SETTINGS.brutal.startingMoney);
    });
  });

  describe('getDifficultySettings', () => {
    it('returns correct settings for each difficulty', () => {
      expect(getDifficultySettings('easy')).toBe(DIFFICULTY_SETTINGS.easy);
      expect(getDifficultySettings('normal')).toBe(DIFFICULTY_SETTINGS.normal);
      expect(getDifficultySettings('hard')).toBe(DIFFICULTY_SETTINGS.hard);
      expect(getDifficultySettings('brutal')).toBe(DIFFICULTY_SETTINGS.brutal);
    });
  });

  describe('getAvailableDifficulties', () => {
    it('returns all four difficulties with names and descriptions', () => {
      const difficulties = getAvailableDifficulties();
      expect(difficulties).toHaveLength(4);
      expect(difficulties.map(d => d.id)).toEqual(['easy', 'normal', 'hard', 'brutal']);
      difficulties.forEach(d => {
        expect(d.name).toBeDefined();
        expect(d.description).toBeDefined();
      });
    });
  });

  describe('multiplier functions', () => {
    const easySettings = DIFFICULTY_SETTINGS.easy;
    const normalSettings = DIFFICULTY_SETTINGS.normal;
    const brutalSettings = DIFFICULTY_SETTINGS.brutal;

    describe('getWeeklyLivingCost', () => {
      it('applies multiplier correctly', () => {
        expect(getWeeklyLivingCost(100, easySettings)).toBe(90); // 0.9 multiplier
        expect(getWeeklyLivingCost(100, normalSettings)).toBe(100); // 1.0 multiplier
        expect(getWeeklyLivingCost(100, brutalSettings)).toBe(150); // 1.5 multiplier
      });
    });

    describe('getGigPayout', () => {
      it('applies multiplier correctly', () => {
        expect(getGigPayout(100, easySettings)).toBe(115); // 1.15 multiplier
        expect(getGigPayout(100, normalSettings)).toBe(100); // 1.0 multiplier
        expect(getGigPayout(100, brutalSettings)).toBe(60); // 0.6 multiplier
      });
    });

    describe('getFanGain', () => {
      it('applies multiplier correctly', () => {
        expect(getFanGain(100, easySettings)).toBe(120); // 1.2 multiplier
        expect(getFanGain(100, normalSettings)).toBe(100); // 1.0 multiplier
        expect(getFanGain(100, brutalSettings)).toBe(60); // 0.6 multiplier
      });
    });

    describe('getHypeDecay', () => {
      it('applies multiplier correctly', () => {
        expect(getHypeDecay(10, easySettings)).toBe(9); // 0.85 multiplier rounds to 9
        expect(getHypeDecay(10, normalSettings)).toBe(10); // 1.0 multiplier
        expect(getHypeDecay(10, brutalSettings)).toBe(15); // 1.5 multiplier
      });
    });

    describe('getHealthLoss', () => {
      it('applies multiplier correctly', () => {
        expect(getHealthLoss(10, easySettings)).toBe(8); // 0.8 multiplier
        expect(getHealthLoss(10, normalSettings)).toBe(10); // 1.0 multiplier
        expect(getHealthLoss(10, brutalSettings)).toBe(16); // 1.6 multiplier
      });
    });

    describe('getAddictionGain', () => {
      it('applies multiplier correctly', () => {
        expect(getAddictionGain(10, easySettings)).toBe(7); // 0.7 multiplier
        expect(getAddictionGain(10, normalSettings)).toBe(10); // 1.0 multiplier
        expect(getAddictionGain(10, brutalSettings)).toBe(18); // 1.8 multiplier
      });
    });

    describe('getBurnoutGain', () => {
      it('applies multiplier correctly', () => {
        expect(getBurnoutGain(10, easySettings)).toBe(8); // 0.8 multiplier
        expect(getBurnoutGain(10, normalSettings)).toBe(10); // 1.0 multiplier
        expect(getBurnoutGain(10, brutalSettings)).toBe(15); // 1.5 multiplier
      });
    });

    describe('getEventChance', () => {
      it('applies multiplier correctly', () => {
        expect(getEventChance(0.5, easySettings)).toBe(0.45); // 0.9 multiplier
        expect(getEventChance(0.5, normalSettings)).toBe(0.5); // 1.0 multiplier
        expect(getEventChance(0.5, brutalSettings)).toBe(0.7); // 1.4 multiplier
      });

      it('caps at 0.9', () => {
        expect(getEventChance(0.9, brutalSettings)).toBeLessThanOrEqual(0.9);
      });
    });
  });

  describe('createGameState with difficulty', () => {
    it('defaults to normal difficulty', () => {
      const state = createGameState({ playerName: 'Test' });
      expect(state.difficulty).toBe('normal');
      expect(state.difficultySettings).toBe(DIFFICULTY_SETTINGS.normal);
    });

    it('accepts specified difficulty', () => {
      const easyState = createGameState({ playerName: 'Test', difficulty: 'easy' });
      expect(easyState.difficulty).toBe('easy');
      expect(easyState.difficultySettings).toBe(DIFFICULTY_SETTINGS.easy);

      const brutalState = createGameState({ playerName: 'Test', difficulty: 'brutal' });
      expect(brutalState.difficulty).toBe('brutal');
      expect(brutalState.difficultySettings).toBe(DIFFICULTY_SETTINGS.brutal);
    });

    it('adjusts weekly living cost based on difficulty', () => {
      const easyState = createGameState({ playerName: 'Test', difficulty: 'easy', seed: 1 });
      const normalState = createGameState({ playerName: 'Test', difficulty: 'normal', seed: 1 });
      const brutalState = createGameState({ playerName: 'Test', difficulty: 'brutal', seed: 1 });

      expect(easyState.weeklyLivingCost).toBeLessThan(normalState.weeklyLivingCost);
      expect(normalState.weeklyLivingCost).toBeLessThan(brutalState.weeklyLivingCost);
    });

    it('adjusts starting stats based on difficulty', () => {
      // Use same seed to isolate difficulty effect
      const easyState = createGameState({ playerName: 'Test', difficulty: 'easy', seed: 12345 });
      const brutalState = createGameState({ playerName: 'Test', difficulty: 'brutal', seed: 12345 });

      // Easy should have better starting money (base 600 vs 200)
      // With random variance, easy's base is still much higher
      expect(easyState.player.money).toBeGreaterThan(brutalState.player.money);
    });
  });
});
