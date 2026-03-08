'use client';

import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { useGlobalAdoptionMap } from '@/lib/api/adoption';
import { UiMapMarker } from '@/lib/types/ui-models';
import { Card } from '@/components/ui/card';

const geoUrl = 'https://unpkg.com/world-atlas@2.0.2/countries-110m.json';

export function GlobalAdoptionMap() {
  const { data: markers, isLoading } = useGlobalAdoptionMap();
  const [hoveredMarker, setHoveredMarker] = useState<UiMapMarker | null>(null);

  if (isLoading) {
    return <div className="h-[500px] w-full flex items-center justify-center bg-muted/20 rounded-xl animate-pulse">Loading map...</div>;
  }

  return (
    <div className="relative w-full aspect-[2/1] min-h-[400px] bg-sky-50 dark:bg-slate-900 rounded-xl overflow-hidden border shadow-sm group">
      <ComposableMap projectionConfig={{ scale: 147 }} className="w-full h-full object-cover">
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#e2e8f0"
                stroke="#cbd5e1"
                className="dark:fill-slate-800 dark:stroke-slate-700 outline-none hover:fill-slate-300 dark:hover:fill-slate-700 transition-colors"
                style={{
                  default: { outline: "none" },
                  hover: { outline: "none" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>
        
        {markers?.map((marker) => (
          <Marker key={marker.id} coordinates={[marker.lng, marker.lat]}>
            <g 
                onMouseEnter={() => setHoveredMarker(marker)}
                onMouseLeave={() => setHoveredMarker(null)}
                onClick={() => console.log('Open drilldown modal for:', marker.id)}
                className="cursor-pointer transition-all hover:scale-150 origin-center"
            >
              <circle 
                r={marker.totalHoldingsBtc > 100000 ? 12 : marker.totalHoldingsBtc > 10000 ? 8 : 5} 
                fill="#f59e0b" // amber-500
                className="opacity-90 stroke-white dark:stroke-slate-900 stroke-[1.5px] hover:stroke-amber-200" 
              />
              <circle 
                r={marker.totalHoldingsBtc > 100000 ? 20 : marker.totalHoldingsBtc > 10000 ? 14 : 9} 
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.5"
                className="animate-ping opacity-75"
              />
            </g>
          </Marker>
        ))}
      </ComposableMap>

      {hoveredMarker && (
        <Card className="absolute bottom-6 left-6 p-4 shadow-xl pointer-events-none min-w-[220px] border-amber-500/40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg leading-none">{hoveredMarker.name}</h3>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground font-medium">{hoveredMarker.policyStatus}</p>
          <div className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {hoveredMarker.totalHoldingsBtc.toLocaleString()} <span className="text-sm font-semibold text-amber-500">BTC</span>
          </div>
        </Card>
      )}
    </div>
  );
}
