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
  DealType,
  TourType,
} from './types';
import { RandomGenerator } from './random';
import { getTotalFans } from './state';

// =============================================================================
// Constants
// =============================================================================

// Label deal generation - modern deal structures
export const LABEL_TIERS = {
  // Distribution deals - you keep masters, high royalty, but low/no advance
  distro: {
    name: 'Distribution Deal',
    advanceRange: [0, 500],
    royaltyRange: [0.70, 0.85], // Much higher royalty
    streamingRoyaltyRange: [0.70, 0.85],
    creativeControl: 'high' as CreativeControl,
    dealType: 'distro' as DealType,
    includesMasters: false,
    includesMerch: false,
    includesTouring: false,
    minFans: 200,
    minIndustryGoodwill: 5,
    minFollowers: 1000, // Need some online presence
  },
  indie: {
    name: 'Small Indie',
    advanceRange: [500, 2000],
    royaltyRange: [0.15, 0.25],
    streamingRoyaltyRange: [0.20, 0.30],
    creativeControl: 'high' as CreativeControl,
    dealType: 'traditional' as DealType,
    includesMasters: true,
    includesMerch: false,
    includesTouring: false,
    minFans: 500,
    minIndustryGoodwill: 10,
  },
  mid: {
    name: 'Mid-Size Label',
    advanceRange: [5000, 15000],
    royaltyRange: [0.10, 0.18],
    streamingRoyaltyRange: [0.15, 0.22],
    creativeControl: 'medium' as CreativeControl,
    dealType: 'traditional' as DealType,
    includesMasters: true,
    includesMerch: false,
    includesTouring: false,
    minFans: 5000,
    minIndustryGoodwill: 30,
  },
  major: {
    name: 'Major Label',
    advanceRange: [25000, 100000],
    royaltyRange: [0.08, 0.15],
    streamingRoyaltyRange: [0.10, 0.18],
    creativeControl: 'low' as CreativeControl,
    dealType: 'traditional' as DealType,
    includesMasters: true,
    includesMerch: false,
    includesTouring: false,
    minFans: 25000,
    minIndustryGoodwill: 50,
  },
  // 360 deals - big advance but they take a cut of everything
  major360: {
    name: 'Major Label (360)',
    advanceRange: [50000, 200000],
    royaltyRange: [0.12, 0.18],
    streamingRoyaltyRange: [0.12, 0.20],
    creativeControl: 'low' as CreativeControl,
    dealType: '360' as DealType,
    includesMasters: true,
    includesMerch: true,
    includesTouring: true,
    merchCutRange: [0.20, 0.30],
    touringCutRange: [0.10, 0.20],
    minFans: 50000,
    minIndustryGoodwill: 60,
    minFollowers: 50000,
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

// =============================================================================
// Tour Economics (UK Realistic Costs in £)
// =============================================================================

export interface TourConfig {
  type: TourType;
  name: string;
  description: string;
  weeksRequired: number;
  weeklyBaseCost: number;     // Base weekly costs (van, petrol, food, lodging)
  upfrontCost: number;        // Initial booking/deposit costs
  minFans: number;            // Minimum fans required
  minMoney: number;           // Minimum money needed to start
  requiresLabel: boolean;     // Needs label support
  fanMultiplier: number;      // Fan gain multiplier (support = exposure bonus)
  revenueMultiplier: number;  // How much you earn vs costs
}

export const TOUR_CONFIGS: Record<TourType, TourConfig> = {
  diy: {
    type: 'diy',
    name: 'DIY Van Tour',
    description: 'Rough it in a transit van, kip on floors, live on service station sarnies.',
    weeksRequired: 2,
    weeklyBaseCost: 400,       // ~£400/week: cheap van share, petrol, crap food
    upfrontCost: 500,          // Deposit on van, first venue payments
    minFans: 500,
    minMoney: 1500,            // Need £1500 minimum to attempt
    requiresLabel: false,
    fanMultiplier: 1.0,
    revenueMultiplier: 0.8,    // Keep most of what you earn
  },
  small: {
    type: 'small',
    name: 'Small Venue Tour',
    description: 'Proper tour: decent van, B&Bs, actual rider. Exhausting but real.',
    weeksRequired: 2,
    weeklyBaseCost: 800,       // £800/week: van, hotels, food, petrol
    upfrontCost: 1500,         // Deposits, promotion, merch stock
    minFans: 2000,
    minMoney: 4000,
    requiresLabel: false,
    fanMultiplier: 1.3,
    revenueMultiplier: 1.0,
  },
  support: {
    type: 'support',
    name: 'Support Tour',
    description: 'Opening for a bigger band. Less control, but massive exposure.',
    weeksRequired: 3,
    weeklyBaseCost: 300,       // Less costs - headliner covers some
    upfrontCost: 500,          // Travel to join tour
    minFans: 3000,
    minMoney: 2000,
    requiresLabel: false,      // Can be offered without label
    fanMultiplier: 2.5,        // Big exposure bonus
    revenueMultiplier: 0.5,    // Less money but worth it for exposure
  },
  headline: {
    type: 'headline',
    name: 'Headline Tour',
    description: 'Your name on the marquee. Tour bus, proper crew, the works.',
    weeksRequired: 4,
    weeklyBaseCost: 2000,      // £2000/week: bus, crew, hotels, rider
    upfrontCost: 5000,         // Tour manager, promotion, production
    minFans: 10000,
    minMoney: 15000,
    requiresLabel: true,       // Need label backing for this scale
    fanMultiplier: 1.5,
    revenueMultiplier: 1.5,    // Bigger venues, bigger guarantees
  },
};

// Per-show guarantees scale with tour type and fan base
export const TOUR_BASE_GUARANTEE: Record<TourType, number> = {
  diy: 100,       // £100 base per show
  small: 250,     // £250 base per show
  support: 150,   // £150 base (but exposure matters more)
  headline: 800,  // £800 base per show
};

export const MERCH_PROFIT_PER_FAN = 0.03; // £0.03 per fan per week on tour

// Legacy flat costs for backward compatibility
export const TOUR_COSTS = {
  vanRental: 150,
  gasPerWeek: 100,
  lodgingPerWeek: 250,
  foodPerWeek: 150,
  crewPerWeek: 400,
};

// =============================================================================
// Label Deal System
// =============================================================================

/**
 * Generate a label deal offer based on player stats
 * Returns different deal types based on player profile
 */
export function generateLabelOffer(
  state: GameState,
  rng: RandomGenerator,
  preferredType?: DealType
): LabelDeal | null {
  const { player } = state;
  const totalFans = getTotalFans(player);

  // Check which tiers player qualifies for
  const eligibleTiers: (keyof typeof LABEL_TIERS)[] = [];

  // Check each tier's requirements
  if (totalFans >= LABEL_TIERS.major360.minFans &&
      player.industryGoodwill >= LABEL_TIERS.major360.minIndustryGoodwill &&
      player.followers >= (LABEL_TIERS.major360.minFollowers || 0)) {
    eligibleTiers.push('major360');
  }
  if (totalFans >= LABEL_TIERS.major.minFans &&
      player.industryGoodwill >= LABEL_TIERS.major.minIndustryGoodwill) {
    eligibleTiers.push('major');
  }
  if (totalFans >= LABEL_TIERS.mid.minFans &&
      player.industryGoodwill >= LABEL_TIERS.mid.minIndustryGoodwill) {
    eligibleTiers.push('mid');
  }
  if (totalFans >= LABEL_TIERS.indie.minFans &&
      player.industryGoodwill >= LABEL_TIERS.indie.minIndustryGoodwill) {
    eligibleTiers.push('indie');
  }
  // Distro deals are accessible with lower requirements but need followers
  if (totalFans >= LABEL_TIERS.distro.minFans &&
      player.industryGoodwill >= LABEL_TIERS.distro.minIndustryGoodwill &&
      player.followers >= (LABEL_TIERS.distro.minFollowers || 0)) {
    eligibleTiers.push('distro');
  }

  if (eligibleTiers.length === 0) return null;

  // Select tier - prefer higher tiers but allow some randomness
  let selectedTier: keyof typeof LABEL_TIERS;

  if (preferredType) {
    // If user has a preference, try to match deal type
    const matchingTiers = eligibleTiers.filter(t => LABEL_TIERS[t].dealType === preferredType);
    selectedTier = matchingTiers.length > 0
      ? matchingTiers[0]
      : eligibleTiers[0];
  } else {
    // Default: pick best available tier (first in list since we checked in order)
    selectedTier = eligibleTiers[0];
  }

  const tier = LABEL_TIERS[selectedTier];

  // Generate deal terms
  const advance = rng.nextInt(tier.advanceRange[0], tier.advanceRange[1]);
  const royaltyRate = rng.nextFloat(tier.royaltyRange[0], tier.royaltyRange[1]);
  const streamingRoyaltyRate = rng.nextFloat(
    tier.streamingRoyaltyRange[0],
    tier.streamingRoyaltyRange[1]
  );

  // Generate merch and touring cuts for 360 deals
  let merchCut = 0;
  let touringCut = 0;
  if ('merchCutRange' in tier && tier.includesMerch) {
    merchCut = rng.nextFloat(tier.merchCutRange[0], tier.merchCutRange[1]);
  }
  if ('touringCutRange' in tier && tier.includesTouring) {
    touringCut = rng.nextFloat(tier.touringCutRange[0], tier.touringCutRange[1]);
  }

  // Label names by tier
  const labelNames: Record<string, string[]> = {
    distro: ['DistroKid Pro', 'TuneCore Select', 'CD Baby Plus', 'AWAL'],
    indie: ['Rust Records', 'Basement Tapes', 'Electric Funeral', 'Dead Wax'],
    mid: ['Chrome Records', 'Velocity Music', 'Soundstage', 'Amplifier Records'],
    major: ['Titan Records', 'Global Sound', 'Megaphone Entertainment', 'Universal Groove'],
    major360: ['Titan 360', 'Global Entertainment Group', 'Megaphone Worldwide', 'Universal Empire'],
  };

  const names = labelNames[selectedTier] || labelNames.indie;
  const name = names[rng.nextInt(0, names.length - 1)];

  return {
    id: `deal_${state.week}_${rng.nextInt(0, 9999)}`,
    name,
    advance,
    recoupDebt: advance, // Start with full advance as debt
    royaltyRate: Math.round(royaltyRate * 100) / 100,
    streamingRoyaltyRate: Math.round(streamingRoyaltyRate * 100) / 100,
    creativeControl: tier.creativeControl,
    status: 'active',
    weekSigned: state.week,
    dealType: tier.dealType,
    includesMasters: tier.includesMasters,
    includesMerch: tier.includesMerch,
    includesTouring: tier.includesTouring,
    merchCut: Math.round(merchCut * 100) / 100,
    touringCut: Math.round(touringCut * 100) / 100,
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

// Album title word banks
const ALBUM_ADJECTIVES = [
  'Electric', 'Midnight', 'Savage', 'Wild', 'Dark', 'Burning', 'Broken',
  'Neon', 'Screaming', 'Rising', 'Lost', 'Dirty', 'Raw', 'Wasted', 'Hungry',
];

const ALBUM_NOUNS = [
  'Dreams', 'Thunder', 'Fire', 'Chaos', 'Revolution', 'Rebellion', 'Nights',
  'Blood', 'Glory', 'Ruin', 'Machine', 'Highway', 'Kingdom', 'Asylum', 'Fury',
];

export function generateAlbumTitle(rng: RandomGenerator): string {
  const adj = ALBUM_ADJECTIVES[rng.nextInt(0, ALBUM_ADJECTIVES.length - 1)];
  const noun = ALBUM_NOUNS[rng.nextInt(0, ALBUM_NOUNS.length - 1)];
  return `${adj} ${noun}`;
}

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
    getTotalFans(state.player),
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
    chartHistory: [],
    peakChartPosition: null,
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
 * Get the active 360 deal if one exists
 */
export function getActive360Deal(state: GameState): LabelDeal | null {
  return state.labelDeals.find(d =>
    d.status === 'active' && d.dealType === '360'
  ) || null;
}

/**
 * Calculate tour finances for a week
 * Now factors in 360 deal cuts on touring and merch
 */
export function calculateTourWeek(
  state: GameState,
  rng: RandomGenerator
): { revenue: number; costs: number; fansGained: number; hypeGain: number; labelCut: number } {
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
  const totalFans = getTotalFans(player);
  const fanMultiplier = Math.log10(Math.max(100, totalFans)) / 2;
  const hypeMultiplier = 1 + (player.hype / 100);
  // Use 'small' tour base guarantee as default
  const baseGuarantee = TOUR_BASE_GUARANTEE['small'];
  const showGuarantee = Math.floor(baseGuarantee * fanMultiplier * hypeMultiplier);

  // Multiple shows per week
  const showsPerWeek = 4;
  const guaranteeRevenue = showGuarantee * showsPerWeek;

  // Merch revenue - only core fans really buy merch
  const grossMerchRevenue = Math.floor(player.coreFans * MERCH_PROFIT_PER_FAN);

  // Check for 360 deal cuts
  const deal360 = getActive360Deal(state);
  let labelCut = 0;
  let netMerchRevenue = grossMerchRevenue;
  let netTouringRevenue = guaranteeRevenue;

  if (deal360) {
    // Apply merch cut if 360 deal includes merch
    if (deal360.includesMerch && deal360.merchCut > 0) {
      const merchLabelCut = Math.floor(grossMerchRevenue * deal360.merchCut);
      netMerchRevenue = grossMerchRevenue - merchLabelCut;
      labelCut += merchLabelCut;
    }

    // Apply touring cut if 360 deal includes touring
    if (deal360.includesTouring && deal360.touringCut > 0) {
      const touringLabelCut = Math.floor(guaranteeRevenue * deal360.touringCut);
      netTouringRevenue = guaranteeRevenue - touringLabelCut;
      labelCut += touringLabelCut;
    }
  }

  const totalRevenue = netTouringRevenue + netMerchRevenue;

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
    labelCut,
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

  // Turnout based on local hype and fans - core fans are more likely to attend local shows
  const totalFans = getTotalFans(player);
  const localFanBase = Math.min(500, totalFans);
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
// Streaming Economy
// =============================================================================

/**
 * Get the effective streaming royalty rate based on label deal
 * DIY artists get 100%, distro deals get 70-85%, labels take bigger cuts
 */
export function getStreamingRoyaltyRate(state: GameState): number {
  // Find active label deal
  const activeDeal = state.labelDeals.find(d => d.status === 'active');

  if (!activeDeal) {
    // No deal = DIY = 100% (but harder to get on playlists)
    return 1.0;
  }

  // Use the deal's streaming royalty rate
  return activeDeal.streamingRoyaltyRate;
}

/**
 * Calculate streaming income after deal cuts and recoupment
 * Returns: { grossIncome, netIncome, recoupPaid, labelCut }
 */
export function calculateStreamingIncomeAfterDeal(
  grossStreamingIncome: number,
  state: GameState
): { grossIncome: number; netIncome: number; recoupPaid: number; labelCut: number } {
  const activeDeal = state.labelDeals.find(d => d.status === 'active');

  if (!activeDeal) {
    // No deal = full income
    return {
      grossIncome: grossStreamingIncome,
      netIncome: grossStreamingIncome,
      recoupPaid: 0,
      labelCut: 0,
    };
  }

  // Apply streaming royalty rate
  const labelCut = Math.floor(grossStreamingIncome * (1 - activeDeal.streamingRoyaltyRate));
  let artistShare = grossStreamingIncome - labelCut;

  // If still recouping, artist share goes toward debt first
  let recoupPaid = 0;
  if (activeDeal.recoupDebt > 0) {
    recoupPaid = Math.min(artistShare, activeDeal.recoupDebt);
    artistShare -= recoupPaid;
  }

  return {
    grossIncome: grossStreamingIncome,
    netIncome: artistShare,
    recoupPaid,
    labelCut,
  };
}

/**
 * Apply streaming income recoupment to deal debt
 */
export function applyStreamingRecoupment(
  state: GameState,
  recoupAmount: number
): GameState {
  if (recoupAmount <= 0) return state;

  const dealIndex = state.labelDeals.findIndex(d => d.status === 'active');
  if (dealIndex === -1) return state;

  const deal = state.labelDeals[dealIndex];
  if (deal.recoupDebt <= 0) return state;

  const newRecoupDebt = Math.max(0, deal.recoupDebt - recoupAmount);

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
