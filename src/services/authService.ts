import { User, UserRole, GameType } from '../types';

interface AuthUser extends User {
  password: string;
}

// بيانات المستخدمين الافتراضية
const defaultUsers: AuthUser[] = [
  {
    id: "1",
    username: 'admin',
    name: 'مدير النظام',
    password: 'admin123',
    role: UserRole.ADMIN,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "2",
    username: 'football_supervisor',
    name: 'مشرف كرة القدم',
    password: 'football123',
    role: UserRole.SUPERVISOR,
    gameType: GameType.FOOTBALL,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "3",
    username: 'volleyball_supervisor',
    name: 'مشرف كرة الطائرة',
    password: 'volleyball123',
    role: UserRole.SUPERVISOR,
    gameType: GameType.VOLLEYBALL,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "4",
    username: 'baloot_supervisor',
    name: 'مشرف البلوت',
    password: 'baloot123',
    role: UserRole.SUPERVISOR,
    gameType: GameType.BALOOT,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const login = (username: string, password: string): User | null => {
  const user = defaultUsers.find(
    (u) => u.username === username && u.password === password
  );
  
  if (!user) return null;
  
  // نحذف كلمة المرور قبل إرجاع المستخدم
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
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