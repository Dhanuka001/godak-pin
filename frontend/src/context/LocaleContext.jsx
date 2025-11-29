import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import si from '../locales/si.json';
import en from '../locales/en.json';

const LocaleContext = createContext({
  lang: 'si',
  setLanguage: () => {},
  t: () => '',
  languages: ['si', 'en'],
});

const STORAGE_KEY = 'gp_lang';
const COOKIE_KEY = 'gp_lang';
const SUPPORTED = ['si', 'en'];

const loadInitialLanguage = () => {
  if (typeof window === 'undefined') return 'si';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED.includes(stored)) return stored;
  const cookieMatch = document.cookie?.match(new RegExp(`(^| )${COOKIE_KEY}=([^;]+)`));
  if (cookieMatch && SUPPORTED.includes(cookieMatch[2])) return cookieMatch[2];
  return 'si';
};

const dictionaries = { si, en };

const getValue = (dict, path) => {
  if (!dict || !path) return '';
  return path.split('.').reduce((obj, key) => (obj && typeof obj === 'object' ? obj[key] : undefined), dict);
};

export const LocaleProvider = ({ children }) => {
  const [lang, setLang] = useState(loadInitialLanguage);
  const dictionary = useMemo(() => dictionaries[lang] || dictionaries.si, [lang]);

  const t = useCallback(
    (key, fallback = '', options = {}) => {
      const format = (value) => {
        if (typeof value !== 'string') return '';
        return Object.entries(options).reduce(
          (acc, [varKey, varValue]) => acc.replace(new RegExp(`{{${varKey}}}`, 'g'), varValue),
          value
        );
      };
      const value = getValue(dictionary, key);
      if (value) return format(value);
      const defaultValue = getValue(dictionaries.si, key);
      if (defaultValue) return format(defaultValue);
      return fallback || key;
    },
    [dictionary]
  );

  useEffect(() => {
    document.documentElement.lang = lang;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, lang);
    }
    document.cookie = `${COOKIE_KEY}=${lang};path=/;max-age=31536000`;
  }, [lang]);

  const setLanguage = useCallback(
    (next) => {
      if (!SUPPORTED.includes(next)) return;
      setLang(next);
    },
    [setLang]
  );

  return (
    <LocaleContext.Provider value={{ lang, setLanguage, t, languages: SUPPORTED }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => useContext(LocaleContext);
