'use client';

import { TourType } from '@/engine/types';
import { TOUR_CONFIGS } from '@/engine/economy';
import { getTotalFans } from '@/engine/state';

interface TourOption {
  type: TourType;
  name: string;
  description: string;
  weeks: number;
  totalCost: number;
  minFans: number;
  minMoney: number;
  requiresLabel: boolean;
  available: boolean;
  unavailableReason?: string;
}

interface TourSelectionModalProps {
  playerMoney: number;
  playerFans: number;
  hasLabelDeal: boolean;
  onSelectTour: (tourType: TourType) => void;
  onCancel: () => void;
}

export function TourSelectionModal({
  playerMoney,
  playerFans,
  hasLabelDeal,
  onSelectTour,
  onCancel,
}: TourSelectionModalProps) {
  // Build tour options with availability
  const tourOptions: TourOption[] = Object.values(TOUR_CONFIGS).map(config => {
    const totalCost = config.upfrontCost + (config.weeklyBaseCost * config.weeksRequired);
    let available = true;
    let unavailableReason: string | undefined;

    if (playerFans < config.minFans) {
      available = false;
      unavailableReason = `Need ${config.minFans.toLocaleString()} fans`;
    } else if (playerMoney < config.minMoney) {
      available = false;
      unavailableReason = `Need £${config.minMoney.toLocaleString()}`;
    } else if (config.requiresLabel && !hasLabelDeal) {
      available = false;
      unavailableReason = 'Needs label backing';
    }

    return {
      type: config.type,
      name: config.name,
      description: config.description,
      weeks: config.weeksRequired,
      totalCost,
      minFans: config.minFans,
      minMoney: config.minMoney,
      requiresLabel: config.requiresLabel,
      available,
      unavailableReason,
    };
  });

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-lg w-full p-6">
        <h2 className="text-xl font-bold text-white mb-2">Choose Your Tour</h2>
        <p className="text-gray-400 text-sm mb-4">
          Pick how you want to hit the road. Bigger tours mean bigger costs, but bigger rewards.
        </p>

        <div className="space-y-3 mb-6">
          {tourOptions.map((option) => (
            <button
              key={option.type}
              onClick={() => option.available && onSelectTour(option.type)}
              disabled={!option.available}
              className={`w-full p-4 rounded-lg border text-left transition-all ${
                option.available
                  ? 'bg-gray-800 hover:bg-gray-700 border-gray-600 hover:border-gray-500'
                  : 'bg-gray-800/50 border-gray-700 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-medium text-white">{option.name}</div>
                  <div className="text-xs text-gray-400">{option.weeks} weeks</div>
                </div>
                <div className="text-right">
                  {option.available ? (
                    <div className="text-sm text-yellow-400">
                      ~£{option.totalCost.toLocaleString()}
                    </div>
                  ) : (
                    <div className="text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded">
                      {option.unavailableReason}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{option.description}</p>

              {/* Requirements summary */}
              <div className="mt-2 flex gap-2 text-xs">
                <span className={`px-2 py-0.5 rounded ${
                  playerFans >= option.minFans ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-gray-500'
                }`}>
                  {option.minFans.toLocaleString()} fans
                </span>
                <span className={`px-2 py-0.5 rounded ${
                  playerMoney >= option.minMoney ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-gray-500'
                }`}>
                  £{option.minMoney.toLocaleString()}
                </span>
                {option.requiresLabel && (
                  <span className={`px-2 py-0.5 rounded ${
                    hasLabelDeal ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-gray-500'
                  }`}>
                    Label deal
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onCancel}
          className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg
                     text-gray-400 text-sm transition-colors"
        >
          Not right now
        </button>
      </div>
    </div>
  );
}
