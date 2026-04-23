"use client";

import { useMemo } from "react";
import { formatPrice, formatDate } from "@/lib/format";

interface PricePoint {
  date: Date;
  price: number;
}

interface PriceHistoryChartProps {
  data: PricePoint[];
  height?: number;
  showLabels?: boolean;
}

export function PriceHistoryChart({
  data,
  height = 200,
  showLabels = true,
}: PriceHistoryChartProps) {
  const chartData = useMemo(() => {
    if (data.length === 0) return null;

    // Sort by date ascending
    const sorted = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const prices = sorted.map((d) => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    // Chart dimensions
    const width = 100; // percentage
    const padding = { top: 20, right: 10, bottom: 30, left: 10 };
    const chartWidth = width;
    const chartHeight = height - padding.top - padding.bottom;

    // Calculate points
    const points = sorted.map((d, i) => {
      const x = (i / (sorted.length - 1 || 1)) * 100;
      const y =
        padding.top +
        chartHeight -
        ((d.price - minPrice) / priceRange) * chartHeight;
      return { x, y, ...d };
    });

    // Create SVG path
    const linePath = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");

    // Create area path
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${
      padding.top + chartHeight
    } L ${points[0].x} ${padding.top + chartHeight} Z`;

    return {
      points,
      linePath,
      areaPath,
      minPrice,
      maxPrice,
      padding,
      chartHeight,
    };
  }, [data, height]);

  if (!chartData || data.length < 2) {
    return (
      <div
        className="flex items-center justify-center bg-muted/50 rounded-lg"
        style={{ height }}
      >
        <p className="text-sm text-muted-foreground">
          Grafik için yeterli veri yok
        </p>
      </div>
    );
  }

  const { points, linePath, areaPath, minPrice, maxPrice, padding, chartHeight } =
    chartData;

  // Find lowest and highest points for highlighting
  const lowestPoint = points.reduce((min, p) =>
    p.price < min.price ? p : min
  );
  const highestPoint = points.reduce((max, p) =>
    p.price > max.price ? p : max
  );
  const currentPoint = points[points.length - 1];

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 100 ${height}`}
        className="w-full"
        style={{ height }}
        preserveAspectRatio="none"
      >
        {/* Grid lines */}
        <line
          x1="0"
          y1={padding.top}
          x2="100"
          y2={padding.top}
          stroke="currentColor"
          strokeOpacity="0.1"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1="0"
          y1={padding.top + chartHeight / 2}
          x2="100"
          y2={padding.top + chartHeight / 2}
          stroke="currentColor"
          strokeOpacity="0.1"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1="0"
          y1={padding.top + chartHeight}
          x2="100"
          y2={padding.top + chartHeight}
          stroke="currentColor"
          strokeOpacity="0.1"
          vectorEffect="non-scaling-stroke"
        />

        {/* Area fill */}
        <path
          d={areaPath}
          fill="url(#gradient)"
          opacity="0.3"
        />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {points.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="3"
            fill="hsl(var(--background))"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {/* Lowest point marker */}
        <circle
          cx={lowestPoint.x}
          cy={lowestPoint.y}
          r="5"
          fill="hsl(var(--chart-2))"
          stroke="hsl(var(--background))"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />

        {/* Current point marker */}
        <circle
          cx={currentPoint.x}
          cy={currentPoint.y}
          r="5"
          fill="hsl(var(--primary))"
          stroke="hsl(var(--background))"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Labels */}
      {showLabels && (
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{formatDate(points[0].date)}</span>
          <span>{formatDate(points[points.length - 1].date)}</span>
        </div>
      )}

      {/* Price labels */}
      <div className="flex justify-between mt-3 gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-2))]" />
          <div className="text-sm">
            <span className="text-muted-foreground">En Düşük: </span>
            <span className="font-semibold text-green-600">
              {formatPrice(minPrice)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[hsl(var(--primary))]" />
          <div className="text-sm">
            <span className="text-muted-foreground">Güncel: </span>
            <span className="font-semibold">{formatPrice(currentPoint.price)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-muted-foreground" />
          <div className="text-sm">
            <span className="text-muted-foreground">En Yüksek: </span>
            <span className="font-semibold text-red-600">
              {formatPrice(maxPrice)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
