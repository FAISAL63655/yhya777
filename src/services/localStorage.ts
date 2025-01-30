// خدمة التخزين المحلي
const STORAGE_PREFIX = 'yhya_league_';

export const localStorageService = {
  // حفظ البيانات
  setItem: (key: string, value: any) => {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, serializedValue);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  // استرجاع البيانات
  getItem: (key: string, defaultValue: any = null) => {
    try {
      const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },

  // حذف عنصر محدد
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  // حذف كل البيانات المتعلقة بالتطبيق
  clearAll: () => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },

  // مزامنة البيانات مع التخزين المحلي
  sync: (key: string, value: any) => {
    const stored = localStorageService.getItem(key);
    if (stored === null) {
      localStorageService.setItem(key, value);
      return value;
    }
    return stored;
  }
};
