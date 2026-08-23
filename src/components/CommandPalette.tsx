'use client';

import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Search, Folder, FileCode, Hash, Loader2 } from 'lucide-react';

interface Deck {
  id: string;
  name: string;
  description: string;
}

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  tags: { name: string }[];
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const { user } = useAuth();
  const router = useRouter();

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Fetch search data when modal opens
  useEffect(() => {
    if (open && user && decks.length === 0 && problems.length === 0) {
      setLoading(true);
      user.getIdToken().then(async (token) => {
        try {
          const res = await fetch('/api/search', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setDecks(data.decks || []);
            setProblems(data.problems || []);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      });
    }
  }, [open, user]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <Command.Dialog 
      open={open} 
      onOpenChange={setOpen} 
      label="Global Command Menu"
      className="fixed inset-0 z-50 flex justify-center items-start pt-[15vh] px-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-2xl bg-surface border border-border shadow-2xl rounded-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center border-b border-border px-4 py-3 text-text">
          <Search className="w-5 h-5 text-muted-text mr-3" />
          <Command.Input 
            placeholder="Search decks, problems, or tags..." 
            className="flex-1 bg-transparent border-none outline-none text-text placeholder:text-muted-text text-lg"
          />
        </div>
        
        <Command.List className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
          {loading && (
            <div className="py-10 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-text" />
            </div>
          )}

          {!loading && <Command.Empty className="py-10 text-center text-muted-text text-sm">No results found.</Command.Empty>}

          {!loading && decks.length > 0 && (
            <Command.Group heading="Decks" className="mb-4 text-xs font-semibold text-muted-text px-2">
              {decks.map(deck => (
                <Command.Item
                  key={deck.id}
                  value={deck.name + " " + deck.description}
                  onSelect={() => runCommand(() => router.push(`/app/decks/${deck.id}`))}
                  className="flex items-center px-4 py-3 mt-1 rounded-lg cursor-pointer transition-colors text-sm font-medium text-text data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
                >
                  <Folder className="w-4 h-4 mr-3 opacity-70" />
                  {deck.name}
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {!loading && problems.length > 0 && (
            <Command.Group heading="Problems" className="text-xs font-semibold text-muted-text px-2">
              {problems.map(problem => (
                <Command.Item
                  key={problem.id}
                  value={problem.title + " " + problem.tags.map(t => t.name).join(" ")}
                  onSelect={() => runCommand(() => router.push(`/app/study?problemId=${problem.id}`))}
                  className="flex items-center px-4 py-3 mt-1 rounded-lg cursor-pointer transition-colors text-sm font-medium text-text data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
                >
                  <FileCode className="w-4 h-4 mr-3 opacity-70" />
                  <span className="flex-1 truncate">{problem.title}</span>
                  <div className="flex gap-2 shrink-0 ml-4">
                    {problem.tags.slice(0, 2).map(tag => (
                      <span key={tag.name} className="flex items-center text-[10px] bg-background border border-border px-1.5 py-0.5 rounded text-muted-text">
                        <Hash className="w-3 h-3 mr-0.5" />
                        {tag.name}
                      </span>
                    ))}
                    {problem.tags.length > 2 && <span className="text-[10px] text-muted-text">+{problem.tags.length - 2}</span>}
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>
      </div>
    </Command.Dialog>
  );
}
