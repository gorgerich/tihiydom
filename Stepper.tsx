import { Check } from './Icons';
import { cn } from './ui/utils';
import { motion } from 'framer-motion';

interface Step {
  id: string;
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  completedSteps?: number[];
}

export function Stepper({ steps, currentStep, onStepClick, completedSteps = [] }: StepperProps) {
  const radius = 280; // Радиус дуги
  const totalSteps = steps.length;
  
  // Вычисляем позицию шага на дуге относительно центральной позиции
  const getStepPosition = (relativeIndex: number) => {
    // Угол для каждого шага (распределяем по 120 градусам)
    const angleRange = 120;
    const anglePerStep = angleRange / (totalSteps - 1);
    
    // relativeIndex = 0 означает центральную позицию (текущий шаг)
    // Отрицательные значения - шаги слева, положительные - справа
    const centerAngle = 90; // 90 градусов - верхняя точка дуги
    const angle = (centerAngle - anglePerStep * relativeIndex) * (Math.PI / 180);
    
    // Вычисляем X и Y на основе угла
    const x = Math.cos(angle) * radius;
    const y = -Math.sin(angle) * radius * 0.6 + 171; // Опущено на 90% (с 20 до 171)
    
    return { x, y, angle };
  };

  return (
    <div className="w-full py-2 relative overflow-hidden" style={{ height: '140px', minHeight: '140px', maxHeight: '140px' }}>
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Контейнер для шагов */}
        <div className="absolute inset-0 flex items-center justify-center">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(index) || index < currentStep;
            const isCurrent = index === currentStep;
            const isClickable = !!onStepClick;
            
            // Вычисляем относительную позицию от текущего шага
            const relativeIndex = index - currentStep;
            const position = getStepPosition(relativeIndex);
            
            // Эффект масштаба и прозрачности для нецентральных элементов
            const distanceFromCurrent = Math.abs(relativeIndex);
            const scale = Math.max(0.7, 1 - distanceFromCurrent * 0.15);
            const opacity = Math.max(0.3, 1 - distanceFromCurrent * 0.25);
            
            // Скрываем шаги, которые слишком далеко
            if (Math.abs(relativeIndex) > 2) {
              return null;
            }

            return (
              <motion.div
                key={step.id}
                className="absolute"
                initial={false}
                animate={{
                  x: position.x,
                  y: position.y,
                  scale: scale,
                  opacity: opacity,
                }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 20,
                  mass: 0.8,
                }}
                style={{
                  left: '50%',
                  top: '50%',
                }}
              >
                <div className="flex flex-col items-center -translate-x-1/2 -translate-y-1/2">
                  {/* Step Circle */}
                  <button
                    onClick={() => isClickable && onStepClick?.(index)}
                    disabled={!isClickable}
                    type="button"
                    className={cn(
                      "shrink-0 z-10 relative outline-none",
                      isClickable ? "cursor-pointer" : "cursor-default"
                    )}
                    style={{ perspective: '1000px' }}
                  >
                    <motion.div
                      animate={{
                        scale: isCurrent ? 1.15 : 1,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative bg-white",
                        isCompleted && "bg-gray-900 border-gray-900",
                        isCurrent && "border-gray-900 bg-white shadow-xl ring-4 ring-gray-900/10",
                        !isCompleted && !isCurrent && "border-gray-300 bg-white",
                        isClickable && !isCurrent && "hover:border-gray-700 hover:shadow-md hover:scale-110"
                      )}
                    >
                      {isCompleted && !isCurrent ? (
                        <Check className="w-6 h-6 text-white" />
                      ) : (
                        <span
                          className={cn(
                            "text-base transition-colors",
                            isCurrent && "text-gray-900",
                            isCompleted && !isCurrent && "text-white",
                            !isCompleted && !isCurrent && "text-gray-400"
                          )}
                        >
                          {index + 1}
                        </span>
                      )}
                    </motion.div>
                  </button>

                  {/* Label ПОД кругом */}
                  <motion.div 
                    className="flex flex-col items-center text-center mt-3"
                    animate={{
                      opacity: isCurrent ? 1 : 0.6,
                      y: isCurrent ? 0 : 3,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 150,
                      damping: 15,
                    }}
                  >
                    <span
                      className={cn(
                        "text-sm transition-all duration-300 whitespace-nowrap text-white"
                      )}
                    >
                      {step.label}
                    </span>
                    {step.description && isCurrent && (
                      <span className="text-xs text-gray-500 mt-0.5 whitespace-nowrap">
                        {step.description}
                      </span>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}