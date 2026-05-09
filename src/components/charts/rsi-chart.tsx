"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  type IChartApi,
  type Time,
} from "lightweight-charts";
import { useTheme } from "next-themes";

export interface RSIData {
  time: string | number;
  value: number;
}

interface RSIChartProps {
  data: RSIData[];
  height?: number;
  overboughtLevel?: number;
  oversoldLevel?: number;
}

export function RSIChart({
  data,
  height = 150,
  overboughtLevel = 70,
  oversoldLevel = 30,
}: RSIChartProps) {
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
      rsi: "#8b5cf6",
      overbought: "rgba(239, 68, 68, 0.3)",
      oversold: "rgba(34, 197, 94, 0.3)",
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
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: colors.grid,
        visible: true,
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
    });

    chartRef.current = chart;

    // RSI line series
    const rsiSeries = chart.addLineSeries({
      color: colors.rsi,
      lineWidth: 2,
      title: "RSI",
    });

    const formattedData = data.map((d) => ({
      time: d.time as Time,
      value: d.value,
    }));

    rsiSeries.setData(formattedData);

    // Add overbought/oversold lines
    const overboughtLine = chart.addLineSeries({
      color: "rgba(239, 68, 68, 0.5)",
      lineWidth: 1,
      lineStyle: 2, // Dashed
      crosshairMarkerVisible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    const oversoldLine = chart.addLineSeries({
      color: "rgba(34, 197, 94, 0.5)",
      lineWidth: 1,
      lineStyle: 2,
      crosshairMarkerVisible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    const middleLine = chart.addLineSeries({
      color: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
      lineWidth: 1,
      lineStyle: 2,
      crosshairMarkerVisible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    // Create horizontal lines for levels
    if (data.length > 0) {
      const times = data.map((d) => d.time as Time);
      overboughtLine.setData(times.map((t) => ({ time: t, value: overboughtLevel })));
      oversoldLine.setData(times.map((t) => ({ time: t, value: oversoldLevel })));
      middleLine.setData(times.map((t) => ({ time: t, value: 50 })));
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
  }, [data, height, overboughtLevel, oversoldLevel, theme, mounted]);

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
      <div className="text-xs text-muted-foreground mb-1 px-1">RSI (14)</div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}

export default RSIChart;
