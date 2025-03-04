import React, { useState } from 'react';
import { Game, Player, Match, Team, PlayerMatchStats, GameType } from '../types';
import { X, Users, Trophy, Shuffle, AlertCircle, CheckCircle } from 'lucide-react';

interface MatchFormProps {
  game: Game;
  players: Player[];
  matches: Match[];
  onSubmit: (match: Omit<Match, 'id'> | Omit<Match, 'id'>[]) => void;
  onClose: () => void;
}

export function MatchForm({ game, players, matches, onSubmit, onClose }: MatchFormProps) {
  const [teams, setTeams] = useState<Team[]>(() => {
    const initialTeams: Team[] = Array(game.maxTeams).fill(null).map((_, index) => ({
      id: `team-${index + 1}`,
      name: `فريق ${index + 1}`,
      players: [] as Player[],
      score: 0,
      playerStats: [] as PlayerMatchStats[]
    }));
    return initialTeams;
  });
  
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>(
    players.filter(player => (player.ratings[game.type] || 0) > 0)
  );
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [proposedMatches, setProposedMatches] = useState<Array<Omit<Match, 'id'>>>([]);
  const [showPreview, setShowPreview] = useState(false);

  // دالة لحساب قوة الفريق
  const calculateTeamStrength = (players: Player[], gameType: GameType): number => {
    return players.reduce((sum, player) => sum + (player.ratings[gameType] || 0), 0);
  };

  // دالة لتوزيع اللاعبين بشكل متكافئ
  const createBalancedTeams = (availablePlayers: Player[], round: number, previousMatches: Match[] = []): Team[] => {
    const playersPerTeam = game.playersPerTeam;
    const totalTeamsNeeded = Math.ceil(availablePlayers.length / playersPerTeam);

    // ترتيب اللاعبين حسب التقييم من الأعلى إلى الأدنى
    const sortedPlayers = [...availablePlayers].sort((a, b) => 
      (b.ratings[game.type] || 0) - (a.ratings[game.type] || 0)
    );

    // تقسيم اللاعبين إلى مستويات
    const playerLevels: Player[][] = [];
    const levelSize = Math.ceil(sortedPlayers.length / 4); // تقسيم اللاعبين إلى 4 مستويات

    for (let i = 0; i < sortedPlayers.length; i += levelSize) {
      playerLevels.push(sortedPlayers.slice(i, i + levelSize));
    }

    // إنشاء الفرق الفارغة
    const teams: Team[] = Array(totalTeamsNeeded).fill(null).map((_, index) => ({
      id: `team-${round}-${index + 1}`,
      name: `فريق ${index + 1}`,
      players: [],
      score: 0,
      playerStats: []
    }));

    // دالة للحصول على زملاء الجولة السابقة
    const getPreviousTeammates = (playerId: string): string[] => {
      const teammates = new Set<string>();
      previousMatches.forEach(match => {
        match.teams.forEach(team => {
          if (team.players.some(p => p.id === playerId)) {
            team.players.forEach(p => {
              if (p.id !== playerId) {
                teammates.add(p.id);
              }
            });
          }
        });
      });
      return Array.from(teammates);
    };

    // توزيع اللاعبين من كل مستوى على الفرق
    for (const level of playerLevels) {
      let currentTeamIndex = 0;
      const playersInLevel = [...level];

      while (playersInLevel.length > 0) {
        const team = teams[currentTeamIndex];
        
        // تخطي الفرق المكتملة
        if (team.players.length >= playersPerTeam) {
          currentTeamIndex = (currentTeamIndex + 1) % teams.length;
          continue;
        }

        // البحث عن أفضل لاعب متاح للفريق الحالي
        let bestPlayerIndex = -1;
        let bestBalanceScore = -Infinity;
        let bestFallbackIndex = -1; // مؤشر احتياطي لأفضل لاعب متاح بغض النظر عن الزملاء السابقين

        for (let i = 0; i < playersInLevel.length; i++) {
          const player = playersInLevel[i];

          // حساب درجة التوازن
          const currentTeamStrength = calculateTeamStrength(team.players, game.type);
          const playerRating = player.ratings[game.type] || 0;
          const newAverage = (currentTeamStrength + playerRating) / (team.players.length + 1);

          // حساب متوسط قوة جميع الفرق
          let totalStrength = 0;
          let totalPlayers = 0;
          teams.forEach(t => {
            if (t.players.length > 0) {
              totalStrength += calculateTeamStrength(t.players, game.type);
              totalPlayers += t.players.length;
            }
          });
          const globalAverage = totalPlayers > 0 ? totalStrength / totalPlayers : 0;

          // كلما كان الفرق بين متوسط الفريق والمتوسط العام أقل، كان أفضل
          const balanceScore = -Math.abs(newAverage - globalAverage);

          // تحديث أفضل لاعب احتياطي
          if (bestFallbackIndex === -1 || balanceScore > bestBalanceScore) {
            bestFallbackIndex = i;
          }

          // التحقق من الزملاء السابقين فقط في الجولة الثانية
          if (round > 1) {
            const hasPreviousTeammates = team.players.some(p => 
              getPreviousTeammates(player.id).includes(p.id)
            );
            
            if (!hasPreviousTeammates && balanceScore > bestBalanceScore) {
              bestBalanceScore = balanceScore;
              bestPlayerIndex = i;
            }
          } else if (balanceScore > bestBalanceScore) {
            bestBalanceScore = balanceScore;
            bestPlayerIndex = i;
          }
        }

        // إذا لم نجد لاعباً مناسباً، نستخدم اللاعب الاحتياطي
        if (bestPlayerIndex === -1) {
          bestPlayerIndex = bestFallbackIndex;
        }

        // إضافة اللاعب المختار للفريق
        if (bestPlayerIndex !== -1) {
          const player = playersInLevel[bestPlayerIndex];
          team.players.push(player);
          if (!team.playerStats) {
            team.playerStats = [];
          }
          team.playerStats.push({
            playerId: player.id,
            goals: 0,
            yellowCards: 0,
            redCard: false
          });
          playersInLevel.splice(bestPlayerIndex, 1);
        }

        // الانتقال للفريق التالي
        currentTeamIndex = (currentTeamIndex + 1) % teams.length;
      }
    }

    // التحقق من اكتمال الفرق
    const incompleteTeams = teams.filter(team => team.players.length < playersPerTeam);
    if (incompleteTeams.length > 0) {
      // إعادة توزيع اللاعبين من الفرق الزائدة إلى الفرق غير المكتملة
      const extraTeams = teams.filter(team => team.players.length > playersPerTeam);
      for (const team of incompleteTeams) {
        while (team.players.length < playersPerTeam && extraTeams.length > 0) {
          const sourceTeam = extraTeams[0];
          if (sourceTeam.players.length > playersPerTeam) {
            if (!sourceTeam.playerStats) {
              sourceTeam.playerStats = [];
            }
            const player = sourceTeam.players.pop()!;
            const playerStat = sourceTeam.playerStats.pop()!;
            team.players.push(player);
            if (!team.playerStats) {
              team.playerStats = [];
            }
            team.playerStats.push(playerStat);
          } else {
            extraTeams.shift();
          }
        }
      }
    }

    // ترتيب الفرق حسب قوتها
    const sortedTeams = [...teams].sort((a, b) => {
      const strengthA = calculateTeamStrength(a.players, game.type) / a.players.length;
      const strengthB = calculateTeamStrength(b.players, game.type) / b.players.length;
      return strengthB - strengthA;
    });

    // إنشاء المواجهات المتكافئة
    const balancedTeams: Team[] = [];
    for (let i = 0; i < sortedTeams.length; i += 2) {
      balancedTeams.push(sortedTeams[i]);
      if (i + 1 < sortedTeams.length) {
        balancedTeams.push(sortedTeams[i + 1]);
      }
    }

    return balancedTeams;
  };

  // دالة لإنشاء المواجهات المقترحة
  const generateProposedMatches = () => {
    const qualifiedPlayers = players.filter(player => (player.ratings[game.type] || 0) > 0);
    
    // التحقق من عدد اللاعبين
    const minPlayersNeeded = game.playersPerTeam * 2;
    if (qualifiedPlayers.length < minPlayersNeeded) {
      alert(`عدد اللاعبين المؤهلين غير كافٍ. مطلوب ${minPlayersNeeded} لاعب على الأقل.`);
      return;
    }

    // تحديد الجولة
    const existingMatches = matches.filter(m => m.gameId === game.id);
    const maxRound = existingMatches.length > 0 ? Math.max(...existingMatches.map(m => m.round)) : 0;
    const round = maxRound + 1;  

    // إنشاء الفرق المتكافئة
    const balancedTeams = createBalancedTeams(qualifiedPlayers, round, existingMatches);

    // تقسيم الفرق إلى مواجهات متكافئة
    const proposedMatchList: Array<Omit<Match, 'id'>> = [];
    for (let i = 0; i < balancedTeams.length; i += 2) {
      if (i + 1 < balancedTeams.length) {
        proposedMatchList.push({
          gameId: game.id,
          date,
          teams: [balancedTeams[i], balancedTeams[i + 1]],
          status: 'PENDING',
          round,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }

    // عرض معلومات التوزيع في وحدة التحكم
    console.log('معلومات التوزيع والمواجهات:');
    proposedMatchList.forEach((match, index) => {
      console.log(`المواجهة ${index + 1}:`);
      match.teams.forEach(team => {
        const avgStrength = calculateTeamStrength(team.players, game.type) / team.players.length;
        console.log(`${team.name}:`, {
          'عدد اللاعبين': team.players.length,
          'متوسط التقييم': avgStrength.toFixed(2),
          'اللاعبون': team.players.map(p => ({
            'الاسم': p.name,
            'التقييم': p.ratings[game.type] || 0
          }))
        });
      });
      console.log('---');
    });

    setProposedMatches(proposedMatchList);
    setShowPreview(true);
  };

  // دالة لاعتماد المواجهات المقترحة
  const confirmMatches = () => {
    const existingMatches = matches.filter(m => m.gameId === game.id);
    const maxRound = existingMatches.length > 0 ? Math.max(...existingMatches.map(m => m.round)) : 0;
    const round = maxRound + 1;  

    // إنشاء مصفوفة من المباريات الجديدة
    const newMatches = proposedMatches.map(match => ({
      ...match,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    // إرسال جميع المباريات مرة واحدة
    onSubmit(newMatches);

    setShowPreview(false);
    setProposedMatches([]);
  };

  const handleRemovePlayerFromTeam = (teamId: string, playerId: string) => {
    const removedPlayer = players.find(p => p.id === playerId);
    if (!removedPlayer) return;

    setTeams(prev => prev.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          players: team.players.filter(p => p.id !== playerId)
        };
      }
      return team;
    }));
    
    if ((removedPlayer.ratings[game.type] || 0) > 0) {
      setAvailablePlayers(prev => [...prev, removedPlayer]);
    }
  };

  const handleAddPlayerToTeam = (teamId: string, player: Player) => {
    if ((player.ratings[game.type] || 0) === 0) {
      alert('لا يمكن إضافة لاعب بتقييم صفر في هذه اللعبة');
      return;
    }

    const team = teams.find(t => t.id === teamId);
    if (!team || team.players.length >= game.playersPerTeam) {
      alert('لا يمكن إضافة المزيد من اللاعبين لهذا الفريق');
      return;
    }

    setTeams(prev => prev.map(team => {
      if (team.id === teamId) {
        const updatedPlayers = [...team.players, player] as Player[];
        return {
          ...team,
          players: updatedPlayers,
          playerStats: [...(team.playerStats || []), {
            playerId: player.id,
            goals: 0,
            yellowCards: 0,
            redCard: false
          }]
        };
      }
      return team;
    }));
    setAvailablePlayers(prev => prev.filter(p => p.id !== player.id));
  };

  const validateTeams = () => {
    const isValidPlayerCount = teams.every(team => team.players.length === game.playersPerTeam);

    if (!isValidPlayerCount) {
      alert(`يجب أن يحتوي كل فريق على ${game.playersPerTeam} لاعبين بالضبط`);
      return false;
    }

    const hasZeroRatedPlayers = teams.some(team => 
      team.players.some(player => (player.ratings[game.type] || 0) === 0)
    );

    if (hasZeroRatedPlayers) {
      alert('لا يمكن إنشاء المواجهة مع وجود لاعبين بتقييم صفر');
      return false;
    }

    return true;
  };

  const calculateTeamRating = (team: Team) => {
    if (team.players.length === 0) return 0;
    const totalRating = team.players.reduce((sum, player) => 
      sum + (player.ratings[game.type] || 0), 0
    );
    return Math.round(totalRating / team.players.length * 10) / 10;
  };

  const [selectedTeam1, setSelectedTeam1] = useState<Team | null>(null);
  const [selectedTeam2, setSelectedTeam2] = useState<Team | null>(null);
  const [team1Score, setTeam1Score] = useState<number>(0);
  const [team2Score, setTeam2Score] = useState<number>(0);

  const handleSubmit = () => {
    const currentTime = new Date().toISOString();
    const newMatches = proposedMatches.map(match => ({
      ...match,
      createdAt: currentTime,
      updatedAt: currentTime
    }));

    // إرسال جميع المباريات مرة واحدة
    onSubmit(newMatches);
  };

  const qualifiedPlayersCount = players.filter(p => (p.ratings[game.type] || 0) > 0).length;
  const requiredPlayersCount = game.playersPerTeam * game.maxTeams;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 overflow-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">إنشاء مواجهة جديدة</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-4">
          {qualifiedPlayersCount < requiredPlayersCount && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-700">
                  عدد اللاعبين المؤهلين غير كافٍ ({qualifiedPlayersCount} من {requiredPlayersCount})
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  يجب أن يكون لكل لاعب تقييم أكبر من 0
                </p>
              </div>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              تاريخ المواجهات
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <button
              type="button"
              onClick={generateProposedMatches}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Shuffle className="w-5 h-5" />
              توزيع اللاعبين وعرض المواجهات المقترحة
            </button>
          </div>

          {showPreview && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 sticky top-0 bg-white py-2 z-10">
                المواجهات المقترحة
              </h3>
              
              <div className="space-y-6">
                {proposedMatches.map((match, matchIndex) => (
                  <div key={matchIndex} className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="text-md font-medium text-gray-700 mb-3">المواجهة {matchIndex + 1}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {match.teams.map((team, teamIndex) => (
                        <div key={teamIndex} className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <input
                                type="text"
                                value={team.name}
                                onChange={(e) => {
                                  const newMatches = [...proposedMatches];
                                  newMatches[matchIndex].teams[teamIndex].name = e.target.value;
                                  setProposedMatches(newMatches);
                                }}
                                className="px-2 py-1 border rounded-md text-sm"
                                placeholder="اسم الفريق"
                              />
                            </div>
                            <span className="text-sm text-gray-600">
                              متوسط التقييم: {(calculateTeamStrength(team.players, game.type) / team.players.length).toFixed(1)}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {team.players.map(player => (
                              <div key={player.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                                <span>{player.name}</span>
                                <span className="text-gray-600">
                                  التقييم: {player.ratings[game.type] || 0}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="sticky bottom-0 bg-white py-4 border-t mt-6">
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPreview(false);
                      setProposedMatches([]);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    إعادة التوزيع
                  </button>
                  <button
                    type="button"
                    onClick={confirmMatches}
                    className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    تأكيد المباريات
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}