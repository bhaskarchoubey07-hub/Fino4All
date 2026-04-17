"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, DollarSign, PieChart as PieChartIcon, Activity } from "lucide-react"
import { Card } from "@/components/ui"
import { formatCurrency, cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts"

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    income: 0,
    expenses: 0,
    savings: 0,
    investments: 0
  })
  const [recentExpenses, setRecentExpenses] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUser(user)

    // 1. Get Income from Profile
    const { data: profile } = await supabase.from('profiles').select('monthly_income').eq('id', user.id).single()
    const income = profile?.monthly_income || 0

    // 2. Get Total Expenses (Current Month)
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
    const { data: expenses } = await supabase.from('expenses').select('*').eq('user_id', user.id).gte('date', startOfMonth)
    const totalExpenses = expenses?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0
    setRecentExpenses(expenses?.slice(0, 5) || [])

    // Aggregate category data
    const catMap: any = {}
    expenses?.forEach(exp => {
      catMap[exp.category] = (catMap[exp.category] || 0) + Number(exp.amount)
    })
    const formattedCats = Object.entries(catMap).map(([name, value], idx) => ({
      name,
      value,
      color: ["#7c3aed", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899"][idx % 5]
    }))
    setCategoryData(formattedCats)

    // 3. Get Total Investments
    const { data: investments } = await supabase.from('investments').select('*').eq('user_id', user.id)
    const totalInvestments = investments?.reduce((acc, curr) => acc + Number(curr.current_value), 0) || 0

    setStats({
      income,
      expenses: totalExpenses,
      savings: income - totalExpenses,
      investments: totalInvestments
    })
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Activity className="animate-spin text-purple-500" size={48} />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, <span className="gradient-text">{user?.user_metadata?.full_name || "User"}</span>
          </h1>
          <p className="text-white/50">Your real-time financial health overview.</p>
        </div>
        <div className="flex gap-3">
          <div className="glass-card px-4 py-2 flex items-center gap-2 text-sm text-green-400 border-green-500/20">
            <Activity size={16} /> System Active
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Monthly Income" amount={stats.income} icon={DollarSign} trend="Real-time" trendUp={true} color="text-emerald-400" />
        <StatCard title="Monthly Expenses" amount={stats.expenses} icon={TrendingDown} trend="Current" trendUp={false} color="text-rose-400" />
        <StatCard title="Net Savings" amount={stats.savings} icon={TrendingUp} trend="Available" trendUp={true} color="text-blue-400" />
        <StatCard title="Total Investments" amount={stats.investments} icon={PieChartIcon} trend="Growth" trendUp={true} color="text-violet-400" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 min-h-[400px]">
          <h3 className="text-xl font-bold text-white mb-6">Spending Analysis</h3>
          {recentExpenses.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={recentExpenses.map(e => ({ name: e.date, amount: e.amount }))}>
                  <defs>
                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="name" stroke="#ffffff50" />
                  <YAxis stroke="#ffffff50" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "8px" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#7c3aed" fillOpacity={1} fill="url(#colorAmt)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-white/20">Add expenses to see analytics</div>
          )}
        </Card>

        <Card>
          <h3 className="text-xl font-bold text-white mb-6">Category Breakdown</h3>
          {categoryData.length > 0 ? (
            <>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "8px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {categoryData.map((cat) => (
                  <div key={cat.name} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-white/70">{cat.name}</span>
                    </div>
                    <span className="text-white font-medium">{formatCurrency(cat.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-white/20">No data available</div>
          )}
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Recent Transactions</h3>
          <button className="text-sm text-purple-400 hover:underline">View All</button>
        </div>
        <div className="space-y-4">
          {recentExpenses.length === 0 && <p className="text-white/20 text-center py-4">No recent transactions.</p>}
          {recentExpenses.map((exp) => (
            <div key={exp.id} className="flex justify-between items-center p-4 rounded-xl hover:bg-white/5 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500/20">
                  <Activity size={20} className="text-white/50 group-hover:text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{exp.note || exp.category}</p>
                  <p className="text-white/30 text-xs">{exp.category} • {new Date(exp.date).toLocaleDateString()}</p>
                </div>
              </div>
              <p className="font-bold text-rose-400">-{formatCurrency(exp.amount)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function StatCard({ title, amount, icon: Icon, trend, trendUp, color }: any) {
  return (
    <Card className="hover:scale-[1.02] transition-transform duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-2 rounded-lg bg-white/5", color)}>
          <Icon size={24} />
        </div>
        <div className={cn("flex items-center text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider", 
          trendUp ? "bg-emerald-400/10 text-emerald-400" : "bg-rose-400/10 text-rose-400")}>
          {trend}
        </div>
      </div>
      <div>
        <p className="text-white/50 text-sm mb-1">{title}</p>
        <p className="text-2xl font-bold text-white">{formatCurrency(amount)}</p>
      </div>
    </Card>
  )
}
