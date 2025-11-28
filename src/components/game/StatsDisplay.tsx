'use client';

import { Player } from '@/engine/types';

interface StatsDisplayProps {
  player: Player;
  week: number;
  year: number;
}

/**
 * Convert numeric stat to descriptive text for hidden/semi-hidden stats
 */
function getStatDescription(value: number): string {
  if (value >= 80) return 'Very High';
  if (value >= 60) return 'High';
  if (value >= 40) return 'Medium';
  if (value >= 20) return 'Low';
  return 'Very Low';
}

/**
 * Get color class based on stat value and whether high is good
 */
function getStatColor(value: number, highIsGood: boolean = true): string {
  const isGood = highIsGood ? value >= 50 : value <= 50;
  const isCritical = highIsGood ? value <= 20 : value >= 80;

  if (isCritical) return 'text-red-400';
  if (isGood) return 'text-green-400';
  return 'text-yellow-400';
}

function StatBar({ label, value, max = 100, showNumber = true, highIsGood = true }: {
  label: string;
  value: number;
  max?: number;
  showNumber?: boolean;
  highIsGood?: boolean;
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const colorClass = getStatColor(value, highIsGood);

  return (
    <div className="mb-2">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-300">{label}</span>
        <span className={colorClass}>
          {showNumber ? value : getStatDescription(value)}
        </span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            highIsGood
              ? value >= 50 ? 'bg-green-500' : value >= 20 ? 'bg-yellow-500' : 'bg-red-500'
              : value <= 50 ? 'bg-green-500' : value <= 80 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function MoneyDisplay({ value }: { value: number }) {
  const isNegative = value < 0;
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Math.abs(value));

  return (
    <div className="mb-4 p-3 bg-gray-800 rounded-lg">
      <div className="text-sm text-gray-400 mb-1">Money</div>
      <div className={`text-2xl font-bold ${isNegative ? 'text-red-400' : 'text-green-400'}`}>
        {isNegative ? `-${formatted}` : formatted}
      </div>
    </div>
  );
}

function formatNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
}

function AudienceDisplay({ coreFans, casualListeners }: { coreFans: number; casualListeners: number }) {
  const totalFans = coreFans + casualListeners;

  return (
    <div className="mb-4 p-3 bg-gray-800 rounded-lg">
      <div className="text-sm text-gray-400 mb-1">Audience</div>
      <div className="text-2xl font-bold text-purple-400">{formatNumber(totalFans)}</div>
      <div className="mt-1 text-xs space-y-0.5">
        <div className="flex justify-between">
          <span className="text-gray-500">Core Fans</span>
          <span className="text-purple-300">{formatNumber(coreFans)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Casual</span>
          <span className="text-purple-300">{formatNumber(casualListeners)}</span>
        </div>
      </div>
    </div>
  );
}

function FollowersDisplay({ value }: { value: number }) {
  return (
    <div className="mb-4 p-3 bg-gray-800 rounded-lg">
      <div className="text-sm text-gray-400 mb-1">Followers</div>
      <div className="text-2xl font-bold text-blue-400">{formatNumber(value)}</div>
    </div>
  );
}

export function StatsDisplay({ player, week, year }: StatsDisplayProps) {
  const weekInYear = ((week - 1) % 52) + 1;

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
      {/* Time Display */}
      <div className="mb-4 pb-4 border-b border-gray-700">
        <div className="text-lg font-bold text-white">
          Year {year}, Week {weekInYear}
        </div>
        <div className="text-sm text-gray-400">
          Total weeks: {week} / 520
        </div>
      </div>

      {/* Player Name & Talent */}
      <div className="mb-4 pb-4 border-b border-gray-700">
        <div className="text-xl font-bold text-white">{player.name}</div>
        <div className="text-sm text-gray-400">Talent: {player.talent}</div>
      </div>

      {/* Money & Audience */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <MoneyDisplay value={player.money} />
        <AudienceDisplay coreFans={player.coreFans} casualListeners={player.casualListeners} />
      </div>

      {/* Digital/Social Stats */}
      <div className="mb-4 pb-4 border-b border-gray-700">
        <div className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
          Digital Presence
        </div>
        <div className="mb-2">
          <FollowersDisplay value={player.followers} />
        </div>
        <StatBar label="Algo Boost" value={player.algoBoost} />
        <StatBar label="Catalogue Power" value={player.cataloguePower} />
      </div>

      {/* Visible Stats */}
      <div className="mb-4 pb-4 border-b border-gray-700">
        <div className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
          Stats
        </div>
        <StatBar label="Skill" value={player.skill} />
        <StatBar label="Image" value={player.image} />
        <StatBar label="Hype" value={player.hype} />
        <StatBar label="Cred" value={player.cred} />
      </div>

      {/* Health & Wellbeing */}
      <div className="mb-4 pb-4 border-b border-gray-700">
        <div className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
          Wellbeing
        </div>
        <StatBar label="Health" value={player.health} />
        <StatBar label="Stability" value={player.stability} />
        <StatBar label="Burnout" value={player.burnout} highIsGood={false} />
      </div>

      {/* Hidden Stats (shown as descriptive) */}
      <div>
        <div className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
          Lifestyle
        </div>
        <StatBar label="Addiction" value={player.addiction} showNumber={false} highIsGood={false} />
        <StatBar label="Industry Rep" value={player.industryGoodwill} showNumber={false} />
      </div>
    </div>
  );
}
