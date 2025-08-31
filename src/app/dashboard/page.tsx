
"use client";

import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import { useApp } from '@/context/app-context';
import AppSidebar from '@/components/app-sidebar';
import MainView from '@/components/main-view';
import PlayerBar from '@/components/player-bar';
import type { View, User } from '@/lib/types';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { saveUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { countries } from '@/lib/countries';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MusicalNotesLoader } from '@/components/ui/gears-loader';
import { useSession } from 'next-auth/react';
import PlayerView from '@/components/player-view';

function BeatifApp() {
  const { currentTrack, loggedInUser, setLoggedInUser, playerRef } = useApp();
  const [view, setView] = useState<View>({ type: 'discover' });
  const [showCountryDialog, setShowCountryDialog] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [isSavingCountry, setIsSavingCountry] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (loggedInUser && !loggedInUser.country) {
      setShowCountryDialog(true);
    }
  }, [loggedInUser]);
  
  useEffect(() => {
    const playerContainer = document.getElementById('player-container');
    const globalPlayerContainer = document.getElementById('global-player-container');
    const playerIframe = playerRef?.current?.firstChild;

    if (playerIframe) {
      if (view.type === 'player' && playerContainer && playerIframe.parentElement !== playerContainer) {
        playerContainer.appendChild(playerIframe);
      } else if (view.type !== 'player' && globalPlayerContainer && playerIframe.parentElement !== globalPlayerContainer) {
        globalPlayerContainer.appendChild(playerIframe);
      }
    }
  }, [view.type, playerRef]);


  const handleSaveCountry = async () => {
    if (!selectedCountry || !loggedInUser) return;
    setIsSavingCountry(true);
    const updatedUser: User = { ...loggedInUser, country: selectedCountry };
    try {
        await saveUser(updatedUser);
        setLoggedInUser(updatedUser); // This will also update localStorage via the context
        toast({ title: "Preferences Saved", description: "Your country has been set." });
        setShowCountryDialog(false);
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: "Save Failed", description: "Could not save your country. Please try again."})
    } finally {
        setIsSavingCountry(false);
    }
  };
  
  const filteredCountries = countries.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()));
  
  // Conditionally render PlayerView to avoid issues with SSR for the dialog
  if (view.type === 'player') {
    return <PlayerView setView={setView} />;
  }

  return (
    <>
    <SidebarProvider>
      <div className="h-screen w-full flex flex-col bg-background text-foreground">
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar view={view} setView={setView} />
          <MainView view={view} setView={setView} />
        </div>
        {currentTrack && <PlayerBar setView={setView} />}
      </div>
    </SidebarProvider>

    <Dialog open={showCountryDialog} onOpenChange={(isOpen) => {
        // Prevent closing the dialog by clicking outside or pressing Escape
        if (!isOpen && !loggedInUser?.country) {
            toast({ variant: 'destructive', title: "Selection Required", description: "Please select your country to continue." });
        } else {
            setShowCountryDialog(isOpen);
        }
    }}>
        <DialogContent onInteractOutside={(e) => {
             if (!loggedInUser?.country) e.preventDefault()
        }} className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Welcome to Beatif!</DialogTitle>
                <DialogDescription>
                    To give you the best recommendations, please select your country.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <Input 
                    placeholder="Search for a country..."
                    value={countrySearch}
                    onChange={e => setCountrySearch(e.target.value)}
                />
               <Select onValueChange={setSelectedCountry} value={selectedCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-64">
                      {filteredCountries.map(c => <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>)}
                    </ScrollArea>
                  </SelectContent>
                </Select>
            </div>
            <DialogFooter>
                <Button onClick={handleSaveCountry} disabled={!selectedCountry || isSavingCountry}>
                    {isSavingCountry ? <MusicalNotesLoader size="sm" className="mr-2" /> : 'Save and Continue'}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function DashboardPage() {
  const { status: sessionStatus } = useSession();
  const { loggedInUser, setLoggedInUser } = useApp();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // This effect now correctly handles the initial auth check.
    // It waits for the session status to be determined AND checks for the presence of a user
    // loaded from localStorage by the AppContext.
    
    // First, attempt to load user from localStorage if not already present in context.
    const storedUserStr = typeof window !== 'undefined' ? localStorage.getItem('loggedInUser') : null;
    if (storedUserStr && !loggedInUser) {
      try {
        const user = JSON.parse(storedUserStr);
        setLoggedInUser(user);
      } catch (e) {
        console.error("Failed to parse user from local storage", e);
      }
    }
    
    // Once session status is no longer loading, determine the final auth state.
    if (sessionStatus !== 'loading') {
      const authStatus = sessionStatus === 'authenticated' || !!loggedInUser;
      setIsAuthenticated(authStatus);
    }
  }, [sessionStatus, loggedInUser, setLoggedInUser]);

  useEffect(() => {
    // This effect handles the redirect based on the final, determined auth state.
    // It only runs when `isAuthenticated` changes from its initial `null` state.
    if (isAuthenticated === false) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // While we determine the auth state (isAuthenticated is null), show a loader.
  // This prevents the flicker and premature redirect.
  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <MusicalNotesLoader size="lg" />
          <p className="text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  // If authenticated, show the app.
  if (isAuthenticated) {
    return <BeatifApp />;
  }

  // If not authenticated, the redirect has already been triggered.
  // Return null to avoid rendering anything while the browser navigates.
  return null;
}
