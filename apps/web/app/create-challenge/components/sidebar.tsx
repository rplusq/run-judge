"use client";

import { useState, useEffect } from "react";
import { Bot } from "lucide-react";

export function Sidebar() {
  const [challengeSummary] = useState({
    date: "Next Saturday",
    time: "9:00 AM",
    distance: "5K",
    entryFee: "10 USDC",
    minParticipants: 5,
    estimatedYield: "0.5 USDC",
    totalPrizePool: "52.5 USDC",
  });

  const [aiTip, setAiTip] = useState("");

  useEffect(() => {
    // Simulating AI tips
    const tips = [
      "Pro tip: Early morning runs often have the best turnout! 🌅",
      "Consider your friends' schedules when picking a time. More runners, more fun! 🎉",
      "A 5K is perfect for beginners and pros alike. Great choice! 👍",
      "Higher stakes can attract serious runners. But remember, it's about fun too! 😊",
    ];
    setAiTip(tips[Math.floor(Math.random() * tips.length)] as string);
  }, []);

  return (
    <div className="w-full lg:w-80 bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Challenge Summary</h2>
      <ul className="space-y-2 mb-6">
        {Object.entries(challengeSummary).map(([key, value]) => (
          <li key={key} className="flex justify-between">
            <span className="text-gray-400">
              {key.charAt(0).toUpperCase() + key.slice(1)}:
            </span>
            <span>{value}</span>
          </li>
        ))}
      </ul>
      <div className="bg-gray-700 rounded-lg p-4 mb-6">
        <div className="flex items-center mb-2">
          <Bot className="h-5 w-5 text-orange-500 mr-2" />
          <h3 className="text-lg font-semibold">AI Assistant</h3>
        </div>
        <p className="text-sm text-gray-300">{aiTip}</p>
      </div>
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Estimated Prize Pool</h3>
        <p className="text-2xl font-bold">{challengeSummary.totalPrizePool}</p>
        <p className="text-sm text-gray-200">
          Including {challengeSummary.estimatedYield} yield
        </p>
      </div>
    </div>
  );
}
