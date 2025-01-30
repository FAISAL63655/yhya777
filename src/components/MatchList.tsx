import React, { useState, useEffect } from 'react';
import { Match, Game, Player, PlayerMatchStats } from '../types';
import { Calendar, Users, Trophy, Trash2, Save, Edit, X, Clock, Play, CheckCircle } from 'lucide-react';

interface MatchListProps {
  matches: Match[];
  games: Game[];
  players: Player[];
  onUpdateMatch: (match: Match) => void;
  onDeleteMatch: (matchId: string) => void;
}

export function MatchList({ matches, games, players, onUpdateMatch, onDeleteMatch }: MatchListProps) {
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<string>(() => {
    const saved = localStorage.getItem('selectedGameId');
    return saved || games[0]?.id || '';
  });
  const [selectedRound, setSelectedRound] = useState<number>(() => {
    const saved = parseInt(localStorage.getItem('selectedRound') || '0');
    return isNaN(saved) ? 0 : saved;
  });
  const [editedMatches, setEditedMatches] = useState<{ [key: string]: Match }>({});

  // حفظ التغييرات في localStorage
  useEffect(() => {
    localStorage.setItem('selectedGameId', selectedGameId);
    localStorage.setItem('selectedRound', selectedRound.toString());
  }, [selectedGameId, selectedRound]);

  const getGameById = (gameId: string) => games.find(g => g.id === gameId);

  const handleScoreChange = (match: Match, teamIndex: number, newScore: number) => {
    const updatedMatch = { ...match };
    updatedMatch.teams[teamIndex].score = newScore;
    setEditedMatches(prev => ({ ...prev, [match.id]: updatedMatch }));
  };

  const handlePlayerStats = (match: Match, teamIndex: number, playerId: string, statType: 'goals' | 'yellowCards' | 'redCard', increment: boolean = true) => {
    const updatedMatch = { ...match };
    const team = updatedMatch.teams[teamIndex];
    if (!team.playerStats) {
      team.playerStats = [];
    }
    const playerStats: PlayerMatchStats = (team.playerStats?.find(ps => ps.playerId === playerId) || {
      playerId,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCard: false
    }) as PlayerMatchStats;

    if (statType === 'goals') {
      playerStats.goals = increment 
        ? (playerStats.goals || 0) + 1 
        : Math.max(0, (playerStats.goals || 0) - 1);
    } else if (statType === 'yellowCards') {
      if (increment) {
        // إذا كان اللاعب لديه بطاقة حمراء، لا يمكن إضافة بطاقة صفراء
        if (playerStats.redCard) return;

        playerStats.yellowCards = (playerStats.yellowCards || 0) + 1;
        // إذا وصل اللاعب إلى بطاقتين صفراء، يحصل على بطاقة حمراء
        if (playerStats.yellowCards === 2) {
          playerStats.redCard = true;
          playerStats.yellowCards = 0;
        }
      } else {
        // إذا كان اللاعب لديه بطاقة حمراء من بطاقتين صفراء
        // وتم إنقاص البطاقة الصفراء، يجب إزالة البطاقة الحمراء
        if (playerStats.redCard) {
          playerStats.redCard = false;
          playerStats.yellowCards = 1;
        } else {
          playerStats.yellowCards = Math.max(0, (playerStats.yellowCards || 0) - 1);
        }
      }
    } else if (statType === 'redCard') {
      playerStats.redCard = !playerStats.redCard;
      // عند إزالة البطاقة الحمراء المباشرة، نتأكد من إزالة البطاقات الصفراء أيضاً
      if (!playerStats.redCard) {
        playerStats.yellowCards = 0;
      }
    }

    // تحديث إحصائيات اللاعب في الفريق
    const playerStatsIndex = team.playerStats.findIndex(ps => ps.playerId === playerId);
    if (playerStatsIndex === -1) {
      team.playerStats.push(playerStats);
    } else {
      team.playerStats[playerStatsIndex] = playerStats;
    }

    setEditedMatches(prev => ({ ...prev, [match.id]: updatedMatch }));
  };

  const handleSaveMatch = (match: Match) => {
    const updatedMatch = editedMatches[match.id] || match;
    onUpdateMatch(updatedMatch);
    setEditingMatchId(null);
    setEditedMatches(prev => {
      const newState = { ...prev };
      delete newState[match.id];
      return newState;
    });
  };

  const handleDeleteMatch = (matchId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المواجهة؟')) {
      onDeleteMatch(matchId);
    }
  };

  const handleToggleMatchStatus = (match: Match) => {
    const updatedMatch: Match = {
      ...match,
      status: match.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
    };
    onUpdateMatch(updatedMatch);
  };

  const filteredMatches = matches
    .filter(match => !selectedGameId || match.gameId === selectedGameId)
    .filter(match => !selectedRound || match.round === selectedRound)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const uniqueRounds = Array.from(new Set(matches.map(m => m.round))).sort((a, b) => a - b);

  return (
    <>
      <div className="space-y-4">
        {/* تبويبات المسابقات */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4 overflow-x-auto pb-1 rtl:space-x-reverse" dir="rtl">
            <button
              onClick={() => setSelectedGameId('')}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                selectedGameId === ''
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              جميع المسابقات
            </button>
            {games.map((game) => (
              <button
                key={game.id}
                onClick={() => setSelectedGameId(game.id)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                  selectedGameId === game.id
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {game.name}
              </button>
            ))}
          </nav>
        </div>

        {/* تبويبات الجولات */}
        {selectedGameId && (
          <div className="border-b border-gray-200 mt-4">
            <nav className="flex space-x-4 overflow-x-auto pb-1 rtl:space-x-reverse" dir="rtl">
              <button
                onClick={() => setSelectedRound(0)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                  selectedRound === 0
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                جميع الجولات
              </button>
              {uniqueRounds.map((round) => (
                <button
                  key={round}
                  onClick={() => setSelectedRound(round)}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                    selectedRound === round
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  الجولة {round}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* عرض المباريات */}
        <div className="grid gap-4 mt-6">
          {filteredMatches.length > 0 ? (
            filteredMatches.map((match) => {
              const game = getGameById(match.gameId);
              const isEditing = editingMatchId === match.id;
              const editedMatch = editedMatches[match.id] || match;

              return (
                <div key={match.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <h3 className="font-semibold">{game?.name}</h3>
                      <span className="text-sm text-gray-500">
                        (الجولة {match.round})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingMatchId(isEditing ? null : match.id)}
                        className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                        title={isEditing ? 'إلغاء التعديل' : 'تعديل المواجهة'}
                      >
                        {isEditing ? <X className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
                      </button>
                      {isEditing && (
                        <button
                          onClick={() => handleSaveMatch(match)}
                          className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                          title="حفظ التغييرات"
                        >
                          <Save className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleMatchStatus(match)}
                        className={`p-1 transition-colors ${
                          match.status === 'COMPLETED'
                            ? 'text-green-600 hover:text-green-700'
                            : 'text-gray-500 hover:text-green-600'
                        }`}
                        title={match.status === 'COMPLETED' ? 'تعيين كقيد التنفيذ' : 'تعيين كمكتملة'}
                      >
                        {match.status === 'COMPLETED' ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteMatch(match.id)}
                        className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                        title="حذف المواجهة"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{match.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        match.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {match.status === 'COMPLETED' ? 'مكتملة' : 'قيد التنفيذ'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {editedMatch.teams.map((team, teamIndex) => (
                      <div key={team.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{team.name}</h4>
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              value={team.score || 0}
                              onChange={(e) => handleScoreChange(match, teamIndex, Number(e.target.value))}
                              className="w-20 px-2 py-1 border rounded-md"
                            />
                          ) : (
                            <span className="text-lg font-semibold">{team.score || 0}</span>
                          )}
                        </div>

                        <div className="space-y-1">
                          {team.players.map((player) => {
                            if (!team.playerStats) {
                              team.playerStats = [];
                            }
                            const playerStats: PlayerMatchStats = (team.playerStats?.find(ps => ps.playerId === player.id) || {
                              playerId: player.id,
                              goals: 0,
                              assists: 0,
                              yellowCards: 0,
                              redCard: false
                            }) as PlayerMatchStats;

                            return (
                              <div key={player.id} className="flex items-center justify-between text-sm">
                                <span>{player.name}</span>
                                {isEditing && game?.type === 'FOOTBALL' && (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handlePlayerStats(match, teamIndex, player.id, 'goals', true)}
                                      className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                                      disabled={playerStats.redCard}
                                      title={playerStats.redCard ? 'لا يمكن تسجيل أهداف للاعب مطرود' : 'تسجيل هدف'}
                                    >
                                      +⚽️
                                    </button>
                                    {playerStats.goals! > 0 && (
                                      <button
                                        onClick={() => handlePlayerStats(match, teamIndex, player.id, 'goals', false)}
                                        className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                                        title="إنقاص هدف"
                                      >
                                        -⚽️
                                      </button>
                                    )}
                                    <span className="text-xs font-medium">
                                      {playerStats.goals! || 0}
                                    </span>
                                    <button
                                      onClick={() => handlePlayerStats(match, teamIndex, player.id, 'yellowCards', true)}
                                      className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                                      disabled={playerStats.redCard}
                                      title={playerStats.redCard ? 'اللاعب مطرود' : 'إضافة بطاقة صفراء'}
                                    >
                                      🟨
                                    </button>
                                    {playerStats.yellowCards > 0 && (
                                      <button
                                        onClick={() => handlePlayerStats(match, teamIndex, player.id, 'yellowCards', false)}
                                        className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                                        title="إنقاص بطاقة صفراء"
                                      >
                                        -🟨
                                      </button>
                                    )}
                                    <span className="text-xs font-medium">
                                      {playerStats.yellowCards || 0}/2
                                    </span>
                                    <button
                                      onClick={() => handlePlayerStats(match, teamIndex, player.id, 'redCard')}
                                      className={`px-2 py-1 text-xs rounded ${
                                        playerStats.redCard
                                          ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                                      }`}
                                      title={playerStats.redCard ? 'إلغاء البطاقة الحمراء' : 'إضافة بطاقة حمراء'}
                                    >
                                      🟥
                                    </button>
                                  </div>
                                )}
                                {!isEditing && (
                                  <div className="flex items-center gap-2">
                                    {playerStats.goals! > 0 && (
                                      <span className="text-xs bg-green-50 text-green-800 px-2 py-1 rounded">
                                        ⚽️ {playerStats.goals!}
                                      </span>
                                    )}
                                    {playerStats.yellowCards > 0 && (
                                      <span className="text-xs bg-yellow-50 text-yellow-800 px-2 py-1 rounded">
                                        🟨 {playerStats.yellowCards}
                                      </span>
                                    )}
                                    {playerStats.redCard && (
                                      <span className="text-xs bg-red-50 text-red-800 px-2 py-1 rounded" title={playerStats.yellowCards === 2 ? 'طرد (بطاقتين صفراء)' : 'طرد مباشر'}>
                                        🟥
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })) : (
              <p className="text-center text-gray-500">لا توجد مباريات</p>
            )}
          </div>
        </div>
      </>
  );
}