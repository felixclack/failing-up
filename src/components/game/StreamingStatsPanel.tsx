'use client';

import { Player, Song, Album, ChartEntry, ChartType } from '@/engine/types';
import { formatNumber } from '@/engine/streaming';

interface StreamingStatsPanelProps {
  player: Player;
  songs: Song[];
  albums: Album[];
  currentWeek: number;
}

function PlatformIcon({ platform }: { platform: 'spotify' | 'youtube' | 'tiktok' | 'instagram' }) {
  switch (platform) {
    case 'spotify':
      return <span className="text-green-400">●</span>;
    case 'youtube':
      return <span className="text-red-400">▶</span>;
    case 'tiktok':
      return <span className="text-pink-400">♪</span>;
    case 'instagram':
      return <span className="text-purple-400">📷</span>;
    default:
      return null;
  }
}

function ChartBadge({ position, chartType }: { position: number; chartType: ChartType }) {
  const chartLabels: Record<ChartType, string> = {
    uk_singles: 'UK',
    uk_albums: 'UK Albums',
    us_billboard: 'Billboard',
    global_viral: 'Viral',
  };

  const badgeColor = position <= 10 ? 'bg-yellow-500 text-black' :
                     position <= 40 ? 'bg-gray-300 text-black' :
                     'bg-gray-600 text-white';

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono ${badgeColor}`}>
      #{position} {chartLabels[chartType]}
    </span>
  );
}

function PlatformStatsRow({
  icon,
  label,
  primary,
  secondary,
  secondaryLabel,
}: {
  icon: React.ReactNode;
  label: string;
  primary: string;
  secondary?: string;
  secondaryLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-800 last:border-0">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-gray-300">{label}</span>
      </div>
      <div className="text-right">
        <div className="text-sm font-mono text-white">{primary}</div>
        {secondary && secondaryLabel && (
          <div className="text-xs text-gray-500">{secondaryLabel}: {secondary}</div>
        )}
      </div>
    </div>
  );
}

function getCurrentChartPosition(entries: ChartEntry[], currentWeek: number, chartType: ChartType): number | null {
  // Look for entry from last 2 weeks
  const recent = entries
    .filter(e => e.chartType === chartType && e.week >= currentWeek - 2)
    .sort((a, b) => b.week - a.week);
  return recent.length > 0 ? recent[0].position : null;
}

export function StreamingStatsPanel({ player, songs, albums, currentWeek }: StreamingStatsPanelProps) {
  const { platforms } = player;

  // Get released songs and their streaming stats
  const releasedSongs = songs.filter(s => s.isReleased);
  const totalLifetimeStreams = releasedSongs.reduce((sum, s) => sum + s.totalStreams, 0);

  // Get current charting songs
  const chartingSongs = releasedSongs.filter(s => {
    const recentChart = s.chartHistory.find(e => e.week >= currentWeek - 2);
    return recentChart && recentChart.position <= 100;
  });

  // Get charting albums
  const chartingAlbums = albums.filter(a => {
    const recentChart = a.chartHistory?.find(e => e.week >= currentWeek - 2);
    return recentChart && recentChart.position <= 100;
  });

  // Get best current chart positions
  const bestSongPosition = chartingSongs.length > 0
    ? Math.min(...chartingSongs.flatMap(s =>
        s.chartHistory
          .filter(e => e.week >= currentWeek - 2)
          .map(e => e.position)
      ))
    : null;

  const bestAlbumPosition = chartingAlbums.length > 0
    ? Math.min(...chartingAlbums.flatMap(a =>
        (a.chartHistory || [])
          .filter(e => e.week >= currentWeek - 2)
          .map(e => e.position)
      ))
    : null;

  // Find any viral songs on TikTok
  const viralSongs = releasedSongs.filter(s => s.platformStats.tiktok.trending);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      {/* Header */}
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
        Streaming & Charts
      </h3>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-700">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-400">Total Streams</div>
          <div className="text-xl font-mono text-green-400">{formatNumber(totalLifetimeStreams)}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-400">Monthly Listeners</div>
          <div className="text-xl font-mono text-green-400">{formatNumber(platforms.spotify.monthlyListeners)}</div>
        </div>
      </div>

      {/* Chart Positions */}
      {(bestSongPosition || bestAlbumPosition || chartingSongs.length > 0) && (
        <div className="mb-4 pb-4 border-b border-gray-700">
          <div className="text-xs text-gray-400 uppercase mb-2">Currently Charting</div>
          <div className="space-y-2">
            {bestSongPosition && bestSongPosition <= 40 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Best Single</span>
                <ChartBadge position={bestSongPosition} chartType="uk_singles" />
              </div>
            )}
            {bestAlbumPosition && bestAlbumPosition <= 40 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Best Album</span>
                <ChartBadge position={bestAlbumPosition} chartType="uk_albums" />
              </div>
            )}
            {chartingSongs.length > 0 && (
              <div className="text-xs text-gray-500">
                {chartingSongs.length} song{chartingSongs.length !== 1 ? 's' : ''} in Top 100
              </div>
            )}
          </div>
        </div>
      )}

      {/* Platform Breakdown */}
      <div className="space-y-1">
        <div className="text-xs text-gray-400 uppercase mb-2">Platform Stats</div>

        <PlatformStatsRow
          icon={<PlatformIcon platform="spotify" />}
          label="Spotify"
          primary={formatNumber(platforms.spotify.totalStreams)}
          secondary={formatNumber(platforms.spotify.followers)}
          secondaryLabel="Followers"
        />

        <PlatformStatsRow
          icon={<PlatformIcon platform="youtube" />}
          label="YouTube"
          primary={formatNumber(platforms.youtube.totalViews)}
          secondary={formatNumber(platforms.youtube.subscribers)}
          secondaryLabel="Subs"
        />

        <PlatformStatsRow
          icon={<PlatformIcon platform="tiktok" />}
          label="TikTok"
          primary={formatNumber(platforms.tiktok.followers)}
          secondary={platforms.tiktok.viralSounds > 0 ? `${platforms.tiktok.viralSounds}` : undefined}
          secondaryLabel={platforms.tiktok.viralSounds > 0 ? "Viral sounds" : undefined}
        />

        {platforms.instagram.followers > 0 && (
          <PlatformStatsRow
            icon={<PlatformIcon platform="instagram" />}
            label="Instagram"
            primary={formatNumber(platforms.instagram.followers)}
          />
        )}
      </div>

      {/* Viral Alert */}
      {viralSongs.length > 0 && (
        <div className="mt-4 p-2 bg-pink-900/30 border border-pink-500/50 rounded-lg">
          <div className="text-xs text-pink-300 font-medium">
            🔥 {viralSongs.length} song{viralSongs.length !== 1 ? 's' : ''} trending on TikTok!
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for mobile or sidebar
export function CompactStreamingStats({ player, songs }: { player: Player; songs: Song[] }) {
  const totalStreams = songs.filter(s => s.isReleased).reduce((sum, s) => sum + s.totalStreams, 0);
  const viralCount = songs.filter(s => s.platformStats?.tiktok?.trending).length;

  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="text-green-400">
        ● {formatNumber(totalStreams)} streams
      </span>
      <span className="text-green-400">
        {formatNumber(player.platforms.spotify.monthlyListeners)} listeners
      </span>
      {viralCount > 0 && (
        <span className="text-pink-400">
          🔥 {viralCount} viral
        </span>
      )}
    </div>
  );
}
