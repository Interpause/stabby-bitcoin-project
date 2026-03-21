import { useEffect, useState, useMemo } from 'react';
import { useEntitiesList, useCompaniesPublicTreasury, publicTreasuryTransactionHistory } from '@/sdk/coingecko/public-treasury/public-treasury';
import { coinsIdHistory } from '@/sdk/coingecko/coins/coins';
import type { EntitiesListItem } from '@/sdk/coingecko/model';
import { UiMapMarker, UiAdoptionLeaderboardItem } from '../types/ui-models';

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

    const backfill = async () => {
      const newComputedPrices = { ...computedPrices };
      let changed = false;

      for (const entity of entities) {
        const entityId = entity.name?.toLowerCase().replace(/\s+/g, '-') || 'unknown';
        
        // Only backfill if we have holdings and no entry value from main API
        if (entity.total_holdings > 0 && (!entity.total_entry_value_usd || entity.total_entry_value_usd === 0) && !computedPrices[entityId]) {
          try {
            console.log(`[Backfill] Computing entry price for ${entityId}...`);
            const txResponse = await publicTreasuryTransactionHistory(undefined, entityId);
            const transactions = (txResponse as any)?.data?.transactions || [];
            const buys = transactions.filter((t: any) => t.type === 'buy');

            let totalBuyUsd = 0;
            let totalBuyBtc = 0;

            for (const t of buys) {
              let valUsd = t.transaction_value_usd || 0;
              const btc = t.holding_net_change || 0;

              // Deep Fallback: fetch historical price if value is 0
              if (valUsd === 0 && btc > 0 && t.date) {
                try {
                  const dateStr = formatCgDate(t.date);
                  const histResponse = await coinsIdHistory({ date: dateStr }, 'bitcoin');
                  const histPrice = (histResponse as any)?.data?.market_data?.current_price?.usd || 0;
                  valUsd = histPrice * btc;
                } catch (e) {
                  console.error(`[Backfill] Failed to fetch historical price for ${entityId} on ${t.date}`, e);
                }
              }

              totalBuyUsd += valUsd;
              totalBuyBtc += btc;
            }

            if (totalBuyBtc > 0) {
              newComputedPrices[entityId] = totalBuyUsd / totalBuyBtc;
              changed = true;
            }
          } catch (e) {
            console.error(`[Backfill] Failed to fetch tx history for ${entityId}`, e);
          }
        }
      }

      if (changed) {
        setComputedPrices(newComputedPrices);
      }
    };

    backfill();
  }, [entities, computedPrices]);

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
    };
  }), [entities, gdpData, reservesData, computedPrices]);

  return { data: response && gdpData && reservesData ? leaderboard : undefined, isLoading: isLoading || !gdpData || !reservesData };
}
