'use client';

import { useLanguage } from '@/context/LanguageContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const { language, t } = useLanguage();
  const router = useRouter();
  const fallbackName = language === 'ja' ? 'ユーザー' : 'User';
  const displayName = session?.user?.name ?? session?.user?.email ?? fallbackName;

  useEffect(() => {
    if (status === 'authenticated') {
      if (session.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/videos');
      }
    }
  }, [status, session, router]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center">
        {/* <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t('home.title')}
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          {t('home.subtitle')}
        </p> */}

        {!session ? (
          <div className="space-y-4">
            <p className="text-gray-700">
              {t('home.loginPrompt')}
            </p>
            <div className="space-x-4">
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-block"
              >
                {t('nav.login')}
              </Link>
              <Link
                href="/register"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg inline-block"
              >
                {t('nav.register')}
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-700">
              {language === 'ja'
                ? `ようこそ ${displayName} さん!`
                : `Welcome back, ${displayName}!`}
            </p>
            <div className="space-x-4">
              {session.user.role === 'admin' ? (
                <>
                  <Link
                    href="/admin"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg inline-block"
                  >
                    {t('nav.adminDashboard')}
                  </Link>
                  <Link
                    href="/videos"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-block"
                  >
                    {t('nav.videos')}
                  </Link>
                </>
              ) : (
                <Link
                  href="/videos"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-block"
                >
                  {t('home.startAnnotating')}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* <div className="mt-12 grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('home.users.title')}
          </h2>
          <ul className="space-y-2 text-gray-700 list-disc list-inside">
            <li>{t('home.users.selectVideos')}</li>
            <li>{t('home.users.markTransitions')}</li>
            <li>{t('home.users.simple')}</li>
            <li>{t('home.users.export')}</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('home.admins.title')}
          </h2>
          <ul className="space-y-2 text-gray-700 list-disc list-inside">
            <li>{t('home.admins.upload')}</li>
            <li>{t('home.admins.viewAnnotations')}</li>
            <li>{t('home.admins.edit')}</li>
            <li>{t('home.admins.export')}</li>
          </ul>
        </div>
      </div> */}
    </div>
  );
}
