import { http, HttpResponse } from 'msw';
import {
  EntitiesListResponse,
  PublicTreasuryEntityResponse,
} from '@/sdk/coingecko/public-treasury/public-treasury.zod';

export const coingeckoHandlers = [
  http.get('*/entities/list', () => {
    // Meaningful mock data
    const mockData = [
      { id: 'el-salvador', name: 'El Salvador', symbol: 'BTC', country: 'SV' },
      { id: 'bhutan', name: 'Bhutan', symbol: 'BTC', country: 'BT' },
      { id: 'microstrategy', name: 'MicroStrategy', symbol: 'MSTR', country: 'US' },
    ];

    // Validate using Zod from Orval
    const validData = EntitiesListResponse.parse(mockData);
    return HttpResponse.json(validData);
  }),

  http.get('*/public_treasury/:entityId', ({ params }) => {
    const { entityId } = params;
    
    // Abstracted meaningful responses
    const responseData = {
      id: entityId,
      name: entityId === 'el-salvador' ? 'El Salvador' : 'Unknown',
      type: entityId === 'el-salvador' ? 'government' : 'company',
      symbol: 'BTC',
      country: 'SV',
      total_treasury_value_usd: 500000000,
      unrealized_pnl: 150000000,
      holdings: [
        {
          coin_id: 'bitcoin',
          amount: 5748,
          current_value_usd: 500000000,
          total_entry_value_usd: 350000000,
          average_entry_value_usd: 44000,
          unrealized_pnl: 150000000,
        }
      ]
    };

    // Validate using Zod from Orval
    const validData = PublicTreasuryEntityResponse.parse(responseData);
    return HttpResponse.json(validData);
  }),
];
