'use client';

import { GameEvent, EventChoice } from '@/engine/types';

interface EventModalProps {
  event: GameEvent;
  onChoice: (choice: EventChoice) => void;
}

export function EventModal({ event, onChoice }: EventModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-lg w-full p-6 shadow-2xl">
        {/* Event Header */}
        <div className="mb-4 pb-4 border-b border-gray-700">
          <div className="text-xs text-red-400 uppercase tracking-wide mb-2">
            Event
          </div>
          <p className="text-lg text-white leading-relaxed">
            {event.textIntro}
          </p>
        </div>

        {/* Choices */}
        <div className="space-y-3">
          <div className="text-sm text-gray-400 mb-2">
            What do you do?
          </div>
          {event.choices.map((choice) => (
            <button
              key={choice.id}
              onClick={() => onChoice(choice)}
              className="w-full text-left p-4 bg-gray-800 border border-gray-600 rounded-lg
                         hover:bg-gray-700 hover:border-gray-500 transition-all cursor-pointer
                         focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <div className="font-semibold text-white mb-1">
                {choice.label}
              </div>
              {/* Show hints about consequences */}
              <ChoiceHints choice={choice} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChoiceHints({ choice }: { choice: EventChoice }) {
  const hints: string[] = [];

  if (choice.statChanges) {
    const { statChanges } = choice;

    // Money hints
    if (statChanges.money !== undefined) {
      if (statChanges.money > 0) hints.push(`+$${statChanges.money}`);
      else if (statChanges.money < 0) hints.push(`$${statChanges.money}`);
    }

    // Health hints (always show if negative)
    if (statChanges.health !== undefined && statChanges.health < 0) {
      hints.push('Health risk');
    }

    // Addiction hints
    if (statChanges.addiction !== undefined && statChanges.addiction > 3) {
      hints.push('Risky');
    }

    // Positive hints
    if (statChanges.cred !== undefined && statChanges.cred > 2) {
      hints.push('Builds cred');
    }
    if (statChanges.hype !== undefined && statChanges.hype > 3) {
      hints.push('Boosts hype');
    }
    if (statChanges.industryGoodwill !== undefined && statChanges.industryGoodwill > 2) {
      hints.push('Industry connections');
    }
  }

  // Band hints
  if (choice.bandmateChanges?.loyalty !== undefined && choice.bandmateChanges.loyalty < -5) {
    hints.push('Band tension');
  }

  if (hints.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {hints.map((hint, index) => (
        <span
          key={index}
          className={`text-xs px-2 py-1 rounded ${
            hint.startsWith('+$') || hint.startsWith('Builds') || hint.startsWith('Boosts') || hint === 'Industry connections'
              ? 'bg-green-900/50 text-green-400'
              : hint.startsWith('$') || hint === 'Health risk' || hint === 'Risky' || hint === 'Band tension'
                ? 'bg-red-900/50 text-red-400'
                : 'bg-gray-700 text-gray-400'
          }`}
        >
          {hint}
        </span>
      ))}
    </div>
  );
}

// Outcome display component for after a choice is made
interface EventOutcomeProps {
  event: GameEvent;
  choice: EventChoice;
  onContinue: () => void;
}

export function EventOutcome({ event, choice, onContinue }: EventOutcomeProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-lg w-full p-6 shadow-2xl">
        {/* Outcome Text */}
        <div className="mb-6">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            Result
          </div>
          <p className="text-lg text-white leading-relaxed">
            {choice.outcomeText}
          </p>
        </div>

        {/* Stat Changes */}
        {choice.statChanges && Object.keys(choice.statChanges).length > 0 && (
          <div className="mb-6 p-3 bg-gray-800 rounded-lg">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              Effects
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(choice.statChanges).map(([stat, value]) => (
                <StatChange key={stat} stat={stat} value={value as number} />
              ))}
            </div>
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function StatChange({ stat, value }: { stat: string; value: number }) {
  const isPositive = value > 0;
  const statLabels: Record<string, string> = {
    money: 'Money',
    health: 'Health',
    stability: 'Stability',
    addiction: 'Addiction',
    burnout: 'Burnout',
    skill: 'Skill',
    image: 'Image',
    hype: 'Hype',
    cred: 'Cred',
    fans: 'Fans',
    industryGoodwill: 'Industry Rep',
  };

  // For addiction and burnout, positive is bad
  const invertedStats = ['addiction', 'burnout'];
  const isGood = invertedStats.includes(stat) ? !isPositive : isPositive;

  return (
    <span
      className={`text-sm px-2 py-1 rounded ${
        isGood ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
      }`}
    >
      {statLabels[stat] || stat}: {isPositive ? '+' : ''}{value}
    </span>
  );
}
