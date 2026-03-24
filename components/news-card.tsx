import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Link from 'next/link';
import { Article } from './news-board';

export function NewsCard({ article }: { article: Article }) {
  // Format seendate like 20260323T130000Z to readable
  const formatDateTime = (dateStr: string) => {
    if (!dateStr || dateStr.length < 15) return 'Unknown Date';
    try {
      const year = dateStr.slice(0, 4);
      const month = dateStr.slice(4, 6);
      const day = dateStr.slice(6, 8);
      const hours = dateStr.slice(9, 11);
      const minutes = dateStr.slice(11, 13);
      
      const date = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00Z`);
      if (isNaN(date.getTime())) return dateStr;

      return new Intl.DateTimeFormat('en-US', {
        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const domain = article.domain || 'Unknown Source';

  return (
    <Link href={article.url} target="_blank" rel="noopener noreferrer" className="block h-full group">
      <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-amber-500/50 hover:-translate-y-1 bg-card/60 backdrop-blur-sm border-border/50">
        {article.socialimage ? (
          <div className="w-full h-48 overflow-hidden bg-muted relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={article.socialimage} 
              alt={article.title} 
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              onError={(e) => {
                 (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            {/* Gradient Overlay for polished look */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        ) : (
          <div className="w-full h-48 bg-muted flex items-center justify-center border-b border-border/50 relative overflow-hidden">
             {/* Fallback pattern */}
             <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            <span className="text-muted-foreground font-semibold tracking-wider uppercase bg-background/50 px-4 py-2 rounded shadow-sm backdrop-blur-md">
              {domain}
            </span>
          </div>
        )}
        
        <CardHeader className="p-5 pb-3 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-medium tracking-wider uppercase text-muted-foreground mb-1">
            <span className="text-amber-500">{domain}</span>
            <span>{formatDateTime(article.seendate)}</span>
          </div>
          <h3 className="font-bold text-[17px] leading-snug line-clamp-3 group-hover:text-amber-500 transition-colors duration-200">
            {article.title}
          </h3>
        </CardHeader>
        
        <CardContent className="p-5 pt-0 flex-grow">
          {article.snippet ? (
            <p className="text-sm text-muted-foreground/90 line-clamp-4 leading-relaxed">
              {article.snippet}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground/60 italic">
              Click to read full article...
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
