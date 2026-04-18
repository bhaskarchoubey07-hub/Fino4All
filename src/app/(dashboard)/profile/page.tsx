"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Mail, DollarSign, Target, Save, CheckCircle2, Loader2, ShieldCheck, Activity } from "lucide-react"
import { Card, Button, Input } from "@/components/ui"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    monthly_income: "",
    financial_goals: ""
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (profile) {
      setProfile({
        full_name: profile.full_name || "",
        email: profile.email || "",
        monthly_income: profile.monthly_income?.toString() || "0",
        financial_goals: profile.financial_goals?.join(", ") || ""
      })
    }
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          monthly_income: parseFloat(profile.monthly_income),
          financial_goals: profile.financial_goals.split(",").map(p => p.trim()).filter(p => p !== "")
        })
        .eq('id', user.id)

      if (error) throw error
      
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error("Save error:", err)
      alert("Failed to save profile.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Activity className="animate-spin text-purple-500" size={48} />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <User className="text-purple-400" /> Account Settings
        </h1>
        <p className="text-white/50">Manage your profile and financial preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/50 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <Input 
                    value={profile.full_name} 
                    onChange={e => setProfile({...profile, full_name: e.target.value})}
                    placeholder="John Doe"
                    className="pl-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/50 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <Input 
                    value={profile.email} 
                    disabled
                    className="pl-12 opacity-50 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/50 ml-1">Monthly Income ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <Input 
                    type="number"
                    value={profile.monthly_income} 
                    onChange={e => setProfile({...profile, monthly_income: e.target.value})}
                    placeholder="5000"
                    className="pl-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/50 ml-1">Financial Goals (comma separated)</label>
                <div className="relative">
                  <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <Input 
                    value={profile.financial_goals} 
                    onChange={e => setProfile({...profile, financial_goals: e.target.value})}
                    placeholder="Retirement, New House, Travel"
                    className="pl-12"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                {success && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
                    <CheckCircle2 size={16} /> Changes saved successfully!
                  </motion.div>
                )}
              </div>
              <Button type="submit" disabled={saving} className="min-w-[150px]">
                {saving ? (
                  <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={18} /> Saving...</span>
                ) : (
                  <span className="flex items-center gap-2"><Save size={18} /> Save Changes</span>
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Security / Sidebar */}
        <div className="space-y-6">
          <Card className="bg-purple-500/5 border-purple-500/20">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <ShieldCheck size={20} className="text-purple-400" /> Security
            </h3>
            <p className="text-white/50 text-xs mb-6 leading-relaxed">
              Your financial data is encrypted and stored securely using Supabase RLS policies.
            </p>
            <Button variant="outline" className="w-full text-xs">Verify Encryption</Button>
          </Card>
          
          <Card className="bg-white/5 border-white/10">
            <h3 className="text-white font-bold mb-4">Account Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/50">Verification</span>
                <span className="text-emerald-400 font-bold uppercase tracking-wider">Confirmed</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/50">Plan</span>
                <span className="text-purple-400 font-bold uppercase tracking-wider">FinOS Pro</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
