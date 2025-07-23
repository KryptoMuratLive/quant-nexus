import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTradingData } from "@/hooks/useTradingData";
import { Play, Pause, Settings, TrendingUp, TrendingDown, DollarSign, Activity, AlertCircle, RefreshCw } from "lucide-react";
import { ErrorBoundary } from "./ErrorBoundary";
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
  const { currentPrice, portfolio, positions, botStatus, indicators, recentTrades, chartData, tradingPairs, isLoading, error, refetch } = useTradingData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg">Lade Trading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="mt-2">
            <div className="space-y-3">
              <p className="font-medium">Verbindungsfehler</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button onClick={refetch} size="sm" className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Erneut versuchen
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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
      <ErrorBoundary>
        <CompleteSignalPanel />
      </ErrorBoundary>

      {/* API & Live Signals - Mobile Stack */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        <ErrorBoundary>
          <ApiKeyManager />
        </ErrorBoundary>
        <ErrorBoundary>
          <LiveSignalsPanel />
        </ErrorBoundary>
      </div>

      {/* Charts Section - Mobile optimiert */}
      <div className="space-y-4 md:space-y-6">
        {/* Line Chart */}
        <ErrorBoundary>
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">BTC/USDT Live Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <PriceChart data={chartData} currentPrice={currentPrice} />
            </CardContent>
          </Card>
        </ErrorBoundary>

        {/* Candlestick Chart */}
        <ErrorBoundary>
          <CandlestickChart data={chartData} currentPrice={currentPrice} />
        </ErrorBoundary>
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
        <ErrorBoundary>
          <MetaAIPanel />
        </ErrorBoundary>
        <ErrorBoundary>
          <LiveControlPanel />
        </ErrorBoundary>
      </div>

      {/* TP/SL Manager - Profi Trading Module */}
      <TPSLPanel />

      {/* AI Training Section */}
      <ErrorBoundary>
        <AITrainingCenter />
      </ErrorBoundary>
    </div>
  );
};