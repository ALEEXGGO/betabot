export interface ExchangeInfo {
  symbols: Symbol[];
  timezone: string;
  serverTime: number;
}

export interface Symbol {
  symbol: string;
  pair: string;
  contractType: string;
  deliveryDate: number;
  onboardDate: number;
  status: string;
  maintMarginPercent: string;
  requiredMarginPercent: string;
  baseAsset: string;
  quoteAsset: string;
  marginAsset: string;
  pricePrecision: number;
  quantityPrecision: number;
  baseAssetPrecision: number;
  quotePrecision: number;
  underlyingType: string;
  settlePlan: number;
  triggerProtect: string;
  filters: any[];
  orderTypes: string[];
  timeInForce: string[];
}

export interface TechnicalIndicators {
  macd: 'bullish' | 'bearish';
  rsi: number;
  volatility: number;
  ema12: number;
  ema26: number;
  ema50: number;
  ema12_5m: number;
  ema26_5m: number;
  ema12_15m: number;
  ema26_15m: number;
  ema12_1h: number;
  ema26_1h: number;
  ichimoku: {
    tenkanSen: number;
    kijunSen: number;
    senkouSpanA: number;
    senkouSpanB: number;
  };
  iaSignal: 'bullish' | 'bearish' | 'neutral';
}

export interface MarketData {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  lastPrice: string;
  volume: string;
  count?: string; // Added count for number of trades
  longShortRatio?: string;
  technicalIndicators?: TechnicalIndicators;
  volatility?: string;
  rsi?: string;
}
