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
    } catch {
      toast.error('Network error during import');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-surface w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-border animate-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-text tracking-tight font-mono">[ IMPORT FROM LEETCODE ]</h2>
            <p className="text-xs text-muted-text mt-0.5">
              Paste a public study plan URL or problem link.
            </p>
          </div>
          <span className="font-mono text-[10px] text-muted-text uppercase">BATCH INGEST</span>
        </div>
        <form onSubmit={handleImport} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-mono font-semibold text-text uppercase tracking-wider mb-1">
              LeetCode URL / Study Plan
            </label>
            <input
              type="text"
              required
              placeholder="e.g. https://leetcode.com/list/xyz123"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary font-mono text-xs placeholder:text-muted-text/50"
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-mono font-semibold text-text uppercase tracking-wider mb-1">
              Target Practice Deck
            </label>
            <select
              required
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary font-medium"
              value={deckId}
              onChange={e => setDeckId(e.target.value)}
            >
              <option value="" disabled>Select a deck...</option>
              {decks.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono font-semibold text-text uppercase tracking-wider mb-1.5">
              Prior Familiarity With These Problems
            </label>
            <div className="space-y-2 text-xs">
              <label className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${familiarity === 'all_new' ? 'border-primary bg-primary/5' : 'border-border hover:bg-background'}`}>
                <input
                  type="radio"
                  name="familiarity"
                  value="all_new"
                  checked={familiarity === 'all_new'}
                  onChange={() => setFamiliarity('all_new')}
                  className="mt-0.5"
                />
                <div>
                  <p className="font-semibold text-text font-mono">[ BRAND NEW ]</p>
                  <p className="text-muted-text text-[11px] mt-0.5">Trickles in via your daily intake limit alongside existing reviews.</p>
                </div>
              </label>
              <label className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${familiarity === 'mixed' ? 'border-primary bg-primary/5' : 'border-border hover:bg-background'}`}>
                <input
                  type="radio"
                  name="familiarity"
                  value="mixed"
                  checked={familiarity === 'mixed'}
                  onChange={() => setFamiliarity('mixed')}
                  className="mt-0.5"
                />
                <div>
                  <p className="font-semibold text-text font-mono">[ MIXED FAMILIARITY ]</p>
                  <p className="text-muted-text text-[11px] mt-0.5">Self-calibrate each problem on first encounter (Never seen vs Know well).</p>
                </div>
              </label>
              <label className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${familiarity === 'studied' ? 'border-primary bg-primary/5' : 'border-border hover:bg-background'}`}>
                <input
                  type="radio"
                  name="familiarity"
                  value="studied"
                  checked={familiarity === 'studied'}
                  onChange={() => setFamiliarity('studied')}
                  className="mt-0.5"
                />
                <div>
                  <p className="font-semibold text-text font-mono">[ ALREADY SOLVED ]</p>
                  <p className="text-muted-text text-[11px] mt-0.5">Skips new queue and schedules first spaced recall in 3 days.</p>
                </div>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2.5 pt-3 border-t border-border mt-4 font-mono text-xs">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-border font-medium hover:bg-background transition-colors text-muted-text hover:text-text disabled:opacity-50 uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-primary text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm uppercase tracking-wider"
            >
              {loading ? '[ IMPORTING... ]' : 'Import Deck ->'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
