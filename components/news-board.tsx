'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { NewsCard } from './news-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export interface Article {
  url: string;
  title: string;
  domain: string;
  seendate: string;
  socialimage?: string;
  snippet?: string;
  _score?: number; // Internal score for search sorting
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function NewsBoard() {
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');

  const { data, error, isLoading } = useSWR(
    '/api/proxy/gdelt?query=(theme:ECON_BITCOIN%20OR%20theme:WB_359_E_MONEY)&mode=artlist&format=json&timespan=7d',
    fetcher,
    { revalidateOnFocus: false } // Prevent excessive fetching on tab switch
  );

  if (isLoading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-80 rounded-xl bg-card border border-border/40 animate-pulse"></div>
      ))}
    </div>
  );
  
  if (error) return <div className="text-red-500 text-center py-20 bg-red-500/10 rounded-xl">Failed to load news. Please try again later.</div>;
  if (!data || !data.articles || data.articles.length === 0) return <div className="text-center py-20 bg-muted/30 rounded-xl">No news articles found for this time period.</div>;

  // Simple relevance scoring for search
  const getSearchScore = (article: Article, term: string) => {
    if (!term) return 0;
    const words = term.toLowerCase().split(/\s+/).filter(Boolean);
    let score = 0;
    const title = (article.title || '').toLowerCase();
    const snippet = (article.snippet || '').toLowerCase();
    const domain = (article.domain || '').toLowerCase();

    words.forEach(word => {
      // Direct matches in title get highest weight
      if (title.includes(word)) score += 10;
      // Matches in domain (e.g. searching for a site)
      if (domain.includes(word)) score += 5;
      // Matches in snippet
      if (snippet.includes(word)) score += 3;
      
      // Frequency bonus
      const titleMatches = (title.match(new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      const snippetMatches = (snippet.match(new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      score += titleMatches * 2 + snippetMatches;
    });
    return score;
  };

  let processedArticles = [...data.articles];

  // Apply search filtering
  if (searchTerm.trim()) {
    processedArticles = processedArticles
      .map(article => ({ ...article, _score: getSearchScore(article, searchTerm) }))
      .filter((article: Article) => (article._score ?? 0) > 0)
      .sort((a: Article, b: Article) => {
        // Sort by score DESC
        const scoreB = b._score ?? 0;
        const scoreA = a._score ?? 0;
        if (scoreB !== scoreA) return scoreB - scoreA;
        // Then by newest if scores are equal
        return b.seendate.localeCompare(a.seendate);
      });
  } else {
    // Apply standard sorting if no search
    processedArticles.sort((a: Article, b: Article) => {
      if (sortBy === 'newest') return b.seendate.localeCompare(a.seendate);
      if (sortBy === 'oldest') return a.seendate.localeCompare(b.seendate);
      if (sortBy === 'domain') return (a.domain || '').localeCompare(b.domain || '');
      return 0;
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card/60 backdrop-blur-sm p-4 rounded-xl border border-border/50 gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <div className="text-sm font-medium text-muted-foreground flex items-center gap-2 whitespace-nowrap">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            Showing {processedArticles.length} {searchTerm ? 'matching' : 'recent'} articles
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search news..."
              className="pl-9 bg-background/50"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-sm font-medium whitespace-nowrap">Sort by:</span>
          <Select value={sortBy} onValueChange={(val) => { if (typeof val === 'string') setSortBy(val); }}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background">
              <SelectValue placeholder="Sort order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="domain">Domain (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {processedArticles.map((article: Article, i: number) => (
          <NewsCard key={article.url + i} article={article} />
        ))}
      </div>
    </div>
  );
}
