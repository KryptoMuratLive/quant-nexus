import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartData } from "@/types/trading";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { binancePublicAPI } from '@/services/binancePublicAPI';
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface PriceChartProps {
  data: ChartData[];
  currentPrice: number;
}

export const PriceChart = ({ data, currentPrice }: PriceChartProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1m');
  const [chartData, setChartData] = useState<ChartData[]>(data);
  const [isLoading, setIsLoading] = useState(false);

  const timeframes = [
    { key: '1m', label: '1M', limit: 100 },
    { key: '15m', label: '15M', limit: 96 }, // 24 hours of 15m candles
    { key: '4h', label: '4H', limit: 168 }, // 1 month of 4h candles  
    { key: '1d', label: '1D', limit: 365 } // 1 year of daily candles
  ];

  const fetchTimeframeData = async (timeframe: string) => {
    setIsLoading(true);
    try {
      console.log(`📊 Loading ${timeframe} chart data...`);
      const limit = timeframes.find(tf => tf.key === timeframe)?.limit || 100;
      const klineData = await binancePublicAPI.getKlineData('BTCUSDT', timeframe, limit);
      
      if (klineData) {
        setChartData(klineData);
        console.log(`✅ Loaded ${klineData.length} ${timeframe} candles`);
      }
    } catch (error) {
      console.error('Error loading timeframe data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTimeframe !== '1m') {
      fetchTimeframeData(selectedTimeframe);
    } else {
      setChartData(data);
    }
  }, [selectedTimeframe, data]);

  const formatXAxisLabel = (timestamp: number) => {
    const date = new Date(timestamp);
    switch (selectedTimeframe) {
      case '1m':
        return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
      case '15m':
        return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
      case '4h':
        return date.toLocaleDateString('de-DE', { month: 'short', day: 'numeric', hour: '2-digit' });
      case '1d':
        return date.toLocaleDateString('de-DE', { month: 'short', day: 'numeric' });
      default:
        return date.toLocaleTimeString();
    }
  };

  const processedData = chartData.map(item => ({
    time: formatXAxisLabel(item.timestamp),
    price: item.close,
    volume: item.volume,
    high: item.high,
    low: item.low,
    open: item.open,
  }));

  return (
    <div className="w-full space-y-4">
      {/* Timeframe Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Zeitrahmen:</span>
        </div>
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

      {/* Chart */}
      <div className="w-full h-80 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Lade {selectedTimeframe} Daten...</span>
            </div>
          </div>
        )}
        
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="time" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              interval="preserveStartEnd"
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              domain={['dataMin - 100', 'dataMax + 100']}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))'
              }}
              formatter={(value: number, name: string) => [
                `$${value.toFixed(2)}`, 
                name === 'price' ? 'Preis' : name
              ]}
              labelFormatter={(label) => `Zeit: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Chart Info */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="bg-primary/20 px-3 py-1 rounded">
            <span className="text-muted-foreground">Aktuell: </span>
            <span className="font-bold text-primary">${currentPrice.toLocaleString()}</span>
          </div>
          <div className="text-muted-foreground">
            {processedData.length} Kerzen ({selectedTimeframe})
          </div>
        </div>
        <div className="text-muted-foreground">
          Letzte Aktualisierung: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};