import { ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress"

interface Step {
  number: number;
  label: string;
  title?: string;
  description: string;
  icon?: React.ReactNode;
}

type StepperProps = {
  steps: Step[];
  currentStep: number;
};

export default function StepperAlt({ steps, currentStep }: StepperProps) {
  const DesktopStepper = () => {
    return (
      <div className="hidden lg:flex items-center justify-center gap-0.5">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isActive = step.number === currentStep;
          const isLastStep = index === steps.length - 1;
          return (
            <div key={step.number} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-sm transition-colors duration-200 grow`}>
                <div
                  className={`min-w-8 min-h-8 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? "bg-green-600"
                      : isActive
                      ? "bg-secondary-500"
                      : "bg-gray-300"
                  }`}>
                  <span
                    className={`${isActive ? "text-white" : "text-gray-400"}`}>
                    <span>
                      {isCompleted ? (
                        <svg
                          className="text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          height="24px"
                          viewBox="0 -960 960 960"
                          width="24px"
                          fill="currentColor">
                          <path d="m382-354 339-339q12-12 28-12t28 12q12 12 12 28.5T777-636L410-268q-12 12-28 12t-28-12L182-440q-12-12-11.5-28.5T183-497q12-12 28.5-12t28.5 12l142 143Z" />
                        </svg>
                      ) : (
                        step.number
                      )}
                    </span>
                  </span>
                </div>
                <p className={`text-sm ${isActive ? "" : ""} font-semibold`}>
                  {step.title}
                </p>
              </div>
              {!isLastStep && (
                <ChevronRight
                  size={20}
                  className={`${
                    isActive ? "text-secondary-950" : "text-gray-400"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const MobileStepper = () => {
    const progressPercent = (currentStep / steps.length) * 100;
    return (
      <div className="flex flex-col gap-2 lg:hidden py-2">
        <div className="flex items-center justify-between gap-2">
          <p className="font-bold text-sm">
            Paso {currentStep} de {steps.length}
          </p>
          <p className="text-sm">{steps[currentStep - 1]?.title}</p>
        </div>
        <Progress value={progressPercent}/>
      </div>
    );
  };

  return (
    <div className="outline outline-1 outline-gray-300 rounded-lg py-2 px-4 bg-white shadow-sm">
      <DesktopStepper />
      <MobileStepper />
    </div>
  );
}
