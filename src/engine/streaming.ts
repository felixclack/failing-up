/**
 * Streaming system - song streaming, playlists, and digital income
 * Based on UPDATE.md streaming era design
 */

import {
  GameState,
  Song,
  StreamsTier,
  Player,
  PlatformStats,
  PlayerPlatformStats,
  ChartEntry,
} from './types';
import { RandomGenerator } from './random';
import { getTotalFans } from './state';

// =============================================================================
// Constants
// =============================================================================

// Streams per week for each tier (approximate)
export const STREAMS_PER_TIER: Record<StreamsTier, { min: number; max: number }> = {
  none: { min: 0, max: 0 },
  low: { min: 100, max: 1000 },
  medium: { min: 1000, max: 10000 },
  high: { min: 10000, max: 100000 },
  massive: { min: 100000, max: 1000000 },
};

// Money per 1000 streams (industry average is ~$3-4 per 1000)
export const MONEY_PER_1000_STREAMS = 3.5;

// Viral boost multiplier
export const VIRAL_MULTIPLIER = 5;
export const VIRAL_DURATION_WEEKS = 4;

// Playlist score thresholds
export const PLAYLIST_THRESHOLDS = {
  editorial: 70,    // Get on editorial playlists
  algorithmic: 40,  // Get algorithmic recommendations
  discover: 20,     // Appear in discovery features
};

// AlgoBoost decay per week
export const ALGO_BOOST_DECAY = 3;

// =============================================================================
// Default Values / Helpers
// =============================================================================

/**
 * Create default platform stats for a new song
 */
export function createDefaultPlatformStats(): PlatformStats {
  return {
    spotify: {
      streams: 0,
      monthlyListeners: 0,
      playlistAdds: 0,
    },
    youtube: {
      views: 0,
      subscribers: 0,
      likes: 0,
    },
    tiktok: {
      videos: 0,
      views: 0,
      trending: false,
    },
  };
}

/**
 * Get default streaming fields for a new song
 */
export function getDefaultSongStreamingFields() {
  return {
    streamsTier: 'none' as const,
    playlistScore: 0,
    viralFlag: false,
    viralWeeksRemaining: 0,
    totalStreams: 0,
    platformStats: createDefaultPlatformStats(),
    chartHistory: [] as ChartEntry[],
    peakChartPosition: null as number | null,
  };
}

/**
 * Create default player platform stats
 */
export function createDefaultPlayerPlatformStats(): PlayerPlatformStats {
  return {
    spotify: {
      monthlyListeners: 0,
      followers: 0,
      totalStreams: 0,
    },
    youtube: {
      subscribers: 0,
      totalViews: 0,
      channelLikes: 0,
    },
    tiktok: {
      followers: 0,
      totalVideos: 0,
      viralSounds: 0,
    },
    instagram: {
      followers: 0,
    },
  };
}

/**
 * Get default album chart fields
 */
export function getDefaultAlbumChartFields() {
  return {
    chartHistory: [] as ChartEntry[],
    peakChartPosition: null as number | null,
  };
}

/**
 * Format large numbers for display (e.g., 1.2M, 500K)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

// =============================================================================
// Streaming Tier Calculations
// =============================================================================

/**
 * Determine initial streaming tier when a song is released
 * Based on: quality, hitPotential, player's algoBoost, followers
 */
export function calculateInitialStreamsTier(
  song: Song,
  player: Player,
  rng: RandomGenerator
): StreamsTier {
  // Base score from song quality and hit potential
  const songScore = (song.quality + song.hitPotential) / 2;

  // Boost from player's digital presence
  const digitalBoost = (player.algoBoost + player.followers / 10000) / 2;

  // Total score with some randomness
  const totalScore = songScore + digitalBoost + rng.nextInt(-10, 10);

  // Determine tier
  if (totalScore >= 80) return 'high';
  if (totalScore >= 60) return 'medium';
  if (totalScore >= 40) return 'low';
  return 'none';
}

/**
 * Calculate initial playlist score when a song is released
 */
export function calculateInitialPlaylistScore(
  song: Song,
  player: Player,
  rng: RandomGenerator
): number {
  // Base from song quality
  const baseScore = song.quality * 0.5;

  // Boost from player's digital presence
  const digitalBoost = player.algoBoost * 0.3;

  // Some randomness
  const random = rng.nextInt(-10, 10);

  return Math.max(0, Math.min(100, Math.floor(baseScore + digitalBoost + random)));
}

// =============================================================================
// Song Release
// =============================================================================

/**
 * Release a song as a single to streaming platforms
 * Returns updated song with streaming fields set
 */
export function releaseSingle(
  song: Song,
  player: Player,
  week: number,
  rng: RandomGenerator
): Song {
  const streamsTier = calculateInitialStreamsTier(song, player, rng);
  const playlistScore = calculateInitialPlaylistScore(song, player, rng);

  return {
    ...song,
    isReleased: true,
    isSingle: true,
    weekReleased: week,
    streamsTier,
    playlistScore,
    viralFlag: false,
    viralWeeksRemaining: 0,
    totalStreams: 0,
  };
}

/**
 * Release songs from an album to streaming
 * Album tracks get a smaller initial boost than singles
 */
export function releaseAlbumTracks(
  songs: Song[],
  player: Player,
  week: number,
  rng: RandomGenerator
): Song[] {
  return songs.map(song => {
    if (song.isReleased) return song; // Already released (maybe as single)

    // Album tracks get slightly lower initial tier
    const streamsTier = calculateInitialStreamsTier(song, player, rng);
    const playlistScore = calculateInitialPlaylistScore(song, player, rng);

    return {
      ...song,
      isReleased: true,
      isSingle: false,
      weekReleased: week,
      streamsTier: downgradeStreamsTier(streamsTier), // Album tracks start lower
      playlistScore: Math.floor(playlistScore * 0.7), // Less playlist love initially
      viralFlag: false,
      viralWeeksRemaining: 0,
      totalStreams: 0,
    };
  });
}

/**
 * Downgrade a streams tier by one level
 */
function downgradeStreamsTier(tier: StreamsTier): StreamsTier {
  switch (tier) {
    case 'massive': return 'high';
    case 'high': return 'medium';
    case 'medium': return 'low';
    default: return 'none';
  }
}

// =============================================================================
// Weekly Streaming Updates
// =============================================================================

/**
 * Calculate weekly streams for a single song
 */
export function calculateWeeklyStreams(
  song: Song,
  player: Player,
  rng: RandomGenerator
): number {
  if (!song.isReleased) return 0;

  const tierRange = STREAMS_PER_TIER[song.streamsTier];
  let baseStreams = rng.nextInt(tierRange.min, tierRange.max);

  // Boost from playlist score
  const playlistMultiplier = 1 + (song.playlistScore / 100);
  baseStreams = Math.floor(baseStreams * playlistMultiplier);

  // Boost from player's algoBoost
  const algoMultiplier = 1 + (player.algoBoost / 200);
  baseStreams = Math.floor(baseStreams * algoMultiplier);

  // Viral boost
  if (song.viralFlag) {
    baseStreams = Math.floor(baseStreams * VIRAL_MULTIPLIER);
  }

  return baseStreams;
}

/**
 * Calculate total weekly streaming income from all songs
 */
export function calculateWeeklyStreamingIncome(
  songs: Song[],
  player: Player,
  rng: RandomGenerator,
  royaltyRate: number = 1.0 // 1.0 = no label cut, 0.15 = label takes 85%
): { income: number; totalStreams: number; songStreams: Map<string, number> } {
  const songStreams = new Map<string, number>();
  let totalStreams = 0;

  for (const song of songs) {
    if (!song.isReleased) continue;

    const streams = calculateWeeklyStreams(song, player, rng);
    songStreams.set(song.id, streams);
    totalStreams += streams;
  }

  // Calculate income
  const grossIncome = (totalStreams / 1000) * MONEY_PER_1000_STREAMS;
  const income = Math.floor(grossIncome * royaltyRate);

  return { income, totalStreams, songStreams };
}

/**
 * Update all songs' streaming stats for the week
 * Returns updated songs array
 */
export function updateSongsWeekly(
  songs: Song[],
  songStreams: Map<string, number>,
  rng: RandomGenerator
): Song[] {
  return songs.map(song => {
    if (!song.isReleased) return song;

    const weeklyStreams = songStreams.get(song.id) || 0;

    // Update total streams
    const newTotalStreams = song.totalStreams + weeklyStreams;

    // Decay viral flag
    let viralFlag = song.viralFlag;
    let viralWeeksRemaining = song.viralWeeksRemaining;
    if (viralFlag) {
      viralWeeksRemaining--;
      if (viralWeeksRemaining <= 0) {
        viralFlag = false;
        viralWeeksRemaining = 0;
      }
    }

    // Playlist score decay (slow)
    const playlistScore = Math.max(0, song.playlistScore - rng.nextInt(0, 2));

    // Streams tier can shift based on recent performance
    const streamsTier = recalculateStreamsTier(song, weeklyStreams);

    return {
      ...song,
      totalStreams: newTotalStreams,
      viralFlag,
      viralWeeksRemaining,
      playlistScore,
      streamsTier,
    };
  });
}

/**
 * Recalculate streaming tier based on recent streams
 */
function recalculateStreamsTier(song: Song, weeklyStreams: number): StreamsTier {
  // Check which tier the weekly streams fall into
  if (weeklyStreams >= STREAMS_PER_TIER.massive.min) return 'massive';
  if (weeklyStreams >= STREAMS_PER_TIER.high.min) return 'high';
  if (weeklyStreams >= STREAMS_PER_TIER.medium.min) return 'medium';
  if (weeklyStreams >= STREAMS_PER_TIER.low.min) return 'low';
  return 'none';
}

// =============================================================================
// Viral Events
// =============================================================================

/**
 * Check if a song goes viral this week
 * Returns the song ID if viral, null otherwise
 */
export function checkForViralSong(
  songs: Song[],
  player: Player,
  rng: RandomGenerator
): string | null {
  const releasedSongs = songs.filter(s => s.isReleased && !s.viralFlag);
  if (releasedSongs.length === 0) return null;

  // Base viral chance (very low)
  let viralChance = 0.01; // 1% base

  // Higher algoBoost increases chance
  viralChance += player.algoBoost / 1000; // +0.1% per 1 algoBoost

  // More followers increases chance
  viralChance += getTotalFans(player) / 1000000; // +0.1% per 1000 fans

  // Roll for viral
  if (rng.next() > viralChance) return null;

  // Pick a song weighted by quality
  const weights = releasedSongs.map(s => s.quality + s.hitPotential);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let roll = rng.next() * totalWeight;

  for (let i = 0; i < releasedSongs.length; i++) {
    roll -= weights[i];
    if (roll <= 0) {
      return releasedSongs[i].id;
    }
  }

  return releasedSongs[0].id;
}

/**
 * Make a song go viral
 */
export function makeViralSong(song: Song): Song {
  return {
    ...song,
    viralFlag: true,
    viralWeeksRemaining: VIRAL_DURATION_WEEKS,
    streamsTier: 'massive', // Viral songs jump to massive tier
    playlistScore: Math.min(100, song.playlistScore + 30), // Big playlist boost
  };
}

// =============================================================================
// Playlist Events
// =============================================================================

/**
 * Check if a song gets added to a major playlist
 */
export function checkForPlaylistPlacement(
  songs: Song[],
  player: Player,
  rng: RandomGenerator
): { songId: string; playlistType: 'editorial' | 'algorithmic' | 'discover' } | null {
  const eligibleSongs = songs.filter(s =>
    s.isReleased &&
    s.playlistScore >= PLAYLIST_THRESHOLDS.discover
  );

  if (eligibleSongs.length === 0) return null;

  // Check each song
  for (const song of eligibleSongs) {
    // Editorial playlist (hardest)
    if (song.playlistScore >= PLAYLIST_THRESHOLDS.editorial) {
      const chance = 0.02 + (player.industryGoodwill / 500); // 2-4% per eligible song
      if (rng.next() < chance) {
        return { songId: song.id, playlistType: 'editorial' };
      }
    }

    // Algorithmic playlist
    if (song.playlistScore >= PLAYLIST_THRESHOLDS.algorithmic) {
      const chance = 0.05 + (player.algoBoost / 500); // 5-15% per eligible song
      if (rng.next() < chance) {
        return { songId: song.id, playlistType: 'algorithmic' };
      }
    }

    // Discover feature
    if (song.playlistScore >= PLAYLIST_THRESHOLDS.discover) {
      const chance = 0.10; // 10% per eligible song
      if (rng.next() < chance) {
        return { songId: song.id, playlistType: 'discover' };
      }
    }
  }

  return null;
}

/**
 * Apply playlist boost to a song
 */
export function applyPlaylistBoost(
  song: Song,
  playlistType: 'editorial' | 'algorithmic' | 'discover'
): Song {
  let playlistBoost = 0;
  let tierBoost = 0;

  switch (playlistType) {
    case 'editorial':
      playlistBoost = 25;
      tierBoost = 2; // Jump 2 tiers
      break;
    case 'algorithmic':
      playlistBoost = 15;
      tierBoost = 1; // Jump 1 tier
      break;
    case 'discover':
      playlistBoost = 10;
      tierBoost = 0; // No tier jump
      break;
  }

  // Upgrade tier
  let newTier = song.streamsTier;
  for (let i = 0; i < tierBoost; i++) {
    newTier = upgradeStreamsTier(newTier);
  }

  return {
    ...song,
    playlistScore: Math.min(100, song.playlistScore + playlistBoost),
    streamsTier: newTier,
  };
}

function upgradeStreamsTier(tier: StreamsTier): StreamsTier {
  switch (tier) {
    case 'none': return 'low';
    case 'low': return 'medium';
    case 'medium': return 'high';
    case 'high': return 'massive';
    default: return 'massive';
  }
}

// =============================================================================
// Player Stats Updates
// =============================================================================

/**
 * Apply weekly AlgoBoost decay
 */
export function applyAlgoBoostDecay(player: Player): Player {
  const newAlgoBoost = Math.max(0, player.algoBoost - ALGO_BOOST_DECAY);
  return {
    ...player,
    algoBoost: newAlgoBoost,
  };
}

/**
 * Update catalogue power based on released songs
 */
export function updateCataloguePower(player: Player, songs: Song[]): Player {
  const releasedSongs = songs.filter(s => s.isReleased);

  // Base power from number of released songs
  const songCount = releasedSongs.length;
  const countPower = Math.min(50, songCount * 2); // Max 25 songs for 50 power

  // Power from total lifetime streams
  const totalStreams = releasedSongs.reduce((sum, s) => sum + s.totalStreams, 0);
  const streamPower = Math.min(50, Math.floor(Math.log10(totalStreams + 1) * 10));

  const cataloguePower = Math.min(100, countPower + streamPower);

  return {
    ...player,
    cataloguePower,
  };
}

/**
 * Convert streaming audience to casual listeners
 * Based on streaming performance
 */
export function updateCasualListenersFromStreaming(
  player: Player,
  weeklyStreams: number
): Player {
  // Some fraction of weekly streams converts to casual listeners
  // Much smaller conversion rate than core fans
  const conversionRate = 0.001; // 0.1% of streams become "casual listeners"
  const newListeners = Math.floor(weeklyStreams * conversionRate);

  return {
    ...player,
    casualListeners: player.casualListeners + newListeners,
  };
}
