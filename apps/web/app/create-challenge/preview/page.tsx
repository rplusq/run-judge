"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sun, Cloud, CloudRain } from "lucide-react";

export default function ChallengePreview() {
  const [weather, setWeather] = useState({ icon: Sun, description: "Sunny" });
  const [inviteCode] = useState("RJ-SAT-5K-001");

  useEffect(() => {
    // Simulating weather forecast
    const weathers = [
      { icon: Sun, description: "Sunny" },
      { icon: Cloud, description: "Partly cloudy" },
      { icon: CloudRain, description: "Light rain" },
    ];
    setWeather(
      weathers[Math.floor(Math.random() * weathers.length)] as typeof weather
    );
  }, []);

  return (
    <div className="space-y-8">
      <div className="bg-gray-700 rounded-lg p-6 shadow-md">
        <h2 className="text-2xl font-bold mb-4">
          Saturday Morning 5K Challenge
        </h2>
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-gray-300">Date: Next Saturday, 9:00 AM</p>
            <p className="text-gray-300">Distance: 5K</p>
            <p className="text-gray-300">Entry Fee: 10 USDC</p>
          </div>
          <Image
            src="/placeholder.svg?height=100&width=100"
            alt="Challenge illustration"
            width={100}
            height={100}
            className="rounded-lg"
          />
        </div>
        <Button className="w-full bg-orange-500 hover:bg-orange-600">
          Join Challenge
        </Button>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">Weather Forecast</h3>
        <div className="flex items-center space-x-2">
          <weather.icon className="h-8 w-8 text-orange-500" />
          <span>{weather.description}</span>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">Estimated Yield</h3>
        <p>
          Based on current rates, your challenge could generate approximately
          0.5 USDC in yield over the course of the week. This additional amount
          will be added to the prize pool for the winner.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">Invite Friends</h3>
        <Label htmlFor="inviteCode">
          Share this code with your running buddies:
        </Label>
        <div className="flex mt-2">
          <Input
            id="inviteCode"
            value={inviteCode}
            readOnly
            className="flex-grow"
          />
          <Button
            onClick={() => navigator.clipboard.writeText(inviteCode)}
            className="ml-2 bg-orange-500 hover:bg-orange-600"
          >
            Copy
          </Button>
        </div>
      </div>
    </div>
  );
}
