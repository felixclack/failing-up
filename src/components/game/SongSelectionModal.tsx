'use client';

import { useState, useMemo } from 'react';
import { Song, ActionId } from '@/engine/types';

interface SongSelectionModalProps {
  songs: Song[];
  recordAction: ActionId;
  onConfirm: (selectedSongIds: string[]) => void;
  onCancel: () => void;
}

function getQualityLabel(quality: number): string {
  if (quality >= 90) return 'Exceptional';
  if (quality >= 75) return 'Great';
  if (quality >= 60) return 'Solid';
  if (quality >= 40) return 'Decent';
  if (quality >= 25) return 'Rough';
  return 'Terrible';
}

function getQualityColor(quality: number): string {
  if (quality >= 90) return 'text-purple-400';
  if (quality >= 75) return 'text-green-400';
  if (quality >= 60) return 'text-blue-400';
  if (quality >= 40) return 'text-yellow-400';
  if (quality >= 25) return 'text-orange-400';
  return 'text-red-400';
}

function getHitPotentialLabel(hitPotential: number): string {
  if (hitPotential >= 80) return '🔥 Hit potential';
  if (hitPotential >= 60) return '✨ Strong';
  if (hitPotential >= 40) return '👍 Decent';
  if (hitPotential >= 20) return '🤷 Uncertain';
  return '😬 Risky';
}

export function SongSelectionModal({
  songs,
  recordAction,
  onConfirm,
  onCancel,
}: SongSelectionModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Determine requirements based on action
  const config = useMemo(() => {
    switch (recordAction) {
      case 'RECORD_SINGLE':
        return { min: 1, max: 1, label: 'Single', icon: '🎵', duration: '1 week' };
      case 'RECORD_EP':
        return { min: 3, max: 5, label: 'EP', icon: '💿', duration: '2 weeks' };
      case 'RECORD_ALBUM':
        return { min: 8, max: 12, label: 'Album', icon: '📀', duration: '4 weeks' };
      default:
        return { min: 1, max: 1, label: 'Single', icon: '🎵', duration: '1 week' };
    }
  }, [recordAction]);

  // Sort songs by quality descending
  const sortedSongs = useMemo(() => {
    return [...songs].sort((a, b) => b.quality - a.quality);
  }, [songs]);

  const toggleSong = (songId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(songId)) {
      newSelected.delete(songId);
    } else if (newSelected.size < config.max) {
      newSelected.add(songId);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    const newSelected = new Set<string>();
    sortedSongs.slice(0, config.max).forEach(s => newSelected.add(s.id));
    setSelectedIds(newSelected);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const canConfirm = selectedIds.size >= config.min && selectedIds.size <= config.max;

  // Calculate average quality of selection
  const avgQuality = useMemo(() => {
    if (selectedIds.size === 0) return 0;
    const selectedSongs = songs.filter(s => selectedIds.has(s.id));
    return Math.round(selectedSongs.reduce((sum, s) => sum + s.quality, 0) / selectedSongs.length);
  }, [selectedIds, songs]);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-amber-600/50 rounded-lg max-w-lg w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <h2 className="text-lg font-bold text-white">Record {config.label}</h2>
              <p className="text-gray-400 text-sm">{config.duration} in the studio</p>
            </div>
          </div>
          <p className="text-sm text-gray-400">
            Select {config.min === config.max ? config.min : `${config.min}-${config.max}`} song{config.max !== 1 ? 's' : ''} to record
          </p>
        </div>

        {/* Song List */}
        <div className="flex-1 overflow-y-auto p-2">
          {sortedSongs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No unreleased songs available. Write some songs first!
            </div>
          ) : (
            <div className="space-y-1">
              {sortedSongs.map((song) => {
                const isSelected = selectedIds.has(song.id);
                const isDisabled = !isSelected && selectedIds.size >= config.max;

                return (
                  <button
                    key={song.id}
                    onClick={() => toggleSong(song.id)}
                    disabled={isDisabled}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-amber-900/40 border-amber-500'
                        : isDisabled
                        ? 'bg-gray-800/50 border-gray-700 opacity-50 cursor-not-allowed'
                        : 'bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs ${
                            isSelected ? 'bg-amber-500 border-amber-500 text-black' : 'border-gray-500'
                          }`}>
                            {isSelected && '✓'}
                          </span>
                          <span className="font-medium text-white truncate">
                            "{song.title}"
                          </span>
                        </div>
                        <div className="ml-7 mt-1 flex flex-wrap gap-2 text-xs">
                          <span className={getQualityColor(song.quality)}>
                            {getQualityLabel(song.quality)}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-400 capitalize">{song.style}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-400">
                            {getHitPotentialLabel(song.hitPotential)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getQualityColor(song.quality)}`}>
                          {song.quality}
                        </div>
                        <div className="text-xs text-gray-500">quality</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selection summary */}
        <div className="p-3 border-t border-gray-800 bg-gray-800/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              Selected: {selectedIds.size}/{config.max}
            </span>
            <div className="flex gap-2">
              {config.max > 1 && (
                <>
                  <button
                    onClick={selectAll}
                    className="text-xs text-amber-400 hover:text-amber-300"
                  >
                    Select best
                  </button>
                  <span className="text-gray-600">|</span>
                </>
              )}
              <button
                onClick={clearSelection}
                className="text-xs text-gray-400 hover:text-gray-300"
              >
                Clear
              </button>
            </div>
          </div>
          {selectedIds.size > 0 && (
            <div className="text-sm">
              <span className="text-gray-400">Average quality: </span>
              <span className={getQualityColor(avgQuality)}>{avgQuality}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-800 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(Array.from(selectedIds))}
            disabled={!canConfirm}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              canConfirm
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {canConfirm
              ? `Record ${config.label}`
              : `Select ${config.min - selectedIds.size} more`}
          </button>
        </div>
      </div>
    </div>
  );
}
