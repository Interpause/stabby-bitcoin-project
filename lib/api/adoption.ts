import { useEffect, useState } from 'react';
import { useEntitiesList, useCompaniesPublicTreasury } from '@/sdk/coingecko/public-treasury/public-treasury';
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

  useEffect(() => {
    Promise.all([
      fetch('/data/gdp.json').then(r => r.json()),
      fetch('/data/reserves.json').then(r => r.json())
    ]).then(([gdp, reserves]) => {
      setGdpData(gdp);
      setReservesData(reserves);
    }).catch(console.error);
  }, []);

  const entities: any[] = (response?.data as any)?.companies || (response?.data as any)?.governments || [];

  const leaderboard: UiAdoptionLeaderboardItem[] = entities.map((entity: any) => {
    const btc = entity.total_holdings || 0;
    const usd = entity.total_current_value_usd || 0;
    const countryCode = entity.country || 'US';
    
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

    return {
      id: entity.name?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
      name: entity.name || 'Unknown',
      countryCode: countryCode,
      totalHoldingsBtc: btc, 
      totalValueUsd: usd,
      reserveAllocationGdpPercent: gdpPct,
      totalGdpUsd: gdp,
      reserveAllocationReservesPercent: reservePct,
      totalReservesUsd: reserve,
      policyStatus: 'Neutral',
    };
  });

  return { data: response && gdpData && reservesData ? leaderboard : undefined, isLoading: isLoading || !gdpData || !reservesData };
}
