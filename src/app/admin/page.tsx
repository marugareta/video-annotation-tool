'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Video, AnnotationWithUserInfo } from '@/types';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [videos, setVideos] = useState<Video[]>([]);
  const [videoAnnotationCounts, setVideoAnnotationCounts] = useState<{[key: string]: number}>({});
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [annotations, setAnnotations] = useState<AnnotationWithUserInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
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
        fetchAnnotationCounts(data);
      } else {
        setError('Failed to fetch videos');
      }
    } catch (error) {
      setError('An error occurred while fetching videos');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnnotationCounts = async (videoList: Video[]) => {
    try {
      const response = await fetch('/api/annotations/counts');
      if (response.ok) {
        const counts = await response.json();
        console.log('Admin: Fetched annotation counts:', counts);
        setVideoAnnotationCounts(counts);
      } else {
        console.error('Failed to fetch annotation counts:', await response.text());
        const emptyCounts = videoList.reduce((acc, video) => {
          acc[video._id!] = 0;
          return acc;
        }, {} as {[key: string]: number});
        setVideoAnnotationCounts(emptyCounts);
      }
    } catch (error) {
      console.error('Error fetching annotation counts:', error);
      const emptyCounts = videoList.reduce((acc, video) => {
        acc[video._id!] = 0;
        return acc;
      }, {} as {[key: string]: number});
      setVideoAnnotationCounts(emptyCounts);
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

  const handleDeleteVideo = async (videoId: string, videoTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${videoTitle}"? This will also delete all annotations for this video.`)) return;

    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Video deleted successfully!');
        fetchVideos();
        if (selectedVideo && selectedVideo._id === videoId) {
          setSelectedVideo(null);
          setAnnotations([]);
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete video');
      }
    } catch (error) {
      setError('An error occurred while deleting video');
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

  const addAnnotation = async (label: 'in_zone' | 'out_of_zone' | 'change') => {
    if (!selectedVideo || !videoRef.current) return;

    const currentTime = videoRef.current.currentTime;

    try {
      const response = await fetch('/api/annotations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: selectedVideo._id,
          timestamp: currentTime,
          label: label,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Annotation created:', result);
        fetchAnnotations(selectedVideo._id!);
        fetchAnnotationCounts([selectedVideo]);
        setSuccess(`Annotation "${label === 'in_zone' ? 'In the Zone' : 'Out of the Zone'}" added at ${formatTime(currentTime)}`);
        setTimeout(() => setSuccess(''), 3000);
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
              className="w-full bg-green-600 hover:bg-green-700 cursor-pointer disabled:bg-green-400 text-white py-2 px-4 rounded-md"
            >
              {uploadLoading ? 'Uploading...' : 'Upload Video'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Manage Videos ({videos.length})
          </h2>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {videos.map((video) => (
              <div key={video._id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{video.title}</h3>
                      <div className="flex items-center gap-1">
                        {videoAnnotationCounts[video._id!] > 0 ? (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            {videoAnnotationCounts[video._id!]} annotations
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                            No annotations
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      Uploaded: {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setSelectedVideo(video);
                        fetchAnnotations(video._id!);
                      }}
                      className="text-blue-600 hover:text-blue-800 cursor-pointer text-sm px-2 py-1 border border-blue-200 rounded"
                    >
                      View & Annotate
                    </button>
                    <button
                      onClick={() => exportVideoAnnotations(video._id!, video.title)}
                      className="text-green-600 hover:text-green-800 cursor-pointer text-sm px-2 py-1 border border-green-200 rounded"
                    >
                      Export
                    </button>
                    <button
                      onClick={() => handleDeleteVideo(video._id!, video.title)}
                      className="text-red-600 hover:text-red-800 cursor-pointer text-sm px-2 py-1 border border-red-200 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedVideo && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Annotations for &quot;{selectedVideo.title}&quot; ({annotations.length})
            </h2>
            <button
              onClick={() => {
                setSelectedVideo(null);
                setAnnotations([]);
              }}
              className="text-gray-600 hover:text-gray-800 cursor-pointer"
            >
              ✕ Close
            </button>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-1">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Video Preview</h3>
              <video
                ref={videoRef}
                src={selectedVideo.path}
                controls
                className="w-full aspect-video bg-black rounded"
              />
              <p className="text-sm text-gray-500 mt-2 mb-4">
                Original: {selectedVideo.originalName}
              </p>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => addAnnotation('out_of_zone')}
                  className="bg-red-600 hover:bg-red-700 cursor-pointer text-white px-4 py-2 rounded-lg font-semibold flex-1"
                >
                  Out of the Zone
                </button>
                <button
                  onClick={() => addAnnotation('in_zone')}
                  className="bg-green-600 hover:bg-green-700 cursor-pointer text-white px-4 py-2 rounded-lg font-semibold flex-1"
                >
                  In the Zone
                </button>
                <button
                  onClick={() => addAnnotation('change')}
                  className="bg-yellow-600 hover:bg-yellow-700 cursor-pointer text-white px-4 py-2 rounded-lg font-semibold flex-1"
                >
                  Change
                </button>
              </div>
              
              <p className="text-xs text-gray-500 text-center mt-2">
                Click buttons while video is playing to add annotations
              </p>
            </div>
            
            <div className="lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Annotations</h3>
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
                            className="text-red-600 hover:text-red-900 cursor-pointer"
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
          </div>
        </div>
      )}
    </div>
  );
}
