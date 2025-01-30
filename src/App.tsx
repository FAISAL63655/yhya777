import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Game, Player, Match, Team, GameType, UserRole } from './types';
import { LoginPage } from './components/auth/LoginPage';
import { UnauthorizedPage } from './components/auth/UnauthorizedPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
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
    playersPerTeam: 6,
    maxTeams: 2
  },
  {
    id: '2',
    name: 'كرة الطائرة',
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
    name: 'بلايستيشن',
    type: GameType.PLAYSTATION,
    playersPerTeam: 2,
    maxTeams: 2
  },
  {
    id: '6',
    name: 'جاكارو',
    type: GameType.JACKAROO,
    playersPerTeam: 4,
    maxTeams: 2
  },
  {
    id: '7',
    name: 'رماية الأسهم',
    type: GameType.DARTS,
    playersPerTeam: 1,
    maxTeams: 2
  }
];

// إنشاء قائمة من 60 لاعب مع تقييمات عشوائية
const defaultPlayers: Player[] = Array.from({ length: 60 }, (_, index) => ({
  id: `player-${index + 1}`,
  name: `لاعب ${index + 1}`,
  phone: `+966500000${index.toString().padStart(3, '0')}`,
  ratings: {
    FOOTBALL: Math.floor(Math.random() * 5) + 1,
    VOLLEYBALL: Math.floor(Math.random() * 5) + 1,
    BALOOT: Math.floor(Math.random() * 5) + 1,
    CARROM: Math.floor(Math.random() * 5) + 1,
    PLAYSTATION: Math.floor(Math.random() * 5) + 1,
    JACKAROO: Math.floor(Math.random() * 5) + 1,
    DARTS: Math.floor(Math.random() * 5) + 1
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}));

// إنشاء مواجهات افتراضية
const defaultMatches: Match[] = Array.from({ length: 30 }, (_, index) => ({
  id: `match-${index + 1}`,
  gameId: defaultGames[Math.floor(Math.random() * defaultGames.length)].id,
  teams: createRandomTeams(defaultGames[0], defaultPlayers),
  status: Math.random() > 0.5 ? 'COMPLETED' : 'PENDING',
  round: Math.floor(index / 5) + 1,
  date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}));

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
  const location = useLocation();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [showGameForm, setShowGameForm] = useState(false);
  const [showMatchForm, setShowMatchForm] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'games' | 'players' | 'matches' | 'statistics' | 'playerStats' | 'liveRanking'>('matches');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  // تحميل البيانات من التخزين المحلي عند بدء التطبيق
  useEffect(() => {
    const loadData = () => {
      try {
        const storedGames = localStorage.getItem('yhya_league_games');
        const storedPlayers = localStorage.getItem('yhya_league_players');
        const storedMatches = localStorage.getItem('yhya_league_matches');

        if (storedGames) {
          setGames(JSON.parse(storedGames));
        }
        if (storedPlayers) {
          setPlayers(JSON.parse(storedPlayers));
        }
        if (storedMatches) {
          setMatches(JSON.parse(storedMatches));
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('حدث خطأ أثناء تحميل البيانات');
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // حفظ البيانات في التخزين المحلي عند تغييرها
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('yhya_league_games', JSON.stringify(games));
      localStorage.setItem('yhya_league_players', JSON.stringify(players));
      localStorage.setItem('yhya_league_matches', JSON.stringify(matches));
    }
  }, [games, players, matches, isLoading]);

  const handleMatchSubmit = (matchData: Omit<Match, 'id'> | Omit<Match, 'id'>[]) => {
    if (Array.isArray(matchData)) {
      // عند إنشاء مجموعة من المواجهات
      const newMatches = matchData.map((match, index) => ({
        ...match,
        id: `match-${Date.now()}-${index}`,
        createdAt: new Date().toISOString(),
        round: getNextRoundNumber(match.gameId)
      }));
      setMatches([...matches, ...newMatches]);
      setShowMatchForm(false);
    } else {
      // عند إنشاء مواجهة واحدة
      const newMatch = {
        ...matchData,
        id: `match-${Date.now()}`,
        createdAt: new Date().toISOString(),
        round: getNextRoundNumber(matchData.gameId)
      };
      setMatches([...matches, newMatch]);
      setShowMatchForm(false);
    }
  };

  // دالة للحصول على رقم الجولة التالية للعبة معينة
  const getNextRoundNumber = (gameId: string): number => {
    const gameMatches = matches.filter(m => m.gameId === gameId);
    if (gameMatches.length === 0) return 1;
    
    const maxRound = Math.max(...gameMatches.map(m => m.round));
    return maxRound + 1;
  };

  // دالة لحذف المواجهة مع تحديث localStorage
  const handleDeleteMatch = (matchId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المواجهة؟')) {
      const updatedMatches = matches.filter(m => m.id !== matchId);
      setMatches(updatedMatches);
      localStorage.setItem('yhya_league_matches', JSON.stringify(updatedMatches));
    }
  };

  // معلومات المستخدم الحالي
  const userRole = localStorage.getItem('userRole') as UserRole;
  const userGameType = localStorage.getItem('userGameType') as GameType;

  // تحديث مسمى المستخدم
  const getUserRoleDisplay = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'المشرف العام';
      case 'SUPERVISOR':
        return 'مشرف اللعبة';
      default:
        return 'مستخدم';
    }
  };

  const userDisplayName = localStorage.getItem('userName') || 'مستخدم';
  const userRoleDisplay = getUserRoleDisplay(userRole);

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

  const handleTabChange = (tab: 'games' | 'players' | 'matches' | 'statistics' | 'playerStats' | 'liveRanking') => {
    setSelectedTab(tab);
    localStorage.setItem('selectedTab', tab);
  };

  const mainContent = (
    <div className="container mx-auto px-4 py-8">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">الدوري النقطي لاجتماع اليحيى</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-4">
              <button
                onClick={() => handleTabChange('games')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'games'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                الألعاب
              </button>
              <button
                onClick={() => handleTabChange('players')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'players'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                اللاعبون
              </button>
              <button
                onClick={() => handleTabChange('matches')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'matches'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                المسابقات
              </button>
              <button
                onClick={() => handleTabChange('statistics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'statistics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                إحصائيات الألعاب
              </button>
              <button
                onClick={() => handleTabChange('playerStats')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'playerStats'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                إحصائيات اللاعبين
              </button>
              <button
                onClick={() => handleTabChange('liveRanking')}
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
              <h2 className="text-xl font-semibold text-gray-800">قائمة الألعاب</h2>
              <button
                onClick={() => setShowGameForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <PlusCircle className="w-5 h-5 ml-1" />
                إضافة لعبة جديدة
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onSelect={(game) => {
                    setSelectedGame(game);
                    setShowMatchForm(true);
                  }}
                  onEdit={() => {
                    setSelectedGame(game);
                    setShowGameForm(true);
                  }}
                  onDelete={() => {
                    if (window.confirm('هل أنت متأكد من حذف هذه اللعبة؟')) {
                      setGames(games.filter(g => g.id !== game.id));
                    }
                  }}
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
                setPlayers(players.filter(p => p.id !== playerId));
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
                  {games.map(game => {
                    const gameMatches = matches.filter(m => m.gameId === game.id);
                    const rounds = new Set(gameMatches.map(m => m.round));
                    return `${game.name}: ${rounds.size} جولة (${gameMatches.length} مواجهة)`;
                  }).join(' | ')}
                </p>
              </div>
            </div>
            <MatchList
              matches={matches}
              games={games}
              players={players}
              onUpdateMatch={(match) => {
                const updatedMatches = matches.map(m => m.id === match.id ? match : m);
                setMatches(updatedMatches);
                localStorage.setItem('yhya_league_matches', JSON.stringify(updatedMatches));
              }}
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
          game={selectedGame || games[0]}
          players={players}
          matches={matches}
          onSubmit={handleMatchSubmit}
          onClose={() => {
            setShowMatchForm(false);
            setSelectedGame(null);
          }}
        />
      )}

      {showGameForm && (
        <GameForm
          game={selectedGame}
          onSubmit={(gameData) => {
            if (selectedGame) {
              // تحديث لعبة موجودة
              setGames(games.map(g =>
                g.id === selectedGame.id
                  ? { ...gameData, id: selectedGame.id }
                  : g
              ));
            } else {
              // إضافة لعبة جديدة
              const newGame = {
                ...gameData,
                id: Date.now().toString()
              };
              setGames([...games, newGame]);
            }
            setSelectedGame(null);
            setShowGameForm(false);
          }}
          onClose={() => {
            setSelectedGame(null);
            setShowGameForm(false);
          }}
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* شريط المستخدم العلوي */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <button
            onClick={() => {
              localStorage.removeItem('isAuthenticated');
              localStorage.removeItem('userRole');
              localStorage.removeItem('userGameType');
              localStorage.removeItem('userName');
              // نحتفظ بـ lastPath
              navigate('/login');
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            تسجيل خروج
          </button>
          <div className="flex items-center space-x-4 space-x-reverse">
            <span className="font-semibold text-gray-700">{userDisplayName}</span>
            <span className="text-sm text-gray-500">({userRoleDisplay})</span>
          </div>
          <div className="text-lg font-bold text-gray-800">
            أسرة اليحيى
          </div>
        </div>
      </div>

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route
          path="/dashboard/*"
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
              <Navigate to={localStorage.getItem('lastPath') || '/dashboard'} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;