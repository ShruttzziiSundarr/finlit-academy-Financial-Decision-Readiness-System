'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth.tsx';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  // Don't show navbar on auth pages
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-blue-600">💰</div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              FinLit Academy
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                    pathname === '/dashboard'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/budget"
                  className={`text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                    pathname === '/budget'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Budget
                </Link>
                <Link
                  href="/portfolio"
                  className={`text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                    pathname === '/portfolio'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Portfolio
                </Link>
              </>
            ) : (
              <Link
                href="/"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Home
              </Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center space-x-2">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {user?.firstName} {user?.lastName}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="text-sm"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isAuthenticated && (
        <div className="md:hidden px-4 pb-4 pt-2 space-y-2 border-t border-gray-200 dark:border-gray-800">
          <Link
            href="/dashboard"
            className={`block px-3 py-2 rounded-md text-sm font-medium ${
              pathname === '/dashboard'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/budget"
            className={`block px-3 py-2 rounded-md text-sm font-medium ${
              pathname === '/budget'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            Budget Simulator
          </Link>
          <Link
            href="/portfolio"
            className={`block px-3 py-2 rounded-md text-sm font-medium ${
              pathname === '/portfolio'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            Portfolio Simulator
          </Link>
        </div>
      )}
    </nav>
  );
}
