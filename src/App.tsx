import { QueryClient, QueryClientProvider } from 'react-query';
import { fetch24hTicker } from './services/api';
import { MarketTable } from './components/MarketTable';
import { NewListingAlert } from './components/NewListingAlert';
import { LanguageSelector } from './components/LanguageSelector';
import { PromoPopup } from './components/PromoPopup';
import { Activity, Sun, Moon } from 'lucide-react';
import { useQuery } from 'react-query';
import { useState, useEffect } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: 3,
      staleTime: 0,
    },
  },
});

function Dashboard() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const { data: marketData } = useQuery({
    queryKey: ['24hTicker'],
    queryFn: fetch24hTicker,
    refetchInterval: 5000,
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setIsDarkMode(savedTheme === 'dark');
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    const newTheme = !isDarkMode ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-all duration-300`}>
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <img 
                src="https://www.betabot.org/betafuturos.svg" 
                alt="Beta Bot Logo" 
                className="h-12 sm:h-16 w-auto transform transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>
              <div className="flex items-center gap-2 text-sm text-green-500 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                <Activity className="w-4 h-4" />
                <span>Ao vivo</span>
              </div>
              <LanguageSelector />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fade-in">
        <NewListingAlert />
        <MarketTable data={marketData || []} />
      </main>

      <footer className="mt-12 py-6 bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Beta Bot. Dados fornecidos por Binance Futures.
          </div>
        </div>
      </footer>

      <PromoPopup />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}

export default App;