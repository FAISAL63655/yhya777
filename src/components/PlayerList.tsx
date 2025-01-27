import React from 'react';
import { Player } from '../types';
import { UserCircle, Star, Edit, Trash2, BarChart } from 'lucide-react';

const gameTypeTranslations: { [key: string]: string } = {
  'FOOTBALL': 'كرة القدم',
  'VOLLEYBALL': 'كرة الطائرة',
  'BALOOT': 'بلوت',
  'CARROM': 'كيرم',
  'PLAYSTATION': 'بلايستيشن',
  'JACKAROO': 'جكارو',
  'CUSTOM': 'مخصص'
};

interface PlayerListProps {
  players: Player[];
  onEdit: (player: Player) => void;
  onDelete: (playerId: string) => void;
  onViewStats: (player: Player) => void;
}

export function PlayerList({ players, onEdit, onDelete, onViewStats }: PlayerListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {players.map((player) => (
        <div key={player.id} className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {player.image ? (
                <img 
                  src={player.image} 
                  alt={player.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <UserCircle className="w-8 h-8 text-gray-400" />
              )}
              <div>
                <h3 className="font-semibold text-gray-800">{player.name}</h3>
                <p className="text-xs text-gray-500">
                  تم الإنضمام: {new Date(player.createdAt || '').toLocaleDateString('ar-SA')}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => onViewStats(player)}
                className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                title="عرض إحصائيات اللاعب"
              >
                <BarChart className="w-5 h-5" />
              </button>
              <button 
                onClick={() => onEdit(player)}
                className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                title="تعديل بيانات اللاعب"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  if (window.confirm('هل أنت متأكد من حذف هذا اللاعب؟')) {
                    onDelete(player.id!);
                  }
                }}
                className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                title="حذف اللاعب"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600 font-medium">التقييمات:</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(player.ratings || {}).map(([game, rating]) => (
                <div key={game} className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-gray-600">{gameTypeTranslations[game] || game}: {rating}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}