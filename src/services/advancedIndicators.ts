// Erweiterte Trading-Indikatoren für dominanten Bot
export const advancedIndicators = {
  
  // ADX - Trendstärke-Filter
  calculateADX(highs: number[], lows: number[], closes: number[], period: number = 14): number {
    if (highs.length < period + 1) return 0;
    
    const trueRanges: number[] = [];
    const plusDMs: number[] = [];
    const minusDMs: number[] = [];
    
    for (let i = 1; i < highs.length; i++) {
      const trueRange = Math.max(
        highs[i] - lows[i],
        Math.abs(highs[i] - closes[i - 1]),
        Math.abs(lows[i] - closes[i - 1])
      );
      
      const plusDM = highs[i] - highs[i - 1] > lows[i - 1] - lows[i] 
        ? Math.max(highs[i] - highs[i - 1], 0) : 0;
      const minusDM = lows[i - 1] - lows[i] > highs[i] - highs[i - 1] 
        ? Math.max(lows[i - 1] - lows[i], 0) : 0;
      
      trueRanges.push(trueRange);
      plusDMs.push(plusDM);
      minusDMs.push(minusDM);
    }
    
    const atr = trueRanges.slice(-period).reduce((a, b) => a + b, 0) / period;
    const plusDI = (plusDMs.slice(-period).reduce((a, b) => a + b, 0) / period / atr) * 100;
    const minusDI = (minusDMs.slice(-period).reduce((a, b) => a + b, 0) / period / atr) * 100;
    
    const dx = Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100;
    return dx || 0;
  },

  // EMA 50/200 Crossover für Trend-Bias
  calculateEMACrossover(prices: number[]): { 
    ema50: number; 
    ema200: number; 
    signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    strength: number;
  } {
    const ema50 = this.calculateEMA(prices, 50);
    const ema200 = this.calculateEMA(prices, 200);
    
    let signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
    let strength = 0;
    
    if (ema50 > ema200) {
      signal = 'BULLISH';
      strength = ((ema50 - ema200) / ema200) * 100;
    } else if (ema50 < ema200) {
      signal = 'BEARISH';
      strength = ((ema200 - ema50) / ema200) * 100;
    }
    
    return { ema50, ema200, signal, strength: Math.abs(strength) };
  },

  // RSI Divergence-Erkennung
  detectRSIDivergence(prices: number[], rsiValues: number[]): {
    type: 'BULLISH' | 'BEARISH' | 'NONE';
    confidence: number;
    description: string;
  } {
    if (prices.length < 20 || rsiValues.length < 20) {
      return { type: 'NONE', confidence: 0, description: 'Nicht genug Daten' };
    }
    
    const recentPrices = prices.slice(-10);
    const recentRSI = rsiValues.slice(-10);
    
    // Bullish Divergence: Preis macht niedrigeres Tief, RSI macht höheres Tief
    const priceMin = Math.min(...recentPrices);
    const rsiAtPriceMin = recentRSI[recentPrices.indexOf(priceMin)];
    const currentRSI = recentRSI[recentRSI.length - 1];
    
    if (prices[prices.length - 1] < priceMin && currentRSI > rsiAtPriceMin + 5) {
      return {
        type: 'BULLISH',
        confidence: Math.min((currentRSI - rsiAtPriceMin) * 2, 90),
        description: 'Bullish RSI Divergence erkannt - Potentielle Trendwende nach oben'
      };
    }
    
    // Bearish Divergence: Preis macht höheres Hoch, RSI macht niedrigeres Hoch
    const priceMax = Math.max(...recentPrices);
    const rsiAtPriceMax = recentRSI[recentPrices.indexOf(priceMax)];
    
    if (prices[prices.length - 1] > priceMax && currentRSI < rsiAtPriceMax - 5) {
      return {
        type: 'BEARISH',
        confidence: Math.min((rsiAtPriceMax - currentRSI) * 2, 90),
        description: 'Bearish RSI Divergence erkannt - Potentielle Trendwende nach unten'
      };
    }
    
    return { type: 'NONE', confidence: 0, description: 'Keine Divergence erkannt' };
  },

  // ATR für Trailing Stops
  calculateATR(highs: number[], lows: number[], closes: number[], period: number = 14): number {
    if (highs.length < period + 1) return 0;
    
    const trueRanges: number[] = [];
    for (let i = 1; i < highs.length; i++) {
      const trueRange = Math.max(
        highs[i] - lows[i],
        Math.abs(highs[i] - closes[i - 1]),
        Math.abs(lows[i] - closes[i - 1])
      );
      trueRanges.push(trueRange);
    }
    
    return trueRanges.slice(-period).reduce((a, b) => a + b, 0) / period;
  },

  // Fibonacci Retracements
  calculateFibonacci(high: number, low: number): {
    levels: { level: number; price: number; name: string }[];
    description: string;
  } {
    const range = high - low;
    const fibLevels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
    
    const levels = fibLevels.map(fib => ({
      level: fib,
      price: high - (range * fib),
      name: `${(fib * 100).toFixed(1)}%`
    }));
    
    return {
      levels,
      description: `Fibonacci Retracements für Range $${low.toFixed(0)} - $${high.toFixed(0)}`
    };
  },

  // Fair Value Gap (FVG) Erkennung
  detectFairValueGaps(candles: any[]): {
    gaps: { start: number; end: number; direction: 'UP' | 'DOWN'; filled: boolean }[];
    description: string;
  } {
    const gaps: any[] = [];
    
    for (let i = 2; i < candles.length; i++) {
      const prev = candles[i - 2];
      const current = candles[i - 1];
      const next = candles[i];
      
      // Bullish FVG: Gap zwischen prev.high und next.low
      if (prev.high < next.low) {
        gaps.push({
          start: prev.high,
          end: next.low,
          direction: 'UP',
          filled: false,
          index: i
        });
      }
      
      // Bearish FVG: Gap zwischen prev.low und next.high
      if (prev.low > next.high) {
        gaps.push({
          start: next.high,
          end: prev.low,
          direction: 'DOWN',
          filled: false,
          index: i
        });
      }
    }
    
    return {
      gaps: gaps.slice(-5), // Letzte 5 Gaps
      description: `${gaps.length} Fair Value Gaps erkannt`
    };
  },

  // Multi-Timeframe-Analyse
  analyzeMultiTimeframe(data1h: any[], data15m: any[], currentPrice: number): {
    trendBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    entrySignal: 'BUY' | 'SELL' | 'WAIT';
    confidence: number;
    reasoning: string[];
  } {
    const reasoning: string[] = [];
    let confidence = 0;
    
    // 1H Trend-Analyse
    const prices1h = data1h.map(d => d.close);
    const ema50_1h = this.calculateEMA(prices1h, 50);
    const ema200_1h = this.calculateEMA(prices1h, 200);
    const trendBias = ema50_1h > ema200_1h ? 'BULLISH' : 'BEARISH';
    
    // 15M Entry-Analyse
    const prices15m = data15m.map(d => d.close);
    const rsi15m = this.calculateRSI(prices15m);
    const macd15m = this.calculateMACD(prices15m);
    
    // ADX für Trendstärke
    const highs1h = data1h.map(d => d.high);
    const lows1h = data1h.map(d => d.low);
    const adx = this.calculateADX(highs1h, lows1h, prices1h);
    
    reasoning.push(`1H Trend: ${trendBias} (EMA50: ${ema50_1h.toFixed(0)})`);
    reasoning.push(`ADX Trendstärke: ${adx.toFixed(1)} ${adx > 25 ? '(Stark)' : '(Schwach)'}`);
    
    let entrySignal: 'BUY' | 'SELL' | 'WAIT' = 'WAIT';
    
    // Entry-Logik
    if (trendBias === 'BULLISH' && adx > 20) {
      if (rsi15m < 40 && macd15m > 0) {
        entrySignal = 'BUY';
        confidence = 85;
        reasoning.push('🔥 Bullish Entry: RSI oversold + MACD positiv');
      }
    } else if (trendBias === 'BEARISH' && adx > 20) {
      if (rsi15m > 60 && macd15m < 0) {
        entrySignal = 'SELL';
        confidence = 85;
        reasoning.push('🔥 Bearish Entry: RSI overbought + MACD negativ');
      }
    }
    
    if (adx < 20) {
      reasoning.push('⚠️ Schwacher Trend - Warten auf klarere Signale');
    }
    
    return { trendBias, entrySignal, confidence, reasoning };
  },

  // Hilfsfunktionen
  calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1] || 0;
    
    const multiplier = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }
    
    return ema;
  },

  calculateRSI(prices: number[], period: number = 14): number {
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
  },

  calculateMACD(prices: number[]): number {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    return ema12 - ema26;
  }
};