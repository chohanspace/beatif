
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

function BeatifApp() {
  const { currentTrack, loggedInUser, setLoggedInUser } = useApp();
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
    // When currentTrack changes, if we are not in the player view, show the player bar.
    // If we are in the player view, update it.
    if (currentTrack) {
        if (view.type === 'player') {
            setView({ type: 'player', track: currentTrack });
        }
    }
  }, [currentTrack, view.type]);

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

  return (
    <>
    <SidebarProvider>
      <div className="h-screen w-full flex flex-col bg-background text-foreground">
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar view={view} setView={setView} />
          <MainView view={view} setView={setView} />
        </div>
        {currentTrack && view.type !== 'player' && <PlayerBar track={currentTrack} setView={setView} />}
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

export default function Home() {
  const { status: sessionStatus } = useSession();
  const { loggedInUser } = useApp(); // Custom JWT auth state
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // We are no longer loading when session status is determined AND our custom context has loaded the user.
    const isLoading = sessionStatus === 'loading' && !loggedInUser;
    
    if (!isLoading) {
      // User is authenticated if next-auth says so OR if our custom JWT user exists.
      const auth = sessionStatus === 'authenticated' || !!loggedInUser;
      setIsAuthenticated(auth);
    }
  }, [sessionStatus, loggedInUser]);

  useEffect(() => {
    // Only redirect when authentication status has been definitively determined.
    if (isAuthenticated === false) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // While we determine the auth state, show a loader.
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

  // If not authenticated, we've already started the redirect, so return null to avoid flashing any content.
  return null;
}
