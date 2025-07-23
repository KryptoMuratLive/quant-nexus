import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAITraining } from "@/hooks/useAITraining";
import { useState } from "react";
import { Brain, Play, TrendingUp, Target, Activity, Zap, BookOpen, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const AITrainingCenter = () => {
  const { 
    currentModel, 
    trainingHistory, 
    metrics, 
    isTraining, 
    startTraining,
    collectTrainingData
  } = useAITraining();
  
  const [trainingEpochs, setTrainingEpochs] = useState(100);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  const handleStartTraining = async () => {
    toast({
      title: "🧠 Training gestartet",
      description: "KI sammelt Daten und beginnt Training...",
    });
    
    await startTraining(trainingEpochs);
    
    toast({
      title: "✅ Training abgeschlossen",
      description: "Model wurde erfolgreich trainiert!",
    });
  };

  const getModelStatus = () => {
    if (!currentModel) return "Kein Model";
    if (isTraining) return "Training läuft...";
    if (metrics.accuracy > 75) return "Excellent";
    if (metrics.accuracy > 65) return "Gut";
    if (metrics.accuracy > 55) return "Durchschnitt";
    return "Verbesserung nötig";
  };

  const getStatusColor = () => {
    if (isTraining) return "bg-warning";
    if (metrics.accuracy > 75) return "bg-success";
    if (metrics.accuracy > 65) return "bg-primary";
    if (metrics.accuracy > 55) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <div className="space-y-6">
      {/* Training Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            KI-Training Center
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Model Status */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-transparent border border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">Aktives KI-Model</h3>
                <p className="text-sm text-muted-foreground">
                  {currentModel ? `Version ${currentModel.version}` : 'Kein Model aktiv'}
                </p>
              </div>
              <Badge className={getStatusColor()}>
                {getModelStatus()}
              </Badge>
            </div>
            
            {currentModel && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">{metrics.accuracy.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">Genauigkeit</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{metrics.totalSignals}</div>
                  <div className="text-xs text-muted-foreground">Gesamt Signale</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{metrics.successfulSignals}</div>
                  <div className="text-xs text-muted-foreground">Erfolgreich</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">{metrics.avgProfit.toFixed(2)}%</div>
                  <div className="text-xs text-muted-foreground">Ø Profit</div>
                </div>
              </div>
            )}
          </div>

          {/* Training Controls */}
          <div className="flex items-center gap-4">
            <Button
              onClick={handleStartTraining}
              disabled={isTraining}
              className="flex items-center gap-2"
            >
              {isTraining ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Training läuft...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Training starten
                </>
              )}
            </Button>
            
            <div className="flex items-center gap-2">
              <label className="text-sm">Epochen:</label>
              <input
                type="number"
                value={trainingEpochs}
                onChange={(e) => setTrainingEpochs(Number(e.target.value))}
                className="w-20 px-2 py-1 text-sm border rounded"
                min="10"
                max="1000"
                disabled={isTraining}
              />
            </div>
            
            <Button 
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Weniger' : 'Details'}
            </Button>
          </div>

          {/* Training Progress */}
          {isTraining && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Training Progress</span>
                <span>Sammle Daten & Trainiere Model...</span>
              </div>
              <Progress value={85} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Model Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precision</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.precision.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Wie oft Signale korrekt sind
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recall</CardTitle>
            <Activity className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.recall.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Wie viele Chancen erkannt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
            <TrendingUp className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.sharpeRatio.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Risk-adjusted Return
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
            <BarChart3 className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.maxDrawdown.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              Größter Verlust
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Training History */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Training Historie
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trainingHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Noch keine Trainings-Sessions verfügbar
              </div>
            ) : (
              <div className="space-y-2">
                {trainingHistory.slice(-5).reverse().map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <div>
                      <div className="font-medium text-sm">
                        {new Date(session.startTime).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {session.dataPoints} Datenpunkte, {session.epochs} Epochen
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          session.status === 'COMPLETED' ? 'default' :
                          session.status === 'RUNNING' ? 'secondary' : 'destructive'
                        }
                      >
                        {session.status}
                      </Badge>
                      {session.status === 'COMPLETED' && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Verbesserung: +{session.improvementPercent.toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Training Info */}
      <Alert>
        <Zap className="h-4 w-4" />
        <AlertDescription>
          <strong>Kontinuierliches Lernen:</strong> Das KI-Model lernt aus jedem Trade und verbessert sich automatisch. 
          Führe regelmäßige Trainings durch, um die besten Ergebnisse zu erzielen.
        </AlertDescription>
      </Alert>
    </div>
  );
};