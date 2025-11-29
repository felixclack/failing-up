# Plan: Manager & Gig System Redesign

## Overview

Shift from player-controlled gigs to a manager-driven booking system with English pub/club flavor. The manager becomes a key entity who books gigs for you, and gig outcomes become narrative events that shape your career trajectory.

## Key Changes

### 1. Manager Entity (New)

Create a new `Manager` type (similar to `Bandmate` but different role):

```typescript
interface Manager {
  id: string;
  name: string;
  bookingSkill: number;      // 0-100, affects gig quality/frequency
  connections: number;       // 0-100, affects venue tier access
  reliability: number;       // 0-100, chance they actually book gigs
  cut: number;              // 0.10-0.25, percentage of gig earnings they take
  reputation: number;       // 0-100, affects industry perception
  status: 'active' | 'fired' | 'quit';
}
```

**Manager mechanics:**
- Hire/fire managers (costs money to find new ones)
- Better managers become available as band grows
- Manager takes a cut of gig earnings
- No manager = harder to get gigs (player books own shows, lower quality)

### 2. Gig System Overhaul

**Remove `PLAY_LOCAL_GIG` as player action.** Instead:

- Each week, there's a chance manager books a gig (based on manager skill + band reputation)
- Gig quality depends on: manager connections, band skill, current hype
- Player still chooses their weekly action (WRITE, REHEARSE, etc.) but gigs happen "in between"

**New Gig types (progression):**
```typescript
type VenueType = 'pub' | 'club' | 'small_venue' | 'support_slot' | 'headline' | 'festival';
```

**Gig outcomes become events:**
- After playing, show a gig outcome event
- Good performance = fan gain, skill increase, better future gigs
- Bad performance = reputation damage, fewer opportunities
- Disasters (equipment failure, fight, no-show opener) add drama

### 3. English Pub/Club Names

Generate authentic British venue names:

**Pub name patterns:**
- The [Adjective] [Animal/Object] (The Rusty Anchor, The Black Dog, The Golden Lion)
- The [Person] Arms (The Duke's Arms, The Queen's Head)
- The [Location] (The Railway, The Crown, The Albion)

**Club name patterns:**
- Single word abstract (Fabric, Heaven, Scala)
- The + Location style (The Garage, The Fleapit, The Borderline)

### 4. Gig Outcome Events

New event category for post-gig outcomes:

**Good outcomes:**
- "The crowd loved it" → +fans, +hype
- "Local press noticed" → +cred, booking from bigger venue
- "A&R scout in audience" → potential label interest
- "Support slot offered" → opportunity for bigger gig

**Bad outcomes:**
- "Sparse crowd, dead atmosphere" → -hype, manager reputation drops
- "Technical disaster" → -cred, venue won't rebook
- "Drunk hecklers ruined the vibe" → -stability, but +cred if handled well
- "Promoter didn't pay full amount" → -money, industry goodwill choice

**Neutral/dramatic outcomes:**
- "Rival band played same night across town" → drama event
- "Local legend showed up, jammed with you" → +cred, +hype
- "Fight broke out during encore" → mixed results

### 5. Progression Path: Pubs → Clubs → Support → Headline → Tour

**Venue tier requirements:**

| Tier | Min Fans | Min Skill | Min Hype | Capacity | Base Pay |
|------|----------|-----------|----------|----------|----------|
| Pub | 0 | 0 | 0 | 30-80 | £50-150 |
| Club | 200 | 30 | 15 | 100-300 | £150-400 |
| Small Venue | 1000 | 50 | 30 | 300-800 | £400-1000 |
| Support Slot | 2000 | 60 | 40 | 500-2000 | £200-500 (but exposure) |
| Headline | 5000 | 70 | 50 | 800-2000 | £1000-3000 |
| Festival | 10000 | 75 | 60 | varies | £2000-10000 |

**Support slots:**
- Offered when a bigger band's manager contacts yours
- Great exposure (% of headliner's fans see you)
- Risk: if you're terrible, damages reputation more
- Success: major fan boost, credibility boost

### 6. Tour System Rework

**Realistic costs for UK tour (2 weeks, 10-14 shows):**

| Level | Estimated Cost | Requirements |
|-------|---------------|--------------|
| DIY Van Tour | £3,000-5,000 | 2000+ fans, no label needed |
| Proper Small Tour | £8,000-12,000 | 5000+ fans, or label support |
| Support Tour | £2,000-4,000 | Offered by bigger act |
| Headline Tour | £15,000-25,000 | 15000+ fans, label deal helps |

**Tour structure:**
- Multi-week commitment (2-4 weeks)
- Weekly costs deducted
- Each week has gig outcomes (but condensed)
- Big fan/hype gains if successful
- Health/burnout costs
- 360 deals take their cut

**DIY Tour:**
- Available without label deal
- Need minimum £4,000 saved
- Lower production but more money kept
- Higher risk of things going wrong

### 7. Files to Modify/Create

**New files:**
- `src/engine/manager.ts` - Manager generation, hiring, gig booking logic
- `src/data/venues.ts` - English venue names, venue types, capacities
- `src/data/gigEvents.ts` - Gig outcome event definitions

**Modify:**
- `src/engine/types.ts` - Add Manager type, VenueType, GigResult
- `src/engine/actions.ts` - Remove PLAY_LOCAL_GIG, update TOUR requirements
- `src/engine/turn.ts` - Add gig booking check, gig outcome handling
- `src/engine/economy.ts` - Update tour costs, add manager cut logic
- `src/engine/narrative.ts` - Add gig outcome messages, venue descriptions
- `src/hooks/useGame.ts` - Handle gig outcome events, manager hiring UI
- `src/components/game/GameScreen.tsx` - Show manager info, pending gig
- `src/app/page.tsx` - Add GigOutcomeModal, ManagerModal

**New components:**
- `src/components/game/GigOutcomeModal.tsx` - Shows gig results
- `src/components/game/ManagerPanel.tsx` - Manager info and hire/fire
- `src/components/game/SupportSlotModal.tsx` - Support slot offers

## Implementation Order

1. **Types & Data** - Add Manager type, venue types, gig event data
2. **Manager System** - Generation, hiring/firing, weekly gig booking
3. **Venue System** - English pub names, venue progression
4. **Gig Outcomes** - Events triggered after gigs
5. **Support Slots** - Special gig type with big exposure
6. **Tour Rework** - Update costs, add DIY option
7. **UI Components** - Manager panel, gig outcome modals
8. **Integration** - Wire everything into turn system and game loop

## Sample English Venue Names

**Pubs:**
- The Rusty Nail
- The Three Crowns
- The Lamb & Flag
- The Duke of York
- The Railway Tavern
- The Black Horse
- The Fox & Hounds
- The King's Arms
- The White Hart
- The Spread Eagle

**Clubs:**
- The Fleapit
- Sticky Mike's
- The Cavern
- Audio
- Night & Day
- The Joiners
- The Deaf Institute
- The Brudenell
- The Lexington
- The Water Rats
