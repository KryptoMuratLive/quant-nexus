// Dynamisches Risikomanagement - Psycho-Schutzschicht
export interface RiskSettings {
  maxDailyDrawdown: number; // %
  maxConsecutiveLosses: number;
  maxPositionSize: number; // %
  volatilityThreshold: number;
  newsFilterEnabled: boolean;
  autoStopOnDrawdown: boolean;
  emergencyStopLoss: number; // %
}

export interface RiskState {
  dailyPnL: number;
  consecutiveLosses: number;
  currentDrawdown: number;
  isEmergencyStop: boolean;
  lastNewsCheck: number;
  volatilityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  riskLevel: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  allowTrading: boolean;
  warningMessages: string[];
}

export interface NewsEvent {
  timestamp: number;
  title: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  category: 'CPI' | 'FOMC' | 'SEC' | 'EARNINGS' | 'OTHER';
  description: string;
}

export const riskManager = {
  
  // Standard Risk Settings
  defaultSettings: {
    maxDailyDrawdown: 2.0, // 2%
    maxConsecutiveLosses: 3,
    maxPositionSize: 15.0, // 15%
    volatilityThreshold: 0.05, // 5%
    newsFilterEnabled: true,
    autoStopOnDrawdown: true,
    emergencyStopLoss: 5.0 // 5%
  } as RiskSettings,

  // Aktueller Risk State
  currentState: {
    dailyPnL: 0,
    consecutiveLosses: 0,
    currentDrawdown: 0,
    isEmergencyStop: false,
    lastNewsCheck: Date.now(),
    volatilityLevel: 'LOW',
    riskLevel: 'MODERATE',
    allowTrading: true,
    warningMessages: []
  } as RiskState,

  // News Events (würde normalerweise von API kommen)
  upcomingNews: [
    {
      timestamp: Date.now() + 3600000, // +1 Stunde
      title: 'Federal Reserve Interest Rate Decision',
      impact: 'HIGH',
      category: 'FOMC',
      description: 'FOMC Meeting - Potential Rate Change'
    },
    {
      timestamp: Date.now() + 7200000, // +2 Stunden  
      title: 'Consumer Price Index (CPI)',
      impact: 'HIGH',
      category: 'CPI',
      description: 'Monthly Inflation Data Release'
    }
  ] as NewsEvent[],

  // Haupt-Risk-Assessment
  assessRisk(
    currentPrice: number,
    chartData: any[],
    portfolioValue: number,
    recentTrades: any[],
    settings: RiskSettings = this.defaultSettings
  ): RiskState {
    console.log('🛡️ Risk Manager: Beginne Risk Assessment...');
    
    // Reset warnings
    this.currentState.warningMessages = [];
    
    // 1. Daily Drawdown Check
    this.checkDailyDrawdown(portfolioValue, settings);
    
    // 2. Consecutive Losses Check
    this.checkConsecutiveLosses(recentTrades, settings);
    
    // 3. Volatility Assessment
    this.assessVolatility(chartData);
    
    // 4. News Filter Check
    if (settings.newsFilterEnabled) {
      this.checkNewsEvents();
    }
    
    // 5. Emergency Stop Check
    this.checkEmergencyConditions(portfolioValue, settings);
    
    // 6. Finales Trading Permission
    this.updateTradingPermission(settings);
    
    console.log('🛡️ Risk State:', this.currentState);
    return { ...this.currentState };
  },

  // Daily Drawdown Monitoring
  checkDailyDrawdown(portfolioValue: number, settings: RiskSettings) {
    const dailyStart = 10000; // Simuliert täglicher Startwert
    this.currentState.dailyPnL = ((portfolioValue - dailyStart) / dailyStart) * 100;
    this.currentState.currentDrawdown = Math.min(this.currentState.dailyPnL, 0);
    
    if (Math.abs(this.currentState.currentDrawdown) >= settings.maxDailyDrawdown) {
      this.currentState.warningMessages.push(
        `🚨 DAILY DRAWDOWN LIMIT: ${Math.abs(this.currentState.currentDrawdown).toFixed(2)}% (Max: ${settings.maxDailyDrawdown}%)`
      );
      
      if (settings.autoStopOnDrawdown) {
        this.currentState.allowTrading = false;
        this.currentState.warningMessages.push('🛑 Trading automatisch gestoppt - Drawdown Limit erreicht');
      }
    }
  },

  // Consecutive Losses Tracking
  checkConsecutiveLosses(recentTrades: any[], settings: RiskSettings) {
    if (recentTrades.length === 0) return;
    
    let consecutiveLosses = 0;
    for (let i = recentTrades.length - 1; i >= 0; i--) {
      if (recentTrades[i].pnl < 0) {
        consecutiveLosses++;
      } else {
        break;
      }
    }
    
    this.currentState.consecutiveLosses = consecutiveLosses;
    
    if (consecutiveLosses >= settings.maxConsecutiveLosses) {
      this.currentState.warningMessages.push(
        `🔄 CONSECUTIVE LOSSES: ${consecutiveLosses} Verluste in Folge (Max: ${settings.maxConsecutiveLosses})`
      );
      
      // Strategie wechseln oder Trading pausieren
      this.currentState.warningMessages.push('🔄 Empfehlung: Strategie wechseln oder pausieren');
      
      if (consecutiveLosses >= settings.maxConsecutiveLosses + 1) {
        this.currentState.allowTrading = false;
        this.currentState.warningMessages.push('🛑 Trading gestoppt - Zu viele Verluste');
      }
    }
  },

  // Volatilitäts-Assessment
  assessVolatility(chartData: any[]) {
    if (chartData.length < 20) return;
    
    const prices = chartData.slice(-20).map(d => d.close);
    const returns = prices.slice(1).map((price, i) => (price - prices[i]) / prices[i]);
    const volatility = Math.sqrt(returns.reduce((sum, ret) => sum + ret * ret, 0) / returns.length);
    
    // Volatilität klassifizieren
    if (volatility < 0.02) {
      this.currentState.volatilityLevel = 'LOW';
    } else if (volatility < 0.04) {
      this.currentState.volatilityLevel = 'MEDIUM';
    } else if (volatility < 0.08) {
      this.currentState.volatilityLevel = 'HIGH';
      this.currentState.warningMessages.push('⚠️ HOHE VOLATILITÄT: Positionsgröße reduziert');
    } else {
      this.currentState.volatilityLevel = 'EXTREME';
      this.currentState.warningMessages.push('🚨 EXTREME VOLATILITÄT: Trading sehr riskant');
      this.currentState.allowTrading = false;
    }
  },

  // News Events Filter
  checkNewsEvents() {
    const now = Date.now();
    const newsWindow = 30 * 60 * 1000; // 30 Minuten vor/nach News
    
    for (const newsEvent of this.upcomingNews) {
      const timeUntilNews = newsEvent.timestamp - now;
      const timeAfterNews = now - newsEvent.timestamp;
      
      // News steht bevor (innerhalb 30 Min)
      if (timeUntilNews > 0 && timeUntilNews <= newsWindow) {
        this.currentState.warningMessages.push(
          `📰 NEWS WARNUNG: ${newsEvent.title} in ${Math.round(timeUntilNews / 60000)} Min`
        );
        
        if (newsEvent.impact === 'HIGH') {
          this.currentState.allowTrading = false;
          this.currentState.warningMessages.push('🛑 Trading gestoppt - High Impact News bevorstehend');
        }
      }
      
      // News ist gerade passiert (innerhalb 30 Min)
      if (timeAfterNews > 0 && timeAfterNews <= newsWindow) {
        this.currentState.warningMessages.push(
          `📰 NEWS AKTIV: ${newsEvent.title} vor ${Math.round(timeAfterNews / 60000)} Min`
        );
        
        if (newsEvent.impact === 'HIGH') {
          this.currentState.allowTrading = false;
          this.currentState.warningMessages.push('🛑 Trading gestoppt - High Impact News kürzlich');
        }
      }
    }
  },

  // Emergency Stop Conditions
  checkEmergencyConditions(portfolioValue: number, settings: RiskSettings) {
    const totalLoss = ((10000 - portfolioValue) / 10000) * 100; // Simuliert
    
    if (totalLoss >= settings.emergencyStopLoss) {
      this.currentState.isEmergencyStop = true;
      this.currentState.allowTrading = false;
      this.currentState.warningMessages.push(
        `🚨 EMERGENCY STOP: ${totalLoss.toFixed(2)}% Gesamtverlust (Limit: ${settings.emergencyStopLoss}%)`
      );
    }
  },

  // Trading Permission Update
  updateTradingPermission(settings: RiskSettings) {
    // Sammle alle Stop-Bedingungen
    const stopConditions = this.currentState.warningMessages.filter(msg => msg.includes('🛑'));
    
    if (stopConditions.length > 0) {
      this.currentState.allowTrading = false;
    }
    
    // Risk Level basierend auf aktueller Situation
    if (this.currentState.volatilityLevel === 'EXTREME' || this.currentState.isEmergencyStop) {
      this.currentState.riskLevel = 'CONSERVATIVE';
    } else if (this.currentState.volatilityLevel === 'HIGH' || this.currentState.consecutiveLosses >= 2) {
      this.currentState.riskLevel = 'CONSERVATIVE';
    } else if (this.currentState.dailyPnL > 0 && this.currentState.consecutiveLosses === 0) {
      this.currentState.riskLevel = 'AGGRESSIVE';
    } else {
      this.currentState.riskLevel = 'MODERATE';
    }
  },

  // Position Size Calculator basierend auf Risk Level
  calculatePositionSize(
    baseSize: number, 
    confidence: number, 
    volatility: string = this.currentState.volatilityLevel
  ): number {
    let adjustedSize = baseSize;
    
    // Risk Level Anpassung
    switch (this.currentState.riskLevel) {
      case 'CONSERVATIVE':
        adjustedSize *= 0.5; // 50% Reduktion
        break;
      case 'MODERATE':
        adjustedSize *= 0.8; // 20% Reduktion
        break;
      case 'AGGRESSIVE':
        adjustedSize *= 1.2; // 20% Erhöhung
        break;
    }
    
    // Volatilitäts-Anpassung
    switch (volatility) {
      case 'HIGH':
        adjustedSize *= 0.7;
        break;
      case 'EXTREME':
        adjustedSize *= 0.3;
        break;
    }
    
    // Confidence-basierte Anpassung
    if (confidence < 70) {
      adjustedSize *= 0.6;
    }
    
    return Math.max(adjustedSize, 1); // Minimum 1%
  },

  // Risk Level für UI
  getRiskLevelColor(): string {
    switch (this.currentState.riskLevel) {
      case 'CONSERVATIVE': return 'text-green-500';
      case 'MODERATE': return 'text-yellow-500';
      case 'AGGRESSIVE': return 'text-red-500';
      default: return 'text-gray-500';
    }
  },

  getRiskLevelDescription(): string {
    switch (this.currentState.riskLevel) {
      case 'CONSERVATIVE': return 'Vorsichtig - Reduzierte Positionen';
      case 'MODERATE': return 'Standard - Normale Positionen';
      case 'AGGRESSIVE': return 'Aggressiv - Erhöhte Positionen';
      default: return 'Unbekannt';
    }
  },

  // Manual Override Functions
  manualStop(reason: string) {
    this.currentState.allowTrading = false;
    this.currentState.warningMessages.push(`🛑 MANUAL STOP: ${reason}`);
    console.log('🛑 Trading manually stopped:', reason);
  },

  manualResume() {
    this.currentState.allowTrading = true;
    this.currentState.warningMessages = this.currentState.warningMessages.filter(
      msg => !msg.includes('MANUAL STOP')
    );
    console.log('✅ Trading manually resumed');
  },

  resetEmergencyStop() {
    this.currentState.isEmergencyStop = false;
    this.currentState.allowTrading = true;
    this.currentState.warningMessages = this.currentState.warningMessages.filter(
      msg => !msg.includes('EMERGENCY STOP')
    );
    console.log('🔄 Emergency stop reset');
  }
};