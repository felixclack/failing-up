import {
  determineEnding,
  getEndingResult,
  getEndingColor,
  getEndingIcon,
  EndingId,
} from '../endings';
import { createGameState } from '../state';
import { GameOverReason } from '../types';

describe('endings', () => {
  describe('determineEnding', () => {
    it('returns TRAGEDY for death', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.isGameOver = true;
      state.gameOverReason = 'death';

      expect(determineEnding(state)).toBe('TRAGEDY');
    });

    it('returns LEGEND for massive success', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.isGameOver = true;
      state.gameOverReason = 'time_limit';
      state.player.fans = 600000;
      state.player.cred = 75;
      state.player.money = 150000;

      expect(determineEnding(state)).toBe('LEGEND');
    });

    it('returns STAR for major success', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.isGameOver = true;
      state.gameOverReason = 'time_limit';
      state.player.fans = 120000;
      state.player.money = 60000;
      state.player.hype = 70;

      expect(determineEnding(state)).toBe('STAR');
    });

    it('returns SURVIVOR for sustainable career', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.isGameOver = true;
      state.gameOverReason = 'time_limit';
      state.player.fans = 15000;
      state.player.health = 70;
      state.player.stability = 70;
      state.player.money = 5000;

      expect(determineEnding(state)).toBe('SURVIVOR');
    });

    it('returns CULT_HERO for high cred but low fans', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.isGameOver = true;
      state.gameOverReason = 'broke'; // Not time_limit so SURVIVOR doesn't get +40
      state.player.fans = 8000;
      state.player.cred = 75;
      state.player.health = 30; // Low health so SURVIVOR doesn't win
      state.player.stability = 30; // Low stability so SURVIVOR doesn't win
      state.player.money = -100; // Negative so SURVIVOR doesn't get +20
      state.player.industryGoodwill = 50; // Not low enough for OBSCURITY
      state.songs = Array(25).fill({ id: 's1', title: 'Song', quality: 70, style: 'rock', hitPotential: 50, writtenByPlayer: true, weekWritten: 1 });

      expect(determineEnding(state)).toBe('CULT_HERO');
    });

    it('returns BURNOUT for high burnout and low stability', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.isGameOver = true;
      state.gameOverReason = 'band_collapsed';
      state.player.burnout = 85;
      state.player.stability = 20;
      state.player.fans = 5000;

      expect(determineEnding(state)).toBe('BURNOUT');
    });

    it('returns OBSCURITY for low fans and industry goodwill', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.isGameOver = true;
      state.gameOverReason = 'broke';
      state.player.fans = 500;
      state.player.industryGoodwill = 15;
      state.player.hype = 10;

      expect(determineEnding(state)).toBe('OBSCURITY');
    });

    it('returns SELLOUT for money but low cred', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.isGameOver = true;
      state.gameOverReason = 'broke'; // Not time_limit so SURVIVOR doesn't get +40
      state.player.money = 40000;
      state.player.cred = 25;
      state.player.industryGoodwill = 65;
      state.player.fans = 30000;
      state.player.health = 30; // Low so SURVIVOR doesn't win
      state.player.stability = 30; // Low so SURVIVOR doesn't win

      expect(determineEnding(state)).toBe('SELLOUT');
    });

    it('returns COMEBACK_KID for recovery from addiction with success', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.isGameOver = true;
      state.gameOverReason = 'time_limit';
      state.completedArcIds = ['ARC_ADDICTION'];
      state.player.addiction = 20;
      state.player.fans = 25000;
      state.player.health = 30; // Low so SURVIVOR doesn't outscore
      state.player.stability = 30; // Low so SURVIVOR doesn't outscore
      state.player.money = -100; // Negative so SURVIVOR doesn't get +20

      expect(determineEnding(state)).toBe('COMEBACK_KID');
    });
  });

  describe('getEndingResult', () => {
    it('returns full ending result with title and narrative', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.isGameOver = true;
      state.gameOverReason = 'time_limit';
      state.player.fans = 600000;
      state.player.cred = 80;

      const result = getEndingResult(state);

      expect(result.id).toBe('LEGEND');
      expect(result.title).toBeDefined();
      expect(result.subtitle).toBeDefined();
      expect(result.narrative).toBeDefined();
    });

    it('returns variation when conditions are met', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.isGameOver = true;
      state.gameOverReason = 'time_limit';
      state.player.fans = 600000;
      state.player.cred = 85; // High cred triggers "Authentic Legend" variation

      const result = getEndingResult(state);

      expect(result.id).toBe('LEGEND');
      expect(result.title).toBe('The Authentic Legend');
    });

    it('returns callbacks based on game history', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.isGameOver = true;
      state.gameOverReason = 'time_limit';
      state.player.fans = 150000;
      state.player.money = 60000;
      state.player.cred = 85;
      state.completedArcIds = ['ARC_ADDICTION'];
      state.player.addiction = 20;

      const result = getEndingResult(state);

      // Should have addiction recovery callback
      expect(result.callbacks.some(c => c.type === 'arc')).toBe(true);
      // Should have high fans callback
      expect(result.callbacks.some(c => c.type === 'achievement')).toBe(true);
      // Should have high cred callback
      expect(result.callbacks.some(c => c.type === 'stat')).toBe(true);
    });

    it('includes platinum album callback when applicable', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.isGameOver = true;
      state.gameOverReason = 'time_limit';
      state.player.fans = 100000;
      state.albums = [{
        id: 'a1',
        title: 'Hit Album',
        songIds: [],
        productionValue: 80,
        promotionSpend: 5000,
        reception: 85,
        salesTier: 'platinum',
        labelId: null,
        weekReleased: 50,
      }];

      const result = getEndingResult(state);

      expect(result.callbacks.some(c =>
        c.type === 'achievement' && c.text.includes('platinum')
      )).toBe(true);
    });

    it('includes band death callback when applicable', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.isGameOver = true;
      state.gameOverReason = 'time_limit';
      state.triggeredEventIds = ['EV_MEMBER_OVERDOSE'];
      state.bandmates = [
        ...state.bandmates.map(b => ({ ...b })),
        { id: 'dead1', name: 'Fallen Star', role: 'bass' as const, talent: 60, reliability: 50, vice: 90, loyalty: 50, status: 'dead' as const },
      ];

      const result = getEndingResult(state);

      expect(result.callbacks.some(c =>
        c.type === 'event' && c.text.includes('Fallen Star')
      )).toBe(true);
    });
  });

  describe('getEndingColor', () => {
    it('returns appropriate colors for each ending', () => {
      expect(getEndingColor('LEGEND')).toContain('yellow');
      expect(getEndingColor('STAR')).toContain('purple');
      expect(getEndingColor('SURVIVOR')).toContain('green');
      expect(getEndingColor('CULT_HERO')).toContain('blue');
      expect(getEndingColor('BURNOUT')).toContain('orange');
      expect(getEndingColor('TRAGEDY')).toContain('red');
      expect(getEndingColor('OBSCURITY')).toContain('gray');
      expect(getEndingColor('SELLOUT')).toContain('green');
      expect(getEndingColor('COMEBACK_KID')).toContain('cyan');
    });
  });

  describe('getEndingIcon', () => {
    it('returns appropriate icons for each ending', () => {
      expect(getEndingIcon('LEGEND')).toBe('👑');
      expect(getEndingIcon('STAR')).toBe('⭐');
      expect(getEndingIcon('SURVIVOR')).toBe('🎸');
      expect(getEndingIcon('CULT_HERO')).toBe('🎭');
      expect(getEndingIcon('BURNOUT')).toBe('🔥');
      expect(getEndingIcon('TRAGEDY')).toBe('🕯️');
      expect(getEndingIcon('OBSCURITY')).toBe('👤');
      expect(getEndingIcon('SELLOUT')).toBe('💰');
      expect(getEndingIcon('COMEBACK_KID')).toBe('🦅');
    });
  });

  describe('Ending variations', () => {
    it('TRAGEDY has addiction variation', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.isGameOver = true;
      state.gameOverReason = 'death';
      state.player.addiction = 85;

      const result = getEndingResult(state);

      expect(result.title).toBe('The 27 Club');
    });

    it('TRAGEDY has famous death variation', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.isGameOver = true;
      state.gameOverReason = 'death';
      state.player.fans = 150000;
      state.player.addiction = 50; // Not high enough for 27 Club

      const result = getEndingResult(state);

      expect(result.title).toBe('A Legend Dies');
    });

    it('LEGEND has survivor variation for recovered addicts', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.isGameOver = true;
      state.gameOverReason = 'time_limit';
      state.player.fans = 600000;
      state.player.cred = 60; // Not 80+ so "Authentic Legend" doesn't trigger first
      state.player.addiction = 20;
      state.player.health = 30; // Low so SURVIVOR ending doesn't win
      state.player.stability = 30; // Low so SURVIVOR ending doesn't win
      state.player.money = -100; // Negative so SURVIVOR doesn't get points
      state.completedArcIds = ['ARC_ADDICTION'];

      const result = getEndingResult(state);

      expect(result.id).toBe('LEGEND');
      expect(result.title).toBe('The Survivor Legend');
    });

    it('BURNOUT has band breakup variation', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.isGameOver = true;
      state.gameOverReason = 'band_collapsed';
      state.player.burnout = 75;
      state.player.stability = 25;
      state.completedArcIds = ['ARC_BAND_BREAKUP'];

      const result = getEndingResult(state);

      expect(result.title).toBe('The Bitter End');
    });
  });

  describe('Edge cases', () => {
    it('defaults to OBSCURITY when no ending scores well', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.isGameOver = true;
      state.gameOverReason = 'broke'; // Use broke, not time_limit (which boosts SURVIVOR)
      state.player.fans = 500;
      state.player.cred = 30;
      state.player.money = -200; // Slightly negative but not deep debt
      state.player.industryGoodwill = 30;
      state.player.burnout = 40;
      state.player.stability = 40;
      state.player.health = 40;
      state.player.hype = 30; // Not low enough for OBSCURITY's hype penalty

      expect(determineEnding(state)).toBe('OBSCURITY');
    });

    it('handles missing endingId by determining ending', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.isGameOver = true;
      state.gameOverReason = 'death';
      state.endingId = null;

      const result = getEndingResult(state);

      expect(result.id).toBe('TRAGEDY');
    });
  });
});
