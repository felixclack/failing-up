'use client';

import { useState } from 'react';
import { SaveSlot } from '@/hooks/useGame';

interface SaveLoadModalProps {
  isOpen: boolean;
  mode: 'save' | 'load';
  saveSlots: SaveSlot[];
  currentBandName?: string;
  currentWeek?: number;
  currentYear?: number;
  onSave: (slotId?: string) => boolean;
  onLoad: (slotId?: string) => boolean;
  onDelete: (slotId: string) => void;
  onClose: () => void;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function SaveLoadModal({
  isOpen,
  mode,
  saveSlots,
  currentBandName,
  currentWeek,
  currentYear,
  onSave,
  onLoad,
  onDelete,
  onClose,
}: SaveLoadModalProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [showConfirmOverwrite, setShowConfirmOverwrite] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSave = (slotId: string) => {
    // Check if slot exists
    const existingSlot = saveSlots.find(s => s.id === slotId);
    if (existingSlot) {
      setSelectedSlot(slotId);
      setShowConfirmOverwrite(true);
      return;
    }

    doSave(slotId);
  };

  const doSave = (slotId: string) => {
    const success = onSave(slotId);
    if (success) {
      setMessage({ type: 'success', text: 'Game saved successfully!' });
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 1000);
    } else {
      setMessage({ type: 'error', text: 'Failed to save game.' });
    }
    setShowConfirmOverwrite(false);
  };

  const handleLoad = (slotId: string) => {
    const success = onLoad(slotId);
    if (success) {
      setMessage({ type: 'success', text: 'Game loaded!' });
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 500);
    } else {
      setMessage({ type: 'error', text: 'Failed to load game.' });
    }
  };

  const handleDelete = (slotId: string) => {
    onDelete(slotId);
    setShowConfirmDelete(null);
    setMessage({ type: 'success', text: 'Save deleted.' });
    setTimeout(() => setMessage(null), 2000);
  };

  // Generate slot IDs (1-5)
  const slotIds = ['1', '2', '3', '4', '5'];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-lg w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {mode === 'save' ? 'Save Game' : 'Load Game'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`px-4 py-2 ${message.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
            {message.text}
          </div>
        )}

        {/* Slots */}
        <div className="p-4 space-y-2 overflow-y-auto max-h-96">
          {slotIds.map(slotId => {
            const slot = saveSlots.find(s => s.id === slotId);
            const isEmpty = !slot;

            return (
              <div
                key={slotId}
                className={`p-3 rounded-lg border ${
                  isEmpty
                    ? 'border-gray-700 bg-gray-800/50'
                    : 'border-gray-600 bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">Slot {slotId}</span>
                      {isEmpty && (
                        <span className="text-xs text-gray-500">(Empty)</span>
                      )}
                    </div>
                    {slot && (
                      <div className="mt-1">
                        <div className="text-white font-medium">{slot.bandName}</div>
                        <div className="text-xs text-gray-400">
                          Year {slot.year}, Week {((slot.week - 1) % 52) + 1} • {formatDate(slot.timestamp)}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {mode === 'save' ? (
                      <button
                        onClick={() => handleSave(slotId)}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm rounded transition-colors"
                      >
                        {isEmpty ? 'Save' : 'Overwrite'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleLoad(slotId)}
                        disabled={isEmpty}
                        className={`px-3 py-1.5 text-sm rounded transition-colors ${
                          isEmpty
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-500 text-white'
                        }`}
                      >
                        Load
                      </button>
                    )}

                    {slot && (
                      <button
                        onClick={() => setShowConfirmDelete(slotId)}
                        className="px-2 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {/* Confirm delete */}
                {showConfirmDelete === slotId && (
                  <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between">
                    <span className="text-sm text-red-400">Delete this save?</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(slotId)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-sm rounded"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={() => setShowConfirmDelete(null)}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Current game info (save mode only) */}
        {mode === 'save' && currentBandName && (
          <div className="p-4 border-t border-gray-700 bg-gray-800/50">
            <div className="text-xs text-gray-400">Currently Playing:</div>
            <div className="text-white">{currentBandName}</div>
            <div className="text-xs text-gray-400">
              Year {currentYear}, Week {currentWeek ? ((currentWeek - 1) % 52) + 1 : 1}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
          >
            Close
          </button>
        </div>

        {/* Confirm overwrite modal */}
        {showConfirmOverwrite && selectedSlot && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 max-w-sm mx-4">
              <h3 className="text-lg font-bold text-white mb-2">Overwrite Save?</h3>
              <p className="text-gray-300 mb-4">
                This will replace the existing save in Slot {selectedSlot}. This cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowConfirmOverwrite(false);
                    setSelectedSlot(null);
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => doSave(selectedSlot)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded"
                >
                  Overwrite
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
