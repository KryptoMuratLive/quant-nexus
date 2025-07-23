// Public Binance API service - no authentication required for market data
export const binancePublicAPI = {
  baseUrl: 'https://api.binance.com/api/v3',
  
  // Supported timeframes for charts
  timeframes: {
    '1m': '1 Minute',
    '15m': '15 Minuten', 
    '4h': '4 Stunden',
    '1d': '1 Tag'
  },
  
  // Get current price for any symbol
  async getCurrentPrice(symbol: string = 'BTCUSDT') {
    try {
      const response = await fetch(`${this.baseUrl}/ticker/price?symbol=${symbol}`);
      const data = await response.json();
      return parseFloat(data.price);
    } catch (error) {
      console.error('Error fetching current price:', error);
      return null;
    }
  },

  // Get 24hr ticker statistics
  async get24hrTicker(symbol: string = 'BTCUSDT') {
    try {
      const response = await fetch(`${this.baseUrl}/ticker/24hr?symbol=${symbol}`);
      const data = await response.json();
      return {
        symbol: data.symbol,
        price: parseFloat(data.lastPrice),
        change: parseFloat(data.priceChange),
        changePercent: parseFloat(data.priceChangePercent),
        high: parseFloat(data.highPrice),
        low: parseFloat(data.lowPrice),
        volume: parseFloat(data.volume),
      };
    } catch (error) {
      console.error('Error fetching 24hr ticker:', error);
      return null;
    }
  },

  // Get kline/candlestick data with multiple timeframes
  async getKlineData(symbol: string = 'BTCUSDT', interval: string = '1m', limit: number = 100) {
    try {
      const response = await fetch(
        `${this.baseUrl}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
      );
      const data = await response.json();
      
      return data.map((kline: any[]) => ({
        timestamp: kline[0],
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5]),
      }));
    } catch (error) {
      console.error('Error fetching kline data:', error);
      return null;
    }
  },

  // Get multiple symbols at once
  async getMultiplePrices(symbols: string[] = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT']) {
    try {
      const symbolsQuery = symbols.map(s => `"${s}"`).join(',');
      const response = await fetch(`${this.baseUrl}/ticker/price?symbols=[${symbolsQuery}]`);
      const data = await response.json();
      
      return data.reduce((acc: any, item: any) => {
        acc[item.symbol] = parseFloat(item.price);
        return acc;
      }, {});
    } catch (error) {
      console.error('Error fetching multiple prices:', error);
      return null;
    }
  },
};