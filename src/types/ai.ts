export interface TrainingData {
  timestamp: number;
  price: number;
  volume: number;
  rsi: number;
  ema20: number;
  ema50: number;
  macd: number;
  signal: 'BUY' | 'SELL' | 'NEUTRAL';
  actualResult: number; // Actual price change after signal
  confidence: number;
  accuracy: boolean; // Whether signal was correct
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  totalSignals: number;
  successfulSignals: number;
  avgProfit: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

export interface AIModel {
  id: string;
  name: string;
  version: string;
  trainedAt: number;
  metrics: ModelMetrics;
  parameters: {
    rsiWeight: number;
    emaWeight: number;
    macdWeight: number;
    volumeWeight: number;
    learningRate: number;
  };
  trainingData: TrainingData[];
  isActive: boolean;
}

export interface SignalFeedback {
  signalId: string;
  timestamp: number;
  entryPrice: number;
  exitPrice?: number;
  actualProfit: number;
  timeHeld: number; // milliseconds
  wasCorrect: boolean;
  confidence: number;
}

export interface TrainingSession {
  id: string;
  startTime: number;
  endTime?: number;
  dataPoints: number;
  epochs: number;
  initialAccuracy: number;
  finalAccuracy: number;
  improvementPercent: number;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
}