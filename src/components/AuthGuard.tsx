"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Activity } from "lucide-react"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push("/login")
          return
        }

        // Verify user technically exists in auth service
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          await supabase.auth.signOut()
          router.push("/login")
          return
        }

        // Sync metadata to profile if incomplete (recovered from email confirmation flow)
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
        if (profile) {
          const metadata = user.user_metadata
          const updates: any = {}
          
          if (metadata.full_name && !profile.full_name) updates.full_name = metadata.full_name
          if (metadata.monthly_income && (profile.monthly_income === 0 || profile.monthly_income === null)) {
            updates.monthly_income = metadata.monthly_income
          }
          if (metadata.financial_goals && (!profile.financial_goals || profile.financial_goals.length === 0)) {
            updates.financial_goals = metadata.financial_goals
          }
          
          if (Object.keys(updates).length > 0) {
            await supabase.from('profiles').update(updates).eq('id', user.id)
          }
        }

        setAuthenticated(true)
      } catch (err) {
        console.error("Auth check failed:", err)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Listen for auth changes (sign out in other tabs, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setAuthenticated(false)
        router.push("/login")
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-black gap-4 text-white/50">
        <Activity className="animate-spin text-purple-500" size={48} />
        <p className="text-sm font-medium animate-pulse">Securing Session...</p>
      </div>
    )
  }

  if (!authenticated) {
    return null // Will redirect via useEffect
  }

  return <>{children}</>
}
