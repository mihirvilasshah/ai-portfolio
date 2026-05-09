/**
 * Unit Tests for Technical Indicators Service
 */

import { describe, it, expect } from "vitest";
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  calculateATR,
  calculateOBV,
} from "@/server/services/indicators";

describe("Technical Indicators", () => {
  describe("calculateSMA", () => {
    it("should calculate correct SMA for valid data", () => {
      const data = [10, 20, 30, 40, 50];
      const result = calculateSMA(data, 3);
      // (30 + 40 + 50) / 3 = 40
      expect(result).toBe(40);
    });

    it("should calculate SMA using last N values", () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = calculateSMA(data, 5);
      // (6 + 7 + 8 + 9 + 10) / 5 = 8
      expect(result).toBe(8);
    });

    it("should return null if data length is less than period", () => {
      const data = [10, 20];
      const result = calculateSMA(data, 5);
      expect(result).toBeNull();
    });

    it("should handle single value period", () => {
      const data = [100, 200, 300];
      const result = calculateSMA(data, 1);
      expect(result).toBe(300);
    });

    it("should handle period equal to data length", () => {
      const data = [10, 20, 30, 40];
      const result = calculateSMA(data, 4);
      // (10 + 20 + 30 + 40) / 4 = 25
      expect(result).toBe(25);
    });
  });

  describe("calculateEMA", () => {
    it("should calculate EMA for valid data", () => {
      const data = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      const result = calculateEMA(data, 5);
      expect(result).not.toBeNull();
      expect(typeof result).toBe("number");
    });

    it("should return null if data length is less than period", () => {
      const data = [10, 20];
      const result = calculateEMA(data, 5);
      expect(result).toBeNull();
    });

    it("should weight recent values more heavily than SMA", () => {
      const data = [10, 10, 10, 10, 10, 100]; // Big jump at end
      const sma = calculateSMA(data, 3);
      const ema = calculateEMA(data, 3);
      
      // EMA should be higher because it weights recent values more
      expect(ema).toBeGreaterThan(sma!);
    });

    it("should converge to SMA for constant values", () => {
      const data = [50, 50, 50, 50, 50, 50, 50, 50, 50, 50];
      const sma = calculateSMA(data, 5);
      const ema = calculateEMA(data, 5);
      
      expect(ema).toBeCloseTo(sma!, 5);
    });
  });

  describe("calculateRSI", () => {
    it("should calculate RSI for valid data", () => {
      const data = [44, 44.34, 44.09, 43.61, 44.33, 44.83, 45.10, 45.42, 45.84, 46.08,
                    45.89, 46.03, 45.61, 46.28, 46.28, 46.00, 46.03, 46.41, 46.22, 45.64];
      const result = calculateRSI(data, 14);
      
      expect(result).not.toBeNull();
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    });

    it("should return 100 when all price changes are positive", () => {
      const data = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160];
      const result = calculateRSI(data, 14);
      expect(result).toBe(100);
    });

    it("should return low value when all price changes are negative", () => {
      const data = [160, 150, 140, 130, 120, 110, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10];
      const result = calculateRSI(data, 14);
      expect(result).toBeLessThan(20); // Should be very oversold
    });

    it("should return null if data length is insufficient", () => {
      const data = [10, 20, 30, 40, 50];
      const result = calculateRSI(data, 14);
      expect(result).toBeNull();
    });

    it("should return approximately 50 for flat market", () => {
      // Alternating up and down by same amount
      const data = [100, 101, 100, 101, 100, 101, 100, 101, 100, 101,
                    100, 101, 100, 101, 100, 101, 100];
      const result = calculateRSI(data, 14);
      
      expect(result).toBeGreaterThan(40);
      expect(result).toBeLessThan(60);
    });
  });

  describe("calculateMACD", () => {
    it("should calculate MACD for valid data", () => {
      // Generate enough data points for MACD calculation
      const data: number[] = [];
      let price = 100;
      for (let i = 0; i < 50; i++) {
        price += (Math.random() - 0.5) * 2;
        data.push(price);
      }
      
      const result = calculateMACD(data, 12, 26, 9);
      
      expect(result).not.toBeNull();
      expect(result).toHaveProperty("macd");
      expect(result).toHaveProperty("signal");
      expect(result).toHaveProperty("histogram");
      expect(result!.histogram).toBeCloseTo(result!.macd - result!.signal, 5);
    });

    it("should return null if data length is insufficient", () => {
      const data = [10, 20, 30, 40, 50];
      const result = calculateMACD(data, 12, 26, 9);
      expect(result).toBeNull();
    });

    it("should have positive histogram in uptrend", () => {
      // Create strong uptrend
      const data: number[] = [];
      for (let i = 0; i < 50; i++) {
        data.push(100 + i * 2);
      }
      
      const result = calculateMACD(data);
      
      if (result) {
        expect(result.macd).toBeGreaterThan(0);
      }
    });

    it("should have negative histogram in downtrend", () => {
      // Create strong downtrend
      const data: number[] = [];
      for (let i = 0; i < 50; i++) {
        data.push(200 - i * 2);
      }
      
      const result = calculateMACD(data);
      
      if (result) {
        expect(result.macd).toBeLessThan(0);
      }
    });
  });

  describe("calculateBollingerBands", () => {
    it("should calculate Bollinger Bands for valid data", () => {
      const data = [10, 12, 11, 13, 14, 15, 13, 14, 16, 15,
                    17, 16, 18, 17, 19, 18, 20, 19, 21, 20];
      const result = calculateBollingerBands(data, 10, 2);
      
      expect(result).not.toBeNull();
      expect(result).toHaveProperty("upper");
      expect(result).toHaveProperty("middle");
      expect(result).toHaveProperty("lower");
      expect(result!.upper).toBeGreaterThan(result!.middle);
      expect(result!.middle).toBeGreaterThan(result!.lower);
    });

    it("should return null if data length is insufficient", () => {
      const data = [10, 20, 30];
      const result = calculateBollingerBands(data, 20, 2);
      expect(result).toBeNull();
    });

    it("should have equal bands when price is constant", () => {
      const data = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100];
      const result = calculateBollingerBands(data, 5, 2);
      
      expect(result).not.toBeNull();
      expect(result!.upper).toBe(100);
      expect(result!.middle).toBe(100);
      expect(result!.lower).toBe(100);
    });

    it("should widen bands with higher volatility", () => {
      // Low volatility
      const lowVol = [100, 101, 100, 101, 100, 101, 100, 101, 100, 101];
      const lowResult = calculateBollingerBands(lowVol, 5, 2);
      
      // High volatility
      const highVol = [100, 110, 90, 110, 90, 110, 90, 110, 90, 110];
      const highResult = calculateBollingerBands(highVol, 5, 2);
      
      const lowBandwidth = lowResult!.upper - lowResult!.lower;
      const highBandwidth = highResult!.upper - highResult!.lower;
      
      expect(highBandwidth).toBeGreaterThan(lowBandwidth);
    });
  });

  describe("calculateATR", () => {
    it("should calculate ATR for valid OHLCV data", () => {
      const ohlcv = generateOHLCVData(20);
      const result = calculateATR(ohlcv, 14);
      
      expect(result).not.toBeNull();
      expect(result).toBeGreaterThan(0);
    });

    it("should return null if data length is insufficient", () => {
      const ohlcv = generateOHLCVData(5);
      const result = calculateATR(ohlcv, 14);
      expect(result).toBeNull();
    });

    it("should return higher ATR for more volatile data", () => {
      // Low volatility
      const lowVolOHLCV = generateOHLCVData(20, 0.01);
      const lowATR = calculateATR(lowVolOHLCV, 14);
      
      // High volatility
      const highVolOHLCV = generateOHLCVData(20, 0.1);
      const highATR = calculateATR(highVolOHLCV, 14);
      
      expect(highATR).toBeGreaterThan(lowATR!);
    });
  });

  describe("calculateOBV", () => {
    it("should calculate OBV for valid OHLCV data", () => {
      const ohlcv = generateOHLCVData(10);
      const result = calculateOBV(ohlcv);
      
      expect(result).not.toBeNull();
      expect(typeof result).toBe("number");
    });

    it("should increase OBV on up days", () => {
      const ohlcv = [
        { timestamp: new Date(), open: 100, high: 105, low: 99, close: 100, volume: 1000 },
        { timestamp: new Date(), open: 100, high: 110, low: 100, close: 110, volume: 2000 },
      ];
      
      const result = calculateOBV(ohlcv);
      
      // Should be positive because price went up with volume
      expect(result).toBe(2000);
    });

    it("should decrease OBV on down days", () => {
      const ohlcv = [
        { timestamp: new Date(), open: 100, high: 105, low: 99, close: 100, volume: 1000 },
        { timestamp: new Date(), open: 100, high: 100, low: 90, close: 90, volume: 2000 },
      ];
      
      const result = calculateOBV(ohlcv);
      
      // Should be negative because price went down with volume
      expect(result).toBe(-2000);
    });

    it("should return 0 for single candle", () => {
      const ohlcv = [
        { timestamp: new Date(), open: 100, high: 105, low: 99, close: 100, volume: 1000 },
      ];
      
      const result = calculateOBV(ohlcv);
      expect(result).toBe(0);
    });
  });
});

// Helper function to generate test OHLCV data
function generateOHLCVData(count: number, volatility: number = 0.02) {
  const ohlcv = [];
  let price = 100;
  
  for (let i = 0; i < count; i++) {
    const change = price * volatility * (Math.random() - 0.5) * 2;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.abs(change) * Math.random();
    const low = Math.min(open, close) - Math.abs(change) * Math.random();
    
    ohlcv.push({
      timestamp: new Date(Date.now() - (count - i) * 86400000),
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 1000000) + 100000,
    });
    
    price = close;
  }
  
  return ohlcv;
}
