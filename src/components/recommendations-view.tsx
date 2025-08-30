"use client";

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { getGenreRecommendations } from '@/lib/actions';
import { GearsLoader } from './ui/gears-loader';

export default function RecommendationsView() {
  const [listeningHistory, setListeningHistory] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listeningHistory.trim()) return;

    setIsLoading(true);
    setRecommendations('');
    const result = await getGenreRecommendations({ listeningHistory });
    setRecommendations(result);
    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold font-headline mb-4">For You</h2>
        <p className="text-muted-foreground text-lg">
          Get personalized recommendations by telling us what you've been listening to.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Describe Your Taste</CardTitle>
          <CardDescription>
            Enter a few artists, genres, or songs you like. The more detail, the better!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="e.g., I've been listening to a lot of 80s synth-pop like The Human League, some modern indie rock like Alvvays, and classic soul from Etta James..."
              value={listeningHistory}
              onChange={(e) => setListeningHistory(e.target.value)}
              rows={5}
              className="text-base"
            />
            <Button type="submit" disabled={isLoading || !listeningHistory.trim()}>
              {isLoading ? (
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
        </CardContent>
      </Card>

      {recommendations && (
        <Card>
          <CardHeader>
            <CardTitle>Here's what we found for you</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none whitespace-pre-wrap">
                {recommendations}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
