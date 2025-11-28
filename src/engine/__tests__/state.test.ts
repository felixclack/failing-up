import {
  createGameState,
  createPlayer,
  applyStatDeltas,
  clampStat,
  weekToYear,
  weekInYear,
  STAT_MIN,
  STAT_MAX,
  TALENT_LEVELS,
  getTalentFromLevel,
  getAvailableTalentLevels,
  MUSIC_STYLES,
  getAvailableStyles,
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

  describe('talent levels', () => {
    it('has four talent levels defined', () => {
      expect(TALENT_LEVELS.struggling).toBeDefined();
      expect(TALENT_LEVELS.average).toBeDefined();
      expect(TALENT_LEVELS.gifted).toBeDefined();
      expect(TALENT_LEVELS.prodigy).toBeDefined();
    });

    it('talent levels have increasing values', () => {
      expect(TALENT_LEVELS.struggling.value).toBeLessThan(TALENT_LEVELS.average.value);
      expect(TALENT_LEVELS.average.value).toBeLessThan(TALENT_LEVELS.gifted.value);
      expect(TALENT_LEVELS.gifted.value).toBeLessThan(TALENT_LEVELS.prodigy.value);
    });

    it('getTalentFromLevel returns correct values', () => {
      expect(getTalentFromLevel('struggling')).toBe(25);
      expect(getTalentFromLevel('average')).toBe(40);
      expect(getTalentFromLevel('gifted')).toBe(60);
      expect(getTalentFromLevel('prodigy')).toBe(80);
    });

    it('getAvailableTalentLevels returns all levels with details', () => {
      const levels = getAvailableTalentLevels();
      expect(levels).toHaveLength(4);
      expect(levels.map(l => l.id)).toEqual(['struggling', 'average', 'gifted', 'prodigy']);
      levels.forEach(level => {
        expect(level.name).toBeDefined();
        expect(level.description).toBeDefined();
        expect(level.value).toBeGreaterThan(0);
      });
    });
  });

  describe('music styles', () => {
    it('has all six styles defined', () => {
      expect(MUSIC_STYLES.glam).toBeDefined();
      expect(MUSIC_STYLES.punk).toBeDefined();
      expect(MUSIC_STYLES.grunge).toBeDefined();
      expect(MUSIC_STYLES.alt).toBeDefined();
      expect(MUSIC_STYLES.metal).toBeDefined();
      expect(MUSIC_STYLES.indie).toBeDefined();
    });

    it('getAvailableStyles returns all styles with details', () => {
      const styles = getAvailableStyles();
      expect(styles).toHaveLength(6);
      styles.forEach(style => {
        expect(style.id).toBeDefined();
        expect(style.name).toBeDefined();
        expect(style.description).toBeDefined();
      });
    });
  });

  describe('character creation options', () => {
    it('uses talent level to set player talent', () => {
      const state = createGameState({
        playerName: 'Test',
        talentLevel: 'prodigy',
        seed: 1,
      });

      expect(state.player.talent).toBe(80);
    });

    it('explicit playerTalent overrides talentLevel', () => {
      const state = createGameState({
        playerName: 'Test',
        talentLevel: 'struggling',
        playerTalent: 99,
        seed: 1,
      });

      expect(state.player.talent).toBe(99);
    });

    it('uses preferred style in game state', () => {
      const state = createGameState({
        playerName: 'Test',
        preferredStyle: 'metal',
        seed: 1,
      });

      expect(state.preferredStyle).toBe('metal');
    });

    it('defaults preferred style to punk', () => {
      const state = createGameState({
        playerName: 'Test',
        seed: 1,
      });

      expect(state.preferredStyle).toBe('punk');
    });

    it('combines all character options', () => {
      const state = createGameState({
        playerName: 'Axl',
        talentLevel: 'gifted',
        preferredStyle: 'glam',
        difficulty: 'hard',
        seed: 1,
      });

      expect(state.player.name).toBe('Axl');
      expect(state.player.talent).toBe(60);
      expect(state.preferredStyle).toBe('glam');
      expect(state.difficulty).toBe('hard');
    });
  });
});
