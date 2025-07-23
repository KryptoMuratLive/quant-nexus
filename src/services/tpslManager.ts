// Take Profit & Stop Loss Manager - Profi Trading Logic
import { advancedIndicators } from './advancedIndicators';

export interface TPSLLevels {
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
  trailingStopPrice?: number;
  structuralStopLoss?: number;
}

export interface TPSLSettings {
  atrMultiplierSL: number; // Standard: 1.5
  atrMultiplierTP: number; // Standard: 2.5
  useStructuralSL: boolean;
  enableTrailing: boolean;
  enablePartialTP: boolean;
  partialTPPercent: number; // 50% bei TP1
  maxSlippagePercent: number; // 1%
  telegramEnabled: boolean;
}

export interface OrderStatus {
  orderId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET' | 'STOP_MARKET';
  status: 'NEW' | 'FILLED' | 'CANCELLED' | 'REJECTED';
  price: number;
  quantity: number;
  timestamp: number;
}

export const tpslManager = {
  
  // Default Settings
  defaultSettings: {
    atrMultiplierSL: 1.5,
    atrMultiplierTP: 2.5,
    useStructuralSL: true,
    enableTrailing: false,
    enablePartialTP: true,
    partialTPPercent: 50,
    maxSlippagePercent: 1.0,
    telegramEnabled: true
  } as TPSLSettings,

  // Active Orders Tracking
  activeOrders: new Map<string, OrderStatus>(),
  
  // TP/SL Level Calculator mit ATR
  calculateTPSL(
    entryPrice: number,
    direction: 'LONG' | 'SHORT',
    chartData: any[],
    settings: TPSLSettings = this.defaultSettings
  ): TPSLLevels {
    console.log('📊 TP/SL Manager: Berechne Levels...');
    
    // ATR berechnen (14 Perioden)
    const atrValue = this.calculateATR(chartData, 14);
    
    let stopLoss: number;
    let takeProfit1: number;
    let takeProfit2: number;
    let takeProfit3: number;
    let structuralStopLoss: number | undefined;
    
    if (direction === 'LONG') {
      // LONG Position
      stopLoss = entryPrice - (atrValue * settings.atrMultiplierSL);
      takeProfit1 = entryPrice + (atrValue * settings.atrMultiplierTP);
      takeProfit2 = entryPrice + (atrValue * settings.atrMultiplierTP * 1.5);
      takeProfit3 = entryPrice + (atrValue * settings.atrMultiplierTP * 2.0);
      
      // Struktureller SL: unter letzten Candle-Wick
      if (settings.useStructuralSL && chartData.length > 0) {
        const lastCandle = chartData[chartData.length - 1];
        const structuralLevel = lastCandle.low * 0.998; // 0.2% Buffer
        structuralStopLoss = Math.min(stopLoss, structuralLevel);
      }
    } else {
      // SHORT Position
      stopLoss = entryPrice + (atrValue * settings.atrMultiplierSL);
      takeProfit1 = entryPrice - (atrValue * settings.atrMultiplierTP);
      takeProfit2 = entryPrice - (atrValue * settings.atrMultiplierTP * 1.5);
      takeProfit3 = entryPrice - (atrValue * settings.atrMultiplierTP * 2.0);
      
      // Struktureller SL: über letzten Candle-Wick
      if (settings.useStructuralSL && chartData.length > 0) {
        const lastCandle = chartData[chartData.length - 1];
        const structuralLevel = lastCandle.high * 1.002; // 0.2% Buffer
        structuralStopLoss = Math.max(stopLoss, structuralLevel);
      }
    }
    
    const levels: TPSLLevels = {
      entryPrice,
      stopLoss: structuralStopLoss || stopLoss,
      takeProfit1,
      takeProfit2,
      takeProfit3,
      structuralStopLoss
    };
    
    console.log('📊 TP/SL Levels berechnet:', levels);
    return levels;
  },

  // ATR Calculation (Average True Range)
  calculateATR(chartData: any[], period: number = 14): number {
    if (chartData.length < period + 1) return 0;
    
    const trueRanges = [];
    
    for (let i = 1; i < chartData.length; i++) {
      const current = chartData[i];
      const previous = chartData[i - 1];
      
      const tr1 = current.high - current.low;
      const tr2 = Math.abs(current.high - previous.close);
      const tr3 = Math.abs(current.low - previous.close);
      
      trueRanges.push(Math.max(tr1, tr2, tr3));
    }
    
    // ATR = Average der letzten 14 True Ranges
    const recentTRs = trueRanges.slice(-period);
    const atr = recentTRs.reduce((sum, tr) => sum + tr, 0) / recentTRs.length;
    
    return atr;
  },

  // TP/SL Orders simuliert platzieren (würde normalerweise ccxt verwenden)
  async placeTPSLOrders(
    symbol: string,
    direction: 'LONG' | 'SHORT',
    quantity: number,
    levels: TPSLLevels,
    settings: TPSLSettings = this.defaultSettings
  ): Promise<{success: boolean, orders: OrderStatus[], errors: string[]}> {
    console.log('📝 TP/SL Manager: Platziere Orders...');
    
    const orders: OrderStatus[] = [];
    const errors: string[] = [];
    
    try {
      // 1. Stop Loss Order (Market Order)
      const slOrder = await this.simulatePlaceOrder({
        symbol,
        side: direction === 'LONG' ? 'SELL' : 'BUY',
        type: 'STOP_MARKET',
        price: levels.stopLoss,
        quantity,
        reduceOnly: true
      });
      
      if (slOrder.success) {
        orders.push(slOrder.order);
        console.log('✅ Stop Loss Order platziert:', slOrder.order);
      } else {
        errors.push(`❌ Stop Loss Order failed: ${slOrder.error}`);
      }

      // 2. Take Profit Orders (Limit Orders)
      const tpQuantity = settings.enablePartialTP 
        ? quantity * (settings.partialTPPercent / 100)
        : quantity;

      // TP1 Order
      const tp1Order = await this.simulatePlaceOrder({
        symbol,
        side: direction === 'LONG' ? 'SELL' : 'BUY',
        type: 'LIMIT',
        price: levels.takeProfit1,
        quantity: tpQuantity,
        reduceOnly: true
      });
      
      if (tp1Order.success) {
        orders.push(tp1Order.order);
        console.log('✅ Take Profit 1 Order platziert:', tp1Order.order);
      } else {
        errors.push(`❌ TP1 Order failed: ${tp1Order.error}`);
      }

      // TP2 Order (falls Partial TP aktiviert)
      if (settings.enablePartialTP) {
        const remainingQuantity = quantity - tpQuantity;
        
        const tp2Order = await this.simulatePlaceOrder({
          symbol,
          side: direction === 'LONG' ? 'SELL' : 'BUY',
          type: 'LIMIT',
          price: levels.takeProfit2,
          quantity: remainingQuantity,
          reduceOnly: true
        });
        
        if (tp2Order.success) {
          orders.push(tp2Order.order);
          console.log('✅ Take Profit 2 Order platziert:', tp2Order.order);
        } else {
          errors.push(`❌ TP2 Order failed: ${tp2Order.error}`);
        }
      }

      // Orders zur Überwachung hinzufügen
      orders.forEach(order => {
        this.activeOrders.set(order.orderId, order);
      });

      return { success: errors.length === 0, orders, errors };
      
    } catch (error) {
      const errorMsg = `❌ Kritischer Fehler beim Platzieren der TP/SL Orders: ${error}`;
      console.error(errorMsg);
      return { success: false, orders: [], errors: [errorMsg] };
    }
  },

  // Order Simulation (würde durch echte ccxt API ersetzt)
  async simulatePlaceOrder(orderData: {
    symbol: string;
    side: 'BUY' | 'SELL';
    type: 'LIMIT' | 'MARKET' | 'STOP_MARKET';
    price: number;
    quantity: number;
    reduceOnly?: boolean;
  }): Promise<{success: boolean, order?: OrderStatus, error?: string}> {
    
    // Simuliere Netzwerk-Delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 90% Erfolgsrate simulieren
    const success = Math.random() > 0.1;
    
    if (success) {
      const order: OrderStatus = {
        orderId: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        symbol: orderData.symbol,
        side: orderData.side,
        type: orderData.type,
        status: 'NEW',
        price: orderData.price,
        quantity: orderData.quantity,
        timestamp: Date.now()
      };
      
      return { success: true, order };
    } else {
      return { 
        success: false, 
        error: 'Order rejected by exchange - insufficient margin' 
      };
    }
  },

  // Order Monitoring & Management
  async monitorOrders(): Promise<void> {
    if (this.activeOrders.size === 0) return;
    
    console.log('👁️ TP/SL Manager: Überwache Orders...');
    
    for (const [orderId, order] of this.activeOrders) {
      // Simuliere Order Status Check
      const updatedOrder = await this.checkOrderStatus(orderId);
      
      if (updatedOrder.status === 'FILLED') {
        console.log(`✅ Order executed: ${orderId} - ${order.type} at ${order.price}`);
        
        // Telegram Notification
        this.sendTelegramNotification(
          `🎯 ${order.type} EXECUTED\n` +
          `Symbol: ${order.symbol}\n` +
          `Price: $${order.price.toLocaleString()}\n` +
          `Quantity: ${order.quantity}\n` +
          `Time: ${new Date().toLocaleTimeString()}`
        );
        
        // Order aus Überwachung entfernen
        this.activeOrders.delete(orderId);
        
        // Bei SL: Prüfe Slippage
        if (order.type === 'STOP_MARKET') {
          await this.checkSlippage(order, updatedOrder.price);
        }
      }
    }
  },

  // Order Status Check (würde ccxt fetch_order verwenden)
  async checkOrderStatus(orderId: string): Promise<OrderStatus> {
    // Simuliere 20% Chance dass Order gefüllt wurde
    const isFilled = Math.random() > 0.8;
    
    const order = this.activeOrders.get(orderId)!;
    return {
      ...order,
      status: isFilled ? 'FILLED' : order.status
    };
  },

  // Slippage Check bei Stop Loss
  async checkSlippage(originalOrder: OrderStatus, executedPrice: number): Promise<void> {
    const slippage = Math.abs((executedPrice - originalOrder.price) / originalOrder.price) * 100;
    
    console.log(`📊 Slippage Check: ${slippage.toFixed(2)}%`);
    
    if (slippage > this.defaultSettings.maxSlippagePercent) {
      console.log('🚨 HOHE SLIPPAGE DETECTED - Schließe Position sofort!');
      
      // Emergency Market Close
      await this.emergencyClosePosition(originalOrder.symbol);
      
      this.sendTelegramNotification(
        `🚨 HIGH SLIPPAGE ALERT\n` +
        `Symbol: ${originalOrder.symbol}\n` +
        `Expected: $${originalOrder.price}\n` +
        `Executed: $${executedPrice}\n` +
        `Slippage: ${slippage.toFixed(2)}%\n` +
        `Action: Emergency close executed`
      );
    }
  },

  // Emergency Position Close
  async emergencyClosePosition(symbol: string): Promise<void> {
    console.log(`🚨 Emergency Close Position: ${symbol}`);
    
    // Alle offenen Orders für Symbol canceln
    for (const [orderId, order] of this.activeOrders) {
      if (order.symbol === symbol) {
        await this.cancelOrder(orderId);
      }
    }
    
    // Market Order zum Schließen (simuliert)
    await this.simulatePlaceOrder({
      symbol,
      side: 'SELL', // Annahme: LONG Position
      type: 'MARKET',
      price: 0, // Market Price
      quantity: 100, // Annahme: Volle Position
      reduceOnly: true
    });
  },

  // Order Cancellation
  async cancelOrder(orderId: string): Promise<void> {
    const order = this.activeOrders.get(orderId);
    if (order) {
      order.status = 'CANCELLED';
      this.activeOrders.delete(orderId);
      console.log(`❌ Order cancelled: ${orderId}`);
    }
  },

  // Trailing Stop Logic
  updateTrailingStop(
    currentPrice: number,
    direction: 'LONG' | 'SHORT',
    levels: TPSLLevels,
    trailingPercent: number = 2.0
  ): TPSLLevels {
    if (!levels.trailingStopPrice) {
      levels.trailingStopPrice = levels.stopLoss;
    }
    
    if (direction === 'LONG') {
      // LONG: Trail Stop nach oben wenn Preis steigt
      const newTrailingStop = currentPrice * (1 - trailingPercent / 100);
      if (newTrailingStop > levels.trailingStopPrice) {
        levels.trailingStopPrice = newTrailingStop;
        console.log(`📈 Trailing Stop updated (LONG): ${newTrailingStop}`);
      }
    } else {
      // SHORT: Trail Stop nach unten wenn Preis fällt
      const newTrailingStop = currentPrice * (1 + trailingPercent / 100);
      if (newTrailingStop < levels.trailingStopPrice) {
        levels.trailingStopPrice = newTrailingStop;
        console.log(`📉 Trailing Stop updated (SHORT): ${newTrailingStop}`);
      }
    }
    
    return levels;
  },

  // Telegram Notification (würde echte Bot API verwenden)
  sendTelegramNotification(message: string): void {
    if (!this.defaultSettings.telegramEnabled) return;
    
    console.log('📱 Telegram Notification:', message);
    
    // Hier würde normalerweise die Telegram Bot API aufgerufen
    // fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     chat_id: CHAT_ID,
    //     text: message,
    //     parse_mode: 'HTML'
    //   })
    // });
  },

  // Daily Max Loss Check Integration
  checkDailyMaxLoss(currentPnL: number, maxLossPercent: number = 2.0): boolean {
    if (Math.abs(currentPnL) >= maxLossPercent) {
      console.log(`🛑 DAILY MAX LOSS REACHED: ${Math.abs(currentPnL).toFixed(2)}%`);
      
      // Alle aktiven Orders canceln
      this.cancelAllOrders();
      
      this.sendTelegramNotification(
        `🛑 DAILY STOP ACTIVATED\n` +
        `Loss: ${Math.abs(currentPnL).toFixed(2)}%\n` +
        `Limit: ${maxLossPercent}%\n` +
        `All orders cancelled\n` +
        `Bot paused until tomorrow`
      );
      
      return true; // Trading stoppen
    }
    
    return false; // Trading erlaubt
  },

  // Cancel All Orders
  async cancelAllOrders(): Promise<void> {
    console.log('❌ Cancelling all active TP/SL orders...');
    
    const cancelPromises = Array.from(this.activeOrders.keys()).map(orderId => 
      this.cancelOrder(orderId)
    );
    
    await Promise.all(cancelPromises);
    this.activeOrders.clear();
    
    console.log('✅ All orders cancelled');
  },

  // Get Active Orders Summary
  getActiveOrdersSummary(): {
    totalOrders: number;
    stopLossOrders: number;
    takeProfitOrders: number;
    ordersBySymbol: Record<string, number>;
  } {
    const orders = Array.from(this.activeOrders.values());
    
    const summary = {
      totalOrders: orders.length,
      stopLossOrders: orders.filter((o: OrderStatus) => o.type === 'STOP_MARKET').length,
      takeProfitOrders: orders.filter((o: OrderStatus) => o.type === 'LIMIT').length,
      ordersBySymbol: {} as Record<string, number>
    };
    
    // Build ordersBySymbol manually
    orders.forEach((order: OrderStatus) => {
      summary.ordersBySymbol[order.symbol] = (summary.ordersBySymbol[order.symbol] || 0) + 1;
    });
    
    return summary;
  }
};