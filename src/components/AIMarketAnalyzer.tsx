import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useMarketAnalysis, MarketAnalysis } from "@/hooks/useMarketAnalysis";
import { useTradingData } from "@/hooks/useTradingData";
import { useState, useEffect } from "react";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Volume2,
  Shield,
  Target,
  Zap,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const AIMarketAnalyzer = () => {
  const { chartData, currentPrice } = useTradingData();
  const { analysis, isAnalyzing, analyzeMarket } = useMarketAnalysis();
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const { toast } = useToast();

  // Auto-Analyse alle 60 Sekunden
  useEffect(() => {
    if (autoAnalyze && chartData.length > 50) {
      analyzeMarket(chartData, currentPrice);
      const interval = setInterval(() => {
        analyzeMarket(chartData, currentPrice);
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [autoAnalyze, chartData, currentPrice]);

  const getOverallColor = (overall: string) => {
    switch (overall) {
      case 'BULLISH': return 'bg-success text-success-foreground';
      case 'BEARISH': return 'bg-destructive text-destructive-foreground';
      case 'WAIT': return 'bg-warning text-warning-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'GREED': return <TrendingUp className="w-4 h-4 text-destructive" />;
      case 'FEAR': return <TrendingDown className="w-4 h-4 text-success" />;
      default: return <BarChart3 className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getVolatilityColor = (volatility: string) => {
    switch (volatility) {
      case 'EXTREME': return 'text-destructive';
      case 'HIGH': return 'text-warning';
      case 'MEDIUM': return 'text-primary';
      case 'LOW': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header - Mobile optimiert */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Brain className="w-5 h-5 md:w-6 md:h-6" />
              KI-Marktanalyse
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={autoAnalyze ? "default" : "outline"}
                onClick={() => setAutoAnalyze(!autoAnalyze)}
                className="text-xs"
              >
                <Eye className="w-3 h-3 mr-1" />
                Auto {autoAnalyze ? 'AN' : 'AUS'}
              </Button>
              <Button
                size="sm"
                onClick={() => analyzeMarket(chartData, currentPrice)}
                disabled={isAnalyzing}
                className="text-xs"
              >
                {isAnalyzing ? "Analysiert..." : "Analysieren"}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {analysis && (
          <CardContent className="pt-0">
            {/* Haupt-Status - Mobile Stack Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              <div className="text-center p-3 rounded-lg bg-secondary/50">
                <Badge className={getOverallColor(analysis.overall)}>
                  {analysis.overall}
                </Badge>
                <div className="text-xs text-muted-foreground mt-1">Gesamtbild</div>
              </div>
              
              <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-secondary/50">
                {getSentimentIcon(analysis.sentiment)}
                <div>
                  <div className="text-sm font-medium">{analysis.sentiment}</div>
                  <div className="text-xs text-muted-foreground">Sentiment</div>
                </div>
              </div>
              
              <div className="text-center p-3 rounded-lg bg-secondary/50">
                <div className={`text-sm font-bold ${getVolatilityColor(analysis.volatility)}`}>
                  {analysis.volatility}
                </div>
                <div className="text-xs text-muted-foreground">Volatilität</div>
              </div>
              
              <div className="text-center p-3 rounded-lg bg-secondary/50">
                <div className="text-sm font-bold">{analysis.confidence}%</div>
                <div className="text-xs text-muted-foreground">Confidence</div>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>KI-Vertrauen</span>
                <span className="font-bold">{analysis.confidence}%</span>
              </div>
              <Progress value={analysis.confidence} className="h-2" />
            </div>

            {/* Recommendation - Mobile optimiert */}
            <div className="p-3 md:p-4 rounded-lg bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 mb-4">
              <div className="flex items-start gap-2">
                <Brain className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-sm md:text-base">KI-Empfehlung</div>
                  <div className="text-sm text-muted-foreground">{analysis.recommendation}</div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Detaillierte Analyse - Mobile Cards */}
      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Warte-Bedingungen */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Clock className="w-4 h-4 md:w-5 md:h-5" />
                Warte-Bedingungen
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.waitConditions.length === 0 ? (
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Keine Warte-Bedingungen - Bereit zum Handeln!</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {analysis.waitConditions.map((condition, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                      <span>{condition}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Plan */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Target className="w-4 h-4 md:w-5 md:h-5" />
                Action Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analysis.actionPlan.map((action, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Marktbedingungen - Mobile optimiert */}
      {analysis && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <BarChart3 className="w-4 h-4 md:w-5 md:h-5" />
              Aktuelle Marktbedingungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div className="p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Trend</span>
                </div>
                <div className="text-sm">{analysis.marketConditions.trend}</div>
              </div>
              
              <div className="p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-warning" />
                  <span className="text-sm font-medium">Momentum</span>
                </div>
                <div className="text-sm">{analysis.marketConditions.momentum}</div>
              </div>
              
              <div className="p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-2 mb-2">
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Volume</span>
                </div>
                <div className="text-sm">{analysis.marketConditions.volume}</div>
              </div>
              
              <div className="p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium">Levels</span>
                </div>
                <div className="text-xs">
                  <div>S: ${analysis.marketConditions.support.toFixed(0)}</div>
                  <div>R: ${analysis.marketConditions.resistance.toFixed(0)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">KI analysiert Marktbedingungen...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Analysis State */}
      {!analysis && !isAnalyzing && (
        <Card>
          <CardContent className="p-6 text-center">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Starte eine KI-Marktanalyse um detaillierte Empfehlungen zu erhalten.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};