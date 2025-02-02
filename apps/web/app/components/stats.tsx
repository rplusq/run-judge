const stats = [
  { label: "Total Prizes Awarded", value: "$100,000+" },
  { label: "Active Runners", value: "5,000+" },
  { label: "Challenges Completed", value: "500+" },
  { label: "Average Yield", value: "8% APY" },
]

export function Stats() {
  return (
    <section className="container mx-auto px-4 py-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg">
      <h2 className="text-3xl font-bold text-center mb-8 text-white">RunJudge by the Numbers</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white bg-opacity-10 p-6 rounded-lg text-center">
            <p className="text-4xl font-bold text-white mb-2">{stat.value}</p>
            <p className="text-lg text-gray-200">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

