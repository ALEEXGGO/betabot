import axios from 'axios';
import { ExchangeInfo, MarketData } from '../types/binance';

const api = axios.create({
  baseURL: 'https://fapi.binance.com',
});

export const fetchExchangeInfo = async (): Promise<ExchangeInfo> => {
  const response = await api.get('/fapi/v1/exchangeInfo');
  return response.data;
};

const calculateRSI = (prices: number[]): number => {
  const periods = 14;
  const changes = [];
  
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }
  
  let gains = 0;
  let losses = 0;
  
  changes.slice(0, periods).forEach(change => {
    if (change > 0) gains += change;
    else losses -= change;
  });
  
  let avgGain = gains / periods;
  let avgLoss = losses / periods;
  
  changes.slice(periods).forEach(change => {
    if (change > 0) {
      avgGain = (avgGain * 13 + change) / periods;
      avgLoss = (avgLoss * 13) / periods;
    } else {
      avgGain = (avgGain * 13) / periods;
      avgLoss = (avgLoss * 13 - change) / periods;
    }
  });
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
};

const calculateEMASignal = (price: number, ema50: number, previousEma50: number) => {
  const isAboveEma = price > ema50;
  const isEmaUpTrend = ema50 > previousEma50;
  
  if (isAboveEma && isEmaUpTrend) return 'bullish';
  if (!isAboveEma && !isEmaUpTrend) return 'bearish';
  return 'neutral';
};

const calculateIchimokuSignal = (
  price: number,
  tenkanSen: number,
  kijunSen: number,
  senkouSpanA: number,
  senkouSpanB: number,
  prevTenkanSen: number,
  prevKijunSen: number
) => {
  const isBullishCross = tenkanSen > kijunSen && prevTenkanSen <= prevKijunSen;
  const isBearishCross = tenkanSen < kijunSen && prevTenkanSen >= prevKijunSen;
  
  const isAboveKumo = price > Math.max(senkouSpanA, senkouSpanB);
  const isBelowKumo = price < Math.min(senkouSpanA, senkouSpanB);
  
  const isBullishKumo = senkouSpanA > senkouSpanB;
  
  let bullishSignals = 0;
  let bearishSignals = 0;
  
  if (isBullishCross) bullishSignals++;
  if (isBearishCross) bearishSignals++;
  if (isAboveKumo) bullishSignals++;
  if (isBelowKumo) bearishSignals++;
  if (isBullishKumo) bullishSignals++;
  if (!isBullishKumo) bearishSignals++;
  
  if (bullishSignals > bearishSignals) return 'bullish';
  if (bearishSignals > bullishSignals) return 'bearish';
  return 'neutral';
};

const calculateCombinedSignal = (emaSignal: string, ichimokuSignal: string) => {
  if (emaSignal === ichimokuSignal) return emaSignal;
  if (emaSignal === 'neutral') return ichimokuSignal;
  if (ichimokuSignal === 'neutral') return emaSignal;
  return 'neutral';
};

export const fetch24hTicker = async (): Promise<MarketData[]> => {
  const response = await api.get('/fapi/v1/ticker/24hr');
  const data = response.data;

  const btcDomData = data.find((item: any) => item.symbol === 'BTCDOMUSDT');
  const btcDominance = btcDomData ? parseFloat(btcDomData.lastPrice) : null;

  const enrichedData = await Promise.all(
    data.map(async (item: any) => {
      try {
        const klinesResponse = await api.get('/fapi/v1/klines', {
          params: {
            symbol: item.symbol,
            interval: '1h',
            limit: 60
          }
        });
        
        const klines = klinesResponse.data;
        const prices = klines.map((k: any[]) => parseFloat(k[4]));
        
        const rsi = calculateRSI(prices);
        const price = parseFloat(item.lastPrice);
        const ema50 = prices.reduce((acc: number, p: number) => acc * 0.962 + p * 0.038, prices[0]);
        const prevEma50 = prices.slice(0, -1).reduce((acc: number, p: number) => acc * 0.962 + p * 0.038, prices[0]);
        
        const high9 = Math.max(...klines.slice(-9).map((k: any[]) => parseFloat(k[2])));
        const low9 = Math.min(...klines.slice(-9).map((k: any[]) => parseFloat(k[3])));
        const high26 = Math.max(...klines.slice(-26).map((k: any[]) => parseFloat(k[2])));
        const low26 = Math.min(...klines.slice(-26).map((k: any[]) => parseFloat(k[3])));
        const high52 = Math.max(...klines.slice(-52).map((k: any[]) => parseFloat(k[2])));
        const low52 = Math.min(...klines.slice(-52).map((k: any[]) => parseFloat(k[3])));
        
        const tenkanSen = (high9 + low9) / 2;
        const kijunSen = (high26 + low26) / 2;
        const senkouSpanA = (tenkanSen + kijunSen) / 2;
        const senkouSpanB = (high52 + low52) / 2;
        
        const prevHigh9 = Math.max(...klines.slice(-10, -1).map((k: any[]) => parseFloat(k[2])));
        const prevLow9 = Math.min(...klines.slice(-10, -1).map((k: any[]) => parseFloat(k[3])));
        const prevHigh26 = Math.max(...klines.slice(-27, -1).map((k: any[]) => parseFloat(k[2])));
        const prevLow26 = Math.min(...klines.slice(-27, -1).map((k: any[]) => parseFloat(k[3])));
        
        const prevTenkanSen = (prevHigh9 + prevLow9) / 2;
        const prevKijunSen = (prevHigh26 + prevLow26) / 2;
        
        const emaSignal = calculateEMASignal(price, ema50, prevEma50);
        const ichimokuSignal = calculateIchimokuSignal(
          price,
          tenkanSen,
          kijunSen,
          senkouSpanA,
          senkouSpanB,
          prevTenkanSen,
          prevKijunSen
        );
        
        const iaSignal = calculateCombinedSignal(emaSignal, ichimokuSignal);
        
        const lsrResponse = await api.get(`/futures/data/globalLongShortAccountRatio?symbol=${item.symbol}&period=5m`);
        const lsrData = lsrResponse.data;
        
        return {
          ...item,
          btcDominance,
          longShortRatio: lsrData[0]?.longShortRatio || null,
          technicalIndicators: {
            macd: parseFloat(item.priceChangePercent) > 0 && parseFloat(item.volume) > 1000000 ? 'bullish' : 'bearish',
            rsi,
            volatility: Math.abs(parseFloat(item.priceChangePercent)),
            ema12: price * 0.98,
            ema26: price * 0.95,
            ema50,
            ichimoku: {
              tenkanSen,
              kijunSen,
              senkouSpanA,
              senkouSpanB
            },
            iaSignal
          }
        };
      } catch (error) {
        console.error(`Error fetching data for ${item.symbol}:`, error);
        return item;
      }
    })
  );

  return enrichedData;
};
