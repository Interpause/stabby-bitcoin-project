import { useEntitiesList } from '@/sdk/coingecko/public-treasury/public-treasury';
import type { EntitiesListItem } from '@/sdk/coingecko/model';
import { UiMapMarker, UiAdoptionLeaderboardItem } from '../types/ui-models';
import { missingDataMock } from '../mock/missing-data';

export function useGlobalAdoptionMap(): { data: UiMapMarker[] | undefined; isLoading: boolean } {
  const { data: response, isLoading } = useEntitiesList({ entity_type: 'government' });
  const entities = response?.data || [];
  
  const mapMarkers: UiMapMarker[] = entities
    .filter((e): e is EntitiesListItem & { id: string } => !!e.id)
    .map((entity) => {
      const customData = missingDataMock[entity.id] || missingDataMock['unknown'];
      
      return {
        id: entity.id,
        name: entity.name || 'Unknown',
        lat: customData.lat,
        lng: customData.lng,
        policyStatus: customData.policyStatus,
        totalHoldingsBtc: customData.btcHoldings, 
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
      const customData = missingDataMock[entity.id] || missingDataMock['unknown'];
      
      // Calculate Reserve % of GDP if applicable
      const reservePercent = customData.gdpUsd > 0 
          ? (customData.totalValueUsd / customData.gdpUsd) * 100 
          : 0;

      return {
        id: entity.id,
        name: entity.name || 'Unknown',
        countryCode: entity.country || 'US',
        totalHoldingsBtc: customData.btcHoldings, 
        totalValueUsd: customData.totalValueUsd,
        reserveAllocationGdpPercent: reservePercent,
        policyStatus: customData.policyStatus,
      };
    });

  return { data: response ? leaderboard : undefined, isLoading };
}
