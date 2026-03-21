'use client';

import React, { useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { useAdoptionLeaderboard } from '@/lib/api/adoption';
import { UiAdoptionLeaderboardItem } from '@/lib/types/ui-models';
import { Card } from '@/components/ui/card';
import { scaleLinear } from 'd3-scale';

const geoUrl = 'https://unpkg.com/world-atlas@2.0.2/countries-110m.json';

// Normalize names to improve map matching with Coingecko data
const normalizeCountryName = (name: string) => {
  if (!name) return '';
  const n = name.toLowerCase().replace(/\s+/g, '');
  if (n === 'unitedstatesofamerica') return 'unitedstates';
  if (n === 'unitedkingdom') return 'uk';
  if (n === 'russianfederation') return 'russia';
  if (n === 'elsalvador') return 'elsalvador';
  return n;
};

export function GlobalAdoptionMap() {
  const { data: leaderboard, isLoading } = useAdoptionLeaderboard();
  const [hoveredData, setHoveredData] = useState<{ geoName: string, item: UiAdoptionLeaderboardItem | null } | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (hoveredData) {
      setTooltipPos({ x: e.clientX, y: e.clientY });
    }
  };

  const mapData = useMemo(() => {
    if (!leaderboard) return new Map<string, UiAdoptionLeaderboardItem>();
    
    const map = new Map<string, UiAdoptionLeaderboardItem>();
    leaderboard.forEach(item => {
      map.set(normalizeCountryName(item.name), item);
      map.set(item.countryCode.toLowerCase(), item);
    });
    return map;
  }, [leaderboard]);

  const maxReservesPct = useMemo(() => {
    if (!leaderboard) return 0;
    return Math.max(...leaderboard.map(d => d.reserveAllocationReservesPercent || 0));
  }, [leaderboard]);

  // Gradient from green (low) to red (high)
  const colorScale = useMemo(() => {
    return scaleLinear<string>()
      .domain([0, maxReservesPct > 0 ? maxReservesPct : 1])
      .range(["#22c55e", "#ef4444"]);
  }, [maxReservesPct]);

  if (isLoading) {
    return <div className="h-full w-full min-h-[400px] flex items-center justify-center bg-slate-900/50 rounded-xl animate-pulse">Loading map...</div>;
  }

  return (
    <div 
      className="relative w-full h-full bg-slate-950 rounded-xl overflow-hidden group"
      onMouseMove={handleMouseMove}
    >
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-500/80">Adoption Heatmap</h2>
      </div>

      <ComposableMap projectionConfig={{ scale: 130 }} className="w-full h-full">
        <ZoomableGroup center={[0, 0]} zoom={1}>
          <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const geoName = geo.properties.name;
              const normalizedGeoName = normalizeCountryName(geoName);
              const item = mapData.get(normalizedGeoName);
              
              const hasData = item && item.totalHoldingsBtc > 0;
              let fillColor = undefined;
              
              if (hasData) {
                fillColor = colorScale(item.reserveAllocationReservesPercent);
              }

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fillColor}
                  stroke="#cbd5e1"
                  className={`${hasData ? '' : 'fill-[#e2e8f0] dark:fill-slate-800 hover:fill-slate-300 dark:hover:fill-slate-700'} dark:stroke-slate-700 outline-none transition-colors duration-300`}
                  style={{
                    default: { outline: "none", ...(hasData ? { fill: fillColor } : {}) },
                    hover: { outline: "none", ...(hasData ? { fill: fillColor, filter: "brightness(1.1)" } : {}) },
                    pressed: { outline: "none", ...(hasData ? { fill: fillColor } : {}) },
                  }}
                  onMouseEnter={(e) => {
                    if (hasData) {
                      setHoveredData({ geoName, item: item || null });
                      setTooltipPos({ x: e.clientX, y: e.clientY });
                    } else {
                      setHoveredData(null);
                    }
                  }}
                  onMouseLeave={() => setHoveredData(null)}
                />
              )
            })
          }
        </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {hoveredData?.item && (
        <Card 
          className="fixed z-50 p-4 shadow-xl pointer-events-none min-w-[280px] border-amber-500/30 bg-slate-950/95 backdrop-blur-sm animate-in fade-in duration-200"
          style={{ left: tooltipPos.x + 15, top: tooltipPos.y + 15 }}
        >
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <h3 className="font-bold text-lg leading-none text-slate-100">{hoveredData.item.name}</h3>
            {hoveredData.item.countryCode && (
               <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded uppercase">
                 {hoveredData.item.countryCode}
               </span>
            )}
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center gap-4">
              <span className="text-muted-foreground">Holdings</span>
              <span className="font-medium text-slate-200">
                {hoveredData.item.totalHoldingsBtc.toLocaleString()} <span className="text-amber-500 text-xs">BTC</span>
              </span>
            </div>
            
            <div className="flex justify-between items-center gap-4">
              <span className="text-muted-foreground">Value (USD)</span>
              <span className="font-medium text-slate-200">
                ${hoveredData.item.totalValueUsd >= 1e9 
                   ? (hoveredData.item.totalValueUsd / 1e9).toFixed(2) + 'B'
                   : hoveredData.item.totalValueUsd >= 1e6
                   ? (hoveredData.item.totalValueUsd / 1e6).toFixed(2) + 'M'
                   : hoveredData.item.totalValueUsd.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center gap-4">
              <span className="text-muted-foreground">Entry Value</span>
              <span className="font-medium text-slate-200">
               {hoveredData.item.isComputingEntryPrice ? (
                 <span className="animate-pulse text-amber-500/70">Computing...</span>
               ) : (
                 (hoveredData.item.totalEntryValueUsd ?? 0) > 0 ? (
                   `$${(hoveredData.item.totalEntryValueUsd ?? 0) >= 1e9 
                     ? ((hoveredData.item.totalEntryValueUsd ?? 0) / 1e9).toFixed(2) + 'B'
                     : (hoveredData.item.totalEntryValueUsd ?? 0) >= 1e6
                     ? ((hoveredData.item.totalEntryValueUsd ?? 0) / 1e6).toFixed(2) + 'M'
                     : (hoveredData.item.totalEntryValueUsd ?? 0).toLocaleString()}`
                 ) : 'N/A'
               )}
              </span>
            </div>

            <div className="flex justify-between items-center gap-4">
              <span className="text-muted-foreground">% of GDP</span>
              <span className="font-medium text-slate-200">
                {hoveredData.item.reserveAllocationGdpPercent > 0 
                  ? `${hoveredData.item.reserveAllocationGdpPercent.toFixed(4)}%` 
                  : 'N/A'}
              </span>
            </div>

            <div className="flex justify-between items-center gap-4">
              <span className="text-muted-foreground">% of Reserves</span>
              <span className="font-medium" style={{ color: hoveredData.item.reserveAllocationReservesPercent > 0 ? "#22c55e" : "" }}>
                {hoveredData.item.reserveAllocationReservesPercent > 0 
                  ? `${(hoveredData.item.reserveAllocationReservesPercent).toFixed(4)}%` 
                  : 'N/A'}
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
