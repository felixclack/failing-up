'use client';

import { Player } from '@/engine/types';
import { getTotalFans } from '@/engine/state';

interface KeyStatsProps {
  player: Player;
  week: number;
  year: number;
  bandName: string;
}

function StatBar({
  label,
  value,
  max = 100,
  color,
  showValue = true,
}: {
  label: string;
  value: number;
  max?: number;
  color: string;
  showValue?: boolean;
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 w-16 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showValue && (
        <span className="text-xs text-gray-300 w-8 text-right">{Math.floor(value)}</span>
      )}
    </div>
  );
}

function MoneyDisplay({ money }: { money: number }) {
  const isNegative = money < 0;
  const formattedMoney = Math.abs(money).toLocaleString();

  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-400">Money</span>
      <span className={`text-sm font-mono ${isNegative ? 'text-red-400' : 'text-green-400'}`}>
        {isNegative ? '-' : ''}${formattedMoney}
      </span>
    </div>
  );
}

function FansDisplay({ coreFans, casualListeners }: { coreFans: number; casualListeners: number }) {
  const total = coreFans + casualListeners;
  const formattedTotal = total >= 1000 ? `${(total / 1000).toFixed(1)}K` : total.toString();

  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-400">Fans</span>
      <span className="text-sm font-mono text-purple-400">{formattedTotal}</span>
    </div>
  );
}

export function KeyStats({ player, week, year, bandName }: KeyStatsProps) {
  const totalFans = getTotalFans(player);

  // Determine health color based on value
  const healthColor = player.health <= 20 ? 'bg-red-500' :
                      player.health <= 40 ? 'bg-orange-500' :
                      'bg-green-500';

  // Determine stability color
  const stabilityColor = player.stability <= 20 ? 'bg-red-500' :
                         player.stability <= 40 ? 'bg-orange-500' :
                         'bg-blue-500';

  // Determine hype color
  const hypeColor = player.hype >= 60 ? 'bg-yellow-400' :
                    player.hype >= 30 ? 'bg-yellow-600' :
                    'bg-gray-500';

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      {/* Header with band name and time */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-700">
        <div>
          <h2 className="text-lg font-bold text-red-500">{bandName}</h2>
          <span className="text-xs text-gray-500">Year {year}, Week {((week - 1) % 52) + 1}</span>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400">Skill</div>
          <div className="text-sm font-mono text-cyan-400">{player.skill}</div>
        </div>
      </div>

      {/* Critical Stats */}
      <div className="space-y-3">
        {/* Money and Fans row */}
        <div className="grid grid-cols-2 gap-4">
          <MoneyDisplay money={player.money} />
          <FansDisplay coreFans={player.coreFans} casualListeners={player.casualListeners} />
        </div>

        {/* Health bar */}
        <StatBar
          label="Health"
          value={player.health}
          color={healthColor}
        />

        {/* Hype bar */}
        <StatBar
          label="Hype"
          value={player.hype}
          color={hypeColor}
        />

        {/* Stability bar */}
        <StatBar
          label="Stability"
          value={player.stability}
          color={stabilityColor}
        />

        {/* Warning indicators */}
        {player.addiction >= 30 && (
          <div className="flex items-center gap-2 text-xs">
            <span className={`${player.addiction >= 70 ? 'text-red-400' : 'text-orange-400'}`}>
              {player.addiction >= 70 ? '⚠️ Addiction Critical' :
               player.addiction >= 50 ? '⚠️ Addiction High' :
               '⚠️ Addiction Rising'}
            </span>
          </div>
        )}

        {player.burnout >= 50 && (
          <div className="flex items-center gap-2 text-xs text-orange-400">
            <span>{player.burnout >= 80 ? '🔥 Burnout Critical' : '🔥 Burning Out'}</span>
          </div>
        )}
      </div>

      {/* Secondary stats (collapsed) */}
      <details className="mt-3 pt-3 border-t border-gray-700">
        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
          More stats...
        </summary>
        <div className="mt-2 space-y-2">
          <StatBar label="Cred" value={player.cred} color="bg-purple-500" />
          <StatBar label="Image" value={player.image} color="bg-pink-500" />
          <StatBar label="Talent" value={player.talent} color="bg-cyan-500" />
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mt-2">
            <div>Followers: {player.followers.toLocaleString()}</div>
            <div>Algo Boost: {player.algoBoost}</div>
            <div>Industry: {player.industryGoodwill}</div>
            <div>Burnout: {player.burnout}</div>
          </div>
        </div>
      </details>
    </div>
  );
}

// Compact version for inline display
export function CompactStats({ player }: { player: Player }) {
  const totalFans = getTotalFans(player);
  const formattedFans = totalFans >= 1000 ? `${(totalFans / 1000).toFixed(1)}K` : totalFans.toString();

  return (
    <div className="flex items-center gap-4 text-xs">
      <span className={`${player.money < 0 ? 'text-red-400' : 'text-green-400'}`}>
        ${Math.abs(player.money).toLocaleString()}
      </span>
      <span className="text-purple-400">{formattedFans} fans</span>
      <span className={`${player.health <= 30 ? 'text-red-400' : 'text-gray-400'}`}>
        ❤️ {player.health}
      </span>
      <span className="text-yellow-400">🔥 {player.hype}</span>
    </div>
  );
}
