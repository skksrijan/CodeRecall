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

  const popularShortcuts = [
    { label: 'Blind 75', value: 'blind-75' },
    { label: 'Top 150', value: 'top-interview-150' },
    { label: 'LeetCode 75', value: 'leetcode-75' },
    { label: 'Top 100 Liked', value: 'top-100-liked' },
  ];

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return toast.error('Please enter a URL or select a list');
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
            <p className="text-xs text-muted-text mt-0.5 font-sans">
              Paste a public study plan, problem list, or select a curated repertoire.
            </p>
          </div>
          <span className="font-mono text-[10px] text-muted-text uppercase">BATCH INGEST</span>
        </div>
        <form onSubmit={handleImport} className="p-5 space-y-4 font-mono">
          {/* Quick Curated Selection */}
          <div>
            <span className="block text-[10px] uppercase font-bold text-muted-text mb-1.5">
              Quick Shortcuts:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {popularShortcuts.map((s) => (
                <button
                  type="button"
                  key={s.value}
                  onClick={() => setUrl(s.value)}
                  className={`px-2 py-1 rounded text-[10px] border transition-colors ${url === s.value
                      ? 'bg-primary text-white border-primary font-bold'
                      : 'bg-background border-border text-muted-text hover:text-text'
                    }`}
                >
                  [{s.label}]
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1">
              LeetCode URL / Study Plan Identifier
            </label>
            <input
              type="text"
              required
              placeholder="e.g. blind-75 or https://leetcode.com/studyplan/..."
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary text-xs placeholder:text-muted-text/50 font-mono"
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1">
              Target Practice Deck
            </label>
            <select
              required
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary font-sans font-medium text-xs"
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
            <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5">
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
                  <p className="font-semibold text-text">[ BRAND NEW ]</p>
                  <p className="text-muted-text text-[11px] font-sans mt-0.5">Trickles in via your daily intake limit alongside existing reviews.</p>
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
                  <p className="font-semibold text-text">[ MIXED FAMILIARITY ]</p>
                  <p className="text-muted-text text-[11px] font-sans mt-0.5">Self-calibrate each problem on first encounter (Never seen vs Know well).</p>
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
                  <p className="font-semibold text-text">[ ALREADY SOLVED ]</p>
                  <p className="text-muted-text text-[11px] font-sans mt-0.5">Skips new queue and schedules first spaced recall in 3 days.</p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border mt-4 text-xs">
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
