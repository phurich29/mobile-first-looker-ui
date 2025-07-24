import { useLanguage } from '@/contexts/LanguageContext';
import { translations, TranslationKey, TranslationSubKey } from '@/lib/translations';

export const useTranslation = () => {
  const { language } = useLanguage();

  const t = <T extends TranslationKey>(
    category: T,
    key: TranslationSubKey<T>
  ): string => {
    const translation = translations[category]?.[key as keyof typeof translations[T]];
    if (translation && typeof translation === 'object' && language in translation) {
      return translation[language];
    }
    return key as string; // Fallback to key if translation not found
  };

  return { t, language };
};