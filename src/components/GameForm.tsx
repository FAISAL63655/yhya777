import React, { useState } from 'react';
import { Game, PlayerCategory, GameType } from '../types';
import { X } from 'lucide-react';

interface GameFormProps {
  game?: Game;
  onSubmit: (game: Omit<Game, 'id'>) => void;
  onClose: () => void;
}

export function GameForm({ game, onSubmit, onClose }: GameFormProps) {
  const [name, setName] = useState(game?.name || '');
  const [type, setType] = useState<GameType>(game?.type || GameType.CUSTOM);
  const [playersPerTeam, setPlayersPerTeam] = useState(game?.playersPerTeam || 2);
  const [maxTeams, setMaxTeams] = useState(game?.maxTeams || 2);
  const [hasCategories, setHasCategories] = useState(!!game?.categoryRequirements);
  const [categoryRequirements, setCategoryRequirements] = useState<{ [key in PlayerCategory]?: number }>(
    game?.categoryRequirements || {}
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const gameData: Omit<Game, 'id'> = {
      name,
      type,
      playersPerTeam,
      maxTeams,
      ...(hasCategories && { categoryRequirements })
    };
    onSubmit(gameData);
  };

  const handleCategoryChange = (category: PlayerCategory, value: number) => {
    setCategoryRequirements(prev => ({
      ...prev,
      [category]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {game ? 'تعديل لعبة' : 'إضافة لعبة جديدة'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              اسم اللعبة
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              نوع اللعبة
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as GameType)}
              className="w-full p-2 border rounded-md"
              required
            >
              {Object.values(GameType).map((gameType) => (
                <option key={gameType} value={gameType}>
                  {gameType}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              عدد اللاعبين في الفريق
            </label>
            <input
              type="number"
              min="1"
              value={playersPerTeam}
              onChange={(e) => setPlayersPerTeam(Number(e.target.value))}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              عدد الفرق
            </label>
            <input
              type="number"
              min="2"
              value={maxTeams}
              onChange={(e) => setMaxTeams(Number(e.target.value))}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hasCategories"
              checked={hasCategories}
              onChange={(e) => setHasCategories(e.target.checked)}
              className="rounded text-blue-600"
            />
            <label htmlFor="hasCategories" className="text-sm font-medium text-gray-700">
              تفعيل متطلبات الفئات
            </label>
          </div>
          {hasCategories && (
            <div className="space-y-2">
              {Object.values(PlayerCategory).map((category) => (
                <div key={category} className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 flex-1">
                    {category}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={categoryRequirements[category] || 0}
                    onChange={(e) => handleCategoryChange(category, Number(e.target.value))}
                    className="w-20 p-2 border rounded-md"
                  />
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {game ? 'تحديث' : 'إضافة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}