'use client';

import { Player } from '@/engine/types';
import { getTotalFans } from '@/engine/state';

interface MobileStatsProps {
  player: Player;
}

function StatRow({ label, value, max = 100, color = 'bg-blue-500' }: {
  label: string;
  value: number;
  max?: number;
  color?: string;
}) {
  const percentage = Math.min(100, (value / max) * 100);

  return (
    <div className="flex items-center gap-2 py-1">
      <span className="text-gray-400 text-xs w-20">{label}</span>
      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-gray-300 text-xs w-8 text-right">{value}</span>
    </div>
  );
}

export function MobileStats({ player }: MobileStatsProps) {
  const totalFans = getTotalFans(player);

  return (
    <div className="p-3 space-y-3">
      {/* Core Stats */}
      <div>
        <div className="text-xs text-gray-500 uppercase mb-1">Core</div>
        <StatRow label="Talent" value={player.talent} color="bg-purple-500" />
        <StatRow label="Skill" value={player.skill} color="bg-blue-500" />
        <StatRow label="Image" value={player.image} color="bg-pink-500" />
        <StatRow label="Cred" value={player.cred} color="bg-amber-500" />
      </div>

      {/* Health & Wellbeing */}
      <div>
        <div className="text-xs text-gray-500 uppercase mb-1">Wellbeing</div>
        <StatRow
          label="Health"
          value={player.health}
          color={player.health >= 60 ? 'bg-green-500' : player.health >= 30 ? 'bg-yellow-500' : 'bg-red-500'}
        />
        <StatRow
          label="Stability"
          value={player.stability}
          color={player.stability >= 50 ? 'bg-green-500' : 'bg-yellow-500'}
        />
        <StatRow
          label="Burnout"
          value={player.burnout}
          color={player.burnout <= 30 ? 'bg-green-500' : player.burnout <= 60 ? 'bg-yellow-500' : 'bg-red-500'}
        />
        <StatRow
          label="Addiction"
          value={player.addiction}
          color={player.addiction <= 20 ? 'bg-green-500' : player.addiction <= 50 ? 'bg-yellow-500' : 'bg-red-500'}
        />
      </div>

      {/* Audience */}
      <div>
        <div className="text-xs text-gray-500 uppercase mb-1">Audience</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-800 rounded p-2">
            <div className="text-gray-400">Total Fans</div>
            <div className="text-white font-bold">{totalFans.toLocaleString()}</div>
          </div>
          <div className="bg-gray-800 rounded p-2">
            <div className="text-gray-400">Core Fans</div>
            <div className="text-green-400 font-bold">{player.coreFans.toLocaleString()}</div>
          </div>
          <div className="bg-gray-800 rounded p-2">
            <div className="text-gray-400">Casual</div>
            <div className="text-blue-400 font-bold">{player.casualListeners.toLocaleString()}</div>
          </div>
          <div className="bg-gray-800 rounded p-2">
            <div className="text-gray-400">Followers</div>
            <div className="text-purple-400 font-bold">{player.followers.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Digital */}
      <div>
        <div className="text-xs text-gray-500 uppercase mb-1">Digital</div>
        <StatRow label="Algo Boost" value={player.algoBoost} color="bg-cyan-500" />
        <StatRow label="Catalogue" value={player.cataloguePower} color="bg-indigo-500" />
      </div>

      {/* Money */}
      <div className="bg-gray-800 rounded p-2 text-center">
        <div className="text-gray-400 text-xs">Cash</div>
        <div className={`font-bold text-lg ${player.money >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          ${player.money.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
