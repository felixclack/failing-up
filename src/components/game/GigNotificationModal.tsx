'use client';

import { Gig } from '@/engine/types';
import { getVenueTypeDisplay } from '@/data/venues';

interface GigNotificationModalProps {
  gig: Gig;
  managerName: string;
  onAccept: () => void;
  onDecline: () => void;
}

export function GigNotificationModal({
  gig,
  managerName,
  onAccept,
  onDecline,
}: GigNotificationModalProps) {
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">📋</div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">
            Gig Offer
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            {managerName} booked a gig
          </h2>
        </div>

        {/* Venue Info */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
          <div className="text-lg font-medium text-white mb-1">
            {gig.venue.name}
          </div>
          <div className="text-sm text-gray-400">
            {getVenueTypeDisplay(gig.venue.type)} • {gig.venue.city}
          </div>

          {gig.isSupport && gig.headlinerName && (
            <div className="mt-2 text-sm text-yellow-400">
              Supporting {gig.headlinerName}
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-800/50 rounded p-3 text-center">
            <div className="text-xl font-bold text-green-400">£{gig.guaranteedPay}</div>
            <div className="text-xs text-gray-500 uppercase">Guaranteed</div>
          </div>
          <div className="bg-gray-800/50 rounded p-3 text-center">
            <div className="text-xl font-bold text-blue-400">~{gig.expectedTurnout}</div>
            <div className="text-xs text-gray-500 uppercase">Expected</div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-sm text-center mb-6">
          Do you want to play this gig? If you decline, {managerName} might have a harder time
          booking future gigs.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onDecline}
            className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg
                       text-gray-400 font-medium transition-colors border border-gray-700"
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            className="flex-1 py-3 bg-green-900/50 hover:bg-green-900/70 rounded-lg
                       text-green-400 font-medium transition-colors border border-green-700"
          >
            Accept Gig
          </button>
        </div>
      </div>
    </div>
  );
}
