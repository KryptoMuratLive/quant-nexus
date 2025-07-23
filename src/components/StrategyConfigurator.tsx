import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Settings, Brain, Target, TrendingUp } from "lucide-react";
import { useState } from "react";

export const StrategyConfigurator = () => {
  const [rsiPeriod, setRsiPeriod] = useState([14]);
  const [emaPeriod, setEmaPeriod] = useState([20]);
  const [stopLoss, setStopLoss] = useState([2]);
  const [takeProfit, setTakeProfit] = useState([3]);
  const [useAI, setUseAI] = useState(true);
  const [riskLevel, setRiskLevel] = useState("medium");

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Strategie Konfigurator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Strategy Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Basis-Strategie</Label>
            <Select defaultValue="scalping">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scalping">Scalping</SelectItem>
                <SelectItem value="momentum">Momentum Trading</SelectItem>
                <SelectItem value="meanreversion">Mean Reversion</SelectItem>
                <SelectItem value="breakout">Breakout Strategy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Risk Level</Label>
            <Select value={riskLevel} onValueChange={setRiskLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Niedrig</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">Hoch</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Technical Indicators */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Technische Indikatoren
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>RSI Periode: {rsiPeriod[0]}</Label>
              <Slider
                value={rsiPeriod}
                onValueChange={setRsiPeriod}
                min={10}
                max={30}
                step={1}
                className="w-full"
              />
            </div>
            
            <div className="space-y-3">
              <Label>EMA Periode: {emaPeriod[0]}</Label>
              <Slider
                value={emaPeriod}
                onValueChange={setEmaPeriod}
                min={10}
                max={50}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Risk Management */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="w-4 h-4" />
            Risk Management
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Stop Loss: {stopLoss[0]}%</Label>
              <Slider
                value={stopLoss}
                onValueChange={setStopLoss}
                min={0.5}
                max={5}
                step={0.1}
                className="w-full"
              />
            </div>
            
            <div className="space-y-3">
              <Label>Take Profit: {takeProfit[0]}%</Label>
              <Slider
                value={takeProfit}
                onValueChange={setTakeProfit}
                min={1}
                max={10}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* AI Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="w-4 h-4" />
            KI-Einstellungen
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div>
                <span className="font-medium">KI-Enhancement aktivieren</span>
                <div className="text-sm text-muted-foreground">
                  Erweiterte KI-Analyse für bessere Signale
                </div>
              </div>
              <Switch checked={useAI} onCheckedChange={setUseAI} />
            </div>
            
            {useAI && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Confidence Threshold</Label>
                  <Input type="number" defaultValue="0.75" min="0" max="1" step="0.01" />
                </div>
                <div className="space-y-2">
                  <Label>Model Update Frequency</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Stündlich</SelectItem>
                      <SelectItem value="daily">Täglich</SelectItem>
                      <SelectItem value="weekly">Wöchentlich</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
          <h4 className="font-medium mb-2">Strategie Vorschau</h4>
          <div className="flex flex-wrap gap-2">
            <Badge>RSI({rsiPeriod[0]})</Badge>
            <Badge>EMA({emaPeriod[0]})</Badge>
            <Badge>SL: {stopLoss[0]}%</Badge>
            <Badge>TP: {takeProfit[0]}%</Badge>
            {useAI && <Badge variant="secondary">AI-Enhanced</Badge>}
            <Badge variant="outline">{riskLevel.toUpperCase()}</Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button className="flex-1">Strategie speichern</Button>
          <Button variant="outline" className="flex-1">Backtest starten</Button>
        </div>
      </CardContent>
    </Card>
  );
};