'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { Video, AnnotationWithUserInfo } from '@/types';

export default function AnnotatePage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const [video, setVideo] = useState<Video | null>(null);
  const [annotations, setAnnotations] = useState<AnnotationWithUserInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [videoId, setVideoId] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const { language, t } = useLanguage();
  const [success, setSuccess] = useState('');

  useEffect(() => {
    params.then((resolvedParams) => {
      setVideoId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && videoId) {
      fetchVideo();
      fetchAnnotations();
    }
  }, [status, videoId, router]);

  const handleDeleteAnnotation = async (annotationId: string) => {
    if (!confirm('Are you sure you want to delete this annotation?')) return;

    try {
      const response = await fetch(`/api/annotations/${annotationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Annotation deleted successfully!');
        fetchAnnotations();
      } else {
        setError('Failed to delete annotation');
      }
    } catch (error) {
      setError('An error occurred while deleting annotation');
    }
  };

  const fetchVideo = async () => {
    try {
      const response = await fetch('/api/videos');
      
      if (response.ok) {
        const videos = await response.json();
        const foundVideo = videos.find((v: Video) => v._id === videoId);
        setVideo(foundVideo || null);
      } else {
        setError('Failed to fetch video');
      }
    } catch (error) {
      setError('An error occurred while fetching video');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnnotations = async () => {
    try {
      console.log('Fetching annotations for videoId:', videoId);
      const response = await fetch(`/api/annotations?videoId=${videoId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Annotations fetched:', data);
        
        let filteredAnnotations = data;
        if (session?.user.role !== 'admin') {
          filteredAnnotations = data.filter((annotation: AnnotationWithUserInfo) => 
            annotation.userId === session?.user.id
          );
        }
        
        setAnnotations(filteredAnnotations);
      } else {
        const errorData = await response.json();
        console.error('Error fetching annotations:', errorData);
        setError('Failed to fetch annotations');
      }
    } catch (error) {
      console.error('Failed to fetch annotations:', error);
    }
  };

  const addAnnotation = async (label: 'out_of_zone' | 'in_zone' | 'change') => {
    if (!videoRef.current) return;

    const currentTime = videoRef.current.currentTime;
    console.log('Adding annotation:', { videoId, timestamp: currentTime, label });

    try {
      const response = await fetch('/api/annotations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: videoId,
          timestamp: currentTime,
          label,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Annotation created:', result);
        fetchAnnotations();
        setError(''); 
      } else {
        const errorData = await response.json();
        console.error('Error creating annotation:', errorData);
        setError('Failed to add annotation: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding annotation:', error);
      setError('An error occurred while adding annotation');
    }
  };

  const exportAnnotations = async () => {
    try {
      const exportUrl = session?.user.role === 'admin' 
        ? `/api/export?videoId=${videoId}` 
        : `/api/export?videoId=${videoId}&userId=${session?.user.id}`;
        
      const response = await fetch(exportUrl);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fileName = session?.user.role === 'admin' 
          ? `annotations_${video?.title || 'video'}.csv`
          : `my_annotations_${video?.title || 'video'}.csv`;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        setError('Failed to export annotations');
      }
    } catch (error) {
      setError('An error occurred while exporting');
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!session || !video) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600">Video not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {video.title}
        </h1>
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 cursor-pointer"
        >
          {t('ann.back-to-videos')}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <video
            ref={videoRef}
            src={video.path}
            controls
            className="w-full aspect-video bg-black rounded"
          />
          
          <div className="mt-4 flex gap-4 justify-center">
            <button
              onClick={() => addAnnotation('out_of_zone')}
              className="bg-red-600 hover:bg-red-700 cursor-pointer text-white px-6 py-3 rounded-lg font-semibold"
            >
              {t('ann.out-of-the-zone')}
            </button>
            <button
              onClick={() => addAnnotation('in_zone')}
              className="bg-green-600 hover:bg-green-700 cursor-pointer text-white px-6 py-3 rounded-lg font-semibold"
            >
              {t('ann.in-the-zone')}
            </button>
            <button
              onClick={() => addAnnotation('change')}
              className="bg-yellow-600 hover:bg-yellow-700 cursor-pointer text-white px-6 py-3 rounded-lg font-semibold"
            >
              {t('ann.change')}
            </button>
          </div>

          {/* <div className="mt-4 text-center">
            <button
              onClick={exportAnnotations}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white px-4 py-2 rounded"
            >
              {t('ann.export-csv')}
            </button>
          </div> */}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {session?.user.role === 'admin' ? 'All Annotations' : 'My Annotations'} ({annotations.length})
            </h2>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {annotations.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No annotations yet. Start by marking transitions!
              </p>
            ) : (
              <div className="space-y-2">
                {annotations.map((annotation) => (
                  <div
                    key={annotation._id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded border"
                  >
                    <div>
                      <span className="font-medium">
                        {formatTime(annotation.timestamp)}
                      </span>
                      <span
                        className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                          annotation.label === 'in_zone'
                            ? 'bg-green-100 text-green-800'
                            : annotation.label === 'out_of_zone'
                            ? 'bg-red-100 text-red-800'
                            : annotation.label === 'change'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {annotation.label === 'in_zone'
                          ? 'IN THE ZONE'
                          : annotation.label === 'out_of_zone'
                          ? 'OUT OF THE ZONE'
                          : annotation.label === 'change'
                          ? 'CHANGE'
                          : (annotation.label as string).toUpperCase()}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        by {annotation.username}
                      </div>
                    </div>
                   <div>
                      <button
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = annotation.timestamp;
                        }
                      }}
                      className="text-blue-600 hover:text-blue-800 cursor-pointer text-sm mr-2"
                      >
                        Jump to
                      </button>
                      <button
                        onClick={() => handleDeleteAnnotation(annotation._id!)}
                        className="text-red-600 hover:text-red-800 cursor-pointer text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}