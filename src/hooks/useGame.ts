'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { GameState, ActionId, TurnResult, GameEvent, EventChoice, PendingNaming, Song, RecordingSession, StudioQuality, StudioOption, Temptation, TemptationChoice, Manager, GigResult, Gig, TourType, TourSession, SupportSlotOffer } from '@/engine/types';
import { createGameState, CreateGameOptions } from '@/engine/state';
import { processTurnWithEvents } from '@/engine/turn';
import { getAvailableActions, generateSongTitle } from '@/engine/actions';
import { applyEventChoice } from '@/engine/events';
import { fireBandmate } from '@/engine/band';
import { generateAlbumTitle, TOUR_CONFIGS, getActive360Deal, TOUR_BASE_GUARANTEE, MERCH_PROFIT_PER_FAN } from '@/engine/economy';
import { createRandom } from '@/engine/random';
import { applyStatDeltas, getTotalFans, weekToYear } from '@/engine/state';
import { ALL_EVENTS } from '@/data/events';
import { ALL_TEMPTATIONS, canTemptationTrigger } from '@/data/temptations';
import { generateManagerCandidates, hireManager, fireManager, tryGenerateSupportSlotOffer, acceptSupportSlotOffer, declineSupportSlotOffer, clearExpiredOffers } from '@/engine/manager';
import { getDefaultSongStreamingFields } from '@/engine/streaming';

// Studio options with cost and quality tradeoffs
export const STUDIO_OPTIONS: StudioOption[] = [
  {
    id: 'bedroom',
    label: 'DIY / Bedroom',
    description: 'Record at home with basic gear. Cheap but lo-fi.',
    costPerWeek: 0,
    qualityBonus: 0,
  },
  {
    id: 'basic',
    label: 'Basic Studio',
    description: 'Local rehearsal space with decent equipment.',
    costPerWeek: 75,
    qualityBonus: 15,
  },
  {
    id: 'professional',
    label: 'Professional Studio',
    description: 'Real studio with an engineer. Industry standard.',
    costPerWeek: 200,
    qualityBonus: 30,
  },
  {
    id: 'premium',
    label: 'Premium Studio',
    description: 'Top-tier facility with a name producer. The big leagues.',
    costPerWeek: 500,
    qualityBonus: 50,
  },
];

// Save data structure
export interface SaveData {
  version: number;
  timestamp: number;
  gameState: GameState;
  lastOptions: CreateGameOptions | null;
  temptationCooldowns: Record<string, number>;
}

const SAVE_VERSION = 1;
const SAVE_KEY = 'failing-up-save';
const SAVE_SLOTS_KEY = 'failing-up-save-slots';

export interface SaveSlot {
  id: string;
  name: string;
  timestamp: number;
  bandName: string;
  week: number;
  year: number;
}

export interface UseGameReturn {
  // State
  gameState: GameState | null;
  isStarted: boolean;
  lastTurnResult: TurnResult | null;

  // Event state
  pendingEvent: GameEvent | null;
  eventOutcome: EventChoice | null;

  // Temptation state
  pendingTemptation: Temptation | null;
  temptationOutcome: TemptationChoice | null;

  // Naming state
  pendingNaming: PendingNaming | null;

  // Narrative state
  flavorText: string | null;
  weekReflection: string | null;

  // Gig state
  pendingGigResult: GigResult | null;
  pendingGigDecision: Gig | null;  // Gig waiting for player to accept/decline

  // Manager state
  showManagerHiring: boolean;
  managerCandidates: Manager[];

  // Save/Load state
  saveSlots: SaveSlot[];
  hasSavedGame: boolean;

  // Actions
  startGame: (options: CreateGameOptions) => void;
  takeAction: (actionId: ActionId) => void;
  handleEventChoice: (choice: EventChoice) => void;
  dismissEventOutcome: () => void;
  handleTemptationChoice: (choice: TemptationChoice) => void;
  dismissTemptationOutcome: () => void;
  restartGame: () => void;
  newGame: () => void;
  handleFireBandmate: (bandmateId: string) => void;
  selectSongsForRecording: (selectedSongIds: string[]) => void;
  selectStudio: (studioQuality: StudioQuality) => void;
  confirmNaming: (customName: string | null) => void;
  cancelNaming: () => void;

  // Save/Load actions
  saveGame: (slotId?: string) => boolean;
  loadGame: (slotId?: string) => boolean;
  deleteSave: (slotId: string) => void;
  getSaveSlots: () => SaveSlot[];

  // Manager actions
  openManagerHiring: () => void;
  selectManager: (manager: Manager) => void;
  cancelManagerHiring: () => void;
  handleFireManager: () => void;
  dismissGigResult: () => void;

  // Gig decision actions
  acceptGig: () => void;
  declineGig: () => void;

  // Tour selection
  showTourSelection: boolean;
  selectTour: (tourType: TourType) => void;
  cancelTourSelection: () => void;

  // Release selection
  showReleaseSelection: boolean;
  selectRelease: (albumId: string) => void;
  cancelReleaseSelection: () => void;

  // Support slot offers
  pendingSupportSlotOffer: SupportSlotOffer | null;
  acceptSupportSlot: () => void;
  declineSupportSlot: () => void;

  // Computed
  availableActions: ActionId[];
  currentWeekLog: string | null;
}

export function useGame(): UseGameReturn {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [lastTurnResult, setLastTurnResult] = useState<TurnResult | null>(null);
  const [lastOptions, setLastOptions] = useState<CreateGameOptions | null>(null);

  // Event handling state
  const [pendingEvent, setPendingEvent] = useState<GameEvent | null>(null);
  const [eventOutcome, setEventOutcome] = useState<EventChoice | null>(null);
  const [pendingEventState, setPendingEventState] = useState<GameState | null>(null);

  // Naming flow state
  const [pendingNaming, setPendingNaming] = useState<PendingNaming | null>(null);
  const [pendingNamingTurnResult, setPendingNamingTurnResult] = useState<TurnResult | null>(null);

  // Temptation state
  const [pendingTemptation, setPendingTemptation] = useState<Temptation | null>(null);
  const [temptationOutcome, setTemptationOutcome] = useState<TemptationChoice | null>(null);
  const [temptationCooldowns, setTemptationCooldowns] = useState<Record<string, number>>({});

  // Gig result state
  const [pendingGigResult, setPendingGigResult] = useState<GigResult | null>(null);

  // Gig decision state (when player needs to accept/decline a booked gig)
  const [pendingGigDecision, setPendingGigDecision] = useState<Gig | null>(null);

  // Manager hiring state
  const [showManagerHiring, setShowManagerHiring] = useState(false);
  const [managerCandidates, setManagerCandidates] = useState<Manager[]>([]);

  // Tour selection state
  const [showTourSelection, setShowTourSelection] = useState(false);

  // Release selection state
  const [showReleaseSelection, setShowReleaseSelection] = useState(false);

  // Save slots state
  const [saveSlots, setSaveSlots] = useState<SaveSlot[]>([]);

  // Check for pending gig decision at START of week (before action)
  useEffect(() => {
    if (!gameState) return;

    // Clear gig decision if there's no manager (can't show the modal)
    if (pendingGigDecision && !gameState.manager) {
      setPendingGigDecision(null);
      return;
    }

    if (pendingGigDecision) return; // Already showing a decision
    if (pendingEvent || pendingNaming || pendingTemptation || pendingGigResult) return; // Other modals active

    // Show gig notification at START of week if there's a gig scheduled for this week
    if (gameState.manager &&
        gameState.upcomingGig &&
        gameState.upcomingGig.week === gameState.week &&
        gameState.upcomingGig.accepted === undefined) {
      setPendingGigDecision(gameState.upcomingGig);
    }
  }, [gameState, pendingGigDecision, pendingEvent, pendingNaming, pendingTemptation, pendingGigResult]);

  // Track last week to detect week changes for support slot offer generation
  const [lastCheckedWeek, setLastCheckedWeek] = useState<number>(0);

  // Check for support slot offers when week changes
  useEffect(() => {
    if (!gameState) return;
    if (gameState.week === lastCheckedWeek) return;

    // Clear expired offers first
    let newState = clearExpiredOffers(gameState);

    // Try to generate a support slot offer (only if we don't have one)
    if (!newState.pendingSupportSlotOffer) {
      const rng = createRandom(gameState.seed + gameState.week + 8000);
      const offer = tryGenerateSupportSlotOffer(newState, rng);
      if (offer) {
        newState = {
          ...newState,
          pendingSupportSlotOffer: offer,
        };
      }
    }

    // Update state if changed
    if (newState !== gameState) {
      setGameState(newState);
    }

    setLastCheckedWeek(gameState.week);
  }, [gameState, lastCheckedWeek]);

  const startGame = useCallback((options: CreateGameOptions) => {
    const newState = createGameState(options);
    setGameState(newState);
    setLastTurnResult(null);
    setLastOptions(options);
    setPendingEvent(null);
    setEventOutcome(null);
    setPendingNaming(null);
    setPendingNamingTurnResult(null);
    setPendingTemptation(null);
    setTemptationOutcome(null);
    setTemptationCooldowns({});
    setPendingGigResult(null);
    setPendingGigDecision(null);
    setShowManagerHiring(false);
    setManagerCandidates([]);
    setShowTourSelection(false);
  }, []);

  // Helper to check and trigger a random temptation
  const checkForTemptation = useCallback((state: GameState): Temptation | null => {
    const rng = createRandom(state.seed + state.week + 5000);

    // Decrease cooldowns
    const newCooldowns: Record<string, number> = {};
    for (const [id, cooldown] of Object.entries(temptationCooldowns)) {
      if (cooldown > 1) {
        newCooldowns[id] = cooldown - 1;
      }
    }
    setTemptationCooldowns(newCooldowns);

    // Filter eligible temptations
    const eligible = ALL_TEMPTATIONS.filter(t => {
      // Check cooldown
      if (temptationCooldowns[t.id] && temptationCooldowns[t.id] > 0) return false;
      // Check conditions
      return canTemptationTrigger(t, {
        player: state.player,
        week: state.week,
        coreFans: state.player.coreFans,
      });
    });

    if (eligible.length === 0) return null;

    // Roll for each eligible temptation
    for (const temptation of eligible) {
      if (rng.next() < temptation.baseChance) {
        return temptation;
      }
    }

    return null;
  }, [temptationCooldowns]);

  const takeAction = useCallback((actionId: ActionId) => {
    if (!gameState || gameState.isGameOver) return;
    if (pendingEvent) return; // Can't act while event pending
    if (pendingNaming) return; // Can't act while naming pending
    if (pendingTemptation) return; // Can't act while temptation pending
    if (pendingGigDecision) return; // Can't act while gig decision pending

    // Handle TOUR action - show tour selection modal
    if (actionId === 'TOUR') {
      setShowTourSelection(true);
      return;
    }

    // Handle RELEASE action - show release selection modal
    if (actionId === 'RELEASE') {
      setShowReleaseSelection(true);
      return;
    }

    // Handle WRITE_AND_RECORD - show studio selection directly (no songs to select)
    if (actionId === 'WRITE_AND_RECORD') {
      setPendingNaming({
        type: 'write-and-record-studio',
      });
      return;
    }

    // Handle all RECORD actions - show song selection first
    if (actionId === 'RECORD_SINGLE' || actionId === 'RECORD_EP' || actionId === 'RECORD_ALBUM') {
      // Show song selection modal first
      setPendingNaming({
        type: 'song-selection',
        recordAction: actionId,
      });
      return;
    }

    // Handle STUDIO_WORK - continue recording session
    if (actionId === 'STUDIO_WORK') {
      if (!gameState.recordingSession) return;

      const session = gameState.recordingSession;
      const studioOption = STUDIO_OPTIONS.find(s => s.id === session.studioQuality) || STUDIO_OPTIONS[0];
      const newWeeksRemaining = session.weeksRemaining - 1;
      const newProductionProgress = Math.min(100, session.productionProgress + (100 / session.weeksTotal));
      const rng = createRandom(gameState.seed + gameState.week);

      // Track new songs created this week (for write-and-record)
      let newSongs: Song[] = [];
      let updatedSongIds = [...session.songIds];
      let songsWrittenThisWeek = 0;
      let updatedSongsWritten = session.songsWritten || 0;

      // Write-and-record: create songs during the session
      if (session.isWriteAndRecord && session.songsToWrite) {
        // Write 1-2 songs per week
        const songsRemaining = session.songsToWrite - updatedSongsWritten;
        const weeksLeft = newWeeksRemaining + 1; // Including this week
        const songsNeededPerWeek = Math.ceil(songsRemaining / weeksLeft);
        songsWrittenThisWeek = Math.min(songsRemaining, Math.max(1, songsNeededPerWeek + (rng.next() < 0.3 ? 1 : 0)));

        for (let i = 0; i < songsWrittenThisWeek; i++) {
          const baseQuality = Math.floor((gameState.player.talent + gameState.player.skill) / 2);
          const qualityVariance = rng.nextInt(-10, 15);
          const quality = Math.max(0, Math.min(100, baseQuality + qualityVariance));
          const hitPotential = Math.max(0, Math.min(100, Math.floor(quality * 0.7 + rng.nextInt(0, 30))));

          const song: Song = {
            id: `song_${gameState.week}_${rng.nextInt(0, 9999)}_${i}`,
            title: generateSongTitle(rng),
            quality,
            style: gameState.preferredStyle,
            hitPotential,
            writtenByPlayer: true,
            weekWritten: gameState.week,
            isReleased: false,
            isSingle: false,
            weekReleased: null,
            ...getDefaultSongStreamingFields(),
          };

          newSongs.push(song);
          updatedSongIds.push(song.id);
        }
        updatedSongsWritten += songsWrittenThisWeek;
      }

      // Check if recording is complete
      if (newWeeksRemaining <= 0) {
        // Recording complete - create the album
        const newAlbum = {
          id: `album_${gameState.week}_${rng.nextInt(0, 9999)}`,
          title: session.title,
          songIds: updatedSongIds,
          productionValue: Math.floor(newProductionProgress) + Math.floor(gameState.player.skill / 4) + studioOption.qualityBonus,
          promotionSpend: 0,
          reception: null,
          salesTier: null,
          labelId: gameState.labelDeals.find(d => d.status === 'active')?.id || null,
          weekReleased: null,  // Not released yet - needs RELEASE action
          chartHistory: [],
          peakChartPosition: null,
        };

        const newState: GameState = {
          ...gameState,
          songs: [...gameState.songs, ...newSongs],
          albums: [...gameState.albums, newAlbum],
          recordingSession: null,
          player: {
            ...gameState.player,
            burnout: Math.min(100, gameState.player.burnout + 2),
            skill: Math.min(100, gameState.player.skill + 1),
            money: gameState.player.money - session.costPerWeek,
            flags: { ...gameState.player.flags, inStudio: false },
          },
          week: gameState.week + 1,
          year: Math.floor(gameState.week / 52) + 1,
        };

        const label = session.type === 'ep' ? 'EP' : 'album';
        const writeNote = session.isWriteAndRecord ? ' Written and recorded from scratch.' : '';
        setGameState(newState);
        setLastTurnResult({
          newState,
          actionResult: `You finished recording "${session.title}" - a ${label} with ${updatedSongIds.length} tracks.${writeNote} Ready to release when you are.`,
          triggeredEvents: [],
          isGameOver: false,
          gameOverReason: null,
        });
        return;
      }

      // Recording continues
      const newState: GameState = {
        ...gameState,
        songs: [...gameState.songs, ...newSongs],
        recordingSession: {
          ...session,
          weeksRemaining: newWeeksRemaining,
          productionProgress: newProductionProgress,
          songIds: updatedSongIds,
          songsWritten: updatedSongsWritten,
        },
        player: {
          ...gameState.player,
          burnout: Math.min(100, gameState.player.burnout + 2),
          skill: Math.min(100, gameState.player.skill + 1),
          money: gameState.player.money - session.costPerWeek,
        },
        week: gameState.week + 1,
        year: Math.floor(gameState.week / 52) + 1,
      };

      let actionMessage = `Another week in the studio working on "${session.title}". ${newWeeksRemaining} week${newWeeksRemaining > 1 ? 's' : ''} to go. Production at ${Math.floor(newProductionProgress)}%.`;
      if (session.isWriteAndRecord && songsWrittenThisWeek > 0) {
        actionMessage = `Wrote ${songsWrittenThisWeek} new track${songsWrittenThisWeek > 1 ? 's' : ''} for "${session.title}". ${updatedSongsWritten}/${session.songsToWrite} songs done. ${newWeeksRemaining} week${newWeeksRemaining > 1 ? 's' : ''} left.`;
      }

      setGameState(newState);
      setLastTurnResult({
        newState,
        actionResult: actionMessage,
        triggeredEvents: [],
        isGameOver: false,
        gameOverReason: null,
      });
      return;
    }

    // Handle TOUR_WEEK - continue tour session
    if (actionId === 'TOUR_WEEK') {
      if (!gameState.tourSession) return;

      const session = gameState.tourSession;
      const tourConfig = TOUR_CONFIGS[session.type];
      const rng = createRandom(gameState.seed + gameState.week + 7000);

      // Calculate weekly tour gig outcome
      const totalFans = getTotalFans(gameState.player);
      const baseGuarantee = TOUR_BASE_GUARANTEE[session.type];
      const fanMultiplier = Math.log10(Math.max(100, totalFans)) / 2;
      const hypeMultiplier = 1 + (gameState.player.hype / 100);
      const showGuarantee = Math.floor(baseGuarantee * fanMultiplier * hypeMultiplier * tourConfig.revenueMultiplier);

      // Shows per week based on tour type
      const showsPerWeek = session.type === 'diy' ? 3 : session.type === 'small' ? 4 : session.type === 'support' ? 5 : 6;
      const weeklyGuarantee = showGuarantee * showsPerWeek;

      // Merch revenue
      const grossMerch = Math.floor(gameState.player.coreFans * MERCH_PROFIT_PER_FAN * (session.type === 'headline' ? 3 : 1));

      // Check for 360 deal cuts
      const deal360 = getActive360Deal(gameState);
      let labelCut = 0;
      let netMerch = grossMerch;
      let netGuarantee = weeklyGuarantee;

      if (deal360) {
        if (deal360.includesMerch && deal360.merchCut > 0) {
          const merchLabelCut = Math.floor(grossMerch * deal360.merchCut);
          netMerch = grossMerch - merchLabelCut;
          labelCut += merchLabelCut;
        }
        if (deal360.includesTouring && deal360.touringCut > 0) {
          const touringLabelCut = Math.floor(weeklyGuarantee * deal360.touringCut);
          netGuarantee = weeklyGuarantee - touringLabelCut;
          labelCut += touringLabelCut;
        }
      }

      const weeklyRevenue = netGuarantee + netMerch;
      const weeklyCosts = session.costPerWeek;

      // Fans gained this week
      const baseFansGained = Math.floor((gameState.player.hype * 2 + rng.nextInt(10, 50)) * tourConfig.fanMultiplier);
      const weeklyFansGained = Math.floor(baseFansGained * (gameState.player.skill / 50));

      // Hype gain
      const weeklyHypeGain = rng.nextInt(2, 6);

      const newWeeksRemaining = session.weeksRemaining - 1;
      const updatedSession: TourSession = {
        ...session,
        weeksRemaining: newWeeksRemaining,
        showsPlayed: session.showsPlayed + showsPerWeek,
        totalEarnings: session.totalEarnings + weeklyRevenue,
        totalCosts: session.totalCosts + weeklyCosts,
        fansGained: session.fansGained + weeklyFansGained,
      };

      // Check if tour is complete
      if (newWeeksRemaining <= 0) {
        // Tour complete!
        const netProfit = updatedSession.totalEarnings - updatedSession.totalCosts;

        const newState: GameState = {
          ...gameState,
          tourSession: null,
          player: {
            ...gameState.player,
            money: gameState.player.money + weeklyRevenue - weeklyCosts,
            casualListeners: gameState.player.casualListeners + weeklyFansGained,
            hype: Math.min(100, gameState.player.hype + weeklyHypeGain),
            burnout: Math.min(100, gameState.player.burnout + 5),
            health: Math.max(0, gameState.player.health - 3),
            flags: { ...gameState.player.flags, onTour: false },
          },
          week: gameState.week + 1,
          year: Math.floor(gameState.week / 52) + 1,
        };

        const profitText = netProfit >= 0 ? `Profit: £${netProfit.toLocaleString()}` : `Loss: £${Math.abs(netProfit).toLocaleString()}`;

        setGameState(newState);
        setLastTurnResult({
          newState,
          actionResult: `Tour complete! ${updatedSession.showsPlayed} shows played over ${updatedSession.weeksTotal} weeks. ${profitText}. Gained ${updatedSession.fansGained.toLocaleString()} new fans.`,
          triggeredEvents: [],
          isGameOver: false,
          gameOverReason: null,
        });
        return;
      }

      // Tour continues
      const newState: GameState = {
        ...gameState,
        tourSession: updatedSession,
        player: {
          ...gameState.player,
          money: gameState.player.money + weeklyRevenue - weeklyCosts,
          casualListeners: gameState.player.casualListeners + weeklyFansGained,
          hype: Math.min(100, gameState.player.hype + weeklyHypeGain),
          burnout: Math.min(100, gameState.player.burnout + 3),
          health: Math.max(0, gameState.player.health - 2),
        },
        week: gameState.week + 1,
        year: Math.floor(gameState.week / 52) + 1,
      };

      const netThisWeek = weeklyRevenue - weeklyCosts;
      const labelCutText = labelCut > 0 ? ` (£${labelCut} to label)` : '';

      setGameState(newState);
      setLastTurnResult({
        newState,
        actionResult: `Week ${updatedSession.weeksTotal - newWeeksRemaining} of ${updatedSession.weeksTotal} on tour. Played ${showsPerWeek} shows. £${netThisWeek >= 0 ? '+' : ''}${netThisWeek.toLocaleString()} this week${labelCutText}. +${weeklyFansGained} fans. ${newWeeksRemaining} week${newWeeksRemaining > 1 ? 's' : ''} to go.`,
        triggeredEvents: [],
        isGameOver: false,
        gameOverReason: null,
      });
      return;
    }

    const result = processTurnWithEvents(gameState, actionId, ALL_EVENTS);

    // Check if a song was produced - if so, show naming modal
    if (result.newState.songs.length > gameState.songs.length) {
      // A new song was added - find it and show naming modal
      const newSong = result.newState.songs[result.newState.songs.length - 1];

      setPendingNaming({
        type: 'song',
        song: newSong,
        generatedTitle: newSong.title,
      });
      setPendingNamingTurnResult(result);
      return;
    }

    // If there was a gig this turn, show the result first
    if (result.gigResult) {
      setPendingGigResult(result.gigResult);
      setPendingEventState(result.newState);
      setLastTurnResult(result);
      return; // Wait for gig result dismissal before showing events
    }

    // If there's a triggered event, show it before finalizing
    if (result.triggeredEvents.length > 0) {
      setPendingEvent(result.triggeredEvents[0]);
      setPendingEventState(result.newState);
      setLastTurnResult(result);
    } else {
      // No event, just update state
      setGameState(result.newState);
      setLastTurnResult(result);

      // Check for temptation
      const temptation = checkForTemptation(result.newState);
      if (temptation) {
        setPendingTemptation(temptation);
      }
    }
  }, [gameState, pendingEvent, pendingNaming, pendingTemptation, pendingGigDecision, pendingGigResult, checkForTemptation]);

  const handleEventChoice = useCallback((choice: EventChoice) => {
    if (!pendingEvent || !pendingEventState) return;

    // Apply event choice to state
    const newState = applyEventChoice(pendingEventState, pendingEvent, choice);

    // Show outcome
    setEventOutcome(choice);
    setPendingEventState(newState);
  }, [pendingEvent, pendingEventState]);

  const dismissEventOutcome = useCallback(() => {
    if (!pendingEventState) return;

    // Finalize state with event applied
    setGameState(pendingEventState);

    // Update week log with event info
    if (lastTurnResult && pendingEvent && eventOutcome) {
      const updatedLog = {
        ...lastTurnResult,
        newState: pendingEventState,
      };
      setLastTurnResult(updatedLog);
    }

    // Clear event state
    setPendingEvent(null);
    setEventOutcome(null);
    setPendingEventState(null);

    // Check for temptation after event resolves
    const temptation = checkForTemptation(pendingEventState);
    if (temptation) {
      setPendingTemptation(temptation);
    }
  }, [pendingEventState, lastTurnResult, pendingEvent, eventOutcome, checkForTemptation]);

  // Temptation handlers
  const handleTemptationChoice = useCallback((choice: TemptationChoice) => {
    if (!pendingTemptation || !gameState) return;

    // Apply the choice effects
    const newPlayer = applyStatDeltas(gameState.player, choice.effects);
    const newState: GameState = {
      ...gameState,
      player: newPlayer,
    };

    // Set cooldown for this temptation
    if (pendingTemptation.cooldown) {
      setTemptationCooldowns(prev => ({
        ...prev,
        [pendingTemptation.id]: pendingTemptation.cooldown!,
      }));
    }

    // Update state and show outcome
    setGameState(newState);
    setTemptationOutcome(choice);
  }, [pendingTemptation, gameState]);

  const dismissTemptationOutcome = useCallback(() => {
    setPendingTemptation(null);
    setTemptationOutcome(null);
  }, []);

  // Manager handlers
  const openManagerHiring = useCallback(() => {
    if (!gameState) return;
    const rng = createRandom(gameState.seed + gameState.week + 6000);
    const totalFans = getTotalFans(gameState.player);
    const candidates = generateManagerCandidates(3, totalFans, gameState.player.hype, rng);
    setManagerCandidates(candidates);
    setShowManagerHiring(true);
  }, [gameState]);

  const selectManager = useCallback((manager: Manager) => {
    if (!gameState) return;
    const newState = hireManager(gameState, manager);
    setGameState(newState);
    setShowManagerHiring(false);
    setManagerCandidates([]);
  }, [gameState]);

  const cancelManagerHiring = useCallback(() => {
    setShowManagerHiring(false);
    setManagerCandidates([]);
  }, []);

  const handleFireManager = useCallback(() => {
    if (!gameState || !gameState.manager) return;
    const newState = fireManager(gameState);
    setGameState(newState);
  }, [gameState]);

  // Gig result handler
  const dismissGigResult = useCallback(() => {
    setPendingGigResult(null);

    // After dismissing gig result, finalize state and check for events
    if (pendingEventState && lastTurnResult) {
      // Check if there are triggered events to show
      if (lastTurnResult.triggeredEvents.length > 0) {
        setPendingEvent(lastTurnResult.triggeredEvents[0]);
        // Keep pendingEventState for event resolution
      } else {
        // No events, finalize the state
        setGameState(pendingEventState);
        setPendingEventState(null);

        // Check for temptation
        const temptation = checkForTemptation(pendingEventState);
        if (temptation) {
          setPendingTemptation(temptation);
        }
      }
    }
  }, [pendingEventState, lastTurnResult, checkForTemptation]);

  // Gig decision handlers
  const acceptGig = useCallback(() => {
    if (!gameState || !pendingGigDecision) return;

    // Mark the gig as accepted - it will resolve at end of week in turn processing
    const acceptedGig = { ...pendingGigDecision, accepted: true };
    setGameState({
      ...gameState,
      upcomingGig: acceptedGig,
    });
    setPendingGigDecision(null);
  }, [gameState, pendingGigDecision]);

  const declineGig = useCallback(() => {
    if (!gameState || !pendingGigDecision) return;

    // Cancel the gig - may hurt manager relationship/reputation
    // Small hit to manager's ability to book future gigs
    const updatedManager = gameState.manager ? {
      ...gameState.manager,
      reputation: Math.max(0, gameState.manager.reputation - 5),
    } : null;

    setGameState({
      ...gameState,
      upcomingGig: null,
      manager: updatedManager,
    });
    setPendingGigDecision(null);
  }, [gameState, pendingGigDecision]);

  // Tour selection handlers
  const selectTour = useCallback((tourType: TourType) => {
    if (!gameState) return;

    const tourConfig = TOUR_CONFIGS[tourType];

    // Validate player can afford the tour
    if (gameState.player.money < tourConfig.minMoney) return;
    if (getTotalFans(gameState.player) < tourConfig.minFans) return;
    if (tourConfig.requiresLabel && !gameState.player.flags.hasLabelDeal) return;

    // Create tour session
    const session: TourSession = {
      type: tourType,
      weeksRemaining: tourConfig.weeksRequired,
      weeksTotal: tourConfig.weeksRequired,
      showsPlayed: 0,
      totalEarnings: 0,
      totalCosts: tourConfig.upfrontCost,
      fansGained: 0,
      costPerWeek: tourConfig.weeklyBaseCost,
    };

    // Apply upfront cost and start tour
    const newState: GameState = {
      ...gameState,
      tourSession: session,
      player: {
        ...gameState.player,
        money: gameState.player.money - tourConfig.upfrontCost,
        flags: { ...gameState.player.flags, onTour: true },
      },
    };

    setGameState(newState);
    setShowTourSelection(false);
    setLastTurnResult({
      newState,
      actionResult: `You're hitting the road! ${tourConfig.name} kicks off - ${tourConfig.weeksRequired} weeks of shows ahead. £${tourConfig.upfrontCost.toLocaleString()} upfront costs paid.`,
      triggeredEvents: [],
      isGameOver: false,
      gameOverReason: null,
    });
  }, [gameState]);

  const cancelTourSelection = useCallback(() => {
    setShowTourSelection(false);
  }, []);

  // Release selection handlers
  const selectRelease = useCallback((albumId: string) => {
    if (!gameState) return;

    const album = gameState.albums.find(a => a.id === albumId);
    if (!album || album.weekReleased !== null) return;

    const rng = createRandom(gameState.seed + gameState.week + 9000);

    // Calculate release impact based on album quality and player stats
    const albumSongs = gameState.songs.filter(s => album.songIds.includes(s.id));
    const avgQuality = albumSongs.length > 0
      ? albumSongs.reduce((sum, s) => sum + s.quality, 0) / albumSongs.length
      : 50;

    const baseScore = (avgQuality + album.productionValue) / 2;
    const digitalBoost = (gameState.player.algoBoost + gameState.player.followers / 10000) / 2;
    const totalScore = baseScore + digitalBoost + rng.nextInt(-10, 10);

    // Determine release tier and message
    let tierName: string;
    if (totalScore >= 80) tierName = 'massive buzz';
    else if (totalScore >= 60) tierName = 'strong start';
    else if (totalScore >= 40) tierName = 'steady streams';
    else tierName = 'quiet release';

    // Stat gains scale with release quality and number of tracks
    const trackMultiplier = Math.sqrt(album.songIds.length);
    const hypeGain = Math.floor((3 + totalScore / 20) * trackMultiplier);
    const algoBoostGain = Math.floor((2 + totalScore / 30) * trackMultiplier);
    const casualListenersGain = Math.floor(totalScore * 5 * trackMultiplier);
    const coreFansGain = Math.floor(totalScore / 5 * trackMultiplier);

    // Mark album as released
    const updatedAlbums = gameState.albums.map(a =>
      a.id === albumId ? { ...a, weekReleased: gameState.week } : a
    );

    // Mark songs as released
    const updatedSongs = gameState.songs.map(s =>
      album.songIds.includes(s.id)
        ? { ...s, isReleased: true, weekReleased: gameState.week, isSingle: album.songIds.length === 1 }
        : s
    );

    // Determine release type label
    const trackCount = album.songIds.length;
    let typeLabel = 'album';
    if (trackCount === 1) typeLabel = 'single';
    else if (trackCount <= 6) typeLabel = 'EP';

    const newState: GameState = {
      ...gameState,
      albums: updatedAlbums,
      songs: updatedSongs,
      player: {
        ...gameState.player,
        hype: Math.min(100, gameState.player.hype + hypeGain),
        algoBoost: Math.min(100, gameState.player.algoBoost + algoBoostGain),
        casualListeners: gameState.player.casualListeners + casualListenersGain,
        coreFans: gameState.player.coreFans + coreFansGain,
        burnout: Math.min(100, gameState.player.burnout + 1),
      },
      week: gameState.week + 1,
      year: Math.floor(gameState.week / 52) + 1,
    };

    setGameState(newState);
    setShowReleaseSelection(false);
    setLastTurnResult({
      newState,
      actionResult: `You dropped "${album.title}" - ${tierName}! The ${typeLabel} is out there now.`,
      triggeredEvents: [],
      isGameOver: false,
      gameOverReason: null,
    });
  }, [gameState]);

  const cancelReleaseSelection = useCallback(() => {
    setShowReleaseSelection(false);
  }, []);

  // Support slot offer handlers
  const acceptSupportSlot = useCallback(() => {
    if (!gameState || !gameState.pendingSupportSlotOffer) return;

    const newState = acceptSupportSlotOffer(gameState, gameState.pendingSupportSlotOffer);
    setGameState(newState);
  }, [gameState]);

  const declineSupportSlot = useCallback(() => {
    if (!gameState || !gameState.pendingSupportSlotOffer) return;

    const newState = declineSupportSlotOffer(gameState);
    setGameState(newState);
  }, [gameState]);

  // Song selection handler - after selecting songs, move to studio selection
  const selectSongsForRecording = useCallback((selectedSongIds: string[]) => {
    if (!pendingNaming || pendingNaming.type !== 'song-selection' || !gameState) return;

    // Move to studio selection with selected songs
    setPendingNaming({
      type: 'studio-selection',
      songIds: selectedSongIds,
      recordAction: pendingNaming.recordAction,
    });
  }, [pendingNaming, gameState]);

  // Studio selection handler
  const selectStudio = useCallback((studioQuality: StudioQuality) => {
    if (!pendingNaming || !gameState) return;

    // Handle write-and-record studio selection
    if (pendingNaming.type === 'write-and-record-studio') {
      const rng = createRandom(gameState.seed + gameState.week + 1000);
      const generatedTitle = generateAlbumTitle(rng);
      setPendingNaming({
        type: 'write-and-record',
        generatedTitle,
        studioQuality,
      });
      return;
    }

    if (pendingNaming.type !== 'studio-selection') return;

    const rng = createRandom(gameState.seed + gameState.week + 1000);
    const generatedTitle = generateAlbumTitle(rng);

    if (pendingNaming.recordAction === 'RECORD_SINGLE') {
      setPendingNaming({
        type: 'single',
        songIds: pendingNaming.songIds,
        generatedTitle,
        recordAction: 'RECORD_SINGLE',
        studioQuality,
      });
    } else {
      // For EP and Album, type should reflect what we're recording
      const namingType = pendingNaming.recordAction === 'RECORD_EP' ? 'ep' : 'album';
      setPendingNaming({
        type: 'album',  // The union type, but we'll pass the specific type in the object
        songIds: pendingNaming.songIds,
        generatedTitle,
        recordAction: pendingNaming.recordAction,
        studioQuality,
      });
    }
  }, [pendingNaming, gameState]);

  // Naming flow handlers
  const confirmNaming = useCallback((customName: string | null) => {
    if (!pendingNaming || !gameState) return;
    // Song and studio selection are handled separately
    if (pendingNaming.type === 'studio-selection') return;
    if (pendingNaming.type === 'song-selection') return;
    if (pendingNaming.type === 'write-and-record-studio') return;

    const finalName = customName || pendingNaming.generatedTitle;

    if (pendingNaming.type === 'song') {
      // Update the song with the custom name and finalize the turn
      if (!pendingNamingTurnResult) return;

      const updatedSongs = pendingNamingTurnResult.newState.songs.map(song =>
        song.id === pendingNaming.song.id
          ? { ...song, title: finalName }
          : song
      );

      const updatedState = {
        ...pendingNamingTurnResult.newState,
        songs: updatedSongs,
      };

      // Update the message to reflect the custom name
      const updatedResult = {
        ...pendingNamingTurnResult,
        newState: updatedState,
        actionResult: pendingNamingTurnResult.actionResult.replace(
          `"${pendingNaming.generatedTitle}"`,
          `"${finalName}"`
        ),
      };

      // Check for events after naming
      if (updatedResult.triggeredEvents.length > 0) {
        setPendingEvent(updatedResult.triggeredEvents[0]);
        setPendingEventState(updatedState);
        setLastTurnResult(updatedResult);
      } else {
        setGameState(updatedState);
        setLastTurnResult(updatedResult);
      }
    } else if (pendingNaming.type === 'single') {
      // Singles are recorded immediately (1 week)
      const rng = createRandom(gameState.seed + gameState.week);
      const studioOption = STUDIO_OPTIONS.find(s => s.id === pendingNaming.studioQuality) || STUDIO_OPTIONS[0];

      const newAlbum = {
        id: `album_${gameState.week}_${rng.nextInt(0, 9999)}`,
        title: finalName,
        songIds: pendingNaming.songIds,
        productionValue: 50 + Math.floor(gameState.player.skill / 2) + studioOption.qualityBonus,
        promotionSpend: 0,
        reception: null,
        salesTier: null,
        labelId: gameState.labelDeals.find(d => d.status === 'active')?.id || null,
        weekReleased: null,  // Not released yet - needs RELEASE action
        chartHistory: [],
        peakChartPosition: null,
      };

      const studioCost = studioOption.costPerWeek;
      const newState: GameState = {
        ...gameState,
        albums: [...gameState.albums, newAlbum],
        player: {
          ...gameState.player,
          burnout: Math.min(100, gameState.player.burnout + 1),
          skill: Math.min(100, gameState.player.skill + 1),
          money: gameState.player.money - studioCost,
        },
        week: gameState.week + 1,
        year: Math.floor(gameState.week / 52) + 1,
      };

      const studioLabel = studioOption.id === 'bedroom' ? 'in your bedroom' : `at ${studioOption.label}`;
      setGameState(newState);
      setLastTurnResult({
        newState,
        actionResult: `You recorded "${finalName}" ${studioLabel}. One track in the can. Ready to drop whenever.`,
        triggeredEvents: [],
        isGameOver: false,
        gameOverReason: null,
      });
    } else if (pendingNaming.type === 'album') {
      // EPs and Albums start multi-week recording sessions
      const studioOption = STUDIO_OPTIONS.find(s => s.id === pendingNaming.studioQuality) || STUDIO_OPTIONS[0];
      const weeksTotal = pendingNaming.recordAction === 'RECORD_EP' ? 2 : 4;
      const typeLabel = pendingNaming.recordAction === 'RECORD_EP' ? 'EP' : 'album';

      const session: RecordingSession = {
        type: pendingNaming.recordAction === 'RECORD_EP' ? 'ep' : 'album',
        title: finalName,
        songIds: pendingNaming.songIds,
        weeksRemaining: weeksTotal,
        weeksTotal,
        productionProgress: 0,
        studioQuality: studioOption.id,
        costPerWeek: studioOption.costPerWeek,
      };

      const newState: GameState = {
        ...gameState,
        recordingSession: session,
        player: {
          ...gameState.player,
          flags: { ...gameState.player.flags, inStudio: true },
        },
      };

      const studioLabel = studioOption.id === 'bedroom' ? 'your bedroom setup' : studioOption.label;
      setGameState(newState);
      setLastTurnResult({
        newState,
        actionResult: `You've booked ${weeksTotal} weeks to record "${finalName}" at ${studioLabel}. Time to make some noise.`,
        triggeredEvents: [],
        isGameOver: false,
        gameOverReason: null,
      });
    } else if (pendingNaming.type === 'write-and-record') {
      // Write-and-record: 8-week session to write and record an album from scratch
      const studioOption = STUDIO_OPTIONS.find(s => s.id === pendingNaming.studioQuality) || STUDIO_OPTIONS[0];
      const weeksTotal = 8;
      const songsToWrite = 10;

      const session: RecordingSession = {
        type: 'album',
        title: finalName,
        songIds: [],  // Songs will be created during the session
        weeksRemaining: weeksTotal,
        weeksTotal,
        productionProgress: 0,
        studioQuality: studioOption.id,
        costPerWeek: studioOption.costPerWeek,
        isWriteAndRecord: true,
        songsToWrite,
        songsWritten: 0,
      };

      const newState: GameState = {
        ...gameState,
        recordingSession: session,
        player: {
          ...gameState.player,
          flags: { ...gameState.player.flags, inStudio: true },
        },
      };

      const studioLabel = studioOption.id === 'bedroom' ? 'your bedroom setup' : studioOption.label;
      setGameState(newState);
      setLastTurnResult({
        newState,
        actionResult: `You've locked yourself in ${studioLabel} for ${weeksTotal} weeks. Time to write and record "${finalName}" from scratch.`,
        triggeredEvents: [],
        isGameOver: false,
        gameOverReason: null,
      });
    }

    // Clear naming state
    setPendingNaming(null);
    setPendingNamingTurnResult(null);
  }, [pendingNaming, pendingNamingTurnResult, gameState]);

  const cancelNaming = useCallback(() => {
    // Cancel and don't proceed with the action
    setPendingNaming(null);
    setPendingNamingTurnResult(null);
  }, []);

  const restartGame = useCallback(() => {
    if (lastOptions) {
      const newState = createGameState({
        ...lastOptions,
        seed: undefined,
      });
      setGameState(newState);
      setLastTurnResult(null);
      setPendingEvent(null);
      setEventOutcome(null);
      setPendingEventState(null);
      setPendingNaming(null);
      setPendingNamingTurnResult(null);
      setPendingTemptation(null);
      setTemptationOutcome(null);
      setTemptationCooldowns({});
      setPendingGigResult(null);
      setPendingGigDecision(null);
      setShowManagerHiring(false);
      setManagerCandidates([]);
      setShowTourSelection(false);
    }
  }, [lastOptions]);

  const newGame = useCallback(() => {
    setGameState(null);
    setLastTurnResult(null);
    setLastOptions(null);
    setPendingEvent(null);
    setEventOutcome(null);
    setPendingEventState(null);
    setPendingNaming(null);
    setPendingNamingTurnResult(null);
    setPendingTemptation(null);
    setTemptationOutcome(null);
    setTemptationCooldowns({});
    setPendingGigResult(null);
    setPendingGigDecision(null);
    setShowManagerHiring(false);
    setManagerCandidates([]);
    setShowTourSelection(false);
  }, []);

  const handleFireBandmate = useCallback((bandmateId: string) => {
    if (!gameState || gameState.isGameOver) return;
    if (pendingEvent) return; // Can't fire while event pending

    const newState = fireBandmate(gameState, bandmateId);
    setGameState(newState);
  }, [gameState, pendingEvent]);

  const availableActions = useMemo(() => {
    if (!gameState) return [];
    return getAvailableActions(gameState);
  }, [gameState]);

  const currentWeekLog = useMemo(() => {
    if (!lastTurnResult) return null;
    return lastTurnResult.actionResult;
  }, [lastTurnResult]);

  const flavorText = useMemo(() => {
    if (!lastTurnResult) return null;
    return lastTurnResult.flavorText || null;
  }, [lastTurnResult]);

  const weekReflection = useMemo(() => {
    if (!lastTurnResult) return null;
    return lastTurnResult.weekReflection || null;
  }, [lastTurnResult]);

  // Load save slots on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const slotsJson = localStorage.getItem(SAVE_SLOTS_KEY);
      if (slotsJson) {
        setSaveSlots(JSON.parse(slotsJson));
      }
    } catch (e) {
      console.error('Failed to load save slots:', e);
    }
  }, []);

  // Check if there's a saved game (quick save or any slot)
  const hasSavedGame = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(SAVE_KEY) !== null || saveSlots.length > 0;
  }, [saveSlots]);

  // Get all save slots
  const getSaveSlots = useCallback((): SaveSlot[] => {
    if (typeof window === 'undefined') return [];
    try {
      const slotsJson = localStorage.getItem(SAVE_SLOTS_KEY);
      return slotsJson ? JSON.parse(slotsJson) : [];
    } catch (e) {
      console.error('Failed to get save slots:', e);
      return [];
    }
  }, []);

  // Save game to a slot (or quick save if no slotId)
  const saveGame = useCallback((slotId?: string): boolean => {
    if (!gameState || typeof window === 'undefined') return false;

    try {
      const saveData: SaveData = {
        version: SAVE_VERSION,
        timestamp: Date.now(),
        gameState,
        lastOptions,
        temptationCooldowns,
      };

      const saveKey = slotId ? `${SAVE_KEY}-${slotId}` : SAVE_KEY;
      localStorage.setItem(saveKey, JSON.stringify(saveData));

      // Update save slots registry
      if (slotId) {
        const slots = getSaveSlots();
        const existingIndex = slots.findIndex(s => s.id === slotId);
        const slotInfo: SaveSlot = {
          id: slotId,
          name: `Slot ${slotId}`,
          timestamp: Date.now(),
          bandName: gameState.bandName,
          week: gameState.week,
          year: gameState.year,
        };

        if (existingIndex >= 0) {
          slots[existingIndex] = slotInfo;
        } else {
          slots.push(slotInfo);
        }

        localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(slots));
        setSaveSlots(slots);
      }

      return true;
    } catch (e) {
      console.error('Failed to save game:', e);
      return false;
    }
  }, [gameState, lastOptions, temptationCooldowns, getSaveSlots]);

  // Load game from a slot (or quick save if no slotId)
  const loadGame = useCallback((slotId?: string): boolean => {
    if (typeof window === 'undefined') return false;

    try {
      const saveKey = slotId ? `${SAVE_KEY}-${slotId}` : SAVE_KEY;
      const saveJson = localStorage.getItem(saveKey);

      if (!saveJson) {
        console.error('No save data found');
        return false;
      }

      const saveData: SaveData = JSON.parse(saveJson);

      // Version check - could add migration logic here
      if (saveData.version !== SAVE_VERSION) {
        console.warn('Save version mismatch, attempting to load anyway');
      }

      // Restore state
      setGameState(saveData.gameState);
      setLastOptions(saveData.lastOptions);
      setTemptationCooldowns(saveData.temptationCooldowns);

      // Clear transient state
      setLastTurnResult(null);
      setPendingEvent(null);
      setEventOutcome(null);
      setPendingEventState(null);
      setPendingNaming(null);
      setPendingNamingTurnResult(null);
      setPendingTemptation(null);
      setTemptationOutcome(null);
      setPendingGigResult(null);
      setPendingGigDecision(null);
      setShowManagerHiring(false);
      setManagerCandidates([]);
      setShowTourSelection(false);
      setShowReleaseSelection(false);

      return true;
    } catch (e) {
      console.error('Failed to load game:', e);
      return false;
    }
  }, []);

  // Delete a save slot
  const deleteSave = useCallback((slotId: string) => {
    if (typeof window === 'undefined') return;

    try {
      // Remove the save data
      const saveKey = `${SAVE_KEY}-${slotId}`;
      localStorage.removeItem(saveKey);

      // Update slots registry
      const slots = getSaveSlots().filter(s => s.id !== slotId);
      localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(slots));
      setSaveSlots(slots);
    } catch (e) {
      console.error('Failed to delete save:', e);
    }
  }, [getSaveSlots]);

  return {
    gameState,
    isStarted: gameState !== null,
    lastTurnResult,
    pendingEvent,
    eventOutcome,
    pendingTemptation,
    temptationOutcome,
    pendingNaming,
    flavorText,
    weekReflection,
    pendingGigResult,
    pendingGigDecision,
    showManagerHiring,
    managerCandidates,
    startGame,
    takeAction,
    handleEventChoice,
    dismissEventOutcome,
    handleTemptationChoice,
    dismissTemptationOutcome,
    restartGame,
    newGame,
    handleFireBandmate,
    selectSongsForRecording,
    selectStudio,
    confirmNaming,
    cancelNaming,
    openManagerHiring,
    selectManager,
    cancelManagerHiring,
    handleFireManager,
    dismissGigResult,
    acceptGig,
    declineGig,
    showTourSelection,
    selectTour,
    cancelTourSelection,
    showReleaseSelection,
    selectRelease,
    cancelReleaseSelection,
    pendingSupportSlotOffer: gameState?.pendingSupportSlotOffer || null,
    acceptSupportSlot,
    declineSupportSlot,
    availableActions,
    currentWeekLog,
    // Save/Load
    saveSlots,
    hasSavedGame,
    saveGame,
    loadGame,
    deleteSave,
    getSaveSlots,
  };
}
