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
    'login.title' : 'Login',
    'login.email' : 'Email',
    'login.password' : 'Password',
    'login.logging-in' : 'Logging in ...',
    'login.login' : 'Login',
    'login.dont-have-account' : 'Don&apos;t have an account?',
    'login.register-here' : 'Register Here',
    'reg.role' : 'Role',
    'reg.register': 'Register',
    'reg.registering': 'Registering...',
    'reg.login-here' : ' Login here',
    'reg.username' : 'Username',
    'reg.email' : 'Email',
    'reg.password' : 'Password',
    'reg.confirm-password' : 'Confirm Password',
    'reg.already-have-account' : 'Already have an account?',
    'ann.out-of-the-zone' : 'Out of the Zone',
    'ann.in-the-zone' : 'In the Zone',
    'ann.change' : 'Change',
    'ann.export-csv' : 'Export to CSV',
    'ann.back-to-videos' : '← Back to Videos',
    'ann.jump-to' : 'Jump to',
    'ann.my-annotation' : 'My Annotations',
    'video.videos' : 'Videos',
    'video.admin-dashboard' : 'Admin Dashboard',
    'video.not-annotated' : 'Not annotated',
    'video.continue-annotating' : 'Continue Annotating',
    'video.start-annotating' : 'Start Annotating',
    'video.loading' : 'Loading...',
    'video.my-annotations' : 'my annotations',
    'video.uploaded' : 'Uploaded'
  },
  ja: {
    'nav.brand': '動画アノテーションツール',
    'nav.adminDashboard': '管理者ダッシュボード',
    'nav.videos': 'ビデオ',
    'nav.signOut': 'サインアウト',
    'nav.login': 'ログイン',
    'nav.register': '新規登録',
    'home.title': '動画アノテーションツール',
    'home.subtitle': '??????????????????????',
    'home.loginPrompt': '動画に注釈を付け始めるには、ログインまたは新規登録をしてください',
    'home.startAnnotating': '注釈を開始',
    'home.users.title': 'ユーザー向け',
    'home.users.selectVideos': '注釈する動画を選択',
    'home.users.markTransitions': '視聴中に上下の遷移をマーク',
    'home.users.simple': 'シンプルなクリック式注釈システム',
    'home.users.export': '注釈をCSVとしてエクスポート',
    'home.admins.title': '管理者向け',
    'home.admins.upload': '注釈用の新しい動画をアップロード',
    'home.admins.viewAnnotations': 'すべてのユーザー注釈を表示',
    'home.admins.edit': '注釈を編集または削除',
    'home.admins.export': '統合CSVレポートをエクスポート',
    'login.title' : 'ログイン',
    'login.email': 'メールアドレス',
    'login.password': 'パスワード',
    'login.logging-in': 'ログイン中...',
    'login.login': 'ログイン',
    'login.dont-have-account': 'アカウントをお持ちでないですか？',
    'login.register-here': 'ここから新規登録',
    'reg.register' : '新規登録',
    'reg.login-here' : 'ここからログイン',
    'reg.username' : 'ユーザー名',
    'reg.email' : 'メールアドレス',
    'reg.password' : 'パスワード',
    'reg.confirm-password' : 'パスワード（確認)',
    'reg.already-have-account' : 'すでにアカウントをお持ちですか？',
    'reg.role' : 'ロール',
    'reg.registering': '登録中...',
    'ann.out-of-the-zone': 'アウトオブザゾーン',
    'ann.in-the-zone': 'インザゾーン',
    'ann.change': '変更',
    'ann.export-csv': 'CSVにエクスポート',
    'ann.back-to-videos': '← 動画一覧に戻る',
    'ann.jump-to': 'ジャンプ先',
    'ann.my-annotation': '自分の注釈',
    'video.admin-dashboard': '管理者ダッシュボード',
    'video.videos': 'ビデオ',
    'video.not-annotated': '未注釈',
    'video.continue-annotating': '注釈を続ける',
    'video.start-annotating': '注釈を開始',
    'video.loading': '読み込み中...' ,
    'video.my-annotations': '自分の注釈',
    'video.uploaded': 'アップロード済み'
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
    admin: 'admin',
    annotator: 'annotator',
    user: 'user',
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
