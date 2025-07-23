import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChartData } from "@/types/trading";
import { binancePublicAPI } from '@/services/binancePublicAPI';
import { useState, useEffect } from 'react';
import { Clock, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

interface CandlestickChartProps {
  data: ChartData[];
  currentPrice: number;
}

interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  changePercent: number;
}

export const CandlestickChart = ({ data, currentPrice }: CandlestickChartProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('15m');
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const timeframes = [
    { key: '1m', label: '1M', limit: 60, description: 'Letzte Stunde' },
    { key: '15m', label: '15M', limit: 96, description: 'Letzte 24h' },
    { key: '4h', label: '4H', limit: 168, description: 'Letzte Woche' },
    { key: '1d', label: '1D', limit: 30, description: 'Letzte 30 Tage' }
  ];

  const fetchCandleData = async (timeframe: string) => {
    setIsLoading(true);
    try {
      console.log(`🕯️ Loading ${timeframe} candlestick data...`);
      const limit = timeframes.find(tf => tf.key === timeframe)?.limit || 100;
      const klineData = await binancePublicAPI.getKlineData('BTCUSDT', timeframe, limit);
      
      if (klineData) {
        const processedData = klineData.map((candle, index) => {
          const change = candle.close - candle.open;
          const changePercent = (change / candle.open) * 100;
          
          return {
            timestamp: candle.timestamp,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
            volume: candle.volume,
            change,
            changePercent,
          };
        });
        
        setChartData(processedData);
        console.log(`✅ Loaded ${processedData.length} ${timeframe} candles`);
      }
    } catch (error) {
      console.error('Error loading candlestick data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandleData(selectedTimeframe);
  }, [selectedTimeframe]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    switch (selectedTimeframe) {
      case '1m':
      case '15m':
        return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
      case '4h':
        return date.toLocaleDateString('de-DE', { month: 'short', day: 'numeric', hour: '2-digit' }) + 'h';
      case '1d':
        return date.toLocaleDateString('de-DE', { month: 'short', day: 'numeric' });
      default:
        return date.toLocaleTimeString();
    }
  };

  const getCandleColor = (candle: CandleData) => {
    return candle.close >= candle.open ? 'text-success' : 'text-destructive';
  };

  const getCandleBg = (candle: CandleData) => {
    return candle.close >= candle.open ? 'bg-success/20' : 'bg-destructive/20';
  };

  const selectedTf = timeframes.find(tf => tf.key === selectedTimeframe);

  // Calculate stats from current data
  const stats = chartData.length > 0 ? {
    highest: Math.max(...chartData.map(c => c.high)),
    lowest: Math.min(...chartData.map(c => c.low)),
    avgVolume: chartData.reduce((sum, c) => sum + c.volume, 0) / chartData.length,
    greenCandles: chartData.filter(c => c.close >= c.open).length,
    redCandles: chartData.filter(c => c.close < c.open).length,
  } : null;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Candlestick Chart - BTC/USDT
          </CardTitle>
          <div className="flex gap-1">
            {timeframes.map((tf) => (
              <Button
                key={tf.key}
                size="sm"
                variant={selectedTimeframe === tf.key ? "default" : "outline"}
                onClick={() => setSelectedTimeframe(tf.key)}
                disabled={isLoading}
                className="text-xs"
              >
                {tf.label}
              </Button>
            ))}
          </div>
        </div>
        {selectedTf && (
          <p className="text-sm text-muted-foreground">{selectedTf.description}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Chart Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-secondary/50">
              <div className="text-xs text-muted-foreground">Höchstwert</div>
              <div className="font-medium">${stats.highest.toLocaleString()}</div>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50">
              <div className="text-xs text-muted-foreground">Tiefstwert</div>
              <div className="font-medium">${stats.lowest.toLocaleString()}</div>
            </div>
            <div className="p-3 rounded-lg bg-success/20">
              <div className="text-xs text-muted-foreground">Bullish</div>
              <div className="font-medium text-success">{stats.greenCandles} Kerzen</div>
            </div>
            <div className="p-3 rounded-lg bg-destructive/20">
              <div className="text-xs text-muted-foreground">Bearish</div>
              <div className="font-medium text-destructive">{stats.redCandles} Kerzen</div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Lade {selectedTimeframe} Kerzen...</span>
            </div>
          </div>
        )}

        {/* Candlestick Display */}
        {!isLoading && chartData.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Letzten {chartData.length} Kerzen</span>
              <span className="text-muted-foreground">Zeit | Open | High | Low | Close | Vol</span>
            </div>
            
            <div className="max-h-64 overflow-y-auto space-y-1">
              {chartData.slice(-20).reverse().map((candle, index) => (
                <div 
                  key={candle.timestamp} 
                  className={`flex items-center justify-between p-2 rounded text-xs ${getCandleBg(candle)}`}
                >
                  <div className="flex items-center gap-2">
                    {candle.close >= candle.open ? (
                      <TrendingUp className="w-3 h-3 text-success" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-destructive" />
                    )}
                    <span className="font-mono">{formatTime(candle.timestamp)}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 font-mono">
                    <span className="w-16 text-right">${candle.open.toFixed(0)}</span>
                    <span className="w-16 text-right text-success">${candle.high.toFixed(0)}</span>
                    <span className="w-16 text-right text-destructive">${candle.low.toFixed(0)}</span>
                    <span className={`w-16 text-right font-medium ${getCandleColor(candle)}`}>
                      ${candle.close.toFixed(0)}
                    </span>
                    <span className="w-12 text-right text-muted-foreground">
                      {candle.volume.toFixed(0)}
                    </span>
                    <Badge 
                      variant={candle.changePercent >= 0 ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {candle.changePercent >= 0 ? '+' : ''}{candle.changePercent.toFixed(2)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Price */}
        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between">
            <span className="font-medium">Aktueller BTC-Preis</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">
                ${currentPrice.toLocaleString()}
              </span>
              <Badge variant="outline">LIVE</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};