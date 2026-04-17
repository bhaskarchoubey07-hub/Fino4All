"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { PieChart as PieChartIcon, TrendingUp, TrendingDown, Plus, Pencil, Trash2, ArrowUpRight } from "lucide-react"
import { Card, Button, Input } from "@/components/ui"
import { formatCurrency, cn } from "@/lib/utils"

const initialInvestments = [
  { id: "1", type: "Stocks (Tech)", amount: 5000, current: 5840, risk: "High", color: "bg-purple-500" },
  { id: "2", type: "Mutual Funds", amount: 3000, current: 3120, risk: "Medium", color: "bg-blue-400" },
  { id: "3", type: "Gold", amount: 1500, current: 1650, risk: "Low", color: "bg-amber-400" },
]

export default function InvestmentPage() {
  const [investments, setInvestments] = useState(initialInvestments)
  const [showAdd, setShowAdd] = useState(false)

  const totalInvested = investments.reduce((acc, inv) => acc + inv.amount, 0)
  const totalCurrent = investments.reduce((acc, inv) => acc + inv.current, 0)
  const totalProfit = totalCurrent - totalInvested
  const profitPercent = (totalProfit / totalInvested) * 100

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Investment Engine</h1>
          <p className="text-white/50">Track and optimize your portfolio performance.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="flex items-center gap-2">
          <Plus size={20} /> Add Investment
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/5">
          <p className="text-white/50 text-sm mb-1">Total Market Value</p>
          <div className="flex items-end gap-3">
            <p className="text-3xl font-bold text-white">{formatCurrency(totalCurrent)}</p>
            <span className="text-emerald-400 text-sm font-medium flex items-center mb-1">
              <ArrowUpRight size={16} /> {profitPercent.toFixed(2)}%
            </span>
          </div>
        </Card>
        <Card className="bg-white/5">
          <p className="text-white/50 text-sm mb-1">Total Profit/Loss</p>
          <p className={cn("text-3xl font-bold", totalProfit >= 0 ? "text-emerald-400" : "text-rose-400")}>
            {totalProfit >= 0 ? "+" : ""}{formatCurrency(totalProfit)}
          </p>
        </Card>
        <Card className="bg-white/5">
          <p className="text-white/50 text-sm mb-1">Risk Profile</p>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 text-sm font-bold">
              Moderate Risk
            </span>
          </div>
        </Card>
      </div>

      {/* Portfolio Table */}
      <Card className="p-0">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Your Portfolio</h3>
          <div className="flex gap-2">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/50 hover:text-white cursor-pointer transition-all">
              <Pencil size={18} />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5">
                <th className="px-6 py-4 text-sm font-semibold text-white/50">Asset Type</th>
                <th className="px-6 py-4 text-sm font-semibold text-white/50">Amount Invested</th>
                <th className="px-6 py-4 text-sm font-semibold text-white/50">Current Value</th>
                <th className="px-6 py-4 text-sm font-semibold text-white/50">Profit/Loss</th>
                <th className="px-6 py-4 text-sm font-semibold text-white/50">Risk Level</th>
                <th className="px-6 py-4 text-sm font-semibold text-white/50">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {investments.map((inv) => {
                const profit = inv.current - inv.amount
                const isProfit = profit >= 0
                return (
                  <tr key={inv.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-3 h-3 rounded-full", inv.color)} />
                        <span className="text-white font-medium">{inv.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/70">{formatCurrency(inv.amount)}</td>
                    <td className="px-6 py-4 text-white font-bold">{formatCurrency(inv.current)}</td>
                    <td className={cn("px-6 py-4 font-bold text-sm", isProfit ? "text-emerald-400" : "text-rose-400")}>
                      {isProfit ? "+" : ""}{formatCurrency(profit)}
                      <span className="ml-2 font-normal text-xs">
                        ({((profit / inv.amount) * 100).toFixed(1)}%)
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold",
                        inv.risk === "Low" ? "bg-emerald-400/10 text-emerald-400" :
                        inv.risk === "Medium" ? "bg-amber-400/10 text-amber-400" :
                        "bg-rose-400/10 text-rose-400"
                      )}>
                        {inv.risk}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-white/30 hover:text-red-400 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* AI Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="text-emerald-400" size={24} />
            </div>
            <div>
              <h4 className="text-white font-bold">Investment Tip</h4>
              <p className="text-emerald-300/50 text-sm">Diversification Opportunity</p>
            </div>
          </div>
          <p className="text-white/70 text-sm leading-relaxed">
            "Your portfolio is heavily skewed towards Tech Stocks (High Risk). 
            Consider moving 15% of your gains into Index Funds or Bonds to lower volatility."
          </p>
        </Card>

        <Card className="border-rose-500/20 bg-rose-500/5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center">
              <TrendingDown className="text-rose-400" size={24} />
            </div>
            <div>
              <h4 className="text-white font-bold">Risk Alert</h4>
              <p className="text-rose-300/50 text-sm">Market Volatility Warning</p>
            </div>
          </div>
          <p className="text-white/70 text-sm leading-relaxed">
            "We've detected significant volatility in the crypto sector. 
            Ensure your stop-loss orders are active for your speculative assets."
          </p>
        </Card>
      </div>
    </div>
  )
}
