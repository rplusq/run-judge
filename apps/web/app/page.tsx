import { Header } from "./components/header";
import { Hero } from "./components/hero";
import { Features } from "./components/features";
import { AIJudgment } from "./components/ai-judgment";
import { Challenges } from "./components/challenges";
import { Stats } from "./components/stats";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <Header />
      <Hero />
      <Features />
      <AIJudgment />
      <Challenges />
      <Stats />
    </main>
  );
}
