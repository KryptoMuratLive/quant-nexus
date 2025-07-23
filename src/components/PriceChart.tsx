import { Card, CardContent } from "@/components/ui/card";
import { ChartData } from "@/types/trading";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

interface PriceChartProps {
  data: ChartData[];
  currentPrice: number;
}

export const PriceChart = ({ data, currentPrice }: PriceChartProps) => {
  const chartData = data.map(item => ({
    time: new Date(item.timestamp).toLocaleTimeString(),
    price: item.close,
    volume: item.volume,
  }));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="time" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            domain={['dataMin - 100', 'dataMax + 100']}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))'
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Preis']}
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
      
      {/* Current Price Indicator */}
      <div className="mt-4 flex items-center justify-center">
        <div className="bg-primary/20 px-4 py-2 rounded-lg">
          <span className="text-sm text-muted-foreground">Aktueller Preis: </span>
          <span className="text-lg font-bold text-primary">${currentPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};