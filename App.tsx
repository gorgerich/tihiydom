import { useState, useEffect } from "react";
import './globals.css';
import "./components/suppress-r3f-warnings";
import { HeroSection } from "./components/HeroSection";
import { StepperWorkflow } from "./components/StepperWorkflow";
import { PackagesSection } from "./components/PackagesSection";
import { FloatingCalculator } from "./components/FloatingCalculator";
import { TopButtons } from "./components/TopButtons";
import {
  calculateTotal,
  calculateBreakdown,
} from "./components/calculationUtils";

export default function App() {
  // Глобальный обработчик ошибок для предотвращения краша из-за hls.js и других внешних библиотек
  useEffect(() => {
    // Перехватываем ошибки из веб-воркеров на самом раннем этапе
    const originalPostMessage = Worker.prototype.postMessage;
    Worker.prototype.postMessage = function(...args) {
      try {
        return originalPostMessage.apply(this, args);
      } catch (error) {
        // Подавляем ошибки клонирования данных в воркерах
        if (error instanceof Error && (
          error.name === 'DataCloneError' || 
          error.message.includes('out of memory') ||
          error.message.includes('cannot be cloned')
        )) {
          console.warn('Suppressed Worker DataCloneError:', error.message);
          return;
        }
        throw error;
      }
    };

    const handleError = (event: ErrorEvent) => {
      // Перехватываем ошибки из hls.js и других веб-воркеров
      if (event.message && (
        event.message.includes('DataCloneError') ||
        event.message.includes('postMessage') ||
        event.message.includes('hls.js') ||
        event.message.includes('out of memory') ||
        event.message.includes('esm.sh/hls') ||
        event.message.includes('cannot be cloned') ||
        event.message.includes('DedicatedWorkerGlobalScope')
      )) {
        console.warn('Intercepted and suppressed worker error:', event.message);
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
      
      // Также перехватываем ошибки из самих воркеров
      if (event.error instanceof Error && (
        event.error.name === 'DataCloneError' ||
        event.error.message.includes('out of memory') ||
        event.error.message.includes('cannot be cloned')
      )) {
        console.warn('Intercepted worker error object:', event.error.message);
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Перехватываем необработанные отклонения промисов из веб-воркеров
      const message = event.reason?.message || String(event.reason);
      if (message && (
        message.includes('DataCloneError') ||
        message.includes('postMessage') ||
        message.includes('hls.js') ||
        message.includes('out of memory') ||
        message.includes('esm.sh/hls') ||
        message.includes('cannot be cloned') ||
        message.includes('DedicatedWorkerGlobalScope')
      )) {
        console.warn('Intercepted and suppressed worker promise rejection:', message);
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
    };

    // Добавляем обработчики с capture фазой для перехвата раньше
    window.addEventListener('error', handleError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true);

    return () => {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true);
      // Восстанавливаем оригинальный postMessage
      Worker.prototype.postMessage = originalPostMessage;
    };
  }, []);

  // Принудительный скролл к началу при первой загрузке
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Глобальное состояние формы для синхронизации между компонентами
  const initialFormData = {
    // Формат
    serviceType: "burial", // burial или cremation
    hasHall: true,
    hallDuration: 60,
    ceremonyType: "civil", // civil, religious, combined
    confession: "",
    ceremonyOrder: "civil-first", // для комбинированной

    // Логистика
    cemetery: "",
    selectedSlot: "",
    needsHearse: true,
    hearseRoute: {
      morgue: true,
      hall: true,
      church: true,
      cemetery: true,
    },
    needsFamilyTransport: false,
    familyTransportSeats: 5,
    distance: "",
    needsPallbearers: true,

    // Атрибутика
    packageType: "" as
      | "basic"
      | "standard"
      | "premium"
      | "custom"
      | "",
    selectedAdditionalServices: [] as string[],
    specialRequests: "",

    // Документы
    fullName: "",
    birthDate: "",
    deathDate: "",
    deathCertificate: "",
    relationship: "",
    dataConsent: false,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const [
    selectedCemeteryCategory,
    setSelectedCemeteryCategory,
  ] = useState<"standard" | "comfort" | "premium">("standard");

  // Загрузка из localStorage при монтировании
  useEffect(() => {
    try {
      const saved = localStorage.getItem("funeral-workflow-draft");
      if (saved) {
        // Проверяем размер перед парсингом
        if (saved.length > 1000000) {
          console.warn('Saved draft too large, removing...');
          localStorage.removeItem("funeral-workflow-draft");
          return;
        }

        try {
          const parsed = JSON.parse(saved);
          const loadedFormData = {
            ...initialFormData,
            ...parsed.formData,
            hearseRoute: {
              ...initialFormData.hearseRoute,
              ...(parsed.formData.hearseRoute || {}),
            },
            selectedAdditionalServices:
              parsed.formData.selectedAdditionalServices || [],
            // Очищаем прочерки из дат при загрузке - они должны появляться только при нажатии "Не знаю"
            birthDate: parsed.formData.birthDate === '—' ? '' : parsed.formData.birthDate,
            deathDate: parsed.formData.deathDate === '—' ? '' : parsed.formData.deathDate,
          };
          setFormData(loadedFormData);
          // Не загружаем currentStep - всегда начинаем с первого шага (0)
        } catch (e) {
          console.error("Failed to parse draft:", e);
          localStorage.removeItem("funeral-workflow-draft");
        }
      }
    } catch (e) {
      console.error("Failed to load draft:", e);
      try {
        localStorage.removeItem("funeral-workflow-draft");
      } catch (clearError) {
        console.error("Failed to clear storage:", clearError);
      }
    }
  }, []);

  // Сохранение в localStorage при изменении
  useEffect(() => {
    try {
      const draft = {
        formData,
        savedAt: new Date().toISOString(),
      };
      const draftString = JSON.stringify(draft);
      
      // Строгое ограничение размера (500KB вместо 1MB)
      if (draftString.length > 500000) {
        console.warn('Draft too large, skipping save');
        return;
      }
      
      localStorage.setItem(
        "funeral-workflow-draft",
        draftString,
      );
    } catch (e) {
      console.error("Failed to save draft:", e);
      // Если ошибка переполнения, очищаем старые данные
      try {
        localStorage.removeItem("funeral-workflow-draft");
        // Также очищаем другие большие элементы
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          try {
            const item = localStorage.getItem(key);
            if (item && item.length > 100000) { // > 100KB
              localStorage.removeItem(key);
            }
          } catch (clearError) {
            // Игнорируем ошибки очистки
          }
        });
      } catch (clearError) {
        console.error("Failed to clear storage:", clearError);
      }
    }
  }, [formData]);

  // Функция обновления формы
  const handleUpdateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Обработчик изменения шага
  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  // Обработчик изменения категории кладбища
  const handleCemeteryCategoryChange = (
    category: "standard" | "comfort" | "premium",
  ) => {
    setSelectedCemeteryCategory(category);
  };

  return (
    <div className="min-h-screen bg-white pt-20 -translate-y-[2.5%]">
      {/* Top Buttons */}
      <div className="absolute top-0 left-0 right-0 z-30">
        <TopButtons />
      </div>

      {/* Hero Section */}
      <HeroSection />

      {/* Stepper Workflow - поверх Hero на 15% с liquid glass эффектом */}
      <div
        className="relative z-20 stepper-overlay-position"
      >
        <StepperWorkflow
          formData={formData}
          onUpdateFormData={handleUpdateFormData}
          onStepChange={handleStepChange}
          onCemeteryCategoryChange={
            handleCemeteryCategoryChange
          }
        />
      </div>

      {/* Packages Section - тарифы и конструктор - показывается только на шаге 2 (Атрибутика) */}
      {currentStep === 2 && (
        <PackagesSection
          formData={formData}
          onUpdateFormData={handleUpdateFormData}
        />
      )}

      {/* Плавающий калькулятор - показывается начиная с шага 1 */}
      {currentStep >= 1 && (
        <FloatingCalculator
          total={calculateTotal(
            formData,
            selectedCemeteryCategory,
          )}
          breakdown={calculateBreakdown(
            formData,
            selectedCemeteryCategory,
          )}
        />
      )}

      {/* Footer */}
    </div>
  );
}
