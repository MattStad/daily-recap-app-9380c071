import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Settings, Check, Flame } from 'lucide-react';
import { getUserQuestions, getDayEntry, getTodayString, getCustomQuestions, getStreak, getTotalCheckIns, getAllEntries } from '@/lib/store';
import { PREDEFINED_QUESTIONS } from '@/lib/questions';

const Index = () => {
  const navigate = useNavigate();
  const [checkedIn, setCheckedIn] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [answeredToday, setAnsweredToday] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalCheckIns, setTotalCheckInsState] = useState(0);
  const [weekData, setWeekData] = useState<{ day: string; date: number; done: boolean; isToday: boolean }[]>([]);

  useEffect(() => {
    const uqs = getUserQuestions();
    setTotalQuestions(uqs.length);
    const todayEntry = getDayEntry(getTodayString());
    const answered = todayEntry?.answers.length || 0;
    setAnsweredToday(answered);
    setCheckedIn(answered >= uqs.length && uqs.length > 0);
    setStreak(getStreak());
    setTotalCheckInsState(getTotalCheckIns());

    // Build week data
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

    const entries = getAllEntries();
    const entryDates = new Set(entries.map(e => e.date));
    const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    const week: typeof weekData = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const isToday = dateStr === getTodayString();
      week.push({
        day: days[i],
        date: d.getDate(),
        done: entryDates.has(dateStr),
        isToday,
      });
    }
    setWeekData(week);
  }, []);

  const hasUnanswered = answeredToday < totalQuestions && totalQuestions > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="px-5 pt-6 pb-2 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Daily Recap</h1>
          <p className="text-sm text-muted-foreground">Deine tägliche Reflexion</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/statistics')} className="p-2.5 rounded-xl hover:bg-secondary transition-colors">
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
          </button>
          <button onClick={() => navigate('/manage')} className="p-2.5 rounded-xl hover:bg-secondary transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Hero card */}
      <div className="px-5 pt-2">
        <div className="bg-primary rounded-2xl p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(174 62% 32%), hsl(174 62% 42%))' }}>
          {/* Streak badge */}
          {streak > 0 && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-accent rounded-full px-3 py-1.5">
              <Flame className="w-4 h-4 text-accent-foreground" />
              <span className="text-sm font-bold text-accent-foreground">{streak}</span>
            </div>
          )}

          <p className="text-primary-foreground/70 text-xs font-medium uppercase tracking-wider">Heute</p>
          <h2 className="text-2xl font-bold text-primary-foreground mt-1">
            {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h2>

          {/* Check-in status */}
          <div className="mt-6 flex flex-col items-center">
            {checkedIn ? (
              <>
                <div className="w-16 h-16 rounded-full border-[3px] border-primary-foreground/40 flex items-center justify-center bg-primary-foreground/10">
                  <Check className="w-8 h-8 text-primary-foreground" />
                </div>
                <p className="text-primary-foreground font-semibold mt-3 text-lg">Check-in erledigt! 🎉</p>
                <p className="text-primary-foreground/60 text-sm">Du hast alle Fragen beantwortet</p>
              </>
            ) : totalQuestions > 0 ? (
              <>
                <button
                  onClick={() => navigate('/checkin')}
                  className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 transition-colors active:scale-95"
                >
                  <span className="text-3xl">▶</span>
                </button>
                <p className="text-primary-foreground font-semibold mt-3 text-lg">
                  {answeredToday > 0 ? 'Weiter machen' : 'Check-in starten'}
                </p>
                <p className="text-primary-foreground/60 text-sm">
                  {answeredToday}/{totalQuestions} beantwortet
                </p>
              </>
            ) : (
              <>
                <p className="text-primary-foreground/80 text-sm mt-2">Noch keine Fragen ausgewählt</p>
                <button
                  onClick={() => navigate('/manage')}
                  className="mt-3 bg-primary-foreground/20 text-primary-foreground px-5 py-2 rounded-xl font-semibold text-sm hover:bg-primary-foreground/30 transition-colors"
                >
                  Fragen auswählen
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Weekly calendar */}
      <div className="px-5 mt-5">
        <div className="bg-card rounded-2xl shadow-card p-4">
          <h3 className="font-semibold text-foreground mb-3">Diese Woche</h3>
          <div className="grid grid-cols-7 gap-1">
            {weekData.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span className={`text-xs font-medium ${d.isToday ? 'text-primary' : 'text-muted-foreground'}`}>{d.day}</span>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${
                  d.done
                    ? 'bg-primary text-primary-foreground'
                    : d.isToday
                    ? 'border-2 border-primary text-primary font-bold'
                    : 'bg-secondary text-muted-foreground'
                }`}>
                  {d.done ? <Check className="w-4 h-4" /> : '—'}
                </div>
                <span className={`text-xs ${d.isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>{d.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="px-5 mt-4 pb-8 grid grid-cols-2 gap-3">
        <div className="bg-card rounded-2xl shadow-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Gesamt Check-ins</p>
          <p className="text-3xl font-bold text-foreground">{totalCheckIns}</p>
        </div>
        <div className="bg-card rounded-2xl shadow-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Aktive Fragen</p>
          <p className="text-3xl font-bold text-foreground">{totalQuestions}</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
