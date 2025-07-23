import { useState, useEffect } from 'react';
import { TradingPair, Portfolio, Position, BotStatus, TechnicalIndicator, Trade, ChartData } from '@/types/trading';
import { useBinanceAPI } from './useBinanceAPI';

// Enhanced hook with real Binance data
export const useTradingData = () => {
  const { isConnected, fetchTickerData, fetchKlineData } = useBinanceAPI();
  const [currentPrice, setCurrentPrice] = useState(120250.67); // Current BTC price around 120K
  const [tradingPairs, setTradingPairs] = useState<TradingPair[]>([
    { symbol: 'BTCUSDT', baseAsset: 'BTC', quoteAsset: 'USDT', price: 120250.67, change24h: 2.34, volume24h: 28756.23 },
    { symbol: 'ETHUSDT', baseAsset: 'ETH', quoteAsset: 'USDT', price: 4245.89, change24h: -1.12, volume24h: 156234.45 },
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
      entryPrice: 118800,
      currentPrice: 120250.67,
      pnl: 72.54,
      pnlPercent: 1.22,
      stopLoss: 117000,
      takeProfit: 125000,
      timestamp: Date.now() - 3600000,
    },
    {
      id: '2',
      symbol: 'ETHUSDT',
      type: 'SHORT',
      size: 1.2,
      entryPrice: 4380,
      currentPrice: 4245.89,
      pnl: 160.93,
      pnlPercent: 3.06,
      stopLoss: 4450,
      takeProfit: 4100,
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
    { name: 'MACD', value: 325.67, signal: 'BUY', strength: 0.8 },
    { name: 'EMA(20)', value: 119750.23, signal: 'BUY', strength: 0.6 },
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
      price: 120240.12,
      quantity: 0.025,
      pnl: 34.56,
      strategy: 'AI-Enhanced',
      confidence: 0.87,
    },
    {
      id: '2',
      timestamp: Date.now() - 600000,
      symbol: 'ETHUSDT',
      type: 'SELL',
      side: 'SHORT',
      price: 4255.67,
      quantity: 0.8,
      pnl: 12.45,
      strategy: 'Momentum',
      confidence: 0.72,
    },
  ]);

  const [chartData, setChartData] = useState<ChartData[]>([]);

  // Fetch real Binance data when connected
  const fetchRealData = async () => {
    if (isConnected) {
      try {
        // Fetch real ticker data
        const btcTicker = await fetchTickerData('BTCUSDT');
        const ethTicker = await fetchTickerData('ETHUSDT');
        
        if (btcTicker) {
          const realPrice = parseFloat(btcTicker.price);
          setCurrentPrice(realPrice);
          
          setTradingPairs(prev => prev.map(pair => {
            if (pair.symbol === 'BTCUSDT') {
              return {
                ...pair,
                price: realPrice,
                change24h: parseFloat(btcTicker.priceChangePercent),
              };
            }
            return pair;
          }));
          
          // Update positions with real prices
          setPositions(prev => prev.map(pos => {
            if (pos.symbol === 'BTCUSDT') {
              const pnl = pos.type === 'LONG' 
                ? (realPrice - pos.entryPrice) * pos.size
                : (pos.entryPrice - realPrice) * pos.size;
              const pnlPercent = pos.type === 'LONG'
                ? ((realPrice - pos.entryPrice) / pos.entryPrice) * 100
                : ((pos.entryPrice - realPrice) / pos.entryPrice) * 100;
              
              return {
                ...pos,
                currentPrice: realPrice,
                pnl,
                pnlPercent,
              };
            }
            return pos;
          }));
        }

        if (ethTicker) {
          const ethPrice = parseFloat(ethTicker.price);
          setTradingPairs(prev => prev.map(pair => {
            if (pair.symbol === 'ETHUSDT') {
              return {
                ...pair,
                price: ethPrice,
                change24h: parseFloat(ethTicker.priceChangePercent),
              };
            }
            return pair;
          }));
        }

        // Fetch real chart data
        const klineData = await fetchKlineData('BTCUSDT', '1m', 100);
        if (klineData) {
          setChartData(klineData);
        }
      } catch (error) {
        console.error('Error fetching real data:', error);
      }
    }
  };

  // Initial load of real data
  useEffect(() => {
    if (isConnected) {
      fetchRealData();
    }
  }, [isConnected]);

  // Real-time updates - use real data if connected, otherwise simulate
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        // Fetch real data every 5 seconds when connected
        fetchRealData();
      } else {
        // Fallback to simulated data when not connected
        const priceChange = (Math.random() - 0.5) * 500; // Larger range for 120K price
        const newPrice = Math.max(115000, Math.min(125000, currentPrice + priceChange));
        setCurrentPrice(newPrice);

        // Update trading pairs
        setTradingPairs(prev => prev.map(pair => ({
          ...pair,
          price: pair.symbol === 'BTCUSDT' ? newPrice : pair.price + (Math.random() - 0.5) * 50,
        })));

        // Update positions
        setPositions(prev => prev.map(pos => ({
          ...pos,
          currentPrice: pos.symbol === 'BTCUSDT' ? newPrice : pos.currentPrice + (Math.random() - 0.5) * 50,
          pnl: pos.type === 'LONG' 
            ? (newPrice - pos.entryPrice) * pos.size
            : (pos.entryPrice - newPrice) * pos.size,
          pnlPercent: pos.type === 'LONG'
            ? ((newPrice - pos.entryPrice) / pos.entryPrice) * 100
            : ((pos.entryPrice - newPrice) / pos.entryPrice) * 100,
        })));

        // Update indicators with values appropriate for 120K price
        setIndicators(prev => prev.map(ind => ({
          ...ind,
          value: ind.name === 'EMA(20)' ? newPrice - 500 + (Math.random() * 1000) : ind.value + (Math.random() - 0.5) * 5,
          signal: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'BUY' : 'SELL') : ind.signal,
        })));

        // Add new chart data point
        setChartData(prev => {
          const newPoint: ChartData = {
            timestamp: Date.now(),
            open: prev.length > 0 ? prev[prev.length - 1].close : newPrice,
            high: newPrice + Math.random() * 200,
            low: newPrice - Math.random() * 200,
            close: newPrice,
            volume: Math.random() * 100,
          };
          return [...prev.slice(-100), newPoint]; // Keep last 100 points
        });
      }
    }, isConnected ? 5000 : 2000); // 5 seconds for real data, 2 seconds for simulation

    return () => clearInterval(interval);
  }, [currentPrice, isConnected]);

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