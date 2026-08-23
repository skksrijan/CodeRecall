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

  // Custom react-select styles to match Tailwind
  const customStyles = {
    control: (base: any) => ({
      ...base,
      backgroundColor: 'var(--background)',
      borderColor: 'rgba(var(--muted-text), 0.3)',
      color: 'inherit',
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: 'var(--surface)',
      color: 'inherit',
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? 'rgba(var(--primary), 0.1)' : 'transparent',
      color: 'inherit',
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: 'rgba(var(--primary), 0.2)',
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: 'inherit',
    }),
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-surface rounded-lg shadow-xl w-full max-w-3xl p-6 my-8">
        <h2 className="text-2xl font-bold mb-6">{existingProblem ? 'Edit Problem' : 'Add Problem'}</h2>
        
        <div className="mb-6 bg-muted-text/5 p-4 rounded border border-muted-text/10 flex items-end gap-2">
          <div className="flex-grow">
            <label className="block text-sm font-medium mb-1">Autofill from LeetCode ID</label>
            <input
              type="number"
              placeholder="e.g. 1 for Two Sum"
              className="w-full p-2 rounded bg-background border border-muted-text/30 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              value={leetcodeId}
              onChange={(e) => setLeetcodeId(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={handleAutofill}
            disabled={autofilling || !leetcodeId}
            className="px-4 py-2 bg-secondary text-white rounded hover:bg-secondary/90 disabled:opacity-50 text-sm whitespace-nowrap"
          >
            {autofilling ? 'Fetching...' : 'Autofill'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                required
                className="w-full p-2 rounded bg-background border border-muted-text/30 focus:outline-none focus:ring-2 focus:ring-primary"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">LeetCode URL (Optional)</label>
              <input
                type="url"
                className="w-full p-2 rounded bg-background border border-muted-text/30 focus:outline-none focus:ring-2 focus:ring-primary"
                value={leetcodeUrl}
                onChange={(e) => setLeetcodeUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Difficulty</label>
              <select
                className="w-full p-2 rounded bg-background border border-muted-text/30 focus:outline-none focus:ring-2 focus:ring-primary"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tags</label>
              <CreatableSelect
                isMulti
                options={existingTags}
                value={tags}
                onChange={(newValue) => setTags(newValue as any)}
                styles={customStyles}
                className="text-sm text-black dark:text-white"
                theme={(theme) => ({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    primary: 'var(--primary)',
                  },
                })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              className="w-full p-2 rounded bg-background border border-muted-text/30 focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you learn? What's the core pattern?"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium">Your Solution</label>
              <select
                className="p-1 text-sm rounded bg-background border border-muted-text/30 focus:outline-none focus:ring-2 focus:ring-primary"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
            </div>
            <textarea
              className="w-full p-4 rounded bg-background border border-muted-text/30 focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              rows={8}
              value={userSolution}
              onChange={(e) => setUserSolution(e.target.value)}
              spellCheck={false}
              placeholder="// Write your code here..."
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
              {saving ? 'Saving...' : 'Save Problem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
