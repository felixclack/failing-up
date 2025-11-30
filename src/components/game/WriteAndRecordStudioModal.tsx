'use client';

import { StudioQuality } from '@/engine/types';
import { STUDIO_OPTIONS } from '@/hooks/useGame';

interface WriteAndRecordStudioModalProps {
  playerMoney: number;
  onSelectStudio: (quality: StudioQuality) => void;
  onCancel: () => void;
}

const WRITE_AND_RECORD_WEEKS = 8;
const SONGS_TO_WRITE = 10;

export function WriteAndRecordStudioModal({
  playerMoney,
  onSelectStudio,
  onCancel,
}: WriteAndRecordStudioModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-lg w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="text-4xl mb-2">🎹</div>
          <div className="text-xs text-yellow-400 uppercase tracking-wide mb-2">
            Write & Record Session
          </div>
          <h2 className="text-xl font-bold text-white">
            Choose Your Studio
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            {WRITE_AND_RECORD_WEEKS} weeks to write and record {SONGS_TO_WRITE} tracks
          </p>
          <p className="text-xs text-gray-500 mt-1">
            An intensive session where you create an album from scratch
          </p>
        </div>

        {/* Studio Options */}
        <div className="space-y-3 mb-6">
          {STUDIO_OPTIONS.map((option) => {
            const totalCost = option.costPerWeek * WRITE_AND_RECORD_WEEKS;
            const canAfford = playerMoney >= totalCost;

            return (
              <button
                key={option.id}
                onClick={() => onSelectStudio(option.id)}
                disabled={!canAfford}
                className={`
                  w-full p-4 rounded-lg border-2 text-left transition-all
                  ${canAfford
                    ? 'border-gray-600 hover:border-yellow-500/50 hover:bg-gray-800/50'
                    : 'border-gray-800 opacity-50 cursor-not-allowed'
                  }
                `}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-white">{option.label}</div>
                    <div className="text-sm text-gray-400 mt-1">{option.description}</div>
                  </div>
                  <div className="text-right">
                    {option.costPerWeek === 0 ? (
                      <div className="text-green-400 font-medium">Free</div>
                    ) : (
                      <div className="text-yellow-400 font-medium">${totalCost}</div>
                    )}
                    <div className="text-xs text-gray-500">
                      {option.costPerWeek > 0 && `$${option.costPerWeek}/week`}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="text-xs text-gray-500">Quality:</div>
                  <div className="flex-1 bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${50 + option.qualityBonus}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400">+{option.qualityBonus}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Cancel Button */}
        <div className="flex justify-center">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
