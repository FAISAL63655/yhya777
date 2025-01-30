import { useState, useEffect } from 'react';
import { localStorageService } from '../services/localStorage';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // استرجاع القيمة المخزنة أو استخدام القيمة الأولية
  const [storedValue, setStoredValue] = useState<T>(() => {
    return localStorageService.getItem(key, initialValue);
  });

  // تحديث القيمة في التخزين المحلي عند تغييرها
  useEffect(() => {
    localStorageService.setItem(key, storedValue);
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}
