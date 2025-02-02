"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const steps = [
  { name: "Setup", path: "/create-challenge" },
  { name: "Preview", path: "/create-challenge/preview" },
  { name: "Fund", path: "/create-challenge/fund" },
];

export function ProgressSteps() {
  const pathname = usePathname();

  return (
    <nav aria-label="Progress" className="w-full max-w-3xl mx-auto">
      <ol role="list" className="flex items-center justify-between">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className="relative flex items-center">
            <span
              className={cn(
                "relative z-10 flex h-4 w-4 items-center justify-center rounded-full",
                pathname === step.path
                  ? "bg-orange-500"
                  : stepIdx < steps.findIndex((s) => s.path === pathname)
                    ? "bg-orange-500/20 border border-orange-500"
                    : "bg-gray-700 border border-gray-500"
              )}
            >
              {pathname === step.path && (
                <span className="h-2 w-2 rounded-full bg-white" />
              )}
            </span>
            <span
              className={cn(
                "ml-3 text-xs font-medium",
                pathname === step.path
                  ? "text-orange-500"
                  : stepIdx < steps.findIndex((s) => s.path === pathname)
                    ? "text-orange-500/50"
                    : "text-gray-500"
              )}
            >
              {step.name}
            </span>

            {stepIdx !== steps.length - 1 && (
              <div
                className={cn(
                  "absolute left-[calc(100%+0.5rem)] w-[calc(240px-2rem)] h-px",
                  stepIdx < steps.findIndex((s) => s.path === pathname)
                    ? "bg-orange-500/20"
                    : "bg-gray-700"
                )}
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
