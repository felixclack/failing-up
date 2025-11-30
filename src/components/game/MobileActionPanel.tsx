'use client';

import { ActionId } from '@/engine/types';
import { ACTIONS } from '@/engine/actions';

interface MobileActionPanelProps {
  availableActions: ActionId[];
  onSelectAction: (actionId: ActionId) => void;
  disabled?: boolean;
}

// Simplified categories with icons
const ACTION_GROUPS: { label: string; icon: string; actions: ActionId[] }[] = [
  {
    label: 'Music',
    icon: '🎸',
    actions: ['WRITE', 'REHEARSE', 'RECORD_SINGLE', 'RECORD_EP', 'RECORD_ALBUM', 'WRITE_AND_RECORD', 'STUDIO_WORK', 'RELEASE'],
  },
  {
    label: 'Career',
    icon: '📈',
    actions: ['TOUR', 'PROMOTE', 'NETWORK'],
  },
  {
    label: 'Life',
    icon: '🌙',
    actions: ['REST', 'PARTY', 'SIDE_JOB'],
  },
];

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
          ? 'bg-gray-800/50 border-gray-700/50 text-gray-600'
          : 'bg-gray-800 border-gray-600 text-white active:bg-gray-700 active:scale-[0.98]'
        }
      `}
    >
      <div className="font-medium text-sm">{action.label}</div>
      <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{action.description}</div>
    </button>
  );
}

export function MobileActionPanel({
  availableActions,
  onSelectAction,
  disabled,
}: MobileActionPanelProps) {
  return (
    <div className="space-y-4">
      {ACTION_GROUPS.map((group) => {
        // Only show groups that have at least one action
        const groupActions = group.actions.filter((id) =>
          Object.keys(ACTIONS).includes(id)
        );
        if (groupActions.length === 0) return null;

        return (
          <div key={group.label}>
            <div className="flex items-center gap-2 mb-2 px-1">
              <span>{group.icon}</span>
              <span className="text-xs text-gray-500 uppercase tracking-wide">
                {group.label}
              </span>
            </div>
            <div className="space-y-2">
              {groupActions.map((actionId) => (
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
        );
      })}
    </div>
  );
}
