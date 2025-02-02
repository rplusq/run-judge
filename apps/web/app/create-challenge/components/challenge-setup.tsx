"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChallengeSetup({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "/create-challenge",
    "/create-challenge/preview",
    "/create-challenge/fund",
  ];

  const handleNext = () => {
    const nextStep = currentStep + 1;
    if (nextStep < steps.length) {
      setCurrentStep(nextStep);
      router.push(steps[nextStep] as string);
    }
  };

  const handleBack = () => {
    const prevStep = currentStep - 1;
    if (prevStep >= 0) {
      setCurrentStep(prevStep);
      router.push(steps[prevStep] as string);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      {children}
      <div
        className={cn(
          "flex mt-8",
          currentStep === 0 ? "justify-end" : "justify-between"
        )}
      >
        {currentStep > 0 && (
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
          className="bg-orange-500 hover:bg-orange-600"
        >
          {currentStep === steps.length - 1 ? "Create Challenge" : "Next"}{" "}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
