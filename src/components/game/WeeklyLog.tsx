'use client';

import { WeekLog } from '@/engine/types';
import { ACTIONS } from '@/engine/actions';

interface WeeklyLogProps {
  currentMessage: string | null;
  flavorText?: string | null;
  weekReflection?: string | null;
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
        <span className="font-semibold text-white text-sm">{action?.label || log.action}</span>
        <span className="text-xs text-gray-500">Y{year} W{weekInYear}</span>
      </div>
      <p className="text-sm text-gray-300 leading-relaxed">{log.actionResult}</p>
    </div>
  );
}

export function WeeklyLog({
  currentMessage,
  flavorText,
  weekReflection,
  weekLogs,
  maxEntries = 5,
}: WeeklyLogProps) {
  // When currentMessage is displayed in "This Week", skip the most recent log to avoid duplication
  const logsToShow = currentMessage && weekLogs.length > 0
    ? weekLogs.slice(0, -1)  // Exclude the latest entry (it's shown in "This Week")
    : weekLogs;
  const recentLogs = logsToShow.slice(-maxEntries).reverse();

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
      <div className="text-lg font-bold text-white mb-4">
        The Story So Far
      </div>

      {/* Current week narrative block */}
      {(currentMessage || flavorText || weekReflection) && (
        <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-600 space-y-3">
          <div className="text-xs text-green-400 uppercase tracking-wide">
            This Week
          </div>

          {/* Main action narrative */}
          {currentMessage && (
            <p className="text-gray-100 leading-relaxed">{currentMessage}</p>
          )}

          {/* Flavor text - small narrative moment */}
          {flavorText && (
            <div className="border-l-2 border-amber-600/50 pl-3 mt-3">
              <p className="text-amber-200/80 text-sm italic leading-relaxed">{flavorText}</p>
            </div>
          )}

          {/* Week reflection - narrator voice */}
          {weekReflection && (
            <p className="text-gray-400 text-sm italic mt-3 pt-3 border-t border-gray-700">
              {weekReflection}
            </p>
          )}
        </div>
      )}

      {/* Previous weeks */}
      {recentLogs.length > 0 ? (
        <div className="space-y-2">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            Previous Weeks
          </div>
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
          The pages are blank. Your story hasn't started yet. Choose an action to begin.
        </div>
      )}
    </div>
  );
}
