export interface TradingPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  price: number;
  change24h: number;
  volume24h: number;
}

export interface Portfolio {
  totalBalance: number;
  availableBalance: number;
  inPositions: number;
  dailyPnL: number;
  totalPnL: number;
}

export interface Position {
  id: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  size: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  stopLoss?: number;
  takeProfit?: number;
  timestamp: number;
}

export interface BotStatus {
  isRunning: boolean;
  mode: 'DEMO' | 'LIVE';
  strategy: string;
  totalTrades: number;
  winRate: number;
  performance24h: number;
}

export interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'BUY' | 'SELL' | 'NEUTRAL';
  strength: number;
}

export interface Trade {
  id: string;
  timestamp: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  side: 'LONG' | 'SHORT';
  price: number;
  quantity: number;
  pnl: number;
  strategy: string;
  confidence: number;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
  isActive: boolean;
  performance: {
    totalTrades: number;
    winRate: number;
    profit: number;
    maxDrawdown: number;
  };
}

export interface ChartData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}