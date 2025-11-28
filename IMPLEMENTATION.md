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

### Milestone 5: Arcs & Narrative Depth - COMPLETE
**Goal**: Multi-event storylines that create emergent narratives.

- [x] Implement arc system (entry conditions, stage progression)
- [x] Create Addiction Arc (4 stages)
- [x] Create Label Deal Arc (offer through success/dropped)
- [x] Create Band Breakup Arc
- [x] Add arc-specific events and callbacks
- [x] Write tests for arc progression

**Deliverable**: Connected storylines that develop over multiple weeks.

**Status**: COMPLETE - Arc engine with 3 arcs (22 arc events), 44 new tests (185 total).

---

### Milestone 6: Endings & Polish - COMPLETE
**Goal**: Satisfying conclusions with narrative callbacks.

- [x] Implement ending determination algorithm
- [x] Create 9 base endings with variations
- [x] Add ending callbacks to reference past events
- [x] Add game history/log for ending summary
- [x] Create new game / restart flow
- [x] Improved EndingScreen UI with stats grid and callbacks
- [x] Write tests for ending selection (22 tests)

**Deliverable**: Complete game loop with meaningful endings.

**Status**: COMPLETE - Ending system with 9 endings, variations, and callbacks. 207 total tests.

---

### Milestone 7: Content Expansion - COMPLETE
**Goal**: Enough content for varied, replayable runs.

- [x] Expand to 102 total events (exceeds target)
- [x] Add health/addiction events
- [x] Add industry/label events
- [x] Create Sellout Arc (3 stages, 6 events)
- [x] Create Comeback Arc (3 stages, 6 events)
- [ ] Balance tuning based on playtesting
- [x] Add character creation options (starting Talent, style preference)
- [x] Add difficulty system with 4 levels

**Deliverable**: Full v1 content scope as defined in DESIGN.md.

**Status**: COMPLETE - All 5 arcs implemented, 102 events total. Difficulty system and character creation added. 248 tests passing.

---

### Milestone 8: Streaming & Social Era Update
**Goal**: Modernize the game with streaming platforms and social media mechanics.
**Reference**: [UPDATE.md](./UPDATE.md)

#### 8.1 - New Stats & Player Model - COMPLETE
- [x] Split Fans into CoreFans and CasualListeners
- [x] Add Followers stat (aggregate social followers)
- [x] Add AlgoBoost stat (0-100, platform favor)
- [x] Add CataloguePower stat (0-100, streaming back-catalog strength)
- [x] Update Player interface and state creation
- [x] Update StatsDisplay to show new metrics
- [x] Write tests for new stat calculations

#### 8.2 - Streaming Catalogue System - COMPLETE
- [x] Add streaming fields to Song type:
  - streamsTier (NONE/LOW/MED/HIGH/MASSIVE)
  - playlistScore (0-100)
  - viralFlag (bool, temporary)
  - isSingle (bool)
- [x] Implement weekly streaming income calculation
- [x] Implement AlgoBoost decay mechanics
- [x] Create "Release Single" action
- [x] Write tests for streaming income

#### 8.3 - Social Media Actions - COMPLETE (Simplified)
- [x] Implement "Post Content" action (includes viral chance, fan engagement)
- [x] ~~Implement "Short-Form Blitz" action~~ (merged into Post Content)
- [x] ~~Implement "Livestream / Online Show" action~~ (removed for simplicity)
- [x] ~~Implement "Engage Community" action~~ (removed for simplicity)
- [x] Add Followers growth calculations
- [x] Write tests for social actions

**Note**: Simplified to single "Post Content" action that handles viral mechanics (5-12% viral chance based on algoBoost) to reduce action bloat.

#### 8.4 - Modern Label Deals - COMPLETE
- [x] Update LabelDeal type with dealType (traditional/distro/360)
- [x] Add includesMasters, includesMerch, includesTouring flags
- [x] Implement streaming payout filtering through deal terms
- [x] Add DIY route with no-label viability
- [x] Create "Brand / Sponsorship Deals" action/events
- [x] Write tests for modern deal economics

#### 8.5 - Digital Era Events - COMPLETE
- [x] Create playlist feature events (editorial, algorithmic)
- [x] Create viral moment events
- [x] Create sponsor/brand deal events
- [x] Create platform algorithm change events
- [x] Create social media drama events
- [x] Write tests for new events

#### 8.6 - New Arcs (Digital Era) - COMPLETE
- [x] **Viral One-Hit Arc**: Clip blows up → label/brand swarm → meme pressure → sustain or fade
- [x] **Cancel / Backlash Arc**: Something blows up → apologize/double-down/go dark → recovery
- [x] **Platform Algorithm Shift Arc**: Platform changes → adapt/ignore/pivot
- [x] **Creator Burnout Arc**: Symptoms → push through or slow down → break or collapse
- [x] **DIY Patron / Membership Arc**: Launch membership → maintain output → success or guilt
- [x] Write tests for new arcs

#### 8.7 - New Endings (Digital Era) - COMPLETE
- [x] Algorithm Casualty: Platform changes killed your career
- [x] Content Creator Prison: Financially OK but endless treadmill
- [x] DIY Cult Hero: Strong core fans, good cred, small mainstream footprint
- [x] Viral Ghost: One massive meme song, no one knows who you are
- [x] Update ending determination algorithm
- [x] Write tests for new endings

**Deliverable**: Complete streaming/social era gameplay with modern music industry mechanics.

**Status**: COMPLETE - 5 new arcs (50+ arc events), 4 new endings, 27+ streaming events, modern label deals (distro/360), streaming revenue system.

---

### Milestone 9: Balance & Polish - COMPLETE
**Goal**: Tune the expanded game for balanced, replayable gameplay.

- [x] Balance streaming income vs traditional income sources
- [x] Tune CoreFans vs CasualListeners conversion rates
- [x] Balance viral chance vs burnout cost
- [x] Playtest DIY route vs label route viability (via balance tests)
- [x] Balance 360 deal tradeoffs
- [x] Tune AlgoBoost decay rate
- [x] Add Playwright tests for streaming mechanics (6 new tests)
- [x] Simplified social actions (POST_CONTENT only)

**Deliverable**: Well-balanced game with multiple viable strategies.

**Status**: COMPLETE - 306 unit tests + 15 Playwright tests passing

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

### Session 4 - Arcs System (Milestone 5 Complete)
- Created arc engine (`src/engine/arcs.ts`):
  - Arc entry condition checking
  - Arc stage progression and advancement
  - Arc event selection (priority over random events)
  - Arc completion and abortion
  - Helper functions for arc state queries
- Created 3 arcs with 22 total events (`src/data/arcs.ts`):
  - **Addiction Arc** (4 stages): Functional partying → missed rehearsals → missed gigs → OD scare/rehab
  - **Label Deal Arc** (4 stages): Interest → showcase → contract → recording pressure
  - **Band Breakup Arc** (3 stages): Tension → ultimatums → final collapse
- Integrated arcs into turn resolution:
  - Check and activate new arcs each turn
  - Arc events have priority over random events
  - Check and advance arcs based on conditions
- Wrote 44 new arc tests (185 total tests passing)

### Session 5 - Endings System (Milestone 6 Complete)
- Created ending engine (`src/engine/endings.ts`):
  - Score-based ending determination algorithm
  - 9 ending types: LEGEND, STAR, SURVIVOR, CULT_HERO, BURNOUT, TRAGEDY, OBSCURITY, SELLOUT, COMEBACK_KID
  - Variations for each ending based on specific conditions
  - Callback generation referencing past arcs, events, and achievements
  - Display helpers for colors and icons
- Rewrote EndingScreen (`src/components/game/EndingScreen.tsx`):
  - Dynamic title/subtitle/narrative from ending result
  - "Your Story" callbacks section with categorized icons
  - Stats grid: Career Stats, Creative Output, Band Status, Final State
  - Responsive design with improved typography
- Wrote 22 new ending tests (207 total tests passing)

### Session 6 - Content Expansion (Milestone 7 Complete)
- Created Sellout Arc (`src/data/arcs.ts`):
  - 3 stages: Tempting offer → The deal → Backlash
  - 6 events covering commercial temptation and consequences
  - Entry conditions: high industry goodwill, low money, credibility to lose
- Created Comeback Arc (`src/data/arcs.ts`):
  - 3 stages: Interest → Recording → Release
  - 6 events covering redemption and second chances
  - Entry conditions: prior success, fallen from grace, time passed
- Added minWeek trigger condition for time-based events
- Fixed custom flag handling in event system
- Created 30 new events (`src/data/moreEvents.ts`):
  - 5 additional gig events
  - 5 additional money/career events
  - 6 additional health/addiction events
  - 6 additional scene/social events
  - 3 additional band drama events
  - 5 additional industry events
- Wrote 12 new arc tests (219 total tests passing)
- Total event count: 102 events (exceeds v1 target of 80-120)

### Session 7 - Difficulty & Character Creation
- Created difficulty system (`src/engine/difficulty.ts`):
  - 4 difficulty levels: Easy (Garage Band), Normal (Indie Grind), Hard (Major Label Pressure), Brutal (27 Club)
  - Multipliers for economics, stat gains/losses, event chances
  - Starting stat adjustments per difficulty
- Integrated difficulty into game mechanics:
  - Weekly living costs scale with difficulty
  - Gig payouts and fan gains modified
  - Hype decay, health loss, addiction/burnout gains scaled
  - Event trigger chances adjusted
- Created character creation options:
  - 4 talent levels: Struggling (25), Average (40), Gifted (60), Prodigy (80)
  - 6 music style preferences: Glam, Punk, Grunge, Alt, Metal, Indie
  - Preferred style biases song writing (60% preferred, 40% random)
- Updated StartScreen UI with:
  - Talent level selection
  - Music style selection
  - Difficulty selection
- Wrote 29 new tests (248 total tests passing)

### Session 8 - UX Improvements & Plan Update
- Added song/album naming feature:
  - NamingModal component for naming songs and albums
  - Players can accept generated names or enter custom ones
  - Naming modal appears after writing a song or starting album recording
- Added band naming feature:
  - Band name input in character creation with generate button
  - Band name generator creates names like "The Savage Wolves", "Black Thunder"
  - Band name displayed as header during gameplay
- Set up Playwright E2E testing:
  - 9 automated playtest scenarios
  - Tests for economic balance, game flow, UI elements
- Updated IMPLEMENTATION.md with Milestone 8 (Streaming & Social Era) from UPDATE.md:
  - New stats: CoreFans, CasualListeners, Followers, AlgoBoost, CataloguePower
  - New actions: Release Single, Post Content, Short-Form Blitz, Livestream, Engage Community
  - New systems: Streaming catalogue, playlist/algorithm mechanics, modern label deals (360/distro)
  - New arcs: Viral One-Hit, Cancel/Backlash, Platform Algorithm Shift, Creator Burnout, DIY Patron
  - New endings: Algorithm Casualty, Content Creator Prison, DIY Cult Hero, Viral Ghost

### Session 9 - Streaming Era Stats (Milestone 8.1 Complete)
- Implemented new Player model with streaming era stats:
  - Split "fans" into CoreFans (loyal, buy merch/tickets) and CasualListeners (passive streaming)
  - Added Followers (aggregate social followers across platforms)
  - Added AlgoBoost (0-100, platform recommendation favor)
  - Added CataloguePower (0-100, streaming back-catalog strength)
- Updated StatDeltas to handle new stats with backward compatibility:
  - Legacy "fans" delta automatically added to coreFans
- Updated `applyStatDeltas` function for new audience/digital stats
- Added `getTotalFans(player)` helper function for combined fan count
- Updated StatsDisplay UI with:
  - Audience section showing total fans with Core/Casual breakdown
  - Digital Presence section with Followers, Algo Boost, Catalogue Power
- Fixed all references from `player.fans` to `getTotalFans(player)` or `player.coreFans`:
  - economy.ts: Label tier calculations, tour revenue, gig payouts
  - actions.ts: Local gig turnout calculations
  - band.ts: Loyalty change based on success
  - endings.ts: Ending scoring and variations
  - events.ts: Trigger conditions and choice stat application
  - EndingScreen.tsx: Final stats display
- Updated all 248 tests to use new stat model (all passing)

### Session 9 (continued) - Streaming Catalogue System (Milestone 8.2 Complete)
- Added streaming fields to Song type:
  - isReleased, isSingle, weekReleased - track release status
  - streamsTier (none/low/medium/high/massive) - current streaming performance
  - playlistScore (0-100) - algorithmic playlist placement score
  - viralFlag, viralWeeksRemaining - temporary viral boost
  - totalStreams - lifetime stream count
- Created streaming.ts engine module with:
  - calculateInitialStreamsTier/PlaylistScore - determine initial streaming stats
  - releaseSingle/releaseAlbumTracks - release songs to streaming
  - calculateWeeklyStreams/StreamingIncome - streaming revenue calculation
  - updateSongsWeekly - weekly song stat updates (tier shifts, viral decay)
  - checkForViralSong/makeViralSong - viral mechanics
  - checkForPlaylistPlacement/applyPlaylistBoost - playlist events
  - applyAlgoBoostDecay - weekly algo favor decay
  - updateCataloguePower - back-catalog strength calculation
- Added 5 streaming era actions to ActionId:
  - RELEASE_SINGLE: Drop song to streaming (requires unreleased song)
  - POST_CONTENT: Regular social media posts (steady grind)
  - SHORT_FORM_BLITZ: TikTok/Shorts/Reels with viral lottery
  - LIVESTREAM: Go live for tips and core fan growth
  - ENGAGE_COMMUNITY: Discord/Patreon style engagement
- Integrated streaming into weekly turn resolution:
  - applyStreamingUpdates called in applyEndOfWeekUpdates
  - Calculates streaming income from all released songs
  - Updates song streaming stats weekly
  - Decays algoBoost, updates cataloguePower
  - Converts streams to casual listeners
- Wrote 24 streaming tests (272 total tests passing)

### Session 10 - Streaming Era Completion (Milestone 8 Complete)
- Completed Modern Label Deals (8.4):
  - Added DealType: 'traditional' | 'distro' | '360'
  - Extended LabelDeal with streamingRoyaltyRate, includesMasters, includesMerch, includesTouring
  - Created 5 deal tiers (distro, indie, mid, major, major360)
  - Implemented streaming income after deal cuts and recoupment
  - Added 360 deal touring cuts
  - Created 7 brand/sponsorship events
  - Wrote 16 new economy tests
- Completed Digital Era Events (8.5):
  - Created 27+ streaming events in `src/data/streamingEvents.ts`:
    - Social media events (viral clips, cancellation, stan armies)
    - Streaming platform events (playlists, algorithmic dips, cover songs)
    - Livestream events (chaos, technical issues, celebrity raids)
    - Digital drama events (fake streams, influencer collabs, hate comments)
    - Platform algorithm events (updates, demonetization, shadowbans)
    - Brand sponsorship events (deals, endorsements, sync licenses)
  - Added maxAlgoBoost to EventTriggerConditions
- Completed Digital Era Arcs (8.6):
  - Created `src/data/streamingArcs.ts` with 5 new arcs (50+ arc events):
    - **Viral One-Hit Arc**: 4 stages from blowup to sustain/fade
    - **Cancel/Backlash Arc**: 4 stages from controversy to recovery/exile
    - **Creator Burnout Arc**: 4 stages from grind to recovery/collapse
    - **DIY Patron Arc**: 4 stages from first patron to independence
    - **Platform Dependency Arc**: 3 stages from shift to diversify/double-down
  - Integrated into ALL_ARCS (now 10 total arcs)
- Completed Digital Era Endings (8.7):
  - Added 4 new endings to `src/engine/endings.ts`:
    - Algorithm Casualty: Platform changes killed career
    - Content Creator Prison: Trapped in content treadmill
    - DIY Pioneer: Built independent following
    - Viral Ghost: Had viral moment, then faded
  - Each ending has multiple variations
  - Added scoring logic, colors, and icons
  - Added arc callbacks for narrative references
- All 288 tests passing, build successful

### Session 11 - Balance & Polish (Milestone 9 Complete)
- Simplified social media actions:
  - Removed SHORT_FORM_BLITZ, LIVESTREAM, ENGAGE_COMMUNITY actions
  - Consolidated viral mechanics into POST_CONTENT action (5-12% viral chance)
  - Updated streamingEvents.ts to remove livestream events
  - Updated ActionPanel to show simplified Digital category
- Created comprehensive balance.test.ts with tests for:
  - Streaming income at different tiers (LOW/MEDIUM/HIGH)
  - Traditional vs streaming income comparison
  - Deal economics (DIY, distro, major, 360)
  - Fan conversion balance (coreFans vs casualListeners)
  - Viral mechanics balance
  - AlgoBoost decay sustainability
  - Strategy viability (DIY + streaming, touring)
- Added 6 Playwright tests for streaming mechanics:
  - Post Content action availability and functionality
  - Release Single action workflow
  - Digital stats display (Followers, Algo Boost)
  - Post Content follower building
  - Write → Release Single workflow
  - DIY strategy simulation
- All 306 unit tests + 15 Playwright tests passing, build successful

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

**Completed Milestones**: 1 - Core Game Loop, 2 - Events System, 3 - Economy, 4 - Bandmates, 5 - Arcs, 6 - Endings & Polish, 7 - Content Expansion, 8 - Streaming & Social Era Update, 9 - Balance & Polish
**Active Milestone**: None - All milestones complete!
**Game Status**: Feature complete with 306 unit tests + 15 Playwright tests passing

### What's Playable Now
- Start a new game with full character creation:
  - Choose your stage name
  - Select your talent level (Struggling to Prodigy)
  - Pick your preferred music style
  - Choose difficulty (Garage Band to 27 Club)
- Choose weekly actions from 10 options
- Watch stats change over time
- Experience hype decay, addiction effects, burnout
- **Random events trigger** with meaningful choices and consequences
- Events have visual hints showing costs and risks
- **Label deal events** can trigger based on your progress
- **Band members** with visible stats and personalities
- Fire underperforming or troublesome bandmates
- Band-specific events (fights, deaths, departures)
- **Story arcs** that develop over multiple weeks:
  - Addiction spiral with intervention and recovery choices
  - Label deal negotiations and industry pressure
  - Band breakup drama with ultimatums and lineup changes
- Game ends when you die, go broke, or reach 10 years
- **Meaningful endings** based on your journey:
  - 9 different endings with variations
  - Callbacks reference your past events and achievements
  - Detailed stats summary of your career

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

### Arc System Ready
- Arc entry based on game state conditions
- Stage progression with advancement thresholds
- Arc events have priority over random events
- 5 core arcs with 34 arc events:
  - Addiction Arc: 4 stages from partying to OD scare
  - Label Deal Arc: 4 stages from interest to pressure
  - Band Breakup Arc: 3 stages from tension to collapse
  - Sellout Arc: 3 stages from temptation to backlash
  - Comeback Arc: 3 stages from second chance to redemption

### Ending System Ready
- Score-based ending determination from 9 ending types
- Variations trigger based on specific conditions
- Callback system references significant moments
- 9 endings: Legend, Star, Survivor, Cult Hero, Burnout, Tragedy, Obscurity, Sellout, Comeback Kid
- Enhanced EndingScreen with detailed career summary

### Content v1 Complete
- 102 total events (exceeds 80-120 target)
- Events cover: gigs, money, health, addiction, scene, industry, band drama
- All 5 design doc arcs implemented
- 9 ending types with variations and callbacks

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
