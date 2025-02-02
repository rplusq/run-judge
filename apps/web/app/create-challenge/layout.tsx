import { Header } from "../components/header";
import { ProgressSteps } from "./components/progress-steps";
import { ChallengeSetup } from "./components/challenge-setup";
import { Sidebar } from "./components/sidebar";
import type React from "react"; // Added import for React

export default function CreateChallengeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Create Your RunJudge Challenge
        </h1>
        <ProgressSteps />
        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          <div className="flex-grow">
            <ChallengeSetup>{children}</ChallengeSetup>
          </div>
          <Sidebar />
        </div>
      </main>
    </div>
  );
}
