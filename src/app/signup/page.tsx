"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Wallet, Mail, Lock, User, ArrowRight, Loader2, Target, DollarSign } from "lucide-react"
import { Card, Button, Input } from "@/components/ui"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    income: "",
    goal: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) {
      setStep(2)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
        }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else if (data.user) {
      // Update profile with income and goals
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          monthly_income: parseFloat(formData.income),
          financial_goals: [formData.goal]
        })
        .eq('id', data.user.id)

      if (profileError) {
        console.error("Profile update error:", profileError)
      }
      
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center glow-shadow mb-4 rotate-3">
            <Wallet className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
            Create your <span className="gradient-text">Account</span>
          </h1>
          <p className="text-white/50">Start your smart financial journey here</p>
        </div>

        <Card className="glass-card">
          <form onSubmit={handleSignup} className="space-y-6">
            {step === 1 ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <Input
                      type="text"
                      placeholder="John Doe"
                      className="pl-12"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      className="pl-12"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70 ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="pl-12"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70 ml-1">Monthly Income ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <Input
                      type="number"
                      placeholder="5000"
                      className="pl-12"
                      value={formData.income}
                      onChange={(e) => setFormData({...formData, income: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70 ml-1">Primary Financial Goal</label>
                  <div className="relative">
                    <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <Input
                      type="text"
                      placeholder="Save for a house"
                      className="pl-12"
                      value={formData.goal}
                      onChange={(e) => setFormData({...formData, goal: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-400/10 border border-red-400/20 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full group" disabled={loading}>
              {loading ? (
                <Loader2 className="animate-spin mx-auto" size={20} />
              ) : (
                <div className="flex items-center justify-center gap-2">
                  {step === 1 ? "Next Step" : "Complete Registration"} 
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>

            {step === 2 && (
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="w-full text-white/30 text-xs hover:text-white/50 transition-all font-medium"
              >
                Go Back
              </button>
            )}
          </form>

          <div className="mt-8 text-center text-white/50 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-purple-400 hover:underline font-semibold">
              Sign In
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
