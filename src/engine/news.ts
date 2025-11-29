/**
 * News system - generates industry news and updates about rival bands
 * Creates a living world outside the player's direct story
 */

import {
  NewsItem,
  NewsType,
  RivalBand,
  GameState,
} from './types';
import { RandomGenerator } from './random';
import { getPlayerFameTier, getActiveRivals, getBiggerBands } from './rivals';

// =============================================================================
// News Templates
// =============================================================================

const RELEASE_HEADLINES = [
  '{band} drops surprise EP to critical acclaim',
  '{band}\'s new single dominates streaming charts',
  '{band} announces highly anticipated comeback album',
  '{band} releases controversial new track',
  '{band}\'s latest album receives mixed reviews',
  '{band} drops surprise collaboration with {other}',
  'Critics hail {band}\'s new direction',
  '{band} goes platinum with latest release',
];

const TOUR_HEADLINES = [
  '{band} announces massive world tour',
  '{band} adds more dates after instant sellout',
  '{band}\'s tour grosses record numbers',
  '{band} forced to cancel shows due to illness',
  '{band} announces intimate acoustic tour',
  '{band} joins {other} as support act for arena tour',
  '{band} headlines major festival',
];

const SCANDAL_HEADLINES = [
  '{band} frontman arrested after show',
  '{band} caught in financial scandal',
  '{band} fires manager amid controversy',
  '{band} denies plagiarism accusations',
  '{band} member enters rehab',
  '{band} faces backlash after controversial statement',
  'Leaked emails reveal {band} label dispute',
  '{band} accused of lip-syncing at major show',
];

const BREAKUP_HEADLINES = [
  '{band} announces indefinite hiatus',
  '{band} calls it quits after {years} years',
  '{band} splits amid creative differences',
  '{band} drummer quits, future uncertain',
  'Sources confirm: {band} is done',
  '{band} plays "final" show to tearful crowd',
];

const SIGNING_HEADLINES = [
  '{band} signs massive deal with major label',
  '{band} leaves indie roots, joins {label}',
  '{band} inks groundbreaking 360 deal',
  '{band} signs with streaming platform for exclusive',
  '{band} turns down seven-figure deal to stay independent',
];

const INDUSTRY_HEADLINES = [
  'Streaming payouts hit all-time low',
  'Major label announces massive layoffs',
  'Iconic venue {venue} to close after {years} years',
  'Live nation announces fee increases',
  'AI-generated music sparks industry debate',
  'Vinyl sales continue surprising growth',
  'Festival season sees record attendance',
  'Independent labels report surge in signings',
  'Legendary producer {name} retires',
  'Music copyright case sets new precedent',
];

const DEATH_HEADLINES = [
  'Music world mourns: {band} founding member passes',
  '{band} drummer dies tragically at {age}',
  'Industry legend from {band} remembered by peers',
];

const COMEBACK_HEADLINES = [
  '{band} announces surprise reunion',
  '{band} returns after decade-long hiatus',
  '{band} original lineup reunites for one night only',
  '{band} comeback tour breaks ticket records',
];

const RIVALRY_HEADLINES = [
  '{band} takes shot at {target} in new interview',
  '{band} and {target} trade barbs online',
  'Fans demand {band} vs {target} collaboration',
  '{band} responds to {target} diss track',
  '{band} frontman calls out {target} at show',
];

const THEFT_HEADLINES = [
  'Fans notice {band} riff sounds like {target} song',
  '{band} accused of stealing melody from {target}',
  'Lawyers circling: {band} vs {target} copyright dispute',
];

// =============================================================================
// Detail Templates
// =============================================================================

const RELEASE_DETAILS = [
  'The release has already generated significant buzz across social media.',
  'Industry insiders call it their most ambitious work yet.',
  'Early reviews are polarizing but passionate.',
  'Fans have been waiting months for this.',
  'The surprise drop caught everyone off guard.',
];

const SCANDAL_DETAILS = [
  'Representatives have declined to comment.',
  'The situation continues to develop.',
  'Fans are divided in their response.',
  'More details expected to emerge soon.',
  'Industry observers are watching closely.',
];

const INDUSTRY_DETAILS = [
  'This marks a significant shift in the industry landscape.',
  'Experts predict more changes to come.',
  'Artists and fans alike are responding.',
  'The long-term implications remain unclear.',
];

// Venue names for industry news
const VENUES = [
  'The Roxy', 'CBGB', 'The Troubadour', 'First Avenue', 'The Whisky',
  'Bottom Lounge', 'The Metro', 'Club Foot', 'The Fillmore', 'Red Rocks',
];

// Producer names for industry news
const PRODUCERS = [
  'Rick Rubin', 'Steve Albini', 'Butch Vig', 'Bob Rock', 'Flood',
  'Daniel Lanois', 'Brian Eno', 'Jack Endino', 'Gil Norton', 'Dave Sardy',
];

// Label names for signing news
const LABELS = [
  'Universal', 'Sony', 'Warner', 'Atlantic', 'Capitol', 'Interscope',
  'Sub Pop', 'Merge', 'Matador', 'Epitaph', '4AD', 'Rough Trade',
];

// =============================================================================
// News Generation
// =============================================================================

/**
 * Generate a unique news ID
 */
function generateNewsId(week: number, rng: RandomGenerator): string {
  return `news_${week}_${rng.nextInt(0, 99999)}`;
}

/**
 * Fill in template variables
 */
function fillTemplate(
  template: string,
  vars: Record<string, string | number>
): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }
  return result;
}

/**
 * Generate news about a specific rival band
 */
export function generateRivalNews(
  rival: RivalBand,
  week: number,
  rng: RandomGenerator,
  otherBands: RivalBand[],
  playerBandName: string
): NewsItem | null {
  // Determine news type based on rival state
  let newsType: NewsType;
  let headlines: string[];
  let details: string[];

  // Weight different news types
  const roll = rng.next();

  if (rival.status === 'hiatus' || rival.status === 'broken_up') {
    newsType = 'breakup';
    headlines = BREAKUP_HEADLINES;
    details = SCANDAL_DETAILS;
  } else if (roll < 0.4) {
    newsType = 'release';
    headlines = RELEASE_HEADLINES;
    details = RELEASE_DETAILS;
  } else if (roll < 0.55) {
    newsType = 'tour';
    headlines = TOUR_HEADLINES;
    details = RELEASE_DETAILS;
  } else if (roll < 0.7) {
    newsType = 'scandal';
    headlines = SCANDAL_HEADLINES;
    details = SCANDAL_DETAILS;
  } else if (roll < 0.8) {
    newsType = 'signing';
    headlines = SIGNING_HEADLINES;
    details = INDUSTRY_DETAILS;
  } else if (roll < 0.9 && rng.next() < 0.1) {
    newsType = 'comeback';
    headlines = COMEBACK_HEADLINES;
    details = RELEASE_DETAILS;
  } else {
    // Default to release news
    newsType = 'release';
    headlines = RELEASE_HEADLINES;
    details = RELEASE_DETAILS;
  }

  // Pick random templates
  const headlineTemplate = headlines[rng.nextInt(0, headlines.length - 1)];
  const detailTemplate = details[rng.nextInt(0, details.length - 1)];

  // Get another band for collaborations/comparisons
  const otherBand = otherBands.length > 0
    ? otherBands[rng.nextInt(0, otherBands.length - 1)]
    : null;

  // Fill in variables
  const vars: Record<string, string | number> = {
    band: rival.name,
    years: Math.floor((week - rival.weekFormed) / 52) + 1,
    other: otherBand?.name || 'a mystery artist',
    label: LABELS[rng.nextInt(0, LABELS.length - 1)],
    age: rng.nextInt(27, 55),
  };

  return {
    id: generateNewsId(week, rng),
    week,
    headline: fillTemplate(headlineTemplate, vars),
    details: detailTemplate,
    type: newsType,
    bandId: rival.id,
    involvesPlayer: false,
  };
}

/**
 * Generate rivalry news involving the player
 */
export function generateRivalryNews(
  rival: RivalBand,
  playerBandName: string,
  week: number,
  rng: RandomGenerator,
  isTheft: boolean = false
): NewsItem {
  const headlines = isTheft ? THEFT_HEADLINES : RIVALRY_HEADLINES;
  const headlineTemplate = headlines[rng.nextInt(0, headlines.length - 1)];

  // Determine which band is the aggressor
  const rivalIsAggressor = rng.next() < 0.6;
  const vars: Record<string, string> = rivalIsAggressor
    ? { band: rival.name, target: playerBandName }
    : { band: playerBandName, target: rival.name };

  return {
    id: generateNewsId(week, rng),
    week,
    headline: fillTemplate(headlineTemplate, vars),
    details: isTheft
      ? 'Legal experts weigh in on the similarities.'
      : 'Fans are choosing sides.',
    type: isTheft ? 'theft' : 'rivalry',
    bandId: rival.id,
    involvesPlayer: true,
    impact: isTheft
      ? { hype: 5, cred: -5 }
      : { hype: rng.nextInt(-3, 5) },
  };
}

/**
 * Generate general industry news
 */
export function generateIndustryNews(
  week: number,
  rng: RandomGenerator
): NewsItem {
  const headlineTemplate = INDUSTRY_HEADLINES[rng.nextInt(0, INDUSTRY_HEADLINES.length - 1)];
  const detailTemplate = INDUSTRY_DETAILS[rng.nextInt(0, INDUSTRY_DETAILS.length - 1)];

  const vars: Record<string, string | number> = {
    venue: VENUES[rng.nextInt(0, VENUES.length - 1)],
    years: rng.nextInt(15, 50),
    name: PRODUCERS[rng.nextInt(0, PRODUCERS.length - 1)],
  };

  return {
    id: generateNewsId(week, rng),
    week,
    headline: fillTemplate(headlineTemplate, vars),
    details: detailTemplate,
    type: 'industry',
    involvesPlayer: false,
  };
}

/**
 * Generate weekly news items
 * Creates 1-3 news items per week
 */
export function generateWeeklyNews(
  state: GameState,
  rng: RandomGenerator
): NewsItem[] {
  const news: NewsItem[] = [];
  const { week, rivalBands, bandName } = state;

  // Determine how many news items this week (1-3)
  const newsCount = rng.nextInt(1, 3);

  // Get active rivals and bigger bands for news generation
  const activeRivals = rivalBands.filter(r => r.status === 'active');
  const biggerBands = getBiggerBands(state);

  for (let i = 0; i < newsCount; i++) {
    const roll = rng.next();

    if (roll < 0.6 && activeRivals.length > 0) {
      // News about a rival band (60%)
      const rival = activeRivals[rng.nextInt(0, activeRivals.length - 1)];
      const rivalNews = generateRivalNews(rival, week, rng, activeRivals, bandName);
      if (rivalNews) {
        news.push(rivalNews);
      }
    } else if (roll < 0.85) {
      // General industry news (25%)
      news.push(generateIndustryNews(week, rng));
    } else if (activeRivals.length > 0) {
      // Rivalry news involving player (15%)
      const rival = activeRivals[rng.nextInt(0, activeRivals.length - 1)];
      // Small chance it's theft-related
      const isTheft = rng.next() < 0.2 && state.songs.filter(s => s.isReleased).length > 0;
      news.push(generateRivalryNews(rival, bandName, week, rng, isTheft));
    } else {
      // Fallback to industry news
      news.push(generateIndustryNews(week, rng));
    }
  }

  return news;
}

/**
 * Apply news impact to player stats (if any)
 */
export function applyNewsImpacts(
  state: GameState,
  newsItems: NewsItem[]
): GameState {
  let updatedState = { ...state };
  let player = { ...state.player };

  for (const news of newsItems) {
    if (news.impact) {
      if (news.impact.hype !== undefined) {
        player.hype = Math.max(0, Math.min(100, player.hype + news.impact.hype));
      }
      if (news.impact.cred !== undefined) {
        player.cred = Math.max(0, Math.min(100, player.cred + news.impact.cred));
      }
      if (news.impact.industryGoodwill !== undefined) {
        player.industryGoodwill = Math.max(
          0,
          Math.min(100, player.industryGoodwill + news.impact.industryGoodwill)
        );
      }
    }
  }

  updatedState.player = player;
  return updatedState;
}

/**
 * Get recent news items (for display)
 */
export function getRecentNews(state: GameState, count: number = 10): NewsItem[] {
  return state.newsItems
    .slice()
    .sort((a, b) => b.week - a.week)
    .slice(0, count);
}

/**
 * Get news involving the player
 */
export function getPlayerNews(state: GameState, count: number = 5): NewsItem[] {
  return state.newsItems
    .filter(n => n.involvesPlayer)
    .sort((a, b) => b.week - a.week)
    .slice(0, count);
}
