import { useState } from 'react';
import { useI18n } from '@/lib/i18n';

interface FreeTextInputProps {
  value?: string;
  onChange: (value: string) => void;
}

const FreeTextInput = ({ value, onChange }: FreeTextInputProps) => {
  const { t } = useI18n();
  const [text, setText] = useState(value || '');

  const handleChange = (newText: string) => {
    setText(newText);
    onChange(newText);
  };

  return (
    <textarea
      value={text}
      onChange={(e) => handleChange(e.target.value)}
      placeholder={t('yourAnswer')}
      className="w-full p-4 rounded-xl bg-secondary text-foreground border-2 border-transparent focus:border-primary focus:outline-none resize-none transition-colors min-h-[120px] text-base"
      rows={4}
    />
  );
};

export default FreeTextInput;
