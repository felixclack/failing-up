'use client';

import { Temptation, TemptationChoice } from '@/engine/types';

interface TemptationModalProps {
  temptation: Temptation;
  onChoice: (choice: TemptationChoice) => void;
}

const SOURCE_ICONS: Record<Temptation['source'], string> = {
  bandmate: '🎸',
  fan: '🤘',
  promoter: '💼',
  dealer: '💊',
  journalist: '📰',
  label: '🏢',
  self: '💭',
};

const SOURCE_LABELS: Record<Temptation['source'], string> = {
  bandmate: 'Your Bandmate',
  fan: 'A Fan',
  promoter: 'A Promoter',
  dealer: 'A Shady Character',
  journalist: 'A Journalist',
  label: 'Your Label',
  self: 'Inner Voice',
};

export function TemptationModal({ temptation, onChoice }: TemptationModalProps) {
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
      {/* Pulsing background effect */}
      <div className="absolute inset-0 bg-red-900/20 animate-pulse" />

      <div className="relative bg-gray-900 border-2 border-red-600/50 rounded-lg max-w-md w-full p-6 shadow-2xl shadow-red-900/30">
        {/* Source indicator */}
        <div className="flex items-center gap-3 mb-4">
          <div className="text-3xl">{SOURCE_ICONS[temptation.source]}</div>
          <div>
            <div className="text-xs text-red-400 uppercase tracking-wide">
              Temptation
            </div>
            <div className="text-sm text-gray-400">
              {SOURCE_LABELS[temptation.source]}
            </div>
          </div>
        </div>

        {/* The situation */}
        <p className="text-white text-lg mb-3">
          {temptation.prompt}
        </p>

        {/* The offer */}
        <p className="text-yellow-300 italic mb-6 pl-4 border-l-2 border-yellow-600/50">
          {temptation.offer}
        </p>

        {/* Choices */}
        <div className="space-y-3">
          {/* Accept - styled more temptingly */}
          <button
            onClick={() => onChoice(temptation.accept)}
            className="w-full p-4 rounded-lg border-2 border-red-500/50 bg-red-900/20
                       hover:bg-red-800/30 hover:border-red-400 transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-red-300 group-hover:text-red-200">
                {temptation.accept.label}
              </span>
              <span className="text-red-500 text-sm">Go for it</span>
            </div>
          </button>

          {/* Decline - styled more boring */}
          <button
            onClick={() => onChoice(temptation.decline)}
            className="w-full p-4 rounded-lg border border-gray-700 bg-gray-800/50
                       hover:bg-gray-800 hover:border-gray-600 transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-400 group-hover:text-gray-300">
                {temptation.decline.label}
              </span>
              <span className="text-gray-600 text-sm">Play it safe</span>
            </div>
          </button>
        </div>

        {/* Warning text */}
        <p className="text-xs text-gray-600 text-center mt-4">
          Every choice has consequences...
        </p>
      </div>
    </div>
  );
}

interface TemptationOutcomeProps {
  temptation: Temptation;
  choice: TemptationChoice;
  onContinue: () => void;
}

export function TemptationOutcome({ temptation, choice, onContinue }: TemptationOutcomeProps) {
  const accepted = choice.id === 'accept';

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
      <div className={`
        relative bg-gray-900 border-2 rounded-lg max-w-md w-full p-6 shadow-2xl
        ${accepted ? 'border-red-600/50 shadow-red-900/30' : 'border-gray-600'}
      `}>
        {/* Result header */}
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">
            {accepted ? '😈' : '😇'}
          </div>
          <div className={`text-sm uppercase tracking-wide ${accepted ? 'text-red-400' : 'text-gray-400'}`}>
            {accepted ? 'You gave in' : 'You resisted'}
          </div>
        </div>

        {/* Result text */}
        <p className="text-white text-center mb-6">
          {choice.resultText}
        </p>

        {/* Effects summary */}
        <div className="bg-gray-800/50 rounded p-3 mb-6">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Effects</div>
          <div className="flex flex-wrap gap-2 justify-center">
            {Object.entries(choice.effects).map(([stat, value]) => {
              if (value === 0) return null;
              const isPositive = value > 0;
              return (
                <span
                  key={stat}
                  className={`text-xs px-2 py-1 rounded ${
                    isPositive ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                  }`}
                >
                  {stat}: {isPositive ? '+' : ''}{value}
                </span>
              );
            })}
            {Object.keys(choice.effects).length === 0 && (
              <span className="text-xs text-gray-500">No immediate effects</span>
            )}
          </div>
        </div>

        {/* Continue button */}
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
