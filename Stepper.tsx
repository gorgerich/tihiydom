// ui/Stepper.tsx

type StepperProps = {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
};

export default function Stepper({
  currentStep,
  totalSteps,
  labels,
}: StepperProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {steps.map((step) => {
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;

          return (
            <div
              key={step}
              className={[
                "h-1 flex-1 rounded-full transition-colors",
                isCompleted
                  ? "bg-primary"
                  : isActive
                  ? "bg-primary/70"
                  : "bg-muted",
              ].join(" ")}
            />
          );
        })}
      </div>

      {labels && labels.length === totalSteps && (
        <div className="flex justify-between text-xs text-muted-foreground">
          {labels.map((label, index) => (
            <span
              key={index}
              className={
                index + 1 === currentStep ? "font-medium text-foreground" : ""
              }
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
