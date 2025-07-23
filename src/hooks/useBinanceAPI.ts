import { useState, useEffect } from 'react';

export interface BinanceCredentials {
  apiKey: string;
  secretKey: string;
  isTestnet: boolean;
}

export interface BinanceTickerData {
  symbol: string;
  price: string;
  priceChange: string;
  priceChangePercent: string;
  volume: string;
}

export interface BinanceOrderBookData {
  symbol: string;
  bids: [string, string][];
  asks: [string, string][];
}

export const useBinanceAPI = () => {
  const [credentials, setCredentials] = useState<BinanceCredentials | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Load credentials from localStorage
    const saved = localStorage.getItem('binance_credentials');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCredentials(parsed);
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to load credentials:', error);
      }
    }
  }, []);

  const getBaseUrl = () => {
    return credentials?.isTestnet 
      ? 'https://testnet.binance.vision/api/v3'
      : 'https://api.binance.com/api/v3';
  };

  const fetchTickerData = async (symbol: string = 'BTCUSDT'): Promise<BinanceTickerData | null> => {
    if (!isConnected) return null;
    
    try {
      const response = await fetch(`${getBaseUrl()}/ticker/24hr?symbol=${symbol}`);
      if (!response.ok) throw new Error('Failed to fetch ticker data');
      return await response.json();
    } catch (error) {
      console.error('Error fetching ticker data:', error);
      return null;
    }
  };

  const fetchOrderBook = async (symbol: string = 'BTCUSDT', limit: number = 10): Promise<BinanceOrderBookData | null> => {
    if (!isConnected) return null;
    
    try {
      const response = await fetch(`${getBaseUrl()}/depth?symbol=${symbol}&limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch order book');
      const data = await response.json();
      return {
        symbol,
        bids: data.bids,
        asks: data.asks,
      };
    } catch (error) {
      console.error('Error fetching order book:', error);
      return null;
    }
  };

  const fetchKlineData = async (
    symbol: string = 'BTCUSDT', 
    interval: string = '1m', 
    limit: number = 100
  ) => {
    if (!isConnected) return null;
    
    try {
      const response = await fetch(
        `${getBaseUrl()}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
      );
      if (!response.ok) throw new Error('Failed to fetch kline data');
      const data = await response.json();
      
      return data.map((kline: any[]) => ({
        timestamp: kline[0],
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5]),
      }));
    } catch (error) {
      console.error('Error fetching kline data:', error);
      return null;
    }
  };

  // Calculate technical indicators
  const calculateRSI = (prices: number[], period: number = 14): number => {
    if (prices.length < period + 1) return 50;
    
    const gains: number[] = [];
    const losses: number[] = [];
    
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  };

  const calculateEMA = (prices: number[], period: number): number => {
    if (prices.length === 0) return 0;
    if (prices.length < period) return prices[prices.length - 1];
    
    const multiplier = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }
    
    return ema;
  };

  const generateTradingSignal = async (symbol: string = 'BTCUSDT') => {
    const klineData = await fetchKlineData(symbol, '5m', 50);
    if (!klineData) return null;
    
    const closePrices = klineData.map(k => k.close);
    const currentPrice = closePrices[closePrices.length - 1];
    
    // Calculate indicators
    const rsi = calculateRSI(closePrices);
    const ema20 = calculateEMA(closePrices, 20);
    const ema50 = calculateEMA(closePrices, 50);
    
    // Generate signal based on multiple indicators
    let signal: 'BUY' | 'SELL' | 'NEUTRAL' = 'NEUTRAL';
    let confidence = 0;
    let reasoning = [];
    
    // RSI Analysis
    if (rsi < 30) {
      signal = 'BUY';
      confidence += 0.3;
      reasoning.push('RSI oversold (<30)');
    } else if (rsi > 70) {
      signal = 'SELL';
      confidence += 0.3;
      reasoning.push('RSI overbought (>70)');
    }
    
    // EMA Crossover
    if (currentPrice > ema20 && ema20 > ema50) {
      if (signal === 'BUY' || signal === 'NEUTRAL') {
        signal = 'BUY';
        confidence += 0.4;
        reasoning.push('Price above EMA20 & EMA50 (bullish trend)');
      }
    } else if (currentPrice < ema20 && ema20 < ema50) {
      if (signal === 'SELL' || signal === 'NEUTRAL') {
        signal = 'SELL';
        confidence += 0.4;
        reasoning.push('Price below EMA20 & EMA50 (bearish trend)');
      }
    }
    
    // Volume analysis (simplified)
    const avgVolume = klineData.slice(-10).reduce((sum, k) => sum + k.volume, 0) / 10;
    const currentVolume = klineData[klineData.length - 1].volume;
    
    if (currentVolume > avgVolume * 1.5) {
      confidence += 0.2;
      reasoning.push('High volume confirmation');
    }
    
    confidence = Math.min(confidence, 1);
    
    return {
      symbol,
      signal,
      confidence: Math.round(confidence * 100),
      currentPrice,
      indicators: {
        rsi: Math.round(rsi * 100) / 100,
        ema20: Math.round(ema20 * 100) / 100,
        ema50: Math.round(ema50 * 100) / 100,
      },
      reasoning,
      timestamp: Date.now(),
    };
  };

  return {
    credentials,
    isConnected,
    setCredentials,
    setIsConnected,
    fetchTickerData,
    fetchOrderBook,
    fetchKlineData,
    generateTradingSignal,
  };
};