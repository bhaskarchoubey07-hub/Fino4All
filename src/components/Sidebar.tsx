"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Wallet, LayoutDashboard, ReceiptText, Landmark, PieChart, Bell, LogOut, Terminal } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Trading Terminal", href: "/terminal", icon: Terminal },
  { name: "Expenses", href: "/expenses", icon: ReceiptText },
  { name: "Advisor", href: "/advisor", icon: Wallet },
  { name: "Loans", href: "/loans", icon: Landmark },
  { name: "Investments", href: "/investments", icon: PieChart },
  { name: "Profile", href: "/profile", icon: User },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="w-64 h-screen glass-card rounded-none border-y-0 border-l-0 fixed left-0 top-0 flex flex-col p-4 z-50">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center glow-shadow">
          <Wallet className="text-white" size={24} />
        </div>
        <span className="text-xl font-bold gradient-text">FinOS</span>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-white/10 text-white" 
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon size={20} className={isActive ? "text-purple-400" : "group-hover:text-purple-400"} />
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      <div className="pt-4 border-t border-white/10 space-y-2">
        <Link href="/alerts">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all">
            <Bell size={20} />
            <span className="font-medium">Alerts</span>
          </div>
        </Link>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/50 hover:text-red-400 hover:bg-red-400/5 transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  )
}
