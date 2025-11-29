'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { NewsItem, WeekLog } from '@/engine/types';
import { TypewriterText, TypewriterSequence } from './TypewriterText';

// Feed item types
type FeedItemType = 'action' | 'event' | 'flavor' | 'reflection' | 'news' | 'news_player';

interface FeedItem {
  id: string;
  type: FeedItemType;
  text: string;
  week: number;
  order: number; // for sorting within a week
}

// Style configuration for different feed item types
const FEED_STYLES: Record<FeedItemType, { prefix: string; textClass: string; prefixClass: string }> = {
  action: {
    prefix: '► ',
    textClass: 'text-gray-100',
    prefixClass: 'text-green-400',
  },
  event: {
    prefix: '◆ ',
    textClass: 'text-amber-200',
    prefixClass: 'text-amber-400',
  },
  flavor: {
    prefix: '~ ',
    textClass: 'text-gray-400 italic',
    prefixClass: 'text-gray-500',
  },
  reflection: {
    prefix: '',
    textClass: 'text-gray-500 italic text-sm',
    prefixClass: '',
  },
  news: {
    prefix: '○ ',
    textClass: 'text-cyan-300/70',
    prefixClass: 'text-cyan-500/50',
  },
  news_player: {
    prefix: '● ',
    textClass: 'text-amber-300',
    prefixClass: 'text-amber-500',
  },
};

interface WeekFeedProps {
  // Current week's data
  currentWeek: number;
  currentMessage: string | null;
  flavorText?: string | null;
  weekReflection?: string | null;

  // Historical data
  weekLogs: WeekLog[];
  newsItems: NewsItem[];

  // Control
  isRevealing: boolean;
  onRevealComplete?: () => void;

  // Settings
  typewriterSpeed?: number;
  maxHistoryItems?: number;
}

export function WeekFeed({
  currentWeek,
  currentMessage,
  flavorText,
  weekReflection,
  weekLogs,
  newsItems,
  isRevealing,
  onRevealComplete,
  typewriterSpeed = 15,
  maxHistoryItems = 20,
}: WeekFeedProps) {
  const [revealComplete, setRevealComplete] = useState(false);

  // Build the current week's feed items
  const currentWeekItems = useMemo(() => {
    const items: FeedItem[] = [];
    let order = 0;

    // Get news from current week
    const currentWeekNews = newsItems.filter(n => n.week === currentWeek);

    // Interleave: some news, then action, then more news, then flavor
    // This creates a sense of the week unfolding

    // First batch of news (world events happening)
    currentWeekNews.slice(0, 2).forEach(news => {
      items.push({
        id: news.id,
        type: news.involvesPlayer ? 'news_player' : 'news',
        text: news.headline,
        week: currentWeek,
        order: order++,
      });
    });

    // Main action result (what you did)
    if (currentMessage) {
      items.push({
        id: `action-${currentWeek}`,
        type: 'action',
        text: currentMessage,
        week: currentWeek,
        order: order++,
      });
    }

    // Remaining news
    currentWeekNews.slice(2).forEach(news => {
      items.push({
        id: news.id,
        type: news.involvesPlayer ? 'news_player' : 'news',
        text: news.headline,
        week: currentWeek,
        order: order++,
      });
    });

    // Flavor text (small moment)
    if (flavorText) {
      items.push({
        id: `flavor-${currentWeek}`,
        type: 'flavor',
        text: flavorText,
        week: currentWeek,
        order: order++,
      });
    }

    // Week reflection (narrator voice)
    if (weekReflection) {
      items.push({
        id: `reflection-${currentWeek}`,
        type: 'reflection',
        text: weekReflection,
        week: currentWeek,
        order: order++,
      });
    }

    return items;
  }, [currentWeek, currentMessage, flavorText, weekReflection, newsItems]);

  // Build historical feed (previous weeks)
  const historyItems = useMemo(() => {
    const items: FeedItem[] = [];

    // Get logs excluding current week (if showing current week separately)
    const historicalLogs = currentMessage
      ? weekLogs.slice(0, -1)
      : weekLogs;

    // Add historical actions
    historicalLogs.forEach(log => {
      items.push({
        id: `log-${log.week}`,
        type: 'action',
        text: log.actionResult,
        week: log.week,
        order: 0,
      });
    });

    // Add historical news (excluding current week)
    newsItems
      .filter(n => n.week < currentWeek)
      .forEach(news => {
        items.push({
          id: news.id,
          type: news.involvesPlayer ? 'news_player' : 'news',
          text: news.headline,
          week: news.week,
          order: 1,
        });
      });

    // Sort by week descending, then by order
    items.sort((a, b) => {
      if (b.week !== a.week) return b.week - a.week;
      return a.order - b.order;
    });

    return items.slice(0, maxHistoryItems);
  }, [weekLogs, newsItems, currentWeek, currentMessage, maxHistoryItems]);

  // Handle reveal completion
  const handleRevealComplete = useCallback(() => {
    setRevealComplete(true);
    onRevealComplete?.();
  }, [onRevealComplete]);

  // Reset reveal state when currentWeek changes
  useEffect(() => {
    setRevealComplete(false);
  }, [currentWeek, currentMessage]);

  // Format week display
  const formatWeek = (week: number) => {
    const weekInYear = ((week - 1) % 52) + 1;
    const year = Math.floor((week - 1) / 52) + 1;
    return `Y${year} W${weekInYear}`;
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 h-full flex flex-col">
      <div className="text-lg font-bold text-white mb-3">The Story So Far</div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Current Week */}
        {currentWeekItems.length > 0 && (
          <div className="pb-4 border-b border-gray-700">
            <div className="text-xs text-green-400 uppercase tracking-wide mb-3">
              {formatWeek(currentWeek)} — This Week
            </div>

            {isRevealing && !revealComplete ? (
              <TypewriterSequence
                items={currentWeekItems.map(item => ({
                  id: item.id,
                  text: item.text,
                  className: FEED_STYLES[item.type].textClass,
                  prefix: FEED_STYLES[item.type].prefix,
                  prefixClassName: FEED_STYLES[item.type].prefixClass,
                }))}
                speed={typewriterSpeed}
                delayBetween={400}
                onAllComplete={handleRevealComplete}
              />
            ) : (
              <div className="space-y-2">
                {currentWeekItems.map(item => {
                  const style = FEED_STYLES[item.type];
                  return (
                    <div key={item.id}>
                      <span className={style.prefixClass}>{style.prefix}</span>
                      <span className={style.textClass}>{item.text}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Historical Feed */}
        {historyItems.length > 0 && (
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">
              Previous Weeks
            </div>
            <div className="space-y-2">
              {historyItems.map(item => {
                const style = FEED_STYLES[item.type];
                return (
                  <div key={item.id} className="text-sm opacity-70">
                    <span className="text-gray-600 text-xs mr-2">
                      {formatWeek(item.week)}
                    </span>
                    <span className={style.prefixClass}>{style.prefix}</span>
                    <span className={style.textClass}>{item.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {currentWeekItems.length === 0 && historyItems.length === 0 && (
          <p className="text-gray-500 italic">Your journey begins...</p>
        )}
      </div>
    </div>
  );
}
