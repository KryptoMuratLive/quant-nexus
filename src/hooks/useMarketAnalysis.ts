import { useState, useEffect } from 'react';
import { signalGenerator } from '@/services/signalGenerator';
import { advancedIndicators } from '@/services/advancedIndicators';

export interface MarketAnalysis {
  overall: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'WAIT';
  sentiment: 'FEAR' | 'GREED' | 'NEUTRAL';
  volatility: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  liquidity: 'GOOD' | 'POOR' | 'EXCELLENT';
  recommendation: string;
  waitConditions: string[];
  actionPlan: string[];
  marketConditions: {
    trend: string;
    momentum: string;
    volume: string;
    support: number;
    resistance: number;
  };
  confidence: number;
}

export const useMarketAnalysis = () => {
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeMarket = async (chartData: any[], currentPrice: number) => {
    setIsAnalyzing(true);
    
    try {
      const prices = chartData.map(d => d.close);
      const highs = chartData.map(d => d.high);
      const lows = chartData.map(d => d.low);
      const volumes = chartData.map(d => d.volume);
      
      // Technische Analyse
      const rsi = advancedIndicators.calculateRSI(prices);
      const adx = advancedIndicators.calculateADX(highs, lows, prices);
      const emaCross = advancedIndicators.calculateEMACrossover(prices);
      const atr = advancedIndicators.calculateATR(highs, lows, prices);
      
      // Volume-Analyse
      const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
      const currentVolume = volumes[volumes.length - 1] || 1;
      const volumeRatio = currentVolume / avgVolume;
      
      // Support/Resistance
      const recentHigh = Math.max(...prices.slice(-20));
      const recentLow = Math.min(...prices.slice(-20));
      
      // Markt-Sentiment bestimmen
      let overall: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'WAIT' = 'NEUTRAL';
      let sentiment: 'FEAR' | 'GREED' | 'NEUTRAL' = 'NEUTRAL';
      let volatility: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' = 'MEDIUM';
      let liquidity: 'GOOD' | 'POOR' | 'EXCELLENT' = 'GOOD';
      let confidence = 50;
      
      const waitConditions: string[] = [];
      const actionPlan: string[] = [];
      
      // Volatilitäts-Analyse
      const volatilityPercent = (atr / currentPrice) * 100;
      if (volatilityPercent > 5) {
        volatility = 'EXTREME';
        waitConditions.push('⚠️ Extreme Volatilität - Warten auf Beruhigung');
      } else if (volatilityPercent > 3) {
        volatility = 'HIGH';
        waitConditions.push('🔥 Hohe Volatilität - Vorsichtig handeln');
      } else if (volatilityPercent < 1) {
        volatility = 'LOW';
        waitConditions.push('😴 Niedrige Volatilität - Wenig Bewegung erwartet');
      }
      
      // Trend-Analyse
      if (emaCross.signal === 'BULLISH' && adx > 25) {
        overall = 'BULLISH';
        confidence += 20;
        actionPlan.push('📈 Starker Aufwärtstrend bestätigt');
        
        if (rsi < 30) {
          sentiment = 'FEAR';
          actionPlan.push('💎 Kaufgelegenheit bei oversold RSI');
        } else if (rsi > 70) {
          sentiment = 'GREED';
          waitConditions.push('⚠️ Überkauft - Warten auf Pullback');
        }
      } else if (emaCross.signal === 'BEARISH' && adx > 25) {
        overall = 'BEARISH';
        confidence += 20;
        actionPlan.push('📉 Starker Abwärtstrend bestätigt');
        
        if (rsi > 70) {
          sentiment = 'GREED';
          actionPlan.push('🩸 Short-Gelegenheit bei overbought RSI');
        } else if (rsi < 30) {
          sentiment = 'FEAR';
          waitConditions.push('⚠️ Überverkauft - Warten auf Rebound');
        }
      } else {
        overall = 'WAIT';
        waitConditions.push('🔄 Seitwärtstrend - Warten auf klare Richtung');
      }
      
      // Volume-Analyse
      if (volumeRatio < 0.5) {
        liquidity = 'POOR';
        waitConditions.push('📊 Niedrige Liquidität - Vorsicht bei großen Orders');
      } else if (volumeRatio > 2) {
        liquidity = 'EXCELLENT';
        actionPlan.push('🚀 Hohes Volumen - Starke Marktbewegung');
        confidence += 15;
      }
      
      // Spezielle Warte-Bedingungen
      if (adx < 20) {
        waitConditions.push('⏳ ADX unter 20 - Schwacher Trend, warten auf Momentum');
      }
      
      if (Math.abs(rsi - 50) < 5) {
        waitConditions.push('⚖️ RSI neutral - Warten auf extreme Levels');
      }
      
      // Resistance/Support Tests
      const nearResistance = (currentPrice / recentHigh) > 0.98;
      const nearSupport = (currentPrice / recentLow) < 1.02;
      
      if (nearResistance) {
        waitConditions.push(`🔴 Nahe Resistance $${recentHigh.toFixed(0)} - Durchbruch abwarten`);
      }
      
      if (nearSupport) {
        waitConditions.push(`🟢 Nahe Support $${recentLow.toFixed(0)} - Halt abwarten`);
      }
      
      // Action Plan generieren
      if (overall === 'BULLISH' && waitConditions.length < 2) {
        actionPlan.push('✅ Long-Positionen bevorzugen');
        actionPlan.push('🎯 Breakout über Resistance handeln');
      } else if (overall === 'BEARISH' && waitConditions.length < 2) {
        actionPlan.push('✅ Short-Positionen bevorzugen');
        actionPlan.push('🎯 Breakdown unter Support handeln');
      } else {
        actionPlan.push('⏳ Geduldig warten auf bessere Setups');
        actionPlan.push('📚 Markt beobachten und analysieren');
      }
      
      // Recommendations
      let recommendation = '';
      if (waitConditions.length > 2) {
        recommendation = '🛑 WARTEN - Zu viele ungünstige Bedingungen';
        overall = 'WAIT';
      } else if (confidence > 75) {
        recommendation = `🔥 ${overall} - Hohe Confidence, gute Trading-Gelegenheit`;
      } else if (confidence > 60) {
        recommendation = `⚡ ${overall} - Moderate Confidence, vorsichtig handeln`;
      } else {
        recommendation = '⏳ NEUTRAL - Unklare Marktlage, abwarten';
      }
      
      const marketAnalysis: MarketAnalysis = {
        overall,
        sentiment,
        volatility,
        liquidity,
        recommendation,
        waitConditions,
        actionPlan,
        marketConditions: {
          trend: `${emaCross.signal} (ADX: ${adx.toFixed(1)})`,
          momentum: `RSI: ${rsi.toFixed(1)} ${rsi < 30 ? '(Oversold)' : rsi > 70 ? '(Overbought)' : '(Neutral)'}`,
          volume: `${(volumeRatio * 100).toFixed(0)}% des Durchschnitts`,
          support: recentLow,
          resistance: recentHigh,
        },
        confidence: Math.min(confidence, 95)
      };
      
      setAnalysis(marketAnalysis);
      console.log('🧠 KI-Marktanalyse abgeschlossen:', marketAnalysis);
      
    } catch (error) {
      console.error('Fehler bei Marktanalyse:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analysis,
    isAnalyzing,
    analyzeMarket
  };
};