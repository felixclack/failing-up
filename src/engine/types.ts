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

// Streaming performance tiers for individual songs
export type StreamsTier = 'none' | 'low' | 'medium' | 'high' | 'massive';

export type CreativeControl = 'low' | 'medium' | 'high';

export type LabelDealStatus = 'active' | 'dropped' | 'fulfilled';

// Modern label deal types
export type DealType = 'traditional' | 'distro' | '360';

export type ActionId =
  | 'REST'
  | 'WRITE'
  | 'REHEARSE'
  | 'TOUR'
  | 'TOUR_WEEK'    // Continue an active tour
  | 'RECORD_SINGLE'
  | 'RECORD_EP'
  | 'RECORD_ALBUM'
  | 'STUDIO_WORK'  // Continue an active recording session
  | 'PROMOTE'
  | 'NETWORK'
  | 'PARTY'
  | 'SIDE_JOB'
  // Streaming era actions
  | 'RELEASE_SINGLE';

export type GameOverReason =
  | 'death'
  | 'broke'
  | 'blacklisted'
  | 'time_limit'
  | 'band_collapsed'
  | 'voluntary_retirement';

export type Difficulty = 'easy' | 'normal' | 'hard' | 'brutal';

// Talent level presets for character creation
export type TalentLevel = 'struggling' | 'average' | 'gifted' | 'prodigy';

// Rival band status
export type RivalBandStatus = 'active' | 'hiatus' | 'broken_up' | 'retired';

// Fame tiers for rival band matching
export type FameTier = 'local' | 'regional' | 'national' | 'star' | 'legend';

// News item types
export type NewsType = 'release' | 'tour' | 'scandal' | 'breakup' | 'signing' |
                       'rivalry' | 'industry' | 'death' | 'comeback' | 'theft';

// Manager status
export type ManagerStatus = 'active' | 'fired' | 'quit';

// Venue types - progression from pubs to major venues
export type VenueType = 'pub' | 'club' | 'small_venue' | 'support_slot' | 'headline' | 'festival';

// Gig outcome quality
export type GigOutcome = 'disaster' | 'poor' | 'decent' | 'good' | 'great' | 'legendary';

// =============================================================================
// Difficulty Settings
// =============================================================================

export interface DifficultySettings {
  name: string;
  description: string;
  // Economic multipliers (1.0 = normal)
  livingCostMultiplier: number;      // Weekly expenses
  gigPayMultiplier: number;          // Money from gigs
  advanceMultiplier: number;         // Label deal advances
  // Stat multipliers
  fanGainMultiplier: number;         // Fans gained from actions
  hypeDecayMultiplier: number;       // How fast hype decays
  healthLossMultiplier: number;      // Health loss from actions/events
  addictionGainMultiplier: number;   // How fast addiction increases
  burnoutGainMultiplier: number;     // How fast burnout increases
  // Starting stat adjustments
  startingMoney: number;
  startingHealth: number;
  startingStability: number;
  // Event chances
  eventChanceMultiplier: number;     // Base event trigger chance
  negativeEventWeight: number;       // Weight toward negative events (1.0 = normal)
}

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
  hype: number;        // Short-term buzz, decays weekly
  money: number;       // Cash on hand (can go negative)
  health: number;      // Physical health
  stability: number;   // Mental/emotional stability
  cred: number;        // Scene/critical respect

  // Audience stats (streaming era split)
  coreFans: number;        // Loyal fans who buy tickets/merch and stick around
  casualListeners: number; // Passive streaming audience, big numbers but less loyalty
  // Derived: fans = coreFans + casualListeners (computed when needed)

  // Digital/Social stats
  followers: number;       // Aggregate social media followers across platforms
  algoBoost: number;       // 0-100, how much platforms currently "like" you
  cataloguePower: number;  // 0-100, strength of back-catalog on streaming

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

export interface Manager {
  id: string;
  name: string;
  bookingSkill: number;    // 0-100, affects gig quality and frequency
  connections: number;     // 0-100, affects venue tier access
  reliability: number;     // 0-100, chance they actually deliver gigs
  cut: number;             // 0.10-0.25, percentage of gig earnings they take
  reputation: number;      // 0-100, affects industry perception
  status: ManagerStatus;
  weekHired: number;       // When they joined
}

export interface Venue {
  id: string;
  name: string;
  type: VenueType;
  capacity: number;        // How many people fit
  prestige: number;        // 0-100, affects cred gain
  basePay: number;         // Base payment for playing
  // Location flavor
  city?: string;
}

export interface Gig {
  id: string;
  venue: Venue;
  week: number;            // When the gig is scheduled
  isSupport: boolean;      // Support slot for bigger band
  headlinerName?: string;  // If support, who are we opening for
  expectedTurnout: number; // Estimated attendance
  guaranteedPay: number;   // What manager negotiated
  accepted?: boolean;      // Has the player accepted this gig?
}

export interface GigResult {
  gig: Gig;
  outcome: GigOutcome;
  actualTurnout: number;
  performance: number;     // 0-100, how well you played
  earnings: number;        // After manager cut
  managerCut: number;      // What manager took
  // Stat changes from the gig
  fansGained: number;
  hypeChange: number;
  credChange: number;
  skillGain: number;
  // Narrative
  headline: string;        // Short summary
  description: string;     // Detailed narrative
}

export interface Song {
  id: string;
  title: string;
  quality: number;      // 0-100
  style: MusicStyle;
  hitPotential: number; // 0-100, derived from talent/skill/trend
  writtenByPlayer: boolean;
  weekWritten: number;  // When the song was created

  // Streaming era fields
  isReleased: boolean;          // Has the song been released to streaming?
  isSingle: boolean;            // Released as a single (vs album track)?
  weekReleased: number | null;  // When released to streaming
  streamsTier: StreamsTier;     // Current streaming performance level
  playlistScore: number;        // 0-100, algorithmic playlist placement score
  viralFlag: boolean;           // Temporary viral boost active
  viralWeeksRemaining: number;  // Weeks of viral boost left
  totalStreams: number;         // Lifetime stream count
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
  royaltyRate: number;    // 0-1, fraction of sales (album)
  streamingRoyaltyRate: number; // 0-1, fraction of streaming revenue
  creativeControl: CreativeControl;
  status: LabelDealStatus;
  weekSigned: number;
  // Modern deal structure
  dealType: DealType;     // 'traditional' | 'distro' | '360'
  includesMasters: boolean; // Does label own masters?
  includesMerch: boolean;   // Does label take merch cut? (360 deals)
  includesTouring: boolean; // Does label take touring cut? (360 deals)
  merchCut: number;         // 0-1, fraction of merch (if includesMerch)
  touringCut: number;       // 0-1, fraction of touring (if includesTouring)
}

export interface RivalBand {
  id: string;
  name: string;
  style: MusicStyle;
  fameTier: FameTier;
  reputation: number;        // 0-100, like cred
  hype: number;              // 0-100, current buzz
  weekFormed: number;        // When they appeared in the game
  status: RivalBandStatus;
  hits: number;              // Number of successful releases
  scandals: number;          // Controversy count
  relationship: number;      // -100 to 100, how they feel about player
  // Dynamic traits
  isRival: boolean;          // Currently a rival to player
  hasBeef: boolean;          // Active feud
  stolenFromPlayer: boolean; // Has taken something from player
}

export interface NewsItem {
  id: string;
  week: number;
  headline: string;
  details: string;
  type: NewsType;
  bandId?: string;           // If about a specific rival band
  involvesPlayer: boolean;   // If player is mentioned
  impact?: {                 // Optional player stat effects from news
    hype?: number;
    cred?: number;
    industryGoodwill?: number;
  };
}

// =============================================================================
// Actions
// =============================================================================

export interface StatDeltas {
  talent?: number;
  skill?: number;
  image?: number;
  hype?: number;
  money?: number;
  health?: number;
  stability?: number;
  cred?: number;
  addiction?: number;
  industryGoodwill?: number;
  burnout?: number;
  // Audience stats
  coreFans?: number;
  casualListeners?: number;
  // Legacy: 'fans' is distributed to coreFans for backward compatibility
  fans?: number;
  // Digital stats
  followers?: number;
  algoBoost?: number;
  cataloguePower?: number;
}

export interface ActionRequirements {
  onTour?: boolean;
  inStudio?: boolean;
  hasLabelDeal?: boolean;
  minMoney?: number;
  minHealth?: number;
  maxBurnout?: number;
  // Song-related requirements
  hasUnreleasedSongs?: boolean;  // Has songs that haven't been released
  hasReleasedMusic?: boolean;    // Has at least one released song or album
  minSongs?: number;             // Minimum total songs written
  minUnreleasedSongs?: number;   // Minimum unreleased songs needed
  // Recording session requirements
  hasActiveRecording?: boolean;  // Must have an active recording session
  noActiveRecording?: boolean;   // Cannot have an active recording session
  // Tour session requirements
  hasActiveTour?: boolean;       // Must have an active tour session
  noActiveTour?: boolean;        // Cannot have an active tour session
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
  // Streaming era conditions
  minFollowers?: number;
  maxFollowers?: number;
  minCoreFans?: number;
  minAlgoBoost?: number;
  maxAlgoBoost?: number;
  minCataloguePower?: number;
  minReleasedSongs?: number;
  // Time requirements
  minWeek?: number;
  // Flag requirements
  onTour?: boolean;
  inStudio?: boolean;
  hasLabelDeal?: boolean;
  // Band requirements
  minBandVice?: number;
  minBandSize?: number;
  minBandmates?: number;
  // Flag requirements
  hasFlag?: string;
  // Genre requirements
  preferredStyle?: MusicStyle;
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
// Temptations (forced choice interrupts)
// =============================================================================

export interface TemptationChoice {
  id: 'accept' | 'decline';
  label: string;
  effects: StatDeltas;
  resultText: string;
}

export interface Temptation {
  id: string;
  // Who or what is tempting you
  source: 'bandmate' | 'fan' | 'promoter' | 'dealer' | 'journalist' | 'label' | 'self';
  // The setup text
  prompt: string;
  // What's being offered
  offer: string;
  // Chance per turn this can trigger (0-1)
  baseChance: number;
  // Conditions that affect when this can trigger
  conditions?: {
    minWeek?: number;
    minAddiction?: number;
    maxAddiction?: number;
    minMoney?: number;
    maxMoney?: number;
    minHype?: number;
    minFans?: number;
    minBurnout?: number;
    maxBurnout?: number;
    minStability?: number;
    maxStability?: number;
    minHealth?: number;
    maxHealth?: number;
    hasLabelDeal?: boolean;
    inStudio?: boolean;
    onTour?: boolean;
  };
  // The two choices
  accept: TemptationChoice;
  decline: TemptationChoice;
  // Cooldown in weeks before this can trigger again
  cooldown?: number;
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

// =============================================================================
// Recording Session (multi-week studio time)
// =============================================================================

// Studio quality options for recording
export type StudioQuality = 'bedroom' | 'basic' | 'professional' | 'premium';

export interface StudioOption {
  id: StudioQuality;
  label: string;
  description: string;
  costPerWeek: number;
  qualityBonus: number;  // Added to base production value
}

export interface RecordingSession {
  type: 'single' | 'ep' | 'album';
  title: string;
  songIds: string[];           // Songs being recorded
  weeksRemaining: number;      // Weeks left in session
  weeksTotal: number;          // Total weeks for this type
  productionProgress: number;  // 0-100, quality builds over time
  studioQuality: StudioQuality;
  costPerWeek: number;
}

// Tour type matches economy.ts TourType
export type TourType = 'diy' | 'small' | 'support' | 'headline';

export interface TourSession {
  type: TourType;
  weeksRemaining: number;      // Weeks left on tour
  weeksTotal: number;          // Total weeks for this tour
  showsPlayed: number;         // Total shows played so far
  totalEarnings: number;       // Running total of tour earnings
  totalCosts: number;          // Running total of tour costs
  fansGained: number;          // Running total of fans gained
  costPerWeek: number;         // Weekly costs for this tour type
}

export interface GameState {
  // Core state
  player: Player;
  bandName: string;
  bandmates: Bandmate[];
  songs: Song[];
  albums: Album[];
  labelDeals: LabelDeal[];

  // Manager - books gigs for the band
  manager: Manager | null;

  // Gig system - manager books gigs, results shown after
  upcomingGig: Gig | null;       // Next gig the manager has booked
  lastGigResult: GigResult | null; // Result of most recent gig

  // Rival bands and industry news
  rivalBands: RivalBand[];
  newsItems: NewsItem[];

  // Active recording session (multi-week)
  recordingSession: RecordingSession | null;

  // Active tour session (multi-week)
  tourSession: TourSession | null;

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

  // Difficulty settings
  difficulty: Difficulty;
  difficultySettings: DifficultySettings;

  // Character creation choices
  preferredStyle: MusicStyle;
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
  // Narrative flavor
  flavorText?: string;       // Small narrative moment (no choice required)
  weekReflection?: string;   // End-of-week narrator reflection
  // Gig result (if a gig was played this week)
  gigResult?: GigResult;
}

export interface ActionResult {
  success: boolean;
  message: string;
  statChanges: StatDeltas;
  // For actions that produce something (like Write producing a song)
  producedSongId?: string;
  producedAlbumId?: string;
  // Full song data when a song is produced (for naming flow)
  producedSong?: Song;
  // For releasing an existing song as a single
  releasedSongId?: string;
}

// =============================================================================
// Naming Flow (for songs and albums)
// =============================================================================

export interface PendingSongNaming {
  type: 'song';
  song: Song;
  generatedTitle: string;
}

export interface PendingSingleNaming {
  type: 'single';
  songIds: string[];
  generatedTitle: string;
  recordAction: 'RECORD_SINGLE';
  studioQuality?: StudioQuality;
}

export interface PendingAlbumNaming {
  type: 'album';
  songIds: string[];
  generatedTitle: string;
  recordAction: 'RECORD_EP' | 'RECORD_ALBUM';
  studioQuality?: StudioQuality;
}

// Studio selection flow (shown before naming for EP/Album)
export interface PendingStudioSelection {
  type: 'studio-selection';
  songIds: string[];
  recordAction: 'RECORD_SINGLE' | 'RECORD_EP' | 'RECORD_ALBUM';
}

export type PendingNaming = PendingSongNaming | PendingSingleNaming | PendingAlbumNaming | PendingStudioSelection;

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
