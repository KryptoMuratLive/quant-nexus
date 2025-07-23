import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trade } from "@/types/trading";
import { Clock, TrendingUp, TrendingDown } from "lucide-react";

interface TradesHistoryProps {
  trades: Trade[];
}

export const TradesHistory = ({ trades }: TradesHistoryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Letzte Trades
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {trades.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Keine Trades verfügbar
          </div>
        ) : (
          trades.map((trade) => (
            <div
              key={trade.id}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{trade.symbol}</span>
                  <Badge
                    variant={trade.type === 'BUY' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {trade.type}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {trade.side}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(trade.timestamp).toLocaleTimeString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  Preis: ${trade.price.toFixed(2)} | Menge: {trade.quantity}
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1">
                  {trade.pnl >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-success" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-destructive" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      trade.pnl >= 0 ? 'text-success' : 'text-destructive'
                    }`}
                  >
                    ${trade.pnl.toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  KI: {(trade.confidence * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          ))
        )}

        {/* Performance Summary */}
        <div className="mt-4 p-3 bg-primary/10 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Heute</span>
            <span className="text-sm text-success font-medium">+$234.56</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-muted-foreground">Win Rate</span>
            <span className="text-xs text-muted-foreground">68.4%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};