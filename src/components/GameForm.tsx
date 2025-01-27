import React, { useState } from 'react';
import { Game, PlayerCategory } from '../types';
import { X } from 'lucide-react';

interface GameFormProps {
  game?: Game;
  onSubmit: (game: Omit<Game, 'id'>) => void;
  onClose: () => void;
}

export function GameForm({ game, onSubmit, onClose }: GameFormProps) {
  const [name, setName] = useState(game?.name || '');
  const [type, setType] = useState(game?.type || 'CUSTOM');
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              اسم اللعبة
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              نوع اللعبة
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as Game['type'])}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="FOOTBALL">كرة القدم</option>
              <option value="VOLLEYBALL">الكرة الطائرة</option>
              <option value="BALOOT">البلوت</option>
              <option value="CARROM">الكيرم</option>
              <option value="PLAYSTATION">البلايستيشن</option>
              <option value="JACKAROO">الجاكارو</option>
              <option value="CUSTOM">لعبة مخصصة</option>
            </select>
          </div>

          <div>
            <label htmlFor="playersPerTeam" className="block text-sm font-medium text-gray-700 mb-1">
              عدد اللاعبين في كل فريق
            </label>
            <input
              type="number"
              id="playersPerTeam"
              min="1"
              value={playersPerTeam}
              onChange={(e) => setPlayersPerTeam(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="maxTeams" className="block text-sm font-medium text-gray-700 mb-1">
              عدد الفرق
            </label>
            <input
              type="number"
              id="maxTeams"
              min="2"
              value={maxTeams}
              onChange={(e) => setMaxTeams(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hasCategories"
                checked={hasCategories}
                onChange={(e) => setHasCategories(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="hasCategories" className="text-sm font-medium text-gray-700">
                تفعيل متطلبات الفئات
              </label>
            </div>

            {hasCategories && (
              <div className="space-y-2 mt-2">
                <p className="text-sm font-medium text-gray-700">متطلبات الفئات:</p>
                {(['A', 'B', 'C', 'D'] as PlayerCategory[]).map((category) => (
                  <div key={category} className="flex items-center gap-2">
                    <label htmlFor={`category-${category}`} className="text-sm text-gray-600 w-20">
                      الفئة {category}:
                    </label>
                    <input
                      type="number"
                      id={`category-${category}`}
                      min="0"
                      value={categoryRequirements[category] || 0}
                      onChange={(e) => handleCategoryChange(category, Number(e.target.value))}
                      className="w-20 px-3 py-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="text-sm text-gray-500">لاعب</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              {game ? 'حفظ التغييرات' : 'إضافة اللعبة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}