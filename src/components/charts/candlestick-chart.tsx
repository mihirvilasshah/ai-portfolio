"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type HistogramData,
  type Time,
} from "lightweight-charts";
import { useTheme } from "next-themes";

export interface OHLCVData {
  time: string | number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CandlestickChartProps {
  data: OHLCVData[];
  height?: number;
  showVolume?: boolean;
  showMA?: boolean;
  maPeriods?: number[];
  onCrosshairMove?: (data: { time: Time; price: number } | null) => void;
}

const MA_COLORS = ["#2962FF", "#FF6D00", "#00C853"];

export function CandlestickChart({
  data,
  height = 400,
  showVolume = true,
  showMA = true,
  maPeriods = [20, 50],
  onCrosshairMove,
}: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const maSeriesRef = useRef<ISeriesApi<"Line">[]>([]);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current || !mounted) return;

    const isDark = theme === "dark";

    // Chart colors
    const colors = {
      background: isDark ? "#0a0a0a" : "#ffffff",
      text: isDark ? "#d4d4d4" : "#171717",
      grid: isDark ? "#262626" : "#e5e5e5",
      upColor: "#22c55e",
      downColor: "#ef4444",
      volumeUp: "rgba(34, 197, 94, 0.5)",
      volumeDown: "rgba(239, 68, 68, 0.5)",
    };

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: colors.background },
        textColor: colors.text,
      },
      grid: {
        vertLines: { color: colors.grid },
        horzLines: { color: colors.grid },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: colors.grid,
      },
      timeScale: {
        borderColor: colors.grid,
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
    });

    chartRef.current = chart;

    // Add candlestick series
    const candleSeries = chart.addCandlestickSeries({
      upColor: colors.upColor,
      downColor: colors.downColor,
      borderUpColor: colors.upColor,
      borderDownColor: colors.downColor,
      wickUpColor: colors.upColor,
      wickDownColor: colors.downColor,
    });

    candleSeriesRef.current = candleSeries;

    // Format data for candlestick
    const candleData: CandlestickData[] = data.map((d) => ({
      time: d.time as Time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    candleSeries.setData(candleData);

    // Add volume series if enabled
    if (showVolume) {
      const volumeSeries = chart.addHistogramSeries({
        color: colors.volumeUp,
        priceFormat: {
          type: "volume",
        },
        priceScaleId: "",
      });

      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      const volumeData: HistogramData[] = data.map((d) => ({
        time: d.time as Time,
        value: d.volume,
        color: d.close >= d.open ? colors.volumeUp : colors.volumeDown,
      }));

      volumeSeries.setData(volumeData);
      volumeSeriesRef.current = volumeSeries;
    }

    // Add moving averages if enabled
    if (showMA && maPeriods.length > 0) {
      maSeriesRef.current = [];

      maPeriods.forEach((period, index) => {
        const maSeries = chart.addLineSeries({
          color: MA_COLORS[index % MA_COLORS.length],
          lineWidth: 1,
          title: `MA${period}`,
        });

        // Calculate MA
        const maData = calculateMA(data, period);
        maSeries.setData(maData);

        maSeriesRef.current.push(maSeries);
      });
    }

    // Crosshair move callback
    if (onCrosshairMove) {
      chart.subscribeCrosshairMove((param) => {
        if (!param.time || !param.point) {
          onCrosshairMove(null);
          return;
        }

        const price = param.seriesData.get(candleSeries);
        if (price && "close" in price) {
          onCrosshairMove({
            time: param.time,
            price: price.close,
          });
        }
      });
    }

    // Fit content
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data, height, showVolume, showMA, maPeriods, theme, mounted, onCrosshairMove]);

  // Update theme
  useEffect(() => {
    if (!chartRef.current || !mounted) return;

    const isDark = theme === "dark";

    chartRef.current.applyOptions({
      layout: {
        background: {
          type: ColorType.Solid,
          color: isDark ? "#0a0a0a" : "#ffffff",
        },
        textColor: isDark ? "#d4d4d4" : "#171717",
      },
      grid: {
        vertLines: { color: isDark ? "#262626" : "#e5e5e5" },
        horzLines: { color: isDark ? "#262626" : "#e5e5e5" },
      },
    });
  }, [theme, mounted]);

  if (!mounted) {
    return (
      <div
        className="animate-pulse bg-muted rounded-lg"
        style={{ height: `${height}px` }}
      />
    );
  }

  return <div ref={chartContainerRef} className="w-full" />;
}

/**
 * Calculate simple moving average
 */
function calculateMA(
  data: OHLCVData[],
  period: number
): Array<{ time: Time; value: number }> {
  const result: Array<{ time: Time; value: number }> = [];

  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j]!.close;
    }
    result.push({
      time: data[i]!.time as Time,
      value: sum / period,
    });
  }

  return result;
}

export default CandlestickChart;
