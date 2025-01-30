import React, { useState, useMemo } from 'react';
import { Match, Game, Player } from '../types';
import { Trophy, Medal, Star, TrendingUp, TrendingDown, Minus, Maximize2, Minimize2 } from 'lucide-react';

interface LivePlayerRankingProps {
  players: Player[];
  matches: Match[];
  games: Game[];
  selectedGame: Game | null;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

interface PlayerStats {
  playerId: string;
  playerName: string;
  playerImage: string;
  points: number;
  wins: number;
  losses: number;
  draws: number;
  totalMatches: number;
  yellowCards: number;
  redCards: number;
}

export function LivePlayerRanking({ players, matches, games, selectedGame, isFullScreen, onToggleFullScreen }: LivePlayerRankingProps) {
  const [sortBy, setSortBy] = useState<keyof PlayerStats>('points');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const playerStats = useMemo(() => {
    const stats: PlayerStats[] = players.map(player => {
      const playerMatches = matches.filter(m => 
        (!selectedGame || m.gameId === selectedGame.id) &&
        m.status === 'COMPLETED' &&
        m.teams.some(t => t.players.some(p => p.id === player.id))
      );

      let wins = 0, losses = 0, draws = 0, points = 0;
      let yellowCards = 0, redCards = 0;

      playerMatches.forEach(match => {
        const playerTeam = match.teams.find(t => 
          t.players.some(p => p.id === player.id)
        );
        const otherTeam = match.teams.find(t => 
          !t.players.some(p => p.id === player.id)
        );

        if (playerTeam && otherTeam) {
          points += 5; // نقاط المشاركة

          if (playerTeam.score > otherTeam.score) {
            wins++;
            points += 3;
          } else if (playerTeam.score === otherTeam.score) {
            draws++;
            points += 2;
          } else {
            losses++;
            points += 1;
          }

          const playerStats = playerTeam.playerStats?.find(ps => ps.playerId === player.id);
          if (playerStats) {
            // نقاط الأهداف في كرة القدم
            const game = games.find(g => g.id === match.gameId);
            if (game?.type === 'FOOTBALL' && playerStats.goals && playerStats.goals > 0) {
              const goalsPoints = 2 * playerStats.goals;
              points += goalsPoints; // +2 لكل هدف
              console.log(`Adding ${goalsPoints} points for ${playerStats.goals} goals to ${player.name}`);
            }

            if (playerStats.yellowCards > 0) {
              yellowCards += playerStats.yellowCards;
              points -= (playerStats.yellowCards * 3);
            }
            if (playerStats.redCard) {
              redCards++;
              points -= 6;
            }
          }
        }
      });

      return {
        playerId: player.id,
        playerName: player.name,
        playerImage: player.image || '/default-player.png',
        points,
        wins,
        losses,
        draws,
        totalMatches: playerMatches.length,
        yellowCards,
        redCards
      };
    });

    return stats;
  }, [players, matches, selectedGame]);

  const handleSort = (key: keyof PlayerStats) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${isFullScreen ? 'fixed inset-0 z-50 overflow-auto' : ''}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">الترتيب المباشر</h2>
        {onToggleFullScreen && (
          <button
            onClick={onToggleFullScreen}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            {isFullScreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-right">الترتيب</th>
              <th className="px-4 py-3 text-right">اللاعب</th>
              <th className="px-4 py-3 text-right cursor-pointer group" onClick={() => handleSort('totalMatches')}>
                <div className="flex items-center gap-2">
                  <span>المباريات</span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    {sortBy === 'totalMatches' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </div>
                </div>
              </th>
              <th className="px-4 py-3 text-right cursor-pointer group" onClick={() => handleSort('wins')}>
                <div className="flex items-center gap-2">
                  <span>الفوز</span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    {sortBy === 'wins' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </div>
                </div>
              </th>
              <th className="px-4 py-3 text-right cursor-pointer group" onClick={() => handleSort('draws')}>
                <div className="flex items-center gap-2">
                  <span>التعادل</span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    {sortBy === 'draws' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </div>
                </div>
              </th>
              <th className="px-4 py-3 text-right cursor-pointer group" onClick={() => handleSort('losses')}>
                <div className="flex items-center gap-2">
                  <span>الخسارة</span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    {sortBy === 'losses' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </div>
                </div>
              </th>
              <th className="px-4 py-3">البطاقات</th>
              <th className="px-4 py-3 text-right cursor-pointer group" onClick={() => handleSort('points')}>
                <div className="flex items-center gap-2">
                  <span>النقاط</span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    {sortBy === 'points' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {playerStats.sort((a, b) => {
              const aValue = a[sortBy];
              const bValue = b[sortBy];
              return sortOrder === 'desc' ? 
                (typeof bValue === 'number' ? bValue - (aValue as number) : 0) :
                (typeof aValue === 'number' ? aValue - (bValue as number) : 0);
            }).map((stat, index) => (
              <tr
                key={stat.playerId}
                className={`border-t border-gray-200 transition-all ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                } hover:bg-blue-50 animate-fade-in`}
              >
                <td className="px-4 py-3 text-right">
                  {index < 3 ? (
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full transition-transform hover:scale-110">
                      {index === 0 && <Trophy className="w-6 h-6 text-yellow-400" />}
                      {index === 1 && <Medal className="w-6 h-6 text-gray-400" />}
                      {index === 2 && <Medal className="w-6 h-6 text-amber-600" />}
                    </span>
                  ) : (
                    <span className="text-gray-600">{index + 1}</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8 overflow-hidden rounded-full shrink-0">
                      <img
                        src={stat.playerImage}
                        alt={stat.playerName}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/default-player.png';
                        }}
                      />
                    </div>
                    <span className="truncate font-medium">{stat.playerName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-block min-w-[2rem] text-gray-900">{stat.totalMatches}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-block min-w-[2rem] text-green-600 font-medium">{stat.wins}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-block min-w-[2rem] text-blue-600">{stat.draws}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-block min-w-[2rem] text-red-600">{stat.losses}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <span className="inline-flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                      <div className="w-3 h-3 bg-yellow-400 rounded-sm"></div>
                      <span className="text-yellow-700">{stat.yellowCards}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 bg-red-50 px-2 py-1 rounded">
                      <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                      <span className="text-red-700">{stat.redCards}</span>
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block min-w-[2rem] font-bold ${
                    stat.points >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.points}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">آلية احتساب النقاط:</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-gray-700">
              <div className="w-5 h-5 flex items-center justify-center text-green-600 font-bold">+5</div>
              <span>نقاط المشاركة</span>
            </li>
            <li className="flex items-center gap-2 text-gray-700">
              <div className="w-5 h-5 flex items-center justify-center text-green-600 font-bold">+3</div>
              <span>نقاط للفوز</span>
            </li>
            <li className="flex items-center gap-2 text-gray-700">
              <div className="w-5 h-5 flex items-center justify-center text-blue-600 font-bold">+2</div>
              <span>نقطة للتعادل</span>
            </li>
            <li className="flex items-center gap-2 text-gray-700">
              <div className="w-5 h-5 flex items-center justify-center text-orange-600 font-bold">+1</div>
              <span>نقطة للخسارة</span>
            </li>
            <li className="flex items-center gap-2 text-gray-700">
              <div className="w-5 h-5 flex items-center justify-center text-green-600 font-bold">+2</div>
              <span>نقطة لكل هدف</span>
            </li>
            <li className="flex items-center gap-2 text-gray-700">
              <div className="w-5 h-5 flex items-center justify-center text-red-600 font-bold">-3</div>
              <span>نقاط للبطاقة الصفراء</span>
            </li>
            <li className="flex items-center gap-2 text-gray-700">
              <div className="w-5 h-5 flex items-center justify-center text-red-600 font-bold">-6</div>
              <span>نقاط للبطاقة الحمراء</span>
            </li>
          </ul>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">الرموز:</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-700">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span>المركز الأول</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Medal className="w-5 h-5 text-gray-400" />
                <span>المركز الثاني</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-700">
                <Medal className="w-5 h-5 text-amber-600" />
                <span>المركز الثالث</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Star className="w-5 h-5 text-gray-400" />
                <span>باقي المراكز</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
