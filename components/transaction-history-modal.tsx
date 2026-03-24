import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import useSWR from 'swr';
import { publicTreasuryTransactionHistory } from '@/sdk/coingecko/public-treasury/public-treasury';
import { TransactionNewsCard } from './transaction-news-card';
import { Loader2, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface TransactionHistoryModalProps {
  entityId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  entityName?: string;
}

export function TransactionHistoryModal({ entityId, isOpen, onOpenChange, entityName }: TransactionHistoryModalProps) {
  const { data: response, isLoading, error } = useSWR(
    isOpen && entityId ? ['tx-history', entityId] : null,
    () => publicTreasuryTransactionHistory(undefined, entityId!)
  );

  const transactions = (response as any)?.data?.transactions || [];

  const formatDate = (timestampMs: number) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(timestampMs));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-w-[95vw] max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-md">
        <DialogHeader className="px-6 py-5 pb-4 pr-12 border-b border-border/50 sticky top-0 z-10 bg-inherit min-h-fit">
          <DialogTitle className="text-xl flex items-center gap-2">
            Bitcoin Holdings History
          </DialogTitle>
          <DialogDescription>
            Known wallet transactions for {entityName || entityId}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto w-full px-6 py-4">
          {isLoading && (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          
          {error && !isLoading && (
            <div className="p-6 text-center text-red-500 bg-red-500/10 rounded-lg mx-6 my-4">
              Failed to load transaction history.
            </div>
          )}

          {!isLoading && !error && transactions.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              No public transactions found.
            </div>
          )}

          {!isLoading && !error && transactions.length > 0 && (
            <div className="relative pl-4 pb-6 mt-2">
              {/* Timeline spine */}
              <div className="absolute top-2 bottom-0 left-[23.5px] w-[2px] bg-gradient-to-b from-border/80 via-border/40 to-transparent rounded-full"></div>
              
              <div className="space-y-8">
                {transactions.map((tx: any, i: number) => {
                  const isBuy = tx.type === 'buy';
                  const btcAmount = Math.abs(tx.holding_net_change);
                  
                  return (
                    <div key={`${tx.date}-${i}`} className="relative pl-10 pr-2 group">
                      {/* Timeline Dot */}
                      <div className={`absolute left-[19px] top-1 w-[11px] h-[11px] rounded-full ring-4 ring-background z-10 shadow-sm transition-transform duration-300 group-hover:scale-125 ${
                        isBuy ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-red-500 shadow-red-500/20'
                      }`} />
                      
                      <div className="flex flex-col">
                        <div className="flex items-start justify-between">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold tracking-tight text-slate-200">
                                {tx.date ? formatDate(tx.date) : 'Unknown Date'}
                              </span>
                              <span className={`flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-sm ${
                                isBuy ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}>
                                {isBuy ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                                {tx.type}
                              </span>
                            </div>
                            
                            {tx.holding_balance > 0 && (
                              <div className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-semibold flex items-center gap-1">
                                Balance: <span className="text-slate-400">{tx.holding_balance.toLocaleString()} ₿</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-end">
                            <div className={`font-bold tabular-nums text-base tracking-tight ${isBuy ? 'text-emerald-400' : 'text-slate-200'}`}>
                              {isBuy ? '+' : '-'}{btcAmount.toLocaleString()} ₿
                            </div>
                            {tx.transaction_value_usd > 0 && (
                              <div className="text-xs text-muted-foreground/70 font-medium tabular-nums mt-0.5">
                                ${tx.transaction_value_usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                              </div>
                            )}
                          </div>
                        </div>

                        {tx.source_url && (
                          <div className="w-full mt-1.5">
                            <TransactionNewsCard url={tx.source_url} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
