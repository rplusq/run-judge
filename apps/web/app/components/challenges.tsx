import { Button } from "@/components/ui/button"

const challenges = [
  { name: "Weekend Warrior 5K", date: "This Saturday, 9:00 AM", prize: "$500 USDC" },
  { name: "Midweek Madness 10K", date: "Next Wednesday, 6:00 PM", prize: "$1000 USDC" },
  { name: "Full Moon Half Marathon", date: "July 15, 8:00 PM", prize: "$2000 USDC" },
]

export function Challenges() {
  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-8">Upcoming Challenges</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {challenges.map((challenge, index) => (
          <div key={index} className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-2">{challenge.name}</h3>
            <p className="text-gray-300 mb-2">{challenge.date}</p>
            <p className="text-orange-500 font-bold mb-4">Prize Pool: {challenge.prize}</p>
            <Button className="w-full bg-orange-500 hover:bg-orange-600">Join Challenge</Button>
          </div>
        ))}
      </div>
    </section>
  )
}

