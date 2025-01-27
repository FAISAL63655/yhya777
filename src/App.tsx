import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Game, Player, Match, Team, GameType, UserRole } from './types';
import { LoginPage } from './components/auth/LoginPage';
import { UnauthorizedPage } from './components/auth/UnauthorizedPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { db } from './db';
import { GameCard } from './components/GameCard';
import { PlayerList } from './components/PlayerList';
import { PlayerForm } from './components/PlayerForm';
import { GameForm } from './components/GameForm';
import { MatchForm } from './components/MatchForm';
import { MatchList } from './components/MatchList';
import { Statistics } from './components/Statistics';
import { PlayerStatistics } from './components/PlayerStatistics';
import { LivePlayerRanking } from './components/LivePlayerRanking';
import { PlusCircle, Users, Trophy, BarChart, User, Activity } from 'lucide-react';

const defaultGames: Game[] = [
  {
    id: '1',
    name: 'كرة القدم',
    type: GameType.FOOTBALL,
    playersPerTeam: 10,
    maxTeams: 2
  },
  {
    id: '2',
    name: 'الكرة الطائرة',
    type: GameType.VOLLEYBALL,
    playersPerTeam: 6,
    maxTeams: 2
  },
  {
    id: '3',
    name: 'البلوت',
    type: GameType.BALOOT,
    playersPerTeam: 2,
    maxTeams: 2
  },
  {
    id: '4',
    name: 'الكيرم',
    type: GameType.CARROM,
    playersPerTeam: 2,
    maxTeams: 2
  },
  {
    id: '5',
    name: 'البلايستيشن',
    type: GameType.PLAYSTATION,
    playersPerTeam: 1,
    maxTeams: 2
  },
  {
    id: '6',
    name: 'الجاكارو',
    type: GameType.JACKAROO,
    playersPerTeam: 4,
    maxTeams: 2
  }
];

// إنشاء قائمة من 60 لاعب مع تقييمات عشوائية
const defaultPlayers: Player[] = Array.from({ length: 60 }, (_, index) => {
  const firstNames = ['أحمد', 'محمد', 'خالد', 'عبدالله', 'سعد', 'فهد', 'عمر', 'سلطان', 'عبدالعزيز', 'يوسف'];
  const lastNames = ['السعيد', 'العمري', 'الحربي', 'القحطاني', 'الدوسري', 'المالكي', 'الشهري', 'الغامدي', 'الزهراني', 'المطيري'];
  const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];

  return {
    id: `player-${index + 1}`,
    name: `${randomFirstName} ${randomLastName}`,
    ratings: {
      FOOTBALL: Math.floor(Math.random() * 6) + 5,
      VOLLEYBALL: Math.floor(Math.random() * 6) + 5,
      BALOOT: Math.floor(Math.random() * 6) + 5,
      CARROM: Math.floor(Math.random() * 6) + 5,
      PLAYSTATION: Math.floor(Math.random() * 6) + 5,
      JACKAROO: Math.floor(Math.random() * 6) + 5
    }
  };
});

// إنشاء مواجهات افتراضية
const defaultMatches: Match[] = [];

// إنشاء المواجهات لكل لعبة
defaultGames.forEach(game => {
  for (let i = 0; i < 5; i++) {
    const teams = createRandomTeams(game, defaultPlayers);
    
    // إضافة البطاقات للاعبين في كرة القدم والكرة الطائرة
    if (game.type === 'FOOTBALL' || game.type === 'VOLLEYBALL') {
      teams.forEach(team => {
        team.playerStats = team.players.map(player => ({
          playerId: player.id,
          yellowCards: Math.random() > 0.7 ? 1 : 0,
          redCard: Math.random() > 0.9
        }));
      });
    }

    const match: Match = {
      id: `match-${game.id}-${i}`,
      gameId: game.id,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      teams,
      status: 'COMPLETED',
      round: Math.floor(i / 2) + 1 // كل جولة تحتوي على مباراتين
    };

    defaultMatches.push(match);
  }
});

function createRandomTeams(game: Game, allPlayers: Player[]): Team[] {
  const qualifiedPlayers = allPlayers.filter(p => (p.ratings[game.type] || 0) > 0);
  const shuffledPlayers = [...qualifiedPlayers].sort(() => Math.random() - 0.5);
  const totalPlayersNeeded = game.playersPerTeam * 2;
  const selectedPlayers = shuffledPlayers.slice(0, totalPlayersNeeded);

  return [
    {
      id: `team-1-${Math.random()}`,
      name: 'الفريق الأول',
      players: selectedPlayers.slice(0, game.playersPerTeam),
      score: Math.floor(Math.random() * 5),
      playerStats: []
    },
    {
      id: `team-2-${Math.random()}`,
      name: 'الفريق الثاني',
      players: selectedPlayers.slice(game.playersPerTeam),
      score: Math.floor(Math.random() * 5),
      playerStats: []
    }
  ];
}

function App() {
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [showGameForm, setShowGameForm] = useState(false);
  const [showMatchForm, setShowMatchForm] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedTab, setSelectedTab] = useState<'games' | 'players' | 'matches' | 'statistics' | 'playerStats' | 'liveRanking'>('matches');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // معلومات المستخدم الحالي
  const userRole = localStorage.getItem('userRole') as UserRole;
  const userGameType = localStorage.getItem('userGameType') as GameType;

  useEffect(() => {
    // تحميل البيانات من قاعدة البيانات عند بدء التطبيق
    const loadData = async () => {
      try {
        // تحميل اللاعبين
        const dbPlayers = await db.players.toArray();
        if (dbPlayers.length === 0) {
          await db.players.bulkAdd(defaultPlayers);
          setPlayers(defaultPlayers);
        } else {
          setPlayers(dbPlayers);
        }

        // تحميل الألعاب
        const dbGames = await db.games.toArray();
        if (dbGames.length === 0) {
          await db.games.bulkAdd(defaultGames);
          setGames(defaultGames);
        } else {
          setGames(dbGames);
        }

        // تحميل المباريات حسب نوع المستخدم
        const dbMatches = await db.matches.toArray();
        if (dbMatches.length === 0) {
          await db.matches.bulkAdd(defaultMatches);
          setMatches(defaultMatches);
        } else {
          setMatches(dbMatches);
        }

        // تعيين اللعبة المحددة للمشرف
        if (userRole === UserRole.SUPERVISOR) {
          const supervisorGame = dbGames.find(g => g.type === userGameType);
          if (supervisorGame) {
            setSelectedGame(supervisorGame);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [userRole, userGameType]);

  // تصفية الألعاب حسب نوع المستخدم
  const filteredGames = games.filter(game => {
    if (userRole === UserRole.ADMIN) {
      return true; // المدير يرى كل الألعاب
    }
    // المشرف يرى فقط لعبته
    return game.type === userGameType;
  });

  // تصفية المسابقات حسب نوع المستخدم
  const filteredMatches = matches.filter(match => {
    if (userRole === UserRole.ADMIN) {
      return true; // المدير يرى كل المسابقات
    }
    // المشرف يرى فقط مسابقات لعبته
    const matchGame = games.find(g => g.id === match.gameId);
    return matchGame?.type === userGameType;
  });

  // التحقق من صلاحيات المستخدم للتعديل
  const canEditMatches = (gameType?: GameType): boolean => {
    if (userRole === UserRole.ADMIN) return true;
    if (userRole === UserRole.SUPERVISOR) {
      return true; // السماح للمشرف بإنشاء وتعديل المواجهات
    }
    return false;
  };

  const handleGameSelect = (game: Game) => {
    if (userRole === UserRole.SUPERVISOR) {
      // التحقق من أن اللعبة المحددة هي نفس لعبة المشرف
      if (game.type === userGameType) {
        setSelectedGame(game);
        setShowMatchForm(true);
      }
    } else {
      setSelectedGame(game);
      setShowMatchForm(true);
    }
  };

  const handleUpdateMatch = async (match: Match) => {
    try {
      await db.matches.update(match.id, match);
      setMatches(prevMatches => 
        prevMatches.map(m => m.id === match.id ? match : m)
      );
      // تحديث واجهة المستخدم بعد النجاح
      alert('تم حفظ التغييرات بنجاح');
    } catch (error) {
      console.error('Error updating match:', error);
      alert('حدث خطأ أثناء حفظ التغييرات');
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    try {
      await db.matches.delete(matchId);
      setMatches(prevMatches => prevMatches.filter(m => m.id !== matchId));
      // تحديث واجهة المستخدم بعد النجاح
      alert('تم حذف المباراة بنجاح');
    } catch (error) {
      console.error('Error deleting match:', error);
      alert('حدث خطأ أثناء حذف المباراة');
    }
  };

  const mainContent = (
    <div className="container mx-auto px-4 py-8">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">مسابقات اسرة اليحيى</h1>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-4">
              <button
                onClick={() => setSelectedTab('games')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'games'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                الألعاب
              </button>
              <button
                onClick={() => setSelectedTab('players')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'players'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                اللاعبين
              </button>
              <button
                onClick={() => setSelectedTab('matches')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'matches'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                المسابقات
              </button>
              <button
                onClick={() => setSelectedTab('statistics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'statistics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                إحصائيات الألعاب
              </button>
              <button
                onClick={() => setSelectedTab('playerStats')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'playerStats'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                إحصائيات اللاعبين
              </button>
              <button
                onClick={() => setSelectedTab('liveRanking')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'liveRanking'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  <span>الترتيب المباشر</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {selectedTab === 'games' && (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-gray-800">الألعاب المتاحة</h2>
              {userRole === UserRole.ADMIN && (
                <button
                  onClick={() => setShowGameForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <PlusCircle className="w-5 h-5 ml-1" />
                  إضافة لعبة جديدة
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onSelect={handleGameSelect}
                  onEdit={userRole === UserRole.ADMIN ? () => {} : undefined}
                  onDelete={userRole === UserRole.ADMIN ? () => {} : undefined}
                />
              ))}
            </div>
          </>
        )}

        {selectedTab === 'players' && (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-gray-800">قائمة اللاعبين</h2>
              <button
                onClick={() => setShowPlayerForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <PlusCircle className="w-5 h-5 ml-1" />
                إضافة لاعب جديد
              </button>
            </div>
            <PlayerList
              players={players}
              onEdit={(player) => {
                setSelectedPlayer(player);
                setShowPlayerForm(true);
              }}
              onDelete={(playerId) => {
                db.players.delete(playerId).then(() => {
                  setPlayers(players.filter(p => p.id !== playerId));
                });
              }}
              onViewStats={(player) => {
                setSelectedPlayer(player);
                setSelectedTab('playerStats');
              }}
            />
          </>
        )}

        {selectedTab === 'matches' && (
          <>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">المسابقات</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredGames.map(game => {
                    const gameMatches = filteredMatches.filter(m => m.gameId === game.id);
                    return `${game.name}: ${gameMatches.length} مسابقة`;
                  }).join(' | ')}
                </p>
              </div>
              {canEditMatches(selectedGame?.type) && (
                <button
                  onClick={() => {
                    // إذا كان مشرف، نختار لعبته تلقائياً
                    if (userRole === UserRole.SUPERVISOR) {
                      const supervisorGame = games.find(g => g.type === userGameType);
                      if (supervisorGame) {
                        setSelectedGame(supervisorGame);
                      }
                    }
                    setShowMatchForm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Trophy className="w-5 h-5 ml-1" />
                  إنشاء مواجهة جديدة
                </button>
              )}
            </div>
            <MatchList
              matches={filteredMatches}
              games={filteredGames}
              players={players}
              onUpdateMatch={handleUpdateMatch}
              onDeleteMatch={handleDeleteMatch}
            />
          </>
        )}

        {selectedTab === 'statistics' && (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-gray-800">إحصائيات الألعاب</h2>
              <div className="flex items-center gap-2 text-gray-600">
                <BarChart className="w-5 h-5" />
                <span>ترتيب اللاعبين حسب النقاط</span>
              </div>
            </div>
            <Statistics
              matches={matches}
              games={games}
              players={players}
            />
          </>
        )}

        {selectedTab === 'playerStats' && (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-gray-800">إحصائيات اللاعبين</h2>
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-5 h-5" />
                <span>إحصائيات كل لاعب في جميع الألعاب</span>
              </div>
            </div>
            <PlayerStatistics
              matches={matches}
              games={games}
              players={players}
            />
          </>
        )}

        {selectedTab === 'liveRanking' && (
          <LivePlayerRanking
            matches={matches}
            games={games}
            players={players}
            isFullScreen={isFullScreen}
            onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
          />
        )}
      </main>

      {showPlayerForm && (
        <PlayerForm
          games={games}
          player={selectedPlayer}
          onSubmit={async (playerData) => {
            try {
              if (selectedPlayer) {
                // تحديث لاعب موجود
                const updatedPlayer: Player = {
                  ...playerData,
                  id: selectedPlayer.id,
                  updatedAt: new Date(),
                  createdAt: selectedPlayer.createdAt
                };
                await db.players.update(selectedPlayer.id, updatedPlayer);
                setPlayers(prevPlayers => 
                  prevPlayers.map(p => p.id === selectedPlayer.id ? updatedPlayer : p)
                );
              } else {
                // إضافة لاعب جديد
                const newPlayer: Player = {
                  ...playerData,
                  id: crypto.randomUUID(),
                  createdAt: new Date(),
                  updatedAt: new Date()
                };
                await db.players.add(newPlayer);
                setPlayers(prevPlayers => [...prevPlayers, newPlayer]);
              }
              setShowPlayerForm(false);
              setSelectedPlayer(null);
            } catch (error) {
              console.error('Error saving player:', error);
              alert('حدث خطأ أثناء حفظ بيانات اللاعب');
            }
          }}
          onCancel={() => {
            setShowPlayerForm(false);
            setSelectedPlayer(null);
          }}
        />
      )}

      {showMatchForm && (
        <MatchForm
          game={selectedGame}
          players={players}
          matches={matches}
          onSubmit={(matchData) => {
            // إنشاء مصفوفة من المباريات إذا كان matchData مصفوفة
            const matchesToAdd = Array.isArray(matchData) ? matchData : [matchData];
            
            // إضافة كل المباريات إلى قاعدة البيانات
            Promise.all(
              matchesToAdd.map(match => {
                const newMatch = {
                  ...match,
                  id: Math.random().toString(36).substr(2, 9),
                  createdAt: new Date().toISOString(),
                  status: 'PENDING'
                };
                return db.matches.add(newMatch).then(() => newMatch);
              })
            ).then((newMatches) => {
              setMatches([...matches, ...newMatches]);
              setShowMatchForm(false);
              setSelectedGame(null);
            });
          }}
          onClose={() => setShowMatchForm(false)}
        />
      )}
    </div>
  );

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {mainContent}
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/"
        element={
          localStorage.getItem('isAuthenticated') === 'true' ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;