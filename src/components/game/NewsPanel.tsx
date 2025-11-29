'use client';

import { NewsItem, NewsType } from '@/engine/types';

interface NewsPanelProps {
  newsItems: NewsItem[];
  currentWeek: number;
  maxItems?: number;
}

// Icon/badge for each news type
function getNewsTypeIcon(type: NewsType): string {
  switch (type) {
    case 'release': return '💿';
    case 'tour': return '🎤';
    case 'scandal': return '⚡';
    case 'breakup': return '💔';
    case 'signing': return '📝';
    case 'rivalry': return '🔥';
    case 'industry': return '🏢';
    case 'death': return '💀';
    case 'comeback': return '🌟';
    case 'theft': return '⚠️';
    default: return '📰';
  }
}

// Color styling based on news type
function getNewsTypeStyle(type: NewsType, involvesPlayer: boolean): string {
  if (involvesPlayer) {
    return 'border-amber-600/50 bg-amber-900/20';
  }

  switch (type) {
    case 'scandal':
    case 'death':
    case 'theft':
      return 'border-red-900/50 bg-red-900/10';
    case 'rivalry':
      return 'border-orange-900/50 bg-orange-900/10';
    case 'release':
    case 'comeback':
      return 'border-green-900/50 bg-green-900/10';
    case 'signing':
      return 'border-blue-900/50 bg-blue-900/10';
    default:
      return 'border-gray-700 bg-gray-800/50';
  }
}

function NewsEntry({ news, currentWeek }: { news: NewsItem; currentWeek: number }) {
  const weeksAgo = currentWeek - news.week;
  const timeLabel = weeksAgo === 0 ? 'This week' : weeksAgo === 1 ? 'Last week' : `${weeksAgo} weeks ago`;
  const icon = getNewsTypeIcon(news.type);
  const style = getNewsTypeStyle(news.type, news.involvesPlayer);

  return (
    <div className={`p-3 rounded-lg border ${style}`}>
      <div className="flex items-start gap-2">
        <span className="text-lg flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <h4 className={`text-sm font-medium leading-tight ${news.involvesPlayer ? 'text-amber-200' : 'text-gray-200'}`}>
              {news.headline}
            </h4>
            <span className="text-xs text-gray-500 flex-shrink-0">{timeLabel}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">{news.details}</p>
          {news.involvesPlayer && news.impact && (
            <div className="text-xs text-amber-400/80 mt-1">
              {news.impact.hype !== undefined && news.impact.hype !== 0 && (
                <span className={news.impact.hype > 0 ? 'text-green-400' : 'text-red-400'}>
                  {news.impact.hype > 0 ? '+' : ''}{news.impact.hype} hype{' '}
                </span>
              )}
              {news.impact.cred !== undefined && news.impact.cred !== 0 && (
                <span className={news.impact.cred > 0 ? 'text-green-400' : 'text-red-400'}>
                  {news.impact.cred > 0 ? '+' : ''}{news.impact.cred} cred
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function NewsPanel({
  newsItems,
  currentWeek,
  maxItems = 8,
}: NewsPanelProps) {
  // Sort by week descending (most recent first) and take top items
  const recentNews = newsItems
    .slice()
    .sort((a, b) => b.week - a.week)
    .slice(0, maxItems);

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-bold text-white">
          Industry News
        </div>
        <span className="text-xs text-gray-500">
          {newsItems.length} stories
        </span>
      </div>

      {recentNews.length === 0 ? (
        <div className="text-gray-500 text-sm text-center py-4">
          No news yet. The world is quiet... for now.
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {recentNews.map((news) => (
            <NewsEntry key={news.id} news={news} currentWeek={currentWeek} />
          ))}
        </div>
      )}
    </div>
  );
}

// Compact version for mobile
export function MobileNewsPanel({
  newsItems,
  currentWeek,
  maxItems = 5,
}: NewsPanelProps) {
  const recentNews = newsItems
    .slice()
    .sort((a, b) => b.week - a.week)
    .slice(0, maxItems);

  return (
    <div className="space-y-2">
      {recentNews.length === 0 ? (
        <div className="text-gray-500 text-sm text-center py-2">
          No news yet.
        </div>
      ) : (
        recentNews.map((news) => (
          <div
            key={news.id}
            className={`p-2 rounded border ${getNewsTypeStyle(news.type, news.involvesPlayer)}`}
          >
            <div className="flex items-center gap-2">
              <span>{getNewsTypeIcon(news.type)}</span>
              <span className={`text-sm flex-1 truncate ${news.involvesPlayer ? 'text-amber-200' : 'text-gray-300'}`}>
                {news.headline}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
