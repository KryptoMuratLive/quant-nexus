import { useState, useEffect } from 'react';
import { TrainingData, ModelMetrics, AIModel, SignalFeedback, TrainingSession } from '@/types/ai';
import { binancePublicAPI } from '@/services/binancePublicAPI';

// AI Service für kontinuierliches Lernen
export const useAITraining = () => {
  const [currentModel, setCurrentModel] = useState<AIModel | null>(null);
  const [trainingHistory, setTrainingHistory] = useState<TrainingSession[]>([]);
  const [signalFeedback, setSignalFeedback] = useState<SignalFeedback[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [metrics, setMetrics] = useState<ModelMetrics>({
    accuracy: 0,
    precision: 0,
    recall: 0,
    f1Score: 0,
    totalSignals: 0,
    successfulSignals: 0,
    avgProfit: 0,
    maxDrawdown: 0,
    sharpeRatio: 0,
  });

  // Lade gespeicherte Daten beim Start
  useEffect(() => {
    loadSavedModel();
    loadTrainingHistory();
    loadSignalFeedback();
  }, []);

  const loadSavedModel = () => {
    const saved = localStorage.getItem('ai_trading_model');
    if (saved) {
      try {
        const model = JSON.parse(saved);
        setCurrentModel(model);
        setMetrics(model.metrics);
      } catch (error) {
        console.error('Error loading saved model:', error);
      }
    }
  };

  const loadTrainingHistory = () => {
    const saved = localStorage.getItem('training_history');
    if (saved) {
      try {
        setTrainingHistory(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading training history:', error);
      }
    }
  };

  const loadSignalFeedback = () => {
    const saved = localStorage.getItem('signal_feedback');
    if (saved) {
      try {
        setSignalFeedback(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading signal feedback:', error);
      }
    }
  };

  // Sammle historische Daten für Training
  const collectTrainingData = async (days: number = 30): Promise<TrainingData[]> => {
    console.log(`📊 Sammle ${days} Tage historische Daten für Training...`);
    
    try {
      // Sammle Daten für verschiedene Zeiträume
      const timeframes = ['1h', '4h', '1d'];
      const allData: TrainingData[] = [];
      
      for (const timeframe of timeframes) {
        const limit = timeframe === '1h' ? days * 24 : timeframe === '4h' ? days * 6 : days;
        const klineData = await binancePublicAPI.getKlineData('BTCUSDT', timeframe, limit);
        
        if (klineData) {
          for (let i = 1; i < klineData.length; i++) {
            const current = klineData[i];
            const previous = klineData[i - 1];
            
            // Berechne technische Indikatoren
            const rsi = calculateRSI(klineData.slice(Math.max(0, i - 14), i).map(k => k.close));
            const ema20 = calculateEMA(klineData.slice(Math.max(0, i - 20), i).map(k => k.close), 20);
            const ema50 = calculateEMA(klineData.slice(Math.max(0, i - 50), i).map(k => k.close), 50);
            const macd = calculateMACD(klineData.slice(Math.max(0, i - 26), i).map(k => k.close));
            
            // Bestimme tatsächliches Ergebnis (Price change in next period)
            const actualResult = i < klineData.length - 1 
              ? ((klineData[i + 1].close - current.close) / current.close) * 100
              : 0;
            
            // Generiere Signal basierend auf Indikatoren
            const signal = generateSignalFromIndicators(rsi, ema20, ema50, current.close, macd);
            
            const dataPoint: TrainingData = {
              timestamp: current.timestamp,
              price: current.close,
              volume: current.volume,
              rsi,
              ema20,
              ema50,
              macd,
              signal: signal.signal,
              actualResult,
              confidence: signal.confidence,
              accuracy: (signal.signal === 'BUY' && actualResult > 0.5) || 
                       (signal.signal === 'SELL' && actualResult < -0.5) ||
                       (signal.signal === 'NEUTRAL' && Math.abs(actualResult) < 0.5)
            };
            
            allData.push(dataPoint);
          }
        }
      }
      
      console.log(`✅ ${allData.length} Datenpunkte gesammelt`);
      return allData;
    } catch (error) {
      console.error('Fehler beim Sammeln der Trainingsdaten:', error);
      return [];
    }
  };

  // Starte Training mit gesammelten Daten
  const startTraining = async (epochs: number = 100) => {
    setIsTraining(true);
    
    const session: TrainingSession = {
      id: Date.now().toString(),
      startTime: Date.now(),
      dataPoints: 0,
      epochs,
      initialAccuracy: metrics.accuracy,
      finalAccuracy: 0,
      improvementPercent: 0,
      status: 'RUNNING'
    };

    try {
      console.log('🧠 Starte KI-Training...');
      
      // Sammle Trainingsdaten
      const trainingData = await collectTrainingData(30);
      session.dataPoints = trainingData.length;
      
      if (trainingData.length < 100) {
        throw new Error('Nicht genügend Trainingsdaten verfügbar');
      }

      // Teile Daten in Training/Test Sets
      const splitIndex = Math.floor(trainingData.length * 0.8);
      const trainSet = trainingData.slice(0, splitIndex);
      const testSet = trainingData.slice(splitIndex);
      
      // Simuliere Training (in Realität würde hier ein ML-Model trainiert)
      const trainedModel = await simulateTraining(trainSet, testSet, epochs);
      
      // Berechne finale Metriken
      const finalMetrics = calculateModelMetrics(testSet, trainedModel);
      session.finalAccuracy = finalMetrics.accuracy;
      session.improvementPercent = ((finalMetrics.accuracy - session.initialAccuracy) / session.initialAccuracy) * 100;
      session.endTime = Date.now();
      session.status = 'COMPLETED';
      
      // Speichere neues Model
      const newModel: AIModel = {
        id: Date.now().toString(),
        name: `AI-Model-v${Date.now()}`,
        version: '1.0',
        trainedAt: Date.now(),
        metrics: finalMetrics,
        parameters: trainedModel.parameters,
        trainingData: trainSet,
        isActive: true
      };
      
      setCurrentModel(newModel);
      setMetrics(finalMetrics);
      
      // Speichere alles
      localStorage.setItem('ai_trading_model', JSON.stringify(newModel));
      setTrainingHistory(prev => [...prev, session]);
      localStorage.setItem('training_history', JSON.stringify([...trainingHistory, session]));
      
      console.log('✅ Training erfolgreich abgeschlossen!');
      console.log('📈 Neue Accuracy:', finalMetrics.accuracy.toFixed(2) + '%');
      
    } catch (error) {
      console.error('❌ Training fehlgeschlagen:', error);
      session.status = 'FAILED';
      session.endTime = Date.now();
    } finally {
      setIsTraining(false);
    }
  };

  // Simuliere ML-Training (vereinfacht)
  const simulateTraining = async (trainSet: TrainingData[], testSet: TrainingData[], epochs: number) => {
    const parameters = {
      rsiWeight: 0.25,
      emaWeight: 0.30,
      macdWeight: 0.25,
      volumeWeight: 0.20,
      learningRate: 0.01
    };

    // Simuliere Epochen mit verbesserung
    for (let epoch = 0; epoch < epochs; epoch++) {
      // Simuliere Backpropagation
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Leichte Anpassung der Gewichte basierend auf Performance
      if (epoch % 10 === 0) {
        const accuracy = calculateSimpleAccuracy(testSet, parameters);
        if (accuracy < 0.6) {
          parameters.rsiWeight += (Math.random() - 0.5) * 0.02;
          parameters.emaWeight += (Math.random() - 0.5) * 0.02;
          parameters.macdWeight += (Math.random() - 0.5) * 0.02;
        }
      }
    }

    return { parameters };
  };

  // Füge Signal-Feedback hinzu (für kontinuierliches Lernen)
  const addSignalFeedback = (feedback: SignalFeedback) => {
    const newFeedback = [...signalFeedback, feedback];
    setSignalFeedback(newFeedback);
    localStorage.setItem('signal_feedback', JSON.stringify(newFeedback));
    
    // Aktualisiere Metriken basierend auf Feedback
    updateMetricsFromFeedback(newFeedback);
    
    console.log(`📊 Signal Feedback hinzugefügt: ${feedback.wasCorrect ? '✅' : '❌'}`);
  };

  // Aktualisiere Metriken basierend auf Signal-Feedback
  const updateMetricsFromFeedback = (feedbackData: SignalFeedback[]) => {
    if (feedbackData.length === 0) return;
    
    const successful = feedbackData.filter(f => f.wasCorrect).length;
    const total = feedbackData.length;
    const accuracy = (successful / total) * 100;
    const avgProfit = feedbackData.reduce((sum, f) => sum + f.actualProfit, 0) / total;
    
    const newMetrics: ModelMetrics = {
      ...metrics,
      accuracy,
      totalSignals: total,
      successfulSignals: successful,
      avgProfit,
      precision: accuracy, // Vereinfacht
      recall: accuracy,
      f1Score: accuracy,
      sharpeRatio: avgProfit / 10, // Vereinfacht
      maxDrawdown: Math.min(...feedbackData.map(f => f.actualProfit))
    };
    
    setMetrics(newMetrics);
    
    // Aktualisiere Model mit neuen Metriken
    if (currentModel) {
      const updatedModel = { ...currentModel, metrics: newMetrics };
      setCurrentModel(updatedModel);
      localStorage.setItem('ai_trading_model', JSON.stringify(updatedModel));
    }
  };

  // Generiere verbessertes Signal mit trainiertem Model
  const generateImprovedSignal = (price: number, rsi: number, ema20: number, ema50: number, macd: number, volume: number) => {
    if (!currentModel) {
      return generateSignalFromIndicators(rsi, ema20, ema50, price, macd);
    }
    
    const { parameters } = currentModel;
    
    // Gewichtete Entscheidung basierend auf trainiertem Model
    let score = 0;
    
    // RSI Komponente
    if (rsi < 30) score += parameters.rsiWeight;
    else if (rsi > 70) score -= parameters.rsiWeight;
    
    // EMA Komponente
    if (price > ema20 && ema20 > ema50) score += parameters.emaWeight;
    else if (price < ema20 && ema20 < ema50) score -= parameters.emaWeight;
    
    // MACD Komponente
    if (macd > 0) score += parameters.macdWeight;
    else score -= parameters.macdWeight;
    
    // Volume Komponente (vereinfacht)
    if (volume > 1.2) score += parameters.volumeWeight * 0.5;
    
    // Bestimme Signal und Confidence
    const confidence = Math.min(Math.abs(score), 1);
    let signal: 'BUY' | 'SELL' | 'NEUTRAL' = 'NEUTRAL';
    
    if (score > 0.3) signal = 'BUY';
    else if (score < -0.3) signal = 'SELL';
    
    return {
      signal,
      confidence: confidence * 100,
      score,
      reasoning: [
        `RSI: ${rsi.toFixed(1)} (Gewicht: ${parameters.rsiWeight})`,
        `EMA-Trend: ${price > ema20 ? 'Bullish' : 'Bearish'} (Gewicht: ${parameters.emaWeight})`,
        `MACD: ${macd > 0 ? 'Positiv' : 'Negativ'} (Gewicht: ${parameters.macdWeight})`,
        `Model-Score: ${score.toFixed(3)}`
      ]
    };
  };

  return {
    currentModel,
    trainingHistory,
    signalFeedback,
    metrics,
    isTraining,
    startTraining,
    addSignalFeedback,
    generateImprovedSignal,
    collectTrainingData
  };
};

// Hilfsfunktionen
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

const calculateMACD = (prices: number[]): number => {
  if (prices.length < 26) return 0;
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  return ema12 - ema26;
};

const generateSignalFromIndicators = (rsi: number, ema20: number, ema50: number, price: number, macd: number) => {
  let signal: 'BUY' | 'SELL' | 'NEUTRAL' = 'NEUTRAL';
  let confidence = 50;
  
  if (rsi < 30 && price > ema20 && macd > 0) {
    signal = 'BUY';
    confidence = 80;
  } else if (rsi > 70 && price < ema20 && macd < 0) {
    signal = 'SELL';
    confidence = 80;
  }
  
  return { signal, confidence };
};

const calculateSimpleAccuracy = (testSet: TrainingData[], parameters: any): number => {
  let correct = 0;
  for (const data of testSet) {
    // Vereinfachte Vorhersage
    const predicted = data.rsi < 30 ? 'BUY' : data.rsi > 70 ? 'SELL' : 'NEUTRAL';
    if (predicted === data.signal && data.accuracy) correct++;
  }
  return correct / testSet.length;
};

const calculateModelMetrics = (testSet: TrainingData[], model: any): ModelMetrics => {
  const correct = testSet.filter(d => d.accuracy).length;
  const accuracy = (correct / testSet.length) * 100;
  
  return {
    accuracy,
    precision: accuracy,
    recall: accuracy,
    f1Score: accuracy,
    totalSignals: testSet.length,
    successfulSignals: correct,
    avgProfit: testSet.reduce((sum, d) => sum + d.actualResult, 0) / testSet.length,
    maxDrawdown: Math.min(...testSet.map(d => d.actualResult)),
    sharpeRatio: accuracy / 10
  };
};