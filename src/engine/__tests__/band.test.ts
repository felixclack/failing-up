import {
  generateBandmateCandidate,
  generateAuditionCandidates,
  fireBandmate,
  hireBandmate,
  bandmateQuits,
  bandmateToRehab,
  bandmateDies,
  getActiveBandmates,
  calculateBandTalent,
  calculateBandReliability,
  calculateBandVice,
  calculateBandLoyalty,
  calculateBandPerformance,
  getBandmatesAtRisk,
  checkForQuits,
  checkForReliabilityIssue,
  checkForViceTrouble,
  updateBandLoyalty,
  applyWeeklyLoyaltyChanges,
  isBandComplete,
  getMissingRoles,
  AUDITION_COST,
  LOYALTY_QUIT_THRESHOLD,
  LOYALTY_ULTIMATUM_THRESHOLD,
} from '../band';
import { createGameState } from '../state';
import { createRandom } from '../random';
import { Bandmate } from '../types';

describe('band', () => {
  describe('generateBandmateCandidate', () => {
    it('generates a bandmate with the specified role', () => {
      const rng = createRandom(1);
      const candidate = generateBandmateCandidate('guitar', 1000, rng);

      expect(candidate.role).toBe('guitar');
      expect(candidate.status).toBe('active');
    });

    it('generates unique names', () => {
      const rng = createRandom(1);
      const usedNames = ['Johnny Thunder'];
      const candidate = generateBandmateCandidate('bass', 1000, rng, usedNames);

      expect(candidate.name).not.toBe('Johnny Thunder');
    });

    it('generates stats within valid ranges', () => {
      const rng = createRandom(42);
      const candidate = generateBandmateCandidate('drums', 1000, rng);

      expect(candidate.talent).toBeGreaterThanOrEqual(0);
      expect(candidate.talent).toBeLessThanOrEqual(100);
      expect(candidate.reliability).toBeGreaterThanOrEqual(0);
      expect(candidate.reliability).toBeLessThanOrEqual(100);
      expect(candidate.vice).toBeGreaterThanOrEqual(0);
      expect(candidate.vice).toBeLessThanOrEqual(100);
      expect(candidate.loyalty).toBeGreaterThanOrEqual(0);
      expect(candidate.loyalty).toBeLessThanOrEqual(100);
    });

    it('generates better candidates with more fans (fame bonus)', () => {
      const rng1 = createRandom(1);
      const rng2 = createRandom(1);

      const lowFameCandidate = generateBandmateCandidate('guitar', 100, rng1);
      const highFameCandidate = generateBandmateCandidate('guitar', 100000, rng2);

      // With same seed, higher fame should produce higher talent range
      // We test this by generating multiple and checking average
      const lowFameTalents: number[] = [];
      const highFameTalents: number[] = [];

      for (let i = 0; i < 10; i++) {
        lowFameTalents.push(generateBandmateCandidate('guitar', 100, createRandom(i)).talent);
        highFameTalents.push(generateBandmateCandidate('guitar', 100000, createRandom(i)).talent);
      }

      const lowAvg = lowFameTalents.reduce((a, b) => a + b, 0) / lowFameTalents.length;
      const highAvg = highFameTalents.reduce((a, b) => a + b, 0) / highFameTalents.length;

      expect(highAvg).toBeGreaterThan(lowAvg);
    });
  });

  describe('generateAuditionCandidates', () => {
    it('generates the specified number of candidates', () => {
      const rng = createRandom(1);
      const candidates = generateAuditionCandidates('guitar', 3, 1000, rng, []);

      expect(candidates).toHaveLength(3);
    });

    it('all candidates have the specified role', () => {
      const rng = createRandom(1);
      const candidates = generateAuditionCandidates('bass', 5, 1000, rng, []);

      expect(candidates.every(c => c.role === 'bass')).toBe(true);
    });

    it('generates unique names among candidates', () => {
      const rng = createRandom(1);
      const candidates = generateAuditionCandidates('drums', 5, 1000, rng, []);

      const names = candidates.map(c => c.name);
      const uniqueNames = new Set(names);

      expect(uniqueNames.size).toBe(names.length);
    });
  });

  describe('fireBandmate', () => {
    it('changes bandmate status to fired', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      const bandmate: Bandmate = {
        id: 'test_bandmate',
        name: 'Test Guy',
        role: 'guitar',
        talent: 50,
        reliability: 50,
        vice: 30,
        loyalty: 50,
        status: 'active',
      };
      state.bandmates = [bandmate];

      const newState = fireBandmate(state, 'test_bandmate');

      expect(newState.bandmates[0].status).toBe('fired');
    });

    it('reduces other bandmates loyalty', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      const bandmates: Bandmate[] = [
        { id: 'b1', name: 'Guy 1', role: 'guitar', talent: 50, reliability: 50, vice: 30, loyalty: 50, status: 'active' },
        { id: 'b2', name: 'Guy 2', role: 'bass', talent: 50, reliability: 50, vice: 30, loyalty: 50, status: 'active' },
      ];
      state.bandmates = bandmates;

      const newState = fireBandmate(state, 'b1');

      expect(newState.bandmates[1].loyalty).toBe(45); // -5 from firing
    });

    it('does not change state if bandmate not found', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });

      const newState = fireBandmate(state, 'nonexistent');

      expect(newState).toBe(state);
    });
  });

  describe('hireBandmate', () => {
    it('adds new bandmate to array', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.bandmates = []; // Clear starting band
      const candidate: Bandmate = {
        id: 'new_hire',
        name: 'New Guy',
        role: 'guitar',
        talent: 60,
        reliability: 70,
        vice: 20,
        loyalty: 50,
        status: 'active',
      };

      const newState = hireBandmate(state, candidate);

      expect(newState.bandmates).toHaveLength(1);
      expect(newState.bandmates[0].id).toBe('new_hire');
    });

    it('deducts audition cost', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      const initialMoney = state.player.money;
      const candidate: Bandmate = {
        id: 'new_hire',
        name: 'New Guy',
        role: 'guitar',
        talent: 60,
        reliability: 70,
        vice: 20,
        loyalty: 50,
        status: 'active',
      };

      const newState = hireBandmate(state, candidate);

      expect(newState.player.money).toBe(initialMoney - AUDITION_COST);
    });

    it('fires existing member in same role', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      const existing: Bandmate = {
        id: 'old_guitar',
        name: 'Old Guy',
        role: 'guitar',
        talent: 40,
        reliability: 60,
        vice: 40,
        loyalty: 30,
        status: 'active',
      };
      state.bandmates = [existing];

      const candidate: Bandmate = {
        id: 'new_guitar',
        name: 'New Guy',
        role: 'guitar',
        talent: 70,
        reliability: 80,
        vice: 20,
        loyalty: 50,
        status: 'active',
      };

      const newState = hireBandmate(state, candidate);

      expect(newState.bandmates).toHaveLength(2);
      expect(newState.bandmates[0].status).toBe('fired');
      expect(newState.bandmates[1].status).toBe('active');
    });
  });

  describe('bandmateQuits', () => {
    it('changes status to quit', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.bandmates = [{
        id: 'b1',
        name: 'Quitter',
        role: 'drums',
        talent: 50,
        reliability: 50,
        vice: 30,
        loyalty: 10,
        status: 'active',
      }];

      const newState = bandmateQuits(state, 'b1');

      expect(newState.bandmates[0].status).toBe('quit');
    });
  });

  describe('bandmateToRehab', () => {
    it('changes status to rehab', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.bandmates = [{
        id: 'b1',
        name: 'Addict',
        role: 'bass',
        talent: 60,
        reliability: 30,
        vice: 80,
        loyalty: 40,
        status: 'active',
      }];

      const newState = bandmateToRehab(state, 'b1');

      expect(newState.bandmates[0].status).toBe('rehab');
    });
  });

  describe('bandmateDies', () => {
    it('changes status to dead', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.bandmates = [{
        id: 'b1',
        name: 'Tragic',
        role: 'keys',
        talent: 70,
        reliability: 50,
        vice: 90,
        loyalty: 50,
        status: 'active',
      }];

      const newState = bandmateDies(state, 'b1');

      expect(newState.bandmates[0].status).toBe('dead');
    });

    it('reduces player stability', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      const initialStability = state.player.stability;
      state.bandmates = [{
        id: 'b1',
        name: 'Tragic',
        role: 'keys',
        talent: 70,
        reliability: 50,
        vice: 90,
        loyalty: 50,
        status: 'active',
      }];

      const newState = bandmateDies(state, 'b1');

      expect(newState.player.stability).toBe(initialStability - 15);
    });
  });

  describe('getActiveBandmates', () => {
    it('returns only active bandmates', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.bandmates = [
        { id: 'b1', name: 'Active', role: 'guitar', talent: 50, reliability: 50, vice: 30, loyalty: 50, status: 'active' },
        { id: 'b2', name: 'Fired', role: 'bass', talent: 50, reliability: 50, vice: 30, loyalty: 50, status: 'fired' },
        { id: 'b3', name: 'Quit', role: 'drums', talent: 50, reliability: 50, vice: 30, loyalty: 50, status: 'quit' },
      ];

      const active = getActiveBandmates(state);

      expect(active).toHaveLength(1);
      expect(active[0].id).toBe('b1');
    });
  });

  describe('calculateBandTalent', () => {
    it('returns 0 with no bandmates', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.bandmates = []; // Clear starting band

      expect(calculateBandTalent(state)).toBe(0);
    });

    it('returns average of active bandmate talents', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.bandmates = [
        { id: 'b1', name: 'A', role: 'guitar', talent: 60, reliability: 50, vice: 30, loyalty: 50, status: 'active' },
        { id: 'b2', name: 'B', role: 'bass', talent: 80, reliability: 50, vice: 30, loyalty: 50, status: 'active' },
      ];

      expect(calculateBandTalent(state)).toBe(70);
    });
  });

  describe('calculateBandReliability', () => {
    it('returns 100 with no bandmates (solo)', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.bandmates = []; // Clear starting band

      expect(calculateBandReliability(state)).toBe(100);
    });

    it('returns average of active bandmate reliability', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.bandmates = [
        { id: 'b1', name: 'A', role: 'guitar', talent: 50, reliability: 40, vice: 30, loyalty: 50, status: 'active' },
        { id: 'b2', name: 'B', role: 'bass', talent: 50, reliability: 60, vice: 30, loyalty: 50, status: 'active' },
      ];

      expect(calculateBandReliability(state)).toBe(50);
    });
  });

  describe('calculateBandVice', () => {
    it('returns 0 with no bandmates', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.bandmates = []; // Clear starting band

      expect(calculateBandVice(state)).toBe(0);
    });

    it('returns average of active bandmate vice', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.bandmates = [
        { id: 'b1', name: 'A', role: 'guitar', talent: 50, reliability: 50, vice: 20, loyalty: 50, status: 'active' },
        { id: 'b2', name: 'B', role: 'bass', talent: 50, reliability: 50, vice: 60, loyalty: 50, status: 'active' },
      ];

      expect(calculateBandVice(state)).toBe(40);
    });
  });

  describe('calculateBandLoyalty', () => {
    it('returns 100 with no bandmates', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.bandmates = []; // Clear starting band

      expect(calculateBandLoyalty(state)).toBe(100);
    });

    it('returns average of active bandmate loyalty', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.bandmates = [
        { id: 'b1', name: 'A', role: 'guitar', talent: 50, reliability: 50, vice: 30, loyalty: 30, status: 'active' },
        { id: 'b2', name: 'B', role: 'bass', talent: 50, reliability: 50, vice: 30, loyalty: 70, status: 'active' },
      ];

      expect(calculateBandLoyalty(state)).toBe(50);
    });
  });

  describe('calculateBandPerformance', () => {
    it('factors in player skill and band stats', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.skill = 50;
      state.bandmates = [
        { id: 'b1', name: 'A', role: 'guitar', talent: 60, reliability: 80, vice: 30, loyalty: 50, status: 'active' },
      ];

      const performance = calculateBandPerformance(state);

      expect(performance).toBeGreaterThan(0);
      expect(performance).toBeLessThanOrEqual(100);
    });
  });

  describe('getBandmatesAtRisk', () => {
    it('returns bandmates with low loyalty', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.bandmates = [
        { id: 'b1', name: 'Loyal', role: 'guitar', talent: 50, reliability: 50, vice: 30, loyalty: 60, status: 'active' },
        { id: 'b2', name: 'AtRisk', role: 'bass', talent: 50, reliability: 50, vice: 30, loyalty: 25, status: 'active' },
      ];

      const atRisk = getBandmatesAtRisk(state);

      expect(atRisk).toHaveLength(1);
      expect(atRisk[0].id).toBe('b2');
    });
  });

  describe('checkForQuits', () => {
    it('may return bandmate with very low loyalty', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.bandmates = [
        { id: 'b1', name: 'Disloyal', role: 'guitar', talent: 50, reliability: 50, vice: 30, loyalty: 10, status: 'active' },
      ];

      // Run multiple times to test probability
      let quitCount = 0;
      for (let i = 0; i < 100; i++) {
        const rng = createRandom(i);
        const quitter = checkForQuits(state, rng);
        if (quitter) quitCount++;
      }

      // With 30% chance per check, we expect roughly 30 quits
      expect(quitCount).toBeGreaterThan(10);
      expect(quitCount).toBeLessThan(50);
    });

    it('returns null when all bandmates are loyal', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.bandmates = [
        { id: 'b1', name: 'Loyal', role: 'guitar', talent: 50, reliability: 50, vice: 30, loyalty: 80, status: 'active' },
      ];

      const rng = createRandom(1);
      const quitter = checkForQuits(state, rng);

      expect(quitter).toBeNull();
    });
  });

  describe('checkForReliabilityIssue', () => {
    it('may flag unreliable bandmates', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.bandmates = [
        { id: 'b1', name: 'Flaky', role: 'drums', talent: 50, reliability: 20, vice: 30, loyalty: 50, status: 'active' },
      ];

      let issueCount = 0;
      for (let i = 0; i < 100; i++) {
        const rng = createRandom(i);
        const issue = checkForReliabilityIssue(state, rng);
        if (issue) issueCount++;
      }

      expect(issueCount).toBeGreaterThan(5);
    });
  });

  describe('checkForViceTrouble', () => {
    it('may flag high-vice bandmates', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.bandmates = [
        { id: 'b1', name: 'Wild', role: 'bass', talent: 50, reliability: 50, vice: 85, loyalty: 50, status: 'active' },
      ];

      let troubleCount = 0;
      for (let i = 0; i < 100; i++) {
        const rng = createRandom(i);
        const trouble = checkForViceTrouble(state, rng);
        if (trouble) troubleCount++;
      }

      expect(troubleCount).toBeGreaterThan(5);
    });
  });

  describe('updateBandLoyalty', () => {
    it('updates all active bandmates by default', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.bandmates = [
        { id: 'b1', name: 'A', role: 'guitar', talent: 50, reliability: 50, vice: 30, loyalty: 50, status: 'active' },
        { id: 'b2', name: 'B', role: 'bass', talent: 50, reliability: 50, vice: 30, loyalty: 50, status: 'active' },
      ];

      const newState = updateBandLoyalty(state, 10);

      expect(newState.bandmates[0].loyalty).toBe(60);
      expect(newState.bandmates[1].loyalty).toBe(60);
    });

    it('can update specific bandmate only', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.bandmates = [
        { id: 'b1', name: 'A', role: 'guitar', talent: 50, reliability: 50, vice: 30, loyalty: 50, status: 'active' },
        { id: 'b2', name: 'B', role: 'bass', talent: 50, reliability: 50, vice: 30, loyalty: 50, status: 'active' },
      ];

      const newState = updateBandLoyalty(state, 10, 'b1');

      expect(newState.bandmates[0].loyalty).toBe(60);
      expect(newState.bandmates[1].loyalty).toBe(50);
    });

    it('clamps loyalty to 0-100 range', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.bandmates = [
        { id: 'b1', name: 'A', role: 'guitar', talent: 50, reliability: 50, vice: 30, loyalty: 95, status: 'active' },
      ];

      const newState = updateBandLoyalty(state, 20);

      expect(newState.bandmates[0].loyalty).toBe(100);
    });
  });

  describe('applyWeeklyLoyaltyChanges', () => {
    it('increases loyalty with high hype and fans', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.hype = 70;
      state.player.coreFans = 15000;
      state.bandmates = [
        { id: 'b1', name: 'A', role: 'guitar', talent: 50, reliability: 50, vice: 30, loyalty: 50, status: 'active' },
      ];

      const newState = applyWeeklyLoyaltyChanges(state);

      expect(newState.bandmates[0].loyalty).toBe(52); // +2 from hype and fans
    });

    it('decreases loyalty when in debt', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.money = -500;
      state.bandmates = [
        { id: 'b1', name: 'A', role: 'guitar', talent: 50, reliability: 50, vice: 30, loyalty: 50, status: 'active' },
      ];

      const newState = applyWeeklyLoyaltyChanges(state);

      expect(newState.bandmates[0].loyalty).toBe(48); // -2 from money troubles
    });
  });

  describe('isBandComplete', () => {
    it('returns false with no bandmates', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.bandmates = []; // Clear starting band

      expect(isBandComplete(state)).toBe(false);
    });

    it('returns true with guitar, bass, and drums', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.bandmates = [
        { id: 'b1', name: 'A', role: 'guitar', talent: 50, reliability: 50, vice: 30, loyalty: 50, status: 'active' },
        { id: 'b2', name: 'B', role: 'bass', talent: 50, reliability: 50, vice: 30, loyalty: 50, status: 'active' },
        { id: 'b3', name: 'C', role: 'drums', talent: 50, reliability: 50, vice: 30, loyalty: 50, status: 'active' },
      ];

      expect(isBandComplete(state)).toBe(true);
    });

    it('returns false if missing essential role', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.bandmates = [
        { id: 'b1', name: 'A', role: 'guitar', talent: 50, reliability: 50, vice: 30, loyalty: 50, status: 'active' },
        { id: 'b2', name: 'B', role: 'bass', talent: 50, reliability: 50, vice: 30, loyalty: 50, status: 'active' },
      ];

      expect(isBandComplete(state)).toBe(false);
    });
  });

  describe('getMissingRoles', () => {
    it('returns all essential roles with no bandmates', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.bandmates = []; // Clear starting band

      const missing = getMissingRoles(state);

      expect(missing).toContain('guitar');
      expect(missing).toContain('bass');
      expect(missing).toContain('drums');
    });

    it('returns only missing roles', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.bandmates = [
        { id: 'b1', name: 'A', role: 'guitar', talent: 50, reliability: 50, vice: 30, loyalty: 50, status: 'active' },
      ];

      const missing = getMissingRoles(state);

      expect(missing).not.toContain('guitar');
      expect(missing).toContain('bass');
      expect(missing).toContain('drums');
    });

    it('returns empty array when complete', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.bandmates = [
        { id: 'b1', name: 'A', role: 'guitar', talent: 50, reliability: 50, vice: 30, loyalty: 50, status: 'active' },
        { id: 'b2', name: 'B', role: 'bass', talent: 50, reliability: 50, vice: 30, loyalty: 50, status: 'active' },
        { id: 'b3', name: 'C', role: 'drums', talent: 50, reliability: 50, vice: 30, loyalty: 50, status: 'active' },
      ];

      const missing = getMissingRoles(state);

      expect(missing).toHaveLength(0);
    });
  });
});
