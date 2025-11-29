'use client';

import { useState } from 'react';
import { Manager, Gig } from '@/engine/types';
import { getManagerQualityDescription, formatManagerCut, MANAGER_HIRE_COST } from '@/engine/manager';
import { getVenueTypeDisplay } from '@/data/venues';

interface ManagerPanelProps {
  manager: Manager | null;
  upcomingGig: Gig | null;
  playerMoney: number;
  onHireManager: () => void;
  onFireManager: () => void;
}

export function ManagerPanel({
  manager,
  upcomingGig,
  playerMoney,
  onHireManager,
  onFireManager,
}: ManagerPanelProps) {
  const [showDetails, setShowDetails] = useState(false);
  const canAffordHiring = playerMoney >= MANAGER_HIRE_COST;

  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
          Manager
        </h3>
        {manager && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-gray-500 hover:text-gray-400"
          >
            {showDetails ? 'Hide' : 'Details'}
          </button>
        )}
      </div>

      {manager ? (
        <div>
          {/* Manager Info */}
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl">💼</div>
            <div>
              <div className="font-medium text-white">{manager.name}</div>
              <div className="text-xs text-gray-400">
                {getManagerQualityDescription(manager)} • {formatManagerCut(manager.cut)} cut
              </div>
            </div>
          </div>

          {/* Detailed Stats (collapsible) */}
          {showDetails && (
            <div className="bg-gray-900/50 rounded p-3 mb-3 space-y-2">
              <StatRow label="Booking Skill" value={manager.bookingSkill} />
              <StatRow label="Connections" value={manager.connections} />
              <StatRow label="Reliability" value={manager.reliability} />
              <StatRow label="Reputation" value={manager.reputation} />
            </div>
          )}

          {/* Upcoming Gig */}
          {upcomingGig && (
            <div className="bg-gray-900/50 rounded p-3 mb-3">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Next Gig
              </div>
              <div className="text-sm text-white font-medium">
                {upcomingGig.venue.name}
              </div>
              <div className="text-xs text-gray-400">
                {getVenueTypeDisplay(upcomingGig.venue.type)} • {upcomingGig.venue.city}
              </div>
              <div className="text-xs text-green-400 mt-1">
                £{upcomingGig.guaranteedPay} guaranteed
              </div>
              {upcomingGig.isSupport && upcomingGig.headlinerName && (
                <div className="text-xs text-yellow-400 mt-1">
                  Supporting {upcomingGig.headlinerName}
                </div>
              )}
            </div>
          )}

          {!upcomingGig && (
            <div className="text-xs text-gray-500 mb-3 italic">
              Looking for gig opportunities...
            </div>
          )}

          {/* Fire Button */}
          <button
            onClick={onFireManager}
            className="w-full py-2 text-sm bg-red-900/30 hover:bg-red-900/50
                       border border-red-800 rounded text-red-400 transition-colors"
          >
            Fire Manager
          </button>
        </div>
      ) : (
        <div>
          {/* No Manager */}
          <div className="text-center py-4 mb-3">
            <div className="text-4xl mb-2 opacity-50">🤷</div>
            <div className="text-gray-400 text-sm">No manager</div>
            <div className="text-gray-500 text-xs mt-1">
              Harder to get gigs without one
            </div>
          </div>

          {/* Upcoming Gig (self-booked, if any) */}
          {upcomingGig && (
            <div className="bg-gray-900/50 rounded p-3 mb-3">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Next Gig (self-booked)
              </div>
              <div className="text-sm text-white font-medium">
                {upcomingGig.venue.name}
              </div>
              <div className="text-xs text-gray-400">
                {getVenueTypeDisplay(upcomingGig.venue.type)} • {upcomingGig.venue.city}
              </div>
            </div>
          )}

          {/* Hire Button */}
          <button
            onClick={onHireManager}
            disabled={!canAffordHiring}
            className={`w-full py-2 text-sm rounded transition-colors ${
              canAffordHiring
                ? 'bg-blue-900/30 hover:bg-blue-900/50 border border-blue-800 text-blue-400'
                : 'bg-gray-800 border border-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            Find Manager (£{MANAGER_HIRE_COST})
          </button>
          {!canAffordHiring && (
            <div className="text-xs text-gray-500 text-center mt-1">
              Not enough money
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  const barWidth = `${value}%`;
  const barColor = value >= 70 ? 'bg-green-500' : value >= 40 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-300">{value}</span>
      </div>
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all`}
          style={{ width: barWidth }}
        />
      </div>
    </div>
  );
}

// Modal for hiring a manager
interface ManagerHireModalProps {
  candidates: Manager[];
  playerMoney: number;
  onSelectManager: (manager: Manager) => void;
  onCancel: () => void;
}

export function ManagerHireModal({
  candidates,
  playerMoney,
  onSelectManager,
  onCancel,
}: ManagerHireModalProps) {
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-white mb-2">Find a Manager</h2>
        <p className="text-gray-400 text-sm mb-4">
          A few candidates have expressed interest. Who looks promising?
        </p>

        <div className="space-y-3 mb-4">
          {candidates.map((candidate) => (
            <button
              key={candidate.id}
              onClick={() => onSelectManager(candidate)}
              className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700
                         hover:border-gray-600 rounded-lg p-4 text-left transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-white">{candidate.name}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {getManagerQualityDescription(candidate)} manager
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-yellow-400">
                    {formatManagerCut(candidate.cut)} cut
                  </div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="text-gray-500">
                  Booking: <span className="text-gray-300">{candidate.bookingSkill}</span>
                </div>
                <div className="text-gray-500">
                  Connections: <span className="text-gray-300">{candidate.connections}</span>
                </div>
                <div className="text-gray-500">
                  Reliability: <span className="text-gray-300">{candidate.reliability}</span>
                </div>
                <div className="text-gray-500">
                  Reputation: <span className="text-gray-300">{candidate.reputation}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onCancel}
          className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg
                     text-gray-400 text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
