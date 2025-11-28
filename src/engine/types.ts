/**
 * Core type definitions for Failing Up: A Rock Star Story
 * Based on DESIGN.md data model specifications
 */

// =============================================================================
// Enums
// =============================================================================

export type BandmateRole = 'guitar' | 'bass' | 'drums' | 'keys' | 'vocals';

export type BandmateStatus = 'active' | 'fired' | 'quit' | 'rehab' | 'dead';

export type MusicStyle = 'glam' | 'punk' | 'grunge' | 'alt' | 'metal' | 'indie';

export type SalesTier = 'flop' | 'cult' | 'silver' | 'gold' | 'platinum' | 'diamond';

export type CreativeControl = 'low' | 'medium' | 'high';

export type LabelDealStatus = 'active' | 'dropped' | 'fulfilled';

export type ActionId =
  | 'REST'
  | 'WRITE'
  | 'REHEARSE'
  | 'PLAY_LOCAL_GIG'
  | 'TOUR'
  | 'RECORD'
  | 'PROMOTE'
  | 'NETWORK'
  | 'PARTY'
  | 'SIDE_JOB';

export type GameOverReason =
  | 'death'
  | 'broke'
  | 'blacklisted'
  | 'time_limit'
  | 'band_collapsed'
  | 'voluntary_retirement';

// =============================================================================
// Core Entities
// =============================================================================

export interface PlayerFlags {
  hasLabelDeal: boolean;
  onTour: boolean;
  inStudio: boolean;
  hasManager: boolean;
  hasLawyer: boolean;
  // Arc-related flags
  addictionArcStarted: boolean;
  labelDealArcStarted: boolean;
  bandBreakupArcStarted: boolean;
}

export interface Player {
  name: string;
  // Visible stats (0-100 unless noted)
  talent: number;      // Mostly fixed, caps song quality
  skill: number;       // Performance and songwriting craft
  image: number;       // Perceived rockstar vibe
  fans: number;        // Total audience (0 to millions)
  hype: number;        // Short-term buzz, decays weekly
  money: number;       // Cash on hand (can go negative)
  health: number;      // Physical health
  stability: number;   // Mental/emotional stability
  cred: number;        // Scene/critical respect

  // Hidden/semi-hidden stats
  addiction: number;       // Substance abuse progression
  industryGoodwill: number; // Label/promoter relations
  burnout: number;         // Long-term fatigue

  flags: PlayerFlags;
}

export interface Bandmate {
  id: string;
  name: string;
  role: BandmateRole;
  talent: number;      // 0-100
  reliability: number; // 0-100, flake risk
  vice: number;        // 0-100, tendency toward destructive behavior
  loyalty: number;     // 0-100, willingness to stick with you
  status: BandmateStatus;
}

export interface Song {
  id: string;
  title: string;
  quality: number;      // 0-100
  style: MusicStyle;
  hitPotential: number; // 0-100, derived from talent/skill/trend
  writtenByPlayer: boolean;
  weekWritten: number;  // When the song was created
}

export interface Album {
  id: string;
  title: string;
  songIds: string[];
  productionValue: number;  // 0-100
  promotionSpend: number;
  reception: number | null; // 0-100, null if not released
  salesTier: SalesTier | null;
  labelId: string | null;
  weekReleased: number | null;
}

export interface LabelDeal {
  id: string;
  name: string;           // Label name
  advance: number;        // Initial money given
  recoupDebt: number;     // Amount to recoup before royalties
  royaltyRate: number;    // 0-1, fraction of sales
  creativeControl: CreativeControl;
  status: LabelDealStatus;
  weekSigned: number;
}

// =============================================================================
// Actions
// =============================================================================

export interface StatDeltas {
  talent?: number;
  skill?: number;
  image?: number;
  fans?: number;
  hype?: number;
  money?: number;
  health?: number;
  stability?: number;
  cred?: number;
  addiction?: number;
  industryGoodwill?: number;
  burnout?: number;
}

export interface ActionRequirements {
  onTour?: boolean;
  inStudio?: boolean;
  hasLabelDeal?: boolean;
  minMoney?: number;
  minHealth?: number;
  maxBurnout?: number;
}

export interface Action {
  id: ActionId;
  label: string;
  description: string;
  requirements: ActionRequirements;
  baseEffects: StatDeltas;
  // Some actions have variable outcomes handled by special logic
  hasSpecialLogic: boolean;
}

// =============================================================================
// Events
// =============================================================================

export interface EventTriggerConditions {
  minFans?: number;
  maxFans?: number;
  minHealth?: number;
  maxHealth?: number;
  minAddiction?: number;
  maxAddiction?: number;
  minStability?: number;
  maxStability?: number;
  minCred?: number;
  maxCred?: number;
  minIndustryGoodwill?: number;
  minBurnout?: number;
  minMoney?: number;
  maxMoney?: number;
  minHype?: number;
  maxHype?: number;
  minImage?: number;
  maxImage?: number;
  minSkill?: number;
  // Flag requirements
  onTour?: boolean;
  inStudio?: boolean;
  hasLabelDeal?: boolean;
  // Band requirements
  minBandVice?: number;
  minBandSize?: number;
}

export interface EventChoice {
  id: string;
  label: string;
  outcomeText: string;
  statChanges: StatDeltas;
  bandmateChanges?: {
    loyalty?: number;
    reliability?: number;
  };
  flagsSet?: string[];
  flagsClear?: string[];
  arcProgression?: string; // Arc ID to progress
}

export interface GameEvent {
  id: string;
  triggerConditions: EventTriggerConditions;
  weight: number;  // Relative likelihood when eligible
  textIntro: string;
  choices: EventChoice[];
  // If true, event is one-time only
  oneTime?: boolean;
  // If set, requires specific action this turn
  requiredAction?: ActionId;
}

// =============================================================================
// Arcs
// =============================================================================

export interface ArcStage {
  stageId: number;
  eventIds: string[];
  // Conditions to advance to next stage
  advanceConditions?: EventTriggerConditions;
}

export interface Arc {
  id: string;
  name: string;
  entryConditions: EventTriggerConditions;
  stages: ArcStage[];
  currentStage: number; // 0 = not started
}

// =============================================================================
// Game State
// =============================================================================

export interface WeekLog {
  week: number;
  action: ActionId;
  actionResult: string;
  events: Array<{
    eventId: string;
    choiceId: string;
    outcomeText: string;
  }>;
  statChanges: StatDeltas;
}

export interface GameState {
  // Core state
  player: Player;
  bandmates: Bandmate[];
  songs: Song[];
  albums: Album[];
  labelDeals: LabelDeal[];

  // Time tracking
  week: number;        // Current week (1-520)
  year: number;        // Derived: Math.floor((week - 1) / 52) + 1

  // Arc tracking
  activeArcs: Arc[];
  completedArcIds: string[];

  // Event tracking
  triggeredEventIds: string[]; // For one-time events

  // Game history
  weekLogs: WeekLog[];

  // Game end state
  isGameOver: boolean;
  gameOverReason: GameOverReason | null;
  endingId: string | null;

  // Random seed for reproducibility
  seed: number;

  // Config
  weeklyLivingCost: number;
  maxWeeks: number;
}

// =============================================================================
// Turn Processing
// =============================================================================

export interface TurnResult {
  newState: GameState;
  actionResult: string;
  triggeredEvents: GameEvent[];
  isGameOver: boolean;
  gameOverReason: GameOverReason | null;
}

export interface ActionResult {
  success: boolean;
  message: string;
  statChanges: StatDeltas;
  // For actions that produce something (like Write producing a song)
  producedSongId?: string;
  producedAlbumId?: string;
}

// =============================================================================
// Endings
// =============================================================================

export interface Ending {
  id: string;
  title: string;
  description: string;
  // Conditions that make this ending possible
  conditions: {
    minFans?: number;
    maxFans?: number;
    minCred?: number;
    maxCred?: number;
    minMoney?: number;
    maxMoney?: number;
    minHealth?: number;
    maxHealth?: number;
    gameOverReason?: GameOverReason;
    completedArcs?: string[];
  };
  // Priority when multiple endings match (higher = preferred)
  priority: number;
}
