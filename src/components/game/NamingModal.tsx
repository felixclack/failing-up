'use client';

import { useState } from 'react';
import { PendingNaming } from '@/engine/types';

interface NamingModalProps {
  pending: PendingNaming;
  onConfirm: (customName: string | null) => void;
  onCancel: () => void;
}

export function NamingModal({ pending, onConfirm, onCancel }: NamingModalProps) {
  const [customName, setCustomName] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  // Don't render for studio selection - that's handled separately
  if (pending.type === 'studio-selection') {
    return null;
  }

  const isSong = pending.type === 'song';
  const typeLabel = isSong ? 'Song' : 'Album';
  const icon = isSong ? '🎵' : '💿';

  const handleConfirm = () => {
    if (useCustom && customName.trim()) {
      onConfirm(customName.trim());
    } else {
      onConfirm(null); // Use generated name
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (!useCustom || customName.trim())) {
      handleConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-lg w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="text-4xl mb-2">{icon}</div>
          <div className="text-xs text-yellow-400 uppercase tracking-wide mb-2">
            Name Your {typeLabel}
          </div>
          {isSong && pending.type === 'song' && (
            <p className="text-gray-400 text-sm">
              Quality: {getQualityLabel(pending.song.quality)} • Style: {pending.song.style}
            </p>
          )}
          {!isSong && pending.type === 'album' && (
            <p className="text-gray-400 text-sm">
              {pending.songIds.length} tracks
            </p>
          )}
        </div>

        {/* Generated Name Option */}
        <button
          onClick={() => setUseCustom(false)}
          className={`w-full text-left p-4 mb-3 rounded-lg border transition-all ${
            !useCustom
              ? 'bg-yellow-900/30 border-yellow-600 ring-2 ring-yellow-500/50'
              : 'bg-gray-800 border-gray-600 hover:bg-gray-700'
          }`}
        >
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
            Generated Name
          </div>
          <div className="text-xl font-bold text-white">
            "{pending.generatedTitle}"
          </div>
        </button>

        {/* Custom Name Option */}
        <div
          className={`w-full p-4 mb-6 rounded-lg border transition-all ${
            useCustom
              ? 'bg-yellow-900/30 border-yellow-600 ring-2 ring-yellow-500/50'
              : 'bg-gray-800 border-gray-600'
          }`}
        >
          <button
            onClick={() => setUseCustom(true)}
            className="w-full text-left mb-2"
          >
            <div className="text-xs text-gray-400 uppercase tracking-wide">
              Custom Name
            </div>
          </button>
          <input
            type="text"
            value={customName}
            onChange={(e) => {
              setCustomName(e.target.value);
              setUseCustom(true);
            }}
            onFocus={() => setUseCustom(true)}
            onKeyDown={handleKeyDown}
            placeholder={`Enter your ${typeLabel.toLowerCase()} title...`}
            className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white
                       placeholder-gray-500 focus:outline-none focus:border-yellow-500
                       focus:ring-1 focus:ring-yellow-500"
            maxLength={50}
          />
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
            disabled={useCustom && !customName.trim()}
            className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-600
                       disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
          >
            {isSong ? 'Save Song' : 'Record Album'}
          </button>
        </div>
      </div>
    </div>
  );
}

function getQualityLabel(quality: number): string {
  if (quality >= 90) return 'Exceptional';
  if (quality >= 75) return 'Great';
  if (quality >= 60) return 'Solid';
  if (quality >= 40) return 'Decent';
  if (quality >= 25) return 'Rough';
  return 'Terrible';
}
