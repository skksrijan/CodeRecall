'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import DeckModal from '@/components/DeckModal';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function DecksPage() {
  const { user } = useAuth();
  const [decks, setDecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<any>(null);
  const [token, setToken] = useState('');

  useEffect(() => {
    if (user) {
      user.getIdToken().then(t => {
        setToken(t);
        fetchDecks(t);
      });
    }
  }, [user]);

  const fetchDecks = async (t: string) => {
    try {
      const res = await fetch('/api/decks', {
        headers: { Authorization: `Bearer ${t}` }
      });
      if (res.ok) {
        setDecks(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this deck?')) return;
    
    try {
      const res = await fetch(`/api/decks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      
      setDecks(prev => prev.filter(d => d.id !== id));
      toast.success('Deck deleted');
    } catch (err) {
      toast.error('Error deleting deck');
    }
  };

  const handleSaved = (savedDeck: any) => {
    if (editingDeck) {
      setDecks(prev => prev.map(d => d.id === savedDeck.id ? savedDeck : d));
    } else {
      setDecks(prev => [savedDeck, ...prev]);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Decks</h1>
        <button
          onClick={() => { setEditingDeck(null); setIsModalOpen(true); }}
          className="bg-primary text-white px-4 py-2 rounded shadow hover:bg-primary/90 transition"
        >
          + New Deck
        </button>
      </div>

      {loading ? (
        <div>Loading decks...</div>
      ) : decks.length === 0 ? (
        <div className="text-center text-muted-text py-12">
          <p>No decks found. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map(deck => (
            <Link key={deck.id} href={`/app/decks/${deck.id}`}>
              <div className="bg-surface border border-muted-text/20 p-6 rounded-lg shadow hover:shadow-md transition group h-full flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold">{deck.name}</h2>
                  <div className="opacity-0 group-hover:opacity-100 transition flex gap-2">
                    <button
                      onClick={(e) => { e.preventDefault(); setEditingDeck(deck); setIsModalOpen(true); }}
                      className="text-muted-text hover:text-primary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, deck.id)}
                      className="text-muted-text hover:text-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-muted-text text-sm flex-grow mb-4">
                  {deck.description || 'No description'}
                </p>
                <div className="text-sm font-medium text-primary">
                  {deck._count?.problems || 0} Problems
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <DeckModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleSaved}
        existingDeck={editingDeck}
        token={token}
      />
    </div>
  );
}
