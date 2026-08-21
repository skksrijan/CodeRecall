'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface DeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (deck: any) => void;
  existingDeck?: { id: string; name: string; description?: string } | null;
  token: string;
}

export default function DeckModal({ isOpen, onClose, onSaved, existingDeck, token }: DeckModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existingDeck) {
      setName(existingDeck.name);
      setDescription(existingDeck.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [existingDeck, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = existingDeck ? `/api/decks/${existingDeck.id}` : '/api/decks';
      const method = existingDeck ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, description })
      });

      if (!res.ok) throw new Error('Failed to save deck');
      const data = await res.json();
      onSaved(data);
      toast.success(existingDeck ? 'Deck updated' : 'Deck created');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">{existingDeck ? 'Edit Deck' : 'New Deck'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              required
              className="w-full p-2 rounded bg-background border border-muted-text/30 focus:outline-none focus:ring-2 focus:ring-primary"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description (Optional)</label>
            <textarea
              className="w-full p-2 rounded bg-background border border-muted-text/30 focus:outline-none focus:ring-2 focus:ring-primary"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded border border-muted-text/30 hover:bg-muted-text/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
