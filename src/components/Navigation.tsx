'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function Navigation() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [dueCount, setDueCount] = useState<number | null>(null);

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

  // Listen for custom event to refresh count
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
  ];

  return (
    <nav className="bg-surface/80 backdrop-blur border-b border-white/5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/app/dashboard" className="text-xl font-bold text-primary">
              CodeRecall
            </Link>
            <div className="hidden md:flex space-x-4">
              {links.map((link) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-text hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                    {link.href === '/app/study' && dueCount !== null && dueCount > 0 && (
                      <span className="bg-danger/20 text-danger text-xs px-2 py-0.5 rounded-full font-bold">
                        {dueCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-text hidden sm:block">
              {user?.displayName || user?.email}
            </span>
            <button
              onClick={signOut}
              className="text-sm text-danger hover:text-danger/80 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
