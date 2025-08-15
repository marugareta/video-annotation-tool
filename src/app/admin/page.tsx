'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Video, AnnotationWithUserInfo } from '@/types';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [annotations, setAnnotations] = useState<AnnotationWithUserInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      if (session.user.role !== 'admin') {
        router.push('/videos');
        return;
      }
      fetchVideos();
    }
  }, [status, session, router]);

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

  const fetchAnnotations = async (videoId: string) => {
    try {
      const response = await fetch(`/api/annotations?videoId=${videoId}`);
      
      if (response.ok) {
        const data = await response.json();
        setAnnotations(data);
      } else {
        setError('Failed to fetch annotations');
      }
    } catch (error) {
      setError('An error occurred while fetching annotations');
    }
  };

  const handleVideoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadLoading(true);
    setError('');
    setSuccess('');

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Video uploaded successfully!');
        form.reset();
        fetchVideos();
      } else {
        setError(data.error || 'Failed to upload video');
      }
    } catch (error) {
      setError('An error occurred while uploading');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteAnnotation = async (annotationId: string) => {
    if (!confirm('Are you sure you want to delete this annotation?')) return;

    try {
      const response = await fetch(`/api/annotations/${annotationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Annotation deleted successfully!');
        if (selectedVideo) {
          fetchAnnotations(selectedVideo._id!);
        }
      } else {
        setError('Failed to delete annotation');
      }
    } catch (error) {
      setError('An error occurred while deleting annotation');
    }
  };

  const exportVideoAnnotations = async (videoId: string, videoTitle: string) => {
    try {
      const response = await fetch(`/api/export?videoId=${videoId}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `annotations_${videoTitle}.csv`;
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

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <Link
          href="/videos"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          View Videos
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Video Upload */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Upload New Video
          </h2>
          
          <form onSubmit={handleVideoUpload}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Video Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="video" className="block text-sm font-medium text-gray-700 mb-2">
                Video File
              </label>
              <input
                type="file"
                id="video"
                name="video"
                accept="video/*"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={uploadLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2 px-4 rounded-md"
            >
              {uploadLoading ? 'Uploading...' : 'Upload Video'}
            </button>
          </form>
        </div>

        {/* Video List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Manage Videos ({videos.length})
          </h2>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {videos.map((video) => (
              <div key={video._id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-900">{video.title}</h3>
                    <p className="text-sm text-gray-500">
                      Uploaded: {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedVideo(video);
                        fetchAnnotations(video._id!);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View Annotations
                    </button>
                    <button
                      onClick={() => exportVideoAnnotations(video._id!, video.title)}
                      className="text-green-600 hover:text-green-800 text-sm"
                    >
                      Export CSV
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Annotations Management */}
      {selectedVideo && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Annotations for &quot;{selectedVideo.title}&quot; ({annotations.length})
          </h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Label
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {annotations.map((annotation) => (
                  <tr key={annotation._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatTime(annotation.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          annotation.label === 'up'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {annotation.label.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {annotation.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(annotation.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteAnnotation(annotation._id!)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {annotations.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No annotations found for this video.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
