'use client';

import { useAuth } from '@/context/AuthContext';

export default function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="mb-4">Welcome, {user?.displayName || user?.email}!</p>
      <button 
        onClick={signOut}
        className="bg-danger text-white px-4 py-2 rounded hover:bg-danger/90 transition"
      >
        Sign Out
      </button>
    </div>
  );
}
