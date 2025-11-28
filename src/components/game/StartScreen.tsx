'use client';

import { useState } from 'react';
import { Difficulty } from '@/engine/types';
import { getAvailableDifficulties } from '@/engine/difficulty';

interface StartScreenProps {
  onStart: (playerName: string, difficulty: Difficulty) => void;
}

const difficulties = getAvailableDifficulties();

export function StartScreen({ onStart }: StartScreenProps) {
  const [playerName, setPlayerName] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      onStart(playerName.trim(), difficulty);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {/* Title */}
        <h1 className="text-5xl font-bold text-red-500 mb-2">
          FAILING UP
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          A Rock Star Story
        </p>

        {/* Tagline */}
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 mb-8">
          <p className="text-gray-300 italic">
            "Most bands never make it. Most that do, burn out fast.
            True superstardom? That's for the lucky few who survive."
          </p>
        </div>

        {/* Start Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="playerName" className="block text-gray-400 text-sm mb-2">
              What's your stage name?
            </label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
              autoFocus
            />
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="block text-gray-400 text-sm mb-3">
              Choose your difficulty
            </label>
            <div className="grid grid-cols-2 gap-3">
              {difficulties.map((diff) => (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => setDifficulty(diff.id)}
                  className={`
                    p-3 rounded-lg border transition-all text-left
                    ${difficulty === diff.id
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }
                  `}
                >
                  <div className={`font-bold text-sm ${difficulty === diff.id ? 'text-red-400' : 'text-gray-300'}`}>
                    {diff.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {diff.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!playerName.trim()}
            className={`
              w-full py-3 font-bold rounded-lg transition-colors
              ${playerName.trim()
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Start Your Career
          </button>
        </form>

        {/* Instructions */}
        <div className="mt-8 text-sm text-gray-500">
          <p>Each week, choose an action. Watch your stats. Don't die broke.</p>
          <p className="mt-2">Good luck. You'll need it.</p>
        </div>
      </div>
    </div>
  );
}
