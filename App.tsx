import React, { useEffect, useState } from "react";

import HeroSection from "./HeroSection";
import StepperWorkflow from "./StepperWorkflow";
import PackagesSection from "./PackagesSection";
import TopButtons from "./TopButtons";
import FloatingCalculator from "./FloatingCalculator";
import { calculateTotal, calculateBreakdown } from "./calculationUtils";

type CemeteryCategory = "standard" | "comfort" | "premium";

const initialFormData: any = {
  // Формат
  serviceType: "burial", // burial или cremation
  hasHall: true,
  hallDuration: 60,
  ceremonyType: "civil", // civil, religious, combined
  confession: "",
  ceremonyOrder: "civil-first",

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
  packageType: "" as "basic" | "standard" | "premium" | "custom" | "",
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

export default function App() {
  const [formData, setFormData] = useState<any>(initialFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCemeteryCategory, setSelectedCemeteryCategory] =
    useState<CemeteryCategory>("standard");

  // Глобальный обработчик ошибок для воркеров / hls и т.п.
  useEffect(() => {
    const originalPostMessage = Worker.prototype.postMessage;

    Worker.prototype.postMessage = function (...args: any[]) {
      try {
        return originalPostMessage.apply(this, args as any);
      } catch (error: any) {
        if (
          error instanceof Error &&
          (error.name === "DataCloneError" ||
            error.message.includes("out of memory") ||
            error.message.includes("cannot be cloned"))
        ) {
          console.warn("Suppressed Worker DataCloneError:", error.message);
          return;
        }
        throw error;
      }
    };

    const handleError = (event: ErrorEvent) => {
      if (
        event.message &&
        (event.message.includes("DataCloneError") ||
          event.message.includes("postMessage") ||
          event.message.includes("hls.js") ||
          event.message.includes("out of memory") ||
          event.message.includes("esm.sh/hls") ||
          event.message.includes("cannot be cloned") ||
          event.message.includes("DedicatedWorkerGlobalScope"))
      ) {
        console.warn("Intercepted and suppressed worker error:", event.message);
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }

      if (
        event.error instanceof Error &&
        (event.error.name === "DataCloneError" ||
          event.error.message.includes("out of memory") ||
          event.error.message.includes("cannot be cloned"))
      ) {
        console.warn("Intercepted worker error object:", event.error.message);
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message = (event.reason && event.reason.message) || String(event.reason || "");
      if (
        message &&
        (message.includes("DataCloneError") ||
          message.includes("postMessage") ||
          message.includes("hls.js") ||
          message.includes("out of memory") ||
          message.includes("esm.sh/hls") ||
          message.includes("cannot be cloned") ||
          message.includes("DedicatedWorkerGlobalScope"))
      ) {
        console.warn(
          "Intercepted and suppressed worker promise rejection:",
          message
        );
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
    };

    window.addEventListener("error", handleError, true);
    window.addEventListener("unhandledrejection", handleUnhandledRejection, true);

    return () => {
      window.removeEventListener("error", handleError, true);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection, true);
      Worker.prototype.postMessage = originalPostMessage;
    };
  }, []);

  // Скролл к началу при первой загрузке
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Загрузка из localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("funeral-workflow-draft");
      if (!saved) return;

      if (saved.length > 1000000) {
        console.warn("Saved draft too large, removing...");
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
            ...(parsed.formData?.hearseRoute || {}),
          },
          selectedAdditionalServices:
            parsed.formData?.selectedAdditionalServices || [],
          birthDate: parsed.formData?.birthDate === "—" ? "" : parsed.formData?.birthDate,
          deathDate: parsed.formData?.deathDate === "—" ? "" : parsed.formData?.deathDate,
        };
        setFormData(loadedFormData);
      } catch (e) {
        console.error("Failed to parse draft:", e);
        localStorage.removeItem("funeral-workflow-draft");
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

  // Сохранение в localStorage
  useEffect(() => {
    try {
      const draft = {
        formData,
        savedAt: new Date().toISOString(),
      };
      const draftString = JSON.stringify(draft);

      if (draftString.length > 500000) {
        console.warn("Draft too large, skipping save");
        return;
      }

      localStorage.setItem("funeral-workflow-draft", draftString);
    } catch (e) {
      console.error("Failed to save draft:", e);
      try {
        localStorage.removeItem("funeral-workflow-draft");
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
          try {
            const item = localStorage.getItem(key);
            if (item && item.length > 100000) {
              localStorage.removeItem(key);
            }
          } catch {
            // ignore
          }
        });
      } catch (clearError) {
        console.error("Failed to clear storage:", clearError);
      }
    }
  }, [formData]);

  const handleUpdateFormData = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  const handleCemeteryCategoryChange = (category: CemeteryCategory) => {
    setSelectedCemeteryCategory(category);
  };

  return (
    <div className="min-h-screen bg-white pt-20 -translate-y-[2.5%]">
      {/* Верхние кнопки */}
      <div className="absolute top-0 left-0 right-0 z-30">
        <TopButtons />
      </div>

      {/* Hero */}
      <HeroSection />

      {/* Степпер */}
      <div className="relative z-20 stepper-overlay-position">
        <StepperWorkflow
          formData={formData}
          onUpdateFormData={handleUpdateFormData}
          onStepChange={handleStepChange}
          onCemeteryCategoryChange={handleCemeteryCategoryChange}
        />
      </div>

      {/* Тарифы — только на шаге 2 */}
      {currentStep === 2 && (
        <PackagesSection
          formData={formData}
          onUpdateFormData={handleUpdateFormData}
        />
      )}

      {/* Плавающий калькулятор — начиная с шага 1 */}
      {currentStep >= 1 && (
        <FloatingCalculator
          total={calculateTotal(formData, selectedCemeteryCategory)}
          breakdown={calculateBreakdown(formData, selectedCemeteryCategory)}
        />
      )}
    </div>
  );
}
