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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-surface rounded-xl border border-border shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
          <h2 className="text-base font-bold text-text tracking-tight">
            {existingDeck ? 'Edit Deck' : 'Create New Deck'}
          </h2>
          <span className="font-mono text-[10px] text-muted-text uppercase">Archive Entry</span>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5 font-mono">
              Deck Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Blind 75 Core, Dynamic Programming"
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-medium placeholder:text-muted-text/60"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5 font-mono">
              Description (Optional)
            </label>
            <textarea
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-muted-text/60"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Scope, target interview round, or focus topics..."
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-2 border-t border-border mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-background transition-colors text-muted-text hover:text-text disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm"
            >
              {saving ? 'Saving...' : existingDeck ? 'Update Deck' : 'Create Deck'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
