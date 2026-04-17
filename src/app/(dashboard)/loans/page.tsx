"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Landmark, Calculator, Info, AlertTriangle, CheckCircle2, ShieldAlert, Plus, Trash2, Activity } from "lucide-react"
import { Card, Button, Input } from "@/components/ui"
import { formatCurrency, cn } from "@/lib/utils"
import { supabase, type Loan } from "@/lib/supabase"

export default function LoanAnalyzerPage() {
  const [loanData, setLoanData] = useState({
    amount: "",
    interestRate: "",
    tenure: "", // months
    type: "Personal"
  })
  const [result, setResult] = useState<any>(null)
  const [activeLoans, setActiveLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLoans()
  }, [])

  const fetchLoans = async () => {
    setLoading(true)
    const { data } = await supabase.from('loans').select('*').order('created_at', { ascending: false })
    if (data) setActiveLoans(data)
    setLoading(false)
  }

  const calculateEMI = () => {
    const P = parseFloat(loanData.amount)
    const r = parseFloat(loanData.interestRate) / 12 / 100
    const n = parseInt(loanData.tenure)

    if (!P || !r || !n) return

    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    const totalPayment = emi * n
    const totalInterest = totalPayment - P
    
    let risk = "low" as "low" | "medium" | "high"
    let advice = "This loan is safe and within healthy financial limits."

    if (totalInterest > P * 0.5) {
      risk = "medium"
      advice = "The interest burden is significant. Consider a shorter tenure or lower rate."
    }
    if (totalInterest > P || r > 0.15 / 12) {
      risk = "high"
      advice = "High risk! The interest exceeds the principal or the rate is predatory."
    }

    setResult({ emi, totalInterest, totalPayment, risk, advice })
  }

  const saveLoan = async () => {
    if (!result) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('loans').insert([{
      user_id: user.id,
      amount: parseFloat(loanData.amount),
      interest_rate: parseFloat(loanData.interestRate),
      tenure: parseInt(loanData.tenure),
      type: loanData.type,
      risk_level: result.risk
    }])

    if (!error) {
      setResult(null)
      setLoanData({ amount: "", interestRate: "", tenure: "", type: "Personal" })
      fetchLoans()
    }
  }

  const deleteLoan = async (id: string) => {
    const { error } = await supabase.from('loans').delete().eq('id', id)
    if (!error) fetchLoans()
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Loan Analyzer</h1>
        <p className="text-white/50">Analyze loan risks and store them in your real-time portfolio.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Card */}
        <Card className="h-fit">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Calculator size={24} className="text-purple-400" /> Analysis Tool
          </h3>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/50">Loan Type</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" value={loanData.type} onChange={e => setLoanData({...loanData, type: e.target.value})}>
                  <option value="Personal">Personal</option>
                  <option value="Home">Home</option>
                  <option value="Car">Car</option>
                  <option value="Student">Student</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/50">Loan Amount ($)</label>
                <Input type="number" placeholder="0.00" value={loanData.amount} onChange={e => setLoanData({...loanData, amount: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/50">Annual Rate (%)</label>
                <Input type="number" placeholder="7.5" value={loanData.interestRate} onChange={e => setLoanData({...loanData, interestRate: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/50">Tenure (Months)</label>
                <Input type="number" placeholder="12" value={loanData.tenure} onChange={e => setLoanData({...loanData, tenure: e.target.value})} />
              </div>
            </div>
            <Button onClick={calculateEMI} className="w-full py-4 text-lg">Analyze Risk</Button>
          </div>
        </Card>

        {/* Results Card */}
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div key="result" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="bg-white/5 border-purple-500/20">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">Monthly EMI</h3>
                  <p className="text-3xl font-extrabold gradient-text">{formatCurrency(result.emi)}</p>
                </div>
                <div className="space-y-4 text-sm text-white/70">
                  <div className="flex justify-between"><span>Principal</span><span>{formatCurrency(parseFloat(loanData.amount))}</span></div>
                  <div className="flex justify-between"><span>Total Interest</span><span>{formatCurrency(result.totalInterest)}</span></div>
                  <div className="flex justify-between border-t border-white/5 pt-2 text-white font-bold"><span>Total Cost</span><span>{formatCurrency(result.totalPayment)}</span></div>
                </div>
                <div className={cn("mt-6 p-4 rounded-xl border flex gap-4 items-start bg-white/5 uppercase text-xs font-bold", 
                  result.risk === "low" ? "text-emerald-400 border-emerald-400/20" : result.risk === "medium" ? "text-amber-400 border-amber-400/20" : "text-rose-400 border-rose-400/20")}>
                  {result.risk === "low" ? <CheckCircle2 size={24} /> : result.risk === "medium" ? <AlertTriangle size={24} /> : <ShieldAlert size={24} />}
                  <p>{result.advice}</p>
                </div>
                <Button onClick={saveLoan} className="w-full mt-6 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white border-none">Save to Real Portfolio</Button>
              </Card>
            </motion.div>
          ) : (
            <Card className="flex items-center justify-center text-center p-10 opacity-30"><Landmark size={40} /><p className="ml-4">Enter details to analyze</p></Card>
          )}
        </AnimatePresence>
      </div>

      {/* Active Loans Table */}
      <h2 className="text-2xl font-bold text-white pt-8">Your Real Active Loans</h2>
      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-white/50 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Rate (%)</th>
                <th className="px-6 py-4">Tenure</th>
                <th className="px-6 py-4">Risk</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && <tr><td colSpan={6} className="px-6 py-10 text-center"><Activity className="animate-spin mx-auto text-purple-500" /></td></tr>}
              {!loading && activeLoans.length === 0 && <tr><td colSpan={6} className="px-6 py-10 text-center text-white/20">No active loans found.</td></tr>}
              {activeLoans.map((loan) => (
                <tr key={loan.id} className="hover:bg-white/5 transition-all text-sm">
                  <td className="px-6 py-4 font-bold text-white">{loan.type}</td>
                  <td className="px-6 py-4 text-white">{formatCurrency(Number(loan.amount))}</td>
                  <td className="px-6 py-4 text-white/70">{loan.interest_rate}%</td>
                  <td className="px-6 py-4 text-white/70">{loan.tenure} mo</td>
                  <td className={cn("px-6 py-4 font-bold uppercase text-[10px]", 
                    loan.risk_level === "low" ? "text-emerald-400" : loan.risk_level === "medium" ? "text-amber-400" : "text-rose-400")}>
                    {loan.risk_level}
                  </td>
                  <td className="px-6 py-4"><button onClick={() => deleteLoan(loan.id)} className="text-white/30 hover:text-red-400"><Trash2 size={18} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
