# Working Title: **Failing Up: A Rock Star Story** (TBD)

## 1. Vision

A **single-player, text-based, turn-based rock career sim** inspired by harsh late-80s/90s management games.

Default outcome: **failure or mediocrity**. True superstardom is rare. The fantasy of sex/drugs/rock is present, but mechanically **dangerous**, not glam.

Target is nostalgia: people who remember or crave that old-school, unforgiving, stat-heavy, text-driven “be a rockstar” game.

No current monetization; scope optimized for a **small, solo dev project**.

---

## 2. Player Experience & Tone

* **Session length:** 15–60 minutes per run.
* **Replayability:** Multiple runs encouraged; you learn systems by failing.
* **Tone:** Dark humor, blunt, sometimes bleak. No hand-holding.
* **Difficulty philosophy:**

  * Money is tight.
  * Health and Addiction punish recklessness over time.
  * Industry deals are traps as often as opportunities.
  * “Winning” is atypical; surviving with dignity is already a good result.

---

## 3. Game Structure

### 3.1 Timeline & Turns

* Time unit: **1 week**
* Career length:

  * Hard cap: **10 in-game years** (520 weeks)
  * Most careers end earlier (death, burnout, broke/blacklisted, band implosion).
* Each week:

  1. Fixed costs (living expenses, debt interest).
  2. Player chooses **1 primary action** (later possibly 2 actions / slots).
  3. Apply deterministic effects (stat/resource changes).
  4. Roll and resolve events.
  5. Update derived stats (Hype decay, Addiction/Health shifts, etc.).
  6. Check for arcs and endings.

### 3.2 Game Over Conditions

Possible end states:

* **Death** (health/addiction related).
* **Career collapse** (no band, blacklisted, deeply in debt).
* **Time limit** (10 years reached).
* **Soft retirements** (voluntary exit in some arcs).

Each outcome maps to an **ending narrative**.

---

## 4. Core Systems

### 4.1 Player Stats

All stats conceptually 0–100 unless noted.

**Visible stats:**

* `Talent`

  * Mostly fixed by character creation.
  * Caps song quality; affects hit potential.
* `Skill`

  * Performance and songwriting craft.
  * Increases via practice, playing, recording.
* `Image`

  * Perceived rockstar vibe.
  * Boosts early fan gain and event triggers.
* `Fans` (0 → millions)

  * Total audience size.
* `Hype` (0–100)

  * Short-term buzz. Decays each week.
* `Money` (can go negative)

  * Cash on hand; living costs and small purchases.
* `Health`

  * Physical health; low values increase risk of serious events and death.
* `Stability`

  * Mental/emotional stability. Low = more self-destructive events.
* `Cred`

  * Scene/critical respect. Affects fan loyalty, backlash, and offer quality.

**Semi-hidden / Hidden stats (kept in model, partially surfaced via text):**

* `Addiction`

  * Progression of substance abuse. Triggers event chains at thresholds.
* `IndustryGoodwill`

  * How much labels/promoters/media want to work with you.
* `Burnout`

  * Long-term fatigue; interacts with Health/Stability.

Design choice: UI can show some as rough descriptors (“Low / Medium / High”) instead of exact numbers.

---

### 4.2 Bandmates

Bandmates are NPCs with their own risk profiles.

**Attributes:**

* `name`
* `role` (guitar, bass, drums, etc.)
* `talent`
* `reliability` (flake risk, showing up on time/sober)
* `vice` (tendency toward destructive behavior)
* `loyalty` (willingness to stick with you)
* `status` flags (active, fired, quit, in_rehab, dead)

Band performance = function of:

* Average bandmate talent & reliability
* Player Skill
* Overall band vice (affects event frequencies)

Band dynamics system generates:

* Fights
* Ultimatums (“him or me”)
* Departures, betrayals, deaths

---

### 4.3 Songs & Albums

#### Songs

**Song fields:**

* `title`
* `quality` (0–100)
* `style` (enum: e.g. glam, punk, grunge, alt, etc.)
* `hitPotential` (0–100; derived from Talent, Skill, style vs trend, and randomness)
* `writtenByPlayer` (bool; could affect Cred)

#### Albums

**Album fields:**

* `title`
* `songs[]` (references to Song IDs)
* `productionValue` (0–100; depends on studio/producer/budget)
* `promotionSpend` (money invested)
* `reception` (0–100; critical reviews, word-of-mouth)
* `salesTier` (enum: FLOP, CULT, GOLD, PLATINUM, etc.)
* `labelId` (if linked to a deal)

Album outcome affects:

* Fans (+/-)
* Money over time (royalties if recouped)
* Cred
* IndustryGoodwill

---

### 4.4 Resources & Economy

#### Money

Money flows:

**Income:**

* Local gigs
* Tours (guarantees minus costs)
* Record advances
* Merch on tour
* Side job (early game)

**Expenses:**

* Weekly living costs (rent, food, etc.)
* Rehearsal space
* Gear
* Travel/van repairs
* Studio time (if self-funded)
* Medical/rehab
* Manager/lawyer (% cut or fees)
* Label-related recoupable costs (tracked in separate “debt” pool)

#### Label Recoupment Model

* `advance` = immediate Money boost + `recoupDebt` increase.
* Label tracks `recoupDebt` per deal.
* Until `recoupDebt <= 0`, player gets **no real royalties**, only small tour income.
* Once recouped, a fraction of sales flows as Money each week/month.

Risk: you can be **high profile but broke**.

---

### 4.5 Weekly Actions

(MVP list; each costs the full week.)

1. **Write / Compose**

   * Effect:

     * Chance to create a new song or improve a draft.
     * `Skill`↑ slightly, `Burnout`↑ slightly.
     * Hype may drop due to inactivity.
2. **Rehearse**

   * Effect:

     * `Skill`↑, band tightness improved.
     * `Burnout`↑ slightly, `Money`↓ (rehearsal costs).
3. **Play Local Gig**

   * Effect:

     * `Money` small +/- depending on turnout.
     * `Fans`↑ (modest).
     * `Hype`↑ (if good performance).
     * Event chances for fights, accidents, police, etc.
4. **Tour** (unlocked via deal/promoter)

   * Multi-week action.
   * Effect:

     * `Fans`↑↑, `Hype`↑↑.
     * `Money` net +- depending on guarantees and costs.
     * `Health`↓↓, `Burnout`↑↑, addiction-related events more likely.
5. **Record**

   * Requires songs + DIY or label budget.
   * Effect:

     * Converts songs into an album or improves album quality.
     * Big `Money` cost unless paid by label (then recoupDebt↑).
6. **Promote / Press**

   * Effect:

     * `Hype`↑, `Fans`↑ (small).
     * `Cred`↑ or ↓ depending on type of press.
7. **Network / Industry**

   * Effect:

     * `IndustryGoodwill`↑, possible triggers for label offers, better tours.
     * Some risk of shady deals, exploitation.
8. **Party / Indulge**

   * Effect:

     * Short-term: `Image`↑, `Hype`↑, inspiration buff (temporary `quality` bonus for new songs).
     * Long-term: `Addiction`↑, `Health`↓, `Stability`↓, `Burnout`↑.
9. **Rest / Lay Low**

   * Effect:

     * `Health`↑, `Stability`↑, `Burnout`↓.
     * `Hype`↓ (you disappear from the scene), small `Fans` decay.
10. **Side Job**

    * Early game only.
    * Effect:

      * `Money`↑.
      * `Time/Energy` drains: `Skill` no change, `Burnout`↑, `Hype`↓ slightly.

Each action = a data-driven entry (ID, description, stat deltas, hooks for events).

---

### 4.6 Events & Arcs

#### Events

Events are triggered after weekly actions, driven by:

* Current stats (Health, Addiction, Stability, Cred, etc.).
* Flags (on tour, in studio, signed to label, etc.).
* Random rolls.

**Event structure:**

* `id`
* `triggerConditions` (boolean logic on stats/flags)
* `weight` (relative likelihood when eligible)
* `textIntro`
* `choices[]`:

  * `id`
  * `label`
  * `outcomeText`
  * `statChanges` (deltas, possibly functions of stats)
  * `flagsSet` / `flagsClear`
  * `arcProgression` (if part of an arc)

Event examples categories:

* Band conflict
* Health scares
* Addiction milestones
* Industry offers / scams
* Scene rumors / backlash
* Accidents (gear stolen, van breakdown, etc.)

#### Arcs

Arcs are multi-event storylines with progression steps.

Core arcs planned for v1:

1. **Addiction Arc**

   * Trigger: Addiction crosses thresholds + repeated Party actions.
   * Stages:

     * Functional partying → missed rehearsals → missed gigs → OD scare → rehab/death/long-term damage.
2. **Label Deal Arc**

   * Trigger: Fans/Hype/IndustryGoodwill above thresholds.
   * Stages:

     * Interest → showcase → contract terms → recording pressures → success OR being dropped.
3. **Band Breakup Arc**

   * Trigger: low average Loyalty/Reliability, repeated conflicts.
   * Stages:

     * Tension → ultimatum → lineup change, side project, or full collapse.
4. **Sellout Arc**

   * Trigger: high IndustryGoodwill, decent Hype, lower Money.
   * Stages:

     * Offer for cheesy ad/pop crossover → backlash vs payout → long-term Cred consequences.
5. **Comeback Arc**

   * Trigger: prior success + major crash + time passed.
   * Stages:

     * Small indie interest → risky comeback record → potential redemption or complete irrelevance.

Each arc stored as:

* `arcId`
* `stages[]` (each stage = event IDs or rules for event selection)
* `entryConditions`
* `exitConditions` or `endingHooks`

---

### 4.7 Endings

At game over, an ending is selected based on:

* Final `Fans`, `Cred`, `Money`, `Health`, `Addiction`, `IndustryGoodwill`, arcs completed, and key flags (deals, deaths, etc.).

Planned ending templates:

1. **Local Legend**

   * Moderate `Fans`, high `Cred`, low Industry reach.
2. **One-Hit Wonder**

   * High peak `Hype` and Fans at some point, now declining; current low Cred.
3. **Burnout Casualty**

   * Death from addiction/health issues at or near career peak.
4. **Industry Ghostwriter/Producer**

   * High Talent/Skill, high IndustryGoodwill, lower public Fans; you transition behind the scenes.
5. **Stadium Icon, Hollow Inside**

   * Very high Fans/Hype, big deals, poor Health/Stability, possible debt/recoup issues.
6. **Balanced Survivor**

   * Decent Fans/Money, solid Health/Stability; not a god, but you make a living from music and you’re alive.

Ending text uses **callbacks** to specific events and choices (e.g., mentioning a major arc outcome).

---

## 5. Data Model (Implementation-Agnostic)

### 5.1 Core Entities (Conceptual)

**Player**

```json
{
  "name": "string",
  "talent": 0,
  "skill": 0,
  "image": 0,
  "fans": 0,
  "hype": 0,
  "money": 0,
  "health": 100,
  "stability": 70,
  "cred": 10,
  "addiction": 0,
  "industryGoodwill": 0,
  "burnout": 0,
  "flags": {
    "hasLabelDeal": false,
    "onTour": false,
    "inStudio": false,
    "hasManager": false,
    "hasLawyer": false
  }
}
```

**Bandmate**

```json
{
  "id": "string",
  "name": "string",
  "role": "guitar",
  "talent": 50,
  "reliability": 50,
  "vice": 50,
  "loyalty": 50,
  "status": "active"  // active | fired | quit | rehab | dead
}
```

**Song**

```json
{
  "id": "string",
  "title": "string",
  "quality": 40,
  "style": "grunge",
  "hitPotential": 30,
  "writtenByPlayer": true
}
```

**Album**

```json
{
  "id": "string",
  "title": "string",
  "songIds": ["song1", "song2"],
  "productionValue": 50,
  "promotionSpend": 0,
  "reception": null,
  "salesTier": null,
  "labelId": null
}
```

**LabelDeal**

```json
{
  "id": "string",
  "name": "string",
  "advance": 50000,
  "recoupDebt": 50000,
  "royaltyRate": 0.15,
  "creativeControl": "low",  // low | medium | high
  "status": "active"         // active | dropped | fulfilled
}
```

**Action**

```json
{
  "id": "WRITE",
  "label": "Write / Compose",
  "description": "Spend the week writing new material.",
  "requirements": {
    "onTour": false
  },
  "baseEffects": {
    "skill": +1,
    "burnout": +1,
    "hype": -2
  },
  "specialLogic": "functionRefOrRuleId"
}
```

**Event**

```json
{
  "id": "EV_BAND_FIGHT_01",
  "triggerConditions": {
    "minFans": 0,
    "maxHealth": null,
    "minBandVice": 40
  },
  "weight": 3,
  "textIntro": "Tension boils over during rehearsal...",
  "choices": [
    {
      "id": "CALL_THEM_OUT",
      "label": "Call them out in front of everyone.",
      "outcomeText": "You blow up at them...",
      "statChanges": {
        "stability": -3,
        "cred": +2
      },
      "bandmateChanges": {
        "loyalty": -10
      },
      "flagsSet": ["band_tension_high"]
    }
  ]
}
```

**Arc**

```json
{
  "id": "ARC_ADDICTION",
  "entryConditions": { "minAddiction": 30 },
  "stages": [
    { "stageId": 1, "eventIds": ["EV_ADDICTION_WARNING_1"] },
    { "stageId": 2, "eventIds": ["EV_MISSED_GIG_1", "EV_REHEARSAL_NO_SHOW"] },
    { "stageId": 3, "eventIds": ["EV_OD_SCARE", "EV_REHAB_OFFER"] },
    { "stageId": 4, "eventIds": ["EV_REHAB_RECOVERY", "EV_DEATH_ENDING_HOOK"] }
  ]
}
```

---

## 6. Core Algorithms (High-Level)

### 6.1 Weekly Turn Function

Pseudo:

```pseudo
function nextWeek(state, chosenActionId):
    state.week += 1

    applyWeeklyCosts(state)

    applyAction(state, chosenActionId)

    resolveScheduledArcEvents(state)  // if mid-arc
    rollAndResolveRandomEvents(state)

    updateDerivedStats(state)         // hype decay, burnout etc.

    if isGameOver(state):
        return { state, ending: determineEnding(state) }

    return { state, ending: null }
```

### 6.2 Hype & Fans Update (Example Logic)

* Hype decays:

```pseudo
state.hype = max(0, state.hype - baseDecay + hypeBoostFromThisWeek)
```

* Fans gained:

```pseudo
fansGain = baseGainFromActions * (1 + hypeMultiplier + credMultiplier)
state.fans += fansGain
```

* If no releases / major events for a long time, apply fandom decay.

### 6.3 Addiction & Health

* Each week:

```pseudo
if action == PARTY:
    state.addiction += random(1, 4)
    state.health -= random(1, 3)

if addiction > threshold:
    increaseChanceOfAddictionEvents()
```

* Interaction with Health:

```pseudo
if health < 30 or addiction > 70:
    enableSeriousHealthEvents()
```

---

## 7. Content Scope v1

**v1 target content:**

* Actions: 8–10 core actions (list above).
* Events:

  * **40–60 generic events**

    * band conflicts, minor injuries, money issues
  * **20–30 addiction/health/party-related**
  * **20–30 industry/label/tour-related**
* Arcs:

  * Addiction, Label Deal, Band Breakup, Sellout, Comeback (5 arcs)
* Endings: 6 base endings with variations.

Enough to make runs feel varied without writing a novel.

---

## 8. Balancing & Tuning Plan

* Start with **simple linear formulas** and conservative deltas.
* Expected run feel:

  * Early: “broke and desperate.”
  * Mid: “spikes of excitement and chaos.”
  * Late: “maintenance vs self-destruction.”

Iteration steps:

1. Log stats per run (peak Hype, final Money, cause of death/collapse).
2. Tweak:

   * Weekly expenses vs income from gigs.
   * Addiction thresholds and effects.
   * Label terms (advances vs realistic recoup possibilities).
3. Aim:

   * > 50% of runs end in failure (broke/blacklisted/dead).
   * A small minority reach “big league,” even fewer survive happily.

---

## 9. Out of Scope for v1

* Deep romance/relationships system.
* Detailed touring logistics (routing, per-city management).
* Multiplayer.
* Real band names or licensed content (avoid IP issues).

