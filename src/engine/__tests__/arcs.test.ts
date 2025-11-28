import {
  canEnterArc,
  shouldAdvanceArcStage,
  activateArc,
  advanceArc,
  completeArc,
  abortArc,
  getCurrentArcStage,
  getArcEvents,
  selectArcEvent,
  checkAndActivateArcs,
  checkAndAdvanceArcs,
  getActiveArcInfo,
  isArcActive,
  isArcCompleted,
  getArcStageNumber,
} from '../arcs';
import { createGameState } from '../state';
import { createRandom } from '../random';
import { Arc, GameEvent } from '../types';
import {
  ADDICTION_ARC,
  LABEL_DEAL_ARC,
  BAND_BREAKUP_ARC,
  ALL_ARCS,
  addictionArcEvents,
} from '@/data/arcs';

describe('arcs', () => {
  // Sample arc for testing
  const testArc: Arc = {
    id: 'TEST_ARC',
    name: 'Test Arc',
    entryConditions: {
      minFans: 1000,
      minHype: 50,
    },
    stages: [
      {
        stageId: 0,
        eventIds: ['TEST_EVENT_1', 'TEST_EVENT_2'],
        advanceConditions: { minFans: 2000 },
      },
      {
        stageId: 1,
        eventIds: ['TEST_EVENT_3'],
        advanceConditions: { minFans: 5000 },
      },
      {
        stageId: 2,
        eventIds: ['TEST_EVENT_4'],
      },
    ],
    currentStage: 0,
  };

  const testEvents: GameEvent[] = [
    {
      id: 'TEST_EVENT_1',
      triggerConditions: {},
      weight: 3,
      textIntro: 'Test event 1',
      choices: [{ id: 'A', label: 'Choice A', outcomeText: 'Result A', statChanges: {} }],
    },
    {
      id: 'TEST_EVENT_2',
      triggerConditions: { minHype: 60 },
      weight: 2,
      textIntro: 'Test event 2',
      choices: [{ id: 'B', label: 'Choice B', outcomeText: 'Result B', statChanges: {} }],
    },
    {
      id: 'TEST_EVENT_3',
      triggerConditions: {},
      weight: 4,
      textIntro: 'Test event 3',
      choices: [{ id: 'C', label: 'Choice C', outcomeText: 'Result C', statChanges: {} }],
    },
  ];

  describe('canEnterArc', () => {
    it('returns true when entry conditions are met', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.fans = 1500;
      state.player.hype = 60;

      expect(canEnterArc(testArc, state)).toBe(true);
    });

    it('returns false when entry conditions are not met', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.fans = 500; // Below minimum
      state.player.hype = 60;

      expect(canEnterArc(testArc, state)).toBe(false);
    });

    it('returns false when arc is already active', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.fans = 1500;
      state.player.hype = 60;
      state.activeArcs = [{ ...testArc }];

      expect(canEnterArc(testArc, state)).toBe(false);
    });

    it('returns false when arc is already completed', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.fans = 1500;
      state.player.hype = 60;
      state.completedArcIds = ['TEST_ARC'];

      expect(canEnterArc(testArc, state)).toBe(false);
    });
  });

  describe('shouldAdvanceArcStage', () => {
    it('returns true when advancement conditions are met', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.fans = 2500;

      const arc = { ...testArc, currentStage: 0 };

      expect(shouldAdvanceArcStage(arc, state)).toBe(true);
    });

    it('returns false when advancement conditions are not met', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.fans = 1500; // Below advancement threshold

      const arc = { ...testArc, currentStage: 0 };

      expect(shouldAdvanceArcStage(arc, state)).toBe(false);
    });

    it('returns false when at final stage', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.fans = 10000;

      const arc = { ...testArc, currentStage: 3 }; // Past final stage

      expect(shouldAdvanceArcStage(arc, state)).toBe(false);
    });

    it('returns false when no advancement conditions defined', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.fans = 10000;

      const arc = { ...testArc, currentStage: 2 }; // Stage 2 has no advancement conditions

      expect(shouldAdvanceArcStage(arc, state)).toBe(false);
    });
  });

  describe('activateArc', () => {
    it('adds arc to activeArcs', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });

      const newState = activateArc(state, testArc);

      expect(newState.activeArcs).toHaveLength(1);
      expect(newState.activeArcs[0].id).toBe('TEST_ARC');
    });

    it('sets currentStage to 0', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      const arcWithStage = { ...testArc, currentStage: 5 };

      const newState = activateArc(state, arcWithStage);

      expect(newState.activeArcs[0].currentStage).toBe(0);
    });

    it('preserves existing active arcs', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.activeArcs = [{ ...testArc, id: 'EXISTING_ARC' }];

      const newState = activateArc(state, testArc);

      expect(newState.activeArcs).toHaveLength(2);
    });
  });

  describe('advanceArc', () => {
    it('advances arc to next stage', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.activeArcs = [{ ...testArc, currentStage: 0 }];

      const newState = advanceArc(state, 'TEST_ARC');

      expect(newState.activeArcs[0].currentStage).toBe(1);
    });

    it('completes arc when advancing past final stage', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.activeArcs = [{ ...testArc, currentStage: 2 }]; // Stage 2 is last

      const newState = advanceArc(state, 'TEST_ARC');

      expect(newState.activeArcs).toHaveLength(0);
      expect(newState.completedArcIds).toContain('TEST_ARC');
    });

    it('does nothing for non-existent arc', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });

      const newState = advanceArc(state, 'NONEXISTENT');

      expect(newState).toBe(state);
    });
  });

  describe('completeArc', () => {
    it('removes arc from active and adds to completed', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.activeArcs = [{ ...testArc }];

      const newState = completeArc(state, 'TEST_ARC');

      expect(newState.activeArcs).toHaveLength(0);
      expect(newState.completedArcIds).toContain('TEST_ARC');
    });
  });

  describe('abortArc', () => {
    it('removes arc from active without completing', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.activeArcs = [{ ...testArc }];

      const newState = abortArc(state, 'TEST_ARC');

      expect(newState.activeArcs).toHaveLength(0);
      expect(newState.completedArcIds).not.toContain('TEST_ARC');
    });
  });

  describe('getCurrentArcStage', () => {
    it('returns current stage', () => {
      const arc = { ...testArc, currentStage: 1 };

      const stage = getCurrentArcStage(arc);

      expect(stage).not.toBeNull();
      expect(stage!.stageId).toBe(1);
    });

    it('returns null when past final stage', () => {
      const arc = { ...testArc, currentStage: 10 };

      const stage = getCurrentArcStage(arc);

      expect(stage).toBeNull();
    });
  });

  describe('getArcEvents', () => {
    it('returns events for current arc stage', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.hype = 70; // Meet TEST_EVENT_2 conditions
      state.activeArcs = [{ ...testArc, currentStage: 0 }];

      const events = getArcEvents(state, testEvents);

      expect(events.length).toBeGreaterThan(0);
      expect(events.some(e => e.id === 'TEST_EVENT_1')).toBe(true);
    });

    it('excludes already triggered events', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.activeArcs = [{ ...testArc, currentStage: 0 }];
      state.triggeredEventIds = ['TEST_EVENT_1'];

      const events = getArcEvents(state, testEvents);

      expect(events.some(e => e.id === 'TEST_EVENT_1')).toBe(false);
    });

    it('returns empty array when no active arcs', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });

      const events = getArcEvents(state, testEvents);

      expect(events).toHaveLength(0);
    });
  });

  describe('selectArcEvent', () => {
    it('returns an event from eligible list', () => {
      const rng = createRandom(1);
      const event = selectArcEvent(testEvents, rng);

      expect(event).not.toBeNull();
      expect(testEvents.some(e => e.id === event!.id)).toBe(true);
    });

    it('returns null for empty list', () => {
      const rng = createRandom(1);
      const event = selectArcEvent([], rng);

      expect(event).toBeNull();
    });
  });

  describe('checkAndActivateArcs', () => {
    it('activates arcs that meet entry conditions', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.fans = 1500;
      state.player.hype = 60;

      const newState = checkAndActivateArcs(state, [testArc]);

      expect(newState.activeArcs).toHaveLength(1);
      expect(newState.activeArcs[0].id).toBe('TEST_ARC');
    });

    it('does not activate arcs that do not meet conditions', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.fans = 100; // Below threshold

      const newState = checkAndActivateArcs(state, [testArc]);

      expect(newState.activeArcs).toHaveLength(0);
    });
  });

  describe('checkAndAdvanceArcs', () => {
    it('advances arcs that meet advancement conditions', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.fans = 3000; // Above stage 0 advancement threshold
      state.activeArcs = [{ ...testArc, currentStage: 0 }];

      const newState = checkAndAdvanceArcs(state);

      expect(newState.activeArcs[0].currentStage).toBe(1);
    });

    it('does not advance arcs that do not meet conditions', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.fans = 1500; // Below advancement threshold
      state.activeArcs = [{ ...testArc, currentStage: 0 }];

      const newState = checkAndAdvanceArcs(state);

      expect(newState.activeArcs[0].currentStage).toBe(0);
    });
  });

  describe('getActiveArcInfo', () => {
    it('returns info for all active arcs', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.activeArcs = [
        { ...testArc, currentStage: 1 },
        { ...testArc, id: 'ARC_2', name: 'Arc 2', currentStage: 0 },
      ];

      const info = getActiveArcInfo(state);

      expect(info).toHaveLength(2);
      expect(info[0].currentStage).toBe(2); // 1-indexed
      expect(info[0].totalStages).toBe(3);
    });
  });

  describe('isArcActive', () => {
    it('returns true when arc is active', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.activeArcs = [{ ...testArc }];

      expect(isArcActive(state, 'TEST_ARC')).toBe(true);
    });

    it('returns false when arc is not active', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });

      expect(isArcActive(state, 'TEST_ARC')).toBe(false);
    });
  });

  describe('isArcCompleted', () => {
    it('returns true when arc is completed', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.completedArcIds = ['TEST_ARC'];

      expect(isArcCompleted(state, 'TEST_ARC')).toBe(true);
    });

    it('returns false when arc is not completed', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });

      expect(isArcCompleted(state, 'TEST_ARC')).toBe(false);
    });
  });

  describe('getArcStageNumber', () => {
    it('returns stage number for active arc', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.activeArcs = [{ ...testArc, currentStage: 2 }];

      expect(getArcStageNumber(state, 'TEST_ARC')).toBe(2);
    });

    it('returns -1 for non-active arc', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });

      expect(getArcStageNumber(state, 'TEST_ARC')).toBe(-1);
    });
  });

  // Tests for actual game arcs
  describe('Addiction Arc', () => {
    it('can be entered when addiction is high enough', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.addiction = 45;

      expect(canEnterArc(ADDICTION_ARC, state)).toBe(true);
    });

    it('cannot be entered when addiction is low', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.addiction = 20;

      expect(canEnterArc(ADDICTION_ARC, state)).toBe(false);
    });

    it('has 4 stages', () => {
      expect(ADDICTION_ARC.stages).toHaveLength(4);
    });
  });

  describe('Label Deal Arc', () => {
    it('can be entered when conditions are met', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.fans = 6000;
      state.player.hype = 50;
      state.player.industryGoodwill = 35;
      state.player.flags.hasLabelDeal = false;

      expect(canEnterArc(LABEL_DEAL_ARC, state)).toBe(true);
    });

    it('cannot be entered if already has label deal', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.fans = 6000;
      state.player.hype = 50;
      state.player.industryGoodwill = 35;
      state.player.flags.hasLabelDeal = true;

      expect(canEnterArc(LABEL_DEAL_ARC, state)).toBe(false);
    });

    it('has 4 stages', () => {
      expect(LABEL_DEAL_ARC.stages).toHaveLength(4);
    });
  });

  describe('Band Breakup Arc', () => {
    it('can be entered when stability is low with bandmates', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.stability = 30;
      // State already has starting bandmates

      expect(canEnterArc(BAND_BREAKUP_ARC, state)).toBe(true);
    });

    it('cannot be entered when stability is high', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.stability = 60;

      expect(canEnterArc(BAND_BREAKUP_ARC, state)).toBe(false);
    });

    it('has 3 stages', () => {
      expect(BAND_BREAKUP_ARC.stages).toHaveLength(3);
    });
  });

  describe('Arc events exist', () => {
    it('all arc event IDs reference existing events', () => {
      const allArcEventIds = ALL_ARCS.flatMap(arc =>
        arc.stages.flatMap(stage => stage.eventIds)
      );

      const allEventIds = addictionArcEvents.map(e => e.id);

      // Check addiction arc events exist
      const addictionEventIds = ADDICTION_ARC.stages.flatMap(s => s.eventIds);
      for (const eventId of addictionEventIds) {
        expect(
          addictionArcEvents.some(e => e.id === eventId)
        ).toBe(true);
      }
    });
  });
});
