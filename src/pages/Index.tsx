import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Settings, Check, Flame, ListChecks, X, Lightbulb, TrendingUp, Calendar } from 'lucide-react';
import { getUserQuestions, getDayEntry, getTodayString, getCustomQuestions, getStreak, getTotalCheckIns, getAllEntries, getBestStreak } from '@/lib/store';
import { PREDEFINED_QUESTIONS, Question } from '@/lib/questions';
import { useI18n } from '@/lib/i18n';

const Index = () => {
  const navigate = useNavigate();
  const { t, dateLocale, tQuestion } = useI18n();
  const [checkedIn, setCheckedIn] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [answeredToday, setAnsweredToday] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalCheckIns, setTotalCheckInsState] = useState(0);
  const [weekData, setWeekData] = useState<{ day: string; date: number; done: boolean; isToday: boolean; isPast: boolean; dateStr: string }[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [dayAnswers, setDayAnswers] = useState<{ emoji: string; text: string; value: any }[]>([]);

  useEffect(() => {
    const uqs = getUserQuestions();
    setTotalQuestions(uqs.length);
    const todayEntry = getDayEntry(getTodayString());
    const answered = todayEntry?.answers.length || 0;
    setAnsweredToday(answered);
    setCheckedIn(answered >= uqs.length && uqs.length > 0);
    setStreak(getStreak());
    setTotalCheckInsState(getTotalCheckIns());

    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

    const entries = getAllEntries();
    const entryDates = new Set(entries.map(e => e.date));
    const dayKeys = ['day.mo', 'day.di', 'day.mi', 'day.do', 'day.fr', 'day.sa', 'day.so'] as const;
    const week: typeof weekData = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const isToday = dateStr === getTodayString();
      const isPast = d < today && !isToday;
      week.push({
        day: t(dayKeys[i]),
        date: d.getDate(),
        done: entryDates.has(dateStr),
        isToday,
        isPast,
        dateStr,
      });
    }
    setWeekData(week);
  }, [t]);

  const handleDayClick = (dateStr: string, done: boolean) => {
    if (!done) return;
    const entry = getDayEntry(dateStr);
    if (!entry) return;
    const allQs = [...PREDEFINED_QUESTIONS, ...getCustomQuestions()];
    const mapped = entry.answers.map(a => {
      const q = allQs.find(qq => qq.id === a.questionId);
      return { emoji: q?.emoji || '📝', text: q ? tQuestion(q.id, q.text) : a.questionId, value: a.value };
    });
    setDayAnswers(mapped);
    setSelectedDay(dateStr);
  };

  const hasUnanswered = answeredToday < totalQuestions && totalQuestions > 0;
  const unansweredCount = totalQuestions - answeredToday;

  const getHookMessage = () => {
    if (checkedIn) return null;
    if (answeredToday > 0 && hasUnanswered) {
      return (t('hook.continueCheckin') as string).replace('{n}', String(unansweredCount));
    }
    if (streak > 1) {
      return (t('hook.streak') as string).replace('{n}', String(streak));
    }
    if (totalQuestions > 0) {
      return t('hook.noCheckin');
    }
    return null;
  };

  const hookMessage = getHookMessage();

  // Daily tip based on day of year
  const dailyTip = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const tipIndex = (dayOfYear % 7) + 1;
    return t(`home.tip.${tipIndex}` as any);
  }, [t]);

  // Completion rate since start
  const completionRate = useMemo(() => {
    const entries = getAllEntries();
    if (entries.length === 0) return 0;
    const dates = entries.map(e => new Date(e.date).getTime());
    const firstDate = new Date(Math.min(...dates));
    const today = new Date();
    const totalDays = Math.max(1, Math.floor((today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    return Math.round((entries.length / totalDays) * 100);
  }, []);

  // Recent activity (last 3 entries)
  const recentActivity = useMemo(() => {
    const entries = getAllEntries().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
    const todayStr = getTodayString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    return entries.map(e => {
      let label: string;
      if (e.date === todayStr) {
        label = t('home.today');
      } else if (e.date === yesterdayStr) {
        label = t('home.yesterday');
      } else {
        const diff = Math.floor((Date.now() - new Date(e.date).getTime()) / 86400000);
        label = (t('home.daysAgo') as string).replace('{n}', String(diff));
      }
      return {
        date: e.date,
        label,
        count: e.answers.length,
      };
    });
  }, [t]);

  const bestStreak = getBestStreak();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="px-5 pt-6 pb-2 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('app.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('app.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/manage')} className="p-2.5 rounded-xl hover:bg-secondary transition-colors">
            <ListChecks className="w-5 h-5 text-muted-foreground" />
          </button>
          <button onClick={() => navigate('/statistics')} className="p-2.5 rounded-xl hover:bg-secondary transition-colors">
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
          </button>
          <button onClick={() => navigate('/settings')} className="p-2.5 rounded-xl hover:bg-secondary transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Hero card */}
      <div className="px-5 pt-2">
        <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(174 62% 32%), hsl(174 62% 42%))' }}>
          {streak > 0 && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-accent rounded-full px-3 py-1.5">
              <Flame className="w-4 h-4 text-accent-foreground" />
              <span className="text-sm font-bold text-accent-foreground">{streak}</span>
            </div>
          )}

          <p className="text-primary-foreground/70 text-xs font-medium uppercase tracking-wider">{t('today')}</p>
          <h2 className="text-2xl font-bold text-primary-foreground mt-1">
            {new Date().toLocaleDateString(dateLocale, { weekday: 'long', day: 'numeric', month: 'long' })}
          </h2>

          {hookMessage && (
            <p className="text-primary-foreground/90 text-sm font-medium mt-2 animate-fade-in">{hookMessage}</p>
          )}

          <div className="mt-5 flex flex-col items-center">
            {checkedIn ? (
              <>
                <div className="w-16 h-16 rounded-full border-[3px] border-primary-foreground/40 flex items-center justify-center bg-primary-foreground/10">
                  <Check className="w-8 h-8 text-primary-foreground" />
                </div>
                <p className="text-primary-foreground font-semibold mt-3 text-lg">{t('checkin.done')}</p>
                <p className="text-primary-foreground/60 text-sm">{t('checkin.allAnswered')}</p>
              </>
            ) : totalQuestions > 0 ? (
              <>
                <button
                  onClick={() => navigate('/checkin')}
                  className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 transition-all active:scale-95 hover:scale-105"
                >
                  <span className="text-3xl">▶</span>
                </button>
                <p className="text-primary-foreground font-semibold mt-3 text-lg">
                  {answeredToday > 0 ? t('checkin.continue') : t('checkin.start')}
                </p>
                <p className="text-primary-foreground/60 text-sm">
                  {answeredToday}/{totalQuestions} {t('checkin.answered')}
                </p>
              </>
            ) : (
              <>
                <p className="text-primary-foreground/80 text-sm mt-2">{t('checkin.noQuestions')}</p>
                <button
                  onClick={() => navigate('/manage')}
                  className="mt-3 bg-primary-foreground/20 text-primary-foreground px-5 py-2 rounded-xl font-semibold text-sm hover:bg-primary-foreground/30 transition-colors"
                >
                  {t('checkin.selectQuestions')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="px-5 mt-4 grid grid-cols-3 gap-3">
        <div className="bg-card rounded-2xl shadow-card p-3 text-center">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-1.5">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{totalCheckIns}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{t('totalCheckins')}</p>
        </div>
        <div className="bg-card rounded-2xl shadow-card p-3 text-center">
          <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center mx-auto mb-1.5">
            <Flame className="w-4 h-4 text-accent" />
          </div>
          <p className="text-2xl font-bold text-foreground">{bestStreak}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{t('bestStreak')}</p>
        </div>
        <div className="bg-card rounded-2xl shadow-card p-3 text-center">
          <div className="w-8 h-8 rounded-xl bg-success/15 flex items-center justify-center mx-auto mb-1.5">
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <p className="text-2xl font-bold text-foreground">{completionRate}%</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{t('home.completionAllTime')}</p>
        </div>
      </div>

      {/* Week view */}
      <div className="px-5 mt-4">
        <div className="bg-card rounded-2xl shadow-card p-4">
          <h3 className="font-semibold text-foreground mb-3">{t('thisWeek')}</h3>
          <div className="grid grid-cols-7 gap-1">
            {weekData.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 cursor-pointer" onClick={() => handleDayClick(d.dateStr, d.done)}>
                <span className={`text-xs font-medium ${d.isToday ? 'text-primary' : 'text-muted-foreground'}`}>{d.day}</span>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all ${
                  d.done
                    ? 'bg-primary text-primary-foreground'
                    : d.isToday
                    ? 'border-2 border-primary text-primary font-bold'
                    : d.isPast && !d.done
                    ? 'bg-destructive/15 text-destructive'
                    : 'bg-secondary text-muted-foreground'
                }`}>
                  {d.done ? <Check className="w-4 h-4" /> : d.isPast ? <X className="w-3 h-3" /> : '—'}
                </div>
                <span className={`text-xs ${d.isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>{d.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Day detail popup */}
      {selectedDay && (
        <div className="px-5 mt-3 animate-fade-in">
          <div className="bg-card rounded-xl shadow-card p-4 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-foreground">
                {new Date(selectedDay).toLocaleDateString(dateLocale, { weekday: 'long', day: 'numeric', month: 'short' })}
              </p>
              <button onClick={() => setSelectedDay(null)} className="p-1 rounded hover:bg-secondary">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-1.5">
              {dayAnswers.map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span>{a.emoji}</span>
                  <span className="text-muted-foreground flex-1 truncate">{a.text}</span>
                  <span className="font-medium text-foreground">
                    {typeof a.value === 'boolean' ? (a.value ? '✅' : '❌') : a.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Daily tip */}
      <div className="px-5 mt-4">
        <div className="bg-card rounded-2xl shadow-card p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Lightbulb className="w-4.5 h-4.5 text-accent" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground mb-0.5">{t('home.dailyTip')}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{dailyTip}</p>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="px-5 mt-4 pb-8">
        <div className="bg-card rounded-2xl shadow-card p-4">
          <h3 className="font-semibold text-foreground mb-3">{t('home.recentActivity')}</h3>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('home.noActivity')}</p>
          ) : (
            <div className="space-y-2.5">
              {recentActivity.map((entry, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {(t('home.questionsAnswered') as string).replace('{n}', String(entry.count))}
                    </p>
                    <p className="text-xs text-muted-foreground">{entry.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
