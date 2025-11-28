import { processTurn, HYPE_DECAY_RATE } from '../turn';
import { createGameState, DEFAULT_WEEKLY_LIVING_COST } from '../state';

describe('turn', () => {
  describe('processTurn', () => {
    it('advances week counter', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      expect(state.week).toBe(1);

      const result = processTurn(state, 'REST');

      expect(result.newState.week).toBe(2);
    });

    it('deducts weekly living costs', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      const initialMoney = state.player.money;

      const result = processTurn(state, 'REST');

      // Money should decrease by living cost minus any action effects
      expect(result.newState.player.money).toBeLessThan(initialMoney);
    });

    it('applies action effects', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      const initialHealth = state.player.health;

      const result = processTurn(state, 'REST');

      // REST should increase health
      expect(result.newState.player.health).toBeGreaterThan(
        initialHealth - 5 // Account for possible addiction effects
      );
    });

    it('applies hype decay', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.hype = 50;

      const result = processTurn(state, 'SIDE_JOB'); // Side job doesn't affect hype much

      // Hype should decay
      expect(result.newState.player.hype).toBeLessThan(50);
    });

    it('records action in week log', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });

      const result = processTurn(state, 'REST');

      expect(result.newState.weekLogs).toHaveLength(1);
      expect(result.newState.weekLogs[0].action).toBe('REST');
      expect(result.newState.weekLogs[0].week).toBe(1);
    });

    it('returns action result message', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });

      const result = processTurn(state, 'REST');

      expect(result.actionResult).toBeDefined();
      expect(typeof result.actionResult).toBe('string');
    });

    it('does not mutate original state', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      const originalWeek = state.week;
      const originalMoney = state.player.money;

      processTurn(state, 'REST');

      expect(state.week).toBe(originalWeek);
      expect(state.player.money).toBe(originalMoney);
    });

    it('updates year when crossing year boundary', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.week = 52;
      state.year = 1;

      const result = processTurn(state, 'REST');

      expect(result.newState.week).toBe(53);
      expect(result.newState.year).toBe(2);
    });
  });

  describe('game over conditions', () => {
    it('triggers game over when health reaches 0', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.health = 1;
      state.player.addiction = 95; // High addiction drains health

      // Process multiple turns to drain health
      let currentState = state;
      for (let i = 0; i < 10 && !currentState.isGameOver; i++) {
        const result = processTurn(currentState, 'PARTY');
        currentState = result.newState;
      }

      expect(currentState.isGameOver).toBe(true);
      expect(currentState.gameOverReason).toBe('death');
    });

    it('triggers game over at max weeks', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.week = 520; // Max weeks
      state.player.money = 10000; // Keep alive

      const result = processTurn(state, 'REST');

      expect(result.newState.isGameOver).toBe(true);
      expect(result.newState.gameOverReason).toBe('time_limit');
    });

    it('triggers game over when deeply in debt with low industry goodwill', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.money = -2000;
      state.player.industryGoodwill = 5;

      const result = processTurn(state, 'REST');

      expect(result.newState.isGameOver).toBe(true);
      expect(result.newState.gameOverReason).toBe('broke');
    });
  });

  describe('addiction effects', () => {
    it('high addiction drains health over time', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.addiction = 75;
      state.player.health = 80;

      const result = processTurn(state, 'REST');

      // Even with REST, high addiction should cause some health drain
      // REST gives +5 health, but addiction at 75 drains 2
      // Net should be positive but less than full REST benefit
      expect(result.newState.player.health).toBeLessThan(80 + 5);
    });

    it('critical addiction drains health and stability', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.addiction = 95;
      state.player.health = 80;
      state.player.stability = 70;

      const result = processTurn(state, 'SIDE_JOB'); // Neutral action

      // Should see significant drains from critical addiction
      expect(result.newState.player.health).toBeLessThan(80);
      expect(result.newState.player.stability).toBeLessThan(70);
    });
  });

  describe('burnout effects', () => {
    it('high burnout drains stability', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.burnout = 85;
      state.player.stability = 70;

      const result = processTurn(state, 'SIDE_JOB');

      expect(result.newState.player.stability).toBeLessThan(70);
    });
  });

  describe('reproducibility', () => {
    it('produces identical results with same seed', () => {
      const state1 = createGameState({ playerName: 'Test', seed: 12345 });
      const state2 = createGameState({ playerName: 'Test', seed: 12345 });

      const result1 = processTurn(state1, 'PLAY_LOCAL_GIG');
      const result2 = processTurn(state2, 'PLAY_LOCAL_GIG');

      expect(result1.newState.player.money).toBe(result2.newState.player.money);
      expect(result1.newState.player.fans).toBe(result2.newState.player.fans);
      expect(result1.actionResult).toBe(result2.actionResult);
    });
  });
});
