import { Language } from './i18n';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  language: Language;
  theme: ThemeMode;
  reminderTime: string; // HH:mm format
}

const SETTINGS_KEY = 'daily-recap-settings';

const DEFAULT_SETTINGS: AppSettings = {
  language: 'de',
  theme: 'light',
  reminderTime: '20:00',
};

export function getSettings(): AppSettings {
  const data = localStorage.getItem(SETTINGS_KEY);
  if (!data) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
}

// Export all app data as JSON
export function exportAllData(): string {
  const keys = [
    'daily-recap-user-questions',
    'daily-recap-entries',
    'daily-recap-custom-questions',
    'daily-recap-settings',
  ];
  const data: Record<string, any> = {};
  for (const key of keys) {
    const val = localStorage.getItem(key);
    if (val) data[key] = JSON.parse(val);
  }
  return JSON.stringify(data, null, 2);
}

// Import all app data from JSON
export function importAllData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    const validKeys = [
      'daily-recap-user-questions',
      'daily-recap-entries',
      'daily-recap-custom-questions',
      'daily-recap-settings',
    ];
    for (const key of validKeys) {
      if (data[key]) {
        localStorage.setItem(key, JSON.stringify(data[key]));
      }
    }
    return true;
  } catch {
    return false;
  }
}
