export interface FilterState {
  minVolume: string;
  minChange: string;
  macdSignal: string;
  rsiRange: {
    min: string;
    max: string;
  };
  selectedTimeframe: string;
  showLSR?: boolean;
}

export interface MarketRowProps {
  item: {
    symbol: string;
    lastPrice: string;
    priceChangePercent: string;
    volume: string;
    longShortRatio?: string;
    technicalIndicators?: {
      rsi?: number;
      macd?: string;
      iaSignal?: string;
      ema12?: number;
      ema26?: number;
      ema50?: number;
      ichimoku?: {
        tenkanSen: number;
        kijunSen: number;
        senkouSpanA: number;
        senkouSpanB: number;
      };
    };
  };
}