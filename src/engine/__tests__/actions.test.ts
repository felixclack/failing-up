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
      it('provides modest income with tradeoffs', () => {
        const state = createGameState({ playerName: 'Test', seed: 1 });
        const rng = createRandom(1);
        const result = executeAction('SIDE_JOB', state, rng);

        expect(result.success).toBe(true);
        expect(result.statChanges.money).toBe(120);
        expect(result.statChanges.burnout).toBe(4);
        expect(result.statChanges.hype).toBe(-3);
      });
    });
  });
});
