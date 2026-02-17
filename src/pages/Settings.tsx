import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Upload, Globe, Palette, Bell } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { getSettings, saveSettings, applyTheme, exportAllData, importAllData, ThemeMode } from '@/lib/settings';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const navigate = useNavigate();
  const { t, lang, setLang } = useI18n();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettingsState] = useState(getSettings());

  const updateSetting = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettingsState(newSettings);
    saveSettings(newSettings);
    if (key === 'theme') applyTheme(value as ThemeMode);
    if (key === 'language') setLang(value as 'de' | 'en');
  };

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-recap-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!confirm(t('import.confirm'))) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const success = importAllData(ev.target?.result as string);
      toast({
        title: success ? t('import.success') : t('import.error'),
        variant: success ? 'default' : 'destructive',
      });
      if (success) {
        setSettingsState(getSettings());
        window.location.reload();
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('settings')}</h1>
            <p className="text-sm text-muted-foreground">{t('settings.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-4 pb-8">
        {/* Language */}
        <div className="bg-card rounded-2xl shadow-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <Globe className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">{t('language')}</h3>
          </div>
          <div className="flex gap-2">
            {(['de', 'en'] as const).map(l => (
              <button
                key={l}
                onClick={() => updateSetting('language', l)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  settings.language === l
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {l === 'de' ? `🇩🇪 ${t('german')}` : `🇬🇧 ${t('english')}`}
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div className="bg-card rounded-2xl shadow-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <Palette className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">{t('theme')}</h3>
          </div>
          <div className="flex gap-2">
            {(['light', 'dark', 'system'] as ThemeMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => updateSetting('theme', mode)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  settings.theme === mode
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {t(`theme.${mode}` as any)}
              </button>
            ))}
          </div>
        </div>

        {/* Reminder Time */}
        <div className="bg-card rounded-2xl shadow-card p-4">
          <div className="flex items-center gap-3 mb-1">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">{t('reminderTime')}</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3 ml-8">{t('reminderTime.desc')}</p>
          <input
            type="time"
            value={settings.reminderTime}
            onChange={(e) => updateSetting('reminderTime', e.target.value)}
            className="w-full p-3 rounded-xl bg-secondary text-foreground border-0 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>

        {/* Data Management */}
        <div className="bg-card rounded-2xl shadow-card p-4">
          <h3 className="font-semibold text-foreground mb-3">{t('dataManagement')}</h3>
          <div className="space-y-2">
            <button
              onClick={handleExport}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <Download className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">{t('export')}</p>
                <p className="text-xs text-muted-foreground">{t('export.desc')}</p>
              </div>
            </button>
            <button
              onClick={handleImport}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <Upload className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">{t('import')}</p>
                <p className="text-xs text-muted-foreground">{t('import.desc')}</p>
              </div>
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default Settings;
