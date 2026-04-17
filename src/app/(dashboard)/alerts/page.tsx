"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, AlertTriangle, Info, CheckCircle, Trash2, ShieldAlert, Sparkles, Filter } from "lucide-react"
import { Card, Button } from "@/components/ui"
import { supabase, type Alert } from "@/lib/supabase"
import { cn } from "@/lib/utils"

const mockAlerts = [
  { 
    id: "1", 
    title: "Overspending Detected", 
    message: "You've exceeded your monthly budget for 'Dining Out' by 15%. This may impact your savings goal.",
    type: "warning",
    is_read: false,
    date: "2 hours ago"
  },
  { 
    id: "2", 
    title: "High Loan Risk", 
    message: "The new loan analysis indicates a debt-to-income ratio above 40%. We recommend reconsidering.",
    type: "danger",
    is_read: false,
    date: "5 hours ago"
  },
  { 
    id: "3", 
    title: "Portfolio Update", 
    message: "Your Tech Stock portfolio has increased by 5.2% in the last 24 hours. Good performance!",
    type: "info",
    is_read: true,
    date: "Yesterday"
  }
]

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(mockAlerts)
  const [filter, setFilter] = useState("all")

  const filteredAlerts = alerts.filter(a => {
    if (filter === "unread") return !a.is_read
    if (filter === "important") return a.type === "danger" || a.type === "warning"
    return true
  })

  const markRead = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, is_read: true } : a))
  }

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id))
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Bell className="text-purple-400" /> AI Alert System
          </h1>
          <p className="text-white/50">Real-time intelligence on your financial health.</p>
        </div>
        <div className="flex gap-2">
          {["All", "Unread", "Important"].map((f) => (
            <Button 
              key={f}
              variant={filter === f.toLowerCase() ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilter(f.toLowerCase())}
              className="text-xs px-4"
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredAlerts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center glass-card"
            >
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-white/20" size={32} />
              </div>
              <p className="text-white/30">Everything looks good! No new alerts.</p>
            </motion.div>
          ) : (
            filteredAlerts.map((alert) => (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "relative group",
                  !alert.is_read && "glow-shadow"
                )}
              >
                <Card className={cn(
                  "p-5 transition-all",
                  !alert.is_read ? "bg-white/10 border-purple-500/30" : "bg-white/5 opacity-70"
                )}>
                  <div className="flex gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                      alert.type === "danger" ? "bg-rose-500/20 text-rose-400" :
                      alert.type === "warning" ? "bg-amber-500/20 text-amber-400" :
                      "bg-blue-500/20 text-blue-400"
                    )}>
                      {alert.type === "danger" ? <ShieldAlert size={24} /> :
                       alert.type === "warning" ? <AlertTriangle size={24} /> : <Info size={24} />}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-white font-bold flex items-center gap-2">
                          {alert.title}
                          {!alert.is_read && (
                            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                          )}
                        </h4>
                        <span className="text-[10px] text-white/30 uppercase tracking-widest">{alert.date}</span>
                      </div>
                      <p className="text-white/60 text-sm leading-relaxed">{alert.message}</p>
                      
                      <div className="pt-3 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!alert.is_read && (
                          <button 
                            onClick={() => markRead(alert.id)}
                            className="text-xs text-purple-400 font-semibold flex items-center gap-1 hover:underline"
                          >
                            Mark as read
                          </button>
                        )}
                        <button 
                          onClick={() => deleteAlert(alert.id)}
                          className="text-xs text-rose-400 font-semibold flex items-center gap-1 hover:underline ml-auto"
                        >
                          <Trash2 size={14} /> Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* AI Pulse Card Footer */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-white/5 py-4 text-center">
        <p className="text-xs text-white/40 flex items-center justify-center gap-2">
          <Sparkles size={14} className="text-purple-400" /> 
          AI is continuously monitoring your transactions and accounts for anomalies.
        </p>
      </Card>
    </div>
  )
}
