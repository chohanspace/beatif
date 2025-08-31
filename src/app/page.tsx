
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

function BeatifApp() {
  const { currentTrack, loggedInUser, setLoggedInUser } = useApp();
  const [view, setView] = useState<View>({ type: 'discover' });
  const [showCountryDialog, setShowCountryDialog] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [isSavingCountry, setIsSavingCountry] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loggedInUser) {
      router.push('/login');
    } else if (loggedInUser && !loggedInUser.country) {
      setShowCountryDialog(true);
    }
  }, [loggedInUser, router]);

  const handleSaveCountry = async () => {
    if (!selectedCountry || !loggedInUser) return;
    setIsSavingCountry(true);
    const updatedUser: User = { ...loggedInUser, country: selectedCountry };
    await saveUser(updatedUser);
    setLoggedInUser(updatedUser);
    if (typeof window !== 'undefined') {
        localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
    }
    toast({ title: "Preferences Saved", description: "Your country has been set." });
    setShowCountryDialog(false);
    setIsSavingCountry(false);
  };
  
  const filteredCountries = countries.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()));


  if (!loggedInUser) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <p>Redirecting to login...</p>
        </div>
    );
  }

  return (
    <>
    <SidebarProvider>
      <div className="h-screen w-full flex flex-col bg-background text-foreground">
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar view={view} setView={setView} />
          <MainView view={view} setView={setView} />
        </div>
        {currentTrack && <PlayerBar track={currentTrack} />}
      </div>
    </SidebarProvider>

    <Dialog open={showCountryDialog} onOpenChange={(isOpen) => {
        // Prevent closing the dialog by clicking outside or pressing Escape
        if (!isOpen) {
            toast({ variant: 'destructive', title: "Selection Required", description: "Please select your country to continue." });
        }
    }}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} className="sm:max-w-[425px]">
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
                    {isSavingCountry ? 'Saving...' : 'Save and Continue'}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function Home() {
  return <BeatifApp />;
}
