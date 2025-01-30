import React, { useMemo, useState } from 'react';
import { Match, Game, Player } from '../types';
import { Trophy, Medal, Star, Award, ChevronDown, ChevronUp } from 'lucide-react';

interface StatisticsProps {
  matches: Match[];
  games: Game[];
  players: Player[];
}

interface PlayerStats {
  playerId: string;
  playerName: string;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  totalMatches: number;
  yellowCards: number;
  redCards: number;
  goals: number;
}

interface GameStats {
  gameId: string;
  gameName: string;
  playerStats: { [key: string]: PlayerStats };
}

function GameStatistics({ gameStat, games }: { gameStat: GameStats; games: Game[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const playerStatsArray = Object.values(gameStat.playerStats)
    .sort((a, b) => b.points - a.points);

  if (playerStatsArray.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-md w-full">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6" />
          <h3 className="text-xl font-bold">{gameStat.gameName}</h3>
          <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
            {playerStatsArray.length} لاعبون مؤهلون
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-6 h-6" />
        ) : (
          <ChevronDown className="w-6 h-6" />
        )}
      </button>

      {isExpanded && (
        <div className="p-6">
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
                  {gameStat.gameId === games.find(g => g.type === 'FOOTBALL')?.id && (
                    <th className="px-4 py-2 text-center">الأهداف</th>
                  )}
                  <th className="px-4 py-2 text-center">البطاقات الصفراء</th>
                  <th className="px-4 py-2 text-center">البطاقات الحمراء</th>
                </tr>
              </thead>
              <tbody>
                {playerStatsArray.map((playerStat, index) => (
                  <tr 
                    key={playerStat.playerId}
                    className={`border-t ${index < 3 ? 'bg-yellow-50' : ''} hover:bg-gray-50 transition-colors`}
                  >
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        {index === 0 && <Medal className="w-5 h-5 text-yellow-500" />}
                        {index === 1 && <Medal className="w-5 h-5 text-gray-400" />}
                        {index === 2 && <Medal className="w-5 h-5 text-amber-600" />}
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        {index < 3 && <Star className="w-4 h-4 text-yellow-500 shrink-0" />}
                        <span className="truncate">{playerStat.playerName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-center">{playerStat.totalMatches}</td>
                    <td className="px-4 py-2 text-center text-green-600">{playerStat.wins}</td>
                    <td className="px-4 py-2 text-center text-blue-600">{playerStat.draws}</td>
                    <td className="px-4 py-2 text-center text-red-600">{playerStat.losses}</td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full font-bold ${
                          playerStat.points >= 0
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {playerStat.points}
                        </span>
                        {(playerStat.yellowCards > 0 || playerStat.redCards > 0) && (
                          <span className="text-xs text-red-500">
                            -{playerStat.yellowCards * 3 + playerStat.redCards * 6}
                          </span>
                        )}
                      </div>
                    </td>
                    {gameStat.gameId === games.find(g => g.type === 'FOOTBALL')?.id && (
                      <td className="px-4 py-2 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-full font-bold bg-green-100 text-green-800">
                          {playerStat.goals}
                        </span>
                      </td>
                    )}
                    <td className="px-4 py-2 text-center">
                      {playerStat.yellowCards > 0 && (
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-yellow-400 rounded-full text-white font-bold">
                          {playerStat.yellowCards}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {playerStat.redCards > 0 && (
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-red-600 rounded-full text-white font-bold">
                          {playerStat.redCards}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
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
            </div>
            {gameStat.gameId === games.find(g => g.type === 'FOOTBALL')?.id && (
              <div className="mt-4 border-t pt-4">
                <h5 className="font-medium text-gray-700 mb-2">نقاط الأهداف:</h5>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-800 rounded-full font-bold">2</span>
                    <span>نقطة لكل هدف</span>
                  </div>
                </div>
              </div>
            )}
            <div className="mt-4 border-t pt-4">
              <h5 className="font-medium text-gray-700 mb-2">خصم النقاط للبطاقات:</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-yellow-100 text-yellow-800 rounded-full font-bold">-3</span>
                  <span>نقاط لكل بطاقة صفراء</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-800 rounded-full font-bold">-6</span>
                  <span>نقاط للبطاقة الحمراء</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Statistics({ matches, games, players }: StatisticsProps) {
  const gameStats = useMemo(() => {
    const stats: { [key: string]: GameStats } = {};

    // تهيئة الإحصائيات لكل لعبة
    games.forEach(game => {
      stats[game.id] = {
        gameId: game.id,
        gameName: game.name,
        playerStats: {}
      };

      // تهيئة إحصائيات اللاعبين لهذه اللعبة
      players.forEach(player => {
        const playerMatches = matches.filter(match => 
          match.gameId === game.id && 
          match.status === 'COMPLETED' &&
          match.teams.some(team => team.players.some(p => p.id === player.id))
        );

        if (playerMatches.length > 0) {
          stats[game.id].playerStats[player.id] = {
            playerId: player.id,
            playerName: player.name,
            wins: 0,
            draws: 0,
            losses: 0,
            points: 0,
            totalMatches: 0,
            yellowCards: 0,
            redCards: 0,
            goals: 0
          };

          playerMatches.forEach(match => {
            const playerTeam = match.teams.find(team => 
              team.players.some(p => p.id === player.id)
            );
            const otherTeam = match.teams.find(team => 
              !team.players.some(p => p.id === player.id)
            );

            if (playerTeam && otherTeam) {
              const playerStats = stats[game.id].playerStats[player.id];
              playerStats.totalMatches++;

              // نقاط المشاركة
              playerStats.points += 5;

              // نقاط النتيجة
              if (playerTeam.score > otherTeam.score) {
                playerStats.wins++;
                playerStats.points += 3; // الفوز
              } else if (playerTeam.score === otherTeam.score) {
                playerStats.draws++;
                playerStats.points += 2; // التعادل
              } else {
                playerStats.losses++;
                playerStats.points += 1; // الخسارة
              }

              const playerMatchStats = playerTeam.playerStats?.find(ps => ps.playerId === player.id);
              if (playerMatchStats) {
                // نقاط البطاقات
                if (playerMatchStats.yellowCards > 0) {
                  playerStats.yellowCards += playerMatchStats.yellowCards;
                  playerStats.points -= (3 * playerMatchStats.yellowCards); // -3 لكل بطاقة صفراء
                }
                if (playerMatchStats.redCard) {
                  playerStats.redCards++;
                  playerStats.points -= 6; // -6 للبطاقة حمراء
                }

                // نقاط الأهداف في كرة القدم
                if (game.type === 'FOOTBALL' && playerMatchStats.goals) {
                  playerStats.goals += playerMatchStats.goals;
                  playerStats.points += (2 * playerMatchStats.goals); // +2 لكل هدف
                }
              }
            }
          });
        }
      });
    });

    return stats;
  }, [matches, games, players]);

  return (
    <div className="space-y-4 w-full">
      {Object.values(gameStats).map(gameStat => (
        <GameStatistics
          key={gameStat.gameId}
          gameStat={gameStat}
          games={games}
        />
      ))}
    </div>
  );
}