import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { 
  Settings, 
  Zap, 
  Shield, 
  TrendingUp, 
  Activity, 
  Target,
  Gauge,
  RotateCcw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StrategySettings {
  riskFactor: number; // 1-10 (vorsichtig bis aggressiv)
  strategy: 'AUTO' | 'TREND_ONLY' | 'MEAN_REVERSION' | 'BREAKOUT' | 'AI_ONLY';
  rsiEntry: number;
  rsiExit: number;
  adxThreshold: number;
  maxPositions: number;
  leverageMultiplier: number;
  stopLossMultiplier: number;
  takeProfitMultiplier: number;
  aiConfidenceThreshold: number;
}

export const LiveControlPanel = () => {
  const [settings, setSettings] = useState<StrategySettings>({
    riskFactor: 5,
    strategy: 'AUTO',
    rsiEntry: 30,
    rsiExit: 70,
    adxThreshold: 25,
    maxPositions: 3,
    leverageMultiplier: 1.0,
    stopLossMultiplier: 1.0,
    takeProfitMultiplier: 1.0,
    aiConfidenceThreshold: 75
  });

  const [isLiveMode, setIsLiveMode] = useState(false);
  const [autoOptimize, setAutoOptimize] = useState(true);
  const { toast } = useToast();

  const applySettings = () => {
    // Hier würden die Einstellungen an den Bot weitergegeben
    console.log('🔧 Neue Bot-Einstellungen angewendet:', settings);
    
    toast({
      title: "✅ Einstellungen aktualisiert",
      description: `Risk Factor: ${settings.riskFactor}/10 | Strategy: ${settings.strategy}`,
      duration: 4000,
    });
  };

  const resetToDefaults = () => {
    setSettings({
      riskFactor: 5,
      strategy: 'AUTO',
      rsiEntry: 30,
      rsiExit: 70,
      adxThreshold: 25,
      maxPositions: 3,
      leverageMultiplier: 1.0,
      stopLossMultiplier: 1.0,
      takeProfitMultiplier: 1.0,
      aiConfidenceThreshold: 75
    });
    
    toast({
      title: "🔄 Standardwerte wiederhergestellt",
      description: "Alle Parameter auf Standardwerte zurückgesetzt",
    });
  };

  const getRiskColor = () => {
    if (settings.riskFactor <= 3) return 'text-green-500';
    if (settings.riskFactor <= 7) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRiskLabel = () => {
    if (settings.riskFactor <= 3) return 'VORSICHTIG';
    if (settings.riskFactor <= 7) return 'MODERAT';
    return 'AGGRESSIV';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Live Control Panel
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant={isLiveMode ? "destructive" : "secondary"}
              className="flex items-center gap-1"
            >
              <Gauge className="w-3 h-3" />
              {isLiveMode ? 'LIVE' : 'DEMO'}
            </Badge>
            <Badge className={getRiskColor()}>
              {getRiskLabel()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="risk" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="risk">Risk Control</TabsTrigger>
            <TabsTrigger value="strategy">Strategy</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="ai">AI Settings</TabsTrigger>
          </TabsList>

          {/* Risk Control Tab */}
          <TabsContent value="risk" className="space-y-6">
            {/* Risk Factor Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Risk Factor
                </Label>
                <Badge className={getRiskColor()}>
                  {settings.riskFactor}/10
                </Badge>
              </div>
              <Slider
                value={[settings.riskFactor]}
                onValueChange={(value) => setSettings(prev => ({ ...prev, riskFactor: value[0] }))}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground">
                1 = Sehr Vorsichtig | 5 = Ausgewogen | 10 = Sehr Aggressiv
              </div>
            </div>

            {/* Trading Mode */}
            <div className="space-y-3">
              <Label>Trading Mode</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={isLiveMode}
                  onCheckedChange={setIsLiveMode}
                />
                <Label className={isLiveMode ? 'text-red-500 font-bold' : ''}>
                  {isLiveMode ? '🔴 LIVE Trading (Echtes Geld!)' : '🟢 Demo Mode (Simulation)'}
                </Label>
              </div>
            </div>

            {/* Auto Optimization */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={autoOptimize}
                  onCheckedChange={setAutoOptimize}
                />
                <Label>Auto-Optimierung aktiviert</Label>
              </div>
              <div className="text-xs text-muted-foreground">
                Bot passt Parameter automatisch basierend auf Performance an
              </div>
            </div>

            {/* Max Positions */}
            <div className="space-y-3">
              <Label>Maximale gleichzeitige Positionen</Label>
              <Slider
                value={[settings.maxPositions]}
                onValueChange={(value) => setSettings(prev => ({ ...prev, maxPositions: value[0] }))}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground">
                Aktuell: {settings.maxPositions} Positionen
              </div>
            </div>
          </TabsContent>

          {/* Strategy Tab */}
          <TabsContent value="strategy" className="space-y-6">
            {/* Strategy Selection */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Haupt-Strategie
              </Label>
              <Select 
                value={settings.strategy} 
                onValueChange={(value: any) => setSettings(prev => ({ ...prev, strategy: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AUTO">🤖 Auto (Meta-AI entscheidet)</SelectItem>
                  <SelectItem value="TREND_ONLY">📈 Nur Trend Following</SelectItem>
                  <SelectItem value="MEAN_REVERSION">🔄 Nur Mean Reversion</SelectItem>
                  <SelectItem value="BREAKOUT">🚀 Nur Breakout Hunting</SelectItem>
                  <SelectItem value="AI_ONLY">🧠 Nur AI Neural Network</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Leverage Multiplier */}
            <div className="space-y-3">
              <Label>Hebel Multiplikator</Label>
              <Slider
                value={[settings.leverageMultiplier]}
                onValueChange={(value) => setSettings(prev => ({ ...prev, leverageMultiplier: value[0] }))}
                max={2.0}
                min={0.1}
                step={0.1}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground">
                {settings.leverageMultiplier}x - Multipliziert alle Hebel-Empfehlungen
              </div>
            </div>

            {/* Stop Loss & Take Profit Multipliers */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label>Stop Loss Multiplikator</Label>
                <Slider
                  value={[settings.stopLossMultiplier]}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, stopLossMultiplier: value[0] }))}
                  max={3.0}
                  min={0.5}
                  step={0.1}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground">
                  {settings.stopLossMultiplier}x
                </div>
              </div>

              <div className="space-y-3">
                <Label>Take Profit Multiplikator</Label>
                <Slider
                  value={[settings.takeProfitMultiplier]}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, takeProfitMultiplier: value[0] }))}
                  max={3.0}
                  min={0.5}
                  step={0.1}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground">
                  {settings.takeProfitMultiplier}x
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Technical Tab */}
          <TabsContent value="technical" className="space-y-6">
            {/* RSI Settings */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                RSI Einstellungen
              </Label>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">RSI Entry (Oversold)</Label>
                  <Slider
                    value={[settings.rsiEntry]}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, rsiEntry: value[0] }))}
                    max={50}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">{settings.rsiEntry}</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">RSI Exit (Overbought)</Label>
                  <Slider
                    value={[settings.rsiExit]}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, rsiExit: value[0] }))}
                    max={90}
                    min={50}
                    step={5}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">{settings.rsiExit}</div>
                </div>
              </div>
            </div>

            {/* ADX Threshold */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                ADX Trend-Stärke Schwelle
              </Label>
              <Slider
                value={[settings.adxThreshold]}
                onValueChange={(value) => setSettings(prev => ({ ...prev, adxThreshold: value[0] }))}
                max={50}
                min={10}
                step={5}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground">
                {settings.adxThreshold} - Minimum für starken Trend
              </div>
            </div>
          </TabsContent>

          {/* AI Settings Tab */}
          <TabsContent value="ai" className="space-y-6">
            {/* AI Confidence Threshold */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                AI Confidence Schwelle
              </Label>
              <Slider
                value={[settings.aiConfidenceThreshold]}
                onValueChange={(value) => setSettings(prev => ({ ...prev, aiConfidenceThreshold: value[0] }))}
                max={95}
                min={50}
                step={5}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground">
                {settings.aiConfidenceThreshold}% - Minimum Confidence für AI-Signale
              </div>
            </div>

            {/* AI Model Info */}
            <Card className="p-4 bg-secondary/20">
              <h4 className="font-medium mb-2">🤖 AI Model Status</h4>
              <div className="space-y-2 text-sm">
                <div>Aktives Modell: <span className="font-bold">Neural Network v2.1</span></div>
                <div>Trainiert: <span className="font-bold">vor 2 Stunden</span></div>
                <div>Accuracy: <span className="font-bold text-green-500">84.2%</span></div>
                <div>Performance: <span className="font-bold text-green-500">+12.3% (7 Tage)</span></div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 pt-4 border-t">
          <Button onClick={applySettings} className="flex-1">
            <Gauge className="w-4 h-4 mr-2" />
            Einstellungen anwenden
          </Button>
          <Button variant="outline" onClick={resetToDefaults}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Live Preview */}
        <Card className="p-4 mt-4 bg-primary/5">
          <h4 className="font-medium mb-2">🎯 Aktuelle Konfiguration</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>Risk: <span className={`font-bold ${getRiskColor()}`}>{getRiskLabel()}</span></div>
            <div>Strategy: <span className="font-bold">{settings.strategy}</span></div>
            <div>Max Pos: <span className="font-bold">{settings.maxPositions}</span></div>
            <div>AI Threshold: <span className="font-bold">{settings.aiConfidenceThreshold}%</span></div>
          </div>
        </Card>
      </CardContent>
    </Card>
  );
};