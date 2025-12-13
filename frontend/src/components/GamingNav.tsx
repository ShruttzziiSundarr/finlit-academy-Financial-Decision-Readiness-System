'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Gamepad2,
  Home,
  Wallet,
  TrendingUp,
  BookOpen,
  Trophy,
  MessageSquare,
  LogOut,
  Zap,
  Sword
} from 'lucide-react';

export default function GamingNav() {
  const pathname = usePathname();
  const router = useRouter();

  // Don't show nav on login/signup pages
  if (pathname === '/login' || pathname === '/signup' || pathname === '/') {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'HQ' },
    { href: '/budget', icon: Wallet, label: 'BUDGET' },
    { href: '/portfolio', icon: TrendingUp, label: 'STOCKS' },
    { href: '/learn', icon: BookOpen, label: 'LEARN' },
    { href: '/challenges', icon: Trophy, label: 'BATTLES' },
    { href: '/boss-battles', icon: Sword, label: 'BOSSES' },
    { href: '/chat', icon: MessageSquare, label: 'AI BOSS' },
  ];

  return (
    <nav className="bg-gradient-to-r from-black/95 via-purple-950/95 to-black/95 border-b-2 border-purple-500/50 backdrop-blur-sm sticky top-0 z-50 glow-purple">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center glow-purple-strong border-2 border-purple-400 group-hover:scale-110 transition-transform">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <span className="pixel-font text-purple-400 text-sm hidden sm:block">FINLIT</span>
          </Link>

          {/* Nav Items */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <button
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white glow-purple-strong border-2 border-purple-400'
                        : 'text-purple-300 hover:bg-purple-900/50 hover:text-white border-2 border-transparent hover:border-purple-500/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-bold hidden md:block">{item.label}</span>
                  </button>
                </Link>
              );
            })}
          </div>

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-2 border-red-500/50 text-red-400 hover:bg-red-900/50 hover:border-red-400 hover:text-red-300"
          >
            <LogOut className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline mono-font">EXIT</span>
          </Button>
        </div>
      </div>

      {/* XP Bar */}
      <div className="h-1 bg-gray-900">
        <div className="h-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 w-2/3 glow-purple-strong animate-pulse"></div>
      </div>
    </nav>
  );
}
