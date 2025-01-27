import React from 'react';
import { Trophy, Users, Activity, Edit, Trash2, Gamepad2, Dices, PlusCircle } from 'lucide-react';
import { Game } from '../types';

interface GameCardProps {
  game: Game;
  onSelect: (game: Game) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function GameCard({ game, onSelect, onEdit, onDelete }: GameCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">{game.name}</h3>
        <div className="flex items-center gap-2">
          {game.type === 'FOOTBALL' && <Trophy className="w-6 h-6 text-green-500" />}
          {game.type === 'VOLLEYBALL' && <Activity className="w-6 h-6 text-blue-500" />}
          {game.type === 'BALOOT' && <Users className="w-6 h-6 text-purple-500" />}
          {game.type === 'CARROM' && <Dices className="w-6 h-6 text-orange-500" />}
          {game.type === 'PLAYSTATION' && <Gamepad2 className="w-6 h-6 text-indigo-500" />}
          {game.type === 'JACKAROO' && <Users className="w-6 h-6 text-pink-500" />}
          {game.type === 'CUSTOM' && <Users className="w-6 h-6 text-gray-500" />}
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <p className="text-sm text-gray-600">
          عدد اللاعبين في كل فريق: {game.playersPerTeam}
        </p>
        <p className="text-sm text-gray-600">
          عدد الفرق: {game.maxTeams}
        </p>
        {game.categoryRequirements && (
          <div className="text-sm text-gray-600">
            <p>متطلبات الفئات:</p>
            <ul className="list-disc list-inside">
              {Object.entries(game.categoryRequirements).map(([category, count]) => (
                <li key={category}>
                  الفئة {category}: {count} لاعبين
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => onSelect(game)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          <PlusCircle className="w-5 h-5" />
          إنشاء مواجهة
        </button>
        <div className="flex gap-2">
          <button 
            onClick={onEdit}
            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button 
            onClick={onDelete}
            className="p-1 text-gray-500 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}