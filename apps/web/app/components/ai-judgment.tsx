export function AIJudgment() {
  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-8">Meet Our Sassy AI Judge</h2>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
        <div className="flex items-start mb-4">
          <div className="bg-orange-500 rounded-full p-2 mr-4">
            <span role="img" aria-label="Robot" className="text-2xl">
              🤖
            </span>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 flex-1">
            <p className="text-gray-300">
              Alright, runners! I&apos;ve analyzed your Strava data and local weather reports. Looks like we've got a winner!
              🏆
            </p>
          </div>
        </div>
        <div className="flex items-start mb-4">
          <div className="bg-blue-500 rounded-full p-2 mr-4">
            <span role="img" aria-label="Runner" className="text-2xl">
              🏃‍♂️
            </span>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 flex-1">
            <p className="text-gray-300">Really? Who won?</p>
          </div>
        </div>
        <div className="flex items-start">
          <div className="bg-orange-500 rounded-full p-2 mr-4">
            <span role="img" aria-label="Robot" className="text-2xl">
              🤖
            </span>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 flex-1">
            <p className="text-gray-300">
              Drumroll, please... 🥁 It&apos;s @SpeedyGonzales! They crushed that 5K in 22:30, despite the surprise
              rainstorm. Talk about dedication! The rest of you... maybe try running instead of scrolling Strava next
              time? 😉
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

