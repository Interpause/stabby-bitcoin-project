import { Suspense } from 'react';
import { NewsBoard } from '@/components/news-board';

export const metadata = {
  title: 'News',
  description: 'Latest Bitcoin and Cryptocurrency news from around the web.',
};

export default function NewsPage() {
  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="mb-10 space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Crypto <span className="text-amber-500">News</span></h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Aggregated real-time updates on Bitcoin, macroeconomic events, and cryptocurrency regulations from GDELT 2.0.
        </p>
      </div>
      
      <Suspense fallback={<div className="text-center py-20 text-muted-foreground">Loading news board...</div>}>
        <NewsBoard />
      </Suspense>
    </div>
  );
}
