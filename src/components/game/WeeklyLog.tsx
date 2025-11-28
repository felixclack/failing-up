'use client';

import { WeekLog } from '@/engine/types';
import { ACTIONS } from '@/engine/actions';

interface WeeklyLogProps {
  currentMessage: string | null;
  weekLogs: WeekLog[];
  maxEntries?: number;
}

function LogEntry({ log, isLatest }: { log: WeekLog; isLatest: boolean }) {
  const action = ACTIONS[log.action];
  const weekInYear = ((log.week - 1) % 52) + 1;
  const year = Math.floor((log.week - 1) / 52) + 1;

  return (
    <div className={`
      p-3 rounded-lg border
      ${isLatest
        ? 'bg-gray-800 border-gray-600'
        : 'bg-gray-900 border-gray-800'
      }
    `}>
      <div className="flex justify-between items-start mb-1">
        <span className="font-semibold text-white">{action?.label || log.action}</span>
        <span className="text-xs text-gray-500">Y{year} W{weekInYear}</span>
      </div>
      <p className="text-sm text-gray-300">{log.actionResult}</p>
    </div>
  );
}

export function WeeklyLog({ currentMessage, weekLogs, maxEntries = 5 }: WeeklyLogProps) {
  const recentLogs = weekLogs.slice(-maxEntries).reverse();

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
      <div className="text-lg font-bold text-white mb-4">
        Recent Activity
      </div>

      {/* Current week result */}
      {currentMessage && (
        <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-green-700">
          <div className="text-xs text-green-400 uppercase tracking-wide mb-1">
            This Week
          </div>
          <p className="text-white">{currentMessage}</p>
        </div>
      )}

      {/* Previous weeks */}
      {recentLogs.length > 0 ? (
        <div className="space-y-2">
          {recentLogs.map((log, index) => (
            <LogEntry
              key={log.week}
              log={log}
              isLatest={index === 0 && !currentMessage}
            />
          ))}
        </div>
      ) : (
        <div className="text-gray-500 text-sm italic">
          No activity yet. Choose an action to begin your career.
        </div>
      )}
    </div>
  );
}
