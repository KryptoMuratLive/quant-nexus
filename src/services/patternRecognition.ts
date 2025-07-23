export interface ChartPattern {
  id: string;
  type: 'head_shoulders' | 'triangle' | 'support' | 'resistance' | 'double_top' | 'double_bottom' | 'breakout';
  name: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
  points: { x: number; y: number; price: number }[];
  signal: 'BUY' | 'SELL' | 'NEUTRAL';
  strength: number;
  description: string;
}

// Pattern-Erkennungs-Service
export const patternRecognition = {
  // Erkenne Support/Resistance Levels
  findSupportResistance(data: any[], threshold: number = 0.02) {
    const patterns: ChartPattern[] = [];
    const prices = data.map(d => d.close);
    
    // Finde lokale Hochs und Tiefs
    for (let i = 2; i < prices.length - 2; i++) {
      const current = prices[i];
      const prev2 = prices[i-2];
      const prev1 = prices[i-1];
      const next1 = prices[i+1];
      const next2 = prices[i+2];
      
      // Support Level (lokales Tief)
      if (current < prev1 && current < next1 && current < prev2 && current < next2) {
        const touchCount = this.countTouches(prices, current, threshold);
        if (touchCount >= 2) {
          patterns.push({
            id: `support_${i}`,
            type: 'support',
            name: 'Support Level',
            confidence: Math.min(touchCount * 20, 90),
            startIndex: i - 10,
            endIndex: i + 10,
            points: [{ x: i, y: current, price: current }],
            signal: 'BUY',
            strength: touchCount,
            description: `Starkes Support bei $${current.toFixed(0)} (${touchCount} Berührungen)`
          });
        }
      }
      
      // Resistance Level (lokales Hoch)
      if (current > prev1 && current > next1 && current > prev2 && current > next2) {
        const touchCount = this.countTouches(prices, current, threshold);
        if (touchCount >= 2) {
          patterns.push({
            id: `resistance_${i}`,
            type: 'resistance',
            name: 'Resistance Level',
            confidence: Math.min(touchCount * 20, 90),
            startIndex: i - 10,
            endIndex: i + 10,
            points: [{ x: i, y: current, price: current }],
            signal: 'SELL',
            strength: touchCount,
            description: `Starkes Resistance bei $${current.toFixed(0)} (${touchCount} Berührungen)`
          });
        }
      }
    }
    
    return patterns;
  },

  // Head & Shoulders Pattern
  findHeadShoulders(data: any[]) {
    const patterns: ChartPattern[] = [];
    const prices = data.map(d => d.close);
    
    for (let i = 20; i < prices.length - 20; i++) {
      const leftShoulder = this.findLocalMax(prices, i - 15, i - 5);
      const head = this.findLocalMax(prices, i - 5, i + 5);
      const rightShoulder = this.findLocalMax(prices, i + 5, i + 15);
      
      if (leftShoulder && head && rightShoulder) {
        if (head.price > leftShoulder.price * 1.02 && head.price > rightShoulder.price * 1.02) {
          patterns.push({
            id: `head_shoulders_${i}`,
            type: 'head_shoulders',
            name: 'Head & Shoulders',
            confidence: 75,
            startIndex: leftShoulder.index,
            endIndex: rightShoulder.index,
            points: [leftShoulder, head, rightShoulder],
            signal: 'SELL',
            strength: 3,
            description: 'Bearish Head & Shoulders Pattern erkannt'
          });
        }
      }
    }
    
    return patterns;
  },

  // Triangle Pattern
  findTriangles(data: any[]) {
    const patterns: ChartPattern[] = [];
    const prices = data.map(d => d.close);
    
    // Vereinfachte Triangle-Erkennung
    for (let i = 30; i < prices.length - 10; i++) {
      const slice = prices.slice(i - 30, i);
      const highs = this.findLocalMaxima(slice);
      const lows = this.findLocalMinima(slice);
      
      if (highs.length >= 2 && lows.length >= 2) {
        const highSlope = (highs[highs.length - 1].price - highs[0].price) / (highs[highs.length - 1].index - highs[0].index);
        const lowSlope = (lows[lows.length - 1].price - lows[0].price) / (lows[lows.length - 1].index - lows[0].index);
        
        // Ascending Triangle
        if (Math.abs(highSlope) < 0.1 && lowSlope > 0.1) {
          patterns.push({
            id: `triangle_asc_${i}`,
            type: 'triangle',
            name: 'Ascending Triangle',
            confidence: 65,
            startIndex: i - 30,
            endIndex: i,
            points: [...highs, ...lows],
            signal: 'BUY',
            strength: 2,
            description: 'Bullish Ascending Triangle'
          });
        }
        
        // Descending Triangle
        if (Math.abs(lowSlope) < 0.1 && highSlope < -0.1) {
          patterns.push({
            id: `triangle_desc_${i}`,
            type: 'triangle',
            name: 'Descending Triangle',
            confidence: 65,
            startIndex: i - 30,
            endIndex: i,
            points: [...highs, ...lows],
            signal: 'SELL',
            strength: 2,
            description: 'Bearish Descending Triangle'
          });
        }
      }
    }
    
    return patterns;
  },

  // Hilfsfunktionen
  countTouches(prices: number[], level: number, threshold: number) {
    return prices.filter(price => Math.abs(price - level) / level < threshold).length;
  },

  findLocalMax(prices: number[], start: number, end: number) {
    let maxPrice = -Infinity;
    let maxIndex = -1;
    
    for (let i = start; i <= end && i < prices.length; i++) {
      if (prices[i] > maxPrice) {
        maxPrice = prices[i];
        maxIndex = i;
      }
    }
    
    return maxIndex >= 0 ? { index: maxIndex, price: maxPrice, x: maxIndex, y: maxPrice } : null;
  },

  findLocalMaxima(prices: number[]) {
    const maxima = [];
    for (let i = 1; i < prices.length - 1; i++) {
      if (prices[i] > prices[i-1] && prices[i] > prices[i+1]) {
        maxima.push({ index: i, price: prices[i], x: i, y: prices[i] });
      }
    }
    return maxima;
  },

  findLocalMinima(prices: number[]) {
    const minima = [];
    for (let i = 1; i < prices.length - 1; i++) {
      if (prices[i] < prices[i-1] && prices[i] < prices[i+1]) {
        minima.push({ index: i, price: prices[i], x: i, y: prices[i] });
      }
    }
    return minima;
  },

  // Hauptfunktion: Erkenne alle Pattern
  analyzePatterns(chartData: any[]) {
    if (chartData.length < 50) return [];
    
    const patterns: ChartPattern[] = [];
    
    // Erkenne verschiedene Pattern
    patterns.push(...this.findSupportResistance(chartData));
    patterns.push(...this.findHeadShoulders(chartData));
    patterns.push(...this.findTriangles(chartData));
    
    // Sortiere nach Confidence
    return patterns.sort((a, b) => b.confidence - a.confidence).slice(0, 10);
  }
};