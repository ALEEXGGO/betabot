import { useQuery } from 'react-query';
import { fetchExchangeInfo } from '../services/api';
import { Bell, ExternalLink } from 'lucide-react';

export function NewListingAlert() {
  const { data: exchangeInfo } = useQuery('exchangeInfo', fetchExchangeInfo, {
    refetchInterval: 60000, // Refresh every minute
  });

  if (!exchangeInfo?.symbols) return null;

  const sortedSymbols = [...exchangeInfo.symbols].sort((a, b) => 
    b.onboardDate - a.onboardDate
  );

  const latestSymbol = sortedSymbols[0];
  const listingDate = new Date(latestSymbol.onboardDate).toLocaleDateString();

  const getCryptoIcon = (symbol: string) => {
    const baseAsset = symbol.replace('USDT', '').toLowerCase();
    return `https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/32/color/${baseAsset}.png`;
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6 transform hover:scale-[1.02] transition-transform duration-300">
      <div className="flex items-start gap-4">
        <div className="bg-blue-100 dark:bg-blue-900/40 rounded-full p-2">
          <Bell className="w-6 h-6 text-blue-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
            Nova Listagem Detectada
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <img
              src={getCryptoIcon(latestSymbol.symbol)}
              alt={latestSymbol.symbol}
              className="w-6 h-6"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/32/color/generic.png';
              }}
            />
            <p className="text-blue-700 dark:text-blue-300">
              {latestSymbol.symbol} foi listado em {listingDate}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              Base: {latestSymbol.baseAsset}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
              Quote: {latestSymbol.quoteAsset}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
              Tipo: {latestSymbol.contractType}
            </span>
          </div>
          <a
            href={`https://www.binance.com/en/futures/${latestSymbol.symbol}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Ver na Binance <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
