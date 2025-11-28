# Failing Up: Implementation Plan

Reference: [DESIGN.md](./DESIGN.md)

## Overview

This document tracks the implementation of "Failing Up: A Rock Star Story" - a text-based, turn-based rock career sim built with Next.js and TypeScript.

**Strategy**: Build vertically - get a playable game loop working first with minimal content, then expand horizontally with more events, actions, and polish.

---

## Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Main game screen
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── game/             # Game-specific components
│   │   ├── StatsDisplay.tsx
│   │   ├── ActionPanel.tsx
│   │   ├── EventModal.tsx
│   │   ├── WeeklyLog.tsx
│   │   └── EndingScreen.tsx
│   └── ui/               # Reusable UI components
├── engine/               # Core game logic (framework-agnostic)
│   ├── types.ts          # TypeScript interfaces
│   ├── state.ts          # Game state management
│   ├── actions.ts        # Weekly action definitions & logic
│   ├── events.ts         # Event system
│   ├── arcs.ts           # Arc progression system
│   ├── economy.ts        # Money, costs, label deals
│   ├── band.ts           # Bandmate logic
│   ├── songs.ts          # Song/album creation
│   ├── endings.ts        # Ending determination
│   └── turn.ts           # Main turn resolution
├── data/                 # Static game data
│   ├── actions.json      # Action definitions
│   ├── events/           # Event JSON files
│   └── arcs.json         # Arc definitions
└── hooks/                # React hooks
    └── useGame.ts        # Main game state hook
```

---

## Milestones

### Milestone 1: Core Game Loop (Playable Skeleton) - COMPLETE
**Goal**: A playable game where you can take actions and see stats change week-over-week.

- [x] Project setup (Next.js, TypeScript, Tailwind, Jest)
- [x] Define TypeScript interfaces for all core entities
- [x] Implement initial game state creation (character setup)
- [x] Implement 3 basic actions: Rest, Write, Play Local Gig
- [x] Implement weekly turn function (costs, action effects, stat updates)
- [x] Build basic UI: stats display, action buttons, week counter
- [x] Add hype decay and basic money flow
- [x] Write tests for turn resolution and stat calculations (56 tests passing)
- [x] Basic game over condition (death, broke, time limit, band collapse)

**Deliverable**: Can start game, take weekly actions, see stats change, game ends when broke or time runs out.

**Status**: COMPLETE - Playable skeleton achieved!

---

### Milestone 2: Events System - COMPLETE
**Goal**: Random events trigger based on game state, adding narrative variety.

- [x] Design event data structure and trigger conditions
- [x] Implement event selection algorithm (weighted random by eligibility)
- [x] Create 15 starter events (band conflicts, money, health, gigs, scene)
- [x] Build event modal UI with choices and outcome display
- [x] Apply event outcomes to game state
- [x] Write tests for event triggering and outcome application (20 new tests)

**Deliverable**: Events pop up after actions with meaningful choices that affect the game.

**Status**: COMPLETE - 15 events across 5 categories, modal UI with hints, 76 total tests passing.

---

### Milestone 3: Full Action Set & Economy - COMPLETE
**Goal**: All core actions available with proper economic balance.

- [x] All 10 actions implemented (already done in M1)
- [x] Implement label deal system (advances, recoupment, royalties)
- [x] Implement album creation and sales tracking
- [x] Add touring economics (guarantees, costs, merch)
- [x] Add 6 label/industry events
- [x] Write tests for economy calculations (22 new tests)

**Deliverable**: Full action variety with realistic money pressure.

**Status**: COMPLETE - Economy engine with label deals, album sales tiers, tour finances. 98 total tests.

---

### Milestone 4: Bandmates - COMPLETE
**Goal**: Bandmates with personalities that affect gameplay.

- [x] Implement bandmate generation with randomized attributes
- [x] Add band performance calculations (talent average, reliability)
- [x] Create bandmate-related events (fights, departures, deaths)
- [x] Add ability to fire/hire bandmates
- [x] Write tests for band dynamics

**Deliverable**: Band members that help or hinder your career with their own drama.

**Status**: COMPLETE - Band management engine with 11 events, UI with fire capability, 43 new tests (141 total).

---

### Milestone 5: Arcs & Narrative Depth
**Goal**: Multi-event storylines that create emergent narratives.

- [ ] Implement arc system (entry conditions, stage progression)
- [ ] Create Addiction Arc (4 stages)
- [ ] Create Label Deal Arc (offer through success/dropped)
- [ ] Create Band Breakup Arc
- [ ] Add arc-specific events and callbacks
- [ ] Write tests for arc progression

**Deliverable**: Connected storylines that develop over multiple weeks.

---

### Milestone 6: Endings & Polish
**Goal**: Satisfying conclusions with narrative callbacks.

- [ ] Implement ending determination algorithm
- [ ] Create 6 base endings with variations
- [ ] Add ending callbacks to reference past events
- [ ] Add game history/log for ending summary
- [ ] Create new game / restart flow
- [ ] UI polish: animations, better typography, responsive design
- [ ] Write tests for ending selection

**Deliverable**: Complete game loop with meaningful endings.

---

### Milestone 7: Content Expansion
**Goal**: Enough content for varied, replayable runs.

- [ ] Expand to 40-60 generic events
- [ ] Add 20-30 addiction/health events
- [ ] Add 20-30 industry/label events
- [ ] Create Sellout Arc
- [ ] Create Comeback Arc
- [ ] Balance tuning based on playtesting
- [ ] Add character creation options (starting Talent, style preference)

**Deliverable**: Full v1 content scope as defined in DESIGN.md.

---

## Progress Log

### Session 1 - Initial Setup
- Created Next.js project with TypeScript and Tailwind
- Set up Jest testing infrastructure
- Created this implementation plan

### Session 2 - Core Engine Development (Milestone 1 Complete)
- Added Decision Log section for tracking architectural decisions
- Created comprehensive TypeScript interfaces (`src/engine/types.ts`)
- Implemented seeded random number generator for reproducibility
- Built game state management with immutable updates
- Implemented all 10 weekly actions (3 with special logic: Write, Play Local Gig, Tour)
- Created turn resolution system with:
  - Weekly living costs
  - Hype decay
  - Addiction/burnout effects on health/stability
  - Game over detection (death, broke, time limit, band collapse)
- Built complete UI:
  - StartScreen with character name entry
  - GameScreen with 3-column layout (Stats, Actions, Log)
  - EndingScreen with career summary
  - StatsDisplay with visual bars and descriptive text for hidden stats
  - ActionPanel with categorized actions
  - WeeklyLog showing recent activity
- Wrote 56 unit tests covering state, actions, and turn resolution
- All tests passing, build succeeds

### Session 2 (continued) - Events System (Milestone 2 Complete)
- Created event engine (`src/engine/events.ts`):
  - Trigger condition checking (stats, flags, band conditions)
  - Weighted random event selection
  - Event eligibility filtering
  - Event choice application to game state
- Created 15 starter events in 5 categories (`src/data/events.ts`):
  - Band conflicts (3): rehearsal fights, lateness, creative differences
  - Money/career (4): gear stolen, rent due, promoter offers, fan donations
  - Health/addiction (4): hangovers, dealer encounters, injuries, burnout warnings
  - Gig events (3): hecklers, sound issues, label scouts
  - Scene events (3): rival bands, interview requests, groupie drama
- Built event UI components:
  - EventModal with choice hints (cost indicators, risk warnings)
  - EventOutcome showing stat changes after choice
- Integrated events into turn resolution
- Wrote 20 new event tests (76 total tests passing)

### Session 2 (continued) - Economy System (Milestone 3 Complete)
- Created economy engine (`src/engine/economy.ts`):
  - Label deal generation (indie/mid/major tiers)
  - Advance and recoupment tracking
  - Weekly royalty calculations
  - Album creation with quality/reception/sales tiers
  - Tour economics (guarantees, costs, merch)
  - Local gig payout calculations
- Created 6 label/industry events (`src/data/labelEvents.ts`):
  - Indie/mid/major label interest (one-time)
  - Label pressure for singles
  - Drop threats
  - Recoupment celebration
- Wrote 22 new economy tests (98 total tests passing)

### Session 3 - Bandmates System (Milestone 4 Complete)
- Created band management engine (`src/engine/band.ts`):
  - Bandmate generation with fame-scaled candidates
  - Hire/fire/quit/rehab/death management
  - Performance calculations (talent, reliability, vice, loyalty)
  - Quit/reliability/vice checking with probability
  - Weekly loyalty changes based on success/money/stability
  - Display helpers for roles and statuses
- Created 11 band-specific events (`src/data/bandEvents.ts`):
  - Creative clashes, ultimatums, drug problems
  - Member arrests, poaching attempts, breakup talks
  - Overdose deaths (one-time), van breakdowns
  - Positive chemistry moments
- Built BandDisplay UI component with:
  - Active/inactive member display
  - Loyalty, vice, reliability warnings
  - Fire button for active members
  - Collapsible former members section
- Added minBandmates and hasFlag trigger conditions to events system
- Integrated band display into GameScreen
- Wrote 43 new band tests (141 total tests passing)

---

## Testing Strategy

### Unit Tests
- **Engine tests** (`src/engine/__tests__/`): Test all game logic in isolation
  - Turn resolution
  - Stat calculations (hype decay, fan growth, addiction effects)
  - Event eligibility and selection
  - Economy calculations
  - Arc progression
  - Ending determination

### Integration Tests
- **Game flow tests**: Test sequences of turns produce expected outcomes
- **Event chain tests**: Test that events trigger follow-up events correctly

### Component Tests
- **UI tests** (`src/components/__tests__/`): Test React components render correctly
  - Stats display shows correct values
  - Actions are properly enabled/disabled
  - Event modals display choices

### Test Commands
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode for development
npm run test:coverage # Generate coverage report
```

---

## Current Status

**Completed Milestones**: 1 - Core Game Loop, 2 - Events System, 3 - Economy, 4 - Bandmates
**Active Milestone**: 5 - Arcs & Narrative Depth
**Next Task**: Implement arc system with entry conditions and stage progression

### What's Playable Now
- Start a new game with your stage name
- Choose weekly actions from 10 options
- Watch stats change over time
- Experience hype decay, addiction effects, burnout
- **Random events trigger** with meaningful choices and consequences
- Events have visual hints showing costs and risks
- **Label deal events** can trigger based on your progress
- **Band members** with visible stats and personalities
- Fire underperforming or troublesome bandmates
- Band-specific events (fights, deaths, departures)
- Game ends when you die, go broke, or reach 10 years
- See ending screen with career summary

### Economy System Ready
- Label deals: 3 tiers (indie/mid/major) with different terms
- Recoupment model: advance creates debt, sales pay it down
- Album sales: 6 tiers from flop to diamond
- Tour finances: guarantees, costs, merch revenue
- Gig payouts: scale with local fanbase and hype

### Band System Ready
- Starting band: guitar, bass, drums auto-generated
- Bandmate stats: talent, reliability, vice, loyalty
- Performance calculations affect gig/recording quality
- Weekly loyalty changes based on success factors
- Fire capability with morale impact on remaining members
- 11 band-specific events with dramatic choices

---

## Notes

- Keep game engine logic separate from React components for testability
- All stat changes should go through pure functions that can be tested
- Event/arc data should be JSON-driven for easy content additions
- Focus on "feels playable" before "feels complete"

---

## Decision Log

Decisions recorded here for consistency across development sessions.

### DEC-001: Game Engine Architecture
**Date**: 2024-11-28
**Decision**: Keep game engine logic in `src/engine/` as pure TypeScript functions, completely separate from React.
**Rationale**:
- Enables comprehensive unit testing without React overhead
- Makes logic portable if we ever change UI frameworks
- Clearer separation of concerns

### DEC-002: State Management Approach
**Date**: 2024-11-28
**Decision**: Use immutable state updates - all engine functions return new state objects rather than mutating.
**Rationale**:
- Easier to test (compare input/output)
- Enables time-travel debugging and undo features later
- Works naturally with React's state model

### DEC-003: Stats as Numbers with Descriptive Display
**Date**: 2024-11-28
**Decision**: Store all stats as precise numbers (0-100 scale where applicable), but display some as descriptive text ("Low", "Medium", "High") per DESIGN.md.
**Rationale**:
- Numeric precision needed for calculations and thresholds
- Descriptive display maintains the "hidden stats" feel for Addiction, IndustryGoodwill, Burnout
- Conversion functions handle display formatting

### DEC-004: Seeded Random for Reproducibility
**Date**: 2024-11-28
**Decision**: Use seeded pseudo-random number generator for all game randomness.
**Rationale**:
- Enables reproducible test runs
- Could support "share your run" feature later (seed sharing)
- Easier to debug edge cases
