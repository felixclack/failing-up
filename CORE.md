We’re building the *engine* of a nasty little rock‑life sim. Let’s lock the **core design**, not tech.

I’ll break it into:

1. What this game *is* (high level)
2. Stats & entities
3. Core loop (per week)
4. Systems (career, money, vice, health, industry)
5. Arcs & endings
6. Why it feels “hardcore” instead of cozy

You can turn this straight into a design doc.

---

## 1. What this game *is*

**Premise:**
Text-based, turn-based rock career sim where the default outcome is failure: burnout, obscurity, death, or “where are they now” mediocrity. Hitting true superstardom is rare.

**Run structure:**

* Each run = your career from **nobody** to… whatever happens.
* Time unit = **1 week**.
* Campaign length = **up to 10 years** (≈ 520 turns), but most careers end way earlier.
* **Permadeath, no manual save scumming** (maybe auto-save per week if you want that old-school cruelty).

**Player loop per week:**

1. You see your current stats + situation.
2. You pick **1–2 main actions** for the week.
3. The game applies deterministic effects (money, fans, health, etc.).
4. The game rolls events (band drama, industry offers, accidents, etc.).
5. Check for arc progress / endings.

---

## 2. Stats & entities

Keep stats small but sharp.

### 2.1 Player core stats

Visible:

* **Talent** (0–100, mostly fixed)
  Ceiling for song quality. Chosen at start with some tradeoff (e.g., high Talent, low Work Ethic).
* **Skill** (0–100)
  Performance/songwriting craft; goes up with practice and experience.
* **Image** (0–100)
  How “rockstar” you look/feel to the scene; drives early fan growth & press.
* **Fans** (0 → millions)
  Total following.
* **Hype** (0–100)
  Short-term heat. Spikes from events, drops fast if you disappear.
* **Money** (can go negative)
  Cash in pocket (not label accounting).
* **Health** (0–100)
  Physical condition. Low = higher risk of hospitalization/death.
* **Stability** (0–100)
  Mental / emotional stability; buffers stress. Low = more bad decisions/events.
* **Addiction** (0–100, but partly hidden)
  How far into substance abuse you are. Controls certain events and penalties.
* **Cred** (0–100)
  Scene respect. Affects industry offers, fan loyalty, backlash for “selling out”.

Hidden (or semi-hidden):

* **Industry Goodwill** (0–100) – labels, promoters, media.
* **Burnout** (0–100) – long-term fatigue separate from Health.

You can expose hidden stats via hints/events instead of raw numbers if you want it more opaque.

### 2.2 Bandmates

Each bandmate is:

* Name
* Role (guitar, bass, drums, etc.)
* **Talent**
* **Reliability** (0–100) – no-shows, drama.
* **Vice** (0–100) – tendency toward self-destruction.
* **Loyalty** (0–100) – likelihood to quit or betray.
* Status flags (in band, in rehab, fired, dead, etc.)

Band performance / drama is mostly aggregate of these.

### 2.3 Songs & Albums

**Song:**

* Title
* **Quality** (0–100)
* **Style** tag (e.g., glam, punk, grunge, etc.)
* **Hit Potential** (0–100) – partly random; goes up with Talent/Skill & right style for current trend.

**Album:**

* Title
* List of songs
* **Production Value** (0–100) – money + producer choice.
* **Promotion Spend**
* **Reception** (0–100) – review scores / word of mouth.
* **Sales tier** (Flop / Gold / Platinum, etc.)

---

## 3. Core weekly loop

Each **week** you choose from a menu of actions. Example set for MVP:

* **Write / Compose**
* **Rehearse**
* **Play Local Gig**
* **Tour (if on tour)**
* **Record (if in studio)**
* **Promote / Do Press**
* **Network / schmooze industry**
* **Party / Indulge**
* **Rest / Lay low**
* **Side job** (early game income)

### 3.1 Weekly resolution order

1. **Apply life costs**

   * Rent, food, debt interest, etc. (Money -= baseline)
2. **Process primary action(s)**

   * Stat changes based on action + current stats.
3. **Roll events**

   * Global random events (scene trends).
   * Personal events (health, addiction, relationships).
   * Band events (fights, lineup changes).
   * Industry events (offers, blacklisting).
4. **Update derived stats**

   * Hype decay, burnout growth, addiction progression, etc.
5. **Check arcs / triggers**

   * Label calls, tour offers, rehab ultimatum, etc.
6. **Check endings / game-over**.

---

## 4. Systems (the “car engine”)

### 4.1 Career progression

Driven mainly by:

* **Fans + Hype + Cred + Industry Goodwill**

Rough stages (no explicit “level up” screen, it just unlocks options):

1. **No-name local act**

   * Cheap/weird gigs.
   * Tiny pay, high flake risk.
   * DIY recording only.
2. **Scene fixture**

   * Access to better clubs, fanzines, indie press.
   * First indie label sniffing around.
3. **Indie label / small deal**

   * Recording budget (but recoupable).
   * Label can pressure you on sound/image.
4. **Breakthrough level**

   * Larger tours, mainstream press.
   * Major label offers / bigger deals.
5. **Big league**

   * Stadium tours, massive pressure.
   * Huge money swings, huge risk.

You don’t need to explicitly call them stages; just gate actions/events behind thresholds like `Fans`, `Industry Goodwill`, and `Cred`.

### 4.2 Money & debt

Key: **you can go broke easily**.

Income sources:

* Gigs
* Tour guarantees (less recoupable costs)
* Record advances (recoupable)
* Royalties (only post-recoup)
* Merch (bonus income on tours)
* Side jobs early on

Expenses:

* Living costs (weekly)
* Rehearsal space
* Gear
* Travel / van repairs
* Studio time (if DIY)
* Manager / lawyer (optional but strongly affects deals)
* Medical/rehab

**Labels & recoupment:**

* When you sign:

  * You get an **advance** (big Money inflow).
  * Label “bank” records how much you owe.
* All your royalties go to paying off that bank before you see more money.
* You can absolutely be **“famous and broke”** if your recoup debt is massive.

This system is the core of that cruel industry feel.

### 4.3 Health / Addiction / Stability loop

Tie the “hardcore niche” directly to the vice loop.

* **Party / Indulge:**

  * Short-term:

    * +Hype, +Image, +Inspiration (better song quality for a bit).
  * Long-term:

    * Addiction +Burnout, -Health, -Stability.
* **Addiction progression:**

  * Above thresholds (e.g., Addiction > 40, 70, 90) unlocks event chains:

    * Miss a gig, OD scare, rehab, death risk, band intervention.
* **Health:**

  * Goes down from:

    * Overwork (too many gigs/tours without rest).
    * Partying.
    * Certain events (fights, accidents).
  * Rest and rehab can restore but cost Money and Hype.
* **Stability:**

  * Going too low:

    * Worse decision options (self-sabotage).
    * Higher chance of destructive event outcomes.

This makes “living the fantasy” mechanically dangerous, not just cosmetic.

### 4.4 Fans, Hype, Cred

* **Fans:**

  * Long-term audience size.
  * Gained mostly from gigs, tours, album releases, word-of-mouth events.
* **Hype:**

  * Short-term spotlight.
  * Spikes from:

    * Press, scandals, hit songs, big support slots.
  * Drops every week if nothing happens.
  * High Hype multiplies fan gain *and* risk of drama events.
* **Cred:**

  * Goes up from:

    * Sticking to your sound.
    * Playing underground shows.
    * Turning down obviously gross label demands.
  * Goes down from:

    * Sell-out moves (cheesy endorsement, drastic style pivots under pressure).
    * Certain label choices.

This triangle gives you interesting tradeoffs: mainstream vs credibility, safe vs reckless.

### 4.5 Band dynamics

Band = an unstable structure you’re trying to hold together.

Each week, for bandmates:

* Reliability checks (no-shows, lateness).
* Loyalty checks (talking to other bands, quitting).
* Vice checks (drug/booze events, fights).

Trigger events:

* Fights that force you to pick a side.
* Ultimatum: “Him or me.”
* Member quits before big opportunity.
* Member dies → huge impact on Cred, Hype, Stability, Health.

You decide when to:

* **Fire** someone (short-term hit, long-term stability).
* **Enable** them (short-term performance/Image, long-term disaster).
* **Support** them (rehab, time off, costs Money and Hype).

---

## 5. Arcs & endings

This is where hardcore nostalgia really lands: cruel arcs, multiple bad endings.

### 5.1 Arcs (event chains)

Define a handful of big arcs as state machines:

* **Addiction Arc:**

  * Stage 1: Partying a lot → small warnings.
  * Stage 2: Missed rehearsals/gigs, band tension.
  * Stage 3: Health crises, OD scare, rehab options.
  * Stage 4: Death, permanent damage, or clean-up and reset (with penalties).
* **Label Deal Arc:**

  * Stage 1: Interest, showcase.
  * Stage 2: Contract offer (advance, recoup terms).
  * Stage 3: Creative pressure / mandated producer / single.
  * Stage 4: Success & golden handcuffs OR dropped & blacklisted.
* **Band Breakup Arc:**

  * Triggered by low Loyalty/Reliability.
  * Branches: side-project success, complete collapse, you going solo.
* **Sellout Arc:**

  * Big money choice: cheesy ad, pop crossover, obvious trend-jump.
  * Cred plummets, but finances jump.
* **Comeback Arc:**

  * Only possible if:

    * You had prior success, then crashed.
  * Hard to pull off:

    * Requires high Work Ethic, some remaining Cred, and luck.

Each arc = 3–6 events, some optional, with branching based on your choices and stats.

### 5.2 Endings

Endings based on final stats and flags:

* **Local Legend:** moderate Fans, high Cred, never broke out, still alive, scraping by.
* **One-Hit Wonder:** one big song, huge but brief Hype, then long slow decline.
* **Burnout Casualty:** early death after big Hype spike.
* **Industry Ghostwriter / Producer:** you fade as a front person but become a behind-the-scenes pro (high Talent/Skill, medium Industry Goodwill).
* **Stadium Icon & Wreck:** huge success, broke/fried by the end.
* **Balanced Survivor:** not mega-famous, but stable, paying bills with music and still alive.

You can flavor endings with callbacks to specific choices and arcs.

---

## 6. What makes it “hardcore” (in practice)

Concrete levers that give it that 90s, unforgiving feel:

1. **Scarcity & pressure**

   * Weekly expenses are relentless.
   * Early income is garbage.
   * It’s very possible to get trapped in debt.

2. **Big, irreversible choices**

   * Contracts, firing members, rehab decisions, drastic stylistic shifts.
   * No “are you sure?” handholding on every serious decision.

3. **Opaque systems (to a degree)**

   * You don’t see exact underlying Addiction thresholds, only symptoms.
   * Label terms summarized, but not min-max obvious.
   * You can learn the game, but not on your first run.

4. **Real failure**

   * Careers end abruptly.
   * Death, permanent injuries, getting dropped & blacklisted.
   * No automatic “you can always bounce back” narrative.

5. **Dark humor and blunt text**

   * Events should lean into the ugliness, but show consequences, not glamor.
