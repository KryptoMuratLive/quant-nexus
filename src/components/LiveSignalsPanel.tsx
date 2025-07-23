import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBinanceAPI } from "@/hooks/useBinanceAPI";
import { useAITraining } from "@/hooks/useAITraining";
import { useState, useEffect } from "react";
import { Brain, TrendingUp, TrendingDown, Zap, Target, AlertCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TradingSignal {
  symbol: string;
  signal: 'BUY' | 'SELL' | 'NEUTRAL';
  confidence: number;
  currentPrice: number;
  indicators: {
    rsi: number;
    ema20: number;
    ema50: number;
  };
  reasoning: string[];
  timestamp: number;
}

export const LiveSignalsPanel = () => {
  const { isConnected } = useBinanceAPI();
  const { generateImprovedSignal, currentModel, addSignalFeedback } = useAITraining();
  const [currentSignal, setCurrentSignal] = useState<TradingSignal | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const { toast } = useToast();

  const fetchSignal = async () => {
    setIsGenerating(true);
    try {
      // Verwende das trainierte KI-Model für bessere Signale
      const mockData = {
        price: 97250,
        rsi: 67.3,
        ema20: 96800,
        ema50: 95200,
        macd: 125.67,
        volume: 1.23
      };
      
      const aiSignal = generateImprovedSignal(
        mockData.price,
        mockData.rsi,
        mockData.ema20,
        mockData.ema50,
        mockData.macd,
        mockData.volume
      );
      
      const signal: TradingSignal = {
        symbol: 'BTCUSDT',
        signal: aiSignal.signal,
        confidence: Math.round(aiSignal.confidence),
        currentPrice: mockData.price,
        indicators: {
          rsi: mockData.rsi,
          ema20: mockData.ema20,
          ema50: mockData.ema50
        },
        reasoning: 'reasoning' in aiSignal ? aiSignal.reasoning : ['Standard technische Analyse'],
        timestamp: Date.now()
      };
      
      setCurrentSignal(signal);
      
      // Show notification for strong signals
      if (signal.confidence > 70) {
        toast({
          title: `${currentModel ? '🧠 KI-Enhanced' : '🚨'} ${signal.signal} Signal`,
          description: `${signal.confidence}% Confidence - $${signal.currentPrice}`,
          duration: 5000,
        });
      }
      
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Signal konnte nicht generiert werden",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-refresh every 30 seconds when enabled
  useEffect(() => {
    if (autoRefresh && isConnected) {
      const interval = setInterval(fetchSignal, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, isConnected]);

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY':
        return 'bg-success text-success-foreground';
      case 'SELL':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-success';
    if (confidence >= 60) return 'text-warning';
    return 'text-muted-foreground';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Live Trading Signale
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={autoRefresh ? "default" : "outline"}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? "Auto ON" : "Auto OFF"}
            </Button>
            <Button
              size="sm"
              onClick={fetchSignal}
              disabled={isGenerating || !isConnected}
            >
              {isGenerating ? "Analysiere..." : "Signal generieren"}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isConnected && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Verbinde deine Binance API Keys um Live-Signale zu erhalten.
            </AlertDescription>
          </Alert>
        )}

        {currentSignal && (
          <>
            {/* Main Signal */}
            <div className="p-6 rounded-lg border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/20">
                    {currentSignal.signal === 'BUY' ? (
                      <TrendingUp className="w-6 h-6 text-success" />
                    ) : currentSignal.signal === 'SELL' ? (
                      <TrendingDown className="w-6 h-6 text-destructive" />
                    ) : (
                      <Target className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{currentSignal.symbol}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(currentSignal.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    ${currentSignal.currentPrice.toLocaleString()}
                  </div>
                  <Badge className={getSignalColor(currentSignal.signal)}>
                    {currentSignal.signal}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">KI-Vertrauen</div>
                  <div className={`text-xl font-bold ${getConfidenceColor(currentSignal.confidence)}`}>
                    {currentSignal.confidence}%
                  </div>
                </div>
                <div className="w-32 bg-secondary rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      currentSignal.confidence >= 80 ? 'bg-success' :
                      currentSignal.confidence >= 60 ? 'bg-warning' : 'bg-muted'
                    }`}
                    style={{ width: `${currentSignal.confidence}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Technical Indicators */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-secondary/50 text-center">
                <div className="text-sm text-muted-foreground">RSI(14)</div>
                <div className="text-lg font-bold">{currentSignal.indicators.rsi}</div>
                <div className="text-xs">
                  {currentSignal.indicators.rsi < 30 ? '🔥 Oversold' :
                   currentSignal.indicators.rsi > 70 ? '❄️ Overbought' : '⚖️ Neutral'}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 text-center">
                <div className="text-sm text-muted-foreground">EMA(20)</div>
                <div className="text-lg font-bold">${currentSignal.indicators.ema20.toLocaleString()}</div>
                <div className="text-xs">
                  {currentSignal.currentPrice > currentSignal.indicators.ema20 ? '📈 Above' : '📉 Below'}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 text-center">
                <div className="text-sm text-muted-foreground">EMA(50)</div>
                <div className="text-lg font-bold">${currentSignal.indicators.ema50.toLocaleString()}</div>
                <div className="text-xs">
                  {currentSignal.indicators.ema20 > currentSignal.indicators.ema50 ? '🚀 Bullish' : '🐻 Bearish'}
                </div>
              </div>
            </div>

            {/* Signal Reasoning */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Signal-Begründung
              </h4>
              <div className="space-y-1">
                {currentSignal.reasoning.map((reason, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Recommendations */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">🎯 Empfohlene Aktion</h4>
              {currentSignal.signal === 'BUY' && currentSignal.confidence > 70 && (
                <div className="text-sm space-y-1">
                  <p>• <strong>Long Position</strong> bei ${currentSignal.currentPrice}</p>
                  <p>• Stop-Loss: ${(currentSignal.currentPrice * 0.98).toFixed(2)} (-2%)</p>
                  <p>• Take-Profit: ${(currentSignal.currentPrice * 1.03).toFixed(2)} (+3%)</p>
                </div>
              )}
              {currentSignal.signal === 'SELL' && currentSignal.confidence > 70 && (
                <div className="text-sm space-y-1">
                  <p>• <strong>Short Position</strong> bei ${currentSignal.currentPrice}</p>
                  <p>• Stop-Loss: ${(currentSignal.currentPrice * 1.02).toFixed(2)} (+2%)</p>
                  <p>• Take-Profit: ${(currentSignal.currentPrice * 0.97).toFixed(2)} (-3%)</p>
                </div>
              )}
              {(currentSignal.signal === 'NEUTRAL' || currentSignal.confidence < 70) && (
                <p className="text-sm">⏳ Warten auf bessere Marktbedingungen. Signal zu schwach für Trading.</p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};