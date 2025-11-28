import {
  calculateInitialStreamsTier,
  calculateInitialPlaylistScore,
  releaseSingle,
  calculateWeeklyStreams,
  calculateWeeklyStreamingIncome,
  updateSongsWeekly,
  checkForViralSong,
  makeViralSong,
  checkForPlaylistPlacement,
  applyPlaylistBoost,
  applyAlgoBoostDecay,
  updateCataloguePower,
  updateCasualListenersFromStreaming,
  STREAMS_PER_TIER,
  VIRAL_DURATION_WEEKS,
  ALGO_BOOST_DECAY,
} from '../streaming';
import { createGameState } from '../state';
import { createRandom } from '../random';
import { Song, Player } from '../types';

// Helper to create a test song
function createTestSong(overrides: Partial<Song> = {}): Song {
  return {
    id: 'test_song_1',
    title: 'Test Song',
    quality: 50,
    style: 'rock' as any,
    hitPotential: 50,
    writtenByPlayer: true,
    weekWritten: 1,
    isReleased: false,
    isSingle: false,
    weekReleased: null,
    streamsTier: 'none',
    playlistScore: 0,
    viralFlag: false,
    viralWeeksRemaining: 0,
    totalStreams: 0,
    ...overrides,
  };
}

describe('streaming', () => {
  describe('calculateInitialStreamsTier', () => {
    it('returns higher tier for higher quality songs', () => {
      const rng1 = createRandom(1);
      const rng2 = createRandom(1);
      const state = createGameState({ playerName: 'Test', seed: 1 });

      const lowQualitySong = createTestSong({ quality: 30, hitPotential: 30 });
      const highQualitySong = createTestSong({ quality: 90, hitPotential: 90 });

      const lowTier = calculateInitialStreamsTier(lowQualitySong, state.player, rng1);
      const highTier = calculateInitialStreamsTier(highQualitySong, state.player, rng2);

      // High quality should get equal or better tier
      const tierOrder = ['none', 'low', 'medium', 'high', 'massive'];
      expect(tierOrder.indexOf(highTier)).toBeGreaterThanOrEqual(tierOrder.indexOf(lowTier));
    });

    it('factors in player algoBoost', () => {
      const song = createTestSong({ quality: 50, hitPotential: 50 });
      const state = createGameState({ playerName: 'Test', seed: 1 });

      // Low algoBoost
      state.player.algoBoost = 10;
      const rng1 = createRandom(1);
      const lowBoostTier = calculateInitialStreamsTier(song, state.player, rng1);

      // High algoBoost
      state.player.algoBoost = 90;
      const rng2 = createRandom(1);
      const highBoostTier = calculateInitialStreamsTier(song, state.player, rng2);

      const tierOrder = ['none', 'low', 'medium', 'high', 'massive'];
      expect(tierOrder.indexOf(highBoostTier)).toBeGreaterThanOrEqual(tierOrder.indexOf(lowBoostTier));
    });
  });

  describe('calculateInitialPlaylistScore', () => {
    it('returns score between 0 and 100', () => {
      const rng = createRandom(1);
      const state = createGameState({ playerName: 'Test', seed: 1 });
      const song = createTestSong();

      const score = calculateInitialPlaylistScore(song, state.player, rng);

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('higher quality songs get higher scores', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });

      const lowQualitySong = createTestSong({ quality: 20 });
      const highQualitySong = createTestSong({ quality: 90 });

      const rng1 = createRandom(1);
      const rng2 = createRandom(1);

      const lowScore = calculateInitialPlaylistScore(lowQualitySong, state.player, rng1);
      const highScore = calculateInitialPlaylistScore(highQualitySong, state.player, rng2);

      expect(highScore).toBeGreaterThan(lowScore);
    });
  });

  describe('releaseSingle', () => {
    it('marks song as released', () => {
      const rng = createRandom(1);
      const state = createGameState({ playerName: 'Test', seed: 1 });
      const song = createTestSong();

      const released = releaseSingle(song, state.player, 5, rng);

      expect(released.isReleased).toBe(true);
      expect(released.isSingle).toBe(true);
      expect(released.weekReleased).toBe(5);
    });

    it('sets initial streaming stats', () => {
      const rng = createRandom(1);
      const state = createGameState({ playerName: 'Test', seed: 1 });
      const song = createTestSong({ quality: 70, hitPotential: 70 });

      const released = releaseSingle(song, state.player, 5, rng);

      expect(released.streamsTier).not.toBe('none');
      expect(released.playlistScore).toBeGreaterThan(0);
      expect(released.viralFlag).toBe(false);
      expect(released.totalStreams).toBe(0);
    });
  });

  describe('calculateWeeklyStreams', () => {
    it('returns 0 for unreleased songs', () => {
      const rng = createRandom(1);
      const state = createGameState({ playerName: 'Test', seed: 1 });
      const song = createTestSong({ isReleased: false });

      const streams = calculateWeeklyStreams(song, state.player, rng);

      expect(streams).toBe(0);
    });

    it('returns more streams for higher tiers', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });

      const lowTierSong = createTestSong({ isReleased: true, streamsTier: 'low', playlistScore: 50 });
      const highTierSong = createTestSong({ isReleased: true, streamsTier: 'high', playlistScore: 50 });

      // Average over multiple runs to account for randomness
      let lowTotal = 0;
      let highTotal = 0;
      for (let i = 0; i < 10; i++) {
        const rng1 = createRandom(i);
        const rng2 = createRandom(i);
        lowTotal += calculateWeeklyStreams(lowTierSong, state.player, rng1);
        highTotal += calculateWeeklyStreams(highTierSong, state.player, rng2);
      }

      expect(highTotal).toBeGreaterThan(lowTotal);
    });

    it('viral flag multiplies streams', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });

      const normalSong = createTestSong({ isReleased: true, streamsTier: 'medium', playlistScore: 50 });
      const viralSong = createTestSong({ isReleased: true, streamsTier: 'medium', playlistScore: 50, viralFlag: true });

      const rng1 = createRandom(1);
      const rng2 = createRandom(1);

      const normalStreams = calculateWeeklyStreams(normalSong, state.player, rng1);
      const viralStreams = calculateWeeklyStreams(viralSong, state.player, rng2);

      expect(viralStreams).toBeGreaterThan(normalStreams);
    });
  });

  describe('calculateWeeklyStreamingIncome', () => {
    it('returns income based on total streams', () => {
      const rng = createRandom(1);
      const state = createGameState({ playerName: 'Test', seed: 1 });

      const songs = [
        createTestSong({ id: 's1', isReleased: true, streamsTier: 'medium', playlistScore: 50 }),
        createTestSong({ id: 's2', isReleased: true, streamsTier: 'high', playlistScore: 60 }),
      ];

      const { income, totalStreams } = calculateWeeklyStreamingIncome(songs, state.player, rng);

      expect(income).toBeGreaterThan(0);
      expect(totalStreams).toBeGreaterThan(0);
    });

    it('applies royalty rate', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });

      const songs = [
        createTestSong({ id: 's1', isReleased: true, streamsTier: 'high', playlistScore: 50 }),
      ];

      const rng1 = createRandom(1);
      const rng2 = createRandom(1);

      const fullRate = calculateWeeklyStreamingIncome(songs, state.player, rng1, 1.0);
      const halfRate = calculateWeeklyStreamingIncome(songs, state.player, rng2, 0.5);

      expect(fullRate.income).toBeGreaterThan(halfRate.income);
    });
  });

  describe('makeViralSong', () => {
    it('sets viral flag and duration', () => {
      const song = createTestSong({ isReleased: true, streamsTier: 'medium' });

      const viral = makeViralSong(song);

      expect(viral.viralFlag).toBe(true);
      expect(viral.viralWeeksRemaining).toBe(VIRAL_DURATION_WEEKS);
      expect(viral.streamsTier).toBe('massive');
    });

    it('boosts playlist score', () => {
      const song = createTestSong({ isReleased: true, playlistScore: 40 });

      const viral = makeViralSong(song);

      expect(viral.playlistScore).toBeGreaterThan(song.playlistScore);
    });
  });

  describe('applyPlaylistBoost', () => {
    it('editorial boost gives biggest improvement', () => {
      const song = createTestSong({ isReleased: true, streamsTier: 'low', playlistScore: 30 });

      const editorial = applyPlaylistBoost(song, 'editorial');
      const algorithmic = applyPlaylistBoost(song, 'algorithmic');
      const discover = applyPlaylistBoost(song, 'discover');

      expect(editorial.playlistScore).toBeGreaterThan(algorithmic.playlistScore);
      expect(algorithmic.playlistScore).toBeGreaterThan(discover.playlistScore);
    });

    it('upgrades streaming tier', () => {
      const song = createTestSong({ isReleased: true, streamsTier: 'low', playlistScore: 30 });

      const boosted = applyPlaylistBoost(song, 'editorial');

      expect(boosted.streamsTier).not.toBe('low');
    });
  });

  describe('applyAlgoBoostDecay', () => {
    it('reduces algoBoost by decay amount', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.algoBoost = 50;

      const updated = applyAlgoBoostDecay(state.player);

      expect(updated.algoBoost).toBe(50 - ALGO_BOOST_DECAY);
    });

    it('does not go below 0', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      state.player.algoBoost = 1;

      const updated = applyAlgoBoostDecay(state.player);

      expect(updated.algoBoost).toBe(0);
    });
  });

  describe('updateCataloguePower', () => {
    it('increases with more released songs', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });

      const fewSongs = [
        createTestSong({ id: 's1', isReleased: true, totalStreams: 1000 }),
      ];
      const manySongs = [
        createTestSong({ id: 's1', isReleased: true, totalStreams: 1000 }),
        createTestSong({ id: 's2', isReleased: true, totalStreams: 1000 }),
        createTestSong({ id: 's3', isReleased: true, totalStreams: 1000 }),
        createTestSong({ id: 's4', isReleased: true, totalStreams: 1000 }),
        createTestSong({ id: 's5', isReleased: true, totalStreams: 1000 }),
      ];

      const fewPower = updateCataloguePower(state.player, fewSongs);
      const manyPower = updateCataloguePower(state.player, manySongs);

      expect(manyPower.cataloguePower).toBeGreaterThan(fewPower.cataloguePower);
    });

    it('increases with more total streams', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });

      const lowStreams = [
        createTestSong({ id: 's1', isReleased: true, totalStreams: 100 }),
      ];
      const highStreams = [
        createTestSong({ id: 's1', isReleased: true, totalStreams: 1000000 }),
      ];

      const lowPower = updateCataloguePower(state.player, lowStreams);
      const highPower = updateCataloguePower(state.player, highStreams);

      expect(highPower.cataloguePower).toBeGreaterThan(lowPower.cataloguePower);
    });
  });

  describe('updateCasualListenersFromStreaming', () => {
    it('adds casual listeners based on streams', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });
      const initialListeners = state.player.casualListeners;

      const updated = updateCasualListenersFromStreaming(state.player, 10000);

      expect(updated.casualListeners).toBeGreaterThan(initialListeners);
    });

    it('scales with stream count', () => {
      const state = createGameState({ playerName: 'Test', seed: 1 });

      const lowStreams = updateCasualListenersFromStreaming(state.player, 1000);
      const highStreams = updateCasualListenersFromStreaming(state.player, 100000);

      expect(highStreams.casualListeners).toBeGreaterThan(lowStreams.casualListeners);
    });
  });

  describe('updateSongsWeekly', () => {
    it('updates total streams', () => {
      const songs = [
        createTestSong({ id: 's1', isReleased: true, totalStreams: 100 }),
      ];

      const songStreams = new Map([['s1', 500]]);
      const rng = createRandom(1);

      const updated = updateSongsWeekly(songs, songStreams, rng);

      expect(updated[0].totalStreams).toBe(600);
    });

    it('decrements viral weeks remaining', () => {
      const songs = [
        createTestSong({ id: 's1', isReleased: true, viralFlag: true, viralWeeksRemaining: 2 }),
      ];

      const songStreams = new Map([['s1', 500]]);
      const rng = createRandom(1);

      const updated = updateSongsWeekly(songs, songStreams, rng);

      expect(updated[0].viralWeeksRemaining).toBe(1);
      expect(updated[0].viralFlag).toBe(true);
    });

    it('clears viral flag when weeks run out', () => {
      const songs = [
        createTestSong({ id: 's1', isReleased: true, viralFlag: true, viralWeeksRemaining: 1 }),
      ];

      const songStreams = new Map([['s1', 500]]);
      const rng = createRandom(1);

      const updated = updateSongsWeekly(songs, songStreams, rng);

      expect(updated[0].viralWeeksRemaining).toBe(0);
      expect(updated[0].viralFlag).toBe(false);
    });
  });
});
