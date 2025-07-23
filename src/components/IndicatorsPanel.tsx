import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TechnicalIndicator } from "@/types/trading";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface IndicatorsPanelProps {
  indicators: TechnicalIndicator[];
}

export const IndicatorsPanel = ({ indicators }: IndicatorsPanelProps) => {
  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'BUY':
        return <TrendingUp className="w-4 h-4 text-success" />;
      case 'SELL':
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY':
        return 'bg-success/20 text-success border-success/30';
      case 'SELL':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Technische Indikatoren
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {indicators.map((indicator, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
            <div className="flex-1">
              <div className="font-medium text-sm">{indicator.name}</div>
              <div className="text-xs text-muted-foreground">
                Wert: {indicator.value.toFixed(2)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {getSignalIcon(indicator.signal)}
                <Badge className={getSignalColor(indicator.signal)}>
                  {indicator.signal}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {(indicator.strength * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        ))}
        
        {/* AI Confidence Score */}
        <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">KI-Vertrauen</span>
            <span className="text-lg font-bold text-primary">87%</span>
          </div>
          <div className="mt-2 w-full bg-secondary rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '87%' }}></div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Starkes Kaufsignal basierend auf Momentum und Volume
          </p>
        </div>
      </CardContent>
    </Card>
  );
};