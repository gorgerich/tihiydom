import { motion } from 'framer-motion';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Info, Play, Sparkles } from 'lucide-react';
import { OnboardingStories } from "./OnboardingStories";
import { PackagesSection } from "ui/PackagesSection";
import { AIChatModal } from "ui/AIChatModal";
import { AboutServiceModal } from 'ui./AboutServiceModal';

export function TopButtons() {
  const [isStoriesOpen, setIsStoriesOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState<string | null>(null);

  const handleOpenStepper = (tariffName: string) => {
    setSelectedTariff(tariffName);
    setIsAIChatOpen(false);
  };

  return (
    <>
      <div className="relative z-30 pt-2 pb-1">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex items-center justify-center">
            {/* Три кнопки по центру */}
            <div className="w-full flex items-center justify-center gap-4 md:gap-8 mt-[75px] md:mt-[55px]">
              {/* Левая кнопка: О сервисе */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsAboutOpen(true)}
                className="group relative px-6 py-3 md:px-8 md:py-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg transition-all duration-300 hover:bg-white/20 hover:shadow-white/10 hover:border-white/30"
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="p-1.5 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                    <Info className="w-4 h-4 md:w-5 md:h-5 text-white/90" />
                  </div>
                  <span className="text-sm md:text-base font-medium text-white/90 tracking-wide">О сервисе</span>
                </div>
              </motion.button>

              {/* Центральная кнопка: Как начать */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsStoriesOpen(true)}
                className="relative w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-2xl border border-white/30 shadow-2xl flex flex-col items-center justify-center gap-1 md:gap-2 transition-all duration-300 hover:border-white/50 group"
              >
                <div className="absolute inset-0 rounded-full bg-white/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative p-2 md:p-3 rounded-full bg-white/10 border border-white/10 group-hover:bg-white/20 transition-colors">
                  <Play className="w-4 h-4 md:w-6 md:h-6 text-white fill-white/80 ml-0.5" />
                </div>
                <span className="relative text-[10px] md:text-xs font-semibold text-white uppercase tracking-wider text-center leading-tight">
                  Как<br/>начать
                </span>
              </motion.button>

              {/* Правая кнопка: Создать с ИИ */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsAIChatOpen(true)}
                className="group relative px-6 py-3 md:px-8 md:py-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg transition-all duration-300 hover:bg-white/20 hover:shadow-white/10 hover:border-white/30"
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="p-1.5 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white/90" />
                  </div>
                  <span className="text-sm md:text-base font-medium text-white/90 tracking-wide">Создать с ИИ</span>
                </div>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Модальные окна рендерим через портал прямо в body */}
      {createPortal(
        <>
          <AboutServiceModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
          <OnboardingStories isOpen={isStoriesOpen} onClose={() => setIsStoriesOpen(false)} />
          <AIChatModal 
            isOpen={isAIChatOpen} 
            onClose={() => setIsAIChatOpen(false)} 
            onOpenStepper={handleOpenStepper}
          />
        </>,
        document.body
      )}
    </>
  );
}
