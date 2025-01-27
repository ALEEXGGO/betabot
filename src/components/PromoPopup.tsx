import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function PromoPopup() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={16} />
        </button>
        <img
          src="https://www.betabot.org/betafuturos.svg"
          alt="Beta Bot Promo"
          className="w-full h-auto mb-2 hover:scale-105 transition-transform duration-300"
        />
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Descubra o poder do Beta Bot para suas operações!
        </p>
      </div>
    </div>
  );
}