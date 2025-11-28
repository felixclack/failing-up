'use client';

import { Bandmate, BandmateRole } from '@/engine/types';
import {
  getRoleDisplayName,
  getStatusDisplay,
  LOYALTY_QUIT_THRESHOLD,
  LOYALTY_ULTIMATUM_THRESHOLD,
} from '@/engine/band';

interface BandDisplayProps {
  bandmates: Bandmate[];
  onFireBandmate?: (bandmateId: string) => void;
}

/**
 * Get color for loyalty indicator
 */
function getLoyaltyColor(loyalty: number): string {
  if (loyalty <= LOYALTY_QUIT_THRESHOLD) return 'text-red-400';
  if (loyalty <= LOYALTY_ULTIMATUM_THRESHOLD) return 'text-yellow-400';
  return 'text-green-400';
}

/**
 * Get loyalty status text
 */
function getLoyaltyStatus(loyalty: number): string {
  if (loyalty <= LOYALTY_QUIT_THRESHOLD) return 'About to quit!';
  if (loyalty <= LOYALTY_ULTIMATUM_THRESHOLD) return 'Unhappy';
  if (loyalty >= 70) return 'Loyal';
  return 'Content';
}

/**
 * Get vice warning if high
 */
function getViceWarning(vice: number): string | null {
  if (vice >= 80) return 'Dangerous habits!';
  if (vice >= 60) return 'Party animal';
  return null;
}

/**
 * Get reliability warning if low
 */
function getReliabilityWarning(reliability: number): string | null {
  if (reliability <= 30) return 'Unreliable';
  return null;
}

/**
 * Get role icon
 */
function getRoleIcon(role: BandmateRole): string {
  const icons: Record<BandmateRole, string> = {
    guitar: '🎸',
    bass: '🎸',
    drums: '🥁',
    keys: '🎹',
    vocals: '🎤',
  };
  return icons[role];
}

function BandmateCard({ bandmate, onFire }: { bandmate: Bandmate; onFire?: () => void }) {
  const isActive = bandmate.status === 'active';
  const loyaltyColor = getLoyaltyColor(bandmate.loyalty);
  const viceWarning = getViceWarning(bandmate.vice);
  const reliabilityWarning = getReliabilityWarning(bandmate.reliability);

  return (
    <div
      className={`p-3 rounded-lg border ${
        isActive
          ? 'bg-gray-800 border-gray-600'
          : 'bg-gray-900 border-gray-700 opacity-60'
      }`}
    >
      {/* Header: Name and Role */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getRoleIcon(bandmate.role)}</span>
          <div>
            <div className="font-semibold text-white text-sm">{bandmate.name}</div>
            <div className="text-xs text-gray-400">{getRoleDisplayName(bandmate.role)}</div>
          </div>
        </div>
        {!isActive && (
          <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-400">
            {getStatusDisplay(bandmate.status)}
          </span>
        )}
      </div>

      {isActive && (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2 text-xs mb-2">
            <div>
              <span className="text-gray-500">Talent</span>
              <div className="text-white font-medium">{bandmate.talent}</div>
            </div>
            <div>
              <span className="text-gray-500">Reliability</span>
              <div className={reliabilityWarning ? 'text-yellow-400' : 'text-white'}>
                {bandmate.reliability}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Loyalty</span>
              <div className={loyaltyColor}>{bandmate.loyalty}</div>
            </div>
          </div>

          {/* Status/Warnings Row */}
          <div className="flex flex-wrap gap-1 mb-2">
            <span className={`text-xs px-2 py-0.5 rounded ${loyaltyColor} bg-gray-700/50`}>
              {getLoyaltyStatus(bandmate.loyalty)}
            </span>
            {viceWarning && (
              <span className="text-xs px-2 py-0.5 rounded text-orange-400 bg-gray-700/50">
                {viceWarning}
              </span>
            )}
            {reliabilityWarning && (
              <span className="text-xs px-2 py-0.5 rounded text-yellow-400 bg-gray-700/50">
                {reliabilityWarning}
              </span>
            )}
          </div>

          {/* Fire Button */}
          {onFire && (
            <button
              onClick={onFire}
              className="w-full text-xs py-1 px-2 rounded bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900/50 transition-colors"
            >
              Fire
            </button>
          )}
        </>
      )}
    </div>
  );
}

export function BandDisplay({ bandmates, onFireBandmate }: BandDisplayProps) {
  const activeBandmates = bandmates.filter((b) => b.status === 'active');
  const inactiveBandmates = bandmates.filter((b) => b.status !== 'active');

  if (bandmates.length === 0) {
    return (
      <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 mt-4">
        <div className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
          Your Band
        </div>
        <div className="text-gray-500 text-sm text-center py-4">
          You're flying solo right now.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 mt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
          Your Band
        </div>
        <div className="text-xs text-gray-500">
          {activeBandmates.length} active
        </div>
      </div>

      {/* Active Members */}
      <div className="space-y-2">
        {activeBandmates.map((bandmate) => (
          <BandmateCard
            key={bandmate.id}
            bandmate={bandmate}
            onFire={onFireBandmate ? () => onFireBandmate(bandmate.id) : undefined}
          />
        ))}
      </div>

      {/* Inactive Members (collapsed) */}
      {inactiveBandmates.length > 0 && (
        <details className="mt-3">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
            Former members ({inactiveBandmates.length})
          </summary>
          <div className="mt-2 space-y-2">
            {inactiveBandmates.map((bandmate) => (
              <BandmateCard key={bandmate.id} bandmate={bandmate} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
