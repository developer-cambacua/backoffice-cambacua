import { cn } from "@/lib/utils";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

interface Step {
  number: number;
  label: string;
  title?: string;
  description: string;
  icon?: React.ReactNode;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
  activeColor?: string;
  completedColor?: string;
  inactiveColor?: string;
  textActiveColor?: string;
  textInactiveColor?: string;
}

export default function ImprovedStepper({
  steps,
  currentStep,
  className,
  activeColor = "bg-blue-500",
  completedColor = "bg-green-500",
  textActiveColor = "text-white",
  inactiveColor = "bg-gray-200",
  textInactiveColor = "text-grisulado-900",
}: StepperProps) {

  const DesktopStepper = () => (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;
          // const isLastStep = index === steps.length - 1;

          return (
            <div key={step.number} className="flex flex-1 items-center">
              <div className="flex flex-col items-start flex-1">
                <div className="flex items-center w-full">
                  <div
                    className={cn(
                      "min-w-8 min-h-8 w-8 h-8 rounded-full flex items-center justify-center outline-2 outline-transparent",
                      isCompleted
                        ? `bg-green-600 text-white`
                        : isActive
                        ? `${activeColor} ${textActiveColor}`
                        : `${inactiveColor} ${textInactiveColor}`
                    )}>
                    <span>{isCompleted ? <Check /> : step.number}</span>
                  </div>
                  <div className="text-sm ml-3">
                    <p className="font-semibold line-clamp-1">{step.title}</p>
                    <p className="text-muted-foreground line-clamp-1">
                      {step.description}
                    </p>
                  </div>
                </div>
                {/* {!isLastStep && (
                  <div
                    className={cn(
                      "h-1 w-full mt-2",
                      isCompleted
                        ? completedColor
                        : isActive
                        ? activeColor
                        : "bg-gray-200"
                    )}
                  />
                )} */}
                <div
                  className={cn(
                    "h-1 w-full mt-2",
                    isCompleted
                      ? completedColor
                      : isActive
                      ? activeColor
                      : "bg-gray-200"
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const MobileStepper = () => {
    const currentStepData = steps.find((step) => step.number === currentStep);
    const prevStep = steps.find((step) => step.number === currentStep - 1);
    const nextStep = steps.find((step) => step.number === currentStep + 1);

    return (
      <div className="w-full">
        {/* Current step highlight */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            {/* Previous step indicator */}
            {/* <div className="flex items-center space-x-2 opacity-60">
              {prevStep && (
                <>
                  <ChevronLeft className="w-4 h-4 text-gray-400" />
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                </>
              )}
            </div> */}

            {/* Current step */}
            <div className="flex flex-col items-center space-y-2 flex-1">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center shadow-lg",
                  `${activeColor} ${textActiveColor}`
                )}>
                {currentStepData?.icon || (
                  <span className="font-bold text-lg">{currentStep}</span>
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-900">
                  {currentStepData?.title || currentStepData?.label}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {currentStepData?.description}
                </p>
              </div>
            </div>

            {/* Next step indicator */}
            {/* <div className="flex items-center space-x-2 opacity-60">
              {nextStep && (
                <>
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs text-gray-500">
                      {nextStep.number}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </>
              )}
            </div> */}
          </div>

          {/* Progress dots */}
          <div className="flex justify-center space-x-2 mt-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  step.number === currentStep
                    ? "bg-blue-500 w-6"
                    : step.number < currentStep
                    ? "bg-green-500 w-2"
                    : "bg-gray-300 w-2"
                )}
              />
            ))}
          </div>
        </div>

        {/* Simplified progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div
            className={cn(
              "h-1 rounded-full transition-all duration-500",
              activeColor
            )}
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Desktop/Tablet version */}
      <div className="hidden lg:block">
        <DesktopStepper />
      </div>

      {/* Mobile version */}
      <div className="lg:hidden">
        <MobileStepper />
      </div>
    </div>
  );
}
