import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTradingData } from "@/hooks/useTradingData";
import { Play, Pause, Settings, TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";
import { PriceChart } from "./PriceChart";
import { IndicatorsPanel } from "./IndicatorsPanel";
import { PositionsTable } from "./PositionsTable";
import { TradesHistory } from "./TradesHistory";
import { BotControls } from "./BotControls";
import { ApiKeyManager } from "./ApiKeyManager";
import { LiveSignalsPanel } from "./LiveSignalsPanel";

export const TradingDashboard = () => {
  const { currentPrice, portfolio, positions, botStatus, indicators, recentTrades, chartData, tradingPairs } = useTradingData();

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">KI Trading Bot</h1>
          <p className="text-muted-foreground">Professional Cryptocurrency Trading System</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={botStatus.isRunning ? "default" : "secondary"} className="flex items-center gap-1">
            {botStatus.isRunning ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            {botStatus.isRunning ? "AKTIV" : "GESTOPPT"}
          </Badge>
          <Badge variant="outline">{botStatus.mode}</Badge>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Wert</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${portfolio.totalBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Täglich: <span className={portfolio.dailyPnL >= 0 ? "text-success" : "text-destructive"}>
                ${portfolio.dailyPnL.toFixed(2)}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BTC/USDT</CardTitle>
            <TrendingUp className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentPrice.toLocaleString()}</div>
            <p className="text-xs text-success">+2.34% (24h)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offene Positionen</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positions.length}</div>
            <p className="text-xs text-muted-foreground">
              PnL: <span className="text-success">+$63.47</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{botStatus.winRate}%</div>
            <p className="text-xs text-muted-foreground">{botStatus.totalTrades} Trades</p>
          </CardContent>
        </Card>
      </div>

      {/* API Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ApiKeyManager />
        <LiveSignalsPanel />
      </div>

      {/* Main Trading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>BTC/USDT Chart & Signale</CardTitle>
            </CardHeader>
            <CardContent>
              <PriceChart data={chartData} currentPrice={currentPrice} />
            </CardContent>
          </Card>

          <PositionsTable positions={positions} />
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          <BotControls botStatus={botStatus} />
          <IndicatorsPanel indicators={indicators} />
          <TradesHistory trades={recentTrades} />
        </div>
      </div>
    </div>
  );
};