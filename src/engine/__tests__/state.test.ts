import {
  createGameState,
  createPlayer,
  applyStatDeltas,
  clampStat,
  weekToYear,
  weekInYear,
  STAT_MIN,
  STAT_MAX,
} from '../state';
import { createRandom } from '../random';

describe('state', () => {
  describe('createGameState', () => {
    it('creates a new game state with player name', () => {
      const state = createGameState({ playerName: 'Johnny Rotten' });

      expect(state.player.name).toBe('Johnny Rotten');
      expect(state.week).toBe(1);
      expect(state.year).toBe(1);
      expect(state.isGameOver).toBe(false);
      expect(state.gameOverReason).toBeNull();
    });

    it('creates starting band with 3 members', () => {
      const state = createGameState({ playerName: 'Test' });

      expect(state.bandmates).toHaveLength(3);
      expect(state.bandmates.map(b => b.role)).toContain('guitar');
      expect(state.bandmates.map(b => b.role)).toContain('bass');
      expect(state.bandmates.map(b => b.role)).toContain('drums');
    });

    it('uses provided seed for reproducible randomness', () => {
      const state1 = createGameState({ playerName: 'Test', seed: 12345 });
      const state2 = createGameState({ playerName: 'Test', seed: 12345 });

      expect(state1.player.talent).toBe(state2.player.talent);
      expect(state1.player.skill).toBe(state2.player.skill);
      expect(state1.bandmates[0].name).toBe(state2.bandmates[0].name);
    });

    it('creates different states with different seeds', () => {
      const state1 = createGameState({ playerName: 'Test', seed: 12345 });
      const state2 = createGameState({ playerName: 'Test', seed: 54321 });

      // Very unlikely to be identical with different seeds
      const sameStats =
        state1.player.talent === state2.player.talent &&
        state1.player.skill === state2.player.skill &&
        state1.player.image === state2.player.image;

      expect(sameStats).toBe(false);
    });

    it('initializes with correct default values', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });

      expect(state.songs).toEqual([]);
      expect(state.albums).toEqual([]);
      expect(state.labelDeals).toEqual([]);
      expect(state.activeArcs).toEqual([]);
      expect(state.weekLogs).toEqual([]);
      expect(state.maxWeeks).toBe(520);
    });
  });

  describe('createPlayer', () => {
    it('uses provided talent value', () => {
      const rng = createRandom(1);
      const player = createPlayer({ name: 'Test', talent: 75 }, rng);

      expect(player.talent).toBe(75);
    });

    it('initializes flags correctly', () => {
      const rng = createRandom(1);
      const player = createPlayer({ name: 'Test' }, rng);

      expect(player.flags.hasLabelDeal).toBe(false);
      expect(player.flags.onTour).toBe(false);
      expect(player.flags.inStudio).toBe(false);
      expect(player.flags.hasManager).toBe(false);
    });
  });

  describe('applyStatDeltas', () => {
    it('applies positive deltas', () => {
      const rng = createRandom(1);
      const player = createPlayer({ name: 'Test' }, rng);
      const initialSkill = player.skill;

      const updated = applyStatDeltas(player, { skill: 5 });

      expect(updated.skill).toBe(initialSkill + 5);
    });

    it('applies negative deltas', () => {
      const rng = createRandom(1);
      const player = createPlayer({ name: 'Test' }, rng);
      const initialHealth = player.health;

      const updated = applyStatDeltas(player, { health: -10 });

      expect(updated.health).toBe(initialHealth - 10);
    });

    it('clamps stats to valid range', () => {
      const rng = createRandom(1);
      const player = createPlayer({ name: 'Test' }, rng);

      const updated = applyStatDeltas(player, { skill: 1000 });

      expect(updated.skill).toBe(STAT_MAX);
    });

    it('does not clamp money (can go negative)', () => {
      const rng = createRandom(1);
      const player = createPlayer({ name: 'Test' }, rng);

      const updated = applyStatDeltas(player, { money: -10000 });

      expect(updated.money).toBeLessThan(0);
    });

    it('does not mutate original player', () => {
      const rng = createRandom(1);
      const player = createPlayer({ name: 'Test' }, rng);
      const originalSkill = player.skill;

      applyStatDeltas(player, { skill: 10 });

      expect(player.skill).toBe(originalSkill);
    });

    it('applies multiple deltas at once', () => {
      const rng = createRandom(1);
      const player = createPlayer({ name: 'Test' }, rng);

      const updated = applyStatDeltas(player, {
        skill: 5,
        hype: 10,
        money: -50,
      });

      expect(updated.skill).toBe(player.skill + 5);
      expect(updated.hype).toBe(player.hype + 10);
      expect(updated.money).toBe(player.money - 50);
    });
  });

  describe('clampStat', () => {
    it('returns value within range unchanged', () => {
      expect(clampStat(50)).toBe(50);
    });

    it('clamps values below minimum', () => {
      expect(clampStat(-10)).toBe(STAT_MIN);
    });

    it('clamps values above maximum', () => {
      expect(clampStat(150)).toBe(STAT_MAX);
    });

    it('uses custom min/max when provided', () => {
      expect(clampStat(50, 60, 80)).toBe(60);
      expect(clampStat(90, 60, 80)).toBe(80);
    });
  });

  describe('weekToYear', () => {
    it('returns year 1 for weeks 1-52', () => {
      expect(weekToYear(1)).toBe(1);
      expect(weekToYear(52)).toBe(1);
    });

    it('returns year 2 for weeks 53-104', () => {
      expect(weekToYear(53)).toBe(2);
      expect(weekToYear(104)).toBe(2);
    });

    it('returns year 10 for week 520', () => {
      expect(weekToYear(520)).toBe(10);
    });
  });

  describe('weekInYear', () => {
    it('returns correct week within year', () => {
      expect(weekInYear(1)).toBe(1);
      expect(weekInYear(52)).toBe(52);
      expect(weekInYear(53)).toBe(1);
      expect(weekInYear(104)).toBe(52);
    });
  });
});
