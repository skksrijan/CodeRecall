'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import DeckModal from '@/components/DeckModal';
import ImportModal from '@/components/ImportModal';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Plus, MoreVertical, Edit2, Trash2, LibraryBig } from 'lucide-react';

export default function DecksPage() {
  const { user } = useAuth();
  const [decks, setDecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Your Decks</h1>
          <p className="text-muted-text mt-1">Manage your collections of coding problems</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="bg-surface border border-border text-text px-4 py-2.5 rounded-xl font-semibold shadow-sm hover:bg-background transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import
          </button>
          <button
            onClick={() => { setEditingDeck(null); setIsModalOpen(true); }}
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:bg-primary/90 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Deck
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-surface/50 border border-border h-48 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : decks.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-3xl bg-surface/30 animate-in fade-in duration-700">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <LibraryBig className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold mb-2">No decks yet</h3>
          <p className="text-muted-text max-w-md mx-auto mb-8">
            Create your first deck to start organizing problems by topic, difficulty, or interview prep.
          </p>
          <button
            onClick={() => { setEditingDeck(null); setIsModalOpen(true); }}
            className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
          >
            Create your first deck
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck, idx) => (
            <Link key={deck.id} href={`/app/decks/${deck.id}`} className="group h-full">
              <div 
                className="bg-surface/60 backdrop-blur-xl border border-border/50 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 h-full flex flex-col relative overflow-hidden"
                style={{ animation: `slide-up 0.5s ease-out ${idx * 0.1}s both` }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <h2 className="text-xl font-bold group-hover:text-primary transition-colors pr-8 leading-tight">
                    {deck.name}
                  </h2>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 top-0 flex items-center gap-1 bg-surface p-1 rounded-lg border border-border shadow-sm">
                    <button
                      onClick={(e) => { e.preventDefault(); setEditingDeck(deck); setIsModalOpen(true); }}
                      className="p-1.5 text-muted-text hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, deck.id)}
                      className="p-1.5 text-muted-text hover:text-danger hover:bg-danger/10 rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-muted-text text-sm flex-grow mb-6 relative z-10 line-clamp-3">
                  {deck.description || 'No description provided.'}
                </p>
                
                <div className="flex items-center gap-2 relative z-10">
                  <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-md">
                    {deck._count?.problems || 0} Problems
                  </span>
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

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImported={() => fetchDecks(token)}
        token={token}
        decks={decks}
      />
    </div>
  );
}
