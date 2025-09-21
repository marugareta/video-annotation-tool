'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const translations = {
  en: {
    'nav.brand': 'Video Annotation Tool',
    'nav.adminDashboard': 'Admin Dashboard',
    'nav.videos': 'Videos',
    'nav.signOut': 'Sign Out',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'home.title': 'Video Annotation Tool',
    'home.subtitle': 'Annotate video state transitions with up/down labels',
    'home.loginPrompt': 'Please login or register to start annotating videos.',
    'home.startAnnotating': 'Start Annotating',
    'home.users.title': 'For Users',
    'home.users.selectVideos': 'Select videos to annotate',
    'home.users.markTransitions': 'Mark up/down transitions while watching',
    'home.users.simple': 'Simple click-based annotation system',
    'home.users.export': 'Export your annotations as CSV',
    'home.admins.title': 'For Admins',
    'home.admins.upload': 'Upload new videos for annotation',
    'home.admins.viewAnnotations': 'View all user annotations',
    'home.admins.edit': 'Edit or delete annotations',
    'home.admins.export': 'Export consolidated CSV reports',
  },
  ja: {
    'nav.brand': 'JEPANGGG',
    'nav.adminDashboard': '??????????',
    'nav.videos': '????',
    'nav.signOut': '??????',
    'nav.login': '????',
    'nav.register': '??',
    'home.title': '????????????',
    'home.subtitle': '??????????????????????',
    'home.loginPrompt': '????????????????????????????????',
    'home.startAnnotating': '??????????',
    'home.users.title': '??????',
    'home.users.selectVideos': '??????????????',
    'home.users.markTransitions': '???????????????',
    'home.users.simple': '?????????????????????',
    'home.users.export': '??????????CSV???????',
    'home.admins.title': '?????',
    'home.admins.upload': '??????????????????',
    'home.admins.viewAnnotations': '???????????????',
    'home.admins.edit': '????????????',
    'home.admins.export': '???????????????',
  },
} as const;

type TranslationRecord = typeof translations;
export type Language = keyof TranslationRecord;
type TranslationMap = TranslationRecord[Language];
export type TranslationKey = keyof TranslationMap;

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const roleLabels = {
  en: {
    admin: 'admin',
    annotator: 'annotator',
    user: 'user',
  },
  ja: {
    admin: '???',
    annotator: '??????',
    user: '????',
  },
} as const satisfies Record<Language, Record<string, string>>;

type Role = "admin" | "user";

export function getRoleLabel(role: Role, language: Language) {
  return roleLabels[language][role] ?? role;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === 'en' ? 'ja' : 'en'));
  }, []);

  const t = useCallback(
    (key: TranslationKey) => translations[language][key] ?? key,
    [language],
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
    }),
    [language, toggleLanguage, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return context;
}
