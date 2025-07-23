import { advancedIndicators } from './advancedIndicators';

export interface TradingSignal {
  id: string;
  timestamp: number;
  symbol: string;
  direction: 'LONG' | 'SHORT' | 'WAIT';
  confidence: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
  maxLeverage: number;
  riskReward: number;
  timeframe: string;
  reasoning: string[];
  technicals: {
    rsi: number;
    macd: number;
    adx: number;
    ema50: number;
    ema200: number;
    atr: number;
    volume: number;
  };
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  positionSize: number; // % des Portfolios
}

export const signalGenerator = {
  
  // Haupt-Signal-Generator
  generateCompleteSignal(
    chartData: any[], 
    currentPrice: number,
    portfolioBalance: number = 10000
  ): TradingSignal {
    
    const prices = chartData.map(d => d.close);
    const highs = chartData.map(d => d.high);
    const lows = chartData.map(d => d.low);
    const volumes = chartData.map(d => d.volume);
    
    // Berechne alle Indikatoren
    const rsi = advancedIndicators.calculateRSI(prices);
    const macd = advancedIndicators.calculateMACD(prices);
    const adx = advancedIndicators.calculateADX(highs, lows, prices);
    const atr = advancedIndicators.calculateATR(highs, lows, prices);
    const emaCross = advancedIndicators.calculateEMACrossover(prices);
    const rsiDiv = advancedIndicators.detectRSIDivergence(prices, [rsi]);
    
    // Multi-Timeframe Analyse (simuliert)
    const mtfAnalysis = advancedIndicators.analyzeMultiTimeframe(
      chartData.slice(-100), // 1h data
      chartData.slice(-50),  // 15m data
      currentPrice
    );
    
    // Signal-Generierung
    const signal = this.calculateSignal(
      currentPrice,
      rsi,
      macd,
      adx,
      emaCross,
      rsiDiv,
      mtfAnalysis,
      atr,
      volumes[volumes.length - 1] || 1
    );
    
    return {
      id: `signal_${Date.now()}`,
      timestamp: Date.now(),
      symbol: 'BTCUSDT',
      ...signal,
      technicals: {
        rsi,
        macd,
        adx,
        ema50: emaCross.ema50,
        ema200: emaCross.ema200,
        atr,
        volume: volumes[volumes.length - 1] || 1
      }
    };
  },

  // Signal-Berechnung mit Risk-Management
  calculateSignal(
    price: number,
    rsi: number,
    macd: number,
    adx: number,
    emaCross: any,
    rsiDiv: any,
    mtfAnalysis: any,
    atr: number,
    volume: number
  ) {
    let direction: 'LONG' | 'SHORT' | 'WAIT' = 'WAIT';
    let confidence = 0;
    let reasoning: string[] = [];
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
    
    // LONG Signal Logic
    if (
      emaCross.signal === 'BULLISH' && 
      adx > 20 && 
      rsi < 45 && 
      macd > 0 &&
      mtfAnalysis.trendBias === 'BULLISH'
    ) {
      direction = 'LONG';
      confidence = 85;
      reasoning.push('🟢 BULLISH Setup bestätigt');
      reasoning.push(`📈 EMA Crossover: ${emaCross.signal}`);
      reasoning.push(`⚡ ADX Stärke: ${adx.toFixed(1)} (Starker Trend)`);
      reasoning.push(`📊 RSI: ${rsi.toFixed(1)} (Oversold Bounce)`);
      reasoning.push(`🔄 MACD: ${macd.toFixed(2)} (Positiver Momentum)`);
      
      if (rsiDiv.type === 'BULLISH') {
        confidence += 10;
        reasoning.push('🚀 RSI Bullish Divergence!');
        riskLevel = 'LOW';
      }
      
      if (volume > 1.5) {
        confidence += 5;
        reasoning.push('📊 Hohes Volumen bestätigt');
      }
    }
    
    // SHORT Signal Logic  
    else if (
      emaCross.signal === 'BEARISH' && 
      adx > 20 && 
      rsi > 55 && 
      macd < 0 &&
      mtfAnalysis.trendBias === 'BEARISH'
    ) {
      direction = 'SHORT';
      confidence = 85;
      reasoning.push('🔴 BEARISH Setup bestätigt');
      reasoning.push(`📉 EMA Crossover: ${emaCross.signal}`);
      reasoning.push(`⚡ ADX Stärke: ${adx.toFixed(1)} (Starker Trend)`);
      reasoning.push(`📊 RSI: ${rsi.toFixed(1)} (Overbought Reversal)`);
      reasoning.push(`🔄 MACD: ${macd.toFixed(2)} (Negativer Momentum)`);
      
      if (rsiDiv.type === 'BEARISH') {
        confidence += 10;
        reasoning.push('💥 RSI Bearish Divergence!');
        riskLevel = 'LOW';
      }
      
      if (volume > 1.5) {
        confidence += 5;
        reasoning.push('📊 Hohes Volumen bestätigt');
      }
    }
    
    // WAIT Conditions
    else {
      reasoning.push('⏳ Warten auf bessere Setup');
      if (adx < 20) reasoning.push('⚠️ ADX zu schwach (Seitwärtstrend)');
      if (Math.abs(rsi - 50) < 10) reasoning.push('⚠️ RSI neutral (keine Extreme)');
      if (emaCross.signal === 'NEUTRAL') reasoning.push('⚠️ Kein klarer Trend');
    }
    
    // Risk Management berechnen
    const riskManagement = this.calculateRiskManagement(
      direction,
      price,
      atr,
      confidence,
      riskLevel
    );
    
    return {
      direction,
      confidence: Math.min(confidence, 95),
      ...riskManagement,
      reasoning,
      riskLevel,
      timeframe: '15M/1H Kombination'
    };
  },

  // Risk Management & Position Sizing
  calculateRiskManagement(
    direction: 'LONG' | 'SHORT' | 'WAIT',
    price: number,
    atr: number,
    confidence: number,
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  ) {
    if (direction === 'WAIT') {
      return {
        entryPrice: price,
        stopLoss: price,
        takeProfit1: price,
        takeProfit2: price,
        takeProfit3: price,
        maxLeverage: 1,
        riskReward: 0,
        positionSize: 0
      };
    }
    
    // ATR-basierte Stop-Loss Berechnung
    const atrMultiplier = riskLevel === 'LOW' ? 1.5 : riskLevel === 'MEDIUM' ? 2.0 : 2.5;
    const stopDistance = atr * atrMultiplier;
    
    let stopLoss: number;
    let takeProfit1: number;
    let takeProfit2: number; 
    let takeProfit3: number;
    
    if (direction === 'LONG') {
      stopLoss = price - stopDistance;
      takeProfit1 = price + (stopDistance * 1.5); // 1:1.5 R/R
      takeProfit2 = price + (stopDistance * 2.5); // 1:2.5 R/R
      takeProfit3 = price + (stopDistance * 4.0); // 1:4 R/R
    } else {
      stopLoss = price + stopDistance;
      takeProfit1 = price - (stopDistance * 1.5);
      takeProfit2 = price - (stopDistance * 2.5);
      takeProfit3 = price - (stopDistance * 4.0);
    }
    
    // Hebel-Berechnung basierend auf Confidence & Risk
    let maxLeverage: number;
    let positionSize: number;
    
    if (confidence >= 80 && riskLevel === 'LOW') {
      maxLeverage = 10;
      positionSize = 15; // 15% des Portfolios
    } else if (confidence >= 70 && riskLevel === 'MEDIUM') {
      maxLeverage = 5;
      positionSize = 10; // 10% des Portfolios
    } else if (confidence >= 60) {
      maxLeverage = 3;
      positionSize = 5; // 5% des Portfolios
    } else {
      maxLeverage = 1;
      positionSize = 2; // 2% des Portfolios
    }
    
    const riskReward = Math.abs((takeProfit1 - price) / (stopLoss - price));
    
    return {
      entryPrice: price,
      stopLoss: Number(stopLoss.toFixed(2)),
      takeProfit1: Number(takeProfit1.toFixed(2)),
      takeProfit2: Number(takeProfit2.toFixed(2)),
      takeProfit3: Number(takeProfit3.toFixed(2)),
      maxLeverage,
      riskReward: Number(riskReward.toFixed(2)),
      positionSize
    };
  },

  // Signal-Qualität bewerten
  getSignalQuality(confidence: number, riskLevel: string): {
    quality: string;
    color: string;
    description: string;
  } {
    if (confidence >= 85 && riskLevel === 'LOW') {
      return {
        quality: 'EXCELLENT',
        color: 'text-green-500',
        description: '🔥 Premium Signal - Maximale Confidence'
      };
    } else if (confidence >= 75) {
      return {
        quality: 'GOOD',
        color: 'text-blue-500',
        description: '✅ Gutes Signal - Hohe Wahrscheinlichkeit'
      };
    } else if (confidence >= 65) {
      return {
        quality: 'AVERAGE',
        color: 'text-yellow-500',
        description: '⚠️ Durchschnittliches Signal - Vorsichtig handeln'
      };
    } else {
      return {
        quality: 'POOR',
        color: 'text-red-500',
        description: '❌ Schwaches Signal - Nicht empfohlen'
      };
    }
  }
};