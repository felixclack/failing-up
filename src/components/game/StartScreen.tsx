'use client';

import { useState } from 'react';
import { Difficulty, TalentLevel, MusicStyle } from '@/engine/types';
import { getAvailableDifficulties } from '@/engine/difficulty';
import { getAvailableTalentLevels, getAvailableStyles } from '@/engine/state';

interface StartScreenProps {
  onStart: (playerName: string, difficulty: Difficulty, talentLevel: TalentLevel, preferredStyle: MusicStyle) => void;
}

const difficulties = getAvailableDifficulties();
const talentLevels = getAvailableTalentLevels();
const musicStyles = getAvailableStyles();

export function StartScreen({ onStart }: StartScreenProps) {
  const [playerName, setPlayerName] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [talentLevel, setTalentLevel] = useState<TalentLevel>('average');
  const [preferredStyle, setPreferredStyle] = useState<MusicStyle>('punk');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      onStart(playerName.trim(), difficulty, talentLevel, preferredStyle);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Title */}
        <h1 className="text-5xl font-bold text-red-500 mb-2">
          FAILING UP
        </h1>
        <p className="text-xl text-gray-400 mb-6">
          A Rock Star Story
        </p>

        {/* Tagline */}
        <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 mb-6">
          <p className="text-gray-300 italic text-sm">
            "Most bands never make it. Most that do, burn out fast.
            True superstardom? That's for the lucky few who survive."
          </p>
        </div>

        {/* Start Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Input */}
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

          {/* Talent Level Selection */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Your natural talent
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {talentLevels.map((level) => (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => setTalentLevel(level.id)}
                  className={`
                    p-2 rounded-lg border transition-all text-left
                    ${talentLevel === level.id
                      ? 'border-yellow-500 bg-yellow-500/10'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }
                  `}
                >
                  <div className={`font-bold text-xs ${talentLevel === level.id ? 'text-yellow-400' : 'text-gray-300'}`}>
                    {level.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                    {level.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Style Preference Selection */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Your sound
            </label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {musicStyles.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setPreferredStyle(style.id)}
                  className={`
                    p-2 rounded-lg border transition-all text-center
                    ${preferredStyle === style.id
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }
                  `}
                >
                  <div className={`font-bold text-xs ${preferredStyle === style.id ? 'text-purple-400' : 'text-gray-300'}`}>
                    {style.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Difficulty
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {difficulties.map((diff) => (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => setDifficulty(diff.id)}
                  className={`
                    p-2 rounded-lg border transition-all text-left
                    ${difficulty === diff.id
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }
                  `}
                >
                  <div className={`font-bold text-xs ${difficulty === diff.id ? 'text-red-400' : 'text-gray-300'}`}>
                    {diff.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
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
        <div className="mt-6 text-xs text-gray-500">
          <p>Each week, choose an action. Watch your stats. Don't die broke.</p>
        </div>
      </div>
    </div>
  );
}
