import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, ArrowLeft, Sparkles } from 'lucide-react';
import { Question, PREDEFINED_QUESTIONS } from '@/lib/questions';
import { getUserQuestions, getCustomQuestions, saveAnswer, getDayEntry, getTodayString } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import YesNoInput from '@/components/YesNoInput';
import ScaleInput from '@/components/ScaleInput';
import FreeTextInput from '@/components/FreeTextInput';

const QUESTION_HINTS: Record<string, string> = {
  'pre-1': 'Deine Gesundheit beginnt mit Wasser 💧',
  'pre-2': 'Guter Schlaf ist das Fundament 🌙',
  'pre-6': 'Bewegung ist Medizin 🏃',
  'pre-16': 'Deine Stimmung zählt ❤️',
  'pre-17': 'Stille Momente geben Kraft 🧘',
  'pre-22': 'Fokus auf das Wesentliche 🎯',
};

const CheckIn = () => {
  const navigate = useNavigate();
  const { t, tQuestion, tCategory } = useI18n();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number | boolean>>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [showCompletion, setShowCompletion] = useState(false);
  const [saved, setSaved] = useState(false);

  const motivationMessage = useMemo(() => {
    const idx = Math.floor(Math.random() * 8) + 1;
    return t(`motivation.${idx}` as any);
  }, []);

  useEffect(() => {
    const userQs = getUserQuestions();
    const customQs = getCustomQuestions();
    const allQuestions = [...PREDEFINED_QUESTIONS, ...customQs];
    const todayEntry = getDayEntry(getTodayString());
    const answeredIds = new Set(todayEntry?.answers.map(a => a.questionId) || []);
    const unansweredQuestions = userQs
      .map(uq => allQuestions.find(q => q.id === uq.questionId))
      .filter((q): q is Question => q != null && !answeredIds.has(q.id));
    setQuestions(unansweredQuestions);
  }, []);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const handleAnswer = useCallback((value: string | number | boolean) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
    setSaved(false);
    if (currentQuestion.type === 'yesno' || currentQuestion.type === 'scale') {
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        saveAnswer(getTodayString(), { questionId: currentQuestion.id, value, timestamp: new Date().toISOString() });
        if (currentIndex < questions.length - 1) {
          setDirection('forward');
          setCurrentIndex(prev => prev + 1);
        } else {
          setShowCompletion(true);
        }
      }, 400);
    }
  }, [currentQuestion, currentIndex, questions.length]);

  const goNext = () => {
    if (!currentQuestion) return;
    const value = answers[currentQuestion.id];
    if (value !== undefined) {
      saveAnswer(getTodayString(), { questionId: currentQuestion.id, value, timestamp: new Date().toISOString() });
    }
    if (currentIndex < questions.length - 1) {
      setDirection('forward');
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowCompletion(true);
    }
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setDirection('backward');
      setCurrentIndex(prev => prev - 1);
    }
  };

  const isAnswered = currentQuestion ? answers[currentQuestion.id] !== undefined : false;
  const isLast = currentIndex === questions.length - 1;
  const hint = currentQuestion ? QUESTION_HINTS[currentQuestion.id] : null;

  // Completion screen with motivation
  if (showCompletion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center animate-fade-in max-w-sm">
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 animate-scale-in shadow-lg">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground mb-3">{t('allDone')}</p>
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{motivationMessage}</p>
          <button onClick={() => navigate('/')} className="gradient-primary text-primary-foreground px-8 py-3.5 rounded-2xl font-semibold text-base shadow-lg hover:opacity-90 transition-opacity">
            {t('back')}
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <p className="text-xl font-semibold text-foreground mb-2">{t('allDone')}</p>
          <p className="text-muted-foreground mb-4">{t('noOpenQuestions')}</p>
          <button onClick={() => navigate('/')} className="gradient-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold">
            {t('back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
            <div className="h-full gradient-primary rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <span className="text-sm text-muted-foreground font-medium">{currentIndex + 1}/{questions.length}</span>
      </div>

      {/* Micro-feedback */}
      {saved && (
        <div className="flex justify-center animate-fade-in">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">✓ Gespeichert</span>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div key={currentIndex} className={`w-full max-w-md animate-fade-in`}>
          <div className="mb-2 flex items-center gap-2">
            {currentQuestion?.emoji && <span className="text-2xl">{currentQuestion.emoji}</span>}
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              {currentQuestion && tCategory(currentQuestion.category)}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3 leading-tight">
            {currentQuestion && tQuestion(currentQuestion.id, currentQuestion.text)}
          </h2>
          {hint && <p className="text-sm text-muted-foreground mb-6 italic">{hint}</p>}
          {!hint && <div className="mb-5" />}

          {currentQuestion?.type === 'yesno' && (
            <YesNoInput value={answers[currentQuestion.id] as boolean | undefined} onChange={handleAnswer} />
          )}
          {currentQuestion?.type === 'scale' && (
            <ScaleInput value={answers[currentQuestion.id] as number | undefined} onChange={handleAnswer} min={currentQuestion.scaleMin} max={currentQuestion.scaleMax} />
          )}
          {currentQuestion?.type === 'freetext' && (
            <FreeTextInput value={answers[currentQuestion.id] as string | undefined} onChange={handleAnswer} />
          )}
        </div>
      </div>

      <div className="p-6 flex gap-3 max-w-md mx-auto w-full">
        <button onClick={goBack} disabled={currentIndex === 0} className="p-3 rounded-xl bg-secondary text-secondary-foreground disabled:opacity-30 transition-all hover:bg-secondary/80">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={goNext}
          disabled={!isAnswered && currentQuestion?.type !== 'freetext'}
          className={`flex-1 py-3.5 rounded-xl font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2 ${
            isAnswered || currentQuestion?.type === 'freetext'
              ? 'gradient-primary text-primary-foreground shadow-lg'
              : 'bg-secondary text-muted-foreground'
          }`}
        >
          {isLast ? (<><Check className="w-5 h-5" />{t('done')}</>) : (<>{t('next')}<ChevronRight className="w-5 h-5" /></>)}
        </button>
      </div>
    </div>
  );
};

export default CheckIn;
