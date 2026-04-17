"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Send, Brain, Target, TrendingUp, AlertCircle, Quote, Loader2 } from "lucide-react"
import { Card, Button, Input } from "@/components/ui"
import { supabase } from "@/lib/supabase"
import { formatCurrency, cn } from "@/lib/utils"

export default function AdvisorPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [chat, setChat] = useState<any[]>([
    { 
      role: "ai", 
      message: "Hello! I am your FinOS AI Advisor. I've analyzed your current financial profile. Based on your $5,000 monthly income, here is my initial assessment.",
      stats: [
        { label: "Safe Spending", value: "$1,500/mo" },
        { label: "Investment Goal", value: "$1,000/mo" },
        { label: "Emergency Fund", value: "3 Months Saved" }
      ]
    }
  ])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').select('*').eq('id', user.id).single()
          .then(({ data }) => {
            setProfile(data)
            setLoading(false)
          })
      }
    })
  }, [])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query) return

    setChat(prev => [...prev, { role: "user", message: query }])
    const currentQuery = query
    setQuery("")

    // Simulate AI response
    setTimeout(() => {
      let response = "Based on your financial goals, I recommend diversifying your savings into a high-yield savings account and an index fund."
      if (currentQuery.toLowerCase().includes("loan")) {
        response = "When considering a loan, ensure your total EMI doesn't exceed 40% of your take-home pay. For your current income, that's roughly $2,000."
      } else if (currentQuery.toLowerCase().includes("save")) {
        response = "To reach your goal faster, try the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings and debt repayment."
      }

      setChat(prev => [...prev, { role: "ai", message: response }])
    }, 1500)
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Sparkles className="text-purple-400" /> AI Financial Advisor
          </h1>
          <p className="text-white/50">Personalized intelligence for your wealth growth.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {chat.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex", item.role === "user" ? "justify-end" : "justify-start")}
            >
              <div className={cn(
                "max-w-[80%] rounded-2xl p-6",
                item.role === "user" 
                  ? "bg-purple-600/20 border border-purple-500/30 text-white ml-10" 
                  : "glass-card mr-10"
              )}>
                <div className="flex items-start gap-4">
                  {item.role === "ai" && (
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                      <Brain size={20} className="text-purple-400" />
                    </div>
                  )}
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

      {/* Input Area */}
      <Card className="mt-4 p-2">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask me anything... 'How can I save 20% more?' or 'Is my loan risky?'" 
            className="border-none bg-transparent focus:ring-0 text-lg py-6"
          />
          <Button type="submit" size="lg" className="rounded-xl aspect-square p-0 w-16">
            <Send size={24} />
          </Button>
        </form>
      </Card>

      {/* Suggested Prompts */}
      <div className="flex flex-wrap gap-2 justify-center">
        {["Budget suggestions", "Savings plan", "Risk alerts", "Investment advice"].map((prompt) => (
          <button 
            key={prompt}
            onClick={() => setQuery(prompt)}
            className="text-xs px-4 py-2 rounded-full border border-white/10 text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}
