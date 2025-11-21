import { useState, useEffect, useRef } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Option {
  id: string;
  name: string;
  image: string;
}

interface CoffinMockupProps {
  coffin?: Option;
  wreath?: Option;
  lining?: Option;
  plaque?: Option;
  monument?: Option;
  availableOptions?: {
    coffin?: Option[];
    wreath?: Option[];
    lining?: Option[];
    plaque?: Option[];
    monument?: Option[];
  };
  onSelectionChange?: (category: string, optionId: string) => void;
}

export function CoffinMockup({ 
  coffin, 
  wreath, 
  lining, 
  plaque, 
  monument,
  availableOptions,
  onSelectionChange
}: CoffinMockupProps) {
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Закрытие меню при клике вне области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowOptions(null);
      }
    };

    if (showOptions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showOptions]);

  const handleElementClick = (category: string) => {
    if (availableOptions?.[category as keyof typeof availableOptions]) {
      setShowOptions(showOptions === category ? null : category);
    }
  };

  const handleOptionSelect = (category: string, optionId: string) => {
    onSelectionChange?.(category, optionId);
    setShowOptions(null);
    setHoveredElement(null);
  };

  const isInteractive = !!availableOptions && !!onSelectionChange;

  return (
    <div ref={containerRef} className="relative w-full aspect-[4/3] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl overflow-hidden p-8" style={{ perspective: '1800px' }}>
      {/* SVG Definitions для форм */}
      <svg width="0" height="0" className="absolute">
        <defs>
          {/* Форма памятника (стела с закругленным верхом) */}
          <clipPath id="monument-shape" clipPathUnits="objectBoundingBox">
            <path d="M 0.2,1 L 0.2,0.15 Q 0.2,0 0.35,0 L 0.65,0 Q 0.8,0 0.8,0.15 L 0.8,1 Z" />
          </clipPath>
          
          {/* Форма таблички (овал) */}
          <clipPath id="plaque-shape" clipPathUnits="objectBoundingBox">
            <ellipse cx="0.5" cy="0.5" rx="0.48" ry="0.45" />
          </clipPath>

          {/* Сетка фона */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
          </pattern>
        </defs>
      </svg>

      {/* Фоновая сетка */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Центральная композиция */}
      <div className="relative h-full flex items-center justify-center gap-8">
        
        {/* Памятник (слева) */}
        {monument && (
          <div className="relative">
            <div 
              className={`group relative transition-all duration-300 ${isInteractive ? 'cursor-pointer hover:scale-105' : 'hover:scale-105'}`}
              style={{ 
                transform: 'rotateY(-5deg)',
                transformStyle: 'preserve-3d'
              }}
              onMouseEnter={() => isInteractive && setHoveredElement('monument')}
              onMouseLeave={() => isInteractive && setHoveredElement(null)}
              onClick={() => isInteractive && handleElementClick('monument')}
            >
              <div className={`absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 backdrop-blur-sm rounded-full text-xs text-white whitespace-nowrap transition-opacity ${
                hoveredElement === 'monument' || showOptions === 'monument' ? 'bg-purple-500/90 opacity-100' : 'bg-purple-500/90 opacity-0 group-hover:opacity-100'
              }`}>
                {isInteractive ? 'Нажмите для выбора' : 'Памятник'}
              </div>
              
              {/* Форма памятника - стела */}
              <div className={`relative w-28 h-40 transition-all duration-300 ${
                hoveredElement === 'monument' || showOptions === 'monument' ? 'drop-shadow-2xl' : 'drop-shadow-xl'
              }`}
                style={{ 
                  clipPath: 'url(#monument-shape)',
                }}
              >
                <div className="w-full h-full transition-opacity duration-500 bg-gradient-to-b from-white/10 to-transparent">
                  <ImageWithFallback 
                    src={monument.image}
                    alt={monument.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-white/10"></div>
                
                {/* Бордер для памятника */}
                <div className={`absolute inset-0 border-2 transition-colors ${
                  hoveredElement === 'monument' || showOptions === 'monument' ? 'border-purple-400' : 'border-white/20'
                }`}
                  style={{ 
                    clipPath: 'url(#monument-shape)',
                  }}
                ></div>
                
                {/* Светящееся кольцо при наведении */}
                {(hoveredElement === 'monument' || showOptions === 'monument') && (
                  <div className="absolute inset-0 ring-2 ring-purple-400/50 animate-pulse"
                    style={{ 
                      clipPath: 'url(#monument-shape)',
                    }}
                  ></div>
                )}
                
                <div className="absolute bottom-2 left-2 right-2 text-xs text-white/90 text-center">
                  {monument.name}
                </div>
              </div>
            </div>

            {/* Опции для выбора памятника */}
            {showOptions === 'monument' && availableOptions?.monument && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 min-w-[200px] animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <div className="w-2 h-2 rounded bg-pink-400"></div>
                  Выберите памятник:
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableOptions.monument.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleOptionSelect('monument', option.id)}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all hover:bg-purple-50 ${
                        monument.id === option.id ? 'bg-purple-100 ring-2 ring-purple-400' : ''
                      }`}
                    >
                      <ImageWithFallback 
                        src={option.image}
                        alt={option.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <span className="text-sm text-gray-900">{option.name}</span>
                      {monument.id === option.id && (
                        <svg className="w-4 h-4 text-purple-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Основной блок - Открытый гроб с внутренней отделкой */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            {/* Бейдж гроба */}
            <div className={`absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-1.5 backdrop-blur-sm rounded-full text-sm text-white flex items-center gap-2 shadow-lg transition-all z-20 ${
              hoveredElement === 'coffin' || showOptions === 'coffin' ? 'bg-stone-600' : 'bg-stone-600/80'
            }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              {isInteractive && (hoveredElement === 'coffin' || showOptions === 'coffin') ? 'Выберите гроб' : 'Открытый гроб'}
            </div>

            {/* 3D Открытый гроб Контейнер */}
            <div 
              className={`relative group transition-all duration-500`}
              style={{ 
                transformStyle: 'preserve-3d',
                transform: 'rotateX(25deg) rotateY(-30deg)',
              }}
            >
              {/* 3D Открытый гроб */}
              <div 
                className="relative w-full h-80"
                style={{ 
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Корпус гроба (нижняя часть) */}
                <div
                  className={`absolute inset-x-0 bottom-0 h-48 transition-all duration-300 ${isInteractive ? 'cursor-pointer' : ''}`}
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                  onMouseEnter={() => isInteractive && setHoveredElement('coffin')}
                  onMouseLeave={() => isInteractive && setHoveredElement(null)}
                  onClick={() => isInteractive && handleElementClick('coffin')}
                >
                  {/* Форма корпуса гроба */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 400 192">
                    <defs>
                      <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#78716c" stopOpacity="0.95" />
                        <stop offset="30%" stopColor="#57534e" stopOpacity="1" />
                        <stop offset="70%" stopColor="#44403c" stopOpacity="1" />
                        <stop offset="100%" stopColor="#292524" stopOpacity="1" />
                      </linearGradient>
                    </defs>
                    {/* Внешняя форма гроба */}
                    <polygon 
                      points="80,20 320,10 380,60 380,140 320,180 80,172 20,130 20,70" 
                      fill="url(#bodyGrad)"
                      stroke="#1c1917"
                      strokeWidth="2"
                    />
                  </svg>

                  {/* Текстура материала корпуса */}
                  {coffin && (
                    <div 
                      className="absolute inset-0 w-full h-full"
                      style={{
                        clipPath: 'polygon(20% 10%, 80% 5%, 95% 31%, 95% 73%, 80% 94%, 20% 90%, 5% 68%, 5% 36%)'
                      }}
                    >
                      <ImageWithFallback 
                        src={coffin.image}
                        alt={coffin.name}
                        className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/30"></div>
                    </div>
                  )}

                  {/* Внутренняя часть корпуса (видимая изнутри) */}
                  <div 
                    className={`absolute inset-0 transition-all duration-300 ${isInteractive ? 'cursor-pointer' : ''}`}
                    style={{
                      clipPath: 'polygon(25% 20%, 75% 15%, 90% 38%, 90% 68%, 75% 88%, 25% 83%, 10% 63%, 10% 43%)',
                      transform: 'translateZ(1px)',
                    }}
                    onMouseEnter={(e) => {
                      e.stopPropagation();
                      isInteractive && setHoveredElement('lining');
                    }}
                    onMouseLeave={(e) => {
                      e.stopPropagation();
                      isInteractive && setHoveredElement(null);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      isInteractive && handleElementClick('lining');
                    }}
                  >
                    {lining && (
                      <>
                        <ImageWithFallback 
                          src={lining.image}
                          alt={lining.name}
                          className="w-full h-full object-cover opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent"></div>
                        
                        {/* Пунктирная рамка для отделки */}
                        <div 
                          className={`absolute inset-0 border-2 border-dashed transition-colors pointer-events-none ${
                            hoveredElement === 'lining' || showOptions === 'lining' ? 'border-purple-400' : 'border-white/50'
                          }`}
                          style={{
                            clipPath: 'polygon(25% 20%, 75% 15%, 90% 38%, 90% 68%, 75% 88%, 25% 83%, 10% 63%, 10% 43%)'
                          }}
                        ></div>

                        {/* Лейбл отделки */}
                        <div className={`absolute top-8 left-12 px-3 py-1.5 backdrop-blur-sm rounded-lg text-xs transition-colors pointer-events-none shadow-lg ${
                          hoveredElement === 'lining' || showOptions === 'lining' ? 'bg-purple-500 text-white' : 'bg-white/95 text-gray-800'
                        }`}>
                          {hoveredElement === 'lining' || showOptions === 'lining' ? 'Нажмите для изменения' : `Отделка: ${lining.name}`}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Бордер корпуса */}
                  <div 
                    className={`absolute inset-0 border-2 transition-colors pointer-events-none ${
                      hoveredElement === 'coffin' || showOptions === 'coffin' ? 'border-stone-400' : 'border-stone-600/50'
                    }`}
                    style={{
                      clipPath: 'polygon(20% 10%, 80% 5%, 95% 31%, 95% 73%, 80% 94%, 20% 90%, 5% 68%, 5% 36%)'
                    }}
                  ></div>

                  {/* Название гроба */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-10">
                    <div className="px-4 py-2 bg-stone-900/90 backdrop-blur-sm rounded-lg text-sm text-white shadow-xl border border-stone-700">
                      {coffin?.name || 'Материал гроба'}
                    </div>
                  </div>

                  {/* Свечение при наведении на корпус */}
                  {(hoveredElement === 'coffin' || showOptions === 'coffin') && (
                    <div 
                      className="absolute inset-0 pointer-events-none animate-pulse"
                      style={{
                        clipPath: 'polygon(20% 10%, 80% 5%, 95% 31%, 95% 73%, 80% 94%, 20% 90%, 5% 68%, 5% 36%)',
                        boxShadow: 'inset 0 0 30px rgba(168, 162, 158, 0.5), 0 0 50px rgba(168, 162, 158, 0.3)'
                      }}
                    >
                      <div className="w-full h-full"></div>
                    </div>
                  )}
                </div>

                {/* Открытая крышка гроба (повернута вверх) */}
                <div
                  className="absolute inset-x-0 top-0 h-48"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: 'rotateX(-65deg)',
                    transformOrigin: 'bottom center',
                  }}
                >
                  {/* Внешняя сторона крышки */}
                  <div className="absolute inset-0">
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 400 192">
                      <defs>
                        <linearGradient id="lidOuterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#57534e" stopOpacity="0.9" />
                          <stop offset="50%" stopColor="#44403c" stopOpacity="1" />
                          <stop offset="100%" stopColor="#292524" stopOpacity="1" />
                        </linearGradient>
                      </defs>
                      <polygon 
                        points="80,20 320,10 380,60 380,140 320,180 80,172 20,130 20,70" 
                        fill="url(#lidOuterGrad)"
                        stroke="#1c1917"
                        strokeWidth="2"
                      />
                    </svg>

                    {/* Текстура материала крышки снаружи */}
                    {coffin && (
                      <div 
                        className="absolute inset-0 w-full h-full"
                        style={{
                          clipPath: 'polygon(20% 10%, 80% 5%, 95% 31%, 95% 73%, 80% 94%, 20% 90%, 5% 68%, 5% 36%)'
                        }}
                      >
                        <ImageWithFallback 
                          src={coffin.image}
                          alt={coffin.name}
                          className="w-full h-full object-cover opacity-50 mix-blend-overlay"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/40"></div>
                      </div>
                    )}
                  </div>

                  {/* Внутренняя сторона крышки (с отделкой) */}
                  <div
                    className="absolute inset-0"
                    style={{
                      transform: 'rotateX(180deg) translateZ(2px)',
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 400 192">
                      <defs>
                        <linearGradient id="lidInnerGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#f5f5f4" stopOpacity="1" />
                          <stop offset="50%" stopColor="#e7e5e4" stopOpacity="1" />
                          <stop offset="100%" stopColor="#d6d3d1" stopOpacity="1" />
                        </linearGradient>
                      </defs>
                      <polygon 
                        points="80,20 320,10 380,60 380,140 320,180 80,172 20,130 20,70" 
                        fill="url(#lidInnerGrad)"
                        stroke="#a8a29e"
                        strokeWidth="1"
                      />
                    </svg>

                    {/* Внутренняя отделка крышки */}
                    {lining && (
                      <div 
                        className="absolute inset-0 w-full h-full"
                        style={{
                          clipPath: 'polygon(25% 20%, 75% 15%, 90% 38%, 90% 68%, 75% 88%, 25% 83%, 10% 63%, 10% 43%)'
                        }}
                      >
                        <ImageWithFallback 
                          src={lining.image}
                          alt={lining.name}
                          className="w-full h-full object-cover opacity-85"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-white/20"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Декоративные ручки */}
                <div className="absolute top-1/2 left-8 w-10 h-3 bg-gradient-to-r from-amber-800 to-amber-600 rounded-full shadow-lg opacity-70" style={{ transform: 'translateY(-50%)' }}></div>
                <div className="absolute top-1/2 right-8 w-10 h-3 bg-gradient-to-r from-amber-800 to-amber-600 rounded-full shadow-lg opacity-70" style={{ transform: 'translateY(-50%)' }}></div>
              </div>

              {/* Табличка под гробом */}
              {plaque && (
                <div className="mt-8 flex justify-center relative" style={{ transform: 'translateZ(0px)' }}>
                  <div 
                    className={`group/plaque relative transition-all duration-200 ${isInteractive ? 'cursor-pointer hover:scale-105' : 'hover:scale-105'}`}
                    onMouseEnter={() => isInteractive && setHoveredElement('plaque')}
                    onMouseLeave={() => isInteractive && setHoveredElement(null)}
                    onClick={() => isInteractive && handleElementClick('plaque')}
                  >
                    <div className={`absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 backdrop-blur-sm rounded text-xs text-white whitespace-nowrap transition-opacity ${
                      hoveredElement === 'plaque' || showOptions === 'plaque' ? 'bg-amber-500/90 opacity-100' : 'bg-amber-500/90 opacity-0 group-hover/plaque:opacity-100'
                    }`}>
                      {isInteractive ? 'Нажмите' : 'Табличка'}
                    </div>
                    
                    {/* Форма таблички - овал */}
                    <div className={`relative w-36 h-24 transition-all duration-300`}
                      style={{ 
                        clipPath: 'url(#plaque-shape)',
                      }}
                    >
                      <div className="w-full h-full transition-opacity duration-500">
                        <ImageWithFallback 
                          src={plaque.image}
                          alt={plaque.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center pb-2">
                        <span className="text-xs text-white/90">{plaque.name}</span>
                      </div>
                      
                      {/* Бордер таблички */}
                      <div className={`absolute inset-0 border-2 transition-colors ${
                        hoveredElement === 'plaque' || showOptions === 'plaque' ? 'border-amber-400' : 'border-white/30'
                      }`}
                        style={{ 
                          clipPath: 'url(#plaque-shape)',
                        }}
                      ></div>
                      
                      {/* Светящееся кольцо при наведении */}
                      {(hoveredElement === 'plaque' || showOptions === 'plaque') && (
                        <div className="absolute inset-0 ring-2 ring-amber-400/50 animate-pulse"
                          style={{ 
                            clipPath: 'url(#plaque-shape)',
                          }}
                        ></div>
                      )}
                    </div>
                  </div>

                  {/* Опции для выбора таблички */}
                  {showOptions === 'plaque' && availableOptions?.plaque && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 min-w-[200px] animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                        <div className="w-2 h-2 rounded bg-amber-400"></div>
                        Выберите табличку:
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {availableOptions.plaque.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => handleOptionSelect('plaque', option.id)}
                            className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all hover:bg-amber-50 ${
                              plaque.id === option.id ? 'bg-amber-100 ring-2 ring-amber-400' : ''
                            }`}
                          >
                            <ImageWithFallback 
                              src={option.image}
                              alt={option.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <span className="text-sm text-gray-900">{option.name}</span>
                            {plaque.id === option.id && (
                              <svg className="w-4 h-4 text-amber-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Опции для выбора гроба */}
            {showOptions === 'coffin' && availableOptions?.coffin && (
              <div className="absolute top-full left-0 right-0 mt-4 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <div className="w-2 h-2 rounded bg-stone-600"></div>
                  Выберите материал гроба:
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {availableOptions.coffin.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleOptionSelect('coffin', option.id)}
                      className={`relative flex flex-col items-center gap-2 p-3 rounded-lg transition-all hover:bg-stone-50 ${
                        coffin?.id === option.id ? 'bg-stone-100 ring-2 ring-stone-600' : ''
                      }`}
                    >
                      {coffin?.id === option.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-stone-700 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <ImageWithFallback 
                        src={option.image}
                        alt={option.name}
                        className="w-full aspect-video object-cover rounded"
                      />
                      <span className="text-sm text-gray-900 text-center">{option.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Опции для выбора отделки */}
            {showOptions === 'lining' && availableOptions?.lining && (
              <div className="absolute top-full left-0 right-0 mt-4 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <div className="w-2 h-2 rounded border-2 border-dashed border-purple-400"></div>
                  Выберите отделку:
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {availableOptions.lining.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleOptionSelect('lining', option.id)}
                      className={`relative flex flex-col items-center gap-2 p-3 rounded-lg transition-all hover:bg-purple-50 ${
                        lining?.id === option.id ? 'bg-purple-100 ring-2 ring-purple-400' : ''
                      }`}
                    >
                      {lining?.id === option.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <ImageWithFallback 
                        src={option.image}
                        alt={option.name}
                        className="w-full aspect-video object-cover rounded"
                      />
                      <span className="text-sm text-gray-900 text-center">{option.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Венок (справа) */}
        {wreath && (
          <div className="relative">
            <div 
              className={`group relative transition-all duration-300 ${isInteractive ? 'cursor-pointer hover:scale-105 hover:rotate-3' : 'hover:scale-105 hover:rotate-3'}`}
              style={{ 
                transform: 'rotateY(5deg)',
                transformStyle: 'preserve-3d'
              }}
              onMouseEnter={() => isInteractive && setHoveredElement('wreath')}
              onMouseLeave={() => isInteractive && setHoveredElement(null)}
              onClick={() => isInteractive && handleElementClick('wreath')}
            >
              <div className={`absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 backdrop-blur-sm rounded-full text-xs text-white whitespace-nowrap transition-opacity ${
                hoveredElement === 'wreath' || showOptions === 'wreath' ? 'bg-green-500/90 opacity-100' : 'bg-green-500/90 opacity-0 group-hover:opacity-100'
              }`}>
                {isInteractive ? 'Нажмите для выбора' : 'Венок'}
              </div>
              
              {/* Венок - круглая форма с декоративными кольцами */}
              <div className="relative w-32 h-32">
                {/* Основной венок */}
                <div className={`absolute inset-0 rounded-full overflow-hidden shadow-2xl border-4 transition-all duration-300 ${
                  hoveredElement === 'wreath' || showOptions === 'wreath' ? 'border-green-400 scale-105' : 'border-white/30'
                } bg-gradient-to-br from-white/20 to-transparent`}>
                  <div className="w-full h-full transition-opacity duration-500">
                    <ImageWithFallback 
                      src={wreath.image}
                      alt={wreath.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/40"></div>
                  
                  {/* Внутреннее кольцо венка */}
                  <div className="absolute inset-6 rounded-full border-2 border-white/40 border-dashed"></div>
                  
                  {/* Светящееся кольцо при наведении */}
                  {(hoveredElement === 'wreath' || showOptions === 'wreath') && (
                    <div className="absolute inset-0 ring-2 ring-green-400/50 rounded-full animate-pulse"></div>
                  )}
                  
                  <div className="absolute bottom-2 left-2 right-2 text-xs text-white text-center drop-shadow-lg">
                    {wreath.name}
                  </div>
                </div>
                
                {/* Декоративная лента венка (снизу) */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-8">
                  <svg viewBox="0 0 64 32" fill="none" className="w-full h-full drop-shadow-lg">
                    <path 
                      d="M 10,0 Q 32,25 54,0" 
                      stroke={hoveredElement === 'wreath' || showOptions === 'wreath' ? '#4ade80' : '#fff'} 
                      strokeWidth="3" 
                      fill="none"
                      className="transition-colors duration-300"
                    />
                    <path 
                      d="M 10,0 L 5,15 L 10,12 L 15,15 Z" 
                      fill={hoveredElement === 'wreath' || showOptions === 'wreath' ? '#4ade80' : '#fff'}
                      opacity="0.8"
                      className="transition-colors duration-300"
                    />
                    <path 
                      d="M 54,0 L 49,15 L 54,12 L 59,15 Z" 
                      fill={hoveredElement === 'wreath' || showOptions === 'wreath' ? '#4ade80' : '#fff'}
                      opacity="0.8"
                      className="transition-colors duration-300"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Опции для выбора венка */}
            {showOptions === 'wreath' && availableOptions?.wreath && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 min-w-[200px] animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  Выберите венок:
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableOptions.wreath.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleOptionSelect('wreath', option.id)}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all hover:bg-green-50 ${
                        wreath.id === option.id ? 'bg-green-100 ring-2 ring-green-400' : ''
                      }`}
                    >
                      <ImageWithFallback 
                        src={option.image}
                        alt={option.name}
                        className="w-12 h-12 object-cover rounded-full"
                      />
                      <span className="text-sm text-gray-900">{option.name}</span>
                      {wreath.id === option.id && (
                        <svg className="w-4 h-4 text-green-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Информационная панель */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 shadow-lg">
          <div className="text-xs text-white/70 mb-1">Текущая конфигурация</div>
          <div className="flex gap-2">
            {coffin && <div className="w-2 h-2 rounded-full bg-stone-500 animate-pulse"></div>}
            {lining && <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>}
            {wreath && <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>}
            {plaque && <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>}
            {monument && <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse"></div>}
          </div>
        </div>

        {/* Легенда */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 shadow-lg max-w-xs">
          <div className="space-y-1.5 text-xs">
            {coffin && (
              <div className="flex items-center gap-2 text-white/80">
                <div className="w-4 h-3 bg-stone-500 rounded-sm shadow-inner"></div>
                <span>{isInteractive ? 'Материал гроба (кликабельно)' : 'Материал гроба'}</span>
              </div>
            )}
            {lining && (
              <div className="flex items-center gap-2 text-white/80">
                <div className="w-4 h-3 border-2 border-dashed border-purple-400 rounded-sm"></div>
                <span>{isInteractive ? 'Внутренняя отделка (кликабельно)' : 'Внутренняя отделка'}</span>
              </div>
            )}
            {wreath && (
              <div className="flex items-center gap-2 text-white/80">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span>{isInteractive ? 'Венок (кликабельно)' : 'Венок'}</span>
              </div>
            )}
            {plaque && (
              <div className="flex items-center gap-2 text-white/80">
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <span>{isInteractive ? 'Табличка (кликабельно)' : 'Табличка'}</span>
              </div>
            )}
            {monument && (
              <div className="flex items-center gap-2 text-white/80">
                <div className="w-2 h-4 bg-pink-400 rounded-t-full"></div>
                <span>{isInteractive ? 'Памятник (кликабельно)' : 'Памятник'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Декоративный свет */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-transparent pointer-events-none"></div>
    </div>
  );
}
