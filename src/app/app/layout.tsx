import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { Toaster } from 'react-hot-toast';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <Toaster position="bottom-right" />
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
