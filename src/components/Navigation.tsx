'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

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
        fetch('/api/reviews/queue/count', {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then((res) => res.json())
          .then((data) => {
            if (typeof data.count === 'number') {
              setDueCount(data.count);
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
    { href: '/app/dashboard', label: 'Dashboard' },
    { href: '/app/decks', label: 'Decks' },
    { href: '/app/study', label: 'Study' },
    { href: '/app/stats', label: 'Stats' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-surface/90 backdrop-blur-md border-b border-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/app/dashboard" className="flex items-center gap-2 group">
              <span className="text-lg font-bold tracking-tight text-text font-mono">
                CodeRecall
              </span>
              <span className="font-mono text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                SM-2
              </span>
            </Link>
            <div className="hidden md:flex space-x-1 font-mono text-xs">
              {links.map((link) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-md text-xs transition-colors flex items-center gap-2 ${
                      isActive
                        ? 'bg-text text-background font-semibold shadow-sm'
                        : 'text-muted-text hover:text-text hover:bg-background'
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.href === '/app/study' && dueCount !== null && dueCount > 0 && (
                      <span className={`tabular-nums text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        isActive
                          ? 'bg-background text-text'
                          : 'bg-warning text-black font-extrabold'
                      }`}>
                        [{dueCount}]
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {mounted && (
              <>
                <button
                  onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
                  className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border bg-background text-muted-text hover:text-text hover:border-text/40 transition-all text-xs font-mono"
                  aria-label="Search"
                >
                  <span>SEARCH</span>
                  <kbd className="inline-flex items-center font-mono text-[10px] bg-surface px-1 py-0.2 rounded border border-border">
                    ⌘K
                  </kbd>
                </button>
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-1.5 rounded-md text-muted-text hover:text-text hover:bg-background border border-border transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </>
            )}
            
            <div className="flex items-center space-x-3 border-l border-border pl-3 font-mono text-xs">
              <Link 
                href="/app/settings"
                className="px-2 py-1 rounded-md text-muted-text hover:text-text hover:bg-background border border-transparent hover:border-border transition-colors uppercase tracking-wider text-[11px]"
                aria-label="Settings"
              >
                SETTINGS
              </Link>
              <span className="text-xs font-mono text-muted-text hidden sm:block truncate max-w-[130px]">
                {user?.displayName || user?.email}
              </span>
              <button
                onClick={signOut}
                className="text-xs font-medium text-muted-text hover:text-danger px-2 py-1 rounded transition-colors uppercase tracking-wider text-[11px]"
              >
                SIGN OUT
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
