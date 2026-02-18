import { Answer, DayEntry, Question, UserQuestion } from './questions';

const STORAGE_KEYS = {
  userQuestions: 'daily-recap-user-questions',
  entries: 'daily-recap-entries',
  customQuestions: 'daily-recap-custom-questions',
};

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// User's selected questions
export function getUserQuestions(): UserQuestion[] {
  const data = localStorage.getItem(STORAGE_KEYS.userQuestions);
  return data ? JSON.parse(data) : [];
}

export function setUserQuestions(questions: UserQuestion[]) {
  localStorage.setItem(STORAGE_KEYS.userQuestions, JSON.stringify(questions));
}

export function addUserQuestion(questionId: string) {
  const current = getUserQuestions();
  if (!current.find(q => q.questionId === questionId)) {
    current.push({ questionId, addedAt: new Date().toISOString(), chartType: 'line' });
    setUserQuestions(current);
  }
}

export function removeUserQuestion(questionId: string) {
  const current = getUserQuestions().filter(q => q.questionId !== questionId);
  setUserQuestions(current);
}

export function reorderUserQuestions(fromIndex: number, toIndex: number) {
  const current = getUserQuestions();
  const [moved] = current.splice(fromIndex, 1);
  current.splice(toIndex, 0, moved);
  setUserQuestions(current);
}

export function updateCustomQuestion(questionId: string, updates: Partial<Question>) {
  const current = getCustomQuestions();
  const idx = current.findIndex(q => q.id === questionId);
  if (idx >= 0) {
    current[idx] = { ...current[idx], ...updates };
    localStorage.setItem(STORAGE_KEYS.customQuestions, JSON.stringify(current));
  }
}

export function updateQuestionChartType(questionId: string, chartType: 'line' | 'pie') {
  const current = getUserQuestions();
  const q = current.find(q => q.questionId === questionId);
  if (q) {
    q.chartType = chartType;
    setUserQuestions(current);
  }
}

// Custom questions
export function getCustomQuestions(): Question[] {
  const data = localStorage.getItem(STORAGE_KEYS.customQuestions);
  return data ? JSON.parse(data) : [];
}

export function addCustomQuestion(question: Question) {
  const current = getCustomQuestions();
  current.push({ ...question, isCustom: true });
  localStorage.setItem(STORAGE_KEYS.customQuestions, JSON.stringify(current));
}

export function removeCustomQuestion(questionId: string) {
  const current = getCustomQuestions().filter(q => q.id !== questionId);
  localStorage.setItem(STORAGE_KEYS.customQuestions, JSON.stringify(current));
}

// Day entries
export function getAllEntries(): DayEntry[] {
  const data = localStorage.getItem(STORAGE_KEYS.entries);
  return data ? JSON.parse(data) : [];
}

export function getDayEntry(date: string): DayEntry | undefined {
  return getAllEntries().find(e => e.date === date);
}

export function saveAnswer(date: string, answer: Answer) {
  const entries = getAllEntries();
  let entry = entries.find(e => e.date === date);
  if (!entry) {
    entry = { date, answers: [] };
    entries.push(entry);
  }
  const existingIdx = entry.answers.findIndex(a => a.questionId === answer.questionId);
  if (existingIdx >= 0) {
    entry.answers[existingIdx] = answer;
  } else {
    entry.answers.push(answer);
  }
  localStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(entries));
}

export function getAnswersForQuestion(questionId: string): { date: string; value: string | number | boolean }[] {
  const entries = getAllEntries();
  const results: { date: string; value: string | number | boolean }[] = [];
  for (const entry of entries) {
    const answer = entry.answers.find(a => a.questionId === questionId);
    if (answer) {
      results.push({ date: entry.date, value: answer.value });
    }
  }
  return results.sort((a, b) => a.date.localeCompare(b.date));
}

// Get unanswered questions for today
export function getUnansweredQuestions(allQuestions: Question[]): Question[] {
  const today = getTodayString();
  const entry = getDayEntry(today);
  const answeredIds = new Set(entry?.answers.map(a => a.questionId) || []);
  return allQuestions.filter(q => !answeredIds.has(q.id));
}

// Streak calculation
export function getStreak(): number {
  const entries = getAllEntries();
  if (entries.length === 0) return 0;
  
  const dates = new Set(entries.map(e => e.date));
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    if (dates.has(dateStr)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function getBestStreak(): number {
  const entries = getAllEntries();
  if (entries.length === 0) return 0;
  
  const dates = [...new Set(entries.map(e => e.date))].sort();
  let best = 1;
  let current = 1;
  
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      current++;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }
  return Math.max(best, current);
}

export function getTotalCheckIns(): number {
  return getAllEntries().length;
}
