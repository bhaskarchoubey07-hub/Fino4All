"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Search, Filter, ReceiptText, Calendar, Tag, MoreVertical, Trash2 } from "lucide-react"
import { Card, Button, Input } from "@/components/ui"
import { supabase, type Expense } from "@/lib/supabase"
import { formatCurrency, cn } from "@/lib/utils"

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newExpense, setNewExpense] = useState({
    amount: "",
    category: "Food",
    note: "",
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false })
    
    if (data) setExpenses(data)
    setLoading(false)
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('expenses')
      .insert([
        {
          user_id: user.id,
          amount: parseFloat(newExpense.amount),
          category: newExpense.category,
          note: newExpense.note,
          date: newExpense.date
        }
      ])

    if (!error) {
      setNewExpense({
        amount: "",
        category: "Food",
        note: "",
        date: new Date().toISOString().split('T')[0]
      })
      setShowAddForm(false)
      fetchExpenses()
    }
    setLoading(false)
  }

  const deleteExpense = async (id: string) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
    
    if (!error) fetchExpenses()
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Expense Intelligence</h1>
          <p className="text-white/50">Track and analyze your spending patterns.</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus size={20} /> Add Expense
        </Button>
      </div>

      {/* AI Insight Bar */}
      <Card className="bg-purple-500/10 border-purple-500/20 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Tag className="text-purple-400" size={20} />
          </div>
          <div>
            <p className="text-white font-medium">AI Insight</p>
            <p className="text-purple-200/70 text-sm">"You've spent 15% more on Dining Out this week compared to last week."</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-purple-400">Analyze More</Button>
      </Card>

      {showAddForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="relative">
            <button 
              onClick={() => setShowAddForm(false)}
              className="absolute top-4 right-4 text-white/30 hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-white mb-6">Add New Expense</h3>
            <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/50">Amount</label>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00" 
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/50">Category</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                >
                  <option value="Food">Food & Dining</option>
                  <option value="Rent">Rent & Utilities</option>
                  <option value="Travel">Travel</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Health">Health</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/50">Date</label>
                <Input 
                  type="date" 
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/50">Note</label>
                <Input 
                  placeholder="What was this for?" 
                  value={newExpense.note}
                  onChange={(e) => setNewExpense({...newExpense, note: e.target.value})}
                />
              </div>
              <div className="lg:col-span-4 flex justify-end gap-3 mt-2">
                <Button type="submit" disabled={loading}>Save Expense</Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <Input className="pl-12" placeholder="Search transactions..." />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter size={18} /> Filters
        </Button>
      </div>

      {/* Expenses Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-4 text-sm font-semibold text-white/50">Transaction</th>
                <th className="px-6 py-4 text-sm font-semibold text-white/50">Category</th>
                <th className="px-6 py-4 text-sm font-semibold text-white/50">Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-white/50">Amount</th>
                <th className="px-6 py-4 text-sm font-semibold text-white/50">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-white/30">
                    No transactions found. Add your first expense above!
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                          <ReceiptText className="text-purple-400" size={20} />
                        </div>
                        <span className="text-white font-medium">{expense.note || expense.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full bg-white/5 text-white/70 text-xs font-medium">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/50 text-sm">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-white font-bold">
                      -{formatCurrency(expense.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => deleteExpense(expense.id)}
                        className="text-white/30 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
