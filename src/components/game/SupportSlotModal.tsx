'use client';

import { SupportSlotOffer } from '@/engine/types';

interface SupportSlotModalProps {
  offer: SupportSlotOffer;
  currentWeek: number;
  onAccept: () => void;
  onDecline: () => void;
}

export function SupportSlotModal({
  offer,
  currentWeek,
  onAccept,
  onDecline,
}: SupportSlotModalProps) {
  const weeksUntilGig = offer.week - currentWeek;
  const expiresIn = offer.expiresWeek - currentWeek;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-amber-600/50 rounded-lg max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-600/20 rounded-full flex items-center justify-center">
            <span className="text-xl">🎸</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Support Slot Offer!</h2>
            <p className="text-amber-400 text-sm">{offer.headlinerName} want you to open</p>
          </div>
        </div>

        {/* Offer details */}
        <div className="bg-black/40 rounded-lg p-4 mb-4">
          <p className="text-gray-300 text-sm mb-3">
            <span className="text-white font-medium">{offer.headlinerName}</span> are looking for
            an opening act for their show at{' '}
            <span className="text-white">{offer.venue.name}</span> in{' '}
            <span className="text-white">{offer.venue.city}</span>.
          </p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-800/50 rounded p-2">
              <div className="text-gray-500 text-xs">Venue Capacity</div>
              <div className="text-white font-medium">{offer.venue.capacity.toLocaleString()}</div>
            </div>
            <div className="bg-gray-800/50 rounded p-2">
              <div className="text-gray-500 text-xs">Headliner Fans</div>
              <div className="text-white font-medium">{offer.headlinerFans.toLocaleString()}</div>
            </div>
            <div className="bg-gray-800/50 rounded p-2">
              <div className="text-gray-500 text-xs">Pay</div>
              <div className="text-green-400 font-medium">£{offer.pay}</div>
            </div>
            <div className="bg-gray-800/50 rounded p-2">
              <div className="text-gray-500 text-xs">Exposure Bonus</div>
              <div className="text-amber-400 font-medium">{offer.exposure}x fans</div>
            </div>
          </div>
        </div>

        {/* What this means */}
        <div className="mb-4 text-sm text-gray-400">
          <p className="mb-2">
            <span className="text-green-400">✓</span> Big exposure to a much larger audience
          </p>
          <p className="mb-2">
            <span className="text-green-400">✓</span> +{offer.prestigeBonus} cred if you impress
          </p>
          <p className="mb-2">
            <span className="text-amber-400">!</span> Higher stakes - bombing hurts more
          </p>
          <p>
            <span className="text-gray-500">○</span> Gig is in {weeksUntilGig} week{weeksUntilGig !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Urgency */}
        {expiresIn <= 1 && (
          <div className="mb-4 bg-red-900/30 border border-red-700/50 rounded p-2 text-center">
            <span className="text-red-400 text-sm">
              ⏰ Must decide {expiresIn === 0 ? 'now' : 'by next week'} - they need an answer!
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onAccept}
            className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 rounded-lg
                       text-white font-medium transition-colors"
          >
            Accept the slot
          </button>
          <button
            onClick={onDecline}
            className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg
                       text-gray-300 font-medium transition-colors"
          >
            Pass on this
          </button>
        </div>

        <p className="text-center text-xs text-gray-600 mt-3">
          Declining may slightly hurt your industry reputation
        </p>
      </div>
    </div>
  );
}
