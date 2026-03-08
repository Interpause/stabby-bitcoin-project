import { PolicyStatus } from '../types/ui-models';

// This file strictly simulates data that is currently missing from our real APIs.
// When we find real APIs for GDP and geographic coordinates, we will replace this entirely
// with actual endpoints.

export interface MissingEntityData {
  lat: number;
  lng: number;
  policyStatus: PolicyStatus;
  gdpUsd: number;
  btcHoldings: number;
  totalValueUsd: number;
}

export const missingDataMock: Record<string, MissingEntityData> = {
  'el-salvador': {
    lat: 13.7942,
    lng: -88.8965,
    policyStatus: 'Legal Tender',
    gdpUsd: 32000000000,
    btcHoldings: 5748,
    totalValueUsd: 500000000,
  },
  'bhutan': {
    lat: 27.5142,
    lng: 90.4336,
    policyStatus: 'Strategic Reserve',
    gdpUsd: 2500000000,
    btcHoldings: 12500,
    totalValueUsd: 1100000000,
  },
  'microstrategy': {
    lat: 38.9248, // Tysons Corner, VA
    lng: -77.2268,
    policyStatus: 'Invested',
    gdpUsd: 0, // Since it's a company
    btcHoldings: 214400,
    totalValueUsd: 19000000000,
  },
  'unknown': {
    lat: 0,
    lng: 0,
    policyStatus: 'Neutral',
    gdpUsd: 0,
    btcHoldings: 0,
    totalValueUsd: 0,
  }
};
