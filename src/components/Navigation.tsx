'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Navigation() {
  const { data: session, status } = useSession();

  if (status === 'loading') return null;

  if (!session) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-blue-600">
              NexTrade
            </Link>
            <div className="flex space-x-4">
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">
              NexTrade
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/markets"
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Markets
              </Link>
              <Link
                href="/portfolio"
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Portfolio
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-gray-700 text-sm">
              Hello, {session.user.name || session.user.email}
            </span>
            <button
              onClick={() => signOut()}
              className="text-gray-700 hover:text-red-600 font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}