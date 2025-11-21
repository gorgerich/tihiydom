import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ChevronDown, ChevronUp, Download, Share2 } from './Icons';
import { cn } from './ui/utils';

interface BreakdownItem {
  name: string;
  price?: number;
}

interface BreakdownSection {
  category: string;
  price: number;
  items?: BreakdownItem[];
}

interface FloatingCalculatorProps {
  total: number;
  breakdown: BreakdownSection[];
}

export function FloatingCalculator({ total, breakdown }: FloatingCalculatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDownloadPDF = () => {
    console.log('Downloading PDF...');
  };

  const handleShare = () => {
    console.log('Sharing...');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-md px-4 md:px-0">
      <Card className="bg-slate-900/90 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden rounded-3xl">
        <CardContent className={cn('relative z-10 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]', isExpanded ? 'p-5 md:p-6' : 'py-3 px-5')}>
          <div
            className={cn(
              'transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]',
              !isExpanded ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
            )}
          >
            {/* Закрытое состояние */}
            <div className="flex items-center justify-between gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Итого</span>
                <span className="text-xl font-light text-white tabular-nums">{total.toLocaleString('ru-RU')} ₽</span>
              </div>
              <button
                onClick={() => setIsExpanded(true)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <ChevronUp className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div
            className={cn(
              'transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]',
              isExpanded ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
            )}
          >
            {/* Открытое состояние */}
            <div className="space-y-4">
              {/* Заголовок */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-sm font-medium text-gray-200 tracking-wide uppercase">Детализация</h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-gray-400 hover:text-white"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              {/* Список разбивки */}
              <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {breakdown.map((section, index) => (
                  <div 
                    key={index} 
                    className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                  >
                    {/* Категория */}
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-sm text-gray-200 font-medium">{section.category}</span>
                      <span className="text-sm text-white tabular-nums">
                        {section.price.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>

                    {/* Подпункты */}
                    {section.items && section.items.length > 0 && (
                      <div className="space-y-1 mt-2 pt-2 border-t border-white/5">
                        {section.items.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="flex items-start justify-between text-xs text-gray-400 font-light"
                          >
                            <span className="flex items-start gap-1.5">
                              <span>{item.name}</span>
                            </span>
                            {item.price !== undefined && (
                              <span className="ml-2 whitespace-nowrap tabular-nums">
                                {item.price.toLocaleString('ru-RU')} ₽
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Итого */}
              <div 
                className="flex items-center justify-between pt-4 border-t border-white/10"
              >
                <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Итого к оплате</span>
                <span className="text-2xl font-light text-white tabular-nums">{total.toLocaleString('ru-RU')} ₽</span>
              </div>

              {/* Кнопки действий */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleDownloadPDF}
                  className="flex items-center justify-center gap-2 border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/20 h-10 rounded-xl text-xs uppercase tracking-wide"
                >
                  <Download className="h-4 w-4" />
                  <span>PDF</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/20 h-10 rounded-xl text-xs uppercase tracking-wide"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Поделиться</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
