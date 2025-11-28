'use client';

import { GameState } from '@/engine/types';
import {
  getEndingResult,
  getEndingColor,
  getEndingIcon,
  EndingCallback,
} from '@/engine/endings';
import { getTotalFans } from '@/engine/state';

interface EndingScreenProps {
  gameState: GameState;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

function StatSummary({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-700/50 last:border-b-0">
      <span className="text-gray-400">{label}</span>
      <span className={`font-semibold ${highlight ? 'text-yellow-400' : 'text-white'}`}>{value}</span>
    </div>
  );
}

function CallbackCard({ callback }: { callback: EndingCallback }) {
  const iconMap = {
    arc: '📖',
    event: '⚡',
    achievement: '🏆',
    stat: '📊',
  };

  return (
    <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
      <span className="text-xl">{iconMap[callback.type]}</span>
      <p className="text-gray-300 text-sm leading-relaxed">{callback.text}</p>
    </div>
  );
}

export function EndingScreen({ gameState, onPlayAgain, onNewGame }: EndingScreenProps) {
  const { player, week, songs, albums, bandmates, labelDeals, completedArcIds } = gameState;
  const years = Math.floor(week / 52);
  const weeks = week % 52;

  // Get the full ending result
  const ending = getEndingResult(gameState);
  const endingColor = getEndingColor(ending.id);
  const endingIcon = getEndingIcon(ending.id);

  // Format stats
  const totalFans = getTotalFans(player);
  const fansFormatted = totalFans >= 1000000
    ? `${(totalFans / 1000000).toFixed(1)}M`
    : totalFans >= 1000
      ? `${(totalFans / 1000).toFixed(1)}K`
      : totalFans.toString();

  const moneyFormatted = player.money >= 0
    ? `$${player.money.toLocaleString()}`
    : `-$${Math.abs(player.money).toLocaleString()}`;

  // Count achievements
  const platinumAlbums = albums.filter(a => a.salesTier === 'platinum' || a.salesTier === 'diamond').length;
  const activeBandmates = bandmates.filter(b => b.status === 'active').length;
  const deadBandmates = bandmates.filter(b => b.status === 'dead').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        {/* Title Section */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{endingIcon}</div>
          <h1 className={`text-5xl font-bold ${endingColor} mb-2`}>
            {ending.title}
          </h1>
          <p className="text-xl text-gray-400 italic">
            {ending.subtitle}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            The story of {player.name}
          </p>
        </div>

        {/* Main Narrative */}
        <div className="bg-gray-900/80 p-8 rounded-xl border border-gray-700/50 mb-6 backdrop-blur">
          <p className="text-xl text-gray-200 leading-relaxed text-center">
            {ending.narrative}
          </p>
        </div>

        {/* Callbacks - Your Story */}
        {ending.callbacks.length > 0 && (
          <div className="bg-gray-900/80 p-6 rounded-xl border border-gray-700/50 mb-6 backdrop-blur">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>📜</span> Your Story
            </h2>
            <div className="space-y-3">
              {ending.callbacks.map((callback, index) => (
                <CallbackCard key={index} callback={callback} />
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Career Stats */}
          <div className="bg-gray-900/80 p-5 rounded-xl border border-gray-700/50 backdrop-blur">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span>📊</span> Career Stats
            </h2>
            <StatSummary label="Career Length" value={`${years}y ${weeks}w`} />
            <StatSummary label="Peak Fans" value={fansFormatted} highlight={totalFans >= 100000} />
            <StatSummary label="Final Balance" value={moneyFormatted} highlight={player.money >= 50000} />
            <StatSummary label="Street Cred" value={`${player.cred}/100`} highlight={player.cred >= 70} />
            <StatSummary label="Industry Rep" value={`${player.industryGoodwill}/100`} />
          </div>

          {/* Creative Output */}
          <div className="bg-gray-900/80 p-5 rounded-xl border border-gray-700/50 backdrop-blur">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span>🎵</span> Creative Output
            </h2>
            <StatSummary label="Songs Written" value={songs.length} />
            <StatSummary label="Albums Released" value={albums.length} />
            <StatSummary label="Platinum Albums" value={platinumAlbums} highlight={platinumAlbums > 0} />
            <StatSummary label="Label Deals" value={labelDeals.length} />
            <StatSummary label="Arcs Completed" value={completedArcIds.length} />
          </div>
        </div>

        {/* Band & Health */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Band Status */}
          <div className="bg-gray-900/80 p-5 rounded-xl border border-gray-700/50 backdrop-blur">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span>🎸</span> The Band
            </h2>
            <StatSummary label="Active Members" value={activeBandmates} />
            <StatSummary label="Total Bandmates" value={bandmates.length} />
            {deadBandmates > 0 && (
              <StatSummary label="Fallen Comrades" value={deadBandmates} />
            )}
          </div>

          {/* Personal State */}
          <div className="bg-gray-900/80 p-5 rounded-xl border border-gray-700/50 backdrop-blur">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span>💊</span> Final State
            </h2>
            <StatSummary label="Health" value={`${player.health}/100`} highlight={player.health >= 70} />
            <StatSummary label="Stability" value={`${player.stability}/100`} highlight={player.stability >= 70} />
            <StatSummary label="Addiction Level" value={`${player.addiction}/100`} />
            <StatSummary label="Burnout" value={`${player.burnout}/100`} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onPlayAgain}
            className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105"
          >
            Play Again
          </button>
          <button
            onClick={onNewGame}
            className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-red-900/30"
          >
            New Character
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          Failing Up: A Rock Star Story
        </div>
      </div>
    </div>
  );
}
