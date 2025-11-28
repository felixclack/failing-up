import {
  checkTriggerConditions,
  isEventEligible,
  getEligibleEvents,
  selectRandomEvent,
  shouldEventTrigger,
  applyEventChoice,
} from '../events';
import { createGameState } from '../state';
import { createRandom } from '../random';
import { GameEvent, EventChoice } from '../types';

// Test event fixtures
const testEvent: GameEvent = {
  id: 'TEST_EVENT',
  triggerConditions: {
    minFans: 100,
    maxMoney: 500,
  },
  weight: 5,
  textIntro: 'Test event intro',
  choices: [
    {
      id: 'CHOICE_A',
      label: 'Choice A',
      outcomeText: 'You chose A',
      statChanges: { money: 50, health: -5 },
    },
    {
      id: 'CHOICE_B',
      label: 'Choice B',
      outcomeText: 'You chose B',
      statChanges: { cred: 5 },
      bandmateChanges: { loyalty: -10 },
    },
  ],
};

const oneTimeEvent: GameEvent = {
  id: 'ONE_TIME_EVENT',
  triggerConditions: {},
  weight: 3,
  textIntro: 'One time only',
  choices: [
    {
      id: 'OK',
      label: 'OK',
      outcomeText: 'Done',
      statChanges: {},
    },
  ],
  oneTime: true,
};

const actionSpecificEvent: GameEvent = {
  id: 'PARTY_EVENT',
  triggerConditions: {},
  weight: 4,
  textIntro: 'Party event',
  choices: [
    {
      id: 'OK',
      label: 'OK',
      outcomeText: 'Partied',
      statChanges: { addiction: 5 },
    },
  ],
  requiredAction: 'PARTY',
};

describe('events', () => {
  describe('checkTriggerConditions', () => {
    it('returns true when all conditions met', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.fans = 200;
      state.player.money = 300;

      const result = checkTriggerConditions(testEvent.triggerConditions, state);
      expect(result).toBe(true);
    });

    it('returns false when minFans not met', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.fans = 50; // Below 100
      state.player.money = 300;

      const result = checkTriggerConditions(testEvent.triggerConditions, state);
      expect(result).toBe(false);
    });

    it('returns false when maxMoney exceeded', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.fans = 200;
      state.player.money = 600; // Above 500

      const result = checkTriggerConditions(testEvent.triggerConditions, state);
      expect(result).toBe(false);
    });

    it('checks flag conditions', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });

      const onTourConditions = { onTour: true };
      expect(checkTriggerConditions(onTourConditions, state)).toBe(false);

      state.player.flags.onTour = true;
      expect(checkTriggerConditions(onTourConditions, state)).toBe(true);
    });

    it('checks band vice average', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      // Set all bandmates to high vice
      state.bandmates = state.bandmates.map(b => ({ ...b, vice: 60 }));

      const conditions = { minBandVice: 50 };
      expect(checkTriggerConditions(conditions, state)).toBe(true);

      const highConditions = { minBandVice: 80 };
      expect(checkTriggerConditions(highConditions, state)).toBe(false);
    });
  });

  describe('isEventEligible', () => {
    it('returns true for eligible event', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.fans = 200;
      state.player.money = 300;

      expect(isEventEligible(testEvent, state)).toBe(true);
    });

    it('returns false for already triggered one-time event', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.triggeredEventIds = ['ONE_TIME_EVENT'];

      expect(isEventEligible(oneTimeEvent, state)).toBe(false);
    });

    it('returns false when required action not taken', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });

      expect(isEventEligible(actionSpecificEvent, state, 'REST')).toBe(false);
      expect(isEventEligible(actionSpecificEvent, state, 'PARTY')).toBe(true);
    });
  });

  describe('getEligibleEvents', () => {
    it('filters to only eligible events', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.fans = 200;
      state.player.money = 300;

      const allEvents = [testEvent, oneTimeEvent, actionSpecificEvent];
      const eligible = getEligibleEvents(allEvents, state, 'REST');

      expect(eligible).toContain(testEvent);
      expect(eligible).toContain(oneTimeEvent);
      expect(eligible).not.toContain(actionSpecificEvent); // Requires PARTY
    });

    it('excludes triggered one-time events', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.fans = 200;
      state.player.money = 300;
      state.triggeredEventIds = ['ONE_TIME_EVENT'];

      const allEvents = [testEvent, oneTimeEvent];
      const eligible = getEligibleEvents(allEvents, state);

      expect(eligible).toContain(testEvent);
      expect(eligible).not.toContain(oneTimeEvent);
    });
  });

  describe('selectRandomEvent', () => {
    it('returns null for empty list', () => {
      const rng = createRandom(1);
      expect(selectRandomEvent([], rng)).toBeNull();
    });

    it('returns an event from the list', () => {
      const rng = createRandom(1);
      const events = [testEvent, oneTimeEvent];

      const selected = selectRandomEvent(events, rng);
      expect(events).toContain(selected);
    });

    it('respects weights in selection', () => {
      const highWeightEvent: GameEvent = {
        ...testEvent,
        id: 'HIGH_WEIGHT',
        weight: 100,
      };
      const lowWeightEvent: GameEvent = {
        ...testEvent,
        id: 'LOW_WEIGHT',
        weight: 1,
      };

      // Run many trials
      const counts: Record<string, number> = { HIGH_WEIGHT: 0, LOW_WEIGHT: 0 };
      for (let i = 0; i < 1000; i++) {
        const rng = createRandom(i);
        const selected = selectRandomEvent([highWeightEvent, lowWeightEvent], rng);
        if (selected) counts[selected.id]++;
      }

      // High weight should be selected much more often
      expect(counts.HIGH_WEIGHT).toBeGreaterThan(counts.LOW_WEIGHT * 10);
    });
  });

  describe('shouldEventTrigger', () => {
    it('triggers based on base chance', () => {
      // Run many trials to verify approximate rate
      let triggered = 0;
      for (let i = 0; i < 1000; i++) {
        const state = createGameState({ playerName: 'Test', seed: i });
        const rng = createRandom(i);
        if (shouldEventTrigger(state, rng, 0.5)) triggered++;
      }

      // Should be roughly 50% with some variance
      expect(triggered).toBeGreaterThan(400);
      expect(triggered).toBeLessThan(600);
    });

    it('increases chance with high addiction', () => {
      let normalTriggered = 0;
      let addictedTriggered = 0;

      for (let i = 0; i < 500; i++) {
        const normalState = createGameState({ playerName: 'Test', seed: i });
        normalState.player.addiction = 20;
        if (shouldEventTrigger(normalState, createRandom(i), 0.3)) normalTriggered++;

        const addictedState = createGameState({ playerName: 'Test', seed: i });
        addictedState.player.addiction = 80;
        if (shouldEventTrigger(addictedState, createRandom(i), 0.3)) addictedTriggered++;
      }

      expect(addictedTriggered).toBeGreaterThan(normalTriggered);
    });
  });

  describe('applyEventChoice', () => {
    it('applies stat changes', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      const initialMoney = state.player.money;
      const initialHealth = state.player.health;

      const newState = applyEventChoice(state, testEvent, testEvent.choices[0]);

      expect(newState.player.money).toBe(initialMoney + 50);
      expect(newState.player.health).toBe(initialHealth - 5);
    });

    it('applies bandmate changes', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      const initialLoyalty = state.bandmates[0].loyalty;

      const newState = applyEventChoice(state, testEvent, testEvent.choices[1]);

      expect(newState.bandmates[0].loyalty).toBe(initialLoyalty - 10);
    });

    it('marks one-time event as triggered', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      expect(state.triggeredEventIds).not.toContain('ONE_TIME_EVENT');

      const newState = applyEventChoice(state, oneTimeEvent, oneTimeEvent.choices[0]);

      expect(newState.triggeredEventIds).toContain('ONE_TIME_EVENT');
    });

    it('does not mutate original state', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      const originalMoney = state.player.money;

      applyEventChoice(state, testEvent, testEvent.choices[0]);

      expect(state.player.money).toBe(originalMoney);
    });

    it('clamps stats to valid ranges', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.health = 3;

      const damageChoice: EventChoice = {
        id: 'DAMAGE',
        label: 'Damage',
        outcomeText: 'Ouch',
        statChanges: { health: -10 },
      };

      const newState = applyEventChoice(state, testEvent, damageChoice);

      expect(newState.player.health).toBe(0); // Clamped, not negative
    });
  });
});
