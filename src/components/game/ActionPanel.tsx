'use client';

import { ActionId } from '@/engine/types';
import { ACTIONS } from '@/engine/actions';

interface ActionPanelProps {
  availableActions: ActionId[];
  onSelectAction: (actionId: ActionId) => void;
  disabled?: boolean;
}

// Action categories for organization
const ACTION_CATEGORIES: Record<string, ActionId[]> = {
  'Music': ['WRITE', 'REHEARSE', 'RECORD_SINGLE', 'RECORD_EP', 'RECORD_ALBUM', 'WRITE_AND_RECORD', 'STUDIO_WORK', 'RELEASE'],
  'Career': ['TOUR', 'PROMOTE', 'NETWORK'],
  'Lifestyle': ['PARTY', 'REST', 'SIDE_JOB'],
};

function ActionButton({
  actionId,
  isAvailable,
  onClick,
  disabled,
}: {
  actionId: ActionId;
  isAvailable: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  const action = ACTIONS[actionId];
  const isDisabled = disabled || !isAvailable;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        w-full text-left p-3 rounded-lg border transition-all
        ${isDisabled
          ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'
          : 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:border-gray-500 cursor-pointer'
        }
      `}
    >
      <div className="font-semibold">{action.label}</div>
      <div className="text-sm text-gray-400 mt-1">{action.description}</div>
      {!isAvailable && (
        <div className="text-xs text-red-400 mt-1">Not available</div>
      )}
    </button>
  );
}

export function ActionPanel({ availableActions, onSelectAction, disabled }: ActionPanelProps) {
  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
      <div className="text-lg font-bold text-white mb-4">
        Choose Your Action
      </div>
      <div className="text-sm text-gray-400 mb-4">
        Select what to focus on this week
      </div>

      {Object.entries(ACTION_CATEGORIES).map(([category, actionIds]) => (
        <div key={category} className="mb-4">
          <div className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
            {category}
          </div>
          <div className="space-y-2">
            {actionIds.map((actionId) => (
              <ActionButton
                key={actionId}
                actionId={actionId}
                isAvailable={availableActions.includes(actionId)}
                onClick={() => onSelectAction(actionId)}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
