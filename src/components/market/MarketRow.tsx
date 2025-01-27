import { useState, useRef, useEffect } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { MarketRowProps } from '../../types/market';

export function MarketRow({ item }: MarketRowProps) {
  const [priceAnimation, setPriceAnimation] = useState<'none' | 'up' | 'down'>('none');
  const [volumeAnimation, setVolumeAnimation] = useState<'none' | 'up' | 'down'>('none');
  const [rsiAnimation, setRsiAnimation] = useState<'none' | 'up' | 'down'>('none');
  const [lsrAnimation, setLsrAnimation] = useState<'none' | 'up' | 'down'>('none');
  
  const prevValues = useRef({
    price: parseFloat(item.lastPrice),
    volume: parseFloat(item.volume),
    rsi: item.technicalIndicators?.rsi || 0,
    lsr: parseFloat(item.longShortRatio || '1.0')
  });

  useEffect(() => {
    const currentPrice = parseFloat(item.lastPrice);
    const currentVolume = parseFloat(item.volume);
    const currentRsi = item.technicalIndicators?.rsi || 0;
    const currentLsr = parseFloat(item.longShortRatio || '1.0');

    if (currentPrice !== prevValues.current.price) {
      setPriceAnimation(currentPrice > prevValues.current.price ? 'up' : 'down');
      setTimeout(() => setPriceAnimation('none'), 1000);
    }
    if (currentVolume !== prevValues.current.volume) {
      setVolumeAnimation(currentVolume > prevValues.current.volume ? 'up' : 'down');
      setTimeout(() => setVolumeAnimation('none'), 1000);
    }
    if (currentRsi !== prevValues.current.rsi) {
      setRsiAnimation(currentRsi > prevValues.current.rsi ? 'up' : 'down');
      setTimeout(() => setRsiAnimation('none'), 1000);
    }
    if (currentLsr !== prevValues.current.lsr) {
      setLsrAnimation(currentLsr > prevValues.current.lsr ? 'up' : 'down');
      setTimeout(() => setLsrAnimation('none'), 1000);
    }

    prevValues.current = {
      price: currentPrice,
      volume: currentVolume,
      rsi: currentRsi,
      lsr: currentLsr
    };
  }, [item]);

  const getSignalIcon = (signal: string) => {
    if (signal === 'bullish') return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (signal === 'bearish') return <ArrowDown className="w-4 h-4 text-red-500" />;
    return null;
  };

  const getRSIColor = (value: number) => {
    if (value >= 70) return 'text-red-500';
    if (value <= 30) return 'text-green-500';
    return 'text-gray-200';
  };

  const getAnimationClass = (type: 'none' | 'up' | 'down') => {
    if (type === 'up') return 'animate-blink-green';
    if (type === 'down') return 'animate-blink-red';
    return '';
  };

  const formatNumber = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '0';
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  return (
    <tr className="hover:bg-gray-50/10 transition-colors text-gray-200">
      <td className="px-2 sm:px-4 py-2 sm:py-3 font-medium">
        <div className="flex items-center gap-2">
          <img 
            src={`https://www.betabot.org/icons/${item.symbol.toLowerCase().replace('usdt', '')}.png`} 
            alt={item.symbol} 
            className="w-6 h-6"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {item.symbol.replace('USDT', '')}
        </div>
      </td>
      <td className="px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center gap-2">
          {getSignalIcon(item.technicalIndicators?.iaSignal || '')}
          <span className={
            item.technicalIndicators?.iaSignal === 'bullish' ? 'text-green-500' : 
            item.technicalIndicators?.iaSignal === 'bearish' ? 'text-red-500' : 
            'text-gray-500'
          }>
            {item.technicalIndicators?.iaSignal || '-'}
          </span>
        </div>
      </td>
      <td className="px-2 sm:px-4 py-2 sm:py-3">
        <span className={parseFloat(item.priceChangePercent) >= 0 ? 'text-green-500' : 'text-red-500'}>
          {item.priceChangePercent}
        </span>
      </td>
      <td className={`px-2 sm:px-4 py-2 sm:py-3 font-medium ${getAnimationClass(priceAnimation)}`}>
        ${parseFloat(item.lastPrice).toFixed(4)}
      </td>
      <td className={`px-2 sm:px-4 py-2 sm:py-3 ${getAnimationClass(volumeAnimation)}`}>
        ${formatNumber(item.volume)}
      </td>
      <td className={`px-2 sm:px-4 py-2 sm:py-3 ${getAnimationClass(rsiAnimation)}`}>
        <div className={`font-medium ${getRSIColor(item.technicalIndicators?.rsi || 0)}`}>
          {(item.technicalIndicators?.rsi || 0).toFixed(1)}
        </div>
      </td>
      <td className="px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center gap-2">
          {getSignalIcon(item.technicalIndicators?.macd || '')}
          <span className={
            item.technicalIndicators?.macd === 'bullish' ? 'text-green-500' : 
            item.technicalIndicators?.macd === 'bearish' ? 'text-red-500' : 
            'text-gray-500'
          }>
            {item.technicalIndicators?.macd || '-'}
          </span>
        </div>
      </td>
      <td className={`px-2 sm:px-4 py-2 sm:py-3 ${getAnimationClass(lsrAnimation)}`}>
        <span className="text-gray-200">
          {item.longShortRatio ? parseFloat(item.longShortRatio).toFixed(2) : '-'}
        </span>
      </td>
    </tr>
  );
}