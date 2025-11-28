import {
  ACTIONS,
  isActionAvailable,
  getAvailableActions,
  executeAction,
} from '../actions';
import { createGameState } from '../state';
import { createRandom } from '../random';

describe('actions', () => {
  describe('ACTIONS', () => {
    it('defines REST action', () => {
      expect(ACTIONS.REST).toBeDefined();
      expect(ACTIONS.REST.label).toBe('Rest / Lay Low');
      expect(ACTIONS.REST.baseEffects.health).toBeGreaterThan(0);
      expect(ACTIONS.REST.baseEffects.hype).toBeLessThan(0);
    });

    it('defines WRITE action', () => {
      expect(ACTIONS.WRITE).toBeDefined();
      expect(ACTIONS.WRITE.hasSpecialLogic).toBe(true);
      expect(ACTIONS.WRITE.requirements.onTour).toBe(false);
    });

    it('defines PLAY_LOCAL_GIG action', () => {
      expect(ACTIONS.PLAY_LOCAL_GIG).toBeDefined();
      expect(ACTIONS.PLAY_LOCAL_GIG.hasSpecialLogic).toBe(true);
      expect(ACTIONS.PLAY_LOCAL_GIG.requirements.minHealth).toBe(20);
    });
  });

  describe('isActionAvailable', () => {
    it('returns true for REST (no requirements)', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      expect(isActionAvailable('REST', state)).toBe(true);
    });

    it('returns true for WRITE when not on tour', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      expect(state.player.flags.onTour).toBe(false);
      expect(isActionAvailable('WRITE', state)).toBe(true);
    });

    it('returns false for WRITE when on tour', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.flags.onTour = true;
      expect(isActionAvailable('WRITE', state)).toBe(false);
    });

    it('returns false for PLAY_LOCAL_GIG when health too low', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.health = 10;
      expect(isActionAvailable('PLAY_LOCAL_GIG', state)).toBe(false);
    });

    it('returns false for TOUR without label deal', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      expect(state.player.flags.hasLabelDeal).toBe(false);
      expect(isActionAvailable('TOUR', state)).toBe(false);
    });
  });

  describe('getAvailableActions', () => {
    it('returns array of available action IDs', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      const available = getAvailableActions(state);

      expect(available).toContain('REST');
      expect(available).toContain('WRITE');
      expect(available).toContain('PLAY_LOCAL_GIG');
      expect(available).toContain('PARTY');
      expect(available).toContain('SIDE_JOB');
    });

    it('excludes TOUR without label deal', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      const available = getAvailableActions(state);

      expect(available).not.toContain('TOUR');
    });
  });

  describe('executeAction', () => {
    describe('REST', () => {
      it('returns success with health increase', () => {
        const state = createGameState({ playerName: 'Test', seed: 1 });
        const rng = createRandom(1);
        const result = executeAction('REST', state, rng);

        expect(result.success).toBe(true);
        expect(result.statChanges.health).toBeGreaterThan(0);
        expect(result.statChanges.stability).toBeGreaterThan(0);
        expect(result.statChanges.hype).toBeLessThan(0);
      });
    });

    describe('WRITE', () => {
      it('returns success', () => {
        const state = createGameState({ playerName: 'Test', seed: 1 });
        const rng = createRandom(1);
        const result = executeAction('WRITE', state, rng);

        expect(result.success).toBe(true);
        expect(result.message).toBeDefined();
      });

      it('sometimes produces a song', () => {
        // Try multiple seeds to find one that produces a song
        let producedSong = false;
        for (let seed = 1; seed <= 100; seed++) {
          const state = createGameState({ playerName: 'Test', seed });
          state.player.skill = 80; // High skill increases write chance
          const rng = createRandom(seed);
          const result = executeAction('WRITE', state, rng);

          if (result.producedSongId) {
            producedSong = true;
            expect(result.message).toContain('"');
            break;
          }
        }
        expect(producedSong).toBe(true);
      });

      it('always increases skill', () => {
        const state = createGameState({ playerName: 'Test', seed: 1 });
        const rng = createRandom(1);
        const result = executeAction('WRITE', state, rng);

        expect(result.statChanges.skill).toBeGreaterThan(0);
      });
    });

    describe('PLAY_LOCAL_GIG', () => {
      it('returns success with money', () => {
        const state = createGameState({ playerName: 'Test', seed: 1 });
        const rng = createRandom(1);
        const result = executeAction('PLAY_LOCAL_GIG', state, rng);

        expect(result.success).toBe(true);
        expect(result.statChanges.money).toBeGreaterThan(0);
      });

      it('returns variable results based on seed', () => {
        const state1 = createGameState({ playerName: 'Test', seed: 12345 });
        const state2 = createGameState({ playerName: 'Test', seed: 99999 });

        const result1 = executeAction('PLAY_LOCAL_GIG', state1, createRandom(12345));
        const result2 = executeAction('PLAY_LOCAL_GIG', state2, createRandom(99999));

        // Results should differ with significantly different seeds
        // Both money amounts should vary OR messages should differ
        expect(
          result1.message !== result2.message ||
          result1.statChanges.money !== result2.statChanges.money
        ).toBe(true);
      });

      it('fails when health is too low', () => {
        const state = createGameState({ playerName: 'Test', seed: 1 });
        state.player.health = 10;
        const rng = createRandom(1);
        const result = executeAction('PLAY_LOCAL_GIG', state, rng);

        expect(result.success).toBe(false);
      });
    });

    describe('PARTY', () => {
      it('increases addiction and image', () => {
        const state = createGameState({ playerName: 'Test', seed: 1 });
        const rng = createRandom(1);
        const result = executeAction('PARTY', state, rng);

        expect(result.success).toBe(true);
        expect(result.statChanges.addiction).toBeGreaterThan(0);
        expect(result.statChanges.image).toBeGreaterThan(0);
      });

      it('decreases health and stability', () => {
        const state = createGameState({ playerName: 'Test', seed: 1 });
        const rng = createRandom(1);
        const result = executeAction('PARTY', state, rng);

        expect(result.statChanges.health).toBeLessThan(0);
        expect(result.statChanges.stability).toBeLessThan(0);
      });
    });

    describe('SIDE_JOB', () => {
      it('provides steady income', () => {
        const state = createGameState({ playerName: 'Test', seed: 1 });
        const rng = createRandom(1);
        const result = executeAction('SIDE_JOB', state, rng);

        expect(result.success).toBe(true);
        expect(result.statChanges.money).toBe(150);
      });
    });
  });
});
