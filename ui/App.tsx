import { useEffect, useState } from "react";

import HeroSection from "./HeroSection";
import StepperWorkflow from "./StepperWorkflow";
import PackagesSection from "./PackagesSection";
import PriceComparison from "./PriceComparison";
import RealisticCoffinViewer from "./RealisticCoffinViewer";
import TopButtons from './TopButtons';
import FloatingCalculator from "./FloatingCalculator";

import { calculateTotal, calculateBreakdown } from "./calculationUtils";

type CemeteryCategory = "standard" | "comfort" | "premium";

type HearseRoute = {
  morgue: boolean;
  hall: boolean;
  church: boolean;
  cemetery: boolean;
};

type FormData = {
  // Формат
  serviceType: "burial" | "cremation";
  hasHall: boolean;
  hallDuration: number;
  ceremonyType: "civil" | "religious" | "combined";
  confession: string;
  ceremonyOrder: string;

  // Логистика
  cemetery: string;
  selectedSlot: string;
  needsHearse: boolean;
  hearseRoute: HearseRoute;
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

const initialFormData: FormData = {
  serviceType: "burial",
  hasHall: true,
  hallDuration: 60,
  ceremonyType: "civil",
  confession: "",
  ceremonyOrder: "civil-first",

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

  packageType: "",
  selectedAdditionalServices: [],
  specialRequests: "",

  fullName: "",
  birthDate: "",
  deathDate: "",
  deathCertificate: "",
  relationship: "",
  dataConsent: false,
};

function App() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedCemeteryCategory, setSelectedCemeteryCategory] =
    useState<CemeteryCategory>("standard");

  // Скролл наверх при первой загрузке
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, []);

  const handleUpdateFormData = (field: keyof FormData, value: unknown) => {
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

  const total = calculateTotal(formData, selectedCemeteryCategory);
  const breakdown = calculateBreakdown(formData, selectedCemeteryCategory);

  return (
    <div className="min-h-screen bg-white pt-20 -translate-y-[2.5%]">
      {/* Верхние кнопки */}
      <div className="absolute top-0 left-0 right-0 z-30">
        <TopButtons />
      </div>

      {/* Хиро-блок */}
      <HeroSection />

      {/* Степпер поверх хиро */}
      <div className="relative z-20 stepper-overlay-position">
        <StepperWorkflow
          formData={formData}
          onUpdateFormData={handleUpdateFormData}
          onStepChange={handleStepChange}
          onCemeteryCategoryChange={handleCemeteryCategoryChange}
        />
      </div>

      {/* Пакеты – только на шаге 2 (атрибутика) */}
      {currentStep === 2 && (
        <PackagesSection
          formData={formData}
          onUpdateFormData={handleUpdateFormData}
        />
      )}

      {/* Плавающий калькулятор – с шага 1 */}
      {currentStep >= 1 && (
        <FloatingCalculator total={total} breakdown={breakdown} />
      )}
    </div>
  );
}

export default App;
