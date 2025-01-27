import { Filter, Scale, Clock } from 'lucide-react';
import { FilterState } from '../../types/market';
import { useEffect } from 'react';

interface MarketFiltersProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

const timeframes = ['5m', '15m', '30m', '1h', '4h', '12h', '1d', '1w', '1m'];

export function MarketFilters({ filters, setFilters, showFilters, setShowFilters }: MarketFiltersProps) {
  // RSI Alert System
  useEffect(() => {
    const checkRSIAlerts = (symbol: string, rsi: number) => {
      if (rsi <= parseFloat(filters.rsiRange.min)) {
        new Notification(`RSI Oversold Alert - ${symbol}`, {
          body: `RSI is at ${rsi.toFixed(2)} (Oversold) - ${filters.selectedTimeframe}`,
          icon: "https://www.betabot.org/betafuturos.svg"
        });
      } else if (rsi >= parseFloat(filters.rsiRange.max)) {
        new Notification(`RSI Overbought Alert - ${symbol}`, {
          body: `RSI is at ${rsi.toFixed(2)} (Overbought) - ${filters.selectedTimeframe}`,
          icon: "https://www.betabot.org/betafuturos.svg"
        });
      }
    };

    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    window.addEventListener('rsiUpdate', ((event: CustomEvent) => {
      const { symbol, rsi } = event.detail;
      checkRSIAlerts(symbol, rsi);
    }) as EventListener);

    return () => {
      window.removeEventListener('rsiUpdate', (() => {}) as EventListener);
    };
  }, [filters.rsiRange, filters.selectedTimeframe]);

  return (
    <div className="w-full">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <Filter className="h-4 w-4" />
        Filtros Avançados
      </button>

      {showFilters && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg animate-fade-in">
          <div className="col-span-full">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-primary-500" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Timeframe
              </label>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {timeframes.map((timeframe) => (
                <button
                  key={timeframe}
                  onClick={() => setFilters({
                    ...filters,
                    selectedTimeframe: timeframe === filters.selectedTimeframe ? '' : timeframe
                  })}
                  className={`px-3 py-1 rounded-md text-sm transition-all duration-200 ${
                    timeframe === filters.selectedTimeframe
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {timeframe}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-4 h-4 text-primary-500" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Volume Mínimo (USDT)
              </label>
            </div>
            <input
              type="number"
              value={filters.minVolume}
              onChange={(e) => setFilters({ ...filters, minVolume: e.target.value })}
              className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
              placeholder="Ex: 1000000"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-4 h-4 text-primary-500" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Variação Mínima %
              </label>
            </div>
            <input
              type="number"
              value={filters.minChange}
              onChange={(e) => setFilters({ ...filters, minChange: e.target.value })}
              className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
              placeholder="Ex: 5"
            />
          </div>

          <div className="col-span-full">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-4 h-4 text-primary-500" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                RSI Range
              </label>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="number"
                  value={filters.rsiRange.min}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    rsiRange: { ...filters.rsiRange, min: e.target.value }
                  })}
                  className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
                  placeholder="Min RSI"
                />
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  value={filters.rsiRange.max}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    rsiRange: { ...filters.rsiRange, max: e.target.value }
                  })}
                  className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
                  placeholder="Max RSI"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}