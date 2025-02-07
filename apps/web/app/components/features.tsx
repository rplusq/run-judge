import { Bot, Calendar, Trophy, Users } from "lucide-react";

const features = [
  {
    icon: <Calendar className="h-8 w-8 text-orange-500" />,
    title: "Schedule & Stake",
    description: "Choose Saturday time & stake USDC",
  },
  {
    icon: <Users className="h-8 w-8 text-orange-500" />,
    title: "Run Together",
    description: "Everyone runs at the same time",
  },
  {
    icon: <Bot className="h-8 w-8 text-orange-500" />,
    title: "AI Verifies",
    description: "Sassy AI checks Strava + weather",
  },
  {
    icon: <Trophy className="h-8 w-8 text-orange-500" />,
    title: "Winner Gets Pool",
    description: "Original stakes + generated yield",
  },
]

export function Features() {
  return (
    <section className="container mx-auto px-4 py-16 bg-gray-800 rounded-lg">
      <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="flex flex-col items-center text-center p-6 bg-gray-700 rounded-lg shadow-lg">
            {feature.icon}
            <h3 className="text-xl font-semibold mt-4 mb-2">{feature.title}</h3>
            <p className="text-gray-300">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

