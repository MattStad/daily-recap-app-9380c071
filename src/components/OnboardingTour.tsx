import { useState, useEffect } from 'react';
import { CheckCircle, BarChart3, ListChecks, Settings, ArrowRight, X, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const ONBOARDING_KEY = 'daily-recap-onboarding-done';

interface Step {
  icon: React.ReactNode;
  titleKey: string;
  descKey: string;
  color: string;
}

const OnboardingTour = () => {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) {
      setTimeout(() => setVisible(true), 500);
    }
  }, []);

  const finish = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setVisible(false);
  };

  if (!visible) return null;

  const steps: Step[] = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      titleKey: 'onboarding.welcome.title',
      descKey: 'onboarding.welcome.desc',
      color: 'bg-primary/15 text-primary',
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      titleKey: 'onboarding.checkin.title',
      descKey: 'onboarding.checkin.desc',
      color: 'bg-success/15 text-success',
    },
    {
      icon: <ListChecks className="w-8 h-8" />,
      titleKey: 'onboarding.questions.title',
      descKey: 'onboarding.questions.desc',
      color: 'bg-accent/15 text-accent',
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      titleKey: 'onboarding.stats.title',
      descKey: 'onboarding.stats.desc',
      color: 'bg-primary/15 text-primary',
    },
    {
      icon: <Settings className="w-8 h-8" />,
      titleKey: 'onboarding.settings.title',
      descKey: 'onboarding.settings.desc',
      color: 'bg-muted text-muted-foreground',
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm animate-fade-in p-5">
      <div className="bg-card rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-in">
        {/* Close */}
        <div className="flex justify-end p-3 pb-0">
          <button onClick={finish} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 pb-8 pt-2 text-center">
          <div className={`w-16 h-16 rounded-2xl ${current.color} flex items-center justify-center mx-auto mb-5`}>
            {current.icon}
          </div>

          <h2 className="text-xl font-bold text-foreground mb-2">
            {t(current.titleKey as any)}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">
            {t(current.descKey as any)}
          </p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mb-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? 'w-6 bg-primary' : i < step ? 'w-1.5 bg-primary/40' : 'w-1.5 bg-border'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
              >
                {t('back')}
              </button>
            )}
            <button
              onClick={isLast ? finish : () => setStep(s => s + 1)}
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              {isLast ? t('onboarding.start' as any) : t('next')}
              {!isLast && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
