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

      // Check if recording is complete
      if (newWeeksRemaining <= 0) {
        // Recording complete - create the album
        const rng = createRandom(gameState.seed + gameState.week);
        const newAlbum = {
          id: `album_${gameState.week}_${rng.nextInt(0, 9999)}`,
          title: session.title,
          songIds: session.songIds,
          productionValue: Math.floor(newProductionProgress) + Math.floor(gameState.player.skill / 4) + studioOption.qualityBonus,
          promotionSpend: 0,
          reception: null,
          salesTier: null,
          labelId: gameState.labelDeals.find(d => d.status === 'active')?.id || null,
          weekReleased: gameState.week,
        };

        const newState: GameState = {
          ...gameState,
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
        setGameState(newState);
        setLastTurnResult({
          newState,
          actionResult: `You finished recording "${session.title}" - a ${label} with ${session.songIds.length} tracks. Time to let the world hear it.`,
          triggeredEvents: [],
          isGameOver: false,
          gameOverReason: null,
        });
        return;
      }

      // Recording continues
      const newState: GameState = {
        ...gameState,
        recordingSession: {
          ...session,
          weeksRemaining: newWeeksRemaining,
          productionProgress: newProductionProgress,
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

      setGameState(newState);
      setLastTurnResult({
        newState,
        actionResult: `Another week in the studio working on "${session.title}". ${newWeeksRemaining} week${newWeeksRemaining > 1 ? 's' : ''} to go. Production at ${Math.floor(newProductionProgress)}%.`,
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
    if (!pendingNaming || pendingNaming.type !== 'studio-selection' || !gameState) return;

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
        weekReleased: gameState.week,
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
        actionResult: `You recorded "${finalName}" ${studioLabel}. One track, done in a week.`,
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
    pendingSupportSlotOffer: gameState?.pendingSupportSlotOffer || null,
    acceptSupportSlot,
    declineSupportSlot,
    availableActions,
    currentWeekLog,
  };
}
