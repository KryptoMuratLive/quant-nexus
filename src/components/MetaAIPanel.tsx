import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { metaAIManager, MetaSignal, AgentSignal } from "@/services/metaAIManager";
import { riskManager } from "@/services/riskManager";
import { useTradingData } from "@/hooks/useTradingData";
import { useState, useEffect } from "react";
import { 
  Brain, 
  Shield, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Settings, 
  Zap,
  Target,
  Activity,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const MetaAIPanel = () => {
  const { chartData, currentPrice, portfolio, recentTrades } = useTradingData();
  const [metaSignal, setMetaSignal] = useState<MetaSignal | null>(null);
  const [riskState, setRiskState] = useState(riskManager.currentState);
  const [isGenerating, setIsGenerating] = useState(false);
  const [autoMode, setAutoMode] = useState(true);
  const { toast } = useToast();

  const generateMetaSignal = async () => {
    if (chartData.length < 50) return;
    
    setIsGenerating(true);
    try {
      console.log('🧠 Meta-AI: Generiere Multi-Agent Signal...');
      
      // Risk Assessment
      const currentRisk = riskManager.assessRisk(
        currentPrice,
        chartData,
        portfolio.totalBalance,
        recentTrades
      );
      setRiskState(currentRisk);
      
      // Meta Signal nur wenn Trading erlaubt
      if (currentRisk.allowTrading) {
        const signal = metaAIManager.generateMetaSignal(chartData, currentPrice);
        setMetaSignal(signal);
        
        if (signal.finalSignal !== 'WAIT' && signal.overallConfidence > 75) {
          toast({
            title: `🤖 Meta-AI Signal: ${signal.finalSignal}`,
            description: `${signal.convergence}/4 Agenten zustimmen (${signal.overallConfidence.toFixed(0)}%)`,
            duration: 10000,
          });
        }
      } else {
        setMetaSignal(null);
        toast({
          title: "🛡️ Trading gestoppt",
          description: "Risk Manager hat Trading pausiert",
          variant: "destructive",
          duration: 8000,
        });
      }
    } catch (error) {
      console.error('Fehler bei Meta-Signal-Generierung:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-refresh alle 45 Sekunden
  useEffect(() => {
    if (autoMode && chartData.length > 0) {
      generateMetaSignal();
      const interval = setInterval(generateMetaSignal, 45000);
      return () => clearInterval(interval);
    }
  }, [autoMode, chartData, currentPrice]);

  const getAgentIcon = (agentId: string) => {
    switch (agentId) {
      case 'trend_follower': return <TrendingUp className="w-4 h-4" />;
      case 'mean_reversion': return <Activity className="w-4 h-4" />;
      case 'breakout_hunter': return <Zap className="w-4 h-4" />;
      case 'ai_neural': return <Brain className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'LONG': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'SHORT': return <XCircle className="w-4 h-4 text-destructive" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'LONG': return 'bg-success/20 text-success border-success/30';
      case 'SHORT': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-secondary/20 text-secondary-foreground border-secondary/30';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Meta-AI Command Center
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant={riskState.allowTrading ? "default" : "destructive"}
              className="flex items-center gap-1"
            >
              <Shield className="w-3 h-3" />
              {riskState.allowTrading ? 'AKTIV' : 'GESTOPPT'}
            </Badge>
            <Badge className={riskManager.getRiskLevelColor()}>
              {riskState.riskLevel}
            </Badge>
            <Button
              size="sm"
              variant={autoMode ? "default" : "outline"}
              onClick={() => setAutoMode(!autoMode)}
            >
              Auto-Mode
            </Button>
            <Button
              size="sm"
              onClick={generateMetaSignal}
              disabled={isGenerating}
            >
              {isGenerating ? "Analysiere..." : "Signal generieren"}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="meta-signal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="meta-signal">Meta Signal</TabsTrigger>
            <TabsTrigger value="agents">Agent Status</TabsTrigger>
            <TabsTrigger value="risk">Risk Management</TabsTrigger>
          </TabsList>

          {/* Meta Signal Tab */}
          <TabsContent value="meta-signal" className="space-y-4">
            {!riskState.allowTrading && (
              <Alert variant="destructive">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Trading pausiert:</strong> Risk Manager hat potentielle Gefahren erkannt.
                  Siehe Risk Management Tab für Details.
                </AlertDescription>
              </Alert>
            )}

            {metaSignal && riskState.allowTrading && (
              <>
                {/* Haupt Meta-Signal */}
                <div className="p-6 rounded-lg border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Users className="w-6 h-6 text-primary" />
                      <div>
                        <div className="text-2xl font-bold">Meta-AI Entscheidung</div>
                        <div className="text-sm text-muted-foreground">
                          {metaSignal.convergence}/4 Agenten einig • {metaSignal.dominantStrategy}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={getSignalColor(metaSignal.finalSignal)}>
                        {getSignalIcon(metaSignal.finalSignal)}
                        {metaSignal.finalSignal}
                      </Badge>
                      <Badge variant="outline">
                        {metaSignal.riskAssessment} RISK
                      </Badge>
                    </div>
                  </div>

                  {/* Confidence & Convergence */}
                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Overall Confidence</span>
                        <span className="font-bold">{metaSignal.overallConfidence.toFixed(1)}%</span>
                      </div>
                      <Progress value={metaSignal.overallConfidence} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Agent Convergence</span>
                        <span className="font-bold">{metaSignal.convergence}/4</span>
                      </div>
                      <Progress value={(metaSignal.convergence / 4) * 100} className="h-2" />
                    </div>
                  </div>

                  {/* Empfehlung */}
                  <div className="p-3 bg-secondary/50 rounded">
                    <div className="text-sm font-medium mb-1">Empfehlung:</div>
                    <div className="text-sm">{metaSignal.recommendedAction}</div>
                  </div>

                  {/* Meta-Reasoning */}
                  <div className="mt-4">
                    <div className="text-sm font-medium mb-2">Meta-AI Begründung:</div>
                    <div className="space-y-1">
                      {metaSignal.reasoning.map((reason, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {!metaSignal && riskState.allowTrading && (
              <Alert>
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  Generiere ein Meta-Signal um die Analyse aller 4 AI-Agenten zu sehen.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Agent Status Tab */}
          <TabsContent value="agents" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metaSignal?.agentVotes.map((agent) => (
                <Card key={agent.agentId} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getAgentIcon(agent.agentId)}
                      <div>
                        <div className="font-medium">{agent.agentName}</div>
                        <div className="text-xs text-muted-foreground">{agent.strategy}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getSignalColor(agent.signal)} variant="outline">
                        {agent.signal}
                      </Badge>
                      <Badge variant="secondary">
                        {agent.confidence.toFixed(0)}%
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Weight</span>
                      <span className="font-bold">{(agent.weight * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={agent.weight * 100} className="h-1" />
                  </div>

                  <div className="mt-3 space-y-1">
                    {agent.reasoning.slice(0, 2).map((reason, index) => (
                      <div key={index} className="text-xs text-muted-foreground">
                        • {reason}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>

            {/* Agent Performance */}
            <Card className="p-4">
              <h4 className="font-medium mb-3">Agent Performance (Letzte 30 Tage)</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from(metaAIManager.agentPerformance.entries()).map(([id, perf]) => (
                  <div key={id} className="text-center">
                    <div className="text-sm font-medium">{id.replace('_', ' ').toUpperCase()}</div>
                    <div className="text-lg font-bold text-success">{perf.winRate.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">
                      {perf.successfulSignals}/{perf.totalSignals} Trades
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Risk Management Tab */}
          <TabsContent value="risk" className="space-y-4">
            {/* Risk Status */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4" />
                  <span className="text-sm font-medium">Daily P&L</span>
                </div>
                <div className={`text-2xl font-bold ${riskState.dailyPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {riskState.dailyPnL >= 0 ? '+' : ''}{riskState.dailyPnL.toFixed(2)}%
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Verluste in Folge</span>
                </div>
                <div className="text-2xl font-bold">{riskState.consecutiveLosses}</div>
                <div className="text-xs text-muted-foreground">Max: 3</div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Volatilität</span>
                </div>
                <div className="text-lg font-bold">{riskState.volatilityLevel}</div>
                <div className="text-xs text-muted-foreground">Marktbedingung</div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">Risk Level</span>
                </div>
                <div className={`text-lg font-bold ${riskManager.getRiskLevelColor()}`}>
                  {riskState.riskLevel}
                </div>
                <div className="text-xs text-muted-foreground">
                  {riskManager.getRiskLevelDescription()}
                </div>
              </Card>
            </div>

            {/* Risk Warnings */}
            {riskState.warningMessages.length > 0 && (
              <Card className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  Risk Warnungen
                </h4>
                <div className="space-y-2">
                  {riskState.warningMessages.map((warning, index) => (
                    <Alert key={index} variant={warning.includes('🚨') ? "destructive" : "default"}>
                      <AlertDescription className="text-sm">
                        {warning}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </Card>
            )}

            {/* Manual Controls */}
            <Card className="p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Manual Risk Controls
              </h4>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => riskManager.manualStop('User manual stop')}
                  disabled={!riskState.allowTrading}
                >
                  Emergency Stop
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => riskManager.manualResume()}
                  disabled={riskState.allowTrading}
                >
                  Resume Trading
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => riskManager.resetEmergencyStop()}
                  disabled={!riskState.isEmergencyStop}
                >
                  Reset Emergency
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};