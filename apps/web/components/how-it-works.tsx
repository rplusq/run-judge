import { Calendar, Flag, Trophy } from 'lucide-react';

const steps = [
  {
    name: 'Pick a date & distance',
    description:
      'Choose when you want to run and how far. We recommend weekends for maximum participation!',
    icon: Calendar,
  },
  {
    name: 'Everyone runs together',
    description:
      'All participants run at the same time, making it a true competition.',
    icon: Flag,
  },
  {
    name: 'AI verifies the winner',
    description:
      'Our AI judge checks Strava activities to ensure fair play and declares the winner.',
    icon: Trophy,
  },
];

export function HowItWorks() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7">How it works</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Three simple steps to start running
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            No complicated setup, no crypto knowledge required. Just create a
            challenge and start running!
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {steps.map((step) => (
              <div key={step.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7">
                  <step.icon className="h-5 w-5 flex-none" aria-hidden="true" />
                  {step.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">{step.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
