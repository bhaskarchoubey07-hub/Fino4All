"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PieChart as PieChartIcon, TrendingUp, TrendingDown, Plus, Pencil, Trash2, ArrowUpRight, Loader2, DollarSign, Activity } from "lucide-react"
import { Card, Button, Input } from "@/components/ui"
import { formatCurrency, cn } from "@/lib/utils"
import { supabase, type Investment } from "@/lib/supabase"

export default function InvestmentPage() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [formData, setFormData] = useState({
    type: "Stocks",
    amount_invested: "",
    current_value: "",
    risk_level: "low" as "low" | "medium" | "high"
  })

  useEffect(() => {
    fetchInvestments()
  }, [])

  const fetchInvestments = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('investments').select('*').order('created_at', { ascending: false })
    if (data) setInvestments(data)
    setLoading(false)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('investments').insert([{
      user_id: user.id,
      type: formData.type,
      amount_invested: parseFloat(formData.amount_invested),
      current_value: parseFloat(formData.current_value),
      risk_level: formData.risk_level
    }])

    if (!error) {
      setShowAdd(false)
      setFormData({ type: "Stocks", amount_invested: "", current_value: "", risk_level: "low" })
      fetchInvestments()
    }
  }

  const deleteInvestment = async (id: string) => {
    const { error } = await supabase.from('investments').delete().eq('id', id)
    if (!error) fetchInvestments()
  }

  const totalInvested = investments.reduce((acc, inv) => acc + Number(inv.amount_invested), 0)
  const totalCurrent = investments.reduce((acc, inv) => acc + Number(inv.current_value), 0)
  const totalProfit = totalCurrent - totalInvested
  const profitPercent = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Investment Engine</h1>
          <p className="text-white/50">Track and optimize your real portfolio performance.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="flex items-center gap-2">
          <Plus size={20} /> Add Investment
        </Button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card className="relative mb-8">
              <button onClick={() => setShowAdd(false)} className="absolute top-4 right-4 text-white/30 hover:text-white">✕</button>
              <h3 className="text-xl font-bold text-white mb-6">Track New Investment</h3>
              <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-white/50">Asset Type</label>
                  <Input placeholder="e.g. Tesla Stocks" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-white/50">Invested Amount ($)</label>
                  <Input type="number" placeholder="5000" value={formData.amount_invested} onChange={e => setFormData({...formData, amount_invested: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-white/50">Current Value ($)</label>
                  <Input type="number" placeholder="5800" value={formData.current_value} onChange={e => setFormData({...formData, current_value: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-white/50">Risk Level</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" value={formData.risk_level} onChange={e => setFormData({...formData, risk_level: e.target.value as any})}>
                    <option value="low">Low Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="high">High Risk</option>
                  </select>
                </div>
                <div className="lg:col-span-4 flex justify-end gap-3 mt-4">
                  <Button type="submit">Complete Entry</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/5">
          <p className="text-white/50 text-sm mb-1">Total Market Value</p>
          <div className="flex items-end gap-3">
            <p className="text-3xl font-bold text-white">{formatCurrency(totalCurrent)}</p>
            <span className={cn("text-sm font-medium flex items-center mb-1", profitPercent >= 0 ? "text-emerald-400" : "text-rose-400")}>
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
          <p className="text-white/50 text-sm mb-1">Portfolio Risk</p>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-400/10 text-blue-400 text-sm font-bold uppercase tracking-widest">
              Live Monitoring
            </span>
          </div>
        </Card>
      </div>

      <Card className="p-0">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Your Real Portfolio</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5">
                <th className="px-6 py-4 text-sm font-semibold text-white/50">Asset</th>
                <th className="px-6 py-4 text-sm font-semibold text-white/50">Invested</th>
                <th className="px-6 py-4 text-sm font-semibold text-white/50">Current</th>
                <th className="px-6 py-4 text-sm font-semibold text-white/50">Profit/Loss</th>
                <th className="px-6 py-4 text-sm font-semibold text-white/50">Risk</th>
                <th className="px-6 py-4 text-sm font-semibold text-white/50">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && <tr><td colSpan={6} className="px-6 py-10 text-center"><Activity className="animate-spin mx-auto text-purple-500" /></td></tr>}
              {!loading && investments.length === 0 && <tr><td colSpan={6} className="px-6 py-10 text-center text-white/20">No investments tracked yet.</td></tr>}
              {investments.map((inv) => {
                const profit = Number(inv.current_value) - Number(inv.amount_invested)
                const isProfit = profit >= 0
                return (
                  <tr key={inv.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 font-medium text-white">{inv.type}</td>
                    <td className="px-6 py-4 text-white/70">{formatCurrency(Number(inv.amount_invested))}</td>
                    <td className="px-6 py-4 text-white font-bold">{formatCurrency(Number(inv.current_value))}</td>
                    <td className={cn("px-6 py-4 font-bold text-sm", isProfit ? "text-emerald-400" : "text-rose-400")}>
                      {isProfit ? "+" : ""}{formatCurrency(profit)}
                      <span className="ml-2 font-normal text-xs">({((profit / Number(inv.amount_invested)) * 100).toFixed(1)}%)</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                        inv.risk_level === "low" ? "bg-emerald-400/10 text-emerald-400" :
                        inv.risk_level === "medium" ? "bg-amber-400/10 text-amber-400" :
                        "bg-rose-400/10 text-rose-400"
                      )}>
                        {inv.risk_level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => deleteInvestment(inv.id)} className="text-white/30 hover:text-red-400 transition-colors">
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
    </div>
  )
}
