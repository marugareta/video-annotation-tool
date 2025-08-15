'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Video Annotation Tool
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Annotate video state transitions with up/down labels
        </p>

        {!session ? (
          <div className="space-y-4">
            <p className="text-gray-700">
              Please login or register to start annotating videos.
            </p>
            <div className="space-x-4">
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-block"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg inline-block"
              >
                Register
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-700">
              Welcome back, {session.user.name}!
            </p>
            <div className="space-x-4">
              {session.user.role === 'admin' ? (
                <>
                  <Link
                    href="/admin"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg inline-block"
                  >
                    Admin Dashboard
                  </Link>
                  <Link
                    href="/videos"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-block"
                  >
                    View Videos
                  </Link>
                </>
              ) : (
                <Link
                  href="/videos"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-block"
                >
                  Start Annotating
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-12 grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            For Users
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li>• Select videos to annotate</li>
            <li>• Mark up/down transitions while watching</li>
            <li>• Simple click-based annotation system</li>
            <li>• Export your annotations as CSV</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            For Admins
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li>• Upload new videos for annotation</li>
            <li>• View all user annotations</li>
            <li>• Edit or delete annotations</li>
            <li>• Export consolidated CSV reports</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
