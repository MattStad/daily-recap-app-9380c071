import { useState, useEffect, useCallback, ReactNode } from 'react';
import { I18nContext, Language, getTranslation, getQuestionText, getCategoryTranslation } from '@/lib/i18n';
import { getSettings, saveSettings, applyTheme } from '@/lib/settings';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => getSettings().language);

  useEffect(() => {
    const settings = getSettings();
    applyTheme(settings.theme);
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    const settings = getSettings();
    saveSettings({ ...settings, language: newLang });
  }, []);

  const t = useCallback((key: string) => getTranslation(lang, key as any), [lang]);
  const tQuestion = useCallback((id: string, text: string) => getQuestionText(lang, id, text), [lang]);
  const tCategory = useCallback((cat: string) => getCategoryTranslation(lang, cat), [lang]);

  return (
    <I18nContext.Provider value={{
      t,
      lang,
      setLang,
      tQuestion,
      tCategory,
      dateLocale: lang === 'de' ? 'de-DE' : 'en-US',
    }}>
      {children}
    </I18nContext.Provider>
  );
}
