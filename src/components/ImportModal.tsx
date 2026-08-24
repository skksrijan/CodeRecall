import { useState } from 'react';
import toast from 'react-hot-toast';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
  token: string;
  decks: any[];
}

export default function ImportModal({ isOpen, onClose, onImported, token, decks }: ImportModalProps) {
  const [url, setUrl] = useState('');
  const [deckId, setDeckId] = useState('');
  const [familiarity, setFamiliarity] = useState<'all_new' | 'mixed' | 'studied'>('all_new');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return toast.error('Please enter a URL');
    if (!deckId) return toast.error('Please select a deck');

    setLoading(true);
    try {
      const res = await fetch(`/api/decks/${deckId}/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ url, familiarity })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        onImported();
        onClose();
        setUrl('');
      } else {
        toast.error(data.error || 'Import failed');
      }
    } catch (err) {
      toast.error('Network error during import');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-border animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold">Import from LeetCode</h2>
          <p className="text-sm text-muted-text mt-1">
            Paste a public LeetCode List URL or a specific Problem URL.
          </p>
        </div>
        <form onSubmit={handleImport} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">LeetCode URL</label>
            <input
              type="text"
              required
              placeholder="e.g. https://leetcode.com/list/xyz123"
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-sm"
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Target Deck</label>
            <select
              required
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-sm"
              value={deckId}
              onChange={e => setDeckId(e.target.value)}
            >
              <option value="" disabled>Select a deck</option>
              {decks.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Your Familiarity With These Problems</label>
            <div className="space-y-2 text-xs">
              <label className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${familiarity === 'all_new' ? 'border-primary bg-primary/10' : 'border-border hover:bg-background'}`}>
                <input
                  type="radio"
                  name="familiarity"
                  value="all_new"
                  checked={familiarity === 'all_new'}
                  onChange={() => setFamiliarity('all_new')}
                  className="mt-0.5"
                />
                <div>
                  <p className="font-semibold text-text">Brand New</p>
                  <p className="text-muted-text">Trickle in via your daily new limit alongside regular reviews.</p>
                </div>
              </label>
              <label className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${familiarity === 'mixed' ? 'border-primary bg-primary/10' : 'border-border hover:bg-background'}`}>
                <input
                  type="radio"
                  name="familiarity"
                  value="mixed"
                  checked={familiarity === 'mixed'}
                  onChange={() => setFamiliarity('mixed')}
                  className="mt-0.5"
                />
                <div>
                  <p className="font-semibold text-text">Mixed Knowledge</p>
                  <p className="text-muted-text">Self-rate each problem on first exposure (Never seen vs Know well).</p>
                </div>
              </label>
              <label className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${familiarity === 'studied' ? 'border-primary bg-primary/10' : 'border-border hover:bg-background'}`}>
                <input
                  type="radio"
                  name="familiarity"
                  value="studied"
                  checked={familiarity === 'studied'}
                  onChange={() => setFamiliarity('studied')}
                  className="mt-0.5"
                />
                <div>
                  <p className="font-semibold text-text">Already Solved Most</p>
                  <p className="text-muted-text">Skip initial intake and schedule directly for review in 3 days.</p>
                </div>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg font-medium hover:bg-background transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Importing...
                </>
              ) : (
                'Import'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
