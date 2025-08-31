
'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { saveUser } from '@/lib/auth';
import { countries } from '@/lib/countries';
import { getGenreRecommendations } from '@/lib/actions';
import { GearsLoader } from '@/components/ui/gears-loader';
import { Sparkles } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import type { User } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';


export default function SettingsPage() {
  const { loggedInUser, setLoggedInUser } = useApp();
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState(loggedInUser?.country || '');
  const [countrySearch, setCountrySearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [listeningHistory, setListeningHistory] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!loggedInUser) {
      router.push('/login');
    } else {
        setSelectedCountry(loggedInUser.country || '');
    }
  }, [loggedInUser, router]);

  const handleCountrySave = async () => {
    if (!selectedCountry || !loggedInUser) return;
    setIsSaving(true);
    const updatedUser: User = { ...loggedInUser, country: selectedCountry };
    await saveUser(updatedUser);
    setLoggedInUser(updatedUser);
     if (typeof window !== 'undefined') {
        localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
    }
    toast({ title: 'Country Updated', description: `Your location has been set to ${selectedCountry}.` });
    setIsSaving(false);
  };
  
  const handleGetRecommendations = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listeningHistory.trim()) return;

    setIsGenerating(true);
    setRecommendations('');
    const result = await getGenreRecommendations({ listeningHistory });
    setRecommendations(result);
    setIsGenerating(false);
  };

  const filteredCountries = countries.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()));

  if (!loggedInUser) {
    return <div className="flex justify-center items-center h-full"><GearsLoader size="lg" /></div>
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-headline">Settings</h1>
        <p className="text-muted-foreground text-lg">Manage your account and personalization settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
          <CardDescription>
            Changing your country will update the trending music on your Discover page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="country-search">Search Country</Label>
                <Input
                    id="country-search"
                    placeholder="Find your country..."
                    value={countrySearch}
                    onChange={e => setCountrySearch(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                 <Label>Select Country</Label>
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
          <Button onClick={handleCountrySave} disabled={isSaving || selectedCountry === loggedInUser.country}>
            {isSaving ? <GearsLoader size="sm" className="mr-2" /> : null}
            {isSaving ? 'Saving...' : 'Save Country'}
          </Button>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>Personalize Recommendations</CardTitle>
          <CardDescription>
            Tell us what you like so we can find music you'll love. The more detail, the better!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGetRecommendations} className="space-y-4">
            <Textarea
              placeholder="e.g., I've been listening to a lot of 80s synth-pop like The Human League, some modern indie rock like Alvvays, and classic soul from Etta James..."
              value={listeningHistory}
              onChange={(e) => setListeningHistory(e.target.value)}
              rows={5}
              className="text-base"
            />
            <Button type="submit" disabled={isGenerating || !listeningHistory.trim()}>
              {isGenerating ? (
                <>
                  <GearsLoader className="mr-2" size="sm" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get Recommendations
                </>
              )}
            </Button>
          </form>
           {recommendations && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Here's what we found for you</h3>
                    <div className="prose prose-invert max-w-none whitespace-pre-wrap bg-muted p-4 rounded-md">
                        {recommendations}
                    </div>
                </div>
            )}
        </CardContent>
      </Card>

    </div>
  );
}
