'use client';

import { GigResult, GigOutcome } from '@/engine/types';
import { getVenueTypeDisplay } from '@/data/venues';

interface GigOutcomeModalProps {
  gigResult: GigResult;
  onContinue: () => void;
}

const OUTCOME_STYLES: Record<GigOutcome, { bg: string; border: string; emoji: string; label: string }> = {
  legendary: {
    bg: 'bg-yellow-900/30',
    border: 'border-yellow-500',
    emoji: '🌟',
    label: 'Legendary',
  },
  great: {
    bg: 'bg-green-900/30',
    border: 'border-green-500',
    emoji: '🎸',
    label: 'Great Show',
  },
  good: {
    bg: 'bg-blue-900/30',
    border: 'border-blue-500',
    emoji: '👍',
    label: 'Good Show',
  },
  decent: {
    bg: 'bg-gray-800',
    border: 'border-gray-600',
    emoji: '🤷',
    label: 'Decent',
  },
  poor: {
    bg: 'bg-orange-900/30',
    border: 'border-orange-500',
    emoji: '😬',
    label: 'Poor Show',
  },
  disaster: {
    bg: 'bg-red-900/30',
    border: 'border-red-500',
    emoji: '💀',
    label: 'Disaster',
  },
};

export function GigOutcomeModal({ gigResult, onContinue }: GigOutcomeModalProps) {
  const { gig, outcome, actualTurnout, performance, earnings, managerCut, fansGained, hypeChange, credChange, skillGain, headline, description } = gigResult;
  const style = OUTCOME_STYLES[outcome];

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
      <div className={`relative ${style.bg} border-2 ${style.border} rounded-lg max-w-lg w-full p-6 shadow-2xl`}>
        {/* Header */}
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">{style.emoji}</div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">
            {getVenueTypeDisplay(gig.venue.type)} • {gig.venue.city}
          </div>
          <div className="text-lg font-bold text-white mt-1">{gig.venue.name}</div>
          {gig.isSupport && gig.headlinerName && (
            <div className="text-sm text-gray-400 mt-1">
              Supporting {gig.headlinerName}
            </div>
          )}
        </div>

        {/* Headline */}
        <h2 className="text-xl font-bold text-center mb-3 text-white">
          {headline}
        </h2>

        {/* Description */}
        <p className="text-gray-300 text-center mb-6 leading-relaxed">
          {description}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-900/50 rounded p-3 text-center">
            <div className="text-2xl font-bold text-white">{actualTurnout}</div>
            <div className="text-xs text-gray-500 uppercase">Attendance</div>
          </div>
          <div className="bg-gray-900/50 rounded p-3 text-center">
            <div className="text-2xl font-bold text-green-400">£{earnings}</div>
            <div className="text-xs text-gray-500 uppercase">Earned</div>
            {managerCut > 0 && (
              <div className="text-xs text-gray-600">(£{managerCut} to manager)</div>
            )}
          </div>
        </div>

        {/* Stat Changes */}
        <div className="bg-gray-900/50 rounded p-3 mb-6">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2 text-center">Results</div>
          <div className="flex flex-wrap gap-2 justify-center">
            {fansGained > 0 && (
              <StatBadge label="Fans" value={`+${fansGained}`} positive />
            )}
            {hypeChange !== 0 && (
              <StatBadge label="Hype" value={hypeChange > 0 ? `+${hypeChange}` : String(hypeChange)} positive={hypeChange > 0} />
            )}
            {credChange !== 0 && (
              <StatBadge label="Cred" value={credChange > 0 ? `+${credChange}` : String(credChange)} positive={credChange > 0} />
            )}
            {skillGain > 0 && (
              <StatBadge label="Skill" value={`+${skillGain}`} positive />
            )}
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-lg
                     text-white font-medium transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function StatBadge({ label, value, positive }: { label: string; value: string; positive: boolean }) {
  return (
    <span className={`text-xs px-2 py-1 rounded ${
      positive ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
    }`}>
      {label}: {value}
    </span>
  );
}
