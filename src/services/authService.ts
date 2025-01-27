import { User, UserRole, GameType } from '../types';

// بيانات المستخدمين الافتراضية
const defaultUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: UserRole.ADMIN
  },
  {
    id: 2,
    username: 'football_supervisor',
    password: 'football123',
    role: UserRole.SUPERVISOR,
    gameType: GameType.FOOTBALL
  },
  {
    id: 3,
    username: 'volleyball_supervisor',
    password: 'volleyball123',
    role: UserRole.SUPERVISOR,
    gameType: GameType.VOLLEYBALL
  },
  {
    id: 4,
    username: 'baloot_supervisor',
    password: 'baloot123',
    role: UserRole.SUPERVISOR,
    gameType: GameType.BALOOT
  }
];

export const login = (username: string, password: string): User | null => {
  const user = defaultUsers.find(
    (u) => u.username === username && u.password === password
  );
  return user || null;
};

export const hasPermission = (user: User | null, gameType?: GameType): boolean => {
  if (!user) return false;
  
  // المدير العام لديه كل الصلاحيات
  if (user.role === UserRole.ADMIN) return true;
  
  // المشرف يمكنه التعديل فقط على اللعبة المخصصة له
  if (user.role === UserRole.SUPERVISOR && gameType) {
    return user.gameType === gameType;
  }
  
  return false;
};