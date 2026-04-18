"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Send, Brain, Target, TrendingUp, AlertCircle, Quote, Loader2, Activity } from "lucide-react"
import { Card, Button, Input } from "@/components/ui"
import { supabase } from "@/lib/supabase"
import { formatCurrency, cn } from "@/lib/utils"

export default function AdvisorPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [chat, setChat] = useState<any[]>([])

  useEffect(() => {
    fetchAdvisorContext()
  }, [])

  const fetchAdvisorContext = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get Profile and Expenses for Context
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const { data: expenses } = await supabase.from('expenses').select('amount').eq('user_id', user.id)
    
    const income = profile?.monthly_income || 0
    const totalSpent = expenses?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0
    const savings = income - totalSpent

    setProfile(profile)

    // Initial AI Assessment based on REAL data
    const initialMessage = {
      role: "ai",
      message: `Hello ${user.user_metadata?.full_name || "there"}! I've analyzed your real-time financials. You have ${formatCurrency(income)} in monthly income and have spent ${formatCurrency(totalSpent)} this month.`,
      stats: [
        { label: "Monthly Budget", value: formatCurrency(income) },
        { label: "Total Spent", value: formatCurrency(totalSpent) },
        { label: "Net Savings", value: formatCurrency(savings) }
      ]
    }
    
    setChat([initialMessage])
    setLoading(false)
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query) return

    const userMsg = query
    setChat(prev => [...prev, { role: "user", message: userMsg }])
    setQuery("")

    // Rule-based AI logic using profile data
    setTimeout(() => {
      let response = "Based on your current financial standing, I recommend reviewing your budget allocation."
      const income = profile?.monthly_income || 0
      const goals = profile?.financial_goals || []
      
      const queryLower = userMsg.toLowerCase()
      
      if (queryLower.includes("save") || queryLower.includes("budget")) {
        const recommendedSavings = income * 0.2
        response = `With a monthly income of ${formatCurrency(income)}, the 50/30/20 rule suggests you should be saving at least ${formatCurrency(recommendedSavings)} monthly. Focus on reducing non-essential expenses if you're falling short.`
      } else if (queryLower.includes("investment") || queryLower.includes("stock") || queryLower.includes("grow")) {
        response = `I see your financial goals include "${goals.join(", ")}". For these objectives, consistent index fund contributions and maintaining a 6-month emergency fund are key. Avoid high-risk trades if your goals are long-term.`
      } else if (queryLower.includes("loan") || queryLower.includes("debt") || queryLower.includes("interest")) {
        const maxEmi = income * 0.4
        response = `Debt management is crucial. Your safe EMI threshold is ${formatCurrency(maxEmi)} (40% of income). If your current total EMIs are above this, consider debt consolidation or aggressive principal repayment.`
      } else if (queryLower.includes("goal") || queryLower.includes("future")) {
        response = `Your target goals are ${goals.length > 0 ? goals.join(" and ") : "not fully defined yet"}. To reach these, I suggest setting up automated SIPs (Systematic Investment Plans) that trigger right after you receive your ${formatCurrency(income)} income.`
      } else if (queryLower.includes("hi") || queryLower.includes("hello")) {
        response = `Hello! I'm your FinOS AI. I've analyzed your data and I'm ready to help you optimize your ${formatCurrency(income)} monthly income.`
      }

      setChat(prev => [...prev, { role: "ai", message: response }])
    }, 1000)
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Sparkles className="text-purple-400" /> AI Advisor
          </h1>
          <p className="text-white/50">Personalized data-driven intelligence.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center"><Activity className="animate-spin text-purple-500" size={48} /></div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {chat.map((item, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={cn("flex", item.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[80%] rounded-2xl p-6", item.role === "user" ? "bg-purple-600/20 border border-purple-500/30 text-white ml-10" : "glass-card mr-10")}>
                  <div className="flex items-start gap-4">
                    {item.role === "ai" && <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0"><Brain size={20} className="text-purple-400" /></div>}
                    <div className="space-y-4">
                      <p className="text-white/90 leading-relaxed text-lg">{item.message}</p>
                      {item.stats && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                          {item.stats.map((s: any) => (
                            <div key={s.label} className="bg-white/5 p-3 rounded-xl border border-white/5">
                              <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">{s.label}</p>
                              <p className="text-white font-bold">{s.value}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Input Area */}
      <Card className="mt-4 p-2">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask about your budget, loans, or savings..." className="border-none bg-transparent focus:ring-0 text-lg py-6" />
          <Button type="submit" size="lg" className="rounded-xl aspect-square p-0 w-16"><Send size={24} /></Button>
        </form>
      </Card>

      <div className="flex flex-wrap gap-2 justify-center pb-4">
        {["How much can I save?", "Analyze my investments", "Advice on loans"].map((p) => (
          <button key={p} onClick={() => setQuery(p)} className="text-xs px-4 py-2 rounded-full border border-white/10 text-white/40 hover:text-white/70 hover:bg-white/5 transition-all">{p}</button>
        ))}
      </div>
    </div>
  )
}
