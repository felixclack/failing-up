'use client';

import { Player } from '@/engine/types';
import { getTotalFans } from '@/engine/state';

interface MobileHeaderProps {
  player: Player;
  week: number;
  year: number;
  bandName: string;
}

export function MobileHeader({ player, week, year, bandName }: MobileHeaderProps) {
  const totalFans = getTotalFans(player);

  // Format large numbers
  const formatNumber = (n: number): string => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  // Health color
  const healthColor = player.health >= 60 ? 'text-green-400' :
                      player.health >= 30 ? 'text-yellow-400' : 'text-red-400';

  // Money color
  const moneyColor = player.money >= 500 ? 'text-green-400' :
                     player.money >= 0 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="sticky top-0 z-40 bg-gray-900 border-b border-gray-700 px-3 py-2">
      {/* Band name and week */}
      <div className="flex justify-between items-center mb-1">
        <span className="text-red-500 font-bold text-sm truncate max-w-[50%]">
          {bandName}
        </span>
        <span className="text-gray-400 text-sm">
          Week {week} • Year {year}
        </span>
      </div>

      {/* Key stats row */}
      <div className="flex justify-between items-center text-xs">
        <div className="flex gap-3">
          <span className={moneyColor}>
            💰 ${player.money.toLocaleString()}
          </span>
          <span className={healthColor}>
            ❤️ {player.health}%
          </span>
          <span className="text-purple-400">
            🔥 {player.hype}
          </span>
        </div>
        <div className="flex gap-3 text-gray-400">
          <span>👥 {formatNumber(totalFans)}</span>
          <span>📱 {formatNumber(player.followers)}</span>
        </div>
      </div>
    </div>
  );
}
