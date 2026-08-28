'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import DeckModal from '@/components/DeckModal';
import ImportModal from '@/components/ImportModal';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface CuratedSummary {
  id: string;
  name: string;
  badge: string;
  description: string;
  category: string;
  problemCount: number;
  difficultyCounts: { EASY: number; MEDIUM: number; HARD: number };
  tags: string[];
}

export default function DecksPage() {
  const { user } = useAuth();
  const [decks, setDecks] = useState<any[]>([]);
  const [curatedLists, setCuratedLists] = useState<CuratedSummary[]>([]);
  const [activeTab, setActiveTab] = useState<'my_decks' | 'curated'>('my_decks');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<any>(null);
  const [token, setToken] = useState('');
  const [importingListId, setImportingListId] = useState<string | null>(null);
  const [selectedFamiliarity, setSelectedFamiliarity] = useState<'all_new' | 'mixed' | 'studied'>('all_new');
  const [curatedPromptList, setCuratedPromptList] = useState<CuratedSummary | null>(null);

  useEffect(() => {
    if (user) {
      user.getIdToken().then(t => {
        setToken(t);
        fetchDecks(t);
        fetchCurated(t);
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

  const fetchCurated = async (t: string) => {
    try {
      const res = await fetch('/api/curated', {
        headers: { Authorization: `Bearer ${t}` }
      });
      if (res.ok) {
        setCuratedLists(await res.json());
      }
    } catch (err) {
      console.error(err);
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
    } catch {
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

  const handleImportCurated = async (list: CuratedSummary, familiarity: 'all_new' | 'mixed' | 'studied') => {
    setImportingListId(list.id);
    try {
      const res = await fetch('/api/curated/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          listId: list.id,
          familiarity
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || `Imported ${list.name}`);
        setCuratedPromptList(null);
        await fetchDecks(token);
        setActiveTab('my_decks');
      } else {
        toast.error(data.error || 'Failed to import curated list');
      }
    } catch {
      toast.error('Network error while importing curated list');
    } finally {
      setImportingListId(null);
    }
  };

  const isDeckAlreadyAdded = (curatedName: string) => {
    return decks.some(d => d.name.toLowerCase() === curatedName.toLowerCase());
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text">
            Practice Decks
          </h1>
          <p className="text-xs text-muted-text mt-1">
            Organize your problem collections and spaced review tracks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center px-3.5 py-2 rounded-lg bg-surface border border-border text-xs font-semibold text-text hover:bg-background transition-colors shadow-sm"
          >
            Import Problems
          </button>
          <button
            onClick={() => { setEditingDeck(null); setIsModalOpen(true); }}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-text text-background text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            + Create Deck
          </button>
        </div>
      </div>

      {/* Navigation Tabs (My Decks vs Curated Lists) */}
      <div className="flex items-center gap-4 border-b border-border pb-px text-xs">
        <button
          onClick={() => setActiveTab('my_decks')}
          className={`pb-3 px-1 font-semibold transition-colors border-b-2 ${activeTab === 'my_decks'
              ? 'border-primary text-text'
              : 'border-transparent text-muted-text hover:text-text'
            }`}
        >
          My Decks ({decks.length})
        </button>
        <button
          onClick={() => setActiveTab('curated')}
          className={`pb-3 px-1 font-semibold transition-colors border-b-2 ${activeTab === 'curated'
              ? 'border-primary text-text'
              : 'border-transparent text-muted-text hover:text-text'
            }`}
        >
          Curated Repertoires ({curatedLists.length})
        </button>
      </div>

      {/* TAB 1: MY DECKS */}
      {activeTab === 'my_decks' && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-surface border border-border h-44 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : decks.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16 border border-dashed border-border rounded-xl bg-surface/40 font-mono">
              <div className="text-xs text-muted-text uppercase tracking-wider mb-2">
                [EMPTY CATALOG]
              </div>
              <h3 className="text-base font-bold text-text mb-1 font-sans">No Practice Decks Yet</h3>
              <p className="text-xs text-muted-text max-w-sm mx-auto mb-6 font-sans">
                Choose a pre-curated study plan (like Blind 75 or Top Interview 150) or import custom LeetCode problem sets.
              </p>
              <div className="flex justify-center gap-3 font-mono text-xs">
                <button
                  onClick={() => setActiveTab('curated')}
                  className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity uppercase tracking-wider shadow-sm"
                >
                  Explore Curated Decks -&gt;
                </button>
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="px-4 py-2 bg-surface border border-border rounded-lg font-semibold text-text hover:bg-background transition-colors uppercase tracking-wider"
                >
                  [ Import URL ]
                </button>
              </div>
            </div>
          ) : (
            /* Decks Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {decks.map((deck) => (
                <Link key={deck.id} href={`/app/decks/${deck.id}`} className="group block">
                  <div className="bg-surface border border-border rounded-xl p-5 hover:border-primary/50 transition-colors h-full flex flex-col justify-between space-y-4 shadow-sm">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h2 className="text-sm font-bold text-text group-hover:text-primary transition-colors line-clamp-1 font-mono">
                          {deck.name}
                        </h2>

                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity font-mono text-[11px]">
                          <button
                            onClick={(e) => { e.preventDefault(); setEditingDeck(deck); setIsModalOpen(true); }}
                            className="px-1.5 py-0.5 text-muted-text hover:text-text hover:bg-background border border-border rounded transition-colors"
                            title="Edit Deck"
                          >
                            EDIT
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, deck.id)}
                            className="px-1.5 py-0.5 text-muted-text hover:text-danger hover:bg-danger/10 border border-border rounded transition-colors"
                            title="Delete Deck"
                          >
                            DEL
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-muted-text line-clamp-2 leading-relaxed">
                        {deck.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/80 text-xs font-mono">
                      <span className="font-bold text-text tabular-nums">
                        [{deck._count?.problems || 0} Problems]
                      </span>
                      <span className="text-[11px] text-muted-text group-hover:text-text transition-colors">
                        Open Deck -&gt;
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 2: CURATED REPERTOIRES (1-Click LeetCode Packs) */}
      {activeTab === 'curated' && (
        <div className="space-y-6">
          <div className="p-4 bg-surface border border-border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-primary block">[ PRE-INDEXED STUDY REPERTOIRES ]</span>
              <p className="text-text mt-0.5 font-sans text-xs">
                Add standard industry interview lists directly to your active recall engine with a single click. Zero manual scraping required.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {curatedLists.map((list) => {
              const alreadyAdded = isDeckAlreadyAdded(list.name);
              const isCurrentlyImporting = importingListId === list.id;

              return (
                <div
                  key={list.id}
                  className="bg-surface border border-border rounded-xl p-6 flex flex-col justify-between space-y-5 shadow-sm hover:border-primary/40 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 font-mono">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                        {list.badge}
                      </span>
                      <span className="text-xs font-bold text-text">
                        [{list.problemCount} PROBLEMS]
                      </span>
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-text font-mono">
                        {list.name}
                      </h2>
                      <p className="text-xs text-muted-text mt-1 leading-relaxed">
                        {list.description}
                      </p>
                    </div>

                    {/* Difficulty Distribution Breakdown Bar */}
                    <div className="space-y-1.5 font-mono text-[11px] pt-1">
                      <div className="flex justify-between items-center text-muted-text">
                        <span>Difficulty Breakdown:</span>
                        <div className="flex gap-2 font-semibold">
                          <span className="text-emerald-500">{list.difficultyCounts.EASY} Easy</span>
                          <span>•</span>
                          <span className="text-amber-500">{list.difficultyCounts.MEDIUM} Med</span>
                          <span>•</span>
                          <span className="text-rose-500">{list.difficultyCounts.HARD} Hard</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-background border border-border flex overflow-hidden">
                        <div
                          style={{ width: `${(list.difficultyCounts.EASY / list.problemCount) * 100}%` }}
                          className="bg-emerald-500 h-full"
                        />
                        <div
                          style={{ width: `${(list.difficultyCounts.MEDIUM / list.problemCount) * 100}%` }}
                          className="bg-amber-500 h-full"
                        />
                        <div
                          style={{ width: `${(list.difficultyCounts.HARD / list.problemCount) * 100}%` }}
                          className="bg-rose-500 h-full"
                        />
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 pt-1 font-mono">
                      {list.tags.map(t => (
                        <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-background border border-border text-muted-text">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-border flex items-center justify-between font-mono text-xs">
                    {alreadyAdded ? (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-success font-semibold">[✓ IN YOUR REPERTOIRE]</span>
                        <button
                          onClick={() => setActiveTab('my_decks')}
                          className="text-muted-text hover:text-text underline"
                        >
                          View in Decks -&gt;
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setCuratedPromptList(list)}
                        disabled={isCurrentlyImporting}
                        className="w-full py-2.5 rounded-lg bg-text text-background font-semibold hover:opacity-90 transition-opacity uppercase tracking-wider shadow-sm text-center disabled:opacity-50"
                      >
                        {isCurrentlyImporting ? '[ IMPORTING REPERTOIRE... ]' : `+ Add "${list.name}" (${list.problemCount} Cards)`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Curated Familiarity Prompt Modal */}
      {curatedPromptList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 font-mono">
          <div className="bg-surface w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-border p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-bold text-text uppercase">
                [ ADD {curatedPromptList.name} ]
              </span>
              <span className="text-[10px] text-primary font-bold">
                {curatedPromptList.problemCount} PROBLEMS
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-text font-sans">
                Select your starting familiarity for these {curatedPromptList.problemCount} problems to initialize your SM-2 spaced schedule:
              </p>

              <div className="space-y-2 pt-2 text-xs">
                <label className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${selectedFamiliarity === 'all_new' ? 'border-primary bg-primary/5' : 'border-border hover:bg-background'}`}>
                  <input
                    type="radio"
                    name="curated_fam"
                    value="all_new"
                    checked={selectedFamiliarity === 'all_new'}
                    onChange={() => setSelectedFamiliarity('all_new')}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="font-semibold text-text">[ BRAND NEW QUEUE ]</p>
                    <p className="text-muted-text text-[11px] font-sans mt-0.5">Introduced gradually via your daily intake limit.</p>
                  </div>
                </label>

                <label className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${selectedFamiliarity === 'mixed' ? 'border-primary bg-primary/5' : 'border-border hover:bg-background'}`}>
                  <input
                    type="radio"
                    name="curated_fam"
                    value="mixed"
                    checked={selectedFamiliarity === 'mixed'}
                    onChange={() => setSelectedFamiliarity('mixed')}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="font-semibold text-text">[ MIXED KNOWLEDGE ]</p>
                    <p className="text-muted-text text-[11px] font-sans mt-0.5">Self-grade each card upon first encounter.</p>
                  </div>
                </label>

                <label className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${selectedFamiliarity === 'studied' ? 'border-primary bg-primary/5' : 'border-border hover:bg-background'}`}>
                  <input
                    type="radio"
                    name="curated_fam"
                    value="studied"
                    checked={selectedFamiliarity === 'studied'}
                    onChange={() => setSelectedFamiliarity('studied')}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="font-semibold text-text">[ ALREADY STUDIED ]</p>
                    <p className="text-muted-text text-[11px] font-sans mt-0.5">Schedules first active recall review in 3 days.</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-border mt-4 text-xs">
              <button
                type="button"
                onClick={() => setCuratedPromptList(null)}
                className="px-4 py-2 rounded-lg border border-border text-muted-text hover:text-text hover:bg-background transition-colors uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleImportCurated(curatedPromptList, selectedFamiliarity)}
                disabled={importingListId !== null}
                className="px-5 py-2 bg-primary text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity uppercase tracking-wider"
              >
                {importingListId ? '[ IMPORTING... ]' : 'Confirm & Add Deck ->'}
              </button>
            </div>
          </div>
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
