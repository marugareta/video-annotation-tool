'use client';

import { getRoleLabel, useLanguage } from '@/context/LanguageContext';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const { language, toggleLanguage, t } = useLanguage();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const displayName =
    session?.user?.name ?? session?.user?.email ?? (language === 'ja' ? 'japan' : 'User');
  const roleLabel = session?.user?.role
    ? getRoleLabel(session.user.role, language)
    : undefined;

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold">
              {t('nav.brand')}
            </Link>

            {session && (
              <div className="flex space-x-4">
                {session.user.role === 'admin' ? (
                  <>
                    <Link href="/admin" className="hover:text-blue-200">
                      {t('nav.adminDashboard')}
                    </Link>
                    <Link href="/videos" className="hover:text-blue-200">
                      {t('nav.videos')}
                    </Link>
                  </>
                ) : (
                  <Link href="/videos" className="hover:text-blue-200">
                    {t('nav.videos')}
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-3 py-2 border border-white/40 rounded-md text-xs font-semibold tracking-wide hover:bg-white/10 cursor-pointer transition-colors"
            >
              {language === 'en' ? '日本語' : 'English'}
            </button>

            {session ? (
              <>
                <span className="text-sm">
                  {language === 'ja'
                    ? `お帰りなさい, ${displayName}${roleLabel ? `(${roleLabel})` : ''}`
                    : `Welcome, ${displayName}${roleLabel ? ` (${roleLabel})` : ''}`}
                </span>
                <button
                  onClick={handleSignOut}
                  className="bg-red-700 hover:bg-red-800 cursor-pointer px-4 py-2 rounded"
                >
                  {t('nav.signOut')}
                </button>
              </>
            ) : (
              <div className="space-x-2">
                <Link
                  href="/login"
                  className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  href="/register"
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
