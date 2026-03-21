import { useEffect, useState, useMemo, useRef } from 'react';
import { useEntitiesList, useCompaniesPublicTreasury, publicTreasuryTransactionHistory } from '@/sdk/coingecko/public-treasury/public-treasury';
import { coinsIdHistory, useCoinsId } from '@/sdk/coingecko/coins/coins';
import type { EntitiesListItem } from '@/sdk/coingecko/model';
import { UiMapMarker, UiAdoptionLeaderboardItem } from '../types/ui-models';

let globalHistoryCutoffTimestamp = 0;

const withRetry = async <T>(fn: () => Promise<T>, retries = 5, initialDelay = 2000): Promise<T> => {
  let delay = initialDelay;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e: unknown) {
      if ((e as any)?.status === 429 && i < retries - 1) {
        console.warn(`[Client] 429 Rate limited. Retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
        delay = (delay * 2) + (Math.random() * 1000); // exponential + jitter
        continue;
      }
      throw e;
    }
  }
  throw new Error('Max retries reached');
};

export function useGlobalAdoptionMap(): { data: UiMapMarker[] | undefined; isLoading: boolean } {
  const { data: response, isLoading } = useEntitiesList({ entity_type: 'government' });
  const entities = response?.data || [];
  
  const mapMarkers: UiMapMarker[] = entities
    .filter((e): e is EntitiesListItem & { id: string } => !!e.id)
    .map((entity) => {
      return {
        id: entity.id,
        name: entity.name || 'Unknown',
        lat: 0, // Will be replaced by real data/geocoding soon
        lng: 0,
        policyStatus: 'Neutral',
        totalHoldingsBtc: 0, 
      };
    });

  return { data: response ? mapMarkers : undefined, isLoading };
}

export function useAdoptionLeaderboard(): { data: UiAdoptionLeaderboardItem[] | undefined; isLoading: boolean } {
  const { data: response, isLoading } = useCompaniesPublicTreasury('governments');
  const [gdpData, setGdpData] = useState<Record<string, number> | null>(null);
  const [reservesData, setReservesData] = useState<Record<string, number> | null>(null);
  const [computedPrices, setComputedPrices] = useState<Record<string, number>>({});
  const [computingStatus, setComputingStatus] = useState<Record<string, boolean>>({});
  const fetchingRef = useRef<Set<string>>(new Set());

  // Helper to format date for CoinGecko: dd-mm-yyyy
  const formatCgDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  useEffect(() => {
    Promise.all([
      fetch('/data/gdp.json').then(r => r.json()),
      fetch('/data/reserves.json').then(r => r.json())
    ]).then(([gdp, reserves]) => {
      setGdpData(gdp);
      setReservesData(reserves);
    }).catch(console.error);
  }, []);

  const entities = useMemo(() => {
    const raw = (response?.data as any)?.companies || (response?.data as any)?.governments || [];
    return raw as any[];
  }, [response]);

  // Async backfill effect
  useEffect(() => {
    if (!entities.length) return;

    for (const entity of entities) {
      const entityId = entity.name?.toLowerCase().replace(/\s+/g, '-') || 'unknown';
      
      // Only backfill if we have holdings, no entry value from main API, and haven't started yet
      if (entity.total_holdings > 0 && (!entity.total_entry_value_usd || entity.total_entry_value_usd === 0) && !fetchingRef.current.has(entityId)) {
        fetchingRef.current.add(entityId);
        setComputingStatus(prev => ({ ...prev, [entityId]: true }));
        
        // Fire and forget asynchronous loading
        (async () => {
          try {
            console.log(`[Backfill] Computing entry price for ${entityId}...`);
            const txResponse = await withRetry(() => publicTreasuryTransactionHistory(undefined, entityId));
            const transactions = (txResponse as any)?.data?.transactions || [];
            const buys = transactions.filter((t: any) => t.type === 'buy');

            let totalBuyUsd = 0;
            let totalBuyBtc = 0;

            // Fast pass: compute using transactions that already have valid USD values
            for (const t of buys) {
              const valUsd = t.transaction_value_usd || 0;
              const btc = t.holding_net_change || 0;
              if (valUsd > 0 && btc > 0) {
                totalBuyUsd += valUsd;
                totalBuyBtc += btc;
              }
            }

            // Immediately set a partial entry price estimate
            if (totalBuyBtc > 0) {
              const estimate = totalBuyUsd / totalBuyBtc;
              setComputedPrices(prev => ({ ...prev, [entityId]: estimate }));
            }

            // Deep Fallback pass: fetch missing historical prices point-in-time
            for (const t of buys) {
              let valUsd = t.transaction_value_usd || 0;
              const btc = t.holding_net_change || 0;

              if (valUsd === 0 && btc > 0 && t.date) {
                if (globalHistoryCutoffTimestamp && t.date <= globalHistoryCutoffTimestamp) {
                  console.log(`[Backfill] Skipping historical fetch for ${t.date} (before 401 cutoff)`);
                  continue;
                }

                try {
                  const dateStr = formatCgDate(t.date);
                  const histResponse = await withRetry(() => coinsIdHistory({ date: dateStr }, 'bitcoin'));
                  const histPrice = (histResponse as any)?.data?.market_data?.current_price?.usd || 0;
                  valUsd = histPrice * btc;

                  totalBuyUsd += valUsd;
                  totalBuyBtc += btc;
                  
                  // Update the estimate incrementally so the UI shows progress
                  const newEstimate = totalBuyUsd / totalBuyBtc;
                  setComputedPrices(prev => ({ ...prev, [entityId]: newEstimate }));
                } catch (e: unknown) {
                  if ((e as any)?.status === 401) {
                    console.warn(`[Backfill] 401 Unauthorized for ${t.date}. Updating global history cutoff.`);
                    globalHistoryCutoffTimestamp = Math.max(globalHistoryCutoffTimestamp, t.date);
                  } else {
                    console.error(`[Backfill] Failed to fetch historical price for ${entityId} on ${t.date}`, e);
                  }
                }
              }
            }
          } catch (e) {
            console.error(`[Backfill] Failed to fetch tx history for ${entityId}`, e);
          } finally {
            setComputingStatus(prev => ({ ...prev, [entityId]: false }));
          }
        })();
      }
    }
  }, [entities]);

  const leaderboard: UiAdoptionLeaderboardItem[] = useMemo(() => entities.map((entity: any) => {
    const btc = entity.total_holdings || 0;
    const usd = entity.total_current_value_usd || 0;
    const countryCode = entity.country || 'US';
    const entityId = entity.name?.toLowerCase().replace(/\s+/g, '-') || 'unknown';
    
    let gdp = 0;
    if (gdpData) {
      gdp = gdpData[countryCode] || gdpData[entity.name || ''] || 0;
    }
    const gdpPct = gdp ? (usd / gdp) * 100 : 0;

    let reserve = 0;
    if (reservesData) {
      reserve = reservesData[countryCode] || reservesData[entity.name || ''] || 0;
    }
    const reservePct = reserve ? (usd / reserve) * 100 : 0;

    // Determine the entry value. If the main API has it, use it. Otherwise use our computed cache.
    let entryValueUsd = entity.total_entry_value_usd || 0;
    if (entryValueUsd === 0 && computedPrices[entityId]) {
      entryValueUsd = computedPrices[entityId] * btc;
    }

    return {
      id: entityId,
      name: entity.name || 'Unknown',
      countryCode: countryCode,
      totalHoldingsBtc: btc, 
      totalEntryValueUsd: entryValueUsd,
      totalValueUsd: usd,
      reserveAllocationGdpPercent: gdpPct,
      totalGdpUsd: gdp,
      reserveAllocationReservesPercent: reservePct,
      totalReservesUsd: reserve,
      policyStatus: 'Neutral',
      isComputingEntryPrice: !!computingStatus[entityId],
    };
  }), [entities, gdpData, reservesData, computedPrices, computingStatus]);

  return { data: response && gdpData && reservesData ? leaderboard : undefined, isLoading: isLoading || !gdpData || !reservesData };
}

export function useGlobalStats() {
  const { data: btcData, isLoading: isBtcLoading } = useCoinsId({
    localization: false,
    tickers: false,
    community_data: false,
    developer_data: false,
  }, 'bitcoin');

  const { data: govT, isLoading: isGovLoading } = useCompaniesPublicTreasury('governments');
  const [reservesData, setReservesData] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    fetch('/data/reserves.json')
      .then(r => r.json())
      .then(d => setReservesData(d))
      .catch(console.error);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalHeldByGov = (govT as any)?.data?.total_value_usd || 0;
  
  const totalGovReserves = useMemo(() => {
    if (!reservesData) return 0;
    return Object.values(reservesData).reduce((a, b) => a + b, 0);
  }, [reservesData]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentPrice = (btcData as any)?.data?.market_data?.current_price?.usd || 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const marketCap = (btcData as any)?.data?.market_data?.market_cap?.usd || 0;

  return {
    totalHeldByGov,
    totalGovReserves,
    currentPrice,
    marketCap,
    isLoading: isBtcLoading || isGovLoading || !reservesData
  };
}
