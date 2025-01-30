import React from 'react';
import { Match, Game, Player } from '../types';
import { Trophy, Medal, Star, Activity, Users, Gamepad2, Dices } from 'lucide-react';

interface PlayerStatisticsProps {
  matches: Match[];
  games: Game[];
  players: Player[];
}

function getGameIcon(type: Game['type']) {
  switch (type) {
    case 'FOOTBALL':
      return <Trophy className="w-5 h-5 text-green-500" />;
    case 'VOLLEYBALL':
      return <Activity className="w-5 h-5 text-blue-500" />;
    case 'BALOOT':
      return <Users className="w-5 h-5 text-purple-500" />;
    case 'CARROM':
      return <Dices className="w-5 h-5 text-orange-500" />;
    case 'PLAYSTATION':
      return <Gamepad2 className="w-5 h-5 text-indigo-500" />;
    case 'JACKAROO':
      return <Users className="w-5 h-5 text-pink-500" />;
    default:
      return <Users className="w-5 h-5 text-gray-500" />;
  }
}

export function PlayerStatistics({ matches, games, players }: PlayerStatisticsProps) {
  const playerStats = React.useMemo(() => {
    const stats = new Map<string, {
      totalPoints: number;
      totalMatches: number;
      totalWins: number;
      totalDraws: number;
      totalLosses: number;
      totalYellowCards: number;
      totalRedCards: number;
      gameStats: Map<string, {
        wins: number;
        draws: number;
        losses: number;
        points: number;
        totalMatches: number;
        yellowCards: number;
        redCards: number;
        rank: number;
        totalPlayers: number;
      }>;
    }>();

    players.forEach(player => {
      stats.set(player.id, {
        totalPoints: 0,
        totalMatches: 0,
        totalWins: 0,
        totalDraws: 0,
        totalLosses: 0,
        totalYellowCards: 0,
        totalRedCards: 0,
        gameStats: new Map()
      });

      games.forEach(game => {
        if (game) {
          const gameMatches = matches.filter(m => 
            m.gameId === game.id && 
            m.status === 'COMPLETED' &&
            m.teams.some(t => t.players.some(p => p.id === player.id))
          );

          let wins = 0, draws = 0, losses = 0, points = 0;
          let yellowCards = 0, redCards = 0;

          gameMatches.forEach(match => {
            const playerTeam = match.teams.find(t => 
              t.players.some(p => p.id === player.id)
            );
            const otherTeam = match.teams.find(t => 
              !t.players.some(p => p.id === player.id)
            );

            if (playerTeam && otherTeam) {
              // أساسي: نقاط المشاركة
              points += 5;

              // نقاط النتيجة
              if (playerTeam.score > otherTeam.score) {
                wins++;
                points += 3; // الفوز
              } else if (playerTeam.score === otherTeam.score) {
                draws++;
                points += 2; // التعادل
              } else {
                losses++;
                points += 1; // الخسارة
              }

              const playerMatchStats = playerTeam.playerStats?.find(ps => ps.playerId === player.id);
              if (playerMatchStats) {
                // نقاط البطاقات
                if (playerMatchStats.yellowCards > 0) {
                  yellowCards += playerMatchStats.yellowCards;
                  points -= (3 * playerMatchStats.yellowCards); // -3 لكل بطاقة صفراء
                }
                if (playerMatchStats.redCard) {
                  redCards++;
                  points -= 6; // -6 للبطاقة الحمراء
                }

                // نقاط الأهداف في كرة القدم
                if (game.type === 'FOOTBALL' && playerMatchStats.goals) {
                  points += (2 * playerMatchStats.goals); // +2 لكل هدف
                }
              }
            }
          });

          const allPlayersInGame = players.filter(p => {
            const playerMatches = matches.filter(m => 
              m.gameId === game.id && 
              m.status === 'COMPLETED' &&
              m.teams.some(t => t.players.some(pl => pl.id === p.id))
            );
            return playerMatches.length > 0;
          });

          const playerRanks = allPlayersInGame
            .map(p => {
              const pMatches = matches.filter(m => 
                m.gameId === game.id && 
                m.status === 'COMPLETED' &&
                m.teams.some(t => t.players.some(pl => pl.id === p.id))
              );

              let pPoints = 0;
              pMatches.forEach(m => {
                const pTeam = m.teams.find(t => t.players.some(pl => pl.id === p.id));
                const oTeam = m.teams.find(t => !t.players.some(pl => pl.id === p.id));
                if (pTeam && oTeam) {
                  // أساسي: نقاط المشاركة
                  pPoints += 5;

                  // نقاط النتيجة
                  if (pTeam.score > oTeam.score) {
                    pPoints += 3; // الفوز
                  } else if (pTeam.score === oTeam.score) {
                    pPoints += 2; // التعادل
                  } else {
                    pPoints += 1; // الخسارة
                  }

                  const pStats = pTeam.playerStats?.find(ps => ps.playerId === p.id);
                  if (pStats) {
                    // نقاط البطاقات
                    if (pStats.yellowCards > 0) {
                      pPoints -= (3 * pStats.yellowCards); // -3 لكل بطاقة صفراء
                    }
                    if (pStats.redCard) {
                      pPoints -= 6; // -6 للبطاقة الحمراء
                    }

                    // نقاط الأهداف في كرة القدم
                    if (game.type === 'FOOTBALL' && pStats.goals) {
                      pPoints += (2 * pStats.goals); // +2 لكل هدف
                    }
                  }
                }
              });

              return { playerId: p.id, points: pPoints };
            })
            .sort((a, b) => b.points - a.points);

          const rank = playerRanks.findIndex(p => p.playerId === player.id) + 1;

          const playerStats = stats.get(player.id)!;
          playerStats.gameStats.set(game.id, {
            wins,
            draws,
            losses,
            points,
            totalMatches: gameMatches.length,
            yellowCards,
            redCards,
            rank,
            totalPlayers: allPlayersInGame.length
          });

          playerStats.totalPoints += points;
          playerStats.totalMatches += gameMatches.length;
          playerStats.totalWins += wins;
          playerStats.totalDraws += draws;
          playerStats.totalLosses += losses;
          playerStats.totalYellowCards += yellowCards;
          playerStats.totalRedCards += redCards;
        }
      });
    });

    return stats;
  }, [matches, games, players]);

  const sortedPlayers = [...players]
    .filter(player => playerStats.get(player.id)?.gameStats.size! > 0)
    .sort((a, b) => {
      const statsA = playerStats.get(a.id)!;
      const statsB = playerStats.get(b.id)!;
      return statsB.totalPoints - statsA.totalPoints;
    });

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">الدوري النقطي لاجتماع اليحيى</h2>
        <div className="text-gray-600">
          {sortedPlayers.length} لاعبون مؤهلون
        </div>
      </div>
      <div className="w-full">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-right">المركز</th>
              <th className="px-4 py-2 text-right">اللاعب</th>
              <th className="px-4 py-2 text-center">المباريات</th>
              <th className="px-4 py-2 text-center">فوز</th>
              <th className="px-4 py-2 text-center">تعادل</th>
              <th className="px-4 py-2 text-center">خسارة</th>
              <th className="px-4 py-2 text-center">النقاط</th>
              <th className="px-4 py-2 text-center">البطاقات</th>
              {games.map(game => (
                <th key={game.id} className="px-4 py-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {getGameIcon(game.type)}
                    <span>{game.name}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, index) => {
              const stats = playerStats.get(player.id)!;
              return (
                <tr key={player.id} className={`border-t ${index < 3 ? 'bg-yellow-50' : ''} hover:bg-gray-50 transition-colors`}>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      {index < 3 && (
                        <Medal className={`w-4 h-4 ${
                          index === 0 ? 'text-yellow-500' :
                          index === 1 ? 'text-gray-400' :
                          'text-amber-600'
                        }`} />
                      )}
                      <span className="font-medium">{index + 1}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-8 overflow-hidden rounded-full shrink-0">
                        <img
                          src={player.image || '/default-player.png'}
                          alt={player.name}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/default-player.png';
                          }}
                        />
                      </div>
                      <span className="truncate">{player.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center">{stats.totalMatches}</td>
                  <td className="px-4 py-2 text-center text-green-600">{stats.totalWins}</td>
                  <td className="px-4 py-2 text-center text-blue-600">{stats.totalDraws}</td>
                  <td className="px-4 py-2 text-center text-red-600">{stats.totalLosses}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full font-bold ${
                      stats.totalPoints >= 0 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {stats.totalPoints}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-center gap-2">
                      {stats.totalYellowCards > 0 && (
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-yellow-400 rounded-full text-white font-bold">
                          {stats.totalYellowCards}
                        </span>
                      )}
                      {stats.totalRedCards > 0 && (
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-red-600 rounded-full text-white font-bold">
                          {stats.totalRedCards}
                        </span>
                      )}
                    </div>
                  </td>
                  {games.map(game => {
                    const gameStats = stats.gameStats.get(game.id);
                    if (!gameStats) {
                      return (
                        <td key={game.id} className="px-4 py-2 text-center text-gray-400">
                          -
                        </td>
                      );
                    }
                    return (
                      <td key={game.id} className="px-4 py-2">
                        <div className="flex flex-col items-center gap-1">
                          <div className="text-xs text-gray-500">
                            {gameStats.rank} / {gameStats.totalPlayers}
                          </div>
                          <div className="text-sm font-medium">
                            {gameStats.points} نقطة
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg w-full">
        <h4 className="font-medium text-gray-700 mb-2">نظام النقاط:</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-800 rounded-full font-bold">5</span>
            <span>نقاط المشاركة</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-800 rounded-full font-bold">3</span>
            <span>نقاط للفوز</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full font-bold">2</span>
            <span>نقطة للتعادل</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-800 rounded-full font-bold">1</span>
            <span>نقطة للخسارة</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-flex items-center justify-center w-8 h-8 bg-yellow-100 text-yellow-800 rounded-full font-bold">2</span>
            <span>نقطة لكل هدف</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-flex items-center justify-center w-8 h-8 bg-yellow-100 text-yellow-800 rounded-full font-bold">-3</span>
            <span>نقاط للبطاقة الصفراء</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-800 rounded-full font-bold">-6</span>
            <span>نقاط للبطاقة الحمراء</span>
          </div>
        </div>
      </div>
    </div>
  );
}