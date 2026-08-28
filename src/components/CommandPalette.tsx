'use client';

import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

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
      className="fixed inset-0 z-50 flex justify-center items-start pt-[12vh] px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => setOpen(false)}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-surface border border-border shadow-2xl rounded-xl overflow-hidden animate-in zoom-in-95 duration-150 font-mono"
      >
        <div className="flex items-center border-b border-border px-4 py-3 text-text bg-background/50">
          <span className="text-xs text-muted-text mr-3 uppercase font-bold">[SEARCH]</span>
          <Command.Input 
            placeholder="Search decks, problems, or tags..." 
            className="flex-1 bg-transparent border-none outline-none text-text placeholder:text-muted-text text-sm font-sans font-medium"
          />
          <kbd className="hidden sm:inline-flex items-center text-[10px] text-muted-text bg-surface px-1.5 py-0.5 rounded border border-border uppercase">
            [ESC] TO CLOSE
          </kbd>
        </div>
        
        <Command.List className="max-h-[50vh] overflow-y-auto custom-scrollbar p-2 text-xs">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-text">
              <span className="text-xs text-primary animate-pulse">[ INDEXING REPOSITORY... ]</span>
            </div>
          )}

          {!loading && <Command.Empty className="py-10 text-center text-muted-text text-xs">No matching records found.</Command.Empty>}

          {!loading && decks.length > 0 && (
            <Command.Group heading="[DECKS]" className="mb-3 text-[10px] font-semibold text-muted-text px-2 tracking-wider">
              {decks.map(deck => (
                <Command.Item
                  key={deck.id}
                  value={deck.name + " " + deck.description}
                  onSelect={() => runCommand(() => router.push(`/app/decks/${deck.id}`))}
                  className="flex items-center px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm text-text data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary border border-transparent data-[selected=true]:border-primary/20"
                >
                  <span className="font-mono text-[10px] text-muted-text mr-2 shrink-0">[DECK]</span>
                  <span className="font-medium truncate font-sans">{deck.name}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {!loading && problems.length > 0 && (
            <Command.Group heading="[PROBLEMS]" className="text-[10px] font-semibold text-muted-text px-2 tracking-wider">
              {problems.map(problem => (
                <Command.Item
                  key={problem.id}
                  value={problem.title + " " + problem.tags.map(t => t.name).join(" ")}
                  onSelect={() => runCommand(() => router.push(`/app/study?problemId=${problem.id}`))}
                  className="flex items-center px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm text-text data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary border border-transparent data-[selected=true]:border-primary/20"
                >
                  <span className="font-mono text-[10px] text-muted-text mr-2 shrink-0">[CARD]</span>
                  <span className="flex-1 truncate font-medium font-sans">{problem.title}</span>
                  <div className="flex gap-1.5 shrink-0 ml-3">
                    {problem.tags.slice(0, 2).map(tag => (
                      <span key={tag.name} className="flex items-center text-[10px] bg-background border border-border px-1.5 py-0.5 rounded text-muted-text">
                        #{tag.name}
                      </span>
                    ))}
                    {problem.tags.length > 2 && <span className="text-[10px] text-muted-text self-center">+{problem.tags.length - 2}</span>}
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
