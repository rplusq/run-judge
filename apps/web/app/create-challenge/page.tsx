"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Calendar, Clock, Route, DollarSign, Users } from "lucide-react"

export default function BasicSetup() {
  const [distance, setDistance] = useState("5K")
  const [entryFee, setEntryFee] = useState(10)
  const [minParticipants, setMinParticipants] = useState(5)

  return (
    <div className="space-y-8">
      <div>
        <Label htmlFor="date" className="flex items-center mb-2">
          <Calendar className="mr-2 h-4 w-4" />
          Choose your battle date ⚔️
        </Label>
        <Input type="date" id="date" defaultValue={getNextSaturday()} />
      </div>

      <div>
        <Label htmlFor="time" className="flex items-center mb-2">
          <Clock className="mr-2 h-4 w-4" />
          Pick your start time 🕒
        </Label>
        <Input type="time" id="time" defaultValue="09:00" />
      </div>

      <div>
        <Label className="flex items-center mb-2">
          <Route className="mr-2 h-4 w-4" />
          Select your distance 🏃‍♂️
        </Label>
        <RadioGroup defaultValue="5K" onValueChange={setDistance}>
          <div className="flex space-x-2">
            <RadioGroupItem value="5K" id="5K" />
            <Label htmlFor="5K">5K</Label>
          </div>
          <div className="flex space-x-2">
            <RadioGroupItem value="10K" id="10K" />
            <Label htmlFor="10K">10K</Label>
          </div>
          <div className="flex space-x-2">
            <RadioGroupItem value="custom" id="custom" />
            <Label htmlFor="custom">Custom</Label>
          </div>
        </RadioGroup>
        {distance === "custom" && <Input type="number" placeholder="Enter distance in km" className="mt-2" />}
      </div>

      <div>
        <Label htmlFor="entryFee" className="flex items-center mb-2">
          <DollarSign className="mr-2 h-4 w-4" />
          Stake your claim 💰 (USDC)
        </Label>
        <Input type="number" id="entryFee" value={entryFee} onChange={(e) => setEntryFee(Number(e.target.value))} />
        <p className="text-sm text-gray-400 mt-1">Estimated yield: {(entryFee * 0.05).toFixed(2)} USDC</p>
      </div>

      <div>
        <Label className="flex items-center mb-2">
          <Users className="mr-2 h-4 w-4" />
          Set minimum participants 👥
        </Label>
        <Slider defaultValue={[5]} max={20} step={1} onValueChange={(value) => setMinParticipants(value[0])} />
        <p className="text-sm text-gray-400 mt-1">Minimum participants: {minParticipants}</p>
      </div>
    </div>
  )
}

function getNextSaturday() {
  const now = new Date()
  const nextSaturday = new Date(now.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7)))
  return nextSaturday.toISOString().split("T")[0]
}

