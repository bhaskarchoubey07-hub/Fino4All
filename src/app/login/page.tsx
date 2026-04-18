"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Wallet, Mail, Lock, ArrowRight, Loader2 } from "lucide-react"
import { Card, Button, Input } from "@/components/ui"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        setError("Your email is not confirmed. Please check your inbox or toggle 'Confirm email' OFF in your Supabase Dashboard Settings.")
      } else {
        setError(error.message)
      }
      setLoading(false)
    } else {
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
            Welcome back to <span className="gradient-text">FinOS</span>
          </h1>
          <p className="text-white/50">Your AI-powered financial command center</p>
        </div>

        <Card className="glass-card">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="pl-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

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
                  Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0a0a0b] px-2 text-white/20">Development Mode</span></div>
            </div>

            <Button 
              type="button"
              variant="outline"
              className="w-full border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
              onClick={async () => {
                setLoading(true)
                const { error } = await supabase.auth.signInWithPassword({
                  email: "test@scalpvision.ai",
                  password: "password123",
                })
                if (error) {
                  setError("Test account not found. Please sign up or create a profile.")
                  setLoading(false)
                } else {
                  router.push("/dashboard")
                }
              }}
            >
              One-Click Demo Access
            </Button>
          </form>

          <div className="mt-8 text-center text-white/50 text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="text-purple-400 hover:underline font-semibold">
              Create an account
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
