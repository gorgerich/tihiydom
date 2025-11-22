import { useEffect, useState } from "react";

import HeroSection from "./HeroSection";
import StepperWorkflow from "./StepperWorkflow";
import PackagesSection from "./PackagesSection";
import TopButtons from "./TopButtons";
import FloatingCalculator from "./FloatingCalculator";
import { calculateTotal, calculateBreakdown } from "./calculationUtils";

type CemeteryCategory = "standard" | "comfort" | "premium";

type FuneralFormData = {
  // Формат
  serviceType: "burial" | "cremation";
  hasHall: boolean;
  hallDuration: number;
  ceremonyType: "civil" | "religious" | "combined";
  confession: string;
  ceremonyOrder: "civil-first";

  // Логистика
  cemetery: string;
  selectedSlot: string;
  needsHearse: boolean;
  hearseRoute: {
    morgue: boolean;
    hall: boolean;
    church: boolean;
    cemetery: boolean;
  };
  needsFamilyTransport: boolean;
  familyTransportSeats: number;
  distance: string;
  needsPallbearers: boolean;

  // Атрибутика
  packageType: "" | "basic" | "standard" | "premium" | "custom";
  selectedAdditionalServices: string[];
  specialRequests: string;

  // Документы
  fullName: string;
  birthDate: string;
  deathDate: string;
  deathCertificate: string;
  relationship: string;
  dataConsent: boolean;
};

const INITIAL_FORM_DATA: FuneralFormData = {
  // Формат
  serviceType: "burial",
  hasHall: true,
  hallDuration: 60,
  ceremonyType: "civil",
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
  packageType: "",
  selectedAdditionalServices: [],
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
  const [formData, setFormData] = useState<FuneralFormData>(INITIAL_FORM_DATA);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCemeteryCategory, setSelectedCemeteryCategory] =
    useState<CemeteryCategory>("standard");

  // Глобальный перехват ошибок из воркеров / hls.js
  useEffect(() => {
    if (typeof Worker === "undefined") return;

    const originalPostMessage = Worker.prototype.postMessage;

    Worker.prototype.postMessage = function (...args: unknown[]) {
      try {
        // @ts-expect-error — вызов оригинального метода
        return originalPostMessage.apply(this, args);
      } catch (error) {
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
      const msg = event.message || event.error?.message || "";

      if (
        msg &&
        (msg.includes("DataCloneError") ||
          msg.includes("postMessage") ||
          msg.includes("hls.js") ||
          msg.includes("esm.sh/hls") ||
          msg.includes("out of memory") ||
          msg.includes("cannot be cloned") ||
          msg.includes("DedicatedWorkerGlobalScope"))
      ) {
        console.warn("Intercepted and suppressed worker error:", msg);
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const msg =
        (event.reason && (event.reason.message || String(event.reason))) || "";

      if (
        msg &&
        (msg.includes("DataCloneError") ||
          msg.includes("postMessage") ||
          msg.includes("hls.js") ||
          msg.includes("esm.sh/hls") ||
          msg.includes("out of memory") ||
          msg.includes("cannot be cloned") ||
          msg.includes("DedicatedWorkerGlobalScope"))
      ) {
        console.warn(
          "Intercepted and suppressed worker promise rejection:",
          msg,
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
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
        true,
      );
      Worker.prototype.postMessage = originalPostMessage;
    };
  }, []);

  // Скролл к началу при первой загрузке
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Загрузка черновика из localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("funeral-workflow-draft");
      if (!saved) return;

      if (saved.length > 1_000_000) {
        console.warn("Saved draft too large, removing…");
        localStorage.removeItem("funeral-workflow-draft");
        return;
      }

      const parsed = JSON.parse(saved);

      const loadedFormData: FuneralFormData = {
        ...INITIAL_FORM_DATA,
        ...(parsed.formData || {}),
        hearseRoute: {
          ...INITIAL_FORM_DATA.hearseRoute,
          ...(parsed.formData?.hearseRoute || {}),
        },
        selectedAdditionalServices:
          parsed.formData?.selectedAdditionalServices || [],
        birthDate:
          parsed.formData?.birthDate === "—" ? "" : parsed.formData?.birthDate,
        deathDate:
          parsed.formData?.deathDate === "—" ? "" : parsed.formData?.deathDate,
      };

      setFormData(loadedFormData);
    } catch (e) {
      console.error("Failed to load draft:", e);
      try {
        localStorage.removeItem("funeral-workflow-draft");
      } catch {
        // игнорируем
      }
    }
  }, []);

  // Сохранение в localStorage при изменении формы
  useEffect(() => {
    try {
      const draft = {
        formData,
        savedAt: new Date().toISOString(),
      };

      const draftString = JSON.stringify(draft);

      if (draftString.length > 500_000) {
        console.warn("Draft too large, skipping save");
        return;
      }

      localStorage.setItem("funeral-workflow-draft", draftString);
    } catch (e) {
      console.error("Failed to save draft:", e);
      try {
        localStorage.removeItem("funeral-workflow-draft");
        const keys = Object.keys(localStorage);
        for (const key of keys) {
          const item = localStorage.getItem(key);
          if (item && item.length > 100_000) {
            localStorage.removeItem(key);
          }
        }
      } catch {
        // игнорируем
      }
    }
  }, [formData]);

  const handleUpdateFormData = (field: keyof FuneralFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  const handleCemeteryCategoryChange = (category: CemeteryCategory) => {
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

      {/* Stepper Workflow */}
      <div className="relative z-20 stepper-overlay-position">
        <StepperWorkflow
          formData={formData}
          onUpdateFormData={handleUpdateFormData}
          onStepChange={handleStepChange}
          onCemeteryCategoryChange={handleCemeteryCategoryChange}
        />
      </div>

      {/* Packages Section — только на шаге 2 (Атрибутика) */}
      {currentStep === 2 && (
        <PackagesSection
          formData={formData}
          onUpdateFormData={handleUpdateFormData}
        />
      )}

      {/* Плавающий калькулятор — с шага 1 */}
      {currentStep >= 1 && (
        <FloatingCalculator
          total={calculateTotal(formData, selectedCemeteryCategory)}
          breakdown={calculateBreakdown(formData, selectedCemeteryCategory)}
        />
      )}
    </div>
  );
}
