// ui/Stepper.tsx
import React from "react";

interface StepperProps {
  currentStep?: number;
  totalSteps?: number;
  onStepChange?: (index: number) => void;
}

const Stepper: React.FC<StepperProps> = ({
  currentStep = 0,
  totalSteps = 1,
  onStepChange,
}) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i);

  return (
    <div className="flex gap-2">
      {steps.map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onStepChange?.(i)}
          className={i === currentStep ? "font-bold underline" : "opacity-60"}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
};

export default Stepper;
