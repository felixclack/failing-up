Good call. We can modernize it without losing the nasty edge.

I’ll layer streaming + social into the existing design, not restart from scratch. Think of this as a patch to the design doc.

⸻

A. Setting / Era
	•	The game is “now-ish”:
	•	Streaming is dominant.
	•	Social media is mandatory.
	•	Labels exist, but deals are often 360 or distribution-focused.
	•	Core fantasy: you can blow up from your bedroom or die grinding content for nobody.

⸻

B. New / Updated Stats

We keep most existing stats and add a digital layer.

1. Audience stats

Instead of just Fans, we split:
	•	CoreFans
	•	People who will buy tickets/merch and stick around.
	•	CasualListeners
	•	Passive streaming audience; big numbers, less loyalty.

Old Fans becomes a derived or summed view: Fans = CoreFans + CasualListeners.

2. Online presence

New stats:
	•	Followers
	•	Aggregate social followers across platforms.
	•	AlgoBoost (0–100)
	•	How much platforms currently “like” you. Drives:
	•	Virality chance.
	•	Playlist/algorithmic pushes.
	•	CataloguePower (0–100)
	•	Strength of your existing catalogue on streaming.
	•	Rough abstraction of monthly listeners / active back catalog.

3. Mental load (folded into existing)

We don’t add more bars; we reuse:
	•	Social grind mainly hits:
	•	Burnout ↑
	•	Stability ↓
So “being extremely online” is mechanically stressful.

⸻

C. New Actions (Digital Era)

Add/modify weekly actions to capture streaming/social.

1. Release Single
	•	Requirements:
	•	At least 1 unreleased song.
	•	Effect:
	•	Song goes to streaming.
	•	AlgoBoost check → determines initial spike.
	•	CasualListeners↑ (if algo hits).
	•	CoreFans↑ (small but steady).
	•	Starts generating streaming income each week.
	•	Tradeoffs:
	•	Frequent singles keep Hype up but can:
	•	Increase Burnout.
	•	Slightly lower AlbumImpact later (album feels less special).

2. Release EP/Album (modernized)

Same as before but with streaming twist:
	•	EP/Album release:
	•	Big one-time Hype spike.
	•	Larger CataloguePower boost.
	•	Potential editorial playlisting (event-driven).
	•	Long-term CoreFans growth if reception is good.

3. Post Content

Represents regular posts, clips, photos.
	•	Effect:
	•	Followers↑ small.
	•	Hype↑ small.
	•	Burnout↑ small.
	•	Safe, low-variance grind.

4. Short-Form Blitz (TikTok/Shorts/Reels)
	•	Effect:
	•	Big roll:
	•	Small chance of viral spike → huge Followers, CasualListeners, AlgoBoost jump for one or more songs.
	•	Usually: modest gains + fatigue.
	•	Costs:
	•	Burnout↑↑, Stability↓ (dopamine rollercoaster).
	•	Key: this is the “lottery ticket” button.

5. Livestream / Online Show
	•	Effect:
	•	CoreFans↑ (they feel closer to you).
	•	Money↑ small (tips/donations).
	•	Followers↑ small.
	•	Burnout↑ moderate.
	•	Often used when you can’t tour (broke, sick, pandemic event, etc.).

6. Engage Community (Discord/Patreon vibe)
	•	Effect:
	•	CoreFans↑ steady, Cred↑.
	•	Followers might not grow much.
	•	Burnout↑ small to moderate.
	•	Unlocks membership income later.
	•	This is the “slow and loyal” route.

7. Brand / Sponsorship Deals

Not always available; triggered as events or via action when you’re big enough.
	•	Effect:
	•	Money↑ big spike.
	•	Cred↓ (depending on brand).
	•	Hooks into Sellout Arc.

You still keep analog actions like Gigs, Tour, Record, Rest, Party, Network, Side Job – they now coexist with digital actions.

⸻

D. New / Updated Systems

1. Streaming Catalogue System

Each song now tracks streaming-specific fields:
	•	streamsTier (enum: NONE / LOW / MED / HIGH / MASSIVE)
	•	playlistScore (0–100)
	•	viralFlag (bool, temporary)
	•	isSingle (bool)

Weekly streaming income:

For each song:

songBase = qualityFactor * (followers/scale + algoBoost/scale + playlistScore/scale)
if viralFlag: songBase *= bigMultiplier

incomeFromSong = songBase * royaltyRate * streamToMoneyFactor

	•	Sum all songs → StreamingIncome.
	•	StreamingIncome is usually small unless:
	•	CataloguePower is high and
	•	You have at least one track at HIGH/MASSIVE tier.

2. Playlist & Algorithm

Playlist features become event-driven:
	•	Event: “Your single is added to a big playlist.”
	•	Effects:
	•	That song: streamsTier jumps.
	•	AlgoBoost↑.
	•	CasualListeners↑ big over next few weeks.

AlgoBoost decays:

algoBoost = max(0, algoBoost - decay + smallBonusesFromOngoingContent)

Spike events (viral moments, playlists) temporarily boost it.

3. Social Media Growth

Followers growth each week based on:
	•	Social actions (Post, Blitz, Livestream, Engage).
	•	Big career events (hits, scandals, tours).

Rough outline:

followersGain =
  baseFromActions +
  hypeFactor +
  viralBonus

CoreFansGain ~ f(followersGain, cred, engagementStyle)
CasualListenersGain ~ f(streams, algoBoost)

You can be huge in Followers but weak in CoreFans if you lean into shallow viral content.

4. Modern Label Deals

Update LabelDeal:

{
  "id": "string",
  "name": "string",
  "dealType": "traditional | distro | 360",
  "advance": 50000,
  "recoupDebt": 50000,
  "royaltyRate": 0.15,
  "includesMasters": true,
  "includesMerch": false,
  "includesTouring": true,
  "creativeControl": "low | medium | high",
  "status": "active | dropped | fulfilled"
}

	•	Traditional:
	•	Masters owned by label, no merch/touring cut. Old-school, rare.
	•	Distribution:
	•	You keep more control; lower advance; more DIY burden.
	•	360:
	•	Label takes % of everything (streams, merch, touring).
	•	Feels predatory but may unlock big opportunities.

Impact:
	•	Streaming payouts are filtered through these deals.
	•	Your Money from streaming can be almost zero under a bad 360 deal unless you are huge.

5. DIY Route

Add flags/actions making never signing or just distribution deals viable:
	•	If no label:
	•	You pay 100% of production/promo.
	•	Higher cut of streaming and merch.
	•	Slower growth unless you hit viral or grind social smartly.

Adds a new strategic fork:
	•	Old-school label route vs modern DIY/creator path.

⸻

E. New Arcs & Event Types

1. Viral One-Hit Arc

Trigger:
	•	Viral success from Short-Form Blitz or a random virality event.

Stages:
	1.	Clip blows up → Followers↑↑, huge CasualListeners for one song.
	2.	Labels + brands swarm with offers (often exploitative).
	3.	Pressure to repeat the meme/formula:
	•	Embrace it → money but Cred↓ and pigeonhole risk.
	•	Resist → short-term drop in hype and offers, but Cred↑.
	4.	Long tail:
	•	Either you convert some into CoreFans and sustain,
	•	Or you become a pure one-hit footnote.

2. Cancel / Backlash Arc

Trigger:
	•	Bad-taste joke, old tweet, or a botched brand collab event.
	•	Followers above some threshold to matter.

Stages:
	1.	Something blows up negatively.
	2.	Options:
	•	Apologize (Money lost, Cred+- depending on framing).
	•	Double down (possible Cred↑ with some scene, but mainstream Fans↓).
	•	Go dark (restores Stability, Hype↓).
	3.	Long-term:
	•	Brands avoid you OR you become “controversial but niche”.

3. Platform Algorithm Shift Arc

Trigger:
	•	Global random “platform patch” event.

Stages:
	1.	“Platform changes recommendation algorithm.”
	2.	Effects:
	•	Big drop for some songs’ streamsTier and AlgoBoost.
	•	Others unaffected or even gain.
	3.	Choices:
	•	Adapt content strategy (new action unlocked: change content style).
	•	Ignore and double-down on live shows.
	•	Pivot to another platform (delayed recovery).

This captures how fragile the streaming/social foundation is.

4. Creator Burnout Arc

Trigger:
	•	High Burnout + frequent social actions.

Stages:
	1.	Symptoms: insomnia, doomscrolling, creative block events.
	2.	Options:
	•	Slow down posting → FollowersGrowth↓, Stability↑.
	•	Push through → short-term numbers, risk major breakdown.
	3.	Endpoints:
	•	Full break (hiatus, big Hype drop, but health recovery).
	•	Collapse (serious mental health event; potentially a game-ending event if combined with addiction).

5. DIY Patron / Membership Arc

Trigger:
	•	High CoreFans, high Cred, moderate Followers.

Stages:
	1.	Launch membership (Patreon/whatever).
	2.	Stable monthly Money income if you maintain output.
	3.	If you stop delivering:
	•	Membership drops sharply.
	•	Big Stability hit from guilt/stress events.

⸻

F. Modernized Endings (Additions)

We keep the old endings and add/adjust:
	•	Algorithm Casualty
	•	You had big numbers, then platform/algos changed and your career never recovered.
	•	Content Creator Prison
	•	You’re financially okay, but your life is an endless content treadmill; Burnout/Stability low at the end.
	•	DIY Cult Hero
	•	Strong CoreFans, good Cred, decent Money from membership/merch, small mainstream footprint.
	•	Viral Ghost
	•	One meme song with massive lifetime streams, but no one cares who you are.

⸻

