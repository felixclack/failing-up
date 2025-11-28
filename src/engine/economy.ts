/**
 * Economy system - label deals, album sales, touring, and money management
 */

import {
  GameState,
  LabelDeal,
  Album,
  Song,
  SalesTier,
  CreativeControl,
} from './types';
import { RandomGenerator } from './random';

// =============================================================================
// Constants
// =============================================================================

// Label deal generation
export const LABEL_TIERS = {
  indie: {
    name: 'Small Indie',
    advanceRange: [500, 2000],
    royaltyRange: [0.15, 0.25],
    creativeControl: 'high' as CreativeControl,
    minFans: 500,
    minIndustryGoodwill: 10,
  },
  mid: {
    name: 'Mid-Size Label',
    advanceRange: [5000, 15000],
    royaltyRange: [0.10, 0.18],
    creativeControl: 'medium' as CreativeControl,
    minFans: 5000,
    minIndustryGoodwill: 30,
  },
  major: {
    name: 'Major Label',
    advanceRange: [25000, 100000],
    royaltyRange: [0.08, 0.15],
    creativeControl: 'low' as CreativeControl,
    minFans: 25000,
    minIndustryGoodwill: 50,
  },
};

// Album sales tiers and their multipliers
export const SALES_TIER_DATA: Record<SalesTier, { minSales: number; royaltyMultiplier: number }> = {
  flop: { minSales: 0, royaltyMultiplier: 0.5 },
  cult: { minSales: 5000, royaltyMultiplier: 1.0 },
  silver: { minSales: 25000, royaltyMultiplier: 1.5 },
  gold: { minSales: 100000, royaltyMultiplier: 2.0 },
  platinum: { minSales: 500000, royaltyMultiplier: 3.0 },
  diamond: { minSales: 2000000, royaltyMultiplier: 5.0 },
};

// Tour economics
export const TOUR_COSTS = {
  vanRental: 200,
  gasPerWeek: 150,
  lodgingPerWeek: 300,
  foodPerWeek: 200,
  crewPerWeek: 500,
};

export const TOUR_BASE_GUARANTEE = 500; // Base per-show guarantee
export const MERCH_PROFIT_PER_FAN = 0.02; // $0.02 per fan per week on tour

// =============================================================================
// Label Deal System
// =============================================================================

/**
 * Generate a label deal offer based on player stats
 */
export function generateLabelOffer(
  state: GameState,
  rng: RandomGenerator
): LabelDeal | null {
  const { player } = state;

  // Check which tier player qualifies for
  let eligibleTier: keyof typeof LABEL_TIERS | null = null;

  if (player.fans >= LABEL_TIERS.major.minFans &&
      player.industryGoodwill >= LABEL_TIERS.major.minIndustryGoodwill) {
    eligibleTier = 'major';
  } else if (player.fans >= LABEL_TIERS.mid.minFans &&
             player.industryGoodwill >= LABEL_TIERS.mid.minIndustryGoodwill) {
    eligibleTier = 'mid';
  } else if (player.fans >= LABEL_TIERS.indie.minFans &&
             player.industryGoodwill >= LABEL_TIERS.indie.minIndustryGoodwill) {
    eligibleTier = 'indie';
  }

  if (!eligibleTier) return null;

  const tier = LABEL_TIERS[eligibleTier];

  // Generate deal terms
  const advance = rng.nextInt(tier.advanceRange[0], tier.advanceRange[1]);
  const royaltyRate = rng.nextFloat(tier.royaltyRange[0], tier.royaltyRange[1]);

  // Label names
  const labelNames: Record<string, string[]> = {
    indie: ['Rust Records', 'Basement Tapes', 'Electric Funeral', 'Dead Wax'],
    mid: ['Chrome Records', 'Velocity Music', 'Soundstage', 'Amplifier Records'],
    major: ['Titan Records', 'Global Sound', 'Megaphone Entertainment', 'Universal Groove'],
  };

  const names = labelNames[eligibleTier];
  const name = names[rng.nextInt(0, names.length - 1)];

  return {
    id: `deal_${state.week}_${rng.nextInt(0, 9999)}`,
    name,
    advance,
    recoupDebt: advance, // Start with full advance as debt
    royaltyRate: Math.round(royaltyRate * 100) / 100,
    creativeControl: tier.creativeControl,
    status: 'active',
    weekSigned: state.week,
  };
}

/**
 * Sign a label deal - receive advance, take on recoup debt
 */
export function signLabelDeal(state: GameState, deal: LabelDeal): GameState {
  return {
    ...state,
    player: {
      ...state.player,
      money: state.player.money + deal.advance,
      flags: {
        ...state.player.flags,
        hasLabelDeal: true,
      },
    },
    labelDeals: [...state.labelDeals, deal],
  };
}

/**
 * Calculate weekly royalties from album sales (after recoupment)
 */
export function calculateWeeklyRoyalties(state: GameState): number {
  let totalRoyalties = 0;

  for (const deal of state.labelDeals) {
    if (deal.status !== 'active') continue;
    if (deal.recoupDebt > 0) continue; // Not recouped yet

    // Find albums under this deal
    const dealAlbums = state.albums.filter(a => a.labelId === deal.id && a.salesTier);

    for (const album of dealAlbums) {
      if (!album.salesTier) continue;

      const tierData = SALES_TIER_DATA[album.salesTier];
      // Base weekly royalty scaled by tier
      const baseRoyalty = 50 * tierData.royaltyMultiplier;
      totalRoyalties += baseRoyalty * deal.royaltyRate;
    }
  }

  return Math.floor(totalRoyalties);
}

/**
 * Apply album sales to recoup debt
 */
export function applyAlbumSalesToRecoup(
  state: GameState,
  albumId: string,
  salesRevenue: number
): GameState {
  const album = state.albums.find(a => a.id === albumId);
  if (!album || !album.labelId) return state;

  const dealIndex = state.labelDeals.findIndex(d => d.id === album.labelId);
  if (dealIndex === -1) return state;

  const deal = state.labelDeals[dealIndex];
  if (deal.recoupDebt <= 0) return state;

  // Sales go toward recoupment first
  const recoupAmount = Math.min(deal.recoupDebt, salesRevenue);
  const newRecoupDebt = deal.recoupDebt - recoupAmount;

  const updatedDeals = [...state.labelDeals];
  updatedDeals[dealIndex] = {
    ...deal,
    recoupDebt: newRecoupDebt,
  };

  return {
    ...state,
    labelDeals: updatedDeals,
  };
}

// =============================================================================
// Album System
// =============================================================================

/**
 * Calculate album quality from songs and production
 */
export function calculateAlbumQuality(
  songs: Song[],
  productionValue: number
): number {
  if (songs.length === 0) return 0;

  const avgSongQuality = songs.reduce((sum, s) => sum + s.quality, 0) / songs.length;
  // Production adds up to 20 points
  const productionBonus = (productionValue / 100) * 20;

  return Math.min(100, Math.floor(avgSongQuality + productionBonus));
}

/**
 * Calculate initial album reception based on quality, hype, and cred
 */
export function calculateAlbumReception(
  albumQuality: number,
  playerHype: number,
  playerCred: number,
  rng: RandomGenerator
): number {
  // Base reception from quality
  let reception = albumQuality * 0.6;

  // Hype boost (up to 20 points)
  reception += (playerHype / 100) * 20;

  // Cred boost (up to 15 points)
  reception += (playerCred / 100) * 15;

  // Random variance (-10 to +10)
  reception += rng.nextInt(-10, 10);

  return Math.max(0, Math.min(100, Math.floor(reception)));
}

/**
 * Determine sales tier based on reception, fans, and promotion
 */
export function determineSalesTier(
  reception: number,
  fans: number,
  promotionSpend: number,
  hasLabelDeal: boolean,
  rng: RandomGenerator
): SalesTier {
  // Estimate total sales
  let salesMultiplier = reception / 50; // 0-2 based on reception

  // Promotion boost
  salesMultiplier *= 1 + (promotionSpend / 10000);

  // Label distribution boost
  if (hasLabelDeal) {
    salesMultiplier *= 1.5;
  }

  // Calculate estimated sales
  const estimatedSales = Math.floor(fans * salesMultiplier * rng.nextFloat(0.8, 1.2));

  // Determine tier
  if (estimatedSales >= SALES_TIER_DATA.diamond.minSales) return 'diamond';
  if (estimatedSales >= SALES_TIER_DATA.platinum.minSales) return 'platinum';
  if (estimatedSales >= SALES_TIER_DATA.gold.minSales) return 'gold';
  if (estimatedSales >= SALES_TIER_DATA.silver.minSales) return 'silver';
  if (estimatedSales >= SALES_TIER_DATA.cult.minSales) return 'cult';
  return 'flop';
}

/**
 * Create a new album from songs
 */
export function createAlbum(
  state: GameState,
  title: string,
  songIds: string[],
  productionValue: number,
  labelId: string | null,
  rng: RandomGenerator
): { album: Album; fanGain: number; credChange: number } {
  const songs = state.songs.filter(s => songIds.includes(s.id));
  const quality = calculateAlbumQuality(songs, productionValue);
  const reception = calculateAlbumReception(
    quality,
    state.player.hype,
    state.player.cred,
    rng
  );

  const salesTier = determineSalesTier(
    reception,
    state.player.fans,
    0, // Initial promotion
    labelId !== null,
    rng
  );

  const album: Album = {
    id: `album_${state.week}_${rng.nextInt(0, 9999)}`,
    title,
    songIds,
    productionValue,
    promotionSpend: 0,
    reception,
    salesTier,
    labelId,
    weekReleased: state.week,
  };

  // Calculate fan gain based on reception and sales tier
  const tierMultiplier = {
    flop: 0.5,
    cult: 1,
    silver: 2,
    gold: 5,
    platinum: 10,
    diamond: 25,
  };

  const baseFanGain = Math.floor(reception * 10);
  const fanGain = Math.floor(baseFanGain * tierMultiplier[salesTier]);

  // Cred change based on reception vs expectations
  let credChange = 0;
  if (reception >= 80) credChange = 10;
  else if (reception >= 60) credChange = 5;
  else if (reception >= 40) credChange = 0;
  else if (reception >= 20) credChange = -5;
  else credChange = -10;

  return { album, fanGain, credChange };
}

// =============================================================================
// Tour Economics
// =============================================================================

/**
 * Calculate tour finances for a week
 */
export function calculateTourWeek(
  state: GameState,
  rng: RandomGenerator
): { revenue: number; costs: number; fansGained: number; hypeGain: number } {
  const { player, bandmates } = state;

  // Calculate costs
  const totalCosts =
    TOUR_COSTS.vanRental +
    TOUR_COSTS.gasPerWeek +
    TOUR_COSTS.lodgingPerWeek +
    TOUR_COSTS.foodPerWeek +
    (bandmates.filter(b => b.status === 'active').length > 0 ? TOUR_COSTS.crewPerWeek : 0);

  // Calculate revenue
  // Guarantee scales with fans and hype
  const fanMultiplier = Math.log10(Math.max(100, player.fans)) / 2;
  const hypeMultiplier = 1 + (player.hype / 100);
  const showGuarantee = Math.floor(TOUR_BASE_GUARANTEE * fanMultiplier * hypeMultiplier);

  // Multiple shows per week
  const showsPerWeek = 4;
  const guaranteeRevenue = showGuarantee * showsPerWeek;

  // Merch revenue
  const merchRevenue = Math.floor(player.fans * MERCH_PROFIT_PER_FAN);

  const totalRevenue = guaranteeRevenue + merchRevenue;

  // Fans gained on tour
  const baseFansGained = Math.floor(player.hype * 2 + rng.nextInt(10, 50));
  const fansGained = Math.floor(baseFansGained * (player.skill / 50));

  // Hype gain
  const hypeGain = rng.nextInt(3, 8);

  return {
    revenue: totalRevenue,
    costs: totalCosts,
    fansGained,
    hypeGain,
  };
}

/**
 * Calculate gig payout for local shows
 */
export function calculateGigPayout(
  state: GameState,
  rng: RandomGenerator
): { payout: number; fansGained: number } {
  const { player } = state;

  // Base payout from door
  const baseDoor = 50;

  // Turnout based on local hype and fans
  const localFanBase = Math.min(500, player.fans);
  const turnoutPercent = (player.hype / 100) * rng.nextFloat(0.5, 1.0);
  const turnout = Math.floor(localFanBase * turnoutPercent) + rng.nextInt(10, 30);

  // Per-head cut
  const perHead = 3;
  const doorCut = turnout * perHead;

  const payout = baseDoor + doorCut;

  // Small fan gain from good local shows
  const fansGained = Math.floor(turnout * 0.1 * (player.skill / 50));

  return { payout, fansGained };
}

// =============================================================================
// Weekly Economy Update
// =============================================================================

/**
 * Apply all weekly economic effects
 */
export function applyWeeklyEconomy(state: GameState): GameState {
  let newState = { ...state };

  // Calculate and apply royalties if recouped
  const royalties = calculateWeeklyRoyalties(newState);
  if (royalties > 0) {
    newState = {
      ...newState,
      player: {
        ...newState.player,
        money: newState.player.money + royalties,
      },
    };
  }

  return newState;
}
