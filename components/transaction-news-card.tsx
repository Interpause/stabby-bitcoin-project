import useSWR from 'swr';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { ExternalLink, Link2, Newspaper } from 'lucide-react';

interface OpenGraphData {
  url: string;
  title?: string;
  snippet?: string;
  socialimage?: string;
  domain?: string;
  error?: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function TransactionNewsCard({ url }: { url: string }) {
  const { data, isLoading } = useSWR<OpenGraphData>(
    `/api/proxy/opengraph?url=${encodeURIComponent(url)}`,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  let hostname = '';
  try { hostname = new URL(url).hostname.replace('www.', ''); } catch { /* ignore */ }

  if (isLoading) {
    return (
      <div className="w-full h-12 rounded-lg animate-pulse bg-muted/40 border border-border/30 flex items-center px-4 mt-2">
        <div className="h-4 w-4 bg-border/40 rounded-full mr-3 shrink-0"></div>
        <div className="h-3 bg-border/40 rounded w-1/3"></div>
      </div>
    );
  }

  // Fallback for error or missing data
  if (!data || (data.error && !data.title)) {
    return (
      <Link href={url} target="_blank" rel="noopener noreferrer" className="block w-full group mt-2">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-border/40 bg-background/50 hover:bg-muted/30 transition-all group-hover:border-amber-500/30">
          <div className="bg-muted p-1.5 rounded-md text-muted-foreground group-hover:text-amber-500 transition-colors">
            <Link2 className="h-3.5 w-3.5" />
          </div>
          <span className="text-[11px] font-medium text-muted-foreground group-hover:text-slate-300 transition-colors truncate">
            {hostname || 'Source Link'}
          </span>
          <ExternalLink className="h-3 w-3 text-muted-foreground/50 ml-auto group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </Link>
    );
  }

  // Premium sleek card
  return (
    <Link href={url} target="_blank" rel="noopener noreferrer" className="block w-full group mt-2">
      <Card className="relative overflow-hidden border-border/40 bg-card/40 hover:bg-card/80 transition-all duration-300 hover:shadow-md hover:border-amber-500/40 group-hover:-translate-y-0.5">
        <div className="flex items-center p-2.5 gap-3">
          {data.socialimage ? (
            <div className="h-10 w-10 shrink-0 rounded-md overflow-hidden bg-muted border border-border/50 relative shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={data.socialimage} 
                alt={data.title || "Preview"} 
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          ) : (
            <div className="h-10 w-10 shrink-0 rounded-md bg-gradient-to-br from-muted/80 to-muted flex items-center justify-center border border-border/50 shadow-sm group-hover:from-amber-500/10 group-hover:to-amber-500/5 transition-colors">
              <Newspaper className="h-4 w-4 text-muted-foreground group-hover:text-amber-500/70 transition-colors" />
            </div>
          )}
          
          <div className="flex flex-col flex-1 min-w-0 justify-center">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[9px] font-bold tracking-widest uppercase text-amber-500/80 truncate">
                {data.domain || hostname}
              </span>
            </div>
            <h4 className="text-xs font-medium text-slate-300 group-hover:text-amber-400 transition-colors truncate">
              {data.title || url}
            </h4>
          </div>

          <div className="pr-2 opacity-50 group-hover:opacity-100 transition-opacity">
            <ExternalLink className="h-3.5 w-3.5 text-amber-500/70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
