/**
 * Difficulty settings for Failing Up
 *
 * Each difficulty level adjusts various game mechanics to create
 * different experiences - from forgiving to punishing.
 */

import { Difficulty, DifficultySettings } from './types';

// =============================================================================
// Difficulty Presets
// =============================================================================

export const DIFFICULTY_SETTINGS: Record<Difficulty, DifficultySettings> = {
  easy: {
    name: 'Garage Band',
    description: 'A forgiving journey. Good for learning the ropes.',
    // Economics - more forgiving
    livingCostMultiplier: 0.7,
    gigPayMultiplier: 1.3,
    advanceMultiplier: 1.2,
    // Stats - slower penalties, faster gains
    fanGainMultiplier: 1.3,
    hypeDecayMultiplier: 0.7,
    healthLossMultiplier: 0.7,
    addictionGainMultiplier: 0.6,
    burnoutGainMultiplier: 0.7,
    // Starting stats - better position
    startingMoney: 600,
    startingHealth: 80,
    startingStability: 65,
    // Events - fewer bad surprises
    eventChanceMultiplier: 0.8,
    negativeEventWeight: 0.7,
  },

  normal: {
    name: 'Indie Grind',
    description: 'The authentic rock experience. Success is earned.',
    // Economics - baseline
    livingCostMultiplier: 1.0,
    gigPayMultiplier: 1.0,
    advanceMultiplier: 1.0,
    // Stats - baseline
    fanGainMultiplier: 1.0,
    hypeDecayMultiplier: 1.0,
    healthLossMultiplier: 1.0,
    addictionGainMultiplier: 1.0,
    burnoutGainMultiplier: 1.0,
    // Starting stats - standard
    startingMoney: 500,
    startingHealth: 70,
    startingStability: 55,
    // Events - baseline
    eventChanceMultiplier: 1.0,
    negativeEventWeight: 1.0,
  },

  hard: {
    name: 'Major Label Pressure',
    description: 'The industry is ruthless. One mistake can end it all.',
    // Economics - tighter
    livingCostMultiplier: 1.3,
    gigPayMultiplier: 0.8,
    advanceMultiplier: 0.9,
    // Stats - faster penalties, slower gains
    fanGainMultiplier: 0.8,
    hypeDecayMultiplier: 1.3,
    healthLossMultiplier: 1.3,
    addictionGainMultiplier: 1.4,
    burnoutGainMultiplier: 1.3,
    // Starting stats - tougher start
    startingMoney: 350,
    startingHealth: 65,
    startingStability: 50,
    // Events - more frequent and harsher
    eventChanceMultiplier: 1.2,
    negativeEventWeight: 1.3,
  },

  brutal: {
    name: '27 Club',
    description: 'Live fast, die young. Most careers end in tragedy.',
    // Economics - punishing
    livingCostMultiplier: 1.5,
    gigPayMultiplier: 0.6,
    advanceMultiplier: 0.8,
    // Stats - rapid decline, slow progress
    fanGainMultiplier: 0.6,
    hypeDecayMultiplier: 1.5,
    healthLossMultiplier: 1.6,
    addictionGainMultiplier: 1.8,
    burnoutGainMultiplier: 1.5,
    // Starting stats - desperate times
    startingMoney: 200,
    startingHealth: 55,
    startingStability: 40,
    // Events - constant chaos
    eventChanceMultiplier: 1.4,
    negativeEventWeight: 1.6,
  },
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get difficulty settings for a given difficulty level
 */
export function getDifficultySettings(difficulty: Difficulty): DifficultySettings {
  return DIFFICULTY_SETTINGS[difficulty];
}

/**
 * Get all available difficulties for UI display
 */
export function getAvailableDifficulties(): Array<{
  id: Difficulty;
  name: string;
  description: string;
}> {
  return [
    { id: 'easy', ...DIFFICULTY_SETTINGS.easy },
    { id: 'normal', ...DIFFICULTY_SETTINGS.normal },
    { id: 'hard', ...DIFFICULTY_SETTINGS.hard },
    { id: 'brutal', ...DIFFICULTY_SETTINGS.brutal },
  ];
}

/**
 * Apply a multiplier to a stat change, respecting its sign
 * Positive changes get reduced by multipliers > 1, negative get amplified
 */
export function applyDifficultyMultiplier(
  value: number,
  multiplier: number,
  isNegativeEffect: boolean = false
): number {
  if (isNegativeEffect) {
    // For negative effects (health loss, addiction gain), higher multiplier = worse
    return Math.round(value * multiplier);
  } else {
    // For positive effects (fan gain, money), higher multiplier = better
    return Math.round(value * multiplier);
  }
}

/**
 * Calculate weekly living cost based on difficulty
 */
export function getWeeklyLivingCost(baseCost: number, settings: DifficultySettings): number {
  return Math.round(baseCost * settings.livingCostMultiplier);
}

/**
 * Calculate gig payout based on difficulty
 */
export function getGigPayout(basePayout: number, settings: DifficultySettings): number {
  return Math.round(basePayout * settings.gigPayMultiplier);
}

/**
 * Calculate fan gain based on difficulty
 */
export function getFanGain(baseFans: number, settings: DifficultySettings): number {
  return Math.round(baseFans * settings.fanGainMultiplier);
}

/**
 * Calculate hype decay based on difficulty
 */
export function getHypeDecay(baseDecay: number, settings: DifficultySettings): number {
  return Math.round(baseDecay * settings.hypeDecayMultiplier);
}

/**
 * Calculate health loss based on difficulty
 */
export function getHealthLoss(baseLoss: number, settings: DifficultySettings): number {
  return Math.round(baseLoss * settings.healthLossMultiplier);
}

/**
 * Calculate addiction gain based on difficulty
 */
export function getAddictionGain(baseGain: number, settings: DifficultySettings): number {
  return Math.round(baseGain * settings.addictionGainMultiplier);
}

/**
 * Calculate burnout gain based on difficulty
 */
export function getBurnoutGain(baseGain: number, settings: DifficultySettings): number {
  return Math.round(baseGain * settings.burnoutGainMultiplier);
}

/**
 * Get base event trigger chance modified by difficulty
 */
export function getEventChance(baseChance: number, settings: DifficultySettings): number {
  return Math.min(0.9, baseChance * settings.eventChanceMultiplier);
}
