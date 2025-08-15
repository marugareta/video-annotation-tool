'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Video } from '@/types';

export default function Videos() {
  const { data: session, status } = useSession();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchVideos();
    }
  }, [status, router]);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos');
      
      if (response.ok) {
        const data = await response.json();
        setVideos(data);
      } else {
        setError('Failed to fetch videos');
      }
    } catch (error) {
      setError('An error occurred while fetching videos');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to login
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Videos
        </h1>
        {session.user.role === 'admin' && (
          <Link
            href="/admin"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
          >
            Admin Dashboard
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {video.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Uploaded: {new Date(video.createdAt).toLocaleDateString()}
                </p>
                <Link
                  href={`/annotate/${video._id}`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md inline-block text-center"
                >
                  Start Annotating
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
