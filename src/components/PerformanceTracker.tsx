import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAITraining } from "@/hooks/useAITraining";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Brain, Target, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const PerformanceTracker = () => {
  const { signalFeedback, metrics, addSignalFeedback } = useAITraining();
  const { toast } = useToast();

  // Simuliere Feedback für Demo
  const handleAddFeedback = (wasCorrect: boolean) => {
    const feedback = {
      signalId: Date.now().toString(),
      timestamp: Date.now(),
      entryPrice: 97250,
      exitPrice: wasCorrect ? 97850 : 96900,
      actualProfit: wasCorrect ? 0.62 : -0.36,
      timeHeld: 300000, // 5 minutes
      wasCorrect,
      confidence: 85
    };
    
    addSignalFeedback(feedback);
    
    toast({
      title: "Feedback hinzugefügt",
      description: `Signal als ${wasCorrect ? 'korrekt' : 'inkorrekt'} markiert`,
      variant: wasCorrect ? "default" : "destructive",
    });
  };

  // Bereite Chart-Daten vor
  const chartData = signalFeedback.slice(-20).map((feedback, index) => ({
    index: index + 1,
    profit: feedback.actualProfit,
    confidence: feedback.confidence,
    accuracy: feedback.wasCorrect ? 100 : 0
  }));

  const recentAccuracy = signalFeedback.length > 0 
    ? (signalFeedback.filter(f => f.wasCorrect).length / signalFeedback.length) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            KI-Performance Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Real-time Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-primary/10 text-center">
              <div className="text-2xl font-bold text-primary">{recentAccuracy.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Live Accuracy</div>
            </div>
            <div className="p-3 rounded-lg bg-success/10 text-center">
              <div className="text-2xl font-bold text-success">
                {signalFeedback.filter(f => f.wasCorrect).length}
              </div>
              <div className="text-xs text-muted-foreground">Erfolgreiche Signale</div>
            </div>
            <div className="p-3 rounded-lg bg-destructive/10 text-center">
              <div className="text-2xl font-bold text-destructive">
                {signalFeedback.filter(f => !f.wasCorrect).length}
              </div>
              <div className="text-xs text-muted-foreground">Fehlgeschlagen</div>
            </div>
            <div className="p-3 rounded-lg bg-warning/10 text-center">
              <div className="text-2xl font-bold text-warning">
                {signalFeedback.length > 0 
                  ? (signalFeedback.reduce((sum, f) => sum + f.actualProfit, 0) / signalFeedback.length).toFixed(2)
                  : '0.00'
                }%
              </div>
              <div className="text-xs text-muted-foreground">Ø Profit</div>
            </div>
          </div>

          {/* Performance Chart */}
          {chartData.length > 0 && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="index" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Profit %"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke="hsl(var(--success))" 
                    strokeWidth={2}
                    name="Accuracy"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Demo Feedback Buttons */}
          <div className="flex items-center justify-center gap-4 p-4 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Demo: Signal-Feedback</span>
            <Button
              size="sm"
              onClick={() => handleAddFeedback(true)}
              className="flex items-center gap-1"
            >
              <TrendingUp className="w-4 h-4" />
              Korrekt
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleAddFeedback(false)}
              className="flex items-center gap-1"
            >
              <TrendingDown className="w-4 h-4" />
              Falsch
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Learning Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Lernfortschritt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {signalFeedback.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Noch keine Signal-Bewertungen verfügbar
              </div>
            ) : (
              <div className="space-y-2">
                {signalFeedback.slice(-10).reverse().map((feedback, index) => (
                  <div
                    key={feedback.signalId}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <div className="flex items-center gap-3">
                      {feedback.wasCorrect ? (
                        <TrendingUp className="w-4 h-4 text-success" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-destructive" />
                      )}
                      <div>
                        <div className="font-medium text-sm">
                          ${feedback.entryPrice} → ${feedback.exitPrice}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(feedback.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={feedback.wasCorrect ? "default" : "destructive"}>
                        {feedback.actualProfit > 0 ? '+' : ''}{feedback.actualProfit.toFixed(2)}%
                      </Badge>
                      <Badge variant="outline">
                        {feedback.confidence}% Confidence
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};