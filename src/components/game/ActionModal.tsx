'use client';

import { useMemo } from 'react';
import { ActionId, Player, GameState } from '@/engine/types';
import { ACTIONS, isActionAvailable } from '@/engine/actions';

interface ActionModalProps {
  isOpen: boolean;
  availableActions: ActionId[];
  gameState: GameState;
  onSelectAction: (actionId: ActionId) => void;
}

// Get reason why an action is unavailable
function getUnavailableReason(actionId: ActionId, state: GameState): string {
  const action = ACTIONS[actionId];
  if (!action) return 'Unknown action';

  const { requirements } = action;
  const { player, songs } = state;

  // Check minimum unreleased songs (for recording actions)
  if (requirements.minUnreleasedSongs !== undefined) {
    const unreleased = songs.filter(s => !s.isReleased);
    if (unreleased.length < requirements.minUnreleasedSongs) {
      const needed = requirements.minUnreleasedSongs - unreleased.length;
      return `Need ${needed} more song${needed > 1 ? 's' : ''}`;
    }
  }

  if (requirements.hasUnreleasedSongs) {
    const unreleased = songs.filter(s => !s.isReleased);
    if (unreleased.length === 0) {
      return songs.length === 0 ? 'Write some songs first' : 'All songs already released';
    }
  }

  if (requirements.hasReleasedMusic) {
    const released = songs.filter(s => s.isReleased);
    if (released.length === 0) {
      return 'Release some music first';
    }
  }

  if (requirements.hasLabelDeal && !player.flags.hasLabelDeal) {
    return 'Need a label deal';
  }

  if (requirements.minHealth && player.health < requirements.minHealth) {
    return `Need ${requirements.minHealth}+ health`;
  }

  if (requirements.onTour === false && player.flags.onTour) {
    return 'Not while on tour';
  }

  if (requirements.inStudio === false && player.flags.inStudio) {
    return 'Already in the studio';
  }

  // Recording session requirements
  if (requirements.hasActiveRecording && !state.recordingSession) {
    return 'No active recording';
  }
  if (requirements.noActiveRecording && state.recordingSession) {
    return 'Finish current recording first';
  }

  return 'Requirements not met';
}

// Sarcastic suggestions based on player state
function getSarcasticSuggestion(player: Player, availableActions: ActionId[]): {
  suggestedAction: ActionId | null;
  commentary: string;
} {
  // Health critical
  if (player.health <= 25) {
    if (availableActions.includes('REST')) {
      return {
        suggestedAction: 'REST',
        commentary: "You look like death warmed over. Maybe don't die this week?",
      };
    }
  }

  // Broke and desperate
  if (player.money < 0) {
    if (availableActions.includes('SIDE_JOB')) {
      return {
        suggestedAction: 'SIDE_JOB',
        commentary: "Your bank account is crying. Time to serve coffee like a real artist.",
      };
    }
  }

  // High addiction
  if (player.addiction >= 60) {
    if (availableActions.includes('PARTY')) {
      return {
        suggestedAction: 'PARTY',
        commentary: "Your substance abuse counselor would be so proud. Go on, you know you want to.",
      };
    }
    if (availableActions.includes('REST')) {
      return {
        suggestedAction: 'REST',
        commentary: "The abyss is staring back. Maybe take a breather before it swallows you whole.",
      };
    }
  }

  // Burnout high
  if (player.burnout >= 70) {
    if (availableActions.includes('REST')) {
      return {
        suggestedAction: 'REST',
        commentary: "You're one bad week away from a breakdown. But sure, keep grinding.",
      };
    }
  }

  // Hype dying
  if (player.hype <= 15) {
    if (availableActions.includes('PROMOTE')) {
      return {
        suggestedAction: 'PROMOTE',
        commentary: "Remember when people cared about you? Neither do they. Do something.",
      };
    }
  }

  // No songs to release
  const hasSongs = player.skill > 20; // Rough proxy - TODO: check actual songs
  if (!hasSongs && availableActions.includes('WRITE')) {
    return {
      suggestedAction: 'WRITE',
      commentary: "Hard to be a musician without music. Revolutionary concept, I know.",
    };
  }

  // Low skill
  if (player.skill <= 25) {
    if (availableActions.includes('REHEARSE')) {
      return {
        suggestedAction: 'REHEARSE',
        commentary: "Your playing sounds like a cat in a blender. Practice might help. Might.",
      };
    }
  }

  // Things are going well - suggest something reckless
  if (player.health > 70 && player.hype > 50 && player.money > 500) {
    if (availableActions.includes('PARTY')) {
      return {
        suggestedAction: 'PARTY',
        commentary: "Things are going suspiciously well. Time to self-sabotage like a true artist.",
      };
    }
  }

  // Default sarcastic comments when things are neutral
  const neutralComments = [
    "Another week, another existential crisis. What'll it be?",
    "The music industry awaits your next questionable decision.",
    "Your manager called. They're still not returning your calls.",
    "Choose wisely. Or don't. It's not like this matters. (It does.)",
    "What's it gonna be, rock star? Fame or flames?",
    "The road to stardom is paved with regret. Pick one.",
    "Time to make choices you'll blame your label for later.",
  ];

  return {
    suggestedAction: null,
    commentary: neutralComments[Math.floor(Math.random() * neutralComments.length)],
  };
}

// Action category for visual grouping
function getActionCategory(actionId: ActionId): 'creative' | 'perform' | 'business' | 'lifestyle' {
  switch (actionId) {
    case 'WRITE':
    case 'RECORD_SINGLE':
    case 'RECORD_EP':
    case 'RECORD_ALBUM':
    case 'STUDIO_WORK':
    case 'REHEARSE':
      return 'creative';
    case 'TOUR':
    case 'RELEASE_SINGLE':
      return 'perform';
    case 'PROMOTE':
    case 'NETWORK':
    case 'SIDE_JOB':
      return 'business';
    case 'REST':
    case 'PARTY':
    default:
      return 'lifestyle';
  }
}

const CATEGORY_STYLES = {
  creative: 'border-purple-500/50 hover:border-purple-400 hover:bg-purple-900/20',
  perform: 'border-green-500/50 hover:border-green-400 hover:bg-green-900/20',
  business: 'border-blue-500/50 hover:border-blue-400 hover:bg-blue-900/20',
  lifestyle: 'border-amber-500/50 hover:border-amber-400 hover:bg-amber-900/20',
};

const CATEGORY_LABELS = {
  creative: 'Creative',
  perform: 'Performance',
  business: 'Business',
  lifestyle: 'Lifestyle',
};

export function ActionModal({
  isOpen,
  availableActions,
  gameState,
  onSelectAction,
}: ActionModalProps) {
  const { player, week } = gameState;

  const { suggestedAction, commentary } = useMemo(
    () => getSarcasticSuggestion(player, availableActions),
    [player, availableActions]
  );

  // All possible actions
  const allActionIds = Object.keys(ACTIONS) as ActionId[];

  // Group actions by category, separating available from unavailable
  const { availableGrouped, unavailableGrouped } = useMemo(() => {
    const available: Record<string, ActionId[]> = {
      creative: [],
      perform: [],
      business: [],
      lifestyle: [],
    };
    const unavailable: Record<string, ActionId[]> = {
      creative: [],
      perform: [],
      business: [],
      lifestyle: [],
    };

    allActionIds.forEach(actionId => {
      const category = getActionCategory(actionId);
      if (availableActions.includes(actionId)) {
        available[category].push(actionId);
      } else {
        unavailable[category].push(actionId);
      }
    });

    return { availableGrouped: available, unavailableGrouped: unavailable };
  }, [availableActions, allActionIds]);

  if (!isOpen) return null;

  const weekInYear = ((week - 1) % 52) + 1;
  const year = Math.floor((week - 1) / 52) + 1;

  return (
    <>
      {/* ===== MOBILE: Bottom Sheet ===== */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-50">
        {/* Backdrop - semi-transparent so you can see story */}
        <div className="fixed inset-0 bg-black/40" />

        {/* Bottom Sheet */}
        <div className="relative bg-gray-900 border-t border-gray-700 rounded-t-xl shadow-2xl max-h-[70vh] overflow-hidden flex flex-col">
          {/* Handle bar */}
          <div className="flex justify-center py-2">
            <div className="w-12 h-1 bg-gray-600 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-4 pb-3 border-b border-gray-700">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-white">Week {weekInYear}</h2>
              <span className="text-xs text-gray-500">{availableActions.length} options</span>
            </div>
            <p className="text-gray-400 italic text-xs">"{commentary}"</p>
          </div>

          {/* Actions - scrollable */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {Object.entries(availableGrouped).map(([category, actions]) => {
                if (actions.length === 0) return null;
                return (
                  <div key={category}>
                    <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                      {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {actions.map(actionId => {
                        const action = ACTIONS[actionId];
                        const isSuggested = actionId === suggestedAction;
                        return (
                          <button
                            key={actionId}
                            onClick={() => onSelectAction(actionId)}
                            className={`
                              relative p-3 rounded-lg border-2 text-left transition-all
                              ${CATEGORY_STYLES[category as keyof typeof CATEGORY_STYLES]}
                              ${isSuggested ? 'ring-2 ring-amber-500/50' : ''}
                            `}
                          >
                            {isSuggested && (
                              <span className="absolute -top-1.5 -right-1.5 text-[10px] bg-amber-600 text-black px-1.5 py-0.5 rounded-full font-medium">
                                ★
                              </span>
                            )}
                            <div className="font-medium text-white text-sm">{action.label}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ===== DESKTOP: Side Panel ===== */}
      <div className="hidden lg:block fixed right-0 top-0 bottom-0 z-50 w-96">
        {/* Subtle backdrop on left side */}
        <div className="fixed inset-0 bg-gradient-to-r from-transparent via-transparent to-black/50 pointer-events-none" />

        {/* Side Panel */}
        <div className="relative h-full bg-gray-900 border-l border-gray-700 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-white">Week {weekInYear}, Year {year}</h2>
              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                {availableActions.length} options
              </span>
            </div>
            <p className="text-gray-400 italic text-sm leading-relaxed">"{commentary}"</p>
          </div>

          {/* Actions - scrollable */}
          <div className="flex-1 overflow-y-auto p-5">
            <div className="space-y-5">
              {/* Available actions */}
              {Object.entries(availableGrouped).map(([category, actions]) => {
                if (actions.length === 0) return null;

                return (
                  <div key={category}>
                    <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                      {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                    </div>
                    <div className="space-y-2">
                      {actions.map(actionId => {
                        const action = ACTIONS[actionId];
                        const isSuggested = actionId === suggestedAction;

                        return (
                          <button
                            key={actionId}
                            onClick={() => onSelectAction(actionId)}
                            className={`
                              relative w-full p-3 rounded-lg border-2 text-left transition-all duration-200
                              ${CATEGORY_STYLES[category as keyof typeof CATEGORY_STYLES]}
                              ${isSuggested ? 'ring-2 ring-amber-500/50' : ''}
                            `}
                          >
                            {isSuggested && (
                              <span className="absolute -top-2 -right-2 text-xs bg-amber-600 text-black px-2 py-0.5 rounded-full font-medium">
                                Suggested
                              </span>
                            )}
                            <div className="font-medium text-white text-sm mb-0.5">{action.label}</div>
                            <div className="text-xs text-gray-400 leading-relaxed">
                              {action.description}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Unavailable actions (locked) */}
              {Object.values(unavailableGrouped).some(arr => arr.length > 0) && (
                <div className="pt-4 border-t border-gray-700">
                  <div className="text-xs uppercase tracking-wide text-gray-600 mb-2">
                    Locked
                  </div>
                  <div className="space-y-1">
                    {Object.entries(unavailableGrouped).flatMap(([category, actions]) =>
                      actions.map(actionId => {
                        const action = ACTIONS[actionId];
                        const reason = getUnavailableReason(actionId, gameState);

                        return (
                          <div
                            key={actionId}
                            className="p-2 rounded border border-gray-800 bg-gray-900/50 opacity-60"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs text-gray-500">{action.label}</span>
                              <span className="text-[10px] text-red-400/70 bg-red-900/20 px-1.5 py-0.5 rounded">
                                {reason}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700 bg-gray-800/50">
            <p className="text-xs text-gray-500 text-center">
              Choose wisely. Or don't.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
