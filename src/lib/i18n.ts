import { createContext, useContext } from 'react';

export type Language = 'de' | 'en';

const translations = {
  de: {
    // Index
    'app.title': 'Daily Recap',
    'app.subtitle': 'Deine tägliche Reflexion',
    'today': 'Heute',
    'checkin.done': 'Check-in erledigt! 🎉',
    'checkin.allAnswered': 'Du hast alle Fragen beantwortet',
    'checkin.start': 'Check-in starten',
    'checkin.continue': 'Weiter machen',
    'checkin.answered': 'beantwortet',
    'checkin.noQuestions': 'Noch keine Fragen ausgewählt',
    'checkin.selectQuestions': 'Fragen auswählen',
    'thisWeek': 'Diese Woche',
    'totalCheckins': 'Gesamt Check-ins',
    'activeQuestions': 'Aktive Fragen',

    // Check-in
    'allDone': 'Alles erledigt! ✅',
    'noOpenQuestions': 'Keine offenen Fragen für heute',
    'back': 'Zurück',
    'next': 'Weiter',
    'done': 'Fertig',
    'yourAnswer': 'Deine Antwort...',
    'yes': 'Ja',
    'no': 'Nein',

    // Manage
    'myQuestions': 'Meine Fragen',
    'myQuestions.subtitle': 'Definiere deine täglichen Check-in Fragen',
    'noQuestionsAdded': 'Noch keine Fragen hinzugefügt',
    'fromLibrary': 'Aus Bibliothek auswählen',
    'createOwn': 'Eigene Frage erstellen',
    'questionLibrary': 'Fragen-Bibliothek',
    'searchQuestion': 'Frage suchen...',
    'noMoreQuestions': 'Keine weiteren Fragen verfügbar',
    'newQuestion': 'Neue Frage',
    'yourQuestion': 'Deine Frage...',
    'createAndAdd': 'Frage erstellen & hinzufügen',
    'type.yesno': 'Ja/Nein',
    'type.scale': 'Skala',
    'type.freetext': 'Freitext',

    // Motivation messages after check-in
    'motivation.1': 'Stark! Du investierst in dich selbst 💪',
    'motivation.2': 'Jeder Tag zählt – und heute hast du geliefert! 🔥',
    'motivation.3': 'Kleine Schritte, große Wirkung. Weiter so! 🚀',
    'motivation.4': 'Du bist auf dem richtigen Weg! ✨',
    'motivation.5': 'Selbstreflexion ist eine Superkraft 🦸',
    'motivation.6': 'Konsistenz schlägt Perfektion. Immer. 🎯',
    'motivation.7': 'Heute erledigt – morgen stolz! 🏆',
    'motivation.8': 'Dein zukünftiges Ich wird dir danken 🙌',

    // Home hooks
    'hook.noCheckin': 'Heute noch kein Check-in gemacht 👀',
    'hook.streak': 'Du bist auf einer {n}-Tage-Streak – bleib dran! 🔥',
    'hook.quickCheckin': 'Nur 60 Sekunden bis zum Tagesabschluss ⚡',
    'hook.continueCheckin': 'Fast geschafft – noch {n} Fragen offen',

    // Home extras
    'home.dailyTip': 'Tipp des Tages',
    'home.tip.1': 'Trinke direkt nach dem Aufstehen ein Glas Wasser 💧',
    'home.tip.2': 'Nimm dir 5 Minuten für dich – einfach atmen 🧘',
    'home.tip.3': 'Schreibe 3 Dinge auf, für die du dankbar bist 🙏',
    'home.tip.4': 'Geh heute mindestens 10 Minuten an die frische Luft 🌿',
    'home.tip.5': 'Feiere kleine Erfolge – sie zählen! 🎉',
    'home.tip.6': 'Lege dein Handy 30 Minuten zur Seite 📵',
    'home.tip.7': 'Lächle jemanden an – es macht beide glücklich 😊',
    'home.recentActivity': 'Letzte Aktivität',
    'home.noActivity': 'Noch keine Einträge – starte deinen ersten Check-in!',
    'home.daysAgo': 'vor {n} Tagen',
    'home.yesterday': 'Gestern',
    'home.today': 'Heute',
    'home.questionsAnswered': '{n} Fragen beantwortet',
    'home.yourProgress': 'Dein Fortschritt',
    'home.completionAllTime': 'Erfolgsrate seit Beginn',

    // Week visualization
    'week.missed': 'Verpasst',
    'week.completed': 'Erledigt',
    'week.upcoming': 'Kommt noch',

    // Templates
    'templates': 'Vorlagen entdecken',
    'templates.title': 'Routine-Vorlagen',
    'templates.subtitle': 'Fertige Fragen-Packs für verschiedene Ziele',
    'template.fitness': '💪 Fitness Pack',
    'template.fitness.desc': 'Training, Bewegung & körperliches Wohlbefinden',
    'template.study': '📚 Study Pack',
    'template.study.desc': 'Lernen, Lesen & persönliche Entwicklung',
    'template.mindset': '🧘 Mindset Pack',
    'template.mindset.desc': 'Meditation, Dankbarkeit & mentale Stärke',
    'template.sleep': '😴 Sleep Pack',
    'template.sleep.desc': 'Schlafqualität & Erholungsroutine',

    // Edit question
    'editQuestion': 'Frage bearbeiten',
    'save': 'Speichern',

    // Insights
    'insight.weeklyRate': 'Du hast diese Woche {n}/{total} Check-ins gemacht.',
    'insight.improving': '{name} steigt seit {n} Tagen.',
    'insight.declining': '{name} sinkt seit {n} Tagen.',

    // Statistics
    'statistics': 'Statistiken',
    'statistics.subtitle': 'Dein Fortschritt im Überblick',
    'currentStreak': 'Aktuelle Streak',
    'streak.start': 'Starte jetzt!',
    'streak.great': 'Großartiger Start!',
    'streak.keepGoing': 'Weiter so!',
    'streak.amazing': 'Unglaublich! 🔥',
    'checkins': 'Check-ins',
    'bestStreak': 'Beste Streak',
    'completionRate': 'Erfolgsrate',
    'trends': 'Trends',
    'noQuestionsSelected': 'Keine Fragen ausgewählt',
    'noData': 'Noch keine Daten',
    'topWords': 'Häufigste Wörter',
    'recentEntries': 'Letzte Einträge',

    // Settings
    'settings': 'Einstellungen',
    'settings.subtitle': 'App anpassen',
    'language': 'Sprache',
    'german': 'Deutsch',
    'english': 'Englisch',
    'theme': 'Erscheinungsbild',
    'theme.light': 'Hell',
    'theme.dark': 'Dunkel',
    'theme.system': 'System',
    'reminderTime': 'Erinnerungszeit',
    'reminderTime.desc': 'Tägliche Erinnerung zum Check-in',
    'dataManagement': 'Datenverwaltung',
    'export': 'Daten exportieren',
    'export.desc': 'Alle Daten als JSON-Datei speichern',
    'import': 'Daten importieren',
    'import.desc': 'Daten aus JSON-Datei laden',
    'import.success': 'Daten erfolgreich importiert!',
    'import.error': 'Fehler beim Importieren der Daten',
    'import.confirm': 'Bestehende Daten werden überschrieben. Fortfahren?',

    // Categories
    'cat.Gesundheit': 'Gesundheit',
    'cat.Fitness': 'Fitness',
    'cat.Ernährung': 'Ernährung',
    'cat.Mental Health': 'Mental Health',
    'cat.Produktivität': 'Produktivität',
    'cat.Soziales': 'Soziales',
    'cat.Lernen': 'Lernen',
    'cat.Kreativität': 'Kreativität',
    'cat.Finanzen': 'Finanzen',
    'cat.Selbstfürsorge': 'Selbstfürsorge',

    // Days
    'day.mo': 'Mo',
    'day.di': 'Di',
    'day.mi': 'Mi',
    'day.do': 'Do',
    'day.fr': 'Fr',
    'day.sa': 'Sa',
    'day.so': 'So',

    // Onboarding
    'onboarding.welcome.title': 'Willkommen bei Daily Recap!',
    'onboarding.welcome.desc': 'Dein persönlicher Begleiter für tägliche Selbstreflexion. Behalte deine Gewohnheiten im Blick und wachse jeden Tag ein Stück.',
    'onboarding.checkin.title': 'Täglicher Check-in',
    'onboarding.checkin.desc': 'Beantworte jeden Tag deine Fragen in unter 60 Sekunden. Baue Streaks auf und bleib motiviert.',
    'onboarding.questions.title': 'Deine Fragen',
    'onboarding.questions.desc': 'Wähle aus der Bibliothek, erstelle eigene Fragen oder nutze fertige Vorlagen-Packs.',
    'onboarding.stats.title': 'Statistiken & Trends',
    'onboarding.stats.desc': 'Verfolge deinen Fortschritt mit Diagrammen und erhalte automatische Insights.',
    'onboarding.settings.title': 'Einstellungen',
    'onboarding.settings.desc': 'Sprache, Theme und Erinnerungszeit – passe alles nach deinen Wünschen an.',
    'onboarding.start': 'Los geht\'s! 🚀',
  },
  en: {
    'app.title': 'Daily Recap',
    'app.subtitle': 'Your daily reflection',
    'today': 'Today',
    'checkin.done': 'Check-in complete! 🎉',
    'checkin.allAnswered': 'You answered all questions',
    'checkin.start': 'Start check-in',
    'checkin.continue': 'Continue',
    'checkin.answered': 'answered',
    'checkin.noQuestions': 'No questions selected yet',
    'checkin.selectQuestions': 'Select questions',
    'thisWeek': 'This Week',
    'totalCheckins': 'Total Check-ins',
    'activeQuestions': 'Active Questions',

    'allDone': 'All done! ✅',
    'noOpenQuestions': 'No open questions for today',
    'back': 'Back',
    'next': 'Next',
    'done': 'Done',
    'yourAnswer': 'Your answer...',
    'yes': 'Yes',
    'no': 'No',

    'myQuestions': 'My Questions',
    'myQuestions.subtitle': 'Define your daily check-in questions',
    'noQuestionsAdded': 'No questions added yet',
    'fromLibrary': 'Choose from library',
    'createOwn': 'Create your own question',
    'questionLibrary': 'Question Library',
    'searchQuestion': 'Search question...',
    'noMoreQuestions': 'No more questions available',
    'newQuestion': 'New Question',
    'yourQuestion': 'Your question...',
    'createAndAdd': 'Create & add question',
    'type.yesno': 'Yes/No',
    'type.scale': 'Scale',
    'type.freetext': 'Free text',

    // Motivation
    'motivation.1': 'Strong! You\'re investing in yourself 💪',
    'motivation.2': 'Every day counts – and today you delivered! 🔥',
    'motivation.3': 'Small steps, big impact. Keep going! 🚀',
    'motivation.4': 'You\'re on the right track! ✨',
    'motivation.5': 'Self-reflection is a superpower 🦸',
    'motivation.6': 'Consistency beats perfection. Always. 🎯',
    'motivation.7': 'Done today – proud tomorrow! 🏆',
    'motivation.8': 'Your future self will thank you 🙌',

    'hook.noCheckin': 'No check-in yet today 👀',
    'hook.streak': 'You\'re on a {n}-day streak – keep it up! 🔥',
    'hook.quickCheckin': 'Just 60 seconds to wrap up your day ⚡',
    'hook.continueCheckin': 'Almost done – {n} questions left',

    // Home extras
    'home.dailyTip': 'Tip of the Day',
    'home.tip.1': 'Drink a glass of water right after waking up 💧',
    'home.tip.2': 'Take 5 minutes for yourself – just breathe 🧘',
    'home.tip.3': 'Write down 3 things you\'re grateful for 🙏',
    'home.tip.4': 'Go outside for at least 10 minutes today 🌿',
    'home.tip.5': 'Celebrate small wins – they count! 🎉',
    'home.tip.6': 'Put your phone away for 30 minutes 📵',
    'home.tip.7': 'Smile at someone – it makes both of you happy 😊',
    'home.recentActivity': 'Recent Activity',
    'home.noActivity': 'No entries yet – start your first check-in!',
    'home.daysAgo': '{n} days ago',
    'home.yesterday': 'Yesterday',
    'home.today': 'Today',
    'home.questionsAnswered': '{n} questions answered',
    'home.yourProgress': 'Your Progress',
    'home.completionAllTime': 'Completion rate since start',

    'week.missed': 'Missed',
    'week.completed': 'Completed',
    'week.upcoming': 'Upcoming',

    'templates': 'Discover templates',
    'templates.title': 'Routine Templates',
    'templates.subtitle': 'Ready-made question packs for different goals',
    'template.fitness': '💪 Fitness Pack',
    'template.fitness.desc': 'Training, movement & physical well-being',
    'template.study': '📚 Study Pack',
    'template.study.desc': 'Learning, reading & personal development',
    'template.mindset': '🧘 Mindset Pack',
    'template.mindset.desc': 'Meditation, gratitude & mental strength',
    'template.sleep': '😴 Sleep Pack',
    'template.sleep.desc': 'Sleep quality & recovery routine',

    'editQuestion': 'Edit question',
    'save': 'Save',

    'insight.weeklyRate': 'You completed {n}/{total} check-ins this week.',
    'insight.improving': '{name} is rising for {n} days.',
    'insight.declining': '{name} is declining for {n} days.',

    'statistics': 'Statistics',
    'statistics.subtitle': 'Your progress at a glance',
    'currentStreak': 'Current Streak',
    'streak.start': 'Start now!',
    'streak.great': 'Great start!',
    'streak.keepGoing': 'Keep going!',
    'streak.amazing': 'Amazing! 🔥',
    'checkins': 'Check-ins',
    'bestStreak': 'Best Streak',
    'completionRate': 'Completion Rate',
    'trends': 'Trends',
    'noQuestionsSelected': 'No questions selected',
    'noData': 'No data yet',
    'topWords': 'Most frequent words',
    'recentEntries': 'Recent entries',

    'settings': 'Settings',
    'settings.subtitle': 'Customize app',
    'language': 'Language',
    'german': 'German',
    'english': 'English',
    'theme': 'Appearance',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'theme.system': 'System',
    'reminderTime': 'Reminder Time',
    'reminderTime.desc': 'Daily reminder to check in',
    'dataManagement': 'Data Management',
    'export': 'Export data',
    'export.desc': 'Save all data as JSON file',
    'import': 'Import data',
    'import.desc': 'Load data from JSON file',
    'import.success': 'Data imported successfully!',
    'import.error': 'Error importing data',
    'import.confirm': 'Existing data will be overwritten. Continue?',

    'cat.Gesundheit': 'Health',
    'cat.Fitness': 'Fitness',
    'cat.Ernährung': 'Nutrition',
    'cat.Mental Health': 'Mental Health',
    'cat.Produktivität': 'Productivity',
    'cat.Soziales': 'Social',
    'cat.Lernen': 'Learning',
    'cat.Kreativität': 'Creativity',
    'cat.Finanzen': 'Finances',
    'cat.Selbstfürsorge': 'Self-care',

    'day.mo': 'Mon',
    'day.di': 'Tue',
    'day.mi': 'Wed',
    'day.do': 'Thu',
    'day.fr': 'Fri',
    'day.sa': 'Sat',
    'day.so': 'Sun',

    // Onboarding
    'onboarding.welcome.title': 'Welcome to Daily Recap!',
    'onboarding.welcome.desc': 'Your personal companion for daily self-reflection. Track your habits and grow a little every day.',
    'onboarding.checkin.title': 'Daily Check-in',
    'onboarding.checkin.desc': 'Answer your questions every day in under 60 seconds. Build streaks and stay motivated.',
    'onboarding.questions.title': 'Your Questions',
    'onboarding.questions.desc': 'Choose from the library, create custom questions, or use ready-made template packs.',
    'onboarding.stats.title': 'Statistics & Trends',
    'onboarding.stats.desc': 'Track your progress with charts and get automatic insights.',
    'onboarding.settings.title': 'Settings',
    'onboarding.settings.desc': 'Language, theme, and reminder time – customize everything to your needs.',
    'onboarding.start': 'Let\'s go! 🚀',
  },
} as const;

// Question translations (EN versions of predefined questions)
export const questionTranslations: Record<string, string> = {
  'pre-1': 'Did you drink enough water today?',
  'pre-2': 'How many hours did you sleep?',
  'pre-3': 'How well did you sleep?',
  'pre-4': 'Did you take medication/vitamins?',
  'pre-5': 'How do you feel physically?',
  'pre-6': 'Did you exercise today?',
  'pre-7': 'How intense was your workout?',
  'pre-8': 'Did you move enough today?',
  'pre-9': 'How many steps did you take (estimate 1-10)?',
  'pre-10': 'Did you stretch or do yoga?',
  'pre-11': 'Did you eat healthy today?',
  'pre-12': 'How satisfied are you with your diet today?',
  'pre-13': 'Did you eat fruits or vegetables?',
  'pre-14': 'Did you avoid sugar?',
  'pre-15': 'What special food did you eat today?',
  'pre-16': 'How is your mood?',
  'pre-17': 'Did you meditate today?',
  'pre-18': 'How stressed do you feel?',
  'pre-19': 'What are you grateful for today?',
  'pre-20': 'Did you take a break today?',
  'pre-21': 'How was your energy today?',
  'pre-22': 'Did you complete your most important task?',
  'pre-23': 'How productive were you today?',
  'pre-24': 'Did you procrastinate today?',
  'pre-25': 'What was your biggest achievement today?',
  'pre-26': 'How focused were you?',
  'pre-27': 'Did you meet someone today?',
  'pre-28': 'How satisfied are you with your social contacts?',
  'pre-29': 'Did you help someone?',
  'pre-30': 'Did you spend time with family?',
  'pre-31': 'Did you learn something new today?',
  'pre-32': 'Did you read today?',
  'pre-33': 'How much did you learn today?',
  'pre-34': 'What did you learn today?',
  'pre-35': 'Did you do something creative today?',
  'pre-36': 'How creative do you feel today?',
  'pre-37': 'What creative project are you working on?',
  'pre-38': 'Did you spend money unnecessarily today?',
  'pre-39': 'How satisfied are you with your spending?',
  'pre-40': 'What did you spend money on today?',
  'pre-41': 'Did you do something nice for yourself today?',
  'pre-42': 'How satisfied are you with yourself?',
  'pre-43': 'Did you get fresh air today?',
  'pre-44': 'Did you reduce screen time today?',
  'pre-45': 'What made you happy today?',
  'pre-46': 'What do you want to achieve tomorrow?',
  'pre-47': 'How was your day?',
};

type TranslationKey = keyof typeof translations.de;

export interface I18nContextType {
  t: (key: TranslationKey) => string;
  lang: Language;
  setLang: (lang: Language) => void;
  tQuestion: (questionId: string, germanText: string) => string;
  tCategory: (category: string) => string;
  dateLocale: string;
}

export const I18nContext = createContext<I18nContextType>({
  t: (key) => key,
  lang: 'de',
  setLang: () => {},
  tQuestion: (_, text) => text,
  tCategory: (cat) => cat,
  dateLocale: 'de-DE',
});

export function useI18n() {
  return useContext(I18nContext);
}

export function getTranslation(lang: Language, key: TranslationKey): string {
  return translations[lang][key] || key;
}

export function getQuestionText(lang: Language, questionId: string, germanText: string): string {
  if (lang === 'de') return germanText;
  return questionTranslations[questionId] || germanText;
}

export function getCategoryTranslation(lang: Language, category: string): string {
  const key = `cat.${category}` as TranslationKey;
  return translations[lang][key] || category;
}
