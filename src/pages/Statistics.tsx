import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flame, CalendarCheck, Trophy, Percent, TrendingUp, TrendingDown, Lightbulb, BarChart3, LineChart as LineChartIcon, X } from 'lucide-react';
import { Question, PREDEFINED_QUESTIONS } from '@/lib/questions';
import { useI18n } from '@/lib/i18n';
import {
  getUserQuestions, getCustomQuestions, getAnswersForQuestion, updateQuestionChartType,
  getStreak, getBestStreak, getTotalCheckIns, getAllEntries, getDayEntry,
} from '@/lib/store';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';

const Statistics = () => {
  const navigate = useNavigate();
  const { t, tQuestion, dateLocale } = useI18n();
  const [userQuestions, setUserQuestions] = useState(getUserQuestions());
  const [selectedHeatmapDay, setSelectedHeatmapDay] = useState<string | null>(null);
  const allQuestions = useMemo(() => [...PREDEFINED_QUESTIONS, ...getCustomQuestions()], []);

  const streak = getStreak();
  const bestStreak = getBestStreak();
  const totalCheckIns = getTotalCheckIns();

  const completionRate = useMemo(() => {
    const entries = getAllEntries();
    if (entries.length === 0) return 0;
    const dates = entries.map(e => new Date(e.date).getTime());
    const firstDate = new Date(Math.min(...dates));
    const today = new Date();
    const totalDays = Math.max(1, Math.floor((today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    return Math.round((entries.length / totalDays) * 100);
  }, []);

  const weeklyInsight = useMemo(() => {
    const entries = getAllEntries();
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    let count = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      if (entries.find(e => e.date === dateStr)) count++;
    }
    const daysElapsed = Math.min(7, dayOfWeek === 0 ? 7 : dayOfWeek);
    return { done: count, total: daysElapsed };
  }, []);

  const trendInsights = useMemo(() => {
    const insights: { text: string; type: 'up' | 'down' }[] = [];
    userQuestions.forEach(uq => {
      const q = allQuestions.find(qq => qq.id === uq.questionId);
      if (!q || q.type === 'freetext') return;
      const answers = getAnswersForQuestion(q.id);
      if (answers.length < 3) return;
      const recent = answers.slice(-5);
      let trend = 0;
      for (let i = 1; i < recent.length; i++) {
        trend += Number(recent[i].value) - Number(recent[i - 1].value);
      }
      if (Math.abs(trend) >= 2) {
        const name = tQuestion(q.id, q.text).substring(0, 30);
        insights.push({
          text: trend > 0
            ? (t('insight.improving') as string).replace('{name}', name).replace('{n}', String(recent.length))
            : (t('insight.declining') as string).replace('{name}', name).replace('{n}', String(recent.length)),
          type: trend > 0 ? 'up' : 'down',
        });
      }
    });
    return insights;
  }, [userQuestions, allQuestions, t, tQuestion]);

  const activeQuestions = useMemo(() =>
    userQuestions
      .map(uq => ({ question: allQuestions.find(q => q.id === uq.questionId), config: uq }))
      .filter(item => item.question) as { question: Question; config: typeof userQuestions[0] }[],
    [userQuestions, allQuestions]
  );

  const toggleChartType = (questionId: string) => {
    const current = userQuestions.find(q => q.questionId === questionId);
    updateQuestionChartType(questionId, current?.chartType === 'pie' ? 'line' : 'pie');
    setUserQuestions(getUserQuestions());
  };

  const streakMessage = streak === 0 ? t('streak.start') : streak === 1 ? t('streak.great') : streak < 7 ? t('streak.keepGoing') : t('streak.amazing');

  return (
    <div className="min-h-screen bg-background">
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('statistics')}</h1>
            <p className="text-sm text-muted-foreground">{t('statistics.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Streak banner */}
      <div className="px-5 mb-4">
        <div className="gradient-primary rounded-2xl p-5 text-center">
          <p className="text-primary-foreground/80 text-xs font-medium uppercase tracking-wider">{t('currentStreak')}</p>
          <div className="flex items-center justify-center gap-3 mt-2">
            <div className="bg-primary-foreground/20 rounded-full p-2.5">
              <Flame className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-4xl font-bold text-primary-foreground">{streak}</span>
          </div>
          <p className="text-primary-foreground/70 text-sm mt-2">{streakMessage}</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="px-5 grid grid-cols-3 gap-2.5 mb-4">
        <div className="bg-card rounded-2xl shadow-card p-3.5 text-center">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <CalendarCheck className="w-4.5 h-4.5 text-primary" />
          </div>
          <p className="text-xl font-bold text-foreground">{totalCheckIns}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{t('checkins')}</p>
        </div>
        <div className="bg-card rounded-2xl shadow-card p-3.5 text-center">
          <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center mx-auto mb-2">
            <Trophy className="w-4.5 h-4.5 text-accent" />
          </div>
          <p className="text-xl font-bold text-foreground">{bestStreak}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{t('bestStreak')}</p>
        </div>
        <div className="bg-card rounded-2xl shadow-card p-3.5 text-center">
          <div className="w-9 h-9 rounded-xl bg-success/15 flex items-center justify-center mx-auto mb-2">
            <Percent className="w-4.5 h-4.5 text-success" />
          </div>
          <p className="text-xl font-bold text-foreground">{completionRate}%</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{t('completionRate')}</p>
        </div>
      </div>

      {/* Insights */}
      {(trendInsights.length > 0 || weeklyInsight.done > 0) && (
        <div className="px-5 mb-4">
          <div className="bg-card rounded-2xl shadow-card p-4 flex items-start gap-3 border border-border/50">
            <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-4.5 h-4.5 text-accent" />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-foreground">
                {(t('insight.weeklyRate') as string).replace('{n}', String(weeklyInsight.done)).replace('{total}', String(weeklyInsight.total))}
              </p>
              {trendInsights.map((ins, i) => (
                <div key={i} className="flex items-center gap-1.5 text-sm">
                  {ins.type === 'up' ? <TrendingUp className="w-3.5 h-3.5 text-primary" /> : <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
                  <span className="text-muted-foreground">{ins.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Heatmap */}
      <div className="px-5 mb-4">
        <HeatmapCalendar
          t={t}
          tQuestion={tQuestion}
          dateLocale={dateLocale}
          allQuestions={allQuestions}
          userQuestions={userQuestions}
          selectedDay={selectedHeatmapDay}
          onSelectDay={setSelectedHeatmapDay}
        />
      </div>

      {/* Question trends */}
      <div className="px-5 pb-8">
        <h2 className="text-lg font-bold text-foreground mb-3">{t('trends')}</h2>
        <div className="space-y-3">
          {activeQuestions.map(({ question, config }) => (
            <QuestionStats key={question.id} question={question} chartType={config.chartType || 'line'} onToggleChart={() => toggleChartType(question.id)} tQuestion={tQuestion} dateLocale={dateLocale} t={t} />
          ))}
          {activeQuestions.length === 0 && (
            <div className="bg-card rounded-2xl shadow-card p-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">{t('noQuestionsSelected')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function QuestionStats({ question, chartType, onToggleChart, tQuestion, dateLocale, t }: {
  question: Question; chartType: 'line' | 'pie'; onToggleChart: () => void;
  tQuestion: (id: string, text: string) => string; dateLocale: string; t: (key: string) => string;
}) {
  const answers = getAnswersForQuestion(question.id);
  const hasData = answers.length > 0;
  return (
    <div className="bg-card rounded-2xl shadow-card p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className="text-xl">{question.emoji || '📝'}</span>
          <p className="text-sm font-semibold text-foreground truncate">{tQuestion(question.id, question.text)}</p>
        </div>
        {question.type !== 'freetext' && hasData && (
          <button onClick={onToggleChart} className="p-2 rounded-lg hover:bg-secondary transition-colors ml-2" title={chartType === 'line' ? 'Bar chart' : 'Line chart'}>
            {chartType === 'line' ? <BarChart3 className="w-4 h-4 text-muted-foreground" /> : <LineChartIcon className="w-4 h-4 text-muted-foreground" />}
          </button>
        )}
      </div>
      {!hasData ? (
        <p className="text-sm text-muted-foreground italic py-4 text-center">{t('noData')}</p>
      ) : question.type === 'yesno' ? (
        <YesNoChart answers={answers} chartType={chartType} dateLocale={dateLocale} t={t} />
      ) : question.type === 'scale' ? (
        <ScaleChart answers={answers} chartType={chartType} min={question.scaleMin || 1} max={question.scaleMax || 10} dateLocale={dateLocale} />
      ) : (
        <FreeTextStats answers={answers} dateLocale={dateLocale} t={t} />
      )}
    </div>
  );
}

function YesNoChart({ answers, chartType, dateLocale, t }: { answers: { date: string; value: any }[]; chartType: 'line' | 'pie'; dateLocale: string; t: (k: string) => string }) {
  const yesCount = answers.filter(a => a.value === true).length;
  const noCount = answers.filter(a => a.value === false).length;

  if (chartType === 'pie') {
    const total = yesCount + noCount;
    const rate = total > 0 ? Math.round((yesCount / total) * 100) : 0;
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t('yes')}: {yesCount}</span>
          <span className="font-bold text-foreground">{rate}%</span>
          <span className="text-muted-foreground">{t('no')}: {noCount}</span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500 bg-primary" style={{ width: `${rate}%` }} />
        </div>
      </div>
    );
  }

  const barData = answers.slice(-14).map(a => ({
    date: new Date(a.date).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short' }),
    value: a.value === true ? 1 : 0,
  }));

  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={barData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis domain={[0, 1]} ticks={[0, 1]} tickFormatter={v => v === 1 ? '✓' : '✗'} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <Tooltip formatter={(v: number) => v === 1 ? t('yes') : t('no')} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {barData.map((entry, i) => (
              <Cell key={i} fill={entry.value === 1 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ScaleChart({ answers, chartType, min, max, dateLocale }: { answers: { date: string; value: any }[]; chartType: 'line' | 'pie'; min: number; max: number; dateLocale: string }) {
  if (chartType === 'pie') {
    const weeklyData: Record<string, { sum: number; count: number }> = {};
    answers.forEach(a => {
      const d = new Date(a.date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toLocaleDateString(dateLocale, { day: 'numeric', month: 'short' });
      if (!weeklyData[key]) weeklyData[key] = { sum: 0, count: 0 };
      weeklyData[key].sum += Number(a.value);
      weeklyData[key].count++;
    });
    const barData = Object.entries(weeklyData).slice(-8).map(([week, data]) => ({
      week,
      avg: Math.round((data.sum / data.count) * 10) / 10,
    }));

    return (
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis domain={[min, max]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip />
            <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  const lineData = answers.slice(-30).map(a => ({
    date: new Date(a.date).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short' }),
    value: Number(a.value),
  }));

  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={lineData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis domain={[min, max]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--primary))', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function FreeTextStats({ answers, dateLocale, t }: { answers: { date: string; value: any }[]; dateLocale: string; t: (k: string) => string }) {
  const wordCounts: Record<string, number> = {};
  answers.forEach(a => { String(a.value).toLowerCase().split(/\s+/).filter(w => w.length > 2).forEach(w => { wordCounts[w] = (wordCounts[w] || 0) + 1; }); });
  const topWords = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  return (
    <div>
      {topWords.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-muted-foreground mb-2">{t('topWords')}</p>
          <div className="flex flex-wrap gap-1.5">
            {topWords.map(([word, count]) => (
              <span key={word} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary">{word} ({count})</span>
            ))}
          </div>
        </div>
      )}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2">{t('recentEntries')}</p>
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {answers.slice(-5).reverse().map((a, i) => (
            <div key={i} className="flex gap-2 text-xs">
              <span className="text-muted-foreground flex-shrink-0">{new Date(a.date).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short' })}</span>
              <span className="text-foreground">{String(a.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeatmapCalendar({ t, tQuestion, dateLocale, allQuestions, userQuestions, selectedDay, onSelectDay }: {
  t: (k: string) => string;
  tQuestion: (id: string, text: string) => string;
  dateLocale: string;
  allQuestions: Question[];
  userQuestions: any[];
  selectedDay: string | null;
  onSelectDay: (day: string | null) => void;
}) {
  const entries = useMemo(() => getAllEntries(), []);
  // Map date -> day score (0-100) based on answer quality, not just count
  const entryMap = useMemo(() => {
    const map: Record<string, number> = {};
    entries.forEach(e => {
      if (e.answers.length === 0) return;
      let scoreSum = 0;
      let scoreCount = 0;
      e.answers.forEach(a => {
        const q = allQuestions.find(qq => qq.id === a.questionId);
        if (!q) return;
        if (q.type === 'scale') {
          const max = q.scaleMax || 10;
          const min = q.scaleMin || 1;
          scoreSum += (Number(a.value) - min) / (max - min);
          scoreCount++;
        } else if (q.type === 'yesno') {
          scoreSum += a.value === true ? 1 : 0;
          scoreCount++;
        }
      });
      // If no scoreable questions, use completion as fallback (50%)
      map[e.date] = scoreCount > 0 ? Math.round((scoreSum / scoreCount) * 100) : 50;
    });
    return map;
  }, [entries, allQuestions]);

  // Build 16 weeks (112 days) of data
  const { weeks, months } = useMemo(() => {
    const today = new Date();
    const totalWeeks = 16;
    const totalDays = totalWeeks * 7;
    
    // Find the Monday of the current week
    const dayOfWeek = today.getDay();
    const currentMonday = new Date(today);
    currentMonday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    
    // Go back totalWeeks-1 weeks
    const startDate = new Date(currentMonday);
    startDate.setDate(currentMonday.getDate() - (totalWeeks - 1) * 7);

    const weeks: { dateStr: string; level: number; date: Date }[][] = [];
    const monthLabels: { label: string; col: number }[] = [];
    let lastMonth = -1;

    for (let w = 0; w < totalWeeks; w++) {
      const week: typeof weeks[0] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + w * 7 + d);
        const dateStr = date.toISOString().split('T')[0];
        const score = entryMap[dateStr];
        const isFuture = date > today;
        const level = isFuture ? -1 : score === undefined ? 0 : score >= 80 ? 4 : score >= 60 ? 3 : score >= 40 ? 2 : 1;
        week.push({ dateStr, level, date });

        if (d === 0 && date.getMonth() !== lastMonth) {
          lastMonth = date.getMonth();
          monthLabels.push({
            label: date.toLocaleDateString(dateLocale, { month: 'short' }),
            col: w,
          });
        }
      }
      weeks.push(week);
    }
    return { weeks, months: monthLabels };
  }, [entryMap, dateLocale]);

  // Day score for selected day
  const dayDetail = useMemo(() => {
    if (!selectedDay) return null;
    const entry = getDayEntry(selectedDay);
    if (!entry || entry.answers.length === 0) return null;
    
    const totalUserQs = userQuestions.length || 1;
    const answered = entry.answers.length;
    
    // Calculate score: for scale questions use value/max, for yesno use 1/0, skip freetext
    let scoreSum = 0;
    let scoreCount = 0;
    entry.answers.forEach(a => {
      const q = allQuestions.find(qq => qq.id === a.questionId);
      if (!q) return;
      if (q.type === 'scale') {
        const max = q.scaleMax || 10;
        const min = q.scaleMin || 1;
        scoreSum += (Number(a.value) - min) / (max - min);
        scoreCount++;
      } else if (q.type === 'yesno') {
        scoreSum += a.value === true ? 1 : 0;
        scoreCount++;
      }
    });
    const score = scoreCount > 0 ? Math.round((scoreSum / scoreCount) * 100) : null;

    return {
      answers: entry.answers.map(a => {
        const q = allQuestions.find(qq => qq.id === a.questionId);
        return { emoji: q?.emoji || '📝', text: q ? tQuestion(q.id, q.text) : a.questionId, value: a.value };
      }),
      score,
      answered,
      total: totalUserQs,
    };
  }, [selectedDay, allQuestions, userQuestions, tQuestion]);

  const levelColors = [
    'bg-secondary', // 0 - no entry
    'bg-primary/20',
    'bg-primary/40',
    'bg-primary/65',
    'bg-primary',
  ];

  return (
    <div className="bg-card rounded-2xl shadow-card p-4">
      <h3 className="font-semibold text-foreground mb-3">{t('heatmap.title')}</h3>

      {/* Month labels */}
      <div className="flex gap-[3px] mb-1 ml-6">
        {weeks.map((_, wi) => {
          const ml = months.find(m => m.col === wi);
          return (
            <div key={wi} className="w-3 text-center">
              {ml && <span className="text-[9px] text-muted-foreground">{ml.label}</span>}
            </div>
          );
        })}
      </div>

      {/* Heatmap grid */}
      <div className="flex gap-0.5">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] mr-1 justify-start">
          {['M', '', 'W', '', 'F', '', ''].map((d, i) => (
            <div key={i} className="w-4 h-3 flex items-center justify-center">
              <span className="text-[8px] text-muted-foreground">{d}</span>
            </div>
          ))}
        </div>
        
        <div className="flex gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => (
                <div
                  key={di}
                  className={`w-3 h-3 rounded-[2px] transition-all cursor-pointer hover:ring-1 hover:ring-foreground/30 ${
                    day.level === -1 ? 'bg-transparent' : levelColors[day.level]
                  } ${selectedDay === day.dateStr ? 'ring-2 ring-foreground/60' : ''}`}
                  onClick={() => {
                    if (day.level > 0) onSelectDay(selectedDay === day.dateStr ? null : day.dateStr);
                  }}
                  title={`${day.dateStr}: ${entryMap[day.dateStr] !== undefined ? entryMap[day.dateStr] + '%' : '-'}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-2">
        <span className="text-[9px] text-muted-foreground">{t('heatmap.less')}</span>
        {levelColors.map((c, i) => (
          <div key={i} className={`w-2.5 h-2.5 rounded-[2px] ${c}`} />
        ))}
        <span className="text-[9px] text-muted-foreground">{t('heatmap.more')}</span>
      </div>

      {/* Day detail */}
      {selectedDay && dayDetail && (
        <div className="mt-3 pt-3 border-t border-border/50 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">
                {new Date(selectedDay).toLocaleDateString(dateLocale, { weekday: 'short', day: 'numeric', month: 'short' })}
              </p>
              {dayDetail.score !== null && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  dayDetail.score >= 70 ? 'bg-primary/15 text-primary' : dayDetail.score >= 40 ? 'bg-accent/15 text-accent' : 'bg-destructive/15 text-destructive'
                }`}>
                  {t('heatmap.dayScore')}: {dayDetail.score}%
                </span>
              )}
            </div>
            <button onClick={() => onSelectDay(null)} className="p-1 rounded hover:bg-secondary">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            {(t('heatmap.questionsOf') as string).replace('{n}', String(dayDetail.answered)).replace('{total}', String(dayDetail.total))}
          </p>
          <div className="space-y-1">
            {dayDetail.answers.map((a, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="text-base">{a.emoji}</span>
                <span className="text-muted-foreground flex-1 truncate text-xs">{a.text}</span>
                <span className="font-medium text-foreground text-xs">
                  {typeof a.value === 'boolean' ? (a.value ? '✅' : '❌') : a.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {selectedDay && !dayDetail && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-sm text-muted-foreground text-center">{t('heatmap.noData')}</p>
        </div>
      )}
    </div>
  );
}

export default Statistics;
