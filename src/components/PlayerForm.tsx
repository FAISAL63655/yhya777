import React, { useState, useRef } from 'react';
import { Player, Game } from '../types';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

interface PlayerFormProps {
  games: Game[];
  player?: Player;
  onSubmit: (player: Omit<Player, 'id'>) => void;
  onCancel: () => void;
}

export function PlayerForm({ games, player, onSubmit, onCancel }: PlayerFormProps) {
  const [name, setName] = useState(player?.name || '');
  const [ratings, setRatings] = useState<{ [key: string]: number }>(
    player?.ratings || games.reduce((acc, game) => ({ ...acc, [game.type]: 0 }), {})
  );
  const [image, setImage] = useState<string>(player?.image || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        alert('حجم الصورة كبير جداً. الرجاء اختيار صورة أصغر من 5 ميجابايت');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      ratings,
      image,
      createdAt: player?.createdAt || new Date(),
      updatedAt: new Date()
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {player ? 'تعديل لاعب' : 'إضافة لاعب جديد'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
              {image ? (
                <img src={image} alt={name} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-12 h-12 text-gray-400" />
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity flex items-center justify-center group"
              >
                <Upload className="w-6 h-6 text-white opacity-0 group-hover:opacity-100" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {image ? 'تغيير الصورة' : 'إضافة صورة'}
            </button>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              اسم اللاعب
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
            <p className="block text-sm font-medium text-gray-700 mb-2">التقييمات</p>
            <div className="space-y-2">
              {games.map((game) => (
                <div key={game.type} className="flex items-center gap-2">
                  <label htmlFor={`rating-${game.type}`} className="text-sm text-gray-600 flex-1">
                    {game.name}
                  </label>
                  <input
                    type="number"
                    id={`rating-${game.type}`}
                    min="0"
                    max="10"
                    value={ratings[game.type]}
                    onChange={(e) => setRatings(prev => ({
                      ...prev,
                      [game.type]: Number(e.target.value)
                    }))}
                    className="w-20 px-3 py-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              {player ? 'حفظ التغييرات' : 'إضافة اللاعب'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}