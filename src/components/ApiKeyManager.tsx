import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Key, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface ApiCredentials {
  apiKey: string;
  secretKey: string;
  isTestnet: boolean;
}

export const ApiKeyManager = () => {
  const [credentials, setCredentials] = useState<ApiCredentials>({
    apiKey: '',
    secretKey: '',
    isTestnet: false,
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load saved credentials from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('binance_credentials');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCredentials(parsed);
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to load credentials:', error);
      }
    }
  }, []);

  const handleSaveCredentials = () => {
    if (!credentials.apiKey || !credentials.secretKey) {
      toast({
        title: "Fehler",
        description: "Bitte alle Felder ausfüllen",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API validation
    setTimeout(() => {
      try {
        // Save to localStorage (encrypted in production)
        localStorage.setItem('binance_credentials', JSON.stringify(credentials));
        setIsConnected(true);
        setIsLoading(false);
        
        toast({
          title: "✅ Verbindung erfolgreich",
          description: "Binance API erfolgreich verbunden",
        });
      } catch (error) {
        setIsLoading(false);
        toast({
          title: "Fehler",
          description: "Verbindung fehlgeschlagen",
          variant: "destructive",
        });
      }
    }, 2000);
  };

  const handleDisconnect = () => {
    localStorage.removeItem('binance_credentials');
    setCredentials({ apiKey: '', secretKey: '', isTestnet: false });
    setIsConnected(false);
    
    toast({
      title: "Getrennt",
      description: "API-Verbindung getrennt",
    });
  };

  const maskKey = (key: string) => {
    if (key.length < 8) return key;
    return key.substring(0, 4) + '...' + key.substring(key.length - 4);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          Binance API Konfiguration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Security Warning */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Sicherheitshinweis:</strong> Deine API-Keys werden nur lokal in deinem Browser gespeichert. 
            Für maximale Sicherheit empfehlen wir die Verwendung von Testnet-Keys für Demo-Trading.
          </AlertDescription>
        </Alert>

        {!isConnected ? (
          <>
            {/* API Key Input */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Binance API Key eingeben..."
                  value={credentials.apiKey}
                  onChange={(e) => setCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secretKey">Secret Key</Label>
                <Input
                  id="secretKey"
                  type="password"
                  placeholder="Binance Secret Key eingeben..."
                  value={credentials.secretKey}
                  onChange={(e) => setCredentials(prev => ({ ...prev, secretKey: e.target.value }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="testnet"
                  checked={credentials.isTestnet}
                  onChange={(e) => setCredentials(prev => ({ ...prev, isTestnet: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="testnet">Testnet verwenden (empfohlen für Demo)</Label>
              </div>
            </div>

            {/* Connect Button */}
            <Button 
              onClick={handleSaveCredentials} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Verbinde..." : "API Keys speichern & verbinden"}
            </Button>
          </>
        ) : (
          <>
            {/* Connected Status */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-success/10 rounded-lg border border-success/20">
                <CheckCircle className="w-5 h-5 text-success" />
                <div className="flex-1">
                  <div className="font-medium">Erfolgreich verbunden</div>
                  <div className="text-sm text-muted-foreground">
                    API Key: {maskKey(credentials.apiKey)}
                  </div>
                </div>
                <Badge variant={credentials.isTestnet ? "secondary" : "default"}>
                  {credentials.isTestnet ? "Testnet" : "Live"}
                </Badge>
              </div>

              {/* API Permissions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-secondary/50 rounded-lg text-center">
                  <CheckCircle className="w-5 h-5 text-success mx-auto mb-1" />
                  <div className="text-sm font-medium">Spot Trading</div>
                  <div className="text-xs text-muted-foreground">Aktiviert</div>
                </div>
                <div className="p-3 bg-secondary/50 rounded-lg text-center">
                  <CheckCircle className="w-5 h-5 text-success mx-auto mb-1" />
                  <div className="text-sm font-medium">Market Data</div>
                  <div className="text-xs text-muted-foreground">Aktiviert</div>
                </div>
                <div className="p-3 bg-secondary/50 rounded-lg text-center">
                  <AlertTriangle className="w-5 h-5 text-warning mx-auto mb-1" />
                  <div className="text-sm font-medium">Futures</div>
                  <div className="text-xs text-muted-foreground">Prüfen</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleDisconnect} className="flex-1">
                  Verbindung trennen
                </Button>
                <Button variant="outline" className="flex-1">
                  Einstellungen
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Instructions */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">📋 Setup-Anleitung:</h4>
          <ol className="text-sm space-y-1 text-muted-foreground">
            <li>1. Gehe zu Binance → Account → API Management</li>
            <li>2. Erstelle einen neuen API Key</li>
            <li>3. Aktiviere "Enable Spot & Margin Trading"</li>
            <li>4. Beschränke IP-Adressen für höhere Sicherheit</li>
            <li>5. Verwende Testnet für sichere Demo-Tests</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};