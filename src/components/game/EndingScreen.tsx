'use client';

import { GameState, GameOverReason } from '@/engine/types';

interface EndingScreenProps {
  gameState: GameState;
  onRestart: () => void;
}

function getEndingTitle(reason: GameOverReason): string {
  switch (reason) {
    case 'death':
      return 'Gone Too Soon';
    case 'broke':
      return 'Broke & Blacklisted';
    case 'blacklisted':
      return 'Industry Exile';
    case 'time_limit':
      return 'The End of an Era';
    case 'band_collapsed':
      return 'The Band Falls Apart';
    case 'voluntary_retirement':
      return 'Walking Away';
    default:
      return 'Game Over';
  }
}

function getEndingDescription(gameState: GameState): string {
  const { player, gameOverReason, week } = gameState;
  const years = Math.floor(week / 52);

  switch (gameOverReason) {
    case 'death':
      if (player.addiction >= 70) {
        return `After ${years} years in the scene, the lifestyle finally caught up with ${player.name}. Another cautionary tale in the annals of rock history.`;
      }
      return `${player.name}'s body gave out after ${years} years of pushing too hard. The music world mourns.`;

    case 'broke':
      return `With debts mounting and no one willing to take a chance, ${player.name} fades into obscurity. Sometimes the music business chews you up and spits you out.`;

    case 'time_limit':
      if (player.fans >= 100000) {
        return `After a decade in the business, ${player.name} has built something real. ${player.fans.toLocaleString()} fans can't be wrong.`;
      }
      if (player.fans >= 10000) {
        return `Ten years of grinding. ${player.name} never made it big, but there's a loyal following who remember the good times.`;
      }
      return `A decade passes. ${player.name} gave it a shot, but the big break never came. Time to find a new dream.`;

    case 'band_collapsed':
      return `Without a band, there's no show. ${player.name} watches the last member walk out the door, wondering what went wrong.`;

    default:
      return `${player.name}'s story comes to an end.`;
  }
}

function StatSummary({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-700">
      <span className="text-gray-400">{label}</span>
      <span className="text-white font-semibold">{value}</span>
    </div>
  );
}

export function EndingScreen({ gameState, onRestart }: EndingScreenProps) {
  const { player, week, gameOverReason, songs, albums } = gameState;
  const years = Math.floor(week / 52);
  const weeks = week % 52;

  const fansFormatted = player.fans >= 1000000
    ? `${(player.fans / 1000000).toFixed(1)}M`
    : player.fans >= 1000
      ? `${(player.fans / 1000).toFixed(1)}K`
      : player.fans.toString();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-500 mb-2">
            {getEndingTitle(gameOverReason!)}
          </h1>
          <p className="text-xl text-gray-400">
            The story of {player.name}
          </p>
        </div>

        {/* Narrative */}
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 mb-6">
          <p className="text-lg text-gray-200 leading-relaxed">
            {getEndingDescription(gameState)}
          </p>
        </div>

        {/* Stats Summary */}
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">Career Summary</h2>
          <StatSummary label="Career Length" value={`${years} years, ${weeks} weeks`} />
          <StatSummary label="Peak Fans" value={fansFormatted} />
          <StatSummary label="Final Balance" value={`$${player.money.toLocaleString()}`} />
          <StatSummary label="Songs Written" value={songs.length} />
          <StatSummary label="Albums Released" value={albums.filter(a => a.weekReleased).length} />
          <StatSummary label="Final Cred" value={player.cred} />
          <StatSummary label="Cause of End" value={gameOverReason?.replace('_', ' ') || 'Unknown'} />
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onRestart}
            className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
