"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Terminal, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  RefreshCcw, 
  Zap, 
  ShieldCheck, 
  ExternalLink,
  Target,
  BarChart3,
  Clock
} from "lucide-react"
import { Card, Button } from "@/components/ui"
import { cn, formatCurrency } from "@/lib/utils"

// Mock Signal Interface
interface TradingSignal {
  id: string
  symbol: string
  type: "BUY" | "SELL"
  price: number
  target: number
  stopLoss: number
  confidence: number
  status: "ACTIVE" | "COMPLETED" | "EXPIRED"
  time: string
  strength: "STRONG" | "NEUTRAL" | "WEAK"
}

export default function TradingTerminal() {
  const [signals, setSignals] = useState<TradingSignal[]>([])
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState(15)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Mock Signal Generator
  const generateSignals = useCallback(() => {
    setIsRefreshing(true)
    const symbols = ["NIFTY 50", "BANK NIFTY", "RELIANCE", "HDFC BANK", "TCS", "INFY"]
    const mockSignals: TradingSignal[] = symbols.map(symbol => {
      const type = Math.random() > 0.5 ? "BUY" as const : "SELL" as const
      const price = Math.floor(Math.random() * (25000 - 1000) + 1000)
      const move = type === "BUY" ? 1.02 : 0.98
      const stop = type === "BUY" ? 0.99 : 1.01
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        symbol,
        type,
        price,
        target: Math.floor(price * move),
        stopLoss: Math.floor(price * stop),
        confidence: Math.floor(Math.random() * (98 - 75) + 75),
        status: "ACTIVE",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        strength: Math.random() > 0.6 ? "STRONG" : "NEUTRAL"
      }
    })
    
    // Simulate API delay
    setTimeout(() => {
      setSignals(mockSignals)
      setLoading(false)
      setIsRefreshing(false)
      setTimeLeft(15)
    }, 800)
  }, [])

  // Auto-refresh logic (15 seconds)
  useEffect(() => {
    generateSignals()
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          generateSignals()
          return 15
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [generateSignals])

  const handleManualRefresh = () => {
    generateSignals()
  }

  const handleExecute = (signal: TradingSignal) => {
    // Example Zerodha Kite URL format
    const kiteUrl = `https://kite.zerodha.com/connect/basket?api_key=your_api_key&data=[{"variety":"regular","tradingsymbol":"${signal.symbol.replace(" ", "")}","exchange":"NSE","transaction_type":"${signal.type}","order_type":"MARKET","quantity":1,"product":"MIS","validity":"DAY"}]`
    window.open(kiteUrl, "_blank")
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header with Auto-Refresh Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Terminal className="text-purple-400" /> ScalpVision AI <span className="gradient-text">Terminal</span>
            </h1>
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-widest animate-pulse">
              Live
            </span>
          </div>
          <p className="text-white/50">Proprietary high-frequency AI signal engine.</p>
        </div>

        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="transparent"
                  className="text-white/5"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="transparent"
                  strokeDasharray={113}
                  strokeDashoffset={113 - (113 * timeLeft) / 15}
                  className="text-purple-500 transition-all duration-1000 ease-linear"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-white">{timeLeft}s</span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-tighter text-white/30">Next Refresh</p>
              <p className="text-xs font-bold text-white">Automated Engine</p>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10 mx-2" />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="text-purple-400 hover:bg-purple-500/10"
          >
            <RefreshCcw size={16} className={cn("mr-2", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-emerald-500/5 border-emerald-500/10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/50 text-xs mb-1">Today's Accuracy</p>
              <p className="text-2xl font-bold text-emerald-400">92.4%</p>
            </div>
            <div className="p-2 bg-emerald-400/10 rounded-lg text-emerald-400">
              <ShieldCheck size={20} />
            </div>
          </div>
        </Card>
        <Card className="bg-purple-500/5 border-purple-500/10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/50 text-xs mb-1">Signals Generated</p>
              <p className="text-2xl font-bold text-purple-400">148</p>
            </div>
            <div className="p-2 bg-purple-400/10 rounded-lg text-purple-400">
              <Zap size={20} />
            </div>
          </div>
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/50 text-xs mb-1">Avg. Yield/Signal</p>
              <p className="text-2xl font-bold text-blue-400">+1.24%</p>
            </div>
            <div className="p-2 bg-blue-400/10 rounded-lg text-blue-400">
              <TrendingUp size={20} />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Signal Feed */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-white/30">
              <Activity className="animate-spin text-purple-500" size={48} />
              <p className="font-medium">Initializing AI Signal Engine...</p>
            </div>
          ) : (
            signals.map((signal) => (
              <motion.div
                key={signal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                layout
              >
                <Card className="p-0 overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
                  <div className="flex flex-col lg:flex-row lg:items-center">
                    {/* Signal Status Sidebar */}
                    <div className={cn(
                      "w-full lg:w-2 px-1 py-1 lg:py-0",
                      signal.type === "BUY" ? "bg-emerald-500" : "bg-rose-500"
                    )} />
                    
                    <div className="px-6 py-6 flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-center">
                      {/* Asset Info */}
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                          signal.type === "BUY" ? "bg-emerald-500/10" : "bg-rose-500/10"
                        )}>
                          {signal.type === "BUY" ? (
                            <TrendingUp className="text-emerald-400" size={24} />
                          ) : (
                            <TrendingDown className="text-rose-400" size={24} />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-bold text-lg">{signal.symbol}</p>
                          <div className="flex items-center gap-2">
                             <span className={cn(
                               "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase",
                               signal.type === "BUY" ? "bg-emerald-400/20 text-emerald-400" : "bg-rose-400/20 text-rose-400"
                             )}>
                               {signal.type}
                             </span>
                             <span className="text-white/30 text-[10px] flex items-center gap-1 uppercase">
                               <Clock size={10} /> {signal.time}
                             </span>
                          </div>
                        </div>
                      </div>

                      {/* Pricing Info */}
                      <div className="flex flex-col">
                        <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1">Entry Price</p>
                        <p className="text-white font-bold text-xl">{formatCurrency(signal.price)}</p>
                      </div>

                      {/* Target/SL */}
                      <div className="flex gap-8">
                        <div>
                          <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1">Target</p>
                          <p className="text-emerald-400 font-bold">{formatCurrency(signal.target)}</p>
                        </div>
                        <div>
                          <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1">Stop Loss</p>
                          <p className="text-rose-400 font-bold">{formatCurrency(signal.stopLoss)}</p>
                        </div>
                      </div>

                      {/* Confidence & Analysis */}
                      <div className="flex items-center gap-6">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-white/30 text-[10px] uppercase tracking-widest">Confidence</p>
                            <p className="text-white font-bold text-xs">{signal.confidence}%</p>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${signal.confidence}%` }}
                              className={cn(
                                "h-full rounded-full transition-all duration-1000",
                                signal.confidence > 90 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-purple-500"
                              )}
                            />
                          </div>
                        </div>
                        <div className="text-center hidden lg:block">
                           <p className="text-white/30 text-[10px] uppercase mb-1">Strength</p>
                           <span className={cn(
                             "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                             signal.strength === "STRONG" ? "bg-purple-500/10 border-purple-500/20 text-purple-400" : "bg-white/5 border-white/10 text-white/40"
                           )}>
                             {signal.strength}
                           </span>
                        </div>
                      </div>

                      {/* Execution */}
                      <div className="flex justify-end gap-2">
                         <Button 
                           onClick={() => handleExecute(signal)}
                           className={cn(
                             "w-full group/btn relative overflow-hidden",
                             signal.type === "BUY" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-rose-600 hover:bg-rose-500"
                           )}
                         >
                           <span className="relative z-10 flex items-center justify-center gap-2">
                             Execute <ExternalLink size={16} />
                           </span>
                           <motion.div 
                             className="absolute inset-0 bg-white/20"
                             initial={{ x: "-100%" }}
                             whileHover={{ x: "100%" }}
                             transition={{ duration: 0.5 }}
                           />
                         </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="flex justify-center gap-8 py-4 opacity-50">
        <div className="flex items-center gap-2 text-xs text-white">
          <ShieldCheck size={14} className="text-emerald-400" /> Secure Encryption Active
        </div>
        <div className="flex items-center gap-2 text-xs text-white">
          <BarChart3 size={14} className="text-purple-400" /> Real-time Tick Data
        </div>
        <div className="flex items-center gap-2 text-xs text-white">
          <Zap size={14} className="text-amber-400" /> 0.02ms Latency
        </div>
      </div>
    </div>
  )
}
