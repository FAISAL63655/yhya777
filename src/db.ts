import Dexie, { Table } from 'dexie';
import { Player, Game, Match, GameType } from './types';

export class SportsDB extends Dexie {
  players!: Table<Player, string>;
  games!: Table<Game, string>;
  matches!: Table<Match, string>;

  constructor() {
    super('SportsDatabase');
    this.version(2).stores({
      players: 'id, name, phone, createdAt, updatedAt',
      games: 'id, name, type, playersPerTeam, maxTeams',
      matches: 'id, gameId, date, status'
    });
  }
}

export const db = new SportsDB();

// التحقق من توفر IndexedDB
export async function checkDatabaseConnection() {
  if (!window.indexedDB) {
    throw new Error('متصفحك لا يدعم IndexedDB. الرجاء استخدام متصفح حديث.');
  }

  try {
    // محاولة فتح اتصال مع قاعدة البيانات
    await db.open();
    console.log('تم الاتصال بقاعدة البيانات بنجاح');
    
    // التحقق من وجود البيانات الافتراضية
    const playersCount = await db.players.count();
    const gamesCount = await db.games.count();
    
    if (playersCount === 0 || gamesCount === 0) {
      console.log('جاري تهيئة البيانات الافتراضية...');
      await initializeDefaultData();
    }
  } catch (error) {
    console.error('خطأ في الاتصال بقاعدة البيانات:', error);
    throw error;
  }
}

// قائمة بأسماء عربية شائعة
const firstNames = [
  'محمد', 'أحمد', 'عبدالله', 'خالد', 'فهد', 'سعد', 'عمر', 'سلطان', 'ناصر', 'بندر',
  'عبدالرحمن', 'عبدالعزيز', 'يوسف', 'إبراهيم', 'علي', 'حسن', 'حسين', 'ماجد', 'وليد', 'طلال'
];

const lastNames = [
  'القحطاني', 'العتيبي', 'الشمري', 'الدوسري', 'المطيري', 'الحربي', 'الغامدي', 'الزهراني',
  'العمري', 'المالكي', 'السبيعي', 'البقمي', 'الشهري', 'الغانم', 'السعيد', 'الحميد',
  'الصالح', 'المنصور', 'العبدالله', 'الفهد'
];

// دالة لتوليد رقم عشوائي بين حدين
function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// دالة لتوليد لاعب عشوائي
function generateRandomPlayer(): Player {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const now = new Date().toISOString();
  
  return {
    id: crypto.randomUUID(),
    name: `${firstName} ${lastName}`,
    phone: `05${Math.floor(Math.random() * 100000000)}`,
    ratings: {
      FOOTBALL: randomNumber(5, 10),
      VOLLEYBALL: randomNumber(5, 10),
      BALOOT: randomNumber(5, 10),
      CARROM: randomNumber(5, 10),
      PLAYSTATION: randomNumber(5, 10),
      JACKAROO: randomNumber(5, 10)
    },
    createdAt: now,
    updatedAt: now
  };
}

// دالة لتوليد عدد محدد من اللاعبين
function generateRandomPlayers(count: number) {
  const players = [];
  const usedNames = new Set(); // لتجنب تكرار الأسماء

  while (players.length < count) {
    const player = generateRandomPlayer();
    if (!usedNames.has(player.name)) {
      usedNames.add(player.name);
      players.push(player);
    }
  }

  return players;
}

// تهيئة البيانات الافتراضية
async function initializeDefaultData() {
  try {
    // التحقق من وجود البيانات
    const existingGames = await db.games.count();
    const existingPlayers = await db.players.count();

    // إضافة الألعاب الافتراضية فقط إذا لم تكن موجودة
    if (existingGames === 0) {
      const defaultGames: Game[] = [
        { id: '1', name: 'كرة القدم', type: GameType.FOOTBALL, playersPerTeam: 11, maxTeams: 2 },
        { id: '2', name: 'كرة الطائرة', type: GameType.VOLLEYBALL, playersPerTeam: 6, maxTeams: 2 },
        { id: '3', name: 'البلوت', type: GameType.BALOOT, playersPerTeam: 2, maxTeams: 2 },
        { id: '4', name: 'الكيرم', type: GameType.CARROM, playersPerTeam: 1, maxTeams: 2 },
        { id: '5', name: 'بلايستيشن', type: GameType.PLAYSTATION, playersPerTeam: 1, maxTeams: 2 },
        { id: '6', name: 'جكارو', type: GameType.JACKAROO, playersPerTeam: 1, maxTeams: 2 }
      ];
      await db.games.bulkAdd(defaultGames);
      console.log('تم إضافة الألعاب الافتراضية');
    }

    // إضافة اللاعبين الافتراضيين فقط إذا لم يكونوا موجودين
    if (existingPlayers === 0) {
      const defaultPlayers = generateRandomPlayers(60); // توليد 60 لاعب
      await db.players.bulkAdd(defaultPlayers);
      console.log('تم إضافة 60 لاعب افتراضي');
    }

    console.log('تم تهيئة البيانات بنجاح');
  } catch (error) {
    console.error('خطأ في تهيئة البيانات:', error);
    // لا نريد إيقاف التطبيق إذا فشلت إضافة البيانات الافتراضية
  }
}

// مسح قاعدة البيانات
export async function resetDatabase() {
  try {
    await db.delete();
    await db.open();
    console.log('تم مسح قاعدة البيانات وإعادة فتحها');
    await checkDatabaseConnection();
  } catch (error) {
    console.error('خطأ في مسح قاعدة البيانات:', error);
    throw error;
  }
}