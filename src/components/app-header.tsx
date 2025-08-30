"use client";

import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import type { View } from '@/lib/types';
import { SidebarTrigger } from './ui/sidebar';

interface AppHeaderProps {
  view: View;
  setView: Dispatch<SetStateAction<View>>;
}

export default function AppHeader({ view, setView }: AppHeaderProps) {
  const [query, setQuery] = useState(
    view.type === 'search' ? view.query : ''
  );
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      setView({ type: 'search', query: debouncedQuery });
    } else if (view.type === 'search') {
      setView({ type: 'discover' });
    }
  }, [debouncedQuery, setView]);
  
  useEffect(() => {
    if (view.type !== 'search') {
        setQuery('');
    }
  }, [view.type]);

  return (
    <header className="p-4 px-6 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10 flex items-center gap-4">
       <SidebarTrigger className="md:hidden" />
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search for songs, artists, albums..."
          className="pl-10 w-full max-w-md bg-muted border-0 focus-visible:ring-primary focus-visible:ring-2"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
    </header>
  );
}
