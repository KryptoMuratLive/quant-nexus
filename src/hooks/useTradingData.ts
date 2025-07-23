import { useState, useEffect } from 'react';
import { TradingPair, Portfolio, Position, BotStatus, TechnicalIndicator, Trade, ChartData } from '@/types/trading';

// Simulated real-time data for demo
export const useTradingData = () => {
  const [currentPrice, setCurrentPrice] = useState(43250.67);
  const [tradingPairs, setTradingPairs] = useState<TradingPair[]>([
    { symbol: 'BTCUSDT', baseAsset: 'BTC', quoteAsset: 'USDT', price: 43250.67, change24h: 2.34, volume24h: 28756.23 },
    { symbol: 'ETHUSDT', baseAsset: 'ETH', quoteAsset: 'USDT', price: 2245.89, change24h: -1.12, volume24h: 156234.45 },
    { symbol: 'ADAUSDT', baseAsset: 'ADA', quoteAsset: 'USDT', price: 0.4567, change24h: 5.67, volume24h: 8934.12 },
  ]);

  const [portfolio] = useState<Portfolio>({
    totalBalance: 10000,
    availableBalance: 7500,
    inPositions: 2500,
    dailyPnL: 234.56,
    totalPnL: 1567.89,
  });

  const [positions, setPositions] = useState<Position[]>([
    {
      id: '1',
      symbol: 'BTCUSDT',
      type: 'LONG',
      size: 0.05,
      entryPrice: 42800,
      currentPrice: 43250.67,
      pnl: 22.54,
      pnlPercent: 1.05,
      stopLoss: 42000,
      takeProfit: 44000,
      timestamp: Date.now() - 3600000,
    },
    {
      id: '2',
      symbol: 'ETHUSDT',
      type: 'SHORT',
      size: 1.2,
      entryPrice: 2280,
      currentPrice: 2245.89,
      pnl: 40.93,
      pnlPercent: 1.79,
      stopLoss: 2350,
      takeProfit: 2200,
      timestamp: Date.now() - 7200000,
    },
  ]);

  const [botStatus] = useState<BotStatus>({
    isRunning: true,
    mode: 'DEMO',
    strategy: 'AI-Enhanced Scalping',
    totalTrades: 1247,
    winRate: 68.4,
    performance24h: 3.2,
  });

  const [indicators, setIndicators] = useState<TechnicalIndicator[]>([
    { name: 'RSI(14)', value: 67.3, signal: 'BUY', strength: 0.7 },
    { name: 'MACD', value: 125.67, signal: 'BUY', strength: 0.8 },
    { name: 'EMA(20)', value: 43180.23, signal: 'BUY', strength: 0.6 },
    { name: 'Bollinger Bands', value: 0.85, signal: 'NEUTRAL', strength: 0.5 },
    { name: 'Volume Profile', value: 1.23, signal: 'BUY', strength: 0.9 },
  ]);

  const [recentTrades, setRecentTrades] = useState<Trade[]>([
    {
      id: '1',
      timestamp: Date.now() - 300000,
      symbol: 'BTCUSDT',
      type: 'BUY',
      side: 'LONG',
      price: 43240.12,
      quantity: 0.025,
      pnl: 12.34,
      strategy: 'AI-Enhanced',
      confidence: 0.87,
    },
    {
      id: '2',
      timestamp: Date.now() - 600000,
      symbol: 'ETHUSDT',
      type: 'SELL',
      side: 'SHORT',
      price: 2255.67,
      quantity: 0.8,
      pnl: -8.45,
      strategy: 'Momentum',
      confidence: 0.72,
    },
  ]);

  const [chartData, setChartData] = useState<ChartData[]>([]);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      const priceChange = (Math.random() - 0.5) * 100;
      const newPrice = Math.max(40000, currentPrice + priceChange);
      setCurrentPrice(newPrice);

      // Update trading pairs
      setTradingPairs(prev => prev.map(pair => ({
        ...pair,
        price: pair.symbol === 'BTCUSDT' ? newPrice : pair.price + (Math.random() - 0.5) * 10,
      })));

      // Update positions
      setPositions(prev => prev.map(pos => ({
        ...pos,
        currentPrice: pos.symbol === 'BTCUSDT' ? newPrice : pos.currentPrice + (Math.random() - 0.5) * 10,
        pnl: pos.type === 'LONG' 
          ? (newPrice - pos.entryPrice) * pos.size
          : (pos.entryPrice - newPrice) * pos.size,
        pnlPercent: pos.type === 'LONG'
          ? ((newPrice - pos.entryPrice) / pos.entryPrice) * 100
          : ((pos.entryPrice - newPrice) / pos.entryPrice) * 100,
      })));

      // Update indicators
      setIndicators(prev => prev.map(ind => ({
        ...ind,
        value: ind.value + (Math.random() - 0.5) * 5,
        signal: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'BUY' : 'SELL') : ind.signal,
      })));

      // Add new chart data point
      setChartData(prev => {
        const newPoint: ChartData = {
          timestamp: Date.now(),
          open: prev.length > 0 ? prev[prev.length - 1].close : newPrice,
          high: newPrice + Math.random() * 50,
          low: newPrice - Math.random() * 50,
          close: newPrice,
          volume: Math.random() * 100,
        };
        return [...prev.slice(-100), newPoint]; // Keep last 100 points
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [currentPrice]);

  return {
    currentPrice,
    tradingPairs,
    portfolio,
    positions,
    botStatus,
    indicators,
    recentTrades,
    chartData,
  };
};