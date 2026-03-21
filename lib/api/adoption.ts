import { useEntitiesList } from '@/sdk/coingecko/public-treasury/public-treasury';
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
  const { data: response, isLoading } = useEntitiesList({ entity_type: 'government' });
  const entities = response?.data || [];

  const leaderboard: UiAdoptionLeaderboardItem[] = entities
    .filter((e): e is EntitiesListItem & { id: string } => !!e.id)
    .map((entity) => {
      return {
        id: entity.id,
        name: entity.name || 'Unknown',
        countryCode: entity.country || 'US',
        totalHoldingsBtc: 0, 
        totalValueUsd: 0,
        reserveAllocationGdpPercent: 0,
        policyStatus: 'Neutral',
      };
    });

  return { data: response ? leaderboard : undefined, isLoading };
}
