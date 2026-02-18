import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flame, Calendar, TrendingUp, Target, Clock, TrendingDown, Lightbulb } from 'lucide-react';
import { Question, PREDEFINED_QUESTIONS } from '@/lib/questions';
import { useI18n } from '@/lib/i18n';
import {
  getUserQuestions, getCustomQuestions, getAnswersForQuestion, updateQuestionChartType,
  getStreak, getBestStreak, getTotalCheckIns, getAllEntries,
} from '@/lib/store';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';

const CHART_COLORS = ['hsl(174, 62%, 32%)', 'hsl(38, 92%, 50%)', 'hsl(152, 60%, 42%)', 'hsl(280, 60%, 55%)', 'hsl(350, 65%, 55%)'];

const Statistics = () => {
  const navigate = useNavigate();
  const { t, tQuestion, dateLocale } = useI18n();
  const [userQuestions, setUserQuestions] = useState(getUserQuestions());
  const allQuestions = useMemo(() => [...PREDEFINED_QUESTIONS, ...getCustomQuestions()], []);

  const streak = getStreak();
  const bestStreak = getBestStreak();
  const totalCheckIns = getTotalCheckIns();

  const thirtyDayRate = useMemo(() => {
    const entries = getAllEntries();
    const today = new Date();
    let count = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (entries.find(e => e.date === d.toISOString().split('T')[0])) count++;
    }
    return Math.round((count / 30) * 100);
  }, []);

  // Weekly rate insight
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

  // Trend insights
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
        const curr = Number(recent[i].value);
        const prev = Number(recent[i - 1].value);
        trend += curr - prev;
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

      <div className="px-5 mb-4">
        <div className="gradient-accent rounded-2xl p-5 text-center">
          <p className="text-accent-foreground/80 text-sm font-medium">{t('currentStreak')}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="bg-accent-foreground/20 rounded-full p-2"><Flame className="w-5 h-5 text-accent-foreground" /></div>
            <span className="text-3xl font-bold text-accent-foreground">{streak}</span>
          </div>
          <p className="text-accent-foreground/80 text-sm mt-1">{streakMessage}</p>
        </div>
      </div>

      <div className="px-5 grid grid-cols-3 gap-2 mb-4">
        <div className="bg-card rounded-xl shadow-card p-3 text-center">
          <Calendar className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{totalCheckIns}</p>
          <p className="text-[10px] text-muted-foreground">{t('checkins')}</p>
        </div>
        <div className="bg-card rounded-xl shadow-card p-3 text-center">
          <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{bestStreak}</p>
          <p className="text-[10px] text-muted-foreground">{t('bestStreak')}</p>
        </div>
        <div className="bg-card rounded-xl shadow-card p-3 text-center">
          <Target className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{thirtyDayRate}%</p>
          <p className="text-[10px] text-muted-foreground">{t('thirtyDayRate')}</p>
        </div>
      </div>

      {/* Insights */}
      {(trendInsights.length > 0 || weeklyInsight.done > 0) && (
        <div className="px-5 mb-4 space-y-2">
          <div className="bg-card rounded-xl shadow-card p-3.5 flex items-start gap-3 border border-border/50">
            <Lightbulb className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm text-foreground">
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

      <div className="px-5 pb-8">
        <h2 className="text-lg font-bold text-foreground mb-3">{t('trends')}</h2>
        <div className="space-y-3">
          {activeQuestions.map(({ question, config }) => (
            <QuestionStats key={question.id} question={question} chartType={config.chartType || 'line'} onToggleChart={() => toggleChartType(question.id)} tQuestion={tQuestion} dateLocale={dateLocale} t={t} />
          ))}
          {activeQuestions.length === 0 && <div className="text-center py-8 text-muted-foreground text-sm">{t('noQuestionsSelected')}</div>}
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
    <div className="bg-card rounded-xl shadow-card p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xl">{question.emoji || '📝'}</span>
          <p className="text-sm font-semibold text-foreground truncate">{tQuestion(question.id, question.text)}</p>
        </div>
        {question.type !== 'freetext' && (
          <button onClick={onToggleChart} className="p-2 rounded-lg hover:bg-secondary transition-colors ml-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
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
    // Completion rate bar instead of pie
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
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${rate}%`, background: CHART_COLORS[0] }} />
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
              <Cell key={i} fill={entry.value === 1 ? CHART_COLORS[0] : CHART_COLORS[4]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ScaleChart({ answers, chartType, min, max, dateLocale }: { answers: { date: string; value: any }[]; chartType: 'line' | 'pie'; min: number; max: number; dateLocale: string }) {
  if (chartType === 'pie') {
    // Weekly average bar chart instead
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
            <Bar dataKey="avg" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
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
          <Line type="monotone" dataKey="value" stroke={CHART_COLORS[0]} strokeWidth={2} dot={{ fill: CHART_COLORS[0], r: 3 }} />
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
              <span key={word} className="px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary">{word} ({count})</span>
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

export default Statistics;
