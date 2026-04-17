"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Landmark, Calculator, Info, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react"
import { Card, Button, Input } from "@/components/ui"
import { formatCurrency, cn } from "@/lib/utils"

export default function LoanAnalyzerPage() {
  const [loanData, setLoanData] = useState({
    amount: "",
    interestRate: "",
    tenure: "" // months
  })
  const [result, setResult] = useState<any>(null)

  const calculateEMI = () => {
    const P = parseFloat(loanData.amount)
    const r = parseFloat(loanData.interestRate) / 12 / 100
    const n = parseInt(loanData.tenure)

    if (!P || !r || !n) return

    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    const totalPayment = emi * n
    const totalInterest = totalPayment - P
    
    // Risk Calculation (Simulation)
    let risk = "Low"
    let riskColor = "text-emerald-400"
    let riskBg = "bg-emerald-400/10"
    let advice = "This loan is safe and within healthy financial limits."

    if (totalInterest > P * 0.5) {
      risk = "Medium"
      riskColor = "text-amber-400"
      riskBg = "bg-amber-400/10"
      advice = "The interest burden is significant. Consider a shorter tenure or lower rate."
    }
    if (totalInterest > P || r > 0.15 / 12) {
      risk = "High"
      riskColor = "text-rose-400"
      riskBg = "bg-rose-400/10"
      advice = "High risk! The interest exceeds the principal or the rate is predatory."
    }

    setResult({
      emi,
      totalInterest,
      totalPayment,
      risk,
      riskColor,
      riskBg,
      advice
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Loan Analyzer</h1>
        <p className="text-white/50">Analyze loan risks and calculate EMIs with AI suggestions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Card */}
        <Card className="h-fit">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Calculator size={24} className="text-purple-400" /> Loan Details
          </h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-white/50">Loan Amount ($)</label>
              <Input 
                type="number" 
                placeholder="0.00" 
                value={loanData.amount}
                onChange={(e) => setLoanData({...loanData, amount: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/50">Annual Interest Rate (%)</label>
                <Input 
                  type="number" 
                  placeholder="e.g. 7.5" 
                  value={loanData.interestRate}
                  onChange={(e) => setLoanData({...loanData, interestRate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/50">Tenure (Months)</label>
                <Input 
                  type="number" 
                  placeholder="e.g. 12" 
                  value={loanData.tenure}
                  onChange={(e) => setLoanData({...loanData, tenure: e.target.value})}
                />
              </div>
            </div>
            <Button onClick={calculateEMI} className="w-full py-4 text-lg">
              Analyze Loan Risk
            </Button>
          </div>
        </Card>

        {/* Results Card */}
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Card className="bg-white/5">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">Monthly EMI</h3>
                  <p className="text-3xl font-extrabold gradient-text">{formatCurrency(result.emi)}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-sm py-2 border-b border-white/5">
                    <span className="text-white/50">Principal Amount</span>
                    <span className="text-white font-medium">{formatCurrency(parseFloat(loanData.amount))}</span>
                  </div>
                  <div className="flex justify-between text-sm py-2 border-b border-white/5">
                    <span className="text-white/50">Total Interest</span>
                    <span className="text-white font-medium">{formatCurrency(result.totalInterest)}</span>
                  </div>
                  <div className="flex justify-between text-sm py-2 border-b border-white/5">
                    <span className="text-white/50">Total Payment</span>
                    <span className="text-white font-medium">{formatCurrency(result.totalPayment)}</span>
                  </div>
                </div>

                <div className={cn("mt-8 p-4 rounded-xl border flex gap-4 items-start", result.riskBg, result.riskColor.replace('text', 'border'))}>
                  {result.risk === "Low" ? <CheckCircle2 size={24} /> : 
                   result.risk === "Medium" ? <AlertTriangle size={24} /> : <ShieldAlert size={24} />}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold">AI Risk Level: {result.risk}</span>
                    </div>
                    <p className="text-sm text-white/70">{result.advice}</p>
                  </div>
                </div>
              </Card>

              {/* Visualization Placeholder */}
              <Card className="bg-white/5 p-4 flex items-center justify-center gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between text-xs text-white/30">
                    <span>Principal</span>
                    <span>Interest</span>
                  </div>
                  <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-purple-500 h-full" 
                      style={{ width: `${(parseFloat(loanData.amount) / result.totalPayment) * 100}%` }} 
                    />
                    <div 
                      className="bg-blue-400 h-full" 
                      style={{ width: `${(result.totalInterest / result.totalPayment) * 100}%` }} 
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-center p-10 glass-card"
            >
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Landmark className="text-white/20" size={40} />
              </div>
              <h3 className="text-xl font-bold text-white/30">Enter Loan Details</h3>
              <p className="text-white/20 max-w-[250px]">Get a detailed breakdown and AI risk assessment for your loan.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
