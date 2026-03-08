'use client';

import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { useGlobalAdoptionMap } from '@/lib/api/adoption';
import { UiMapMarker } from '@/lib/types/ui-models';
import { Card } from '@/components/ui/card';

const geoUrl = 'https://unpkg.com/world-atlas@2.0.2/countries-110m.json';

export function GlobalAdoptionMap() {
  const { data: markers, isLoading } = useGlobalAdoptionMap();
  const [hoveredMarker, setHoveredMarker] = useState<UiMapMarker | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (hoveredMarker) {
      setTooltipPos({ x: e.clientX, y: e.clientY });
    }
  };

  if (isLoading) {
    return <div className="h-full w-full min-h-[400px] flex items-center justify-center bg-slate-900/50 rounded-xl animate-pulse">Loading map...</div>;
  }

  return (
    <div 
      className="relative w-full h-full bg-slate-950 rounded-xl overflow-hidden group"
      onMouseMove={handleMouseMove}
    >
      <ComposableMap projectionConfig={{ scale: 130 }} className="w-full h-full">
        <ZoomableGroup center={[0, 0]} zoom={1}>
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
                onMouseEnter={(e) => {
                  setHoveredMarker(marker);
                  setTooltipPos({ x: e.clientX, y: e.clientY });
                }}
                onMouseLeave={() => setHoveredMarker(null)}
                onClick={() => console.log('Open drilldown modal for:', marker.id)}
                className="cursor-pointer group/marker"
            >
              <circle 
                r={marker.totalHoldingsBtc > 100000 ? 12 : marker.totalHoldingsBtc > 10000 ? 8 : 5} 
                fill="#f59e0b" // amber-500
                className="opacity-90 stroke-slate-950 stroke-[2px] transition-colors group-hover/marker:fill-amber-300 group-hover/marker:stroke-amber-500" 
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
        </ZoomableGroup>
      </ComposableMap>

      {hoveredMarker && (
        <Card 
          className="fixed z-50 p-4 shadow-xl pointer-events-none min-w-[220px] border-amber-500/40 bg-slate-950/95 backdrop-blur-sm animate-in fade-in duration-200"
          style={{ left: tooltipPos.x + 15, top: tooltipPos.y + 15 }}
        >
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
