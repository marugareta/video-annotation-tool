'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Video } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

export default function Videos() {
  const { data: session, status } = useSession();
  const [videos, setVideos] = useState<Video[]>([]);
  const [userAnnotationCounts, setUserAnnotationCounts] = useState<{[key: string]: number}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { language, t } = useLanguage();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchVideos();
    }
  }, [status, router, session?.user?.id]);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos');
      
      if (response.ok) {
        const data = await response.json();
        setVideos(data);
        if (session?.user?.id) {
          fetchUserAnnotationCounts(data, session.user.id);
        }
      } else {
        setError('Failed to fetch videos');
      }
    } catch (error) {
      setError('An error occurred while fetching videos');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserAnnotationCounts = async (videoList: Video[], userId: string) => {
    try {
      const response = await fetch('/api/annotations/counts');
      if (response.ok) {
        const counts = await response.json();
        console.log('Fetched annotation counts:', counts);
        setUserAnnotationCounts(counts);
      } else {
        console.error('Failed to fetch annotation counts:', await response.text());
        const emptyCounts = videoList.reduce((acc, video) => {
          acc[video._id!] = 0;
          return acc;
        }, {} as {[key: string]: number});
        setUserAnnotationCounts(emptyCounts);
      }
    } catch (error) {
      console.error('Error fetching annotation counts:', error);
      const emptyCounts = videoList.reduce((acc, video) => {
        acc[video._id!] = 0;
        return acc;
      }, {} as {[key: string]: number});
      setUserAnnotationCounts(emptyCounts);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">{t('video.loading')}</div>
      </div>
    );
  }

  if (!session) {
    return null; 
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
           {t('video.videos')}
        </h1>
        {session.user.role === 'admin' && (
          <Link
            href="/admin"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
          >
           {t('video.admin-dashboard')}
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {videos.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 text-lg mb-4">No videos available yet.</p>
          {session.user.role === 'admin' && (
            <Link
              href="/admin"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-block"
            >
              Upload First Video
            </Link>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="aspect-video bg-gray-200 flex items-center justify-center">
                <video
                  src={video.path}
                  className="w-full h-full object-cover"
                  preload="metadata"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {video.title}
                  </h3>
                  {userAnnotationCounts[video._id!] > 0 ? (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      {userAnnotationCounts[video._id!]} {t('video.my-annotations')}
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                    {t('video.not-annotated')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-4">
                    {t('video.uploaded')} {new Date(video.createdAt).toLocaleDateString()}
                </p>
                <Link
                  href={`/annotate/${video._id}`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md inline-block text-center"
                >
                  {userAnnotationCounts[video._id!] > 0 ? t('video.continue-annotating') : t('video.start-annotating')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}