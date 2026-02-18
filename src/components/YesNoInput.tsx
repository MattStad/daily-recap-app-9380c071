import { Check, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface YesNoInputProps {
  value?: boolean;
  onChange: (value: boolean) => void;
}

const YesNoInput = ({ value, onChange }: YesNoInputProps) => {
  const { t } = useI18n();
  return (
    <div className="flex gap-4 justify-center">
      <button
        onClick={() => onChange(true)}
        className={`flex items-center gap-2 px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-200 ${
          value === true
            ? 'bg-primary text-primary-foreground shadow-lg scale-105'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-102'
        }`}
      >
        <Check className="w-5 h-5" />
        {t('yes')}
      </button>
      <button
        onClick={() => onChange(false)}
        className={`flex items-center gap-2 px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-200 ${
          value === false
            ? 'bg-destructive text-destructive-foreground shadow-lg scale-105'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-102'
        }`}
      >
        <X className="w-5 h-5" />
        {t('no')}
      </button>
    </div>
  );
};

export default YesNoInput;
