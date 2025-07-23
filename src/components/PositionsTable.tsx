import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Position } from "@/types/trading";
import { TrendingUp, TrendingDown, X } from "lucide-react";

interface PositionsTableProps {
  positions: Position[];
}

export const PositionsTable = ({ positions }: PositionsTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Offene Positionen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {positions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Keine offenen Positionen
            </div>
          ) : (
            positions.map((position) => (
              <div
                key={position.id}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{position.symbol}</span>
                      <Badge
                        variant={position.type === 'LONG' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {position.type}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Größe: {position.size} | Einstieg: ${position.entryPrice}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-2">
                    {position.pnl >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-success" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-destructive" />
                    )}
                    <span
                      className={`font-medium ${
                        position.pnl >= 0 ? 'text-success' : 'text-destructive'
                      }`}
                    >
                      ${position.pnl.toFixed(2)}
                    </span>
                    <span
                      className={`text-sm ${
                        position.pnl >= 0 ? 'text-success' : 'text-destructive'
                      }`}
                    >
                      ({position.pnlPercent.toFixed(2)}%)
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Aktuell: ${position.currentPrice.toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Bearbeiten
                  </Button>
                  <Button variant="destructive" size="sm">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex gap-2">
          <Button className="flex-1">Neue Position</Button>
          <Button variant="outline" className="flex-1">Alle schließen</Button>
        </div>
      </CardContent>
    </Card>
  );
};