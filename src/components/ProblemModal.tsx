'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import CreatableSelect from 'react-select/creatable';

interface ProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (problem: any) => void;
  existingProblem?: any;
  token: string;
  deckId: string;
}

export default function ProblemModal({ isOpen, onClose, onSaved, existingProblem, token, deckId }: ProblemModalProps) {
  const [title, setTitle] = useState('');
  const [leetcodeUrl, setLeetcodeUrl] = useState('');
  const [difficulty, setDifficulty] = useState('EASY');
  const [tags, setTags] = useState<{ label: string; value: string }[]>([]);
  const [notes, setNotes] = useState('');
  const [userSolution, setUserSolution] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [saving, setSaving] = useState(false);
  const [existingTags, setExistingTags] = useState<{ label: string; value: string }[]>([]);

  const [leetcodeId, setLeetcodeId] = useState('');
  const [autofilling, setAutofilling] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTags();
      if (existingProblem) {
        setTitle(existingProblem.title);
        setLeetcodeUrl(existingProblem.leetcodeUrl || '');
        setDifficulty(existingProblem.difficulty);
        setTags((existingProblem.tags || []).map((t: any) => ({ label: t.name, value: t.name })));
        setNotes(existingProblem.notes || '');
        setUserSolution(existingProblem.userSolution || '');
        setLanguage(existingProblem.language || 'javascript');
        setLeetcodeId('');
      } else {
        setTitle('');
        setLeetcodeUrl('');
        setDifficulty('EASY');
        setTags([]);
        setNotes('');
        setUserSolution('');
        setLanguage('javascript');
        setLeetcodeId('');
      }
    }
  }, [isOpen, existingProblem]);

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/tags', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setExistingTags(data.map((t: any) => ({ label: t.name, value: t.name })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAutofill = async () => {
    if (!leetcodeId) return;
    setAutofilling(true);
    try {
      const res = await fetch(`/api/leetcode?id=${leetcodeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 404) throw new Error('Problem not found');
        throw new Error('Failed to fetch from LeetCode');
      }
      const data = await res.json();
      setTitle(data.title);
      setDifficulty(data.difficulty);
      setLeetcodeUrl(data.url);
      if (data.tags && Array.isArray(data.tags)) {
        setTags(data.tags.map((t: string) => ({ label: t, value: t })));
      }
      toast.success('Autofilled successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Error autofilling');
    } finally {
      setAutofilling(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = existingProblem ? `/api/problems/${existingProblem.id}` : '/api/problems';
      const method = existingProblem ? 'PATCH' : 'POST';

      const payload = {
        title,
        leetcodeUrl,
        difficulty,
        notes,
        userSolution,
        language,
        tags: tags.map(t => t.value),
        deckIds: [deckId]
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save problem');
      const data = await res.json();
      onSaved(data);
      toast.success(existingProblem ? 'Problem updated' : 'Problem created');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  // Custom react-select styles to match precision theme
  const customStyles = {
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: 'hsl(var(--background))',
      borderColor: state.isFocused ? 'hsl(var(--primary))' : 'hsl(var(--border))',
      boxShadow: 'none',
      borderRadius: '0.5rem',
      padding: '2px',
      color: 'hsl(var(--text))',
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: 'hsl(var(--surface))',
      border: '1px solid hsl(var(--border))',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      color: 'hsl(var(--text))',
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? 'hsla(var(--primary)/0.1)' : 'transparent',
      color: 'hsl(var(--text))',
      fontSize: '0.875rem',
      fontFamily: 'monospace',
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: 'hsla(var(--primary)/0.15)',
      borderRadius: '0.375rem',
      border: '1px solid hsla(var(--primary)/0.25)',
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: 'hsl(var(--text))',
      fontSize: '0.75rem',
      fontFamily: 'monospace',
    }),
    input: (base: any) => ({
      ...base,
      color: 'hsl(var(--text))',
    }),
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-surface rounded-xl border border-border shadow-2xl w-full max-w-2xl p-6 my-8 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-border">
          <h2 className="text-base font-bold text-text tracking-tight">
            {existingProblem ? 'Edit Problem Entry' : 'Add Problem to Deck'}
          </h2>
          <span className="font-mono text-[10px] text-muted-text uppercase">Catalog Entry</span>
        </div>
        
        {/* LeetCode Autofill Toolbar */}
        <div className="mb-5 bg-background p-3.5 rounded-lg border border-border flex items-end gap-2.5">
          <div className="flex-grow">
            <label className="block text-xs font-mono font-semibold text-text uppercase tracking-wider mb-1">
              Autofill from LeetCode ID
            </label>
            <input
              type="number"
              placeholder="e.g. 1 (Two Sum) or 15 (3Sum)"
              className="w-full px-3 py-1.5 rounded-md bg-surface border border-border text-sm text-text focus:outline-none focus:border-primary font-mono placeholder:text-muted-text/50"
              value={leetcodeId}
              onChange={(e) => setLeetcodeId(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={handleAutofill}
            disabled={autofilling || !leetcodeId}
            className="px-4 py-1.5 bg-text text-background font-semibold rounded-md hover:opacity-90 disabled:opacity-50 text-xs font-mono tracking-wider uppercase transition-opacity shrink-0"
          >
            {autofilling ? 'Fetching...' : 'Autofill'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-semibold text-text uppercase tracking-wider mb-1">
                Problem Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Container With Most Water"
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-text focus:outline-none focus:border-primary transition-colors font-medium"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-text uppercase tracking-wider mb-1">
                LeetCode URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://leetcode.com/problems/..."
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-text focus:outline-none focus:border-primary transition-colors font-mono text-xs"
                value={leetcodeUrl}
                onChange={(e) => setLeetcodeUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-semibold text-text uppercase tracking-wider mb-1">
                Difficulty
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-text focus:outline-none focus:border-primary transition-colors font-semibold"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-text uppercase tracking-wider mb-1">
                Tags (Multi-select)
              </label>
              <CreatableSelect
                isMulti
                options={existingTags}
                value={tags}
                onChange={(newValue) => setTags(newValue as any)}
                styles={customStyles}
                className="text-xs"
                placeholder="Type and press enter..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-text uppercase tracking-wider mb-1">
              Core Pattern / Key Learnings (Notes)
            </label>
            <textarea
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-text focus:outline-none focus:border-primary transition-colors placeholder:text-muted-text/50"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What invariant or pattern does this problem hinge on?"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-mono font-semibold text-text uppercase tracking-wider">
                Reference Solution Code
              </label>
              <select
                className="px-2 py-0.5 text-xs rounded bg-background border border-border text-text font-mono focus:outline-none focus:border-primary"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
            </div>
            <textarea
              className="w-full p-3 rounded-lg bg-background border border-border text-text focus:outline-none focus:border-primary font-mono text-xs custom-scrollbar"
              rows={6}
              value={userSolution}
              onChange={(e) => setUserSolution(e.target.value)}
              spellCheck={false}
              placeholder="// Paste or write your canonical optimal solution here..."
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border mt-4">
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
              {saving ? 'Saving...' : existingProblem ? 'Update Problem' : 'Save Problem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
