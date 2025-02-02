"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DollarSign, Zap } from "lucide-react"

export default function FundChallenge() {
  const [usdcBalance, setUsdcBalance] = useState(100)
  const [gasEstimate, setGasEstimate] = useState(0.001)

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-2">Your USDC Balance</h3>
        <div className="flex items-center space-x-2">
          <DollarSign className="h-6 w-6 text-orange-500" />
          <span className="text-2xl font-bold">{usdcBalance.toFixed(2)} USDC</span>
        </div>
      </div>

      <div>
        <Label htmlFor="approveAmount">Approve USDC for challenge</Label>
        <Input id="approveAmount" type="number" defaultValue={10} />
        <p className="text-sm text-gray-400 mt-1">This amount will be locked in the challenge contract</p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">Estimated Gas Fee</h3>
        <div className="flex items-center space-x-2">
          <Zap className="h-6 w-6 text-orange-500" />
          <span>{gasEstimate} ETH</span>
        </div>
        <p className="text-sm text-gray-400 mt-1">Gas fees may vary. Always check before confirming.</p>
      </div>

      <Button className="w-full bg-orange-500 hover:bg-orange-600">Create and Fund Challenge</Button>

      <p className="text-center text-sm text-gray-400">
        By creating this challenge, you agree to RunJudge's terms and conditions.
      </p>
    </div>
  )
}

