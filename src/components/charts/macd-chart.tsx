"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  type IChartApi,
  type Time,
} from "lightweight-charts";
import { useTheme } from "next-themes";

export interface MACDData {
  time: string | number;
  macd: number;
  signal: number;
  histogram: number;
}

interface MACDChartProps {
  data: MACDData[];
  height?: number;
}

export function MACDChart({ data, height = 150 }: MACDChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current || !mounted) return;

    const isDark = theme === "dark";

    const colors = {
      background: isDark ? "#0a0a0a" : "#ffffff",
      text: isDark ? "#d4d4d4" : "#171717",
      grid: isDark ? "#262626" : "#e5e5e5",
      macd: "#2962FF",
      signal: "#FF6D00",
      histogramUp: "rgba(34, 197, 94, 0.7)",
      histogramDown: "rgba(239, 68, 68, 0.7)",
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: colors.background },
        textColor: colors.text,
      },
      grid: {
        vertLines: { color: colors.grid },
        horzLines: { color: colors.grid },
      },
      rightPriceScale: {
        borderColor: colors.grid,
      },
      timeScale: {
        borderColor: colors.grid,
        visible: true,
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
    });

    chartRef.current = chart;

    // Histogram series
    const histogramSeries = chart.addHistogramSeries({
      color: colors.histogramUp,
      priceFormat: {
        type: "price",
        precision: 4,
        minMove: 0.0001,
      },
    });

    const histogramData = data.map((d) => ({
      time: d.time as Time,
      value: d.histogram,
      color: d.histogram >= 0 ? colors.histogramUp : colors.histogramDown,
    }));

    histogramSeries.setData(histogramData);

    // MACD line
    const macdSeries = chart.addLineSeries({
      color: colors.macd,
      lineWidth: 2,
      title: "MACD",
    });

    macdSeries.setData(
      data.map((d) => ({
        time: d.time as Time,
        value: d.macd,
      }))
    );

    // Signal line
    const signalSeries = chart.addLineSeries({
      color: colors.signal,
      lineWidth: 2,
      title: "Signal",
    });

    signalSeries.setData(
      data.map((d) => ({
        time: d.time as Time,
        value: d.signal,
      }))
    );

    // Zero line
    const zeroLine = chart.addLineSeries({
      color: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
      lineWidth: 1,
      lineStyle: 2,
      crosshairMarkerVisible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    if (data.length > 0) {
      zeroLine.setData(
        data.map((d) => ({
          time: d.time as Time,
          value: 0,
        }))
      );
    }

    chart.timeScale().fitContent();

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
  }, [data, height, theme, mounted]);

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

  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1 px-1">
        MACD (12, 26, 9)
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}

export default MACDChart;
