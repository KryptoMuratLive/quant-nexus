import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { tpslManager, TPSLLevels, OrderStatus } from "@/services/tpslManager";
import { useTradingData } from "@/hooks/useTradingData";
import { useState, useEffect } from "react";
import { 
  Target, 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  DollarSign,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const TPSLPanel = () => {
  const { chartData, currentPrice } = useTradingData();
  const [currentLevels, setCurrentLevels] = useState<TPSLLevels | null>(null);
  const [activeOrders, setActiveOrders] = useState<OrderStatus[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [autoMonitoring, setAutoMonitoring] = useState(true);
  
  // Settings State
  const [atrMultiplierSL, setAtrMultiplierSL] = useState([1.5]);
  const [atrMultiplierTP, setAtrMultiplierTP] = useState([2.5]);
  const [useStructuralSL, setUseStructuralSL] = useState(true);
  const [enableTrailing, setEnableTrailing] = useState(false);
  const [enablePartialTP, setEnablePartialTP] = useState(true);
  
  const { toast } = useToast();

  // Auto-Monitor Orders alle 10 Sekunden
  useEffect(() => {
    if (autoMonitoring) {
      const interval = setInterval(async () => {
        await tpslManager.monitorOrders();
        updateActiveOrders();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [autoMonitoring]);

  const updateActiveOrders = () => {
    const orders = Array.from(tpslManager.activeOrders.values());
    setActiveOrders(orders);
  };

  const generateTPSLLevels = () => {
    if (chartData.length < 50) {
      toast({
        title: "Nicht genügend Daten",
        description: "Benötige mindestens 50 Candles für ATR-Berechnung",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const settings = {
        ...tpslManager.defaultSettings,
        atrMultiplierSL: atrMultiplierSL[0],
        atrMultiplierTP: atrMultiplierTP[0],
        useStructuralSL,
        enableTrailing,
        enablePartialTP
      };

      const levels = tpslManager.calculateTPSL(
        currentPrice,
        'LONG', // Demo: LONG Position
        chartData,
        settings
      );
      
      setCurrentLevels(levels);
      
      toast({
        title: "TP/SL Levels berechnet",
        description: `Entry: $${levels.entryPrice.toLocaleString()} | SL: $${levels.stopLoss.toLocaleString()}`,
      });
    } catch (error) {
      console.error('Fehler bei TP/SL Berechnung:', error);
      toast({
        title: "Fehler",
        description: "Konnte TP/SL Levels nicht berechnen",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const placeTPSLOrders = async () => {
    if (!currentLevels) {
      toast({
        title: "Keine Levels",
        description: "Berechne zuerst TP/SL Levels",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const result = await tpslManager.placeTPSLOrders(
        'BTCUSDT',
        'LONG',
        0.1, // Demo Quantity
        currentLevels,
        {
          ...tpslManager.defaultSettings,
          atrMultiplierSL: atrMultiplierSL[0],
          atrMultiplierTP: atrMultiplierTP[0],
          useStructuralSL,
          enableTrailing,
          enablePartialTP
        }
      );

      if (result.success) {
        updateActiveOrders();
        toast({
          title: "Orders platziert",
          description: `${result.orders.length} TP/SL Orders erfolgreich erstellt`,
        });
      } else {
        toast({
          title: "Order Fehler",
          description: result.errors.join(', '),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Fehler beim Platzieren der Orders:', error);
      toast({
        title: "Kritischer Fehler",
        description: "Orders konnten nicht platziert werden",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getOrderTypeIcon = (type: string) => {
    switch (type) {
      case 'STOP_MARKET':
        return <Shield className="w-4 h-4 text-destructive" />;
      case 'LIMIT':
        return <Target className="w-4 h-4 text-success" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return <Badge variant="outline" className="text-blue-500">Aktiv</Badge>;
      case 'FILLED':
        return <Badge className="bg-success text-success-foreground">Gefüllt</Badge>;
      case 'CANCELLED':
        return <Badge variant="secondary">Storniert</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Abgelehnt</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const ordersSummary = tpslManager.getActiveOrdersSummary();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Take Profit & Stop Loss Manager
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-monitor"
                checked={autoMonitoring}
                onCheckedChange={setAutoMonitoring}
              />
              <Label htmlFor="auto-monitor" className="text-sm">Auto Monitor</Label>
            </div>
            <Button
              size="sm"
              onClick={generateTPSLLevels}
              disabled={isGenerating}
            >
              {isGenerating ? "Berechne..." : "Levels berechnen"}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Settings Panel */}
        <div className="p-4 border rounded-lg bg-secondary/20">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-4 h-4" />
            <h4 className="font-medium">TP/SL Einstellungen</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ATR Multiplier SL */}
            <div className="space-y-2">
              <Label className="text-sm">Stop Loss ATR Multiplier: {atrMultiplierSL[0]}x</Label>
              <Slider
                value={atrMultiplierSL}
                onValueChange={setAtrMultiplierSL}
                max={3}
                min={0.5}
                step={0.1}
                className="w-full"
              />
            </div>
            
            {/* ATR Multiplier TP */}
            <div className="space-y-2">
              <Label className="text-sm">Take Profit ATR Multiplier: {atrMultiplierTP[0]}x</Label>
              <Slider
                value={atrMultiplierTP}
                onValueChange={setAtrMultiplierTP}
                max={5}
                min={1}
                step={0.1}
                className="w-full"
              />
            </div>
            
            {/* Toggle Options */}
            <div className="flex items-center space-x-2">
              <Switch
                id="structural-sl"
                checked={useStructuralSL}
                onCheckedChange={setUseStructuralSL}
              />
              <Label htmlFor="structural-sl" className="text-sm">Struktureller SL</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="enable-trailing"
                checked={enableTrailing}
                onCheckedChange={setEnableTrailing}
              />
              <Label htmlFor="enable-trailing" className="text-sm">Trailing Stop</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="partial-tp"
                checked={enablePartialTP}
                onCheckedChange={setEnablePartialTP}
              />
              <Label htmlFor="partial-tp" className="text-sm">Partial Take Profit</Label>
            </div>
          </div>
        </div>

        {/* Current TP/SL Levels */}
        {currentLevels && (
          <div className="p-4 border rounded-lg bg-primary/5">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Berechnete TP/SL Levels
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="text-center p-3 bg-secondary/50 rounded">
                <div className="text-xs text-muted-foreground">Entry</div>
                <div className="font-bold">${currentLevels.entryPrice.toLocaleString()}</div>
              </div>
              
              <div className="text-center p-3 bg-destructive/20 rounded">
                <div className="text-xs text-muted-foreground">Stop Loss</div>
                <div className="font-bold text-destructive">
                  ${currentLevels.stopLoss.toLocaleString()}
                </div>
                {currentLevels.structuralStopLoss && (
                  <div className="text-xs text-muted-foreground">
                    (Strukturell: ${currentLevels.structuralStopLoss.toLocaleString()})
                  </div>
                )}
              </div>
              
              <div className="text-center p-3 bg-success/20 rounded">
                <div className="text-xs text-muted-foreground">TP1</div>
                <div className="font-bold text-success">${currentLevels.takeProfit1.toLocaleString()}</div>
              </div>
              
              <div className="text-center p-3 bg-success/20 rounded">
                <div className="text-xs text-muted-foreground">TP2</div>
                <div className="font-bold text-success">${currentLevels.takeProfit2.toLocaleString()}</div>
              </div>
              
              <div className="text-center p-3 bg-success/20 rounded">
                <div className="text-xs text-muted-foreground">TP3</div>
                <div className="font-bold text-success">${currentLevels.takeProfit3.toLocaleString()}</div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={placeTPSLOrders} 
                disabled={isGenerating}
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                Orders platzieren
              </Button>
            </div>
          </div>
        )}

        {/* Active Orders Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Aktive Orders ({ordersSummary.totalOrders})
            </h4>
            
            {ordersSummary.totalOrders > 0 && (
              <div className="flex gap-2 text-sm">
                <Badge variant="outline">SL: {ordersSummary.stopLossOrders}</Badge>
                <Badge variant="outline">TP: {ordersSummary.takeProfitOrders}</Badge>
              </div>
            )}
          </div>

          {activeOrders.length === 0 ? (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Keine aktiven TP/SL Orders. Berechne Levels und platziere Orders um zu starten.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              {activeOrders.map((order) => (
                <div
                  key={order.orderId}
                  className="flex items-center justify-between p-3 border rounded-lg bg-secondary/20"
                >
                  <div className="flex items-center gap-3">
                    {getOrderTypeIcon(order.type)}
                    <div>
                      <div className="font-medium text-sm">{order.symbol}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.type} - {order.side}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-bold text-sm">${order.price.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Qty: {order.quantity}</div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getOrderStatusBadge(order.status)}
                    <div className="text-xs text-muted-foreground">
                      {new Date(order.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cancel All Orders */}
        {activeOrders.length > 0 && (
          <div className="flex justify-end">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => tpslManager.cancelAllOrders().then(() => updateActiveOrders())}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Alle Orders stornieren
            </Button>
          </div>
        )}

        {/* Risk Disclaimer */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Demo Modus:</strong> Dies ist eine Simulation. In der Realität würde ccxt 
            für echte Order-Platzierung verwendet. ATR-basierte TP/SL-Berechnung berücksichtigt 
            Marktvolatilität für optimales Risikomanagement.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};