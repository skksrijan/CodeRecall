import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <Toaster position="bottom-right" />
      {children}
    </ProtectedRoute>
  );
}
