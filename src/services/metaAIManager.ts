// Meta-AI Manager für Multi-Agent Trading System
import { advancedIndicators } from './advancedIndicators';
import { signalGenerator, TradingSignal } from './signalGenerator';

export interface AgentSignal {
  agentId: string;
  agentName: string;
  strategy: string;
  signal: 'LONG' | 'SHORT' | 'WAIT';
  confidence: number;
  reasoning: string[];
  weight: number; // Gewichtung basierend auf Performance
  timestamp: number;
}

export interface MetaSignal {
  finalSignal: 'LONG' | 'SHORT' | 'WAIT';
  overallConfidence: number;
  convergence: number; // Wie viele Agenten stimmen überein
  dominantStrategy: string;
  agentVotes: AgentSignal[];
  reasoning: string[];
  riskAssessment: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendedAction: string;
}

export interface AgentPerformance {
  agentId: string;
  totalSignals: number;
  successfulSignals: number;
  winRate: number;
  avgProfit: number;
  maxDrawdown: number;
  currentWeight: number;
  lastUpdate: number;
}

export const metaAIManager = {
  
  // Agent Performance Tracking
  agentPerformance: new Map<string, AgentPerformance>([
    ['trend_follower', { agentId: 'trend_follower', totalSignals: 45, successfulSignals: 32, winRate: 71.1, avgProfit: 2.3, maxDrawdown: -8.2, currentWeight: 0.28, lastUpdate: Date.now() }],
    ['mean_reversion', { agentId: 'mean_reversion', totalSignals: 38, successfulSignals: 25, winRate: 65.8, avgProfit: 1.8, maxDrawdown: -6.5, currentWeight: 0.24, lastUpdate: Date.now() }],
    ['breakout_hunter', { agentId: 'breakout_hunter', totalSignals: 22, successfulSignals: 17, winRate: 77.3, avgProfit: 3.1, maxDrawdown: -12.1, currentWeight: 0.26, lastUpdate: Date.now() }],
    ['ai_neural', { agentId: 'ai_neural', totalSignals: 31, successfulSignals: 24, winRate: 77.4, avgProfit: 2.7, maxDrawdown: -9.3, currentWeight: 0.22, lastUpdate: Date.now() }]
  ]),

  // Haupt Meta-Signal Generator
  generateMetaSignal(chartData: any[], currentPrice: number): MetaSignal {
    console.log('🧠 Meta-AI: Starte Multi-Agent Analyse...');
    
    // Alle Agenten analysieren lassen
    const agentSignals: AgentSignal[] = [
      this.trendFollowerAgent(chartData, currentPrice),
      this.meanReversionAgent(chartData, currentPrice), 
      this.breakoutHunterAgent(chartData, currentPrice),
      this.aiNeuralAgent(chartData, currentPrice)
    ];

    // Meta-Entscheidung treffen
    const metaDecision = this.makeMetaDecision(agentSignals);
    
    console.log('🎯 Meta-Signal generiert:', metaDecision);
    return metaDecision;
  },

  // Agent A: Trend Follower (EMA/MACD)
  trendFollowerAgent(chartData: any[], currentPrice: number): AgentSignal {
    const prices = chartData.map(d => d.close);
    const emaCross = advancedIndicators.calculateEMACrossover(prices);
    const macd = advancedIndicators.calculateMACD(prices);
    const adx = advancedIndicators.calculateADX(
      chartData.map(d => d.high),
      chartData.map(d => d.low), 
      prices
    );

    let signal: 'LONG' | 'SHORT' | 'WAIT' = 'WAIT';
    let confidence = 0;
    let reasoning: string[] = [];

    // Trend Following Logic
    if (emaCross.signal === 'BULLISH' && macd > 0 && adx > 25) {
      signal = 'LONG';
      confidence = 75 + (adx > 30 ? 10 : 0);
      reasoning.push('📈 Starker Aufwärtstrend erkannt');
      reasoning.push(`EMA Crossover: ${emaCross.signal}`);
      reasoning.push(`MACD: ${macd.toFixed(2)} (Positiv)`);
      reasoning.push(`ADX: ${adx.toFixed(1)} (Trending)`);
    } else if (emaCross.signal === 'BEARISH' && macd < 0 && adx > 25) {
      signal = 'SHORT';
      confidence = 75 + (adx > 30 ? 10 : 0);
      reasoning.push('📉 Starker Abwärtstrend erkannt');
      reasoning.push(`EMA Crossover: ${emaCross.signal}`);
      reasoning.push(`MACD: ${macd.toFixed(2)} (Negativ)`);
      reasoning.push(`ADX: ${adx.toFixed(1)} (Trending)`);
    } else {
      reasoning.push('⏳ Kein klarer Trend - warten');
    }

    return {
      agentId: 'trend_follower',
      agentName: 'Trend Follower',
      strategy: 'EMA/MACD Trend Following',
      signal,
      confidence,
      reasoning,
      weight: this.agentPerformance.get('trend_follower')?.currentWeight || 0.25,
      timestamp: Date.now()
    };
  },

  // Agent B: Mean Reversion (Bollinger Bands/RSI)
  meanReversionAgent(chartData: any[], currentPrice: number): AgentSignal {
    const prices = chartData.map(d => d.close);
    const rsi = advancedIndicators.calculateRSI(prices);
    const bb = advancedIndicators.calculateBollingerBands(prices);

    let signal: 'LONG' | 'SHORT' | 'WAIT' = 'WAIT';
    let confidence = 0;
    let reasoning: string[] = [];

    // Mean Reversion Logic
    if (rsi < 30 && currentPrice <= bb.lower && currentPrice > bb.lower * 0.98) {
      signal = 'LONG';
      confidence = 70 + (rsi < 25 ? 15 : 10);
      reasoning.push('🔄 Oversold Bounce Setup');
      reasoning.push(`RSI: ${rsi.toFixed(1)} (Oversold)`);
      reasoning.push(`Preis bei BB Lower: ${bb.lower.toFixed(2)}`);
      reasoning.push('Mean Reversion Wahrscheinlich');
    } else if (rsi > 70 && currentPrice >= bb.upper && currentPrice < bb.upper * 1.02) {
      signal = 'SHORT';
      confidence = 70 + (rsi > 75 ? 15 : 10);
      reasoning.push('🔄 Overbought Reversal Setup');
      reasoning.push(`RSI: ${rsi.toFixed(1)} (Overbought)`);
      reasoning.push(`Preis bei BB Upper: ${bb.upper.toFixed(2)}`);
      reasoning.push('Mean Reversion Wahrscheinlich');
    } else {
      reasoning.push('⏳ Kein Extrembereich erreicht');
    }

    return {
      agentId: 'mean_reversion', 
      agentName: 'Mean Reversion',
      strategy: 'Bollinger Bands/RSI Reversion',
      signal,
      confidence,
      reasoning,
      weight: this.agentPerformance.get('mean_reversion')?.currentWeight || 0.25,
      timestamp: Date.now()
    };
  },

  // Agent C: Breakout Hunter (Volume/Range)
  breakoutHunterAgent(chartData: any[], currentPrice: number): AgentSignal {
    const volumes = chartData.map(d => d.volume);
    const avgVolume = volumes.slice(-20).reduce((a, b) => a + b) / 20;
    const currentVolume = volumes[volumes.length - 1];
    const volumeSpike = currentVolume / avgVolume;

    // Range Analysis
    const recentHighs = chartData.slice(-20).map(d => d.high);
    const recentLows = chartData.slice(-20).map(d => d.low);
    const resistance = Math.max(...recentHighs);
    const support = Math.min(...recentLows);
    const rangeSize = (resistance - support) / support * 100;

    let signal: 'LONG' | 'SHORT' | 'WAIT' = 'WAIT';
    let confidence = 0;
    let reasoning: string[] = [];

    // Breakout Logic
    if (currentPrice > resistance && volumeSpike > 1.5 && rangeSize > 3) {
      signal = 'LONG';
      confidence = 80 + (volumeSpike > 2.0 ? 10 : 0);
      reasoning.push('🚀 Upward Breakout erkannt');
      reasoning.push(`Breakout über Resistance: ${resistance.toFixed(2)}`);
      reasoning.push(`Volume Spike: ${volumeSpike.toFixed(1)}x`);
      reasoning.push(`Range: ${rangeSize.toFixed(1)}%`);
    } else if (currentPrice < support && volumeSpike > 1.5 && rangeSize > 3) {
      signal = 'SHORT';
      confidence = 80 + (volumeSpike > 2.0 ? 10 : 0);
      reasoning.push('💥 Downward Breakdown erkannt');
      reasoning.push(`Breakdown unter Support: ${support.toFixed(2)}`);
      reasoning.push(`Volume Spike: ${volumeSpike.toFixed(1)}x`);
      reasoning.push(`Range: ${rangeSize.toFixed(1)}%`);
    } else {
      reasoning.push('⏳ Kein Breakout - in Range gefangen');
    }

    return {
      agentId: 'breakout_hunter',
      agentName: 'Breakout Hunter', 
      strategy: 'Volume/Range Breakout',
      signal,
      confidence,
      reasoning,
      weight: this.agentPerformance.get('breakout_hunter')?.currentWeight || 0.25,
      timestamp: Date.now()
    };
  },

  // Agent D: AI Neural Network (Reinforcement Learning Simulation)
  aiNeuralAgent(chartData: any[], currentPrice: number): AgentSignal {
    const prices = chartData.map(d => d.close);
    
    // Simuliere Neural Network Analyse
    const features = {
      priceAction: this.calculatePriceAction(prices),
      momentum: this.calculateMomentumScore(chartData),
      volatility: this.calculateVolatilityScore(prices),
      pattern: this.detectPatterns(chartData)
    };

    let signal: 'LONG' | 'SHORT' | 'WAIT' = 'WAIT';
    let confidence = 0;
    let reasoning: string[] = [];

    // AI Model Decision (vereinfacht)
    const aiScore = (
      features.priceAction * 0.3 +
      features.momentum * 0.3 + 
      features.volatility * 0.2 +
      features.pattern * 0.2
    );

    if (aiScore > 0.6) {
      signal = 'LONG';
      confidence = Math.min(aiScore * 100, 95);
      reasoning.push('🤖 AI Modell: BULLISH Pattern');
      reasoning.push(`Confidence Score: ${(aiScore * 100).toFixed(1)}%`);
      reasoning.push(`Price Action: ${features.priceAction.toFixed(2)}`);
      reasoning.push(`Momentum: ${features.momentum.toFixed(2)}`);
    } else if (aiScore < -0.6) {
      signal = 'SHORT';
      confidence = Math.min(Math.abs(aiScore) * 100, 95);
      reasoning.push('🤖 AI Modell: BEARISH Pattern');
      reasoning.push(`Confidence Score: ${(Math.abs(aiScore) * 100).toFixed(1)}%`);
      reasoning.push(`Price Action: ${features.priceAction.toFixed(2)}`);
      reasoning.push(`Momentum: ${features.momentum.toFixed(2)}`);
    } else {
      reasoning.push('🤖 AI Modell: Unsicher - warten');
    }

    return {
      agentId: 'ai_neural',
      agentName: 'AI Neural Network',
      strategy: 'Reinforcement Learning Model',
      signal,
      confidence,
      reasoning,
      weight: this.agentPerformance.get('ai_neural')?.currentWeight || 0.25,
      timestamp: Date.now()
    };
  },

  // Meta-Entscheidung basierend auf allen Agenten
  makeMetaDecision(agentSignals: AgentSignal[]): MetaSignal {
    // Gewichtete Stimmen zählen
    let weightedLongVotes = 0;
    let weightedShortVotes = 0;
    let weightedWaitVotes = 0;
    let totalWeight = 0;

    agentSignals.forEach(agent => {
      const weightedVote = (agent.confidence / 100) * agent.weight;
      totalWeight += agent.weight;

      if (agent.signal === 'LONG') {
        weightedLongVotes += weightedVote;
      } else if (agent.signal === 'SHORT') {
        weightedShortVotes += weightedVote;
      } else {
        weightedWaitVotes += weightedVote;
      }
    });

    // Finale Entscheidung
    let finalSignal: 'LONG' | 'SHORT' | 'WAIT' = 'WAIT';
    let overallConfidence = 0;
    let convergence = 0;
    let reasoning: string[] = [];

    const maxVotes = Math.max(weightedLongVotes, weightedShortVotes, weightedWaitVotes);
    
    if (maxVotes === weightedLongVotes && weightedLongVotes > 0.15) {
      finalSignal = 'LONG';
      overallConfidence = (weightedLongVotes / totalWeight) * 100;
      convergence = agentSignals.filter(a => a.signal === 'LONG').length;
      reasoning.push(`🟢 LONG Konsens: ${convergence}/4 Agenten stimmen zu`);
    } else if (maxVotes === weightedShortVotes && weightedShortVotes > 0.15) {
      finalSignal = 'SHORT';
      overallConfidence = (weightedShortVotes / totalWeight) * 100;
      convergence = agentSignals.filter(a => a.signal === 'SHORT').length;
      reasoning.push(`🔴 SHORT Konsens: ${convergence}/4 Agenten stimmen zu`);
    } else {
      convergence = agentSignals.filter(a => a.signal === 'WAIT').length;
      reasoning.push(`⏳ WAIT: Keine ausreichende Übereinstimmung`);
    }

    // Risk Assessment
    let riskAssessment: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
    if (convergence >= 3 && overallConfidence > 75) {
      riskAssessment = 'LOW';
    } else if (convergence >= 2 && overallConfidence > 60) {
      riskAssessment = 'MEDIUM';
    } else {
      riskAssessment = 'HIGH';
    }

    // Dominante Strategie ermitteln
    const dominantAgent = agentSignals.reduce((prev, current) => 
      (prev.confidence * prev.weight) > (current.confidence * current.weight) ? prev : current
    );

    return {
      finalSignal,
      overallConfidence: Math.min(overallConfidence, 95),
      convergence,
      dominantStrategy: dominantAgent.strategy,
      agentVotes: agentSignals,
      reasoning,
      riskAssessment,
      recommendedAction: this.getRecommendedAction(finalSignal, overallConfidence, convergence)
    };
  },

  // Helper Functions für AI Features
  calculatePriceAction(prices: number[]): number {
    const recent = prices.slice(-10);
    const trend = (recent[recent.length - 1] - recent[0]) / recent[0];
    return Math.tanh(trend * 100); // Normalisiert zwischen -1 und 1
  },

  calculateMomentumScore(chartData: any[]): number {
    const volumes = chartData.slice(-5).map(d => d.volume);
    const avgVolume = volumes.reduce((a, b) => a + b) / volumes.length;
    const currentVolume = volumes[volumes.length - 1];
    return Math.tanh((currentVolume / avgVolume - 1) * 2);
  },

  calculateVolatilityScore(prices: number[]): number {
    const returns = prices.slice(-10).map((price, i, arr) => 
      i > 0 ? (price - arr[i-1]) / arr[i-1] : 0
    ).slice(1);
    const volatility = Math.sqrt(returns.reduce((sum, ret) => sum + ret * ret, 0) / returns.length);
    return Math.tanh(volatility * 100);
  },

  detectPatterns(chartData: any[]): number {
    // Vereinfachte Pattern-Erkennung
    const recent = chartData.slice(-5);
    let score = 0;
    
    // Bullish Engulfing
    for (let i = 1; i < recent.length; i++) {
      if (recent[i].close > recent[i].open && 
          recent[i-1].close < recent[i-1].open &&
          recent[i].close > recent[i-1].open) {
        score += 0.3;
      }
    }
    
    return Math.tanh(score);
  },

  getRecommendedAction(signal: string, confidence: number, convergence: number): string {
    if (signal === 'WAIT') {
      return 'Warten auf bessere Marktbedingungen';
    }
    
    if (convergence >= 3 && confidence > 80) {
      return `Starkes ${signal} Signal - Empfohlene Ausführung`;
    } else if (convergence >= 2 && confidence > 65) {
      return `Moderates ${signal} Signal - Mit Vorsicht handeln`;
    } else {
      return `Schwaches ${signal} Signal - Nicht empfohlen`;
    }
  },

  // Performance Update (würde normalerweise nach Trade-Ausführung aufgerufen)
  updateAgentPerformance(agentId: string, wasSuccessful: boolean, profit: number) {
    const agent = this.agentPerformance.get(agentId);
    if (!agent) return;

    agent.totalSignals++;
    if (wasSuccessful) {
      agent.successfulSignals++;
    }
    agent.winRate = (agent.successfulSignals / agent.totalSignals) * 100;
    agent.avgProfit = (agent.avgProfit + profit) / 2; // Simplified
    agent.lastUpdate = Date.now();

    // Dynamische Gewichtung basierend auf Performance
    const performanceScore = (agent.winRate / 100) * 0.7 + (Math.max(agent.avgProfit, 0) / 5) * 0.3;
    agent.currentWeight = Math.max(0.1, Math.min(0.4, performanceScore / 4));

    this.agentPerformance.set(agentId, agent);
    console.log(`📊 Agent ${agentId} Performance aktualisiert:`, agent);
  }
};