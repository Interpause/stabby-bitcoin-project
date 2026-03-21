export type PolicyStatus = 'Legal Tender' | 'Strategic Reserve' | 'Banned' | 'Neutral' | 'Invested';

export interface UiMapMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  policyStatus: PolicyStatus;
  totalHoldingsBtc: number;
}

export interface UiAdoptionLeaderboardItem {
  id: string;
  name: string;
  countryCode: string;
  totalHoldingsBtc: number;
  totalEntryValueUsd?: number;
  totalValueUsd: number;
  reserveAllocationGdpPercent: number;
  totalGdpUsd: number;
  reserveAllocationReservesPercent: number;
  totalReservesUsd: number;
  policyStatus: PolicyStatus;
}
