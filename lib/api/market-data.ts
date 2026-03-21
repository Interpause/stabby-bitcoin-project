import useSWR from 'swr';
import { useCoinsIdMarketChart } from '@/sdk/coingecko/coins/coins';

export type TimeRange = '1m' | '6m' | '1y';

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
});

const getFmpDates = (range: TimeRange) => {
  const toDate = new Date();
  const fromDate = new Date();
  
  if (range === '1m') {
    fromDate.setMonth(fromDate.getMonth() - 1);
  } else if (range === '6m') {
    fromDate.setMonth(fromDate.getMonth() - 6);
  } else if (range === '1y') {
    fromDate.setFullYear(fromDate.getFullYear() - 1);
  }

  const to = toDate.toISOString().split('T')[0];
  const from = fromDate.toISOString().split('T')[0];
  return { from, to };
};

export function useFmpHistoricalPrice(symbol: string, range: TimeRange) {
  const { from, to } = getFmpDates(range);
  const url = `/api/proxy/fmp/stable/historical-price-eod/full?symbol=${encodeURIComponent(symbol)}&from=${from}&to=${to}`;
  
  const { data, error, isLoading } = useSWR(url, fetcher);
  return { data, error, isLoading };
}

export function useFmpTreasuryRates(range: TimeRange) {
  const { from, to } = getFmpDates(range);
  const url = `/api/proxy/fmp/stable/treasury-rates?from=${from}&to=${to}`;
  
  const { data, error, isLoading } = useSWR(url, fetcher);
  return { data, error, isLoading };
}

export function useBitcoinMarketChart(range: TimeRange) {
  const days = range === '1m' ? '30' : range === '6m' ? '180' : '365';
  
  const { data, ...rest } = useCoinsIdMarketChart({
    vs_currency: 'usd',
    days,
    precision: 'full',
  }, 'bitcoin');

  // CoinGecko's market_chart returns { data: { prices: [ [timestamp, price], ... ] } }
  // depending on standard response envelope.
  return { data: data?.data?.prices, ...rest };
}
