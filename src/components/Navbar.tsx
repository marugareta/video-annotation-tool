'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold">
              Video Annotation Tool
            </Link>
            
            {session && (
              <div className="flex space-x-4">
                {session.user.role === 'admin' ? (
                  <>
                    <Link href="/admin" className="hover:text-blue-200">
                      Admin Dashboard
                    </Link>
                    <Link href="/videos" className="hover:text-blue-200">
                      Videos
                    </Link>
                  </>
                ) : (
                  <Link href="/videos" className="hover:text-blue-200">
                    Videos
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <span className="text-sm">
                  Welcome, {session.user.name} ({session.user.role})
                </span>
                <button
                  onClick={handleSignOut}
                  className="bg-red-700 hover:bg-red-800 cursor-pointer px-4 py-2 rounded"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="space-x-2">
                <Link
                  href="/login"
                  className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
