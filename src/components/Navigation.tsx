'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from 'next-themes';
import { Moon, Sun, LayoutDashboard, Library, PlayCircle, LogOut } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [dueCount, setDueCount] = useState<number | null>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      user.getIdToken().then((token) => {
        fetch('/api/reviews/queue', {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data)) {
              setDueCount(data.length);
            }
          })
          .catch(console.error);
      });
    }
  }, [user]);

  useEffect(() => {
    const handleReviewCompleted = () => {
      setDueCount((prev) => (prev ? prev - 1 : 0));
    };
    window.addEventListener('reviewCompleted', handleReviewCompleted);
    return () => window.removeEventListener('reviewCompleted', handleReviewCompleted);
  }, []);

  const links = [
    { href: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/app/decks', label: 'Decks', icon: Library },
    { href: '/app/study', label: 'Study', icon: PlayCircle },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/70 border-b border-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/app/dashboard" className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              CodeRecall
            </Link>
            <div className="hidden md:flex space-x-2">
              {links.map((link) => {
                const isActive = pathname.startsWith(link.href);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 group ${
                      isActive
                        ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20'
                        : 'text-muted-text hover:text-text hover:bg-surface/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-text group-hover:text-text'}`} />
                    {link.label}
                    {link.href === '/app/study' && dueCount !== null && dueCount > 0 && (
                      <span className="bg-danger text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-md shadow-danger/30">
                        {dueCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-6">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full text-muted-text hover:text-text hover:bg-surface transition-all active:scale-95"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}
            
            <div className="flex items-center space-x-4 border-l border-border pl-6">
              <span className="text-sm font-medium text-muted-text hidden sm:block">
                {user?.displayName || user?.email}
              </span>
              <button
                onClick={signOut}
                className="flex items-center gap-2 text-sm font-medium text-muted-text hover:text-danger transition-colors group"
              >
                <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
