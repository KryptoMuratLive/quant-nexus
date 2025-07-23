import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { BotStatus } from "@/types/trading";
import { Play, Pause, Settings, RefreshCw, Brain, Zap } from "lucide-react";
import { useState } from "react";

interface BotControlsProps {
  botStatus: BotStatus;
}

export const BotControls = ({ botStatus }: BotControlsProps) => {
  const [isRunning, setIsRunning] = useState(botStatus.isRunning);
  const [mode, setMode] = useState(botStatus.mode);
  const [autoTrade, setAutoTrade] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(true);

  const startBot = async () => {
    try {
      const res = await fetch("http://149.102.137.77:8000/start_bot", {
        method: "POST",
      });
      const data = await res.json();
      console.log("Bot gestartet:", data);
      setIsRunning(true);
    } catch (error) {
      console.error("Fehler beim Starten:", error);
    }
  };

  const stopBot = async () => {
    try {
      const res = await fetch("http://149.102.137.77:8000/stop_bot", {
        method: "POST",
      });
      const data = await res.json();
      console.log("Bot gestoppt:", data);
      setIsRunning(false);
    } catch (error) {
      console.error("Fehler beim Stoppen:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Bot Kontrolle
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Controls */}
        <div className="flex gap-2">
          <Button
            className="flex-1"
            variant={isRunning ? "destructive" : "default"}
            onClick={isRunning ? stopBot : startBot}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start
              </>
            )}
          </Button>
          <Button variant="outline" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
          <div>
            <span className="text-sm font-medium">Trading Modus</span>
            <div className="text-xs text-muted-foreground">
              {mode === 'DEMO' ? 'Demo Trading' : 'Live Trading'}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMode(mode === 'DEMO' ? 'LIVE' : 'DEMO')}
          >
            {mode}
          </Button>
        </div>

        {/* Bot Features */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">Auto-Trading</span>
              <div className="text-xs text-muted-foreground">
                Automatische Handelsentscheidungen
              </div>
            </div>
            <Switch checked={autoTrade} onCheckedChange={setAutoTrade} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">KI-Enhancement</span>
              <div className="text-xs text-muted-foreground">
                Erweiterte KI-Analyse
              </div>
            </div>
            <Switch checked={aiEnabled} onCheckedChange={setAiEnabled} />
          </div>
        </div>

        {/* Strategy Info */}
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Aktive Strategie</span>
          </div>
          <div className="text-sm">{botStatus.strategy}</div>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              Scalping
            </Badge>
            <Badge variant="outline" className="text-xs">
              AI-Enhanced
            </Badge>
          </div>
        </div>

        {/* Performance */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">24h Performance</span>
            <span className="text-sm font-medium text-success">
              +{botStatus.performance24h}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Gesamt Trades</span>
            <span className="text-sm font-medium">{botStatus.totalTrades}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Win Rate</span>
            <span className="text-sm font-medium">{botStatus.winRate}%</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <Button variant="outline" className="w-full" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Strategie neu laden
          </Button>
          <Button variant="outline" className="w-full" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Erweiterte Einstellungen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};