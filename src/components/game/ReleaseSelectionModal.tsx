'use client';

import { useState } from 'react';
import { Album, Song } from '@/engine/types';

interface ReleaseSelectionModalProps {
  albums: Album[];
  songs: Song[];
  onConfirm: (albumId: string) => void;
  onCancel: () => void;
}

export function ReleaseSelectionModal({
  albums,
  songs,
  onConfirm,
  onCancel,
}: ReleaseSelectionModalProps) {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);

  // Get unreleased albums
  const unreleasedAlbums = albums.filter(a => a.weekReleased === null);

  const handleConfirm = () => {
    if (selectedAlbumId) {
      onConfirm(selectedAlbumId);
    }
  };

  // Helper to get album type label
  const getAlbumType = (album: Album): { label: string; icon: string } => {
    const trackCount = album.songIds.length;
    if (trackCount === 1) return { label: 'Single', icon: '🎵' };
    if (trackCount <= 6) return { label: 'EP', icon: '💿' };
    return { label: 'Album', icon: '📀' };
  };

  // Helper to get average quality of songs on the album
  const getAlbumQuality = (album: Album): number => {
    const albumSongs = songs.filter(s => album.songIds.includes(s.id));
    if (albumSongs.length === 0) return 0;
    return Math.round(albumSongs.reduce((sum, s) => sum + s.quality, 0) / albumSongs.length);
  };

  // Helper to get quality label
  const getQualityLabel = (quality: number): string => {
    if (quality >= 90) return 'Exceptional';
    if (quality >= 75) return 'Great';
    if (quality >= 60) return 'Solid';
    if (quality >= 40) return 'Decent';
    if (quality >= 25) return 'Rough';
    return 'Rough';
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-lg w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="text-4xl mb-2">📢</div>
          <h2 className="text-xl font-bold text-white mb-1">Release Your Music</h2>
          <p className="text-gray-400 text-sm">
            Choose a recording to drop on streaming platforms
          </p>
        </div>

        {/* Album List */}
        <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
          {unreleasedAlbums.map((album) => {
            const { label, icon } = getAlbumType(album);
            const quality = getAlbumQuality(album);
            const isSelected = selectedAlbumId === album.id;

            return (
              <button
                key={album.id}
                onClick={() => setSelectedAlbumId(album.id)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-yellow-900/30 border-yellow-600 ring-2 ring-yellow-500/50'
                    : 'bg-gray-800 border-gray-600 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{icon}</span>
                  <div className="flex-1">
                    <div className="text-white font-semibold">{album.title}</div>
                    <div className="text-gray-400 text-sm">
                      {label} • {album.songIds.length} track{album.songIds.length > 1 ? 's' : ''} • {getQualityLabel(quality)} quality
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      Production: {album.productionValue}%
                    </div>
                  </div>
                </div>
              </button>
            );
          })}

          {unreleasedAlbums.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No recordings ready to release.
              <br />
              <span className="text-sm">Record some music first!</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedAlbumId}
            className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-600
                       disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
          >
            Release It!
          </button>
        </div>
      </div>
    </div>
  );
}
