import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTradingData } from "@/hooks/useTradingData";
import { Play, Pause, Settings, TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";
import { PriceChart } from "./PriceChart";
import { CandlestickChart } from "./CandlestickChart";
import { IndicatorsPanel } from "./IndicatorsPanel";
import { PositionsTable } from "./PositionsTable";
import { TradesHistory } from "./TradesHistory";
import { BotControls } from "./BotControls";
import { ApiKeyManager } from "./ApiKeyManager";
import { LiveSignalsPanel } from "./LiveSignalsPanel";
import { AITrainingCenter } from "./AITrainingCenter";
import { CompleteSignalPanel } from "./CompleteSignalPanel";
import { AIMarketAnalyzer } from "./AIMarketAnalyzer";
import { MetaAIPanel } from "./MetaAIPanel";
import { LiveControlPanel } from "./LiveControlPanel";
import { TPSLPanel } from "./TPSLPanel";

export const TradingDashboard = () => {
  const { currentPrice, portfolio, positions, botStatus, indicators, recentTrades, chartData, tradingPairs, isLoading } = useTradingData();

  return (
    <div className="min-h-screen bg-background p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Header - Mobile optimiert */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">KI Trading Bot</h1>
          <p className="text-sm md:text-base text-muted-foreground">Professional Cryptocurrency Trading System</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          {/* Live Data Status */}
          <Badge 
            variant={isLoading ? "secondary" : "default"} 
            className="flex items-center gap-1 animate-pulse text-xs"
          >
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
            {isLoading ? "Laden..." : "🔴 LIVE"}
          </Badge>
          <Badge variant={botStatus.isRunning ? "default" : "secondary"} className="flex items-center gap-1 text-xs">
            {botStatus.isRunning ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            {botStatus.isRunning ? "AKTIV" : "STOPP"}
          </Badge>
          <Badge variant="outline" className="text-xs">{botStatus.mode}</Badge>
        </div>
      </div>

      {/* Main Stats - Mobile Stack */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Portfolio</CardTitle>
            <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">${portfolio.totalBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className={portfolio.dailyPnL >= 0 ? "text-success" : "text-destructive"}>
                ${portfolio.dailyPnL.toFixed(2)}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">BTC/USDT</CardTitle>
            <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">${currentPrice.toLocaleString()}</div>
            <p className="text-xs text-success">+2.34%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Positionen</CardTitle>
            <Activity className="h-3 w-3 md:h-4 md:w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">{positions.length}</div>
            <p className="text-xs text-success">+$63.47</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Win Rate</CardTitle>
            <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">{botStatus.winRate}%</div>
            <p className="text-xs text-muted-foreground">{botStatus.totalTrades} Trades</p>
          </CardContent>
        </Card>
      </div>

      {/* KI-Marktanalyse - Neu hinzugefügt */}
      <AIMarketAnalyzer />

      {/* Complete Signal Panel */}
      <CompleteSignalPanel />

      {/* API & Live Signals - Mobile Stack */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        <ApiKeyManager />
        <LiveSignalsPanel />
      </div>

      {/* Charts Section - Mobile optimiert */}
      <div className="space-y-4 md:space-y-6">
        {/* Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">BTC/USDT Live Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <PriceChart data={chartData} currentPrice={currentPrice} />
          </CardContent>
        </Card>

        {/* Candlestick Chart */}
        <CandlestickChart data={chartData} currentPrice={currentPrice} />
      </div>

      {/* Trading Interface - Mobile Stack */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Positions Table - Volle Breite auf Mobile */}
        <div className="xl:col-span-2">
          <PositionsTable positions={positions} />
        </div>

        {/* Controls Panel */}
        <div className="space-y-4 md:space-y-6">
          <BotControls botStatus={botStatus} />
          <IndicatorsPanel indicators={indicators} />
          <TradesHistory trades={recentTrades} />
        </div>
      </div>

      {/* Meta-AI & Live Control - Neue Funktionen */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        <MetaAIPanel />
        <LiveControlPanel />
      </div>

      {/* TP/SL Manager - Profi Trading Module */}
      <TPSLPanel />

      {/* AI Training Section */}
      <AITrainingCenter />
    </div>
  );
};