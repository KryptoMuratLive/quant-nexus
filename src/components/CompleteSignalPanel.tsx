import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signalGenerator, TradingSignal } from "@/services/signalGenerator";
import { useTradingData } from "@/hooks/useTradingData";
import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Shield, 
  Zap, 
  AlertTriangle,
  DollarSign,
  BarChart3,
  Clock,
  Copy,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const CompleteSignalPanel = () => {
  const { chartData, currentPrice } = useTradingData();
  const [currentSignal, setCurrentSignal] = useState<TradingSignal | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { toast } = useToast();

  const generateSignal = async () => {
    if (chartData.length < 50) return;
    
    setIsGenerating(true);
    try {
      console.log('🧠 Generiere Complete Trading Signal...');
      const signal = signalGenerator.generateCompleteSignal(chartData, currentPrice);
      setCurrentSignal(signal);
      
      if (signal.direction !== 'WAIT' && signal.confidence > 70) {
        toast({
          title: `🚨 ${signal.direction} Signal`,
          description: `${signal.confidence}% Confidence | Hebel: ${signal.maxLeverage}x`,
          duration: 8000,
        });
      }
    } catch (error) {
      console.error('Fehler bei Signal-Generierung:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-refresh alle 30 Sekunden
  useEffect(() => {
    if (autoRefresh && chartData.length > 0) {
      generateSignal();
      const interval = setInterval(generateSignal, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, chartData, currentPrice]);

  const copySignalToClipboard = () => {
    if (!currentSignal) return;
    
    const signalText = `
🎯 ${currentSignal.direction} Signal - ${currentSignal.symbol}
💰 Entry: $${currentSignal.entryPrice}
🛡️ Stop Loss: $${currentSignal.stopLoss}
🎯 TP1: $${currentSignal.takeProfit1}
🎯 TP2: $${currentSignal.takeProfit2}
🎯 TP3: $${currentSignal.takeProfit3}
⚡ Max Hebel: ${currentSignal.maxLeverage}x
📊 Confidence: ${currentSignal.confidence}%
💼 Position Size: ${currentSignal.positionSize}%
    `;
    
    navigator.clipboard.writeText(signalText);
    toast({
      title: "Signal kopiert!",
      description: "Trading-Signal in Zwischenablage kopiert",
    });
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'LONG':
        return <TrendingUp className="w-5 h-5 text-success" />;
      case 'SHORT':
        return <TrendingDown className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'LONG':
        return 'bg-success text-success-foreground';
      case 'SHORT':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return 'bg-success/20 text-success border-success/30';
      case 'MEDIUM':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'HIGH':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const signalQuality = currentSignal 
    ? signalGenerator.getSignalQuality(currentSignal.confidence, currentSignal.riskLevel)
    : null;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Complete Trading Signals
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={autoRefresh ? "default" : "outline"}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto
            </Button>
            <Button
              size="sm"
              onClick={generateSignal}
              disabled={isGenerating}
            >
              {isGenerating ? "Analysiere..." : "Signal generieren"}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!currentSignal && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Generiere ein Signal um detaillierte Trading-Empfehlungen zu erhalten.
            </AlertDescription>
          </Alert>
        )}

        {currentSignal && (
          <>
            {/* Haupt-Signal */}
            <div className="p-6 rounded-lg border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getDirectionIcon(currentSignal.direction)}
                  <div>
                    <div className="text-2xl font-bold">{currentSignal.symbol}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(currentSignal.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge className={getDirectionColor(currentSignal.direction)}>
                    {currentSignal.direction}
                  </Badge>
                  <Badge className={getRiskColor(currentSignal.riskLevel)}>
                    {currentSignal.riskLevel} RISK
                  </Badge>
                  {signalQuality && (
                    <Badge variant="outline" className={signalQuality.color}>
                      {signalQuality.quality}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Confidence Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Signal Confidence</span>
                  <span className="font-bold">{currentSignal.confidence}%</span>
                </div>
                <Progress value={currentSignal.confidence} className="h-2" />
              </div>

              {/* Preise & Levels */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-3 bg-secondary/50 rounded">
                  <div className="text-xs text-muted-foreground">Entry</div>
                  <div className="font-bold">${currentSignal.entryPrice.toLocaleString()}</div>
                </div>
                <div className="text-center p-3 bg-destructive/20 rounded">
                  <div className="text-xs text-muted-foreground">Stop Loss</div>
                  <div className="font-bold text-destructive">${currentSignal.stopLoss.toLocaleString()}</div>
                </div>
                <div className="text-center p-3 bg-success/20 rounded">
                  <div className="text-xs text-muted-foreground">TP1</div>
                  <div className="font-bold text-success">${currentSignal.takeProfit1.toLocaleString()}</div>
                </div>
                <div className="text-center p-3 bg-success/20 rounded">
                  <div className="text-xs text-muted-foreground">TP2</div>
                  <div className="font-bold text-success">${currentSignal.takeProfit2.toLocaleString()}</div>
                </div>
                <div className="text-center p-3 bg-success/20 rounded">
                  <div className="text-xs text-muted-foreground">TP3</div>
                  <div className="font-bold text-success">${currentSignal.takeProfit3.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Risk Management */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-warning" />
                  <span className="text-sm font-medium">Max Hebel</span>
                </div>
                <div className="text-2xl font-bold">{currentSignal.maxLeverage}x</div>
                <div className="text-xs text-muted-foreground">
                  {currentSignal.confidence >= 80 ? 'Hohes Vertrauen' : 'Konservativ'}
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium">Position Size</span>
                </div>
                <div className="text-2xl font-bold">{currentSignal.positionSize}%</div>
                <div className="text-xs text-muted-foreground">
                  Vom Portfolio
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Risk/Reward</span>
                </div>
                <div className="text-2xl font-bold">1:{currentSignal.riskReward}</div>
                <div className="text-xs text-muted-foreground">
                  Ratio
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Timeframe</span>
                </div>
                <div className="text-sm font-bold">{currentSignal.timeframe}</div>
                <div className="text-xs text-muted-foreground">
                  Multi-TF
                </div>
              </Card>
            </div>

            {/* Technische Details */}
            <div className="space-y-3">
              <h4 className="font-medium">Technische Indikatoren</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>RSI: <span className="font-bold">{currentSignal.technicals.rsi.toFixed(1)}</span></div>
                <div>MACD: <span className="font-bold">{currentSignal.technicals.macd.toFixed(2)}</span></div>
                <div>ADX: <span className="font-bold">{currentSignal.technicals.adx.toFixed(1)}</span></div>
                <div>ATR: <span className="font-bold">{currentSignal.technicals.atr.toFixed(0)}</span></div>
              </div>
            </div>

            {/* Signal-Begründung */}
            <div className="space-y-2">
              <h4 className="font-medium">Signal-Begründung</h4>
              <div className="space-y-1">
                {currentSignal.reasoning.map((reason, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Aktionen */}
            <div className="flex gap-2">
              <Button onClick={copySignalToClipboard} className="flex-1">
                <Copy className="w-4 h-4 mr-2" />
                Signal kopieren
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => window.open(`https://www.tradingview.com/chart/?symbol=BINANCE:${currentSignal?.symbol}USDT`, '_blank')}
              >
                Trading View öffnen
              </Button>
            </div>

            {/* Disclaimer */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Risiko-Hinweis:</strong> Trading mit Hebel ist hochriskant. 
                Verwende nur Geld, das du dir leisten kannst zu verlieren. 
                Dies ist keine Finanzberatung.
              </AlertDescription>
            </Alert>
          </>
        )}
      </CardContent>
    </Card>
  );
};